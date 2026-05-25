"""Video template registry — single source of truth for Remotion compositions
the Channel OS can render.

Each TemplateDescriptor exposes everything the LLM needs to recommend a
template by brief: id (matches Remotion composition id), label, format,
duration knobs, recommended_for (niches/use cases), example briefs, and
props_schema (what we pass in).

UI reads the same registry via GET /v1/templates so the Content workspace
can show a picker without duplicating metadata.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field


@dataclass
class TemplateDescriptor:
    """User-facing description of a Remotion composition."""

    id: str  # matches <Composition id> in remotion/Root.tsx
    label: str
    short_label: str
    badge_color: str
    aspect_ratio: str  # '9:16' | '1:1' | '16:9'
    width: int
    height: int
    fps: int
    default_duration_seconds: int
    recommended_for: list[str]  # niche/format hints
    description: str
    example_briefs: list[str] = field(default_factory=list)
    requires_audio: bool = False
    requires_b_roll: bool = False
    status: str = "stable"  # 'stable' | 'beta' | 'experimental'

    def to_dict(self) -> dict:
        return asdict(self)


REGISTRY: list[TemplateDescriptor] = [
    TemplateDescriptor(
        id="StoriesVertical",
        label="Stories Vertical",
        short_label="Stories",
        badge_color="#a855f7",
        aspect_ratio="9:16",
        width=1080,
        height=1920,
        fps=30,
        default_duration_seconds=30,
        recommended_for=[
            "scary stories",
            "history mistério",
            "true crime curto",
            "fact dump",
            "conspiração",
            "Shorts genéricos faceless",
        ],
        description=(
            "Template padrão multi-uso pra Shorts/Reels faceless. Hook destacado nos "
            "primeiros 2.5s, beats com caption pill + texto grande, b-roll renderizado "
            "como overlay textual quando presente, CTA final."
        ),
        example_briefs=[
            "60s sobre uma cidade que desapareceu em 1985",
            "30s explicando por que dragões aparecem em todas as culturas",
        ],
    ),
    TemplateDescriptor(
        id="RedditStories",
        label="Reddit Stories",
        short_label="Reddit",
        badge_color="#ff4500",
        aspect_ratio="9:16",
        width=1080,
        height=1920,
        fps=30,
        default_duration_seconds=38,
        recommended_for=[
            "AITA",
            "Reddit storytelling",
            "confession threads",
            "relationship drama",
            "revenge stories",
            "narrativa em primeira pessoa",
        ],
        description=(
            "Header com card de post Reddit (subreddit + author + upvotes + comments), "
            "depois beats como capítulos numerados (parte N de M) com caption pill. "
            "Aceita campos extras: subreddit, author, upvotes, commentCount."
        ),
        example_briefs=[
            "AITA por contar pra família que meu irmão clonou minha vida?",
            "Subreddit r/pettyrevenge: vingança contra vizinho barulhento",
        ],
    ),
    TemplateDescriptor(
        id="TopList",
        label="Top List (countdown)",
        short_label="Top N",
        badge_color="#facc15",
        aspect_ratio="9:16",
        width=1080,
        height=1920,
        fps=30,
        default_duration_seconds=30,
        recommended_for=[
            "top 10",
            "top 5",
            "ranking",
            "richest/scariest/oldest X",
            "best of",
            "countdown listicle",
        ],
        description=(
            "Countdown N→1 com número gigante por item (#1 vira hero), caption + "
            "descrição. Aceita campo extra `countdownDirection: 'desc'|'asc'`. Cada "
            "beat = 1 ranking. Hook anuncia 'Top N' antes dos itens."
        ),
        example_briefs=[
            "Top 5 conspirações que se provaram reais",
            "Top 7 lugares mais assombrados do Brasil",
        ],
    ),
    TemplateDescriptor(
        id="Audiogram",
        label="Audiogram",
        short_label="Audio",
        badge_color="#22d3a8",
        aspect_ratio="9:16",
        width=1080,
        height=1920,
        fps=30,
        default_duration_seconds=28,
        recommended_for=[
            "podcast clip",
            "ASMR voiceover",
            "sleep story",
            "motivational quote",
            "audiobook teaser",
            "narração com música",
        ],
        description=(
            "Waveform reativo (FFT real via visualizeAudio quando audioSrc é passado, "
            "procedural caso contrário) no centro, hook flutuando no topo, captions de "
            "beats deslizando do fundo. Pra ASMR/sleep, audioSrc opcional pra mixar "
            "música. Aceita `speakerLabel` (rótulo do episódio)."
        ),
        example_briefs=[
            "Por que dormimos pior quando estamos felizes?",
            "Audiobook teaser: capítulo 1 de 'The Quiet Architect'",
        ],
        requires_audio=False,
    ),
]


def get_template(template_id: str) -> TemplateDescriptor | None:
    for t in REGISTRY:
        if t.id == template_id:
            return t
    return None
