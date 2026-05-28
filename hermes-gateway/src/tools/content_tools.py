"""Content tools — brainstorming + script writing + draft persistence."""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from ..config import get_settings
from ..connectors.openrouter import OpenRouterClient
from ..connectors.supabase_client import supabase_admin
from . import ToolSpec, register

log = logging.getLogger(__name__)

ALLOWED_FORMATS = {"short", "long", "reel", "tiktok", "flyer", "thumbnail"}


def _openrouter() -> OpenRouterClient:
    return OpenRouterClient()


BRAINSTORM_PROMPT = """Você é um diretor de conteúdo faceless. Gere {count} ideias para vídeos do formato {format}, sobre o tema:

{topic}

Restrições:
{constraints}

Cada ideia deve ter:
- title (curto, clicável, em português)
- hook (uma frase que prende nos primeiros 3 segundos)
- thesis (o argumento central / promessa do vídeo)
- format_fit (por que esse formato funciona pra essa ideia)
- novelty_score (1-10: quão original é vs o que já existe)

Responda SOMENTE com JSON válido no formato:
{{
  "ideas": [
    {{"title": "...", "hook": "...", "thesis": "...", "format_fit": "...", "novelty_score": 8}},
    ...
  ]
}}
"""

SCRIPT_PROMPT = """Você é um roteirista de conteúdo faceless. Escreva um roteiro completo para um {format} de {duration}s.

Ideia base:
{idea}

Estrutura obrigatória do roteiro:
- hook: primeiros ~3 segundos, frase que prende
- thesis: argumento central em 1 frase
- beats: array de cenas/falas — para cada beat, dar:
    • t: segundo aproximado de start
    • text: a fala (será TTS-ada)
    • caption: legenda overlay (curta, no máx 6 palavras)
    • b_roll: descrição visual sucinta do que mostrar
- cta: última fala / overlay de call-to-action
- hashtags: array de 5-8 hashtags relevantes (sem #)

Tom: {tone}
Idioma: português brasileiro
Audiência: criadores faceless começando

Responda SOMENTE com JSON válido:
{{
  "title": "...",
  "hook": "...",
  "thesis": "...",
  "beats": [
    {{"t": 0, "text": "...", "caption": "...", "b_roll": "..."}},
    ...
  ],
  "cta": "...",
  "hashtags": ["mistery", "ancient", ...]
}}
"""


def _parse_json_payload(content: str) -> dict[str, Any]:
    """Extracts JSON from a model response that may have markdown fencing."""
    s = content.strip()
    # strip ```json ... ``` fences
    if s.startswith("```"):
        s = s.split("\n", 1)[1] if "\n" in s else s
        if s.endswith("```"):
            s = s.rsplit("```", 1)[0]
    s = s.strip()
    # find first '{' through last '}'
    if "{" in s:
        s = s[s.index("{") : s.rindex("}") + 1]
    return json.loads(s)


async def _brainstorm_ideas(
    user_id: str,
    topic: str,
    format: str = "short",
    count: int = 10,
    audience: str | None = None,
    constraints: str | None = None,
) -> dict[str, Any]:
    if format not in ALLOWED_FORMATS:
        return {"error": f"invalid format {format!r}; allowed: {sorted(ALLOWED_FORMATS)}"}
    count = max(1, min(20, int(count)))
    constraint_block = constraints or "Sem restrições adicionais."
    if audience:
        constraint_block += f"\nAudiência alvo: {audience}"

    settings = get_settings()
    client = _openrouter()
    try:
        prompt = BRAINSTORM_PROMPT.format(
            count=count, format=format, topic=topic, constraints=constraint_block
        )
        try:
            resp = await client.complete(
                model=settings.hermes_model_agent,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.85,
                max_tokens=1800,
            )
        finally:
            await client.close()

        text = resp["choices"][0]["message"].get("content") or ""
        try:
            parsed = _parse_json_payload(text)
        except json.JSONDecodeError as e:
            return {"error": f"failed to parse model JSON: {e}", "raw": text[:600]}

        ideas = parsed.get("ideas") or []
        if not ideas:
            return {"error": "model returned no ideas", "raw": parsed}
        return {"ideas": ideas[:count], "format": format, "count": len(ideas)}
    except Exception as e:  # noqa: BLE001
        log.exception("brainstorm failed")
        return {"error": str(e)}


async def _write_script(
    user_id: str,
    idea: str,
    format: str = "short",
    duration_seconds: int = 60,
    tone: str = "estratégico, direto, com curiosidade",
    channel_id: str | None = None,
    session_id: str | None = None,
    persist: bool = True,
) -> dict[str, Any]:
    if format not in ALLOWED_FORMATS:
        return {"error": f"invalid format {format!r}"}
    duration_seconds = max(10, min(900, int(duration_seconds)))

    settings = get_settings()
    client = _openrouter()
    try:
        prompt = SCRIPT_PROMPT.format(
            format=format, duration=duration_seconds, idea=idea, tone=tone
        )
        try:
            resp = await client.complete(
                model=settings.hermes_model_agent,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.75,
                max_tokens=2400,
            )
        finally:
            await client.close()

        text = resp["choices"][0]["message"].get("content") or ""
        try:
            parsed = _parse_json_payload(text)
        except json.JSONDecodeError as e:
            return {"error": f"failed to parse model JSON: {e}", "raw": text[:600]}

        title = parsed.get("title") or "Sem título"
        hook = parsed.get("hook")
        thesis = parsed.get("thesis")
        beats_raw = parsed.get("beats") or []
        beats = []
        for b in beats_raw:
            if not isinstance(b, dict):
                continue
            beats.append(
                {
                    "t": b.get("t"),
                    "text": (b.get("text") or "").strip(),
                    "caption": (b.get("caption") or "").strip() or None,
                    "b_roll": (b.get("b_roll") or "").strip() or None,
                }
            )
        cta = parsed.get("cta")
        hashtags = [h.lstrip("#").strip() for h in (parsed.get("hashtags") or []) if h]

        draft_id: str | None = None
        if persist:
            try:
                sb = supabase_admin()
                payload = {
                    "user_id": user_id,
                    "channel_id": channel_id,
                    "session_id": session_id,
                    "format": format,
                    "title": title,
                    "hook": hook,
                    "thesis": thesis,
                    "beats": beats,
                    "cta": cta,
                    "hashtags": hashtags,
                    "duration_seconds": duration_seconds,
                    "metadata": {"tone": tone, "source_idea": idea[:500]},
                    "generated_by": "content",
                    "model": settings.hermes_model_agent,
                    "status": "draft",
                }
                inserted = sb.table("content_drafts").insert(payload).execute()
                if inserted.data:
                    draft_id = inserted.data[0]["id"]
            except Exception as e:  # noqa: BLE001
                log.warning("draft persistence failed: %s", e)

        return {
            "draft_id": draft_id,
            "title": title,
            "hook": hook,
            "thesis": thesis,
            "beats": beats,
            "cta": cta,
            "hashtags": hashtags,
            "duration_seconds": duration_seconds,
            "format": format,
            "persisted": draft_id is not None,
        }
    except Exception as e:  # noqa: BLE001
        log.exception("write_script failed")
        return {"error": str(e)}


async def _list_drafts(user_id: str, status: str | None = None, limit: int = 20) -> dict[str, Any]:
    try:
        sb = supabase_admin()
        q = (
            sb.table("content_drafts")
            .select("id, title, format, status, hook, duration_seconds, updated_at")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .limit(max(1, min(100, limit)))
        )
        if status:
            q = q.eq("status", status)
        else:
            q = q.neq("status", "archived")
        res = q.execute()
        return {"drafts": res.data or []}
    except Exception as e:  # noqa: BLE001
        return {"error": str(e)}


register(
    ToolSpec(
        name="brainstorm_ideas",
        description=(
            "Generate N short-form content ideas for a topic. Returns a list of ideas with hook + thesis + "
            "novelty score. Use when the user asks for brainstorming, ideias, conceitos, or wants to scout "
            "content opportunities. Does NOT persist anything by itself."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "topic": {
                    "type": "string",
                    "description": "Tema / nicho / pergunta-mãe (português OK).",
                },
                "format": {
                    "type": "string",
                    "enum": sorted(ALLOWED_FORMATS),
                    "default": "short",
                },
                "count": {"type": "integer", "minimum": 1, "maximum": 20, "default": 10},
                "audience": {"type": "string"},
                "constraints": {"type": "string"},
            },
            "required": ["user_id", "topic"],
        },
        handler=_brainstorm_ideas,
    )
)

register(
    ToolSpec(
        name="write_script",
        description=(
            "Generate a full structured script for a faceless video — title, hook, thesis, "
            "beats array (with timing, captions, b-roll), CTA and hashtags. Persists the result as a "
            "content_drafts row by default so the user can pick it up in the Content workspace. "
            "Use when the user wants you to actually WRITE the script, not just brainstorm ideas."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "idea": {
                    "type": "string",
                    "description": "Hook + thesis or a freeform description of the video to write.",
                },
                "format": {
                    "type": "string",
                    "enum": sorted(ALLOWED_FORMATS),
                    "default": "short",
                },
                "duration_seconds": {
                    "type": "integer",
                    "minimum": 10,
                    "maximum": 900,
                    "default": 60,
                },
                "tone": {
                    "type": "string",
                    "description": "Tom da narrativa, e.g. 'misterioso e tenso', 'didático casual'.",
                },
                "channel_id": {
                    "type": "string",
                    "description": "UUID do canal-alvo (opcional, pra ligar o draft a um canal).",
                },
                "session_id": {"type": "string"},
                "persist": {"type": "boolean", "default": True},
            },
            "required": ["user_id", "idea"],
        },
        handler=_write_script,
    )
)

register(
    ToolSpec(
        name="list_content_drafts",
        description=(
            "List the user's content drafts (most recent first). Use when the user asks about their "
            "drafts, roteiros, or wants to pick one to render/publish."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "status": {
                    "type": "string",
                    "enum": ["draft", "approved", "rendering", "rendered", "published"],
                },
                "limit": {"type": "integer", "minimum": 1, "maximum": 100, "default": 20},
            },
            "required": ["user_id"],
        },
        handler=_list_drafts,
    )
)
