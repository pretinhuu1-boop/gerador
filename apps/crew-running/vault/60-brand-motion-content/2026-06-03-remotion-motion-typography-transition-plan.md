# Plano de motion, camera, transicoes e tipografia - review v2

Data: 2026-06-03
Escopo: `apps/crew-running-video`
Composicao: `EstamosChegando`
Status: plano para implementar junto com o beat map de audio.

## Leitura do problema

O draft atual tem boa direcao visual nos stills, mas ainda parece mais uma sequencia de posters do que um trailer. O motivo tecnico esta claro no codigo:

- Camera: cada cena usa apenas `scale/x/y` interpolado de forma continua do inicio ao fim.
- Transicao: troca de imagem + flash claro; nao existe uma linguagem diferente por corte.
- Tipografia: todas as cenas usam praticamente a mesma entrada de backing plate, kicker, rule e headline.
- Textura: a textura cobre tudo, mas nao reage ao beat nem ajuda a cortar as cenas.

O v2 precisa deixar o video com mais "mao de diretor": corte com intencao, camera com pulso, texto como objeto grafico e transicao como impacto.

## Principios da motion pass

1. Motion deve nascer do beat map.
   - Entradas principais em downbeats.
   - Micro shakes e slabs em hits curtos.
   - Final com menos movimento, mais peso.

2. Camera deve ter assinatura por cena.
   - Nada de movimento linear unico por 4 ou 5 segundos.
   - Cada cena precisa de entrada, hold e acento.
   - Usar 2 a 4 frames de shake apenas nos impactos, sem handheld aleatorio.

3. Transicao deve ser material, nao digital limpa.
   - Slab de tinta.
   - Wipe de papel rasgado.
   - Smash cut com shadow frame.
   - Stamp/pressao no mapa.
   - Blackout final sujo.

4. Tipografia deve virar item de jogo/trailer.
   - Headline nao entra igual em todas as cenas.
   - Usar mask reveal, stamp pop, line stagger e hold.
   - Evitar typewriter; nosso tom e poster/game inventory, nao terminal.
   - Manter Bowlby como headline principal, Anton como comando.

## Implementacao proposta

### 1. Criar um sistema de motion presets

Novo arquivo:

```text
apps/crew-running-video/src/data/motionLanguage.ts
```

Conteudo:

- `cameraPreset` por cena;
- `transitionPreset` por corte;
- `typePreset` por cena;
- `impactFrames` sincronizados com o beat map.

Exemplo conceitual:

```ts
export const motionLanguage = {
  coldBoot: {
    camera: 'coldPushScan',
    type: 'chalkSlab',
    transitionOut: 'lockOnSlab',
  },
  streetMovement: {
    camera: 'impactDiagonal',
    type: 'stencilPunch',
    transitionOut: 'streetMatchCut',
  },
};
```

### 2. Refatorar camera em `StoryboardScene.tsx`

Hoje:

- `scale`, `x` e `y` sao calculados por um tween simples entre inicio e fim.

Proposto:

- `cameraRig(scene, frame)` retorna:
  - `scale`;
  - `x`;
  - `y`;
  - `rotate`;
  - `grainJitter`;
  - `shadowPunch`.

Presets:

| Preset | Uso | Tratamento |
| --- | --- | --- |
| `coldPushScan` | coldBoot | push lento + pequeno deslocamento vertical como scan de boot |
| `ticketSettle` | signalOpen | slide curto de mesa + settle no beat |
| `posterDrift` | crewRitual | drift lento com leve parallax de textura |
| `impactDiagonal` | streetMovement | entrada diagonal, jolt de 3 frames no impacto |
| `lateralTrack` | crewFormation | pan lateral mais decidido, como tracking de corrida |
| `mapPullStamp` | territoryMarked | pull top-down + pressao no frame do stamp |
| `finalBreath` | cityReady | pullback quase parado, respiracao curta no lockup |

### 3. Criar overlays de transicao

Novo componente:

```text
apps/crew-running-video/src/scenes/TransitionOverlay.tsx
```

Sem `@remotion/transitions` no primeiro passe, porque a composicao atual usa timeline absoluta de 900 frames. Overlays por frame global mantem duracao fixa e evitam recalcular sequencias.

Transicoes:

| Corte | Tempo | Tratamento |
| --- | ---: | --- |
| coldBoot -> signalOpen | 4.0s | `lockOnSlab`: faixa preta/acento atravessa tela + flash curto |
| signalOpen -> crewRitual | 8.0s | `paperTear`: wipe irregular escuro, como cartaz rasgado |
| crewRitual -> streetMovement | 13.0s | `streetSmash`: 2 frames de preto + slab laranja |
| streetMovement -> crewFormation | 17.0s | `matchTrack`: smear lateral, sem glow |
| crewFormation -> territoryMarked | 22.0s | `stampPress`: sombra dura + frame de impacto |
| territoryMarked -> cityReady | 26.0s | `dirtyBlackout`: tela quase preta, title emerge |

### 4. Recoreografar tipografia

Manter:

- Bowlby One para headline.
- Anton para kicker/comando.
- JetBrains Mono so para micro-sistema se necessario.

Alterar:

- Cada cena escolhe `typePreset`, nao um unico `CopyBlock` universal.
- O backing plate deve variar: slab, ticket, shadow band, stamp, final lockup.
- Headline entra em 2 pancadas maximas, com hold mais longo.
- Textura deve afetar tambem o texto para parecer impresso.

Presets:

| Preset | Uso | Tratamento |
| --- | --- | --- |
| `chalkSlab` | VEM O SINAL | texto desliza como tinta seca no asfalto |
| `ticketPunch` | QUEM RESPONDE? | pergunta entra em duas batidas, com rule curta |
| `ritualPoster` | ENTRA NO RITUAL | backing plate como poster colado |
| `stencilPunch` | VIRA PRESENCA | entrada seca, quase carimbo/stencil |
| `inventoryLock` | IDENTIDADE SALVA | lock de item equipado, acento teal minimo |
| `mapStamp` | TERRITORIO ACESO | headline reage ao stamp visual |
| `brandLockup` | THE CREW RUNNING | menos movimento, mais respiro e peso |

### 5. Ajustar textura como camada ativa

Adicionar:

- jitter de 1px a 2px em frames de impacto;
- scratch streaks nos cortes;
- edge darkness no final;
- slabs de tinta por cima da imagem, nao so atras do texto.

Evitar:

- blur/glow neon;
- camera shake constante;
- excesso de elementos concorrendo com a leitura;
- transicoes longas que deixem o video lento.

## Sequencia de execucao recomendada

1. Implementar `beatMap.ts`.
2. Refatorar `AudioTracks.tsx` para callback de volume.
3. Criar `motionLanguage.ts`.
4. Criar `TransitionOverlay.tsx`.
5. Refatorar `StoryboardScene.tsx`:
   - `cameraRig`;
   - `CopyBlock` com presets;
   - textura reativa;
   - stamp mais sincronizado.
6. Rodar stills QA.
7. Renderizar `out/estamos-chegando-review-v2.mp4`.

## QA visual da motion pass

Ver frames/stretches:

- 0-4s: o boot precisa criar expectativa, nao ficar parado.
- 3.8-4.2s: transicao para sinal deve bater como chamada.
- 8-13s: crew ritual precisa ter mais presenca, menos poster estatico.
- 12.8-13.2s: corte para rua deve ser o maior impacto fisico.
- 17-22s: formacao deve parecer tracking, nao pan de foto.
- 21.8-22.4s: stamp/mapa deve ser o segundo grande impacto.
- 26-30s: final deve reduzir movimento e deixar a marca respirar.

## Criterios de aprovacao

- O video nao parece slideshow.
- Cada corte tem uma sensacao propria.
- A camera reforca a cena sem parecer efeito gratuito.
- A tipografia parece parte do mundo visual, nao legenda sobreposta.
- O final fica mais memoravel que as cenas anteriores.
- O render v2 passa sem warnings relevantes e mantem 30s.

## Decisao

Recomendacao: implementar a motion pass junto com o beat map, mas em ordem conservadora:

1. Primeiro audio callback + beat map.
2. Depois camera rig + transicoes.
3. Por ultimo tipografia por preset.

Assim conseguimos comparar o ganho por camada e evitar quebrar a legibilidade.
