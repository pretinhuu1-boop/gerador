# Admin Dashboard Architecture Plan

Data: 2026-06-03
App: `apps/crew-running`
Status: planejamento e auditoria local. Nenhuma implementacao de UI/backend foi feita.

## Clarificacao 2026-06-06

- Desktop usuario/rede nao e a mesma superficie que painel operacional.
- `apps/crew-running` continua sendo o app player/mobile/game.
- Site publico, desktop de usuario/rede e painel operacional devem permanecer
  superficies separadas por padrao.
- A recomendacao atual para painel operacional e um app separado, como
  `apps/crew-admin`, para evitar privilegios e ferramentas internas no bundle
  player-facing.
- O nao-objetivo "Nao criar `apps/crew-admin`" abaixo valeu para esta entrega
  de planejamento/auditoria de 2026-06-03; nao e proibicao permanente.

## Escopo

Este plano transforma o briefing `vault/2026-06-03-admin-dashboard-specialists-prompt.md` em uma arquitetura inicial para um dashboard interno de administracao do The Crew Running.

Objetivo: administrar usuarios, organizacoes, Auth, creator, crews/assets, mapa, corridas, gamificacao, sede, social, wellness network, sync, QA e deploy sem contaminar a experiencia publica do jogador.

Decisao de produto adicionada em 2026-06-03:

- Mobile/rua continua sendo o contexto natural de corrida, GPS e tracking.
- Desktop nao deve tentar ser uma tela para "correr"; por isso o mapa no desktop vira superficie de metricas, dados, territorio, progresso e rede.
- O primeiro momento da experiencia desktop deve priorizar area do usuario + rede social, nao painel operacional frio.
- A rede social deve nascer ao redor de running, mas aceitar usuarios/setores de wellness que casem com corrida: treinamento, fisioterapia, nutricao, recovery, saude mental, eventos, marcas locais, clubes, assessorias e parceiros.
- Uma mesma pessoa pode ser runner e profissional ao mesmo tempo: exemplo, personal trainer que tambem corre e aparece no mapa/rede como atleta + profissional.
- Perfis comerciais podem patrocinar atletas, criar eventos locais, promover produtos/servicos e ativar regioes da cidade.
- O produto e multi-thread: mobile e experiencia gamificada de rua; desktop e operacional, social, dados, parcerias e crescimento de ecossistema.
- O dashboard/admin interno deve administrar essa rede e seus dados sem transformar o player-facing em SaaS.

Nao-objetivos desta entrega:

- Nao criar rota `/admin`.
- Nao criar `apps/crew-admin`.
- Nao criar migrations.
- Nao tocar no creator.
- Nao alterar copy ou UI player-facing.
- Nao acessar rotas GPS brutas por padrao.
- Nao forcar tracking/corrida no desktop; desktop trabalha com dados, metricas, comunidade e administracao.

## Auditoria Local

Arquivos verificados nesta rodada:

- `DESIGN.md`
- `GAME_UI_TEMPLATE.md`
- `IMPLEMENTATION_ORCHESTRATION_PLAN.md`
- `vault/CREATOR_CONTRACT.md`
- `vault/2026-05-28-sprint-close-multi-tenant-plan.md`
- `vault/2026-06-03-gamificacao-mapa-2d-map.md`
- `vault/2026-05-28-gps-tracker-and-polish-design.md`
- `vault/2026-05-28-gamification-ui-implementation-plan.md`
- `vault/2026-05-28-sede-da-crew-spec.md`
- `vault/2026-05-28-voce-tab-f1-refactor-blueprint.md`
- `supabase/migrations/*.sql`
- `services/supabaseTypes.ts`
- `services/supabaseClient.ts`
- `services/orgContext.ts`
- `services/cloudSync.ts`
- `services/storage.ts`
- `services/launchStorage.ts`
- `services/activeRunStorage.ts`
- `services/runLogStorage.ts`
- `services/runnerProgressStorage.ts`
- `services/syncQueue.ts`
- `hooks/useSupabaseSession.ts`
- `hooks/useLeaderboard.ts`
- `hooks/useMissions.ts`
- `hooks/useRunController.ts`
- `components/map/MapStage.tsx`
- `components/map/MapMissionPanel.tsx`
- `data/crews.ts`
- `data/crewRenderContext.ts`
- `data/runnerTypes.ts`
- `data/wardrobe.ts`
- `data/gamification.ts`
- `data/missions.ts`
- `data/identityEvents.ts`
- `data/friends.ts`
- `data/crewRadio.ts`
- `data/sedeRooms.ts`
- `vercel.json`
- `vite.config.ts`
- `.env.example`

Nao foi possivel auditar o banco real nesta rodada:

- `supabase/.temp` so contem `cli-latest`.
- Nao ha `supabase/config.toml` nem `project-ref` local.
- Supabase CLI local: `2.75.0`; a CLI avisou que existe versao `2.104.0`.

Conclusao: a Onda 0 deve comecar com inspecao read-only do projeto Supabase real via MCP/CLI autenticado antes de qualquer UI admin.

## Achados Principais

1. O arquivo de briefing ja existe:
   `apps/crew-running/vault/2026-06-03-admin-dashboard-specialists-prompt.md`.

2. O drift `runs` versus `run_logs` e real:
   - migrations criam `run_logs`;
   - `services/supabaseTypes.ts` declara `runs`;
   - `services/cloudSync.ts` escreve em `runs`;
   - `services/runLogStorage.ts` existe, mas o fluxo atual de save usa `appendRunRecord()` e `pushFinalizedRun()`, nao `saveRunLog()`.

3. `supabaseTypes.ts` tambem declara tabelas sem migration local:
   `runner_progress`, `run_history_stats`, `badge_unlocks`, `runners`, `identity_events`, `friends`, `crew_radio`, `map_layer_settings`.

4. Migrations locais criam tabelas que nao aparecem nos tipos atuais:
   `run_logs`, `territory_snapshots`, `user_preferences`.

5. O documento `2026-06-03-gamificacao-mapa-2d-map.md` esta parcialmente stale em relacao ao codigo local:
   - Missoes ja estao conectadas ao `MapStage` via `useMissions` e `MapMissionPanel`.
   - O XP de missao ja entra em `totalXpEarned` e em `nextProgress.xp` no `useRunController`.
   - A camada Historia ja renderiza `MapHistoryPanel` quando ligada, embora ainda dependa de historico local.
   - `isInvasion` continua fixo em `false`.

6. A migration `001_map_enhancements.sql` usa `geography(LineString, 4326)` sem habilitar explicitamente PostGIS. Onda 0 deve confirmar se a extensao existe no banco real e registrar migration se faltar.

7. Algumas policies RLS de MVP nao sao suficientes para admin/multi-tenant real:
   - `user_profiles` permite update do proprio perfil, mas nao trava troca de `organization_id` por fluxo admin.
   - `zone_leaderboard.update_own` so checa `auth.uid() = user_id`.
   - `territory_snapshots` e `user_preferences` nao checam `organization_id` contra `user_profiles` no `WITH CHECK`.
   - Esse padrao pode ser aceitavel como MVP single-org, mas nao como base de dashboard interno.

8. O app publico e uma SPA Vite sem roteador. `vercel.json` reescreve tudo para `index.html`. Uma rota `/admin` funcionaria tecnicamente, mas entraria no mesmo bundle se nao houver separacao deliberada.

9. Existe armazenamento local sensivel:
   - `crewActiveRun`: GPS da corrida ativa.
   - `crewRunLogs`: rotas finalizadas locais.
   - `crew.saved_character`: imagem Data URL e perfil do runner.
   - `crewCreatorDraft`: foto base64 e perfil em rascunho.
   - `crew.gemini_api_key`: chave local legada.
   - `crew.friend_notes`, `crew.crew_radio`, `crew.friends`: texto/identidade social.

## Decisao Arquitetural Recomendada

Recomendacao: criar um app admin separado em `apps/crew-admin`, nao uma tela `/admin` dentro do bundle player-facing.

Motivos:

- O `DESIGN.md` proibe que o app publico pareca SaaS/dashboard.
- `App.tsx` hoje monta a experiencia publica inteira e so aplica gate de Auth.
- Um app separado reduz risco de copy, estilos, imports e ferramentas admin vazarem para a experiencia de jogo.
- Permite deploy separado, CSP separada, dominios separados e teste de bundle sem artefatos admin no player.

Modelo recomendado:

```text
apps/crew-running
  Public/player app. Usa publishable key. Sem privileged admin code.

apps/crew-admin
  Internal dashboard. Usa publishable key para sessao e chamadas read-only permitidas.
  Chama functions server/edge para qualquer acao privilegiada.

Supabase
  Auth, Postgres, RLS, Storage se necessario.
  Edge Functions para operacoes admin e verificacao de roles.

Vercel
  Deploy separado para admin.
  Functions opcionais apenas para health/deploy checks que precisem do Vercel API token.
```

Backend recomendado:

- Supabase Edge Functions para operacoes de dados, Auth admin, sync, moderacao e audit log.
- Vercel Functions apenas para deploy/release health se for preciso consultar Vercel API com token.
- Nunca usar `service_role` no browser, em `VITE_*`, localStorage ou console.

Alternativa aceitavel:

- `/admin` no mesmo repositorio e dominio, somente se virar entrypoint/bundle separado e protegido por build boundary clara.
- Mesmo nessa alternativa, operacoes privilegiadas continuam em server/edge.

## PRD Resumido

### Usuarios-alvo

- Operador interno: verifica health, sync e funil.
- Admin de organizacao: ve usuarios da propria org, corridas agregadas e status de crews.
- Moderador: revisa radio/mural/denuncias.
- QA/release owner: valida deploy, smoke, assets e contrato do creator.
- Privacy/admin restrito: acessa dados sensiveis com motivo e audit log.
- Runner no desktop: acompanha progresso, mapa como metricas/dados, perfil, rede e comunidade.
- Profissional/parceiro wellness: participa da rede quando seu setor complementa corrida.

### Problemas

- Auth e sync estao ativos, mas o repo nao tem uma superficie operacional para ver falhas.
- Dados estao divididos entre localStorage, tipos Supabase e migrations divergentes.
- Acoes administrativas exigem privilegios que nao podem estar no cliente.
- Dados de GPS/foto/social precisam de redacao por padrao.
- O app publico precisa continuar parecendo jogo urbano, nao ferramenta operacional.
- Desktop nao e o contexto de correr; se repetir o fluxo mobile de GPS/tracking, a experiencia quebra.
- Falta modelar a area do usuario e a rede social/wellness que vao dar sentido ao desktop.

### Objetivos MVP

- Dar visibilidade read-only de health, usuarios, orgs, sync, corridas redigidas, creator ops e assets.
- Bloquear qualquer acao privilegiada sem checagem server-side e audit log.
- Convergir schema/tipos/codigo antes de adicionar UI operacional.
- Garantir que cada leitura/acao admin seja escopada por `organization_id`.
- Definir a primeira versao desktop como area do usuario + social graph + wellness network, com mapa em modo metricas/dados.
- Separar claramente metricas pessoais/agregadas de rotas GPS brutas.

### Nao-objetivos MVP

- Editor visual de crews/wardrobe direto no banco.
- Visualizacao livre de rotas GPS brutas.
- Admin de sponsors monetizado.
- Leaderboard/gamificacao global sem schema reconciliado.
- Moderacao social sem tabela real, RLS e audit log.
- Botao de iniciar corrida/GPS como acao primaria no desktop.
- Marketplace transacional wellness na primeira onda.

## Inventario de Dados

| Dominio | Fonte atual | Persistencia atual | Risco | Acao Onda 0/1 |
| --- | --- | --- | --- | --- |
| Auth | `useSupabaseSession.ts`, Supabase Auth | `crew.supabase.auth` | email/conta/sessao | Listar via server, nunca client admin direto |
| Orgs | `orgContext.ts`, migrations `organizations`, `user_profiles` | Supabase | troca indevida de org | Criar membership/roles e travar RLS |
| Creator saved | `storage.ts`, `launchStorage.ts` | `crew.saved_character`, `crewCreatorDraft` | foto, data URL, perfil fisico | Admin so ve status/metadados; foto redigida |
| Creator generation | `crewService.ts`, Gemini client | browser/client e `crew.gemini_api_key` | chave/API, prompt safety | Mover operacao real para edge antes de admin actions |
| Crews/assets | `data/crews.ts`, `public/crews/*` | code/assets | asset quebrado, copy errada | Onda 1 integrity read-only |
| Wardrobe | `data/wardrobe.ts`, `public/wardrobe/*` | code/assets | quebrar contrato creator | Read-only no admin ate pipeline via PR |
| Corrida ativa | `activeRunStorage.ts`, `runTracker.ts` | `crewActiveRun` | GPS bruto em andamento | Nunca exibir no admin |
| Corrida finalizada local | `runRecords.ts`, `storage.ts`, `runLogStorage.ts` | `crew.run_records`, `crewRunLogs` | GPS/rota, drift de fonte | Reconciliar com `runs` canonico |
| Cloud sync | `cloudSync.ts` | `runs`, `runner_progress`, `run_history_stats`, `badge_unlocks` | tabelas sem migration | Criar/puxar schema real e atualizar tipos |
| Leaderboard | `useLeaderboard.ts` | `zone_leaderboard` | multi-tenant/rank confiavel | Read-only ate agregador real |
| Missions | `useMissions.ts`, `MapMissionPanel.tsx` | `crew.active_missions`, `crew.completed_missions` | local-only | Onda 1 mostrar gap; Onda 3 persistir |
| Historia | `MapHistoryPanel.tsx`, `runRecords.ts` | local-only | nao e historico cloud | Read-only local/diagnostico |
| Sede | `data/sedeRooms.ts` | code/static | sponsor/compliance futuro | Onda 1 read-only, Onda 3 governance |
| Social identity | `identityEvents.ts` | `crew.identity_events` | identidade/linha do tempo | Redigir e migrar antes de moderation real |
| Friends | `friends.ts`, `friendNotes.ts` | `crew.friends`, `crew.friend_notes` | nomes, notas, avatar | Sem acesso bruto por padrao |
| Crew radio | `crewRadio.ts` | `crew.crew_radio` | conteudo usuario/moderacao | Onda 2 com TTL, denuncia e audit |
| Wellness network | ainda nao modelado | inexistente | perfis profissionais, claims, spam, compliance | Onda 0 modelar taxonomia; Onda 1 read-only/social graph |
| PWA/deploy | `vite.config.ts`, `vercel.json` | deploy/runtime | cache/CSP/env | Onda 1 health read-only |
| Audit | nao existe | inexistente | sem rastreabilidade | Criar antes de qualquer write admin |

## Desktop Product Surface

A versao desktop deve ser entendida como `User Area + Social/Wellness Network`, nao como simulacao da corrida.

### Papel do mapa no desktop

No desktop, o mapa vira camada de inteligencia:

- metricas pessoais e agregadas;
- territorio por crew;
- zonas e spots;
- progresso semanal;
- heatmap redigido;
- leaderboard contextual;
- conexoes sociais e wellness por territorio;
- diagnostico de sync/atividade quando visto por admin.

O mapa desktop nao deve ter `INICIAR CORRIDA` como acao primaria. Corrida/GPS continua sendo fluxo mobile/rua.

### Area do usuario

Primeira superficie desktop recomendada:

- perfil do runner;
- progresso, XP, streak, badges e historico;
- crews e sede;
- feed de identidade;
- conexoes/friends;
- radio/mural;
- recomendacoes e conexoes wellness relacionadas a running;
- mapa como painel de dados e territorio.

### Wellness network

Setores iniciais que combinam com running:

- treinadores e assessorias de corrida;
- fisioterapia;
- nutricao esportiva;
- recovery, mobilidade e massagem;
- medicina esportiva e prevencao;
- saude mental/performance;
- lojas e marcas locais de corrida;
- organizadores de provas e eventos;
- academias, studios e clubes;
- creators educativos de running/wellness.

### Identidade, arroba e tags

Cada usuario deve ter uma identidade social estavel para contato e descoberta:

- `handle`: arroba unico, humano e compartilhavel, exemplo `@lili.run` ou `@coachmarcos`.
- `display_name`: nome publico.
- `profile_tags`: tags controladas, exemplo `runner`, `coach`, `fisio`, `nutri`, `store`, `brand`, `event_creator`, `athlete`, `club`.
- `primary_role`: papel principal exibido.
- `roles`: papeis multiplos. Uma pessoa pode ser `runner` + `coach`; uma loja pode ser `store` + `event_creator`; um atleta pode ser `athlete` + `creator`.
- `contact_policy`: como pode ser contatado: DM interna, WhatsApp externo verificado, site, evento, loja fisica ou contato bloqueado.

Decisao em aberto: usar somente arroba, somente tag, ou ambos. Recomendacao: ambos. O `handle` identifica a pessoa/negocio; as `profile_tags` explicam o tipo e alimentam filtros, ranking de descoberta e moderacao.

### Tipos de perfil

| Tipo | Pode ser runner? | Exemplo de uso |
| --- | --- | --- |
| `runner` | sim | usuario comum, atleta amador, membro de crew |
| `athlete` | sim | perfil com superficie para patrocinios e parcerias |
| `coach` | sim | personal/preparador que tambem corre e aparece no mapa |
| `clinic` | opcional | fisio, medicina esportiva, recovery |
| `nutrition` | opcional | nutricionista esportivo |
| `store` | opcional | loja de corrida, suplementos, equipamentos |
| `brand` | opcional | marca, suplemento, produto wellness |
| `event_creator` | opcional | criador de prova, corrida-festa, treino coletivo |
| `club` | sim | clube/assessoria/comunidade local |
| `creator` | sim | criador de conteudo running/wellness |

### Superficies de descoberta

No mobile:

- o usuario ve a experiencia gamificada;
- pode encontrar perfis no mapa de forma leve e contextual;
- contato deve ser simples e seguro;
- nao deve virar tela comercial pesada durante a corrida.

No desktop:

- mapa cruza metricas, zonas, crews, eventos, lojas e profissionais;
- usuario gerencia perfil, rede e oportunidades;
- profissional/comercial gerencia presenca, eventos, ofertas e contatos;
- admin ve integridade, risco, moderacao, crescimento por setor e territorio.

### Patrocinio de atletas

Perfis comerciais podem:

- descobrir atletas por zona, crew, atividade agregada, eventos, tags e nivel de permissao;
- enviar proposta de patrocinio/parceria;
- associar produto/campanha a atleta;
- marcar conteudo como publi/patrocinado quando aparecer em mural, sede ou perfil;
- medir resultados apenas com metricas agregadas e consentidas.

Atletas podem:

- aceitar/recusar proposta;
- definir categorias aceitas/bloqueadas;
- exibir patrocinadores no perfil/sede quando aprovado;
- manter historico de parcerias.

### Eventos e ativacoes locais

Criadores, marcas, lojas, assessorias e clubes podem criar eventos:

- treino local;
- corrida tematica;
- corrida-festa;
- prova;
- desafio por zona;
- ativacao em loja/escritorio;
- retirada de kit/produto;
- encontro de crew;
- experiencia patrocinada.

Eventos devem cruzar:

- cidade/zona/spot;
- organizador;
- crews permitidas;
- capacidade;
- horario;
- requisitos;
- status de moderacao;
- relacao com patrocinador/produto;
- indicadores agregados de interesse/participacao.

### Ofertas e produtos

Perfis comerciais podem oferecer produtos/servicos relacionados ao running/wellness:

- suplementos;
- calcados/equipamentos;
- avaliacao fisica;
- planilha/assessoria;
- sessao de fisio/recovery;
- consulta nutricional;
- ingresso/inscricao em evento;
- cupom local.

O MVP deve tratar isso como catalogo/ativacao e lead/contact, nao marketplace transacional completo.

Campos provaveis:

- `profile_type`: runner | coach | clinic | nutrition | recovery | event | brand | club | creator | partner;
- `roles`: array de roles;
- `handle`;
- `organization_id`;
- `display_name`;
- `crew_slug` opcional;
- `city_zone` / areas atendidas;
- `services`;
- `products` / `offers` em fase posterior;
- `verification_status`;
- `safety_status`;
- `visibility`;
- `contact_policy`;
- `created_at` / `updated_at`.

Regras:

- Sem vanity metrics como followers/likes/views no primeiro momento.
- Sem claims medicos sem verificacao.
- Sem recomendacao sensivel sem disclaimer e compliance.
- Moderacao e denuncia antes de crescimento publico.
- Admin ve rede e risco; usuario ve comunidade e utilidade.
- Patrocinio, publi e oferta comercial precisam de label claro.
- Eventos precisam de dono responsavel, regras de seguranca e status de moderacao.

## Fonte de Verdade de Corridas

Decisao em 2026-06-04: `runs` e o nome canonico de produto. `run_logs` deve virar legado, view de compatibilidade ou ser removido antes de producao multi-tenant.

Motivos:

- O codigo atual ja escreve em `runs`.
- `supabaseTypes.ts` ja espera `runs`.
- `run_logs` existe na migration, mas nao e usado pelo save path atual.
- `runs` e mais natural para admin, sync, gamificacao e historico.

Modelo esperado para `runs` canonico:

- `id uuid primary key`
- `organization_id uuid not null`
- `user_id uuid not null`
- `crew_slug text`
- `started_at timestamptz`
- `finished_at timestamptz`
- `elapsed_ms integer`
- `total_meters integer`
- `meters_in_territory integer`
- `home_zone_id text`
- `touched_spot_ids text[]`
- `closed_loop boolean`
- `night_run boolean`
- `week_key text`
- `route_redacted jsonb`
- `route_private geography(LineString, 4326)` ou `route_private jsonb`, protegido por server policy
- `sync_status text`
- `sync_error text`
- `created_at timestamptz`

Regra: admin comum le somente `route_redacted`, totais e zonas. Rota completa exige permissao especial, motivo obrigatorio e audit log.

## Modelo de Permissoes

Nao usar `user_metadata`.

Fonte de verdade recomendada:

```text
organization_memberships
  organization_id
  user_id
  role: owner | admin | operator | moderator | qa | support | viewer
  status: active | invited | suspended
  created_at
  updated_at

admin_memberships
  user_id
  scope: platform | organization
  organization_id nullable
  permission_set
  status
  granted_by
  reason
  created_at
  updated_at
```

Uso recomendado:

- RLS de leitura checa membership quando a tabela puder ser exposta ao admin client.
- Edge Functions usam `service_role`, mas sempre validam o JWT do usuario e consultam membership antes de agir.
- `app_metadata` pode acelerar UX ou claims, mas nao e fonte final de autorizacao porque JWT pode ficar stale.
- Toda acao write/admin cria linha em `admin_audit_log`.

Permissoes MVP:

| Permissao | Pode |
| --- | --- |
| `admin.viewer` | Ver overview, health e dados redigidos da propria org |
| `admin.users.read` | Ver usuarios e perfis redigidos |
| `admin.users.write` | Convidar, reenviar confirmacao, reset, bloquear |
| `admin.orgs.write` | Alterar org/role |
| `admin.creator.read` | Ver health/metadados do creator |
| `admin.creator.qa` | Rodar smoke/TESTAR LOCAL controlado |
| `admin.runs.read` | Ver runs redigidas e sync |
| `admin.runs.route_raw` | Ver rota bruta com motivo e audit |
| `admin.social.moderate` | Ocultar/remover radio/mural |
| `admin.qa.release` | Ver checks, deploys, env health |

## Audit Log

Tabela obrigatoria antes de qualquer Onda 2:

```text
admin_audit_log
  id uuid
  organization_id uuid
  actor_user_id uuid
  action text
  resource_type text
  resource_id text
  before_redacted jsonb
  after_redacted jsonb
  reason text
  ip_hash text
  user_agent_hash text
  created_at timestamptz
```

Regras:

- `reason` obrigatorio para PII, rota bruta, mudanca de role/org, reset de senha e moderacao.
- Nunca salvar secrets no audit.
- Antes/depois deve ser redigido para email, coordenadas, foto, notas e mensagens quando possivel.
- Audit log e append-only; sem update/delete via dashboard.

## Privacidade e Redacao

Padrao por dominio:

| Dado | Padrao no admin | Acesso completo |
| --- | --- | --- |
| Email | mascarado: `b***@dominio.com` | Users write/support com motivo |
| Nome runner | visivel se necessario | org admin |
| Foto/upload | nao mostrar; usar hash/status | privacy admin com motivo, se existir armazenamento |
| Creator draft | somente metadados | nao acessar no MVP |
| Rota GPS ativa | nunca mostrar | nao permitido |
| Rota GPS finalizada | redigida/blurred/agregada | `admin.runs.route_raw` + motivo |
| Friend notes | contagem/status | support/privacy + motivo |
| Radio/mural | texto visivel para moderacao | moderator com audit |
| API keys | nunca mostrar | nao permitido |

## Modulos do Dashboard

### 1. Overview / Health

- Auth configurado.
- Supabase reachability.
- Sync success/failure.
- PWA/service worker status.
- Deploy atual.
- Env obrigatorias presentes.
- Erros recentes por dominio.

Onda 1: read-only.

### 2. Users & Orgs

- Usuarios confirmados/pendentes/bloqueados.
- Perfil e org.
- Role/membership.
- Convites, reset e confirmacao.
- Auditoria de alteracoes.

Onda 1: read-only. Onda 2: acoes via server.

### 3. Creator Studio Ops

- Health Gemini/API.
- Quota/erro por provider.
- Fila/historico de geracao por metadados.
- Asset validation por crew.
- Smoke `TESTAR LOCAL`.
- Bloqueios do `CREATOR_CONTRACT`.

Onda 1: read-only/status. Onda 2/3: reprocessar/QA controlado.

### 4. Crew & Content Admin

- Crews ativas.
- Assets faltantes/quebrados.
- Preview de badge/banner/leader/marker/mission card/pattern/share card.
- Wardrobe integrity.
- Copy operacional.

Onda 1: read-only. Writes so via PR ou tabela controlada com audit.

### 5. User Area & Wellness Network

- Perfil desktop do runner.
- Feed de identidade sem vanity metrics.
- Conexoes/friends.
- Crew radio/mural.
- Perfis wellness compativeis com running.
- Taxonomia de setores.
- Arroba/handle e tags de descoberta.
- Papeis multiplos: runner + profissional, atleta + creator, loja + event creator.
- Atletas e oportunidades de patrocinio.
- Eventos locais, ativacoes e corridas-festa.
- Ofertas/produtos como catalogo e lead, nao checkout.
- Status de verificacao/moderacao.
- Relacao com crews, zonas e eventos.

Onda 1: mapa de dados e read-only/social graph. Onda 2: moderacao. Onda 3: onboarding de parceiros/setores.

### 6. Map Metrics & Gamification Ops

- Mapa desktop como metricas/dados, nao como tela de corrida.
- Zonas/spots/missoes.
- XP, level, streak, ink, badges.
- Leaderboard por zona/semana.
- Heatmap redigido e agregados territoriais.
- Gaps: `isInvasion=false`, stubs de badges rankeadas, Historia local/local-first.

Onda 1: diagnostico. Onda 3: operacoes.

### 7. Runs & Sync

- Runs finalizadas.
- Status de sync.
- Erros por entidade.
- Rotas redigidas.
- Reprocessamento de sync falhado.

Onda 1: read-only. Onda 2: reprocessar com audit.

### 8. Sede Admin

- 7 salas.
- Sponsors.
- Mural.
- Roster.
- Patentes.
- Ranking.
- Compliance de publicidade.

Onda 1: read-only/static. Onda 3: gestao real.

### 9. Social Moderation

- Identity events.
- Friends integrity.
- Crew radio.
- Denuncias.
- TTL/expiracao.
- Remocao/ocultacao.
- Setores wellness, claims e perfis suspeitos.

Onda 1: mapa de dados. Onda 2: moderacao.

### 10. QA & Release

- `typecheck`, `build`, `test`, `validate`.
- Playwright smoke.
- Asset integrity.
- Secret scan do bundle.
- Release notes.

Onda 1: read-only/check runner. Onda 2: disparar checks se houver worker.

### 11. Audit Log

- Quem fez.
- Quando.
- Em qual org.
- Recurso.
- Antes/depois redigidos.
- Motivo.

Onda 1: leitura se tabela existir. Onda 0 cria schema.

## Wireframe Textual

```text
Admin Shell
  Top bar
    Org switcher
    Current user
    Session status
    Environment badge

  Sidebar
    Overview
    Users & Orgs
    User Area
    Wellness Network
    Creator Ops
    Crews & Assets
    Map Metrics
    Gamification Ops
    Runs & Sync
    Sede
    Social Moderation
    QA & Release
    Audit Log

  Overview
    Health strip: Auth / Supabase / Sync / Deploy / PWA
    Incident cards: recent failures by domain
    Funnel: auth -> onboarding -> crew -> runner -> map -> run -> sync
    Desktop funnel: login -> user area -> social graph -> wellness connection -> map metrics
    Privacy alerts: raw route requests, moderation actions

  User Area
    Profile summary: runner, crew, XP, badges, streak
    Feed: identity events, runs summarized, crew moments
    Social graph: friends, crew radio, mural, wellness connections
    Map panel: territory metrics, weekly progress, spots, aggregate heat

  Runs & Sync
    Filters: org, crew, week, sync status, privacy level
    Table: run id, user masked, crew, km, zone, week, sync, errors
    Detail: redacted route preview, touched spots, XP, badges, audit trail
    Raw route action: gated modal with reason
```

## Migrations Necessarias

Onda 0 deve gerar migrations so depois de comparar banco real com repo.

Lista provavel:

1. `admin_memberships_and_audit`
   - `organization_memberships`
   - `admin_memberships`
   - `admin_audit_log`

2. `rls_hardening`
   - corrigir `WITH CHECK` com `organization_id`.
   - impedir troca de `user_profiles.organization_id` pelo proprio usuario.
   - policies para leitura admin por membership.

3. `runs_canonical`
   - criar/ajustar `runs` com `organization_id`.
   - executar view/rollback/deprecacao de `run_logs`.
   - habilitar PostGIS se usar `geography`.

4. `runner_progress_and_badges`
   - `runner_progress`
   - `run_history_stats`
   - `badge_unlocks`
   - constraints por `organization_id` e `user_id`.

5. `creator_generation_events`
   - metadados de geracao.
   - provider, status, erro redigido, quota bucket.
   - sem foto bruta por padrao.

6. `social_moderation`
   - `identity_events`
   - `friends`
   - `crew_radio`
   - `moderation_reports`
   - `moderation_actions`

7. `wellness_network`
   - `wellness_profiles`
   - `wellness_profile_roles`
   - `wellness_profile_services`
   - `wellness_connections`
   - `wellness_verification_events`
   - `wellness_reports`

8. `athlete_sponsorships`
   - `athlete_profiles`
   - `sponsorship_offers`
   - `sponsorship_acceptances`
   - `sponsored_surfaces`
   - `sponsorship_audit_events`

9. `events_and_activations`
   - `running_events`
   - `event_hosts`
   - `event_participants`
   - `event_offers`
   - `event_moderation_events`

10. `commercial_offers`
   - `partner_offers`
   - `offer_categories`
   - `offer_leads`
   - `offer_moderation_events`

11. `content_flags_sede`
   - flags controladas de crews/missoes/sede.
   - sponsors/compliance somente quando produto aprovar.

## Funcoes Server/Edge Necessarias

Read-only:

- `admin_get_overview_health`
- `admin_list_users`
- `admin_list_orgs`
- `admin_list_runs_redacted`
- `admin_get_run_detail_redacted`
- `admin_get_creator_health`
- `admin_get_asset_integrity`
- `admin_list_wellness_profiles`
- `admin_get_wellness_network_health`
- `admin_list_athlete_sponsorships`
- `admin_list_running_events`
- `admin_list_partner_offers`
- `admin_get_release_health`
- `admin_list_audit_log`

Privilegiadas:

- `admin_invite_user`
- `admin_resend_confirmation`
- `admin_send_password_reset`
- `admin_update_membership`
- `admin_suspend_user`
- `admin_reprocess_run_sync`
- `admin_moderate_radio_message`
- `admin_moderate_mural_post`
- `admin_moderate_wellness_profile`
- `admin_verify_wellness_profile`
- `admin_moderate_running_event`
- `admin_moderate_partner_offer`
- `admin_review_sponsorship_offer`
- `admin_request_raw_route_access`
- `admin_toggle_content_flag`

Todas devem:

- validar JWT com Supabase Auth;
- consultar membership/permission no banco;
- escopar por `organization_id`;
- redigir retorno;
- gravar `admin_audit_log` para qualquer acao sensivel;
- nunca retornar secrets.

## Plano em Ondas

### Onda 0 - Verdade de dados e seguranca

Objetivo: deixar banco, tipos, RLS e fronteira server/admin prontos antes de UI.

Tarefas:

- Inspecionar banco real.
- Rodar/puxar schema real.
- Comparar migrations, banco, `supabaseTypes.ts` e codigo.
- Confirmar dados reais e executar destino de `run_logs` com `runs` canonico.
- Criar membership/roles.
- Modelar handles, tags e papeis multiplos de perfil.
- Modelar wellness network, atletas, patrocinio, eventos e ofertas como dominios separados.
- Criar audit log.
- Endurecer RLS.
- Definir redacao de PII.
- Definir Edge/Vercel function boundary.
- Secret scan baseline.

Saida: documento de schema truth + migrations planejadas.

### Onda 1 - Desktop user area + admin read-only

Objetivo: primeira superficie desktop util para usuario/rede e visibilidade operacional sem writes.

Modulos:

- Overview/health.
- User area read-only: perfil, progresso, feed, rede e mapa de metricas.
- Wellness network read-only: setores, perfis, handles/tags, status e relacao com running.
- Atletas/eventos/ofertas read-only: inventario, status e riscos.
- Users/orgs read-only.
- Runs/sync redigido.
- Creator ops read-only.
- Asset integrity por crew.
- QA/release read-only.
- Audit log read-only se existir.

Sem acoes destrutivas, sem service_role no cliente.

### Onda 2 - Operacoes controladas

Objetivo: primeiras acoes com server, permissoes e audit.

Acoes:

- Reenviar confirmacao.
- Enviar reset de senha.
- Ajustar org/role.
- Suspender/bloquear usuario.
- Moderar radio/mural.
- Reprocessar sync falhado.
- Toggling de flags controladas.

Toda acao exige audit log.

### Onda 3 - Conteudo, wellness e gamificacao

Objetivo: gestao operacional de jogo, rede e conteudo wellness.

Escopo:

- Missoes.
- Zonas/spots.
- Leaderboard.
- Badges.
- Historia cloud.
- Wellness profiles verificados.
- Eventos, clubes, assessorias e parceiros.
- Patrocinios de atletas.
- Eventos locais e ativacoes comerciais.
- Ofertas/produtos como catalogo/lead.
- Sede.
- Sponsors/compliance.
- Relatorios e exports redigidos.
- QA release automatizado.

## Criterios de Aceite

Onda 0:

- Banco real, migrations, tipos e codigo reconciliados.
- `runs` versus `run_logs` decidido e documentado.
- Roles/admin memberships definidos.
- RLS nao permite cross-org read/write.
- Audit log existe antes de qualquer write admin.
- Redacao de PII documentada e testavel.

Onda 1:

- Usuario sem admin nao acessa admin.
- Admin de org so ve dados da propria org.
- Sessao expirada volta para login.
- Rotas GPS brutas nao aparecem.
- Fotos/drafts nao aparecem por padrao.
- Secrets nao aparecem no bundle.
- O app publico nao importa componentes/admin styles.

Comandos minimos para qualquer implementacao futura:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run typecheck
npm run build
npm run test -- --pool=threads --maxWorkers=1
```

Se tocar creator:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run validate
```

Checks adicionais:

```bash
cd "/Users/belissima/Desktop/running crew"
rg -n "service_role|SERVICE_ROLE|SUPABASE_SERVICE|secret|SECRET" apps/crew-running apps/crew-admin
```

Playwright futuro:

- sem admin: bloqueado;
- admin da org A: dados da org A;
- admin da org B: nao ve org A;
- sessao expirada: redirect/login;
- rota bruta: bloqueada sem permissao e motivo;
- action write: cria audit log.

## Riscos

- Banco real pode estar diferente das migrations locais.
- `supabaseTypes.ts` parece manual/defasado e nao gerado do banco real.
- RLS MVP single-org pode mascarar bugs multi-tenant.
- `crew.gemini_api_key` em localStorage e `VITE_GEMINI_API_KEY` sao incompativeis com operacao admin segura se usados para producao.
- GPS bruto e fotos podem virar passivo de privacidade se o admin exibir demais.
- Um `/admin` no mesmo bundle pode vazar linguagem/dashboard para player-facing.
- Admin actions sem audit log criam buraco operacional.
- `service_role` em Vercel/Supabase precisa ser restrito por env server-only e secret scan.
- PWA/cache pode manter bundle antigo se admin for acoplado ao app publico.

## Perguntas Bloqueantes

1. Qual projeto Supabase e o banco real de producao/staging para auditar?
2. O dashboard sera subdominio separado, projeto Vercel separado ou rota interna?
3. Quem sao os primeiros admins e quais roles reais existem?
4. Como executar com seguranca a migracao/view/deprecacao de `run_logs`, mantendo `runs` canonico?
5. Rotas completas devem ser armazenadas no banco ou apenas rotas redigidas/agregadas?
6. Creator vai continuar com Gemini no browser para player-facing ou migrara para Edge?
7. O admin podera alterar `data/crews.ts`/wardrobe via UI, ou so abrir PR?
8. Moderacao social tera denuncias reais ja na Onda 2?
9. Sponsors entram como conteudo real ou ficam visual/read-only ate compliance?
10. Qual politica de retencao para GPS, radio, friend notes e creator drafts?
11. Identidade publica usa arroba obrigatorio, tags obrigatorias ou ambos?
12. Como um perfil runner + profissional aparece no mapa sem parecer anuncio invasivo?
13. Quais dados de atividade podem ser usados para descoberta de atletas por marcas?
14. Patrocinio de atleta sera proposta privada, vitrine publica ou ambos?
15. Eventos locais entram como discovery gratuito primeiro ou ja com fluxo comercial?
16. Ofertas/produtos ficam como catalogo/lead ou terao checkout em fase futura?
17. Quais setores wellness exigem verificacao antes de aparecer publicamente?

## Proxima Acao Recomendada

Antes de qualquer UI, executar Onda 0 com acesso read-only ao Supabase real:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
supabase --version
supabase db pull admin_dashboard_schema_audit --linked
```

Se o projeto nao estiver linkado, primeiro autenticar/linkar com o project ref correto. Nao aplicar migration ate a comparacao banco real versus repo estar revisada.
