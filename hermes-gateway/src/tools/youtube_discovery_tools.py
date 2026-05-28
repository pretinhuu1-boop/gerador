"""Smart YouTube discovery tools — Scout/Content can find competitors,
extract winning script structure from top videos, and sample audience
sentiment from top comments.
"""
from __future__ import annotations

import logging
from typing import Any

from ..connectors import gemini, youtube
from . import ToolSpec, register

log = logging.getLogger(__name__)


# -------- discover_youtube_channels ----------------------------------

async def _discover_youtube_channels(
    user_id: str,
    query: str,
    region: str | None = None,
    language: str | None = None,
    min_subscribers: int = 0,
    max_subscribers: int | None = None,
    max_results: int = 12,
    order: str = "relevance",
) -> dict[str, Any]:
    """search.list → filter by sub band → bulk_resolve to get stats. Returns
    a curated list ready for the Scout UI to triage. ~100 quota units."""
    try:
        search_results = await youtube.search_channels(
            query=query,
            region=region,
            relevance_language=language,
            max_results=min(50, max_results * 2),  # over-fetch to allow band filter
            order=order,
        )
    except youtube.YouTubeError as e:
        return {"error": str(e)}

    channel_ids = [s["channel_id"] for s in search_results if s.get("channel_id")]
    if not channel_ids:
        return {"channels": [], "query": query, "region": region}

    try:
        full = await youtube.bulk_resolve_channels(channel_ids)
    except youtube.YouTubeError as e:
        return {"error": str(e)}

    out: list[dict[str, Any]] = []
    for c in full:
        subs = int((c.get("statistics") or {}).get("subscriberCount") or 0)
        if subs < min_subscribers:
            continue
        if max_subscribers is not None and subs > max_subscribers:
            continue
        sn = c.get("snippet") or {}
        st = c.get("statistics") or {}
        out.append(
            {
                "channel_id": c.get("id"),
                "title": sn.get("title"),
                "handle": sn.get("customUrl"),
                "description": (sn.get("description") or "")[:240],
                "country": sn.get("country"),
                "language": sn.get("defaultLanguage"),
                "subscriber_count": subs,
                "view_count": int(st.get("viewCount") or 0),
                "video_count": int(st.get("videoCount") or 0),
                "thumbnail_url": (
                    (sn.get("thumbnails", {}).get("high") or sn.get("thumbnails", {}).get("default") or {}).get("url")
                ),
                "topics": (c.get("topicDetails") or {}).get("topicCategories") or [],
            }
        )
        if len(out) >= max_results:
            break

    out.sort(key=lambda c: c["subscriber_count"], reverse=True)
    return {"channels": out, "query": query, "region": region, "count": len(out)}


register(
    ToolSpec(
        name="discover_youtube_channels",
        description=(
            "Search YouTube for channels matching a niche/topic, optionally filtered by region, "
            "language, and subscriber band. Returns a curated list with subs/views/video counts. "
            "Use when the user wants to FIND NEW channels in a niche (vs. resolving a known handle). "
            "Costs ~100 YouTube quota units per call — be deliberate."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "query": {
                    "type": "string",
                    "description": "Niche / topic / keyword (e.g. 'mistério histórico', 'finance shorts BR').",
                },
                "region": {
                    "type": "string",
                    "description": "ISO 3166-1 alpha-2 (BR, US, GB, ...). Optional.",
                },
                "language": {
                    "type": "string",
                    "description": "ISO 639-1 language code (pt, en, es, ...). Optional.",
                },
                "min_subscribers": {"type": "integer", "minimum": 0, "default": 0},
                "max_subscribers": {"type": "integer", "minimum": 0},
                "max_results": {"type": "integer", "minimum": 1, "maximum": 25, "default": 12},
                "order": {
                    "type": "string",
                    "enum": ["relevance", "viewCount", "rating", "videoCount", "date"],
                    "default": "relevance",
                },
            },
            "required": ["user_id", "query"],
        },
        handler=_discover_youtube_channels,
    )
)


# -------- extract_video_blueprint ------------------------------------

BLUEPRINT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "hook": {"type": "string", "description": "Opening sentence (~3s) that hooks viewers."},
        "thesis": {"type": "string", "description": "Central argument in 1-2 sentences."},
        "structure": {
            "type": "string",
            "description": "Named template: top-N, history, conspiracy, listicle, narrative, tutorial, etc.",
        },
        "beats": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "t": {"type": "number", "description": "Approx start second."},
                    "summary": {"type": "string", "description": "Short summary of the beat."},
                    "purpose": {
                        "type": "string",
                        "description": "Why this beat exists (hook recall, payoff, tension, CTA).",
                    },
                },
                "required": ["summary", "purpose"],
            },
        },
        "cta": {"type": "string"},
        "hashtags": {"type": "array", "items": {"type": "string"}},
        "tone": {"type": "string"},
        "duration_estimate_s": {"type": "number"},
    },
    "required": ["hook", "thesis", "structure", "beats"],
}


async def _extract_video_blueprint(
    user_id: str,
    video_id: str,
    transcript_lang: str = "pt",
) -> dict[str, Any]:
    """1) Fetch video metadata (title/desc/duration). 2) Try to fetch transcript
    via public timedtext endpoint (auto-generated captions). 3) Send to Gemini
    Flash with structured JSON schema. Returns a clonable blueprint."""
    video = await youtube.fetch_video(video_id)
    if not video:
        return {"error": f"video {video_id!r} not found"}

    title = (video.get("snippet") or {}).get("title", "")
    description = (video.get("snippet") or {}).get("description", "")[:1500]
    duration = (video.get("contentDetails") or {}).get("duration", "")

    transcript = await youtube.fetch_timedtext(video_id, lang=transcript_lang) or ""

    prompt = f"""Você é um diretor de conteúdo faceless. Analise este vídeo do YouTube e produza um BLUEPRINT estruturado que sirva pra clonar a estrutura num vídeo novo.

TÍTULO: {title}
DURAÇÃO ISO 8601: {duration}
DESCRIÇÃO: {description}

TRANSCRIÇÃO (auto-gerada, pode ter erros):
{transcript[:6000] if transcript else '(transcrição não disponível — extraia o que puder da descrição/título)'}

Devolva um JSON com:
- hook: a frase de abertura (~3 segundos)
- thesis: argumento central em 1-2 frases
- structure: nome do template (top-N, history, conspiracy, listicle, narrative, tutorial...)
- beats[]: array com {{t, summary, purpose}} pra cada cena/ponto
- cta: chamada final
- hashtags[]: 5-8 hashtags relevantes (sem #)
- tone: descreva o tom em 1 palavra
- duration_estimate_s: duração estimada em segundos"""

    try:
        result = await gemini.generate_structured(
            prompt=prompt,
            response_schema=BLUEPRINT_SCHEMA,
            model="gemini-2.5-flash",
            temperature=0.35,
        )
    except gemini.GeminiError as e:
        return {"error": f"Gemini failed: {e}"}

    return {
        "video_id": video_id,
        "title": title,
        "transcript_available": bool(transcript),
        "transcript_chars": len(transcript),
        "blueprint": result,
    }


register(
    ToolSpec(
        name="extract_video_blueprint",
        description=(
            "Reverse-engineer the script structure of a YouTube video — fetches metadata + "
            "auto-generated transcript, then asks Gemini Flash (with JSON schema enforcement) "
            "to extract {hook, thesis, structure, beats[], cta, hashtags, tone}. Use when the user "
            "wants to clone a winning competitor's video structure before writing a fresh script."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "video_id": {
                    "type": "string",
                    "description": "YouTube video ID (the 11-char string after watch?v=).",
                },
                "transcript_lang": {"type": "string", "default": "pt"},
            },
            "required": ["user_id", "video_id"],
        },
        handler=_extract_video_blueprint,
    )
)


# -------- read_top_comments ------------------------------------------

COMMENTS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "overall_sentiment": {
            "type": "string",
            "enum": ["very_positive", "positive", "mixed", "negative", "very_negative"],
        },
        "audience_themes": {
            "type": "array",
            "items": {"type": "string"},
            "description": "3-5 recurring themes in the audience's reaction.",
        },
        "top_hooks": {
            "type": "array",
            "items": {"type": "string"},
            "description": "3-5 phrases/angles the audience already loves — use as hook material for a clone.",
        },
        "pain_points": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Things the audience complains about or asks for.",
        },
        "tone_recommendation": {
            "type": "string",
            "description": "Tone of voice that matches this audience.",
        },
    },
    "required": ["overall_sentiment", "audience_themes", "top_hooks"],
}


async def _read_top_comments(
    user_id: str,
    video_id: str,
    max_comments: int = 20,
) -> dict[str, Any]:
    """commentThreads.list → sample → Gemini Flash structured summary."""
    try:
        comments = await youtube.list_top_comments(video_id, max_results=max_comments)
    except youtube.YouTubeError as e:
        return {"error": str(e)}

    if not comments:
        return {"summary": None, "comments_sampled": 0, "note": "no comments available"}

    formatted = "\n".join(
        f"[{c['likes']}♥] {c['author']}: {c['text'][:300]}" for c in comments[:max_comments]
    )

    prompt = f"""Analise estes top comentários de um vídeo do YouTube e devolva insight estruturado:

{formatted}

Devolva JSON com:
- overall_sentiment: very_positive | positive | mixed | negative | very_negative
- audience_themes: 3-5 padrões recorrentes na reação
- top_hooks: 3-5 frases/ângulos que a audiência já curte (use como material pra hooks de clone)
- pain_points: o que a audiência reclama ou pede
- tone_recommendation: o tom de voz que combina com essa audiência"""

    try:
        result = await gemini.generate_structured(
            prompt=prompt,
            response_schema=COMMENTS_SCHEMA,
            model="gemini-2.5-flash",
            temperature=0.4,
        )
    except gemini.GeminiError as e:
        return {"error": f"Gemini failed: {e}", "comments_sampled": len(comments)}

    return {
        "video_id": video_id,
        "comments_sampled": len(comments),
        "summary": result,
        "raw_top_3": [
            {"author": c["author"], "text": c["text"][:200], "likes": c["likes"]}
            for c in comments[:3]
        ],
    }


register(
    ToolSpec(
        name="read_top_comments",
        description=(
            "Sample top comments of a YouTube video and summarize audience sentiment + "
            "recurring themes + ready-to-use hooks + pain points + recommended tone. "
            "Use to understand WHO the competitor's audience is and WHAT they react to."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "video_id": {"type": "string"},
                "max_comments": {
                    "type": "integer",
                    "minimum": 5,
                    "maximum": 100,
                    "default": 20,
                },
            },
            "required": ["user_id", "video_id"],
        },
        handler=_read_top_comments,
    )
)
