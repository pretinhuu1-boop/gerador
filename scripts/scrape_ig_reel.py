"""Scrape a public Instagram Reel via Playwright + Chromium.

Usage:
    pip install playwright httpx
    python -m playwright install chromium   # or: apt-get install chromium
    python scripts/scrape_ig_reel.py <reel-url> [outdir]

Why Playwright (vs yt-dlp/HTTP):
- Real Chromium fingerprint passes Instagram's "is this a real browser?"
  checks better than a Python HTTP client.
- Renders client-side, waits for <video>, reads currentSrc from the DOM,
  and as a fallback sniffs the network for the .mp4 segment URLs.

Requires the container's egress policy to allow instagram.com +
*.cdninstagram.com + *.fbcdn.net. If you see "Host not in allowlist" the
network policy is blocking you, not Instagram.

Outputs into OUTDIR (default /tmp/scrape):
    reel.mp4               — the video itself (if download succeeds)
    reel.thumb.jpg         — og:image preview
    reel.metadata.json     — caption, author, dimensions, sniffed URLs
    page.png               — screenshot of the rendered reel page
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import httpx
from playwright.sync_api import sync_playwright

REEL_URL = sys.argv[1] if len(sys.argv) > 1 else "https://www.instagram.com/reel/DYuC8r7Bez9/"
OUTDIR = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/scrape")
OUTDIR.mkdir(parents=True, exist_ok=True)


def find_chrome() -> str | None:
    """Locate a Chromium binary in this order: $CHROME_PATH env var,
    Playwright's bundled browsers under /opt/pw-browsers or ~/.cache/ms-playwright,
    then PATH (chromium / chromium-browser / google-chrome).
    Returns None to let Playwright auto-discover its own install."""
    env = os.environ.get("CHROME_PATH")
    if env and Path(env).exists():
        return env
    for root in ("/opt/pw-browsers", str(Path.home() / ".cache/ms-playwright")):
        if Path(root).exists():
            for chrome in Path(root).glob("chromium-*/chrome-linux/chrome"):
                return str(chrome)
    for name in ("chromium", "chromium-browser", "google-chrome", "chrome"):
        for p in os.environ.get("PATH", "").split(os.pathsep):
            cand = Path(p) / name
            if cand.exists():
                return str(cand)
    return None


CHROME = find_chrome()
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
)


def grab() -> dict:
    with sync_playwright() as p:
        launch_kwargs: dict = {
            "headless": True,
            "args": [
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-gpu",
                "--ignore-certificate-errors",
                "--ignore-ssl-errors",
            ],
        }
        if CHROME:
            launch_kwargs["executable_path"] = CHROME
        browser = p.chromium.launch(**launch_kwargs)
        ctx = browser.new_context(
            user_agent=UA,
            viewport={"width": 1280, "height": 1800},
            locale="pt-BR",
            timezone_id="America/Sao_Paulo",
            ignore_https_errors=True,
        )
        # Hide common automation markers.
        ctx.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
            "Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en']});"
            "window.chrome = { runtime: {} };"
        )
        page = ctx.new_page()

        meta: dict = {"reel_url": REEL_URL}
        video_urls: list[str] = []

        # Sniff network for the actual .mp4 / dash manifest URLs IG fetches.
        def on_response(resp):
            url = resp.url
            ct = resp.headers.get("content-type", "")
            if any(x in url for x in [".mp4", "video/mp4"]) or "video/" in ct:
                if url not in video_urls:
                    video_urls.append(url)

        page.on("response", on_response)

        try:
            page.goto(REEL_URL, wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            meta["goto_error"] = str(e)

        # Let IG hydrate + start streaming the video.
        page.wait_for_timeout(6000)

        # Pull video element src directly from DOM.
        dom_src = page.evaluate(
            """() => {
                const v = document.querySelector('video');
                if (!v) return null;
                return {
                    currentSrc: v.currentSrc,
                    src: v.src,
                    poster: v.poster,
                    width: v.videoWidth,
                    height: v.videoHeight,
                    duration: v.duration,
                };
            }"""
        )
        meta["dom_video"] = dom_src

        # Page-level metadata (caption, author, etc) from OG tags.
        og = page.evaluate(
            """() => {
                const get = (sel) => document.querySelector(sel)?.getAttribute('content');
                return {
                    title: get('meta[property="og:title"]'),
                    description: get('meta[property="og:description"]'),
                    image: get('meta[property="og:image"]'),
                    video: get('meta[property="og:video"]'),
                    site_name: get('meta[property="og:site_name"]'),
                };
            }"""
        )
        meta["og_tags"] = og

        # Status / error indicators
        meta["title_text"] = page.title()
        body_text = page.evaluate(
            "() => document.body?.innerText?.slice(0, 800) || ''"
        )
        meta["body_excerpt"] = body_text

        meta["video_responses_sniffed"] = video_urls

        # Choose best candidate: DOM currentSrc first, then OG video, then network sniff.
        chosen = None
        if dom_src:
            chosen = dom_src.get("currentSrc") or dom_src.get("src")
        if not chosen:
            chosen = og.get("video")
        if not chosen and video_urls:
            chosen = video_urls[-1]
        meta["chosen_video_url"] = chosen

        # Screenshot for debugging.
        try:
            page.screenshot(path=str(OUTDIR / "page.png"), full_page=False)
        except Exception:
            pass

        # Download video if we have a URL.
        if chosen:
            try:
                headers = {
                    "User-Agent": UA,
                    "Referer": REEL_URL,
                    "Accept": "*/*",
                }
                with httpx.Client(timeout=120.0, verify=False) as client:
                    r = client.get(chosen, headers=headers, follow_redirects=True)
                    if r.status_code == 200:
                        (OUTDIR / "reel.mp4").write_bytes(r.content)
                        meta["downloaded_bytes"] = len(r.content)
                    else:
                        meta["download_error"] = f"HTTP {r.status_code}"
            except Exception as e:
                meta["download_error"] = str(e)

        # Thumbnail too if present.
        if og.get("image"):
            try:
                with httpx.Client(timeout=30.0, verify=False) as client:
                    r = client.get(og["image"], headers={"User-Agent": UA, "Referer": REEL_URL})
                    if r.status_code == 200:
                        (OUTDIR / "reel.thumb.jpg").write_bytes(r.content)
                        meta["thumb_bytes"] = len(r.content)
            except Exception:
                pass

        ctx.close()
        browser.close()
        return meta


if __name__ == "__main__":
    m = grab()
    out = OUTDIR / "reel.metadata.json"
    out.write_text(json.dumps(m, indent=2, ensure_ascii=False))
    print(json.dumps(m, indent=2, ensure_ascii=False)[:2400])
    print(f"\n--- metadata written to {out}")
