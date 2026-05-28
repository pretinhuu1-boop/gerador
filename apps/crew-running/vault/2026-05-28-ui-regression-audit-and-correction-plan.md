# UI Regression Audit + Correction Plan — 2026-05-28

Escopo: `apps/crew-running` front-end visual, creator, QG/RUNNER panel e gamificacao/mapa.

Modo desta passagem: auditoria somente leitura do codigo de UI, docs do vault, assets publicos, testes e browser QA. Nao foram feitas alteracoes na UI.

## Validacao Executada

Comandos rodados em `apps/crew-running`:

```bash
npm run validate
npx playwright test tests/e2e/map-flow.spec.ts
```

Resultado:

- `check:creator-contract`: passou.
- `typecheck`: passou.
- `vitest`: 36 arquivos, 304 testes passaram.
- `build`: passou.
- `smoke:creator`: passou.
- `tests/e2e/map-flow.spec.ts`: 3 testes passaram.

Browser QA capturado em:

```text
apps/crew-running/output/playwright/ui-audit-2026-05-28/
```

Screenshots principais:

- `01-fresh-boot.png`
- `02-main-menu-home-saved.png`
- `03-runner-panel.png`
- `04-map-stage-city.png`
- `05-current-creator.png`
- `06-current-creator-mobile.png`
- `07-map-stage-mobile.png`

## Fonte De Verdade Visual

Fontes canonicas atuais:

- `AGENTS.md`
- `vault/CREATOR_CONTRACT.md`
- `scripts/check-creator-contract.mjs`
- `DESIGN.md`
- `GAME_UI_TEMPLATE.md`
- `vault/CREATOR_DESIGN_SYSTEM.md`
- `vault/2026-05-28-qa-test-plan-gamification-2d.md`
- `vault/2026-05-28-gps-tracker-and-polish-design.md`

Tese visual aprovada:

- Street-running game cartridge, nao dashboard fitness.
- QG de missao, ticket colado no asfalto, patch de crew, mapa vivo da cidade.
- 75% asphalt/charcoal, 15% dirty cream, 7% crew accent, 3% status/reward.
- `Bowlby One` para grandes titulos; `Anton` para comandos/nomes; `JetBrains Mono` para leitura de sistema; `Permanent Marker` apenas como tag/stamp.
- Assets de crew devem ser primitivos visuais de primeira classe: badge, banner, leader, marker, mission card, territory pattern, stickers, achievements, locked fog.

Contratos duros do creator:

- `CustomizeScreen` recebe `selectedCrewSlug` de `CrewLaunchExperience`.
- Geracao usa somente `public/crews/{selectedCrewSlug}/` via `CrewRenderContext`.
- Nao usar `public/styles/*` como input de geracao.
- Nao restaurar `StylePicker`, `data/styles.ts`, slot `hair` ou `crew-flow`.
- Slots validos: `top`, `bottom`, `shoes`, `accessory`.
- Runner types canonicos: `sprint`, `long-run`, `night-run`, `crew-pace`, `urban-trail`.
- `TESTAR LOCAL` continua disponivel no modal de estudio.

## Achados Prioritarios

### P0 — Creator publico ainda e fullscreen antigo, nao sub-tabs no QG

Evidencia:

- `App.tsx` ainda lazy-loads `CustomizeScreen`.
- `CrewLaunchExperience.tsx` ainda roteia para `screen === 'runnerCreator'`.
- `MainMenu.tsx` renderiza `RunnerPanel` no painel RUNNER, nao o creator em sub-tabs.
- `CREATOR_DESIGN_SYSTEM.md` pede sub-tabs `FOTO / PERFIL / LOOK / FICHA` dentro do painel RUNNER, mantendo INICIO / CREWS / RUNNER / CONFIG acessiveis.

Impacto:

- O usuario entra em uma tela dead-end.
- A navegacao principal some durante o creator.
- A UI volta a parecer formulario linear, nao character creator integrado ao QG.

Aceite:

- RUNNER panel contem `RunnerCreatorTabs` ou refactor equivalente.
- Nav principal continua acessivel no creator.
- Sub-tabs com roles `tab`/`tabpanel`: `FOTO`, `PERFIL`, `LOOK`, `FICHA`.
- `CustomizeScreen` deixa de ser o caminho publico principal ou vira wrapper de compatibilidade.

### P0 — Formulario do creator esta visualmente quebrado

Evidencia:

- `RunnerProfileForm.tsx` usa classes `runner-tab__form`, `runner-tab__field`, `runner-tab__sex-options`, `runner-tab__measure-grid`.
- `index.css` so define `runner-tab__nav`/`runner-tab__nav-item`; os campos continuam estilizados no CSS antigo como `runner-creator__profile`/`runner-creator__field`.
- Screenshot `06-current-creator-mobile.png`: labels, inputs e opcoes de sexo colidem; altura/peso e personalidade ficam desalinhados.
- Screenshot `05-current-creator.png`: no desktop, labels e inputs tambem aparecem sem o tratamento visual esperado.

Impacto:

- A tela parece ter perdido CSS.
- Campos essenciais ficam pouco legiveis.
- Mobile fica abaixo do nivel minimo de polimento.

Aceite:

- Campos usam uma familia unica de classes coerente com o novo design.
- Labels, inputs, botoes de sexo, altura/peso e textarea nao se sobrepoem em 390x844 e 360x800.
- Touch targets >= 44px.
- Sem horizontal overflow.

### P0 — Creator ainda renderiza chrome explicitamente marcado para remocao

Evidencia:

- `CustomizeScreen.tsx` ainda renderiza `runner-creator__masthead`, `runner-creator__status-strip`, `runner-creator__back` e `CrewLockPanel`.
- `PhotoUpload`, `RunnerTypePicker` e `WardrobePicker` ainda exibem numeracao `01 /`, `04 /`, `05 /`; `CrewLockPanel` exibe `03 /`.
- Browser report confirmou DOM com masthead/status-strip/crew-lock/back e sem `runner-tab__nav`.

Impacto:

- Crew aparece repetida.
- A tela volta para checklist numerado.
- O topo compete com o QG e quebra a direcao de `CREATOR_DESIGN_SYSTEM.md`.

Aceite:

- Crew aparece exatamente uma vez no creator.
- Remover do DOM publico: `runner-creator__masthead`, `runner-creator__status-strip`, `runner-creator__crew-lock`, `runner-creator__back`, `runner-creator__body-reference`.
- Numeros de checklist saem do fluxo principal.

### P0 — Mapa/gamificacao mobile tem CTA coberto pelo Radio

Evidencia:

- Screenshot `07-map-stage-mobile.png`: `CrewRadioOverlay` cobre visualmente a area do CTA; o texto `INICIAR CORRIDA` aparece escondido/atravessado por `RADIO DA CREW`.
- `CrewRadioOverlay` fica `position: absolute; right: 12px; bottom: 12px; z-index: 20`.
- `MapStage` renderiza `CrewRadioOverlay` antes do footer de acoes, mas ambos disputam o mesmo canto inferior.

Impacto:

- O modulo de gamificacao parece quebrado em mobile.
- O CTA mais importante perde legibilidade e area de toque.

Aceite:

- No mobile, `INICIAR CORRIDA` e `QG` ficam sempre visiveis e tocaveis.
- Radio deve virar dock acima do footer, item colapsado em rail lateral, ou integrar no proprio footer sem sobreposicao.
- Testar 390x844 e 360x800.

### P1 — Mapa/gamificacao nao puxa a paleta principal do vault

Evidencia:

- `index.css` usa `#2a2826` e `#d9cfb8` no `map-stage`, HUD, rail, botoes e summary.
- `DESIGN.md` define asphalt/charcoal/bone como materiais centrais: `#000`, `#0a0a0a`, `#131313`, `#1a1a1a`, `#f0ebe0`, `#c8c2b5`.
- Screenshot `04-map-stage-city.png` e `07-map-stage-mobile.png` leem mais marrom/bege do que asphalt/charcoal.

Impacto:

- Gamificacao parece outro app.
- Mapa perde continuidade com QG/title/creator.

Aceite:

- MapStage usa tokens `--black`, `--jet`, `--char`, `--char-2`, `--bone`, `--bone-soft`, `--crew-accent`.
- Reward/status amarelo fica pontual, nao material dominante.
- Mapa continua full-bleed, mas com textura/territorio mais proxima de `DESIGN.md`.

### P1 — Assets existem, mas alguns nao entram na UI

Evidencia:

- `public/wardrobe/accessory/*.png` existe.
- `data/wardrobe.ts` nao define `iconUrl` nos itens `accessory`.
- `WardrobePicker.tsx` cai para placeholder textual quando `item.iconUrl` falta.
- `locked_fog.png`, `achievement_2.png`, `achievement_3.png`, `badge_32.png`, `badge_64.png` existem para crews, mas nao entram como linguagem visual ativa.

Impacto:

- O usuario percebe asset quebrado/sumido, mesmo sem 404.
- Acessorios parecem inferiores aos outros slots.
- Sistema de recompensa/locked state nao comunica fantasia de jogo.

Aceite:

- Todos os 4 accessories exibem icones.
- `locked_fog` usado em estado bloqueado/indisponivel.
- Achievements aparecem como teaser/locked badges no QG ou mapa, sem virar leaderboard.

### P1 — Gamificacao tem catalogo, mas progresso visual parcial

Evidencia:

- `MissionLayer` desenha missao, mas missoes nao sao progressao real.
- `rewardXp` existe nos dados, mas `useRunController` calcula XP por distancia/territorio/spots/loop.
- Badges existem em modelo/dados, mas `RunSummary` nao renderiza conquistas desbloqueadas.
- `Night Drift` nao tem coordenada; no zoom `spot`, o filtro inclui todas as missoes e a layer pula sem coordenada.

Impacto:

- O mapa parece ter sistema de jogo, mas parte do feedback nao fecha.
- Jogador nao entende o que ganhou alem de XP.

Aceite:

- Definir v1: missoes sao apenas marcadores ou afetam XP?
- Se afetam: integrar missao no `RunSummary` e no progress store.
- Se nao afetam: copy/visual precisa dizer "missoes em breve" ou desabilitar chip quando sem coordenada valida.
- Badges desbloqueadas aparecem no resumo ou como teaser locked.

### P1 — Estado de mapa liberado pode divergir de runner salvo real

Evidencia:

- Parent libera `onOpenMap` por `progress.runnerCustomized`.
- `MainMenu` considera runner salvo apenas se `savedCharacter?.imageDataUrl`.
- Se `crewRunnerCustomized=true` e `crew.saved_character` sumiu/corrompeu, `ABRIR MAPA` pode aparecer sem runner real.

Impacto:

- Fluxo entra no mapa sem identidade confiavel.
- QG e mapa podem discordar sobre estado do usuario.

Aceite:

- `onOpenMap` exige `runnerCustomized && getSavedCharacter()?.imageDataUrl`.
- Se flag esta true mas character ausente, mostrar estado de recuperacao: `RUNNER PENDENTE` + `MONTAR RUNNER`.

### P2 — Docs canonicos ainda conflitam

Conflitos:

- `DESIGN.md` diz GPS/tracking fora de escopo, mas `2026-05-28-gps-tracker-and-polish-design.md` torna GPS real ativo.
- `GAME_UI_TEMPLATE.md` ainda usa `RUNNER READY`, enquanto contrato/check atual canoniza `RUNNER SALVO` no QG.
- Docs legados ainda mencionam `Crew Flow`, `MVP`, `hair`, `public/styles`.
- Contrato permite foto ou brief escrito, mas UI atual exige foto; docs de no-photo tambem divergem.

Aceite:

- Criar uma nota curta de precedencia: quais docs foram superseded e por quem.
- Atualizar ou marcar como legado docs com `Crew Flow`, `RUNNER READY`, `hair`, `public/styles`, `MVP`.
- Decidir se "sem foto" e escopo ativo. Se sim, implementar modo brief fisico; se nao, atualizar contrato/check.

## Plano De Correcao

### Fase 0 — Congelar fonte de verdade e checkpoints

Objetivo: impedir que a correcao reabra contratos antigos.

Passos:

1. Criar/atualizar nota de precedencia no vault.
2. Marcar docs legados como historicos quando contiverem `Crew Flow`, `hair`, `public/styles`, `MVP`, `RUNNER READY`.
3. Manter `CREATOR_CONTRACT.md` + `check-creator-contract.mjs` como gate.
4. Antes e depois de cada fase: `npm run validate`.

### Fase 1 — Recuperar CSS/estrutura do creator

Objetivo: fazer a UI voltar a ser utilizavel no estado atual antes de migrar a arquitetura.

Passos:

1. Corrigir mismatch `RunnerProfileForm` vs CSS.
2. Garantir mobile 390x844 e 360x800 sem sobreposicao.
3. Adicionar `iconUrl` dos accessories em `data/wardrobe.ts`.
4. Validar screenshots `05-current-creator.png` e `06-current-creator-mobile.png`.

Arquivos provaveis:

- `components/RunnerProfileForm.tsx`
- `components/CustomizeScreen.tsx`
- `components/WardrobePicker.tsx`
- `data/wardrobe.ts`
- `index.css`

### Fase 2 — Migrar creator para sub-tabs dentro do RUNNER panel

Objetivo: alinhar arquitetura ao `CREATOR_DESIGN_SYSTEM.md`.

Passos:

1. Criar `RunnerCreatorTabs` ou refatorar `CustomizeScreen` para render tabbed panels.
2. Ligar RUNNER panel a `FOTO / PERFIL / LOOK / FICHA`.
3. Manter nav principal do QG acessivel.
4. Remover chrome duplicado: masthead, status-strip, crew lock block, back button, numeros.
5. Persistir `activeTab`, partial state e saved state quando necessario.
6. Adicionar teste para FICHA: empty checklist vs passport salvo.

Arquivos provaveis:

- `components/launch/MainMenu.tsx`
- `components/CustomizeScreen.tsx`
- `components/RunnerProfileForm.tsx`
- `components/PhotoUpload.tsx`
- `components/RunnerTypePicker.tsx`
- `components/WardrobePicker.tsx`
- `components/SheetPreview.tsx`
- `services/launchStorage.ts`
- `index.css`

### Fase 3 — Corrigir mapa/gamificacao visual

Objetivo: mapa parecer parte do mesmo produto e funcionar em mobile.

Passos:

1. Reposicionar `CrewRadioOverlay` para nao cobrir CTA.
2. Trocar paleta marrom/bege por tokens de `DESIGN.md`.
3. Reequilibrar HUD/LayerRail/actions para hierarquia mobile.
4. Definir estado do botao `INICIAR CORRIDA` quando o app ainda estiver em modo teaser vs GPS real.
5. Adicionar teste visual/DOM para CTA visivel em mobile ou Playwright screenshot check.

Arquivos provaveis:

- `components/map/MapStage.tsx`
- `components/map/CrewRadioOverlay.tsx`
- `components/map/HudOverlay.tsx`
- `components/map/LayerRail.tsx`
- `components/map/RunHud.tsx`
- `components/map/RunSummary.tsx`
- `index.css`

### Fase 4 — Fechar loop de gamificacao

Objetivo: o sistema de jogo explicar ganho, missao, badge e progresso sem prometer mais do que existe.

Passos:

1. Decidir contrato: missoes contam para XP agora ou sao teaser?
2. Corrigir missao sem coordenada ou tratar como indisponivel.
3. Se badges forem ativos, calcular unlock no fechamento e renderizar no summary.
4. Se badges forem teaser, exibir locked achievements no QG/mapa com copy clara.
5. Endurecer validators de storage corrompido.

Arquivos provaveis:

- `data/gamification.ts`
- `components/map/MissionLayer.tsx`
- `components/map/RunSummary.tsx`
- `hooks/useRunController.ts`
- `services/runnerProgressStorage.ts`
- `services/activeRunStorage.ts`
- `data/spLiveMap.ts`

## Gates De Aceite Finais

Obrigatorios:

```bash
npm run validate
npx playwright test tests/e2e/map-flow.spec.ts
```

Browser QA minimo:

- Desktop 1440x900: boot/title, QG salvo, RUNNER panel, creator, mapa.
- Mobile 390x844: creator sem overlap; mapa com CTA visivel.
- Mobile 360x800: creator sem horizontal overflow; mapa com footer seguro.

Checklist:

- [ ] Nenhum 404 de imagem/audio/font.
- [ ] Nenhum uso ativo de `/styles/`, `public/styles`, `wardrobe/hair`, `slots.hair`, `crew-flow`, `Crew Flow`.
- [ ] `TESTAR LOCAL` visivel no modal de estudio.
- [ ] `RUNNER SALVO` continua canonico no QG.
- [ ] `Crew Pace` / `crew-pace` continua canonico.
- [ ] Map CTA nao e coberto por radio/rail/HUD.
- [ ] Accessories exibem icones reais.
- [ ] Creator nao parece formulario quebrado nem tela dead-end.
