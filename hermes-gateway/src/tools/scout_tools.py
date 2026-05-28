"""Scout-specific tools: scoring + persistence in Supabase."""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from ..connectors.supabase_client import supabase_admin
from ..connectors.youtube import list_recent_videos, resolve_channel
from . import ToolSpec, register


def _clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def _parse_iso_duration(iso: str | None) -> int:
    if not iso:
        return 0
    import re

    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso)
    if not m:
        return 0
    h, mn, s = (int(g) if g else 0 for g in m.groups())
    return h * 3600 + mn * 60 + s


def _score(channel: dict[str, Any], videos: list[dict[str, Any]]) -> dict[str, Any]:
    stats = channel["statistics"]
    subs = int(stats.get("subscriberCount") or 0)
    views_total = int(stats.get("viewCount") or 0)
    video_count = int(stats.get("videoCount") or 0)

    # Engagement (likes + comments) / views, averaged
    eng_rate = 0.0
    counted = 0
    for v in videos:
        vs = v.get("statistics") or {}
        vc = int(vs.get("viewCount") or 0)
        if vc < 100:
            continue
        eng_rate += (int(vs.get("likeCount") or 0) + int(vs.get("commentCount") or 0)) / vc
        counted += 1
    avg_eng = eng_rate / counted if counted else 0.0
    eng_score = _clamp(math.log10(1 + avg_eng * 200) / math.log10(1 + 200 * 0.05)) if avg_eng else 0

    # Consistency: videos per week
    cadence = 0.0
    cons_score = 0.0
    if len(videos) >= 3:
        dates = sorted(
            (datetime.fromisoformat(v["snippet"]["publishedAt"].replace("Z", "+00:00")) for v in videos),
            reverse=True,
        )
        span_days = max(1, (dates[0] - dates[-1]).total_seconds() / 86400)
        cadence = (len(videos) / span_days) * 7
        if cadence < 0.5:
            cons_score = cadence / 0.5 * 0.4
        elif cadence <= 4:
            cons_score = 0.4 + ((cadence - 0.5) / 3.5) * 0.6
        else:
            cons_score = max(0.5, 1 - (cadence - 4) / 10)

    # Growth proxy
    views_per_sub = views_total / max(1, subs)
    growth_value = _clamp(math.log10(1 + views_per_sub) / math.log10(101))
    volume_mod = _clamp(min(1.0, video_count / 20))
    growth_score = _clamp(growth_value * 0.7 + volume_mod * 0.3)

    # Competition gap
    view_list = sorted(
        (int((v.get("statistics") or {}).get("viewCount") or 0) for v in videos), reverse=True
    )
    if len(view_list) < 3:
        gap_score = 0.4
        gap_ratio = 1.0
    else:
        top = view_list[0]
        median = view_list[len(view_list) // 2] or 1
        gap_ratio = top / median
        if gap_ratio < 2:
            gap_score = 0.3
        elif gap_ratio <= 10:
            gap_score = 0.4 + ((gap_ratio - 2) / 8) * 0.6
        else:
            gap_score = max(0.5, 1 - (gap_ratio - 10) / 40)

    # Monetization
    avg_dur = (
        sum(_parse_iso_duration((v.get("contentDetails") or {}).get("duration")) for v in videos)
        / max(1, len(videos))
    )
    mon_score = _clamp(min(1.0, subs / 1000) * 0.5 + min(1.0, avg_dur / 480) * 0.5)

    # Recency dampener
    recency = 0.3
    if videos:
        newest_iso = max(v["snippet"]["publishedAt"] for v in videos)
        newest = datetime.fromisoformat(newest_iso.replace("Z", "+00:00"))
        weeks = max(0, (datetime.now(timezone.utc) - newest).days / 7)
        recency = 0.5 ** (weeks / 8)

    weighted = (
        growth_score * 0.28
        + eng_score * 0.22
        + cons_score * 0.18
        + gap_score * 0.16
        + mon_score * 0.16
    )
    adjusted = weighted * (0.6 + 0.4 * recency)
    total = round(_clamp(adjusted) * 100, 2)

    return {
        "total": total,
        "breakdown": {
            "growth": round(growth_score * 100),
            "engagement": round(eng_score * 100),
            "consistency": round(cons_score * 100),
            "monetization_potential": round(mon_score * 100),
            "competition_gap": round(gap_score * 100),
        },
        "signals": {
            "engagement_rate": avg_eng,
            "weekly_cadence": cadence,
            "views_per_subscriber": views_per_sub,
            "top_performer_ratio": gap_ratio,
        },
    }


async def _scout_youtube_channel(user_id: str, query: str) -> dict[str, Any]:
    """Resolve a channel via YouTube API, score it heuristically, persist to Supabase."""
    raw = await resolve_channel(query)
    videos = await list_recent_videos(raw, max_n=15)
    score = _score(raw, videos)

    sb = supabase_admin()
    sn = raw["snippet"]
    stats = raw["statistics"]

    payload = {
        "user_id": user_id,
        "platform": "youtube",
        "platform_id": raw["id"],
        "handle": sn.get("customUrl"),
        "title": sn["title"],
        "description": sn.get("description", "")[:2000],
        "thumbnail_url": (sn["thumbnails"].get("high") or sn["thumbnails"].get("default") or {}).get("url"),
        "country": sn.get("country"),
        "language": sn.get("defaultLanguage"),
        "subscriber_count": int(stats.get("subscriberCount") or 0),
        "view_count": int(stats.get("viewCount") or 0),
        "video_count": int(stats.get("videoCount") or 0),
        "score": score["total"],
        "score_breakdown": score["breakdown"],
        "last_fetched_at": datetime.now(timezone.utc).isoformat(),
        "status": "tracking",
    }

    sb.table("channels").upsert(payload, on_conflict="user_id,platform,platform_id").execute()
    inserted = (
        sb.table("channels")
        .select("id")
        .eq("user_id", user_id)
        .eq("platform", "youtube")
        .eq("platform_id", raw["id"])
        .single()
        .execute()
    )
    channel_id = inserted.data["id"]

    sb.table("channel_metrics").insert(
        {
            "channel_id": channel_id,
            "subscriber_count": payload["subscriber_count"],
            "view_count": payload["view_count"],
            "video_count": payload["video_count"],
            "score": score["total"],
            "extra": {"signals": score["signals"]},
        }
    ).execute()

    return {
        "channel_id": channel_id,
        "title": raw["snippet"]["title"],
        "score": score["total"],
        "breakdown": score["breakdown"],
        "signals": score["signals"],
        "subscriber_count": payload["subscriber_count"],
        "video_count": payload["video_count"],
    }


register(
    ToolSpec(
        name="scout_youtube_channel",
        description=(
            "End-to-end Scout pass on a YouTube channel: resolve → fetch recent videos → "
            "compute heuristic score (growth, engagement, consistency, monetization, gap) → "
            "persist the channel + metric snapshot in Supabase for the user. "
            "Use this when the user wants to ADD or ANALYZE a channel they want tracked."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "UUID of the requesting user (auth.uid from JWT).",
                },
                "query": {
                    "type": "string",
                    "description": "Channel handle (@name), URL, UC-ID, or descriptive name.",
                },
            },
            "required": ["user_id", "query"],
        },
        handler=_scout_youtube_channel,
    )
)
