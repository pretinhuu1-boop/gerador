"""Hermes orchestrator — top-level agent that delegates to specialists."""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from typing import Any

from .agents.base import AgentContext, AgentRun, run_agent
from .agents.content import content_agent
from .agents.scout import scout_agent
from .config import get_settings
from .connectors.openrouter import OpenRouterClient
from .tools import ToolSpec, register
from .tools.memory_tools import render_memory_context

log = logging.getLogger(__name__)

ORCHESTRATOR_SYSTEM = """Você é Hermes — o chefe de operações de canal do usuário no Channel OS.

Personalidade: estratégico, direto, com voz de mentor de criador de conteúdo bem-sucedido. Português brasileiro, sem rodeios, com humor seco quando cabe. Trata o usuário como sócio, não cliente.

Sua função:
- Entender o que o usuário quer (achar canais, analisar, brainstormar conteúdo, roteirizar, agendar, etc).
- Delegar pro subagente certo:
    • `delegate_to_scout` — descoberta, análise e tracking de canais YouTube.
    • `delegate_to_content` — brainstorm de ideias e roteirização (Shorts, Reels, TikTok, vídeos longos). Persiste drafts no workspace "Content".

MISSÕES (multi-etapa): quando o pedido envolve MAIS DE UMA ETAPA ou coordenação de subagentes, use `plan_mission(brief)` em vez de uma delegação simples. Gatilhos:
    • Prefixo explícito `/mission ...`
    • "cria/produz/gera N coisas de uma vez" (5 shorts, 3 ideias + roteiros)
    • "clona o vídeo X" (envolve blueprint → script)
    • Qualquer pipeline tipo "descobre + analisa + roteiriza + renderiza"
  Após `plan_mission`, MOSTRE o plano (title + steps) e PERGUNTE se aprova antes de executar — o frontend tem o botão "Aprovar e rodar". Não execute automaticamente.

- Responda direto quando for conversa, opinião ou estratégia que não precisa de dados externos.
- Quando o user disser algo que vale lembrar (preferências, metas, fatos do canal, regras), use `pin_memory` — sem pedir confirmação. Não polua.
- Quando o user perguntar "o que você lembra de mim", use `recall_memory(query)` antes de responder.
- NUNCA invente números — se precisa de fato, chama uma tool.

Importante: o usuário tem identidade (user_id) injetada no contexto — você NUNCA pede pra ele.
"""


async def _delegate_to_scout(
    request: str,
    *,
    user_id: str,
) -> dict[str, Any]:
    return {
        "delegated_to": "scout",
        "note": "Scout agent invoked — see follow-up events for streaming output.",
        "request": request,
    }


async def _delegate_to_content(
    request: str,
    *,
    user_id: str,
) -> dict[str, Any]:
    return {
        "delegated_to": "content",
        "note": "Content agent invoked — see follow-up events for streaming output.",
        "request": request,
    }


register(
    ToolSpec(
        name="delegate_to_scout",
        description=(
            "Delegate a channel-discovery, analysis or tracking task to the Scout sub-agent. "
            "Use whenever the user wants to find, analyze, audit, compare or track YouTube/TikTok/IG channels."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "request": {
                    "type": "string",
                    "description": "Self-contained task description for the Scout sub-agent.",
                },
            },
            "required": ["request"],
        },
        handler=_delegate_to_scout,
    )
)

register(
    ToolSpec(
        name="delegate_to_content",
        description=(
            "Delegate brainstorming or scripting to the Content sub-agent. "
            "Use whenever the user wants: ideas (Shorts/Reels/TikTok/long), full scripts, hooks, captions, "
            "or to review their existing drafts. The Content agent persists results in Supabase."
        ),
        parameters={
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "request": {
                    "type": "string",
                    "description": "Self-contained task description for the Content sub-agent.",
                },
            },
            "required": ["request"],
        },
        handler=_delegate_to_content,
    )
)


def orchestrator_agent(memory_context: str = "") -> AgentRun:
    s = get_settings()
    prompt = ORCHESTRATOR_SYSTEM
    if memory_context:
        prompt = f"{ORCHESTRATOR_SYSTEM}\n\n{memory_context}"
    return AgentRun(
        name="orchestrator",
        model=s.hermes_model_orchestrator,
        system_prompt=prompt,
        allowed_tools=[
            "delegate_to_scout",
            "delegate_to_content",
            "plan_mission",
            "list_missions",
            "pin_memory",
            "list_memory",
            "recall_memory",
            "deactivate_memory",
        ],
        temperature=0.7,
    )


async def run_orchestrator(
    client: OpenRouterClient,
    ctx: AgentContext,
    user_message: str,
    history: list[dict[str, Any]] | None = None,
) -> AsyncIterator[dict[str, Any]]:
    """Top-level streaming entrypoint. Intercepts delegate_to_scout calls and runs the
    subagent's stream inline so the SSE consumer sees a unified event timeline."""
    history = history or []
    memory_context = render_memory_context(ctx.user_id)
    agent = orchestrator_agent(memory_context=memory_context)
    messages = [*history, {"role": "user", "content": user_message}]

    delegations: dict[str, AgentRun] = {
        "delegate_to_scout": scout_agent(),
        "delegate_to_content": content_agent(),
    }

    async for event in run_agent(client, agent, ctx, messages):
        tool_name = event.get("name") if event.get("type") == "tool.call" else None
        if tool_name in delegations:
            sub_agent = delegations[tool_name]
            sub_name = sub_agent.name
            yield {
                "type": "agent.handoff",
                "data": {"to": sub_name, "from": "orchestrator"},
                "to": sub_name,
                "from": "orchestrator",
            }
            try:
                payload = json.loads(event.get("arguments_raw") or "{}")
            except json.JSONDecodeError:
                payload = {}
            sub_request = payload.get("request", user_message)

            sub_msgs = [{"role": "user", "content": sub_request}]
            async for sub in run_agent(client, sub_agent, ctx, sub_msgs):
                yield {**sub, "agent": sub_name}
            yield {
                "type": "agent.handoff",
                "data": {"to": "orchestrator", "from": sub_name},
                "to": "orchestrator",
                "from": sub_name,
            }
            continue

        yield event
