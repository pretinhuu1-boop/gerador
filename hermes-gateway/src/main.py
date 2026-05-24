"""FastAPI entrypoint — Hermes Gateway."""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from . import __version__
from .agents.base import AgentContext
from .auth import AuthIdentity, authenticate_request
from .config import get_settings
from .connectors.openrouter import OpenRouterClient
from .orchestrator import run_orchestrator

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
        "models": {
            "orchestrator": s.hermes_model_orchestrator,
            "agent": s.hermes_model_agent,
            "improver": s.hermes_model_improver,
        },
    }


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(..., min_length=1)
    workspace: str = "mixed"
    history: list[dict] | None = None


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

    ctx = AgentContext(
        user_id=identity.user_id,
        session_id=payload.session_id,
        workspace=payload.workspace,
    )

    async def event_stream() -> AsyncIterator[dict]:
        try:
            yield {"event": "session.created", "data": json.dumps({"session_id": payload.session_id})}
            async for ev in run_orchestrator(
                openrouter_client,
                ctx,
                payload.message,
                history=payload.history or [],
            ):
                yield {"event": ev["type"], "data": json.dumps(ev, default=str)}
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
    """Direct synchronous scout — no LLM in the loop. Useful for the standalone Scout workspace
    when a user hits the gateway from a script."""
    from .tools.scout_tools import _scout_youtube_channel  # type: ignore[attr-defined]

    return await _scout_youtube_channel(user_id=identity.user_id, query=payload.query)
