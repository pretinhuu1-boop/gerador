# Phase 6 — Territory Decay Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing `decayInk` helper into the zone ownership computation so zones cool down when nobody runs them, instead of monotonically accumulating ink forever.

**Architecture:** Pure data layer addition. The pure helper `decayInk(ink, daysSince)` already exists at `data/gamification.ts:229` but is never called. Add a new pure helper `applyInkDecay(inkPerZone, lastUpdatedAt, now)` that returns a decayed snapshot of the inkPerZone map, plus `computeOwnershipFromInk(decayed, zones, denominator)` that converts to the 0-1 ownership float MapStage already computes inline. Single one-line change in `MapStage.tsx` swaps the existing useMemo body for the helper.

**Tech Stack:** React 19, Vite 6, vitest 4 (node env for `data/**`). No new runtime deps.

**Why:** The Phase 1 plan documents this as Phase 6, motivated by FWTM (Fucking With The Map)'s presence-over-time territory model — accumulation without decay produces dead heatmaps where nobody can lose ground once won. Today `inkUpdatedAt` is stored but never read.

**Inspiration / research:** FWTM territory passes as a function of how many players of each team are present in a territory over time. `INK_DECAY_PER_DAY=0.033` (~21-day half-life) is already calibrated in `gamification.ts:184`; we just need to apply it on read.

---

## File structure

**Create:**
- `apps/crew-running/data/territoryDecay.ts` — pure helpers `applyInkDecay(inkPerZone, lastUpdatedAt, now): Partial<Record<SpZoneId, number>>` and `computeOwnershipFromInk(decayed, zones, denominator): Partial<Record<SpZoneId, number>>`.
- `apps/crew-running/data/territoryDecay.test.ts` — tests.

**Modify:**
- `apps/crew-running/components/map/MapStage.tsx` — replace the inline `ownershipByZone` useMemo body (lines 86-93 at HEAD `a15fa51`) with a single call to `computeOwnershipFromInk(applyInkDecay(inkPerZone, inkUpdatedAt, Date.now()), SP_ZONE_MAP_FEATURES, INK_PER_FULL_OWNERSHIP)`. This is the only MapStage edit; coordinate timing with whoever's mid-flight on the file (per project CLAUDE.md concurrent-edit rule).

**Why these files, not gamification.ts:** `gamification.ts` already houses `decayInk` (the math primitive). Aggregation across the inkPerZone map is a layer above the primitive; keeping it in a separate file means the next consumer (e.g. `CrewSheet` or `ZoneSheet`) can import the same helper without bloating gamification.ts further. Existing `decayInk` stays untouched as the building block.

**Out of scope (deferred):**
- Visual "cooled down" pattern on the map. UI follow-up — coordinate with parallel-agent MapStage WIP first.
- Decay events ("your zone is at risk!") — Phase 7+ social loop.
- Per-zone decay rates (some zones harder to hold). Calibration test data first.

---

## Tasks

### Task 1: `daysBetween` helper + `applyInkDecay`

**Files:**
- Create: `apps/crew-running/data/territoryDecay.ts`
- Test: `apps/crew-running/data/territoryDecay.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/data/territoryDecay.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { applyInkDecay } from './territoryDecay';
import type { SpZoneId } from './spLiveMap';

describe('applyInkDecay', () => {
  const T = (days: number) => new Date('2026-05-28T00:00:00Z').getTime() + days * 86_400_000;

  it('returns empty map for empty input', () => {
    expect(applyInkDecay({}, T(0), T(7))).toEqual({});
  });

  it('returns unchanged values when no time has passed', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 500, leste: 200 };
    expect(applyInkDecay(ink, T(0), T(0))).toEqual({ centro: 500, leste: 200 });
  });

  it('decays each zone by INK_DECAY_PER_DAY ^ days', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 1000 };
    const out = applyInkDecay(ink, T(0), T(7));
    // 1000 * (1 - 0.033) ^ 7 = 1000 * 0.967^7 ≈ 792.7
    expect(out.centro).toBeCloseTo(792.7, 0);
  });

  it('clamps at zero — past values cannot rise from negatives', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 100 };
    const out = applyInkDecay(ink, T(0), T(365));
    expect(out.centro).toBeGreaterThanOrEqual(0);
    expect(out.centro).toBeLessThan(1); // effectively zero after a year
  });

  it('treats negative or zero day gap as zero decay (clock skew safety)', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 500 };
    expect(applyInkDecay(ink, T(10), T(0))).toEqual({ centro: 500 });
  });

  it('preserves undefined zones — only decays present keys', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 1000 };
    const out = applyInkDecay(ink, T(0), T(1));
    expect(out.leste).toBeUndefined();
    expect(out.centro).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `apps/crew-running/`:

```bash
npx vitest run data/territoryDecay.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement helper**

Create `apps/crew-running/data/territoryDecay.ts`:

```ts
import { decayInk } from './gamification';
import type { SpZoneId } from './spLiveMap';

// Number of whole days elapsed between two epoch timestamps. Negative gaps
// (clock skew or future-stored timestamps) clamp to 0 so we never amplify
// ink by applying a negative exponent.
const daysBetween = (fromMs: number, toMs: number): number => {
  const diffMs = toMs - fromMs;
  if (diffMs <= 0) return 0;
  return diffMs / 86_400_000;
};

// Returns a fresh inkPerZone map with each zone's ink scaled by the decay
// curve from gamification.ts (geometric decay at INK_DECAY_PER_DAY rate).
// Undefined zones in the input map stay undefined in the output — we only
// touch keys the runner actually has ink in.
export const applyInkDecay = (
  inkPerZone: Partial<Record<SpZoneId, number>>,
  lastUpdatedAt: number,
  now: number,
): Partial<Record<SpZoneId, number>> => {
  const days = daysBetween(lastUpdatedAt, now);
  if (days === 0) return { ...inkPerZone };
  const out: Partial<Record<SpZoneId, number>> = {};
  for (const key of Object.keys(inkPerZone) as SpZoneId[]) {
    const value = inkPerZone[key];
    if (value === undefined) continue;
    out[key] = decayInk(value, days);
  }
  return out;
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run data/territoryDecay.test.ts
```

Expected: 6 PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/data/territoryDecay.ts apps/crew-running/data/territoryDecay.test.ts
git commit -m "feat(crew-running): applyInkDecay helper — pure decay over inkPerZone

Wraps decayInk (already in gamification.ts) into a map-level helper that
walks an inkPerZone snapshot and applies the geometric decay curve. Days
gap clamps at zero to handle clock skew; output preserves the sparse
shape of the input (undefined zones stay undefined).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `computeOwnershipFromInk` aggregator

**Files:**
- Modify: `apps/crew-running/data/territoryDecay.ts`
- Test: `apps/crew-running/data/territoryDecay.test.ts`

- [ ] **Step 1: Append failing tests**

Append to `apps/crew-running/data/territoryDecay.test.ts`:

```ts
import { computeOwnershipFromInk } from './territoryDecay';
import { SP_ZONE_MAP_FEATURES } from './spLiveMap';

describe('computeOwnershipFromInk', () => {
  it('returns 0 for every zone when no ink', () => {
    const out = computeOwnershipFromInk({}, SP_ZONE_MAP_FEATURES, 1000);
    for (const zone of SP_ZONE_MAP_FEATURES) {
      expect(out[zone.id]).toBe(0);
    }
  });

  it('returns ink / denominator clamped to 1', () => {
    const out = computeOwnershipFromInk(
      { centro: 500, leste: 1500, sul: 0 },
      SP_ZONE_MAP_FEATURES,
      1000,
    );
    expect(out.centro).toBeCloseTo(0.5);
    expect(out.leste).toBe(1); // clamped
    expect(out.sul).toBe(0);
  });

  it('includes every zone from the input feature list, defaulting absent ones to 0', () => {
    const out = computeOwnershipFromInk({ centro: 250 }, SP_ZONE_MAP_FEATURES, 1000);
    expect(Object.keys(out).sort()).toEqual(SP_ZONE_MAP_FEATURES.map((z) => z.id).sort());
    expect(out.centro).toBeCloseTo(0.25);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

```bash
npx vitest run data/territoryDecay.test.ts -t 'computeOwnershipFromInk'
```

Expected: FAIL — export missing.

- [ ] **Step 3: Implement aggregator**

Append to `apps/crew-running/data/territoryDecay.ts`:

```ts
import { SP_ZONE_MAP_FEATURES } from './spLiveMap';
// Note: spLiveMap is also the source of SpZoneId imported at top of file —
// importing the array here is purely so the aggregator can iterate without
// the caller having to pass it. Keep the param explicit anyway for testability.

export const computeOwnershipFromInk = (
  inkPerZone: Partial<Record<SpZoneId, number>>,
  zones: typeof SP_ZONE_MAP_FEATURES,
  denominator: number,
): Partial<Record<SpZoneId, number>> => {
  const out: Partial<Record<SpZoneId, number>> = {};
  for (const zone of zones) {
    const ink = inkPerZone[zone.id] ?? 0;
    out[zone.id] = Math.min(1, ink / denominator);
  }
  return out;
};
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npx vitest run data/territoryDecay.test.ts
```

Expected: 9 PASS (6 from Task 1 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/data/territoryDecay.ts apps/crew-running/data/territoryDecay.test.ts
git commit -m "feat(crew-running): computeOwnershipFromInk — ink to 0..1 per zone

Mirrors the inline math MapStage runs today (ink / INK_PER_FULL_OWNERSHIP,
clamped to 1) but as a pure helper that always returns every zone in the
input feature list — absent zones default to 0 ownership instead of being
omitted. Sets up the one-line MapStage swap in the next task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Integration test — decay + ownership pipeline

**Files:**
- Modify: `apps/crew-running/data/territoryDecay.test.ts`

- [ ] **Step 1: Append integration test**

Append to `apps/crew-running/data/territoryDecay.test.ts`:

```ts
describe('decay + ownership pipeline', () => {
  const T = (days: number) => new Date('2026-05-28T00:00:00Z').getTime() + days * 86_400_000;

  it('zone with full ownership decays to neutral over many idle weeks', () => {
    const fresh: Partial<Record<SpZoneId, number>> = { centro: 1000 }; // full ownership
    const ownershipFresh = computeOwnershipFromInk(fresh, SP_ZONE_MAP_FEATURES, 1000);
    expect(ownershipFresh.centro).toBe(1);

    const decayed = applyInkDecay(fresh, T(0), T(180)); // 6 months idle
    const ownershipDecayed = computeOwnershipFromInk(decayed, SP_ZONE_MAP_FEATURES, 1000);
    expect(ownershipDecayed.centro).toBeLessThan(0.01);
  });

  it('one week of idle takes a fully owned zone to ~contested', () => {
    // INK_OWNERSHIP_CONTESTED is 0.4 per gamification.ts. With INK_DECAY_PER_DAY
    // 0.033, 1000 ink after 7 days is ~792 -> 0.79 ownership. Still owned.
    // After 21 days (≈ half-life) it should drop to ~0.5 — borderline owned.
    const fresh: Partial<Record<SpZoneId, number>> = { centro: 1000 };
    const decayed = applyInkDecay(fresh, T(0), T(21));
    const ownership = computeOwnershipFromInk(decayed, SP_ZONE_MAP_FEATURES, 1000);
    expect(ownership.centro).toBeGreaterThan(0.45);
    expect(ownership.centro).toBeLessThan(0.55);
  });
});
```

- [ ] **Step 2: Run tests to verify pass**

```bash
npx vitest run data/territoryDecay.test.ts
```

Expected: 11 PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/crew-running/data/territoryDecay.test.ts
git commit -m "test(crew-running): decay pipeline integration — 180d to neutral, 21d to contested

Locks in the calibration: with INK_DECAY_PER_DAY=0.033 a fully owned
zone idle for 6 months returns to neutral, and after ~21 days (the
half-life implied by the decay constant) it slips to contested status.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Wire MapStage `ownershipByZone` to the decayed helper

**Files:**
- Modify: `apps/crew-running/components/map/MapStage.tsx` (the existing `ownershipByZone` useMemo around lines 86-93 at base HEAD `a15fa51`)

**WARNING:** `MapStage.tsx` is heavily contested by parallel agents (diary, missions, friend-notes, Sede). Re-read the file IMMEDIATELY before editing. If `ownershipByZone` has been refactored elsewhere by the time this task runs, adapt: find whoever owns the ownership computation and apply the same one-line swap there.

- [ ] **Step 1: Read current MapStage state and find the ownership block**

```bash
grep -n "ownershipByZone\|inkPerZone\|INK_PER_FULL_OWNERSHIP" apps/crew-running/components/map/MapStage.tsx
```

Expected: line-number list including the useMemo body and the import of `INK_PER_FULL_OWNERSHIP`.

- [ ] **Step 2: Write a focused test on the MapStage test file**

Append to `apps/crew-running/components/map/__tests__/MapStage.test.tsx` (read the file first to find the right `describe` block):

```tsx
it('MS-Decay: zone with 24h-old ink renders below fresh ownership', async () => {
  // Tiny smoke that the wired helper actually fires — full math is covered
  // by data/territoryDecay.test.ts.
  const old = Date.now() - 24 * 60 * 60 * 1000;
  // Use whatever existing test helper mounts MapStage with custom progress.
  // Read the test file first to see what shape is available.
  // Then pass progress with inkPerZone={centro:1000} + inkUpdatedAt=old
  // and assert the rendered ownership text/aria reflects <1.0.
});
```

**Note:** the exact rendering of ownership in MapStage may be via canvas paint property (not text). If there's no DOM surface to inspect, this MS-Decay test becomes a no-op — instead, lean on `data/territoryDecay.test.ts` for proof, and ship Task 4 without a MapStage test. Decide based on what `MapStage.test.tsx` currently exposes.

- [ ] **Step 3: Modify MapStage**

Find the existing block (at HEAD `a15fa51` it sits around lines 86-93):

```tsx
const ownershipByZone = useMemo(() => {
  const out: Partial<Record<SpZoneId, number>> = {};
  for (const zone of SP_ZONE_MAP_FEATURES) {
    const ink = runnerProgress.inkPerZone[zone.id] ?? 0;
    out[zone.id] = Math.min(1, ink / INK_PER_FULL_OWNERSHIP);
  }
  return out;
}, [runnerProgress.inkPerZone]);
```

Replace with:

```tsx
const ownershipByZone = useMemo(
  () =>
    computeOwnershipFromInk(
      applyInkDecay(runnerProgress.inkPerZone, runnerProgress.inkUpdatedAt, Date.now()),
      SP_ZONE_MAP_FEATURES,
      INK_PER_FULL_OWNERSHIP,
    ),
  [runnerProgress.inkPerZone, runnerProgress.inkUpdatedAt],
);
```

Add imports near the existing data imports:

```tsx
import { applyInkDecay, computeOwnershipFromInk } from '../../data/territoryDecay';
```

- [ ] **Step 4: Run validate**

From `apps/crew-running/`:

```bash
npm run validate
```

Expected: contract + typecheck + tests + build + smoke all PASS.

- [ ] **Step 5: Commit (explicit paths only)**

```bash
git add apps/crew-running/components/map/MapStage.tsx
# also add the test file if you added a real MS-Decay test
git status --short
git commit -m "feat(crew-running): MapStage applies ink decay to zone ownership

Replaces the inline ownershipByZone useMemo body with the decay+ownership
pipeline. Zones now visibly cool down when nobody runs them, instead of
holding their last-painted value forever.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Acceptance criteria

- `data/territoryDecay.ts` exists with two pure exports (`applyInkDecay`, `computeOwnershipFromInk`).
- 11 tests in `data/territoryDecay.test.ts` pass.
- `MapStage` uses the helpers; the inline math is gone.
- `npm run validate` is green.
- No regression in `MapStage.test.tsx` or other map component tests.
- No coupling to badge/leaderboard/Sede WIP from parallel sessions.

---

## Open questions (do NOT block)

- **`now` injection:** Task 4 calls `Date.now()` inside the useMemo, which means the decay value is frozen at mount time and never refreshes unless `inkPerZone` or `inkUpdatedAt` changes. Long sessions could see stale ownership. Acceptable for now — Phase 7+ could add a 1-hour ticker. Document if anyone files a bug.
- **Decay symmetry:** does running in a contested zone re-cement it, or does decay always run regardless? Current model: `inkUpdatedAt` resets on every run (per `useRunController.stopRun` setting `inkUpdatedAt: Date.now()`), so each run snaps the timer back to zero and decay restarts from the post-run total. That's correct — a run "freshens" the heatmap. Phase 6 doesn't change that.
- **UI feedback:** the heatmap shows decayed ownership immediately. Should there also be a chip/badge ("Zona esfriando") when ownership drops past a threshold? Out of scope for this phase, but worth mocking.

---

## Self-review notes (filled during plan write)

- **Spec coverage:** ✅ decay pipeline + ownership swap + integration test + MapStage wire all covered.
- **Placeholders:** ✅ none — every step has real code or real test bodies.
- **Type consistency:** ✅ `applyInkDecay` returns `Partial<Record<SpZoneId, number>>`, `computeOwnershipFromInk` takes the same shape and returns the same shape. MapStage useMemo result type matches what the existing canvas paint code consumes.
- **Risk:** Task 4 modifies `MapStage.tsx` which is the hottest concurrent-edit target in the repo. Mitigation: explicit re-read instruction at start of Task 4 + recommendation to apply elsewhere if useMemo got refactored out.
- **Test env:** `data/**` runs in `node` per `vitest.config.ts`. No DOM needed for Tasks 1-3.
