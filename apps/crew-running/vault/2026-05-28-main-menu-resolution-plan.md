# The Crew Running - Plano De Resolucao Do Menu

Data: 2026-05-28
Escopo: resolver o menu atual com execucao controlada, sem abrir corrida real.
Base: `vault/2026-05-28-main-menu-hq-action-plan.md`

## 1. Objetivo

Transformar o `MainMenu` em um **QG De Missao** claro, leve e direcionado para montagem/salvamento do runner.

O resultado esperado nao e um menu completo de app. E uma tela de comando de primeira missao:

- crew ativa visivel;
- runner pendente/salvo visivel;
- um proximo comando dominante;
- troca de crew como acao secundaria;
- sem start run, GPS, ranking, live tracking ou rota publica.

## 2. Problemas que vamos resolver

### P0 - Contrato de fluxo ambiguo

Docs aprovados:

```text
City Signal Entry -> Character-Guided Setup -> Runner Creator
```

Runtime atual:

```text
City Signal Entry -> MainMenu
```

Resolucao desta onda:

Manter o runtime atual. O menu vira um **HQ Gate**: aparece depois do City Signal, mas sua funcao primaria e levar o usuario para o guia/runner creator. Nao vamos mudar `CrewLaunchExperience.tsx` nesta primeira execucao, salvo se a validacao provar que o fluxo ficou confuso.

Critério para mudar depois:

Se o usuario, olhando o menu por 3 segundos, nao entender que deve montar o runner, a proxima onda troca o fluxo para `City Signal -> GuidedOnboarding` e deixa o menu completo apenas depois de `runnerCustomized`.

### P1 - Menu amplo demais cedo demais

Hoje o menu mistura QG, crews, runner, config, replay e CTAs duplicados.

Resolucao:

- Home vira `HQ`.
- `CREWS PILOTO` vira area de escolha.
- `RUNNER` vira area de identidade.
- `CONFIG` vira area secundaria de seguranca/preferencias.
- O CTA global do rail continua sendo o comando principal.
- CTAs dentro do ticket viram suporte, exceto quando o ticket estiver em uma aba especifica.

### P2 - Copy tecnica ou hibrida

Trechos atuais a resolver:

- `COMEÇAR SETUP`
- `creator`
- `setup`
- `streak`
- labels antigas como `MVP`, `API KEY`, `PREVIEW`, `GERAR` em areas do produto/assets/docs.

Resolucao nesta onda:

- No `MainMenu`, trocar para linguagem player-facing:
  - `COMEÇAR`
  - `ABRIR GUIA`
  - `MONTAR RUNNER`
  - `AJUSTAR RUNNER`
  - `RUNNER PENDENTE`
  - `RUNNER SALVO`
- Asset/copy antiga fora do menu fica para onda propria, para nao misturar escopo.

### P3 - Hierarquia visual

O menu ja tem material bom, mas ainda pode parecer dashboard.

Resolucao:

- Reforcar metafora `rail de comandos + poster de crew + mission ticket`.
- Leader deve parecer poster/patch.
- Ticket deve ser a unica area de leitura pesada.
- Evitar card dentro de card.
- Mobile deve mostrar CTA cedo e sem overflow.

### P4 - Peso de assets

Leaders, logo e membros estao grandes para o tamanho renderizado.

Resolucao:

- Nao corrigir na primeira onda do menu.
- Planejar onda M4 para WebP/AVIF e thumbnails.
- Antes de release mobile, isso vira obrigatorio.

## 3. Decisao de produto para execucao

Decisao: **MainMenu como HQ Gate pre-runner e HQ completo post-runner**.

Comportamento:

- Antes de `guidedSetupComplete`: o menu empurra `COMEÇAR` / `ABRIR GUIA`.
- Depois de `guidedSetupComplete`, antes de `runnerCustomized`: o menu empurra `MONTAR RUNNER`.
- Depois de `runnerCustomized`: o menu vira HQ de retorno e empurra `AJUSTAR RUNNER`, sem iniciar corrida real.

Essa decisao resolve o conflito sem quebrar o runtime atual.

## 4. Patches planejados

### Patch 1 - Copy e comandos do `MainMenu`

Arquivos:

- `components/launch/MainMenu.tsx`

Mudancas:

- Criar helpers locais para estado:
  - `isGuideDone`
  - `isRunnerSaved`
  - `primaryLabel`
  - `runnerStatusLabel`
  - `guideStatusLabel`
- Trocar `COMEÇAR SETUP` por `ABRIR GUIA`.
- Trocar `creator` por `montar runner` / `ajustar runner`.
- Trocar `Sem streak punitivo` por copy de ritmo seguro sem termo tecnico.
- Evitar que o home repita o CTA primario com o mesmo peso visual do rail.

Nao fazer:

- Criar novos arquivos ainda.
- Alterar storage.
- Alterar fluxo.

Aceite:

- `rg -n "COMEÇAR SETUP|creator|setup|streak" components/launch/MainMenu.tsx` nao deve retornar nada.

### Patch 2 - Home como HQ Gate

Arquivos:

- `components/launch/MainMenu.tsx`
- `index.css`

Mudancas:

- Home deve ter:
  - eyebrow de sinal;
  - nome da crew;
  - frase curta de contexto;
  - status strip com `SINAL`, `GUIA`, `RUNNER`;
  - acao secundaria para `TROCAR CREW`;
  - sem botao primario duplicado se o rail ja estiver forte.
- O ticket deve parecer uma ficha de missao, nao um painel administrativo.

Aceite:

- No desktop, rail, leader e ticket aparecem sem colisao.
- No mobile 390px, CTA aparece antes do usuario precisar entender o restante.

### Patch 3 - Abas com responsabilidade unica

Arquivos:

- `components/launch/MainMenu.tsx`

Mudancas:

- `CREWS PILOTO`: escolher crew + dossier.
- `RUNNER`: estado de identidade + acoes de guia/runner.
- `CONFIG`: seguranca, privacidade, replay.

Aceite:

- Nenhuma aba sugere corrida real.
- Trocar crew altera badge, leader, ticket e copy.

### Patch 4 - CSS de polimento

Arquivos:

- `index.css`

Mudancas:

- Ajustar leader como poster/patch.
- Ajustar foco/hover do CTA e cursor ativo.
- Reduzir blur pesado se estiver custando performance.
- Confirmar reduced motion.
- Revisar media queries do menu.

Regra:

Somente um agente pode editar `index.css` nesta onda.

Aceite:

- `prefers-reduced-motion` nao depende de animacao para comunicar estado.
- Sem overflow horizontal no mobile.

### Patch 5 - Validacao e evidencia

Arquivos:

- `vault/**`
- opcionalmente `README.md` depois de validar.

Comandos:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
git status --short
./node_modules/.bin/tsc --noEmit --pretty false
npm run build
```

Busca de guardrails:

```bash
rg -n "COMEÇAR SETUP|creator|setup|streak|START RUN|GPS|ranking|rota publica|rota pública" components/launch/MainMenu.tsx
```

Estados manuais:

```js
localStorage.clear(); location.reload();
```

```js
localStorage.setItem('crewConsoleBootSeen','true');
localStorage.setItem('crewTitleSeen','true');
localStorage.setItem('crewCitySignalSeen','true');
localStorage.removeItem('crewGuidedSetupComplete');
localStorage.removeItem('crewRunnerCustomized');
location.reload();
```

```js
localStorage.setItem('crewConsoleBootSeen','true');
localStorage.setItem('crewTitleSeen','true');
localStorage.setItem('crewCitySignalSeen','true');
localStorage.setItem('crewGuidedSetupComplete','true');
localStorage.removeItem('crewRunnerCustomized');
location.reload();
```

```js
localStorage.setItem('crewConsoleBootSeen','true');
localStorage.setItem('crewTitleSeen','true');
localStorage.setItem('crewCitySignalSeen','true');
localStorage.setItem('crewGuidedSetupComplete','true');
localStorage.setItem('crewRunnerCustomized','true');
location.reload();
```

## 5. Orquestracao de execucao

### Agente 1 - Launch/Menu

Responsavel por:

- `components/launch/MainMenu.tsx`

Executa:

- Patch 1.
- Patch 2 JSX.
- Patch 3.

Nao toca:

- `index.css`
- `CrewLaunchExperience.tsx`
- `launchStorage.ts`

### Agente 2 - CSS/Visual

Responsavel por:

- `index.css`

Executa:

- Patch 4.
- Mobile.
- Reduced motion.
- Estados de foco/hover.

Nao toca:

- componentes React.
- storage.

### Agente 3 - QA/Integrador

Responsavel por:

- revisar diffs;
- rodar comandos;
- registrar evidencia;
- decidir se `CrewLaunchExperience.tsx` precisa mudar em onda separada.

Nao toca:

- assets pesados nesta onda.

## 6. Ordem operacional

1. Baseline:
   - abrir menu no estado atual;
   - capturar screenshot desktop/mobile;
   - rodar `tsc` e build.
2. Patch 1:
   - limpar copy tecnica no `MainMenu`.
3. Patch 2:
   - reorganizar home como HQ Gate.
4. Patch 3:
   - fechar responsabilidades das abas.
5. Patch 4:
   - polir CSS com lock exclusivo.
6. QA:
   - desktop;
   - mobile 390px;
   - reduced motion;
   - 3 estados de localStorage.
7. Closeout:
   - registrar screenshots, comandos e achados no vault.

## 7. Criterios de aceite finais

- Usuario entende o proximo comando em ate 3 segundos.
- O menu parece QG de missao, nao dashboard.
- `COMEÇAR` leva para o guia quando o guia nao foi feito.
- `MONTAR RUNNER` leva para o creator quando o guia ja foi feito.
- `AJUSTAR RUNNER` leva para o creator quando runner ja esta salvo.
- Trocar crew atualiza a identidade visual.
- `CONFIG` nao compete com a missao.
- Nenhuma copy sugere corrida real, GPS, ranking ou rota publica.
- Sem `COMEÇAR SETUP`, `creator`, `setup` ou `streak` no `MainMenu`.
- TypeScript e build passam.
- Evidencia visual fica registrada no vault.

## 8. Fora de escopo desta execucao

- Converter assets para WebP/AVIF.
- Remover `MVP` de bitmap.
- Refatorar `CustomizeScreen`.
- Remover componentes legados de mapa/3D.
- Alterar `City Signal -> MainMenu` para `City Signal -> GuidedOnboarding`.
- Criar sistema real de corrida.

## 9. Decisao de rollback

Se a reforma do menu piorar clareza ou mobile:

1. manter a copy corrigida;
2. desfazer apenas a reorganizacao visual;
3. preservar o runtime;
4. abrir onda separada para mudar o fluxo para `City Signal -> GuidedOnboarding`.

Rollback nao deve mexer em mudancas nao relacionadas feitas por outros agentes.
