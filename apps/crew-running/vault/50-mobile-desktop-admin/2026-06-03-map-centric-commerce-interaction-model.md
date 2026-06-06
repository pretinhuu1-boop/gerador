# Map-Centric Commerce and Interaction Model

Data: 2026-06-03
App: `apps/crew-running`
Status: decisao de produto e modelo de interacao. Nenhuma implementacao autorizada.

## Decisao Central

O mapa e o centro do produto.

Mobile e desktop mudam a intensidade e o contexto, mas tudo deve orbitar o mapa:

- quem esta correndo;
- quais crews dominam areas;
- quais atletas se destacam;
- quais profissionais atendem naquela regiao;
- quais lojas, marcas, suplementos, clubes e eventos existem perto;
- quais oportunidades comerciais aparecem a partir do comportamento real e agregado;
- quais acoes o usuario, profissional, marca ou admin pode tomar.

O MVP pode nascer sem pagamento, mas a arquitetura de produto deve apontar para transacoes dentro do app no futuro. O objetivo de negocio e capturar porcentagem sobre transacoes, patrocinios, servicos, produtos, eventos, publicidade e ativacoes.

## Principio de Produto

```text
Mapa = jogo + rede + operacao + comercio contextual.
```

O erro seria criar um dashboard separado que so mostra tabelas. O desktop pode ser operacional, mas a linguagem operacional deve continuar conectada ao mapa.

## MVP vs Futuro

### MVP

- Sem checkout.
- Sem pagamento interno.
- Sem marketplace completo.
- Sem videochamada interna obrigatoria.
- Sem exposicao de rota bruta.

O MVP deve ter:

- mapa 2D editavel como superficie principal;
- perfis com handle/tags;
- profissionais/marcas/eventos como entidades no mapa;
- folhas/sheets de detalhes ao clicar;
- pedido de contato/lead;
- status de verificacao;
- rotas e metricas redigidas/agregadas;
- admin read-only de risco, sync, perfis e mapa.

### Futuro

- pagamentos dentro do app;
- comissao por transacao;
- salas de videochamada;
- agenda/booking;
- produtos proprios;
- publicidade e patrocinio;
- eventos pagos;
- cupons/ofertas;
- marketplace controlado;
- analytics para marcas;
- campanhas por territorio.

## Como Isso Aparece no Mapa

O mapa deve ter camadas, nao uma tela lotada de anuncios.

### Camadas sugeridas

1. `Territorio`
   - dominios por crew;
   - tinta/ownership;
   - areas disputadas;
   - heatmap agregado.

2. `Runners`
   - atletas em destaque;
   - amigos/conexoes;
   - runners com opt-in para parceria;
   - nunca rota bruta por padrao.

3. `Profissionais`
   - coaches;
   - personal trainers;
   - fisios;
   - nutricionistas;
   - recovery;
   - medicos/verificados.

4. `Lojas & Marcas`
   - lojas fisicas;
   - marcas;
   - suplementos;
   - equipamentos;
   - produtos proprios.

5. `Eventos`
   - treinos;
   - provas;
   - corrida-festa;
   - ativacoes de loja;
   - encontros de crew;
   - eventos patrocinados.

6. `Ofertas`
   - cupons;
   - teste gratuito;
   - avaliacao;
   - produto destacado;
   - lead/contact.

7. `Admin/Risco`
   - perfis pendentes;
   - eventos aguardando aprovacao;
   - reports;
   - sync falhado;
   - rotas redigidas;
   - assets quebrados.

## O Que o Usuario Aperta

### Runner comum

No mapa:

- toca em uma zona;
- ve dominio, crew, eventos e profissionais daquela area;
- toca em um profissional/marca/evento;
- abre um sheet;
- pode salvar, pedir contato, seguir/conectar, participar de evento ou ver detalhes.

Acoes MVP:

- `Ver perfil`
- `Pedir contato`
- `Salvar`
- `Ver eventos da zona`
- `Conectar`
- `Reportar`

Futuro:

- `Agendar`
- `Comprar`
- `Entrar na sala`
- `Usar cupom`
- `Participar`

### Profissional runner

No mapa:

- aparece como runner e como profissional, dependendo da camada/filtro;
- pode vincular local de atendimento;
- pode ativar area de atendimento;
- pode receber pedido de contato;
- pode criar evento simples;
- pode no futuro abrir sala/videochamada.

Acoes MVP:

- `Editar perfil profissional`
- `Definir areas atendidas`
- `Vincular local`
- `Ver pedidos`
- `Criar evento`

Futuro:

- `Abrir agenda`
- `Atender por video`
- `Cobrar consulta`
- `Publicar oferta`

### Marca/loja/suplemento

No mapa:

- ve territorio e comportamento agregado;
- encontra atletas/crews/eventos por zona;
- pode pedir contato ou propor parceria;
- pode criar ativacao local.

Acoes MVP:

- `Ver zona`
- `Ver atletas com opt-in`
- `Pedir contato`
- `Criar evento/ativacao`
- `Publicar oferta sem checkout`

Futuro:

- `Patrocinar atleta`
- `Comprar midia na zona`
- `Criar campanha`
- `Vender produto`
- `Emitir cupom`

### Admin interno

No mapa:

- ve status operacional por camada;
- aprova/verifica perfis;
- modera eventos/ofertas;
- acompanha sync e risco;
- ve crescimento por zona/setor.

Acoes MVP:

- `Aprovar perfil`
- `Bloquear destaque`
- `Ver reports`
- `Ver sync`
- `Ver auditoria`

Futuro:

- `Aprovar campanha`
- `Ativar publicidade`
- `Auditar transacao`

## Sheets do Mapa

Cada clique no mapa deve abrir um sheet contextual.

### Zone Sheet

Mostra:

- crew dominante;
- porcentagem de dominio;
- runners em destaque por opt-in;
- eventos ativos;
- profissionais proximos;
- lojas/marcas;
- ofertas;
- alertas admin se for admin.

### Runner/Athlete Sheet

Mostra:

- handle;
- crew;
- tags;
- badges;
- zonas de atuacao/agregado;
- disponibilidade para parceria;
- botao de contato;
- patrocinadores aceitos, se houver.

Nao mostra:

- rota bruta;
- horarios exatos de treino;
- endereco inferivel.

### Professional Sheet

Mostra:

- handle;
- setor;
- verificacao;
- local/areas atendidas;
- services;
- eventos/ofertas;
- contato/lead;
- sala/video no futuro.

### Brand/Store Sheet

Mostra:

- local;
- ofertas;
- eventos;
- atletas patrocinados;
- produtos;
- contato/lead;
- label comercial.

### Event Sheet

Mostra:

- tipo de evento;
- host;
- zona/local;
- data/hora;
- capacidade;
- regras;
- patrocinio;
- interesse/participacao;
- contato/inscricao externa no MVP.

## Como Editar o Mapa 2D

Arquivos principais hoje:

- `components/map/MapStage.tsx`
- `components/map/MapLibreCanvas.tsx`
- `components/map/ZoneSheet.tsx`
- `components/map/SpotSheet.tsx`
- `components/map/CrewSheet.tsx`
- `components/map/MapMissionPanel.tsx`
- `components/map/MapHistoryPanel.tsx`
- `components/map/LayerRail.tsx`
- `data/spLiveMap.ts`
- `data/spGeoJSON.ts`
- `data/crews.ts`
- `data/missions.ts`
- `services/mapLayerStorage.ts`

Para editar camadas:

- adicionar estado em `mapTypes.ts`;
- adicionar botao em `LayerRail.tsx`;
- persistir em `mapLayerStorage.ts`;
- renderizar markers/camada em `MapLibreCanvas.tsx`;
- abrir sheet via `MapStage.tsx`.

Para editar zonas/spots:

- `data/spLiveMap.ts`;
- `data/spGeoJSON.ts`;
- testes em `data/spLiveMap.test.ts` e `data/spGeoJSON.test.ts`.

Para adicionar uma nova entidade de mapa:

1. criar tipo em `data/`;
2. criar dados fixture/MVP;
3. criar camada visual no canvas;
4. criar sheet;
5. conectar clique no `MapStage`;
6. adicionar filtro no `LayerRail`;
7. testar desktop/mobile.

## Modelo de Dados Futuro

Dominios separados:

- `profiles`
- `profile_roles`
- `wellness_profiles`
- `wellness_locations`
- `wellness_services`
- `athlete_sponsorships`
- `sponsorship_offers`
- `running_events`
- `event_hosts`
- `partner_offers`
- `lead_requests`
- `video_rooms`
- `bookings`
- `transactions`
- `ad_campaigns`
- `map_promotions`
- `admin_audit_log`

Para MVP, nao criar tudo de uma vez. Mas os nomes ajudam a evitar gambiarra em `friends` ou `identity_events`.

## Ordem Logica de Implementacao

### Onda 0 - Modelo de mapa

- Definir camadas canonicas.
- Definir entidade clicavel: runner, profissional, marca, evento, oferta.
- Definir sheets.
- Definir privacy rules.
- Definir schema futuro sem implementar tudo.

### Onda 1 - Mapa MVP sem pagamento

- `Profissionais` layer com fixtures/controlado.
- `Eventos` layer com fixtures/controlado.
- `Lojas & Marcas` layer com fixtures/controlado.
- Sheets com `Pedir contato`.
- Admin read-only.
- Sem checkout.
- Sem videochamada interna.

### Onda 2 - Leads e moderacao

- Pedido de contato real.
- Moderacao/verificacao.
- Eventos reais sem pagamento.
- Ofertas catalogo.
- Audit log.

### Onda 3 - Transacoes

- Booking.
- Video rooms.
- Checkout.
- Comissao.
- Patrocinio de atleta.
- Publicidade por zona.
- Produtos proprios.

## Decisoes Recomendadas Agora

1. Mapa e a home mental do produto.
2. Desktop deve abrir em mapa + area do usuario, nao em tabela admin.
3. MVP nao tem pagamento, mas todo schema deve prever transacao futura.
4. Profissionais/marcas/eventos aparecem como camadas do mapa.
5. O usuario sempre clica no mapa primeiro e abre um sheet.
6. Contato no MVP e lead/pedido de contato.
7. Pagamento, videochamada e publicidade ficam como destino arquitetural, nao Onda 1.

## Pergunta Principal Para Fechar

Qual e a primeira camada nova do mapa MVP?

Opcoes:

1. `Profissionais`
2. `Eventos`
3. `Lojas & Marcas`
4. `Atletas/Parcerias`

Recomendacao: comecar por `Eventos` ou `Profissionais`.

Eventos provam o mapa como cidade viva. Profissionais provam monetizacao futura por servico. O ideal e escolher uma para Onda 1, para nao abrir quatro frentes ao mesmo tempo.
