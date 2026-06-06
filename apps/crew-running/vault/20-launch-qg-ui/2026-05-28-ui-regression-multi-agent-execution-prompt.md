# Multi-Agent Orchestration Prompt — UI Regression Recovery — 2026-05-28

Use este prompt para iniciar uma rodada multi-agent em `/Users/belissima/Desktop/running crew`, com foco em corrigir regressao visual do front do app `apps/crew-running`.

## Prompt Mestre Para O Orquestrador

```text
Estamos em /Users/belissima/Desktop/running crew.

Objetivo: recuperar a UI do app apps/crew-running apos regressao visual. O modulo de gamificacao/mapa e o creator precisam voltar a puxar a identidade visual ja estabelecida no vault, sem quebrar o contrato executavel do creator.

Antes de qualquer edicao, leia obrigatoriamente:
- AGENTS.md
- apps/crew-running/vault/CREATOR_CONTRACT.md
- apps/crew-running/scripts/check-creator-contract.mjs
- apps/crew-running/DESIGN.md
- apps/crew-running/GAME_UI_TEMPLATE.md
- apps/crew-running/vault/CREATOR_DESIGN_SYSTEM.md
- apps/crew-running/vault/2026-05-28-ui-regression-audit-and-correction-plan.md

Regras duras:
- Nao reverta mudancas que voce nao fez.
- Nao use public/styles/* como input de geracao.
- Nao restaure StylePicker, data/styles.ts, slot hair, crew-flow ou Crew Flow.
- Runner types canonicos: sprint, long-run, night-run, crew-pace, urban-trail.
- Slots validos: top, bottom, shoes, accessory.
- Manter TESTAR LOCAL no modal de estudio.
- Antes de finalizar qualquer fase de creator, rodar em apps/crew-running: npm run validate.

Modo de trabalho:
1. Audite o worktree antes de editar.
2. Divida a execucao em agentes com ownership de arquivos disjuntos.
3. Cada agente deve trabalhar em escopo pequeno, testar localmente o que tocar e relatar arquivos alterados.
4. O orquestrador integra, resolve conflitos e faz QA visual real com Playwright/browser.
5. Nenhum agente deve mexer em docs legados fora do escopo sem registrar o motivo.

Artefatos esperados:
- Patch de codigo/CSS/assets que recupera a UI.
- Atualizacao minima de vault se alguma decisao de precedencia for tomada.
- Screenshots de QA em apps/crew-running/output/playwright/ui-recovery-YYYY-MM-DD/.
- Relatorio final com comandos rodados, telas validadas, riscos restantes.

Gates finais obrigatorios:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run validate
npx playwright test tests/e2e/map-flow.spec.ts

Browser QA minimo:
- Desktop 1440x900: QG salvo, RUNNER panel, creator, mapa.
- Mobile 390x844: creator sem overlap; mapa com CTA visivel.
- Mobile 360x800: creator sem horizontal overflow; mapa com footer seguro.
```

## Plano De Agentes

### Agente 1 — Creator CSS Recovery

Responsabilidade: recuperar o visual quebrado do creator atual sem ainda fazer a migracao completa para sub-tabs.

Ownership preferencial:

- `apps/crew-running/components/RunnerProfileForm.tsx`
- `apps/crew-running/components/PhotoUpload.tsx`
- `apps/crew-running/components/RunnerTypePicker.tsx`
- `apps/crew-running/components/WardrobePicker.tsx`
- `apps/crew-running/index.css`

Prompt:

```text
Voce e o agente de recuperacao visual do creator.

Contexto:
- Leia AGENTS.md, CREATOR_CONTRACT.md, check-creator-contract.mjs, DESIGN.md e CREATOR_DESIGN_SYSTEM.md.
- Leia o achado P0 do arquivo vault/2026-05-28-ui-regression-audit-and-correction-plan.md sobre RunnerProfileForm e CSS runner-tab__*.

Tarefa:
- Corrigir o mismatch entre componentes do creator e CSS.
- Garantir que nome, sexo, altura, peso e personalidade nao se sobreponham no desktop e no mobile.
- Nao restaurar StylePicker, data/styles.ts, hair ou public/styles.
- Nao alterar regras de geracao.

Aceite:
- Creator atual fica legivel em 1440x900, 390x844 e 360x800.
- Sem horizontal overflow.
- Touch targets principais >= 44px no mobile.
- Nao remover TESTAR LOCAL.

Valide:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run check:creator-contract
npx tsc --noEmit
npm test -- --runInBand se aplicavel; se nao, npm test

Ao finalizar, reporte:
- arquivos alterados
- screenshots ou roteiro de QA
- riscos restantes
```

### Agente 2 — Wardrobe Assets Recovery

Responsabilidade: ligar assets existentes que parecem sumidos, sem violar o contrato.

Ownership preferencial:

- `apps/crew-running/data/wardrobe.ts`
- `apps/crew-running/components/WardrobePicker.tsx`
- CSS relacionado a wardrobe em `apps/crew-running/index.css`

Prompt:

```text
Voce e o agente de assets/wardrobe.

Contexto:
- O contrato permite slots top, bottom, shoes e accessory.
- public/wardrobe/accessory/*.png existe, mas data/wardrobe.ts nao define iconUrl para accessory.
- public/wardrobe/hair existe como legado e NAO deve entrar no creator.

Tarefa:
- Adicionar iconUrl aos 4 accessories existentes.
- Conferir que WardrobePicker renderiza icones reais para accessory.
- Melhorar fallback visual somente se necessario.
- Nao tocar em hair, public/styles ou StylePicker.

Aceite:
- Todos accessories exibem icone.
- Nenhum request para /wardrobe/hair ou /styles.
- npm run check:creator-contract passa.

Valide:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run check:creator-contract
npx tsc --noEmit

Ao finalizar, reporte:
- arquivos alterados
- lista de assets ligados
- qualquer asset ainda nao usado por decisao de escopo
```

### Agente 3 — Map/Gamification Visual Recovery

Responsabilidade: corrigir mapa/gamificacao visual e o CTA mobile coberto.

Ownership preferencial:

- `apps/crew-running/components/map/MapStage.tsx`
- `apps/crew-running/components/map/CrewRadioOverlay.tsx`
- `apps/crew-running/components/map/HudOverlay.tsx`
- `apps/crew-running/components/map/LayerRail.tsx`
- `apps/crew-running/components/map/RunHud.tsx`
- `apps/crew-running/components/map/RunSummary.tsx`
- secoes map/run/crew-radio de `apps/crew-running/index.css`

Prompt:

```text
Voce e o agente de mapa/gamificacao visual.

Contexto:
- Leia DESIGN.md e o P0/P1 de mapa em vault/2026-05-28-ui-regression-audit-and-correction-plan.md.
- O mapa mobile atual tem CrewRadioOverlay cobrindo o CTA INICIAR CORRIDA.
- A paleta do mapa esta marrom/bege e deve voltar para asphalt/charcoal/bone + crew accent.

Tarefa:
- Reposicionar CrewRadioOverlay para nao cobrir CTA em mobile nem desktop.
- Reequilibrar HUD, LayerRail, Radio e footer para mobile.
- Trocar cores hardcoded #2a2826/#d9cfb8 onde fizer sentido por tokens do DESIGN.md: --black, --jet, --char, --char-2, --bone, --bone-soft, --crew-accent.
- Preservar comportamento de start/pause/resume/stop e testes existentes.

Aceite:
- Mobile 390x844 e 360x800: INICIAR CORRIDA e QG sempre visiveis e tocaveis.
- Desktop 1440x900: mapa continua full-bleed e legivel.
- Sem regressao em tests/e2e/map-flow.spec.ts.

Valide:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npx playwright test tests/e2e/map-flow.spec.ts
npm run typecheck

Ao finalizar, reporte:
- arquivos alterados
- screenshots antes/depois se capturados
- decisoes de layout para Radio
```

### Agente 4 — Creator Subtabs Architecture

Responsabilidade: migrar o creator para a arquitetura aprovada de sub-tabs dentro do QG, depois que CSS basico estiver recuperado.

Ownership preferencial:

- `apps/crew-running/components/CustomizeScreen.tsx`
- novo componente `apps/crew-running/components/RunnerCreatorTabs.tsx` se necessario
- `apps/crew-running/components/launch/MainMenu.tsx`
- `apps/crew-running/components/launch/CrewLaunchExperience.tsx`
- `apps/crew-running/services/launchStorage.ts`
- testes novos/ajustados ligados ao creator

Prompt:

```text
Voce e o agente de arquitetura do creator em sub-tabs.

IMPORTANTE:
- So comece depois que a recuperacao CSS basica estiver integrada.
- Leia CREATOR_DESIGN_SYSTEM.md inteiro o suficiente para seguir a state machine.
- Preserve o contrato do creator.

Tarefa:
- Fazer RUNNER panel hospedar sub-tabs FOTO / PERFIL / LOOK / FICHA.
- Manter GUARDA ROUPA / CREWS PILOTO / RUNNER / CONFIG / REVER INTRO / ABRIR MAPA acessiveis enquanto o usuario monta o runner.
- Remover do fluxo publico: masthead duplicado, status-strip, CrewLockPanel, back button, numeros 01/03/04/05.
- Manter geracao travada por selectedCrewSlug via CrewRenderContext.
- Manter TESTAR LOCAL no modal.

Aceite:
- Crew aparece exatamente uma vez no creator.
- FICHA mostra checklist antes de gerar, sheet preview apos gerar, passport apos salvar.
- LOOK contem RunnerTypePicker, WardrobePicker, MISTURAR LOOK e CRIAR RUNNER.
- FOTO e PERFIL sao navegaveis por mouse e teclado.
- Tabs usam role=tab, aria-selected, aria-controls e arrow navigation.
- Reducible motion respeitado.

Valide:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run validate

Ao finalizar, reporte:
- arquivos alterados
- estado da state machine
- gaps que ficaram fora da fase
```

### Agente 5 — Gamification Logic + Storage Hardening

Responsabilidade: fechar lacunas de progressao ou documentar teaser/indisponivel.

Ownership preferencial:

- `apps/crew-running/data/gamification.ts`
- `apps/crew-running/hooks/useRunController.ts`
- `apps/crew-running/services/runnerProgressStorage.ts`
- `apps/crew-running/services/activeRunStorage.ts`
- `apps/crew-running/components/map/MissionLayer.tsx`
- `apps/crew-running/components/map/RunSummary.tsx`
- testes relacionados

Prompt:

```text
Voce e o agente de logica de gamificacao/storage.

Contexto:
- Leia vault/2026-05-28-ui-regression-audit-and-correction-plan.md, secao P1 sobre catalogo de missoes/badges.
- Hoje rewardXp e badge defs existem, mas RunSummary nao mostra conquistas e useRunController calcula XP so por distancia/territorio/spots/loop.

Tarefa:
- Primeiro decidir e registrar no proprio codigo/teste se missoes sao teaser ou progressao ativa nesta fase.
- Se teaser: desabilitar/explicar estados sem coordenada valida e evitar promessa falsa de XP.
- Se ativa: integrar missao/badge ao fechamento de corrida com testes.
- Endurecer parsing de storage corrompido para inkPerZone e activeRun points.
- Nao alterar visual amplo do mapa; isso pertence ao agente visual.

Aceite:
- Storage corrompido nao crasha MapStage/runTracker.
- Missoes sem coordenada nao geram UI fantasma.
- RunSummary reflete somente recompensas reais.

Valide:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm test
npx tsc --noEmit

Ao finalizar, reporte:
- decisao teaser vs ativa
- arquivos alterados
- testes adicionados
```

### Agente 6 — Docs + Drift Guard

Responsabilidade: limpar conflito documental sem reescrever o vault inteiro.

Ownership preferencial:

- `apps/crew-running/vault/*.md` somente documentos diretamente ligados a precedencia
- `apps/crew-running/GAME_UI_TEMPLATE.md`
- `apps/crew-running/DESIGN.md`
- `apps/crew-running/BUTTON_ASSET_MAP.md`
- `apps/crew-running/README.md` se necessario

Prompt:

```text
Voce e o agente de docs/drift guard.

Contexto:
- Ha docs legados mencionando Crew Flow, RUNNER READY, hair, public/styles e MVP.
- O contrato executavel atual canoniza Crew Pace/crew-pace e RUNNER SALVO no QG.
- DESIGN.md ainda diz GPS/tracking fora de escopo, mas o plano de GPS real foi adotado depois.

Tarefa:
- Criar uma nota curta de precedencia ou atualizar docs minimos para evitar que proximos agentes sigam fonte antiga.
- Nao reescrever todos os docs.
- Nao mudar contrato sem decisao explicita do orquestrador.
- Se "sem foto" continuar ambiguo, registrar como decisao pendente, nao inventar contrato novo.

Aceite:
- Leitor entende quais docs sao canonicos hoje.
- `Crew Flow`/`crew-flow` nao volta para fonte ativa.
- `RUNNER READY` fica marcado como legado ou restrito a contexto explicitamente permitido, enquanto QG usa RUNNER SALVO.
- GPS ativo vs fase original fica explicado.

Valide:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run check:creator-contract

Ao finalizar, reporte:
- docs alterados
- decisoes canonizadas
- pendencias ainda abertas
```

## Ordem Recomendada De Execucao

1. Orquestrador faz `git status --short --branch` e confirma escopo sujo.
2. Rodar Agente 1, Agente 2 e Agente 3 em paralelo.
3. Integrar Agentes 1-3.
4. Rodar QA visual desktop/mobile.
5. Rodar Agente 4 se a base visual estiver recuperada.
6. Rodar Agente 5 em paralelo com Agente 6, desde que nao disputem arquivos.
7. Integrar tudo.
8. Rodar gates finais.
9. Capturar screenshots finais.
10. Escrever closeout no vault com resultado e pendencias.

## Checklist De Integracao Do Orquestrador

- [ ] `git status` revisado antes de editar.
- [ ] Nenhum agente reverteu mudancas externas.
- [ ] `npm run check:creator-contract` passou apos qualquer mudanca de creator.
- [ ] `npm run validate` passou antes do final.
- [ ] `npx playwright test tests/e2e/map-flow.spec.ts` passou.
- [ ] Browser QA capturou desktop e mobile.
- [ ] Mapa mobile nao tem overlay cobrindo CTA.
- [ ] Creator mobile nao tem texto/campos sobrepostos.
- [ ] Accessories mostram icones.
- [ ] Nenhum uso ativo de `/styles/`, `public/styles`, `wardrobe/hair`, `slots.hair`, `Crew Flow`, `crew-flow`.
- [ ] `TESTAR LOCAL` continua disponivel.
- [ ] `RUNNER SALVO` continua no QG.
- [ ] `Crew Pace` / `crew-pace` continua canonico.
```
