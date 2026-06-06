# The Crew Running - Plano De Menu HQ

Data: 2026-05-28
Escopo: brainstorm, plano de acao, orquestracao e execucao da proxima onda do menu.
Status: pre-execucao. Nenhum arquivo de runtime foi alterado nesta rodada.

## 1. Contexto auditado

Fontes locais revisadas:

- `DESIGN.md`
- `GAME_UI_TEMPLATE.md`
- `IMPLEMENTATION_ORCHESTRATION_PLAN.md`
- `components/launch/CrewLaunchExperience.tsx`
- `components/launch/MainMenu.tsx`
- `components/launch/StreetBackdrop.tsx`
- `services/launchStorage.ts`
- `data/crews.ts`
- `index.css`
- `vault/2026-05-27-street-backdrops-2d.md`

Especialistas consultados:

- UX/Product: diagnosticou que o menu esta seguro em escopo, mas amplo demais para o momento do funil.
- Visual/Game UI: recomendou consolidar o menu como HQ operacional de crew, com backdrop 2D full-bleed, leader como poster/patch e painel como mission ticket.
- Tecnico/Integrador: apontou contrato de fluxo, mapa de arquivos, riscos de conflito, comandos de validacao e ownership por agente.

## 2. Diagnostico

O menu atual ja tem bons materiais: `StreetBackdrop`, leader da crew, badge, marker, mission card, cursor ativo e CTA primario. A direcao visual esta mais proxima de um jogo street/HQ do que de uma tela SaaS.

O problema principal e foco. Hoje o `MainMenu` mistura:

- QG inicial.
- Selecao de crews.
- Estado do runner.
- Configuracao.
- Replay da intro.
- CTAs repetidos no rail e no ticket.

Isso cria sensacao de hub completo cedo demais. Para esta fase, o menu deve responder uma pergunta: "qual e o proximo passo para montar/salvar meu runner dentro da crew?"

Guardrails confirmados:

- Nada de start run real.
- Nada de GPS/live tracking.
- Nada de ranking ou streak punitivo.
- Nada de rota publica.
- O CTA primario deve levar para guia, creator, ajuste de runner ou teaser salvo.

## 3. Decisao de direcao

Direcao recomendada: **QG De Missao**.

Definicao: o menu e um QG de primeira missao, nao um dashboard. Ele deve parecer uma mesa de comando colada no asfalto: rail de comandos, poster da lideranca, ticket de missao, badge da crew ativa e um unico proximo comando dominante.

Manter na proxima onda:

- Backdrop 2D full-bleed, sem render 3D pesado.
- Crew ativa controlando tinta/acento visual.
- Nav vertical no desktop e rail compacto no mobile.
- Mission ticket como superficie principal de leitura.
- Leader como poster/patch, nao personagem 3D.

Remover/rebaixar:

- Linguagem tecnica como `setup`, `creator`, `MVP`, `preview`, `API key`.
- CTA duplicado competindo com o CTA principal.
- Sensacao de dashboard ou painel operacional corporativo.
- Frases longas em fonte brush.

## 4. Brainstorm de modelos

### Modelo A - QG De Missao

Menu como primeira base da crew. O usuario ve a crew ativa, estado do runner e proximo comando.

Composicao:

- Esquerda: command rail com CTA principal.
- Centro: leader poster/patch.
- Direita: mission ticket com status e acao.

Por que vence:

- Aproveita o que ja existe no `MainMenu`.
- Corrige foco sem reescrever todo o fluxo.
- Mantem o produto dentro da fase de identidade/runner.
- Funciona bem com `hq-collage-2d.jpg`.

### Modelo B - Mapa De Sinal

Menu como mapa simbolico de SP com pings das crews.

Uso ideal:

- Aba `CREWS PILOTO`.
- Escolha/troca de crew.
- Dossier visual por zona.

Risco:

- Se exagerar em rotas/pulsos, pode parecer tracking ou corrida real.

### Modelo C - Locker Da Crew

Menu como armario/identidade do runner: estilo, selfie, equipamento, slots bloqueados.

Uso ideal:

- Aba `RUNNER`.
- Estado depois que o runner foi salvo.

Risco:

- Antes do guia, pode parecer que o usuario pulou a preparacao.

## 5. Arquitetura de informacao recomendada

### Home / HQ

Objetivo: proximo comando.

Conteudo:

- Crew ativa.
- Estado do sinal.
- Estado do runner.
- Um CTA principal: `COMEÇAR`, `MONTAR RUNNER` ou `AJUSTAR RUNNER`.
- Acao secundaria discreta: trocar crew ou rever intro.

### Crews Piloto

Objetivo: escolher crew.

Conteudo:

- Lista das 5 crews.
- Dossier da crew ativa.
- Membros como thumbnails leves.
- CTA volta para proximo passo do runner.

### Runner

Objetivo: identidade.

Conteudo:

- `RUNNER PENDENTE`, `RUNNER EM MONTAGEM` ou `RUNNER SALVO`.
- Guia/creator como proximas acoes.
- Sem promessa de corrida real.

### Config

Objetivo: seguranca e preferencia.

Conteudo:

- Ritmo seguro.
- Privacidade de sinal coletivo.
- Reduced motion/experiencia leve quando existir.
- Replay da intro.

## 6. Decisao de fluxo

Ha uma divergencia entre plano e runtime:

- Docs aprovados indicam: `City Signal -> Character-Guided Setup -> Runner Creator`.
- Runtime atual faz: `City Signal -> MainMenu`.

Decisao para a proxima onda de menu:

Manter o runtime atual por enquanto, porque o pedido agora e trabalhar o menu. O `MainMenu` deve virar um QG curto e direcionado, com CTA primario levando para o guia/creator. Assim o menu nao substitui o setup: ele vira a porta de comando antes do guia.

Decisao futura possivel:

Se quisermos aderir estritamente ao fluxo original, uma onda separada deve mudar `CrewLaunchExperience.tsx` para enviar `City Signal -> GuidedOnboarding` e mostrar o menu completo apenas depois do runner salvo.

## 7. Plano de acao por ondas

### Onda M0 - Congelar contrato

Objetivo: nao misturar fluxo, UI e assets.

Tarefas:

- Confirmar que a onda atual mantem `City Signal -> MainMenu`.
- Registrar que o menu e QG de primeira missao.
- Proibir start run/GPS/ranking/rota publica nesta fase.
- Tirar screenshot baseline desktop e mobile.

Saida esperada:

- Baseline visual salvo.
- Lista final de labels aprovados.

### Onda M1 - Copy e IA do menu

Objetivo: reduzir ruido e deixar o proximo passo obvio.

Tarefas:

- Trocar `COMEÇAR SETUP` por `COMEÇAR` ou `ABRIR GUIA`.
- Trocar `creator` por `montar runner` ou `ajustar runner`.
- Remover/rebaixar CTA duplicado quando competir com o CTA principal.
- Padronizar estados: `SINAL OK`, `GUIA ABERTO`, `RUNNER PENDENTE`, `RUNNER SALVO`.
- Manter home com uma narrativa curta: crew ativa + proximo comando.

Arquivos:

- `components/launch/MainMenu.tsx`

### Onda M2 - Estrutura visual do QG

Objetivo: fortalecer a metafora QG de missao.

Tarefas:

- Reorganizar home para rail + poster + mission ticket.
- Tratar leader como poster/patch intencional.
- Deixar ticket como unica superficie pesada de leitura.
- Evitar card dentro de card.
- Garantir CTA acima da dobra no mobile.

Arquivos:

- `components/launch/MainMenu.tsx`
- `index.css`

### Onda M3 - Painel Crews e Runner

Objetivo: cada aba ter funcao clara.

Tarefas:

- `CREWS PILOTO`: escolher crew e mostrar dossier.
- `RUNNER`: estado de identidade e acoes de guia/creator.
- `CONFIG`: seguranca, privacidade e replay.
- Garantir que mudar crew muda badge, leader, ticket, cursor e copy.

Arquivos:

- `components/launch/MainMenu.tsx`
- `data/crews.ts` se precisar ajustar copy curta.

### Onda M4 - Performance e assets

Objetivo: remover peso que prejudica render.

Tarefas:

- Converter assets grandes de menu para WebP/AVIF.
- Criar thumbnails para logo, leader e membros.
- Remover `MVP` de bitmap e prompts.
- Validar que imagens de fundo nao carregam texto embutido brigando com live text.

Arquivos:

- `public/brand/*`
- `public/crews/**`
- `scripts/generate-assets.mjs`
- `PROMPTS.md` se existir no escopo de assets.

### Onda M5 - Validacao

Objetivo: fechar com evidencia.

Comandos:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
git status --short
./node_modules/.bin/tsc --noEmit --pretty false
npm run build
```

Validacao sem escrever em `dist/`:

```bash
npm run build -- --outDir /tmp/crew-running-build-audit --emptyOutDir
rg -n "MVP|API KEY|GERAR|PREVIEW|dashboard|GPS|ranking|rota publica|rota pública|START RUN" App.tsx components data services index.css public README.md
```

Estados manuais no browser:

```js
localStorage.clear(); location.reload();
```

```js
localStorage.setItem('crewConsoleBootSeen','true');
localStorage.setItem('crewTitleSeen','true');
localStorage.setItem('crewCitySignalSeen','true');
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

## 8. Orquestracao por especialistas

### Integrador

Responsabilidade:

- `CrewLaunchExperience.tsx`
- `launchStorage.ts`
- `App.tsx`

Regras:

- E o unico dono das transicoes de fluxo.
- Nao mexe em CSS.
- Nao altera assets.

### Worker de Launch/Menu

Responsabilidade:

- `components/launch/MainMenu.tsx`
- `components/launch/CitySignalEntry.tsx` somente se copy/contrato exigir.
- `components/launch/GuidedOnboarding.tsx` somente se labels de ponte exigirem.
- `components/launch/RunnerSavedTeaser.tsx` somente para consistencia de final.

Regras:

- Nao toca storage.
- Nao cria promessa de corrida real.
- Nao cria abas novas sem necessidade.

### Worker CSS/Visual

Responsabilidade:

- `index.css`

Regras:

- Deve ser o unico agente editando CSS na onda.
- Deve revisar desktop, mobile 390px e reduced motion.
- Deve manter uma metafora dominante: QG/ticket/poster.

### Worker Assets

Responsabilidade:

- `public/brand/*`
- `public/crews/**`
- `scripts/generate-assets.mjs`
- prompts de asset se existirem.

Regras:

- Remover `MVP`.
- Criar derivados leves.
- Nao alterar componentes.

### Worker QA/Docs

Responsabilidade:

- `README.md`
- `IMPLEMENTATION_ORCHESTRATION_PLAN.md`
- `vault/**`
- scripts de validacao se aprovados.

Regras:

- Documentar somente o que foi validado.
- Separar plano, execucao e evidencia.

## 9. Ordem segura de execucao

1. Rodar baseline visual e comandos de build atuais.
2. Executar M1 apenas em `MainMenu.tsx`.
3. Revisar manualmente copy e CTA.
4. Executar M2 com lock exclusivo em `index.css`.
5. Validar desktop/mobile.
6. Executar M3 se M1/M2 estiverem estaveis.
7. Executar M4 em branch/onda separada, porque assets podem mudar muita coisa.
8. Fechar M5 com evidencia no vault.

## 10. Criterios de aceite

- Em ate 3 segundos, o usuario entende crew ativa, estado do runner e proximo comando.
- CTA primario nunca sugere corrida real.
- Home do menu parece QG de missao, nao dashboard.
- `CREWS PILOTO` e o unico lugar onde troca de crew vira foco.
- `RUNNER` e o unico lugar onde identidade vira foco.
- `CONFIG` nao compete visualmente com a missao.
- Desktop nao tem sobreposicao entre rail, leader e ticket.
- Mobile 390px nao tem overflow horizontal.
- Touch targets principais ficam com no minimo 44px.
- Reduced motion preserva o fluxo sem depender de blur pesado ou loops.
- Build e TypeScript passam.

## 11. Prompt de execucao para a proxima rodada

```text
Estamos em "/Users/belissima/Desktop/running crew/apps/crew-running".
Siga o vault "vault/2026-05-28-main-menu-hq-action-plan.md".

Objetivo da rodada: executar Onda M1 e M2 do MainMenu.

Regras:
- Nao reverta mudancas que voce nao fez.
- Nao implemente start run, GPS, ranking, live tracking ou rota publica.
- Preserve o fluxo atual City Signal -> MainMenu nesta rodada.
- O MainMenu deve virar QG De Missao: rail de comandos, leader como poster/patch, mission ticket como superficie principal.
- Troque linguagem tecnica: setup/creator/MVP/API key/preview.
- Nao mexa em assets nesta rodada.
- Se mexer em CSS, somente um agente pode editar index.css.

Arquivos primarios:
- components/launch/MainMenu.tsx
- index.css

Validacao:
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
./node_modules/.bin/tsc --noEmit --pretty false
npm run build

Depois rode browser/screenshot em desktop e mobile e registre evidencia no vault.
```
