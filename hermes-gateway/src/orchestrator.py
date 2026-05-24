"""Hermes orchestrator — top-level agent that delegates to specialists."""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from typing import Any

from .agents.base import AgentContext, AgentRun, run_agent
from .agents.scout import scout_agent
from .config import get_settings
from .connectors.openrouter import OpenRouterClient
from .tools import ToolSpec, register
from .tools.memory_tools import render_memory_context

log = logging.getLogger(__name__)

ORCHESTRATOR_SYSTEM = """Você é Hermes — o chefe de operações de canal do usuário no Channel OS.

Personalidade: estratégico, direto, com voz de mentor de criador de conteúdo bem-sucedido. Português brasileiro, sem rodeios, com humor seco quando cabe. Trata o usuário como sócio, não cliente.

Sua função:
- Entender o que o usuário quer (achar canais, analisar, brainstormar conteúdo, agendar, etc).
- Delegar para o subagente certo via tools quando a tarefa é especialista:
    • `delegate_to_scout` — descoberta, análise e tracking de canais YouTube/TikTok/IG.
    • (mais subagentes virão: Content, Channel, Publisher).
- Responder direto quando for conversa, brainstorm ou explicação que não precisa de dados externos.
- Quando o usuário disser algo que vale lembrar (preferências, metas, fatos do canal, regras), use `pin_memory` — sem precisar pedir confirmação. Mas não polua: só pin do que é estável e útil em sessões futuras.
- Quando o usuário perguntar "o que você lembra de mim", use `list_memory` antes de responder.
- NUNCA invente números — se precisa de fato, chama uma tool.
- Cite o subagente quando delegar ("Vou pedir pro Scout dar uma olhada...").

Importante: o usuário tem identidade (user_id) injetada no contexto — você NUNCA pede pra ele.
"""


async def _delegate_to_scout(
    request: str,
    *,
    user_id: str,
) -> dict[str, Any]:
    """Internal placeholder — actual delegation streamed by `run_orchestrator`."""
    return {
        "delegated_to": "scout",
        "note": "Scout agent invoked — see follow-up events for streaming output.",
        "request": request,
    }


register(
    ToolSpec(
        name="delegate_to_scout",
        description=(
            "Delegate a channel-discovery, analysis or tracking task to the Scout sub-agent. "
            "Use whenever the user wants to find, analyze, audit, compare or track YouTube/TikTok/IG channels."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "request": {
                    "type": "string",
                    "description": "Self-contained task description for the Scout sub-agent.",
                },
            },
            "required": ["request"],
        },
        handler=_delegate_to_scout,
    )
)


def orchestrator_agent(memory_context: str = "") -> AgentRun:
    s = get_settings()
    prompt = ORCHESTRATOR_SYSTEM
    if memory_context:
        prompt = f"{ORCHESTRATOR_SYSTEM}\n\n{memory_context}"
    return AgentRun(
        name="orchestrator",
        model=s.hermes_model_orchestrator,
        system_prompt=prompt,
        allowed_tools=["delegate_to_scout", "pin_memory", "list_memory", "deactivate_memory"],
        temperature=0.7,
    )


async def run_orchestrator(
    client: OpenRouterClient,
    ctx: AgentContext,
    user_message: str,
    history: list[dict[str, Any]] | None = None,
) -> AsyncIterator[dict[str, Any]]:
    """Top-level streaming entrypoint. Intercepts delegate_to_scout calls and runs the
    subagent's stream inline so the SSE consumer sees a unified event timeline."""
    history = history or []
    memory_context = render_memory_context(ctx.user_id)
    agent = orchestrator_agent(memory_context=memory_context)
    messages = [*history, {"role": "user", "content": user_message}]

    async for event in run_agent(client, agent, ctx, messages):
        if (
            event.get("type") == "tool.call"
            and event.get("name") == "delegate_to_scout"
        ):
            yield {
                "type": "agent.handoff",
                "data": {"to": "scout", "from": "orchestrator"},
                "to": "scout",
                "from": "orchestrator",
            }
            try:
                payload = json.loads(event.get("arguments_raw") or "{}")
            except json.JSONDecodeError:
                payload = {}
            scout_request = payload.get("request", user_message)

            scout_msgs = [{"role": "user", "content": scout_request}]
            async for sub in run_agent(client, scout_agent(), ctx, scout_msgs):
                if sub.get("type") == "message.delta":
                    yield {**sub, "agent": "scout"}
                else:
                    yield {**sub, "agent": "scout"}
            yield {
                "type": "agent.handoff",
                "data": {"to": "orchestrator", "from": "scout"},
                "to": "orchestrator",
                "from": "scout",
            }
            continue

        yield event
