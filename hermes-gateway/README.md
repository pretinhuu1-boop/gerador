# Hermes Gateway

FastAPI service that exposes the Hermes orchestrator + sub-agents as an SSE chat API. Designed to sit between the Channel OS frontend and OpenRouter (LLM) + Supabase (state) + external connectors (YouTube, TikTok, etc).

## Architecture

```
Frontend (React)
   │  POST /v1/chat/stream  (SSE, Bearer = Supabase JWT)
   ▼
Hermes Orchestrator  (Hermes 4.3-36B)
   │  tool: delegate_to_scout
   ▼
Scout Sub-agent  (Hermes 4-14B)
   │  tools: fetch_youtube_channel, scout_youtube_channel
   ▼
Connectors: YouTube Data API · Supabase (service-role)
```

The orchestrator and sub-agent share a generic tool-calling loop (`agents/base.py`) that streams structured events (`message.delta`, `tool.call`, `tool.result`, `agent.handoff`) so the UI can render the multi-step reasoning.

## Local development (without Docker)

```bash
cd hermes-gateway
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]

# Populate .env (or rely on docker-compose env_file)
export OPENROUTER_API_KEY=...
export YOUTUBE_API_KEY=...
export SUPABASE_URL=http://localhost:54321
export SUPABASE_SERVICE_ROLE_KEY=...      # supabase status
export SUPABASE_JWT_SECRET=...            # supabase status

uvicorn src.main:app --reload --port 8088
```

## Tool authoring

1. Add a module under `src/tools/`.
2. Define an `async def handler(**kwargs)` returning a JSON-serializable dict.
3. Call `register(ToolSpec(name, description, parameters, handler))`.
4. Add the tool name to an agent's `allowed_tools`.

Tools that need the requesting user's identity should declare `user_id` in their parameters and the base loop will inject `ctx.user_id` automatically (the model never sees the UUID).

## Models

Configured via env vars — defaults assume OpenRouter slugs:

- `HERMES_MODEL_ORCHESTRATOR` (default `nousresearch/hermes-4.3-36b`)
- `HERMES_MODEL_AGENT` (default `nousresearch/hermes-4-14b`)
- `HERMES_MODEL_IMPROVER` (default `nousresearch/hermes-4.3-36b`)

Adjust to whatever slugs OpenRouter actually surfaces — the IDs above are inferred from the public HuggingFace model cards.
