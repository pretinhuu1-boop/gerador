# Design Brainstorm — Aba VOCÊ Fase 1 — 2026-05-28

## Method

Filling the frontend-design slot (designer #3 of 5) after the original agent type was unavailable. Read `DESIGN.md` (palette, typography, materiality §6), `GAME_UI_TEMPLATE.md` (screen recipes), `IMPLEMENTATION_ORCHESTRATION_PLAN.md` (boundaries, no run activation), `BUTTON_ASSET_MAP.md` (button family contract), `components/launch/MainMenu.tsx:421-465` (current panel runner), `components/CustomizeScreen.tsx` (creator surface, save path L582-611), `components/SheetPreview.tsx` (partial-preview branch L66-86 as feed-card seed), `components/CrewBadge.tsx` (reusable atom), `vault/2026-05-28-main-menu-hq-action-plan.md` (HQ metaphor), and the three sibling vault outputs. Sibling outputs consulted: implementation audit (data shape + extraction points), objective critique (vanity-metric watchlines, hierarchy flip), visual contract (FeedPost = single template + crew-accent left-rail + 3% spot swatch — no chrome divergence per variant). Plan reference: `/Users/belissima/.claude/plans/toasty-riding-sloth.md`. Lens: identity-belonging > performance; sticker dossier > Instagram glass; vertical stack mobile-first; reuse `.mission-ticket` surface so the FeedPost reads as taped-down street paper, not glass card.

## 3 layouts propostos

### Layout A — Dossier Aberto

Top 80px (mobile) / 120px (desktop): identity strip on `.mission-ticket` chrome with crew banner texture (mirror `passportStyle` from `MainMenu.tsx:158-162`). Runner PNG sits left, 96px square with 5px corners + sticker-shadow. Right side stacks: runner name in Anton clamp(28-40px), crew zone tag in Permanent Marker (single use, the badge moment), JetBrains Mono signal-chip strip showing `LOOKS · 03 / STICKERS · 02 / CREW · OESTE`. Inline `AJUSTAR` link uses `btn-link` (existing) anchored top-right corner. Stamp `RUNNER PRONTO` rotates -3deg over portrait corner.

Below the header, a sealed Friends Strip placeholder: 5 own-crew avatar tiles overlapping -8px, disabled with `AMIGOS · ABRE NA FASE 2` (JetBrains Mono 10px, `--bone-soft`). Then the feed begins — a single vertical column of `FeedPost` cards, each one `.mission-ticket` + 4px left rail tinted by event type (per visual contract), Anton 18px headline, Inter 14px body, JetBrains Mono date footer. Sticky bottom-bar (mobile only): `chalk` disabled `MAPA SOCIAL · EM BREVE`.

Desktop: same vertical column centered at 720px max-width with a right rail of stickers earned (asset-only, no count) printed flush against the page. The right rail is decoration, not data.

**Materiality:** Mission folder taped to a steel locker. Each FeedPost is a stapled-in receipt with a colored tape rail on the left edge. Friends strip is the manila pocket on the inside cover.
**Strengths:** Mobile-first by construction. Reuses `.mission-ticket` + `.main-menu__passport-style` 1:1, so zero new chrome. Single template across variants (visual contract decision honored). Vertical reading rhythm respects identity narrative over scroll velocity. Materiality is unambiguous and exclusive to feed.
**Weaknesses:** Right rail on desktop risks decorative bloat; could be cut if it ever tries to show counts. Feed can feel slow when only one event exists (need a strong empty state — a single "VISUAL CRIADO" sticker post backfilled from `SavedCharacter.savedAt`).
**Not Instagram-glass because:** no blur, no rounded pill avatars, no like row under each post, no chrome-shifted hero. Crew banner texture under header is screen-blended at low opacity — reads as poster glue, not gradient overlay. No center-aligned circular profile photo; portrait is a square 5px-corner sticker with hard black offset shadow.

### Layout B — Sticker Dossier (Polaroid Stack)

Header is a slanted poster: crew banner full-bleed at 180px, runner portrait offset -16px right + rotate(-1.5deg), name in Anton sliding left of portrait. Three signal-chips below crew zone tag: looks count, sticker count, days-in-crew count (never view/follower/like). `AJUSTAR` is a small tape strip at top-right corner of the portrait.

Feed posts use the same `.mission-ticket` chrome but each card is offset alternately rotate(-0.4deg) / rotate(+0.4deg) and slightly overlap their predecessor by 6-8px on top, creating a scrapbook column. Each card carries a JetBrains Mono date stamp printed top-right like a polaroid corner-write. Friends Strip placeholder sits between header and feed as a low-saturation tape strip.

Desktop adopts the same vertical scrapbook but allows a parallel column on the right showing the "wardrobe today" — a static breakdown of currently equipped slot icons from `data/wardrobe.ts`. Pure decoration with one inline `AJUSTAR LOOK` link below; no data-list density.

**Materiality:** Polaroid stack glued into a scrapbook. Each FeedPost is a printed memory tilted by hand, paperclip energy. The wardrobe column is a vintage tag-card.
**Strengths:** Strongest "identity scrapbook" feeling; the rotation gives motion without animation. Communicates "this is your personal archive, not a feed for others" the loudest. Most original of the three.
**Weaknesses:** Rotation at every card hurts scroll readability on a long feed (10+ posts). Risk of cute-overload that betrays the "asphalt black + street-game" mandate. Mobile cards rotating could break flush at 390px. Per visual contract: "Mobile: padding: 12px, no rotation" — so the rotation grammar only ships on desktop, which fractures the identity between viewports.
**Not Instagram-glass because:** rotated, taped, papery, polaroid-corner date stamp instead of `2h ago` chip. No infinite scroll cue, no chrome unification across cards beyond the left rail.

### Layout C — Ticket Wall (Magazine Index)

Profile is a compressed two-column band at the top: portrait 64px square on the far left, runner name + crew zone + chips beside it, primary `AJUSTAR` as a `btn-link` corner tape. Footprint is roughly 96px tall on mobile, 80px on desktop — the smallest header of the three. Crew banner texture is reduced to a 24% screen-blended strip behind the chips only, not the whole header.

Below: a magazine-style **index** strip — a horizontally-scrollable row of large event headers ("MAIO 28 · VISUAL CRIADO", "MAIO 27 · GUIA OK"), each one a torn-edge ticket the size of a fingertip target (44px tall). Tapping an index ticket scrolls the feed below to that post (anchor scroll, no route change). The feed itself is the same single-template `.mission-ticket` cards as Layouts A/B but at higher visual density (smaller cards, 12-14px gap), forming a wall.

Friends Strip and "MAPA SOCIAL · EM BREVE" placeholder live below the wall, not above — clearly subordinate F2 hooks. On desktop, the wall becomes a 2-column masonry of feed cards (each still left-rail-only border, no chrome divergence), with the index strip becoming a sticky right-side jump-nav.

**Materiality:** A bulletin board / events board taped to a club door. The index strip is a row of paper tabs. Each FeedPost is a torn ticket stapled to the corkboard.
**Strengths:** Dense, fast-scan. Works well when the feed grows (F2/F3 will add stories + DMs + mission tickets). Index gives the user a sense of personal timeline as artifact — supports identity belonging without performance pressure. Smallest header lets feed dominate.
**Weaknesses:** Magazine-index pattern can read as data-heavy or admin-like ("table of contents"). Density on mobile risks tiny text under 12px. Has the highest implementation cost (index sync with scroll). On F1 the feed will have 1-3 events for most users; the index strip looks oversized for that volume.
**Not Instagram-glass because:** torn-ticket index, paper density, no carousel/stories ring at top, no full-bleed photo grid. Feed cards are ticket-sized not photo-card-sized; portraits are 64px not 96px.

## Recommendation

**Layout A — Dossier Aberto.**

It serves identity-belonging best because it commits to one materiality (mission folder), one chrome (`.mission-ticket` + left rail), and one reading rhythm (vertical scroll, no rotation, no index). The header puts the portrait and crew at the spatial anchor without competing chrome, which matches the objective critique's "flip hierarchy: portrait dominates" call. It honors the visual contract's "single FeedPost template + variant-only differentiation via rail color + 3% swatch" without inventing card variants. It scales gracefully to F2/F3 by adding event variants (DM, story, mission ticket, NFC sticker drop) that reuse the same chrome — only the rail color and headline phrase change.

Versus B: scrapbook rotation is seductive but fractures across mobile (no rotation per visual contract) — the experience would have two personalities. Versus C: ticket-wall index is over-engineered for F1's event volume (1-3 events) and risks reading as admin/dashboard. A is the most boring and the most right; it's a folder, not a magazine.

The recommendation also matches the DESIGN.md §9 layout principle: "one dominant visual plane per screen" — in VOCÊ, the dominant plane is the runner's portrait + name + crew within a taped dossier. Feed reads as the rest of the dossier's pages.

## Componentes novos sugeridos

| Component | Role | Rough props |
|---|---|---|
| `RunnerPanel` (replaces inline panel `runner` block) | Wraps header + friends strip + feed list + bottom hook. Pulls saved character + identity events via hook. | `{ crew, savedCharacter, identityEvents, onAdjust, onReplayGuide }` |
| `FeedHeader` | Identity anchor: crew banner texture + portrait + name + chips + `AJUSTAR` inline link. | `{ runnerName, crew, portraitSrc, runnerType, stats: { looks, stickers, daysInCrew }, status: 'pending'\|'editing'\|'ready', onAdjust }` |
| `FeedPost` | One single chrome card. Switches on `event.kind` only for rail color + headline phrase + small inline asset. | `{ event: IdentityEvent }` |
| `IdentityEventVariant` (internal map) | Maps `kind` → `{ railToken, swatch, headline, AssetSlot? }`. Pure data, not a component, but lives in `data/identityEventVariants.ts`. | `Record<Kind, VariantSpec>` |
| `FriendsStripPlaceholder` | Disabled horizontal strip with own-crew avatars tiled. F2 hook. | `{ crew }` |
| `MapSocialHookButton` | `CartridgeButton variant="chalk" disabled` reserved for F2. | `{}` |
| `EditTrigger` | Inline `btn-link` "AJUSTAR" used in header and per-post for `LOOK_SAVED` cards. Opens creator at wardrobe segment (F1: opens full creator; F2 may go inline). | `{ label?, onClick }` |
| `useIdentityFeed` hook | Reads `getIdentityEvents()` on mount, returns `events`. Backfills `LOOK_SAVED` from `SavedCharacter.savedAt` on first call when log is empty. | `() => IdentityEvent[]` |
| `RunnerLookCard` (extracted from `SheetPreview` partial branch L66-86) | Optional: a thumbnail variant of the runner look reused inside FeedPost for `LOOK_SAVED` and `VISUAL_CREATED` events. | `{ imageDataUrl, name, crew, runnerTypeLabel }` |

## Estado atual vs F1

### MainMenu panel runner

Today, `panel === 'runner'` (`MainMenu.tsx:421-465`) is a 44-line status widget with three text variants (saved / guide-done / pending), an optional compact runner pass, a status grid (GUIA/CREW/RUNNER), and two competing CTAs (primary + guide). In F1, this block is replaced wholesale by `<RunnerPanel />` which composes `FeedHeader` + `FriendsStripPlaceholder` + `useIdentityFeed()` mapped to `<FeedPost />` + `<MapSocialHookButton />`. The guide CTAs move to `CONFIG` per the critique. The nav label can stay `RUNNER` for F1 (the objective critique flagged it as an open question; "VOCÊ" can land in F2 with the social map).

### CustomizeScreen (creator)

Stays largely as-is. One surgical addition: `handleSaveVariant` (L582-611, specifically after the `saveCharacter(next)` at L603) calls `appendIdentityEvent({ kind: 'LOOK_SAVED', payload: { crewSlug, runnerTypeId, slots, savedAt }, timestamp })`. The creator does not change visually for F1. The `CREW STUDIO MONTANDO LOOK` and `TESTE LOCAL NAO CHAMA GEMINI` strings flagged by the visual contract are out of scope for this design pass — they live behind dev/loading and don't bleed into VOCÊ.

### SheetPreview, CrewBadge (primitives reaproveitáveis)

`CrewBadge` is reused 1:1 as both header chip (size lg in header next to portrait, sm in FeedPost head). `SheetPreview` is not embedded in VOCÊ; instead, lines 66-86 (the partial-preview branch with photo + crew badge + name + runner type label) are the visual seed for `RunnerLookCard` — extract that small composition into its own primitive so it can render inside both `SheetPreview`'s partial branch AND inside `FeedPost` for `LOOK_SAVED`/`VISUAL_CREATED` events.

### services/storage, data/runnerProfile, data/crewRenderContext

`services/storage.ts` extends with `appendIdentityEvent`, `getIdentityEvents`, `clearIdentityEvents` writing to a new key `crew.identity_events`. Pure JSON array, capped at e.g. 50 events (FIFO). Backfill rule: when array is empty but `getSavedCharacter()` returns a record, synthesize a single `LOOK_SAVED` event from `savedAt` so returning users see history. `runnerProfile.ts` stays untouched (the optional `bio` field flagged by the critique is F1-polish, not needed). `crewRenderContext.ts` is used by `FeedPost` to resolve the rendering crew per event (events store `crewSlug` string, never crew objects).

### CrewLaunchExperience (orquestração)

Untouched flow. The only change is that `MainMenu` now reads identity events at mount via `useIdentityFeed` — no new prop threading needed unless we want to reactively re-paint when the user returns from the creator (recommended: pass a `version` counter as prop, or use a custom storage-event listener inside the hook).

## F1 — proposta concreta

In `MainMenu.tsx`, replace lines 421-465 (entire `panel === 'runner'` JSX) with:

```jsx
{panel === 'runner' && (
  <RunnerPanel
    crew={activeCrew}
    savedCharacter={savedCharacter}
    progress={progress}
    onAdjust={onOpenRunnerCreator}
    onReplayGuide={guideDone ? onReviewGuidedSetup : onStartGuidedSetup}
  />
)}
```

`RunnerPanel` internal shape:

```jsx
<section className="voce-panel">
  <FeedHeader runnerName={...} crew={...} portraitSrc={...} status={...} onAdjust={onAdjust} />
  <FriendsStripPlaceholder crew={crew} />
  <ol className="voce-panel__feed">
    {identityEvents.map(ev => <li key={ev.id}><FeedPost event={ev} /></li>)}
  </ol>
  <MapSocialHookButton />
</section>
```

The existing `.main-menu__panel` `mission-ticket` chrome wraps `voce-panel`; the feed becomes the panel's primary content. The status grid (GUIA/CREW/RUNNER) is removed — that data lives in chips inside `FeedHeader` or as feed events themselves (`GUIDE_COMPLETED` is one of the supported kinds).

`FeedPost` chrome (from visual contract):
- `background: linear-gradient(90deg, rgba(0,0,0,0.86), rgba(0,0,0,0.62)), rgba(0,0,0,0.78)`
- `border-left: 4px solid var(--rail-color)` where rail-color comes from the variant map
- `border-radius: 5px; box-shadow: 4px 4px 0 #000;` plus existing `.mission-ticket::before` board-texture pseudo
- Headline: Anton 18px / 0.06em / uppercase
- Body: Inter 14px / 1.3
- Footer (date): JetBrains Mono 10px / 0.13em / uppercase

Per-variant differentiation is rail color + small inline asset (badge/sticker/portrait thumb) + headline phrase only. Never a chrome variant. Phrases come from the visual contract table (LOOK 02 EQUIPADO, VISUAL CRIADO, STICKER COLADO, BADGE NA JAQUETA, TIPO TROCADO, NOVA SELFIE, GUIA DA CREW · OK).

## Hooks pra F2/F3 (não implementar agora)

- `FriendsStripPlaceholder` reserves the row above the feed. F2 swaps the placeholder for live friend pings hydrated from `crew.friends` (NFC + QR added). DOM slot: `.voce-panel__friends-strip`.
- `MapSocialHookButton` reserves a disabled `chalk` button labeled `MAPA SOCIAL · EM BREVE` at the bottom of `RunnerPanel`. F2 enables it and wires `onClick` to the existing `onOpenMap` prop (already plumbed through `MainMenu`'s props, currently rendered as a nav-link `ABRIR MAPA` at L264 — keep both for now, the F2 work consolidates).
- `FeedPost` variant map already supports `DM_PREVIEW`, `STORY_DROP`, `MISSION_TICKET` as future kinds; F2/F3 add them by appending to the map, not touching chrome.
- Stories carousel slot: reserve `padding-top: 0` on `FeedHeader` per visual contract so a future Stories-24h strip can stack flush above the header (F3).
- DM inbox entry: reserve a top-right corner tape strip inside `FeedHeader` labeled `MENSAGENS · F3` (disabled), aligned to the right of the `AJUSTAR` link. F3 swaps to a live unread count chip.

## Top priorities

1. [blocker] Replace inline panel runner JSX with `<RunnerPanel />` — `apps/crew-running/components/launch/MainMenu.tsx:421-465`.
2. [blocker] Add `IdentityEvent` type + storage helpers + backfill rule — `apps/crew-running/services/storage.ts:78` (insert after `clearSavedCharacter`) plus new `apps/crew-running/data/identityEvents.ts` with the variant map.
3. [blocker] Emit `LOOK_SAVED` from creator — `apps/crew-running/components/CustomizeScreen.tsx:603` (after `saveCharacter(next)`).
4. [major] Build `FeedHeader`, `FeedPost`, `RunnerPanel`, `FriendsStripPlaceholder`, `MapSocialHookButton` — `apps/crew-running/components/voce/*.tsx` (new folder).
5. [major] Build `useIdentityFeed` — `apps/crew-running/hooks/useIdentityFeed.ts` (new).
6. [major] Extract `RunnerLookCard` from `SheetPreview` partial branch — `apps/crew-running/components/RunnerLookCard.tsx` (from `components/SheetPreview.tsx:66-86`).
7. [minor] Fix stale `useMemo(() => getSavedCharacter(), [])` — `apps/crew-running/components/launch/MainMenu.tsx:62` (use a `version` prop or storage listener inside the hook).
8. [minor] CSS for `.voce-panel`, `.voce-panel__feed`, `.voce-panel__friends-strip`, `.voce-feed-post`, `.voce-feed-header` — `apps/crew-running/index.css` (one CSS worker per the orchestration rules).

## Open questions

1. `AJUSTAR LOOK` on a `LOOK_SAVED` post: open the full `CustomizeScreen` (current path) or a lighter inline wardrobe-only sheet? Lean full creator for F1; revisit when wardrobe-only inline edit is designed.
2. FeedHeader stats — should `days-in-crew` count from `progress.citySignalSeen` timestamp or from first `LOOK_SAVED`? Lean first `LOOK_SAVED` (identity-first, not signal-first).
3. Backfill `GUIDE_COMPLETED` and `CREW_JOINED` events for returning users, or only backfill `LOOK_SAVED`? Lean: backfill all three from `progress` flags + `savedCharacter.savedAt` so returning users have a populated feed on first load.
4. Stamp rotation policy: `RUNNER PRONTO` stamp on portrait corner — rotate -3deg on desktop, 0deg on mobile (mirror the FeedPost rotation rule), or always 0deg for consistency? Lean always 0deg for accessibility.
5. Feed empty state (first-time user before runner saved): single static post saying "CREW LIGADA · {crewName}" rendered as a `CREW_JOINED` event? Lean yes, seeded from `progress.citySignalSeen`.
