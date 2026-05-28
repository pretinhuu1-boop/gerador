"""Improver tools — meta-agent observing the system + proposing improvements.

The Improver runs Hermes 4.3-36B (top reasoning), looks at the user's recent
activity (drafts, missions, channel scouts, message history) and proposes:
- Skills (Python tool-like functions) the user might want to install.
- Memory pins worth promoting to higher importance.
- Mission templates derived from recurring patterns.

Persistence: proposals land in hermes_memory with kind='rule' importance=5,
marked with metadata.kind='proposal' so the UI can render them in an approvals
queue (future Skills workspace).
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from ..connectors import gemini
from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)


async def _analyze_recent_activity(
    user_id: str,
    days: int = 7,
) -> dict[str, Any]:
    """Aggregates activity counters for the last N days. Pure SQL, no LLM."""
    sb = supabase_admin()
    since = (datetime.now(timezone.utc) - timedelta(days=max(1, min(90, days)))).isoformat()

    out: dict[str, Any] = {"window_days": days, "since": since}

    # hermes_messages by role
    msgs = (
        sb.table("hermes_messages")
        .select("role, agent_name, created_at")
        .eq("user_id", user_id)
        .gte("created_at", since)
        .limit(2000)
        .execute()
    )
    rows = msgs.data or []
    by_role: dict[str, int] = {}
    by_agent: dict[str, int] = {}
    for r in rows:
        role = r.get("role")
        if role:
            by_role[role] = by_role.get(role, 0) + 1
        a = r.get("agent_name")
        if a:
            by_agent[a] = by_agent.get(a, 0) + 1
    out["messages_total"] = len(rows)
    out["messages_by_role"] = by_role
    out["calls_by_agent"] = by_agent

    # drafts
    drafts = (
        sb.table("content_drafts")
        .select("id, status, format, generated_by")
        .eq("user_id", user_id)
        .gte("created_at", since)
        .execute()
    )
    d_rows = drafts.data or []
    out["drafts_total"] = len(d_rows)
    out["drafts_by_status"] = _count_by(d_rows, "status")
    out["drafts_by_format"] = _count_by(d_rows, "format")

    # missions
    missions = (
        sb.table("hermes_missions")
        .select("id, status, total_steps, done_steps")
        .eq("user_id", user_id)
        .gte("created_at", since)
        .execute()
    )
    m_rows = missions.data or []
    out["missions_total"] = len(m_rows)
    out["missions_by_status"] = _count_by(m_rows, "status")

    # channels tracked
    channels = (
        sb.table("channels")
        .select("id, platform, status, score")
        .eq("user_id", user_id)
        .gte("created_at", since)
        .execute()
    )
    c_rows = channels.data or []
    out["channels_tracked"] = len(c_rows)
    out["channels_by_platform"] = _count_by(c_rows, "platform")

    return out


def _count_by(rows: list[dict[str, Any]], key: str) -> dict[str, int]:
    out: dict[str, int] = {}
    for r in rows:
        v = r.get(key)
        if v is None:
            continue
        out[v] = out.get(v, 0) + 1
    return out


PROPOSAL_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "proposals": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "kind": {
                        "type": "string",
                        "enum": ["skill", "automation", "memory_pin", "mission_template"],
                    },
                    "title": {"type": "string"},
                    "rationale": {"type": "string"},
                    "concrete_steps": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "importance": {"type": "integer", "minimum": 1, "maximum": 5},
                },
                "required": ["kind", "title", "rationale", "importance"],
            },
        },
        "summary": {"type": "string"},
    },
    "required": ["proposals"],
}


async def _propose_improvements(
    user_id: str,
    days: int = 7,
) -> dict[str, Any]:
    """Analyze recent activity + ask Gemini for improvement proposals.
    Persists each proposal as a hermes_memory row kind='rule' importance=5
    with metadata.proposal=true so the UI can render them."""
    activity = await _analyze_recent_activity(user_id=user_id, days=days)
    if activity.get("messages_total", 0) == 0 and activity.get("drafts_total", 0) == 0:
        return {
            "proposals": [],
            "summary": "Sem atividade suficiente nos últimos dias pra propor melhorias.",
            "activity": activity,
        }

    prompt = f"""Você é o Improver agent — meta-observador do Channel OS. Analise a atividade dos últimos {days} dias do usuário e proponha 2-5 melhorias concretas.

ATIVIDADE:
{activity}

Cada proposta deve ser um de:
- `skill` — função reutilizável que poderia virar tool (ex: "auto-score-canal-novo")
- `automation` — workflow que dispara em evento (ex: "renderiza automático quando draft é aprovado")
- `memory_pin` — fato/regra recorrente que vale pinar
- `mission_template` — padrão de missão que se repete (ex: "todo domingo: trending + 3 ideias + roteiros")

Pra cada proposta:
- title curto, imperativo
- rationale (1-2 frases explicando por que a evidência sugere isso)
- concrete_steps (lista de 2-5 passos pra implementar)
- importance 1-5

NUNCA invente atividade que não está nos dados. Se algo apareceu MUITO, vale uma proposta. Se algo aparecer pouco, talvez não.

Devolva JSON conforme schema."""

    try:
        result = await gemini.generate_structured(
            prompt=prompt,
            response_schema=PROPOSAL_SCHEMA,
            model="gemini-2.5-flash",
            temperature=0.6,
        )
    except gemini.GeminiError as e:
        return {"error": str(e), "activity": activity}

    proposals = result.get("proposals") or []
    sb = supabase_admin()

    persisted = []
    for p in proposals:
        try:
            inserted = sb.table("hermes_memory").insert(
                {
                    "user_id": user_id,
                    "kind": "rule",
                    "content": f"[Improver/{p['kind']}] {p['title']}: {p['rationale']}",
                    "importance": int(p.get("importance", 4)),
                    "metadata": {
                        "proposal": True,
                        "proposal_kind": p["kind"],
                        "concrete_steps": p.get("concrete_steps") or [],
                        "approved": False,
                    },
                    "active": True,
                }
            ).execute()
            if inserted.data:
                persisted.append(inserted.data[0]["id"])
        except Exception as e:  # noqa: BLE001
            log.warning("proposal persistence failed: %s", e)

    return {
        "proposals": proposals,
        "summary": result.get("summary"),
        "persisted_pin_ids": persisted,
        "activity": activity,
    }


register(
    ToolSpec(
        name="analyze_recent_activity",
        description=(
            "Aggregate the user's recent activity (messages, drafts, missions, channels) over "
            "the last N days. Returns counts by role/agent/status/format/platform. Pure SQL, "
            "no LLM — cheap. Use as a precursor before propose_improvements."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "days": {"type": "integer", "minimum": 1, "maximum": 90, "default": 7},
            },
            "required": ["user_id"],
        },
        handler=_analyze_recent_activity,
    )
)

register(
    ToolSpec(
        name="propose_improvements",
        description=(
            "Run the Improver meta-loop: analyze recent activity → ask Gemini to propose 2-5 "
            "improvements (new skills, automations, memory pins, mission templates) → persist each "
            "as a memory pin with metadata.proposal=true so the user can review/approve in the "
            "Skills workspace (future). Use when the user asks 'me ajuda a melhorar esse setup' or "
            "as a scheduled job."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "days": {"type": "integer", "minimum": 1, "maximum": 90, "default": 7},
            },
            "required": ["user_id"],
        },
        handler=_propose_improvements,
    )
)
