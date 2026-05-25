"""Connectors for external pipeline containers (Phase 3).

Three OSS pipelines plug in as HTTP services the user runs separately:

1. **VideoAssembler** — based on harry0703/MoneyPrinterTurbo (57.7k★ MIT).
   Pipeline: LLM script → TTS → Pexels b-roll → ffmpeg/moviepy → MP4 9:16.
   Run: docker run -p 8000:8000 harry0703/moneyprinterturbo
   Set EXTERNAL_VIDEO_ASSEMBLER_URL=http://host.docker.internal:8000.

2. **ClipExtractor** — based on SamurAIGPT/AI-Youtube-Shorts-Generator
   (3.7k★ MIT). Pipeline: yt-dlp → faster-whisper → LLM highlight detection
   → OpenCV face-track auto-crop 9:16. Set EXTERNAL_CLIP_EXTRACTOR_URL.

3. **TalkingHead** — based on OpenTalker/SadTalker (13.8k★ Apache).
   Pipeline: single image + audio → talking head MP4. Heavy GPU.
   Set EXTERNAL_TALKING_HEAD_URL.

Each connector is intentionally thin — just HTTP wrappers. The actual
contracts mirror the canonical projects' REST APIs; small differences
(field names, queue async vs sync) are absorbed here.
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from ..config import get_settings

log = logging.getLogger(__name__)


class ExternalPipelineError(RuntimeError):
    pass


# ─── VideoAssembler ─────────────────────────────────────────────────────────


async def assemble_video(
    script: str,
    *,
    voice: str = "pt-BR-AntonioNeural",
    aspect_ratio: str = "9:16",
    b_roll_query: str | None = None,
    subtitle_language: str = "pt",
    bg_music: str | None = None,
) -> dict[str, Any]:
    """POST /api/v1/videos to MoneyPrinterTurbo-style backend.

    Returns the canonical job descriptor (depends on the container's response).
    Typical contract: {task_id, status: 'queued'|'processing'|'done', mp4_url?}.
    """
    s = get_settings()
    if not s.external_video_assembler_url:
        raise ExternalPipelineError("EXTERNAL_VIDEO_ASSEMBLER_URL not configured")

    payload: dict[str, Any] = {
        "video_subject": script[:200],
        "video_script": script,
        "voice_name": voice,
        "video_aspect": aspect_ratio,
        "video_language": subtitle_language,
        "subtitle_enabled": True,
    }
    if b_roll_query:
        payload["video_terms"] = b_roll_query
    if bg_music:
        payload["bgm_type"] = bg_music

    async with httpx.AsyncClient(timeout=600.0) as client:
        r = await client.post(
            f"{s.external_video_assembler_url.rstrip('/')}/api/v1/videos",
            json=payload,
        )
    if r.status_code >= 400:
        raise ExternalPipelineError(f"video_assembler {r.status_code}: {r.text[:300]}")
    return r.json()


async def get_assembly_status(task_id: str) -> dict[str, Any]:
    """Poll the assembly job (when the container is async)."""
    s = get_settings()
    if not s.external_video_assembler_url:
        raise ExternalPipelineError("EXTERNAL_VIDEO_ASSEMBLER_URL not configured")
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(
            f"{s.external_video_assembler_url.rstrip('/')}/api/v1/tasks/{task_id}",
        )
    if r.status_code >= 400:
        raise ExternalPipelineError(f"assembly status {r.status_code}: {r.text[:300]}")
    return r.json()


# ─── ClipExtractor ──────────────────────────────────────────────────────────


async def extract_clips(
    youtube_url: str,
    *,
    max_clips: int = 5,
    target_duration_seconds: int = 60,
    aspect_ratio: str = "9:16",
) -> dict[str, Any]:
    """POST to the AI-Youtube-Shorts-Generator-style backend.

    Pipeline: yt-dlp → faster-whisper → highlight detection → auto-crop 9:16.
    Returns: {clips: [{start_s, end_s, mp4_url, summary}, ...]}.
    """
    s = get_settings()
    if not s.external_clip_extractor_url:
        raise ExternalPipelineError("EXTERNAL_CLIP_EXTRACTOR_URL not configured")
    payload = {
        "source_url": youtube_url,
        "max_clips": max_clips,
        "target_duration_seconds": target_duration_seconds,
        "aspect_ratio": aspect_ratio,
    }
    async with httpx.AsyncClient(timeout=1800.0) as client:
        r = await client.post(
            f"{s.external_clip_extractor_url.rstrip('/')}/extract",
            json=payload,
        )
    if r.status_code >= 400:
        raise ExternalPipelineError(f"clip_extractor {r.status_code}: {r.text[:300]}")
    return r.json()


# ─── TalkingHead ────────────────────────────────────────────────────────────


async def generate_talking_head(
    image_url: str,
    audio_url: str,
    *,
    preprocess: str = "crop",  # 'crop' | 'extcrop' | 'resize' | 'full'
    still: bool = False,
    enhancer: str | None = None,  # 'gfpgan' for face enhancement
) -> dict[str, Any]:
    """POST /generate to SadTalker-style backend.

    Returns: {mp4_url, duration_s, ...}.
    """
    s = get_settings()
    if not s.external_talking_head_url:
        raise ExternalPipelineError("EXTERNAL_TALKING_HEAD_URL not configured")
    payload: dict[str, Any] = {
        "image_url": image_url,
        "audio_url": audio_url,
        "preprocess": preprocess,
        "still": still,
    }
    if enhancer:
        payload["enhancer"] = enhancer

    async with httpx.AsyncClient(timeout=900.0) as client:
        r = await client.post(
            f"{s.external_talking_head_url.rstrip('/')}/generate",
            json=payload,
        )
    if r.status_code >= 400:
        raise ExternalPipelineError(f"talking_head {r.status_code}: {r.text[:300]}")
    return r.json()


def configured() -> dict[str, bool]:
    """Snapshot used by /v1/external/status for the UI to show pipeline health."""
    s = get_settings()
    return {
        "video_assembler": bool(s.external_video_assembler_url),
        "clip_extractor": bool(s.external_clip_extractor_url),
        "talking_head": bool(s.external_talking_head_url),
    }
