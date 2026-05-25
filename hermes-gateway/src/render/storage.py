"""Supabase Storage helpers for the render pipeline.

Layout: `renders/{user_id}/{render_id}/audio/{i}.mp3` and `renders/{user_id}/{render_id}/out.mp4`
RLS in the bucket restricts access to `auth.uid()::text` as the top folder.
"""
from __future__ import annotations

import logging
import mimetypes
from pathlib import Path

from ..config import get_settings
from ..connectors.supabase_client import supabase_admin

log = logging.getLogger(__name__)


def _bucket():
    s = get_settings()
    return supabase_admin().storage.from_(s.render_storage_bucket)


def upload_file(local_path: Path | str, dest_path: str, content_type: str | None = None) -> str:
    """Uploads a local file and returns the public/signed URL."""
    p = Path(local_path)
    if not p.exists():
        raise FileNotFoundError(p)
    ctype = content_type or (mimetypes.guess_type(p.name)[0] or "application/octet-stream")
    bucket = _bucket()
    with p.open("rb") as fh:
        bucket.upload(
            path=dest_path,
            file=fh,
            file_options={"content-type": ctype, "upsert": "true"},
        )
    # Public URL (bucket is private so a signed URL would be safer in prod; for
    # MVP we expose a long-lived signed URL — 7 days).
    res = bucket.create_signed_url(dest_path, 60 * 60 * 24 * 7)
    return res.get("signedURL") or res.get("signed_url") or ""


def upload_bytes(blob: bytes, dest_path: str, content_type: str) -> str:
    bucket = _bucket()
    bucket.upload(
        path=dest_path,
        file=blob,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    res = bucket.create_signed_url(dest_path, 60 * 60 * 24 * 7)
    return res.get("signedURL") or res.get("signed_url") or ""
