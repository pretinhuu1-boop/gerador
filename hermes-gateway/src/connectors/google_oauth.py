"""Google OAuth 2.0 web flow + YouTube Data API v3 resumable upload.

Flow:
    1. Frontend → GET /v1/oauth/google/start  → 302 to Google consent screen
       with state = base64(user_id).
    2. Google → GET /v1/oauth/google/callback?code=...&state=...
    3. We exchange code for access+refresh tokens, persist in
       oauth_connections, then 302 back to the frontend.
    4. On upload: read connection, refresh access token if expired, then call
       /upload/youtube/v3/videos with resumable protocol.

Required Google Cloud setup (one-time, by the user):
    1. Create OAuth client ID (type Web application) at
       https://console.cloud.google.com/apis/credentials.
    2. Add redirect URI matching GOOGLE_OAUTH_REDIRECT_URI env var.
    3. Enable YouTube Data API v3.
    4. Add scope `https://www.googleapis.com/auth/youtube.upload` (and
       `youtube.readonly` for channel metadata).
"""
from __future__ import annotations

import base64
import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import httpx

from ..config import get_settings

log = logging.getLogger(__name__)

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
YOUTUBE_API = "https://www.googleapis.com/youtube/v3"
YOUTUBE_UPLOAD = "https://www.googleapis.com/upload/youtube/v3/videos"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
]


class GoogleOAuthError(RuntimeError):
    pass


def authorize_url(user_id: str) -> str:
    """Build the consent URL with state = base64(user_id) so the callback
    can attribute the token to the right user."""
    s = get_settings()
    if not s.google_oauth_client_id:
        raise GoogleOAuthError("GOOGLE_OAUTH_CLIENT_ID not configured")
    params = {
        "client_id": s.google_oauth_client_id,
        "redirect_uri": s.google_oauth_redirect_uri,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",     # → refresh_token
        "prompt": "consent",          # force refresh_token on re-auth
        "state": base64.urlsafe_b64encode(user_id.encode()).decode().rstrip("="),
    }
    return f"{AUTH_URL}?{urlencode(params)}"


def parse_state(state: str) -> str:
    """Reverse authorize_url state. Adds padding because we strip it for URL safety."""
    pad = "=" * ((4 - len(state) % 4) % 4)
    return base64.urlsafe_b64decode(state + pad).decode()


async def exchange_code(code: str) -> dict[str, Any]:
    """Trade auth code for access+refresh tokens."""
    s = get_settings()
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            TOKEN_URL,
            data={
                "code": code,
                "client_id": s.google_oauth_client_id,
                "client_secret": s.google_oauth_client_secret,
                "redirect_uri": s.google_oauth_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
    if r.status_code >= 400:
        raise GoogleOAuthError(f"Token exchange {r.status_code}: {r.text[:300]}")
    return r.json()


async def refresh_access_token(refresh_token: str) -> dict[str, Any]:
    """Use a stored refresh_token to mint a new access_token."""
    s = get_settings()
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            TOKEN_URL,
            data={
                "refresh_token": refresh_token,
                "client_id": s.google_oauth_client_id,
                "client_secret": s.google_oauth_client_secret,
                "grant_type": "refresh_token",
            },
        )
    if r.status_code >= 400:
        raise GoogleOAuthError(f"Token refresh {r.status_code}: {r.text[:300]}")
    return r.json()


async def fetch_channel_info(access_token: str) -> dict[str, Any] | None:
    """channels.list(mine=true) — returns the connected user's primary channel."""
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(
            f"{YOUTUBE_API}/channels",
            params={"part": "snippet,statistics", "mine": "true"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if r.status_code >= 400:
        raise GoogleOAuthError(f"channels.list {r.status_code}: {r.text[:300]}")
    items = r.json().get("items") or []
    if not items:
        return None
    return items[0]


async def upload_video(
    access_token: str,
    mp4_path: Path,
    *,
    title: str,
    description: str,
    tags: list[str] | None = None,
    category_id: str = "22",  # People & Blogs
    privacy_status: str = "private",  # 'private' | 'unlisted' | 'public'
    made_for_kids: bool = False,
) -> dict[str, Any]:
    """Resumable upload — initiate session → PUT video bytes → returns Videos resource.

    For MP4 ≤ 100MB this is straightforward. For larger files, this still works
    (HTTP chunked) but production should use proper chunk-by-chunk uploads.
    """
    size = mp4_path.stat().st_size
    metadata = {
        "snippet": {
            "title": title[:100],   # YouTube max
            "description": description[:5000],
            "tags": (tags or [])[:30],
            "categoryId": category_id,
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": made_for_kids,
        },
    }

    init_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=utf-8",
        "X-Upload-Content-Length": str(size),
        "X-Upload-Content-Type": "video/mp4",
    }

    async with httpx.AsyncClient(timeout=600.0) as client:
        # Step 1: initiate resumable upload session
        init = await client.post(
            f"{YOUTUBE_UPLOAD}?uploadType=resumable&part=snippet,status",
            headers=init_headers,
            content=json.dumps(metadata),
        )
        if init.status_code not in (200, 201):
            raise GoogleOAuthError(f"upload init {init.status_code}: {init.text[:300]}")
        session_url = init.headers.get("Location")
        if not session_url:
            raise GoogleOAuthError("upload init returned no Location header")

        # Step 2: upload all bytes in a single PUT (good for ≤ ~256MB).
        with mp4_path.open("rb") as f:
            put = await client.put(
                session_url,
                content=f.read(),
                headers={
                    "Content-Length": str(size),
                    "Content-Type": "video/mp4",
                },
            )
    if put.status_code not in (200, 201):
        raise GoogleOAuthError(f"upload PUT {put.status_code}: {put.text[:300]}")
    return put.json()


def access_token_expired(expires_at: str | None) -> bool:
    if not expires_at:
        return True
    try:
        exp = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    except Exception:  # noqa: BLE001
        return True
    # Refresh 60s before the actual expiry to avoid edge races.
    return exp - timedelta(seconds=60) <= datetime.now(timezone.utc)
