"""Progress + DB state helpers shared across the render pipeline."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from ..connectors.supabase_client import supabase_admin

log = logging.getLogger(__name__)


def update_render(render_id: str, **patch: Any) -> None:
    """Best-effort update on content_renders + Realtime broadcast via the row update."""
    try:
        sb = supabase_admin()
        sb.table("content_renders").update(patch).eq("id", render_id).execute()
    except Exception as e:  # noqa: BLE001
        log.warning("update_render %s failed: %s", render_id, e)


def mark_started(render_id: str) -> None:
    update_render(
        render_id,
        status="tts",
        stage="starting",
        started_at=datetime.now(timezone.utc).isoformat(),
        progress=1,
    )


def mark_error(render_id: str, message: str, increment_retry: bool = True) -> None:
    sb = supabase_admin()
    try:
        row = (
            sb.table("content_renders")
            .select("retry_count")
            .eq("id", render_id)
            .maybe_single()
            .execute()
        )
        retries = (row.data or {}).get("retry_count", 0) if row else 0
    except Exception:  # noqa: BLE001
        retries = 0
    patch = {
        "status": "error",
        "error": message[:2000],
        "stage": None,
        "ended_at": datetime.now(timezone.utc).isoformat(),
    }
    if increment_retry:
        patch["retry_count"] = retries + 1
    update_render(render_id, **patch)


def mark_done(
    render_id: str,
    mp4_url: str,
    duration_s: float,
    size_bytes: int,
    audio_urls: list[dict[str, Any]],
) -> None:
    update_render(
        render_id,
        status="rendered",
        stage="done",
        progress=100,
        mp4_url=mp4_url,
        duration_s=round(duration_s, 2),
        size_bytes=size_bytes,
        audio_urls=audio_urls,
        ended_at=datetime.now(timezone.utc).isoformat(),
        error=None,
    )


def mark_draft_rendered(draft_id: str) -> None:
    try:
        sb = supabase_admin()
        sb.table("content_drafts").update({"status": "rendered"}).eq("id", draft_id).execute()
    except Exception as e:  # noqa: BLE001
        log.warning("mark_draft_rendered failed: %s", e)
