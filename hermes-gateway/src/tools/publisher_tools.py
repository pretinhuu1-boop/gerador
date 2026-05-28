"""Publisher tools — stage content for multi-platform publishing.

OAuth integrations (YouTube Data API upload, TikTok Content Posting API,
Instagram Graph API) stay as stubs in this phase. The hermes_scheduled_posts
row is the source of truth — a worker (added in Phase 7) picks `scheduled`
rows whose scheduled_for <= now() and does the actual platform upload.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)

ALLOWED_PLATFORMS = {"youtube", "tiktok", "instagram"}


async def _schedule_post(
    user_id: str,
    platform: str,
    title: str,
    scheduled_for: str,
    draft_id: str | None = None,
    render_id: str | None = None,
    channel_id: str | None = None,
    description: str | None = None,
    hashtags: list[str] | None = None,
) -> dict[str, Any]:
    if platform not in ALLOWED_PLATFORMS:
        return {"error": f"invalid platform {platform!r}; allowed: {sorted(ALLOWED_PLATFORMS)}"}
    try:
        # Validate timestamp; accept ISO 8601 with TZ.
        ts = datetime.fromisoformat(scheduled_for.replace("Z", "+00:00"))
    except ValueError as e:
        return {"error": f"scheduled_for must be ISO 8601: {e}"}
    if ts < datetime.now(timezone.utc):
        return {"error": "scheduled_for must be in the future"}

    sb = supabase_admin()
    row = {
        "user_id": user_id,
        "platform": platform,
        "title": title[:200],
        "description": (description or "")[:5000] or None,
        "hashtags": [h.lstrip("#") for h in (hashtags or [])],
        "scheduled_for": ts.isoformat(),
        "draft_id": draft_id,
        "render_id": render_id,
        "channel_id": channel_id,
        "status": "scheduled",
    }
    inserted = sb.table("hermes_scheduled_posts").insert(row).execute()
    if not inserted.data:
        return {"error": "insert returned no row"}
    new_row = inserted.data[0]
    return {
        "scheduled_post_id": new_row["id"],
        "platform": platform,
        "scheduled_for": new_row["scheduled_for"],
        "title": new_row["title"],
        "status": "scheduled",
        "note": "OAuth upload still stubbed — Phase 7 will wire YouTube/TikTok/IG APIs.",
    }


async def _list_scheduled_posts(
    user_id: str,
    status: str | None = None,
    platform: str | None = None,
    limit: int = 30,
) -> dict[str, Any]:
    sb = supabase_admin()
    q = (
        sb.table("hermes_scheduled_posts")
        .select(
            "id, platform, title, scheduled_for, status, draft_id, render_id, channel_id, error"
        )
        .eq("user_id", user_id)
        .order("scheduled_for", desc=False)
        .limit(max(1, min(100, limit)))
    )
    if status:
        q = q.eq("status", status)
    if platform:
        q = q.eq("platform", platform)
    res = q.execute()
    return {"posts": res.data or []}


async def _cancel_scheduled_post(user_id: str, scheduled_post_id: str) -> dict[str, Any]:
    sb = supabase_admin()
    sb.table("hermes_scheduled_posts").update({"status": "cancelled"}).eq(
        "id", scheduled_post_id
    ).eq("user_id", user_id).execute()
    return {"scheduled_post_id": scheduled_post_id, "status": "cancelled"}


register(
    ToolSpec(
        name="schedule_post",
        description=(
            "Schedule a content piece to publish on a platform. Creates a row in "
            "hermes_scheduled_posts; the actual upload is performed by the publisher worker "
            "(Phase 7 — OAuth wiring). Required: platform, title, scheduled_for (ISO 8601). "
            "Link to a draft/render/channel when you have them."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "platform": {
                    "type": "string",
                    "enum": sorted(ALLOWED_PLATFORMS),
                },
                "title": {"type": "string"},
                "scheduled_for": {
                    "type": "string",
                    "description": "ISO 8601 timestamp in the future, ideally with timezone (e.g. 2026-06-01T14:30:00-03:00).",
                },
                "draft_id": {"type": "string"},
                "render_id": {"type": "string"},
                "channel_id": {"type": "string"},
                "description": {"type": "string"},
                "hashtags": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["user_id", "platform", "title", "scheduled_for"],
        },
        handler=_schedule_post,
    )
)

register(
    ToolSpec(
        name="list_scheduled_posts",
        description="List the user's scheduled / published / failed posts, optionally filtered.",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "status": {
                    "type": "string",
                    "enum": ["scheduled", "publishing", "published", "failed", "cancelled"],
                },
                "platform": {
                    "type": "string",
                    "enum": sorted(ALLOWED_PLATFORMS),
                },
                "limit": {"type": "integer", "minimum": 1, "maximum": 100, "default": 30},
            },
            "required": ["user_id"],
        },
        handler=_list_scheduled_posts,
    )
)

register(
    ToolSpec(
        name="cancel_scheduled_post",
        description="Cancel a scheduled post before it goes out.",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "scheduled_post_id": {"type": "string"},
            },
            "required": ["user_id", "scheduled_post_id"],
        },
        handler=_cancel_scheduled_post,
    )
)
