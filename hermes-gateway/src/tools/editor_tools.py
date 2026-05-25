"""Editor tools — refine existing content drafts (Editor sub-agent)."""
from __future__ import annotations

import logging
from typing import Any

from ..connectors import gemini
from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)


def _load_draft(user_id: str, draft_id: str) -> dict[str, Any] | None:
    sb = supabase_admin()
    res = (
        sb.table("content_drafts")
        .select("*")
        .eq("id", draft_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    return res.data if res else None


async def _edit_draft(
    user_id: str,
    draft_id: str,
    instruction: str,
    target: str = "all",
) -> dict[str, Any]:
    """Apply a free-form edit instruction to a draft. target ∈ {all, hook, cta, beats}."""
    draft = _load_draft(user_id, draft_id)
    if not draft:
        return {"error": f"draft {draft_id} not found"}

    target = (target or "all").lower()

    schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "hook": {"type": "string"},
            "thesis": {"type": "string"},
            "cta": {"type": "string"},
            "beats": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "text": {"type": "string"},
                        "caption": {"type": "string"},
                        "b_roll": {"type": "string"},
                        "t": {"type": "number"},
                    },
                    "required": ["text"],
                },
            },
            "hashtags": {"type": "array", "items": {"type": "string"}},
            "rationale": {
                "type": "string",
                "description": "Brief explanation of what changed and why.",
            },
        },
        "required": ["rationale"],
    }

    prompt = f"""Você é o Editor agent do Channel OS. Refine o roteiro abaixo aplicando esta instrução:

INSTRUÇÃO: {instruction}
ALVO: {target}

ROTEIRO ATUAL (JSON):
- title: {draft.get('title')}
- hook: {draft.get('hook')}
- thesis: {draft.get('thesis')}
- cta: {draft.get('cta')}
- hashtags: {draft.get('hashtags')}
- beats: {draft.get('beats')}

Devolva APENAS os campos que mudaram (mais o `rationale`). Se target='hook', só mexe no hook. Se target='all', pode mexer em qualquer coisa. Mantenha o tom faceless + português brasileiro. Beats curtos, captions ≤6 palavras."""

    try:
        result = await gemini.generate_structured(
            prompt=prompt,
            response_schema=schema,
            model="gemini-2.5-flash",
            temperature=0.55,
        )
    except gemini.GeminiError as e:
        return {"error": str(e)}

    patch: dict[str, Any] = {}
    for k in ("title", "hook", "thesis", "cta", "hashtags"):
        if k in result and result[k] is not None:
            patch[k] = result[k]
    if "beats" in result and isinstance(result["beats"], list):
        patch["beats"] = result["beats"]

    sb = supabase_admin()
    sb.table("content_drafts").update(patch).eq("id", draft_id).execute()
    return {
        "draft_id": draft_id,
        "rationale": result.get("rationale"),
        "fields_changed": list(patch.keys()),
    }


async def _regenerate_beat(
    user_id: str,
    draft_id: str,
    beat_index: int,
    instruction: str | None = None,
) -> dict[str, Any]:
    draft = _load_draft(user_id, draft_id)
    if not draft:
        return {"error": f"draft {draft_id} not found"}
    beats = list(draft.get("beats") or [])
    if beat_index < 0 or beat_index >= len(beats):
        return {"error": f"beat_index {beat_index} out of range (0..{len(beats) - 1})"}

    original = beats[beat_index]
    extra = f"\nINSTRUÇÃO EXTRA: {instruction}" if instruction else ""

    schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "text": {"type": "string"},
            "caption": {"type": "string"},
            "b_roll": {"type": "string"},
            "rationale": {"type": "string"},
        },
        "required": ["text", "rationale"],
    }

    prompt = f"""Você é o Editor agent. Regenere ESTE beat específico mantendo continuidade com os anteriores e posteriores.

ROTEIRO COMPLETO:
- title: {draft.get('title')}
- hook: {draft.get('hook')}
- beats anteriores: {beats[:beat_index]}
- BEAT A REGENERAR (#{beat_index}): {original}
- beats posteriores: {beats[beat_index+1:]}{extra}

Devolva JSON com text + caption (opt) + b_roll (opt) + rationale. Mantenha o tom e a duração aproximada do beat original."""

    try:
        result = await gemini.generate_structured(
            prompt=prompt,
            response_schema=schema,
            model="gemini-2.5-flash",
            temperature=0.7,
        )
    except gemini.GeminiError as e:
        return {"error": str(e)}

    new_beat = {**original, "text": result["text"]}
    if "caption" in result and result["caption"]:
        new_beat["caption"] = result["caption"]
    if "b_roll" in result and result["b_roll"]:
        new_beat["b_roll"] = result["b_roll"]
    beats[beat_index] = new_beat

    sb = supabase_admin()
    sb.table("content_drafts").update({"beats": beats}).eq("id", draft_id).execute()
    return {
        "draft_id": draft_id,
        "beat_index": beat_index,
        "rationale": result.get("rationale"),
        "new_beat": new_beat,
    }


async def _archive_draft(user_id: str, draft_id: str) -> dict[str, Any]:
    sb = supabase_admin()
    sb.table("content_drafts").update({"status": "archived"}).eq("id", draft_id).eq(
        "user_id", user_id
    ).execute()
    return {"draft_id": draft_id, "status": "archived"}


async def _approve_draft(user_id: str, draft_id: str) -> dict[str, Any]:
    sb = supabase_admin()
    sb.table("content_drafts").update({"status": "approved"}).eq("id", draft_id).eq(
        "user_id", user_id
    ).execute()
    return {"draft_id": draft_id, "status": "approved"}


register(
    ToolSpec(
        name="edit_draft",
        description=(
            "Refine an existing content draft via a free-form instruction. Calls Gemini Flash "
            "with structured outputs to patch only the targeted fields. Use when the user wants "
            "to tweak tone, swap CTAs, expand the hook, etc."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "draft_id": {"type": "string"},
                "instruction": {
                    "type": "string",
                    "description": "What to change (e.g. 'deixa o hook mais agressivo', 'troca o CTA por convite pra parte 2').",
                },
                "target": {
                    "type": "string",
                    "enum": ["all", "hook", "cta", "beats", "thesis", "hashtags"],
                    "default": "all",
                },
            },
            "required": ["user_id", "draft_id", "instruction"],
        },
        handler=_edit_draft,
    )
)

register(
    ToolSpec(
        name="regenerate_beat",
        description=(
            "Regenerate a specific beat (by index) in a content draft, keeping continuity with "
            "neighbors. Use when one beat is weak/off and the rest is fine."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "draft_id": {"type": "string"},
                "beat_index": {"type": "integer", "minimum": 0},
                "instruction": {"type": "string"},
            },
            "required": ["user_id", "draft_id", "beat_index"],
        },
        handler=_regenerate_beat,
    )
)

register(
    ToolSpec(
        name="approve_draft",
        description="Mark a draft as approved (ready to render).",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "draft_id": {"type": "string"},
            },
            "required": ["user_id", "draft_id"],
        },
        handler=_approve_draft,
    )
)

register(
    ToolSpec(
        name="archive_draft",
        description="Archive a draft (soft delete — hides from the workspace).",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "draft_id": {"type": "string"},
            },
            "required": ["user_id", "draft_id"],
        },
        handler=_archive_draft,
    )
)
