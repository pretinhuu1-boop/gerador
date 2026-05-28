# Objective Critique — Aba VOCÊ Fase 1 — 2026-05-28

## Method

Audited aba VOCÊ (`components/launch/MainMenu.tsx:421-465`) against locked brainstorm decisions and the identity-belonging contract (DESIGN.md, GAME_UI_TEMPLATE.md). Examined current state: portrait pass + 3 status labels + 2 CTAs that reopen CustomizeScreen. Confronted against proposed F1 direction (Instagram-style profile + auto-identity feed) and MVP gates (no GPS, no live tracking, no leaderboard, no streak punishment, no public route). Evaluated risk that social feed becomes vanity metric rather than identity storytelling.

## Achados / Recomendações

`components/launch/MainMenu.tsx:421-465`: [blocker] aba runner mixes guide state + identity state + creator reopen. Should show profile + feed when runner saved, not duplicate creator UI. Refactor to profile-card + feed stub for F1.

`components/launch/MainMenu.tsx:424-430`: [major] copy "Runner pronto/Montar runner/Runner pendente" masks identity narrative. F1 should shift tone from creator-progress to "identidade pronta" messaging with profile header.

`components/launch/MainMenu.tsx:432-447`: [major] runner pass treats portrait as secondary to copy block. F1 profile must flip: large portrait/sheet (visual identity anchor) + compact stats + feed posts below. Portrait must dominate the spatial hierarchy.

`components/launch/MainMenu.tsx:456-462`: [blocker] two CTAs (primary + "ABRIR/REVER GUIA") compete at same visual weight. F1 must lock guide behind secondary/"CONFIG" tab, not inline. Primary action must be contextual to profile (edit look, view feed, enter map for F2).

`services/storage.ts:55-70`: [blocker] SavedCharacter lacks timestamp + event flags needed for feed. Missing `createdAt`, `lastModifiedAt`, `identity_events` array to track auto-generated feed posts (look changes, type swaps, badge unlocks). Must extend schema before F1 implements feed.

`data/runnerProfile.ts`: [nit] RunnerProfile lacks personality narrative richness. Consider adding `bio` field (1-2 sentence self-description post-creation) for profile header, but this is F1 polish not blocker.

`components/CustomizeScreen.tsx:1-100`: [major] creator still prints "CREW STUDIO" + "API KEY" + "GERAR" surface language. F1 must hide this behind dev settings per GAME_UI_TEMPLATE.md#RunnerCreator. Creator should appear inline in profile/"EDITAR LOOK" modal, not standalone screen re-entry.

`components/launch/MainMenu.tsx:448-454`: [major] status labels (GUIA / CREW / RUNNER) are metadata noise when profile should be the stage. F1 can fold these into profile header as visual chips (crew badge + "PRONTO" stamp) not verbose spans.

`components/SheetPreview.tsx:44-95`: [nit] uses mission-ticket class but sheet is dense generator UI not game state. F1 should repurpose SheetPreview as FeedPost component (grid item showing saved sheet + crew badge + timestamp) not generator preview. Generator moves to modal/inline edit.

`components/launch/MainMenu.tsx:421-465`: [major] "Identidade pronta para proxima fase de cidade" doesn't specify what next phase means. Vanity-metric watchline: copy must never imply ranking, streak, social comparison or run activation. F1 must be explicit: "sua identidade esta salva na crew" (collective belonging, not competitive).

`index.css`: [major] MainMenu runner panel uses 2-column layout (portrait | text). F1 needs vertical stack (header + sheet + feed posts) on mobile, asymmetric grid on desktop (large sheet + sidebar feed preview). Current CSS likely breaks on mobile for profile-first design.

## Estado atual vs F1

### MainMenu panel runner (a aba)

**Current:** Shows conditional "Runner pronto/Montar/Pendente" heading, optional portrait pass, status metadata, two CTAs (primary + guide).

**F1 required:** Profile card header (large portrait or sheet crop + name + crew badge + runner type + "PRONTO" stamp) + feed posts (auto-generated identity events: criou sheet, mudou look, completou guia, ganhou badge) + inline ações (EDITAR LOOK, VER SHEET, ENTRAR MAPA para F2). Guide action moves to CONFIG tab or hidden flow.

**Vanity risk:** If feed posts show "view count", "people saw your look", or any engagement metric → must be removed. Feed is timeline of runner's own identity evolution, not social proof.

### CustomizeScreen (creator)

**Current:** Full-screen character sheet generator with photo upload, profile fields, runner type, wardrobe slots, generation button, API key input (behind dev gate).

**F1 required:** Extracted into inline modal/panel accessed via "EDITAR LOOK" button in profile. Must never show generator UI (CREW STUDIO text, GERAR button, API KEY input) in main profile path. Dev mode locked behind settings/dev action.

**Vanity risk:** Creator must not suggest "publish to feed" or "show others your look" in main onboarding. F1 generates feed posts server-side on save; UX says nothing about sharing.

### SheetPreview, CrewBadge

**Current:** SheetPreview shows 2x2 grid with EQUIPAR buttons. CrewBadge is reusable badge component.

**F1 reapproval:** SheetPreview becomes FeedPost component (shows saved sheet crop + crew badge + timestamp + mini-metadata). CrewBadge used as identity anchor in profile header (crew of origin).

### services/storage, data/runnerProfile, data/crewRenderContext

**Current:** SavedCharacter stores imageDataUrl + profile + crew + slots + savedAt. RunnerProfile is name/sex/height/weight/personality. CrewRenderContext builds assets from selected crew.

**F1 required additions:**
- SavedCharacter must track `identity_events: Array<{type: 'sheet_created'|'look_equipped'|'type_changed'|'badge_earned', timestamp: number, data?: object}>` for feed source.
- RunnerProfile should support optional `bio` (self-written 1-2 line) for profile header richness.
- Feed event hooks need to fire on save, wardrobe change, runner type change without user action (auto-detection).

### CrewLaunchExperience (orquestração)

**Current:** Routes through boot → title → city signal → mainMenu → creator. State machine clear.

**F1 impact:** No state changes needed. MainMenu must receive feed event list from storage to render profile + feed. Creator stays lazy-loaded but accessed inline, not as main route step.

## F1 — proposta concreta

### Profile Header (visual anchor)
- Large saved sheet crop (or portrait if no sheet yet, with "IDENTIDADE PENDENTE" state)
- Runner name + crew badge (accent color) + runner type label below
- "RUNNER PRONTO" stamp (hand-drawn marker style from DESIGN.md)
- Compact crew zone + created date as secondary metadata

**Copy:** Remove guide-progress language ("montar runner", "guia liberou"). Replace with identity narrative: "Seu runner está pronto. A crew ouve o sinal."

### Feed (auto-identity posts)
- Vertical timeline of events: sheet created, look saved, type swapped, badge earned, crew joined
- Each post is a small card: event icon + text + timestamp + optional mini-asset (badge thumbnail, look crop)
- Posts generated server-side on save; UX never asks user to "post" or "share"
- NO engagement metrics (likes, views, reposts)
- NO comparisons to other runners

**Example posts:**
- "Sheet criado — Downtown Rush"
- "Look 02 equipado"
- "Runner type → Night Run"

### Primary CTA (contextual)
- If runner not created: "CRIAR RUNNER" (goes to creator modal)
- If runner saved + no edits since: "EDITAR LOOK" (opens creator modal to wardrobe only, not re-do photo/profile)
- If runner saved + edits pending: "SALVAR MUDANCAS" (commits pending state)

### Secondary Actions
- Profile: view saved sheet full-size (lightbox, not separate screen)
- Guide: move to CONFIG tab with "REVER GUIA" + "ABRIR GUIA" buttons
- Feed: placeholder button "ABRIR MAPA" (stub for F2 social layer, disabled with tooltip "próxima fase")

### Data structure (identity_events)
```ts
type IdentityEvent = {
  type: 'sheet_created' | 'look_equipped' | 'type_changed' | 'badge_earned' | 'guide_complete' | 'crew_chosen';
  timestamp: number;
  detail?: {
    lookIndex?: number; // 0-3 for which look saved
    runnerTypeId?: string;
    badgeId?: string;
  };
};
```

## Vanity-metric watchlines

🚨 **EXPLICIT BLOCKS for F1 implementation:**

- NO "view count" on feed posts
- NO "people have seen your look" messaging
- NO follower count, follow/unfollow buttons
- NO like/heart on feed posts
- NO "trending looks" or "popular runners" section
- NO "X people favorited your runner" notification
- NO engagement-bait copy ("show the city your signal", "prove yourself")
- NO leaderboard, ranking, or comparative metrics
- NO daily streak counter or pace pressure in profile
- NO "share to [social platform]" buttons

**Identity-belonging copy rules:**
- Posts say "you created", "crew heard", "identity saved" — not "shared", "published", "revealed"
- Feed is personal timeline, not performance stage
- Runner identity is collective crew belonging, not individual brand
- Wardrobe changes are self-expression, not status symbols

## Hooks pra F2/F3 (não implementar agora)

### F2 (Map Social Layer)
- Profile button "ABRIR MAPA" → navigates to map panel (future)
- Data prep: runner identity + crew slug ready in CrewLaunchExperience context
- Placeholder: disabled button with tooltip "próxima fase"

### F3 (DM + Stories)
- Profile menu item "MENSAGENS" (future inbox)
- Feed post type placeholder: `'message_received'` (auto-events when F3 DM system live)
- Story duration constant: `24h` (baked into theme, not active)

## Top priorities

1. **apps/crew-running/services/storage.ts:55-70** — extend SavedCharacter schema with `identity_events` array + timestamps. Blocker for feed data source.

2. **apps/crew-running/components/launch/MainMenu.tsx:421-465** — refactor runner panel: flip hierarchy (portrait anchor, feed below), remove guide CTA inline, add feed post rendering. Major UX shift.

3. **apps/crew-running/index.css** — rewrite runner panel layout to profile-first (header + grid feed), test mobile 390px stacking. Current 2-col likely breaks.

4. **apps/crew-running/components/CustomizeScreen.tsx** — hide generator UI (CREW STUDIO, GERAR, API KEY) from creator when opened as inline modal. Keep dev mode behind settings toggle.

5. **apps/crew-running/data/runnerProfile.ts** — consider adding optional `bio` field (self-written, 1-2 lines) for profile richness, but not blocker.

## Open questions

- **F1 feed empty state:** What shows in feed before any events logged? Static welcome message or visual placeholder (sticker, zone pattern)?
- **Creator re-entry in F1:** Should "EDITAR LOOK" open full CustomizeScreen or modal with wardrobe-only controls + quick "CRIAR NOVO SHEET" action?
- **Wardrobe changes auto-feed:** When user changes a slot in profile, does a feed post auto-generate immediately or only on explicit "SALVAR"?
- **Badge/achievement unlock trigger:** Do crew leader actions trigger badge events (stored server-side F2+) or are F1 badges static/manual?
- **Timestamp locale:** Should feed posts show "5 min ago" relative format or strict "2026-05-28 14:32" timestamp?
