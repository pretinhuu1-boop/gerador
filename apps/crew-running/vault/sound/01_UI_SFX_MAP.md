# 01 — UI SFX Designer

> Reads [00_SONIC_IDENTITY.md](./00_SONIC_IDENTITY.md). Every SFX = **Family + LUFS + duration + ElevenLabs prompt + trigger site**.

## Family reminder
- **SNAP** — A 5–10ms / D 80–120ms / total <250ms. Tap, lock, equip.
- **PULSE** — A 20–40ms / D 200–400ms. Crew pings, rare in UI.
- **WASH** — long, ambient only (não usar em SFX).

All UI SFX = mono, 44.1k, 128kbps mp3, peak -1 dBTP, short -16 LUFS.

## Inventory (10 assets + 2 variants)

| ID | File | Family | Dur | Family LUFS | Trigger site (file:line) |
|---|---|---|---|---|---|
| `tap` | `ui-tap.mp3` | SNAP | 90ms | -16 | Primary action button: `PULAR` ConsoleBoot.tsx:72, `ENTRAR` TitleScreen, `COMEÇAR` CitySignalEntry+MainMenu, `PRÓXIMO` GuidedOnboarding.tsx:52-57 |
| `tap-alt` | `ui-tap-alt.mp3` | SNAP | 80ms | -17 | Secondary tap variant (random alternation pra evitar fatigue) |
| `nav-slab` | `ui-nav-slab.mp3` | SNAP | 130ms | -16 | MainMenu.tsx:69-80 panel switch GUARDA ROUPA/CREWS/RUNNER/CONFIG |
| `lock-on` | `ui-lock-on.mp3` | SNAP | 180ms | -15 | WardrobePicker `onToggle` slot lock (graffiti lock-on grammar DESIGN.md §10) |
| `randomize-roll` | `ui-randomize-roll.mp3` | SNAP+wash tail | 350ms | -15 | CustomizeScreen `MISTURAR LOOK` button |
| `photo-shutter` | `ui-photo-shutter.mp3` | SNAP | 200ms | -14 | PhotoUpload.tsx file input change |
| `remove-x` | `ui-remove-x.mp3` | SNAP | 220ms | -15 | PhotoUpload.tsx `REMOVER` (destructive, sticker peel reverse) |
| `equip-snap` | `ui-equip-snap.mp3` | SNAP | 160ms | -14 | SheetPreview.tsx `EQUIPAR` callout (sticker snap, slightly heavier than lock-on) |
| `stamp-save` | `ui-stamp-save.mp3` | SNAP heavy | 480ms | -13 | CRIAR RUNNER complete → RunnerSavedTeaser open (heavy ink stamp + paper crunch) |
| `error-buzz` | `ui-error-buzz.mp3` | SNAP rough | 380ms | -15 | Gemini call fail in CustomizeScreen, any error state |
| `skip-cut` | `ui-skip-cut.mp3` | SNAP | 140ms | -16 | `PULAR` ConsoleBoot, `PULAR INTRO` TitleScreen, `PULAR TUTORIAL` GuidedOnboarding (tape cut texture) |
| `hover-tick` | `ui-hover-tick.mp3` | SNAP micro | 40ms | -22 | Optional — RunnerTypePicker hover, WardrobePicker hover. SUBTLE; usuários sem mouse não ouvem. |

## ElevenLabs Sound Effects API prompts

> Each block = one POST to `https://api.elevenlabs.io/v1/sound-generation` with `text` field. `duration_seconds` follows table. `prompt_influence` 0.5 (balance fidelity to prompt vs natural variation).

### `ui-tap.mp3`
```
A short, dry tap on textured cardboard, like a finger pressing a sticker against rough paper. 90 milliseconds. No reverb. Body around 600 Hz, transient click around 3 kHz. Tactile, NOT clean. Hint of paper grain. No musical pitch.
```
`duration_seconds: 0.1`

### `ui-tap-alt.mp3`
```
A finger flick against thick masking tape stuck to asphalt. Dry, short, organic. 80 milliseconds. Slightly drier than the previous tap, no metallic ring, no synthesizer. Hint of dust.
```
`duration_seconds: 0.1`

### `ui-nav-slab.mp3`
```
Sliding a heavy laminated card across a wet concrete surface, ending in a soft thud. 130 milliseconds total. Low-mid body around 200 Hz, mid friction around 1 kHz, no high sparkle. Sounds like a panel locking into place.
```
`duration_seconds: 0.15`

### `ui-lock-on.mp3`
```
A vinyl sticker being firmly pressed and smoothed onto wet asphalt, with a faint mechanical click at the end like a buckle. 180 milliseconds. Tactile, gritty, organic. Mid presence around 800 Hz, click transient 4 kHz. Street-textured, not clean.
```
`duration_seconds: 0.2`

### `ui-randomize-roll.mp3`
```
A short rapid shuffle of small plastic tokens or buckles, ending in one decisive snap. 350 milliseconds. Three to five tiny shuffles then a final clack. Mid frequencies dominant, no musical pitch, no whoosh.
```
`duration_seconds: 0.4`

### `ui-photo-shutter.mp3`
```
A disposable film camera shutter, mechanical, slightly dampened as if held against a jacket. 200 milliseconds. Crisp click in the middle, soft wind-up before. No digital camera beep. Slightly lo-fi, like a 1990s point-and-shoot.
```
`duration_seconds: 0.25`

### `ui-remove-x.mp3`
```
A sticker being peeled off asphalt with a short crinkle, reversed energy. 220 milliseconds. Starts with adhesive resistance then a soft release. Mid frequencies around 1.5 kHz, slight crackle. Feels like removal, not deletion.
```
`duration_seconds: 0.25`

### `ui-equip-snap.mp3`
```
A heavier vinyl decal being slammed flat onto a metal locker, ending with a satisfying THUNK. 160 milliseconds. Bigger body than a regular sticker (200 Hz weight), sharp slap transient at 2 kHz. Confident, final, equipment-locked-in feel.
```
`duration_seconds: 0.2`

### `ui-stamp-save.mp3`
```
A heavy rubber ink stamp slammed onto thick craft paper resting on concrete, with a faint paper crunch tail. 480 milliseconds total. Massive low-mid thump around 150 Hz, paper crinkle in the tail. Sounds official, weighty, ritual. No reverb, dry room.
```
`duration_seconds: 0.5`

### `ui-error-buzz.mp3`
```
A short failed marker scribble on wet paper, like a pen ran out mid-stroke. 380 milliseconds. Rough, scratchy, low-mid rasp around 400 Hz with high friction noise 4-6 kHz. NOT a digital error beep. Tactile failure.
```
`duration_seconds: 0.4`

### `ui-skip-cut.mp3`
```
A piece of masking tape being ripped abruptly off a wall in one short motion. 140 milliseconds. Dry, decisive, mid frequencies around 1.2 kHz, tail crackle 5 kHz. Tape rip energy. No music. No whoosh.
```
`duration_seconds: 0.15`

### `ui-hover-tick.mp3`
```
A single fingernail tick on rough cardboard, very quiet and very short. 40 milliseconds. Almost subliminal. High-mid transient 3 kHz only, no body. Like a metronome subtick.
```
`duration_seconds: 0.05`

## Implementation contract (consumed by 06 integration)

```ts
// services/audio.ts SfxId union
export type SfxId =
  | 'tap' | 'tap-alt'
  | 'nav-slab'
  | 'lock-on'
  | 'randomize-roll'
  | 'photo-shutter'
  | 'remove-x'
  | 'equip-snap'
  | 'stamp-save'
  | 'error-buzz'
  | 'skip-cut'
  | 'hover-tick';

export const SFX_PATHS: Record<SfxId, string> = {
  'tap': '/audio/ui/ui-tap.mp3',
  'tap-alt': '/audio/ui/ui-tap-alt.mp3',
  'nav-slab': '/audio/ui/ui-nav-slab.mp3',
  'lock-on': '/audio/ui/ui-lock-on.mp3',
  'randomize-roll': '/audio/ui/ui-randomize-roll.mp3',
  'photo-shutter': '/audio/ui/ui-photo-shutter.mp3',
  'remove-x': '/audio/ui/ui-remove-x.mp3',
  'equip-snap': '/audio/ui/ui-equip-snap.mp3',
  'stamp-save': '/audio/ui/ui-stamp-save.mp3',
  'error-buzz': '/audio/ui/ui-error-buzz.mp3',
  'skip-cut': '/audio/ui/ui-skip-cut.mp3',
  'hover-tick': '/audio/ui/ui-hover-tick.mp3',
};
```

**Tap alternation rule:** AudioEngine `playSfx('tap')` rolls 50/50 between `tap` and `tap-alt` to avoid sample-replay fatigue. Hover-tick rate-limit 200ms entre disparos (anti-spam).

## QA gate

- Soa antes de musical: ✅ se nenhum SFX tem pitch identificável
- Soa antes de cinematic: ✅ se nenhum reverb > 200ms decay
- Soa antes de tátil: ✅ se cada asset tem grain/crackle audível
- Coerência SNAP: ✅ se 95% dos SFX < 250ms
- Volume normalization: ✅ se peak entre -1 e -3 dBTP em todos

— *UI SFX Designer. Cada toque é uma fita arrancada.*
