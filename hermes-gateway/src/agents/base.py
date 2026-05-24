"""Base agent loop — tool-calling over OpenRouter."""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any

from ..connectors.openrouter import OpenRouterClient
from ..tools import REGISTRY, get as get_tool, schemas as tool_schemas

log = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 6


@dataclass
class AgentContext:
    user_id: str
    session_id: str | None = None
    workspace: str = "mixed"
    extra: dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentRun:
    name: str
    model: str
    system_prompt: str
    allowed_tools: list[str]
    temperature: float = 0.6

    def tools_schemas(self) -> list[dict[str, Any]]:
        return tool_schemas(self.allowed_tools) if self.allowed_tools else []


async def run_agent(
    client: OpenRouterClient,
    agent: AgentRun,
    ctx: AgentContext,
    messages: list[dict[str, Any]],
) -> AsyncIterator[dict[str, Any]]:
    """
    Generic tool-calling loop. Streams structured events:

      {"type": "agent.start", "name": ...}
      {"type": "message.delta", "content": "..."}
      {"type": "tool.call", "id": ..., "name": ..., "arguments": ...}
      {"type": "tool.result", "id": ..., "result": ...}
      {"type": "message.complete", "content": "..."}
    """
    yield {
        "type": "agent.start",
        "data": {"name": agent.name, "model": agent.model},
        "name": agent.name,
        "model": agent.model,
    }

    convo: list[dict[str, Any]] = [{"role": "system", "content": agent.system_prompt}, *messages]
    tools = agent.tools_schemas()

    for round_i in range(MAX_TOOL_ROUNDS):
        accumulated_content = ""
        tool_calls_buffer: dict[int, dict[str, Any]] = {}

        async for chunk in client.stream(
            model=agent.model,
            messages=convo,
            tools=tools if tools else None,
            temperature=agent.temperature,
        ):
            choice = (chunk.get("choices") or [{}])[0]
            delta = choice.get("delta") or {}

            if delta.get("content"):
                accumulated_content += delta["content"]
                yield {
                    "type": "message.delta",
                    "content": delta["content"],
                    "data": {"content": delta["content"]},
                }

            for tc in delta.get("tool_calls") or []:
                idx = tc.get("index", 0)
                slot = tool_calls_buffer.setdefault(
                    idx, {"id": None, "name": "", "arguments": ""}
                )
                if tc.get("id"):
                    slot["id"] = tc["id"]
                fn = tc.get("function") or {}
                if fn.get("name"):
                    slot["name"] += fn["name"]
                if fn.get("arguments"):
                    slot["arguments"] += fn["arguments"]

            finish_reason = choice.get("finish_reason")
            if finish_reason in ("stop", "length"):
                yield {
                    "type": "message.complete",
                    "content": accumulated_content,
                    "data": {"content": accumulated_content},
                }
                return
            if finish_reason == "tool_calls":
                break

        if not tool_calls_buffer:
            # stream ended without explicit finish_reason but also no tool calls
            yield {
                "type": "message.complete",
                "content": accumulated_content,
                "data": {"content": accumulated_content},
            }
            return

        # Append assistant turn with the tool calls
        assistant_msg: dict[str, Any] = {"role": "assistant", "content": accumulated_content or None}
        assistant_msg["tool_calls"] = [
            {
                "id": tc["id"],
                "type": "function",
                "function": {"name": tc["name"], "arguments": tc["arguments"]},
            }
            for tc in tool_calls_buffer.values()
            if tc["id"]
        ]
        convo.append(assistant_msg)

        # Execute every tool call sequentially (could be parallel later)
        for tc in tool_calls_buffer.values():
            yield {
                "type": "tool.call",
                "id": tc["id"],
                "name": tc["name"],
                "arguments_raw": tc["arguments"],
                "data": {
                    "id": tc["id"],
                    "name": tc["name"],
                    "arguments_raw": tc["arguments"],
                },
            }
            spec = get_tool(tc["name"])
            try:
                args = json.loads(tc["arguments"] or "{}")
            except json.JSONDecodeError as e:
                err = {"error": f"bad JSON args: {e}"}
                yield {
                    "type": "tool.result",
                    "id": tc["id"],
                    "result": err,
                    "is_error": True,
                    "data": {"id": tc["id"], "name": tc["name"], "result": err, "is_error": True},
                }
                convo.append(
                    {
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps(err),
                    }
                )
                continue

            if not spec:
                err = {"error": f"unknown tool {tc['name']!r}; registered: {list(REGISTRY)}"}
                yield {
                    "type": "tool.result",
                    "id": tc["id"],
                    "result": err,
                    "is_error": True,
                    "data": {"id": tc["id"], "name": tc["name"], "result": err, "is_error": True},
                }
                convo.append(
                    {"role": "tool", "tool_call_id": tc["id"], "content": json.dumps(err)}
                )
                continue

            # Inject user_id when the schema requires it but the model didn't supply
            params_schema = spec.parameters.get("properties", {})
            required = spec.parameters.get("required", [])
            if "user_id" in params_schema and "user_id" not in args:
                args["user_id"] = ctx.user_id
            missing = [k for k in required if k not in args]
            if missing:
                err = {"error": f"missing required args: {missing}"}
                yield {
                    "type": "tool.result",
                    "id": tc["id"],
                    "result": err,
                    "is_error": True,
                    "data": {"id": tc["id"], "name": tc["name"], "result": err, "is_error": True},
                }
                convo.append(
                    {"role": "tool", "tool_call_id": tc["id"], "content": json.dumps(err)}
                )
                continue

            try:
                result = await spec.handler(**args)
            except Exception as e:  # noqa: BLE001
                log.exception("tool %s failed", tc["name"])
                result = {"error": str(e)}
                yield {
                    "type": "tool.result",
                    "id": tc["id"],
                    "result": result,
                    "is_error": True,
                    "data": {"id": tc["id"], "name": tc["name"], "result": result, "is_error": True},
                }
            else:
                yield {
                    "type": "tool.result",
                    "id": tc["id"],
                    "result": result,
                    "data": {"id": tc["id"], "name": tc["name"], "result": result},
                }

            convo.append(
                {
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "content": json.dumps(result, default=str)[:8000],
                }
            )
        # Continue loop to let the model summarize after tool results.
    final = "[gateway] max tool rounds reached without final answer."
    yield {"type": "message.complete", "content": final, "data": {"content": final}}
