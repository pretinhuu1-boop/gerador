# 03 — Music / Motif Composer

> Reads [00_SONIC_IDENTITY.md](./00_SONIC_IDENTITY.md). Family = **PULSE**. Music here = identidade, não trilha de filme. Cada motivo curto, loopável, e CASA com o ambient bed (não compete).

## Format rules
- Stereo, 44.1k, 192kbps mp3.
- Sub mono abaixo de 80Hz, stereo wide acima.
- Loudness integrated -16 LUFS, peak -1 dBTP.
- BPM e key especificados pra coerência cross-crew.
- Loop crossfade-friendly (start = end).

## Crew motifs (5)

Cada motif **toca por cima do ambient `hq-room`** quando o usuário entra no MainMenu COM uma crew selecionada (`activeCrewSlug` em launchStorage). Volume sit -4dB abaixo do bed na intro 600ms, depois sobe.

| Slug (de `data/crews.ts`) | File | BPM | Key | Vibe | Reference |
|---|---|---|---|---|---|
| `downtown-rush` | `mus-crew-downtown-rush.mp3` | 130 | F minor | Baile funk SP reduzido, kick + caixa de tamborzão, urgência centro | Tati Quebra Barraco-era baile, MC's de Heliópolis |
| `north-breakers` | `mus-crew-north-breakers.mp3` | 168 | A minor | Drum'n'bass quebrado, breakbeat sintetizado por amos chopped, energia subida | Goldie - *Inner City Life*, Calibre |
| `south-striders` | `mus-crew-south-striders.mp3` | 122 | C minor | Deep house steady, kick lento e sólido, hi-hat off-beat | Larry Heard, Floating Points slow tempo |
| `east-burners` | `mus-crew-east-burners.mp3` | 90 | E minor | Hip-hop boom-bap SP, vinyl crackle, kick + snare crocante | Sabotage - *Um Bom Lugar*, RZA mid-90s |
| `west-flow` | `mus-crew-west-flow.mp3` | 75 | G minor | Lo-fi flow + dub texture, échos, kick relaxado, baixo dub | King Tubby, lo-fi Tokyo room recordings |

### Asset duration
- 8 seconds loop. Curto: meta de "criar pulso", não "compor música". Repetição não cansa porque mistura com ambient + voice + UI.

### Pan / Spatialization
- Cada motif tem identidade espacial leve correlacionada com a `map.x` do crew em `data/crews.ts`:
  - Downtown (x=50) → centro
  - North (x=48) → centro-leve
  - South (x=56) → leve direita
  - East (x=76) → direita 30%
  - West (x=25) → esquerda 30%

### ElevenLabs Music API prompts

> Endpoint: `POST /v1/music` (or whatever ElevenLabs Music endpoint is in latest SDK). `prompt_influence: 0.4`. Each request 8 seconds duration. Generate **3 takes** per motif and pick best (lowest perceived clinical-ness).

#### `mus-crew-downtown-rush.mp3`
```
An 8-second loopable São Paulo baile funk instrumental at 130 BPM in F minor. Heavy tamborzão kick on every beat, sharp clap on 2 and 4, distant whistle texture, slight vinyl crackle. Energy of rush hour downtown São Paulo at dusk — urgent but controlled. Bass mono below 80 Hz, wide stereo above. NO vocals, NO melody on top, NO synthesizer leads. Pure percussion + low bass + texture. Loop-perfect — beat 1 of bar 1 should match beat 1 of bar 3.
```

#### `mus-crew-north-breakers.mp3`
```
An 8-second loopable broken drum and bass instrumental at 168 BPM in A minor. Chopped Amen-style break beat, sub bass pulse, jungle texture but minimal — no melody, no synth leads, no pads. Slight tape hiss. Energy of breaking a hill climb at dawn. NO vocals. Stereo wide drums, mono sub. Loop-perfect transitions.
```

#### `mus-crew-south-striders.mp3`
```
An 8-second loopable deep house instrumental at 122 BPM in C minor. Slow steady four-on-the-floor kick, dry shaker on off-beats, soft sub bass pulse. Wet pavement reverb on the snare ghosts. NO synth lead, NO chord stab, NO vocal. Pure rhythm bed. Mood: long curved street at 6am, steady pace, no rush. Mono sub, stereo percussion. Loop-perfect.
```

#### `mus-crew-east-burners.mp3`
```
An 8-second loopable boom-bap hip-hop instrumental at 90 BPM in E minor. Crisp kick on 1 and 3, snappy snare on 2 and 4, vinyl crackle throughout, soft hi-hat triplets. Sub bass slow pulse. NO sample loop with melody, NO vocal, NO horn. Just drums and texture. Mood: street block warming up at noon, confident, posted. Mono sub, stereo drums. Loop-perfect.
```

#### `mus-crew-west-flow.mp3`
```
An 8-second loopable lo-fi dub instrumental at 75 BPM in G minor. Relaxed kick with long delay tail, sparse snare with spring reverb, soft sub bass drone, dub-style stereo echoes. NO melody, NO chord, NO vocal. Mood: open avenue, evening, flow state, no friction. Mono sub, very wide stereo echoes. Loop-perfect — the dub echoes should resolve cleanly at the loop point.
```

## Runner-type stingers (5)

**Trigger:** `RunnerTypePicker.tsx` select. Plays ONCE on selection, NOT looped. Sit -2dB above ambient briefly.

| Type ID | File | Duration | Family | Character |
|---|---|---|---|---|
| `sprint` | `mus-rt-sprint.mp3` | 1.2s | PULSE+SNAP | Single explosive kick + air-sucking inhale + cymbal swell cut short |
| `long-run` | `mus-rt-long-run.mp3` | 1.6s | PULSE | Three steady kicks at 110 BPM, soft sub pulse continues, sense of "começar a andar" |
| `night-run` | `mus-rt-night-run.mp3` | 1.8s | WASH+PULSE | Cold reverb tail + distant single ping; eerie quiet confidence |
| `crew-pace` | `mus-rt-crew-pace.mp3` | 1.4s | PULSE | Two kicks + sticker snap; collective trigger; small "go" energy |
| `urban-trail` | `mus-rt-urban-trail.mp3` | 1.5s | PULSE+grit | Gravel crunch + kick + low rasp; raw asphalt energy |

### ElevenLabs Sound Effects prompts (stingers via SFX API, not Music)

#### `mus-rt-sprint.mp3`
```
A single explosive kick drum hit at 50 Hz with an air-sucking inhale on top and a cymbal swell that gets cut off abruptly at the end. 1.2 seconds total. Aggressive, urgent, sprint-energy. NO melody, NO musical chord. Just kick + breath + cut.
```
`duration_seconds: 1.2`

#### `mus-rt-long-run.mp3`
```
Three steady kick drum hits at 110 BPM with a soft sub bass pulse continuing underneath, ending with a final soft tail. 1.6 seconds total. Sense of starting to move at sustainable pace. NO melody, NO chord. Just kicks + sub.
```
`duration_seconds: 1.6`

#### `mus-rt-night-run.mp3`
```
A cold reverb tail wash with a single distant sonar-like ping at the start, gradually decaying into silence. 1.8 seconds. Eerie, confident, late-night quiet. NO melody. NO bright frequencies. Mid-to-low only.
```
`duration_seconds: 1.8`

#### `mus-rt-crew-pace.mp3`
```
Two kick drum hits at 100 BPM with a sharp sticker snap layered on the second hit. 1.4 seconds. Sense of collective "let's go" energy. NO melody, NO chord. Just two kicks + snap.
```
`duration_seconds: 1.4`

#### `mus-rt-urban-trail.mp3`
```
A gravel crunch under a running shoe, immediately followed by a kick drum hit and a low rasp. 1.5 seconds. Raw asphalt-and-dirt energy. NO melody, NO musical pitch. Pure texture + kick.
```
`duration_seconds: 1.5`

## Implementation contract

```ts
// services/audio.ts
import { CREWS } from '../data/crews';
import { RUNNER_TYPES, RunnerTypeId } from '../data/runnerTypes';

export type CrewSlug = typeof CREWS[number]['slug']; // 'downtown-rush' | ...

export const CREW_MOTIF_PATHS: Record<CrewSlug, string> = {
  'downtown-rush': '/audio/music/crew/mus-crew-downtown-rush.mp3',
  'north-breakers': '/audio/music/crew/mus-crew-north-breakers.mp3',
  'south-striders': '/audio/music/crew/mus-crew-south-striders.mp3',
  'east-burners': '/audio/music/crew/mus-crew-east-burners.mp3',
  'west-flow': '/audio/music/crew/mus-crew-west-flow.mp3',
};

export const RUNNER_TYPE_STINGER_PATHS: Record<RunnerTypeId, string> = {
  'sprint': '/audio/music/runner-type/mus-rt-sprint.mp3',
  'long-run': '/audio/music/runner-type/mus-rt-long-run.mp3',
  'night-run': '/audio/music/runner-type/mus-rt-night-run.mp3',
  'crew-pace': '/audio/music/runner-type/mus-rt-crew-pace.mp3',
  'urban-trail': '/audio/music/runner-type/mus-rt-urban-trail.mp3',
};
```

## Trigger map

| Surface | Action | Trigger |
|---|---|---|
| MainMenu.tsx | crew slug active → motif loops layer on hq-room ambient | `audio.layerCrewMotif(crewSlug)` |
| MainMenu.tsx | crew change | crossfade motif (400ms) |
| RunnerTypePicker.tsx | type pick | `audio.playRunnerTypeStinger(typeId)` (one-shot) |

## QA gate

- ✅ Cada motif loopa 60s sem click no boundary
- ✅ Crew change crossfade não causa beat drop perceptível
- ✅ Motif + ambient + UI SFX playing simultaneously: voz ainda legível (no test layer)
- ✅ Stingers < 2s, não atrapalham UX de RunnerTypePicker
- ✅ BPMs declarados batem com waveform analysis (test with audacity beat grid)

— *Motif Composer. Cada crew tem seu coração batendo na HQ.*
