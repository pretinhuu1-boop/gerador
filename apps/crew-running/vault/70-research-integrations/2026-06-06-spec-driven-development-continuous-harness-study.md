# Spec-driven development + continuous harness study

Data: 2026-06-06
App: `apps/crew-running`
Pesquisa local: `.codex-research/spec-driven`
Cipher/Cypher papers: `/Users/belissima/Downloads/Cipher/research-papers/continual-harness`

## Decisao executiva

Usar `github/spec-kit` como referencia principal para a espinha dorsal de
Spec-Driven Development: constitution -> specify -> plan -> tasks -> implement.
Nao importar a ferramenta inteira agora.

Usar `Priivacy-ai/spec-kitty` como referencia operacional para missoes,
work packages, worktrees, review/accept/merge, retrospectiva e gates contra
drift. Tambem nao importar a ferramenta inteira agora.

Para o Running Crew, o caminho correto e um SDD nativo do vault:

1. `CURRENT_PRODUCT_CONTEXT.md` continua sendo a verdade de estado atual.
2. Novas mudancas entram como deltas em `vault/specs/NNN-slug/`.
3. Cada spec deve ter artefatos de implementacao, validacao e retrospectiva.
4. O continuous harness vira um gate por spec, nao uma planilha separada.

## Repos estudados

| Repo | Snapshot local | Licenca | Melhor uso | Decisao |
| --- | --- | --- | --- | --- |
| `github/spec-kit` | `7106858` 2026-06-05 | MIT | Fases e templates SDD: spec, plan, tasks, constitution, checklists | Usar como base metodologica |
| `Priivacy-ai/spec-kitty` | `924e6cf` 2026-06-06 | MIT | Missao operacional, work packages, lanes, worktrees, retrospectiva e drift gates | Absorver praticas, nao a stack inteira |
| `specdd/specdd` | web/docs | nao auditado localmente | Filosofia agent-agnostic e specs em Git | Referencia secundaria |

## O que absorver do GitHub Spec Kit

Pontos fortes:

- Processo simples e ensinavel: `spec -> plan -> tasks -> implement`.
- `spec.md` separa o que o usuario precisa do como tecnico.
- User stories sao priorizadas e independentemente testaveis.
- `plan.md` obriga contexto tecnico, constitution check, estrutura de projeto e
  rastreio de complexidade.
- `tasks.md` organiza trabalho por user story, marca paralelismo seguro e
  exige checkpoints independentes.
- Checklists reduzem ambiguidade e impedem o agente de inventar premissas sem
  marcar `NEEDS CLARIFICATION`.

Erros a evitar:

- Tratar toda spec como documentacao viva do sistema inteiro. Isso gera drift em
  codebases grandes e muda a tarefa do agente para "corrigir docs" em vez de
  "entregar delta".
- Colocar implementacao tecnica dentro de `spec.md`. O spec deve ser negocio,
  usuario, aceites e criterios de sucesso.
- Criar uma spec sem grounding no codigo e vault atuais.

## O que absorver do Spec Kitty

Pontos fortes:

- Specs sao deltas: o codigo e os docs canonicos dizem o estado atual; a spec
  diz o futuro desejado.
- Missoes geram work packages que podem ser revisados e aceitos separadamente.
- Lanes como `planned`, `doing`, `for_review`, `done` reduzem confusao entre
  agentes.
- Retrospectiva fecha o ciclo: depois de aceitar a missao, registrar o que
  ajudou, o que falhou e quais regras de governanca devem mudar.
- Drift gates sao tratados como parte do fluxo, nao como pos-falha informal.

Erros a evitar:

- Importar todo o modelo de worktrees/CLI antes de provar valor no nosso vault.
- Deixar a governanca mudar automaticamente. Propostas de retrospectiva devem
  ser revisadas antes de virar regra canonica.
- Confundir `CURRENT_PRODUCT_CONTEXT.md` com uma spec. O current context e
  estado atual; specs sao deltas.

## Continuous harness vindo do Cipher/Cypher

Os papers locais convergem em tres ideias praticas:

1. O harness, nao apenas o modelo, determina a confiabilidade.
2. Avaliacao nao e score final; e loop de qualidade do harness.
3. Toda falha precisa ser atribuida a uma camada modificavel.

Taxonomia que vamos usar:

| Camada | Pergunta no Running Crew |
| --- | --- |
| Execution | O ambiente, servidor, build, browser, device ou sandbox estao reproduziveis? |
| Tooling | As ferramentas/comandos/rotas expostas ao agente estao claras e com erro acionavel? |
| Context | O agente leu o current context, contrato do creator, spec ativa e codigo real? |
| Lifecycle | A tarefa tem estados: specify, plan, tasks, implement, review, accept, retro? |
| Observability | Temos log de comandos, screenshots, traces, erros, custos/tempo quando aplicavel? |
| Verification | Existe readiness check, teste, smoke, browser/device QA ou criterio manual objetivo? |
| Governance | Ha regras de permissao, segredo, service role, GPS, creator contract e aprovacao humana? |

Estagios do continuous harness por spec:

1. **Task grounding**: registrar qual spec, qual superficie, qual codigo/docs
   foram lidos e quais criterios de sucesso valem.
2. **Readiness validation**: confirmar dependencias, env, dev server, secrets,
   comandos de validacao, device/browser e budget.
3. **Controlled execution + trace capture**: rodar em condicoes reproduziveis e
   registrar comandos, outputs relevantes, screenshots, erros e decisoes.
4. **Judgement + failure attribution**: avaliar resultado, trajetoria e
   avaliador; atribuir falhas a Execution/Tooling/Context/Lifecycle/
   Observability/Verification/Governance.
5. **Continuous regression feedback**: converter falha real em teste, checklist,
   regra de vault ou gate de validacao.

## Estrutura recomendada no vault

Manter documentos globais no topo do vault e criar specs em subpastas:

```text
apps/crew-running/vault/
  CURRENT_PRODUCT_CONTEXT.md
  CREATOR_CONTRACT.md
  2026-06-06-spec-driven-development-continuous-harness-study.md
  specs/
    000-index.md
    001-mobile-capacitor-export/
      spec.md
      plan.md
      research.md
      tasks.md
      harness.md
      validation-log.md
      review.md
      retrospective.md
    002-admin-operational-panel/
      ...
```

### `spec.md`

- Intento do usuario.
- Superficie: mobile/player, game layer, site publico, desktop usuario/rede ou
  painel operacional.
- User stories priorizadas.
- Criterios de aceite independentes.
- Escopo e nao escopo.
- `NEEDS CLARIFICATION` quando faltar decisao.
- Links para docs canonicos lidos.

Nao incluir codigo, stack nova ou comandos longos aqui.

### `plan.md`

- Contexto tecnico real lido no repo.
- Arquivos e modulos afetados.
- Decisoes e tradeoffs.
- Constitution/current-context check.
- Riscos de seguranca, dados, creator, GPS, mobile ou admin.
- Plano de validacao.

### `tasks.md`

- Tarefas por user story.
- Cada tarefa com arquivo alvo ou artefato alvo.
- Marcar paralelismo seguro.
- Checkpoint por story.
- Proibir "fazer tudo" como task unica.

### `harness.md`

Tabela ETCLOVG da spec:

```text
Execution:
Tooling:
Context:
Lifecycle:
Observability:
Verification:
Governance:
```

Tambem deve declarar:

- readiness checks antes de executar;
- quais traces/logs serao salvos;
- como atribuir falhas;
- que regressao/checklist deve nascer se algo quebrar.

### `validation-log.md`

- Comandos rodados.
- Browser/device QA.
- Screenshots/paths quando existirem.
- Resultado esperado vs real.
- Falhas com camada ETCLOVG.

### `review.md`

- Findings primeiro.
- Evidencia por arquivo/linha ou screenshot.
- Se aprovado, declarar quais criterios passaram.
- Se reprovado, cada problema vira task ou regressao.

### `retrospective.md`

- O que funcionou.
- O que falhou.
- Regras do vault que devem mudar.
- Docs stale descobertos.
- Propostas de atualizacao para `CURRENT_PRODUCT_CONTEXT.md`, `AGENTS.md` ou
  contratos executaveis.

## Acertos atuais do nosso vault

- `CREATOR_CONTRACT.md` tem regras nao negociaveis e contrato executavel via
  `scripts/check-creator-contract.mjs`.
- `CURRENT_PRODUCT_CONTEXT.md` separa estado atual, superficies e docs stale.
- O estudo open-source de 2026-06-06 ja separa mobile/player, game, site,
  desktop usuario/rede e painel operacional.
- O plano admin ja identifica drift real entre migrations, tipos e sync.
- O plano mobile ja separa Android APK debug de iOS export e release real.

## Erros/riscos atuais

- Muitos docs datados no topo do vault competem como se fossem atuais.
- Nem todo plano tem spec, tasks, validation-log, review e retro.
- Alguns docs antigos sao closeout historico, mas agentes podem trata-los como
  plano atual.
- Nao existe `vault/specs/000-index.md` dizendo quais specs estao ativas,
  aceitas, canceladas ou superseded.
- Ainda nao ha um harness por spec com ETCLOVG, readiness, trace e failure
  attribution.
- Falhas reais podem virar conversa solta em vez de regressao/checklist.

## Regras propostas para novas sessoes

1. Antes de implementar feature nova, criar ou localizar a spec em
   `vault/specs/`.
2. Antes de editar codigo, preencher pelo menos `spec.md`, `plan.md`,
   `tasks.md` e `harness.md`.
3. Toda task deve apontar para arquivo, artefato ou validacao concreta.
4. Toda validacao deve registrar comando, resultado e falha se houver.
5. Toda falha relevante deve receber camada ETCLOVG.
6. Nenhuma retrospectiva altera regra canonica automaticamente; ela propoe.
7. `CURRENT_PRODUCT_CONTEXT.md` so muda quando a decisao ja foi aceita.

## Proxima onda recomendada

Criar a primeira spec real:

```text
apps/crew-running/vault/specs/001-spec-driven-vault-harness/
```

Objetivo: instalar o esqueleto SDD do vault, sem implementar codigo de produto.

Entregas:

- `vault/specs/000-index.md`
- templates internos para `spec.md`, `plan.md`, `tasks.md`, `harness.md`,
  `validation-log.md`, `review.md`, `retrospective.md`
- update em `CURRENT_PRODUCT_CONTEXT.md`
- update em `AGENTS.md` e `CLAUDE.md` para orientar agentes a entrar por specs
  quando a tarefa for feature/arquitetura/harness

Nao fazer ainda:

- instalar `specify-cli`;
- instalar `spec-kitty`;
- criar worktrees automaticos;
- mexer em app code;
- transformar todo doc antigo em spec retroativamente.

## Fontes

- GitHub Spec Kit: `https://github.com/github/spec-kit`
- Spec Kit docs: `https://github.github.com/spec-kit/`
- Spec Kit Agents paper: `https://arxiv.org/abs/2604.05278`
- Spec Kitty: `https://github.com/Priivacy-ai/spec-kitty`
- SpecDD: `https://specdd.ai/`
- Cipher/Cypher local papers:
  `/Users/belissima/Downloads/Cipher/research-papers/continual-harness`
