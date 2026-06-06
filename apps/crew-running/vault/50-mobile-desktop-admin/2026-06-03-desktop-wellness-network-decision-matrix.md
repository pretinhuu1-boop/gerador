# Desktop Wellness Network - Decision Matrix

Data: 2026-06-03
App: `apps/crew-running`
Status: analise logica de decisoes pendentes. Nenhuma implementacao autorizada.

## Principio Central

The Crew Running tem dois modos de produto:

- Mobile: jogo urbano de corrida, GPS, mapa vivo, crew, XP e territorio.
- Desktop: area do usuario, rede social, wellness network, mapa de metricas/dados, operacao e oportunidades.

Logo, o desktop nao deve tentar reproduzir a acao de correr. Ele deve transformar o que acontece na rua em dados, relacoes, oportunidades, eventos e operacao.

## Criterios de Decisao

Cada decisao abaixo usa estes criterios:

- Valor imediato para runner.
- Valor para profissionais/marcas.
- Baixo risco de privacidade.
- Baixa complexidade para Onda 1.
- Bom caminho para monetizacao futura.
- Compatibilidade com Supabase/RLS e multi-tenant.
- Nao contaminar o player-facing mobile com SaaS/comercial pesado.

## Decisao 1 - Identidade Publica: arroba, tag ou ambos?

### Opcao A - Apenas arroba

Cada perfil tem um `handle` unico, como `@lili.run`.

Pros:

- Facil de compartilhar.
- Bom para contato, QR, busca e URL publica.
- Simples para usuario entender.

Contras:

- Nao explica se a pessoa e runner, coach, loja, marca ou medico.
- Busca por setor fica fraca.

### Opcao B - Apenas tags

Perfis sao descobertos por tags como `coach`, `nutri`, `event_creator`.

Pros:

- Bom para filtros e descoberta.
- Ajuda moderacao e categorias.

Contras:

- Nao da identidade social memoravel.
- Ruim para contato e indicacao boca a boca.

### Opcao C - Arroba + tags

Cada perfil tem `handle` unico e `profile_tags` controladas.

Recomendacao MVP: Opcao C.

Por que:

- `handle` identifica.
- Tags explicam.
- Ambos alimentam mapa, busca, QR/NFC, patrocinio, eventos e moderacao.

Decisao pratica:

- `handle` obrigatorio para perfil publico.
- Tags opcionais no runner comum, obrigatorias para perfil profissional/comercial.
- Tags de setores sensiveis exigem verificacao antes de destaque publico.

## Decisao 2 - Perfil Unico ou Contas Separadas?

### Opcao A - Uma conta por papel

Runner tem uma conta; profissional cria outra; loja cria outra.

Pros:

- Separacao clara.
- Permissoes simples.

Contras:

- Friccao alta.
- Ruim para o caso central: personal trainer que tambem e corredor.
- Dificulta social graph real.

### Opcao B - Conta unica com papeis multiplos

Um usuario pode ter roles: `runner`, `coach`, `athlete`, `creator`.

Pros:

- Reflete a vida real.
- Permite runner + profissional.
- Bom para crescimento organico.

Contras:

- Schema e UI precisam lidar com contexto.
- Moderacao precisa saber qual papel esta ativo em cada superficie.

### Opcao C - Conta pessoal + paginas profissionais vinculadas

Usuario tem perfil runner e pode administrar uma ou mais paginas: loja, marca, evento, clinica.

Pros:

- Melhor para equipes/negocios.
- Permite varios admins por marca/loja.
- Escala bem para comercial.

Contras:

- Mais complexo que Onda 1.

Recomendacao MVP:

- Comecar com Opcao B: conta unica com roles multiplos.
- Preparar schema para evoluir para Opcao C: paginas profissionais/organizacoes vinculadas.

Modelo:

```text
profiles
  user_id
  handle
  display_name
  primary_role
  visibility

profile_roles
  profile_id
  role
  verification_status

professional_pages (fase posterior)
  organization_id
  owner_user_id
  page_type
  handle
```

## Decisao 3 - Como o mapa mostra profissionais sem virar spam?

### Opcao A - Mostrar todos os profissionais no mapa

Pros:

- Alto inventario visivel.

Contras:

- Polui mapa.
- Parece classificados/anuncio.
- Ruim durante corrida.

### Opcao B - Mostrar por contexto e consentimento

Profissionais aparecem por filtro, zona, evento, relacao com crew ou busca ativa.

Pros:

- Mais util.
- Menos invasivo.
- Protege experiencia gamificada.

Contras:

- Exige boa taxonomia e ranking de relevancia.

### Opcao C - Mostrar apenas no desktop

Mobile fica limpo; desktop mostra rede profissional.

Pros:

- Preserva mobile.

Contras:

- Perde descoberta local leve no celular.

Recomendacao MVP:

- Mobile: Opcao B com aparicao leve e contextual.
- Desktop: Opcao B mais completa, com filtros e mapa de metricas.

Regra:

- Profissional nao aparece como anuncio solto.
- Ele aparece por contexto: zona, evento, crew, busca, tag, conexao ou recomendacao aceita.

## Decisao 4 - Contato: DM interna, WhatsApp, site ou pedido de contato?

### Opcao A - WhatsApp direto

Pros:

- Brasileiro entende.
- Conversao alta.

Contras:

- Exposicao de telefone.
- Difícil auditar abuso.
- Pode virar spam.

### Opcao B - DM interna

Pros:

- Melhor privacidade.
- Moderacao possivel.
- Historico controlado.

Contras:

- Mais implementacao.
- Precisa notificacao.

### Opcao C - Pedido de contato

Usuario clica "quero contato"; profissional recebe lead/pedido. Dados pessoais so aparecem se houver consentimento.

Pros:

- Bom MVP.
- Reduz spam.
- Facil auditar.

Contras:

- Menos fluido que WhatsApp direto.

Recomendacao MVP: Opcao C.

Depois:

- DM interna para rede madura.
- WhatsApp externo apenas verificado e com opt-in explicito.

## Decisao 5 - Quais dados de atividade marcas podem usar para descobrir atletas?

### Opcao A - Dados detalhados

Expor rotas, volume, localizacao e historico completo.

Resultado: rejeitar.

Risco alto de privacidade e vigilancia.

### Opcao B - Dados agregados e faixas

Expor nivel, consistencia, zonas agregadas, crew, participacao em eventos, badges e opt-in de patrocinio.

Pros:

- Suficiente para descoberta.
- Menor risco.
- Bom para matching.

### Opcao C - Apenas candidatura ativa

Atleta se candidata a oportunidades; marcas nao buscam dados.

Pros:

- Mais privado.

Contras:

- Menos descoberta e menos valor para marcas.

Recomendacao MVP:

- Opcao B + opt-in.
- Sem rota bruta.
- Sem horario preciso.
- Sem endereco inferivel.
- Sem dados de saude.

Campos seguros:

- crew;
- zona primaria em nivel amplo;
- streak/range;
- level;
- badges;
- categorias de interesse;
- eventos participados em modo agregado;
- disponibilidade para patrocinio.

## Decisao 6 - Patrocinio de atleta: privado, publico ou ambos?

### Opcao A - Proposta privada

Marca envia proposta; atleta aceita/recusa.

Pros:

- Bom MVP.
- Baixo risco reputacional.
- Permite aprender.

Contras:

- Menos viral.

### Opcao B - Vitrine publica de patrocinio

Atleta mostra "aberto a patrocinio" e marcas ofertam.

Pros:

- Crescimento e monetizacao.

Contras:

- Precisa regras anti-spam e compliance.

### Opcao C - Marketplace aberto de patrocinios

Ofertas publicas, bids, contratos.

Resultado: nao MVP.

Recomendacao:

- Onda 1: status read-only e opt-in "aberto a parcerias".
- Onda 2: proposta privada com audit.
- Onda 3: vitrine publica controlada.
- Marketplace/bids so depois.

## Decisao 7 - Eventos: discovery gratuito ou comercial?

### Opcao A - Discovery gratuito primeiro

Eventos aparecem como conteudo da comunidade: treinos, encontros, corridas, ativacoes.

Pros:

- Cresce rede.
- Baixa friccao.
- Bom para validar demanda.

Contras:

- Monetizacao vem depois.

### Opcao B - Comercial desde o inicio

Eventos pagos, destaque, lead, inscricao.

Pros:

- Monetizacao cedo.

Contras:

- Mais compliance, suporte e fraude.
- Pode contaminar a experiencia.

### Opcao C - Hibrido

Eventos gratuitos + status patrocinado/verified.

Recomendacao MVP: Opcao C leve.

Regra:

- Evento pode ser gratuito/comunitario.
- Evento comercial/patrocinado precisa label.
- Sem checkout no inicio.
- Lead/inscricao externa ou pedido de interesse.

## Decisao 8 - Ofertas/produtos: catalogo, lead ou checkout?

### Opcao A - Catalogo

Perfil comercial lista produtos/servicos.

Pros:

- Simples.
- Baixo risco.

Contras:

- Menos conversao.

### Opcao B - Lead/contact

Usuario pede contato, cupom ou interesse.

Pros:

- Bom MVP.
- Gera valor para marcas sem marketplace.
- Auditavel.

Contras:

- Precisa fila de leads e politicas.

### Opcao C - Checkout

Compra dentro do app.

Resultado: nao MVP.

Recomendacao:

- Onda 1: catalogo read-only.
- Onda 2: lead/contact.
- Onda 3+: checkout so se houver operacao, fiscal, suporte e antifraude.

## Decisao 9 - Quais setores precisam verificacao?

### Baixo risco

- loja de corrida;
- clube;
- organizador de treino comunitario;
- creator educativo sem claims medicos;
- marca de produto nao sensivel.

Verificacao leve:

- email/domino/site;
- documento comercial opcional;
- moderacao manual se denunciado.

### Medio risco

- assessoria de corrida;
- personal trainer;
- eventos pagos;
- suplementos;
- recovery/massagem.

Verificacao recomendada:

- identidade;
- registro profissional quando aplicavel;
- termos de responsabilidade;
- revisao de claims.

### Alto risco

- medico;
- nutricionista;
- fisioterapeuta;
- qualquer claim de diagnostico/tratamento;
- suplemento com promessa de saude/performance.

Verificacao obrigatoria antes de destaque:

- registro profissional;
- politica de claims;
- disclaimer;
- moderacao.

Recomendacao MVP:

- Permitir criacao de perfil, mas manter destaque/busca limitada ate verificacao nos setores medio/alto risco.

## Decisao 10 - Rede social com ou sem vanity metrics?

### Opcao A - Likes/followers/views

Pros:

- Familiar.

Contras:

- Contradiz plano atual.
- Gera pressao social e distorce wellness.

### Opcao B - Sem vanity metrics

Feed mostra identidade, conquistas, eventos, conexoes e utilidade.

Recomendacao MVP: Opcao B.

Substitutos saudaveis:

- conexoes;
- crews;
- eventos participados;
- badges;
- zonas;
- disponibilidade para contato;
- status verificado.

## Decisao 11 - Monorepo/app: admin separado, desktop user area junto ou separado?

### Opcao A - Um `apps/crew-admin` para tudo desktop

Inclui area do usuario, wellness network e admin interno.

Pros:

- Um app desktop.
- Menos infra inicial.

Contras:

- Precisa separar muito bem user-facing desktop de admin.

### Opcao B - `apps/crew-desktop` + `apps/crew-admin`

Um app para user/wellness; outro para admin.

Pros:

- Separacao mais limpa.
- Menos risco de admin vazar.

Contras:

- Mais trabalho.

### Opcao C - Tudo dentro do app player

Resultado: rejeitar para MVP desktop.

Recomendacao:

- Se a primeira entrega e "area do user + rede social", criar conceito de `apps/crew-desktop`.
- Admin interno pode ser modulo protegido ou app separado depois, mas privilegiado sempre via server/edge.
- Nao acoplar isso ao mobile player-facing.

## Decisao 12 - Dados e tabelas: modelo unico ou dominios separados?

### Opcao A - Uma tabela generica de perfis e posts

Pros:

- Rapido.

Contras:

- Vira bagunca cedo.
- Dificil RLS/moderacao/compliance.

### Opcao B - Dominios separados

Perfis, roles, wellness, eventos, patrocinio, ofertas, moderation.

Pros:

- Mais robusto.
- Melhor para audit e RLS.
- Evita misturar atleta, loja, medico e evento.

Contras:

- Mais modelagem Onda 0.

Recomendacao: Opcao B com MVP enxuto.

## Decisao 13 - O que entra na Onda 1?

Nao colocar tudo. Onda 1 deve provar o conceito sem virar marketplace.

Recomendacao Onda 1:

- Perfil desktop do runner.
- Handle + tags.
- Social graph read-only.
- Wellness profiles read-only.
- Mapa desktop como metricas/dados.
- Eventos/offers/sponsorship como inventario ou mock controlado, sem transacao.
- Admin read-only de riscos, status, sync e moderacao.

Fora da Onda 1:

- checkout;
- bidding de patrocinio;
- DM completa;
- eventos pagos;
- public ads;
- rota bruta;
- recomendacao medica.

## Decisao Recomendada Consolidada

Caminho mais logico:

1. Identidade: `handle` + tags.
2. Perfil: conta unica com roles multiplos.
3. Mapa: descoberta contextual, nunca spam.
4. Contato: pedido de contato/lead com consentimento.
5. Atletas: descoberta por dados agregados e opt-in.
6. Patrocinio: proposta privada primeiro.
7. Eventos: discovery comunitario + patrocinado com label.
8. Ofertas: catalogo/lead, sem checkout.
9. Verificacao: obrigatoria para setores medio/alto risco.
10. Social: sem vanity metrics.
11. Apps: desktop/user area separado do mobile; admin protegido por server/edge.
12. Schema: dominios separados desde Onda 0.

## Proxima Pergunta de Produto

A decisao mais importante agora:

```text
O primeiro desktop sera chamado de area do usuario, crew desktop, wellness network, ou outro nome de produto?
```

Isso importa porque define navegacao, copy, URL e o limite entre produto social e admin interno.
