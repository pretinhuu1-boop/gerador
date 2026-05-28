# Creator Design System — RUNNER Sub-Tabs Redesign

> Spec drafted 2026-05-28. Replaces fullscreen CustomizeScreen with sub-panels inside the existing MainMenu RUNNER panel. Reuses MainMenu nav shell so other tabs (INICIO / CREWS PILOTO / CONFIG) stay reachable at all times.

---

## 1 — Problem statement

CustomizeScreen.tsx today is a 700-line dead-end fullscreen with 5 numbered blocks (01 IDENTIDADE → 05 GUARDA-ROUPA) stacked vertically. Audit (2026-05-28) flagged:

1. **Crew rendered 3x** — header status-strip + CrewLockPanel block (03) + masthead chip.
2. **Height/peso rendered 2x** — inputs + BODY_REFERENCE comparison row.
3. **Brand masthead competes** — logo + "THE CREW RUNNING" + "CRIE SEU RUNNER" + status-strip all in top 200px.
4. **Linear checklist feel** — numbered blocks read as a form, not game.
5. **Menu lock-out** — once inside, user cannot reach INICIO / CREWS / CONFIG without back-button.
6. **P0 bug** — `handleSaveVariant` left `savingVariantIndex` non-null on success, disabling all 4 variant buttons permanently after first save. Patched 2026-05-28 with `finally` block.

User direction (brainstorm, 2026-05-28):

> "esses blocos poderiam ser realmente passando pelos menus que temos e outra agora nao da mais pra acessar os outros menus pela ui atual"

---

## 2 — Target structure

**Top-level:** existing MainMenu nav untouched (INICIO / CREWS PILOTO / RUNNER / CONFIG). RUNNER panel hosts a 4-tab sub-nav:

```
┌─────────────────────────────────────────────────────────┐
│  THE CREW · RUNNING                          [crew-chip] │ ← brand row (single line)
├──────────────┬──────────────────────────────────────────┤
│  INICIO      │                                          │
│  CREWS       │   ┌─ FOTO ─ PERFIL ─ LOOK ─ FICHA ──┐   │
│  RUNNER ▶    │   │                                  │   │
│  CONFIG      │   │   (sub-tab content)              │   │
│  REVER INTRO │   │                                  │   │
│  ABRIR MAPA  │   └──────────────────────────────────┘   │
└──────────────┴──────────────────────────────────────────┘
```

**Sub-tabs (left → right = progression):**

| Tab | Owns | Empty signal | Done signal |
|---|---|---|---|
| **FOTO** | PhotoUpload (selfie) | upload zone | thumbnail visible, REMOVER affordance |
| **PERFIL** | name, sex, height, weight, personality | name input focused | nome filled (only required field) |
| **LOOK** | RunnerTypePicker (5) + WardrobePicker (4 slots) + MISTURAR LOOK + CRIAR RUNNER | type unselected | type chosen, wardrobe slots optional |
| **FICHA** | passport (post-save) OR SheetPreview overlay (post-gen, pre-equip) OR empty-state checklist (pre-gen) | "FOTO ✓ PERFIL ✓ LOOK pendente" | runner saved → full passport |

---

## 3 — Dedup decisions

| Removed | Justification |
|---|---|
| Header status-strip (RUNNER ID / {crew} / IDENTIDADE chips) | Tab name + crew chip already do the job |
| `runner-creator__masthead` ("CRIE SEU RUNNER" + brand stack) | Brand stays in `main-menu__brand`; sub-tab name is the title |
| `CrewLockPanel` block 03 | Crew is conveyed by accent color theme + small badge chip in tab strip |
| `BODY_REFERENCE` row at bottom of PERFIL | Inputs are sufficient; reference value is non-editable noise |
| Numeric prefixes `01/`, `02/`, ..., `05/` | Tabs replace the ordering metaphor |
| `runner-creator__back` "VOLTAR AO SINAL" button | Other MainMenu tabs (INICIO etc) reachable directly via existing nav |
| Stage subtitle "RUNNER ID" inside SheetPreview | Lives only in FICHA tab; tab name suffices |

---

## 4 — Reused tokens (NO new CSS classes)

The brand language stays. Tokens migrate from `runner-creator__*` to `runner-tab__*` (or reuse `main-menu__panel-*` directly):

| Old (drop) | New (reuse) | Notes |
|---|---|---|
| `runner-creator__shell` | `main-menu__panel mission-ticket` | already in MainMenu |
| `runner-creator__layout` | `main-menu__hero` + tab-content area | reuse hero structure |
| `runner-creator__header` | drop | brand row owned by MainMenu |
| `runner-creator__masthead` | drop | — |
| `runner-creator__status-strip` | drop | — |
| `runner-creator__block` | `runner-tab__section` | one section per tab |
| `runner-creator__block-head` | `runner-tab__section-head` | — |
| `runner-creator__profile` | `runner-tab__form` | — |
| `runner-creator__photo-block` | drop, FOTO tab is the whole panel | — |
| `runner-creator__crew-lock` | drop (CrewLockPanel removed) | — |
| `runner-creator__type-grid` | keep — already focused | — |
| `runner-creator__wardrobe`, `__wardrobe-slot`, `__wardrobe-tile`, etc | keep | — |
| `runner-creator__action-bar` | `runner-tab__action-bar` — sticky bottom of LOOK | — |
| `runner-creator__mix-control` | keep | — |
| `runner-creator__preview-shell` | drop | SheetPreview embedded in FICHA tab |
| `runner-creator__sheet`, `__sheet-wrap`, `__variant-*` | keep | core preview tokens |
| `runner-creator__body-reference` | **delete CSS** | no longer rendered |
| `runner-creator__file-action` | keep | per-file-input button shell |
| `section-label`, `section-label__index` | drop `__index` | numbers go away |

Brand-level tokens (`btn-solid`, `btn-chalk`, `btn-link`, `game-command`, `game-command--primary`, `game-command--mini`, `mission-ticket`, `signal-chip`, `sticker-stamp`, `tile`, `tile-row`, `tile-placeholder`, `upload-zone`, `is-selected`, `is-saving`, `is-loading`, `is-error`) — **all preserved**, used across the app.

---

## 5 — Tab strip token

New token under `main-menu__panel`:

```scss
.runner-tab__nav {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid var(--crew-accent);
  margin-bottom: 16px;
}
.runner-tab__nav-item {
  // chalk-style chip, accent on active
}
.runner-tab__nav-item.is-active {
  background: var(--crew-accent);
  color: #000;
}
```

A11y: each tab is `<button role="tab" aria-selected aria-controls="...">`, panels are `<section role="tabpanel" aria-labelledby="...">`. Arrow-key navigation between tabs (left/right wrap).

---

## 6 — Sub-tab state machine

```
state: { activeTab: 'foto'|'perfil'|'look'|'ficha', genStatus: 'idle'|'loading'|'ready'|'saved' }

events:
  - tab-click → activeTab = clicked
  - photo upload OK → activeTab stays foto, FOTO badge flips
  - CRIAR RUNNER → genStatus=loading, AUTO-jump to FICHA after success
  - gen success → genStatus=ready, activeTab=ficha (overlay SheetPreview)
  - EQUIPAR variant → genStatus=saved, FICHA shows passport
  - any input change post-save → genStatus=idle (re-enables CRIAR RUNNER in LOOK)
```

Persistence: `genStatus`, `partial` (photo+name+type+slots), `savedCharacter`, `activeTab` all in localStorage (extend `launchStorage`).

Failure modes:
- No photo when CRIAR clicked → toast / inline error on LOOK tab, NO auto-jump
- No name → same
- Gemini API key missing → ApiKeyModal overlay (existing flow)
- Gemini fail → genStatus=idle, error-buzz SFX, error shown on FICHA tab empty-state

---

## 7 — Contracts (props in/out)

`RunnerCreatorTabs` (new wrapper component, replaces current CustomizeScreen render-prop):

```ts
type Props = {
  crew: CrewZone;
  savedCharacter: SavedCharacter | null;
  apiKey: string;
  onApiKeyReady: (key: string) => void;
  onSaved: () => void;
};
```

Sub-tab components stay pure:
- `PhotoUpload` — unchanged
- `RunnerProfileForm` — drop `BODY_REFERENCE` props/render
- `RunnerTypePicker` — unchanged
- `WardrobePicker` — unchanged
- `SheetPreview` — embedded inside FICHA tab, no shell wrapper

ApiKeyModal — extracted to `components/ApiKeyModal.tsx` (shared, not voce-specific), unchanged behavior.

---

## 8 — Audio integration (already shipped)

Sub-tab nav switch fires `audio.playSfx('nav-slab')` (same SFX as MainMenu nav). Save-stamp fires on EQUIPAR (already wired in SheetPreview). LOOK randomize keeps `randomize-roll`. No additional audio work.

---

## 9 — Out of scope

- Identity feed (voce/RunnerPanel F1 feature) — **does NOT live inside FICHA tab**. Either: stays as RUNNER panel's separate view post-MVP, or is gated by feature flag.
- VOCÊ aba (separate top-level nav) — out of MVP per [DESIGN.md](../DESIGN.md).
- GPS tracker integration — separate branch per [2026-05-28-gps-tracker-and-polish-design.md](./2026-05-28-gps-tracker-and-polish-design.md).
- Drag-to-reorder wardrobe slots.
- Saved-look gallery (history of past runners).

---

## 10 — Acceptance checklist

- [ ] CustomizeScreen.tsx replaced by `RunnerCreatorTabs.tsx` (or refactored in-place to render tabs).
- [ ] 4 sub-tabs render correctly per state machine §6.
- [ ] Crew shown exactly ONCE (the chip in the tab strip right side).
- [ ] Height/peso shown exactly ONCE (inputs only).
- [ ] No `runner-creator__masthead`, `__status-strip`, `__body-reference`, `__crew-lock`, `__back` in DOM.
- [ ] All MainMenu nav items (INICIO / CREWS / RUNNER / CONFIG / REVER INTRO / ABRIR MAPA) reachable from RUNNER tab without leaving.
- [ ] Variant button lock bug remains fixed (regression: equipar 2 looks in sequence, both succeed).
- [ ] Tab strip keyboard a11y (arrow keys + aria-selected) works.
- [ ] Reduced-motion respected (no slide animation, only opacity).
- [ ] Typecheck clean, all existing tests pass.
- [ ] At least 1 new test: "FICHA tab shows passport when savedCharacter is set, empty-state checklist otherwise".
- [ ] Audio integration verified: sub-tab nav switch fires `nav-slab` SFX once; LOOK randomize fires `randomize-roll`; EQUIPAR fires `equip-snap`; error path fires `error-buzz`. No regression in existing audio call sites.

---

## 11 — Migration plan (out of brainstorm scope, lives in plan.md)

Will be detailed by writing-plans skill in next phase. Rough shape:
1. Phase A — extract sub-tab shell + nav (no behavior change yet)
2. Phase B — move PhotoUpload + RunnerProfileForm into respective tabs, drop CrewLockPanel + masthead + status-strip
3. Phase C — wire LOOK → FICHA auto-jump on gen success
4. Phase D — replace RUNNER panel (currently RunnerPanel from voce/) with RunnerCreatorTabs OR gate-flag
5. Phase E — delete dead CSS tokens listed in §4
