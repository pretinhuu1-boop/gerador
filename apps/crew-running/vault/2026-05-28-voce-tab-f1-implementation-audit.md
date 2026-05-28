# Implementation Audit — Aba VOCÊ Fase 1 (Perfil + Feed Identidade Auto) — 2026-05-28

## Method

Read all 14 integration files plus 4 reference docs and 2 vault notes and the plan file. Scored each section on a 1-5 scale where 1 = skeleton/placeholder, 5 = production-ready. Audited for: LOC of relevant block, TODO/FIXME/MOCK strings, data wiring depth, empty/error state presence, and reusability for F1 components (FeedPost, FeedHeader, IdentityEventEmitter).

---

## Achados / Recomendações

- [blocker] `panel === 'runner'` block (`MainMenu.tsx:421-465`) has no feed whatsoever. It is a 44-line status widget. It would need to be replaced, not extended.
- [blocker] No `IdentityEvent` type or log exists anywhere. `storage.ts` stores exactly one object (`crew.saved_character`). There is no append-log, no event history, no feed data shape.
- [blocker] `savedCharacter` is read inside `MainMenu` via a bare `useMemo(() => getSavedCharacter(), [])` at line 62. The memo never re-runs after creation. If the user saves a new character while `MainMenu` is mounted, the panel shows stale data. F1 needs a reactive read (useState + useEffect listening to a storage change event or a callback from `CrewLaunchExperience`).
- [major] `runnerTypes.ts` canonical id is `crew-pace` (confirmed by `CREATOR_CONTRACT.md` and `wave6-final-qa-closeout.md`). `vault/2026-05-28-runner-passport-street-intro.md:59` claims it is `crew-flow`. That vault doc is stale. Any F1 work reading `runnerTypeId` must use `crew-pace` as source of truth.
- [major] `CustomizeScreen` fires `onRunnerCustomized` (→ `markRunnerCustomized` in `CrewLaunchExperience`) but does NOT emit any structured identity event. F1 needs a hook at `handleSaveVariant` (`CustomizeScreen.tsx:582`) to append a `LOOK_SAVED` event before calling `saveCharacter`.
- [major] `SheetPreview` renders the 2x2 sheet and the `EQUIPAR` overlay, but the saved PNG is accessed only via `savedCharacter.imageDataUrl`. There is no component that renders a single saved look as a feed card. `SheetPreview` is not directly reusable as a `FeedPost` primitive; it needs a slimmer sibling.
- [minor] `CrewBadge` is reusable as-is for feed post headers (crew context chip). Accepts `string | CrewZone | undefined`, returns `<img>` with `--crew-accent` CSS var. No changes needed.
- [minor] `RunnerTypePicker` and `WardrobePicker` are self-contained and do not need to be touched for F1.
- [minor] `data/crewRenderContext.ts` is useful for mapping a saved `crewSlug` back to display data (name, zone, accent, badge path) inside feed posts. `buildCrewRenderContext(slug)` is the right call-site.
- [minor] `RunnerSavedTeaser` hardcodes `sticker_1.png` and `achievement_1.png` paths without checking file existence. Same pattern will occur in feed post assets unless guarded.

---

## Estado atual vs F1

### MainMenu panel runner (a aba)

- LOC of the panel block: 44 lines (lines 421-465)
- TODO/FIXME/MOCK: 0 strings
- Data wiring: reads `savedCharacter` (stale memo, line 62), `runnerType` (derived from `savedCharacter.runnerTypeId` via `getRunnerTypeById`, line 73-76), `activeCrew` (from prop), `progress` (from prop). No reactive subscription, no feed events.
- Empty states: yes — three text variants (saved / guide-done / pending). No loading state, no error state.
- Score: 2/5. Correct status display for the current flow. Structurally wrong for F1 (no profile header, no feed list, no inline actions).

### CustomizeScreen (creator)

- LOC: 736 lines total; save path at lines 582-611.
- TODO/FIXME/MOCK: 0 strings in source.
- Data wiring: reads `buildCrewRenderContext`, `WARDROBE`, `runnerProfile`, `runnerTypes`. Writes `saveCharacter` once on successful equip. Does not emit any side-channel event.
- Empty/error states: full coverage — photo missing, name missing, API key missing, generate error, save error, loading.
- Score: 4/5 as a creator. 1/5 as an identity-event emitter (emits nothing).

### SheetPreview, CrewBadge (primitives)

- `SheetPreview` LOC: 160. Renders sheet image + 4 variant overlay buttons + partial preview. Props: `result`, `loading`, `error`, `partial`, `onSave`. Tightly coupled to `GenerateResult` shape (2x2 sheet + variants array). Not directly reusable for a single-image feed card.
- Reuse potential for F1: extract a `RunnerLookCard` component using `savedCharacter.imageDataUrl` + `savedCharacter.slots` + `savedCharacter.profile`. `SheetPreview`'s `partial` branch (photo, name, crewSlug, runnerTypeLabel display) is a good visual reference for the feed post header.
- `CrewBadge` LOC: 39. Fully reusable. Accepts slug string, resolves to badge path + accent CSS var, renders `<img>`. Use as crew chip in `FeedPost` header.
- Score: `SheetPreview` 3/5 as primitive (needs extraction), `CrewBadge` 5/5 as reusable atom.

### services/storage, data/runnerProfile, data/crewRenderContext

- `storage.ts` LOC: 82. Exports `getSavedCharacter`, `saveCharacter`, `clearSavedCharacter`, `getApiKey`/`setApiKey`/`clearApiKey`. One localStorage key (`crew.saved_character`). No versioning, no migration, no event log, no append pattern.
- Feed event log does not exist. Would require a new key (e.g., `crew.identity_events`) and append/read helpers.
- `SavedCharacter` type (`storage.ts:55-70`) already contains all fields needed to reconstruct a `LOOK_SAVED` feed event: `imageDataUrl`, `profile`, `crewSlug`, `runnerTypeId`, `slots`, `savedAt`.
- `runnerProfile.ts` LOC: 55. Pure types + sanitize utils. No state, no side effects. Usable directly in `IdentityEvent` payload.
- `crewRenderContext.ts` LOC: 83. `buildCrewRenderContext(slug)` gives name, zone, accent, badge path. Essential for feed post display from a stored `crewSlug` string.
- Score: `storage.ts` 3/5 (solid foundation, needs event-log extension), data files 5/5 (types are clean and stable).

### CrewLaunchExperience (orquestração)

- LOC: 199. Clean state machine: `consoleBoot → title → citySignal → mainMenu → guidedSetup → runnerCreator → runnerSaved`.
- `handleRunnerSaved` (line 121-125): calls `markRunnerCustomized`, syncs progress, transitions to `runnerSaved`. This is the natural insertion point for emitting a `LOOK_SAVED` identity event to the feed log — either here or in `CustomizeScreen.handleSaveVariant`.
- `MainMenu` receives `progress` + crew slug as props, not a reactive store. For F1, the panel runner needs access to the feed event log, which `CrewLaunchExperience` would need to thread down (or a hook reads directly from storage).
- Score: 4/5 as orchestrator. Needs one new callback path to propagate event-emit on runner save, and to pass feed data to `MainMenu`.

---

## F1 — proposta concreta

**What to add:**

1. `services/storage.ts` — add `IdentityEvent` type + `appendIdentityEvent(event)` + `getIdentityEvents()` helpers, writing to `crew.identity_events` as a JSON array. Seeded from `SavedCharacter` on first read if the array is empty but a saved character exists (backfill the `LOOK_SAVED` event from `savedAt`).

2. `data/identityEvents.ts` (new, small) — `IdentityEventKind` union (`LOOK_SAVED | RUNNER_TYPE_CHANGED | GUIDE_COMPLETE | CREW_JOINED`) + `IdentityEvent` type: `{ kind, payload, timestamp }`.

3. `CustomizeScreen.tsx:handleSaveVariant` — after `saveCharacter(next)` at line 603, call `appendIdentityEvent({ kind: 'LOOK_SAVED', payload: { crewSlug, runnerTypeId, slots, savedAt }, timestamp: Date.now() })`.

4. `components/RunnerLookCard.tsx` (new) — slim display primitive: runner PNG + name + crew badge + runner type label + date. Extracted from `SheetPreview`'s partial-preview branch. Used inside `FeedPost`.

5. `components/FeedPost.tsx` (new) — wraps `RunnerLookCard` or a text-only event card. Props: `event: IdentityEvent`. Switch on `event.kind` to render the right card shape.

6. `components/launch/MainMenu.tsx` — replace the `panel === 'runner'` block (lines 421-465) with a new `RunnerPanel` sub-component: profile header (photo, name, crew, runner type) + `FeedPost` list from `getIdentityEvents()` + inline CTA ("AJUSTAR LOOK" → opens creator, not full guide). Remove the `main-menu__runner-pass--compact` block; it is superseded.

7. `useIdentityFeed` hook (new, in `hooks/useIdentityFeed.ts`) — reads `getIdentityEvents()` on mount, returns `events[]`. No subscription needed for F1 (local-only, no real-time). Called inside `RunnerPanel`.

**What to extract/refactor:**

- Extract `RunnerPanel` from `MainMenu`'s inline JSX to keep `MainMenu.tsx` under 300 LOC after the addition.
- The stale `useMemo(() => getSavedCharacter(), [])` at line 62 must be changed to `useState` + `useEffect` once `MainMenu` can be reached without remounting (currently it remounts each time via `CrewLaunchExperience` screen switch, so the stale memo is not a bug yet — but it will be once inline "AJUSTAR LOOK" editing is possible without leaving the screen).

**Data flow:**

```
CustomizeScreen.handleSaveVariant
  → appendIdentityEvent({ kind:'LOOK_SAVED', ... })
  → saveCharacter(next)
  → onRunnerCustomized()

MainMenu (panel runner) mounts
  → useIdentityFeed() reads getIdentityEvents()
  → renders FeedPost list
```

---

## Hooks pra F2/F3 (não implementar agora)

- Friends list slot: reserve a `RunnerPanel` section below the feed with a `div.runner-panel__friends-placeholder` containing a disabled `CartridgeButton` labeled "AMIGOS · EM BREVE". Data shape for F2: `FriendRecord { userId, runnerName, crewSlug, addedAt, addMethod: 'nfc'|'qr' }` stored in `crew.friends`.
- "ABRIR MAPA SOCIAL" button: add a disabled `CartridgeButton variant="chalk"` at the bottom of `RunnerPanel` with `aria-disabled` and copy "MAPA SOCIAL · F2". No routing logic.
- DM inbox slot: reserve a `div.runner-panel__dm-placeholder` with copy "MENSAGENS · F3" below the profile header. Data shape for F3: `DMThread { threadId, participants, lastMessage, unreadCount }`.
- Stories carousel slot: reserve a horizontal scroll rail `div.runner-panel__stories-rail` above the feed with 1 placeholder story chip. Data shape for F3: `Story { storyId, authorId, mediaUrl, expiresAt }`.

---

## Top priorities

1. [blocker] Create `IdentityEvent` type + storage helpers — `apps/crew-running/services/storage.ts:78` (append after `clearSavedCharacter`) and new `apps/crew-running/data/identityEvents.ts`.
2. [blocker] Emit `LOOK_SAVED` event at `apps/crew-running/components/CustomizeScreen.tsx:603` (inside `handleSaveVariant`, after `saveCharacter`).
3. [blocker] Replace `panel === 'runner'` block at `apps/crew-running/components/launch/MainMenu.tsx:421-465` with `RunnerPanel` component reading identity events.
4. [major] New `RunnerLookCard.tsx` and `FeedPost.tsx` as display primitives. Extract from `SheetPreview` partial-preview branch.
5. [major] New `useIdentityFeed` hook — thin read layer over `getIdentityEvents()`.
6. [minor] Fix stale `savedCharacter` memo (`MainMenu.tsx:62`) before any inline-edit flow is wired.
7. [minor] Backfill `LOOK_SAVED` event from existing `SavedCharacter.savedAt` on first `getIdentityEvents()` call, so returning users see history.
8. [minor] Update stale vault doc `2026-05-28-runner-passport-street-intro.md:59` — replace claim that canonical `runnerTypeId` is `crew-flow`; correct value is `crew-pace`.

---

## Open questions

1. Should `FeedPost` for `LOOK_SAVED` show the full runner PNG (expensive dataUrl in list) or a thumbnail/crop? Thumbnail would require either a stored small version or a CSS `object-fit: cover` crop at render time.
2. When the user taps a feed post's "AJUSTAR LOOK" inline CTA, does it open the full `CustomizeScreen` (current only option) or a lighter inline wardrobe sheet? F1 scope says "ver sheet, editar look sem reabrir creator inteiro" — needs human decision on how deep the inline edit goes.
3. `getIdentityEvents()` returns events in what order? Newest-first (Instagram-style) is assumed but must be confirmed.
4. Is there a maximum event count to store locally (e.g., last 50) or is it unbounded until F3 backend sync?
5. The `panel === 'runner'` nav label currently reads "RUNNER". Should it change to "VOCÊ" to match the product brainstorm naming, or stay as "RUNNER" for this phase?
