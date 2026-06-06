# Refactor Blueprint — Aba VOCÊ Fase 1 — 2026-05-28

## Method

Synthesized from four parallel sibling outputs: code-explorer (implementation audit of all integration files, data shape inventory, reusability scoring), caveman-reviewer (identity-belonging critique, vanity-metric watchlines, copy/hierarchy mandates), designer (three layout proposals with Dossier Aberto recommended, component shapes, materiality language), and code-reviewer (visual token audit, FeedPost chrome rules, forbidden CSS patterns). The main conflict reconciled was naming: code-explorer flags `crew-flow` in vault doc `2026-05-28-runner-passport-street-intro.md:59` as stale — canonical `runnerTypeId` is `crew-pace` per `data/runnerTypes.ts:4` and `CREATOR_CONTRACT.md`; all F1 work uses `crew-pace`. A secondary conflict was whether `appendIdentityEvent` lives inside `storage.ts` or a separate module — resolved: stays in `storage.ts` for consistency with existing `saveCharacter`/`getSavedCharacter` pattern, with a new storage key `crew.identity_events`.

## Sibling Agent Findings — Synthesis

- **code-explorer**: The `panel === 'runner'` block (`MainMenu.tsx:421-465`) is a 44-line status widget scored 2/5 — "structurally wrong for F1 (no profile header, no feed list, no inline actions)." Also flags the stale `useMemo(() => getSavedCharacter(), [])` at `MainMenu.tsx:62` which never re-runs. This shapes the blueprint: the block must be replaced wholesale with `<RunnerPanel />`, and `savedCharacter` must be read reactively via a version counter or storage listener.

- **caveman-reviewer**: "Runner pronto/Montar runner/Runner pendente" messaging masks the identity narrative and must be replaced. More critically, the reviewer establishes explicit vanity-metric blocks: no view count, no follower count, no likes, no streak counters, no "show the city your signal" copy. Feed is personal timeline, not performance stage. This shapes every `FeedPost` phrase in the variant map and all copy inside `FeedHeader`.

- **designer**: Recommends Layout A — Dossier Aberto: mission-folder materiality, single `.mission-ticket` chrome, vertical scroll, portrait-dominant header. "It is the most boring and the most right." The recommendation executes via `RunnerPanel` composing `FeedHeader` + `FriendsStripPlaceholder` + `FeedPost` list + `MapSocialHookButton`, all living in `components/voce/`. The `panel === 'runner'` JSX is replaced with a single `<RunnerPanel ... />` call.

- **code-reviewer**: Mandates a single FeedPost chrome: `background: linear-gradient(90deg, rgba(0,0,0,0.86), rgba(0,0,0,0.62)), rgba(0,0,0,0.78)` + `border-left: 4px solid var(--crew-accent)` + `border-radius: 5px` + `box-shadow: 4px 4px 0 #000`. Per-variant differentiation through rail color + 3% spot swatch only — never chrome divergence. Also flags `.launch-city-map__routes` and `.console-boot__panel` glassmorphism (`index.css:779, 1335-1361`) as pre-existing violations that FeedPost must not inherit.

## Conflicts Reconciled

| Conflict | Resolution |
|---|---|
| `runnerTypeId` canonical value: `crew-flow` (stale vault doc) vs `crew-pace` (source) | `crew-pace` is canon. `data/runnerTypes.ts:4` + `CREATOR_CONTRACT.md` are authoritative. |
| Where event emission lives: `CustomizeScreen.handleSaveVariant` vs `CrewLaunchExperience.handleRunnerSaved` | `CustomizeScreen.tsx:604` (immediately after `saveCharacter(next)`) — keeps the emit closest to the write, avoids threading a new callback through `CrewLaunchExperience`. |
| `appendIdentityEvent` in `storage.ts` vs new `services/identityEvents.ts` | `storage.ts` — all localStorage helpers live there; splitting adds a layer with no benefit at F1 scale. |
| Panel nav label `RUNNER` vs `VOCÊ` | Stay `RUNNER` for F1. The brainstorm names the tab "VOCÊ" but the designer explicitly defers rename to F2 to avoid scope creep. |
| Backfill scope: `LOOK_SAVED` only vs all three flags | Backfill `LOOK_SAVED` + `GUIDE_COMPLETED` + `CREW_JOINED` from `progress` flags + `savedCharacter.savedAt` so returning users see a populated feed. Confirmed by designer open question resolution. |
| FeedPost rotation per Layout B | No rotation. Visual contract: "Mobile: no rotation." Zero rotation across all viewports for accessibility and cross-viewport consistency. |

## Build Sequence (Ordered)

1. **[data] Add `IdentityEvent` type + `identityEventVariants` map**
   - New file: `apps/crew-running/data/identityEvents.ts`
   - Contents: `IdentityEventKind` union, `IdentityEvent` interface, `IdentityEventVariantSpec` type, `IDENTITY_EVENT_VARIANTS` record (rail token, swatch var, headline phrase, asset slot type per kind)
   - No imports from storage or React — pure data
   - Test: `src/__tests__/identityEvents.test.ts` — verify all `IdentityEventKind` values have a matching variant spec, variant rail tokens are valid CSS var names

2. **[storage] Extend `services/storage.ts` with event-log helpers**
   - Append after `clearSavedCharacter` (line 81): `appendIdentityEvent`, `getIdentityEvents`, `clearIdentityEvents`, backfill logic
   - New storage key constant: `const IDENTITY_EVENTS_STORAGE = 'crew.identity_events'`
   - Cap at 50 events FIFO
   - Test: `src/__tests__/storage.test.ts` — append, read, FIFO cap, backfill from `SavedCharacter.savedAt`

3. **[emit] Instrument `CustomizeScreen.handleSaveVariant` to emit `LOOK_SAVED`**
   - `apps/crew-running/components/CustomizeScreen.tsx:604` — after `saveCharacter(next)`, call `appendIdentityEvent({ kind: 'LOOK_SAVED', payload: { crewSlug: next.crewSlug, runnerTypeId: next.runnerTypeId, slots: next.slots, savedAt: next.savedAt }, timestamp: next.savedAt })`
   - Test: mock `appendIdentityEvent` in `CustomizeScreen.test.tsx`, assert called once after successful save, not called on error path

4. **[hook] Create `hooks/useIdentityFeed.ts`**
   - Reads `getIdentityEvents()` on mount, triggers backfill on first empty read, returns sorted newest-first array
   - Accepts optional `version?: number` param — changes to `version` re-run the read (enables reactive repaint from parent)
   - Test: `src/__tests__/useIdentityFeed.test.ts` — returns empty array when no storage, returns sorted events, re-reads when version changes

5. **[primitive] Extract `RunnerLookCard` from `SheetPreview` partial branch**
   - New file: `apps/crew-running/components/RunnerLookCard.tsx`
   - Source reference: `components/SheetPreview.tsx:66-86` (partial preview branch: photo + `CrewBadge` + name + runner type label)
   - Props: `{ imageDataUrl: string; name: string; crewSlug: string; runnerTypeLabel: string; size?: 'sm' | 'lg' }`
   - `SheetPreview` partial branch imports and renders `<RunnerLookCard>` — no behavior change
   - Test: render snapshot, assert `CrewBadge` is present, `img` src matches `imageDataUrl`

6. **[component] Build `FeedPost` with variant map**
   - New file: `apps/crew-running/components/voce/FeedPost.tsx`
   - Props: `{ event: IdentityEvent }`
   - Renders `.mission-ticket` chrome + `border-left: 4px solid var(--rail-color)` from `IDENTITY_EVENT_VARIANTS[event.kind].railToken`; Anton 18px headline; Inter 14px body; JetBrains Mono 10px date footer
   - Inline `RunnerLookCard` for `LOOK_SAVED` / `VISUAL_CREATED` kinds only
   - Zero like/view/count rendering; no `SHARE` or `PUBLICAR` copy
   - Test: render each `IdentityEventKind`, assert rail color CSS var applied, assert no engagement metric elements present

7. **[component] Build `FeedHeader`**
   - New file: `apps/crew-running/components/voce/FeedHeader.tsx`
   - Props: `{ runnerName: string; crew: CrewRenderContext; portraitSrc: string | null; runnerType: RunnerType; status: 'pending' | 'editing' | 'ready'; onAdjust: () => void }`
   - Background mirrors `passportStyle` at `MainMenu.tsx:160-163` — `linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.82)), url(${crew.assets.banner.path})`
   - Portrait: `CrewBadge` size `lg` (96px) with sticker shadow when no portrait; `<img>` with 5px corner + sticker shadow when portrait present
   - Stamp `RUNNER PRONTO` at -3deg visible only when `status === 'ready'`; 0deg on mobile via media query
   - Stats row: identity-belonging chips only (`LOOKS · N`, `STICKERS · N`, `CREW · 1`) — never follower/view/like count
   - Inline `<CartridgeButton variant="link">AJUSTAR</CartridgeButton>` top-right for `onAdjust`
   - F3 placeholder: disabled `span.voce-feed-header__dm-placeholder` labeled `MENSAGENS · F3`, `aria-hidden="true"`
   - Test: render with `status='ready'`, assert stamp visible; render with `status='pending'`, assert stamp absent; assert `MENSAGENS · F3` is `aria-hidden`

8. **[component] Build `FriendsStripPlaceholder` and `MapSocialHookButton`**
   - New files: `apps/crew-running/components/voce/FriendsStripPlaceholder.tsx` and `MapSocialHookButton.tsx`
   - `FriendsStripPlaceholder`: `aria-hidden="true"`, own-crew badge tiles (up to 5 at 36px with -8px overlap), `opacity: 0.5; filter: saturate(0.7)`, label `AMIGOS · ABRE NA FASE 2`
   - `MapSocialHookButton`: `<CartridgeButton variant="chalk" disabled className="game-command">MAPA SOCIAL · EM BREVE</CartridgeButton>`, `.btn-chalk:disabled` treatment from `index.css:3953-3957`
   - Test: assert both carry `aria-disabled` or `aria-hidden`; assert no `onClick` wired on `MapSocialHookButton`

9. **[component] Build `RunnerPanel` and compose**
   - New file: `apps/crew-running/components/voce/RunnerPanel.tsx`
   - Props: `{ crew: Crew; savedCharacter: SavedCharacter | null; progress: LaunchProgress; onAdjust: () => void; onReplayGuide: () => void; version?: number }`
   - Internal: calls `useIdentityFeed(version)`, derives `crewCtx` via `buildCrewRenderContext(crew.slug)`, derives `runnerType` via `getRunnerTypeById(savedCharacter?.runnerTypeId)`
   - Renders: `<FeedHeader>` + `<FriendsStripPlaceholder>` + `<ol className="voce-panel__feed">` of `<FeedPost>` per event + `<MapSocialHookButton>`
   - Empty state: when `events.length === 0` and no `savedCharacter`, render a single synthetic `CREW_JOINED` card from `progress.citySignalSeen`
   - Test: render with no events, assert empty-state card visible; render with 2 events, assert 2 `FeedPost` rendered

10. **[refactor] Replace `panel === 'runner'` block in `MainMenu.tsx`**
    - `apps/crew-running/components/launch/MainMenu.tsx:428-472` — delete entire conditional block
    - Replace with: `{panel === 'runner' && <RunnerPanel crew={activeCrew} savedCharacter={savedCharacter} progress={progress} onAdjust={onOpenRunnerCreator} onReplayGuide={guideDone ? onReviewGuidedSetup : onStartGuidedSetup} version={runnerVersion} />}`
    - Add `const [runnerVersion, setRunnerVersion] = useState(0)` to `MainMenu`
    - Fix stale memo: change `savedCharacter` read at line 64 to `useState` initialized from `getSavedCharacter()` + update via a `storageVersion` counter (or pass `savedCharacter` down from `CrewLaunchExperience` as a prop if it already holds a fresh copy after `handleRunnerSaved`)
    - Guide CTAs (`REVER GUIA` / `ABRIR GUIA`) move to `panel === 'config'` block — add them there alongside `AudioMuteToggle`
    - Test: render `MainMenu` with `panel='runner'`, assert `RunnerPanel` present; assert old status grid (`GUIA`, `CREW`, `RUNNER` spans) not present

11. **[css] Add `.voce-panel`, `.voce-feed-header`, `.voce-panel__feed`, `.voce-feed-post` to `index.css`**
    - Add after existing `.main-menu__runner-pass` rules
    - `.voce-feed-post`: `mission-ticket` chrome + `border-left: 4px solid var(--rail-color)` + `box-shadow: 4px 4px 0 #000` + `padding: 14px 16px`; mobile: `padding: 12px`
    - `.voce-feed-header`: `border-left: 4px solid var(--crew-accent)` + `border-radius: 5px` + `box-shadow: 5px 5px 0 rgba(0,0,0,0.82)` + `transform: rotate(-0.35deg)`; mobile: `transform: none`
    - `.voce-panel__friends-strip`: `display: flex; gap: 8px; padding: 10px 14px`
    - Verify: no `backdrop-filter`, no `border-radius: 999px`, no `box-shadow` with `inset` + soft color (only hard `#000` outer)
    - Test: visual regression snapshot at 390px and 1280px

12. **[cleanup] Remove `.main-menu__runner-pass--compact` dead block and update stale vault doc**
    - `MainMenu.tsx`: delete `.main-menu__runner-pass--compact` block (now superseded by `RunnerPanel`)
    - `index.css`: remove or comment `.main-menu__runner-pass--compact` rule if unused by any other panel
    - `vault/2026-05-28-runner-passport-street-intro.md:59`: add inline correction comment `<!-- stale: crew-flow → crew-pace per runnerTypes.ts:4 -->`
    - Test: TypeScript build clean, no unused CSS class warnings

## Data Shapes

### IdentityEvent

```ts
type IdentityEventKind =
  | 'LOOK_SAVED'
  | 'VISUAL_CREATED'
  | 'RUNNER_TYPE_CHANGED'
  | 'GUIDE_COMPLETED'
  | 'CREW_JOINED'
  | 'STICKER_DROPPED'
  | 'BADGE_EARNED';

interface IdentityEventPayload {
  crewSlug?: string;
  runnerTypeId?: string;
  slots?: { top: string; bottom: string; shoes: string; accessory: string };
  savedAt?: number;
  lookIndex?: number;
  badgeId?: string;
  stickerId?: string;
}

interface IdentityEvent {
  id: string;           // `${kind}_${timestamp}` — deterministic for list keys
  kind: IdentityEventKind;
  payload: IdentityEventPayload;
  timestamp: number;    // ms epoch
}
```

### Storage Layer Extension

Additions to `apps/crew-running/services/storage.ts` after line 81:

```ts
const IDENTITY_EVENTS_STORAGE = 'crew.identity_events';
const IDENTITY_EVENTS_MAX = 50;

export const getIdentityEvents = (): IdentityEvent[] => { ... }
export const appendIdentityEvent = (event: Omit<IdentityEvent, 'id'>): void => { ... }
export const clearIdentityEvents = (): void => { ... }
```

Backfill rule: when stored array is empty but `getSavedCharacter()` is non-null, synthesize and persist `LOOK_SAVED` from `savedAt`, `GUIDE_COMPLETED` from `progress.guidedSetupComplete`, `CREW_JOINED` from `progress.citySignalSeen` — best triggered in `useIdentityFeed` rather than raw `getIdentityEvents` to avoid circular concerns.

### Hook Contract

```ts
// apps/crew-running/hooks/useIdentityFeed.ts

interface UseIdentityFeedOptions {
  version?: number;
  progress?: LaunchProgress;
  savedCharacter?: SavedCharacter | null;
}

const useIdentityFeed = (options?: UseIdentityFeedOptions): IdentityEvent[] => { ... }
```

## Component Tree (New + Touched)

```
MainMenu (modified: MainMenu.tsx:428-472 replaced, line 64 savedCharacter reactivity)
└── RunnerPanel (NEW: components/voce/RunnerPanel.tsx)
    ├── FeedHeader (NEW: components/voce/FeedHeader.tsx)
    │   ├── CrewBadge (existing, reused as-is — lg for portrait, sm for crew chip)
    │   └── CartridgeButton variant="link" (existing, AJUSTAR trigger)
    ├── FriendsStripPlaceholder (NEW: components/voce/FriendsStripPlaceholder.tsx)
    ├── ol.voce-panel__feed
    │   └── FeedPost × N (NEW: components/voce/FeedPost.tsx)
    │       └── RunnerLookCard (NEW: components/RunnerLookCard.tsx)
    │           └── CrewBadge (sm)
    └── MapSocialHookButton (NEW: components/voce/MapSocialHookButton.tsx)
        └── CartridgeButton variant="chalk" disabled

CustomizeScreen (modified: line 604 — appendIdentityEvent call added)
SheetPreview (modified: partial branch delegates to RunnerLookCard)
services/storage.ts (modified: new key + 3 new exported functions)
data/identityEvents.ts (NEW)
hooks/useIdentityFeed.ts (NEW)
```

## Data Flow Diagram (Text)

```
[User saves look in CustomizeScreen]
  CustomizeScreen.handleSaveVariant (line 604)
    → saveCharacter(next)               — writes crew.saved_character
    → appendIdentityEvent({ kind: 'LOOK_SAVED', payload, timestamp })
                                        — prepends to crew.identity_events (FIFO 50)
    → onRunnerCustomized()              — CrewLaunchExperience transitions state

[MainMenu mounts or runnerVersion bumps]
  RunnerPanel renders
    → useIdentityFeed({ version, progress, savedCharacter })
        → getIdentityEvents()           — reads crew.identity_events
        → [if empty + savedCharacter]   — synthesizes + appends backfill events
        → returns IdentityEvent[]       — newest-first
    → maps events → <FeedPost event={ev} />
        → IDENTITY_EVENT_VARIANTS[ev.kind]
            → resolves railToken, swatchVar, headlinePhrase
        → renders .voce-feed-post chrome + variant tokens
        → [if LOOK_SAVED] renders <RunnerLookCard> from ev.payload

[Future: F2 LOOK_SAVED event adds NFC sticker context in payload.stickerId]
  — no chrome change, only data enrichment
```

## Files to Touch

| File Path | Change Kind | Summary |
|---|---|---|
| `apps/crew-running/data/identityEvents.ts` | new | `IdentityEventKind`, `IdentityEvent`, `IdentityEventVariantSpec`, `IDENTITY_EVENT_VARIANTS` record |
| `apps/crew-running/services/storage.ts` | modify | Add `IDENTITY_EVENTS_STORAGE` const, `getIdentityEvents`, `appendIdentityEvent`, `clearIdentityEvents` after line 81 |
| `apps/crew-running/hooks/useIdentityFeed.ts` | new | Hook reading + backfilling identity events |
| `apps/crew-running/components/CustomizeScreen.tsx` | modify | Line 604: call `appendIdentityEvent` after `saveCharacter(next)` |
| `apps/crew-running/components/RunnerLookCard.tsx` | new | Slim display primitive extracted from `SheetPreview.tsx:66-86` |
| `apps/crew-running/components/SheetPreview.tsx` | modify | Partial branch delegates to `<RunnerLookCard>` |
| `apps/crew-running/components/voce/FeedPost.tsx` | new | Single chrome card; variant via rail token + swatch |
| `apps/crew-running/components/voce/FeedHeader.tsx` | new | Identity anchor header: portrait + name + crew + stats chips + AJUSTAR trigger |
| `apps/crew-running/components/voce/FriendsStripPlaceholder.tsx` | new | Disabled F2 hook strip, `aria-hidden` |
| `apps/crew-running/components/voce/MapSocialHookButton.tsx` | new | Disabled chalk button `MAPA SOCIAL · EM BREVE` |
| `apps/crew-running/components/voce/RunnerPanel.tsx` | new | Composes FeedHeader + FriendsStripPlaceholder + feed list + MapSocialHookButton |
| `apps/crew-running/components/launch/MainMenu.tsx` | modify | Lines 428-472: replace with `<RunnerPanel>`; line 64: fix stale memo; `runnerVersion` state; guide CTAs move to config panel |
| `apps/crew-running/index.css` | modify | Add `.voce-panel`, `.voce-feed-header`, `.voce-panel__feed`, `.voce-feed-post` rules; remove `.main-menu__runner-pass--compact` |
| `apps/crew-running/vault/2026-05-28-runner-passport-street-intro.md` | modify | Add stale note at line 59: `crew-flow` → `crew-pace` |

## Hooks para F2/F3 (Reservados, Não Implementar Agora)

**F2 — Reserved UI placeholders:**
- `FriendsStripPlaceholder` DOM slot `.voce-panel__friends-strip` — F2 hydrates with NFC/QR friend pings from `crew.friends`
- `MapSocialHookButton` — F2 removes `disabled`, adds `onClick` to map panel route
- `FeedPost` variant map already reserves `DM_PREVIEW`, `STORY_DROP`, `MISSION_TICKET` kinds as stubs

**Data shape stubs (define in `identityEvents.ts`, do not emit or store yet):**

```ts
// F2
interface FriendRecord { userId: string; runnerName: string; crewSlug: string; addedAt: number; addMethod: 'nfc' | 'qr'; }

// F3
interface DMThread { threadId: string; participants: string[]; lastMessage: string; unreadCount: number; }
interface Story { storyId: string; authorId: string; mediaUrl: string; expiresAt: number; }
```

**F3 — Reserved DOM slots:**
- `div.voce-feed-header__dm-placeholder` labeled `MENSAGENS · F3`, `aria-hidden="true"`
- Stories strip slot above FeedHeader (zero padding-top reserved)

## Acceptance Criteria for F1 Ship

- `panel === 'runner'` in `MainMenu` renders `<RunnerPanel>` with at least `FeedHeader` + one `FeedPost` for any returning user with `savedCharacter`
- After saving a look in `CustomizeScreen`, `getIdentityEvents()` returns array with new `LOOK_SAVED` event at index 0
- `useIdentityFeed` returns events newest-first; second call with `version+1` returns updated data
- `FeedPost` renders correct rail color for each `IdentityEventKind` without any like/view/count element in DOM
- `FeedHeader` stat chips contain only `LOOKS`, `STICKERS`, `CREW` — no public engagement metrics
- `FriendsStripPlaceholder` has `aria-hidden="true"` and `MapSocialHookButton` is `disabled` with no `onClick`
- Returning user with existing `savedCharacter` but empty `crew.identity_events` sees ≥1 backfilled event on first mount
- `runnerTypeId` in any persisted `IdentityEvent` is one of `RunnerTypeId` from `data/runnerTypes.ts` — never `crew-flow`
- `MainMenu.tsx` remains under 300 non-blank lines after the replace (guide CTAs moved to config panel)
- Lighthouse mobile score does not regress below 90 on performance pillar after adding `RunnerPanel`

## Risks + Mitigations

| Risk | Mitigation |
|---|---|
| `savedCharacter` stale memo (`MainMenu.tsx:62`) causes panel to show old data after inline creator exit | Convert to `useState` + update via `runnerVersion` counter incremented in `onRunnerCustomized` callback |
| `appendIdentityEvent` called during error path | Emit is after `saveCharacter(next)` and before `audio.playSfx`; if downstream throws, outer try/catch at line 607 catches and `appendIdentityEvent` is never reached |
| Backfill synthesizes duplicate events on repeated cold starts | Guard: check if array already contains event with matching `kind` + `timestamp` before inserting; idempotent write |
| `imageDataUrl` in `LOOK_SAVED` payload inflates `crew.identity_events` above 5MB quota | Payload never stores image; events reference `savedCharacter.imageDataUrl` by reading `getSavedCharacter()` at render in `RunnerLookCard` |
| CSS import of `board.png` texture on every `FeedPost` hits paint budget | `mission-ticket::before` uses `background-attachment: local` + 20% opacity — already on every `.mission-ticket`; monitor with Lighthouse |
| Visual contract drift as new `voce/` components grow | Code-reviewer flags encoded in acceptance criteria (no `backdrop-filter`, no `border-radius: 999px`, no `inset` soft glow) — assertable DOM/CSS tests |

## Open Questions for the Planner

1. **`AJUSTAR LOOK` destination in F1**: open full `CustomizeScreen` (current only option) or a lighter wardrobe-only inline sheet? Blueprint assumes full creator for F1 — confirm before implementing `FeedHeader.onAdjust`.
2. **FeedHeader portrait size**: 96px or 128px square? Blueprint uses 96px (matching `CrewBadge lg`) — confirm before CSS step.
3. **`GUIDE_COMPLETED` + `CREW_JOINED` backfill**: backfill requires reading `LaunchProgress` inside `useIdentityFeed`. Does `MainMenu` pass `progress` as prop to `RunnerPanel`, or should the hook read `launchStorage` directly? Recommend passing via prop.
4. **Event cap of 50**: unbounded or cap? Blueprint caps at 50 (FIFO). Confirm.
5. **Nav label `RUNNER` vs `VOCÊ`**: stays `RUNNER` for F1 per designer decision. Confirm before F2 spec.

## Next Step

Recommend invoking `superpowers:writing-plans` with this blueprint as the input spec to produce a TDD-ready F1 execution plan with per-commit test gates and acceptance checks.
