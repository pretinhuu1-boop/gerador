# Plano de audio, timing e beat map - video "Estamos Chegando"

Data: 2026-06-03
Escopo: `apps/crew-running-video`
Status: plano para review v2, sem fechar master final.

## Objetivo

Transformar o draft atual em um trailer com pulso claro: musica, cortes, textos, hits de UI e camera precisam obedecer o mesmo mapa ritmico. O video continua com 30s, estetica gritty/urbana e foco em chegada da crew, sem virar propaganda fitness generica.

## Diagnostico do draft atual

- A composicao tem 900 frames a 30fps, aproximadamente 30s.
- A timeline visual ja esta organizada em 7 blocos: 0-4s, 4-8s, 8-13s, 13-17s, 17-22s, 22-26s, 26-30s.
- O audio atual usa 3 camas ambientais em loop e 5 efeitos curtos de UI.
- O Remotion avisou que volumes dinamicos estao sendo passados como numero por frame. Devemos trocar para `volume={(f) => ...}`.
- Falta uma fonte unica de verdade para ritmo. Hoje os hits existem, mas a cena, o texto e o som nao estao todos travados em um beat map compartilhado.

## Direcao sonora

Base proposta: 120 BPM com sensacao half-time.

Motivo:
- 30s em 120 BPM = 60 beats.
- Cortes de 4s = 8 beats, o que encaixa bem em blocos de 2 compassos.
- O half-time deixa o video pesado e urbano, sem parecer video de academia acelerado.

Camadas:
- Bed 1: frio, baixo, ruido de boot e textura de rua.
- Bed 2: cidade/sinal, entra quando a rua chama.
- Bed 3: sala/base/HQ, entra no trecho de identidade e territorio.
- Hits: lock, snap, slab, stamp, tap, sempre amarrados a entradas de texto, cortes ou mudancas de camera.
- Opcional v2.5: adicionar loop musical dedicado de percussao suja em 120 BPM, caso os ambientes atuais continuem sem corpo.

## Beat map proposto

| Tempo | Frame | Beat | Cena | Intencao sonora | Acao visual |
| --- | ---: | ---: | --- | --- | --- |
| 0.0s | 0 | 1 | coldBoot | entrada seca, boot baixo | imagem acorda sem pressa |
| 1.0s | 30 | 3 | coldBoot | sobe textura fria | kicker entra |
| 2.0s | 60 | 5 | coldBoot | primeiro pulso grave discreto | primeira linha bate |
| 3.0s | 90 | 7 | coldBoot | pre-hit curto | segunda linha prepara corte |
| 4.0s | 120 | 9 | signalOpen | hit `ui-lock-on` + cidade entra | corte seco para sinal |
| 6.0s | 180 | 13 | signalOpen | pulso de rua mais presente | texto abre em duas pancadas |
| 8.0s | 240 | 17 | crewRitual | beat estabiliza | crew/ritual assume |
| 10.0s | 300 | 21 | crewRitual | micro hit de movimento | camera empurra para presenca |
| 12.5s | 375 | 26 | crewRitual | pre-drop/duck | prepara corrida |
| 13.0s | 390 | 27 | streetMovement | hit `ui-equip-snap` + drop | corte fisico para rua |
| 15.0s | 450 | 31 | streetMovement | cama de cidade segura | impacto/asfalto/corpo |
| 17.0s | 510 | 35 | crewFormation | hit de entrada novo ou `ui-nav-slab` | look/identidade entra no downbeat |
| 18.5s | 555 | 38 | crewFormation | segundo hit menor | identidade trava |
| 20.0s | 600 | 41 | crewFormation | HQ room entra mais audivel | crew formada |
| 22.0s | 660 | 45 | territoryMarked | hit `ui-stamp-save` + duck forte | territorio marcado |
| 24.0s | 720 | 49 | territoryMarked | pulso reduzido, suspense | mapa responde |
| 26.0s | 780 | 53 | cityReady | hit `ui-tap-alt` + queda de mix | final title entra |
| 28.0s | 840 | 57 | cityReady | retirada progressiva da cama | "THE CREW" sustenta |
| 29.5s | 885 | 60 | cityReady | tail/respiracao/impacto final | fim limpo, sem excesso |

## Plano de implementacao

1. Criar `src/data/beatMap.ts`.
   - Centralizar `BPM`, `fps`, marcadores por segundo/frame e nomes de hits.
   - Expor helpers como `sec()`, `beat()`, `bar()` e lista de eventos.

2. Refatorar `AudioTracks.tsx`.
   - Trocar volumes dinamicos para callback de volume do Remotion.
   - Separar mixer em funcoes: `ambientVolume`, `duckAroundHit`, `sceneGain`.
   - Corrigir o hit de 18.6s para uma logica mais musical: entrada forte em 17.0s e acento secundario em 18.5s.
   - Manter volumes conservadores para evitar clipping.

3. Sincronizar timeline visual com beat map.
   - Manter os cortes principais atuais, porque ja encaixam bem no grid.
   - Ajustar micro timings de texto/stagger dentro de `StoryboardScene.tsx` para cair nos beats do mapa.
   - Evitar animacao demais no final; o fechamento precisa parecer anuncio de chegada, nao tela de app.

4. Revisar mix e musica.
   - Primeiro passe usando apenas os assets atuais.
   - Se o video continuar sem pulso musical, criar/importar um loop dedicado de 120 BPM: percussao seca, baixo sujo, textura de asfalto, sem melodia chamativa.
   - Esse loop deve entrar de verdade entre 8s e 26s, com queda no final.

5. QA tecnico.
   - `npm run sync-assets`
   - `npm run typecheck`
   - `npm run stills:qa`
   - render review v2: `npx remotion render src/index.ts EstamosChegando out/estamos-chegando-review-v2.mp4 --codec=h264 --pixel-format=yuv420p`
   - Confirmar que o warning de volume dinamico sumiu.
   - Conferir duracao e tamanho com `ffprobe`.

## Criterios de aprovacao

- O corte parece guiado por musica, nao por slideshow.
- Entradas de texto batem em downbeats ou acentos claros.
- Hits de UI reforcam a narrativa, sem virar barulho de menu.
- O final `EM BREVE / THE CREW / RUNNING` respira e fica memoravel.
- Nenhuma cena perde a identidade visual gritty ja definida.
- Render review v2 sem warnings relevantes de audio.

## Decisao pendente

Para a proxima onda, escolher entre:

1. MVP com audio atual: mais rapido, menor risco, melhora timing e mix.
2. MVP + loop musical novo de 120 BPM: mais forte como trailer, mas exige criar ou selecionar asset sonoro com licenca/uso claro.

Recomendacao: fazer primeiro o MVP com audio atual e renderizar review v2. Se ainda faltar corpo, adicionar o loop musical como v2.5.
