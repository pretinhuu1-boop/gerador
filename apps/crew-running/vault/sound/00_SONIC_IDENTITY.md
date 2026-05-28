# 00 — Sonic Identity Architect

> **Constraint document.** Other 4 briefs (UI SFX, Ambient, Music, Voice) MUST reference this. If a sound doesn't fit the rules here, it doesn't ship.

## 1 — Mission statement (1 line)

**O app não toca. A cidade liga.** O som é a primeira evidência de que o sinal chegou — antes do título, antes do mapa, antes da crew. Asfalto úmido, fita crepe, spray, pneu raspando, fôlego curto. Nunca videogame, nunca fitness app, nunca corporativo.

## 2 — Sonic palette (frequência + textura)

| Banda | Hz | Textura de referência | Onde aparece |
|---|---|---|---|
| **Sub** | 20–60 | rolo de asfalto distante, motor parado, sub de baile funk SP | ambient `boot-cold`, ambient `hq-room`, ground-floor de todo motivo de crew |
| **Low-mid** | 60–250 | bumbo de baile abafado, kick de breakbeat, tampo de container | crew motifs, ambient `city-signal` |
| **Mid** | 250–2k | spray-can hiss, sticker peel, tape rip, voz humana SP sotaque | UI SFX (snap/lock-on), voz, crowd murmur |
| **High-mid** | 2k–6k | crackle de vinil, marker squeak, click de fivela | UI SFX (tap, equip-snap), saved-stamp |
| **High** | 6k–14k | ar respirando, microfonia distante, chuva fina | ambient tails, fade-ins, voice presence |
| **Ultra** | 14k+ | corte total acima de 16kHz — ninguém ouve, só satura mp3 | LPF em -6dB/oct a partir de 14k em TODO asset |

**Regra dura:** nenhum asset com pico acima de 14kHz não-rolloff. Tudo é "rua à noite", não "studio limpo".

## 3 — Texturas de assinatura (3 famílias)

### Família A — **SNAP** (UI confirm)
- **Mood:** fita crepe arrancada, sticker grudando no asfalto molhado, click de fivela de mochila.
- **ADSR:** Attack 5–10ms / Decay 80–120ms / Sustain 0 / Release 40–80ms. Total < 250ms.
- **Espectro:** transient em 2–4kHz, body em 400–800Hz, tail wash em 6–10kHz.
- **Uso:** tap, lock-on, equip-snap, nav-slab.

### Família B — **PULSE** (crew rhythm / map ping)
- **Mood:** batida de coração coletivo, kick de baile funk reduzido, ping de sonar em prédio.
- **ADSR:** A 20–40ms / D 200–400ms / S 0.2 / R 300–600ms. Sente o corpo.
- **Espectro:** weight em 60–120Hz, mid punch em 400Hz, air em 4–6kHz.
- **Uso:** crew motif loops, city-signal pings, runner-type stingers.

### Família C — **WASH** (ambient bed)
- **Mood:** chuva fina sobre lona, vento em viaduto, suspiro de marquise vazia.
- **ADSR:** A 2–6s / D ∞ (loop) / S 1 / R 2–4s.
- **Espectro:** noise floor com bumps em 80Hz e 200Hz; high-cut em 10kHz.
- **Uso:** todo ambient bed, voice ducking carrier.

## 4 — Loudness & dynamics

| Bus | LUFS target | True peak |
|---|---|---|
| Master output | **-14 LUFS integrated** | -1.0 dBTP |
| Ambient bed (solo) | **-22 LUFS** | -3.0 dBTP |
| UI SFX (peak) | -16 LUFS short | -1.0 dBTP |
| Music/motif | -16 LUFS integrated | -1.0 dBTP |
| Voice | -18 LUFS integrated | -1.5 dBTP |

**Voice ducking:** ambient automaticamente -6 dB durante voice playback, fade 200ms in / 400ms out (rule lives in `AudioEngine.playVoice()`).

**Mix scene:** quando ambient + crew motif + UI SFX tocam juntos, sidechain-style — ambient cai -3dB durante motif, motif cai -2dB durante SFX. (Implementação no AudioEngine.)

## 5 — Reference tracks (3 + 1)

1. **Burial — *Archangel*** → grain de chuva, vinyl crackle, presença de cidade vazia. Modelo de *Wash* + *Pulse*.
2. **Sampa The Galaxy / Cesar Mc — anything beat SP** → kick e graffiti energy. Modelo do baile funk reduzido das *crew motifs*.
3. **Nicolas Jaar — *El Bandido*** → espaço, dramatic silence, sub bem definido. Modelo de *boot* + *title-pulse*.
4. (Bônus) **Sabotage — *Um Bom Lugar*** → SP textura, voz seca, ambiente de rua → modelo de voice texture e East Burners crew.

NÃO referenciar: Hans Zimmer, Marvel trailer beds, Apple Fitness+, Strava clip-genérico.

## 6 — Tone-of-voice (3 adjetivos + 3 anti-adjetivos)

| ✅ | ❌ |
|---|---|
| **Tátil** (toca como objeto, não como tela) | **Limpo / cristal** (clinical) |
| **Curto** (nada arrasta — 90% dos assets < 2s) | **Cinematic / épico** (corporate) |
| **Errado-mas-certo** (tape hiss, off-grid, breathing) | **Quantized / perfect** (videogame) |

## 7 — DON'Ts (regras de exclusão automática)

- ❌ Whoosh "swoosh-up + ding" estilo iPhone/Slack
- ❌ Coin/8-bit/chiptune (mesmo "retro" stylized)
- ❌ Synth pad pra ambient (use field recording + processamento)
- ❌ Voz robótica TTS-default (tem que soar humana, SP sotaque, levemente quebrada)
- ❌ Reverb plate longo (max 1.2s decay; preferir convolution de "garagem", "underpass")
- ❌ Stereo perfeito centrado (sempre LCR ou pan-móvel — cidade não fica no centro)
- ❌ Volume nivelado entre todos sons (UI > ambient sempre; voice > UI sempre)

## 8 — Spatialization rules

- **Mono fontes:** UI SFX (tap, lock-on, equip, error). Click sai do centro.
- **Stereo wide:** ambient beds. Pings em `city-signal` panneados (Downtown=L70, North=R70, South=L40, East=R40, West=C).
- **Voice:** mono center + curto delay 12ms pra dar "cabeça" sem stereo.
- **Music motifs:** stereo mid-wide; sub mono abaixo de 80Hz.

## 9 — Format & delivery

| Tipo | Container | Sample rate | Bitrate | Channels |
|---|---|---|---|---|
| UI SFX | mp3 | 44.1 kHz | 128 kbps CBR | mono |
| Ambient | mp3 | 44.1 kHz | 192 kbps CBR | stereo |
| Music | mp3 | 44.1 kHz | 192 kbps CBR | stereo |
| Voice | mp3 | 44.1 kHz | 128 kbps CBR | mono |

**Loop-ready:** ambient e music motifs precisam ter zero-crossing alinhado no start/end (fade-in/out 50ms cross-blend dentro do Howler `loop:true`).

**Naming:** kebab-case, prefix por dominio (`ui-tap.mp3`, `amb-boot-cold.mp3`, `mus-crew-downtown-rush.mp3`, `voice-saved-cidade-pronta.mp3`). Pasta separa, prefix reforça grep.

## 10 — Sonic moodboard por screen (cheat sheet)

| Screen | Mood em 3 palavras | Família dominante |
|---|---|---|
| ConsoleBoot | frio, sub, ritualístico | Wash + Pulse |
| TitleScreen | esperando, pulso, presença | Pulse |
| CitySignalEntry | aberto, coletivo, ping-respondendo | Wash + Pulse |
| MainMenu (QG) | parado, sticker, ronronar | Wash |
| GuidedOnboarding | atento, mentor, paced | Voice + Wash |
| CustomizeScreen | tátil, vestiário, snap | Snap + Wash |
| RunnerSavedTeaser | carimbo, abertura, fôlego | Snap + Wash (rising) |

## 11 — Hand-off

Os próximos 4 briefs (01 → 04) DEVEM:
1. Citar a família correspondente (Snap/Pulse/Wash) pra cada asset
2. Respeitar LUFS targets
3. Usar referências dessas 3+1 tracks (não inventar novas)
4. Naming convention da §9
5. Quebrar regra só se justificado por escrito no próprio brief

— *Sonic Identity Architect, signing off. A cidade já está zumbindo.*
