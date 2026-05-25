"""Per-template props builder.

Each Remotion composition in `remotion/Root.tsx` has its own props contract
(see remotion/compositions/*.tsx). Centralizing the mapping here keeps the
pipeline thin: it only needs to load draft + audio, then ask `build_props`
for the right shape.

Template-specific fields (subreddit, countdownDirection, audioSrc, etc) are
picked up from `draft.metadata['template_props']` when present, with sensible
defaults otherwise.

NOTE: the current TSX compositions are static-duration (each beat ranges by
char-length budget). Once we move them to `calculateMetadata` + per-beat
audio durations we'll start passing `audio_url` + `t` per beat through these
builders. For now those fields are tolerated by the compositions but unused.
"""
from __future__ import annotations

from typing import Any

from ..templates import REGISTRY, get_template

DEFAULT_ACCENT = "#a855f7"


def _template_props(draft: dict[str, Any]) -> dict[str, Any]:
    """Extras the user/agent stashed for the template (subreddit, author, etc).

    Stored under `draft.metadata.template_props` so we don't need a dedicated
    column per template variant.
    """
    md = draft.get("metadata") or {}
    extras = md.get("template_props") if isinstance(md, dict) else None
    return extras if isinstance(extras, dict) else {}


def _base_props(
    draft: dict[str, Any],
    *,
    hook: str,
    beats_with_t: list[dict[str, Any]],
    hook_audio_url: str | None,
    accent: str,
) -> dict[str, Any]:
    return {
        "title": draft.get("title") or "Untitled",
        "hook": hook or None,
        "hookAudioUrl": hook_audio_url,
        "beats": beats_with_t,
        "cta": draft.get("cta"),
        "brand": "channel os",
        "accentColor": accent,
    }


def build_props(
    template_id: str,
    *,
    draft: dict[str, Any],
    hook: str,
    beats_with_t: list[dict[str, Any]],
    hook_audio_url: str | None,
) -> dict[str, Any]:
    """Returns the inputProps dict for `npx remotion render` given a template."""
    t = get_template(template_id)
    accent = t.badge_color if t else DEFAULT_ACCENT
    base = _base_props(
        draft,
        hook=hook,
        beats_with_t=beats_with_t,
        hook_audio_url=hook_audio_url,
        accent=accent,
    )
    extras = _template_props(draft)

    if template_id == "RedditStories":
        return {
            **base,
            "subreddit": extras.get("subreddit", "r/AmItheAsshole"),
            "author": extras.get("author", "u/throwaway_2026"),
            "upvotes": int(extras.get("upvotes", 12400) or 12400),
            "commentCount": int(extras.get("commentCount", 387) or 387),
        }

    if template_id == "TopList":
        return {
            **base,
            "countdownDirection": extras.get("countdownDirection", "desc"),
        }

    if template_id == "Audiogram":
        return {
            **base,
            # Pass the hook MP3 as audioSrc so visualizeAudio reacts to the narration.
            # The composition will fall back to a procedural waveform when null.
            "audioSrc": extras.get("audioSrc") or hook_audio_url,
            "speakerLabel": extras.get("speakerLabel"),
        }

    # default = StoriesVertical
    return base


def template_dimensions(template_id: str) -> tuple[int, int, int]:
    """(width, height, fps) for a template id. Falls back to 1080×1920 30fps."""
    t = get_template(template_id)
    if not t:
        return 1080, 1920, 30
    return t.width, t.height, t.fps


def known_template_ids() -> list[str]:
    return [t.id for t in REGISTRY]
