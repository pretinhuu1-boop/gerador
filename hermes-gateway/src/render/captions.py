"""Caption helpers — converts ElevenLabs character-level alignment into
word-level caption arrays compatible with @remotion/captions.

Caption shape (matches `Caption` type from @remotion/captions):
    {
        "text": "Hello",      # the word
        "startMs": 0,
        "endMs": 320,
        "timestampMs": 160,    # midpoint, used by some viz primitives
        "confidence": null     # we don't expose Whisper confidence here
    }
"""
from __future__ import annotations

from typing import Any


def chars_to_words(alignment: dict[str, Any], time_offset_s: float = 0.0) -> list[dict[str, Any]]:
    """Group ElevenLabs per-character timing into per-word captions.

    `alignment` is what ElevenLabs returns under `alignment` or
    `normalized_alignment` — it has three parallel arrays of equal length:
        - characters: list[str]
        - character_start_times_seconds: list[float]
        - character_end_times_seconds: list[float]

    A "word" is any run of non-whitespace characters between whitespace
    boundaries. Punctuation stays glued to the adjacent word. `time_offset_s`
    shifts all word timings (used to align beat audio inside the global render
    timeline).
    """
    chars: list[str] = alignment.get("characters") or []
    starts: list[float] = alignment.get("character_start_times_seconds") or []
    ends: list[float] = alignment.get("character_end_times_seconds") or []

    if not (chars and starts and ends and len(chars) == len(starts) == len(ends)):
        return []

    words: list[dict[str, Any]] = []
    cur_buf: list[str] = []
    cur_start: float | None = None
    cur_end: float = 0.0

    def flush() -> None:
        nonlocal cur_buf, cur_start, cur_end
        if cur_buf and cur_start is not None:
            text = "".join(cur_buf).strip()
            if text:
                start_ms = int(round((cur_start + time_offset_s) * 1000))
                end_ms = int(round((cur_end + time_offset_s) * 1000))
                words.append(
                    {
                        "text": text,
                        "startMs": start_ms,
                        "endMs": max(end_ms, start_ms + 1),
                        "timestampMs": (start_ms + end_ms) // 2,
                        "confidence": None,
                    }
                )
        cur_buf = []
        cur_start = None
        cur_end = 0.0

    for ch, st, en in zip(chars, starts, ends):
        if ch.isspace():
            flush()
            continue
        if cur_start is None:
            cur_start = float(st)
        cur_buf.append(ch)
        cur_end = float(en)
    flush()
    return words
