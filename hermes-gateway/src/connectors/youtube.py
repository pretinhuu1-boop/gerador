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


async def search_channels(
    query: str,
    *,
    region: str | None = None,
    relevance_language: str | None = None,
    max_results: int = 15,
    order: str = "relevance",
) -> list[dict[str, Any]]:
    """search.list with type=channel + filters. Each item is a search snippet
    (channel_id + title + description + thumbnail). Caller can resolve full
    stats via `videos.list` or our `resolve_channel` for top hits.

    Costs 100 quota units per call — be deliberate.
    """
    params: dict[str, str] = {
        "part": "snippet",
        "q": query,
        "type": "channel",
        "maxResults": str(max(1, min(50, int(max_results)))),
        "order": order,  # relevance | viewCount | rating | title | videoCount | date
    }
    if region:
        params["regionCode"] = region.upper()
    if relevance_language:
        params["relevanceLanguage"] = relevance_language
    async with httpx.AsyncClient(timeout=30.0) as client:
        data = await _call(client, "search", params)
    items = data.get("items") or []
    return [
        {
            "channel_id": (it.get("id") or {}).get("channelId"),
            "title": (it.get("snippet") or {}).get("title"),
            "description": (it.get("snippet") or {}).get("description"),
            "published_at": (it.get("snippet") or {}).get("publishedAt"),
            "thumbnail_url": ((it.get("snippet") or {}).get("thumbnails", {}).get("high")
                              or (it.get("snippet") or {}).get("thumbnails", {}).get("default")
                              or {}).get("url"),
        }
        for it in items
        if (it.get("id") or {}).get("channelId")
    ]


async def bulk_resolve_channels(channel_ids: list[str]) -> list[dict[str, Any]]:
    """videos.list-style bulk fetch of channel stats. Max 50 ids per call."""
    if not channel_ids:
        return []
    async with httpx.AsyncClient(timeout=30.0) as client:
        out: list[dict[str, Any]] = []
        for i in range(0, len(channel_ids), 50):
            batch = ",".join(channel_ids[i : i + 50])
            data = await _call(
                client,
                "channels",
                {
                    "part": "snippet,statistics,contentDetails,topicDetails",
                    "id": batch,
                },
            )
            out.extend(data.get("items", []))
        return out


async def list_trending(
    region: str = "BR",
    category_id: str | None = None,
    max_results: int = 25,
) -> list[dict[str, Any]]:
    """videos.list with chart=mostPopular. 1 quota unit per call (very cheap)."""
    params: dict[str, str] = {
        "part": "snippet,statistics,contentDetails",
        "chart": "mostPopular",
        "regionCode": region.upper(),
        "maxResults": str(max(1, min(50, int(max_results)))),
    }
    if category_id:
        params["videoCategoryId"] = category_id
    async with httpx.AsyncClient(timeout=30.0) as client:
        data = await _call(client, "videos", params)
    return data.get("items", [])


async def fetch_video(video_id: str) -> dict[str, Any] | None:
    async with httpx.AsyncClient(timeout=20.0) as client:
        data = await _call(
            client,
            "videos",
            {"part": "snippet,statistics,contentDetails", "id": video_id},
        )
    items = data.get("items") or []
    return items[0] if items else None


async def list_top_comments(video_id: str, max_results: int = 20) -> list[dict[str, Any]]:
    """commentThreads.list ordered by relevance. 1 quota unit per call."""
    params = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": str(max(1, min(100, int(max_results)))),
        "order": "relevance",
        "textFormat": "plainText",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        data = await _call(client, "commentThreads", params)
    out = []
    for it in data.get("items", []) or []:
        snip = ((it.get("snippet") or {}).get("topLevelComment") or {}).get("snippet") or {}
        if not snip:
            continue
        out.append(
            {
                "author": snip.get("authorDisplayName"),
                "text": snip.get("textDisplay"),
                "likes": int(snip.get("likeCount") or 0),
                "published_at": snip.get("publishedAt"),
            }
        )
    return out


async def list_caption_tracks(video_id: str) -> list[dict[str, Any]]:
    """captions.list — returns track metadata (id + language). Downloading
    the actual subtitle file requires OAuth, so we surface the metadata only
    and rely on the auto-generated transcript via a separate path when needed.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            data = await _call(client, "captions", {"part": "snippet", "videoId": video_id})
        except YouTubeError:
            return []
    return [
        {
            "id": (it.get("id")),
            "language": (it.get("snippet") or {}).get("language"),
            "name": (it.get("snippet") or {}).get("name"),
            "is_auto": (it.get("snippet") or {}).get("trackKind") == "ASR",
        }
        for it in data.get("items", []) or []
    ]


async def fetch_timedtext(video_id: str, lang: str = "pt") -> str | None:
    """Fallback transcript via the public timedtext endpoint (no auth, no quota
    against YouTube Data API). Tries the requested language first, falls back
    to English, then to auto-generated. Returns plain text or None on miss."""
    async with httpx.AsyncClient(timeout=20.0) as client:
        for try_lang, kind in [(lang, ""), (lang, "asr"), ("en", ""), ("en", "asr")]:
            params: dict[str, str] = {"v": video_id, "lang": try_lang, "fmt": "json3"}
            if kind:
                params["kind"] = kind
            try:
                r = await client.get(
                    "https://www.youtube.com/api/timedtext",
                    params=params,
                )
            except httpx.TransportError:
                continue
            if r.status_code != 200 or not r.text.strip():
                continue
            try:
                data = r.json()
            except Exception:  # noqa: BLE001
                continue
            events = data.get("events") or []
            lines: list[str] = []
            for ev in events:
                segs = ev.get("segs") or []
                line = "".join((s.get("utf8") or "") for s in segs).strip()
                if line:
                    lines.append(line)
            if lines:
                return "\n".join(lines)
    return None
