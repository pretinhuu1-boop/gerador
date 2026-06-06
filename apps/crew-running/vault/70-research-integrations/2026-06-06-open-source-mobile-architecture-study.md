# Open source + mobile architecture study

Data: 2026-06-06
App: `apps/crew-running`
Pesquisa local: `.codex-research/open-source`

## Decisao executiva

1. Manter o app atual em Vite/React/PWA e exportar Android/iOS com Capacitor na primeira fase.
2. Nao reescrever para React Native/Expo agora. Bluesky e SimCoder provam que RN/Expo funciona, mas migrar agora exigiria reescrever MapLibre, CSS, componentes, creator, storage e fluxo de build.
3. Para corrida em primeiro plano, Capacitor + Web Geolocation pode bastar no MVP. Para corrida longa em background, WebView puro e fraco; precisaremos de ponte nativa/plugin com Android foreground service e iOS CoreLocation background.
4. A camada social deve absorver modelos de dominio, nao stacks inteiros. Sublay/Bluesky/Pixelfed ajudam com feed, comentario, reacao, notificacao, moderacao e relacao entre membros; o app deve manter o backend escolhido/local-first ate uma decisao explicita.
5. Licencas importam: MIT/Apache podem inspirar e, com cuidado, permitir codigo; AGPL/GPL ficam como blueprint de produto/arquitetura, sem copiar implementacao.

## Repos estudados

| Repo | Snapshot local | Licenca | Melhor uso para Running Crew | Decisao |
| --- | --- | --- | --- | --- |
| SimCoderYoutube/InstagramClone | `36d0507` 2022-01-02 | Apache-2.0 | Feed mobile simples, camera/upload, tabs, Firebase flow | Referencia leve; nao usar como base |
| sublay-io/monorepo | `8851fe2` 2026-06-03 | Apache-2.0 | Entidades sociais, comentarios, reacoes, conexoes, notificacoes, SDK web/RN/Expo | Melhor referencia social pronta; decidir backend antes de adotar |
| maplibre/maplibre-gl-directions | `f5245f8` 2026-04-16 | MIT | Planejamento de rotas/eventos no mapa MapLibre atual | Candidato direto para spike |
| open-wanderer/wanderer | `f912a18` 2026-06-06 | AGPL-3.0 | Catalogo de trilhas, GPX, busca, listas, compartilhamento, feed | Blueprint, sem copiar codigo |
| endurain-project/endurain | `27c7a37` 2026-06-06 | AGPL-3.0 | Modelo de atividade, streams, GPX/FIT/TCX, privacidade, metas, equipamentos | Blueprint de schema/servicos |
| OpenTracksApp/OpenTracks | `2dac8d3` 2026-05-30 | Apache-2.0 | Android GPS real, foreground service, sensores, GPX/KML/KMZ, public API | Referencia nativa principal para Android |
| timfraedrich/OutRun | `f3d7ef4` 2025-08-10 | GPL-3.0 | iOS CoreLocation/HealthKit, background location, auto-pause, GPX | Estudo nativo iOS, sem copiar codigo |
| bluesky-social/social-app | `b9cd7e9` 2026-06-05 | MIT | App social web/iOS/Android em React Native/Expo, feed, persistencia, moderacao, EAS | Referencia de escala; nao migrar agora |
| pixelfed/pixelfed | `54a743e` 2026-05-27 | AGPL-3.0 | Photo sharing, media pipeline, feed cache, reports, moderacao, ActivityPub | Blueprint social/backend |

## O que absorver por dominio

### 1. Social, perfil e feed

**SimCoder**: bom para fluxo basico de tabs, camera, upload, feed e perfil. Risco alto como base: projeto antigo, regras Firestore inseguras em chat, bugs em registro e padrao tutorial.

**Sublay**: melhor encaixe conceitual para `Voce`, `Mural Feed`, comentarios, reacoes, conexoes, mencoes, anexos e notificacoes. A API de entidades aceita `foreignId`, `sourceId`, `spaceId`, `metadata`, `location`, attachments e includes. Isso mapeia bem para:

- `crew_posts`: post comum, recap de corrida, medalha, sponsor post.
- `crew_comments`: comentarios em mural, evento, corrida, sede.
- `crew_reactions`: like, kudos, check-in, badge reaction.
- `crew_connections`: seguir, membro, convite, amizade, crew membership.
- `crew_notifications`: badge, convite, comentario, evento, ranking.

Decisao recomendada: usar o modelo mental de Sublay, mas implementar no backend atual/Supabase quando a camada social sair do local-first. Adotar o backend Sublay inteiro deve ser uma decisao separada, porque muda ownership dos dados.

**Bluesky**: referencia de escala para feed em React Query, cache/persistencia com schema validado, moderacao antes de renderizar e build EAS para iOS/Android. Serve para arquitetura social caso um dia a gente decida reescrever para RN/Expo.

**Pixelfed**: referencia de governanca social: status/media separados, jobs de pipeline, feed em cache, denuncias, bloqueios, filtros, media processing e federacao. Bom para planejar o backend social sem virar copia AGPL.

### 2. Mapa, rotas e eventos

**MapLibre Directions** e o melhor alvo imediato. Ele ja trabalha em MapLibre GL JS, suporta providers compatíveis com OSRM/Mapbox Directions, waypoints, rotas alternativas, interacao touch e salvar/carregar GeoJSON de rota.

Recomendacao de spike:

- Criar camada `RoutePlannerLayer` em cima do mapa existente.
- Usar primeiro para preview de rota de evento, nao para tracking ativo.
- Persistir `waypoints`, `snappoints`, `routelines` ou GeoJSON normalizado.
- Manter `layers.events && !trackerActive` para nao misturar evento com corrida ao vivo.
- Provider inicial: OSRM/dev ou provider configuravel. Nao acoplar o app ao endpoint publico em producao.

**Wanderer**: referencia de produto para trilhas pesquisaveis: `Trail` tem nome, localizacao, data, publico/privado, distancia, elevacao, duracao, dificuldade, fotos, GPX, categoria, tags, polyline, comentarios, likes, shares, author e busca por bounding box/proximidade. Para Running Crew, isso vira `routes`, `event_routes`, `saved_trails` e `run_recap_routes`.

### 3. Corrida real, GPS e atividade

**Endurain**: melhor schema de atividade. Separar atividade de streams e midia e a licao principal:

- `activities`: resumo canonico da corrida.
- `activity_streams`: series temporais por tipo, como lat/lon, elevacao, pace, velocidade, HR, cadencia.
- `activity_media`: fotos/videos ligados a atividade.
- `activity_laps`: splits/laps.
- `users_goals`: metas por intervalo, esporte e metrica.
- `gear`: tenis/equipamento ligado a atividade.
- flags de privacidade por campo: esconder mapa, localizacao, HR, pace, elevacao, velocidade, equipamento etc.

Para nosso app, o schema minimo de corrida deveria nascer assim:

- `run_logs`: usuario, crew, tipo, start/end, distancia, duracao, pace medio, elevacao, calorias opcional, status.
- `run_stream_points`: run_id, ts, lat, lon, accuracy, altitude, speed, heading.
- `run_splits`: run_id, km_index, duration, pace, elevation.
- `run_privacy`: hide_map, hide_location, visibility, share_to_feed.
- `run_media`: run_id, media_path, type, caption, order.

**OpenTracks**: referencia Android para quando sairmos do foreground-only. Ponto chave: Android usa foreground service com `FOREGROUND_SERVICE_LOCATION`, notificacao persistente, wake lock, permissao de localizacao fina e estado sticky para retomar gravacao se o servico reiniciar. Tambem filtra pontos por intervalo/distancia e cria segmentos automaticos quando ha salto grande.

**OutRun**: referencia iOS: `UIBackgroundModes=location`, `NSLocationAlwaysAndWhenInUseUsageDescription`, `allowsBackgroundLocationUpdates`, `activityType=.fitness`, HealthKit e auto-pause por limiar de velocidade. Como GPL, fica apenas como guia de comportamento.

## Estrategia mobile Android/iOS

### Fase 1: mobile web real

Antes de empacotar, validar o app no celular via LAN. Corrigir overflow, botoes, map gestures, upload/camera, permissoes e fluxo de corrida em browser mobile. Isso evita empacotar uma UI quebrada.

Comandos previstos:

```bash
cd apps/crew-running
npm run validate
VITE_DEV_HOST=lan npm run dev
```

### Fase 2: Capacitor baseline

Adicionar Capacitor mantendo o Vite app como fonte unica.

```bash
cd apps/crew-running
npm i @capacitor/core @capacitor/android @capacitor/ios
npm i -D @capacitor/cli
npx cap init
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Entregas:

- Android debug APK.
- iOS project abrindo no Xcode.
- Permissoes nativas minimas declaradas.
- Sem segredos no bundle.
- `npm run validate` antes de fechar.

### Fase 3: GPS foreground

Validar `navigator.geolocation.watchPosition` dentro do WebView em Android e iOS. Se falhar ou ficar inconsistente, trocar para plugin Capacitor Geolocation.

Aceite minimo:

- iniciar corrida;
- pausar/resumir;
- desenhar trilha no MapLibre;
- persistir corrida em andamento;
- recuperar apos refresh/app background curto;
- finalizar e gerar recap.

### Fase 4: background de verdade

Se o produto exigir corrida longa com tela bloqueada, criar uma ponte nativa:

- Android: foreground service de tracking, notificacao persistente, wake lock, retomada por track id, export GPX.
- iOS: CoreLocation background, `allowsBackgroundLocationUpdates`, indicador de background, HealthKit opcional.
- JS recebe stream normalizado de pontos e salva no mesmo schema.

Essa fase nao deve ser prometida como resolvida so por Capacitor.

### Fase 5: social/push/media

Depois do tracking e build nativo:

- secure storage para tokens;
- push notifications nativas;
- camera/photo picker nativo;
- media upload robusto;
- comentarios/reacoes/feed com moderacao basica;
- privacidade por corrida antes de publicar no feed.

## Superficies de produto e front-end exposto

A analise tecnica acima separa os repos por dominio. Para execucao de UI, a separacao correta e por superficie de produto:

1. **Mobile app / player game**: corredor na rua, mapa vivo, tracking, missoes, runner, sede e feed pessoal.
2. **Camada game**: regras visuais e mecanicas que aparecem dentro do mobile/player app.
3. **Site publico**: presenca, crews, eventos, ranking publico redigido, sponsors e conversao para app.
4. **Desktop usuario / rede**: area do runner no desktop, sem corrida/GPS como acao primaria.
5. **Painel operacional**: app admin separado, para equipe interna, moderacao, dados, parceiros e QA.

### 1. Mobile app / player game

Esta e a superficie principal do usuario final. Ela continua sendo `apps/crew-running`, exportada como PWA/Capacitor para Android/iOS.

Entradas principais ja presentes ou naturais:

| Area | Botoes/controles expostos | O que o usuario faz | Origem da pesquisa |
| --- | --- | --- | --- |
| QG principal | `ABRIR MAPA` / `COMEÇAR`, `GUARDA ROUPA`, `CREWS PILOTO`, `SEDE`, `VOCÊ`, `CONFIG`, `REVER INTRO` | Navega pelo jogo, cria/ajusta runner, escolhe crew, acessa sede e perfil | Estrutura atual + SimCoder/Bluesky para tabs sociais |
| Creator | `TESTAR LOCAL`, salvar runner, trocar subtabs, upload foto, brief fisico, wardrobe `top/bottom/shoes/accessory` | Cria identidade visual sem copiar rosto real | Creator contract local |
| Mapa | `INICIAR CORRIDA`, `QG`, chips `Territorio`, `Live`, `Missoes`, `Eventos`, `Historia` | Liga camadas, ve cidade, ve eventos, escolhe missoes | MapLibre Directions, Wanderer |
| Corrida ao vivo | `PAUSAR`, `RETOMAR`, `ENCERRAR` | Controla tracking, ve KM/pace/territorio/spots | OpenTracks, OutRun, Endurain |
| Permissao GPS | `TENTAR DE NOVO`, `FECHAR` | Resolve erro de localizacao | OpenTracks/OutRun |
| Corrida interrompida | `RETOMAR`, `DESCARTAR` | Recupera corrida em andamento | OpenTracks sticky resume |
| Pos-corrida | `SALVAR`, `DESCARTAR`, diario `SALVAR`/`PULAR` | Gera recap, XP, badges, diario e feed | Endurain streams + Pixelfed feed/media |
| Evento | CTA do evento, `SINAL SALVO`, `REPORTAR` | Marca interesse e reporta evento inadequado | Sublay/Pixelfed social moderation |
| Social pessoal | `ADICIONAR AMIGO`, `ABRIR MAPA`, notas de amigo | Mantem rede leve e identidade | Sublay/Bluesky |
| Perfil | abrir perfil pelo HUD, badges, progresso, crew | Ve conquistas e historico | Endurain stats + gamification local |

O que nao entra no mobile como botao primario:

- operacao admin;
- ver GPS bruto de outras pessoas;
- editar sponsor/pagamento;
- painel de banco/sync;
- marketplace transacional antes de validar eventos e parceiros.

### 2. Camada game

A camada game nao e um app separado; e o modo como o mobile/player app apresenta corrida, cidade e comunidade.

Features expostas:

- **Territorio**: camada do mapa mostrando zonas e ownership.
- **Live**: posicao/trilha atual e pings controlados.
- **Missoes**: aceitar/abandonar missao, foco no mapa, XP por conclusao.
- **Eventos**: pins no mapa, sheet de evento, interesse local, report.
- **Historia**: painel de corridas anteriores por zona.
- **Badges/medalhas**: toast de unlock e sala de medalhas.
- **Sede da crew**: salas `Wall of Sponsors`, `Sala de Medalhas`, `Hall de Patentes`, `Ranking Lendario`, `Trofeu Room`, `Mural Feed`, `Member Roster`.
- **Crew Radio**: mensagens leves da crew, sem virar chat inseguro.
- **Recap social**: corrida finalizada pode virar diario/feed/post, com privacidade antes de publicar.

Aqui entram os repos assim:

- MapLibre Directions: rotas de evento e preview de percurso.
- Wanderer: catalogo/search de trilhas e rotas salvas.
- Endurain: estatisticas, splits, streams e privacidade por corrida.
- OpenTracks/OutRun: regras reais de tracking, pausa, retomada e background futuro.
- Sublay/Pixelfed/Bluesky: feed, comentarios, reacoes, report e notificacoes.

### 3. Site publico

O site publico deve ser uma superficie separada do app de jogo. Ele vende, orienta e mostra a comunidade sem exigir GPS.

Paginas/areas:

- **Home**: `Entrar no app`, `Ver crews`, `Ver eventos`, `Baixar Android`, `Abrir no iOS/PWA`.
- **Crews**: paginas publicas de crew com manifesto, zona, eventos, ranking redigido e CTA `Entrar nessa crew`.
- **Eventos**: calendario/mapa publico sem dados pessoais; CTA `Sinalizar interesse` ou `Abrir no app`.
- **Sponsors/Parceiros**: `Wall of Sponsors`, parceiro por zona, CTA `Quero patrocinar`.
- **Ranking publico**: leaderboard redigido por apelido/crew, sem rota GPS bruta.
- **Legal/privacidade**: explicacao clara de GPS, foto, IA do creator e publicacao de corrida.

O site publico nao deve ter:

- `INICIAR CORRIDA`;
- creator completo com foto;
- service role/admin actions;
- dados privados de runner;
- dashboard operacional.

### 4. Desktop usuario / rede

Esta e a area desktop do usuario comum, diferente do painel operacional. O desktop nao tenta simular corrida; ele mostra progresso, comunidade e planejamento.

Tabs/botoes recomendados:

- `Meu Runner`: perfil, badges, historico, ajustes leves.
- `Minha Crew`: sede, mural, ranking, roster.
- `Historico`: corridas, splits, GPX/export, privacidade por corrida.
- `Eventos`: buscar eventos, salvar interesse, abrir rota no mobile.
- `Rede`: amigos, profissionais wellness, parceiros locais.
- `Config`: conta, privacidade, sync, notificacoes.

Controles concretos:

- `Postar recap`;
- `Exportar GPX`;
- `Ocultar mapa`;
- `Compartilhar com crew`;
- `Adicionar amigo`;
- `Salvar evento`;
- `Abrir no mobile`.

O desktop usuario pode usar mapas, mas como metricas/planejamento, nao como botao principal de GPS.

### 5. Painel operacional

O painel operacional deve ser separado, idealmente `apps/crew-admin`, nao uma aba dentro do player. Esse painel e para equipe interna, admins de organizacao, moderadores, QA e parceiros autorizados.

Areas e botoes:

| Area operacional | Botoes/acoes | Observacao |
| --- | --- | --- |
| Health/sync | `Reprocessar fila`, `Ver erros`, `Exportar log` | Sem expor secrets |
| Usuarios/orgs | `Suspender`, `Trocar role`, `Reenviar convite` | Sempre server-side e auditado |
| Corridas agregadas | `Ver resumo`, `Redigir rota`, `Exportar agregado` | Sem GPS bruto por padrao |
| Creator ops | `Ver status`, `Validar assets`, `Rodar contrato` | Nao altera contrato pelo browser |
| Crews/assets | `Auditar assets`, `Criar proposta`, `Abrir PR` | Mudanca via PR, nao banco direto |
| Eventos | `Aprovar`, `Rejeitar`, `Marcar verificado`, `Arquivar` | Fluxo de moderacao |
| Sponsors/parceiros | `Aprovar parceiro`, `Associar zona`, `Pausar sponsor` | Separar de player app |
| Moderacao social | `Ocultar post`, `Resolver report`, `Banir/limitar` | Inspirado em Pixelfed/Bluesky |
| QA/release | `Rodar smoke`, `Validar mobile`, `Checar PWA`, `Checar creator contract` | Antes de deploy |

Regra: qualquer acao privilegiada passa por server/edge function com role, RLS e audit log. Nada de `service_role` no browser.

## Separacao por onda

1. **Onda Mobile/Game 1**: consolidar mapa, run HUD, run summary, diario e eventos locais.
2. **Onda Mobile/Game 2**: MapLibre Directions para rota de evento + GPX/export basico.
3. **Onda Social 1**: feed/recap/comentarios/reacoes com shape inspirado em Sublay.
4. **Onda Native 1**: Capacitor Android/iOS baseline.
5. **Onda Native 2**: GPS foreground validado em aparelho real.
6. **Onda Site 1**: home publica, crews, eventos e sponsors.
7. **Onda Desktop Usuario 1**: area runner/rede/historico sem GPS primario.
8. **Onda Admin 0**: auditoria Supabase/schema/RLS real.
9. **Onda Admin 1**: `apps/crew-admin` read-only health, usuarios, eventos, creator contract e QA.

## Ordem de execucao recomendada

1. Fechar mobile web QA no app atual.
2. Fazer spike MapLibre Directions para rota de evento.
3. Definir schema `run_logs` + `run_stream_points` inspirado em Endurain/OpenTracks.
4. Empacotar Android/iOS com Capacitor baseline.
5. Testar GPS foreground em aparelho real.
6. So depois decidir se background tracking merece plugin nativo.
7. Implementar social local-first/Supabase com shape inspirado em Sublay, sem trocar backend por impulso.

## Guardrails do app atual

- Nao tocar no creator durante este estudo.
- Nao reintroduzir `StylePicker`, `data/styles.ts`, `public/styles/*`, `hair`, `crew-flow` ou qualquer violacao do creator contract.
- `Crew Pace` e sempre `crew-pace`.
- Runner types seguem exatamente: `sprint`, `long-run`, `night-run`, `crew-pace`, `urban-trail`.
- Antes de finalizar qualquer mudanca de creator: `npm run validate` em `apps/crew-running`.

## Links fonte

- https://github.com/SimCoderYoutube/InstagramClone
- https://github.com/sublay-io/monorepo
- https://github.com/maplibre/maplibre-gl-directions
- https://github.com/open-wanderer/wanderer
- https://codeberg.org/endurain-project/endurain
- https://codeberg.org/OpenTracksApp/OpenTracks
- https://github.com/timfraedrich/OutRun
- https://github.com/bluesky-social/social-app
- https://github.com/pixelfed/pixelfed
