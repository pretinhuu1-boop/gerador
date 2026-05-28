"""Mission planning + execution tools.

A Mission = high-level user intent ("create 5 shorts about Egyptian mysteries")
that Hermes plans into a sequence of steps, each executed by a sub-agent + tool.
This module exposes:

- plan_mission(brief) — Gemini Flash with structured outputs returns a JSON plan
  {title, summary, steps[]}, persisted as hermes_missions + hermes_mission_steps.
- list_missions(user_id, status?) — recent missions.
- execute_next_step(mission_id) — runs the first pending step; meant to be
  invoked repeatedly (or scheduled) by the executor in main.py.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from ..connectors import gemini
from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)


PLAN_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "title": {"type": "string", "description": "Short mission name, ≤60 chars."},
        "summary": {
            "type": "string",
            "description": "1-2 sentence summary of what gets produced.",
        },
        "steps": {
            "type": "array",
            "minItems": 1,
            "maxItems": 12,
            "items": {
                "type": "object",
                "properties": {
                    "step_index": {"type": "integer"},
                    "title": {"type": "string"},
                    "agent_key": {
                        "type": "string",
                        "enum": ["orchestrator", "scout", "content"],
                    },
                    "tool_name": {
                        "type": "string",
                        "description": "Exact tool name the agent should call.",
                    },
                    "tool_args": {
                        "type": "object",
                        "description": "Arguments to pass to the tool. user_id is auto-injected.",
                    },
                    "depends_on": {
                        "type": "array",
                        "items": {"type": "integer"},
                        "description": "step_index numbers this step waits on.",
                    },
                    "notes": {"type": "string"},
                },
                "required": ["step_index", "title", "agent_key", "tool_name", "tool_args"],
            },
        },
    },
    "required": ["title", "steps"],
}


SCOUT_TOOLS = (
    "fetch_youtube_channel · scout_youtube_channel · discover_youtube_channels "
    "(query/region/lang/min_subscribers/max_subscribers/order) · "
    "extract_video_blueprint (video_id) · read_top_comments (video_id)"
)
CONTENT_TOOLS = (
    "brainstorm_ideas (topic/format/count) · "
    "write_script (idea/format/duration_seconds/tone/channel_id?) · "
    "list_content_drafts · extract_video_blueprint · read_top_comments · "
    "list_elevenlabs_voices · preview_voice (text/voice_id?)"
)
ORCH_TOOLS = (
    "pin_memory (kind/content/importance) · list_memory · recall_memory (query/top_k)"
)


PLANNER_SYSTEM = f"""Você é o planejador de missões do Channel OS — sistema operacional de canais faceless. Sua tarefa: receber um briefing do usuário e transformar em um plano executável estruturado.

O plano é executado por subagentes especializados que JÁ EXISTEM:

- **scout** (Hermes 4-14B) — descoberta + análise de canais YouTube. Ferramentas: {SCOUT_TOOLS}.
- **content** (Hermes 4-14B) — brainstorm + roteirização + TTS preview. Ferramentas: {CONTENT_TOOLS}.
- **orchestrator** (Hermes 4.3-36B) — memória + delegação. Ferramentas: {ORCH_TOOLS}.

Princípios:
1. Divida o briefing em 2-8 steps concretos. Cada step = 1 tool call de 1 agente.
2. NUNCA invente ferramentas — só use as listadas acima.
3. Use `depends_on` quando um step precisa do output de outro (ex: roteirizar DEPOIS de extrair blueprint).
4. Steps independentes (paralelos) NÃO precisam depends_on.
5. Use `notes` pra explicar por que o step existe — vai virar UI hint.
6. `tool_args` deve estar completo o suficiente pro tool rodar sem confirmação adicional. Use placeholders inteligentes quando o user não especificou (ex: `region: 'BR'`, `format: 'short'`).
7. NUNCA inclua `user_id` em tool_args — é auto-injetado.
8. Title da missão: imperativo curto, ≤60 chars.

Exemplos de boas missões:
- "5 shorts mistério egípcio + clones de top 3" → plano: discover canais BR mistério → extract blueprint dos 3 maiores → brainstorm 5 ideias usando esses blueprints → write_script de cada (5 paralelos)
- "Analisa MrBeast e me dá 3 ideias de clone" → fetch_youtube_channel @mrbeast → extract_video_blueprint do vídeo top → brainstorm_ideas com restrição "estilo MrBeast" → write_script da melhor

Devolva APENAS JSON conforme o schema."""


async def _plan_mission(
    user_id: str,
    brief: str,
    session_id: str | None = None,
) -> dict[str, Any]:
    """Calls Gemini Flash with structured outputs, persists the plan into
    hermes_missions + hermes_mission_steps, returns the mission_id + plan."""
    if not brief or not brief.strip():
        return {"error": "brief is required"}

    try:
        plan = await gemini.generate_structured(
            prompt=brief.strip(),
            response_schema=PLAN_SCHEMA,
            model="gemini-2.5-flash",
            temperature=0.4,
            system=PLANNER_SYSTEM,
        )
    except gemini.GeminiError as e:
        return {"error": f"plan generation failed: {e}"}

    title = (plan.get("title") or "Missão sem título")[:200]
    steps = plan.get("steps") or []
    if not steps:
        return {"error": "model produced no steps"}

    sb = supabase_admin()
    try:
        inserted = (
            sb.table("hermes_missions")
            .insert(
                {
                    "user_id": user_id,
                    "session_id": session_id,
                    "title": title,
                    "brief": brief.strip()[:4000],
                    "plan": plan,
                    "status": "draft",
                    "total_steps": len(steps),
                }
            )
            .execute()
        )
        mission_id = inserted.data[0]["id"] if inserted.data else None
        if not mission_id:
            return {"error": "mission insert returned no row"}

        step_rows = []
        for s in steps:
            step_rows.append(
                {
                    "mission_id": mission_id,
                    "step_index": int(s.get("step_index", len(step_rows))),
                    "title": (s.get("title") or "")[:200],
                    "agent_key": s.get("agent_key") or "orchestrator",
                    "tool_name": s.get("tool_name"),
                    "tool_args": s.get("tool_args") or {},
                    "depends_on": s.get("depends_on"),
                    "status": "pending",
                }
            )
        sb.table("hermes_mission_steps").insert(step_rows).execute()
    except Exception as e:  # noqa: BLE001
        log.exception("plan_mission persistence failed")
        return {"error": f"persistence failed: {e}"}

    return {
        "mission_id": mission_id,
        "title": title,
        "summary": plan.get("summary"),
        "steps": steps,
        "status": "draft",
    }


async def _list_missions(
    user_id: str,
    status: str | None = None,
    limit: int = 20,
) -> dict[str, Any]:
    sb = supabase_admin()
    q = (
        sb.table("hermes_missions")
        .select("id, title, brief, status, progress, total_steps, done_steps, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(max(1, min(100, limit)))
    )
    if status:
        q = q.eq("status", status)
    res = q.execute()
    return {"missions": res.data or []}


register(
    ToolSpec(
        name="plan_mission",
        description=(
            "Plan a multi-step mission from a high-level user brief. Returns a JSON plan "
            "{mission_id, title, summary, steps[]} and persists it in hermes_missions. "
            "Use when the user says 'cria/planeja/missão X', 'pipeline pra Y', or describes a "
            "multi-step goal that spans more than one tool call. After planning, surface the "
            "mission_id + step list to the user for approval before triggering execution."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "brief": {
                    "type": "string",
                    "description": "Free-form description of what the user wants accomplished.",
                },
                "session_id": {
                    "type": "string",
                    "description": "Optional chat session id this mission is anchored to.",
                },
            },
            "required": ["user_id", "brief"],
        },
        handler=_plan_mission,
    )
)

register(
    ToolSpec(
        name="list_missions",
        description=(
            "List the user's recent missions (most recent first). Use when the user asks "
            "about their missions / pipelines / 'o que eu pedi pra você fazer'."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "status": {
                    "type": "string",
                    "enum": [
                        "draft",
                        "planning",
                        "approved",
                        "running",
                        "paused",
                        "done",
                        "error",
                        "cancelled",
                    ],
                },
                "limit": {"type": "integer", "minimum": 1, "maximum": 100, "default": 20},
            },
            "required": ["user_id"],
        },
        handler=_list_missions,
    )
)
