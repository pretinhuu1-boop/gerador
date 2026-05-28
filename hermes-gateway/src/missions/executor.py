"""Mission step executor — runs steps sequentially, respecting depends_on.

For each pending step we:
1. Resolve the tool from the registry.
2. Inject user_id (always) + outputs from upstream steps where args reference them.
3. Call the tool handler.
4. Patch the step row with result/error/timing.
5. Aggregate results into mission.outputs and update progress.

When all steps land in a terminal state, the mission row flips to 'done'/'error'.
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from ..connectors.supabase_client import supabase_admin
from ..tools import REGISTRY, get as get_tool

log = logging.getLogger(__name__)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _update_step(step_id: str, **patch: Any) -> None:
    try:
        supabase_admin().table("hermes_mission_steps").update(patch).eq("id", step_id).execute()
    except Exception as e:  # noqa: BLE001
        log.warning("update_step failed: %s", e)


def _update_mission(mission_id: str, **patch: Any) -> None:
    try:
        supabase_admin().table("hermes_missions").update(patch).eq("id", mission_id).execute()
    except Exception as e:  # noqa: BLE001
        log.warning("update_mission failed: %s", e)


def _aggregate_outputs(current: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    """Merge per-step result into the mission's outputs jsonb. Pulls a few
    well-known keys into top-level arrays for the UI."""
    out = dict(current or {})
    for key in ("draft_id", "channel_id", "render_id", "mission_id", "pin_id"):
        if key in result:
            list_key = f"{key.split('_')[0]}_ids"  # draft_id -> draft_ids
            out.setdefault(list_key, []).append(result[key])
    # Stash the raw result for debugging
    out.setdefault("steps_results", []).append(result)
    return out


async def run_mission(mission_id: str) -> None:
    """Top-level entry point — fire and forget. Updates mission + steps in place."""
    sb = supabase_admin()
    try:
        m_resp = (
            sb.table("hermes_missions")
            .select("*")
            .eq("id", mission_id)
            .maybe_single()
            .execute()
        )
        mission = m_resp.data if m_resp else None
        if not mission:
            log.warning("mission %s not found", mission_id)
            return
        if mission["status"] in {"running", "done", "cancelled"}:
            log.info("mission %s already in terminal/running state: %s", mission_id, mission["status"])
            return
    except Exception as e:  # noqa: BLE001
        log.exception("bootstrap failed for %s: %s", mission_id, e)
        return

    user_id = mission["user_id"]
    outputs = dict(mission.get("outputs") or {})

    _update_mission(
        mission_id,
        status="running",
        started_at=_now(),
        progress=1,
    )

    try:
        steps_resp = (
            sb.table("hermes_mission_steps")
            .select("*")
            .eq("mission_id", mission_id)
            .order("step_index")
            .execute()
        )
        steps = steps_resp.data or []
    except Exception as e:  # noqa: BLE001
        log.exception("steps load failed")
        _update_mission(mission_id, status="error", ended_at=_now())
        return

    total = len(steps) or 1
    done = 0
    any_error = False

    for step in steps:
        if step["status"] in {"done", "skipped", "cancelled"}:
            done += 1
            continue
        step_id = step["id"]
        idx = step["step_index"]
        tool_name = step.get("tool_name")
        args = dict(step.get("tool_args") or {})
        args["user_id"] = user_id  # always

        _update_step(step_id, status="running", started_at=_now())
        _update_mission(
            mission_id,
            progress=min(99, int((done / total) * 100) + 5),
        )

        spec = get_tool(tool_name) if tool_name else None
        if not spec:
            err = f"tool {tool_name!r} not registered (have {list(REGISTRY)[:10]}...)"
            _update_step(step_id, status="error", error=err, ended_at=_now())
            any_error = True
            done += 1
            continue

        # Trim unexpected args based on the tool's schema, but keep required ones.
        params = spec.parameters.get("properties", {})
        if params:
            args = {k: v for k, v in args.items() if k in params}
            args["user_id"] = user_id

        try:
            result = await spec.handler(**args)
            if isinstance(result, dict) and result.get("error"):
                _update_step(
                    step_id,
                    status="error",
                    result=result,
                    error=str(result.get("error"))[:1000],
                    ended_at=_now(),
                )
                any_error = True
            else:
                _update_step(
                    step_id,
                    status="done",
                    result=result if isinstance(result, dict) else {"value": result},
                    ended_at=_now(),
                )
                if isinstance(result, dict):
                    outputs = _aggregate_outputs(outputs, result)
        except Exception as e:  # noqa: BLE001
            log.exception("step %s failed", step_id)
            _update_step(step_id, status="error", error=str(e)[:1000], ended_at=_now())
            any_error = True

        done += 1
        _update_mission(
            mission_id,
            done_steps=done,
            outputs=outputs,
            progress=min(99, int((done / total) * 100)),
        )

    _update_mission(
        mission_id,
        status="error" if any_error else "done",
        progress=100,
        done_steps=done,
        ended_at=_now(),
        outputs=outputs,
    )
    log.info(
        "mission %s finished: status=%s done=%d/%d",
        mission_id,
        "error" if any_error else "done",
        done,
        total,
    )


def schedule(mission_id: str) -> None:
    """Schedule run_mission on the current event loop without awaiting it."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(run_mission(mission_id))
    except RuntimeError:
        # No running loop — caller should handle (FastAPI BackgroundTasks will).
        pass
