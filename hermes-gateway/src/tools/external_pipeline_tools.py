"""Tools wrapping external pipeline containers (Phase 3).

Tools register conditionally — only when the corresponding URL is set in
config. Avoids exposing tool specs the LLM can call into nothing.

Pattern: each tool returns {ok: bool, ...} so the agent can decide whether
to fall back to the in-app pipeline.
"""
from __future__ import annotations

import logging
from typing import Any

from ..config import get_settings
from ..connectors import external_pipelines as ep
from . import ToolSpec, register

log = logging.getLogger(__name__)


async def _assemble_video(
    user_id: str,
    script: str,
    voice: str = "pt-BR-AntonioNeural",
    aspect_ratio: str = "9:16",
    b_roll_query: str | None = None,
) -> dict[str, Any]:
    try:
        r = await ep.assemble_video(
            script,
            voice=voice,
            aspect_ratio=aspect_ratio,
            b_roll_query=b_roll_query,
        )
    except ep.ExternalPipelineError as e:
        return {"ok": False, "error": str(e)}
    return {"ok": True, "result": r}


async def _extract_clips(
    user_id: str,
    youtube_url: str,
    max_clips: int = 5,
    target_duration_seconds: int = 60,
) -> dict[str, Any]:
    try:
        r = await ep.extract_clips(
            youtube_url,
            max_clips=max_clips,
            target_duration_seconds=target_duration_seconds,
        )
    except ep.ExternalPipelineError as e:
        return {"ok": False, "error": str(e)}
    return {"ok": True, "result": r}


async def _generate_talking_head(
    user_id: str,
    image_url: str,
    audio_url: str,
    enhancer: str | None = None,
) -> dict[str, Any]:
    try:
        r = await ep.generate_talking_head(image_url, audio_url, enhancer=enhancer)
    except ep.ExternalPipelineError as e:
        return {"ok": False, "error": str(e)}
    return {"ok": True, "result": r}


def _register_when_configured() -> None:
    s = get_settings()

    if s.external_video_assembler_url:
        register(
            ToolSpec(
                name="assemble_video",
                description=(
                    "Pede pra um container externo (MoneyPrinterTurbo-style) gerar um MP4 "
                    "completo a partir do script: TTS + b-roll Pexels + ffmpeg/moviepy. "
                    "Use quando o user pedir 'vídeo completo automatizado com b-roll real' — "
                    "alternativa ao pipeline Remotion interno (que faz motion-graphics, não "
                    "stock footage). Retorna {task_id, status, mp4_url?} — pode ser async."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "script": {"type": "string", "description": "Roteiro completo, pode incluir hook+beats+CTA já formatado."},
                        "voice": {"type": "string", "description": "Voice id no formato do container (ex: pt-BR-AntonioNeural pra Edge TTS).", "default": "pt-BR-AntonioNeural"},
                        "aspect_ratio": {"type": "string", "enum": ["9:16", "16:9", "1:1"], "default": "9:16"},
                        "b_roll_query": {"type": "string", "description": "Termos pra buscar b-roll stock (Pexels). Omita pra auto-derivar do script."},
                    },
                    "required": ["user_id", "script"],
                },
                handler=_assemble_video,
            )
        )
        log.info("registered tool: assemble_video")

    if s.external_clip_extractor_url:
        register(
            ToolSpec(
                name="extract_clips",
                description=(
                    "Extrai shorts virais 9:16 de um vídeo longo do YouTube via container externo "
                    "(AI-Youtube-Shorts-Generator-style): yt-dlp + faster-whisper + LLM "
                    "highlight detection + OpenCV face-track auto-crop. Use pra repost/clipping "
                    "de canais longos. Retorna {clips: [{start_s, end_s, mp4_url, summary}, ...]}."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "youtube_url": {"type": "string"},
                        "max_clips": {"type": "integer", "minimum": 1, "maximum": 20, "default": 5},
                        "target_duration_seconds": {"type": "integer", "minimum": 15, "maximum": 180, "default": 60},
                    },
                    "required": ["user_id", "youtube_url"],
                },
                handler=_extract_clips,
            )
        )
        log.info("registered tool: extract_clips")

    if s.external_talking_head_url:
        register(
            ToolSpec(
                name="generate_talking_head",
                description=(
                    "Gera um avatar falante (talking-head) via container externo SadTalker-style: "
                    "1 foto + 1 áudio MP3/WAV → MP4 com lipsync. Use pra colocar 'apresentador "
                    "virtual' em pequenos trechos do vídeo (ex: intro + outro). Pesado: requer "
                    "GPU no container, demora 20-60s por trecho. enhancer='gfpgan' melhora "
                    "qualidade do rosto."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "image_url": {"type": "string", "description": "URL HTTP(S) pública pra foto do avatar."},
                        "audio_url": {"type": "string", "description": "URL HTTP(S) pra MP3/WAV (ex: signed Supabase Storage URL)."},
                        "enhancer": {"type": "string", "enum": ["gfpgan"], "description": "Opcional — face enhancement."},
                    },
                    "required": ["user_id", "image_url", "audio_url"],
                },
                handler=_generate_talking_head,
            )
        )
        log.info("registered tool: generate_talking_head")


_register_when_configured()
