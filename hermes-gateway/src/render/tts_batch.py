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
from . import captions as captions_mod

log = logging.getLogger(__name__)


async def synth_one(
    text: str,
    voice_id: str | None,
    out_path: Path,
    with_alignment: bool,
) -> dict[str, Any]:
    """Returns {path, alignment?}. Alignment is the raw ElevenLabs char-level data."""
    if with_alignment:
        result = await elevenlabs.synthesize_with_alignment(text, voice_id=voice_id)
        out_path.write_bytes(result["audio"])
        return {"path": out_path, "alignment": result.get("alignment") or {}}
    audio = await elevenlabs.synthesize(text, voice_id=voice_id)
    out_path.write_bytes(audio)
    return {"path": out_path, "alignment": None}


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
    with_alignment: bool = True,
) -> list[dict[str, Any]]:
    """Synthesize each item ({beat_index, text}) into workdir/{i}.mp3 in parallel.

    Returns the list with `path`, `duration_s`, and (when alignment requested)
    `words: list[Caption]` appended. Word timestamps are LOCAL to the beat
    audio (offset=0); the pipeline shifts them to the global timeline.

    Falls back to no-alignment if the ElevenLabs timestamps call fails — TTS
    is the critical path; captions are best-effort.
    """
    workdir.mkdir(parents=True, exist_ok=True)
    tasks: list[asyncio.Task] = []
    for it in items:
        idx = it["beat_index"]
        out = workdir / f"{idx:03d}.mp3"
        tasks.append(asyncio.create_task(synth_one(it["text"], voice_id, out, with_alignment)))

    results: list[dict[str, Any]] = []
    raw = await asyncio.gather(*tasks, return_exceptions=True)
    for it, r in zip(items, raw):
        if isinstance(r, BaseException):
            # If the with-timestamps endpoint fails, fall back to plain synth — better
            # to ship a caption-less render than no render at all.
            log.warning(
                "synth (with_alignment=%s) failed for beat %s: %s — retrying without alignment",
                with_alignment,
                it["beat_index"],
                r,
            )
            try:
                r = await synth_one(
                    it["text"],
                    voice_id,
                    workdir / f"{it['beat_index']:03d}.mp3",
                    with_alignment=False,
                )
            except Exception as e2:  # noqa: BLE001
                log.exception("plain synth also failed for beat %s", it["beat_index"])
                raise RuntimeError(f"TTS failed for beat {it['beat_index']}: {e2}") from e2
        path = r["path"]
        duration_s = probe_duration_seconds(path)
        words = captions_mod.chars_to_words(r.get("alignment") or {}) if r.get("alignment") else []
        results.append(
            {
                **it,
                "path": str(path),
                "duration_s": duration_s,
                "words": words,  # local-to-beat timing; pipeline shifts to global
            }
        )
    return results
