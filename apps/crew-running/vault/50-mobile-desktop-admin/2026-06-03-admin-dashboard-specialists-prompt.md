# Admin Dashboard - mapa de necessidades e prompt para especialistas

Data: 2026-06-03
App: `apps/crew-running`
Objetivo deste arquivo: preparar um briefing para especialistas criarem o plano de um dashboard interno de administracao do app. Isto nao e uma autorizacao para implementar ainda.

## Resumo

Precisamos de um dashboard interno para administrar The Crew Running como operacao real: usuarios, organizacoes, Auth, creator, crews, mapa, corridas, gamificacao, sede, social, sync, QA e deploy.

Esse dashboard deve ser uma superficie administrativa protegida. Ele nao pode contaminar a experiencia publica do jogador, que deve continuar parecendo um jogo de corrida urbana, nao uma ferramenta SaaS.

URLs de referencia atuais:

- Producao Vercel: `https://crew-running.vercel.app`
- Dominio customizado: `https://crew.axialagents.com`
- Release validada no mapa 2D: `https://crew.axialagents.com/?release=DT8CVAt9`

Estado recente de Auth:

- Login real via Supabase esta ativo em producao.
- Signup real funciona, mas Supabase pode exigir confirmacao por email antes do login.
- Em build de producao, `VITE_REQUIRE_AUTH` cai para `true` por padrao.
- O client usa `VITE_SUPABASE_PUBLISHABLE_KEY`; qualquer operacao admin privilegiada precisa ficar em server/edge, nunca no browser.

## Planos verificados

1. `IMPLEMENTATION_ORCHESTRATION_PLAN.md`
   - Contrato original: fluxo publico de jogo ate criacao/salvamento do runner.
   - O player-facing nao deve mostrar linguagem de `dashboard`, `API KEY`, `MVP`, `GPS obrigatorio` ou ranking cedo.
   - Observacao: ha texto antigo citando `Crew Flow` / `crew-flow`; isso esta stale. O contrato atual e `Crew Pace` / `crew-pace`.

2. `DESIGN.md`
   - O app publico deve evitar cards SaaS, widgets de dashboard e paineis admin-style.
   - Dashboard admin deve ser interno, separado do visual player-facing.

3. `vault/CREATOR_CONTRACT.md`
   - Fonte de verdade para creator.
   - Geracao visual travada pela crew escolhida no onboarding.
   - Usa apenas `public/crews/{selectedCrewSlug}/` via `CrewRenderContext`.
   - Nunca usar `public/styles/*`.
   - Nao restaurar `StylePicker`, `data/styles.ts`, selecao publica de estilo ou slot `hair`.
   - Slots validos: `top`, `bottom`, `shoes`, `accessory`.
   - Runner types canonicos: `sprint`, `long-run`, `night-run`, `crew-pace`, `urban-trail`.
   - `TESTAR LOCAL` deve continuar disponivel.

4. `vault/2026-05-28-sprint-close-multi-tenant-plan.md`
   - Modelo multi-tenant: `user_profiles` mapeia `auth.uid()` para `organization_id`.
   - Org default MVP: `00000000-0000-0000-0000-000000000001` / `axial-sp`.
   - Regra de produto: `organization_id` em toda query CRUD que mexe com dados compartilhados.

5. `vault/2026-06-03-gamificacao-mapa-2d-map.md`
   - Mapa 2D e a superficie principal da gamificacao.
   - Real e ativo: GPS real, distancia/tempo/pace, trail, spots, XP, streak, tinta, heatmap, badges principais e sync final.
   - Parcial: missoes aparecem, mas aceite/abandono ainda nao esta ligado ao painel principal; `isInvasion=false`; XP de missao nao soma no XP real; `Historia` esta desabilitada.

6. `vault/2026-05-28-gps-tracker-and-polish-design.md`
   - GPS real substitui simulacao.
   - Existe privacidade explicita: corrida ativa com coordenadas fica no browser e so deve sincronizar payload finalizado.

7. `vault/2026-05-28-gamification-ui-implementation-plan.md`
   - Roadmap de leaderboard, quest progress, feed social, decay e GPX.
   - Badges `local-legend`, `pace-setter`, `season-captain` dependem de ranking/leaderboard real.

8. `vault/2026-05-28-sede-da-crew-spec.md`
   - Sede da Crew tem 7 salas MVP: sponsors, medalhas, patentes, ranking, trofeus, mural e roster.
   - Monetizacao/sponsor tem regras fortes de compliance para fase futura.

9. `vault/2026-05-28-voce-tab-f1-refactor-blueprint.md`
   - Feed de identidade e local-first via `crew.identity_events`.
   - Bloqueio de vanity metrics: sem follower count, likes, views ou pressao social falsa.

## Alertas tecnicos

### 1. Schema drift precisa ser mapeado antes de UI

As migrations locais atuais cobrem:

- `organizations`
- `user_profiles`
- `zone_leaderboard`
- `run_logs`
- `territory_snapshots`
- `user_preferences`

Mas `services/supabaseTypes.ts` e `services/cloudSync.ts` tambem referenciam:

- `runs`
- `runner_progress`
- `run_history_stats`
- `badge_unlocks`
- `runners`
- `identity_events`
- `friends`
- `crew_radio`
- `map_layer_settings`

O codigo de sync atual escreve em `runs`, `runner_progress`, `run_history_stats` e `badge_unlocks`, enquanto a migration `001_map_enhancements.sql` cria `run_logs`, nao `runs`. O primeiro trabalho dos especialistas e reconciliar a fonte de verdade: migrations, banco real, tipos gerados e codigo cliente.

### 2. Admin nao pode viver so no client

O app e Vite/React. Um painel `/admin` dentro do mesmo bundle so pode usar permissao de usuario autenticado. Para acoes privilegiadas, usar uma camada server-side:

- Supabase Edge Functions, ou
- Vercel Serverless Functions/API backend, ou
- um app admin separado com backend proprio.

Nunca expor `service_role` ou secret key em `VITE_*`, client bundle, localStorage ou console.

### 3. Autorizacao precisa de fonte confiavel

Nao usar `user_metadata` para decidir admin. Em Supabase, metadata editavel pelo usuario nao deve controlar autorizacao.

Opcoes a decidir:

- `app_metadata.role` / custom claims para admin, sabendo que JWT pode ficar stale ate refresh.
- tabela server-checked `admin_memberships` / `organization_memberships`.
- politicas RLS com ownership por `organization_id` e operacoes privilegiadas via function/server.

### 4. Privacidade de GPS

`crewActiveRun` guarda coordenadas da corrida em andamento no localStorage. O dashboard nao deve exibir rota pessoal bruta por padrao. Para operacao e QA, preferir:

- status de sync,
- totais agregados,
- zona/spot tocado,
- rota redigida/blurred,
- acesso a rota completa so com permissao admin explicita e motivo/audit log.

### 5. Creator e identidade visual

Dashboard pode administrar fila/saude/assets do creator, mas nao pode permitir inputs que violem o contrato:

- sem estilo publico,
- sem copiar face exata,
- sem misturar assets de outras crews,
- sem slot `hair`,
- sem trocar `crew-pace` por `crew-flow`.

## Inventario de dados e superficies

### Auth, usuarios e orgs

- Supabase Auth: email/password com confirmacao opcional.
- Client hook: `hooks/useSupabaseSession.ts`.
- Supabase client: `services/supabaseClient.ts`.
- Org context: `services/orgContext.ts`, com `DEFAULT_ORG_ID`.
- Tabelas planejadas/ativas: `organizations`, `user_profiles`.

Necessidades admin:

- usuarios por status: confirmado, pendente, bloqueado, ativo.
- perfil e org vinculada.
- roles e permissoes admin.
- convites/reenvio de confirmacao/reset de senha via server.
- auditoria de sign-in, sign-out e troca de org.

### Creator / Runner Studio

Arquivos centrais:

- `components/creator/RunnerCreatorTabs.tsx`
- `components/CustomizeScreen.tsx`
- `services/crewService.ts`
- `data/crewRenderContext.ts`
- `data/runnerTypes.ts`
- `data/wardrobe.ts`
- `vault/CREATOR_CONTRACT.md`

Necessidades admin:

- saude de geracao Gemini/API.
- taxa de sucesso/erro/quota.
- historico de geracoes por usuario sem expor fotos privadas desnecessariamente.
- validacao de assets por crew.
- QA do `TESTAR LOCAL`.
- bloqueio de prompts/inputs fora do contrato.

### Crews e assets

Fonte atual:

- `data/crews.ts`
- assets em `public/crews/{slug}/`
- wardrobe em `public/wardrobe/**`

Crews atuais:

- `downtown-rush`
- `north-breakers`
- `south-striders`
- `east-burners`
- `west-flow`

Necessidades admin:

- inventario de assets faltantes ou quebrados por crew.
- preview de badge/banner/leader/marker/mission_card/pattern/share_card.
- status de crew ativa/bloqueada.
- manutencao de copy operacional sem mudar a linguagem player-facing sem revisao.

### Mapa, gamificacao e corridas

Arquivos centrais:

- `components/map/MapStage.tsx`
- `components/map/MapLibreCanvas.tsx`
- `components/map/RunHud.tsx`
- `components/map/RunSummary.tsx`
- `services/runTracker.ts`
- `services/activeRunStorage.ts`
- `services/runLogStorage.ts`
- `services/cloudSync.ts`
- `data/gamification.ts`
- `data/missions.ts`

Persistencia local:

- `crewActiveRun`
- `crewRunLogs`
- `crewRunnerProgress`
- `crewMapLayers`
- `crew.run_records`
- `crew.run_history_stats`
- `crew.active_missions`
- `crew.completed_missions`
- `crew.run_diary`

Necessidades admin:

- status de corridas finalizadas e sync.
- runs com erro de sync e motivos.
- totais agregados por org, crew, zona e semana.
- leaderboard por zona/semana.
- progresso de XP, level, streak, ink e badges.
- missoes aceitas/completadas/expiradas.
- detector de gaps: missoes sem UI de aceite, `isInvasion` fixo, XP de missao fora do XP real, `Historia` desabilitada.

### Sede da Crew e sponsors

Plano fonte: `vault/2026-05-28-sede-da-crew-spec.md`.

Necessidades admin:

- salas da sede por crew.
- sponsor principal e categorias.
- mural feed e posts marcados `PUBLI`.
- roster e patentes.
- ranking semanal/temporada.
- compliance de sponsor: menores, categorias banidas, labels de publicidade, opt-out.

### Social / Voce

Arquivos centrais:

- `data/identityEvents.ts`
- `data/friends.ts`
- `data/crewRadio.ts`
- `services/storage.ts`
- `hooks/useFriends.ts`
- `components/voce/*`

Persistencia local:

- `crew.identity_events`
- `crew.friends`
- `crew.crew_radio`
- `crew.self_user_id`
- `crew.friend_notes`

Tipos em Supabase planejados:

- `identity_events`
- `friends`
- `crew_radio`

Necessidades admin:

- moderacao de radio/mural.
- expiracao/TTL de radio.
- suporte a denuncia/remocao.
- relatorio sem likes/followers/views.
- integridade de friend exchange QR/NFC.

### Operacao, QA e deploy

Necessidades admin:

- status de deploy atual e envs obrigatorias.
- checagem de Supabase configurado.
- health de Auth e sync.
- health de PWA/service worker.
- asset integrity por crew.
- resultados de Playwright smoke.
- funil: auth -> onboarding -> crew selected -> runner saved -> map opened -> run saved -> cloud sync ok.

## Modulos recomendados do dashboard

1. Overview / Health
   - auth, Supabase, deploy, env, sync queue, erros recentes.

2. Users & Orgs
   - usuarios, orgs, roles, confirmacao, convites, resets, auditoria.

3. Creator Studio Ops
   - geracoes, quota/API, falhas, assets por crew, smoke `TESTAR LOCAL`, seguranca de prompt.

4. Crew & Content Admin
   - crews, assets, wardrobe, runner types, copy controlada e flags de crew.

5. Map & Gamification Ops
   - zonas, spots, missoes, XP, ink, badges, leaderboards, history layer.

6. Runs & Sync
   - corridas, rotas redigidas, sync pendente/falhou, privacidade e export/debug.

7. Sede Admin
   - salas, sponsors, mural, roster, patentes, ranking, compliance.

8. Social Moderation
   - identity events, friends, crew radio, denuncias, expiracao e notas.

9. QA & Release
   - smoke tests, screenshots, build/typecheck, contract checks, release notes.

10. Audit Log
   - toda acao administrativa: quem fez, quando, em qual org, antes/depois e motivo.

## Decisoes em aberto para os especialistas

1. Dashboard no mesmo app em `/admin` ou app separado `apps/crew-admin`?
2. Se for no mesmo app, como evitar que codigo/estilo admin vaze para o player-facing?
3. Qual fonte de roles admin: `app_metadata`, tabela `admin_memberships`, tabela `organization_memberships` ou ambos?
4. Qual backend para privilegios: Supabase Edge Functions, Vercel Functions ou servidor separado?
5. Quais tabelas existem no banco real hoje e quais migrations faltam no repo?
6. Como executar com seguranca a decisao `runs` canonico / `run_logs` legado?
7. Conteudo code-backed (`data/crews.ts`, `data/wardrobe.ts`) sera editado no admin ou apenas auditado e alterado via PR?
8. Dashboard pode ver rotas GPS brutas? Em quais condicoes e com qual redacao/audit log?
9. Como redigir PII: fotos, emails, nomes, coordenadas, friend notes, radio messages?
10. Quais acoes admin sao MVP e quais ficam read-only na primeira onda?

## Prompt pronto para especialistas

```text
Vocês são uma equipe especialista em arquitetura de produto, Supabase, segurança multi-tenant, UX operacional e QA. Precisamos criar o plano de um dashboard interno para administrar o app The Crew Running.

Contexto:
- Repo: /Users/belissima/Desktop/running crew
- App: apps/crew-running
- Produção: https://crew-running.vercel.app
- Domínio customizado: https://crew.axialagents.com
- O app público é uma experiência de jogo de corrida urbana. Não transformar o player-facing em SaaS/dashboard.
- Login real via Supabase já está ativo em produção. Signup pode exigir confirmação por email.

Antes de propor UI, auditem estes arquivos:
- apps/crew-running/DESIGN.md
- apps/crew-running/IMPLEMENTATION_ORCHESTRATION_PLAN.md
- apps/crew-running/GAME_UI_TEMPLATE.md
- apps/crew-running/vault/CREATOR_CONTRACT.md
- apps/crew-running/vault/2026-05-28-sprint-close-multi-tenant-plan.md
- apps/crew-running/vault/2026-06-03-gamificacao-mapa-2d-map.md
- apps/crew-running/vault/2026-05-28-gps-tracker-and-polish-design.md
- apps/crew-running/vault/2026-05-28-gamification-ui-implementation-plan.md
- apps/crew-running/vault/2026-05-28-sede-da-crew-spec.md
- apps/crew-running/vault/2026-05-28-voce-tab-f1-refactor-blueprint.md
- apps/crew-running/supabase/migrations/*.sql
- apps/crew-running/services/supabaseTypes.ts
- apps/crew-running/services/supabaseClient.ts
- apps/crew-running/services/orgContext.ts
- apps/crew-running/services/cloudSync.ts
- apps/crew-running/services/storage.ts
- apps/crew-running/services/launchStorage.ts
- apps/crew-running/services/activeRunStorage.ts
- apps/crew-running/services/runLogStorage.ts
- apps/crew-running/services/runnerProgressStorage.ts
- apps/crew-running/services/crewService.ts
- apps/crew-running/data/crews.ts
- apps/crew-running/data/runnerTypes.ts
- apps/crew-running/data/wardrobe.ts
- apps/crew-running/data/gamification.ts
- apps/crew-running/data/missions.ts
- apps/crew-running/data/identityEvents.ts
- apps/crew-running/data/friends.ts
- apps/crew-running/data/crewRadio.ts

Travas não negociáveis:
- Admin é interno e protegido. Não expor service_role, secret keys ou operações privilegiadas no browser.
- Não usar user_metadata como fonte de autorização.
- Respeitar RLS e multi-tenant por organization_id.
- Se uma operação exige privilégio, ela precisa passar por server/edge.
- Preservar o visual e copy do app público como jogo, não dashboard SaaS.
- Respeitar CREATOR_CONTRACT: sem public/styles/*, sem StylePicker, sem slot hair, sem copiar identidade real, geração travada pela crew selecionada, runner types exatos e crew-pace como coletivo.
- Dados GPS, foto e identidade pessoal devem ser redigidos por padrão.
- A primeira entrega deve ser um plano/arquitetura, não implementação direta.

Auditoria obrigatória:
1. Mapear schema real versus migrations versus supabaseTypes versus código.
2. Aplicar a decisao de `runs` canonico e `run_logs` legado: o que existe no banco, o que o client escreve e qual migracao/view/deprecacao e segura.
3. Mapear todas as entidades locais crew.* em localStorage e o que já sincroniza ou deveria sincronizar com Supabase.
4. Mapear os domínios admin: Auth/Orgs, Creator, Crews/Assets, Map/Gamification, Runs/Sync, Sede/Sponsors, Social/Moderation, QA/Release, Audit Log.
5. Definir quais módulos são read-only na Onda 1 e quais podem executar ações.
6. Definir arquitetura: mesmo app em /admin, app separado apps/crew-admin, Supabase Edge Functions, Vercel Functions ou servidor dedicado.
7. Definir modelo de roles e RLS sem usar metadata editável pelo usuário.
8. Definir política de privacidade para emails, fotos, nomes, rotas GPS, mensagens e friend notes.

Entregáveis esperados:
- PRD do dashboard admin.
- Arquitetura técnica com fronteira client/server/edge.
- Inventário de dados com tabela/campo/fonte/localização/risco/ação.
- Modelo de permissões e audit log.
- Plano em ondas, com Onda 0 de schema/auth/admin-security antes da UI.
- Wireframe textual ou mapa de navegação dos módulos.
- Lista de migrations necessárias e funções server/edge necessárias.
- Critérios de aceite e comandos de validação.
- Lista de riscos e perguntas bloqueantes.

Validações mínimas ao final de qualquer implementação futura:
- cd apps/crew-running && npm run typecheck
- cd apps/crew-running && npm run build
- cd apps/crew-running && npm run test -- --pool=threads --maxWorkers=1
- Se tocar creator: cd apps/crew-running && npm run validate
- Teste browser do fluxo admin com usuário sem admin, admin de org e sessão expirada.
- Teste de que service_role/secret não aparece no bundle, env pública, console ou localStorage.

Não implementem ainda. Primeiro devolvam o mapa, arquitetura, riscos, decisões e plano de ondas.
```

## Onda sugerida

### Onda 0 - Verdade de dados e seguranca

- Inspecionar banco real.
- Reconciliar migrations, `supabaseTypes.ts` e codigo.
- Definir roles/admin memberships.
- Definir server/edge boundary.
- Criar modelo de audit log.
- Definir redacao de PII.

### Onda 1 - Admin read-only

- Overview/health.
- Users/orgs read-only.
- Runs/sync read-only com rotas redigidas.
- Creator ops read-only.
- Asset integrity por crew.

### Onda 2 - Operacoes controladas

- Reenvio de confirmacao/reset via server.
- Ajuste de org/role com audit log.
- Moderacao radio/mural.
- Reprocessar sync falhado.
- Toggling de flags de conteudo via tabela controlada.

### Onda 3 - Conteudo e gamificacao

- Missoes, zones, leaderboard, badges e Sede.
- Sponsors/compliance.
- Export de relatorios.
- QA de release e smoke automatizado.

## Criterio de pronto para o briefing

O briefing esta pronto quando um especialista consegue responder:

- quais dados administrar,
- onde esses dados existem,
- quais dados ainda estao em drift,
- quais permissoes sao necessarias,
- quais acoes precisam de backend,
- como proteger GPS/fotos/mensagens,
- qual primeira onda deve ser implementada sem quebrar o app publico.
