# Map Events - Plano de Acao, Orquestracao e Execucao

Data: 2026-06-04
App: `apps/crew-running`
Status: plano operacional para continuar a implementacao. Nao e autorizacao para entrar em cloud/admin antes da Onda 1 fechar.

## Objetivo

Fechar a Onda 1 da expansao map-centric:

```text
Mapa -> camada Eventos -> EventSheet -> interesse local -> eventos por zona
```

Depois disso, preparar a Onda 2 com Supabase, RLS, leads, moderacao e audit log.

O produto continua com esta divisao:

- mobile: corrida, GPS, jogo urbano e mapa vivo;
- desktop: mapa operacional/social/comercial, sem virar SaaS no player-facing;
- admin: interno, protegido e com operacoes privilegiadas apenas via server/edge.

## Estado Atual Confirmado

Ja existe em codigo:

- camada `events` em `MapLayerState`;
- botao `Eventos` no `LayerRail`;
- fixtures em `data/mapEvents.ts`;
- perfis wellness em `data/wellnessNetwork.ts`;
- marker de eventos no `MapLibreCanvas`;
- sheet de evento em `components/map/EventSheet.tsx`;
- estado local de interesse em `services/mapEventInterestStorage.ts`;
- eventos escondidos durante tracking;
- testes focados de dados, sheet, layer e stage.

Ainda nao esta fechado:

- `ZoneSheet` ainda nao mostra eventos da zona;
- eventos ainda nao tem contrato completo de `commercialStatus`, `verificationStatus`, `moderationStatus` e `ctaMode`;
- `EventSheet` ainda tem so um CTA principal, sem `Pedir contato` separado e sem `Reportar`;
- falta revisar visual final no browser depois do ultimo ajuste de sheet;
- falta validacao limpa depois do ajuste final;
- falta isolar a entrega no meio de uma arvore git muito carregada.

## Regras Nao Negociaveis

- Nao tocar creator nesta rodada.
- Nao tocar Supabase schema na Onda 1.
- Nao criar pagamento, checkout, videochamada, marketplace ou public event creation.
- Nao salvar telefone, email, rota GPS bruta, foto ou mensagem privada no localStorage.
- Nao expor `service_role`, secret key ou operacao admin no browser.
- Nao usar `user_metadata` para autorizacao futura.
- Nao transformar o mapa publico em dashboard SaaS.
- Nao reverter mudancas que ja existiam fora do escopo.

## Ordem de Execucao Recomendada

### Passo 0 - Baseline e isolamento

Objetivo: entender o que esta quebrado antes de editar.

Comandos:

```bash
cd "/Users/belissima/Desktop/running crew"
git status --short
cd apps/crew-running
npm run typecheck -- --pretty false --incremental false
npx vitest run \
  data/__tests__/mapEvents.test.ts \
  data/__tests__/wellnessNetwork.test.ts \
  services/mapEventInterestStorage.test.ts \
  components/map/__tests__/EventSheet.test.tsx \
  components/map/__tests__/LayerRail.test.tsx \
  components/map/__tests__/MapStage.test.tsx \
  --pool=forks --maxWorkers=1 --reporter=verbose
CREW_DISABLE_PWA=1 npm run build
```

Se algum comando falhar por causa preexistente, registrar exatamente:

- comando;
- erro;
- arquivo envolvido;
- se bloqueia ou nao a Onda 1.

Nao corrigir falhas fora do escopo sem decisao explicita.

### Passo 1 - Completar contrato de dados dos eventos

Arquivos:

```text
apps/crew-running/data/mapEvents.ts
apps/crew-running/data/__tests__/mapEvents.test.ts
```

Acao:

- adicionar campos:
  - `commercialStatus: 'community' | 'partner' | 'sponsored'`;
  - `verificationStatus: 'unverified' | 'verified' | 'trusted'`;
  - `moderationStatus: 'approved'`;
  - `ctaMode: 'interest' | 'contact-request'`;
  - `tags: string[]`;
- manter cinco eventos, um por zona;
- garantir pelo menos:
  - 1 evento community;
  - 1 evento partner;
  - 1 evento sponsored;
  - 1 host profissional;
  - 1 host loja/marca/event creator;
  - 1 host crew;
- manter coordenadas em zonas validas;
- nao adicionar links externos nem PII.

Review:

- tipos nao quebram canvas/sheet;
- teste garante ids unicos e status validos;
- `ctaMode=contact-request` nao dispara lead real na Onda 1.

### Passo 2 - Completar EventSheet

Arquivo:

```text
apps/crew-running/components/map/EventSheet.tsx
```

Acao:

- exibir status comercial discreto:
  - `Comunidade`;
  - `Parceiro`;
  - `Patrocinado`;
- exibir status de verificacao:
  - `Nao verificado`;
  - `Verificado`;
  - `Trusted`;
- exibir tags;
- manter host com handle e perfil wellness;
- trocar label `crew` em `PROFILE_KIND_LABELS` para `Crew`;
- adicionar acoes:
  - `Tenho interesse` para `ctaMode=interest`;
  - `Pedir contato` para `ctaMode=contact-request`;
  - `Reportar`;
- em Onda 1, `Pedir contato` salva apenas interesse local com estado/label diferente, sem PII;
- `Reportar` pode ser callback opcional local/no-op com texto de estado, sem backend.

Review:

- CTA nao envia dado para cloud;
- texto cabe em mobile;
- sheet rola corretamente;
- visual segue mapa/game, nao card SaaS.

### Passo 3 - Completar eventos no ZoneSheet

Arquivos:

```text
apps/crew-running/components/map/ZoneSheet.tsx
apps/crew-running/components/map/MapStage.tsx
apps/crew-running/components/map/__tests__/sheets.test.tsx
apps/crew-running/components/map/__tests__/MapStage.test.tsx
```

Acao:

- `ZoneSheet` recebe:

```ts
events?: MapEvent[];
onSelectEvent?: (eventId: string) => void;
```

- mostrar bloco:

```text
Eventos nesta zona
  proximos 3 eventos
  host/handle
  label comercial discreto
  CTA Ver eventos da zona ou abrir evento
```

- `MapStage` passa eventos filtrados por `zoneId`;
- clicar evento no `ZoneSheet` abre o mesmo `EventSheet`.

Review:

- `ZoneSheet` nao vira painel comercial;
- bloco aparece apenas quando ha eventos;
- sheet antiga continua funcionando sem prop `events`.

### Passo 4 - Ajuste visual e acessibilidade

Arquivo:

```text
apps/crew-running/index.css
```

Acao:

- criar/ajustar classes:
  - `.event-sheet__status-row`;
  - `.event-sheet__commercial`;
  - `.event-sheet__verified`;
  - `.event-sheet__actions`;
  - `.event-sheet__secondary`;
  - `.zone-sheet__events`;
  - `.zone-sheet__event`;
- garantir `MapBottomSheet` com scroll interno;
- revisar desktop, mobile e viewport estreita;
- evitar overlays que tapem CTA.

Review:

- texto nao estoura botoes;
- CTA e privacidade visiveis;
- botao `Reportar` nao compete visualmente com CTA principal;
- eventos patrocinados sao claros, mas nao parecem anuncio invasivo.

### Passo 5 - Testes focados

Arquivos esperados:

```text
apps/crew-running/data/__tests__/mapEvents.test.ts
apps/crew-running/components/map/__tests__/EventSheet.test.tsx
apps/crew-running/components/map/__tests__/sheets.test.tsx
apps/crew-running/components/map/__tests__/MapStage.test.tsx
```

Cobertura minima:

- fixtures tem status comercial/verificacao validos;
- `EventSheet` renderiza host, handle, tags, status e CTA correto;
- `Pedir contato` nao usa email/telefone;
- `Reportar` renderiza sem backend;
- `ZoneSheet` mostra eventos da zona;
- clicar evento no `ZoneSheet` abre `EventSheet`;
- tracking ativo esconde markers de eventos.

### Passo 6 - Browser QA

Rodar app:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
CREW_DISABLE_PWA=1 npm run dev -- --host 127.0.0.1 --port 4175
```

Fluxos:

1. abrir `http://127.0.0.1:4175/`;
2. entrar no mapa;
3. ativar camada `Eventos`;
4. clicar marker;
5. confirmar `EventSheet`;
6. marcar interesse;
7. recarregar e confirmar estado persistido;
8. abrir uma zona;
9. confirmar eventos da zona;
10. abrir evento a partir da zona;
11. testar viewport mobile;
12. iniciar tracking e confirmar que eventos nao poluem corrida.

Aceite visual:

- mapa continua sendo centro;
- eventos parecem parte da cidade;
- nenhum painel SaaS aparece no player-facing;
- CTA cabe e nao fica escondido;
- mobile nao fica lotado.

### Passo 7 - Validacao final

Comandos:

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run typecheck -- --pretty false --incremental false
npx vitest run \
  data/__tests__/mapEvents.test.ts \
  data/__tests__/wellnessNetwork.test.ts \
  services/mapEventInterestStorage.test.ts \
  components/map/__tests__/EventSheet.test.tsx \
  components/map/__tests__/LayerRail.test.tsx \
  components/map/__tests__/MapStage.test.tsx \
  components/map/__tests__/sheets.test.tsx \
  --pool=forks --maxWorkers=1 --reporter=verbose
CREW_DISABLE_PWA=1 npm run build
```

Nao rodar `npm run validate` se creator nao foi tocado.

## Orquestracao Por Worker

### Worker 1 - Dados e contratos

Escopo:

- `data/mapEvents.ts`;
- `data/__tests__/mapEvents.test.ts`;
- nenhum componente.

Prompt:

```text
Voce e o Worker 1 de dados da Onda 1 Eventos do The Crew Running.
Leia:
- apps/crew-running/vault/2026-06-04-map-events-action-orchestration-execution-plan.md
- apps/crew-running/data/mapEvents.ts
- apps/crew-running/data/wellnessNetwork.ts

Tarefa:
- Completar o contrato de MapEvent com commercialStatus, verificationStatus, moderationStatus, ctaMode e tags.
- Manter eventos locais fixture-only, sem Supabase, sem PII e sem links externos.
- Atualizar testes de mapEvents.

Nao tocar:
- creator;
- Supabase;
- CSS;
- componentes de mapa.

Validar:
cd "/Users/belissima/Desktop/running crew/apps/crew-running" &&
npx vitest run data/__tests__/mapEvents.test.ts data/__tests__/wellnessNetwork.test.ts --pool=forks --maxWorkers=1 --reporter=verbose
```

Reviewer:

- garante que o contrato nao abre lead real;
- garante que os status estao tipados e testados;
- garante que nao entrou PII.

### Worker 2 - EventSheet

Escopo:

- `components/map/EventSheet.tsx`;
- `components/map/__tests__/EventSheet.test.tsx`;
- classes CSS minimas relacionadas ao EventSheet se necessario.

Prompt:

```text
Voce e o Worker 2 de EventSheet da Onda 1 Eventos.
Leia:
- apps/crew-running/vault/2026-06-04-map-events-action-orchestration-execution-plan.md
- apps/crew-running/components/map/EventSheet.tsx
- apps/crew-running/data/mapEvents.ts
- apps/crew-running/data/wellnessNetwork.ts

Tarefa:
- Renderizar status comercial, status de verificacao, tags, host, handle e detalhes wellness.
- Implementar acoes locais: Tenho interesse, Pedir contato e Reportar.
- Pedir contato nao deve enviar PII nem chamar backend.
- Reportar deve ser visual/local/no-op nesta onda.
- Corrigir label crew para Crew.

Nao tocar:
- Supabase;
- creator;
- ZoneSheet;
- MapLibreCanvas.

Validar:
cd "/Users/belissima/Desktop/running crew/apps/crew-running" &&
npx vitest run components/map/__tests__/EventSheet.test.tsx --pool=forks --maxWorkers=1 --reporter=verbose
```

Reviewer:

- confere CTA e privacidade;
- confere responsividade;
- confere que nao existem fetch/cloud/admin calls.

### Worker 3 - ZoneSheet e MapStage

Escopo:

- `components/map/ZoneSheet.tsx`;
- `components/map/MapStage.tsx`;
- testes de sheets/MapStage.

Prompt:

```text
Voce e o Worker 3 de ZoneSheet/MapStage da Onda 1 Eventos.
Leia:
- apps/crew-running/vault/2026-06-04-map-events-action-orchestration-execution-plan.md
- apps/crew-running/components/map/ZoneSheet.tsx
- apps/crew-running/components/map/MapStage.tsx
- apps/crew-running/data/mapEvents.ts

Tarefa:
- Passar eventos da zona para ZoneSheet.
- Exibir bloco "Eventos nesta zona" com ate 3 eventos.
- Permitir abrir EventSheet a partir do evento listado na zona.
- Preservar layout de dominio, spots, missoes, runners e leaderboard.

Nao tocar:
- Supabase;
- creator;
- dados de fixtures exceto import/tipo necessario.

Validar:
cd "/Users/belissima/Desktop/running crew/apps/crew-running" &&
npx vitest run components/map/__tests__/sheets.test.tsx components/map/__tests__/MapStage.test.tsx --pool=forks --maxWorkers=1 --reporter=verbose
```

Reviewer:

- confirma que ZoneSheet nao virou painel SaaS;
- confirma que abrir evento pela zona funciona;
- confirma que evento nao aparece durante tracking.

### Worker 4 - Visual QA e browser

Escopo:

- `index.css`;
- ajustes pequenos em markup apenas se necessario para caber/responder.

Prompt:

```text
Voce e o Worker 4 de visual QA da Onda 1 Eventos.
Leia:
- apps/crew-running/vault/2026-06-04-map-events-action-orchestration-execution-plan.md
- apps/crew-running/index.css
- apps/crew-running/components/map/EventSheet.tsx
- apps/crew-running/components/map/ZoneSheet.tsx

Tarefa:
- Ajustar CSS de EventSheet e ZoneSheet para desktop/mobile.
- Garantir scroll interno do bottom sheet.
- Evitar texto cortado, CTA escondido e sobreposicoes.
- Manter linguagem de jogo urbano, nao SaaS.

Validar em browser:
- abrir http://127.0.0.1:4175/
- camada Eventos
- marker -> EventSheet
- zona -> eventos da zona -> EventSheet
- viewport mobile
- tracking ativo
```

Reviewer:

- usa browser;
- captura achados visuais;
- so aprova se a pagina nao estiver quebrada.

## Review Gate Apos Cada Worker

Todo worker so passa se responder:

```text
1. O que mudou?
2. Quais arquivos tocou?
3. Qual comando rodou?
4. O que passou?
5. O que falhou?
6. Existe qualquer risco de PII, GPS, secret, Supabase ou creator?
7. O reviewer confirmou?
```

Se a resposta 6 tiver qualquer risco real, parar e corrigir antes de continuar.

## Criterio De Pronto Da Onda 1

Produto:

- runner liga `Eventos` no mapa;
- ve eventos por zona;
- toca marker e abre `EventSheet`;
- abre zona e ve eventos daquela zona;
- salva interesse local;
- entende se e comunidade, parceiro ou patrocinado;
- nao ve painel SaaS.

Privacidade:

- localStorage salva so `eventId`, timestamp e status;
- nenhum telefone/email/foto/rota bruta;
- nenhum dado comercial usa GPS bruto;
- nenhuma secret aparece no bundle, console ou localStorage.

Tecnico:

- typecheck passa ou falha preexistente documentada;
- testes focados passam;
- build passa;
- browser smoke passa em desktop e mobile;
- app continua abrindo no mapa sem eventos ligados.

## Onda 2 - Preparacao Depois Do Fechamento Local

So iniciar depois da Onda 1 aprovada.

Escopo:

- Supabase schema;
- RLS;
- leads reais;
- moderacao/report;
- perfis verificados;
- audit log;
- admin read-only.

Tabelas candidatas:

```text
wellness_profiles
profile_roles
running_events
event_partners
event_interests
lead_requests
moderation_reports
admin_audit_log
organization_memberships
```

Regras Supabase:

- RLS habilitado em toda tabela exposta;
- usar `TO authenticated` com predicado de ownership/org, nunca so autenticacao;
- nao usar `user_metadata` para autorizacao;
- autorizacao admin via `organization_memberships`/`admin_memberships` ou `app_metadata` controlado por server;
- operacoes privilegiadas via Edge Function ou backend;
- se usar `SECURITY DEFINER`, manter fora de schema exposto, com `auth.uid()` check e grants explicitos;
- audit log em toda acao admin ou sensivel.

Funcoes server/edge candidatas:

```text
create_lead_request
create_event_report
admin_approve_event
admin_reject_event
admin_verify_profile
admin_list_event_reports
```

Nao fazer na Onda 2 inicial:

- pagamento;
- videochamada;
- marketplace;
- sponsorship checkout;
- compra de midia automatica.

## Onda 3 - Comercio

So depois de Onda 2 com RLS/audit funcionando.

Escopo futuro:

- booking;
- video rooms;
- pagamentos;
- produtos/ofertas/cupons;
- patrocinios;
- publicidade por zona;
- comissao da plataforma;
- compliance de marcas, menores, saude e publi.

## Sequencia Recomendada Para A Proxima Sessao

1. Rodar baseline curto.
2. Fechar dados/status dos eventos.
3. Fechar EventSheet.
4. Fechar ZoneSheet.
5. Ajustar CSS.
6. Rodar testes focados.
7. Rodar build.
8. Fazer browser QA.
9. Documentar resultado em closeout.
10. So entao discutir Onda 2.

## Closeout Esperado

Criar um fechamento curto no vault com:

```text
apps/crew-running/vault/2026-06-04-map-events-onda1-closeout.md
```

Conteudo:

- resumo do que foi implementado;
- arquivos alterados;
- comandos rodados;
- screenshots/observacoes de browser;
- riscos remanescentes;
- decisao se Onda 1 passou ou nao;
- proximo prompt para Onda 2 se passou.
