# Auditoria de codigo para orquestracao map-centric

Data: 2026-06-04
App: `apps/crew-running`
Escopo: auditoria antes de implementar a primeira onda de mapa/eventos/rede wellness.

## Objetivo

Checar as duvidas do codigo para aumentar a previsibilidade da orquestracao:

- qual caminho do mapa esta ativo;
- onde uma camada de eventos/profissionais entra com menor risco;
- quais storages e testes quebram quando uma camada nova nasce;
- quais limites de Supabase/schema impedem admin/backend agora;
- quais validacoes ja passam e quais estao instaveis no ambiente local.

Nao foi feita implementacao de produto nesta auditoria.

## Resumo executivo

Recomendacao mantida: a primeira entrega deve ser uma camada local-first de `Eventos` no mapa, sem pagamento, sem video, sem marketplace real e sem Supabase novo.

A recomendacao ficou mais precisa:

1. Nao criar um modelo generico grande de `MapEntity` na Onda 1.
   Criar `MapEvent` simples primeiro. Profissionais, marcas e lojas entram como `host`/`partner` do evento ou como fixtures futuras.
2. Nao tocar em admin/backend antes de reconciliar schema.
   O drift `runs` versus `run_logs` esta confirmado no codigo.
3. Nao mostrar eventos durante corrida ativa.
   `MapStage` ja esconde `LayerRail`, radio e acoes quando `trackerActive`; eventos devem seguir a mesma regra.
4. Adicionar `events` como camada desligada por default.
   Isso reduz risco de alterar a experiencia publica existente.
5. Atualizar storage, UI e testes juntos.
   `MapLayerState`, `mapLayerStorage`, `LayerRail`, `MapStage` e testes sao acoplados.
6. Antes de novos testes em `ZoneSheet`, mockar/desacoplar `ZoneLeaderboard`.
   O teste de sheets ficou preso no ambiente local; o ponto mais suspeito e o componente de ranking/Supabase dentro do sheet.

## Caminho ativo do mapa

Arquivos ativos para a experiencia principal:

- `components/launch/CrewLaunchExperience.tsx`
- `components/map/MapStage.tsx`
- `components/map/MapLibreCanvas.tsx`
- `components/map/LayerRail.tsx`
- `components/map/ZoneSheet.tsx`
- `components/map/SpotSheet.tsx`
- `components/map/CrewSheet.tsx`
- `components/map/RunnerCard.tsx`
- `components/map/MapMissionPanel.tsx`
- `components/map/MapHistoryPanel.tsx`
- `services/mapLayerStorage.ts`
- `components/map/mapTypes.ts`
- `data/spLiveMap.ts`
- `data/spGeoJSON.ts`

Arquivos paralelos/legados que existem, mas nao devem ser o alvo principal da Onda 1:

- `components/map/MapaCidade.tsx`
- `components/map/ZoneLayer.tsx`
- `components/map/SpotLayer.tsx`
- `components/map/MissionLayer.tsx`
- `components/map/TrailLayer.tsx`
- `components/map/layers/*`

Conclusao: a Onda 1 deve tocar `MapStage + MapLibreCanvas + LayerRail`, nao refatorar `MapaCidade` nem as layers SVG antigas.

## Fluxo atual ate o mapa

`App.tsx` renderiza `CrewLaunchExperience`.

`CrewLaunchExperience` controla as telas:

- `consoleBoot`
- `title`
- `citySignal`
- `mainMenu`
- `guidedSetup`
- `mapHome`

Ao abrir o mapa:

```text
MainMenu -> onOpenMap -> screen = mapHome -> MapStage
```

Quando a corrida termina:

```text
MapStage
  -> useRunController
  -> appendRunRecord(local)
  -> pushFinalizedRun(Supabase background)
  -> saveRunnerProgress(local)
```

Esse fluxo e importante porque eventos/profissionais no desktop nao devem acionar tracking. A camada de eventos entra no `mapHome`, mas fica passiva quando `trackerActive`.

## Estado atual de camadas

`MapLayerState` hoje:

```ts
{
  territory: boolean;
  live: boolean;
  missions: boolean;
  history: boolean;
}
```

Defaults:

```ts
territory: true
live: true
missions: false
history: false
```

`LayerRail` renderiza 4 chips:

- Territorio
- Live
- Missoes
- Historia

`mapLayerStorage` usa `crewMapLayers` e protege contra estado em que todas as camadas ficam desligadas.

Impacto de adicionar `events`:

- atualizar `MapLayerState`;
- atualizar `MapLayerPrefs`;
- atualizar defaults;
- atualizar validacao de shape em `mapLayerStorage`;
- atualizar `pick`;
- atualizar checagem `anyOn` em `MapStage`;
- atualizar `LayerRail` para 5 chips;
- trocar CSS `.map-layer-rail { grid-template-columns: repeat(4, 1fr); }`;
- atualizar testes de `LayerRail` e `mapLayerStorage`.

Recomendacao:

```ts
events: false
```

`events=false` no default evita mudar o mapa publico logo ao abrir.

## Onde eventos entram

### Dados

Criar:

- `data/mapEvents.ts`

Tipo recomendado para Onda 1:

```ts
export type MapEventStatus = 'scheduled' | 'live' | 'done';
export type MapEventKind = 'training' | 'race' | 'wellness' | 'brand' | 'community';

export interface MapEvent {
  id: string;
  title: string;
  kind: MapEventKind;
  status: MapEventStatus;
  zoneId: SpZoneId;
  coordinate: LngLat;
  startsAt: string;
  endsAt?: string;
  hostName: string;
  hostType: 'trainer' | 'doctor' | 'nutritionist' | 'store' | 'brand' | 'creator' | 'crew' | 'athlete';
  partnerNames?: string[];
  summary: string;
  ctaLabel: 'Tenho interesse' | 'Pedir contato' | 'Salvar evento';
  privacy: 'public';
}
```

Nao incluir na Onda 1:

- email;
- telefone;
- chat real;
- pagamento;
- videochamada;
- rota GPS bruta;
- foto pessoal;
- dados comerciais sensiveis.

### Canvas

`MapLibreCanvas` ja tem um padrao bom nos mission markers:

- resolve coordenada;
- calcula accent pela zona;
- renderiza `Marker`;
- suporta click e teclado;
- usa classes CSS isoladas.

Adicionar props semelhantes:

```ts
events?: MapEvent[];
focusedEventId?: string | null;
interestedEventIds?: string[];
onSelectEvent?: (eventId: string) => void;
```

Regra de visibilidade:

```text
mostrar se layers.events && !trackerActive
```

Zoom recomendado:

- city: mostrar eventos principais;
- zone: mostrar eventos da zona;
- spot: opcional, mas pode mostrar eventos proximos do spot depois.

### Stage

`MapStage` precisa ganhar:

```ts
| { type: 'event'; eventId: string }
```

e renderizar:

```tsx
<EventSheet eventId={sheet.eventId} ... />
```

`visibleEvents` deve ser filtrado no `MapStage`, nao dentro de `EventSheet`.

### Sheet

Criar:

- `components/map/EventSheet.tsx`

Usar `MapBottomSheet`, nao criar modal novo.

Acoes da Onda 1:

- `Tenho interesse`;
- `Salvar evento`;
- `Reportar` pode ser stub local ou ficar fora da primeira entrega.

Persistencia local:

- `services/mapInterestStorage.ts`
- key: `crew.map_event_interest`

Payload local:

```ts
{
  eventId: string;
  intent: 'interested' | 'saved';
  createdAt: number;
}
```

Sem PII.

### ZoneSheet

`ZoneSheet` hoje importa `SAMPLE_MISSIONS` diretamente e tambem renderiza `ZoneLeaderboard`.

Para eventos, preferir props:

```ts
events?: MapEvent[];
onSelectEvent?: (eventId: string) => void;
```

Motivo: evita acoplar `ZoneSheet` a fixtures e facilita teste.

## Riscos confirmados no mapa

### R1: camada nova quebra storage se nao atualizar tudo junto

Risco: `crewMapLayers` antigo nao tem `events`.

Mitigacao:

- `pick` precisa preencher `events` com default;
- `isShape` precisa aceitar chaves antigas;
- teste deve cobrir objeto antigo sem `events`;
- `allOff` precisa incluir `events`.

### R2: LayerRail tem grid fixo de 4 colunas

CSS atual usa `repeat(4, 1fr)`.

Mitigacao:

- trocar para `repeat(5, minmax(0, 1fr))`, ou
- `grid-template-columns: repeat(auto-fit, minmax(72px, 1fr))`.

Recomendado para previsibilidade: `repeat(5, minmax(0, 1fr))` na Onda 1.

### R3: testes de `LayerRail` assumem 4 chips

Atualizar:

- render count 4 -> 5;
- defaultLayers inclui `events`;
- novo teste de click em `Eventos`.

### R4: `ZoneSheet` pode puxar Supabase via `ZoneLeaderboard`

`ZoneSheet` renderiza `ZoneLeaderboard`.

`ZoneLeaderboard` chama `useZoneLeaderboard`.

`useZoneLeaderboard` chama:

```ts
getSupabase()
getCurrentOrgId()
from('zone_leaderboard')
```

No ambiente local, `.env` tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` preenchidos. Testes de sheet podem tentar tocar Supabase real ou ficar presos.

Mitigacao antes de adicionar teste em `ZoneSheet`:

- mockar `useLeaderboard`;
- ou permitir prop `showLeaderboard={false}` em testes;
- ou isolar `ZoneLeaderboard` atras de boundary com timeout/error state.

### R5: MapStage test com MapLibre pode ser fragil

`MapStage.test.tsx` monta `MapLibreCanvas`.

Para eventos, nao depender apenas de click em marker WebGL/MapLibre no unit test.

Teste recomendado:

- unit test de `LayerRail`;
- unit test de `mapLayerStorage`;
- unit test de `mapEvents`;
- unit test de `mapInterestStorage`;
- unit test de `EventSheet`;
- teste de `MapStage` apenas para estado de camada/sheet se houver seletor estavel;
- browser smoke separado para marker real.

## Supabase e schema

### O que existe em migrations locais

`supabase/migrations/000_user_profiles.sql` cria:

- `organizations`
- `user_profiles`
- trigger `assign_default_org`

`supabase/migrations/001_map_enhancements.sql` cria:

- `zone_leaderboard`
- `run_logs`
- `territory_snapshots`
- `user_preferences`

### O que `supabaseTypes.ts` tambem declara

Tipos incluem tabelas que nao aparecem nas migrations locais:

- `runs`
- `runner_progress`
- `run_history_stats`
- `badge_unlocks`
- `runners`
- `identity_events`
- `friends`
- `crew_radio`
- `map_layer_settings`

### O que `cloudSync.ts` escreve hoje

`pushFinalizedRun` escreve:

- `runs`
- `runner_progress`
- `run_history_stats`
- `badge_unlocks`

Nao escreve `run_logs`.

### O que `runLogStorage.ts` guarda

`runLogStorage.ts` usa localStorage `crewRunLogs`, com:

- rota;
- touched spots;
- synced flag.

Mas o save path atual de `useRunController.saveSummary` usa:

- `appendRunRecord(buildRunRecord(...))`;
- `pushFinalizedRun(...)`;

Nao usa `saveRunLog`.

Conclusao: o drift `runs` versus `run_logs` esta confirmado.

Decisao para Onda 2/backend:

1. `runs` e canonico de produto para corridas finalizadas.
2. Inspecionar banco real antes de migration nova.
3. Deprecar `run_logs`, migrar `run_logs` para `runs`, ou criar view de compatibilidade.
4. Nao manter duas fontes ativas para corridas finalizadas.
5. Nao criar eventos/admin em Supabase antes do plano de compatibilidade/migracao.

## Limites de seguranca/admin

Confirmado no codigo:

- frontend usa `VITE_SUPABASE_URL`;
- frontend usa `VITE_SUPABASE_PUBLISHABLE_KEY`;
- Supabase auth fica no client;
- `storageKey` de auth: `crew.supabase.auth`;
- `.env` local tem Gemini, ElevenLabs e Supabase preenchidos;
- creator ainda possui caminho tecnico para chave local `crew.gemini_api_key` e `VITE_GEMINI_API_KEY`;
- `RunnerCreatorTabs` atualmente usa `generateDemoCharacterSheet` no fluxo publico, nao chama Gemini real no botao principal;
- `generateCharacterSheet` real ainda existe em `crewService.ts`, mas nao aparece como caminho ativo em `RunnerCreatorTabs`.

Risco:

- qualquer admin/operacao real de creator nao deve reutilizar chave Gemini no browser;
- se `VITE_ENABLE_STUDIO_TOOLS=true`, o modal de credencial local existe;
- operacao real de creator/admin deve virar Edge/server antes.

Politica recomendada:

- Onda 1 local-first nao toca Gemini real;
- Onda 2 move geracao real/queue/health para server/edge;
- `TESTAR LOCAL` permanece, conforme contrato.

## RLS e multi-tenant

Base atual:

- `DEFAULT_ORG_ID = 00000000-0000-0000-0000-000000000001`;
- `getCurrentOrgId()` busca `user_profiles.organization_id`;
- `useLeaderboard` filtra `.eq('organization_id', orgId)`.

Riscos para admin:

1. `user_profiles` permite update do proprio perfil. A politica atual nao impede que o proprio usuario altere `organization_id` se a tabela ficar acessivel para update pelo client.
2. `zone_leaderboard` tem `organization_id`, mas writes de ranking/admin ainda nao estao desenhados.
3. `territory_snapshots` e `user_preferences` tem `organization_id`, mas as policies sao MVP e nao bastam para operacao admin.
4. Nao existe `admin_memberships`.
5. Nao existe `admin_audit_log`.

Conclusao: admin write ainda nao pode ser implementado com seguranca. Primeiro precisa de Onda 0 de schema/auth/admin-security.

## LocalStorage inventory relevante

Launch/onboarding:

- `crewConsoleBootSeen`
- `crewTitleSeen`
- `crewCitySignalSeen`
- `crewGuidedSetupComplete`
- `crewGameIntroSeen`
- `crewMainMenuSeen`
- `crewOnboardingStep`
- `crewSelectedCrewSlug`
- `crewOnboardingComplete`
- `crewRunnerCustomized`
- `crewCreatorTab`
- `crewCreatorDraft`
- legado: `crewBootSeen`

Creator/perfil:

- `crew.gemini_api_key`
- `crew.saved_character`
- `crew.identity_events`
- `crew.self_user_id`

Social:

- `crew.friends`
- `crew.crew_radio`
- `crew.friend_notes`

Corrida/gamificacao:

- `crewActiveRun`
- `crewRunLogs`
- `crewRunnerProgress`
- `crew.run_history_stats`
- `crew.run_records`
- `crew.active_missions`
- `crew.completed_missions`
- `crew.run_diary`

Mapa:

- `crewMapLayers`
- `crewMapTheme`

Sync:

- `crewSync_<channel>`

Nova Onda 1:

- `crew.map_event_interest`

## Validacoes executadas

Comandos e resultados:

```bash
cd apps/crew-running && npx tsc --noEmit --pretty false --incremental false
```

Resultado: passou, codigo 0, sem erros impressos.

```bash
cd apps/crew-running && npx vitest run services/mapLayerStorage.test.ts data/spLiveMap.test.ts data/spGeoJSON.test.ts services/__tests__/syncQueue.test.ts --pool=forks --maxWorkers=1
```

Resultado: passou.

```text
Test Files  4 passed (4)
Tests       36 passed (36)
Duration    37.52s
```

```bash
cd apps/crew-running && npx vitest run components/map/__tests__/LayerRail.test.tsx --pool=forks --maxWorkers=1
```

Resultado: passou.

```text
Test Files  1 passed (1)
Tests       5 passed (5)
Duration    789ms
```

## Validacoes que ficaram instaveis

```bash
git status --short
```

Falhou:

```text
fatal: .git/index: unable to map index file: Operation timed out
```

Impacto: estado do worktree nao ficou confiavel por CLI nesta auditoria.

```bash
cd apps/crew-running && npm run typecheck
```

Primeira execucao ficou tempo demais sem saida e foi encerrada. Depois `npx tsc --noEmit --pretty false --incremental false` passou.

```bash
cd apps/crew-running && npx vitest run components/map/__tests__/LayerRail.test.tsx components/map/__tests__/MapStage.test.tsx components/map/__tests__/sheets.test.tsx services/mapLayerStorage.test.ts data/spLiveMap.test.ts data/spGeoJSON.test.ts services/__tests__/syncQueue.test.ts hooks/__tests__/useRunController.test.tsx --pool=threads --maxWorkers=1
```

Ficou preso e foi encerrado.

```bash
cd apps/crew-running && npx vitest run components/map/__tests__/sheets.test.tsx --pool=forks --maxWorkers=1
```

Ficou preso e foi encerrado.

```bash
cd apps/crew-running && npm run build
```

Ficou preso durante `vite build` apos:

```text
vite v6.4.2 building for production...
transforming...
```

Foi encerrado apos aproximadamente 1m30 sem nova saida. O diretorio `apps/crew-running/dist` existe/foi tocado pelo build antes do encerramento.

`rg` amplo de secret scan tambem ficou preso por I/O e foi encerrado.

Conclusao de validacao: ha sinais de I/O local instavel/lento neste checkout. Para uma implementacao futura, rodar validacoes em ordem curta, com logs claros, e nao interpretar suite travada como falha de produto sem isolar o teste.

## Ajuste no plano de Onda 1

Ordem recomendada de implementacao futura:

1. Preparar testes/infra local
   - atualizar ou mockar `ZoneLeaderboard` em testes de sheets;
   - garantir que testes nao batem Supabase real por causa do `.env`;
   - confirmar `git status` funcionando numa janela limpa.

2. Dados e storage
   - criar `data/mapEvents.ts`;
   - criar `services/mapInterestStorage.ts`;
   - testes puros para ambos.

3. Camada de UI
   - atualizar `MapLayerState`;
   - atualizar `mapLayerStorage`;
   - atualizar `LayerRail`;
   - atualizar CSS do rail para 5 colunas;
   - testes de storage e rail.

4. Mapa
   - adicionar props de eventos em `MapLibreCanvas`;
   - renderizar markers com classe `maplibre-event`;
   - esconder eventos quando `trackerActive`.

5. Sheet e zona
   - criar `EventSheet`;
   - adicionar `sheet.type === 'event'` em `MapStage`;
   - passar eventos filtrados para `ZoneSheet`;
   - renderizar "Eventos na zona" com CTA.

6. Validacao
   - `npx tsc --noEmit --pretty false --incremental false`;
   - testes puros de data/storage;
   - teste `LayerRail`;
   - teste `EventSheet`;
   - browser smoke do mapa se o dev server/build estiver estavel.

## Nao fazer na Onda 1

- Nao criar `/admin`.
- Nao criar `apps/crew-admin`.
- Nao criar migrations de eventos ainda.
- Nao criar pagamento, checkout ou comissao.
- Nao criar videochamada/salas.
- Nao criar marketplace de produtos.
- Nao expor rota GPS bruta.
- Nao mover creator agora.
- Nao editar `CREATOR_CONTRACT` nem mexer nos slots/runner types.
- Nao refatorar `MapaCidade`/layers antigas.

## O que desbloqueia Onda 2

Antes de cloud/admin:

1. Inspecionar banco real via Supabase link/MCP autenticado.
2. Atualizar Supabase CLI ou usar MCP/psql equivalente.
3. Executar plano `runs` canonico / `run_logs` legado.
4. Criar `admin_memberships`.
5. Criar `admin_audit_log`.
6. Travar `user_profiles.organization_id` contra self-update indevido.
7. Definir `organization_memberships` para perfis comerciais/profissionais.
8. Definir Edge Functions para acoes sensiveis.
9. Definir politica de redacao para rota, foto, email, mensagens e notas.

## Decisao recomendada final

Para maximizar previsibilidade:

```text
Onda 1 = Eventos local-first no mapa
Onda 2 = schema/auth/admin-security
Onda 3 = perfis wellness, leads e moderacao
Onda 4 = transacoes, video, patrocinios e marketplace
```

O produto pode continuar com o mapa como centro. A implementacao deve comecar pelo menor objeto comercial que ja faz sentido no mapa: evento de corrida/wellness com interesse local, nao por marketplace completo.
