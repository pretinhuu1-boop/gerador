---
name: scene-anatomy
description: Compose multi-shot dialogue scenes for Seedance 2.0 using the [CAM]/[ACT]/[ENV]/[AUDIO] shooting-script DSL. Generates keyframes via Higgsfield (Nano Banana 2 / Soul V2 / Seedream) and renders the final video via `higgsfield generate create seedance_2_0`. Falls back to Codex CLI when OpenAI image/video models are preferred. Use when the user asks for "cena de diálogo", "dialogue scene", "multi-shot scene", "scene anatomy", a 30–60s narrative reel, or pastes a script using [CAM]/[ACT]/[ENV]/[AUDIO] tags.
argument-hint: "<scene-brief> [--shots N] [--duration 45] [--style cinematic|noir|sitcom|surreal] [--engine higgsfield|codex|mcp]"
allowed-tools: Bash, Read, Write, Edit
version: 0.1.0
---

# Scene Anatomy — multi-shot dialogue scenes for Seedance 2.0

A reverse-engineered template for the "SCENE ANATOMY" workflow popularized by
**invideo Agent One** + **Higgsfield Seedance 2.0**. You write a structured
shooting script using the four-tag DSL; the skill expands it into per-shot
Seedance prompts, generates keyframes for character continuity via Higgsfield
image models, and renders/stitches the clips.

The four tags — `[CAM]`, `[ACT]`, `[ENV]`, `[AUDIO]` — are extracted from the
canonical Seedance scene-anatomy reels. See `reference/dsl.md` for the full
grammar, `reference/camera-vocabulary.md` for camera language, and
`reference/example-v1-field-scene.md` / `example-v2-gas-station-scene.md` for
two complete reference scripts.

## When to use this skill

Trigger this skill whenever the user wants to:

- Build a 30–60 second narrative reel with **multiple character shots** and
  cuts (not a single continuous take).
- Convert a written dialogue (screenplay, beats, dramatic premise) into
  Seedance-ready prompts.
- Maintain character + location continuity across 15–25 shots.
- Match the look/feel of "scene anatomy" Instagram reels.

Single-shot generation is NOT a fit — use the user's existing
`higgsfield-generate` skill (or plain CLI) for one-off clips.

## Step 0 — Bootstrap

Verify tooling before doing anything else. Run these probes once per session:

```bash
which higgsfield                 # ≥ 0.1.22 expected; install via npm i -g @higgsfield/cli
higgsfield auth status           # must be logged in
which codex                      # only required if --engine codex
ls .claude/mcp.json 2>/dev/null  # if present, Higgsfield MCP may be wired
```

If `higgsfield` is missing, stop and tell the user to install:
`npm install -g @higgsfield/cli && higgsfield auth login`.

If the user passed `--engine codex` and `codex` is missing:
`curl -fsSL https://chatgpt.com/codex/install.sh | sh`.

## The DSL in 30 seconds

Every shot has up to four lines, **in this fixed order**:

```
[CAM]    <shot-size>, <camera-movement>, <framing-modifiers>
[ACT]    <physical action: blocking, hands, jaw, eye direction, weight>
[ENV]    <optional atmosphere: wind, light, ambient sound>
[AUDIO]  <"Character: \"dialogue line.\"" or sound effect description>
```

**Rules** (full version in `reference/dsl.md`):

1. `[CAM]` is the only **required** tag; everything else is optional but
   improves coherence.
2. `[ACT]` must describe **physical micro-action** — never abstract emotion.
   - ❌ "Sarah is upset"
   - ✅ "Sarah's lower lip trembles; her right hand grips the pendant at her collarbone."
3. `[AUDIO]` carries **both** dialogue and sound design. Mix them:
   `[AUDIO] Robert: "Sarah, can we just—" / Footsteps crunching on dry soil`
4. Continuity is signaled with `Match Shot N` inside `[ACT]` (replicates the
   framing of shot N exactly) or with a standalone `[TRANS]` block.

## Workflow

Make a todo list with these phases. Work them in order. Do NOT skip.

### Phase 1 — Gather the brief

Ask the user (in one combined `AskUserQuestion` if it's not all provided):

- **Logline**: one sentence describing the scene's core conflict / beat.
- **Characters**: name + one-line description each + visual anchor
  (existing photo, Higgsfield Soul ID name, or detailed description).
- **Location & time-of-day**: drives [ENV] across all shots.
- **Tonal direction**: cinematic / noir / sitcom / surreal / documentary.
- **Duration target**: 30 / 45 / 60 s (45 is the canonical scene-anatomy length).
- **Engine**: `higgsfield` (default), `codex` (OpenAI gpt-image-1 + sora-style
  via API), or `mcp` (Higgsfield MCP server if installed).

### Phase 2 — Draft the shot list (no [ACT] yet)

Produce a **bullet list of N shots** with just `[CAM]` and a 5-word intent.

Sizing rules:
- 45s target → 15–22 shots. 16 shots = ~2.8s/shot (contemplative);
  21 shots = ~2.1s/shot (kinetic).
- Open with a wide (WS) and end with WS dolly-out (V1 pattern) **or**
  a static wide with subject leaving frame (V2 pattern).
- Insert one `MATCH SHOT N` between shots 5–8 if the same framing returns —
  this stabilizes the audience's spatial sense.

Show the draft to the user, await approval before expanding.

### Phase 3 — Expand each shot into full DSL

For each shot, fill out `[CAM]`, `[ACT]`, `[ENV]`, `[AUDIO]`. Use the camera
vocabulary in `reference/camera-vocabulary.md` — pick from a closed
vocabulary, do not invent.

The full reference scripts in `reference/example-v1-field-scene.md` and
`example-v2-gas-station-scene.md` are the **canon** for what a complete
expansion looks like. When in doubt about [ACT] specificity, re-read those.

Save the expanded script to `scenes/<slug>/script.md` in the working dir.

### Phase 4 — Translate to Seedance prompts

For each shot, write a natural-language Seedance 2.0 prompt by **flattening
the DSL into a single paragraph**, in this order:

1. Camera spec (movement + lens + framing)
2. Subject + action (verbatim from `[ACT]`)
3. Environment / lighting (from `[ENV]` + the global location spec)
4. Dialogue and sound (from `[AUDIO]`)
5. Style anchor (one phrase pulled from the tonal direction)

Save as `scenes/<slug>/prompts/shot_NN.txt`. See
`reference/dsl.md#flattening-rule` for a full worked example.

### Phase 5 — Generate keyframes (character continuity)

For each unique character framing (typically 3–6 across the scene), generate
a start-frame image via Higgsfield. Prefer **Higgsfield Soul V2** if the user
provided a Soul ID; otherwise **Nano Banana 2** for character-faithful work.

```bash
higgsfield generate create soul_v2 \
  --prompt "<flattened shot-2 prompt, lock subject framing>" \
  --soul-id <user-soul-id> \
  --aspect_ratio 9:16 \
  --resolution 1080p \
  --quality high \
  --wait \
  --json > scenes/<slug>/keyframes/shot_02.json
```

For shots that share framing (Match Shot N), **reuse the same keyframe** —
don't regenerate.

Persist the image URL/path into `scenes/<slug>/keyframes/index.json`.

### Phase 6 — Render each Seedance shot

For each shot, call Seedance 2.0 with the prompt + the start-image keyframe:

```bash
higgsfield generate create seedance_2_0 \
  --prompt "$(cat scenes/<slug>/prompts/shot_02.txt)" \
  --start-image scenes/<slug>/keyframes/shot_02.png \
  --duration 3 \
  --mode pro \
  --aspect_ratio 9:16 \
  --sound off \
  --wait \
  --json > scenes/<slug>/clips/shot_02.json
```

Notes:
- `--sound off` because we add audio in Phase 7 — Seedance's generated audio
  rarely matches the [AUDIO] beats.
- `--duration` should be ceil(target_shot_seconds + 0.5); we'll trim later.
- Run shots in **parallel batches of 3** (Higgsfield rate-limits at ~4 concurrent).

### Phase 7 — Stitch + add audio

Concatenate clips and lay in the dialogue/SFX:

```bash
# 1. concat
ffmpeg -y -f concat -safe 0 \
  -i scenes/<slug>/clips/concat.txt \
  -c copy scenes/<slug>/scene.silent.mp4

# 2. (optional) ElevenLabs TTS for dialogue beats from [AUDIO]
# 3. mix dialogue + ambient SFX via ffmpeg amix
```

If the project has the existing `remotion/` pipeline, hand off the timing
JSON to that — see `remotion/README.md` in the repo root.

### Phase 8 — Final report

Print to the user:
- Output path (`scenes/<slug>/scene.mp4`)
- Total shot count, total duration, total Higgsfield credits spent
  (read from `--json` outputs)
- Any shots that failed (re-prompt before declaring success)

## Engine variants

### `--engine mcp`

If `.claude/mcp.json` has a `higgsfield` MCP server, prefer those tools over
shell calls. Map:

| Shell command | MCP tool |
|---|---|
| `higgsfield generate create seedance_2_0 ...` | `higgsfield__generate` with `model=seedance_2_0` |
| `higgsfield generate create soul_v2 ...` | `higgsfield__generate` with `model=soul_v2` |
| `higgsfield soul-id create ...` | `higgsfield__soul_id_create` |

Tool schemas mirror the CLI flags exactly. The MCP path is preferred when
available because outputs return structured JSON inline (no subprocess
parsing).

### `--engine codex`

Use OpenAI Codex CLI to drive a different image / video backend
(`gpt-image-1` for keyframes, third-party Sora-API gateways for video).
Codex is **not an image model itself** — it's an agent that writes and runs
Python/Node scripts. Hand it a target prompt + the artifact path you want:

```bash
codex exec --json "Generate a 1080×1920 vertical image using the OpenAI \
  Images API (gpt-image-1, quality=high). Prompt: '<flattened shot-2 prompt>'. \
  Save to scenes/<slug>/keyframes/shot_02.png. Print the absolute path on success."
```

For video, codex can wrap any HTTP API the user has credentials for. Only
use this path when explicitly requested — Higgsfield Seedance 2.0 is the
default video engine for this skill.

## File layout this skill produces

```
scenes/<slug>/
├── brief.md                  # Phase 1 input
├── script.md                 # Phase 3 full DSL script
├── prompts/
│   ├── shot_01.txt           # Phase 4 flattened Seedance prompts
│   └── ...
├── keyframes/
│   ├── shot_01.png           # Phase 5 character keyframes (reused via Match Shot)
│   ├── shot_01.json          # raw Higgsfield response
│   └── index.json            # mapping shot → keyframe
├── clips/
│   ├── shot_01.mp4           # Phase 6 raw Seedance output
│   ├── shot_01.json          # raw Higgsfield response
│   └── concat.txt            # ffmpeg concat list
└── scene.mp4                 # Phase 7 final assembled output
```

## Anti-patterns (do NOT do)

- **Don't skip the keyframe step.** Seedance 2.0 without `--start-image`
  drifts character appearance across cuts.
- **Don't write abstract [ACT].** "She is sad" → unusable. Every [ACT] is a
  **physical thing a camera could film** (hands, jaw, weight shift, eye direction).
- **Don't over-specify [CAM].** One movement per shot. Mixing
  "DOLLY+ARC+RACK FOCUS" in one shot confuses Seedance — split into two shots.
- **Don't let shots exceed 5s.** Seedance quality degrades past 5s; use more
  shots instead of longer shots.
- **Don't generate audio with `--sound on` if you have specific dialogue.**
  Seedance's audio is non-deterministic; layer dialogue via TTS in Phase 7.

## Quick start — minimal invocation

User says: *"cria uma cena de 45s no estilo do scene anatomy, dois amigos
discutindo numa loja de conveniência madrugada, tom melancólico"*

Skill response order:
1. Confirm character anchors (do they have Soul IDs? Or use detailed visual descriptions?)
2. Draft 18-shot list (Phase 2), show, await approval
3. Expand to full DSL (Phase 3), save to `scenes/conveniencia-madrugada/script.md`
4. Generate keyframes for shots 1, 4, 8, 12 (the unique framings)
5. Render shots in parallel batches of 3
6. Stitch + add SFX
7. Deliver `scenes/conveniencia-madrugada/scene.mp4` + report

## References

Load on demand:

- `reference/dsl.md` — full grammar for [CAM]/[ACT]/[ENV]/[AUDIO]/[TRANS]
  tags, with examples and the "flattening rule" for Seedance prompts.
- `reference/camera-vocabulary.md` — the 22 camera movements + lens choices
  + framing modifiers, all verbatim. This is the closed vocabulary.
- `reference/example-v1-field-scene.md` — full 16-shot field scene
  (Sarah/Robert, golden hour, breakup) — the contemplative pacing reference.
- `reference/example-v2-gas-station-scene.md` — full 21-shot gas station
  scene (Mark/Robert, neon night, surreal dream) — the kinetic pacing
  reference with multi-location continuity.
