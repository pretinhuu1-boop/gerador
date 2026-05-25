"""Render pipeline — turns a content_draft into an MP4 file.

Module layout:
- pipeline.py   — top-level orchestration (TTS → Remotion → upload → DB updates)
- tts_batch.py  — parallel ElevenLabs synthesis + duration probe
- remotion.py   — subprocess wrapper around `npx remotion render`
- storage.py    — Supabase Storage upload helpers
- progress.py   — DB + Realtime broadcast helpers
"""
