# Duvidas abertas e prompts para agentes - mapa, eventos e rede wellness

Data: 2026-06-04
App: `apps/crew-running`
Status: briefing de investigacao. Nao implementar ainda.

## Objetivo

Documentar as duvidas que ficaram depois da auditoria de codigo e preparar prompts para agentes especialistas investigarem com mais precisao antes da orquestracao ponta a ponta.

Documento base desta rodada:

- `vault/2026-06-04-map-events-code-audit.md`
- `vault/2026-06-04-map-events-end-to-end-orchestration-plan.md`
- `vault/2026-06-04-map-centric-events-architecture.md`
- `vault/2026-06-03-map-centric-commerce-interaction-model.md`
- `vault/2026-06-03-admin-dashboard-architecture-plan.md`

## Contexto de produto consolidado

O produto tem dois modos:

- Mobile: experiencia gamificada de corrida urbana, GPS, mapa vivo, crews, spots, corridas e progressao.
- Desktop: area do usuario, rede social/wellness, metricas, operacao, administracao e inteligencia em cima do mapa.

O mapa e o centro do produto. Ele deve concentrar:

- territorio e dominancia;
- eventos;
- profissionais wellness;
- marcas, lojas e parceiros;
- atletas e patrocinio;
- futuramente transacoes, videochamadas/salas, ofertas e publicidade.

Para MVP, a recomendacao atual e:

```text
Onda 0: estabilidade, schema, auth/admin-security
Onda 1: Eventos local-first no mapa
Onda 2: schema/cloud/leads/admin read-only
Onda 3: perfis wellness, marcas, moderacao e operacoes
Onda 4: transacoes, video, patrocinio, marketplace e publicidade
```

## Travas nao negociaveis

- Nao transformar o player-facing em SaaS/dashboard.
- Nao implementar antes de fechar as investigacoes.
- Nao expor `service_role`, secret keys ou operacoes privilegiadas no browser.
- Nao usar `user_metadata` para autorizacao.
- Respeitar `organization_id` em dados compartilhados.
- GPS bruto, fotos, mensagens e notas pessoais devem ser redigidos por padrao.
- Desktop nao deve depender de tracking de corrida.
- Creator continua seguindo `CREATOR_CONTRACT.md`.
- Nao restaurar `StylePicker`, `data/styles.ts`, `public/styles/*`, slot `hair`, `crew-flow`.
- Nao criar pagamento, video, marketplace ou admin full na Onda 1.

## Duvidas abertas

### 1. Primeira camada comercial do mapa

Duvida:

- Comecar por `Eventos` ou por `Profissionais/Wellness Profiles`?

Recomendacao atual:

- Comecar por `Eventos`.

Motivo:

- Evento permite colocar personal, medico, nutricionista, loja, marca, atleta, criador e crew como `host` ou `partner` sem criar rede comercial completa.
- Evento e mais natural no mapa: tem data, local, zona, CTA e contexto regional.

Pergunta bloqueante:

- O MVP precisa mostrar profissionais soltos no mapa ou basta mostrar profissionais vinculados a eventos?

### 2. CTA do usuario

Duvida:

- CTA principal deve ser `Tenho interesse`, `Pedir contato` ou `Salvar evento`?

Recomendacao atual:

- `Tenho interesse` como CTA principal.
- `Salvar evento` pode ser secundario.

Motivo:

- `Tenho interesse` cria sinal comercial sem exigir PII, chat, pagamento ou backend imediato.

Perguntas:

- Esse interesse deve ser anonimo/local na Onda 1?
- Quando virar cloud, quem ve esse interesse: host, admin, usuario, marca?

### 3. Handles, tags e identidade de perfis

Duvida:

- O app usa `@handle`, tags por setor, ambos ou outro identificador?

Recomendacao atual:

- Usar `@handle` unico para identidade publica.
- Usar tags/roles para descoberta: `personal`, `medico`, `nutricionista`, `loja`, `marca`, `suplemento`, `evento`, `atleta`.

Perguntas:

- Um usuario pode ter multiplos papeis ao mesmo tempo?
- Como validar perfil profissional sem travar o MVP?
- Como evitar que perfis comerciais virem spam no mapa?

### 4. Modelo de conta

Duvida:

- Criar contas separadas para atleta, profissional, marca e loja ou uma conta com papeis?

Recomendacao atual:

- Uma conta com multiplos roles/perfis.

Motivo:

- Um personal pode ser corredor.
- Uma atleta pode ser criadora de evento.
- Uma loja pode ter runner admin.

Perguntas:

- Qual role e publica e qual role e administrativa?
- O `runner profile` deve existir separado do `professional profile`?
- O perfil comercial pertence a usuario, organizacao ou ambos?

### 5. Eventos como objeto MVP

Duvida:

- Quais campos minimos um evento precisa ter para ser util no mapa?

Recomendacao atual:

```ts
id
title
kind
status
zoneId
coordinate
startsAt
endsAt
hostName
hostType
partnerNames
summary
ctaLabel
privacy
```

Perguntas:

- Evento precisa de limite de participantes no MVP?
- Evento precisa de preco ou deve ser sempre sem pagamento agora?
- Evento precisa de cidade/bairro alem de zona?
- Evento precisa de aprovacao/moderacao antes de aparecer?

### 6. Eventos no mapa durante corrida ativa

Duvida:

- Eventos aparecem quando o runner esta em tracking?

Recomendacao atual:

- Nao.

Motivo:

- Durante corrida, foco e GPS/HUD/seguranca.
- Eventos, marcas e contatos podem distrair e contaminar o game loop.

Pergunta:

- Algum tipo de evento de seguranca/apoio deve aparecer durante corrida no futuro?

### 7. Desktop e mapa

Duvida:

- Desktop abre em mapa + area do usuario/rede, ou em dashboard/admin?

Recomendacao atual:

- Desktop abre em mapa + area do usuario + rede/metricas.
- Admin fica separado ou protegido em outro bundle/app futuro.

Perguntas:

- Desktop user comum pode ver metricas agregadas de zona?
- Desktop profissional/marca pode ver metricas agregadas diferentes?
- Desktop admin deve viver em `apps/crew-admin` ou em entrypoint separado?

### 8. `MapEvent` simples versus `MapEntity` generico

Duvida:

- Criar um modelo generico `MapEntity` agora ou um `MapEvent` especifico?

Recomendacao atual:

- Criar `MapEvent` simples na Onda 1.

Motivo:

- Evita abstracao prematura.
- O codigo atual do mapa tem padroes simples por camada.

Pergunta:

- Quando profissionais/marcas entrarem como markers proprios, qual sera o ponto de migracao para `MapEntity`?

### 9. `events` no `MapLayerState`

Duvida:

- Adicionar `events` como nova key de camada?

Recomendacao atual:

- Sim: `events: false`.

Impacto:

- `mapTypes.ts`
- `mapLayerStorage.ts`
- `LayerRail.tsx`
- `MapStage.tsx`
- CSS `.map-layer-rail`
- testes de storage/rail

Perguntas:

- Nome publico da chip deve ser `Eventos`, `Agenda`, `Rede` ou `Rolês`?
- `events` deve aparecer antes ou depois de `Missões`?

### 10. Testes de sheets e Supabase

Duvida:

- Por que `components/map/__tests__/sheets.test.tsx` trava no ambiente local?

Hipotese:

- `ZoneSheet` renderiza `ZoneLeaderboard`, que chama `useZoneLeaderboard`, que pode tocar Supabase porque `.env` local esta configurado.

Mas:

- Desligar env no comando nao resolveu rapidamente.

Perguntas:

- O travamento vem de Supabase, hook async, happy-dom, cleanup ou outro import?
- Devemos mockar `ZoneLeaderboard` em `sheets.test.tsx`?
- Devemos adicionar prop para desligar ranking em testes?

### 11. Build travando

Duvida:

- Por que `npm run build` ficou preso em `vite build` / `transforming...`?

Hipoteses:

- I/O local instavel.
- PWA/assets/cache.
- Algum processo/lock local.
- Repo grande com `dist`/assets.

Perguntas:

- Build passa em janela limpa?
- Build trava sempre no mesmo ponto?
- `vite build --debug` mostra ultimo modulo?
- `dist` esta ignorado no git?

### 12. Git/index instavel

Duvida:

- Por que `git status --short` falhou com `.git/index: unable to map index file: Operation timed out`?

Impacto:

- Nao da para confiar em diff/status enquanto isso persistir.

Perguntas:

- E problema temporario de I/O/macOS?
- O index esta corrompido?
- Precisa rodar uma checagem nao destrutiva?
- Como confirmar quais arquivos foram tocados pelo build interrompido?

### 13. Secret scan incompleto

Duvida:

- Existe secret ou `service_role` no codigo/bundle?

Achado parcial:

- Arquivos lidos usam `VITE_SUPABASE_PUBLISHABLE_KEY`, nao `service_role`.
- `.env` local tem chaves setadas.
- Scan amplo travou por I/O.

Perguntas:

- `dist` contem Gemini key ou outra env publica?
- Alguma chave server aparece em bundle, console ou localStorage?
- `VITE_GEMINI_API_KEY` deve ser removida de producao?

### 14. Creator e operacao real

Duvida:

- Creator real deve continuar no browser ou migrar para Edge/server?

Recomendacao atual:

- Para operacao real/admin, migrar para Edge/server.
- O fluxo publico atual deve manter demo/local e contrato.

Perguntas:

- Quando `VITE_ENABLE_STUDIO_TOOLS=true`, quem pode abrir credencial real?
- Admin vai apenas ver health/fila ou acionar geracao?
- Como auditar prompt/foto sem expor identidade pessoal?

### 15. `runs` versus `run_logs` - decidido

Decisao:

- `runs` e a fonte canonica para corridas finalizadas.
- `run_logs` vira legado, view temporaria ou sera deprecado/migrado apos inspecao do banco real.

Achado:

- migrations criam `run_logs`;
- `cloudSync.ts` escreve em `runs`;
- `runLogStorage.ts` existe, mas save path atual usa `appendRunRecord` e `pushFinalizedRun`, nao `saveRunLog`.

Investigacao restante:

- Qual tabela existe na producao?
- Existem dados reais em `run_logs` que precisam migrar?
- Uma view temporaria e necessaria para compatibilidade?
- Como redigir rota GPS no schema canonico?

### 16. Admin/security

Duvida:

- Como criar admin sem contaminar player-facing?

Recomendacao atual:

- Futuro `apps/crew-admin` ou bundle/entrypoint separado.
- Edge Functions para acoes privilegiadas.

Perguntas:

- Quem sao os primeiros admins reais?
- Usar `admin_memberships`, `organization_memberships` ou ambos?
- Como travar `user_profiles.organization_id` contra self-update indevido?
- Qual audit log minimo antes de qualquer write admin?

### 17. Privacidade de GPS e leads

Duvida:

- Quais dados marcas/profissionais podem ver?

Recomendacao atual:

- Dados comerciais veem agregados/redigidos.
- Interesse/lead e opt-in.
- Rota GPS bruta nao aparece por padrao.

Perguntas:

- Marca pode ver dominancia por zona em tempo real?
- Marca pode abordar runner individualmente ou so por opt-in?
- Atleta pode ser patrocinado por marca dentro do app antes de pagamento?

## Prompt master para coordenador

Use este prompt para o agente coordenador antes de disparar especialistas:

```text
Voce e o coordenador tecnico-produto do app The Crew Running.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running
Data: 2026-06-04

Objetivo: investigar as duvidas abertas antes de implementar a primeira onda map-centric de Eventos/rede wellness. Nao implementar codigo ainda.

Leia obrigatoriamente:
- apps/crew-running/vault/2026-06-04-map-events-code-audit.md
- apps/crew-running/vault/2026-06-04-map-events-open-questions-agent-prompts.md
- apps/crew-running/vault/2026-06-04-map-events-end-to-end-orchestration-plan.md
- apps/crew-running/vault/2026-06-04-map-centric-events-architecture.md
- apps/crew-running/vault/2026-06-03-map-centric-commerce-interaction-model.md
- apps/crew-running/vault/CREATOR_CONTRACT.md

Travas:
- nao implementar;
- nao mexer no creator;
- nao criar migrations;
- nao expor secrets;
- nao transformar player-facing em dashboard;
- preservar mobile como experiencia gamificada;
- desktop e mapa/rede/metricas/operacao, nao tracking obrigatório.

Tarefa:
1. Consolidar as respostas dos agentes especialistas.
2. Separar decisoes tomadas, decisoes pendentes e bloqueios reais.
3. Produzir um plano final de Onda 0 e Onda 1 com arquivos, testes e criterios de aceite.
4. Apontar qualquer investigacao que precise de acesso ao banco real Supabase.

Entregavel:
- markdown com decisao recomendada;
- tabela de duvidas -> resposta -> evidencia -> impacto;
- plano de execucao sem implementacao.
```

## Prompt para agente Produto/UX mapa

```text
Voce e especialista em produto, UX de mapas e redes locais para wellness/running.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running

Objetivo: responder as duvidas de produto sobre a primeira camada comercial/social do mapa.
Nao implementar codigo.

Leia:
- apps/crew-running/vault/2026-06-04-map-events-open-questions-agent-prompts.md
- apps/crew-running/vault/2026-06-03-map-centric-commerce-interaction-model.md
- apps/crew-running/vault/2026-06-04-map-centric-events-architecture.md
- apps/crew-running/DESIGN.md
- apps/crew-running/GAME_UI_TEMPLATE.md

Investigue e responda:
1. Comecar por Eventos ou Perfis Profissionais?
2. Qual CTA MVP: Tenho interesse, Pedir contato ou Salvar evento?
3. Como profissionais, marcas, lojas, atletas e criadores aparecem no mapa sem poluir o game?
4. Qual nomenclatura publica da camada: Eventos, Agenda, Rede ou outra?
5. Desktop user comum deve abrir em qual composicao: mapa + perfil, mapa + rede, mapa + metricas?
6. Quais interacoes ficam bloqueadas ate backend?

Entregavel:
- recomendacao objetiva;
- wireframe textual do fluxo do usuario;
- lista do que aparece no mapa na Onda 1;
- lista do que fica fora;
- copy sugerida sem linguagem SaaS/dashboard.
```

## Prompt para agente Frontend/Mapa

```text
Voce e especialista em React, MapLibre e testes frontend.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running

Objetivo: investigar a implementacao futura de uma camada `events` sem escrever codigo agora.

Leia:
- apps/crew-running/vault/2026-06-04-map-events-code-audit.md
- apps/crew-running/components/map/MapStage.tsx
- apps/crew-running/components/map/MapLibreCanvas.tsx
- apps/crew-running/components/map/LayerRail.tsx
- apps/crew-running/components/map/mapTypes.ts
- apps/crew-running/services/mapLayerStorage.ts
- apps/crew-running/components/map/ZoneSheet.tsx
- apps/crew-running/components/map/MapBottomSheet.tsx
- apps/crew-running/index.css
- apps/crew-running/components/map/__tests__/LayerRail.test.tsx
- apps/crew-running/components/map/__tests__/MapStage.test.tsx
- apps/crew-running/components/map/__tests__/sheets.test.tsx
- apps/crew-running/services/mapLayerStorage.test.ts

Investigue e responda:
1. Lista exata de arquivos a editar para Onda 1.
2. Forma mais segura de adicionar `events` em `MapLayerState` e storage backward-compatible.
3. Como renderizar marker de evento em `MapLibreCanvas` sem quebrar missões/live.
4. Como abrir `EventSheet` a partir de marker e de `ZoneSheet`.
5. Como esconder eventos durante `trackerActive`.
6. Quais testes unitarios devem existir.
7. Como evitar fragilidade de MapLibre nos testes.
8. Por que `sheets.test.tsx` pode travar e como corrigir antes de adicionar evento ao sheet.

Entregavel:
- plano tecnico de edicao, arquivo por arquivo;
- matriz de risco frontend;
- proposta de seletores/testes;
- comandos de validacao.
```

## Prompt para agente Dados/Supabase

```text
Voce e especialista em Supabase, Postgres, RLS e sync multi-tenant.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running

Objetivo: investigar o drift de schema e desenhar precondicoes para cloud/admin. Nao aplicar migrations.

Leia:
- apps/crew-running/vault/2026-06-04-map-events-code-audit.md
- apps/crew-running/supabase/migrations/000_user_profiles.sql
- apps/crew-running/supabase/migrations/001_map_enhancements.sql
- apps/crew-running/services/supabaseTypes.ts
- apps/crew-running/services/cloudSync.ts
- apps/crew-running/services/orgContext.ts
- apps/crew-running/services/supabaseClient.ts
- apps/crew-running/hooks/useLeaderboard.ts
- apps/crew-running/services/runLogStorage.ts
- apps/crew-running/services/storage.ts

Investigue e responda:
1. Qual drift local existe entre migrations, types e codigo?
2. Como executar com seguranca a decisao `runs` canonico / `run_logs` legado?
3. Quais tabelas faltam em migrations se `supabaseTypes.ts` for fonte atual?
4. Quais policies RLS atuais sao inseguras ou incompletas?
5. Como travar `user_profiles.organization_id` contra troca pelo proprio usuario?
6. Qual schema minimo futuro para eventos/leads sem pagamento?
7. Quais consultas exigem `organization_id`?
8. O que precisa ser verificado no banco real antes de qualquer migration?

Entregavel:
- tabela schema: entidade, existe em migration, existe em types, codigo escreve/le, risco, acao;
- plano de compatibilidade/migracao para `runs` canonico e `run_logs` legado;
- lista de migrations futuras, sem SQL final;
- checklist para inspecao do banco real.
```

## Prompt para agente Seguranca/Admin

```text
Voce e especialista em seguranca de apps multi-tenant, Supabase Auth, RLS e admin operations.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running

Objetivo: investigar como proteger futuro admin, leads, GPS, fotos e creator ops. Nao implementar.

Leia:
- apps/crew-running/vault/2026-06-04-map-events-open-questions-agent-prompts.md
- apps/crew-running/vault/2026-06-03-admin-dashboard-architecture-plan.md
- apps/crew-running/services/supabaseClient.ts
- apps/crew-running/services/orgContext.ts
- apps/crew-running/services/storage.ts
- apps/crew-running/services/activeRunStorage.ts
- apps/crew-running/services/cloudSync.ts
- apps/crew-running/components/ApiKeyModal.tsx
- apps/crew-running/services/crewService.ts

Investigue e responda:
1. Qual modelo de roles recomendado: `admin_memberships`, `organization_memberships`, ambos ou claims auxiliares?
2. O que nunca deve ser decidido via `user_metadata`?
3. Quais operacoes precisam de Edge/server?
4. Qual audit log minimo antes de qualquer write admin?
5. Como redigir rota GPS, email, foto, radio messages e friend notes?
6. Como evitar que creator/Gemini key rode como operacao real no browser?
7. Como testar que secrets nao aparecem no bundle/localStorage/console?

Entregavel:
- threat model resumido;
- matriz dado -> risco -> redacao -> permissao;
- modelo de roles/capabilities;
- lista de Edge Functions futuras;
- criterios de aceite de seguranca.
```

## Prompt para agente QA/Build/DevEx

```text
Voce e especialista em QA, Vitest, Vite, Playwright e diagnostico de ambiente local.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running

Objetivo: investigar instabilidades da ultima rodada e criar baseline confiavel antes da implementacao.
Nao implementar feature.

Evidencias:
- `git status --short` falhou com `.git/index: unable to map index file: Operation timed out`.
- `npm run build` travou em `vite build` / `transforming...`.
- `sheets.test.tsx` travou.
- `npx tsc --noEmit --pretty false --incremental false` passou.
- testes puros de dados/storage passaram.
- `LayerRail.test.tsx` passou isolado.

Investigue e responda:
1. O `git index` esta temporariamente lento ou corrompido?
2. Como verificar worktree sem comandos destrutivos?
3. `dist` foi modificado pelo build interrompido e e ignorado?
4. Por que `build` trava?
5. Qual modulo o Vite esta transformando quando trava?
6. Por que `sheets.test.tsx` trava?
7. Como isolar Supabase/env em testes?
8. Qual sequencia de comandos e mais confiavel para futuras ondas?

Entregavel:
- diagnostico com comandos e resultados;
- lista de ajustes de teste/setup recomendados;
- baseline de validacao curto e baseline completo;
- riscos para CI/deploy.
```

## Prompt para agente Creator/Ops

```text
Voce e especialista no Runner Creator do The Crew Running.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running

Objetivo: investigar somente riscos operacionais do creator para futuro admin. Nao alterar creator.

Leia obrigatoriamente:
- apps/crew-running/vault/CREATOR_CONTRACT.md
- apps/crew-running/scripts/check-creator-contract.mjs
- apps/crew-running/services/crewService.ts
- apps/crew-running/components/creator/RunnerCreatorTabs.tsx
- apps/crew-running/components/ApiKeyModal.tsx
- apps/crew-running/services/storage.ts
- apps/crew-running/services/runtimeFlags.ts

Travas:
- nao restaurar StylePicker;
- nao usar public/styles;
- nao criar slot hair;
- nao trocar crew-pace por crew-flow;
- manter TESTAR LOCAL;
- nao copiar face real.

Investigue e responda:
1. O fluxo ativo chama Gemini real ou so demo local?
2. Em quais flags/chaves o caminho real pode ser habilitado?
3. Quais riscos existem em `VITE_GEMINI_API_KEY` e `crew.gemini_api_key`?
4. Como um admin futuro deve ver health/fila do creator sem expor fotos?
5. Quais dados de geracao podem ser auditados sem PII?
6. O que precisa migrar para Edge/server antes de operacao real?

Entregavel:
- mapa do fluxo creator atual;
- riscos de segredo/PII;
- proposta de creator ops read-only;
- criterios de aceite para nao violar o contrato.
```

## Prompt para agente Comercial/Wellness Network

```text
Voce e especialista em marketplace/wellness network, eventos, patrocinio e monetizacao sem pagamento no MVP.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running

Objetivo: investigar como estruturar profissionais, marcas, atletas, eventos e leads em ondas. Nao implementar.

Leia:
- apps/crew-running/vault/2026-06-03-map-centric-commerce-interaction-model.md
- apps/crew-running/vault/2026-06-03-desktop-wellness-network-decision-matrix.md
- apps/crew-running/vault/2026-06-04-map-centric-events-architecture.md
- apps/crew-running/vault/2026-06-04-map-events-open-questions-agent-prompts.md

Investigue e responda:
1. Quais setores wellness entram no MVP e quais ficam depois?
2. Como profissional-corredor aparece sem duplicar conta?
3. Como marcas descobrem atletas sem violar privacidade?
4. Como patrocinio de atleta deveria funcionar sem pagamento no MVP?
5. Como eventos criados por lojas/profissionais aparecem no mapa?
6. Que dados agregados marcas podem ver?
7. Quais sinais de interesse viram lead futuro?
8. Onde entram produtos, publicidade e comissao em ondas futuras?

Entregavel:
- taxonomia de roles/setores;
- jornada atleta/profissional/marca/event creator;
- modelo de lead sem pagamento;
- limites de privacidade/compliance;
- plano de monetizacao futura em ondas.
```

## Prompt para agente Social/Moderacao

```text
Voce e especialista em social product, moderacao e privacidade.

Repo: /Users/belissima/Desktop/running crew
App: apps/crew-running

Objetivo: investigar como a rede social/wellness convive com o mapa sem vanity metrics e sem spam.
Nao implementar.

Leia:
- apps/crew-running/vault/2026-05-28-voce-tab-f1-refactor-blueprint.md
- apps/crew-running/data/identityEvents.ts
- apps/crew-running/data/friends.ts
- apps/crew-running/data/crewRadio.ts
- apps/crew-running/data/friendNotes.ts
- apps/crew-running/services/storage.ts
- apps/crew-running/hooks/useFriends.ts
- apps/crew-running/hooks/useCrewRadio.ts
- apps/crew-running/components/voce/*
- apps/crew-running/components/map/CrewRadioOverlay.tsx

Investigue e responda:
1. Como eventos/profissionais entram no feed sem likes/followers/views?
2. O que pode aparecer no mapa social?
3. Como evitar spam de marca/profissional?
4. Que denuncia/remocao/moderacao e minima antes de cloud?
5. Radio/mural precisa de TTL por tipo de perfil?
6. Friend notes nunca devem ser visiveis para terceiros?
7. Como QR/NFC friend exchange se conecta a perfis profissionais?

Entregavel:
- regras sociais;
- matriz conteudo -> visibilidade -> TTL -> moderacao;
- riscos de abuso;
- MVP social read-only/local versus cloud.
```

## Como usar estes prompts

Ordem recomendada:

1. QA/Build/DevEx
2. Frontend/Mapa
3. Dados/Supabase
4. Seguranca/Admin
5. Produto/UX mapa
6. Comercial/Wellness Network
7. Social/Moderacao
8. Creator/Ops
9. Coordenador consolida tudo

Motivo:

- Sem baseline local, qualquer conclusao de teste fica fraca.
- Sem mapa/frontend, nao sabemos custo real da Onda 1.
- Sem schema/security, nao devemos planejar admin/cloud writes.
- Produto/comercial/social refinam a experiencia depois que os limites tecnicos estao claros.

## Entregavel final esperado dos agentes

Um unico markdown consolidado com:

- decisoes recomendadas;
- duvidas ainda abertas;
- evidencias por arquivo/comando;
- plano Onda 0;
- plano Onda 1;
- arquivos a editar;
- testes a criar/ajustar;
- validacoes;
- riscos;
- perguntas bloqueantes para decisao humana.
