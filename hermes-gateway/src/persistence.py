"""Server-side persistence helpers for Hermes sessions/messages."""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from .connectors.supabase_client import supabase_admin

log = logging.getLogger(__name__)


def ensure_session(user_id: str, session_id: str | None, workspace: str) -> str | None:
    """Returns a session id. Creates a new session if `session_id` is missing or invalid."""
    try:
        sb = supabase_admin()
        if session_id:
            # Verify the session belongs to this user; otherwise create a fresh one.
            res = (
                sb.table("hermes_sessions")
                .select("id")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .maybe_single()
                .execute()
            )
            if res.data:
                return session_id
        created = (
            sb.table("hermes_sessions")
            .insert(
                {
                    "user_id": user_id,
                    "workspace_kind": workspace if workspace in {
                        "scout",
                        "content",
                        "channel",
                        "publisher",
                        "mixed",
                    } else "mixed",
                }
            )
            .execute()
        )
        return created.data[0]["id"] if created.data else None
    except Exception as e:  # noqa: BLE001
        log.warning("ensure_session failed: %s", e)
        return session_id  # best-effort fallback


def save_message(
    *,
    session_id: str | None,
    user_id: str,
    role: str,
    content: str | None = None,
    tool_calls: list[dict[str, Any]] | None = None,
    tool_call_id: str | None = None,
    agent_name: str | None = None,
    model: str | None = None,
    usage: dict[str, Any] | None = None,
) -> None:
    """Best-effort persistence — silently logs on failure to never break the chat stream."""
    if not session_id:
        return
    try:
        sb = supabase_admin()
        sb.table("hermes_messages").insert(
            {
                "session_id": session_id,
                "user_id": user_id,
                "role": role,
                "content": (content or None) and content[:20_000],
                "tool_calls": tool_calls,
                "tool_call_id": tool_call_id,
                "agent_name": agent_name,
                "model": model,
                "usage": usage,
            }
        ).execute()
        sb.table("hermes_sessions").update(
            {"last_message_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", session_id).execute()
    except Exception as e:  # noqa: BLE001
        log.warning("save_message failed: %s", e)


def serialize_tool_calls(buffered: dict[int, dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert the per-round tool_calls buffer to a JSON-safe shape."""
    out = []
    for tc in buffered.values():
        try:
            args = json.loads(tc.get("arguments") or "{}")
        except json.JSONDecodeError:
            args = {"_raw": tc.get("arguments")}
        out.append({"id": tc.get("id"), "name": tc.get("name"), "arguments": args})
    return out
