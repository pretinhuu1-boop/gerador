"""OpenRouter chat-completions client (OpenAI-compatible API)."""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

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
    ) -> dict[str, Any]:
        """Non-streaming completion. Returns the raw OpenAI-shaped response."""
        if not self.api_key:
            raise OpenRouterError("OPENROUTER_API_KEY missing")
        payload: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"
        r = await self._client.post(f"{self.base_url}/chat/completions", json=payload)
        if r.status_code >= 400:
            raise OpenRouterError(f"OpenRouter {r.status_code}: {r.text[:400]}")
        return r.json()

    async def stream(
        self,
        model: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.6,
        max_tokens: int = 2048,
    ) -> AsyncIterator[dict[str, Any]]:
        """Streaming completion. Yields parsed delta dicts (OpenAI shape)."""
        if not self.api_key:
            raise OpenRouterError("OPENROUTER_API_KEY missing")
        payload: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"
        async with self._client.stream(
            "POST",
            f"{self.base_url}/chat/completions",
            json=payload,
            headers={"Accept": "text/event-stream"},
        ) as r:
            if r.status_code >= 400:
                body = await r.aread()
                raise OpenRouterError(f"OpenRouter {r.status_code}: {body[:400].decode(errors='ignore')}")
            async for line in r.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    yield json.loads(data)
                except json.JSONDecodeError as e:
                    log.warning("bad stream chunk: %s (%s)", data[:120], e)
                    continue
