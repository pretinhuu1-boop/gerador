"""Creative knowledge base tools — semantic recall over hermes_knowledge.

The knowledge base is seeded from `data/*.ts` (run scripts/seed_knowledge.py).
Sub-agents (especially Content/Editor) query it to ground decisions on lens,
lighting, wardrobe, narrative, b-roll, style presets and prompt references
inherited from the legacy cinematography library.
"""
from __future__ import annotations

import logging
from typing import Any

from ..connectors import embeddings
from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)

# Surfaced in tool descriptions so the model picks the right `kind` filter.
ALLOWED_KINDS = {
    "doc",
    "meta_prompt",
    "cinema_genre",
    "style_preset",
    "environment_preset",
    "narrative_preset",
    "lens_preset",
    "b_roll_scenario",
    "vibe_preset",
    "context_modifier",
    "texture_preset",
    "prompt",
    "vfx_preset",
    # Remotion ecosystem catalog (templates / libraries / skills / workflows)
    "remotion_template",
    "remotion_library",
    "remotion_skill",
    "remotion_workflow",
}

async def _recall_knowledge(
    user_id: str,
    query: str,
    top_k: int = 5,
    kind: str | None = None,
    snippet_chars: int = 600,
) -> dict[str, Any]:
    """Semantic recall via pgvector ANN over global + user knowledge. Delegates
    ranking to the `match_hermes_knowledge` SQL function (HNSW + cosine
    distance), so result quality stays correct as the table grows past the
    point where client-side ranking was viable."""
    if not query or not query.strip():
        return {"error": "query is required"}
    top_k = max(1, min(15, int(top_k)))
    if kind and kind not in ALLOWED_KINDS:
        return {"error": f"invalid kind {kind!r}; allowed: {sorted(ALLOWED_KINDS)}"}

    try:
        qvec = await embeddings.embed_text(query, task_type="RETRIEVAL_QUERY")
    except embeddings.EmbeddingError as e:
        return {"error": f"embedding failed: {e}"}

    sb = supabase_admin()
    try:
        res = sb.rpc(
            "match_hermes_knowledge",
            {
                "query_embedding": embeddings.vector_literal(qvec),
                "match_count": top_k,
                "filter_kind": kind,
                "for_user_id": user_id,
            },
        ).execute()
    except Exception as e:  # noqa: BLE001
        log.exception("match_hermes_knowledge RPC failed")
        return {"error": f"recall failed: {e}"}

    rows: list[dict[str, Any]] = res.data or []

    def snippet(content: str) -> str:
        if len(content) <= snippet_chars:
            return content
        return content[: snippet_chars - 1].rstrip() + "…"

    return {
        "matches": [
            {
                "id": r["id"],
                "kind": r["kind"],
                "slug": r["slug"],
                "title": r["title"],
                "summary": r.get("summary") or "",
                "snippet": snippet(r["content"]),
                "metadata": r.get("metadata") or {},
                "score": round(float(r.get("similarity") or 0.0), 4),
            }
            for r in rows
        ],
        "query": query,
    }


async def _list_knowledge_kinds(user_id: str) -> dict[str, Any]:
    """Counts per kind so the model knows what's available before querying."""
    sb = supabase_admin()
    res = (
        sb.table("hermes_knowledge")
        .select("kind", count="exact")
        .eq("active", True)
        .or_(f"user_id.is.null,user_id.eq.{user_id}")
        .execute()
    )
    rows = res.data or []
    counts: dict[str, int] = {}
    for r in rows:
        counts[r["kind"]] = counts.get(r["kind"], 0) + 1
    return {
        "kinds": [{"kind": k, "count": c} for k, c in sorted(counts.items(), key=lambda kv: -kv[1])],
        "total": sum(counts.values()),
    }


async def _get_knowledge(user_id: str, kind: str, slug: str) -> dict[str, Any]:
    """Fetch the FULL content of a specific record. Use after recall_knowledge
    when the snippet isn't enough and you need the whole doc/preset."""
    if kind not in ALLOWED_KINDS:
        return {"error": f"invalid kind {kind!r}"}
    sb = supabase_admin()
    res = (
        sb.table("hermes_knowledge")
        .select("id, kind, slug, title, summary, content, metadata")
        .eq("kind", kind)
        .eq("slug", slug)
        .eq("active", True)
        .or_(f"user_id.is.null,user_id.eq.{user_id}")
        .limit(1)
        .execute()
    )
    rows = res.data or []
    if not rows:
        return {"error": f"not found: {kind}/{slug}"}
    return rows[0]


register(
    ToolSpec(
        name="recall_knowledge",
        description=(
            "Semantic search over the shared creative knowledge base. Includes: the legacy "
            "cinematography library (DRC, CME/CLAFE/CIME, RSSE, WardrobeEngine, ImageScience_4K, "
            "actor_behavior, TrapStyleGuide, style/environment/narrative/lens presets, b-roll "
            "scenarios, vibe presets, context modifiers, texture presets, prompt library, VFX), "
            "PLUS the Remotion ecosystem catalog (kinds: `remotion_template`, `remotion_library`, "
            "`remotion_skill`, `remotion_workflow`) — use these when reasoning about which "
            "composition/package/utility/pipeline to recommend for rendering a draft. Use whenever "
            "you need a concrete reference for visual style, lens choice, lighting setup, wardrobe "
            "direction, b-roll inspiration, proven prompt patterns OR Remotion building blocks "
            "BEFORE generating content from scratch. Pass `kind` to scope."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "query": {
                    "type": "string",
                    "description": "Free-text intent. Example: 'lente para retrato editorial preto e branco' or 'b-roll de cidade à noite chuvosa'.",
                },
                "top_k": {"type": "integer", "minimum": 1, "maximum": 15, "default": 5},
                "kind": {
                    "type": "string",
                    "enum": sorted(ALLOWED_KINDS),
                    "description": "Optional filter — narrows the search to one kind. Omit to scan everything.",
                },
            },
            "required": ["user_id", "query"],
        },
        handler=_recall_knowledge,
    )
)

register(
    ToolSpec(
        name="list_knowledge_kinds",
        description=(
            "Returns counts per knowledge `kind` available in the library. Use ONCE at the start "
            "of a research/writing task to know what's queryable before calling recall_knowledge."
        ),
        parameters={
            "type": "object",
            "properties": {"user_id": {"type": "string"}},
            "required": ["user_id"],
        },
        handler=_list_knowledge_kinds,
    )
)

register(
    ToolSpec(
        name="get_knowledge",
        description=(
            "Fetch the FULL content of a knowledge record by (kind, slug). Use after "
            "recall_knowledge returned a relevant snippet that you need to expand — e.g. the "
            "full markdown of a CLAFE doc, or the complete JSON of a style preset."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "kind": {"type": "string", "enum": sorted(ALLOWED_KINDS)},
                "slug": {"type": "string"},
            },
            "required": ["user_id", "kind", "slug"],
        },
        handler=_get_knowledge,
    )
)
