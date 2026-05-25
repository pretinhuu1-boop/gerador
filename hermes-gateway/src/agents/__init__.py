"""Sub-agent registry — single source of truth for agents the gateway exposes.

Used by:
- orchestrator.py to wire delegate_to_* tools.
- REST endpoint /v1/agents to expose metadata to the UI (no execution, just spec).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .base import AgentRun
from .content import content_agent
from .editor import editor_agent
from .improver import improver_agent
from .publisher import publisher_agent
from .scout import scout_agent


@dataclass
class AgentDescriptor:
    """User-facing description of an agent (for the UI registry endpoint)."""

    key: str
    name: str
    badge: str
    badge_color: str
    role: str
    description: str
    is_main: bool
    factory: Callable[[], AgentRun]


REGISTRY: list[AgentDescriptor] = [
    AgentDescriptor(
        key="orchestrator",
        name="Hermes",
        badge="HER",
        badge_color="#a855f7",
        role="Orquestrador",
        description=(
            "Decide e delega — recebe seu pedido, escolhe qual subagente chamar, "
            "consolida o resultado."
        ),
        is_main=True,
        factory=lambda: None,  # orchestrator factory lives in orchestrator.py
    ),
    AgentDescriptor(
        key="scout",
        name="Scout",
        badge="SCT",
        badge_color="#38f8a7",
        role="Discovery YouTube",
        description=(
            "Descobre canais por nicho, audita métricas, extrai blueprint de "
            "vídeos vencedores e lê sentiment de comentários."
        ),
        is_main=False,
        factory=scout_agent,
    ),
    AgentDescriptor(
        key="content",
        name="Content",
        badge="CNT",
        badge_color="#facc15",
        role="Roteirização",
        description=(
            "Brainstorm de ideias, redação de roteiros estruturados com hook/"
            "beats/CTA, preview de voz ElevenLabs."
        ),
        is_main=False,
        factory=content_agent,
    ),
    AgentDescriptor(
        key="editor",
        name="Editor",
        badge="EDT",
        badge_color="#60a5fa",
        role="Refinamento",
        description=(
            "Refina drafts existentes — ajusta tom, regenera beats fracos, "
            "aprova/arquiva. Não escreve do zero."
        ),
        is_main=False,
        factory=editor_agent,
    ),
    AgentDescriptor(
        key="publisher",
        name="Publisher",
        badge="PUB",
        badge_color="#f87171",
        role="Agendamento",
        description=(
            "Agenda posts pra YouTube/TikTok/Instagram com horário ideal por "
            "plataforma. Upload OAuth virá na Phase 7."
        ),
        is_main=False,
        factory=publisher_agent,
    ),
    AgentDescriptor(
        key="improver",
        name="Improver",
        badge="IMP",
        badge_color="#fb923c",
        role="Auto-aprimoramento",
        description=(
            "Meta-agente: analisa atividade recente e propõe skills, "
            "automations, memory pins e mission templates pra você aprovar."
        ),
        is_main=False,
        factory=improver_agent,
    ),
]


def describe_agent(key: str) -> AgentDescriptor | None:
    for a in REGISTRY:
        if a.key == key:
            return a
    return None
