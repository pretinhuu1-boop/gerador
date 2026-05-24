"""YouTube-related tools exposed to agents."""
from __future__ import annotations

from typing import Any

from ..connectors.youtube import list_recent_videos, resolve_channel
from . import ToolSpec, register


async def _fetch_youtube_channel(query: str, fetch_videos: bool = True, max_videos: int = 12) -> dict[str, Any]:
    channel = await resolve_channel(query)
    videos: list[dict[str, Any]] = []
    if fetch_videos:
        videos = await list_recent_videos(channel, max_n=max_videos)
    return {
        "channel": {
            "id": channel["id"],
            "title": channel["snippet"]["title"],
            "handle": channel["snippet"].get("customUrl"),
            "description": (channel["snippet"].get("description") or "")[:500],
            "country": channel["snippet"].get("country"),
            "language": channel["snippet"].get("defaultLanguage"),
            "subscriber_count": int(channel["statistics"].get("subscriberCount") or 0),
            "view_count": int(channel["statistics"].get("viewCount") or 0),
            "video_count": int(channel["statistics"].get("videoCount") or 0),
            "topics": (channel.get("topicDetails") or {}).get("topicCategories") or [],
            "keywords": (channel.get("brandingSettings", {}).get("channel") or {}).get("keywords"),
            "thumbnail_url": (
                channel["snippet"]["thumbnails"].get("high")
                or channel["snippet"]["thumbnails"].get("default")
                or {}
            ).get("url"),
        },
        "videos": [
            {
                "id": v["id"],
                "title": v["snippet"]["title"],
                "published_at": v["snippet"]["publishedAt"],
                "view_count": int(v.get("statistics", {}).get("viewCount") or 0),
                "like_count": int(v.get("statistics", {}).get("likeCount") or 0),
                "comment_count": int(v.get("statistics", {}).get("commentCount") or 0),
                "duration": (v.get("contentDetails") or {}).get("duration"),
            }
            for v in videos
        ],
    }


register(
    ToolSpec(
        name="fetch_youtube_channel",
        description=(
            "Resolve and fetch a YouTube channel by @handle, channel URL, UC-ID or free-form name. "
            "Returns channel statistics plus the most recent N uploads with view/like/comment counts. "
            "Use this whenever the user asks to look up, audit, analyze, or compare a YouTube channel."
        ),
        parameters={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Channel handle (@name), URL, UC-ID, or descriptive name.",
                },
                "fetch_videos": {
                    "type": "boolean",
                    "description": "Whether to also pull recent uploads (default true).",
                    "default": True,
                },
                "max_videos": {
                    "type": "integer",
                    "description": "Max uploads to fetch (default 12, hard cap 30).",
                    "minimum": 1,
                    "maximum": 30,
                    "default": 12,
                },
            },
            "required": ["query"],
        },
        handler=_fetch_youtube_channel,
    )
)
