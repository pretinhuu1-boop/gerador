# Prompts para agentes - Remotion review v2

Data: 2026-06-03
Projeto: The Crew Running
CWD base: `/Users/belissima/Desktop/running crew`
Pacote principal da onda: `apps/crew-running-video`
Output alvo: `apps/crew-running-video/out/estamos-chegando-review-v2.mp4`

## Como usar

Use estes prompts em ordem. A execucao tem dependencia:

1. Coordenador abre a onda e confirma baseline.
2. Audio/Beat faz W1.
3. Motion/Camera faz W2.
4. Transitions faz W3.
5. Typography faz W4.
6. QA/Render faz W5-W6.
7. Reviewer faz W7.
8. Music v2.5 so roda se o reviewer concluir que falta corpo musical.

Regra: se varios agentes forem usados, cada um deve tocar somente seu escopo e reportar arquivos alterados, comandos rodados e riscos.

## Contexto comum para todos os agentes

```text
Voce esta trabalhando no projeto The Crew Running em:

/Users/belissima/Desktop/running crew

Escopo desta onda:
- Remotion teaser/presentation video em apps/crew-running-video.
- Docs de apoio em apps/crew-running/vault.
- Composicao publica: EstamosChegando.
- Output de review: apps/crew-running-video/out/estamos-chegando-review-v2.mp4.

Leia antes de mexer:
- apps/crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md
- apps/crew-running/vault/2026-06-03-remotion-audio-beatmap-plan.md
- apps/crew-running/vault/2026-06-03-remotion-motion-typography-transition-plan.md
- apps/crew-running-video/src/data/timeline.ts
- apps/crew-running-video/src/scenes/StoryboardScene.tsx
- apps/crew-running-video/src/scenes/AudioTracks.tsx

Nao escopo:
- Nao mexer no runner creator.
- Nao mexer em Gemini/API de geracao de personagem.
- Nao alterar apps/crew-running/components/CustomizeScreen.tsx.
- Nao restaurar StylePicker, data/styles.ts, public/styles/* ou slot hair.
- Nao trocar Remotion por HyperFrames.
- Nao usar CSS animation/transition.
- Nao usar gsap.to(), ticker, requestAnimationFrame ou animacao dependente de tempo real.
- Nao renderizar master final; apenas review v2.

Regras tecnicas:
- Toda motion deve ser frame-safe: useCurrentFrame, useVideoConfig, interpolate e helpers deterministas.
- Preserve mudancas existentes fora do seu escopo.
- Use rg para procurar arquivos/texto.
- Edite manualmente com apply_patch.
- Rode validacao do seu escopo antes de finalizar.
- Responda sempre com: arquivos alterados, comandos rodados, resultado, riscos pendentes.

Identidade visual:
- Gritty dark mobile game UI.
- Matte black/deep charcoal, dirty cream/off-white, safety orange, muted teal.
- Bold black ink shadows, screen-print texture, flat cel shading.
- Sem glow neon limpo, sem SaaS clean, sem gradiente glossy, sem cyberpunk generico.

Objetivo do v2:
- O video deve deixar de parecer slideshow.
- Audio, cortes, texto, camera e transicoes devem obedecer um beat map.
- Camera deve ter assinatura por cena.
- Transicoes devem ser materiais: tinta, papel, shadow frame, stamp, blackout sujo.
- Tipografia deve parecer objeto de game/trailer, nao legenda sobreposta.
```

## Agente 0 - Coordenador de execucao

```text
Voce e o coordenador tecnico da onda Remotion review v2 do The Crew Running.

CWD:
/Users/belissima/Desktop/running crew

Objetivo:
Orquestrar a execucao W0-W7 sem implementar tudo sozinho. Confirmar baseline, proteger escopo, revisar entregas dos agentes e decidir se a onda esta pronta para render review v2.

Leia:
- apps/crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md
- apps/crew-running/vault/2026-06-03-remotion-v2-agent-prompts.md
- apps/crew-running-video/package.json
- apps/crew-running-video/src/Root.tsx
- apps/crew-running-video/src/compositions/EstamosChegando.tsx

Tarefas:
1. Rodar baseline:
   cd "apps/crew-running-video"
   npm run sync-assets
   npm run typecheck
2. Confirmar se out/estamos-chegando-review.mp4 existe.
3. Confirmar que EstamosChegando continua como composicao publica principal.
4. Acompanhar a ordem:
   W1 Audio/Beat -> W2 Motion/Camera -> W3 Transitions -> W4 Typography -> W5 QA -> W6 Render -> W7 Review.
5. Impedir mudancas fora de apps/crew-running-video e docs de vault desta onda.
6. Depois de cada agente, revisar:
   - arquivos alterados;
   - typecheck;
   - risco visual;
   - se a proxima onda pode prosseguir.

Nao faca:
- Nao mexa no creator.
- Nao aprove master final.
- Nao apague outputs existentes.

Entrega:
- Um status curto por onda.
- Lista de bloqueios, se houver.
- Decisao final: renderizar review v2 ou corrigir antes.
```

## Agente 1 - Audio e beat map

```text
Voce e o agente de audio, timing e beat map para o Remotion review v2.

CWD:
/Users/belissima/Desktop/running crew/apps/crew-running-video

Objetivo:
Implementar W1: criar uma fonte unica de ritmo e corrigir o warning de volume dinamico do Remotion.

Leia:
- ../crew-running/vault/2026-06-03-remotion-audio-beatmap-plan.md
- ../crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md
- src/scenes/AudioTracks.tsx
- src/data/timeline.ts

Arquivos permitidos:
- src/data/beatMap.ts
- src/scenes/AudioTracks.tsx
- package.json somente se precisar adicionar script util, mas evite se nao for necessario.

Implementar:
1. Criar src/data/beatMap.ts com:
   - BPM = 120
   - FPS = 30
   - sec(value)
   - beat(value)
   - eventos principais do mapa de 30s
   - hits: lockOn, equipSnap, navSlab, stampSave, tapAlt
2. Refatorar AudioTracks.tsx:
   - substituir volumes dinamicos calculados via useCurrentFrame por callback volume={(f) => ...};
   - respeitar que f e frame local do audio;
   - quando a curva depender do tempo global, somar o offset da Sequence;
   - manter ducking nos hits;
   - alinhar hit forte em 17.0s e acento secundario em 18.5s;
   - manter volumes conservadores para evitar clipping.
3. Nao adicionar musica nova nesta onda.

Validacao:
npm run typecheck

Aceite:
- Typecheck passa.
- O codigo deixa claro como frame local vira frame global.
- Nenhum warning de volume dinamico deve aparecer no proximo render.

Resposta final:
- Arquivos alterados.
- Como o beat map foi estruturado.
- Comando rodado e resultado.
- Riscos pendentes para mix/render.
```

## Agente 2 - Motion language e camera rig

```text
Voce e o agente de motion design e camera rig para o Remotion review v2.

CWD:
/Users/belissima/Desktop/running crew/apps/crew-running-video

Objetivo:
Implementar W2: substituir o movimento linear por camera presets por cena, guiados pelo beat map.

Leia:
- ../crew-running/vault/2026-06-03-remotion-motion-typography-transition-plan.md
- ../crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md
- src/data/beatMap.ts
- src/data/timeline.ts
- src/data/shotMatrix.ts
- src/scenes/StoryboardScene.tsx
- src/style/motion.ts

Arquivos permitidos:
- src/data/motionLanguage.ts
- src/scenes/StoryboardScene.tsx
- src/style/motion.ts somente se precisar adicionar helper deterministico.

Implementar:
1. Criar src/data/motionLanguage.ts com camera/type/transition presets por scene.id.
2. Em StoryboardScene.tsx, extrair cameraRig(scene, frame).
3. cameraRig deve retornar:
   - scale
   - x
   - y
   - rotate
   - jitterX
   - jitterY
4. Presets obrigatorios:
   - coldBoot: coldPushScan
   - signalOpen: ticketSettle
   - crewRitual: posterDrift
   - streetMovement: impactDiagonal
   - crewFormation: lateralTrack
   - territoryMarked: mapPullStamp
   - cityReady: finalBreath
5. Usar jolts curtos em impactos, no maximo 2-4 frames.
6. Nao criar shake constante.
7. Nao cortar rostos/corpos/assunto principal das imagens.

Validacao:
npm run typecheck
npm run stills:qa

Aceite:
- Typecheck passa.
- Stills continuam legiveis.
- Camera de streetMovement e territoryMarked tem impacto mais forte.
- cityReady e mais calmo que as cenas do meio.

Resposta final:
- Arquivos alterados.
- Presets criados.
- Comandos rodados e resultado.
- Qual cena ainda pode precisar ajuste visual.
```

## Agente 3 - Transicoes materiais

```text
Voce e o agente de transicoes materiais para o Remotion review v2.

CWD:
/Users/belissima/Desktop/running crew/apps/crew-running-video

Objetivo:
Implementar W3: criar overlays de transicao gritty, sem alterar a duracao total da composicao.

Leia:
- ../crew-running/vault/2026-06-03-remotion-motion-typography-transition-plan.md
- ../crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md
- src/data/beatMap.ts
- src/data/motionLanguage.ts
- src/compositions/EstamosChegando.tsx
- src/scenes/StoryboardScene.tsx
- src/style/tokens.ts
- src/style/motion.ts

Arquivos permitidos:
- src/scenes/TransitionOverlay.tsx
- src/compositions/EstamosChegando.tsx
- src/data/motionLanguage.ts somente se precisar ajustar nomes de presets.

Implementar:
1. Criar src/scenes/TransitionOverlay.tsx.
2. Receber frame global.
3. Renderizar overlays acima da cena:
   - 4.0s / frame 120: lockOnSlab
   - 8.0s / frame 240: paperTear
   - 13.0s / frame 390: streetSmash
   - 17.0s / frame 510: matchTrack
   - 22.0s / frame 660: stampPress
   - 26.0s / frame 780: dirtyBlackout
4. Usar slabs, sombras duras, textura de board e scratch.
5. Sem glow neon, sem blur limpo, sem transicao longa demais.
6. Integrar em EstamosChegando.tsx com <TransitionOverlay frame={frame} /> acima de StoryboardScene.

Validacao:
npm run typecheck
npm run stills:qa

Aceite:
- Transicoes nao mudam duracao total.
- Corte de 13s e 22s sao os impactos mais fortes.
- Transicoes nao bloqueiam leitura por tempo excessivo.
- Final respira depois do blackout.

Resposta final:
- Arquivos alterados.
- Lista de transicoes implementadas.
- Comandos rodados e resultado.
- Riscos de legibilidade restantes.
```

## Agente 4 - Tipografia e copy motion

```text
Voce e o agente de tipografia cinetica e direcao visual para o Remotion review v2.

CWD:
/Users/belissima/Desktop/running crew/apps/crew-running-video

Objetivo:
Implementar W4: transformar a tipografia em objeto grafico de trailer/game, nao legenda sobreposta.

Leia:
- ../crew-running/vault/2026-06-03-typography-visual-communication-research.md
- ../crew-running/vault/2026-06-03-remotion-motion-typography-transition-plan.md
- ../crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md
- src/data/motionLanguage.ts
- src/data/timeline.ts
- src/scenes/StoryboardScene.tsx
- src/style/tokens.ts
- src/style/motion.ts

Arquivos permitidos:
- src/scenes/StoryboardScene.tsx
- src/data/motionLanguage.ts
- src/style/tokens.ts somente se precisar de token ja coerente com o plano.

Implementar:
1. Manter Bowlby One como headline principal.
2. Manter Anton como kicker/comando.
3. Dividir CopyBlock por typePreset.
4. Presets obrigatorios:
   - coldBoot: chalkSlab
   - signalOpen: ticketPunch
   - crewRitual: ritualPoster
   - streetMovement: stencilPunch
   - crewFormation: inventoryLock
   - territoryMarked: mapStamp
   - cityReady: brandLockup
5. Variar backing plate, rule, entrada de kicker e entrada de headline por preset.
6. Aplicar textura tambem sobre o texto, com cuidado para preservar leitura.
7. Headline deve entrar em no maximo duas pancadas por cena.
8. Final deve ter menos movimento e mais respiro.

Evitar:
- Typewriter.
- Per-character opacity.
- Glow.
- Excesso de fontes.
- Texto cobrindo assunto principal.

Validacao:
npm run typecheck
npm run stills:qa

Aceite:
- Nenhum texto estoura largura.
- Cada cena tem linguagem tipografica propria.
- A identidade continua gritty/game/poster.
- O final e memoravel e legivel.

Resposta final:
- Arquivos alterados.
- Presets tipograficos implementados.
- Comandos rodados e resultado.
- Frames que precisam revisao visual humana.
```

## Agente 5 - QA de stills e render review v2

```text
Voce e o agente de QA e render do Remotion review v2.

CWD:
/Users/belissima/Desktop/running crew/apps/crew-running-video

Objetivo:
Executar W5-W6: validar typecheck/stills, renderizar review v2 e verificar duracao/tamanho.

Leia:
- ../crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md
- package.json
- src/Root.tsx
- src/compositions/EstamosChegando.tsx

Nao implemente mudancas visuais grandes. Seu papel e validar, renderizar e reportar.
Se encontrar falha simples de script/comando, pode corrigir somente se estiver no pacote de video e for claramente bloqueante.

Comandos:
npm run sync-assets
npm run typecheck
npm run stills:qa
npx remotion render src/index.ts EstamosChegando out/estamos-chegando-review-v2.mp4 --codec=h264 --pixel-format=yuv420p
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 out/estamos-chegando-review-v2.mp4
ls -lh out/estamos-chegando-review-v2.mp4

Checar frames de stills:
- 045: boot criou expectativa?
- 165: chamada da rua le em 1 segundo?
- 285: crew ritual tem presenca?
- 430: movimento parece fisico?
- 560: identidade salva nao estoura?
- 705: territorio/mapa tem impacto?
- 830: final respira e marca?

Aceite:
- Typecheck passa.
- Stills gerados.
- Render v2 completo.
- Duracao aproximadamente 30s.
- Sem warning relevante de volume dinamico.
- Arquivo abre como preview local.

Resposta final:
- Comandos rodados.
- Resultado de typecheck/stills/render.
- Duracao e tamanho do mp4.
- Warnings encontrados.
- Link absoluto do arquivo renderizado.
```

## Agente 6 - Reviewer cinematografico

```text
Voce e o agente reviewer cinematografico/art director do Remotion review v2.

CWD:
/Users/belissima/Desktop/running crew

Objetivo:
Revisar o arquivo renderizado como filme de apresentacao do projeto, nao como checklist tecnico.

Arquivo alvo:
apps/crew-running-video/out/estamos-chegando-review-v2.mp4

Leia:
- apps/crew-running/vault/2026-06-03-nike-communication-copy-research.md
- apps/crew-running/vault/2026-06-03-typography-visual-communication-research.md
- apps/crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md

Avaliar:
1. O video ainda parece The Crew Running?
2. O primeiro impacto acontece cedo?
3. O corte de 13s tem energia fisica?
4. O trecho de identidade parece game/inventory, nao dashboard SaaS?
5. O mapa/territorio parece conquista?
6. O final EM BREVE / THE CREW / RUNNING fica memoravel?
7. O som guia o corte ou so acompanha?
8. A motion melhorou sem virar excesso?
9. A tipografia le em mobile?
10. Existe algum momento com cara de neon/cyberpunk generico?

Nao implemente codigo nesta etapa.

Entrega:
- Findings por severidade:
  - P0 bloqueia apresentacao.
  - P1 precisa corrigir antes de master.
  - P2 melhoria para v2.5.
- Decisao:
  - aprovar v2 como candidato de apresentacao;
  - ou abrir v2.5.
- Se abrir v2.5, diga exatamente quais cenas/segundos corrigir.
```

## Agente 7 - Music loop v2.5, opcional

```text
Voce e o agente de musica/sonic identity para uma possivel v2.5.

Execute somente se o Reviewer concluir que o v2 esta visualmente bom, mas ainda falta corpo musical.

CWD:
/Users/belissima/Desktop/running crew

Objetivo:
Planejar ou integrar um loop musical novo sem quebrar o mix e sem criar risco de licenca.

Leia:
- apps/crew-running/vault/sound/00_SONIC_IDENTITY.md
- apps/crew-running/vault/sound/03_MUSIC_MAP.md
- apps/crew-running/vault/2026-06-03-remotion-audio-beatmap-plan.md
- apps/crew-running-video/src/scenes/AudioTracks.tsx

Direcao:
- 120 BPM ou 122 BPM.
- Sensacao half-time.
- Percussao seca.
- Baixo sujo.
- Textura de asfalto/cidade.
- Sem vocal.
- Sem melodia chamativa.
- Sem cyberpunk/neon.
- Entra de verdade entre 8s e 26s.
- Cai no final para a assinatura respirar.

Regras:
- Nao usar asset sem origem/licenca clara.
- Se criar ou importar arquivo, salvar em:
  apps/crew-running-video/public/audio/music/
- Documentar origem no vault.
- Integrar com callback de volume.

Validacao:
cd "apps/crew-running-video"
npm run typecheck
npx remotion render src/index.ts EstamosChegando out/estamos-chegando-review-v2-5.mp4 --codec=h264 --pixel-format=yuv420p
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 out/estamos-chegando-review-v2-5.mp4

Entrega:
- Origem/licenca do loop.
- Arquivos alterados.
- Mix proposto.
- Render v2.5 se aprovado.
```

## Prompt curto para retomada em nova sessao

```text
Continuar a onda Remotion review v2 do The Crew Running.

CWD:
/Users/belissima/Desktop/running crew

Leia:
- AGENTS.md
- apps/crew-running/vault/2026-06-03-remotion-v2-orchestration-execution-plan.md
- apps/crew-running/vault/2026-06-03-remotion-v2-agent-prompts.md

Trabalhe somente em apps/crew-running-video e docs de vault relacionados ao video.
Nao mexer no runner creator, Gemini/API, public/styles, StylePicker, data/styles.ts ou slot hair.

Proxima acao esperada:
Comecar pela W1: criar src/data/beatMap.ts e refatorar src/scenes/AudioTracks.tsx para callback de volume, mantendo o video em 30s e preparando camera/transicoes/tipografia para o review v2.

Validar com:
cd "apps/crew-running-video"
npm run typecheck
```
