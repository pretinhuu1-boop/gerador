# Consolidado da execucao dos agentes - mapa, eventos e rede wellness

Data: 2026-06-04
App: `apps/crew-running`
Status: investigacao consolidada. Nao implementar ainda.

## Escopo

Executar os prompts criados em `vault/2026-06-04-map-events-open-questions-agent-prompts.md` para transformar as duvidas abertas em:

- decisoes recomendadas;
- bloqueios reais;
- plano de Onda 0;
- plano de Onda 1;
- arquivos a tocar futuramente;
- testes e validacoes.

## Execucao dos subagentes

Foram disparados exploradores para trilhas independentes:

| Trilha | Nickname | Agent id | Status |
| --- | --- | --- | --- |
| QA/Build/DevEx | Jason | `019e9385-b513-7970-bbc7-1ef67b7ddce6` | spawn retornou id, mas `wait_agent` retornou `not_found` |
| Frontend/Mapa | Popper | `019e9385-cd15-7f51-815f-16c0a369f644` | spawn retornou id, mas `wait_agent` retornou `not_found` |
| Dados/Supabase | James | `019e9385-f0b1-7382-bb17-bde5d4eb1e56` | spawn retornou id, mas `wait_agent` retornou `not_found` |
| Seguranca/Admin/Privacidade | Dewey | `019e9386-2d21-7582-9275-269ac7e757c2` | spawn retornou id, mas `wait_agent` retornou `not_found` |
| Produto/UX + Comercial/Wellness | Chandrasekhar | `019e9386-6060-72d0-a763-0ce902a1e535` | spawn retornou id, mas `wait_agent` retornou `not_found` |
| Creator/Ops | Feynman | `019e9386-9299-7131-9c13-400cd2744f50` | spawn retornou id, mas `wait_agent` retornou `not_found` |
| Social/Moderacao | nao criado | n/a | limite de threads atingido; trilha investigada localmente |

Conclusao operacional:

- A execucao multi-agente foi iniciada, mas os resultados nao ficaram recuperaveis via `wait_agent`.
- Para nao bloquear, o consolidado abaixo usa a auditoria local ja executada e a leitura direta dos arquivos.
- Nao houve implementacao de feature.

## Decisoes recomendadas

| Decisao | Recomendacao | Motivo |
| --- | --- | --- |
| Primeira camada comercial | `Eventos` | Encaixa profissionais, marcas, lojas, atletas e crews como host/partner sem marketplace completo |
| CTA MVP | `Tenho interesse` | Gera sinal comercial sem PII, chat, pagamento ou backend obrigatorio |
| Profissionais no mapa | Vinculados a eventos na Onda 1 | Evita poluir mapa e criar rede comercial antes da base |
| Desktop | Mapa + area do usuario + rede + metricas | Desktop nao deve depender de tracking GPS |
| Nome tecnico da camada | `events` | Claro e compatvel com `MapLayerState` |
| Estado default | `events: false` | Nao altera a experiencia publica existente ao abrir mapa |
| Tracking ativo | Eventos escondidos | Corrida ativa deve focar em GPS/HUD/seguranca |
| Modelo inicial | `MapEvent`, nao `MapEntity` generico | Evita abstracao prematura |
| Backend Onda 1 | Sem Supabase novo | Schema esta em drift |
| Admin | Separado em app/bundle futuro | Evita contaminar player-facing |
| Creator ops | Read-only/admin health futuro via server/edge | Chave real/Gemini nao devem virar operacao browser |

## Bloqueios reais antes de implementar

### B1. Worktree/git instavel

Evidencia:

```text
git status --short
fatal: .git/index: unable to map index file: Operation timed out
```

Impacto:

- Nao da para confirmar diffs com seguranca.
- Build interrompido pode ter tocado `apps/crew-running/dist`.

Antes de editar codigo:

- confirmar `git status` em janela limpa;
- confirmar se `dist` e ignorado;
- nao iniciar implementacao se o index continuar instavel.

### B2. Build travando

Evidencia:

```text
npm run build
vite v6.4.2 building for production...
transforming...
```

O build ficou sem nova saida por cerca de 1m30 e foi encerrado.

Impacto:

- Sem build verde, deploy/CI da proxima onda fica incerto.

Antes de implementar:

- rodar build em ambiente limpo;
- se repetir, usar debug de Vite para achar modulo final;
- checar PWA/assets/cache.

### B3. Testes de sheet travando

Evidencia:

- `LayerRail.test.tsx` isolado passou.
- `sheets.test.tsx` isolado ficou preso.

Hipotese forte:

- `ZoneSheet` renderiza `ZoneLeaderboard`;
- `ZoneLeaderboard` chama `useZoneLeaderboard`;
- `useZoneLeaderboard` pode tocar Supabase quando `.env` local esta configurado.

Mas:

- zerar env no comando nao resolveu rapidamente, entao pode existir outro fator de happy-dom/hook/cleanup.

Antes de testar eventos em `ZoneSheet`:

- mockar `useLeaderboard`;
- ou permitir `showLeaderboard={false}` em testes;
- ou isolar `ZoneLeaderboard` atras de boundary que nao trava.

### B4. Schema Supabase em drift

Confirmado:

- migrations locais criam `run_logs`;
- `cloudSync.ts` escreve em `runs`;
- `supabaseTypes.ts` declara varias tabelas sem migration local.

Impacto:

- Nao criar admin/cloud/leads antes de reconciliar fonte de verdade.

### B5. Banco real nao inspecionado

Confirmado:

- `supabase/config.toml` nao existe no app local;
- CLI local e `2.75.0`, com aviso de versao nova;
- sem link local confiavel para banco real nesta rodada.

Impacto:

- Qualquer decisao de migration agora seria especulativa.

## Resultado por trilha

## 1. Produto/UX + Comercial/Wellness

### Resposta principal

Comecar por `Eventos`, nao por perfis profissionais soltos.

### Por que

Eventos sao o primeiro objeto comercial que naturalmente tem:

- lugar no mapa;
- horario;
- host;
- parceiro;
- zona;
- contexto de corrida/wellness;
- CTA leve;
- valor para usuario e marca sem transacao.

### Taxonomia recomendada de roles

Roles publicos:

- `runner`
- `athlete`
- `trainer`
- `doctor`
- `nutritionist`
- `physio`
- `store`
- `brand`
- `supplement`
- `event_creator`
- `crew`

Roles administrativos ficam separados:

- `owner`
- `admin`
- `operator`
- `moderator`
- `qa`
- `support`
- `viewer`

Regra:

- um usuario pode ser runner e profissional ao mesmo tempo;
- perfil runner e identidade de jogo;
- perfil profissional/comercial e camada de descoberta/servico;
- organizacao ou marca deve ter membership/proprietario, nao depender so do usuario individual.

### Jornada MVP

Runner:

```text
abre mapa -> liga Eventos -> toca marcador -> ve EventSheet -> Tenho interesse
```

Profissional:

```text
aparece como host/partner de evento -> recebe sinal futuro quando cloud existir
```

Marca/loja:

```text
aparece como parceira/ponto do evento -> ve dados agregados no futuro
```

Atleta:

```text
aparece como host/embaixador/convidado -> patrocinio futuro por opt-in
```

### Fora da Onda 1

- checkout;
- assinatura;
- pagamento;
- comissao;
- videochamada;
- marketplace;
- anuncio pago;
- abordagem direta de runner sem opt-in;
- mapa com perfis comerciais soltos.

## 2. Frontend/Mapa

### Arquivos a editar futuramente

Criar:

- `data/mapEvents.ts`
- `services/mapInterestStorage.ts`
- `components/map/EventSheet.tsx`

Editar:

- `components/map/mapTypes.ts`
- `services/mapLayerStorage.ts`
- `components/map/LayerRail.tsx`
- `components/map/MapLibreCanvas.tsx`
- `components/map/MapStage.tsx`
- `components/map/ZoneSheet.tsx`
- `index.css`

Testes:

- `data/mapEvents.test.ts`
- `services/mapInterestStorage.test.ts`
- `services/mapLayerStorage.test.ts`
- `components/map/__tests__/LayerRail.test.tsx`
- `components/map/__tests__/EventSheet.test.tsx`
- `components/map/__tests__/MapStage.test.tsx` somente se houver seletor estavel
- browser smoke para marker real

### Forma segura de adicionar `events`

Em `MapLayerState`:

```ts
events: boolean;
```

Default:

```ts
events: false;
```

Em `mapLayerStorage`:

- `isShape` aceita objetos antigos sem `events`;
- `pick` preenche `events` com default;
- `allOff` inclui `events`;
- teste cobre storage antigo sem a key.

Em `MapStage`:

- `handleToggleLayer` precisa incluir `events` no `anyOn`;
- `layerAvailability` pode deixar `events: true` se houver eventos;
- eventos nao renderizam quando `trackerActive`.

Em CSS:

- trocar rail de 4 para 5 colunas;
- criar `.maplibre-event`;
- criar classes de `event-sheet`.

### Marker

Basear em mission marker:

- `Marker`;
- role button;
- keyboard activation;
- accent pela zona;
- classes `is-focused`, `is-interested`, `is-live`.

Nao usar markers comerciais durante corrida ativa.

## 3. Dados/Supabase

### Drift confirmado

| Entidade | Migration local | `supabaseTypes.ts` | Codigo escreve/le | Risco |
| --- | --- | --- | --- | --- |
| `organizations` | sim | sim | `orgContext` | ok MVP |
| `user_profiles` | sim | sim | `orgContext` | update precisa travar org |
| `zone_leaderboard` | sim | sim | `useLeaderboard` | RLS/admin ainda MVP |
| `run_logs` | sim | nao visto como type usado | `runLogStorage` local nao cloud | drift |
| `runs` | nao | sim | `cloudSync.pushRun` | drift critico |
| `runner_progress` | nao | sim | `cloudSync` | migration faltante local |
| `run_history_stats` | nao | sim | `cloudSync` | migration faltante local |
| `badge_unlocks` | nao | sim | `cloudSync` | migration faltante local |
| `runners` | nao | sim | types planejados | fonte real incerta |
| `identity_events` | nao | sim | localStorage hoje | cloud futuro incerto |
| `friends` | nao | sim | localStorage hoje | cloud futuro incerto |
| `crew_radio` | nao | sim | localStorage hoje | cloud futuro incerto |
| `map_layer_settings` | nao | sim | localStorage hoje | cloud futuro incerto |
| `territory_snapshots` | sim | nao destacado no client atual | sem fluxo claro | drift/roadmap |
| `user_preferences` | sim | nao destacado no client atual | map theme local | drift/roadmap |

### Decisao `runs` vs `run_logs`

Decisao em 2026-06-04:

- `runs` e a fonte canonica de produto para corridas finalizadas;
- `cloudSync.pushRun` continua apontando para `runs`;
- `run_logs` fica como legado/compatibilidade ate a inspecao do banco real;
- se `run_logs` existir em producao, escolher migracao para `runs`, view temporaria ou deprecacao;
- nao manter `runs` e `run_logs` como fontes independentes.

### Precondicoes para eventos/leads cloud

Antes de criar schema cloud:

- banco real inspecionado;
- canonical run schema definido;
- `organization_memberships` ou equivalente definido;
- `admin_memberships` definido;
- `admin_audit_log` definido;
- RLS revisada;
- Edge Functions desenhadas.

## 4. Seguranca/Admin/Privacidade

### Modelo recomendado

Usar ambos:

- `organization_memberships`: relacao usuario <-> organizacao/perfil comercial.
- `admin_memberships`: permissoes administrativas sobre org/app.

Nao usar:

- `user_metadata` para autorizacao;
- service role no browser;
- secret em `VITE_*`;
- operacao admin direta no client.

### Operacoes que exigem server/edge

- listar usuarios Auth;
- reenviar confirmacao/reset;
- alterar role/org;
- suspender usuario;
- moderar radio/mural/evento/perfil;
- acessar rota GPS completa;
- aprovar evento comercial;
- processar lead;
- creator real/queue/health com chave secreta;
- reprocessar sync falhado.

### Audit log minimo

Campos:

```text
id
organization_id
actor_user_id
actor_role
action
target_type
target_id
before_json
after_json
reason
created_at
ip_hash/user_agent_hash opcional
```

Toda acao sensivel precisa de `reason`.

### Redacao por dado

| Dado | Default | Acesso completo |
| --- | --- | --- |
| email | mascarado | admin users com motivo |
| nome runner | visivel quando necessario | org/admin |
| foto | ocultar/hash/status | privacy admin com motivo |
| GPS ativo | nunca admin | n/a |
| rota finalizada | agregada/blurred | permissao `route_raw` + audit |
| radio | texto visivel na crew | moderador/admin para remocao |
| friend notes | privado/local | nao sincronizar por padrao |
| lead interest | agregado/local na Onda 1 | host/admin futuro por opt-in |

## 5. Creator/Ops

### Fluxo ativo

`RunnerCreatorTabs` importa e usa `generateDemoCharacterSheet`.

O botao principal do fluxo ativo nao chama Gemini real.

`generateCharacterSheet` real existe em `crewService.ts`, com `GoogleGenAI`, mas nao e o caminho principal atual em `RunnerCreatorTabs`.

### Flags/chaves relevantes

- `VITE_GEMINI_API_KEY`
- `crew.gemini_api_key`
- `VITE_ENABLE_STUDIO_TOOLS`
- `ApiKeyModal`

### Risco

- chave real no browser e incompatvel com operacao admin/producao segura;
- foto do runner e PII;
- prompt/asset health pode ser administrado, mas nao deve expor fotos sem necessidade;
- contrato do creator nao pode ser relaxado.

### Creator ops futuro

Onda admin read-only:

- status de fila/health;
- taxa de erro;
- quota;
- assets faltantes por crew;
- resultado de `TESTAR LOCAL`;
- sem foto bruta;
- sem prompt livre publico;
- sem estilo publico.

Antes de geracao real operacional:

- mover chamada Gemini para Edge/server;
- audit log;
- storage redigido;
- policy de retencao;
- prompt guardrails server-side.

## 6. Social/Moderacao

### Estado atual

Base local-first:

- `identity_events`;
- `friends`;
- `crew_radio`;
- `friend_notes`;
- `run_diary`.

Sem vanity metrics:

- sem likes;
- sem followers;
- sem views;
- sem public counters de popularidade.

### Radio

`crewRadio.ts`:

- TTL 24h;
- max 140 caracteres;
- max 200 por crew.

Risco futuro:

- sem denuncia/remocao cloud;
- sem autor verificado;
- sem mod queue;
- sem rate limit server.

### Friends

`FriendAddMethod`:

- `nfc`;
- `qr`;
- `handle`.

QR/NFC hoje troca identidade runner minima:

- user id;
- runner name;
- crew slug;
- runner type.

Para perfis profissionais:

- nao misturar friend exchange com lead comercial na Onda 1;
- futuro pode adicionar handle/role, mas precisa versao v2 do payload.

### Friend notes

Notas:

- max 140 caracteres;
- tag local: parceiro, rival, mentor, novato;
- devem permanecer privadas/local por padrao.

Nao sincronizar friend notes para marca/admin.

### Como eventos entram no social

Onda 1:

- evento pode gerar entrada local tipo `EVENT_INTERESTED` apenas se for decidido expandir `IdentityEventKind`;
- alternativa mais segura: manter interesse separado em `crew.map_event_interest`, sem feed ainda.

Recomendacao:

- nao adicionar evento ao feed na primeira implementacao;
- primeiro validar mapa/sheet/interest local;
- depois criar evento de identidade quando houver UX definida.

### Anti-spam futuro

- eventos comerciais exigem aprovacao;
- radio comercial precisa label;
- marcas nao podem DM runner sem opt-in;
- host so ve leads opt-in;
- reports/moderacao antes de cloud publica.

## 7. QA/Build/DevEx

### Baseline curto recomendado antes da Onda 1

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npx tsc --noEmit --pretty false --incremental false
npx vitest run services/mapLayerStorage.test.ts data/spLiveMap.test.ts data/spGeoJSON.test.ts services/__tests__/syncQueue.test.ts --pool=forks --maxWorkers=1
npx vitest run components/map/__tests__/LayerRail.test.tsx --pool=forks --maxWorkers=1
```

Esse baseline ja passou na auditoria local.

### Baseline completo depois de corrigir travas

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run typecheck
npm run test -- --pool=threads --maxWorkers=1
npm run build
```

Se tocar creator:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run validate
```

### Antes de implementar

Resolver ou aceitar conscientemente:

- `git status` confiavel;
- `build` confiavel;
- `sheets.test.tsx` com mock/desacoplamento;
- secret scan completo.

## Plano Onda 0

Objetivo: preparar previsibilidade antes de UI nova.

1. Revalidar worktree
   - `git status --short`;
   - confirmar `dist`;
   - nao usar comandos destrutivos.

2. Corrigir/entender travamento de teste
   - isolar `sheets.test.tsx`;
   - mockar `useLeaderboard` ou `ZoneLeaderboard`;
   - garantir testes sem rede real.

3. Corrigir/entender build
   - rodar build limpo;
   - se travar, debug de Vite;
   - confirmar PWA/assets.

4. Secret/env check
   - verificar `service_role`, `SUPABASE_SERVICE`, `SECRET`;
   - checar bundle gerado quando build passar;
   - garantir que Gemini real nao entra no bundle publico de producao indevidamente.

5. Supabase real
   - inspecionar banco real quando houver link/MCP;
   - confirmar dados reais e planejar migracao/view/deprecacao de `run_logs`;
   - nao aplicar migration ainda.

## Plano Onda 1

Objetivo: Eventos local-first no mapa.

Arquivos novos:

- `data/mapEvents.ts`
- `services/mapInterestStorage.ts`
- `components/map/EventSheet.tsx`

Arquivos alterados:

- `components/map/mapTypes.ts`
- `services/mapLayerStorage.ts`
- `components/map/LayerRail.tsx`
- `components/map/MapLibreCanvas.tsx`
- `components/map/MapStage.tsx`
- `components/map/ZoneSheet.tsx`
- `index.css`

Testes novos/alterados:

- `data/mapEvents.test.ts`
- `services/mapInterestStorage.test.ts`
- `services/mapLayerStorage.test.ts`
- `components/map/__tests__/LayerRail.test.tsx`
- `components/map/__tests__/EventSheet.test.tsx`
- `components/map/__tests__/MapStage.test.tsx` se seletor for estavel

Regras:

- `events` default false;
- eventos escondidos em tracking;
- interesse local sem PII;
- profissionais/marcas somente como host/partner do evento;
- sem Supabase novo;
- sem admin;
- sem pagamento;
- sem video;
- sem marketplace.

## Criterios de aceite da Onda 1

- Camada `Eventos` aparece no rail.
- Estado antigo de `crewMapLayers` sem `events` continua valido.
- Toggle de Eventos persiste.
- Marker de evento aparece quando camada ligada e nao tracking.
- Marker abre `EventSheet`.
- `Tenho interesse` salva localmente sem PII.
- `ZoneSheet` mostra eventos da zona sem travar testes.
- Iniciar corrida esconde eventos/rail.
- Typecheck passa.
- Testes de storage/dados/rail/event sheet passam.
- Browser smoke valida marker real.

## Perguntas que seguem humanas

1. Chip publica chama `Eventos`, `Agenda`, `Rede` ou outro nome?
2. CTA final sera `Tenho interesse` ou `Pedir contato`?
3. O interesse local deve aparecer no feed da aba Voce ou ficar invisivel por enquanto?
4. Evento comercial precisa de aprovacao mesmo em fixture local?
5. Desktop user comum ve quais metricas agregadas?
6. Quem sao os primeiros roles/admins reais?
7. Qual caminho operacional usar se o banco real tiver dados antigos em `run_logs`: migracao, view temporaria ou deprecacao simples?

## Recomendacao final

Executar Onda 0 curta antes de qualquer edicao de produto.

Depois, implementar Onda 1 pequena:

```text
Eventos local-first + interesse local + sem backend novo
```

Essa e a rota com melhor relacao entre visao de produto e risco tecnico. Ela valida o mapa como centro comercial/social sem quebrar a experiencia de corrida urbana.
