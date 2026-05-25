"""Top-level render orchestration.

Flow:
  1. Load the content_drafts row + the content_renders shell row.
  2. Synthesize TTS for every beat in parallel (ElevenLabs).
  3. Compute per-beat start times from real audio durations.
  4. Upload audio clips to Supabase Storage (signed URLs).
  5. Hand timings + audio_urls to Remotion as inputProps.
  6. Render via `npx remotion render` → local MP4.
  7. Upload MP4 to Storage.
  8. Patch DB rows (content_renders + content_drafts).
"""
from __future__ import annotations

import logging
import os
import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from ..config import get_settings
from ..connectors.supabase_client import supabase_admin
from . import progress, props as props_builder, remotion, storage, tts_batch

log = logging.getLogger(__name__)

# FPS now comes from the template registry (template_dimensions) — keep the
# seconds-based knobs here, frames are computed per-render with the template's fps.
HOOK_S = 2.5
CTA_S = 2.5
TAIL_PADDING_S = 0.3  # small pause between beats to avoid clipping


def _load_draft_and_render(draft_id: str, render_id: str) -> tuple[dict[str, Any], dict[str, Any]]:
    sb = supabase_admin()
    draft_resp = (
        sb.table("content_drafts").select("*").eq("id", draft_id).maybe_single().execute()
    )
    render_resp = (
        sb.table("content_renders").select("*").eq("id", render_id).maybe_single().execute()
    )
    if not (draft_resp and draft_resp.data):
        raise RuntimeError(f"draft {draft_id} not found")
    if not (render_resp and render_resp.data):
        raise RuntimeError(f"render {render_id} not found")
    return draft_resp.data, render_resp.data


async def run(render_id: str) -> None:
    """Entry point — called from a FastAPI background task. Never raises; logs errors."""
    s = get_settings()
    try:
        sb = supabase_admin()
        render = (
            sb.table("content_renders")
            .select("*")
            .eq("id", render_id)
            .maybe_single()
            .execute()
        )
        if not (render and render.data):
            log.warning("render %s vanished before pipeline start", render_id)
            return
        draft, render_row = _load_draft_and_render(render.data["draft_id"], render_id)
    except Exception as e:  # noqa: BLE001
        log.exception("render bootstrap failed")
        progress.mark_error(render_id, f"bootstrap: {e}")
        return

    user_id = render_row["user_id"]
    voice_id = render_row.get("voice_id")
    beats = (draft.get("beats") or [])
    beats = [b for b in beats if (b.get("text") or "").strip()]
    hook = (draft.get("hook") or "").strip()
    template_id = render_row.get("template_id") or "StoriesVertical"
    if template_id not in props_builder.known_template_ids():
        log.warning("unknown template_id %r — falling back to StoriesVertical", template_id)
        template_id = "StoriesVertical"

    progress.mark_started(render_id)

    workdir = Path(tempfile.mkdtemp(prefix=f"render-{render_id}-", dir=s.render_workdir if Path(s.render_workdir).exists() else None))
    try:
        # --- TTS ---------------------------------------------------------
        progress.update_render(render_id, status="tts", stage="synthesizing beats", progress=10)
        tts_items: list[dict[str, Any]] = []
        if hook:
            tts_items.append({"beat_index": -1, "text": hook, "label": "hook"})
        for i, b in enumerate(beats):
            tts_items.append({"beat_index": i, "text": b["text"], "label": f"beat-{i}"})

        synthesized = await tts_batch.synthesize_beats(tts_items, voice_id, workdir / "audio")

        # --- SFX (per-beat sound effects, best-effort) -----------------
        # When a beat has metadata.sfx_prompt OR top-level sfx_prompt, generate
        # a short SFX in parallel. Failures are logged + skipped — SFX is
        # decoration, not blocking.
        sfx_items: list[tuple[int, str, float | None]] = []
        for i, b in enumerate(beats):
            meta = b.get("metadata") if isinstance(b.get("metadata"), dict) else {}
            prompt = (b.get("sfx_prompt") or (meta or {}).get("sfx_prompt") or "").strip()
            if not prompt:
                continue
            dur_hint = b.get("sfx_duration_s") or (meta or {}).get("sfx_duration_s")
            sfx_items.append((i, prompt, float(dur_hint) if dur_hint else None))

        sfx_urls: dict[int, str] = {}
        if sfx_items:
            from ..connectors import elevenlabs as el

            sfx_dir = workdir / "sfx"
            sfx_dir.mkdir(parents=True, exist_ok=True)
            progress.update_render(render_id, stage=f"generating {len(sfx_items)} sfx", progress=30)

            async def _gen(idx: int, prompt: str, dur: float | None) -> tuple[int, Path] | None:
                try:
                    audio_bytes = await el.generate_sfx(prompt, duration_seconds=dur)
                    p = sfx_dir / f"{idx:03d}.mp3"
                    p.write_bytes(audio_bytes)
                    return idx, p
                except Exception as e:  # noqa: BLE001
                    log.warning("sfx beat %s failed (%r): %s", idx, prompt[:40], e)
                    return None

            import asyncio

            results = await asyncio.gather(*[_gen(i, p, d) for i, p, d in sfx_items])
            for r in results:
                if not r:
                    continue
                idx, path = r
                dest = f"{user_id}/{render_id}/sfx/{idx + 1:03d}.mp3"
                sfx_urls[idx] = storage.upload_file(path, dest, content_type="audio/mpeg")

        # --- Upload audio clips ----------------------------------------
        progress.update_render(render_id, stage="uploading audio", progress=40)
        audio_urls: list[dict[str, Any]] = []
        for item in synthesized:
            idx = item["beat_index"]
            local = Path(item["path"])
            dest = f"{user_id}/{render_id}/audio/{idx + 1:03d}.mp3"
            url = storage.upload_file(local, dest, content_type="audio/mpeg")
            audio_urls.append(
                {
                    "beat_index": idx,
                    "url": url,
                    "duration_s": round(float(item["duration_s"]), 3),
                    "label": item.get("label"),
                }
            )

        # --- Compute per-beat start times + shift captions to global timeline ---
        synth_by_idx = {s["beat_index"]: s for s in synthesized}

        def shift_words(local_words: list[dict[str, Any]], offset_s: float) -> list[dict[str, Any]]:
            if not local_words:
                return []
            offset_ms = int(round(offset_s * 1000))
            return [
                {**w, "startMs": w["startMs"] + offset_ms, "endMs": w["endMs"] + offset_ms,
                 "timestampMs": w["timestampMs"] + offset_ms}
                for w in local_words
            ]

        hook_words: list[dict[str, Any]] = []
        if hook:
            hs = synth_by_idx.get(-1, {})
            hook_words = shift_words(hs.get("words") or [], 0.0)

        cursor = HOOK_S if hook else 0
        beats_with_t: list[dict[str, Any]] = []
        all_captions: list[dict[str, Any]] = list(hook_words)
        for i, b in enumerate(beats):
            sb = synth_by_idx.get(i, {})
            dur = sb.get("duration_s")
            real_dur = max(2.0, (dur or 2.0))
            local_words = sb.get("words") or []
            shifted = shift_words(local_words, cursor)
            beats_with_t.append(
                {
                    **b,
                    "t": cursor,
                    "duration_s": real_dur,
                    "audio_url": next(
                        (a["url"] for a in audio_urls if a["beat_index"] == i),
                        None,
                    ),
                    "sfx_url": sfx_urls.get(i),
                    "captions": shifted,
                }
            )
            all_captions.extend(shifted)
            cursor += real_dur + TAIL_PADDING_S
        total_seconds = cursor + CTA_S

        # --- Remotion render --------------------------------------------
        progress.update_render(
            render_id,
            status="rendering",
            stage=f"rendering {round(total_seconds, 1)}s via {template_id}",
            progress=60,
        )
        hook_audio_url = next(
            (a["url"] for a in audio_urls if a["beat_index"] == -1),
            None,
        )
        props = props_builder.build_props(
            template_id,
            draft=draft,
            hook=hook,
            beats_with_t=beats_with_t,
            hook_audio_url=hook_audio_url,
            captions=all_captions,
        )
        width, height, fps = props_builder.template_dimensions(template_id)
        duration_in_frames = max(fps * 5, int(round(total_seconds * fps)))
        mp4_local = workdir / "out.mp4"
        await remotion.render(
            composition_id=template_id,
            props=props,
            out_path=mp4_local,
            duration_in_frames=duration_in_frames,
            width=width,
            height=height,
            fps=fps,
        )

        # --- Upload MP4 -------------------------------------------------
        progress.update_render(render_id, status="uploading", stage="uploading mp4", progress=85)
        mp4_dest = f"{user_id}/{render_id}/out.mp4"
        mp4_url = storage.upload_file(mp4_local, mp4_dest, content_type="video/mp4")
        size_bytes = mp4_local.stat().st_size

        # --- Done -------------------------------------------------------
        progress.mark_done(
            render_id,
            mp4_url=mp4_url,
            duration_s=total_seconds,
            size_bytes=size_bytes,
            audio_urls=audio_urls,
        )
        progress.mark_draft_rendered(render_row["draft_id"])
        log.info("render %s done: %s (%s bytes)", render_id, mp4_url, size_bytes)
    except Exception as e:  # noqa: BLE001
        log.exception("render pipeline failed")
        progress.mark_error(render_id, str(e))
    finally:
        try:
            shutil.rmtree(workdir, ignore_errors=True)
        except Exception:  # noqa: BLE001
            pass
