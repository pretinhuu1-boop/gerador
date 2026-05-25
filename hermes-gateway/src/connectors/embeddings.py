"""Text embeddings — Gemini text-embedding-004 (768d).

Using Gemini because we already have the key, the host is reachable from the
container, and the 768d output keeps pgvector indexes light without sacrificing
recall for short memory pins.
"""
from __future__ import annotations

import logging

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from ..config import get_settings

log = logging.getLogger(__name__)

BASE = "https://generativelanguage.googleapis.com/v1beta"


class EmbeddingError(RuntimeError):
    pass


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type(httpx.TransportError),
    reraise=True,
)
async def embed_text(text: str, task_type: str = "SEMANTIC_SIMILARITY") -> list[float]:
    """Returns a 768d embedding for the input text via Gemini text-embedding-004."""
    s = get_settings()
    if not s.gemini_api_key:
        raise EmbeddingError("GEMINI_API_KEY not configured")
    if not text or not text.strip():
        raise EmbeddingError("text is required")

    payload = {
        "model": f"models/{s.gemini_embedding_model}",
        "content": {"parts": [{"text": text[:8000]}]},
        "taskType": task_type,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            f"{BASE}/models/{s.gemini_embedding_model}:embedContent",
            params={"key": s.gemini_api_key},
            json=payload,
        )
    if r.status_code >= 400:
        raise EmbeddingError(f"Gemini embeddings {r.status_code}: {r.text[:300]}")
    data = r.json()
    vec = (data.get("embedding") or {}).get("values") or []
    if not vec:
        raise EmbeddingError(f"empty embedding from Gemini: {data}")
    return vec


def vector_literal(vec: list[float]) -> str:
    """pgvector accepts strings in the format '[v1,v2,...]'."""
    return "[" + ",".join(f"{v:.7f}" for v in vec) + "]"
