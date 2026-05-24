"""Voice / TTS tools for the Content agent."""
from __future__ import annotations

import logging
from typing import Any

from ..config import get_settings
from ..connectors import elevenlabs
from . import ToolSpec, register

log = logging.getLogger(__name__)


async def _list_voices(user_id: str, limit: int = 20) -> dict[str, Any]:
    s = get_settings()
    if not s.elevenlabs_api_key:
        return {"error": "ELEVENLABS_API_KEY not configured", "configured": False}
    try:
        voices = await elevenlabs.list_voices()
    except elevenlabs.ElevenLabsError as e:
        return {"error": str(e)}
    summary = [
        {
            "voice_id": v.get("voice_id"),
            "name": v.get("name"),
            "category": v.get("category"),
            "labels": v.get("labels"),
            "preview_url": v.get("preview_url"),
        }
        for v in voices[:limit]
    ]
    return {"configured": True, "voices": summary, "default": s.elevenlabs_default_voice}


async def _preview_voice(
    user_id: str,
    text: str,
    voice_id: str | None = None,
) -> dict[str, Any]:
    """Synthesizes a short sample and returns metadata only (audio is streamed
    via /v1/voice/stream from the frontend, this tool exists so the agent can
    confirm "voice plugged in" inside chat without dumping binary payloads)."""
    s = get_settings()
    if not s.elevenlabs_api_key:
        return {"error": "ELEVENLABS_API_KEY not configured", "configured": False}
    sample = (text or "").strip()[:500]
    if not sample:
        return {"error": "text is required"}
    try:
        audio = await elevenlabs.synthesize(sample, voice_id=voice_id)
    except elevenlabs.ElevenLabsError as e:
        return {"error": str(e)}
    return {
        "configured": True,
        "voice_id": voice_id or s.elevenlabs_default_voice,
        "bytes": len(audio),
        "sample_chars": len(sample),
        "model": s.elevenlabs_model,
        "note": "Audio binary not returned in chat — UI fetches via /v1/voice/stream.",
    }


register(
    ToolSpec(
        name="list_elevenlabs_voices",
        description=(
            "List voices available in the user's ElevenLabs account. Use when the user wants to "
            "pick a voice for narration or to know which voices are wired up."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "limit": {"type": "integer", "minimum": 1, "maximum": 50, "default": 20},
            },
            "required": ["user_id"],
        },
        handler=_list_voices,
    )
)

register(
    ToolSpec(
        name="preview_voice",
        description=(
            "Synthesize a short sample text in a specific ElevenLabs voice to confirm the wiring. "
            "Use when the user wants to A/B voices or sanity-check that TTS is online. The audio "
            "is not returned in chat — the UI streams it from /v1/voice/stream."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "text": {
                    "type": "string",
                    "description": "Sample text to read (≤500 chars).",
                },
                "voice_id": {
                    "type": "string",
                    "description": "Voice ID. Defaults to ELEVENLABS_DEFAULT_VOICE.",
                },
            },
            "required": ["user_id", "text"],
        },
        handler=_preview_voice,
    )
)
