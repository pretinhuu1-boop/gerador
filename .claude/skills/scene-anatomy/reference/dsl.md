# Scene Anatomy DSL — Full Grammar

The four-tag shooting-script format reverse-engineered from canonical
Seedance 2.0 "SCENE ANATOMY" reels. Use this when expanding a shot list
into a renderable script (Phase 3 of the skill workflow).

## Tag taxonomy

| Tag | Required? | Order | Carries |
|---|---|---|---|
| `[CAM]` | yes | 1 | shot size + movement + framing modifiers |
| `[ACT]` | recommended | 2 | physical action / blocking / micro-gesture |
| `[ENV]` | optional | 3 | atmosphere (wind, light, ambient sound) |
| `[AUDIO]` | optional | 4 | dialogue and/or sound design |
| `[TRANS]` | optional | between shots | explicit transitional beat |

A complete shot looks like:

```
[CAM] MCU, LOCKOFF, slight low angle, three-quarter view of Robert
[ACT] Robert drops his hand back to his side, letting out a long, visible
      exhale through his nose. His eyes shift to the right, jaw tightening
[ENV] Constant wind hum, fading amber light
[AUDIO] Robert: "...February. The week before Venice."
```

## Per-tag grammar

### [CAM] — Camera

Three slots, comma-separated, fixed order:

```
[CAM] <SHOT-SIZE>, <MOVEMENT>, <FRAMING-MODIFIER(S)>
```

- **SHOT-SIZE**: pull from `camera-vocabulary.md#shot-sizes`.
- **MOVEMENT**: one only (don't combine). Use `STATIC` / `LOCKOFF` for fixed
  tripod. Use directionals like `TRACKING BACKWARD`, `TRACKING L-TO-R`.
- **FRAMING-MODIFIER(S)**: optional, comma-separated. Includes angle
  (`slight low angle`, `eye level`, `dead-on`), OTS direction, character
  position (`Robert frame-left`, `Sarah frame-right`), lens choice
  (`telephoto`, `wide`), or specialty (`POV THROUGH PASSENGER WINDOW`,
  `INT.`/`EXT.` prefix for interiors/exteriors).

Examples (verbatim from canonical scripts):

```
[CAM] WS, TRACKING BACKWARD
[CAM] MCU, LOCKOFF, eye level on Sarah's profile from her left
[CAM] MS, HANDHELD, profile view, Robert Frame-Right, Sarah Frame-Left
[CAM] CU, TRACKING, 3/4 FRONT ON ROBERT
[CAM] WS, STATIC FROM BEHIND. Robert frame-left, Mark frame-right
[CAM] WS, HANDHELD, low angle through foreground dried stalks
[CAM] TCU, telephoto two-shot compressing the gap
[CAM] WS, SLOW DOLLY-OUT
[CAM] INT. PASSENGER SEAT LOOKING AT ROBERT
[CAM] POV ROBERT THROUGH PASSENGER WINDOW
[CAM] MS ON MARK, EXT. PASSENGER SIDE
```

### [ACT] — Action

Describe **only what a camera can film**. Hands, jaw, weight, eye direction,
body angle, micro-expressions tied to muscle movement. Never name emotions
directly — let the action convey them.

Length: 1–3 sentences. Past tense is OK; present tense is preferred
("Sarah pivots her body right..." not "Sarah will pivot...").

**Verbs to favor**: glances, drops, lifts, pivots, presses, snaps, exhales,
plants, locks, tightens, trembles, parts, catches, projects, scans, hesitates,
shuffles, gestures, freezes, leans, shifts.

**Anti-pattern verbs** (too vague — replace with physical equivalent):
feels, thinks, seems, appears, is.

**Continuity directive**: `Match Shot N.` at the start of an `[ACT]` line
means "this shot replicates the framing of shot N exactly, same lens/angle".
Use sparingly (typically once per scene, around shots 5–8).

Examples (verbatim):

```
[ACT] Robert glances down at his own hand, then looks back at Sarah. Wind
      blows hair across Sarah's cheek; she ignores it
[ACT] Sarah's arms hang at her sides, her right hand making a sharp flicking
      gesture as she speaks. Robert steps half a pace forward, leaning in
      desperately
[ACT] Match Shot 2. Robert walks unmoved, bag in right hand. Mark walks
      beside him, hands back in yellow windbreaker pockets, staring ahead
[ACT] Sarah abruptly plants her left foot and pivots her body right to face
      Robert head-on, eyes locking onto him. Robert steps into the right
      edge of the frame, pulling up inches from her face
```

### [ENV] — Environment

Atmospheric anchor that grounds the AI in space + lighting + ambient sound.
Usually 1 line, sometimes 2. Recurring `[ENV]` lines establish location
continuity — repeat the same `[ENV]` description across consecutive shots
in the same place.

Patterns:

- Lighting: "Fading amber light on the dry weeds"
- Weather: "Cold howling wind", "faint rain", "wet asphalt"
- Ambient sound: "Constant wind hum", "neon hum", "humming red neon canopy"
- Combo: "Red neon hits Robert's weathered face. Cold howling wind."

Examples (verbatim):

```
[ENV] Fading amber light on the dry weeds, constant wind hum.
[ENV] Wind rustling.
[ENV] Cold howling wind.
[ENV] Dry grass rustling.
[ENV] Wind blowing hair across her cheek.
```

### [AUDIO] — Audio

Carries **both** dialogue and sound effects. If a shot has both, list them
on separate lines or combine with a `/` separator.

**Dialogue format**: `Name: "exact line."` — always wrap dialogue in double
quotes. Off-screen dialogue uses `Name (O.S.):`.

**SFX format**: bare description without quotes, present-tense imperative
form. "Bag crinkles", "Door chime, footsteps, neon hum", "Wind rustling,
footsteps fading", "Engine roars, tires splash on puddles, fading to quiet
wind".

Examples (verbatim):

```
[AUDIO] Sarah: "When did you find out."
[AUDIO] Robert: "Sarah, can we just—" / Sarah: "I asked you when."
[AUDIO] Mark (O.S.): "You were in it."
[AUDIO] Bag crinkles. Mark (O.S.): "You were in it."
[AUDIO] Door chime, footsteps, neon hum
[AUDIO] Footsteps crunching slower on dry soil
[AUDIO] Car door opens and shuts, keys jingle. Mark: "And then you turned around..."
[AUDIO] Wind through dry grass, a single distant bird call
```

### [TRANS] — Transition (optional)

A standalone block between two shots that explicitly describes the cut/beat
linking them. Use when the cut itself carries meaning (a turn-away, a door
slam, eyes closing).

Examples (verbatim):

```
[TRANS] Robert turns away, breaking eye contact.
[TRANS] Match cut: Sarah's hand opening → Robert's hand closing.
```

## The flattening rule (DSL → Seedance prompt)

Seedance 2.0 takes natural-language prompts, not bracketed DSL. To translate
a shot block to a Seedance prompt, **concatenate the four tags into one
paragraph in this exact order**:

1. Camera (from `[CAM]`)
2. Action (from `[ACT]`, verbatim)
3. Environment / lighting (from `[ENV]` + the global scene's location anchor)
4. Audio cues (from `[AUDIO]` — for Seedance treat dialogue as "they speak
   the line ..." and SFX as "sound of ...")
5. Style anchor (one phrase from the tonal direction: "shot like a
   contemporary indie drama on 35mm", "noir aesthetic, hard chiaroscuro",
   "sitcom multi-cam flat", etc.)

### Worked example

DSL input:

```
[CAM] MCU, LOCKOFF, eye level on Sarah's profile from her left
[ACT] Sarah keeps her gaze locked forward, her chin lifting slightly as she
      speaks
[ENV] Fading amber light on the dry weeds, constant wind hum
[AUDIO] Sarah: "When did you find out."
```

Flattened Seedance 2.0 prompt:

> Medium close-up, locked-off camera at eye level on the left profile of
> Sarah, a woman in her 40s with shoulder-length hair, wearing a navy
> peacoat. She keeps her gaze locked forward, her chin lifting slightly as
> she speaks the line: "When did you find out." A constant wind hum carries
> across a dry-weed field bathed in fading amber light from a low sun.
> Shot like a contemporary indie drama on 35mm with shallow depth of field.

Pass that into:

```bash
higgsfield generate create seedance_2_0 \
  --prompt "$PROMPT" \
  --start-image keyframes/shot_02.png \
  --duration 3 --mode pro --aspect_ratio 9:16 --sound off --wait
```

## Pacing reference

| Total duration | Shot count | Avg shot length | Tonal mode |
|---|---|---|---|
| 30 s | 10–12 | 2.5–3.0 s | Tight, single-beat |
| 45 s | 16 | 2.8 s | Contemplative (V1 reference) |
| 45 s | 21 | 2.1 s | Kinetic, multi-location (V2 reference) |
| 60 s | 22–28 | 2.1–2.7 s | Two-beat narrative |

## Three-act structure within 45 s

Mirror the canonical scripts:

1. **Setup (shots 1–5, ~14 s)** — Open WS or tracking. Establish location
   via [ENV]. First dialogue line introduces the conflict question.
2. **Conflict (shots 6 – N-3, ~25 s)** — Intercut MCU/CU. Climax shot is
   typically MCU + extended dialogue + Cold howling wind / equivalent strong [ENV].
3. **Release (final 2–3 shots, ~6 s)** — WS SLOW DOLLY-OUT (V1) or WS
   STATIC of subject leaving frame (V2). Sound design carries — no
   dialogue in the closing shot.
