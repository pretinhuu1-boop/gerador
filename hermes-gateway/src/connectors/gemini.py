"""Gemini generative client — structured outputs + multimodal text gen.

We already have the Gemini key (separate from OpenRouter); using it directly
for tasks that benefit from native JSON schema enforcement and grounding
(extract_video_blueprint, fact-checking content drafts later) — without
spending OpenRouter credits on parse-fragile prompts.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from ..config import get_settings

log = logging.getLogger(__name__)

BASE = "https://generativelanguage.googleapis.com/v1beta"


class GeminiError(RuntimeError):
    pass


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type(httpx.TransportError),
    reraise=True,
)
async def generate_structured(
    prompt: str,
    response_schema: dict[str, Any],
    *,
    model: str = "gemini-2.5-flash",
    temperature: float = 0.4,
    system: str | None = None,
) -> dict[str, Any]:
    """Calls models/{model}:generateContent with `responseMimeType=application/json`
    + `responseSchema` enforced. Returns the parsed JSON or raises GeminiError."""
    s = get_settings()
    if not s.gemini_api_key:
        raise GeminiError("GEMINI_API_KEY not configured")

    payload: dict[str, Any] = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "responseMimeType": "application/json",
            "responseSchema": response_schema,
        },
    }
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            f"{BASE}/models/{model}:generateContent",
            params={"key": s.gemini_api_key},
            json=payload,
        )
    if r.status_code >= 400:
        raise GeminiError(f"Gemini {r.status_code}: {r.text[:300]}")
    data = r.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise GeminiError(f"empty response: {data}")
    parts = ((candidates[0].get("content") or {}).get("parts") or [])
    if not parts:
        raise GeminiError("no parts in response")
    text = parts[0].get("text") or ""
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise GeminiError(f"non-JSON despite schema: {e} — text={text[:300]}")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type(httpx.TransportError),
    reraise=True,
)
async def generate_text(
    prompt: str,
    *,
    model: str = "gemini-2.5-flash",
    temperature: float = 0.6,
    system: str | None = None,
) -> str:
    s = get_settings()
    if not s.gemini_api_key:
        raise GeminiError("GEMINI_API_KEY not configured")

    payload: dict[str, Any] = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature},
    }
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            f"{BASE}/models/{model}:generateContent",
            params={"key": s.gemini_api_key},
            json=payload,
        )
    if r.status_code >= 400:
        raise GeminiError(f"Gemini {r.status_code}: {r.text[:300]}")
    candidates = r.json().get("candidates") or []
    if not candidates:
        return ""
    parts = ((candidates[0].get("content") or {}).get("parts") or [])
    return (parts[0].get("text") if parts else "") or ""
