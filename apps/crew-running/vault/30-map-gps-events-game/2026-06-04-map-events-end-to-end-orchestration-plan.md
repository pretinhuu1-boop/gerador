# Map Events - End-to-End Orchestration Plan

Data: 2026-06-04
App: `apps/crew-running`
Status: plano de execucao. Nenhuma implementacao feita neste arquivo.

## Objetivo

Criar um plano fechado para orquestrar de ponta a ponta a primeira expansao map-centric do The Crew Running:

```text
Mapa -> Eventos -> Hosts/parceiros -> Interesse/lead -> Futuro: booking/video/pagamento/comissao
```

Este plano deve permitir executar uma primeira onda sem rediscutir arquitetura basica.

## Decisoes Travadas

1. O mapa e o centro do produto.
2. A primeira camada nova do mapa sera `Eventos`.
3. Profissionais, lojas e marcas entram primeiro como hosts/parceiros de eventos.
4. MVP nao tem pagamento, checkout, videochamada interna ou marketplace.
5. MVP precisa preparar caminho para pagamentos, booking, salas, publicidade, produtos proprios e comissao futura.
6. O usuario interage com o mapa: toca marker/zona, abre sheet, toma acao.
7. A primeira acao comercial e `Tenho interesse` / `Pedir contato`.
8. Dados de GPS brutos nunca alimentam discovery comercial.
9. Rotas, horarios e localizacao pessoal sao redigidos/agregados por padrao.
10. Admin/operacao existe, mas nao pode transformar o player-facing em SaaS.
11. Supabase privileged/admin actions passam por server/edge, nunca browser com secret.
12. RLS e `organization_id` sao obrigatorios quando virar cloud real.

## Produto MVP

### Usuario runner

Fluxo:

```text
Abre mapa
  -> liga camada Eventos
  -> ve eventos por zona
  -> toca evento
  -> abre EventSheet
  -> salva ou marca interesse
```

Acoes MVP:

- `Ver evento`
- `Salvar`
- `Tenho interesse`
- `Pedir contato`
- `Reportar`

### Host profissional/marca

No MVP inicial com fixtures:

- aparece como host/parceiro de evento;
- nao cria evento ainda no front publico;
- nao recebe pagamento;
- nao abre videochamada.

Quando virar cloud:

- pode criar evento;
- pode ver leads do proprio evento;
- pode editar evento proprio;
- passa por moderacao/verificacao.

### Admin

No MVP fixture:

- valida UX, risco e estados.

Quando virar cloud:

- aprova/rejeita evento;
- verifica perfil;
- ve reports;
- audita leads;
- controla destaque.

## Escopo da Primeira Implementacao Recomendada

Primeira implementacao deve ser UX/local-first, sem migrations:

- adicionar camada `events` ao mapa;
- criar fixtures de eventos;
- renderizar markers;
- abrir `EventSheet`;
- adicionar CTA local `Tenho interesse`;
- mostrar eventos no `ZoneSheet`;
- preservar mobile/game feel;
- validar com typecheck, tests e browser.

Nao entra na primeira implementacao:

- Supabase schema novo;
- pagamento;
- videochamada;
- checkout;
- criacao publica de evento;
- admin full;
- profissionais/marcas como camadas independentes;
- lead real com PII.

## Arquitetura Front-End Onda 1

### Arquivos novos

```text
data/mapEvents.ts
components/map/EventSheet.tsx
services/mapInterestStorage.ts
```

Possivel arquivo novo se o canvas ficar grande demais:

```text
components/map/EventLayer.tsx
```

### Arquivos modificados

```text
components/map/mapTypes.ts
services/mapLayerStorage.ts
components/map/LayerRail.tsx
components/map/MapLibreCanvas.tsx
components/map/MapStage.tsx
components/map/ZoneSheet.tsx
index.css
```

### Testes esperados

```text
data/__tests__/mapEvents.test.ts
services/__tests__/mapInterestStorage.test.ts
components/map/__tests__/LayerRail.test.tsx
components/map/__tests__/MapStage.test.tsx
components/map/__tests__/EventSheet.test.tsx
```

## Contratos de Dados Front-End

### Event type

```ts
export type MapEventType =
  | 'crew-run'
  | 'training'
  | 'race'
  | 'run-party'
  | 'store-activation'
  | 'workshop'
  | 'challenge';

export type MapEventCommercialStatus = 'community' | 'sponsored' | 'partner';

export type MapEvent = {
  id: string;
  title: string;
  description: string;
  eventType: MapEventType;
  startsAt: string;
  endsAt?: string;
  zoneId: SpZoneId;
  spotId?: string;
  lng: number;
  lat: number;
  hostName: string;
  hostHandle: string;
  hostType: 'runner' | 'coach' | 'store' | 'brand' | 'club' | 'event_creator';
  crewSlugs: string[];
  tags: string[];
  capacity?: number;
  verificationStatus: 'unverified' | 'verified' | 'trusted';
  moderationStatus: 'approved';
  commercialStatus: MapEventCommercialStatus;
  ctaMode: 'interest' | 'contact-request' | 'external-link';
};
```

### Interest type

```ts
export type MapEventInterest = {
  eventId: string;
  interestedAt: number;
  status: 'interested';
};
```

MVP local key:

```text
crew.map_event_interest
```

Regra:

- salvar so `eventId`, timestamp e status;
- nao salvar telefone/email;
- nao criar lead com PII no MVP local.

## Comportamento de UI

### LayerRail

Camadas Onda 1:

```text
Territorio
Live
Missoes
Historia
Eventos
```

Default recomendado:

- desktop: `events=true`;
- mobile: `events=false` ou `events=true` leve, dependendo do peso visual.

Decisao pratica para primeira implementacao:

- `events=false` por default para nao alterar drasticamente o mapa atual;
- mas mostrar chip claro para ativar.

### Marker de evento

Visual:

- marker distinto de mission marker;
- cor baseada em `commercialStatus` e/ou crew;
- evento patrocinado precisa label/estado visual discreto;
- nao usar card flutuante grande no mapa.

Estados:

- community;
- partner;
- sponsored;
- saved/interested;
- focused.

### EventSheet

Conteudo:

- tipo;
- titulo;
- host;
- handle;
- zona;
- data/hora;
- tags;
- crews relacionadas;
- status verificado;
- label comercial se houver;
- descricao curta.

Acoes:

- `Tenho interesse`
- `Salvar`
- `Pedir contato` se `ctaMode=contact-request`
- `Reportar`

Estados:

- interessado;
- lotado/capacidade futura;
- evento passado;
- patrocinado;
- nao verificado.

### ZoneSheet

Adicionar bloco:

```text
Eventos nesta zona
  - proximos 3 eventos
  - CTA Ver todos
```

Nao transformar ZoneSheet em painel comercial. O bloco precisa parecer uma extensao natural do mapa.

## Orquestracao de Implementacao

### Passo 0 - Pre-flight

Comandos:

```bash
cd "/Users/belissima/Desktop/running crew"
git status --short
cd apps/crew-running
npm run typecheck
npm run test -- --pool=threads --maxWorkers=1
npm run build
```

Objetivo:

- registrar baseline;
- nao reverter diffs existentes;
- identificar falhas preexistentes.

### Passo 1 - Dados fixture

Criar `data/mapEvents.ts`:

- 5 a 8 eventos;
- pelo menos um por tipo principal:
  - treino de crew;
  - run-party;
  - ativacao de loja;
  - workshop profissional;
  - challenge;
- todos com `zoneId` valido;
- coordenadas dentro da zona/spot;
- hosts com `hostHandle`;
- `commercialStatus` variado.

Testes:

- ids unicos;
- zoneId valido;
- coordenadas presentes;
- evento patrocinado tem label/status;
- ctaMode valido.

### Passo 2 - Layer state

Modificar:

- `components/map/mapTypes.ts`;
- `services/mapLayerStorage.ts`;
- `components/map/LayerRail.tsx`.

Adicionar:

- `events: boolean`;
- default;
- validacao de storage com back-compat;
- botao `Eventos`.

Testes:

- storage antigo sem `events` nao quebra;
- nenhum estado permite todas camadas off;
- LayerRail chama `onToggle('events')`.

### Passo 3 - Render dos markers

Modificar `MapLibreCanvas.tsx`:

- receber `events?: MapEvent[]`;
- receber `focusedEventId?: string | null`;
- receber `onSelectEvent?: (eventId: string) => void`;
- projetar marker;
- renderizar apenas se `layers.events`;
- marker clicavel com `aria-label`.

Regra:

- nao renderizar eventos durante tracking se poluir corrida;
- ou renderizar em modo discreto se decisao for manter contexto.

Recomendacao:

- durante tracking, esconder eventos.

### Passo 4 - Sheet state

Modificar `MapStage.tsx`:

```ts
type SheetState =
  | { type: 'zone'; zoneId: SpZoneId }
  | { type: 'spot'; spotId: string }
  | { type: 'crew'; crewSlug: string }
  | { type: 'runner'; friendUserId: string }
  | { type: 'event'; eventId: string }
  | null;
```

Adicionar:

- `eventsForView`;
- `visibleEvents`;
- `focusedEventId`;
- handlers `handleEventClick`, `handleEventInterest`;
- render `EventSheet`.

### Passo 5 - EventSheet

Criar `components/map/EventSheet.tsx`.

Props:

```ts
type Props = {
  event: MapEvent;
  interested: boolean;
  onInterest: (eventId: string) => void;
  onClose: () => void;
  onReport?: (eventId: string) => void;
};
```

Sem chamadas cloud na Onda 1.

### Passo 6 - Interest local

Criar `services/mapInterestStorage.ts`:

- `getEventInterests()`;
- `hasEventInterest(eventId)`;
- `markEventInterest(eventId)`;
- `clearEventInterest(eventId)`.

Sem PII.

### Passo 7 - ZoneSheet com eventos

Modificar `ZoneSheet.tsx` para receber eventos da zona ou criar bloco externo no `MapStage`.

Recomendacao para escopo:

- passar `events?: MapEvent[]`;
- exibir ate 3;
- CTA opcional `onSelectEvent`.

### Passo 8 - CSS

Adicionar classes:

```text
.maplibre-event
.maplibre-event--community
.maplibre-event--partner
.maplibre-event--sponsored
.event-sheet
.event-sheet__...
.zone-sheet__events
```

Design:

- manter linguagem game/street;
- sem cards SaaS;
- sem anuncio chamativo demais;
- label patrocinado claro, mas discreto.

### Passo 9 - Validacao

Comandos:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run typecheck
npm run test -- --pool=threads --maxWorkers=1
npm run build
```

Se tocar creator, tambem:

```bash
npm run validate
```

Mas Onda 1 de eventos nao deve tocar creator.

Browser:

- abrir app local;
- entrar no mapa;
- ativar `Eventos`;
- clicar marker;
- abrir sheet;
- marcar interesse;
- recarregar e confirmar estado local;
- testar mobile viewport;
- testar tracking nao poluido.

## Criterios de Aceite Onda 1

Funcionais:

- Camada `Eventos` existe.
- Eventos aparecem no mapa apenas quando camada esta ativa.
- Clicar evento abre `EventSheet`.
- `Tenho interesse` persiste localmente sem PII.
- `ZoneSheet` mostra eventos da zona.
- Eventos patrocinados/parceiros aparecem com label.
- Mapa continua funcionando sem eventos.

Privacidade:

- Nenhuma rota GPS bruta aparece.
- Nenhum telefone/email e salvo no localStorage.
- Nenhuma key/secrets nova.

Produto:

- Mapa continua sendo tela principal.
- Eventos parecem parte da cidade, nao anuncio solto.
- Mobile nao vira shopping.
- Profissionais/marcas aparecem contextualizados pelo evento.

Tecnico:

- Typecheck passa ou falhas preexistentes documentadas.
- Testes passam ou falhas preexistentes documentadas.
- Build passa.
- Sem alteracao no creator.
- Sem regressao nas camadas existentes.

## Onda 2 - Cloud/Leads

So depois de UX aprovada.

### Supabase tables

```text
running_events
event_partners
event_interest
lead_requests
moderation_reports
admin_audit_log
```

### RLS minima

- `running_events`: leitura de eventos `approved/public` para autenticados.
- `event_interest`: usuario ve/escreve o proprio interesse.
- `lead_requests`: criador ve proprio lead; host ve leads dos seus eventos; admin ve por membership.
- `moderation_reports`: usuario cria; admin le.
- `admin_audit_log`: admin le; somente server escreve.

### Edge Functions

```text
create_event_interest
create_lead_request
admin_approve_event
admin_reject_event
admin_list_event_reports
```

Regras:

- validar JWT;
- checar membership quando admin;
- gravar audit para admin/sensivel;
- nao usar `user_metadata` para autorizacao;
- nunca expor `service_role` no browser.

## Onda 3 - Commerce

Entram so apos Onda 2 madura:

- bookings;
- video_rooms;
- transactions;
- transaction_commissions;
- sponsorship_offers;
- partner_offers;
- ad_campaigns;
- map_promotions.

Regra:

- qualquer pagamento/transacao e server-only;
- Stripe/checkout futuro exige webhook assinado;
- comissao precisa ledger/audit;
- video room precisa agenda/permissao/retencao.

## Riscos e Mitigacoes

| Risco | Mitigacao |
| --- | --- |
| Mapa virar classificado visual | Eventos primeiro; profissionais/marcas como contexto |
| Mobile perder foco de corrida | Esconder eventos durante tracking e manter layer off por default se necessario |
| Comercial sem compliance | Label sponsored/partner desde fixture |
| Dados pessoais virarem lead cedo demais | Onda 1 sem PII; Onda 2 com RLS/Edge |
| Schema crescer demais | Comecar fixtures; migrar so depois de UX validada |
| Admin vazar para player-facing | Admin separado/protegido; privileged server-only |

## Prompt de Execucao Futuro

Quando for implementar, usar:

```text
Implemente a Onda 1 do plano:
/Users/belissima/Desktop/running crew/apps/crew-running/vault/2026-06-04-map-events-end-to-end-orchestration-plan.md

Escopo:
- adicionar camada Eventos ao mapa;
- criar fixtures em data/mapEvents.ts;
- renderizar markers em MapLibreCanvas;
- criar EventSheet;
- conectar EventSheet no MapStage;
- persistir "Tenho interesse" localmente sem PII;
- mostrar eventos no ZoneSheet;
- atualizar testes;
- validar com typecheck, test e build.

Nao implementar Supabase novo, pagamento, videochamada, checkout, admin full ou creator.
Nao reverter mudancas existentes.
```

## Fontes Tecnicas Usadas

- Supabase RLS: enable RLS em tabelas expostas, policies por usuario/ownership e `WITH CHECK` para updates/inserts.
- Supabase Auth metadata: `user_metadata` nao deve controlar autorizacao; usar dados server/table/app metadata confiavel.
- Supabase Edge Functions: funcoes autenticadas recebem JWT do usuario e privileged work deve ficar server-side.
