# GENERATE_ASSETS — runbook

> Step-by-step to fill `public/audio/**` once ElevenLabs API key lands. ~40 assets total. Estimated cost: **$5–15** depending on take-count per asset.

## Prereq

```bash
export ELEVENLABS_API_KEY="sk_..."
# OR persist:
echo 'export ELEVENLABS_API_KEY="sk_..."' >> ~/.zshrc
```

Verify:
```bash
curl -sS -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/user | head
```

## Install ElevenLabs Python SDK (recommended for batch)

```bash
python3 -m venv .venv-sound && source .venv-sound/bin/activate
pip install elevenlabs ffmpeg-python
```

(Node SDK works too — `npm i -g elevenlabs` — same API surface.)

## Phase A — UI SFX (12 calls, ~$0.50)

Reads `vault/sound/01_UI_SFX_MAP.md` § "ElevenLabs Sound Effects API prompts". Each prompt → one POST to `/v1/sound-generation`.

```python
# scripts/gen-sfx.py (create this if useful)
import os, pathlib
from elevenlabs import ElevenLabs

client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])
OUT = pathlib.Path("public/audio/ui")
OUT.mkdir(parents=True, exist_ok=True)

PROMPTS = {
  "ui-tap.mp3": ("A short, dry tap on textured cardboard...", 0.1),
  "ui-tap-alt.mp3": ("A finger flick against thick masking tape...", 0.1),
  "ui-nav-slab.mp3": ("Sliding a heavy laminated card...", 0.15),
  # ... copy remaining 9 prompts verbatim from 01_UI_SFX_MAP.md
}

for filename, (prompt, dur) in PROMPTS.items():
    audio = client.text_to_sound_effects.convert(
        text=prompt,
        duration_seconds=dur,
        prompt_influence=0.5,
    )
    out_path = OUT / filename
    with open(out_path, "wb") as f:
        for chunk in audio:
            f.write(chunk)
    print(f"✓ {filename}")
```

Run: `python scripts/gen-sfx.py`

## Phase B — Ambient beds (7 calls, ~$3-5)

Reads `02_AMBIENT_MAP.md`. Uses **Music API** for 30s+ loops:

```python
# scripts/gen-ambient.py
import os, pathlib
from elevenlabs import ElevenLabs

client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])
OUT = pathlib.Path("public/audio/ambient")
OUT.mkdir(parents=True, exist_ok=True)

AMBIENTS = {
  "amb-boot-cold.mp3": ("A 30-second ambient field recording of a São Paulo underpass at 4am...", 30),
  "amb-title-pulse.mp3": ("A 60-second slow ambient bed of a city street at night...", 60),
  # ... copy remaining 5 from 02_AMBIENT_MAP.md
}

for filename, (prompt, dur) in AMBIENTS.items():
    # ElevenLabs Music API
    result = client.music.compose(prompt=prompt, music_length_ms=dur * 1000)
    with open(OUT / filename, "wb") as f:
        for chunk in result:
            f.write(chunk)
    print(f"✓ {filename}")
```

**Loop cleanup (manual after generation):**
```bash
# Trim 50ms from start and end so loop crossfades clean
ffmpeg -i amb-hq-room.mp3 -af "afade=t=in:st=0:d=0.05,afade=t=out:st=59.95:d=0.05" amb-hq-room-clean.mp3 && mv amb-hq-room-clean.mp3 amb-hq-room.mp3
```

## Phase C — Music motifs + stingers (10 calls, ~$2-4)

Reads `03_MUSIC_MAP.md`. Crew motifs via Music API (8s), runner-type stingers via SFX API (1-2s).

```python
# scripts/gen-music.py — see 03_MUSIC_MAP.md for full prompts
CREW_MOTIFS = {
  "mus-crew-downtown-rush.mp3": "An 8-second loopable São Paulo baile funk instrumental at 130 BPM in F minor...",
  # ... 4 more
}
RUNNER_STINGERS = {
  "mus-rt-sprint.mp3": ("A single explosive kick drum hit at 50 Hz...", 1.2),
  # ... 4 more
}

# Generate motifs via music.compose, stingers via text_to_sound_effects.convert
```

## Phase D — Voice (TTS) (12 calls, ~$0.50-1)

Reads `04_VOICE_MAP.md`. Pick voice_ids in your ElevenLabs account that match the 5-voice casting; map at top of script.

```python
# scripts/gen-voice.py
VOICES = {
  "system_fem_warm": "<voice_id from your ElevenLabs library>",
  "leader_fem_downtown": "<voice_id>",
  "leader_mas_north": "<voice_id>",
  "leader_mas_east": "<voice_id>",
  "leader_fem_south_west": "<voice_id>",
}

LINES = [
  # (filename, voice_key, text, stability, style)
  ("voice/boot/voice-boot-sinal-ativo.mp3", "system_fem_warm", "Sinal ativo.", 0.5, 0.2),
  ("voice/boot/voice-boot-cidade-ouviu.mp3", "system_fem_warm", "A cidade ouviu teu sinal.", 0.5, 0.2),
  ("voice/guided/voice-guided-step-0.mp3", "system_fem_warm", "Checkpoint 1. A cidade ouviu teu sinal. O mapa acende por presença coletiva. Chega perto, respira e escolhe teu lugar.", 0.5, 0.2),
  ("voice/guided/voice-guided-step-1.mp3", "system_fem_warm", "Checkpoint 2. Crew veste o mapa. Cada zona tem cor, patch e missão leve. Primeiro vem identidade, depois vem rua.", 0.5, 0.2),
  ("voice/guided/voice-guided-step-2.mp3", "system_fem_warm", "Checkpoint 3. Teu caminho fica teu. A crew recebe pulso coletivo. O sinal não abre teu caminho individual.", 0.5, 0.2),
  ("voice/guided/voice-guided-step-3.mp3", "system_fem_warm", "Checkpoint 4. Monte teu runner. Foto do rosto, perfil e equipamento viram tua primeira marca na cidade.", 0.5, 0.2),
  ("voice/guided/voice-crew-downtown-rush.mp3", "leader_fem_downtown", "Avenida-pulso acesa no centro.", 0.4, 0.4),
  ("voice/guided/voice-crew-north-breakers.mp3", "leader_mas_north", "Subida quebrando a rotina.", 0.4, 0.4),
  ("voice/guided/voice-crew-south-striders.mp3", "leader_fem_south_west", "Curva longa, ritmo constante.", 0.4, 0.4),
  ("voice/guided/voice-crew-east-burners.mp3", "leader_mas_east", "Heat-route abrindo o bairro.", 0.4, 0.4),
  ("voice/guided/voice-crew-west-flow.mp3", "leader_fem_south_west", "Linha fluida atravessando o mapa.", 0.4, 0.4),
  ("voice/saved/voice-saved-cidade-pronta.mp3", "system_fem_warm", "Tua cidade ouviu. Pronta quando você for.", 0.5, 0.2),
]

import os, pathlib
from elevenlabs import ElevenLabs
client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])

for rel, voice_key, text, stability, style in LINES:
    out = pathlib.Path("public/audio") / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    audio = client.text_to_speech.convert(
        voice_id=VOICES[voice_key],
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings={
            "stability": stability,
            "similarity_boost": 0.8,
            "style": style,
            "use_speaker_boost": True,
        },
    )
    with open(out, "wb") as f:
        for chunk in audio:
            f.write(chunk)
    print(f"✓ {rel}")
```

## Phase E — Normalize loudness (ffmpeg, free, local)

Per 00_SONIC_IDENTITY.md §4 the bus targets are: ambient -22 LUFS, music -16, voice -18, SFX peak -16. ElevenLabs gives roughly -14 LUFS by default. Walk through with EBU R128:

```bash
# Per-file two-pass loudnorm to hit target LUFS
for f in public/audio/ambient/*.mp3; do
  ffmpeg -i "$f" -af loudnorm=I=-22:TP=-3:LRA=11 -ar 44100 -b:a 192k "${f%.mp3}-norm.mp3" -y
  mv "${f%.mp3}-norm.mp3" "$f"
done

# Same for music (-16):
for f in public/audio/music/**/*.mp3; do
  ffmpeg -i "$f" -af loudnorm=I=-16:TP=-1:LRA=8 -ar 44100 -b:a 192k "${f%.mp3}-norm.mp3" -y
  mv "${f%.mp3}-norm.mp3" "$f"
done

# Voice -18:
for f in public/audio/voice/**/*.mp3; do
  ffmpeg -i "$f" -af loudnorm=I=-18:TP=-1.5:LRA=8 -ar 44100 -b:a 128k -ac 1 "${f%.mp3}-norm.mp3" -y
  mv "${f%.mp3}-norm.mp3" "$f"
done
```

## Phase F — Listening pass

```bash
cd apps/crew-running && npm run dev
# Open http://localhost:5173, walk through every screen.
```

Use the QA checklist in `99_INTEGRATION.md`.

## Cost log template

Track per session:
| Date | Phase | Assets generated | $ spent | Notes |
|---|---|---|---|---|
| YYYY-MM-DD | A (SFX) | 12 | $0.42 | first take all kept |
| YYYY-MM-DD | B (ambient) | 7 | $3.10 | re-rolled boot-cold 2x |
| ... | | | | |

## Failure modes

- **402 Payment Required** → out of quota. Check dashboard, top up, resume from last successful filename.
- **400 Invalid voice_id** → fill in real voice_ids in `VOICES` map of gen-voice.py.
- **Loop click in ambient** → loudnorm pass cut the fade. Re-run phase E with the `afade` step before loudnorm.
- **Voice sounds robotic** → drop stability to 0.35, regenerate that single line.
- **SFX too long** → ElevenLabs SFX API max is 22s; for shorter use `duration_seconds`. Auto-pad output to nominal duration in code is OK (engine doesn't care).

## When done

Update `99_INTEGRATION.md` "What's wired" → mark each asset row ✅, and run the QA checklist top-to-bottom on real device (Mac Chrome + iOS Safari minimum).
