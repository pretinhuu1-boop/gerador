"""FastAPI entrypoint — Hermes Gateway."""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from . import __version__
from .agents.base import AgentContext
from .auth import AuthIdentity, authenticate_request
from .config import get_settings
from .connectors.openrouter import OpenRouterClient
from .orchestrator import run_orchestrator
from .persistence import ensure_session, save_message

logging.basicConfig(
    level=get_settings().log_level,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
log = logging.getLogger("hermes")

openrouter_client: OpenRouterClient | None = None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global openrouter_client
    openrouter_client = OpenRouterClient()
    log.info("Hermes Gateway v%s started", __version__)
    try:
        yield
    finally:
        if openrouter_client:
            await openrouter_client.close()


app = FastAPI(
    title="Hermes Gateway",
    version=__version__,
    description="Multi-agent orchestration layer for Channel OS.",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------- routes ----


@app.get("/healthz")
async def healthz() -> dict[str, object]:
    s = get_settings()
    return {
        "status": "ok",
        "version": __version__,
        "openrouter_configured": bool(s.openrouter_api_key),
        "youtube_configured": bool(s.youtube_api_key),
        "supabase_configured": bool(s.supabase_url and s.supabase_service_role_key),
        "elevenlabs_configured": bool(s.elevenlabs_api_key),
        "gemini_embeddings_configured": bool(s.gemini_api_key),
        "models": {
            "orchestrator": s.hermes_model_orchestrator,
            "agent": s.hermes_model_agent,
            "improver": s.hermes_model_improver,
        },
        "fallback_chain": s.hermes_fallback_models_list,
    }


class HistoryEntry(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(..., min_length=1)
    workspace: str = "mixed"
    history: list[HistoryEntry] | None = None


def _auth(request: Request) -> AuthIdentity:
    return authenticate_request(request)


@app.post("/v1/chat/stream")
async def chat_stream(
    request: Request,
    payload: ChatRequest,
    identity: AuthIdentity = Depends(_auth),
):
    if not openrouter_client:
        raise HTTPException(status_code=503, detail="gateway not ready")

    ensured_session_id = ensure_session(
        user_id=identity.user_id,
        session_id=payload.session_id,
        workspace=payload.workspace,
    )

    ctx = AgentContext(
        user_id=identity.user_id,
        session_id=ensured_session_id,
        workspace=payload.workspace,
    )

    history_payload: list[dict[str, str]] = (
        [h.model_dump() for h in (payload.history or [])][-20:]  # last 20 turns
    )

    async def event_stream() -> AsyncIterator[dict]:
        try:
            yield {
                "event": "session.created",
                "data": json.dumps({"session_id": ensured_session_id}),
            }

            # Persist the user turn up-front (best effort).
            save_message(
                session_id=ensured_session_id,
                user_id=identity.user_id,
                role="user",
                content=payload.message,
            )

            current_agent: str | None = None
            current_model: str | None = None
            pending_content_by_agent: dict[str, str] = {}

            def flush_assistant(agent_key: str | None) -> None:
                key = agent_key or "orchestrator"
                txt = pending_content_by_agent.pop(key, "")
                if txt.strip():
                    save_message(
                        session_id=ensured_session_id,
                        user_id=identity.user_id,
                        role="assistant",
                        content=txt,
                        agent_name=key,
                        model=current_model,
                    )

            async for ev in run_orchestrator(
                openrouter_client,
                ctx,
                payload.message,
                history=history_payload,
            ):
                etype = ev.get("type")

                if etype == "agent.start":
                    current_agent = ev.get("name") or current_agent
                    current_model = ev.get("model") or current_model

                elif etype == "agent.handoff":
                    # Whoever is "from" finishes their accumulated content
                    from_ = ev.get("from")
                    if from_:
                        flush_assistant(from_)
                    current_agent = ev.get("to") or current_agent

                elif etype == "message.delta":
                    key = (ev.get("agent") or current_agent) or "orchestrator"
                    pending_content_by_agent[key] = (
                        pending_content_by_agent.get(key, "")
                        + (ev.get("content") or ev.get("data", {}).get("content") or "")
                    )

                elif etype == "message.complete":
                    key = (ev.get("agent") or current_agent) or "orchestrator"
                    final_content = (
                        ev.get("content")
                        or ev.get("data", {}).get("content")
                        or pending_content_by_agent.get(key, "")
                    )
                    if final_content.strip():
                        save_message(
                            session_id=ensured_session_id,
                            user_id=identity.user_id,
                            role="assistant",
                            content=final_content,
                            agent_name=key,
                            model=current_model,
                        )
                    pending_content_by_agent.pop(key, None)

                elif etype == "tool.result":
                    result = ev.get("result") or ev.get("data", {}).get("result")
                    save_message(
                        session_id=ensured_session_id,
                        user_id=identity.user_id,
                        role="tool",
                        content=json.dumps(result, default=str)[:8000] if result is not None else None,
                        tool_call_id=ev.get("id"),
                        agent_name=ev.get("agent") or current_agent,
                    )

                yield {"event": etype or "message", "data": json.dumps(ev, default=str)}

            # Drain anything left
            for key in list(pending_content_by_agent.keys()):
                flush_assistant(key)

        except Exception as e:  # noqa: BLE001
            log.exception("stream failed")
            yield {"event": "error", "data": json.dumps({"message": str(e)})}
        finally:
            yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_stream())


class ScoutRequest(BaseModel):
    query: str = Field(..., min_length=1)


@app.post("/v1/scout/run")
async def scout_run(
    payload: ScoutRequest,
    identity: AuthIdentity = Depends(_auth),
):
    """Direct synchronous scout — no LLM in the loop. Useful when consumers want the scoring
    pipeline without invoking the orchestrator."""
    from .tools.scout_tools import _scout_youtube_channel  # type: ignore[attr-defined]

    return await _scout_youtube_channel(user_id=identity.user_id, query=payload.query)


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice_id: str | None = None
    model_id: str | None = None


@app.post("/v1/voice/stream")
async def voice_stream(
    payload: TTSRequest,
    identity: AuthIdentity = Depends(_auth),
):
    """Streams MP3 audio of the synthesized text. Auth-guarded so anonymous
    visitors can't burn the user's ElevenLabs quota."""
    from .connectors import elevenlabs

    s = get_settings()
    if not s.elevenlabs_api_key:
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY not configured")

    async def stream_audio():
        try:
            async for chunk in elevenlabs.stream(
                payload.text,
                voice_id=payload.voice_id,
                model_id=payload.model_id,
            ):
                yield chunk
        except elevenlabs.ElevenLabsError as e:
            log.warning("ElevenLabs stream failed for user %s: %s", identity.user_id, e)
            raise HTTPException(status_code=502, detail=f"upstream tts failed: {e}")

    return StreamingResponse(stream_audio(), media_type="audio/mpeg")


@app.get("/v1/voice/voices")
async def voice_voices(identity: AuthIdentity = Depends(_auth)):
    from .tools.voice_tools import _list_voices  # type: ignore[attr-defined]

    return await _list_voices(user_id=identity.user_id, limit=50)


# --------------------------------------------------------------------- agents ---


@app.get("/v1/agents")
async def list_agents(_identity: AuthIdentity = Depends(_auth)):
    """Returns the registry of sub-agents the gateway can spawn, with per-agent
    metadata (model, system_prompt size, allowed_tools count) — used by the UI
    AgentsWorkspace to render the cards grid. No execution, just spec."""
    from .agents import REGISTRY
    from .orchestrator import orchestrator_agent

    s = get_settings()
    out = []
    for desc in REGISTRY:
        if desc.key == "orchestrator":
            run = orchestrator_agent()
        else:
            run = desc.factory()
        out.append(
            {
                "key": desc.key,
                "name": desc.name,
                "badge": desc.badge,
                "badge_color": desc.badge_color,
                "role": desc.role,
                "description": desc.description,
                "is_main": desc.is_main,
                "model": run.model,
                "model_chain": run.model_chain(),
                "allowed_tools": run.allowed_tools,
                "tools_count": len(run.allowed_tools),
                "temperature": run.temperature,
                "system_prompt_chars": len(run.system_prompt),
                "cache_system_prompt": run.cache_system_prompt,
            }
        )
    return {
        "agents": out,
        "fallback_chain": s.hermes_fallback_models_list,
        "models": {
            "orchestrator": s.hermes_model_orchestrator,
            "agent": s.hermes_model_agent,
            "improver": s.hermes_model_improver,
        },
    }


# ------------------------------------------------------------------ templates ---


@app.get("/v1/templates")
async def list_templates(_identity: AuthIdentity = Depends(_auth)):
    """Returns the Remotion composition registry — same source as the
    list_video_templates tool. Used by the Content workspace to render
    a picker before the user (or agent) writes a draft."""
    from .templates import REGISTRY as TEMPLATES

    return {
        "templates": [t.to_dict() for t in TEMPLATES],
        "count": len(TEMPLATES),
    }


# --------------------------------------------------------------------- render ---


class RenderRequest(BaseModel):
    voice_id: str | None = None
    quality: str = Field(default="preview", pattern="^(preview|final)$")


@app.post("/v1/render/draft/{draft_id}")
async def render_draft(
    draft_id: str,
    payload: RenderRequest,
    background: BackgroundTasks,
    identity: AuthIdentity = Depends(_auth),
):
    """Creates a content_renders row and kicks off the pipeline in the background.
    Returns the render_id immediately; frontend subscribes to Realtime CDC on
    `content_renders` for live progress."""
    from .connectors.supabase_client import supabase_admin
    from .render import pipeline

    s = get_settings()
    if not s.elevenlabs_api_key:
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY not configured")
    if not s.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="SUPABASE_SERVICE_ROLE_KEY not configured")

    sb = supabase_admin()
    draft_check = (
        sb.table("content_drafts")
        .select("id, user_id, status")
        .eq("id", draft_id)
        .eq("user_id", identity.user_id)
        .maybe_single()
        .execute()
    )
    if not (draft_check and draft_check.data):
        raise HTTPException(status_code=404, detail="draft not found")

    inserted = (
        sb.table("content_renders")
        .insert(
            {
                "draft_id": draft_id,
                "user_id": identity.user_id,
                "voice_id": payload.voice_id,
                "quality": payload.quality,
                "status": "queued",
                "stage": "queued",
            }
        )
        .execute()
    )
    if not inserted.data:
        raise HTTPException(status_code=500, detail="failed to create render row")
    render_id = inserted.data[0]["id"]

    background.add_task(pipeline.run, render_id)
    return {"render_id": render_id, "status": "queued"}


@app.get("/v1/render/{render_id}")
async def render_status(
    render_id: str,
    identity: AuthIdentity = Depends(_auth),
):
    from .connectors.supabase_client import supabase_admin

    sb = supabase_admin()
    res = (
        sb.table("content_renders")
        .select("*")
        .eq("id", render_id)
        .eq("user_id", identity.user_id)
        .maybe_single()
        .execute()
    )
    if not (res and res.data):
        raise HTTPException(status_code=404, detail="render not found")
    return res.data


# --------------------------------------------------------------------- missions ---


class MissionPlanRequest(BaseModel):
    brief: str = Field(..., min_length=4)
    session_id: str | None = None


@app.post("/v1/missions/plan")
async def missions_plan(
    payload: MissionPlanRequest,
    identity: AuthIdentity = Depends(_auth),
):
    """Plans a mission via the plan_mission tool (Gemini structured outputs).
    Returns mission_id + plan; mission stays 'draft' until /execute."""
    from .tools.mission_tools import _plan_mission  # type: ignore[attr-defined]

    return await _plan_mission(
        user_id=identity.user_id,
        brief=payload.brief,
        session_id=payload.session_id,
    )


@app.post("/v1/missions/{mission_id}/execute")
async def missions_execute(
    mission_id: str,
    background: BackgroundTasks,
    identity: AuthIdentity = Depends(_auth),
):
    """Triggers asynchronous execution of all pending steps. Returns immediately;
    UI subscribes to Supabase Realtime on hermes_missions/hermes_mission_steps
    for live progress."""
    from .connectors.supabase_client import supabase_admin
    from .missions import executor

    sb = supabase_admin()
    res = (
        sb.table("hermes_missions")
        .select("id, status, user_id")
        .eq("id", mission_id)
        .eq("user_id", identity.user_id)
        .maybe_single()
        .execute()
    )
    if not (res and res.data):
        raise HTTPException(status_code=404, detail="mission not found")
    if res.data["status"] == "running":
        return {"mission_id": mission_id, "status": "running", "note": "already running"}

    background.add_task(executor.run_mission, mission_id)
    return {"mission_id": mission_id, "status": "queued"}


@app.get("/v1/missions/{mission_id}")
async def missions_get(
    mission_id: str,
    identity: AuthIdentity = Depends(_auth),
):
    from .connectors.supabase_client import supabase_admin

    sb = supabase_admin()
    m = (
        sb.table("hermes_missions")
        .select("*")
        .eq("id", mission_id)
        .eq("user_id", identity.user_id)
        .maybe_single()
        .execute()
    )
    if not (m and m.data):
        raise HTTPException(status_code=404, detail="mission not found")
    steps = (
        sb.table("hermes_mission_steps")
        .select("*")
        .eq("mission_id", mission_id)
        .order("step_index")
        .execute()
    )
    return {"mission": m.data, "steps": steps.data or []}


@app.get("/v1/missions")
async def missions_list(
    status: str | None = None,
    limit: int = 30,
    identity: AuthIdentity = Depends(_auth),
):
    from .tools.mission_tools import _list_missions  # type: ignore[attr-defined]

    return await _list_missions(user_id=identity.user_id, status=status, limit=limit)
