"""Seed hermes_knowledge from seeds/knowledge_seed.json.

Run from the gateway dir with env loaded:
    uv run python -m scripts.seed_knowledge
    # or:
    python -m scripts.seed_knowledge --reset --batch 32

Steps:
  1. Load knowledge_seed.json (produced by scripts/export_knowledge.ts at repo root).
  2. For each record, compute Gemini text-embedding-004 on `title + summary + content[:2000]`.
  3. Upsert into public.hermes_knowledge keyed on (kind, slug) with user_id=NULL (global).

Re-runnable. Skips records whose embedding already exists unless --reset is passed.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import sys
import time
from pathlib import Path

# allow `python scripts/seed_knowledge.py` from gateway dir
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.connectors.embeddings import embed_text, vector_literal  # noqa: E402
from src.connectors.supabase_client import supabase_admin  # noqa: E402

log = logging.getLogger("seed_knowledge")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

SEED_PATH = Path(__file__).resolve().parent.parent / "seeds" / "knowledge_seed.json"


def embedding_input(record: dict) -> str:
    title = record.get("title") or ""
    summary = record.get("summary") or ""
    content = record.get("content") or ""
    # Keep within Gemini's 8k input cap (~2k chars of content + title/summary).
    return f"{title}\n\n{summary}\n\n{content[:2000]}".strip()


async def seed(reset: bool, batch_size: int, limit: int | None) -> None:
    if not SEED_PATH.exists():
        raise SystemExit(f"seed file missing: {SEED_PATH}. Run `npx tsx scripts/export_knowledge.ts` at repo root first.")

    payload = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    records: list[dict] = payload.get("records") or []
    if limit:
        records = records[:limit]
    log.info("loaded %d records from %s", len(records), SEED_PATH.name)

    db = supabase_admin()

    if reset:
        log.warning("reset=True — deleting existing global hermes_knowledge rows")
        db.table("hermes_knowledge").delete().is_("user_id", "null").execute()

    # Identify which slugs already have an embedding so we skip them when reset=False.
    existing: set[tuple[str, str]] = set()
    if not reset:
        page = 0
        while True:
            res = (
                db.table("hermes_knowledge")
                .select("kind, slug, embedding")
                .is_("user_id", "null")
                .range(page * 1000, page * 1000 + 999)
                .execute()
            )
            rows = res.data or []
            for r in rows:
                if r.get("embedding") is not None:
                    existing.add((r["kind"], r["slug"]))
            if len(rows) < 1000:
                break
            page += 1
        log.info("found %d existing records with embeddings (will skip)", len(existing))

    to_process = [r for r in records if (r["kind"], r["slug"]) not in existing]
    log.info("processing %d new/missing records", len(to_process))

    embedded = 0
    failed = 0
    started = time.monotonic()
    pending: list[dict] = []

    async def flush(rows: list[dict]) -> None:
        if not rows:
            return
        db.table("hermes_knowledge").upsert(rows, on_conflict="kind,slug").execute()

    for i, record in enumerate(to_process):
        try:
            vec = await embed_text(embedding_input(record), task_type="RETRIEVAL_DOCUMENT")
            pending.append(
                {
                    "kind": record["kind"],
                    "slug": record["slug"],
                    "title": record["title"],
                    "summary": record.get("summary") or "",
                    "content": record["content"],
                    "metadata": record.get("metadata") or {},
                    "embedding": vector_literal(vec),
                    "active": True,
                }
            )
            embedded += 1
        except Exception as exc:  # noqa: BLE001
            failed += 1
            log.warning("embed failed for %s/%s: %s", record["kind"], record["slug"], exc)

        if len(pending) >= batch_size:
            await flush(pending)
            pending.clear()
            elapsed = time.monotonic() - started
            rate = embedded / max(elapsed, 0.01)
            log.info(
                "progress %d/%d (%.1f rec/s, %d failed)",
                embedded,
                len(to_process),
                rate,
                failed,
            )

    await flush(pending)
    elapsed = time.monotonic() - started
    log.info(
        "done — embedded %d, failed %d, elapsed %.1fs (%.2f rec/s)",
        embedded,
        failed,
        elapsed,
        embedded / max(elapsed, 0.01),
    )


def main() -> None:
    p = argparse.ArgumentParser(description="Seed hermes_knowledge from knowledge_seed.json")
    p.add_argument("--reset", action="store_true", help="delete existing global rows first")
    p.add_argument("--batch", type=int, default=20, help="upsert batch size (default 20)")
    p.add_argument("--limit", type=int, default=None, help="cap number of records (debug)")
    args = p.parse_args()
    asyncio.run(seed(reset=args.reset, batch_size=args.batch, limit=args.limit))


if __name__ == "__main__":
    main()
