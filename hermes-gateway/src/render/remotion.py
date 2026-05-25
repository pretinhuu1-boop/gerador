"""Subprocess wrapper around `npx remotion render`."""
from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
from pathlib import Path
from typing import Any

from ..config import get_settings

log = logging.getLogger(__name__)


class RemotionError(RuntimeError):
    pass


async def render(
    composition_id: str,
    props: dict[str, Any],
    out_path: Path,
    duration_in_frames: int,
    width: int = 1080,
    height: int = 1920,
    fps: int = 30,
) -> Path:
    """Invokes `npx remotion render` and returns the produced MP4 path.

    Layout assumed inside the gateway image:
      /app/remotion/Root.tsx (or env override RENDER_REMOTION_ENTRY)
    """
    s = get_settings()
    entry = s.render_remotion_entry
    if not Path(entry).exists():
        raise RemotionError(f"Remotion entry not found at {entry}")

    if not shutil.which(s.render_node_bin):
        raise RemotionError(f"node binary {s.render_node_bin!r} not on PATH")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    props_arg = json.dumps(props)

    cmd = [
        s.render_node_bin,
        "remotion",
        "render",
        entry,
        composition_id,
        str(out_path),
        f"--props={props_arg}",
        f"--width={width}",
        f"--height={height}",
        f"--fps={fps}",
        f"--frames=0-{max(1, duration_in_frames - 1)}",
        "--concurrency=2",
        "--log=info",
    ]
    log.info("remotion render: %s", " ".join(cmd[:6]) + " ...")

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env={**os.environ},
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        tail = (stderr or stdout or b"").decode(errors="ignore")[-2000:]
        raise RemotionError(f"npx remotion render exited {proc.returncode}: {tail}")
    if not out_path.exists():
        raise RemotionError("render exited 0 but output file is missing")
    return out_path
