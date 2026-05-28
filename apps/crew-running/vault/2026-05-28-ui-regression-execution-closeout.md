# UI Regression Multi-Agent Execution Closeout

Data: 2026-05-28
App: `apps/crew-running`
Status: executado e validado

## Escopo executado

- Runner creator voltou para dentro do QG, no painel `RUNNER`, com subtabs `FOTO`, `PERFIL`, `LOOK`, `FICHA`.
- O fluxo de onboarding/launch agora abre o creator embutido sem reativar `StylePicker`, `data/styles.ts`, slot `hair` ou `public/styles/*`.
- O save de runner marca `crewRunnerCustomized`, limpa o rascunho e permanece no painel `RUNNER`/`FICHA`, sem desviar para uma tela teaser fora do QG.
- O rascunho do creator persiste localmente: foto comprimida, perfil, runner type e slots travados.
- O CSS `runner-tab__*` foi completado para formulario, tabs, action bar, passport, checklist e responsivo.
- Os assets de `wardrobe/accessory` foram conectados em `data/wardrobe.ts`.
- O radio da crew no mapa saiu do overlay absoluto e ficou no fluxo do grid, sem competir com os CTAs `INICIAR CORRIDA` e `QG`.
- O smoke `scripts/smoke-creator.mjs` foi atualizado para a UX atual: QG -> RUNNER -> FOTO/PERFIL/LOOK -> `TESTAR LOCAL` -> equipar look -> `crew.saved_character`.

## Arquivos principais

- `App.tsx`
- `components/creator/RunnerCreatorTabs.tsx`
- `components/creator/CreatorTabNav.tsx`
- `components/creator/tabs/*.tsx`
- `components/launch/CrewLaunchExperience.tsx`
- `components/launch/MainMenu.tsx`
- `components/map/MapStage.tsx`
- `data/wardrobe.ts`
- `services/launchStorage.ts`
- `scripts/smoke-creator.mjs`
- `index.css`

## Validacao

Passou:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run check:creator-contract
npm run typecheck
npx vitest run services/launchStorage.test.ts components/creator/__tests__/RunnerCreatorTabs.test.tsx components/launch/__tests__/MainMenu.test.tsx
npx playwright test tests/e2e/map-flow.spec.ts
git diff --check -- apps/crew-running
npm run validate
```

Resultados:

- `npm run validate`: passou.
- Vitest completo dentro de `validate`: 39 files, 316 tests.
- Playwright map flow: 3 passed.
- Creator smoke: passou em `photo upload -> TESTAR LOCAL -> 2x2 -> crew.saved_character`.
- Build Vite passou com aviso conhecido de chunk acima de 500 kB.

## Evidencia visual

Screenshots gerados em:

```text
/Users/belissima/Desktop/running crew/apps/crew-running/output/playwright/ui-recovery-2026-05-28/
```

Arquivos:

- `desktop-main-menu-home.png`
- `desktop-runner-foto.png`
- `desktop-runner-perfil.png`
- `desktop-runner-look.png`
- `desktop-map-radio-closed.png`
- `desktop-map-radio-open.png`
- `mobile-main-menu-home.png`
- `mobile-runner-foto.png`
- `mobile-runner-perfil.png`
- `mobile-runner-look.png`
- `mobile-map-radio-closed.png`
- `mobile-map-radio-open.png`

Checks automatizados de QA visual:

- runner tablist visivel em desktop/mobile.
- casca antiga do creator ausente no painel RUNNER.
- 4 accessory assets carregados em desktop/mobile.
- botao `CRIAR RUNNER` visivel no painel LOOK.
- radio fechado e aberto sem overlap com `.map-stage-actions` em desktop/mobile.
- `INICIAR CORRIDA` e `QG` visiveis em desktop/mobile.

## Riscos residuais

- O pacote ainda tem varios arquivos untracked pre-existentes fora deste fechamento; nada foi revertido.
- O aviso de bundle grande no build continua como risco de performance futuro, nao como bloqueador visual.
- O creator ainda depende de upload de foto para geracao; o contrato menciona modo sem foto com brief fisico, mas esse modo nao foi implementado nesta execucao.

## Revisao corretiva posterior

Correcoes adicionadas apos review:

- O CTA laranja principal do QG agora abre direto o mapa/gamificacao.
- Atalhos redundantes de `ABRIR MAPA` na home foram removidos; a checagem DOM confirmou apenas 1 botao `ABRIR MAPA` na home.
- O painel de crews agora fica bloqueado no MVP depois da crew escolhida; as 5 opcoes aparecem desabilitadas.
- A ficha agora prioriza uma nova sheet gerada sobre o passport salvo, permitindo reequipar um runner ja salvo.
- A ficha salva usa a crew persistida em `savedCharacter.crewSlug`, nao a crew ativa/current do QG.
- O smoke do creator passou a abrir o creator pela nav `RUNNER`, ja que o CTA laranja nao deve mais abrir criacao/edicao.

Validacao adicional:

```bash
npx vitest run components/creator/__tests__/FichaTab.test.tsx components/creator/__tests__/RunnerCreatorTabs.test.tsx components/launch/__tests__/MainMenu.test.tsx
npm run smoke:creator
npx playwright test tests/e2e/map-flow.spec.ts
npm run validate
```

Resultado:

- `npm run validate`: passou.
- Vitest completo dentro de `validate`: 39 files, 319 tests.
- Playwright map flow: 3 passed.
- Checagem DOM manual: single `ABRIR MAPA` na home, CTA laranja abre `.map-stage`, 5/5 crews bloqueadas.
