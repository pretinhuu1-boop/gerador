"""Memory pin tools — Hermes can persist preferences/facts/goals across sessions."""
from __future__ import annotations

import logging
from typing import Any

from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)

ALLOWED_KINDS = {"preference", "fact", "goal", "channel_pin", "rule"}


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
    return {
        "id": data["id"],
        "kind": data["kind"],
        "content": data["content"],
        "importance": data["importance"],
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
