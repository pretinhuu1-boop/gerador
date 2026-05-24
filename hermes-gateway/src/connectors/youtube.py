"""YouTube Data API v3 wrapper (server side — uses YOUTUBE_API_KEY)."""
from __future__ import annotations

import logging
from typing import Any

import httpx

from ..config import get_settings

log = logging.getLogger(__name__)

API = "https://www.googleapis.com/youtube/v3"


class YouTubeError(RuntimeError):
    pass


async def _call(client: httpx.AsyncClient, path: str, params: dict[str, str]) -> dict[str, Any]:
    s = get_settings()
    if not s.youtube_api_key:
        raise YouTubeError("YOUTUBE_API_KEY missing")
    r = await client.get(f"{API}/{path}", params={**params, "key": s.youtube_api_key})
    if r.status_code >= 400:
        raise YouTubeError(f"YouTube {r.status_code}: {r.text[:300]}")
    return r.json()


async def resolve_channel(query: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        q = query.strip()
        if q.startswith("UC") and len(q) >= 22:
            data = await _call(
                client,
                "channels",
                {
                    "part": "snippet,statistics,contentDetails,topicDetails,brandingSettings",
                    "id": q,
                },
            )
        elif q.startswith("@"):
            data = await _call(
                client,
                "channels",
                {
                    "part": "snippet,statistics,contentDetails,topicDetails,brandingSettings",
                    "forHandle": q,
                },
            )
        else:
            search = await _call(
                client,
                "search",
                {"part": "snippet", "q": q, "type": "channel", "maxResults": "1"},
            )
            items = search.get("items") or []
            if not items:
                raise YouTubeError(f"no channel found for {q!r}")
            channel_id = items[0]["id"]["channelId"]
            data = await _call(
                client,
                "channels",
                {
                    "part": "snippet,statistics,contentDetails,topicDetails,brandingSettings",
                    "id": channel_id,
                },
            )

        items = data.get("items") or []
        if not items:
            raise YouTubeError(f"channel not resolvable for {q!r}")
        return items[0]


async def list_recent_videos(channel: dict[str, Any], max_n: int = 12) -> list[dict[str, Any]]:
    uploads = (channel.get("contentDetails", {}).get("relatedPlaylists", {}) or {}).get("uploads")
    if not uploads:
        return []
    async with httpx.AsyncClient(timeout=30.0) as client:
        pl = await _call(
            client,
            "playlistItems",
            {"part": "contentDetails", "playlistId": uploads, "maxResults": str(max_n)},
        )
        ids = ",".join(it["contentDetails"]["videoId"] for it in pl.get("items", []))
        if not ids:
            return []
        videos = await _call(
            client,
            "videos",
            {"part": "snippet,statistics,contentDetails", "id": ids},
        )
        return videos.get("items", [])
