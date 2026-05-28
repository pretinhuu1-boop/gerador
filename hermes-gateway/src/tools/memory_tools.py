"""Memory pin tools — Hermes can persist preferences/facts/goals across sessions."""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from ..connectors import embeddings
from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)

ALLOWED_KINDS = {"preference", "fact", "goal", "channel_pin", "rule"}


async def _embed_and_attach(memory_id: str, content: str) -> None:
    """Background task: compute embedding and store it as a pgvector string literal."""
    try:
        vec = await embeddings.embed_text(content)
        sb = supabase_admin()
        sb.table("hermes_memory").update({"embedding": embeddings.vector_literal(vec)}).eq(
            "id", memory_id
        ).execute()
    except Exception as e:  # noqa: BLE001
        log.warning("embedding pin %s failed: %s", memory_id, e)


async def _pin_memory(
    user_id: str,
    kind: str,
    content: str,
    importance: int = 3,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if kind not in ALLOWED_KINDS:
        return {"error": f"invalid kind {kind!r}; allowed: {sorted(ALLOWED_KINDS)}"}
    if not content or not content.strip():
        return {"error": "content is required"}
    importance = max(1, min(5, int(importance)))
    sb = supabase_admin()
    inserted = (
        sb.table("hermes_memory")
        .insert(
            {
                "user_id": user_id,
                "kind": kind,
                "content": content.strip()[:1500],
                "importance": importance,
                "metadata": metadata or {},
                "active": True,
            }
        )
        .execute()
    )
    data = inserted.data[0] if inserted.data else None
    if not data:
        return {"error": "insert returned no row"}
    # Embedding is non-blocking — fire and forget so the agent loop stays snappy.
    try:
        asyncio.create_task(_embed_and_attach(data["id"], data["content"]))
    except RuntimeError:
        # No running loop (sync caller); skip.
        pass
    return {
        "id": data["id"],
        "kind": data["kind"],
        "content": data["content"],
        "importance": data["importance"],
    }


async def _recall_memory(
    user_id: str,
    query: str,
    top_k: int = 5,
    kind: str | None = None,
) -> dict[str, Any]:
    """Semantic recall via pgvector cosine distance. Returns the top_k most
    relevant pins for a free-text query."""
    if not query or not query.strip():
        return {"error": "query is required"}
    top_k = max(1, min(20, int(top_k)))
    if kind and kind not in ALLOWED_KINDS:
        return {"error": f"invalid kind {kind!r}"}

    try:
        vec = await embeddings.embed_text(query, task_type="RETRIEVAL_QUERY")
    except embeddings.EmbeddingError as e:
        return {"error": f"embedding failed: {e}"}

    sb = supabase_admin()
    # supabase-py doesn't expose the pgvector `<=>` operator directly. For <500
    # pins client-side ranking is plenty; we'll add an SQL function + RPC when
    # users start hitting that volume.
    q = (
        sb.table("hermes_memory")
        .select("id, kind, content, importance, embedding")
        .eq("user_id", user_id)
        .eq("active", True)
        .limit(500)
    )
    if kind:
        q = q.eq("kind", kind)
    res = q.execute()
    pins = res.data or []

    # Parse stored vector strings into floats and rank by cosine similarity.
    import json
    import math

    def parse_vec(raw: Any) -> list[float] | None:
        if not raw:
            return None
        if isinstance(raw, list):
            return [float(v) for v in raw]
        if isinstance(raw, str):
            try:
                return [float(v) for v in json.loads(raw.replace("'", '"'))]
            except (json.JSONDecodeError, ValueError):
                return None
        return None

    def cosine(a: list[float], b: list[float]) -> float:
        if len(a) != len(b):
            return -1.0
        dot = sum(x * y for x, y in zip(a, b))
        na = math.sqrt(sum(x * x for x in a))
        nb = math.sqrt(sum(x * x for x in b))
        if na == 0 or nb == 0:
            return -1.0
        return dot / (na * nb)

    ranked: list[tuple[float, dict[str, Any]]] = []
    for p in pins:
        pv = parse_vec(p.get("embedding"))
        if pv is None:
            # No embedding yet — give it a baseline score below similar pins.
            ranked.append((-0.5 + (p["importance"] / 10.0), p))
            continue
        ranked.append((cosine(vec, pv), p))
    ranked.sort(key=lambda t: t[0], reverse=True)
    top = ranked[:top_k]
    return {
        "pins": [
            {
                "id": p["id"],
                "kind": p["kind"],
                "content": p["content"],
                "importance": p["importance"],
                "score": round(score, 4),
            }
            for score, p in top
        ],
        "total_active": len(pins),
        "query": query,
    }


async def _list_memory(user_id: str, kind: str | None = None, limit: int = 25) -> dict[str, Any]:
    sb = supabase_admin()
    q = (
        sb.table("hermes_memory")
        .select("id, kind, content, importance, metadata, created_at")
        .eq("user_id", user_id)
        .eq("active", True)
        .order("importance", desc=True)
        .order("updated_at", desc=True)
        .limit(max(1, min(100, limit)))
    )
    if kind:
        if kind not in ALLOWED_KINDS:
            return {"error": f"invalid kind {kind!r}"}
        q = q.eq("kind", kind)
    res = q.execute()
    return {"pins": res.data or []}


async def _deactivate_memory(user_id: str, id: str) -> dict[str, Any]:
    sb = supabase_admin()
    sb.table("hermes_memory").update({"active": False}).eq("user_id", user_id).eq(
        "id", id
    ).execute()
    return {"id": id, "deactivated": True}


register(
    ToolSpec(
        name="pin_memory",
        description=(
            "Persist a piece of context (preference, fact, goal, channel pin, rule) about the user "
            "so future Hermes sessions can reference it. Use when the user says something worth "
            "remembering — preferences, recurring goals, important facts about their channels/brand. "
            "Do NOT pin trivia or single-session details."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "UUID of the user (auto-injected from JWT).",
                },
                "kind": {
                    "type": "string",
                    "enum": sorted(ALLOWED_KINDS),
                    "description": (
                        "Category of memory: preference (estilo, tom), fact (sobre o canal/negócio), "
                        "goal (meta de longo prazo), channel_pin (canal de interesse), rule (regra firme)."
                    ),
                },
                "content": {
                    "type": "string",
                    "description": "Concise statement to remember (1-2 sentences, português).",
                },
                "importance": {
                    "type": "integer",
                    "description": "How sticky this pin is (1=mild, 5=critical).",
                    "minimum": 1,
                    "maximum": 5,
                    "default": 3,
                },
                "metadata": {
                    "type": "object",
                    "description": "Optional extra structured context (e.g. {channel_id: '...'}).",
                },
            },
            "required": ["user_id", "kind", "content"],
        },
        handler=_pin_memory,
    )
)

register(
    ToolSpec(
        name="list_memory",
        description=(
            "List currently active memory pins for the user. Use when the user asks what you remember, "
            "or when you need to audit pins to avoid duplicates."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "kind": {"type": "string", "enum": sorted(ALLOWED_KINDS)},
                "limit": {"type": "integer", "minimum": 1, "maximum": 100, "default": 25},
            },
            "required": ["user_id"],
        },
        handler=_list_memory,
    )
)

register(
    ToolSpec(
        name="recall_memory",
        description=(
            "Semantic search across the user's active memory pins. Use this INSTEAD of "
            "list_memory whenever you have a topic/intent to filter by (the user mentioned "
            "voice tone, a niche, a goal, etc). Returns top_k pins ranked by cosine similarity "
            "to the query, plus a score per pin."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "query": {
                    "type": "string",
                    "description": "Free-text intent or topic to search pins by.",
                },
                "top_k": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 20,
                    "default": 5,
                },
                "kind": {"type": "string", "enum": sorted(ALLOWED_KINDS)},
            },
            "required": ["user_id", "query"],
        },
        handler=_recall_memory,
    )
)

register(
    ToolSpec(
        name="deactivate_memory",
        description=(
            "Mark a memory pin as inactive (soft delete). Use when the user says a pin no longer "
            "applies, or when you spot a contradiction with newer info."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "id": {"type": "string", "description": "UUID of the pin to deactivate."},
            },
            "required": ["user_id", "id"],
        },
        handler=_deactivate_memory,
    )
)


def render_memory_context(user_id: str, max_pins: int = 12) -> str:
    """Returns a human-readable block of active pins, ordered by importance, ready for injection
    into a system prompt. Returns empty string on failure or no pins."""
    try:
        sb = supabase_admin()
        res = (
            sb.table("hermes_memory")
            .select("kind, content, importance")
            .eq("user_id", user_id)
            .eq("active", True)
            .order("importance", desc=True)
            .order("updated_at", desc=True)
            .limit(max_pins)
            .execute()
        )
        pins = res.data or []
    except Exception as e:  # noqa: BLE001
        log.warning("memory render failed: %s", e)
        return ""
    if not pins:
        return ""
    lines = ["## Memória do usuário (contexto persistente)"]
    for p in pins:
        lines.append(f"- [{p['kind']} · importância {p['importance']}/5] {p['content']}")
    return "\n".join(lines)
