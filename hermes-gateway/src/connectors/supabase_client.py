"""Supabase service-role client (server-side, bypasses RLS — use carefully)."""
from __future__ import annotations

import logging
from functools import lru_cache

from supabase import Client, create_client

from ..config import get_settings

log = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def supabase_admin() -> Client:
    s = get_settings()
    if not s.supabase_url or not s.supabase_service_role_key:
        log.warning("Supabase service role missing — DB operations will fail")
    return create_client(s.supabase_url, s.supabase_service_role_key)
