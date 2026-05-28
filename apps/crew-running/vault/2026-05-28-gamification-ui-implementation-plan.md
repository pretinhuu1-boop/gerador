# Gamification UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gap between gamification mechanics already in `data/gamification.ts` and the UI surfaces users actually see — starting with achievement rendering and multiplier explainability, then expanding to crew leaderboard, quest progress, unified personalization, social feed, territory decay calibration, and GPX export.

**Architecture:** All mechanics (XP, ink, streak, BADGE_DEFS, multipliers, decay) already exist as pure functions in `apps/crew-running/data/gamification.ts`. The work is mostly UI binding + a few new pure functions (badge condition evaluation, leaderboard aggregation, quest progress). Source of truth stays in `data/` (testable in `node` env per `vitest.config`); components in `components/map/` consume it. Persistence reuses existing `services/storage.ts` patterns (localStorage with in-memory test shim from `test/setup.ts`).

**Tech Stack:** React 19, Vite 6, MapLibre GL 5.24, vitest 4 (happy-dom for `components/**`, node for `data/**` and `services/**`), Tailwind 3.4. No new runtime deps required for Phase 1.

**Research that fed this plan:**
- Audit: see audit summary in commit history + section "Mechanics Present / Planned" below
- Open-source mining: MapAttack (geofence presence), FWTM (territory presence-over-time), FitQuest (leaderboard schema), OutRun (GPX export), Strava `go.strava` (segment/effort/kudos/comment schema vocab), Esforza (React component tree + `follows` table shape)
- Vault context: `2026-05-28-restore-gamification-map-plan.md`, `2026-05-28-mapa-cidade-gamificado-blueprint.md`, `2026-05-28-creator-subtabs-plan.md`

---

## Why this plan is split into phases

Each phase produces shipping software on its own. Phase 1 is what this file documents in full TDD detail — it's the ROI-anchor (low risk, high impact, code+conditions already exist for badges). Phases 2-7 are outlined with concrete files and acceptance criteria so the next planning pass can detail them. Do **not** try to execute Phase 2 from this file — write a dedicated plan first.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Badge rendering + multiplier explainability + first-blood unlock pipeline | **SHIPPED** (12 tasks + 4 deferred follow-ups merged on `feat/map-gamification`) |
| 2 | Crew leaderboard (peer + crew rank) | Roadmap — unblocks 3 stub badges |
| 3 | Quest progress (real tracking, not sample) | Roadmap |
| 4 | Personalization unification via `crewRenderContext` | Roadmap |
| 5 | Activity feed + kudos + follows (Esforza-inspired) | Roadmap |
| 6 | Territory decay calibration + presence-weighted ink (FWTM-inspired) | Roadmap |
| 7 | GPX export (OutRun-inspired privacy/portability) | Roadmap |

## Phase 1 — known stub badges (blocked on Phase 2 leaderboard)

Three badges live in `data/badges.ts` as `() => false` placeholders because their conditions depend on crew-rank data that doesn't exist yet. Phase 2 (Crew leaderboard) is the natural unblocker — it has to compute weekly captain + top-3 + season ranking anyway, so the same aggregation feeds these badges.

| Badge | Condition (per `BADGE_DEFS`) | Needs |
|-------|------------------------------|-------|
| `local-legend` | "Captain de zone por 4 semanas seguidas" | `RunHistoryStats.captainWeeks` populated by leaderboard aggregator (currently passthrough in `applyRunToHistory`) |
| `pace-setter` | "5x top-3 da crew na semana" | `RunHistoryStats.weeklyTopThreeCount` populated by leaderboard aggregator (currently passthrough) |
| `season-captain` | "Top 10 individuais ao final da temporada" | Season concept (week → season boundary), top-N query over the leaderboard |

**Action when Phase 2 lands:** in `data/badges.ts`, replace the three `() => false` stubs with real predicates:
- `'local-legend': ({ history }) => history.captainWeeks >= 4`
- `'pace-setter': ({ history }) => history.weeklyTopThreeCount >= 5`
- `'season-captain': ({ history, /* + new season ranking arg */ }) => /* top-10 final */`

And update `applyRunToHistory` to stop passthrough and actually increment these fields based on the leaderboard result rather than the snapshot. Test pattern identical to existing badge tests in `data/badges.test.ts`.

---

# Phase 1 — Badge rendering + multiplier explainability

## File structure (Phase 1)

**Create:**
- `apps/crew-running/data/badges.ts` — pure badge condition evaluator. Takes `RunnerProgress` + `RunSnapshot` + `RunXpBreakdown` + clock, returns `BadgeId[]` newly unlocked this run.
- `apps/crew-running/data/badges.test.ts` — condition unit tests.
- `apps/crew-running/components/map/BadgeUnlockToast.tsx` — modal/toast announcing newly unlocked badges after a run.
- `apps/crew-running/components/map/__tests__/BadgeUnlockToast.test.tsx` — render tests.
- `apps/crew-running/components/map/MultiplierChip.tsx` — small explainer chip used inside `RunSummary` to tell the user *why* a multiplier fired.
- `apps/crew-running/components/map/__tests__/MultiplierChip.test.tsx` — render tests.

**Modify:**
- `apps/crew-running/components/map/RunSummary.tsx` — replace inline `<li>` multiplier rows with `<MultiplierChip>`; render `<BadgeUnlockToast>` overlay when `newlyUnlocked.length > 0`; accept new `newlyUnlocked: BadgeId[]` prop.
- `apps/crew-running/data/gamification.ts` — export a `runHistoryStats` helper used by `badges.ts` to evaluate cumulative conditions (total runs, total km, night runs count, etc.). Add `RunHistoryStats` type. Do NOT touch existing exported functions.
- `apps/crew-running/index.css` — add `.run-summary-multiplier-chip*` and `.badge-unlock-toast*` classes following existing `.run-summary-*` block style.

**Test environments:** `data/badges.ts` runs in `node`, `BadgeUnlockToast` + `MultiplierChip` run in `happy-dom`. Both already wired in `vitest.config.ts` via `environmentMatchGlobs`.

---

## Tasks (Phase 1)

### Task 1: Add `RunHistoryStats` shape to gamification

**Files:**
- Modify: `apps/crew-running/data/gamification.ts` (append at end of file, after `computeRunXp`)
- Test: `apps/crew-running/data/gamification.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `apps/crew-running/data/gamification.test.ts`:

```ts
import { emptyRunHistoryStats, type RunHistoryStats } from './gamification';

describe('emptyRunHistoryStats', () => {
  it('returns a zeroed history baseline', () => {
    const stats: RunHistoryStats = emptyRunHistoryStats();
    expect(stats.totalRuns).toBe(0);
    expect(stats.totalKm).toBe(0);
    expect(stats.kmThisWeek).toBe(0);
    expect(stats.nightRuns).toBe(0);
    expect(stats.invasionsSucceeded).toBe(0);
    expect(stats.uniqueSpotsTouched).toEqual([]);
    expect(stats.captainWeeks).toBe(0);
    expect(stats.weeklyTopThreeCount).toBe(0);
    expect(stats.soloTerritoryKm).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `apps/crew-running/`:

```bash
npx vitest run data/gamification.test.ts -t 'emptyRunHistoryStats'
```

Expected: FAIL with `"emptyRunHistoryStats" is not exported`.

- [ ] **Step 3: Add the type and helper**

Append at end of `apps/crew-running/data/gamification.ts`:

```ts
export interface RunHistoryStats {
  totalRuns: number;
  totalKm: number;
  kmThisWeek: number;
  nightRuns: number;
  invasionsSucceeded: number;
  uniqueSpotsTouched: string[];
  captainWeeks: number;
  weeklyTopThreeCount: number;
  soloTerritoryKm: number;
}

export const emptyRunHistoryStats = (): RunHistoryStats => ({
  totalRuns: 0,
  totalKm: 0,
  kmThisWeek: 0,
  nightRuns: 0,
  invasionsSucceeded: 0,
  uniqueSpotsTouched: [],
  captainWeeks: 0,
  weeklyTopThreeCount: 0,
  soloTerritoryKm: 0,
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run data/gamification.test.ts -t 'emptyRunHistoryStats'
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/data/gamification.ts apps/crew-running/data/gamification.test.ts
git commit -m "feat(crew-running): add RunHistoryStats shape for badge conditions"
```

---

### Task 2: Badge condition evaluator — first-blood

**Files:**
- Create: `apps/crew-running/data/badges.ts`
- Test: `apps/crew-running/data/badges.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/data/badges.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { evaluateBadgeUnlocks } from './badges';
import { emptyRunHistoryStats, breakdownRunXp, type RunnerProgress } from './gamification';
import type { RunSnapshot } from '../services/runTracker';

const baseProgress = (): RunnerProgress => ({
  xp: 0,
  level: 1,
  streakWeeks: 0,
  lastRunAt: 0,
  freezesAvailable: 0,
  inkPerZone: {},
  inkUpdatedAt: 0,
  badgeUnlocks: [],
  patchesOwned: [],
  weekKey: '',
  runsThisWeek: 0,
});

const baseSnapshot = (): RunSnapshot => ({
  state: 'idle',
  startedAt: 0,
  elapsedMs: 0,
  totalMeters: 0,
  metersInTerritory: 0,
  points: [],
  touchedSpotIds: [],
  closedLoop: false,
});

describe('evaluateBadgeUnlocks — first-blood', () => {
  it('unlocks first-blood when history shows zero prior runs', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: emptyRunHistoryStats(),
      snapshot: { ...baseSnapshot(), totalMeters: 1500 },
      breakdown: breakdownRunXp({
        distanceKm: 1.5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('first-blood');
  });

  it('does not unlock first-blood when already unlocked', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: { ...baseProgress(), badgeUnlocks: ['first-blood'] },
      history: { ...emptyRunHistoryStats(), totalRuns: 5 },
      snapshot: { ...baseSnapshot(), totalMeters: 1500 },
      breakdown: breakdownRunXp({
        distanceKm: 1.5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).not.toContain('first-blood');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run data/badges.test.ts
```

Expected: FAIL — file does not exist.

- [ ] **Step 3: Implement minimal evaluator**

Create `apps/crew-running/data/badges.ts`:

```ts
import {
  type BadgeId,
  type RunnerProgress,
  type RunHistoryStats,
  type RunXpBreakdown,
} from './gamification';
import type { RunSnapshot } from '../services/runTracker';

export interface BadgeEvalInput {
  progress: RunnerProgress;
  history: RunHistoryStats;
  snapshot: RunSnapshot;
  breakdown: RunXpBreakdown;
  now: Date;
}

type Condition = (input: BadgeEvalInput) => boolean;

const CONDITIONS: Record<BadgeId, Condition> = {
  'first-blood': ({ history }) => history.totalRuns === 0,
  'night-owl': () => false,
  invader: () => false,
  cartographer: () => false,
  'urban-marathon': () => false,
  'local-legend': () => false,
  'streak-12': () => false,
  'solo-wolf': () => false,
  'pace-setter': () => false,
  'season-captain': () => false,
};

export const evaluateBadgeUnlocks = (input: BadgeEvalInput): BadgeId[] => {
  const owned = new Set(input.progress.badgeUnlocks);
  const newly: BadgeId[] = [];
  (Object.keys(CONDITIONS) as BadgeId[]).forEach((id) => {
    if (owned.has(id)) return;
    if (CONDITIONS[id](input)) newly.push(id);
  });
  return newly;
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run data/badges.test.ts
```

Expected: PASS, both tests.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/data/badges.ts apps/crew-running/data/badges.test.ts
git commit -m "feat(crew-running): add badge evaluator with first-blood condition"
```

---

### Task 3: Badge condition — night-owl, cartographer, urban-marathon

**Files:**
- Modify: `apps/crew-running/data/badges.ts`
- Test: `apps/crew-running/data/badges.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `apps/crew-running/data/badges.test.ts`:

```ts
describe('evaluateBadgeUnlocks — night-owl', () => {
  it('unlocks when nightRuns reaches 10 (counting this run if started between 22h-04h local)', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 9, nightRuns: 9 },
      snapshot: { ...baseSnapshot(), startedAt: new Date('2026-05-28T03:30:00').getTime() },
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T04:00:00'),
    });
    expect(unlocks).toContain('night-owl');
  });

  it('does not unlock when nightRuns < 10', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 5, nightRuns: 5 },
      snapshot: { ...baseSnapshot(), startedAt: new Date('2026-05-28T03:30:00').getTime() },
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T04:00:00'),
    });
    expect(unlocks).not.toContain('night-owl');
  });
});

describe('evaluateBadgeUnlocks — cartographer', () => {
  it('unlocks when uniqueSpotsTouched reaches 11', () => {
    const elevenIds = Array.from({ length: 11 }, (_, i) => `spot-${i}`);
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 1, uniqueSpotsTouched: elevenIds },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('cartographer');
  });
});

describe('evaluateBadgeUnlocks — urban-marathon', () => {
  it('unlocks when kmThisWeek reaches 42', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 4, kmThisWeek: 42.1 },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('urban-marathon');
  });

  it('does not unlock under 42km', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 4, kmThisWeek: 41.9 },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).not.toContain('urban-marathon');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run data/badges.test.ts
```

Expected: 4 new tests FAIL (3 expect badge, 1 expects exclusion that passes for wrong reason).

- [ ] **Step 3: Implement conditions**

Replace the three corresponding entries in `CONDITIONS` inside `apps/crew-running/data/badges.ts`:

```ts
const isNightWindow = (startedAtMs: number): boolean => {
  const hour = new Date(startedAtMs).getHours();
  return hour >= 22 || hour < 4;
};

const CONDITIONS: Record<BadgeId, Condition> = {
  'first-blood': ({ history }) => history.totalRuns === 0,
  'night-owl': ({ history, snapshot }) => {
    const counting = isNightWindow(snapshot.startedAt) ? 1 : 0;
    return history.nightRuns + counting >= 10;
  },
  invader: () => false,
  cartographer: ({ history }) => history.uniqueSpotsTouched.length >= 11,
  'urban-marathon': ({ history }) => history.kmThisWeek >= 42,
  'local-legend': () => false,
  'streak-12': () => false,
  'solo-wolf': () => false,
  'pace-setter': () => false,
  'season-captain': () => false,
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run data/badges.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/data/badges.ts apps/crew-running/data/badges.test.ts
git commit -m "feat(crew-running): badge conditions for night-owl, cartographer, urban-marathon"
```

---

### Task 4: Badge condition — invader, streak-12, solo-wolf

**Files:**
- Modify: `apps/crew-running/data/badges.ts`
- Test: `apps/crew-running/data/badges.test.ts`

- [ ] **Step 1: Write failing tests**

Append to `apps/crew-running/data/badges.test.ts`:

```ts
describe('evaluateBadgeUnlocks — invader', () => {
  it('unlocks when invasionsSucceeded + this-run-invasion reaches 5', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 8, invasionsSucceeded: 4 },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 5,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: true,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('invader');
  });
});

describe('evaluateBadgeUnlocks — streak-12', () => {
  it('unlocks when streakWeeks reaches 12', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: { ...baseProgress(), streakWeeks: 12 },
      history: { ...emptyRunHistoryStats(), totalRuns: 50 },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('streak-12');
  });
});

describe('evaluateBadgeUnlocks — solo-wolf', () => {
  it('unlocks when soloTerritoryKm + this-run own-territory km hits 50', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 10, soloTerritoryKm: 48 },
      snapshot: { ...baseSnapshot(), totalMeters: 3000, metersInTerritory: 3000 },
      breakdown: breakdownRunXp({
        distanceKm: 3,
        kmInTerritory: 3,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('solo-wolf');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run data/badges.test.ts
```

Expected: 3 new FAIL.

- [ ] **Step 3: Implement conditions**

Replace the three matching entries in `CONDITIONS`:

```ts
  invader: ({ history, breakdown }) => {
    const counting = breakdown.invasionMult > 1 ? 1 : 0;
    return history.invasionsSucceeded + counting >= 5;
  },
  'streak-12': ({ progress }) => progress.streakWeeks >= 12,
  'solo-wolf': ({ history, snapshot }) => {
    const thisRunKm = snapshot.metersInTerritory / 1000;
    return history.soloTerritoryKm + thisRunKm >= 50;
  },
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run data/badges.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/data/badges.ts apps/crew-running/data/badges.test.ts
git commit -m "feat(crew-running): badge conditions for invader, streak-12, solo-wolf"
```

---

### Task 5: `MultiplierChip` component

**Files:**
- Create: `apps/crew-running/components/map/MultiplierChip.tsx`
- Test: `apps/crew-running/components/map/__tests__/MultiplierChip.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/components/map/__tests__/MultiplierChip.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MultiplierChip } from '../MultiplierChip';

describe('MultiplierChip', () => {
  it('renders loop chip with multiplier and explanation', () => {
    render(<MultiplierChip kind="loop" multiplier={1.5} />);
    expect(screen.getByText(/loop ×1.5/i)).toBeInTheDocument();
    expect(screen.getByText(/fechou volta/i)).toBeInTheDocument();
  });

  it('renders invasion chip with multiplier and explanation', () => {
    render(<MultiplierChip kind="invasion" multiplier={1.5} />);
    expect(screen.getByText(/invasão ×1.5/i)).toBeInTheDocument();
    expect(screen.getByText(/correu em zona inimiga/i)).toBeInTheDocument();
  });

  it('renders null when multiplier is exactly 1', () => {
    const { container } = render(<MultiplierChip kind="loop" multiplier={1} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/map/__tests__/MultiplierChip.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement component**

Create `apps/crew-running/components/map/MultiplierChip.tsx`:

```tsx
import React from 'react';

interface Props {
  kind: 'loop' | 'invasion';
  multiplier: number;
}

const COPY: Record<Props['kind'], { label: string; explain: string }> = {
  loop: { label: 'Loop', explain: 'Fechou volta — bônus de loop aplicado.' },
  invasion: { label: 'Invasão', explain: 'Correu em zona inimiga — XP da invasão dobrado.' },
};

export const MultiplierChip: React.FC<Props> = ({ kind, multiplier }) => {
  if (multiplier === 1) return null;
  const { label, explain } = COPY[kind];
  return (
    <span className={`run-summary-multiplier-chip run-summary-multiplier-chip--${kind}`}>
      <strong className="run-summary-multiplier-chip-label">
        {label} ×{multiplier}
      </strong>
      <span className="run-summary-multiplier-chip-explain">{explain}</span>
    </span>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run components/map/__tests__/MultiplierChip.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/components/map/MultiplierChip.tsx apps/crew-running/components/map/__tests__/MultiplierChip.test.tsx
git commit -m "feat(crew-running): MultiplierChip explains why loop/invasion bonus fired"
```

---

### Task 6: `BadgeUnlockToast` component

**Files:**
- Create: `apps/crew-running/components/map/BadgeUnlockToast.tsx`
- Test: `apps/crew-running/components/map/__tests__/BadgeUnlockToast.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/components/map/__tests__/BadgeUnlockToast.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgeUnlockToast } from '../BadgeUnlockToast';

describe('BadgeUnlockToast', () => {
  it('renders nothing when no unlocks', () => {
    const { container } = render(
      <BadgeUnlockToast unlocked={[]} onDismiss={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders one card per unlocked badge with name and hint', () => {
    render(
      <BadgeUnlockToast
        unlocked={['first-blood', 'cartographer']}
        onDismiss={() => {}}
      />,
    );
    expect(screen.getByText(/primeira sangue/i)).toBeInTheDocument();
    expect(screen.getByText(/sua primeira corrida/i)).toBeInTheDocument();
    expect(screen.getByText(/cartógrafo/i)).toBeInTheDocument();
    expect(screen.getByText(/toque todos os 11 spots/i)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn();
    render(
      <BadgeUnlockToast unlocked={['first-blood']} onDismiss={onDismiss} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/map/__tests__/BadgeUnlockToast.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement component**

Create `apps/crew-running/components/map/BadgeUnlockToast.tsx`:

```tsx
import React from 'react';
import { BADGE_DEFS, type BadgeId } from '../../data/gamification';

interface Props {
  unlocked: BadgeId[];
  onDismiss: () => void;
}

const defById = (id: BadgeId) => BADGE_DEFS.find((b) => b.id === id);

export const BadgeUnlockToast: React.FC<Props> = ({ unlocked, onDismiss }) => {
  if (unlocked.length === 0) return null;
  return (
    <div
      className="badge-unlock-toast-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Conquistas desbloqueadas"
    >
      <div className="badge-unlock-toast-card">
        <h2 className="badge-unlock-toast-title">Conquista desbloqueada</h2>
        <ul className="badge-unlock-toast-list">
          {unlocked.map((id) => {
            const def = defById(id);
            if (!def) return null;
            return (
              <li key={id} className="badge-unlock-toast-item">
                <strong className="badge-unlock-toast-name">{def.name}</strong>
                <span className="badge-unlock-toast-hint">{def.hint}</span>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="badge-unlock-toast-dismiss"
          onClick={onDismiss}
          aria-label="Fechar"
        >
          FECHAR
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run components/map/__tests__/BadgeUnlockToast.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/components/map/BadgeUnlockToast.tsx apps/crew-running/components/map/__tests__/BadgeUnlockToast.test.tsx
git commit -m "feat(crew-running): BadgeUnlockToast renders unlocked badges from BADGE_DEFS"
```

---

### Task 7: Wire `MultiplierChip` + `BadgeUnlockToast` into `RunSummary`

**Files:**
- Modify: `apps/crew-running/components/map/RunSummary.tsx`
- Test: existing tests for RunSummary (if absent, create a new one)

- [ ] **Step 1: Add test for new behavior**

Create or extend `apps/crew-running/components/map/__tests__/RunSummary.test.tsx`. If file exists, append; otherwise create it with:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RunSummary } from '../RunSummary';
import type { RunSnapshot } from '../../../services/runTracker';
import type { RunXpBreakdown } from '../../../data/gamification';

const baseSnapshot = (): RunSnapshot => ({
  state: 'completed',
  startedAt: 0,
  elapsedMs: 1_800_000,
  totalMeters: 5000,
  metersInTerritory: 1000,
  points: [],
  touchedSpotIds: [],
  closedLoop: true,
});

const baseBreakdown = (): RunXpBreakdown => ({
  baseXp: 40,
  territoryXp: 20,
  spotXp: 0,
  loopMult: 1.5,
  invasionMult: 1,
  total: 90,
});

describe('RunSummary', () => {
  it('renders multiplier chip explanation when loop multiplier is active', () => {
    render(
      <RunSummary
        snapshot={baseSnapshot()}
        breakdown={baseBreakdown()}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={() => {}}
        onDiscard={() => {}}
        onDismissUnlocks={() => {}}
      />,
    );
    expect(screen.getByText(/loop ×1.5/i)).toBeInTheDocument();
    expect(screen.getByText(/fechou volta/i)).toBeInTheDocument();
  });

  it('renders badge unlock toast when newlyUnlocked is non-empty', () => {
    render(
      <RunSummary
        snapshot={baseSnapshot()}
        breakdown={baseBreakdown()}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={['first-blood']}
        onSave={() => {}}
        onDiscard={() => {}}
        onDismissUnlocks={() => {}}
      />,
    );
    expect(screen.getByText(/primeira sangue/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/map/__tests__/RunSummary.test.tsx
```

Expected: FAIL — `newlyUnlocked` not a known prop / chip text not found.

- [ ] **Step 3: Replace `RunSummary.tsx`**

Overwrite `apps/crew-running/components/map/RunSummary.tsx`:

```tsx
import React from 'react';
import type { BadgeId, RunXpBreakdown } from '../../data/gamification';
import type { RunSnapshot } from '../../services/runTracker';
import { MultiplierChip } from './MultiplierChip';
import { BadgeUnlockToast } from './BadgeUnlockToast';

interface Props {
  snapshot: RunSnapshot;
  breakdown: RunXpBreakdown;
  streakBumped: boolean;
  streakBroken: boolean;
  freezeUsed: boolean;
  newlyUnlocked: BadgeId[];
  onSave: () => void;
  onDiscard: () => void;
  onDismissUnlocks: () => void;
}

const formatTime = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
};

export const RunSummary: React.FC<Props> = ({
  snapshot,
  breakdown,
  streakBumped,
  streakBroken,
  freezeUsed,
  newlyUnlocked,
  onSave,
  onDiscard,
  onDismissUnlocks,
}) => (
  <>
    <div className="run-summary-backdrop" role="dialog" aria-modal="true" aria-label="Resumo da corrida">
      <div className="run-summary-card">
        <h2 className="run-summary-title">Corrida fechada</h2>
        <dl className="run-summary-stats">
          <div>
            <dt>Distância</dt>
            <dd>{(snapshot.totalMeters / 1000).toFixed(2)} km</dd>
          </div>
          <div>
            <dt>Tempo ativo</dt>
            <dd>{formatTime(snapshot.elapsedMs)}</dd>
          </div>
          <div>
            <dt>Em território</dt>
            <dd>{(snapshot.metersInTerritory / 1000).toFixed(2)} km</dd>
          </div>
          <div>
            <dt>Spots tocados</dt>
            <dd>{snapshot.touchedSpotIds.length}</dd>
          </div>
          <div>
            <dt>Loop fechado</dt>
            <dd>{snapshot.closedLoop ? 'Sim' : 'Não'}</dd>
          </div>
        </dl>
        <div className="run-summary-xp">
          <div className="run-summary-xp-total">+{breakdown.total} XP</div>
          <ul className="run-summary-xp-breakdown">
            <li>Base: {breakdown.baseXp}</li>
            <li>Território: {breakdown.territoryXp}</li>
            <li>Spots: {breakdown.spotXp}</li>
          </ul>
          <div className="run-summary-xp-multipliers">
            <MultiplierChip kind="loop" multiplier={breakdown.loopMult} />
            <MultiplierChip kind="invasion" multiplier={breakdown.invasionMult} />
          </div>
        </div>
        {streakBumped && <p className="run-summary-notice run-summary-notice--good">Streak +1!</p>}
        {freezeUsed && <p className="run-summary-notice">Freeze usado pra preservar streak.</p>}
        {streakBroken && <p className="run-summary-notice run-summary-notice--bad">Streak quebrado.</p>}
        <div className="run-summary-actions">
          <button type="button" className="run-summary-button run-summary-button--save" onClick={onSave}>
            SALVAR CORRIDA
          </button>
          <button type="button" className="run-summary-button run-summary-button--discard" onClick={onDiscard}>
            DESCARTAR
          </button>
        </div>
      </div>
    </div>
    <BadgeUnlockToast unlocked={newlyUnlocked} onDismiss={onDismissUnlocks} />
  </>
);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run components/map/__tests__/RunSummary.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/components/map/RunSummary.tsx apps/crew-running/components/map/__tests__/RunSummary.test.tsx
git commit -m "feat(crew-running): RunSummary surfaces multiplier reasons and badge unlocks"
```

---

### Task 8: Add CSS for multiplier chip + badge toast

**Files:**
- Modify: `apps/crew-running/index.css`

- [ ] **Step 1: Locate the existing `.run-summary-*` block**

Open `apps/crew-running/index.css`. Use a search for `.run-summary-` to find the existing block. Append the new styles immediately after the last `.run-summary-*` rule so related styles stay grouped.

- [ ] **Step 2: Append the new styles**

Append these rules after the existing `.run-summary-*` block:

```css
.run-summary-xp-multipliers {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.run-summary-multiplier-chip {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 165, 44, 0.15);
  border: 1px solid rgba(255, 165, 44, 0.4);
}

.run-summary-multiplier-chip--invasion {
  background: rgba(232, 93, 44, 0.15);
  border-color: rgba(232, 93, 44, 0.4);
}

.run-summary-multiplier-chip-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.run-summary-multiplier-chip-explain {
  font-size: 11px;
  opacity: 0.85;
}

.badge-unlock-toast-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.badge-unlock-toast-card {
  background: #131418;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 24px;
  max-width: 360px;
  width: calc(100vw - 32px);
}

.badge-unlock-toast-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin: 0 0 16px;
}

.badge-unlock-toast-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badge-unlock-toast-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.badge-unlock-toast-name {
  font-size: 15px;
  font-weight: 700;
}

.badge-unlock-toast-hint {
  font-size: 12px;
  opacity: 0.7;
}

.badge-unlock-toast-dismiss {
  margin-top: 16px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: #ffffff;
  color: #000000;
  font-weight: 700;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
}
```

- [ ] **Step 3: Smoke test the dev server**

Run from `apps/crew-running/`:

```bash
npm run build
```

Expected: build succeeds. Tailwind doesn't tree-shake these classes (they're in CSS, not `class=` attributes scanned by content config — Tailwind 3.4 only purges Tailwind utility classes, raw CSS is untouched).

- [ ] **Step 4: Commit**

```bash
git add apps/crew-running/index.css
git commit -m "style(crew-running): multiplier chip and badge unlock toast styles"
```

---

### Task 9: Track `RunHistoryStats` in storage

**Files:**
- Modify: `apps/crew-running/services/storage.ts` (locate functions reading/writing `RunnerProgress`; add neighbor for history stats)
- Test: `apps/crew-running/services/storage.test.ts`

- [ ] **Step 1: Read the existing storage module**

```bash
grep -n "RunnerProgress" apps/crew-running/services/storage.ts apps/crew-running/services/storage.test.ts
```

Confirm the existing read/write functions (likely `loadRunnerProgress`, `saveRunnerProgress`). The neighbor functions must follow the same shape.

- [ ] **Step 2: Write the failing test**

Append to `apps/crew-running/services/storage.test.ts`:

```ts
import { loadRunHistoryStats, saveRunHistoryStats } from './storage';
import { emptyRunHistoryStats } from '../data/gamification';

describe('runHistoryStats persistence', () => {
  it('returns empty baseline when nothing stored', () => {
    expect(loadRunHistoryStats()).toEqual(emptyRunHistoryStats());
  });

  it('round-trips written stats', () => {
    const stats = {
      ...emptyRunHistoryStats(),
      totalRuns: 3,
      totalKm: 12.5,
      uniqueSpotsTouched: ['spot-vale', 'spot-republica'],
    };
    saveRunHistoryStats(stats);
    expect(loadRunHistoryStats()).toEqual(stats);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run services/storage.test.ts -t 'runHistoryStats persistence'
```

Expected: FAIL — exports missing.

- [ ] **Step 4: Implement the helpers**

In `apps/crew-running/services/storage.ts`, follow whatever pattern `loadRunnerProgress`/`saveRunnerProgress` use (key namespacing, JSON parse with try/catch fallback). Add at the end:

```ts
import { emptyRunHistoryStats, type RunHistoryStats } from '../data/gamification';

const RUN_HISTORY_STATS_KEY = 'crew-running:runHistoryStats:v1';

export const loadRunHistoryStats = (): RunHistoryStats => {
  try {
    const raw = window.localStorage.getItem(RUN_HISTORY_STATS_KEY);
    if (!raw) return emptyRunHistoryStats();
    const parsed = JSON.parse(raw);
    return { ...emptyRunHistoryStats(), ...parsed };
  } catch {
    return emptyRunHistoryStats();
  }
};

export const saveRunHistoryStats = (stats: RunHistoryStats): void => {
  try {
    window.localStorage.setItem(RUN_HISTORY_STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore — storage full or unavailable, history stays in-memory only
  }
};
```

Note: if `storage.ts` already imports `RunHistoryStats` types or has a different pattern (e.g. a generic `loadJson`/`saveJson` helper), follow that pattern instead. Inspect first.

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run services/storage.test.ts -t 'runHistoryStats persistence'
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/crew-running/services/storage.ts apps/crew-running/services/storage.test.ts
git commit -m "feat(crew-running): persist RunHistoryStats in localStorage"
```

---

### Task 10: Update history stats after a saved run

**Files:**
- Create: `apps/crew-running/data/runHistoryUpdate.ts` — pure reducer applying a saved snapshot to existing stats
- Test: `apps/crew-running/data/runHistoryUpdate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/crew-running/data/runHistoryUpdate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { applyRunToHistory } from './runHistoryUpdate';
import { emptyRunHistoryStats, breakdownRunXp, isoWeekKey } from './gamification';
import type { RunSnapshot } from '../services/runTracker';

const baseSnapshot = (): RunSnapshot => ({
  state: 'completed',
  startedAt: new Date('2026-05-28T10:00:00').getTime(),
  elapsedMs: 1_800_000,
  totalMeters: 5000,
  metersInTerritory: 1500,
  points: [],
  touchedSpotIds: ['spot-vale'],
  closedLoop: false,
});

describe('applyRunToHistory', () => {
  it('increments totalRuns, totalKm, soloTerritoryKm', () => {
    const next = applyRunToHistory({
      prior: emptyRunHistoryStats(),
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 1.5,
        spotsTouched: 1,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: isoWeekKey(new Date('2026-05-28T10:00:00')),
      priorWeekKey: '',
    });
    expect(next.totalRuns).toBe(1);
    expect(next.totalKm).toBeCloseTo(5);
    expect(next.soloTerritoryKm).toBeCloseTo(1.5);
    expect(next.uniqueSpotsTouched).toEqual(['spot-vale']);
  });

  it('deduplicates spot ids across runs', () => {
    const start = { ...emptyRunHistoryStats(), uniqueSpotsTouched: ['spot-vale'] };
    const next = applyRunToHistory({
      prior: start,
      snapshot: { ...baseSnapshot(), touchedSpotIds: ['spot-vale', 'spot-luz'] },
      breakdown: breakdownRunXp({
        distanceKm: 3,
        kmInTerritory: 0,
        spotsTouched: 2,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: isoWeekKey(new Date('2026-05-28T10:00:00')),
      priorWeekKey: '',
    });
    expect(next.uniqueSpotsTouched.sort()).toEqual(['spot-luz', 'spot-vale']);
  });

  it('resets kmThisWeek when crossing weeks', () => {
    const start = { ...emptyRunHistoryStats(), kmThisWeek: 20 };
    const next = applyRunToHistory({
      prior: start,
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: '2026-W23',
      priorWeekKey: '2026-W22',
    });
    expect(next.kmThisWeek).toBeCloseTo(5);
  });

  it('accumulates kmThisWeek inside same week', () => {
    const start = { ...emptyRunHistoryStats(), kmThisWeek: 20 };
    const next = applyRunToHistory({
      prior: start,
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: '2026-W22',
      priorWeekKey: '2026-W22',
    });
    expect(next.kmThisWeek).toBeCloseTo(25);
  });

  it('increments nightRuns when started between 22h-04h local', () => {
    const next = applyRunToHistory({
      prior: emptyRunHistoryStats(),
      snapshot: { ...baseSnapshot(), startedAt: new Date('2026-05-28T03:30:00').getTime() },
      breakdown: breakdownRunXp({
        distanceKm: 3,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: '2026-W22',
      priorWeekKey: '2026-W22',
    });
    expect(next.nightRuns).toBe(1);
  });

  it('increments invasionsSucceeded when breakdown.invasionMult > 1', () => {
    const next = applyRunToHistory({
      prior: emptyRunHistoryStats(),
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 5,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: true,
      }),
      runWeekKey: '2026-W22',
      priorWeekKey: '2026-W22',
    });
    expect(next.invasionsSucceeded).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run data/runHistoryUpdate.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement reducer**

Create `apps/crew-running/data/runHistoryUpdate.ts`:

```ts
import type { RunHistoryStats, RunXpBreakdown } from './gamification';
import type { RunSnapshot } from '../services/runTracker';

interface ApplyInput {
  prior: RunHistoryStats;
  snapshot: RunSnapshot;
  breakdown: RunXpBreakdown;
  runWeekKey: string;
  priorWeekKey: string;
}

const isNightWindow = (startedAtMs: number): boolean => {
  const hour = new Date(startedAtMs).getHours();
  return hour >= 22 || hour < 4;
};

export const applyRunToHistory = ({
  prior,
  snapshot,
  breakdown,
  runWeekKey,
  priorWeekKey,
}: ApplyInput): RunHistoryStats => {
  const km = snapshot.totalMeters / 1000;
  const territoryKm = snapshot.metersInTerritory / 1000;
  const sameWeek = runWeekKey === priorWeekKey;
  const mergedSpots = Array.from(
    new Set([...prior.uniqueSpotsTouched, ...snapshot.touchedSpotIds]),
  );
  return {
    totalRuns: prior.totalRuns + 1,
    totalKm: prior.totalKm + km,
    kmThisWeek: sameWeek ? prior.kmThisWeek + km : km,
    nightRuns: prior.nightRuns + (isNightWindow(snapshot.startedAt) ? 1 : 0),
    invasionsSucceeded: prior.invasionsSucceeded + (breakdown.invasionMult > 1 ? 1 : 0),
    uniqueSpotsTouched: mergedSpots,
    captainWeeks: prior.captainWeeks,
    weeklyTopThreeCount: prior.weeklyTopThreeCount,
    soloTerritoryKm: prior.soloTerritoryKm + territoryKm,
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run data/runHistoryUpdate.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/data/runHistoryUpdate.ts apps/crew-running/data/runHistoryUpdate.test.ts
git commit -m "feat(crew-running): applyRunToHistory reducer for badge condition inputs"
```

---

### Task 11: Wire history + badge eval into the save-run flow in `MapStage`

**Files:**
- Modify: `apps/crew-running/components/map/MapStage.tsx` (locate the existing save-run handler — the call site for `bumpStreak` + the existing `RunSummary` mount)
- Test: integration test if `MapStage.test.tsx` exists; otherwise add a focused test in `__tests__/MapStage.test.tsx`

- [ ] **Step 1: Locate the existing save handler**

```bash
grep -n "bumpStreak\|breakdownRunXp\|RunSummary" apps/crew-running/components/map/MapStage.tsx
```

Expected: find a handler (likely `handleSaveRun` or similar) that calls `breakdownRunXp`, `bumpStreak`, and updates `RunnerProgress`. Note the file:line.

- [ ] **Step 2: Write a focused integration test**

Open `apps/crew-running/components/map/__tests__/MapStage.test.tsx`. Find existing tests for the save flow (search for `RunSummary` or `Salvar`). Add or extend a test that drives a saved run and asserts:
- After saving, `loadRunHistoryStats()` returns `totalRuns: 1`
- `RunSummary` was passed `newlyUnlocked: ['first-blood']`

Exact test depends on existing harness — read the file and adapt. If the file has a `renderMapStage()` helper, reuse it. Pattern shape:

```tsx
it('persists history and unlocks first-blood after the first saved run', async () => {
  // (use existing helpers in this file to mount and drive a run)
  // ... drive run start → complete → click "SALVAR CORRIDA"
  expect(loadRunHistoryStats().totalRuns).toBe(1);
  // assert toast with "Primeira Sangue" appears
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run components/map/__tests__/MapStage.test.tsx -t 'first-blood'
```

Expected: FAIL — history not persisted; toast not rendered.

- [ ] **Step 4: Modify `MapStage.tsx` save handler**

Inside the save handler:

```tsx
// existing: const breakdown = breakdownRunXp(xpInput);
// existing: const streakResult = bumpStreak(progress, now);

const priorHistory = loadRunHistoryStats();
const runWeekKey = isoWeekKey(now);
const nextHistory = applyRunToHistory({
  prior: priorHistory,
  snapshot,
  breakdown,
  runWeekKey,
  priorWeekKey: progress.weekKey,
});
saveRunHistoryStats(nextHistory);

const newlyUnlocked = evaluateBadgeUnlocks({
  progress,
  history: priorHistory, // evaluate against history BEFORE this run; conditions are "this run takes you over the line"
  snapshot,
  breakdown,
  now,
});

const nextProgress: RunnerProgress = {
  ...streakResult.next,
  xp: streakResult.next.xp + breakdown.total,
  badgeUnlocks: Array.from(new Set([...streakResult.next.badgeUnlocks, ...newlyUnlocked])),
};
saveRunnerProgress(nextProgress); // or whatever the existing call is

setRunSummaryState({ snapshot, breakdown, streakResult, newlyUnlocked });
```

And update the `RunSummary` mount:

```tsx
<RunSummary
  snapshot={runSummaryState.snapshot}
  breakdown={runSummaryState.breakdown}
  streakBumped={runSummaryState.streakResult.streakBumped}
  streakBroken={runSummaryState.streakResult.streakBroken}
  freezeUsed={runSummaryState.streakResult.freezeUsed}
  newlyUnlocked={runSummaryState.newlyUnlocked}
  onSave={handleConfirmSave}
  onDiscard={handleDiscard}
  onDismissUnlocks={handleDismissUnlocks}
/>
```

Add imports at top of file:

```tsx
import { loadRunHistoryStats, saveRunHistoryStats } from '../../services/storage';
import { applyRunToHistory } from '../../data/runHistoryUpdate';
import { evaluateBadgeUnlocks } from '../../data/badges';
import { isoWeekKey } from '../../data/gamification';
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run components/map/__tests__/MapStage.test.tsx -t 'first-blood'
```

Expected: PASS.

- [ ] **Step 6: Full validate**

From `apps/crew-running/`:

```bash
npm run validate
```

Expected: contract + typecheck + tests + build + smoke all PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/crew-running/components/map/MapStage.tsx apps/crew-running/components/map/__tests__/MapStage.test.tsx
git commit -m "feat(crew-running): wire run history + badge unlocks into save-run flow"
```

---

### Task 12: Badge grid on the profile screen (existing surface)

**Files:**
- Locate: a profile / runner sheet component that already exists (search first)
- Create: `apps/crew-running/components/profile/BadgeGrid.tsx`
- Test: `apps/crew-running/components/profile/__tests__/BadgeGrid.test.tsx`

- [ ] **Step 1: Locate the profile mounting surface**

```bash
grep -rn "onOpenProfile" apps/crew-running/components/ apps/crew-running/app/ 2>/dev/null | head -20
```

The HUD overlay already calls `onOpenProfile`. Find where this callback is wired in the parent (likely `MapStage` or a panel manager) and what component renders the profile.

- [ ] **Step 2: Write the failing test for BadgeGrid**

Create `apps/crew-running/components/profile/__tests__/BadgeGrid.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BadgeGrid } from '../BadgeGrid';
import { BADGE_DEFS } from '../../../data/gamification';

describe('BadgeGrid', () => {
  it('renders all BADGE_DEFS with locked/unlocked state', () => {
    render(<BadgeGrid unlocked={['first-blood']} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(BADGE_DEFS.length);
    expect(screen.getByLabelText(/Primeira Sangue.*desbloqueado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cartógrafo.*bloqueado/i)).toBeInTheDocument();
  });

  it('shows hint for locked badges as the unlock condition', () => {
    render(<BadgeGrid unlocked={[]} />);
    expect(screen.getByText(/sua primeira corrida/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run components/profile/__tests__/BadgeGrid.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement BadgeGrid**

Create `apps/crew-running/components/profile/BadgeGrid.tsx`:

```tsx
import React from 'react';
import { BADGE_DEFS, type BadgeId } from '../../data/gamification';

interface Props {
  unlocked: BadgeId[];
}

export const BadgeGrid: React.FC<Props> = ({ unlocked }) => {
  const owned = new Set(unlocked);
  return (
    <ul className="badge-grid">
      {BADGE_DEFS.map((badge) => {
        const isUnlocked = owned.has(badge.id);
        return (
          <li
            key={badge.id}
            className={`badge-grid-item badge-grid-item--${isUnlocked ? 'unlocked' : 'locked'}`}
            aria-label={`${badge.name} ${isUnlocked ? 'desbloqueado' : 'bloqueado'}`}
          >
            <span className="badge-grid-name">{badge.name}</span>
            <span className="badge-grid-hint">{badge.hint}</span>
          </li>
        );
      })}
    </ul>
  );
};
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run components/profile/__tests__/BadgeGrid.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Mount in the profile surface**

Edit the profile component identified in Step 1 to render `<BadgeGrid unlocked={progress.badgeUnlocks} />` in an appropriate slot. Run `npm run typecheck` afterward.

- [ ] **Step 7: Add minimal CSS**

Append to `apps/crew-running/index.css`:

```css
.badge-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.badge-grid-item {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge-grid-item--locked {
  opacity: 0.45;
  filter: grayscale(1);
}

.badge-grid-name {
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.badge-grid-hint {
  font-size: 11px;
  opacity: 0.75;
}
```

- [ ] **Step 8: Full validate + commit**

```bash
npm run validate
git add apps/crew-running/components/profile/ apps/crew-running/index.css
# also add whatever profile parent was modified in Step 6
git commit -m "feat(crew-running): BadgeGrid on profile, lists all badges with lock state"
```

---

## Phase 1 acceptance criteria

- `BADGE_DEFS` are visible on the profile screen, each in locked or unlocked state.
- After a saved run that unlocks one or more badges, the `BadgeUnlockToast` appears over `RunSummary` and dismisses cleanly.
- `RunSummary` shows multiplier chips with human explanations whenever a multiplier > 1 fires.
- `RunHistoryStats` persists across reloads.
- `npm run validate` is green.
- No regressions in existing `MapStage` tests, run tracker tests, or storage tests.

---

# Phase 2 — Crew leaderboard (roadmap)

**Goal:** weekly + all-time leaderboard scoped to the runner's crew. Strava `SegmentLeaderboard` provides the schema vocabulary (athlete, elapsed_time, rank, context_entries). Filter chips inspired by Strava (date_range, peer_group).

**Files to create:**
- `apps/crew-running/data/leaderboard.ts` — pure aggregation: `aggregateCrewLeaderboard(runs: SavedRun[], weekKey: string): LeaderboardRow[]`
- `apps/crew-running/data/leaderboard.test.ts`
- `apps/crew-running/components/crew/CrewLeaderboard.tsx` — table with rank, runner name, km, XP, delta-from-last-week
- `apps/crew-running/components/crew/__tests__/CrewLeaderboard.test.tsx`

**Files to modify:**
- `apps/crew-running/services/storage.ts` — persist `SavedRun[]` (currently only `RunnerProgress`)
- `apps/crew-running/components/map/CrewSheet.tsx` — mount `<CrewLeaderboard>` inside the existing sheet
- `apps/crew-running/components/map/__tests__/CrewSheet.test.tsx`

**Data shape (Strava-borrowed):**

```ts
interface SavedRun {
  id: string;
  runnerId: string;
  crewSlug: string;
  weekKey: string;
  km: number;
  territoryKm: number;
  xp: number;
  startedAt: number;
  organizationId: string; // per CLAUDE.md global rule
}
interface LeaderboardRow {
  rank: number;
  runnerId: string;
  runnerName: string;
  km: number;
  xp: number;
}
```

**Out of scope:** global leaderboard, age/gender filters, server-side sync. Local crew-only leaderboard from local SavedRuns first.

---

# Phase 3 — Quest progress (roadmap)

**Goal:** convert `SAMPLE_MISSIONS` from decorative cards into real progress trackers (e.g. "Spot Hunt Centro: 2/3 spots in 36h"). FitQuest's challenge schema inspires the quest definition.

**Files to create:**
- `apps/crew-running/data/quests.ts` — `evaluateQuestProgress(mission, history, snapshots): QuestProgress` returning `{ completed: boolean, currentCount: number, requiredCount: number, expiresAt: number, deltaSinceLastRun: number }`
- `apps/crew-running/data/quests.test.ts`
- `apps/crew-running/components/map/QuestProgressBar.tsx`
- `apps/crew-running/components/map/__tests__/QuestProgressBar.test.tsx`

**Files to modify:**
- `apps/crew-running/components/map/ZoneSheet.tsx` — replace static mission `<li>` with `<QuestProgressBar>` per mission
- `apps/crew-running/components/map/SpotSheet.tsx` — same

**Per-mission-type logic:** `spot-hunt` reads `uniqueSpotsTouched` ∩ `mission.spotIds`; `invasion` reads cumulative km in `mission.zoneId` during the window; `night-drift` reads night-windowed km; `crew-pinned` reads runs by other crew members on the same route; `heritage` reads spot touches at historic spots.

---

# Phase 4 — Personalization via `crewRenderContext` (roadmap)

**Goal:** unify wardrobe + crew colors + runnerType into a single render context that feeds the map (basemap tint), the HUD (avatar), and the friend pings (silhouette).

**Files to extend:**
- `apps/crew-running/data/crewRenderContext.ts` — add `runnerSilhouette: RunnerTypeAsset`, `mapTint: { primary: string; secondary: string }`, `hudAvatar: CrewRenderAsset`
- `apps/crew-running/components/map/MapLibreCanvas.tsx` — apply `mapTint` to basemap paint properties
- `apps/crew-running/components/map/FriendPings.tsx` — read silhouette from context instead of crew accent
- `apps/crew-running/components/map/HudOverlay.tsx` — replace `crew.assets.badge` mount with `hudAvatar`

**Risk:** `crewRenderContext.ts` is already in git status (modified). Coordinate timing with whoever's mid-flight on it per project CLAUDE.md concurrent-edit rules.

---

# Phase 5 — Activity feed + kudos + follows (roadmap, Esforza-inspired)

**Goal:** the "Você" tab gets a real feed where runners see their crewmates' runs, kudos them, and comment. Lift the JSX structure from Esforza's `activity_display_item.jsx`; lift the `follows` table shape from Esforza schema; add `organization_id` per CLAUDE.md rule.

**Files to create:**
- `apps/crew-running/data/feed.ts` — `buildFeedItems(savedRuns, follows, kudos, comments): FeedItem[]`
- `apps/crew-running/data/feed.test.ts`
- `apps/crew-running/components/voce/FeedPost.tsx` (already exists per `MEMORY.md` reference — extend, don't recreate)
- `apps/crew-running/components/voce/KudosButton.tsx` — optimistic toggle
- `apps/crew-running/components/voce/CommentList.tsx`

**Schema (Strava + Esforza + multi-tenant overlay):**

```ts
interface Follow { followerId: string; followeeId: string; organizationId: string; createdAt: number; }
interface Kudo { activityId: string; athleteId: string; organizationId: string; createdAt: number; }
interface Comment { id: string; activityId: string; athleteId: string; text: string; organizationId: string; createdAt: number; }
```

**Out of scope:** server sync — local-first per CLAUDE.md `voce` roadmap; deferred to Phase 5b.

---

# Phase 6 — Territory decay + presence-weighted ink (roadmap, FWTM-inspired)

**Goal:** zones cool down when nobody runs them. Today ink is monotonic (`decayInk` exists but isn't called from any UI/service). Wire it into the zone read-path so ownership % feels alive.

**Files to modify:**
- `apps/crew-running/components/map/MapStage.tsx` — when computing zone ownership, apply `decayInk(rawInk, daysSince(inkUpdatedAt))` before division by `INK_PER_FULL_OWNERSHIP`
- Add settling test: `apps/crew-running/data/gamification.test.ts` — multi-day idle decays to neutral.

**FWTM lesson:** presence over time, not just accumulation. Already half-modeled via `inkUpdatedAt` timestamp; just needs to be read on every render.

---

# Phase 7 — GPX export (roadmap, OutRun-inspired)

**Goal:** user can export any saved run as `.gpx` from the run history view. Privacy/portability win that doesn't need server.

**Files to create:**
- `apps/crew-running/services/gpxExport.ts` — `runToGpx(savedRun, points): string` — emits GPX 1.1 with `<trkpt>` per `runTracker` point
- `apps/crew-running/services/gpxExport.test.ts`
- `apps/crew-running/components/voce/ExportRunButton.tsx`

**Out of scope:** TCX, FIT, KML.

---

## Open questions for the next planning pass

These need decisions before Phase 2+ planning:

1. **SavedRun persistence:** local-only forever, or sync to Supabase later? Affects schema choices (UUID vs short id, server timestamps).
2. **Leaderboard scope:** crew-only first, or also "global within your city"? Affects index strategy.
3. **Quest authoring:** stays in code (`SAMPLE_MISSIONS`), or moves to data file editable without redeploy?
4. **Multi-tenant boundary:** is each city/region a tenant, or each user a tenant? Affects `organization_id` semantics for shared zones.
5. **Activity feed visibility:** crew-only, follows-only, or both axes (your crew + people you follow)?
6. **Territory decay rate:** today `INK_DECAY_PER_DAY=0.033` (~half-life ~21 days). Calibrate against retention data once we have it.

---

## Self-review notes (filled during plan write)

- **Spec coverage:** Phase 1 covers achievements (vertical A) + multiplier explainability fully. Phases 2-7 outlined per research findings. ✅
- **Placeholders:** none in Phase 1. Phase 2-7 are explicitly roadmap, not executable. ✅
- **Type consistency:** `RunHistoryStats`, `BadgeId`, `RunSnapshot`, `RunXpBreakdown` used consistently. `RunnerProgress.badgeUnlocks` is `BadgeId[]` per existing `gamification.ts:42`. ✅
- **Risks:** Task 11 modifies `MapStage.tsx` — the file is already in git status (modified). Coordinate per CLAUDE.md concurrent-edit rules: re-read before editing, stage by explicit path. ⚠️
- **Test env:** `data/badges.test.ts` runs in `node` (matches `environmentMatchGlobs`); components in `happy-dom` with `Storage` shim from `test/setup.ts`. ✅
