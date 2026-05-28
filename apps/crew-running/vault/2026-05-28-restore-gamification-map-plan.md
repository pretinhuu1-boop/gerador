# Restore Gamification Map Plan - 2026-05-28

## Conclusao da investigacao

O mapa de gamificacao nao foi perdido em um commit publicado. Ele ainda existe em `HEAD` (`c997fe6`) e tambem em `main` / `origin/main` (`8fbe848`). A perda aconteceu no WIP local nao commitado, onde o fluxo do launch foi refeito para embutir o creator dentro do `MainMenu` e o painel `INICIO` virou `GUARDA ROUPA`.

Versoes relevantes:

| Commit | Papel |
|---|---|
| `a7163ef` | Introduziu `MapStage`, `HudOverlay`, `LayerRail`, `ZoneLayer`, `SpotLayer`, `MissionLayer`, `data/gamification.ts` e ligou `ABRIR MAPA` no menu. |
| `752e184` / `8e691ba` | Corrigiram review de mapa: a11y, persistencia de camadas, math/storage, reduced motion e hardening inicial. |
| `ef26e98` | Transformou o stub em GPS real: `RunHud`, `RunSummary`, `TrailLayer`, `runTracker`, persistencia de run ativa, XP real, streak e ink. |
| `45f2a01` | Extraiu `useRunController`, separou storage e manteve `MapStage` focado em render. |
| `498c7cb` | Adicionou mapa social: `FriendPings` e `CrewRadioOverlay`. |
| `bf800f4` | Adicionou plano e cobertura de testes para gamificacao 2D. |
| `8fbe848` | Ultimo estado consolidado em `main`, com QA gaps resolvidos. |
| WIP atual | Removeu fluxo separado `runnerCreator` / `runnerSaved`, injeta `runnerCreatorPanel` dentro do menu, muda `INICIO` para guarda-roupa e passa `onOpenMap` sempre. E aqui que a experiencia "mapa como produto principal" ficou descaracterizada. |

## O que tinhamos que deve voltar

- Mapa como superficie principal de jogo, nao como link secundario escondido.
- `MapStage` com HUD de XP/level/streak, canvas SVG, zonas, spots, missoes e camadas persistidas.
- Zoom L1 cidade -> L2 zona -> L3 spot, com back navigation.
- Territorio por `inkPerZone`, ownership visual e pulso live por crew.
- GPS real: Start, Pause, Resume, Stop, Wake Lock, trail ao vivo, filtro de accuracy, persistencia de corrida ativa e modal de retomar.
- Summary pos-corrida com XP breakdown, streak, freeze, spots tocados e salvar/descartar.
- Social map: friends no mapa e radio da crew.
- Test coverage de `components/map/*`, `data/gamification`, `spLiveMap`, `runTracker`, storage e fluxo E2E.

## O que manter do que existe hoje

- Creator novo em abas / subtabs, mas como modulo de identidade/guarda-roupa, nao como home do produto.
- `selectedCrewSlug` vindo de `CrewLaunchExperience`.
- Contrato do creator:
  - nao reintroduzir `StylePicker`, `data/styles.ts`, `public/styles/*` ou slot `hair`;
  - slots validos continuam `top`, `bottom`, `shoes`, `accessory`;
  - runner types continuam `sprint`, `long-run`, `night-run`, `crew-pace`, `urban-trail`;
  - manter `TESTAR LOCAL`;
  - rodar `npm run validate` antes de fechar.
- Paineis novos de `VOCE`, amigos, feed de identidade e preview de crews, mas subordinados ao jogo/mapa.

## Plano de reimplementacao

### Fase 0 - Congelar baseline

1. Criar um branch ou checkpoint antes de alterar o WIP atual.
2. Registrar `git diff --name-status` atual para nao perder trabalho paralelo.
3. Usar `8fbe848` como baseline funcional do mapa e WIP atual como baseline do creator/tabs.

### Fase 1 - Restaurar navegacao produto-first

1. Em `CrewLaunchExperience`, reintroduzir os estados conceituais:
   - `mainMenu` como QG/menu;
   - `runnerCreator` ou `runnerCreatorPanel` como subfluxo de identidade;
   - `runnerSaved` ou equivalente visual apos salvar;
   - `mapHome` como destino principal.
2. Ajustar regra de entrada:
   - primeira entrada sem guia -> intro/guiado;
   - guia completo ou runner salvo -> `mainMenu` com CTA principal para mapa;
   - depois de salvar runner -> mostrar confirmacao e CTA claro para `mapHome`.
3. Manter `onOpenMap` gated por estado correto, preferencialmente `guideDone` ou `runnerCustomized`, mas nao abrir mapa antes de existir crew selecionada.
4. Corrigir `onBackToMenu` do mapa para voltar ao QG/painel de crew, sem resetar progresso.

### Fase 2 - Reconciliar MainMenu atual com mapa

1. Separar semanticamente:
   - `home` / `crewHome` = QG da crew;
   - `wardrobe` ou `creator` = guarda-roupa/creator;
   - `runner` = aba VOCE;
   - `map` = acao primaria.
2. O botao primario do menu deve ser `ABRIR MAPA` quando o mapa esta liberado; quando nao esta, `COMECAR` / `ABRIR GUIA`.
3. `INICIO` nao deve abrir automaticamente guarda-roupa. O guarda-roupa deve ficar em botao proprio.
4. `Passport` pode continuar mostrando status do runner, mas deve apontar para `ABRIR MAPA` quando `guideDone` estiver true.

### Fase 3 - Preservar o creator novo sem violar contrato

1. Manter `RunnerCreatorTabs` recebendo `crew={getCrewBySlug(selectedCrewSlug)}`.
2. Manter draft/persistencia de tabs se ja estiver no WIP, mas validar shape no storage.
3. O creator pode ser aberto por:
   - `GUARDA ROUPA`;
   - `AJUSTAR RUNNER`;
   - fluxo guiado apos onboarding.
4. Depois de salvar, marcar `runnerCustomized`, limpar draft se aplicavel, atualizar `savedCharacter`, e conduzir para confirmacao -> mapa.

### Fase 4 - Garantir MapStage completo

1. Manter a versao atual de `MapStage` com:
   - base layer/skeleton routes;
   - `ZoneLayer`, `SpotLayer`, `MissionLayer`;
   - `HudOverlay`, `LayerRail`;
   - `FriendPings`, `CrewRadioOverlay`;
   - `RunHud`, `TrailLayer`, `RunSummary`.
2. Checar se CSS atual ainda exibe:
   - `.map-stage`, `.map-stage-canvas`, `.map-stage-svg`;
   - `.map-hud-overlay`, `.map-layer-rail`, `.map-stage-actions`;
   - `.run-hud`, `.run-summary-*`, `.trail-*`;
   - estilos de base map adicionados no WIP (`map-base-layer`, `map-base-route`, etc.).
3. Se houver conflito visual com o novo menu/creator, corrigir no CSS sem mudar o dominio do mapa.

### Fase 5 - Restaurar testes e QA

Automatizado:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run check:creator-contract
npm run smoke:creator
npm run test
npx tsc --noEmit
npm run build
npm run validate
```

Focado em mapa:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run test -- components/map data/gamification data/spLiveMap services/runTracker services/launchStorage
```

Manual:

1. Limpar localStorage e validar intro -> city signal -> QG.
2. Abrir mapa pelo CTA principal.
3. Validar HUD, SVG, zonas, spots, missoes, camadas, radio e friends.
4. Simular geolocation no browser: start -> pause -> resume -> stop -> summary -> save.
5. Recarregar no meio de uma run e validar modal de retomada.
6. Testar mobile 375px/390px e depois iPhone real via LAN.

## Criterio de pronto

- O app volta a comunicar o mapa como core loop de jogo.
- Creator continua disponivel, mas nao substitui a home de gamificacao.
- Fluxo completo: crew escolhida -> creator/identidade -> mapa -> corrida GPS -> XP/streak/ink persistidos.
- Nenhum item do contrato do creator regrediu.
- `npm run validate` passa em `apps/crew-running`.
