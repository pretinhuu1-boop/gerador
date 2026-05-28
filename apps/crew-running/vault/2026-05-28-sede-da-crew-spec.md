# Sede da Crew — Design Spec

**Data:** 2026-05-28
**Branch alvo:** `feat/sede-da-crew` (cortado de `feat/map-gamification` após merge)
**Status:** design aprovado, pré-implementação
**Owner do brainstorm:** Nelson
**Stack metodológica:** híbrida — superpowers brainstorming → spec markdown → GSD `gsd:new-milestone` + `gsd:plan-phase` + `gsd:execute-phase` + `gsd:verify-work`
**Abordagem MVP:** Visual-First (shell completo + 7 salas + sponsor surfaces estáticas, zero comércio backend)

---

## 1. Contexto

### 1.1 Estado atual do app

- Branch `feat/map-gamification` rodando MapLibre real + MapStage SVG + ZoneSheet/SpotSheet/CrewSheet.
- `MainMenu.tsx` já implementa QG De Missão (Onda M1/M2 do plano `2026-05-28-main-menu-hq-action-plan.md` executada).
- `CrewsPanel.tsx` lista 5 crews piloto com botão `ENTRAR NA SEDE` — destino não existe (botão sem target).
- Gamification spec travada em `Documents/Vault-Axial/20-Axial-Projects/CrewRunning/gamification-spec.md`: XP, level, streak, missões, badges, leaderboards, eventos, economia patches.
- Map layout 2D travado em `map-layout-2d.md`: hierarquia L1/L2/L3, layer rail, princípios anti-AI-slop.
- Aba VOCÊ tem F1 desenhado, F2/F3 backlog (memory `project_voce_tab_social_roadmap.md`).

### 1.2 Gap que esta spec preenche

Sede da Crew é destino do botão `ENTRAR NA SEDE`. Atual gamification spec descreve mecânicas mas não tem lar visual para badges, achievements, patentes, ranking lendário, histórico de eventos. Sede vira esse lar + adiciona camada comercial (Wall of Sponsors) que vai sustentar monetização do produto.

### 1.3 Princípios herdados (não-negociáveis)

- **Mapa = home, não modal.** Sede é destino opcional, não substitui mapa.
- **Trust EVE Verite.** Sem fake members, sem fake sponsors, sem ranking inflado.
- **Anti-AI-slop.** Hand-drawn sobre photoreal. Sticker style único.
- **SVG 2D, sem tilt.** Otimização vem de camadas + hierarquia.
- **Crew accent SEMPRE > marca patrocinadora.** Cor da crew nunca cede pra cor de sponsor.

---

## 2. Goals + Non-Goals

### 2.1 Goals (MVP visual-first)

1. Botão `ENTRAR NA SEDE` em `CrewsPanel.tsx` navega pra destino real.
2. Sede tem 7 salas funcionais com conteúdo derivado dos dados existentes (gamification, crews, members).
3. Wall of Sponsors visível, estático, manualmente configurável por crew via data file.
4. Member card com slot pra patches sponsor (cosmetic, configurado manualmente).
5. Mural Feed básico (CRUD post crew, leitura para visitor).
6. Hierarquia visitor vs member respeitada (ver Q8 decisão E).
7. Sede aparece como destino opcional no MainMenu rail.
8. Build, typecheck, e testes existentes continuam passando. Novos componentes vêm com testes vitest.

### 2.2 Non-Goals (cortados pro MVP visual-first)

1. **Stripe Connect / split de pagamento.** Não implementa.
2. **KYC automatizado.** Configuração sponsor é manual via data file pelo dev.
3. **Contrato digital DocuSign-like.** Fora de escopo.
4. **Dashboard marca live.** Sponsor não acessa app — relação comercial offline.
5. **NF emitida.** Fora de escopo.
6. **Co-branded drops loja crew.** Loja não existe ainda — feature do Spec C marketplace.
7. **Bonus performance automático.** Cálculo manual.
8. **4 salas Fase 2.** Calendário, Live Map interno, Cofre Coletivo, Lore/Fundação, Recrutamento ficam fora.
9. **Crew Chat.** Fora.
10. **Trail color glow sponsor, Spray tag, HUD secundário tech.** Fora (surfaces fase 2 da Q7).

### 2.3 Critério de "pronto"

- 3 segundos: visitor entende qual crew é, quem patrocina, top members.
- Member entra na sede e consegue: ver badges próprios, ver patentes, ver ranking semana, postar no mural, ver detalhes de qualquer member do roster.
- Capitão consegue editar `member.patches` via UI básica (escolher de pool cosmético).
- Não há promessa de feature comercial que não existe.
- Mobile 390px e desktop 1280px sem overflow.
- Sponsor pode ser mostrado como "powered by" sem atrito jurídico (relação offline, é publicidade declarada estática).

---

## 3. Modelo comercial (locked, implementação Fase 2)

Documentado aqui para guiar UI decisions do MVP, mesmo que backend não exista.

### 3.1 Estrutura

- **Modelo:** Híbrido. 1 marca principal exclusiva por crew + N apoiadoras de categoria.
- **Categorias (8):** apparel, footwear, suplemento, nutri, personal/coaching, hidratação, recovery, tech.
- **Atleta solo:** elegível Lv ≥ 20, pode aceitar marca em categoria não-conflitante com crew. 1 principal + max 2 apoiadoras.

### 3.2 Governança

- Capitão aceita patrocínio crew sozinho.
- Atleta sai da crew → leva patrocínio solo. Crew sponsor fica.
- Atleta troca crew → solo sobrevive se categoria não conflita; senão suspende até fim contrato.
- Sem cooldown plataforma. Contrato comercial resolve.

### 3.3 Tier + preço

- **Ouro/principal:** leilão por crew/temporada (90d).
- **Prata/apoiadora categoria:** preço tabelado por categoria. Mensal ou temporada (marca escolhe).
- **Bronze/apoiadora menor:** preço tabelado, mensal.
- **Take rate Axial:** escalonado por ticket — 30% até R$5k/mês, 20% até R$20k, 15% acima.
- **Pagamento:** cash + produto + patches in-game, mix definido no contrato.
- **Bonus:** crew bate meta sponsor → split pra members ativos.

### 3.4 Métricas ROI (10, dashboard marca, fase 2)

1. Impressões orgânicas
2. km-com-logo
3. Território-tempo × audience density SP
4. Eventos vencidos (showdown, bloco)
5. Member retention
6. Crew growth
7. Spot toques com sponsor visível
8. Mural impressions
9. Cliques wall sponsors → site marca
10. Demográfico zona

Cadência: tier-based — ouro live + mensal report, prata mensal, bronze temporada. Comparativo CPM mídia tradicional + benchmark categoria (anonimizado). Visibilidade: member vê próprio, capitão vê crew, marca vê tudo.

### 3.5 Compliance (Fase 2 implementação)

KYC: idade ≥ 18 (CPF), CREF Personal, CRN Nutri, CNPJ marca, termo aceite atleta. LGPD: consent expor zona/cidade, opt-out demográfico, right to forget, DPO visível, under 18 nunca em dashboard. Conar: post mural patrocinado label `PUBLI` auto. Stripe Connect Express + NF auto. Contratos: template Axial digital, multa quebra, reverter dados pós-fim. **Banidos:** cigarro/vape, álcool destilado, aposta, suplemento sem ANVISA, política/religião.

---

## 4. Surfaces visuais (locked)

### 4.1 MVP

| Surface | Slots | Tipo |
|---|---|---|
| Crew badge oficial | 1 (só principal) | Subscrito "powered by" |
| Sala Wall of Sponsors | 1 principal + 8 categorias | Logo full + link site |
| Member card (perfil) | 1 principal + max 2 patches solo | Patch sticker style |
| Mural feed posts patrocinados | 1 marca por post | Header `PUBLI` + logo small |
| Territorio polygon (mapa L1) | 1 watermark principal | SVG overlay 15% opacity |

### 4.2 Fase 2 (não implementa agora)

Trail color glow, Spray tag spot, Calendar treinos coletivos, HUD secundário, Sala medalhas co-branded badge.

### 4.3 Regras anti-Nascar

- Hard cap 3 logos simultâneos em qualquer tela. Algoritmo prioriza: principal > categoria contexto > resto cortado.
- Cap variável por contexto: mapa L1 = 1, sede wall = ilimitado, mural = 1 por post.
- Crew accent SEMPRE > logo marca.
- Logo marca em escala de cinza no mapa; cor só na sala wall + post patrocinado.
- Member card: patch ao lado do crew badge, não substitui.

### 4.4 Atleta opt-out

Atleta desliga logo do trail (custa exposure pra marca, atleta avisado). Atleta < 18 nunca tem logo. Perfil privado remove member card de listagens.

---

## 5. Salas/cômodos (locked)

### 5.1 MVP — 7 salas

| # | Sala | Conteúdo principal |
|---|---|---|
| 1 | Wall of Sponsors | Logo principal + 8 categorias + link site sponsor |
| 2 | Sala de Medalhas | Badges 10 + achievements crew + co-branded raros |
| 3 | Hall de Patentes | Hierarquia: Capitão, Veterano (Lv ≥ 20), Member, Novato. Fotos faces. |
| 4 | Ranking Lendário | Top members semana/temporada por XP, km, território, eventos |
| 5 | Trofeu Room | Temporadas S0X passadas, eventos vencidos (showdowns, blocos), badges raros |
| 6 | Mural Feed | Posts da crew, posts patrocinados marcados PUBLI, spray tags em spots |
| 7 | Member Roster | Lista completa members com card individual clicável |

### 5.2 Fase 2 — 4 salas

Calendário, Live Map interno, Cofre Coletivo, Lore/Fundação, Recrutamento.

### 5.3 Fase 3 — 1 sala

Crew Chat.

---

## 6. Arquitetura UI

### 6.1 Metáfora shell — Grid + Mural rolling (decisão b5)

Home da sede é grid de cards (cômodos) com preview rolling antes do grid. Tap card abre sala dedicada.

```
┌─────────────────────────────────────┐
│ ← EAST BURNERS · LESTE              │ ← header crew (badge + zone)
│   Cap: @marcao · 28 ativos          │
├─────────────────────────────────────┤
│ ▓▓▓ PREVIEW ROLLING ▓▓▓             │ ← scroll horizontal: 3 picks
│ [Wall sponsors] [Top1 Marcus] [Ev]  │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐         │ ← grid 3 col (mobile 2)
│ │WALL  │ │MEDLS │ │PATEN │         │
│ │SPONS │ │  ★   │ │  ⚔   │         │
│ └──────┘ └──────┘ └──────┘         │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │RANKG │ │TROFU │ │MURAL │         │
│ │  ▲   │ │  🏆  │ │  💬  │         │
│ └──────┘ └──────┘ └──────┘         │
│ ┌──────┐                            │
│ │ROSTR │                            │
│ │  👥  │                            │
│ └──────┘                            │
├─────────────────────────────────────┤
│ [VOLTAR]              [TROCAR CREW] │
└─────────────────────────────────────┘
```

### 6.2 Navegação

- **Entrada:** botão `ENTRAR NA SEDE` em `CrewsPanel.tsx` (push screen).
- **Entrada secundária:** item "SEDE" no rail do MainMenu (push screen direto).
- **Visitor gate:** preview limitado (ver tabela em 6.5). Member completo.
- **Saída:** botão `VOLTAR` no footer da sede ou swipe back.
- **Troca crew:** `TROCAR CREW` no footer leva pra `CrewsPanel` mantendo navegação atrás.

### 6.3 Sub-screens vs sheet (decisão d4)

| Sala | Tipo |
|---|---|
| Sala Medalhas | Sub-screen (push) — conteúdo denso |
| Hall Patentes | Sub-screen — denso |
| Trofeu Room | Sub-screen — denso |
| Member Roster | Sub-screen — denso |
| Wall of Sponsors | Bottom sheet — leitura curta |
| Ranking Lendário | Bottom sheet — tabela leve |
| Mural Feed | Sub-screen — input + listagem |

### 6.4 Estrutura de arquivos proposta

```
components/sede/
  SedeShell.tsx              ← grid + header + rolling preview
  SedeHeader.tsx             ← badge + crew name + capitao + count
  SedeRollingPreview.tsx     ← 3-pick rolling horizontal
  SedeRoomGrid.tsx           ← grid de cards
  SedeRoomCard.tsx           ← card individual (thumbnail + label)
  SedeFooter.tsx             ← voltar + trocar crew
  rooms/
    WallOfSponsorsSheet.tsx
    SalaMedalhas.tsx
    HallDePatentes.tsx
    RankingLendario.tsx      ← sheet
    TrofeuRoom.tsx
    MuralFeed.tsx
    MemberRoster.tsx
  cards/
    MemberCard.tsx           ← card individual member com badge + patches
    BadgeChip.tsx
    SponsorLogo.tsx
    PatentBadge.tsx
  __tests__/
    SedeShell.test.tsx
    rooms/*.test.tsx
data/
  sedeRooms.ts               ← config das 7 salas (label, icon, sheet vs screen)
  sponsorshipManual.ts       ← MVP: sponsor por crew configurado manualmente
  patentTiers.ts             ← capitao, veterano, member, novato
services/
  sedeStorage.ts             ← persist post mural local, last-room-visited
  sedeNav.ts                 ← helper push/pop sede screens
hooks/
  useSedeRoom.ts             ← state + nav helpers
  useCrewSponsorship.ts      ← read sponsorshipManual data, resolve para crew ativa
```

### 6.5 Visitor vs member

| Surface | Visitante (não member) | Member |
|---|---|---|
| Wall of Sponsors | Visível | Visível |
| Sala Medalhas | Vê 3 destacadas, "ver tudo" gate | Tudo |
| Hall de Patentes | Vê capitão + top 3 | Tudo |
| Ranking Lendário | Vê top 5 | Tudo |
| Trofeu Room | Vê temporadas passadas | Vê + co-branded raros |
| Mural Feed | Vê 5 últimos posts públicos | Tudo + cria post |
| Member Roster | Vê count + thumbnails 6 | Lista completa clicável |

No MVP visual-first, "member" é determinado por flag local `localStorage.crewMemberOf` (apontando para crew slug). Sem auth real ainda.

---

## 7. Data model (MVP)

### 7.1 Tipos novos

```typescript
// data/sedeRooms.ts
export type SedeRoomId =
  | 'wall-of-sponsors'
  | 'sala-medalhas'
  | 'hall-patentes'
  | 'ranking-lendario'
  | 'trofeu-room'
  | 'mural-feed'
  | 'member-roster';

export interface SedeRoomConfig {
  id: SedeRoomId;
  label: string;
  shortLabel: string;
  iconKey: string;
  surfaceType: 'screen' | 'sheet';
  visitorVisible: boolean;
  memberOnly: boolean;
}

// data/sponsorshipManual.ts
export interface CrewSponsorshipManual {
  crewSlug: string;
  principal: SponsorEntry | null;
  apoiadoras: Partial<Record<SponsorCategory, SponsorEntry>>;
  drops?: CoBrandedDrop[];
}

export type SponsorCategory =
  | 'apparel' | 'footwear' | 'suplemento' | 'nutri'
  | 'personal' | 'hidratacao' | 'recovery' | 'tech';

export interface SponsorEntry {
  brandName: string;
  brandSlug: string;
  logoUrl: string;
  siteUrl: string;
  copy?: string;           // texto curto sponsor
  category: SponsorCategory | 'principal';
  validUntilISO: string;
}

// data/patentTiers.ts
export type PatentTier = 'capitao' | 'veterano' | 'member' | 'novato';

export interface PatentDefinition {
  tier: PatentTier;
  label: string;
  minLevel: number;
  visualKey: string;       // referência ao asset bordering member card
  description: string;
}

// data/muralPosts.ts
export interface MuralPost {
  id: string;
  crewSlug: string;
  authorSlug: string;
  body: string;
  createdAtISO: string;
  isPubli?: boolean;
  publiSponsorSlug?: string;
}
```

### 7.2 Reuso

- `data/crews.ts` (existe): crew info base.
- `data/runnerTypes.ts` (existe): tipo de runner do member.
- `data/spLiveMap.ts` (existe): zone bounds, spots geo.
- `data/gamification.ts` (a criar — Spec separado): XP, level, badges, achievements. **MVP da sede consome se existir, fallback pra mock se não.**

### 7.3 Storage local (MVP)

`services/sedeStorage.ts`:

- `crewMemberOf` → string slug ou null. Determina visitor vs member.
- `muralDrafts.<crewSlug>` → string draft em construção.
- `sedeLastRoom.<crewSlug>` → último room visitado pra reabrir na próxima entrada.
- `muralPostsLocal.<crewSlug>` → array (max 50, FIFO) — posts criados localmente no MVP enquanto não há backend.

Sem migration de schema. Não bloqueante.

---

## 8. Implementação — Phases propostas

(Detalhamento real vem em `gsd:plan-phase`. Aqui está o esqueleto.)

### Phase 1 — Sede Shell + Nav (1 PR pequeno)

- `SedeShell.tsx` + `SedeHeader.tsx` + `SedeFooter.tsx` + `SedeRoomGrid.tsx` + `SedeRoomCard.tsx`.
- `data/sedeRooms.ts` com 7 entries.
- `hooks/useSedeRoom.ts`.
- Wire `ENTRAR NA SEDE` em `CrewsPanel.tsx`.
- Wire item "SEDE" no MainMenu rail.
- Visitor gate básico (flag localStorage).
- Testes vitest: SedeShell render + nav.
- Validação: build, typecheck, smoke screenshot mobile/desktop.

### Phase 2 — Salas internas leves (medalhas + patentes + roster)

- `SalaMedalhas.tsx`, `HallDePatentes.tsx`, `MemberRoster.tsx`.
- `data/patentTiers.ts`.
- `cards/MemberCard.tsx`, `BadgeChip.tsx`, `PatentBadge.tsx`.
- Dados derivados de `crews.ts` + mock `gamification.ts` mínimo se necessário.
- Testes.

### Phase 3 — Salas com escolha de visualização (ranking + trofeu)

- `RankingLendario.tsx` (sheet), `TrofeuRoom.tsx` (screen).
- Toggle semana/temporada no ranking.
- Histórico estático de temporadas para trofeu.
- Testes.

### Phase 4 — Wall of Sponsors + member card patches estáticos

- `WallOfSponsorsSheet.tsx`, `SponsorLogo.tsx`.
- `data/sponsorshipManual.ts` com fixtures vazias por crew (todas com `principal: null`, `apoiadoras: {}`).
- `hooks/useCrewSponsorship.ts`.
- Atualizar `MemberCard.tsx` pra exibir slots `1 principal + max 2 apoiadoras`.
- Testes + visual regression.

### Phase 5 — Mural Feed básico

- `MuralFeed.tsx` + input + listagem.
- `services/sedeStorage.ts` posts locais.
- Label `PUBLI` auto-detectado quando `isPubli`.
- Visitor: read-only 5 últimos. Member: create + tudo.
- Testes.

### Phase 6 — Polish + integration check

- `Sp3DMapBackground` integration check (sede não quebra mapa atrás).
- Asset reuso `hq-collage-2d.jpg` como backdrop sede (com tinta crew sobreposta via CSS `mix-blend-mode`).
- Acessibilidade: keyboard nav grid, focus ring, screen reader labels.
- Mobile 390px sem overflow. Touch targets ≥ 44px.
- Reduced motion preserva fluxo.
- Suite vitest completa + `npm run validate` ok.

---

## 9. Riscos + mitigações

| Risco | Mitigação |
|---|---|
| Sede vira "dashboard SaaS" sem game feel | Manter metáfora shell + asset reuso `hq-collage-2d.jpg`. Sticker icons hand-drawn nos cards. |
| Wall of Sponsors com 9 slots vazios na demo parece quebrado | Fixtures iniciam com zero sponsors. Sala renderiza estado vazio honesto: "Esta crew ainda não tem patrocinador. Patrocine: [contato]." |
| Mural sem backend, posts somem em troca de device | Aviso explícito no input: "Posts locais — backend chega na próxima fase." |
| Gamification spec (`gamification.ts`) não existe ainda | Sede impl Phase 2 (salas leves) deve ser tolerante a `gamification` mock/parcial. Não bloquear. |
| Member roster grande estoura tela | Lazy load 20 inicial + paginação. Mobile carrega 10. |
| Co-branded raros na Sala Medalhas implica sponsor ativo | Produto macro-fase 2 (comércio) conecta sponsor → badge raro. Sede MVP mostra só badges gamification puros. |
| Asset reuso pode brigar com z-index de Sp3DMapBackground | Phase 6 testa. Backdrop sede com `z-index` próprio isolado. |
| Visitor "vê" demais e tira incentivo de virar member | Gate hard em Sala Medalhas (vê só 3) e Roster (vê só 6 thumbnails). CTA explícito "Entrar na crew" se visitor. |

---

## 10. Open questions (resolver em `gsd:plan-phase` da Phase 1)

Não bloqueiam aprovação do spec. Bloqueiam o detalhe da primeira phase implementation.

1. **Asset visual do shell.** Reusar `hq-collage-2d.jpg` ou gerar novo backdrop específico por crew? Recomendo reuso no MVP, asset novo em macro-fase 2.
2. **Existe pool cosmético de patches manuais já?** Se sim, capitão escolhe; senão, sede impl Phase 4 cria pool inicial mínimo (5 patches genéricos).
3. **MainMenu rail comporta novo item "SEDE"?** Tem espaço ou precisa repaginar? Phase 1 valida.
4. **Histórico temporadas S0X passadas — quantas temos pra mostrar?** Se S00 ainda nem rolou, Trofeu Room renderiza estado vazio honesto: "Primeira temporada em andamento."
5. **Mural feed precisa moderação?** MVP confia capitão. Botão "remover post" pra capitão.
6. **`crewMemberOf` localStorage: setado quando?** Provavelmente após user escolher crew em `CrewsPanel`. Confirmar fluxo em Phase 1.
7. **Sede aparece em VOCÊ tab?** Aba VOCÊ tem F1 desenhado. Sede pode ter link "ver minha crew" dentro do VOCÊ. Backlog VOCÊ não menciona — confirmar não atropela antes de Phase 1.

---

## 11. Glossary

- **Sede** — destino físico da crew, screen dedicada com 7 salas.
- **Sala** — sub-screen ou sheet dentro da sede, foco em uma função.
- **Cômodo** — sinônimo de sala.
- **Wall of Sponsors** — sala dedicada à exibição de marcas patrocinadoras.
- **Apoiadora** — sponsor de categoria, tier abaixo do principal.
- **Principal** — sponsor exclusivo da crew, tier mais alto (leilão).
- **Patente** — tier hierárquico interno crew (capitão, veterano, member, novato).
- **Trofeu Room** — sala de histórico de temporadas + eventos vencidos.
- **PUBLI** — label Conar exigido em post patrocinado.
- **Visitor** — user logado mas não member da crew em questão.
- **Member** — user com `crewMemberOf` apontando para a crew.
- **Co-branded drop** — item da loja crew × marca (Fase 2 Spec C).

---

## 12. Decisões locked (referência rápida)

| Q | Decisão |
|---|---|
| Q1 modelo | Híbrido: 1 principal + N apoiadoras |
| Q2 categorias | 8: apparel, footwear, suplemento, nutri, personal, hidratação, recovery, tech |
| Q3 governança | Capitão decide (a1) + atleta solo Lv≥20 livre não-conflito (b4) + saída leva solo (c1) + troca crew preserva sponsor (c4) |
| Q4 tier+pago | Tier+leilão híbrido (a3) + mensal/temporada (b4) + take escalonado (c4) + cash+produto+patches (d4) + bonus meta (e2) |
| Q5 ROI | 10 métricas + tier-based dash (b4) + CPM+benchmark (c1+c3) + member próprio, capitão crew, marca tudo (d3) |
| Q6 compliance | Tudo MVP recomendação + lista negra D1+D2+D3+D4+D6 |
| Q7 surfaces | A1-5 MVP + cap b1+b4 + hierarquia c1-c4 + watermark SVG d2 + opt-out e1-e3 |
| Q8 salas | 7 MVP + b5 grid+mural + nav c1+c2+c4 + sub-screen+sheet d4 + visitor vs member tabela |
| Stack | Híbrido superpowers brainstorm + GSD plan/execute/verify |
| Abordagem | Visual-First (1) — shell + 7 salas + sponsor estático, zero comércio backend |

---

## 13. Próximos passos

1. User revisa este spec.
2. Após aprovação, invocar `writing-plans` skill para gerar `PLAN.md` da Phase 1 (Sede Shell + Nav), ou ativar `gsd:new-milestone "Sede MVP"` para abrir milestone formal.
3. Phase 1 vira primeiro PR após plano travado.

---

## 14. Referências cruzadas

- `apps/crew-running/vault/2026-05-28-main-menu-hq-action-plan.md` — base do shell QG.
- `Documents/Vault-Axial/20-Axial-Projects/CrewRunning/gamification-spec.md` — XP, badges, achievements consumidos por Sala Medalhas + Ranking + Trofeu.
- `Documents/Vault-Axial/20-Axial-Projects/CrewRunning/map-layout-2d.md` — convive com Watermark territorio L1.
- `Documents/Vault-Axial/20-Axial-Projects/CrewRunning/design-system.md` — tipografia, paleta, sticker style.
- `apps/crew-running/vault/2026-05-28-voce-tab-f1-design-brainstorm.md` — convivência com aba VOCÊ.
- `apps/crew-running/components/launch/menu/CrewsPanel.tsx` — origem do botão `ENTRAR NA SEDE`.
