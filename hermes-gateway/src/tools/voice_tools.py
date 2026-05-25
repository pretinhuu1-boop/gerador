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

async def _preview_sfx(
    user_id: str,
    prompt: str,
    duration_seconds: float | None = None,
) -> dict[str, Any]:
    """Generates a short SFX preview via ElevenLabs Sound Effects. Returns
    metadata only — same pattern as preview_voice. Use when picking
    sfx_prompt strings before attaching to a beat."""
    s = get_settings()
    if not s.elevenlabs_api_key:
        return {"error": "ELEVENLABS_API_KEY not configured", "configured": False}
    prompt = (prompt or "").strip()
    if not prompt:
        return {"error": "prompt is required"}
    try:
        audio = await elevenlabs.generate_sfx(prompt, duration_seconds=duration_seconds)
    except elevenlabs.ElevenLabsError as e:
        return {"error": str(e)}
    return {
        "configured": True,
        "prompt": prompt[:200],
        "duration_seconds_requested": duration_seconds,
        "bytes": len(audio),
        "note": (
            "SFX generated. Pra anexar a um beat, salva como sfx_prompt em beat.metadata e o "
            "pipeline gera + linka automaticamente no próximo render."
        ),
    }


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

register(
    ToolSpec(
        name="generate_sfx",
        description=(
            "Generate a short sound effect via ElevenLabs Sound Effects API given a text prompt "
            "(ex: 'cinematic whoosh', 'glass impact', 'soft uplifter', 'horror sting'). "
            "Use ANTES de anexar a um beat — confirma que o prompt produz o som que você quer. "
            "duration_seconds opcional 0.5-22s (default ~auto). "
            "Pra anexar definitivamente: o user/agente coloca sfx_prompt no beat.metadata; o "
            "pipeline de render gera e linka no MP4 automaticamente como camada de áudio."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "prompt": {
                    "type": "string",
                    "description": "Descrição do SFX em inglês ou português (ex: 'cinematic whoosh 1s').",
                },
                "duration_seconds": {
                    "type": "number",
                    "description": "Duração desejada em segundos. 0.5 a 22.0. Omita pra auto.",
                    "minimum": 0.5,
                    "maximum": 22.0,
                },
            },
            "required": ["user_id", "prompt"],
        },
        handler=_preview_sfx,
    )
)
