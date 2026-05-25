"""Batch TTS: synthesize all beats in parallel via ElevenLabs and probe duration."""
from __future__ import annotations

import asyncio
import json
import logging
import shutil
import subprocess
from pathlib import Path
from typing import Any

from ..connectors import elevenlabs

log = logging.getLogger(__name__)


async def synth_one(
    text: str,
    voice_id: str | None,
    out_path: Path,
) -> Path:
    audio = await elevenlabs.synthesize(text, voice_id=voice_id)
    out_path.write_bytes(audio)
    return out_path


def probe_duration_seconds(audio_path: Path) -> float:
    """ffprobe → duration in seconds. Falls back to a length estimate if ffprobe missing."""
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        log.warning("ffprobe not found — duration estimate from file size")
        # Rough fallback: assume ~24kbps MP3, so duration ≈ bytes / 3000.
        return max(1.0, audio_path.stat().st_size / 3000)
    try:
        out = subprocess.check_output(
            [
                ffprobe,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "json",
                str(audio_path),
            ],
            timeout=10,
        )
        duration = float(json.loads(out)["format"]["duration"])
        return duration
    except Exception as e:  # noqa: BLE001
        log.warning("ffprobe failed for %s: %s", audio_path, e)
        return max(1.0, audio_path.stat().st_size / 3000)


async def synthesize_beats(
    items: list[dict[str, Any]],
    voice_id: str | None,
    workdir: Path,
) -> list[dict[str, Any]]:
    """Synthesize each item ({beat_index, text}) into workdir/{i}.mp3 in parallel.

    Returns the list with `path` + `duration_s` appended.
    """
    workdir.mkdir(parents=True, exist_ok=True)
    tasks: list[asyncio.Task] = []
    for it in items:
        idx = it["beat_index"]
        out = workdir / f"{idx:03d}.mp3"
        tasks.append(asyncio.create_task(synth_one(it["text"], voice_id, out)))
    paths = await asyncio.gather(*tasks)
    enriched = []
    for it, path in zip(items, paths):
        enriched.append({**it, "path": str(path), "duration_s": probe_duration_seconds(path)})
    return enriched
