"""ElevenLabs Text-to-Speech client.

Wraps the v1 TTS endpoints with a thin httpx layer. Used both as a streaming
helper (for live audio in the UI) and as a stash-to-storage helper (for the
upcoming render pipeline).
"""
from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from ..config import get_settings

log = logging.getLogger(__name__)

BASE_URL = "https://api.elevenlabs.io/v1"


class ElevenLabsError(RuntimeError):
    pass


def _headers() -> dict[str, str]:
    s = get_settings()
    if not s.elevenlabs_api_key:
        raise ElevenLabsError("ELEVENLABS_API_KEY missing")
    return {"xi-api-key": s.elevenlabs_api_key, "Accept": "application/json"}


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type(httpx.TransportError),
    reraise=True,
)
async def list_voices() -> list[dict[str, Any]]:
    """Returns the user's voice library (built-in + cloned)."""
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(f"{BASE_URL}/voices", headers=_headers())
    if r.status_code >= 400:
        raise ElevenLabsError(f"ElevenLabs {r.status_code}: {r.text[:300]}")
    data = r.json()
    return data.get("voices", []) or []


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type(httpx.TransportError),
    reraise=True,
)
async def synthesize(
    text: str,
    voice_id: str | None = None,
    model_id: str | None = None,
    stability: float = 0.45,
    similarity_boost: float = 0.75,
    style: float = 0.0,
    speaker_boost: bool = True,
) -> bytes:
    """Synchronous TTS — returns full MP3 bytes."""
    s = get_settings()
    voice = voice_id or s.elevenlabs_default_voice
    model = model_id or s.elevenlabs_model
    headers = _headers()
    headers["Accept"] = "audio/mpeg"

    payload = {
        "text": text,
        "model_id": model,
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost,
            "style": style,
            "use_speaker_boost": speaker_boost,
        },
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            f"{BASE_URL}/text-to-speech/{voice}",
            headers=headers,
            json=payload,
        )
    if r.status_code >= 400:
        raise ElevenLabsError(f"ElevenLabs {r.status_code}: {r.text[:300]}")
    return r.content


async def synthesize_with_alignment(
    text: str,
    voice_id: str | None = None,
    model_id: str | None = None,
    stability: float = 0.45,
    similarity_boost: float = 0.75,
    style: float = 0.0,
    speaker_boost: bool = True,
) -> dict[str, Any]:
    """TTS with character-level timestamps (for caption sync).

    Returns: {audio: bytes, alignment: {characters, character_start_times_seconds, character_end_times_seconds}}.
    Slightly slower than `synthesize` (JSON envelope + base64 audio), but the
    alignment data is essential for word-level captions in renders.
    """
    import base64

    s = get_settings()
    voice = voice_id or s.elevenlabs_default_voice
    model = model_id or s.elevenlabs_model
    headers = _headers()
    headers["Accept"] = "application/json"

    payload = {
        "text": text,
        "model_id": model,
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost,
            "style": style,
            "use_speaker_boost": speaker_boost,
        },
    }
    async with httpx.AsyncClient(timeout=90.0) as client:
        r = await client.post(
            f"{BASE_URL}/text-to-speech/{voice}/with-timestamps",
            headers=headers,
            json=payload,
        )
    if r.status_code >= 400:
        raise ElevenLabsError(f"ElevenLabs (timestamps) {r.status_code}: {r.text[:300]}")
    data = r.json()
    audio_b64 = data.get("audio_base64") or ""
    if not audio_b64:
        raise ElevenLabsError("ElevenLabs returned no audio_base64")
    return {
        "audio": base64.b64decode(audio_b64),
        "alignment": data.get("normalized_alignment") or data.get("alignment") or {},
    }


async def stream(
    text: str,
    voice_id: str | None = None,
    model_id: str | None = None,
    stability: float = 0.45,
    similarity_boost: float = 0.75,
) -> AsyncIterator[bytes]:
    """Streams MP3 chunks. Use behind a StreamingResponse for live playback."""
    s = get_settings()
    voice = voice_id or s.elevenlabs_default_voice
    model = model_id or s.elevenlabs_model
    headers = _headers()
    headers["Accept"] = "audio/mpeg"

    payload = {
        "text": text,
        "model_id": model,
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost,
        },
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            f"{BASE_URL}/text-to-speech/{voice}/stream",
            headers=headers,
            json=payload,
        ) as r:
            if r.status_code >= 400:
                body = await r.aread()
                raise ElevenLabsError(f"ElevenLabs {r.status_code}: {body[:300].decode(errors='ignore')}")
            async for chunk in r.aiter_bytes():
                if chunk:
                    yield chunk
