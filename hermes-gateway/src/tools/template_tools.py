"""Video template tools — list/recommend Remotion compositions registered locally.

The actual registry lives in `src/templates/__init__.py` (REGISTRY: list[TemplateDescriptor]).
This module exposes 2 tools to LLM agents:
  - list_video_templates(): full catalog with metadata
  - recommend_template(brief): top-3 templates ranked by tag/keyword match to a brief

For semantic recall of the broader Remotion ecosystem (community templates,
libraries, skills, workflows from data/remotion_catalog.ts), agents use
recall_knowledge(query, kind='remotion_template' | 'remotion_library' | ...).
"""
from __future__ import annotations

import logging
import re
from typing import Any

from ..templates import REGISTRY, get_template
from . import ToolSpec, register

log = logging.getLogger(__name__)

STOPWORDS = {
    "de", "da", "do", "para", "pra", "com", "sem", "que", "um", "uma", "uns", "umas",
    "o", "a", "os", "as", "no", "na", "nos", "nas", "em", "ao", "à", "às", "aos",
    "e", "ou", "mas", "se", "por", "como", "the", "of", "for", "with", "to", "is",
    "vídeo", "video", "short", "shorts", "reel", "reels", "tiktok", "channel",
}


def _tokens(text: str) -> set[str]:
    toks = re.findall(r"[a-z0-9áéíóúâêôãõç]+", (text or "").lower())
    return {t for t in toks if t not in STOPWORDS and len(t) >= 3}


async def _list_video_templates(user_id: str) -> dict[str, Any]:
    """Returns the full template registry (id, label, format, recommended_for,
    description, example_briefs). Use ONCE per session/task when you need to
    know what's available before recommending or picking one."""
    return {
        "templates": [t.to_dict() for t in REGISTRY],
        "count": len(REGISTRY),
    }


async def _recommend_template(
    user_id: str,
    brief: str,
    top_k: int = 3,
) -> dict[str, Any]:
    """Score every template against the brief by token overlap with
    `recommended_for` + `description` + `example_briefs`. Returns top_k
    candidates each with a 0..1 score and the reason it scored."""
    if not brief or not brief.strip():
        return {"error": "brief is required"}
    top_k = max(1, min(len(REGISTRY), int(top_k)))

    brief_tokens = _tokens(brief)
    if not brief_tokens:
        return {"error": "brief is too short / only stopwords"}

    scored: list[tuple[float, dict[str, Any], list[str]]] = []
    for t in REGISTRY:
        haystack = " ".join(
            [
                " ".join(t.recommended_for),
                t.description,
                " ".join(t.example_briefs),
                t.label,
            ]
        )
        haystack_tokens = _tokens(haystack)
        matches = brief_tokens & haystack_tokens
        if not matches:
            continue
        score = len(matches) / max(1, len(brief_tokens))
        scored.append((score, t.to_dict(), sorted(matches)))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:top_k]

    return {
        "brief": brief,
        "recommendations": [
            {
                "template": t,
                "score": round(score, 3),
                "matched_tokens": matched,
                "why": (
                    f"{len(matched)} tokens do brief batem com recommended_for/description/example: "
                    + ", ".join(matched[:6])
                ),
            }
            for score, t, matched in top
        ],
        "total_scanned": len(REGISTRY),
        "fallback": (
            "Se nenhum bater bem (score < 0.2), use 'StoriesVertical' como default — "
            "ele cobre Shorts/Reels faceless genéricos."
            if not top or top[0][0] < 0.2
            else None
        ),
    }


async def _describe_template(user_id: str, template_id: str) -> dict[str, Any]:
    t = get_template(template_id)
    if not t:
        return {"error": f"unknown template_id {template_id!r}", "available": [x.id for x in REGISTRY]}
    return t.to_dict()


register(
    ToolSpec(
        name="list_video_templates",
        description=(
            "Lista todos os Remotion templates registrados localmente no Channel OS (Stories"
            "Vertical, RedditStories, TopList, Audiogram). Cada item traz id, formato, "
            "recommended_for, descrição e example_briefs. Chame ANTES de recomendar template "
            "se o user perguntar 'que opções tem?' ou se você precisa explorar o catálogo."
        ),
        parameters={
            "type": "object",
            "properties": {"user_id": {"type": "string"}},
            "required": ["user_id"],
        },
        handler=_list_video_templates,
    )
)

register(
    ToolSpec(
        name="recommend_template",
        description=(
            "Recomenda os melhores 1-3 templates Remotion (locais) pra um brief específico. "
            "Use sempre que o user pedir vídeo/short/reel novo — antes de gerar o roteiro chama "
            "isso pra escolher o formato certo. Devolve score 0..1, tokens que bateram e "
            "fallback sugerido se nenhum tiver score > 0.2. Pra explorar Remotion templates "
            "DA COMUNIDADE (não locais), use recall_knowledge(query, kind='remotion_template')."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "brief": {
                    "type": "string",
                    "description": "Descrição do conteúdo. Ex: 'short de top 5 conspirações reais' ou 'ASMR sleep story sobre uma cabana isolada'.",
                },
                "top_k": {"type": "integer", "minimum": 1, "maximum": 6, "default": 3},
            },
            "required": ["user_id", "brief"],
        },
        handler=_recommend_template,
    )
)

register(
    ToolSpec(
        name="describe_template",
        description=(
            "Retorna a descrição completa de UM template local pelo id "
            "(StoriesVertical/RedditStories/TopList/Audiogram). Use depois de recommend_template "
            "se precisar ver props_schema/defaults antes de chamar render."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "template_id": {
                    "type": "string",
                    "enum": [t.id for t in REGISTRY],
                },
            },
            "required": ["user_id", "template_id"],
        },
        handler=_describe_template,
    )
)
