# 02 — Ambient / Scene Designer

> Reads [00_SONIC_IDENTITY.md](./00_SONIC_IDENTITY.md). Family = **WASH** (long, low-energy bed). 6 beds + 1 special tail. Each one tem que sentar embaixo da voz/UI sem competir.

## Loop format hard rules
- Stereo, 44.1k, 192kbps mp3.
- Zero-crossing alinhado no start/end (sem clicks no loop).
- Crossfade 800ms ao trocar de ambient via `audio.crossfadeAmbient()`.
- Solo loudness **-22 LUFS integrated** / true peak -3 dBTP.
- High-cut em 10kHz mandatório (rule §2 of brand bible).
- NUNCA synth pad. SEMPRE field recording + processamento (real chuva, real underpass, real rua noturna).

## Inventory (6 + 1)

| ID | File | Loop dur | Mood | Spatial | Reference (§5 brand bible) |
|---|---|---|---|---|---|
| `boot-cold` | `amb-boot-cold.mp3` | 30s | Sub rumble + signal burst hiss; "cidade respirando antes de ligar" | Wide stereo, sub mono | Nicolas Jaar — *El Bandido* |
| `title-pulse` | `amb-title-pulse.mp3` | 60s | Slow heartbeat + distant traffic; "esperando ser tocado" | Wide stereo, breathing pan | Burial — *Archangel* |
| `city-signal` | `amb-city-signal.mp3` | 90s | Expansive map breath + 5 crew pings panned; "território falando" | Pings: Downtown L70 / North R70 / South L40 / East R40 / West C | Burial + Jaar combo |
| `hq-room` | `amb-hq-room.mp3` | 60s | Sticker shuffle + low room tone + occasional zipper; "vestiário esperando você" | Mid-wide, close & intimate | — |
| `locker-room` | `amb-locker-room.mp3` | 90s | Locker echo + fabric shuffle + distant water drip; "creator mode" | Mid-wide, slight slap reverb 400ms decay | — |
| `guided-attention` | `amb-guided-attention.mp3` | 75s | Like `hq-room` but -3dB and even slower pulse; ducking-friendly | Wide stereo, very dry | — |
| `saved-stamp-wash` ⚡ | `amb-saved-stamp-wash.mp3` | 8s (no loop) | Brief ascending wash; "cidade abrindo" tail | Wide stereo, opens-up | Burial outro vibe |

## ElevenLabs Music API prompts

> ElevenLabs Sound Effects API supports up to 22s. For ambient loops >22s, generate **multiple takes** and the user concatena/loops via ffmpeg, OR use ElevenLabs **Music API** (`/v1/music`) for the longer beds. SFX API recommended for 8–22s; Music API for 60s+ beds. Each prompt is engineered for `prompt_influence: 0.3` (favor naturalness over literal interpretation).

### `amb-boot-cold.mp3` (ElevenLabs **Music** API, 30s)
```
A 30-second ambient field recording of a São Paulo underpass at 4am before rush hour begins. Distant low sub rumble from a parked truck, faint electrical hum, occasional signal burst like a transistor radio searching for a station. No melody. No instruments. No drums. Pure environmental atmosphere. Cold, gritty, ritualistic. Sub frequencies dominant around 50 Hz, sparse mid hiss around 2 kHz, no high frequencies above 8 kHz. Mono sub, wide stereo ambience. Loop-friendly — the end should match the beginning.
```

### `amb-title-pulse.mp3` (ElevenLabs **Music** API, 60s)
```
A 60-second slow ambient bed of a city street at night, with a soft heartbeat-like pulse every 2 seconds buried in the mix. Distant traffic three blocks away, faint chuva fina (light rain) on canvas. No melody, no instruments. The pulse is felt more than heard. Frequencies: 50-80 Hz sub heartbeat, 200-400 Hz street body, gentle 3 kHz rain texture. Wide stereo. Loop-friendly start and end.
```

### `amb-city-signal.mp3` (ElevenLabs **Music** API, 90s)
```
A 90-second expansive ambient bed of a city map coming alive. Background: distant traffic, faint church bell three kilometers away, soft wind. Foreground: five subtle sonar-like pings, each at different intervals and panned across stereo. The pings are organic, not digital — like dropping a small stone in a puddle, recorded close. Slow breathing pace, no rush. No melody, no instruments. The bed sits at very low volume; the pings sit slightly above. Loop-friendly.
```

### `amb-hq-room.mp3` (ElevenLabs **Music** API, 60s)
```
A 60-second ambient bed of a small back room used as a crew clubhouse. Close textures: occasional rustle of a vinyl sticker being moved, faint zipper of a jacket, low refrigerator hum, distant city outside a closed window. Intimate, slightly enclosed feel. No melody, no instruments, no voices. Frequencies: 80 Hz room tone, mid 500 Hz body, occasional 2 kHz sticker friction. Wide stereo but close perspective. Loop-friendly.
```

### `amb-locker-room.mp3` (ElevenLabs **Music** API, 90s)
```
A 90-second ambient bed of a locker room or training space. Soft echo (around 400ms decay), faint metal locker clank in the distance every 15-20 seconds, slow water drip every 8 seconds, fabric shuffle as if someone is changing. No voices, no music. The space feels tactile and physical. Frequencies: 100 Hz body, 800 Hz metal resonance, gentle 4 kHz water drip. Stereo with mid emphasis. Loop-friendly.
```

### `amb-guided-attention.mp3` (ElevenLabs **Music** API, 75s)
```
A 75-second very low ambient bed designed to sit underneath spoken voice. Very minimal — just a quiet room tone with occasional barely-audible distant traffic and a single soft sub pulse every 4 seconds. No melody, no instruments. Frequencies extremely contained: 60 Hz sub pulse, soft 300 Hz body, nothing above 6 kHz. Wide stereo but very dry, no reverb. Designed to duck under speech. Loop-friendly.
```

### `amb-saved-stamp-wash.mp3` (ElevenLabs **Music** API, 8s, no-loop)
```
An 8-second one-shot ambient swell. Starts quiet with a soft sub rumble at 50 Hz, then over 6 seconds opens up like a cinema theater curtain — adding gentle wide stereo wash, a hint of distant city pulse, soft chuva texture. Ends at full presence, no decay (cuts to silence). No melody, no instruments. Feels like a door opening to the city. Frequencies build from sub through low-mid 200 Hz to gentle 5 kHz air.
```

## Implementation contract

```ts
// services/audio.ts AmbientId union
export type AmbientId =
  | 'boot-cold'
  | 'title-pulse'
  | 'city-signal'
  | 'hq-room'
  | 'locker-room'
  | 'guided-attention'
  | 'saved-stamp-wash';

export const AMBIENT_PATHS: Record<AmbientId, string> = {
  'boot-cold': '/audio/ambient/amb-boot-cold.mp3',
  'title-pulse': '/audio/ambient/amb-title-pulse.mp3',
  'city-signal': '/audio/ambient/amb-city-signal.mp3',
  'hq-room': '/audio/ambient/amb-hq-room.mp3',
  'locker-room': '/audio/ambient/amb-locker-room.mp3',
  'guided-attention': '/audio/ambient/amb-guided-attention.mp3',
  'saved-stamp-wash': '/audio/ambient/amb-saved-stamp-wash.mp3',
};

export const AMBIENT_NOLOOP: Set<AmbientId> = new Set(['saved-stamp-wash']);
```

## Trigger map (consumed by 06 integration)

| Screen | Ambient ID | Notes |
|---|---|---|
| ConsoleBoot.tsx | `boot-cold` | preload critical, start muted, unmute on first user gesture |
| TitleScreen.tsx | `title-pulse` | crossfade from boot-cold (800ms) |
| CitySignalEntry.tsx | `city-signal` | crossfade |
| MainMenu.tsx | `hq-room` | crossfade; if crew selected, layer crew motif on top (see 03_MUSIC_MAP) |
| GuidedOnboarding.tsx | `guided-attention` | crossfade; voice will duck this -6dB during playback |
| CustomizeScreen.tsx | `locker-room` | crossfade |
| RunnerSavedTeaser.tsx | `saved-stamp-wash` then `hq-room` | play wash (8s no-loop) → on end crossfade back to hq-room |

## QA gate

- ✅ Cada loop testado em 5-min playback sem click/pop
- ✅ Crossfade entre quaisquer 2 beds: sem dip audível (-3dB max scoop no centro)
- ✅ Bed solo na -22 LUFS conferida com `ffmpeg -af ebur128`
- ✅ Nenhum bed tem componente acima de 10kHz (LPF aplicado)
- ✅ `guided-attention` sob voz não compete (test: play voice + amb, voz inteligível 100%)
- ✅ `saved-stamp-wash` corta limpo, não loopa (engine respeita `AMBIENT_NOLOOP` set)

— *Ambient Designer. A cidade nunca está em silêncio total.*
