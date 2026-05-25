"""OpenRouter chat-completions client (OpenAI-compatible API).

Phase 3 upgrades:
- `models` parameter: when set, sends a fallback chain (`models: [primary, ...]`)
  so OpenRouter automatically routes to the next model if one fails.
- `cache_control` is passed through verbatim on messages (Anthropic / Gemini /
  DeepSeek providers honor it for prompt caching, OpenRouter strips it for
  others). System prompts use this to amortize the static parts of the prompt.
"""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from ..config import get_settings

log = logging.getLogger(__name__)


class OpenRouterError(RuntimeError):
    pass


class OpenRouterClient:
    """Thin async wrapper around OpenRouter /chat/completions, supporting tool calls + streaming."""

    def __init__(self, api_key: str | None = None, base_url: str | None = None):
        settings = get_settings()
        self.api_key = api_key or settings.openrouter_api_key
        self.base_url = (base_url or settings.openrouter_base_url).rstrip("/")
        if not self.api_key:
            log.warning("OPENROUTER_API_KEY not set — gateway will return errors on chat calls")
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(60.0, connect=10.0),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "HTTP-Referer": "https://github.com/pretinhuu1-boop/gerador",
                "X-Title": "Channel OS — Hermes Gateway",
            },
        )

    async def close(self) -> None:
        await self._client.aclose()

    def _build_payload(
        self,
        model: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None,
        temperature: float,
        max_tokens: int,
        models: list[str] | None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        # Fallback chain takes precedence — OpenRouter accepts either `model` or `models`.
        if models:
            payload["models"] = models
            payload["route"] = "fallback"
        else:
            payload["model"] = model
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"
        # Track cache hits in the response usage block.
        payload["usage"] = {"include": True}
        return payload

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        retry=retry_if_exception_type((httpx.TransportError, httpx.HTTPStatusError)),
        reraise=True,
    )
    async def complete(
        self,
        model: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.6,
        max_tokens: int = 2048,
        models: list[str] | None = None,
    ) -> dict[str, Any]:
        """Non-streaming completion. Returns the raw OpenAI-shaped response."""
        if not self.api_key:
            raise OpenRouterError("OPENROUTER_API_KEY missing")
        payload = self._build_payload(model, messages, tools, temperature, max_tokens, models)
        r = await self._client.post(f"{self.base_url}/chat/completions", json=payload)
        if r.status_code >= 400:
            raise OpenRouterError(f"OpenRouter {r.status_code}: {r.text[:400]}")
        data = r.json()
        _log_usage(model, models, data)
        return data

    async def stream(
        self,
        model: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.6,
        max_tokens: int = 2048,
        models: list[str] | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        """Streaming completion. Yields parsed delta dicts (OpenAI shape)."""
        if not self.api_key:
            raise OpenRouterError("OPENROUTER_API_KEY missing")
        payload = self._build_payload(model, messages, tools, temperature, max_tokens, models)
        payload["stream"] = True
        async with self._client.stream(
            "POST",
            f"{self.base_url}/chat/completions",
            json=payload,
            headers={"Accept": "text/event-stream"},
        ) as r:
            if r.status_code >= 400:
                body = await r.aread()
                raise OpenRouterError(
                    f"OpenRouter {r.status_code}: {body[:400].decode(errors='ignore')}"
                )
            async for line in r.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                    yield chunk
                except json.JSONDecodeError as e:
                    log.warning("bad stream chunk: %s (%s)", data[:120], e)
                    continue


def cache_marker(content: str) -> list[dict[str, Any]]:
    """Wraps a string as an Anthropic-flavored cached content block.

    Use in messages like:
        {"role": "system", "content": cache_marker(SYSTEM_PROMPT)}

    Anthropic/Gemini/DeepSeek honor `cache_control: {type: 'ephemeral'}`;
    other providers ignore the block and treat it as plain text.
    """
    return [
        {
            "type": "text",
            "text": content,
            "cache_control": {"type": "ephemeral"},
        }
    ]


def _log_usage(model: str, models: list[str] | None, response: dict[str, Any]) -> None:
    usage = response.get("usage") or {}
    if not usage:
        return
    cached = (
        usage.get("prompt_tokens_details", {}).get("cached_tokens")
        or usage.get("cache_read_input_tokens")
        or 0
    )
    log.info(
        "openrouter usage model=%s in=%s out=%s cached=%s",
        response.get("model") or (models[0] if models else model),
        usage.get("prompt_tokens"),
        usage.get("completion_tokens"),
        cached,
    )
