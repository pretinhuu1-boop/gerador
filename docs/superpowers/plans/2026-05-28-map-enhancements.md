# Map Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rankings/crew cards, history layer, dark/light theming, and 96-district visuals to the map.

**Architecture:** Supabase-first with offline localStorage cache. Theme-aware MapLibre layer factories replace hardcoded constants. Each phase ships independently.

**Tech Stack:** React 18, MapLibre GL, Supabase PostGIS, Vitest, TypeScript

**Spec:** [`docs/superpowers/specs/2026-05-28-map-enhancements-design.md`](../specs/2026-05-28-map-enhancements-design.md)

---

## File Map

### New Files

| File | Purpose |
|------|---------|
| `services/supabaseClient.ts` | Singleton Supabase client |
| `services/syncQueue.ts` | Offline-first write queue (localStorage → Supabase) |
| `services/themeStorage.ts` | Theme preference persistence |
| `services/runLogStorage.ts` | Run GPS trace persistence (local + sync) |
| `services/territorySnapshotStorage.ts` | Weekly ink snapshots |
| `data/mapThemes.ts` | `MapTheme` interface + DARK/LIGHT palette constants |
| `data/mapLayerSpecs.ts` | Theme-aware layer factory functions |
| `components/map/ZoneLeaderboard.tsx` | Ranking list for a zone |
| `components/map/HistoryToolbar.tsx` | Sub-toggle chips for history sublayers |
| `components/map/HistoryRoutesLayer.tsx` | Past route LineStrings on map |
| `components/map/HistoryBadgesLayer.tsx` | Badge pin Markers on map |
| `components/map/HistoryTerritorySlider.tsx` | Week scrubber + territory replay |
| `components/map/ThemeToggle.tsx` | Sun/moon toggle button |
| `components/map/DistrictBadgeOverlay.tsx` | Crew badge at conquered district centroid |
| `hooks/useMapTheme.ts` | Theme state + persistence hook |
| `hooks/useLeaderboard.ts` | Supabase leaderboard query hook |
| `hooks/useRunLogs.ts` | Run log query (local-first + Supabase) |
| `hooks/useTerritorySnapshots.ts` | Snapshot query for timeline |
| `supabase/migrations/001_map_enhancements.sql` | All new tables |

### Modified Files

| File | Changes |
|------|---------|
| `services/runnerProgressStorage.ts` | Add `badgeUnlockEvents` field |
| `services/mapLayerStorage.ts` | Add `HistorySubLayers` persistence |
| `data/gamification.ts` | Add `BadgeUnlockEvent` type, extend `RunnerProgress` |
| `data/badges.ts` | Accept `currentZoneId`, return enriched unlock events |
| `data/mapTypes.ts` | Add `HistorySubLayers` interface |
| `components/map/MapLibreCanvas.tsx` | Theme-aware layers, history layers, district rendering |
| `components/map/MapStage.tsx` | History sublayer state, theme context, leaderboard wiring |
| `components/map/CrewSheet.tsx` | Leader + top 3 ranking section |
| `components/map/ZoneSheet.tsx` | "VER RANKING" button → ZoneLeaderboard |
| `components/map/LayerRail.tsx` | History toolbar integration |
| `index.css` | `[data-theme]` custom properties, new component styles |

---

## Phase 1: Supabase Foundation

### Task 1: Supabase Client Singleton

**Files:**
- Create: `apps/crew-running/services/supabaseClient.ts`
- Test: `apps/crew-running/services/__tests__/supabaseClient.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// services/__tests__/supabaseClient.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('supabaseClient', () => {
  it('returns same instance on repeated calls', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-key');
    const { getSupabase } = await import('../supabaseClient');
    const a = getSupabase();
    const b = getSupabase();
    expect(a).toBe(b);
    vi.unstubAllEnvs();
  });

  it('returns null when env vars missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    vi.resetModules();
    const { getSupabase } = await import('../supabaseClient');
    expect(getSupabase()).toBeNull();
    vi.unstubAllEnvs();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/crew-running && npx vitest run services/__tests__/supabaseClient.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// services/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

let instance: SupabaseClient<Database> | null = null;
let checked = false;

export const getSupabase = (): SupabaseClient<Database> | null => {
  if (checked) return instance;
  checked = true;
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  if (!url || !key) return null;
  instance = createClient<Database>(url, key);
  return instance;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/crew-running && npx vitest run services/__tests__/supabaseClient.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/services/supabaseClient.ts apps/crew-running/services/__tests__/supabaseClient.test.ts
git commit -m "feat(crew-running): Supabase client singleton with env guard"
```

---

### Task 2: Offline Sync Queue

**Files:**
- Create: `apps/crew-running/services/syncQueue.ts`
- Test: `apps/crew-running/services/__tests__/syncQueue.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// services/__tests__/syncQueue.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('syncQueue', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('enqueues an item and reads it back', async () => {
    const { enqueue, peekQueue } = await import('../syncQueue');
    enqueue('leaderboard', { zoneId: 'centro', km: 5 });
    const items = peekQueue('leaderboard');
    expect(items).toHaveLength(1);
    expect(items[0].payload.zoneId).toBe('centro');
  });

  it('dequeues removes the item', async () => {
    const { enqueue, peekQueue, dequeue } = await import('../syncQueue');
    enqueue('leaderboard', { zoneId: 'centro', km: 5 });
    const items = peekQueue('leaderboard');
    dequeue('leaderboard', items[0].id);
    expect(peekQueue('leaderboard')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/crew-running && npx vitest run services/__tests__/syncQueue.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// services/syncQueue.ts
import { canUseStorage } from './storageBase';

const KEY_PREFIX = 'crewSync_';

export interface QueueItem<T = unknown> {
  id: string;
  channel: string;
  payload: T;
  createdAt: number;
}

const getKey = (channel: string) => `${KEY_PREFIX}${channel}`;

export const enqueue = <T>(channel: string, payload: T): void => {
  if (!canUseStorage()) return;
  const key = getKey(channel);
  const items = peekQueue(channel);
  const item: QueueItem<T> = {
    id: crypto.randomUUID(),
    channel,
    payload,
    createdAt: Date.now(),
  };
  items.push(item as QueueItem);
  window.localStorage.setItem(key, JSON.stringify(items));
};

export const peekQueue = <T = unknown>(channel: string): QueueItem<T>[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(getKey(channel));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const dequeue = (channel: string, id: string): void => {
  if (!canUseStorage()) return;
  const items = peekQueue(channel);
  const filtered = items.filter((item) => item.id !== id);
  window.localStorage.setItem(getKey(channel), JSON.stringify(filtered));
};

export const flushQueue = async (
  channel: string,
  sender: (payload: unknown) => Promise<boolean>,
): Promise<number> => {
  const items = peekQueue(channel);
  let sent = 0;
  for (const item of items) {
    const ok = await sender(item.payload);
    if (ok) {
      dequeue(channel, item.id);
      sent++;
    }
  }
  return sent;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/crew-running && npx vitest run services/__tests__/syncQueue.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/services/syncQueue.ts apps/crew-running/services/__tests__/syncQueue.test.ts
git commit -m "feat(crew-running): offline sync queue for Supabase writes"
```

---

### Task 3: Database Migration

**Files:**
- Create: `apps/crew-running/supabase/migrations/001_map_enhancements.sql`

- [ ] **Step 1: Write migration file**

```sql
-- 001_map_enhancements.sql
-- Tables for rankings, run history, territory snapshots, and user preferences.

-- Weekly leaderboard per zone
create table if not exists zone_leaderboard (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  zone_id         text not null,
  user_id         uuid not null references auth.users,
  runner_name     text not null,
  crew_slug       text not null,
  avatar_url      text,
  week_key        text not null,
  total_km        numeric(8,2) default 0,
  total_ink       integer default 0,
  runs_count      integer default 0,
  rank            smallint,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(zone_id, user_id, week_key)
);

alter table zone_leaderboard enable row level security;
create policy "read_same_org" on zone_leaderboard for select
  using (organization_id = (select organization_id from user_profiles where id = auth.uid()));
create policy "upsert_own" on zone_leaderboard for insert
  with check (auth.uid() = user_id
    AND organization_id = (select organization_id from user_profiles where id = auth.uid()));
create policy "update_own" on zone_leaderboard for update using (auth.uid() = user_id);

create index idx_leaderboard_zone_week on zone_leaderboard(zone_id, week_key);
create index idx_leaderboard_crew_week on zone_leaderboard(crew_slug, week_key);

-- GPS traces of completed runs
create table if not exists run_logs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id         uuid not null references auth.users,
  crew_slug       text not null,
  zone_id         text,
  started_at      timestamptz not null,
  finished_at     timestamptz not null,
  total_km        numeric(8,2) not null,
  total_meters    integer not null,
  elapsed_ms      integer not null,
  night_run       boolean default false,
  route           geography(LineString, 4326),
  touched_spots   text[] default '{}',
  week_key        text not null,
  created_at      timestamptz default now()
);

alter table run_logs enable row level security;
create policy "read_own" on run_logs for select using (auth.uid() = user_id);
create policy "insert_own" on run_logs for insert
  with check (auth.uid() = user_id
    AND organization_id = (select organization_id from user_profiles where id = auth.uid()));

create index idx_run_logs_user_week on run_logs(user_id, week_key);
create index idx_run_logs_route on run_logs using gist(route);

-- Weekly territory snapshots for history timeline
create table if not exists territory_snapshots (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id         uuid not null references auth.users,
  week_key        text not null,
  zone_id         text not null,
  ink_value       integer not null,
  ownership_pct   numeric(4,3) not null,
  dominant_crew   text,
  created_at      timestamptz default now(),
  unique(user_id, week_key, zone_id)
);

alter table territory_snapshots enable row level security;
create policy "read_own" on territory_snapshots for select using (auth.uid() = user_id);
create policy "insert_own" on territory_snapshots for insert
  with check (auth.uid() = user_id);

create index idx_territory_user_week on territory_snapshots(user_id, week_key);

-- User preferences (theme, etc.)
create table if not exists user_preferences (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id         uuid not null references auth.users,
  key             text not null,
  value           jsonb not null,
  updated_at      timestamptz default now(),
  unique(user_id, key)
);

alter table user_preferences enable row level security;
create policy "read_own" on user_preferences for select using (auth.uid() = user_id);
create policy "upsert_own" on user_preferences for insert
  with check (auth.uid() = user_id);
create policy "update_own" on user_preferences for update using (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
git add apps/crew-running/supabase/migrations/001_map_enhancements.sql
git commit -m "feat(crew-running): Supabase migration — leaderboard, run_logs, snapshots, prefs"
```

---

## Phase 2: Rankings + Crew Cards (Priority)

### Task 4: Leaderboard Hook

**Files:**
- Create: `apps/crew-running/hooks/useLeaderboard.ts`
- Test: `apps/crew-running/hooks/__tests__/useLeaderboard.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// hooks/__tests__/useLeaderboard.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useZoneLeaderboard, useCrewTopRunners } from '../useLeaderboard';

vi.mock('../../services/supabaseClient', () => ({
  getSupabase: () => null,
}));

describe('useZoneLeaderboard', () => {
  it('returns empty array when Supabase unavailable', () => {
    const { result } = renderHook(() => useZoneLeaderboard('centro', '2026-W22'));
    expect(result.current.entries).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});

describe('useCrewTopRunners', () => {
  it('returns empty array when Supabase unavailable', () => {
    const { result } = renderHook(() => useCrewTopRunners('east-burners', '2026-W22', 3));
    expect(result.current.entries).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/crew-running && npx vitest run hooks/__tests__/useLeaderboard.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// hooks/useLeaderboard.ts
import { useEffect, useState } from 'react';
import { getSupabase } from '../services/supabaseClient';

export interface LeaderboardEntry {
  userId: string;
  runnerName: string;
  crewSlug: string;
  avatarUrl?: string;
  totalKm: number;
  totalInk: number;
  runsCount: number;
  rank: number;
}

const mapRow = (row: Record<string, unknown>): LeaderboardEntry => ({
  userId: row.user_id as string,
  runnerName: row.runner_name as string,
  crewSlug: row.crew_slug as string,
  avatarUrl: (row.avatar_url as string) || undefined,
  totalKm: Number(row.total_km),
  totalInk: Number(row.total_ink),
  runsCount: Number(row.runs_count),
  rank: Number(row.rank),
});

export const useZoneLeaderboard = (zoneId: string, weekKey: string) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setEntries([]); return; }
    setLoading(true);
    sb.from('zone_leaderboard')
      .select('*')
      .eq('zone_id', zoneId)
      .eq('week_key', weekKey)
      .order('rank', { ascending: true })
      .limit(10)
      .then(({ data }) => {
        setEntries((data ?? []).map(mapRow));
        setLoading(false);
      });
  }, [zoneId, weekKey]);

  return { entries, loading };
};

export const useCrewTopRunners = (crewSlug: string, weekKey: string, limit = 3) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setEntries([]); return; }
    setLoading(true);
    sb.from('zone_leaderboard')
      .select('*')
      .eq('crew_slug', crewSlug)
      .eq('week_key', weekKey)
      .order('total_ink', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        setEntries((data ?? []).map(mapRow));
        setLoading(false);
      });
  }, [crewSlug, weekKey, limit]);

  return { entries, loading };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/crew-running && npx vitest run hooks/__tests__/useLeaderboard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/hooks/useLeaderboard.ts apps/crew-running/hooks/__tests__/useLeaderboard.test.ts
git commit -m "feat(crew-running): leaderboard query hooks with Supabase fallback"
```

---

### Task 5: ZoneLeaderboard Component

**Files:**
- Create: `apps/crew-running/components/map/ZoneLeaderboard.tsx`
- Test: `apps/crew-running/components/map/__tests__/ZoneLeaderboard.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// components/map/__tests__/ZoneLeaderboard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZoneLeaderboard } from '../ZoneLeaderboard';

vi.mock('../../../hooks/useLeaderboard', () => ({
  useZoneLeaderboard: () => ({
    entries: [
      { userId: 'u1', runnerName: 'Ana', crewSlug: 'east-burners', totalKm: 12.4, totalInk: 340, runsCount: 5, rank: 1 },
      { userId: 'u2', runnerName: 'Beto', crewSlug: 'downtown-rush', totalKm: 8.7, totalInk: 210, runsCount: 3, rank: 2 },
    ],
    loading: false,
  }),
}));

describe('ZoneLeaderboard', () => {
  it('renders ranked runners', () => {
    render(<ZoneLeaderboard zoneId="centro" weekKey="2026-W22" currentUserId="u3" />);
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('Beto')).toBeTruthy();
    expect(screen.getByText('12.4 km')).toBeTruthy();
  });

  it('highlights current user row', () => {
    render(<ZoneLeaderboard zoneId="centro" weekKey="2026-W22" currentUserId="u1" />);
    const row = screen.getByText('Ana').closest('[data-is-self]');
    expect(row?.getAttribute('data-is-self')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/crew-running && npx vitest run components/map/__tests__/ZoneLeaderboard.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// components/map/ZoneLeaderboard.tsx
import React from 'react';
import { getCrewBySlug } from '../../data/crews';
import { useZoneLeaderboard } from '../../hooks/useLeaderboard';

interface Props {
  zoneId: string;
  weekKey: string;
  currentUserId: string;
}

export const ZoneLeaderboard: React.FC<Props> = ({ zoneId, weekKey, currentUserId }) => {
  const { entries, loading } = useZoneLeaderboard(zoneId, weekKey);

  if (loading) return <div className="zone-leaderboard__loading">Carregando ranking...</div>;

  if (entries.length === 0) {
    return <p className="zone-leaderboard__empty">Nenhum runner nesta zona esta semana.</p>;
  }

  return (
    <div className="zone-leaderboard">
      <h4 className="zone-leaderboard__title">RANKING DA ZONA</h4>
      <ol className="zone-leaderboard__list">
        {entries.map((entry) => {
          const crew = getCrewBySlug(entry.crewSlug);
          const isSelf = entry.userId === currentUserId;
          return (
            <li
              key={entry.userId}
              className={`zone-leaderboard__row ${isSelf ? 'is-self' : ''}`}
              data-is-self={isSelf}
              style={{ '--crew-accent': crew.accent } as React.CSSProperties}
            >
              <span className="zone-leaderboard__rank">{entry.rank}</span>
              <img src={crew.assets.badge} alt="" className="zone-leaderboard__badge" aria-hidden />
              <span className="zone-leaderboard__name">{entry.runnerName}</span>
              <span className="zone-leaderboard__km">{entry.totalKm} km</span>
              <span className="zone-leaderboard__ink">{entry.totalInk} tinta</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/crew-running && npx vitest run components/map/__tests__/ZoneLeaderboard.test.tsx`
Expected: PASS

- [ ] **Step 5: Add CSS for ZoneLeaderboard**

Append to `apps/crew-running/index.css` after the `.crew-sheet` styles:

```css
/* --- Zone Leaderboard --- */
.zone-leaderboard__title { font-family: var(--font-display); font-size: 0.75rem; letter-spacing: 0.12em; margin-bottom: 12px; opacity: 0.7; }
.zone-leaderboard__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.zone-leaderboard__row { display: grid; grid-template-columns: 28px 28px 1fr auto auto; align-items: center; gap: 8px; padding: 8px; border-radius: 6px; background: rgba(255,255,255,0.03); }
.zone-leaderboard__row.is-self { background: rgba(var(--crew-accent-rgb, 255,255,255), 0.12); outline: 1px solid var(--crew-accent, #fff); }
.zone-leaderboard__rank { font-family: var(--font-display); font-size: 0.9rem; text-align: center; }
.zone-leaderboard__badge { width: 24px; height: 24px; border-radius: 50%; }
.zone-leaderboard__name { font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.zone-leaderboard__km { font-size: 0.75rem; opacity: 0.7; }
.zone-leaderboard__ink { font-size: 0.75rem; opacity: 0.5; }
.zone-leaderboard__empty { font-size: 0.8rem; opacity: 0.5; text-align: center; padding: 24px 0; }
.zone-leaderboard__loading { font-size: 0.8rem; opacity: 0.5; text-align: center; padding: 24px 0; }
```

- [ ] **Step 6: Commit**

```bash
git add apps/crew-running/components/map/ZoneLeaderboard.tsx apps/crew-running/components/map/__tests__/ZoneLeaderboard.test.tsx apps/crew-running/index.css
git commit -m "feat(crew-running): ZoneLeaderboard component with ranking display"
```

---

### Task 6: Wire ZoneLeaderboard into ZoneSheet

**Files:**
- Modify: `apps/crew-running/components/map/ZoneSheet.tsx`
- Modify: `apps/crew-running/components/map/MapStage.tsx` (pass currentUserId)

- [ ] **Step 1: Add "VER RANKING" button and ZoneLeaderboard to ZoneSheet**

In `ZoneSheet.tsx`, add imports and a ranking section. The component needs `currentUserId` prop added:

```typescript
// Add to ZoneSheet.tsx imports
import { ZoneLeaderboard } from './ZoneLeaderboard';
import { isoWeekKey } from '../../data/gamification';
```

Add `currentUserId: string` to Props interface.

Add before the closing `</MapBottomSheet>`:

```tsx
<div className="zone-sheet__ranking">
  <ZoneLeaderboard
    zoneId={zoneId}
    weekKey={isoWeekKey(new Date())}
    currentUserId={currentUserId}
  />
</div>
```

- [ ] **Step 2: Pass currentUserId from MapStage to ZoneSheet**

In `MapStage.tsx`, the `selfUserId` is already computed at line 64. Pass it to ZoneSheet:

```tsx
{sheet?.type === 'zone' && (
  <ZoneSheet
    zoneId={sheet.zoneId}
    progress={runnerProgress}
    friends={friends}
    currentUserId={selfUserId}
    open
    onClose={closeSheet}
  />
)}
```

- [ ] **Step 3: Verify typecheck**

Run: `cd apps/crew-running && npx --no-install tsc --noEmit 2>&1 | grep -v "sheets.test\|RunSummary\|runHistoryUpdate"`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add apps/crew-running/components/map/ZoneSheet.tsx apps/crew-running/components/map/MapStage.tsx
git commit -m "feat(crew-running): wire ZoneLeaderboard into ZoneSheet"
```

---

### Task 7: Enrich CrewSheet with Leader + Top 3

**Files:**
- Modify: `apps/crew-running/components/map/CrewSheet.tsx`
- Test: `apps/crew-running/components/map/__tests__/CrewSheet.test.tsx` (update existing or create)

- [ ] **Step 1: Add imports and top-3 query to CrewSheet**

```typescript
// Add to CrewSheet.tsx imports
import { useCrewTopRunners } from '../../hooks/useLeaderboard';
import { isoWeekKey } from '../../data/gamification';
```

- [ ] **Step 2: Add leader + top 3 section after the hero section**

After the `crew-sheet__stats` div (line ~57), add:

```tsx
<div className="crew-sheet__section">
  <div className="crew-sheet__leader">
    <img src={crew.assets.leader} alt={`Líder ${crew.name}`} className="crew-sheet__leader-img" />
    <div>
      <span className="crew-sheet__section-title">LÍDER DA CREW</span>
      <strong className="crew-sheet__leader-name">{crew.name}</strong>
    </div>
  </div>
</div>

<CrewTopThree crewSlug={crewSlug} accent={crew.accent} />
```

- [ ] **Step 3: Create CrewTopThree sub-component in same file**

```typescript
const CrewTopThree: React.FC<{ crewSlug: string; accent: string }> = ({ crewSlug, accent }) => {
  const weekKey = useMemo(() => isoWeekKey(new Date()), []);
  const { entries, loading } = useCrewTopRunners(crewSlug, weekKey, 3);

  if (loading) return <div className="crew-sheet__section"><p className="crew-sheet__empty">Carregando...</p></div>;
  if (entries.length === 0) return null;

  return (
    <div className="crew-sheet__section">
      <h4 className="crew-sheet__section-title">TOP 3 DA SEMANA</h4>
      <ol className="crew-sheet__top-list">
        {entries.map((entry, idx) => (
          <li key={entry.userId} className="crew-sheet__top-row">
            <span className="crew-sheet__top-rank">{idx + 1}</span>
            <img
              src={`/crews/${crewSlug}/members/member_${idx + 1}.png`}
              alt=""
              className="crew-sheet__top-avatar"
              aria-hidden
            />
            <span className="crew-sheet__top-name">{entry.runnerName}</span>
            <span className="crew-sheet__top-km">{entry.totalKm} km</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
```

- [ ] **Step 4: Add CSS for leader and top-3 sections**

Append to `index.css` after crew-sheet styles:

```css
/* --- Crew Sheet enrichments --- */
.crew-sheet__leader { display: flex; align-items: center; gap: 12px; padding: 12px 0; }
.crew-sheet__leader-img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; border: 2px solid var(--sheet-accent); }
.crew-sheet__leader-name { display: block; font-family: var(--font-display); font-size: 0.95rem; }
.crew-sheet__top-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.crew-sheet__top-row { display: grid; grid-template-columns: 24px 36px 1fr auto; align-items: center; gap: 8px; padding: 6px 0; }
.crew-sheet__top-rank { font-family: var(--font-display); font-size: 0.85rem; text-align: center; }
.crew-sheet__top-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.crew-sheet__top-name { font-size: 0.85rem; }
.crew-sheet__top-km { font-size: 0.75rem; opacity: 0.6; }
```

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/components/map/CrewSheet.tsx apps/crew-running/index.css
git commit -m "feat(crew-running): enriched CrewSheet with leader portrait + top 3 runners"
```

---

## Phase 3: Map Theming

### Task 8: Theme Data + Storage

**Files:**
- Create: `apps/crew-running/data/mapThemes.ts`
- Create: `apps/crew-running/services/themeStorage.ts`
- Test: `apps/crew-running/services/__tests__/themeStorage.test.ts`
- Test: `apps/crew-running/data/__tests__/mapThemes.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// data/__tests__/mapThemes.test.ts
import { describe, it, expect } from 'vitest';
import { DARK_THEME, LIGHT_THEME, getThemeById, type MapTheme } from '../mapThemes';

describe('mapThemes', () => {
  it('DARK_THEME has alidade_smooth_dark basemap', () => {
    expect(DARK_THEME.basemapUrl).toContain('alidade_smooth_dark');
  });

  it('LIGHT_THEME has alidade_smooth basemap (not dark)', () => {
    expect(LIGHT_THEME.basemapUrl).toContain('alidade_smooth');
    expect(LIGHT_THEME.basemapUrl).not.toContain('dark');
  });

  it('getThemeById returns correct theme', () => {
    expect(getThemeById('dark')).toBe(DARK_THEME);
    expect(getThemeById('light')).toBe(LIGHT_THEME);
  });

  it('both themes have all required fields', () => {
    const check = (t: MapTheme) => {
      expect(t.zone.neutralOutlineColor).toBeTruthy();
      expect(t.zone.fillOpacityRange).toHaveLength(2);
      expect(t.spot.strokeColor).toBeTruthy();
      expect(t.hud.background).toBeTruthy();
      expect(t.ui.chrome).toBeTruthy();
    };
    check(DARK_THEME);
    check(LIGHT_THEME);
  });
});
```

```typescript
// services/__tests__/themeStorage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getThemePreference, saveThemePreference } from '../themeStorage';

describe('themeStorage', () => {
  beforeEach(() => window.localStorage.clear());

  it('defaults to dark', () => {
    expect(getThemePreference()).toBe('dark');
  });

  it('saves and reads back', () => {
    saveThemePreference('light');
    expect(getThemePreference()).toBe('light');
  });

  it('falls back to dark on corrupted value', () => {
    window.localStorage.setItem('crewMapTheme', '"bogus"');
    expect(getThemePreference()).toBe('dark');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/crew-running && npx vitest run data/__tests__/mapThemes.test.ts services/__tests__/themeStorage.test.ts`
Expected: FAIL

- [ ] **Step 3: Write mapThemes.ts**

```typescript
// data/mapThemes.ts
export type ThemeId = 'dark' | 'light';

export interface MapTheme {
  id: ThemeId;
  label: string;
  basemapUrl: string;
  zone: {
    neutralOutlineColor: string;
    neutralOutlineWidth: number;
    fillOpacityRange: [number, number];
    conqueredOutlineWidth: number;
  };
  spot: {
    strokeColor: string;
    fillColor: string;
    activeColor: string;
  };
  signal: { color: string; opacity: number };
  roads: { color: string; opacity: number };
  trail: { opacity: number; width: number };
  history: {
    routeOpacityRecent: number;
    routeOpacityOld: number;
    badgePinBackground: string;
  };
  hud: { background: string; text: string; accent: string; border: string };
  ui: {
    chrome: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    overlayBackground: string;
  };
}

const STADIA = 'https://tiles.stadiamaps.com/styles';

export const DARK_THEME: MapTheme = {
  id: 'dark',
  label: 'Noite',
  basemapUrl: `${STADIA}/alidade_smooth_dark.json`,
  zone: { neutralOutlineColor: '#ffffff', neutralOutlineWidth: 1.5, fillOpacityRange: [0.08, 0.35], conqueredOutlineWidth: 3 },
  spot: { strokeColor: '#fff', fillColor: 'transparent', activeColor: '#fff' },
  signal: { color: '#C9302C', opacity: 0.6 },
  roads: { color: '#555', opacity: 0.3 },
  trail: { opacity: 0.85, width: 3 },
  history: { routeOpacityRecent: 0.7, routeOpacityOld: 0.15, badgePinBackground: 'rgba(0,0,0,0.8)' },
  hud: { background: 'rgba(0,0,0,0.85)', text: '#e8e8e8', accent: 'var(--crew-accent)', border: 'rgba(255,255,255,0.1)' },
  ui: { chrome: '#0a0a0a', surface: '#141414', text: '#e8e8e8', textMuted: '#888', border: 'rgba(255,255,255,0.08)', overlayBackground: 'rgba(0,0,0,0.92)' },
};

export const LIGHT_THEME: MapTheme = {
  id: 'light',
  label: 'Dia',
  basemapUrl: `${STADIA}/alidade_smooth.json`,
  zone: { neutralOutlineColor: '#1a1a1a', neutralOutlineWidth: 1.5, fillOpacityRange: [0.12, 0.45], conqueredOutlineWidth: 3 },
  spot: { strokeColor: '#333', fillColor: 'transparent', activeColor: '#111' },
  signal: { color: '#E04040', opacity: 0.7 },
  roads: { color: '#bbb', opacity: 0.35 },
  trail: { opacity: 0.8, width: 3 },
  history: { routeOpacityRecent: 0.65, routeOpacityOld: 0.12, badgePinBackground: 'rgba(255,255,255,0.9)' },
  hud: { background: 'rgba(255,255,255,0.92)', text: '#1a1a1a', accent: 'var(--crew-accent)', border: 'rgba(0,0,0,0.08)' },
  ui: { chrome: '#f5f5f0', surface: '#ffffff', text: '#1a1a1a', textMuted: '#666', border: 'rgba(0,0,0,0.08)', overlayBackground: 'rgba(255,255,255,0.95)' },
};

export const getThemeById = (id: ThemeId): MapTheme => (id === 'light' ? LIGHT_THEME : DARK_THEME);
```

- [ ] **Step 4: Write themeStorage.ts**

```typescript
// services/themeStorage.ts
import { canUseStorage } from './storageBase';
import type { ThemeId } from '../data/mapThemes';

const KEY = 'crewMapTheme';

const isValid = (v: unknown): v is ThemeId => v === 'dark' || v === 'light';

export const getThemePreference = (): ThemeId => {
  if (!canUseStorage()) return 'dark';
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
      return 'dark';
    }
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : 'dark';
  } catch {
    return 'dark';
  }
};

export const saveThemePreference = (theme: ThemeId): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(theme));
    document.documentElement.setAttribute('data-theme', theme);
  } catch { /* ignored */ }
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd apps/crew-running && npx vitest run data/__tests__/mapThemes.test.ts services/__tests__/themeStorage.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/crew-running/data/mapThemes.ts apps/crew-running/data/__tests__/mapThemes.test.ts apps/crew-running/services/themeStorage.ts apps/crew-running/services/__tests__/themeStorage.test.ts
git commit -m "feat(crew-running): map theme definitions + theme preference storage"
```

---

### Task 9: Theme-Aware Layer Factories

**Files:**
- Create: `apps/crew-running/data/mapLayerSpecs.ts`
- Test: `apps/crew-running/data/__tests__/mapLayerSpecs.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// data/__tests__/mapLayerSpecs.test.ts
import { describe, it, expect } from 'vitest';
import { buildZoneFill, buildZoneOutline, buildRoadsLine, buildSignalLine, buildSpotCircle } from '../mapLayerSpecs';
import { DARK_THEME, LIGHT_THEME } from '../mapThemes';

describe('mapLayerSpecs', () => {
  it('buildZoneFill uses theme fillOpacityRange', () => {
    const dark = buildZoneFill(DARK_THEME);
    const light = buildZoneFill(LIGHT_THEME);
    const darkPaint = dark.paint as Record<string, unknown>;
    const lightPaint = light.paint as Record<string, unknown>;
    const darkOpacity = darkPaint['fill-opacity'] as unknown[];
    const lightOpacity = lightPaint['fill-opacity'] as unknown[];
    expect(darkOpacity[4]).toBe(0.08);
    expect(lightOpacity[4]).toBe(0.12);
  });

  it('buildZoneOutline uses theme outline color', () => {
    const dark = buildZoneOutline(DARK_THEME);
    const light = buildZoneOutline(LIGHT_THEME);
    expect(JSON.stringify(dark.paint)).toContain('#ffffff');
    expect(JSON.stringify(light.paint)).toContain('#1a1a1a');
  });

  it('buildRoadsLine uses theme roads color', () => {
    const dark = buildRoadsLine(DARK_THEME);
    expect((dark.paint as Record<string, unknown>)['line-color']).toBe('#555');
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `cd apps/crew-running && npx vitest run data/__tests__/mapLayerSpecs.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// data/mapLayerSpecs.ts
import type { FillLayerSpecification, LineLayerSpecification, CircleLayerSpecification } from 'maplibre-gl';
import type { MapTheme } from './mapThemes';

export const buildZoneFill = (theme: MapTheme): FillLayerSpecification => ({
  id: 'sp-zone-fill',
  type: 'fill',
  source: 'sp-zones',
  paint: {
    'fill-color': ['get', 'color'],
    'fill-opacity': [
      'interpolate', ['linear'], ['get', 'ownership'],
      0, theme.zone.fillOpacityRange[0],
      0.4, (theme.zone.fillOpacityRange[0] + theme.zone.fillOpacityRange[1]) / 2,
      1, theme.zone.fillOpacityRange[1],
    ],
  },
});

export const buildZoneOutline = (theme: MapTheme): LineLayerSpecification => ({
  id: 'sp-zone-outline',
  type: 'line',
  source: 'sp-zones',
  paint: {
    'line-color': ['case',
      ['has', 'dominantCrew'], ['get', 'crewColor'],
      theme.zone.neutralOutlineColor,
    ],
    'line-width': ['case',
      ['get', 'conquered'], theme.zone.conqueredOutlineWidth,
      theme.zone.neutralOutlineWidth,
    ],
    'line-opacity': ['case', ['get', 'active'], 0.9, 0.5],
  },
});

export const buildSpotCircle = (theme: MapTheme): CircleLayerSpecification => ({
  id: 'sp-spot-circle',
  type: 'circle',
  source: 'sp-spots',
  paint: {
    'circle-radius': 6,
    'circle-color': ['case', ['get', 'active'], theme.spot.activeColor, theme.spot.fillColor],
    'circle-stroke-color': theme.spot.strokeColor,
    'circle-stroke-width': 1.5,
    'circle-opacity': 0.85,
    'circle-stroke-opacity': 0.7,
  },
});

export const buildSignalLine = (theme: MapTheme): LineLayerSpecification => ({
  id: 'sp-signal-line',
  type: 'line',
  source: 'sp-signal',
  paint: {
    'line-color': theme.signal.color,
    'line-width': 2,
    'line-dasharray': [4, 3],
    'line-opacity': theme.signal.opacity,
  },
});

export const buildRoadsLine = (theme: MapTheme): LineLayerSpecification => ({
  id: 'sp-roads-line',
  type: 'line',
  source: 'sp-roads',
  paint: {
    'line-color': theme.roads.color,
    'line-width': 1,
    'line-opacity': theme.roads.opacity,
  },
});

export const buildTrailLine = (theme: MapTheme, trailColor: string): LineLayerSpecification => ({
  id: 'sp-trail-line',
  type: 'line',
  source: 'sp-trail',
  paint: {
    'line-color': trailColor,
    'line-width': theme.trail.width,
    'line-opacity': theme.trail.opacity,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/crew-running && npx vitest run data/__tests__/mapLayerSpecs.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/data/mapLayerSpecs.ts apps/crew-running/data/__tests__/mapLayerSpecs.test.ts
git commit -m "feat(crew-running): theme-aware MapLibre layer spec factories"
```

---

### Task 10: useMapTheme Hook + ThemeToggle Component

**Files:**
- Create: `apps/crew-running/hooks/useMapTheme.ts`
- Create: `apps/crew-running/components/map/ThemeToggle.tsx`

- [ ] **Step 1: Write useMapTheme hook**

```typescript
// hooks/useMapTheme.ts
import { useCallback, useState } from 'react';
import { getThemeById, type MapTheme, type ThemeId } from '../data/mapThemes';
import { getThemePreference, saveThemePreference } from '../services/themeStorage';

export const useMapTheme = () => {
  const [themeId, setThemeId] = useState<ThemeId>(() => getThemePreference());
  const theme: MapTheme = getThemeById(themeId);

  const toggle = useCallback(() => {
    const next: ThemeId = themeId === 'dark' ? 'light' : 'dark';
    saveThemePreference(next);
    setThemeId(next);
  }, [themeId]);

  return { theme, themeId, toggle };
};
```

- [ ] **Step 2: Write ThemeToggle component**

```typescript
// components/map/ThemeToggle.tsx
import React from 'react';
import type { ThemeId } from '../../data/mapThemes';

interface Props {
  themeId: ThemeId;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<Props> = ({ themeId, onToggle }) => (
  <button
    type="button"
    className="map-theme-toggle"
    onClick={onToggle}
    aria-label={themeId === 'dark' ? 'Mudar para modo dia' : 'Mudar para modo noite'}
  >
    <span className="map-theme-toggle__icon" aria-hidden>
      {themeId === 'dark' ? '☀' : '☾'}
    </span>
  </button>
);
```

- [ ] **Step 3: Add CSS**

```css
/* --- Theme Toggle --- */
.map-theme-toggle { position: absolute; top: 56px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--ui-border, rgba(255,255,255,0.1)); background: var(--ui-chrome, #0a0a0a); color: var(--ui-text, #e8e8e8); font-size: 1.1rem; display: grid; place-items: center; cursor: pointer; }
```

- [ ] **Step 4: Commit**

```bash
git add apps/crew-running/hooks/useMapTheme.ts apps/crew-running/components/map/ThemeToggle.tsx apps/crew-running/index.css
git commit -m "feat(crew-running): useMapTheme hook + ThemeToggle button"
```

---

### Task 11: Wire Theme into MapLibreCanvas + MapStage

**Files:**
- Modify: `apps/crew-running/components/map/MapLibreCanvas.tsx`
- Modify: `apps/crew-running/components/map/MapStage.tsx`
- Modify: `apps/crew-running/index.css` (add `[data-theme]` custom properties)

- [ ] **Step 1: Add `[data-theme]` CSS custom properties to index.css**

Add at the top of index.css, after the existing `:root` block (line ~53):

```css
:root, [data-theme="dark"] {
  --ui-chrome: #0a0a0a; --ui-surface: #141414; --ui-text: #e8e8e8;
  --ui-text-muted: #888; --ui-border: rgba(255,255,255,0.08);
  --ui-overlay-bg: rgba(0,0,0,0.92);
  --hud-bg: rgba(0,0,0,0.85); --hud-text: #e8e8e8; --hud-border: rgba(255,255,255,0.1);
}
[data-theme="light"] {
  --ui-chrome: #f5f5f0; --ui-surface: #ffffff; --ui-text: #1a1a1a;
  --ui-text-muted: #666; --ui-border: rgba(0,0,0,0.08);
  --ui-overlay-bg: rgba(255,255,255,0.95);
  --hud-bg: rgba(255,255,255,0.92); --hud-text: #1a1a1a; --hud-border: rgba(0,0,0,0.08);
}
```

- [ ] **Step 2: Add theme prop to MapLibreCanvas**

Add `theme?: MapTheme` to Props interface. Import `buildZoneFill, buildZoneOutline, buildRoadsLine, buildSignalLine, buildTrailLine` from `../../data/mapLayerSpecs`. Import `DARK_THEME` from `../../data/mapThemes`.

Replace hardcoded layer constants with `useMemo` calls:

```typescript
const activeTheme = theme ?? DARK_THEME;
const zoneFill = useMemo(() => buildZoneFill(activeTheme), [activeTheme]);
const zoneOutline = useMemo(() => buildZoneOutline(activeTheme), [activeTheme]);
const roadsLine = useMemo(() => buildRoadsLine(activeTheme), [activeTheme]);
const signalLine = useMemo(() => buildSignalLine(activeTheme), [activeTheme]);
const trailLine = useMemo(() => buildTrailLine(activeTheme, trailColor), [activeTheme, trailColor]);
```

Change `mapStyle={DEFAULT_STYLE}` to `mapStyle={activeTheme.basemapUrl}`.

Replace `<Layer {...ZONE_FILL} />` with `<Layer {...zoneFill} />` etc.

Remove the old hardcoded constants (ZONE_FILL, ZONE_OUTLINE, SPOT_CIRCLE, SIGNAL_LINE, ROADS_LINE, and the old trailLine useMemo).

- [ ] **Step 3: Wire theme into MapStage**

In `MapStage.tsx`, add the hook and pass theme:

```typescript
import { useMapTheme } from '../../hooks/useMapTheme';
import { ThemeToggle } from './ThemeToggle';
```

Inside component:

```typescript
const { theme, themeId, toggle: toggleTheme } = useMapTheme();
```

Pass to MapLibreCanvas: `theme={theme}`

Add ThemeToggle in the JSX (after HudOverlay):

```tsx
{!trackerActive && <ThemeToggle themeId={themeId} onToggle={toggleTheme} />}
```

- [ ] **Step 4: Typecheck**

Run: `cd apps/crew-running && npx --no-install tsc --noEmit 2>&1 | grep -v "sheets.test\|RunSummary\|runHistoryUpdate"`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/components/map/MapLibreCanvas.tsx apps/crew-running/components/map/MapStage.tsx apps/crew-running/index.css
git commit -m "feat(crew-running): wire dark/light theming into MapLibre + MapStage"
```

---

## Phase 4: History Layer

### Task 12: Extend Data Types for History

**Files:**
- Modify: `apps/crew-running/data/gamification.ts`
- Modify: `apps/crew-running/data/mapTypes.ts`
- Modify: `apps/crew-running/services/runnerProgressStorage.ts`
- Test: update existing tests

- [ ] **Step 1: Add BadgeUnlockEvent to gamification.ts**

After the `RunnerProgress` interface (line ~45):

```typescript
export interface BadgeUnlockEvent {
  badgeId: BadgeId;
  zoneId: string;
  unlockedAt: string;
  runId?: string;
}
```

Add to `RunnerProgress`:

```typescript
badgeUnlockEvents?: BadgeUnlockEvent[];
```

- [ ] **Step 2: Add HistorySubLayers to mapTypes.ts**

```typescript
export interface HistorySubLayers {
  routes: boolean;
  badges: boolean;
  territory: boolean;
}

export const DEFAULT_HISTORY_SUBLAYERS: HistorySubLayers = {
  routes: true,
  badges: true,
  territory: true,
};
```

- [ ] **Step 3: Update runnerProgressStorage.ts**

In `pick()` function, add:

```typescript
badgeUnlockEvents: Array.isArray(parsed.badgeUnlockEvents) ? parsed.badgeUnlockEvents : [],
```

In `DEFAULT`, add:

```typescript
badgeUnlockEvents: [],
```

In `isShape()`, add:

```typescript
(obj.badgeUnlockEvents === undefined || Array.isArray(obj.badgeUnlockEvents))
```

- [ ] **Step 4: Update badges.ts to accept zoneId**

Change `evaluateBadgeUnlocks` signature:

```typescript
export const evaluateBadgeUnlocks = (input: BadgeEvalInput, currentZoneId?: string): { badges: BadgeId[]; events: BadgeUnlockEvent[] } => {
  const owned = new Set(input.progress.badgeUnlocks);
  const badges: BadgeId[] = [];
  const events: BadgeUnlockEvent[] = [];
  (Object.keys(CONDITIONS) as BadgeId[]).forEach((id) => {
    if (owned.has(id)) return;
    if (CONDITIONS[id](input)) {
      badges.push(id);
      events.push({
        badgeId: id,
        zoneId: currentZoneId ?? 'unknown',
        unlockedAt: new Date().toISOString(),
      });
    }
  });
  return { badges, events };
};
```

- [ ] **Step 5: Update callers of evaluateBadgeUnlocks**

Search for all callers and update to destructure `{ badges, events }` instead of the old `BadgeId[]` return.

- [ ] **Step 6: Typecheck + test**

Run: `cd apps/crew-running && npx --no-install tsc --noEmit 2>&1 | grep -v "sheets.test\|RunSummary\|runHistoryUpdate"`
Expected: No new errors

- [ ] **Step 7: Commit**

```bash
git add apps/crew-running/data/gamification.ts apps/crew-running/data/mapTypes.ts apps/crew-running/data/badges.ts apps/crew-running/services/runnerProgressStorage.ts
git commit -m "feat(crew-running): badge unlock events with zone+timestamp, history sublayer types"
```

---

### Task 13: Run Log Storage (Offline-First)

**Files:**
- Create: `apps/crew-running/services/runLogStorage.ts`
- Test: `apps/crew-running/services/__tests__/runLogStorage.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// services/__tests__/runLogStorage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('runLogStorage', () => {
  beforeEach(() => window.localStorage.clear());

  it('saves and retrieves a run log', async () => {
    const { saveRunLog, getRunLogs } = await import('../runLogStorage');
    saveRunLog({
      id: 'r1', crewSlug: 'east-burners', zoneId: 'leste',
      startedAt: '2026-05-28T10:00:00Z', finishedAt: '2026-05-28T10:30:00Z',
      totalKm: 5.2, totalMeters: 5200, elapsedMs: 1800000,
      nightRun: false, route: [{ lng: -46.63, lat: -23.55 }, { lng: -46.64, lat: -23.56 }],
      touchedSpots: ['s1'], weekKey: '2026-W22', synced: false,
    });
    const logs = getRunLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].totalKm).toBe(5.2);
  });

  it('caps at 50 logs, removing oldest synced first', async () => {
    const { saveRunLog, getRunLogs } = await import('../runLogStorage');
    for (let i = 0; i < 52; i++) {
      saveRunLog({
        id: `r${i}`, crewSlug: 'east-burners', zoneId: 'leste',
        startedAt: `2026-05-${String(i % 28 + 1).padStart(2, '0')}T10:00:00Z`,
        finishedAt: `2026-05-${String(i % 28 + 1).padStart(2, '0')}T10:30:00Z`,
        totalKm: 5, totalMeters: 5000, elapsedMs: 1800000,
        nightRun: false, route: [], touchedSpots: [], weekKey: '2026-W22',
        synced: i < 10,
      });
    }
    expect(getRunLogs().length).toBeLessThanOrEqual(50);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Write implementation**

```typescript
// services/runLogStorage.ts
import { canUseStorage } from './storageBase';
import type { LngLat } from '../data/spLiveMap';

const KEY = 'crewRunLogs';
const MAX_LOGS = 50;

export interface LocalRunLog {
  id: string;
  crewSlug: string;
  zoneId?: string;
  startedAt: string;
  finishedAt: string;
  totalKm: number;
  totalMeters: number;
  elapsedMs: number;
  nightRun: boolean;
  route: LngLat[];
  touchedSpots: string[];
  weekKey: string;
  synced: boolean;
}

export const getRunLogs = (): LocalRunLog[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

export const saveRunLog = (log: LocalRunLog): void => {
  if (!canUseStorage()) return;
  const logs = getRunLogs();
  logs.push(log);
  if (logs.length > MAX_LOGS) {
    const syncedIdx = logs.findIndex((l) => l.synced);
    if (syncedIdx >= 0) logs.splice(syncedIdx, 1);
    else logs.shift();
  }
  try { window.localStorage.setItem(KEY, JSON.stringify(logs)); } catch { /* ignored */ }
};

export const markRunLogSynced = (id: string): void => {
  if (!canUseStorage()) return;
  const logs = getRunLogs();
  const log = logs.find((l) => l.id === id);
  if (log) log.synced = true;
  try { window.localStorage.setItem(KEY, JSON.stringify(logs)); } catch { /* ignored */ }
};

export const getUnsyncedRunLogs = (): LocalRunLog[] => getRunLogs().filter((l) => !l.synced);
```

- [ ] **Step 4: Run test, verify pass**

- [ ] **Step 5: Commit**

```bash
git add apps/crew-running/services/runLogStorage.ts apps/crew-running/services/__tests__/runLogStorage.test.ts
git commit -m "feat(crew-running): offline-first run log storage with 50-entry cap"
```

---

### Task 14: History Sublayer Components

**Files:**
- Create: `apps/crew-running/components/map/HistoryToolbar.tsx`
- Create: `apps/crew-running/components/map/HistoryRoutesLayer.tsx`
- Create: `apps/crew-running/components/map/HistoryBadgesLayer.tsx`
- Modify: `apps/crew-running/services/mapLayerStorage.ts` (add history sublayer persistence)

- [ ] **Step 1: Extend mapLayerStorage.ts with history sublayers**

Add to `mapLayerStorage.ts`:

```typescript
import type { HistorySubLayers } from '../data/mapTypes';
import { DEFAULT_HISTORY_SUBLAYERS } from '../data/mapTypes';

const HISTORY_KEY = 'crewHistorySublayers';

export const getHistorySublayerPrefs = (): HistorySubLayers => {
  if (!canUseStorage()) return DEFAULT_HISTORY_SUBLAYERS;
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return DEFAULT_HISTORY_SUBLAYERS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_HISTORY_SUBLAYERS;
    return {
      routes: typeof parsed.routes === 'boolean' ? parsed.routes : true,
      badges: typeof parsed.badges === 'boolean' ? parsed.badges : true,
      territory: typeof parsed.territory === 'boolean' ? parsed.territory : true,
    };
  } catch { return DEFAULT_HISTORY_SUBLAYERS; }
};

export const saveHistorySublayerPrefs = (prefs: HistorySubLayers): void => {
  if (!canUseStorage()) return;
  try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(prefs)); } catch { /* ignored */ }
};
```

- [ ] **Step 2: Write HistoryToolbar**

```typescript
// components/map/HistoryToolbar.tsx
import React from 'react';
import type { HistorySubLayers } from '../../data/mapTypes';

interface Props {
  sublayers: HistorySubLayers;
  onToggle: (key: keyof HistorySubLayers) => void;
}

const LABELS: Array<{ key: keyof HistorySubLayers; label: string }> = [
  { key: 'routes', label: 'Rotas' },
  { key: 'badges', label: 'Conquistas' },
  { key: 'territory', label: 'Terr.' },
];

export const HistoryToolbar: React.FC<Props> = ({ sublayers, onToggle }) => (
  <div className="history-toolbar" role="toolbar" aria-label="Sublayers história">
    {LABELS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        className={`map-layer-chip${sublayers[key] ? ' is-on' : ''}`}
        aria-pressed={sublayers[key]}
        onClick={() => onToggle(key)}
      >
        <span className="map-layer-dot" aria-hidden>{sublayers[key] ? '●' : '○'}</span>
        <span className="map-layer-label">{label}</span>
      </button>
    ))}
  </div>
);
```

- [ ] **Step 3: Write HistoryRoutesLayer**

```typescript
// components/map/HistoryRoutesLayer.tsx
import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import type { LineLayerSpecification } from 'maplibre-gl';
import type { LocalRunLog } from '../../services/runLogStorage';
import type { MapTheme } from '../../data/mapThemes';
import { getCrewBySlug } from '../../data/crews';

interface Props {
  runLogs: LocalRunLog[];
  theme: MapTheme;
}

const MS_PER_DAY = 86400000;

export const HistoryRoutesLayer: React.FC<Props> = ({ runLogs, theme }) => {
  const now = Date.now();

  const layers = useMemo(() => {
    return runLogs
      .filter((log) => log.route.length >= 2)
      .slice(0, 20)
      .map((log) => {
        const ageDays = (now - new Date(log.startedAt).getTime()) / MS_PER_DAY;
        const opacity = ageDays < 7 ? theme.history.routeOpacityRecent
          : ageDays < 30 ? 0.4 : theme.history.routeOpacityOld;
        const crew = getCrewBySlug(log.crewSlug);
        const geojson: GeoJSON.Feature = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: log.route.map((p) => [p.lng, p.lat]),
          },
        };
        const spec: LineLayerSpecification = {
          id: `history-route-${log.id}`,
          type: 'line',
          source: `history-route-src-${log.id}`,
          paint: { 'line-color': crew.accent, 'line-width': 2, 'line-opacity': opacity },
        };
        return { log, geojson, spec };
      });
  }, [runLogs, theme, now]);

  return (
    <>
      {layers.map(({ log, geojson, spec }) => (
        <Source key={log.id} id={spec.source as string} type="geojson" data={geojson}>
          <Layer {...spec} />
        </Source>
      ))}
    </>
  );
};
```

- [ ] **Step 4: Write HistoryBadgesLayer**

```typescript
// components/map/HistoryBadgesLayer.tsx
import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import type { BadgeUnlockEvent } from '../../data/gamification';
import { getZoneById } from '../../data/spLiveMap';
import { getCrewBySlug } from '../../data/crews';
import type { MapTheme } from '../../data/mapThemes';

interface Props {
  events: BadgeUnlockEvent[];
  crewSlug?: string;
  theme: MapTheme;
}

export const HistoryBadgesLayer: React.FC<Props> = ({ events, crewSlug, theme }) => {
  return (
    <>
      {events.map((event) => {
        const zone = getZoneById(event.zoneId as never);
        if (!zone) return null;
        const crew = getCrewBySlug(crewSlug ?? zone.crewSlug);
        return (
          <Marker
            key={`${event.badgeId}-${event.unlockedAt}`}
            longitude={zone.center.lng}
            latitude={zone.center.lat}
            anchor="center"
          >
            <div
              className="history-badge-pin"
              style={{ background: theme.history.badgePinBackground }}
              aria-label={`${event.badgeId} — ${new Date(event.unlockedAt).toLocaleDateString('pt-BR')}`}
            >
              <img
                src={`/crews/${crew.slug}/achievements/achievement_1.png`}
                alt=""
                aria-hidden
                className="history-badge-pin__icon"
              />
            </div>
          </Marker>
        );
      })}
    </>
  );
};
```

- [ ] **Step 5: Add CSS for history components**

```css
/* --- History Toolbar --- */
.history-toolbar { display: flex; gap: 6px; position: absolute; bottom: 210px; left: 12px; right: 12px; z-index: 8; }

/* --- History Badge Pin --- */
.history-badge-pin { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; border: 2px solid var(--crew-accent, #fff); }
.history-badge-pin__icon { width: 28px; height: 28px; border-radius: 50%; }
```

- [ ] **Step 6: Commit**

```bash
git add apps/crew-running/components/map/HistoryToolbar.tsx apps/crew-running/components/map/HistoryRoutesLayer.tsx apps/crew-running/components/map/HistoryBadgesLayer.tsx apps/crew-running/services/mapLayerStorage.ts apps/crew-running/index.css
git commit -m "feat(crew-running): history sublayer components — routes, badges, toolbar"
```

---

### Task 15: Wire History Layer into MapStage

**Files:**
- Modify: `apps/crew-running/components/map/MapStage.tsx`

- [ ] **Step 1: Import history components and hooks**

```typescript
import { HistoryToolbar } from './HistoryToolbar';
import { HistoryRoutesLayer } from './HistoryRoutesLayer';
import { HistoryBadgesLayer } from './HistoryBadgesLayer';
import { getHistorySublayerPrefs, saveHistorySublayerPrefs } from '../../services/mapLayerStorage';
import { getRunLogs } from '../../services/runLogStorage';
import type { HistorySubLayers } from './mapTypes';
```

- [ ] **Step 2: Add history state**

```typescript
const [historySublayers, setHistorySublayers] = useState<HistorySubLayers>(() => getHistorySublayerPrefs());
const runLogs = useMemo(() => layers.history ? getRunLogs() : [], [layers.history]);
const badgeEvents = runnerProgress.badgeUnlockEvents ?? [];

const handleToggleHistorySublayer = useCallback((key: keyof HistorySubLayers) => {
  setHistorySublayers((prev) => {
    const next = { ...prev, [key]: !prev[key] };
    saveHistorySublayerPrefs(next);
    return next;
  });
}, []);
```

- [ ] **Step 3: Pass history layers to MapLibreCanvas render area**

After the MapLibreCanvas component, add conditionally rendered history layers:

```tsx
{layers.history && historySublayers.routes && (
  <HistoryRoutesLayer runLogs={runLogs} theme={theme} />
)}
{layers.history && historySublayers.badges && (
  <HistoryBadgesLayer events={badgeEvents} crewSlug={selectedCrewSlug} theme={theme} />
)}
```

Note: HistoryRoutesLayer and HistoryBadgesLayer render MapLibre Source/Layer/Marker components, so they must be children of the MapGL component. Pass them as props or render inside MapLibreCanvas. Choose the approach that matches the existing pattern — likely render inside MapLibreCanvas by passing the data as props.

- [ ] **Step 4: Add HistoryToolbar to JSX**

After the LayerRail, add:

```tsx
{!trackerActive && layers.history && (
  <HistoryToolbar sublayers={historySublayers} onToggle={handleToggleHistorySublayer} />
)}
```

- [ ] **Step 5: Enable HISTÓRIA button**

In `layerAvailability`, change `history: false` to `history: true`:

```typescript
const layerAvailability: Partial<Record<keyof MapLayerState, boolean>> = {
  missions: missionsForView.length > 0,
  // history is now always available
};
```

- [ ] **Step 6: Typecheck + visual verify**

Run: `cd apps/crew-running && npx --no-install tsc --noEmit 2>&1 | grep -v "sheets.test\|RunSummary\|runHistoryUpdate"`
Expected: No new errors

- [ ] **Step 7: Commit**

```bash
git add apps/crew-running/components/map/MapStage.tsx
git commit -m "feat(crew-running): wire history layer with sublayer toggles into MapStage"
```

---

## Phase 5: 96 Districts (Depends on Geo Data Pipeline)

### Task 16: District Badge Overlay Component

**Files:**
- Create: `apps/crew-running/components/map/DistrictBadgeOverlay.tsx`

- [ ] **Step 1: Write component**

```typescript
// components/map/DistrictBadgeOverlay.tsx
import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import type { LngLat } from '../../data/spLiveMap';

interface ConqueredDistrict {
  id: string;
  name: string;
  crewSlug: string;
  crewBadge: string;
  centroid: LngLat;
}

interface Props {
  districts: ConqueredDistrict[];
}

export const DistrictBadgeOverlay: React.FC<Props> = ({ districts }) => (
  <>
    {districts.map((d) => (
      <Marker key={d.id} longitude={d.centroid.lng} latitude={d.centroid.lat} anchor="center">
        <div className="district-badge-overlay" aria-label={`${d.name} — conquistado`}>
          <img src={d.crewBadge} alt="" aria-hidden className="district-badge-overlay__img" />
        </div>
      </Marker>
    ))}
  </>
);
```

- [ ] **Step 2: Add CSS**

```css
/* --- District Badge Overlay --- */
.district-badge-overlay { width: 48px; height: 48px; animation: district-conquest-pulse 1.2s ease-in-out; }
.district-badge-overlay__img { width: 100%; height: 100%; border-radius: 50%; }
@keyframes district-conquest-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
```

- [ ] **Step 3: Commit**

```bash
git add apps/crew-running/components/map/DistrictBadgeOverlay.tsx apps/crew-running/index.css
git commit -m "feat(crew-running): DistrictBadgeOverlay for conquered 96-district badges"
```

---

### Task 17: Integration — Wire Districts into MapLibreCanvas

**Depends on:** Geo Data Pipeline providing 96-district GeoJSON from Supabase `sp_districts`.

This task wires the district polygons (when available from the pipeline) into MapLibreCanvas using the theme-aware outline/fill specs from Task 9. The district GeoJSON features must include `dominantCrew`, `crewColor`, `ownership`, and `conquered` properties.

- [ ] **Step 1: Add district source to MapLibreCanvas**

When district GeoJSON is passed as prop `districtData`:

```tsx
{districtData && (!layers || layers.territory) && (
  <Source id="sp-districts" type="geojson" data={districtData}>
    <Layer {...zoneFill} />
    <Layer {...zoneOutline} />
  </Source>
)}
```

- [ ] **Step 2: Render DistrictBadgeOverlay for conquered districts**

```tsx
{conqueredDistricts.length > 0 && (!layers || layers.territory) && (
  <DistrictBadgeOverlay districts={conqueredDistricts} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add apps/crew-running/components/map/MapLibreCanvas.tsx
git commit -m "feat(crew-running): wire 96-district polygons + badge overlays into MapLibreCanvas"
```

---

## Validation

After all phases complete:

- [ ] Run full validation: `cd apps/crew-running && npm run validate`
- [ ] Verify dark/light toggle visually in browser
- [ ] Verify TERRITÓRIO/LIVE/MISSÕES/HISTÓRIA buttons all work
- [ ] Verify history sublayer toggles (ROTAS/CONQUISTAS/TERR.)
- [ ] Verify ZoneSheet shows ranking
- [ ] Verify CrewSheet shows leader + top 3
- [ ] Verify conquered district shows crew badge overlay
