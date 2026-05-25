"""Tool registry — single source of truth for callable tools exposed to LLM agents."""
from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any

ToolFn = Callable[..., Awaitable[Any]]


@dataclass
class ToolSpec:
    name: str
    description: str
    parameters: dict[str, Any]
    handler: ToolFn

    def openai_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }


REGISTRY: dict[str, ToolSpec] = {}


def register(spec: ToolSpec) -> ToolSpec:
    REGISTRY[spec.name] = spec
    return spec


def get(name: str) -> ToolSpec | None:
    return REGISTRY.get(name)


def schemas(names: list[str] | None = None) -> list[dict[str, Any]]:
    items = REGISTRY.values() if names is None else (s for s in REGISTRY.values() if s.name in names)
    return [s.openai_schema() for s in items]


# trigger registrations on import
from . import youtube_tools  # noqa: E402, F401
from . import scout_tools  # noqa: E402, F401
from . import memory_tools  # noqa: E402, F401
from . import content_tools  # noqa: E402, F401
from . import voice_tools  # noqa: E402, F401
from . import youtube_discovery_tools  # noqa: E402, F401
from . import mission_tools  # noqa: E402, F401
from . import editor_tools  # noqa: E402, F401
from . import publisher_tools  # noqa: E402, F401
from . import improver_tools  # noqa: E402, F401
from . import knowledge_tools  # noqa: E402, F401
from . import template_tools  # noqa: E402, F401
from . import trending_tools  # noqa: E402, F401
