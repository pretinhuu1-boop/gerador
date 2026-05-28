# 04 — Voice Director (PT-BR)

> Reads [00_SONIC_IDENTITY.md](./00_SONIC_IDENTITY.md). Toda voz **humana, SP, seca**. Nada de TTS-robô, nada de podcast-pro. Levemente quebrada, com ar — como amiga de crew te dando o caminho.

## Casting (5 voices total — econômico, cobre tudo)

| ID | Sex | Tom | Sotaque | Uso |
|---|---|---|---|---|
| `system-fem-warm` | F | Mid-low, calmo, próximo (12cm mic) | SP carioca-de-fundo, pausada | System narrator (boot, saved) |
| `leader-fem-downtown` | F | Mid, urgente, segura | SP zona central | Downtown Rush leader voice |
| `leader-mas-north` | M | Mid-high, alegre, dinâmico | SP zona norte | North Breakers |
| `leader-mas-east` | M | Low, posicional, autoridade | SP zona leste (Sabotage school) | East Burners |
| `leader-fem-south-west` | F | Mid, fluida, atenta | SP zona sul/oeste | South Striders + West Flow (compartilham — orçamento) |

**Stability/style settings (ElevenLabs):**
- System narrator: `stability: 0.5`, `style: 0.2` (mais calmo e claro)
- Crew leaders: `stability: 0.4`, `style: 0.4` (mais expressivo)
- Always `use_speaker_boost: true`

## Roteiro completo (12 falas)

### A. Boot narrator (2 lines, `system-fem-warm`)

| File | Texto PT-BR | Tom direction |
|---|---|---|
| `voice-boot-sinal-ativo.mp3` | **"Sinal ativo."** | Murmurar baixo, ~70 dB SPL na boca; close mic, com ar de respiração |
| `voice-boot-cidade-ouviu.mp3` | **"A cidade ouviu teu sinal."** | Suspirar, levemente reverente, 1.6s, pausa final natural antes de cortar |

### B. Guided onboarding (4 lines, `system-fem-warm`)

Texto vem direto de `GuidedOnboarding.tsx:14-34`. Mesmo conteúdo pra TODOS crews — voz narrator único, identidade da crew vem do motif musical (03_MUSIC_MAP) tocando por baixo. Decisão: economia de assets + consistência narrativa do app.

| File | Texto PT-BR | Tom direction |
|---|---|---|
| `voice-guided-step-0.mp3` | **"Checkpoint 1. A cidade ouviu teu sinal. O mapa acende por presença coletiva. Chega perto, respira e escolhe teu lugar."** | Convidativa, pausada; respiração natural entre "perto" e "respira" |
| `voice-guided-step-1.mp3` | **"Checkpoint 2. Crew veste o mapa. Cada zona tem cor, patch e missão leve. Primeiro vem identidade, depois vem rua."** | Mais firme, ensinando |
| `voice-guided-step-2.mp3` | **"Checkpoint 3. Teu caminho fica teu. A crew recebe pulso coletivo. O sinal não abre teu caminho individual."** | Confidencial, baixa — "isso aqui é seguro" |
| `voice-guided-step-3.mp3` | **"Checkpoint 4. Monte teu runner. Foto do rosto, perfil e equipamento viram tua primeira marca na cidade."** | Convidativa de novo, encerra |

### C. Crew intro stings (5 lines, leader voices)

Triggered em `CitySignalEntry` quando user hovera/seleciona uma crew tile. Curtos. Texto = `introLine` de `data/crews.ts`.

| File | Crew | Voice | Texto |
|---|---|---|---|
| `voice-crew-downtown-rush.mp3` | Downtown Rush | `leader-fem-downtown` | **"Avenida-pulso acesa no centro."** |
| `voice-crew-north-breakers.mp3` | North Breakers | `leader-mas-north` | **"Subida quebrando a rotina."** |
| `voice-crew-south-striders.mp3` | South Striders | `leader-fem-south-west` | **"Curva longa, ritmo constante."** |
| `voice-crew-east-burners.mp3` | East Burners | `leader-mas-east` | **"Heat-route abrindo o bairro."** |
| `voice-crew-west-flow.mp3` | West Flow | `leader-fem-south-west` | **"Linha fluida atravessando o mapa."** |

### D. Saved teaser (1 line, `system-fem-warm`)

| File | Texto | Tom |
|---|---|---|
| `voice-saved-cidade-pronta.mp3` | **"Tua cidade ouviu. Pronta quando você for."** | Calorosa, finalizadora, pausa após "ouviu", quase sorrindo no final |

**TOTAL: 12 vozes.** Cabe em <$2 de ElevenLabs TTS easy.

## Tom-of-voice DO/DON'T (DESIGN.md §11-12)

| ✅ | ❌ |
|---|---|
| "Tua/teu" (não "sua/seu" — mais íntimo) | "MVP", "gerar", "API key" |
| "Bora", "chega perto", "tá pronto" | Gíria forçada ("mano broca", "tlgd") |
| Pausas naturais, respirações audíveis | Locução cristal de rádio |
| Frases curtas (4–8 palavras) | Sentences longas, narrativas |
| "Privada", "seguro", "coletivo" | "Performance", "tracking", "rank" |

## ElevenLabs TTS prompts

> Endpoint: `POST /v1/text-to-speech/{voice_id}`. Voice IDs: usuário escolhe na conta dele 5 vozes que casem com o casting acima e mapeia no script de geração. Sugestão: usar **Multilingual v2** model com `language_code: "pt"`.

### Example call (system narrator)
```python
from elevenlabs import ElevenLabs
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
audio = client.text_to_speech.convert(
    voice_id="<system-fem-warm voice_id>",
    text="A cidade ouviu teu sinal.",
    model_id="eleven_multilingual_v2",
    voice_settings={
        "stability": 0.5,
        "similarity_boost": 0.8,
        "style": 0.2,
        "use_speaker_boost": True,
    },
)
# Save to public/audio/voice/boot/voice-boot-cidade-ouviu.mp3
```

### Example call (crew leader)
```python
audio = client.text_to_speech.convert(
    voice_id="<leader-mas-east voice_id>",
    text="Heat-route abrindo o bairro.",
    model_id="eleven_multilingual_v2",
    voice_settings={
        "stability": 0.4,
        "similarity_boost": 0.85,
        "style": 0.4,
        "use_speaker_boost": True,
    },
)
```

## Implementation contract

```ts
// services/audio.ts
import { CrewSlug } from './audio'; // from 03

export type VoiceCue =
  | 'boot/cidade-ouviu' | 'boot/sinal-ativo'
  | 'guided/step-0' | 'guided/step-1' | 'guided/step-2' | 'guided/step-3'
  | 'saved/cidade-pronta';

export const VOICE_PATHS: Record<VoiceCue, string> = {
  'boot/cidade-ouviu': '/audio/voice/boot/voice-boot-cidade-ouviu.mp3',
  'boot/sinal-ativo': '/audio/voice/boot/voice-boot-sinal-ativo.mp3',
  'guided/step-0': '/audio/voice/guided/voice-guided-step-0.mp3',
  'guided/step-1': '/audio/voice/guided/voice-guided-step-1.mp3',
  'guided/step-2': '/audio/voice/guided/voice-guided-step-2.mp3',
  'guided/step-3': '/audio/voice/guided/voice-guided-step-3.mp3',
  'saved/cidade-pronta': '/audio/voice/saved/voice-saved-cidade-pronta.mp3',
};

export const CREW_INTRO_VOICE_PATHS: Record<CrewSlug, string> = {
  'downtown-rush': '/audio/voice/guided/voice-crew-downtown-rush.mp3',
  'north-breakers': '/audio/voice/guided/voice-crew-north-breakers.mp3',
  'south-striders': '/audio/voice/guided/voice-crew-south-striders.mp3',
  'east-burners': '/audio/voice/guided/voice-crew-east-burners.mp3',
  'west-flow': '/audio/voice/guided/voice-crew-west-flow.mp3',
};
```

## Trigger map

| Surface | When | Voice cue |
|---|---|---|
| ConsoleBoot.tsx | After signal-lock animation, ~600ms before navigation | `boot/sinal-ativo` |
| TitleScreen.tsx | 800ms after mount | `boot/cidade-ouviu` |
| CitySignalEntry.tsx | On crew tile hover/select | `CREW_INTRO_VOICE_PATHS[slug]` |
| GuidedOnboarding.tsx | On step change (debounced 200ms) | `guided/step-{n}` |
| RunnerSavedTeaser.tsx | 400ms after stamp | `saved/cidade-pronta` |

## Voice ducking (engine responsibility)

When ANY voice plays:
- Ambient bed → -6 dB, fade 200ms
- Crew motif (if playing) → -8 dB, fade 200ms
- UI SFX still plays at normal level (interaction must feel responsive)

On voice end: 400ms fade back to nominal levels.

## QA gate

- ✅ Cada fala soa humana em blind test (5 pessoas, ≥4 reconhecem como humana)
- ✅ Sotaque SP percebido (não genérico TV)
- ✅ Inteligibilidade 100% sobre `amb-guided-attention` (test layered playback)
- ✅ Tom NÃO soa robô-de-app/podcast-comercial
- ✅ Nenhuma fala > 6 segundos (manter pace do app)

— *Voice Director. A cidade fala porque é sua amiga, não porque é app.*
