"""Trending feed tools — cached YouTube most-popular per (region, category).

Caching strategy: store the normalized list in `trending_snapshots` table
with an `expires_at` 4h ahead. On every call:
  1. Check for a non-expired row matching (region, category).
  2. If present → return cached.
  3. If absent or expired → call YouTube videos.list (1 quota unit), insert
     a new row, return fresh.

This keeps the Scout/ContentAgent agents responsive AND keeps quota usage
low (10k/day default, this tool costs 1/call regardless of caller count).
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from ..config import get_settings
from ..connectors import youtube
from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)

CACHE_TTL_HOURS = 4
DEFAULT_REGION = "BR"


def _normalize_video(item: dict[str, Any]) -> dict[str, Any]:
    """Strip YouTube's verbose payload to the fields the model actually needs."""
    snip = item.get("snippet") or {}
    stats = item.get("statistics") or {}
    content = item.get("contentDetails") or {}
    return {
        "video_id": item.get("id"),
        "title": snip.get("title"),
        "channel_id": snip.get("channelId"),
        "channel_title": snip.get("channelTitle"),
        "published_at": snip.get("publishedAt"),
        "category_id": snip.get("categoryId"),
        "tags": (snip.get("tags") or [])[:8],
        "thumbnail": (snip.get("thumbnails") or {}).get("high", {}).get("url"),
        "duration_iso": content.get("duration"),
        "views": int(stats.get("viewCount") or 0),
        "likes": int(stats.get("likeCount") or 0),
        "comments": int(stats.get("commentCount") or 0),
    }


async def _fetch_trending(
    user_id: str,
    region: str = DEFAULT_REGION,
    category_id: str | None = None,
    max_results: int = 25,
    force_refresh: bool = False,
) -> dict[str, Any]:
    s = get_settings()
    if not s.youtube_api_key:
        return {"error": "YOUTUBE_API_KEY not configured"}

    region = (region or DEFAULT_REGION).upper()
    max_results = max(1, min(50, int(max_results)))
    sb = supabase_admin()

    # Look up cache row first.
    if not force_refresh:
        q = (
            sb.table("trending_snapshots")
            .select("id, videos, fetched_at, expires_at")
            .eq("region_code", region)
            .order("fetched_at", desc=True)
            .limit(1)
        )
        if category_id:
            q = q.eq("category_id", category_id)
        else:
            q = q.is_("category_id", "null")
        cached = q.execute()
        rows = cached.data or []
        if rows:
            row = rows[0]
            try:
                exp = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
            except Exception:  # noqa: BLE001
                exp = datetime.now(timezone.utc)
            if exp > datetime.now(timezone.utc):
                videos = (row.get("videos") or [])[:max_results]
                return {
                    "region": region,
                    "category_id": category_id,
                    "videos": videos,
                    "count": len(videos),
                    "fetched_at": row["fetched_at"],
                    "expires_at": row["expires_at"],
                    "source": "cache",
                }

    # Cache miss / expired → fetch from YouTube + persist.
    try:
        raw = await youtube.list_trending(
            region=region, category_id=category_id, max_results=max_results
        )
    except Exception as e:  # noqa: BLE001
        log.exception("youtube list_trending failed")
        return {"error": f"YouTube fetch failed: {e}"}

    videos = [_normalize_video(it) for it in raw]
    try:
        sb.table("trending_snapshots").insert(
            {
                "region_code": region,
                "category_id": category_id,
                "videos": videos,
            }
        ).execute()
    except Exception as e:  # noqa: BLE001
        log.warning("trending cache write failed: %s", e)

    return {
        "region": region,
        "category_id": category_id,
        "videos": videos,
        "count": len(videos),
        "source": "fresh",
    }


register(
    ToolSpec(
        name="fetch_trending",
        description=(
            "Fetch YouTube's trending feed (videos.list chart=mostPopular) for a region+category, "
            "cached 4h to stay quota-cheap. Use sempre que o user perguntar 'o que tá bombando "
            "hoje?', precisar de contexto pra brainstorm de tópicos, ou quiser comparar canais "
            "rastreados contra o que está tracionando agora. Categories YouTube comuns: 1=Film, "
            "10=Music, 17=Sports, 20=Gaming, 22=People, 23=Comedy, 24=Entertainment, 25=News, "
            "26=Howto, 27=Education, 28=Science. Omite category_id pra geral."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "region": {
                    "type": "string",
                    "description": "ISO 3166-1 alpha-2 (BR, US, PT, etc). Default BR.",
                    "default": "BR",
                },
                "category_id": {
                    "type": "string",
                    "description": "YouTube category id (24=Entertainment, 22=People etc). Omita pra geral.",
                },
                "max_results": {"type": "integer", "minimum": 1, "maximum": 50, "default": 25},
                "force_refresh": {
                    "type": "boolean",
                    "default": False,
                    "description": "Bypass cache. Use só se o user explicitamente pedir dados atuais.",
                },
            },
            "required": ["user_id"],
        },
        handler=_fetch_trending,
    )
)
