"""JWT verification for Supabase-issued tokens."""
from __future__ import annotations

from dataclasses import dataclass

import jwt
from fastapi import HTTPException, Request, status

from .config import get_settings


@dataclass
class AuthIdentity:
    user_id: str
    email: str | None
    raw_token: str


def authenticate_request(request: Request) -> AuthIdentity:
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing bearer token")
    token = auth_header.split(" ", 1)[1].strip()

    s = get_settings()
    secret = s.supabase_jwt_secret
    options = {"verify_aud": False}
    try:
        if secret:
            claims = jwt.decode(token, secret, algorithms=["HS256"], options=options)
        else:
            # MVP dev path: decode without signature verification.
            claims = jwt.decode(token, options={"verify_signature": False, **options})
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"invalid jwt: {e}")

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="jwt missing sub claim")
    return AuthIdentity(user_id=user_id, email=claims.get("email"), raw_token=token)
