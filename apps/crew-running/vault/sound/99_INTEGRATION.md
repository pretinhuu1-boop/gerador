# 99 — Integration Engineer Report

> Status snapshot at end of integration pass. Read this BEFORE generating assets so you know what code is expecting.

## Deviation from approved plan

**Plan said:** add `howler` dependency for cross-browser audio + iOS autoplay handling.

**Shipped:** zero-dependency `AudioEngine` in [`services/audio.ts`](../../services/audio.ts) using native `HTMLAudioElement` + manual `volume` ramps.

**Why:** app has zero audio assets today. Adding a 25KB dep (with `@types/howler`) for code that does nothing until assets land = premature. Native API covers the surface (preload, crossfade, duck, mute, unlock-on-gesture, no-loop one-shots). Public method signatures intentionally match what a Howler-backed engine would expose, so the swap stays mechanical if iOS autoplay or buffering bugs force the upgrade later.

**When to revisit:** if real-device Safari iOS shows audible pops, stutters during crossfade, or autoplay refuses to honor `unlock()`, swap the implementation behind the same `audio` singleton.

## What's wired (code-complete, silent until assets land)

### `services/audio.ts` — public API
| Method | Used by |
|---|---|
| `audio.unlock()` | First user gesture in `ConsoleBoot` and `CartridgeButton` |
| `audio.playSfx(id)` | `CartridgeButton` (auto-fires `tap` / `skip-cut` by variant); explicit in `WardrobePicker` (`lock-on`/`remove-x`), `PhotoUpload` (`photo-shutter`/`remove-x`), `CustomizeScreen` (`randomize-roll`/`error-buzz`/`equip-snap`), `SheetPreview` (`equip-snap`), `RunnerSavedTeaser` (`stamp-save`), `CitySignalEntry`+`MainMenu` (`nav-slab`) |
| `audio.preloadSfx(ids)` | `ConsoleBoot` warms `tap`/`tap-alt`/`skip-cut`/`nav-slab` |
| `audio.crossfadeAmbient(id)` | One per screen: boot/title/city/hq/locker/guided/saved |
| `audio.layerCrewMotif(slug)` | `MainMenu` on crew change |
| `audio.stopCrewMotif()` | `MainMenu` unmount |
| `audio.playRunnerTypeStinger(id)` | `RunnerTypePicker` |
| `audio.playVoice(cue)` | `ConsoleBoot` (sinal-ativo), `TitleScreen` (cidade-ouviu), `GuidedOnboarding` (step-N), `RunnerSavedTeaser` (cidade-pronta) |
| `audio.playCrewIntroVoice(slug)` | `CitySignalEntry` on crew select |
| `audio.setMuted(v)` / `audio.isMuted()` / `audio.onMuteChange(fn)` | `AudioMuteToggle` in `MainMenu` CONFIG panel |

### State persistence
- `localStorage["crewAudioMuted"]` — single boolean, owned by `AudioEngine` (not `launchStorage`, by design — keeps audio self-contained, no schema migration needed).
- First-launch default: `prefers-reduced-motion: reduce` → muted. Otherwise unmuted.

### Voice ducking
Implemented in `AudioEngine.playVoice()`: ambient → 0.22 vol (-6dB-ish), motif → 0.22 (-8dB-ish), fade 200ms in / 400ms out. SFX continues unducked.

### Tap variant alternation
`playSfx('tap')` → 50% chance routes to `tap-alt` to avoid replay fatigue.

### Hover-tick rate limit
200ms between consecutive `hover-tick` plays.

## What's silent (waiting on assets)

EVERY method call still fires — but each `Audio()` element points to a path under `/audio/...` that returns **404 until you drop the mp3**. The engine swallows `.play()` rejections, so no console spam. The app behaves identically to today except for a network 404 per missing file.

When you generate any subset, that subset becomes audible immediately on page reload — no code change needed.

## File map (where to drop generated assets)

```
public/audio/
  ui/
    ui-tap.mp3
    ui-tap-alt.mp3
    ui-nav-slab.mp3
    ui-lock-on.mp3
    ui-randomize-roll.mp3
    ui-photo-shutter.mp3
    ui-remove-x.mp3
    ui-equip-snap.mp3
    ui-stamp-save.mp3
    ui-error-buzz.mp3
    ui-skip-cut.mp3
    ui-hover-tick.mp3
  ambient/
    amb-boot-cold.mp3
    amb-title-pulse.mp3
    amb-city-signal.mp3
    amb-hq-room.mp3
    amb-locker-room.mp3
    amb-guided-attention.mp3
    amb-saved-stamp-wash.mp3
  music/
    crew/
      mus-crew-downtown-rush.mp3
      mus-crew-north-breakers.mp3
      mus-crew-south-striders.mp3
      mus-crew-east-burners.mp3
      mus-crew-west-flow.mp3
    runner-type/
      mus-rt-sprint.mp3
      mus-rt-long-run.mp3
      mus-rt-night-run.mp3
      mus-rt-crew-pace.mp3
      mus-rt-urban-trail.mp3
  voice/
    boot/
      voice-boot-cidade-ouviu.mp3
      voice-boot-sinal-ativo.mp3
    guided/
      voice-guided-step-0.mp3
      voice-guided-step-1.mp3
      voice-guided-step-2.mp3
      voice-guided-step-3.mp3
      voice-crew-downtown-rush.mp3
      voice-crew-north-breakers.mp3
      voice-crew-south-striders.mp3
      voice-crew-east-burners.mp3
      voice-crew-west-flow.mp3
    saved/
      voice-saved-cidade-pronta.mp3
```

**12 SFX + 7 ambient + 10 music + 12 voice = 41 assets total.**

## QA checklist (manual, post-asset)

1. `npm run dev` → boot the app
2. ConsoleBoot: `boot-cold` ambient starts within 1s after first user click. `PULAR` plays `skip-cut`.
3. TitleScreen: ambient crossfades to `title-pulse`. After 800ms `cidade-ouviu` voice plays, ambient ducks then restores.
4. CitySignalEntry: ambient = `city-signal`. Clicking a crew tile → `nav-slab` SFX + `voice-crew-<slug>` voice.
5. MainMenu: ambient = `hq-room`. Crew change layers crew motif on top (4-8s loop). Panel nav slabs play `nav-slab`. CONFIG panel shows SOM toggle.
6. GuidedOnboarding: ambient = `guided-attention` (low). Each step change plays `guided/step-<n>` voice with ducking.
7. CustomizeScreen: ambient = `locker-room`. Photo upload = `photo-shutter`. Wardrobe lock = `lock-on`, unlock = `remove-x`. Randomize = `randomize-roll`. Error = `error-buzz`. Save = `equip-snap`.
8. RunnerSavedTeaser: `stamp-save` SFX + `saved-stamp-wash` one-shot ambient. After 600ms `saved/cidade-pronta` voice. After 8s ambient returns to `hq-room`.
9. Mute toggle in CONFIG persists across reload.
10. With `prefers-reduced-motion: reduce` on a fresh localStorage, app boots muted.
11. iOS Safari: no audio before first tap; after first tap (PULAR/ENTRAR), ambient begins.

## Known limitations / open work

- **No `<source>` fallback.** mp3 only. Add `.webm` opus alternatives if Lighthouse Bytes Score complains.
- **No sprite sheets.** SFX are 12 individual HTTP requests on first interaction. Acceptable (<30KB combined); revisit if budget tightens.
- **No spatial pan automation.** `AudioEngine` doesn't yet pan crew pings in `city-signal` ambient — the panning is baked into the asset itself (per 02_AMBIENT_MAP §pings). If you want runtime control, swap the asset's pings to mono triggers + add a `pingAt(direction)` method.
- **No music ramp-down on screen exit from MainMenu.** `stopCrewMotif()` fires on unmount but no fade-out (it cuts on volume ramp to 0 over 400ms via the layered crossfade logic — OK, but verify).
- **Sub-90Hz mono enforcement** is a mix-bus rule that lives in the asset itself (mastered offline). Engine doesn't downmix.
