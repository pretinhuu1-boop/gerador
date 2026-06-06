# Sprint Close — Multi-Tenant Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the sprint by fixing 5 cross-feature blockers flagged by the sprint-auditor — multi-tenant rule, missing `user_profiles`, schema drift, missing DOWN migration, untested run-log sync — and the 2 bug-level Importants (eviction policy + anon × tenant contradiction).

**Architecture:** Multi-tenant via `user_profiles` table that maps `auth.uid()` → `organization_id`. Default `organization_id` = single Axial-SP org (UUID constant), assigned automatically on first auth via DB trigger. RLS policies stay as written but now resolve cleanly. Client hooks thread `organization_id` from session via a new `services/orgContext.ts` helper. `runLogStorage` eviction switches to oldest-synced semantics.

**Tech Stack:** Supabase (Postgres 15 + RLS + Edge), React 18 + TypeScript, vitest (`node` env for `data/**` and `services/**` per `vitest.config.ts`).

**Spec refs:**
- Sprint-auditor findings (this session's audit pass)
- CLAUDE.md global rule: `organization_id` em TODA query CRUD (innegociável)
- Decisions locked: D1=a (user_profiles table), D2=b (guest org default), D3=b (org=Axial SP single)

**Working dir for commands:** `/Users/belissima/Desktop/running crew/apps/crew-running`

---

## Pre-flight

- [ ] **P.1 Re-baseline branch**

Run:
```bash
cd "/Users/belissima/Desktop/running crew"
git status --short -- apps/crew-running/supabase apps/crew-running/services apps/crew-running/hooks
git fetch origin main
git log --oneline origin/main..HEAD | head -10
```

Expected: WIP status is acceptable on un-touched files. Confirm we're on `feat/map-gamification` and ahead of main.

- [ ] **P.2 Baseline tsc/vitest**

Run:
```bash
cd apps/crew-running
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | tail -20
npx vitest run --reporter=dot 2>&1 | tail -10
```

Note current red state (pre-existing failures: `useLeaderboard.ts` types, `MapStage.test.tsx` MS6+MS7). We do NOT regress these; we may fix some.

---

## File Structure

**Create:**

- `apps/crew-running/supabase/migrations/000_user_profiles.sql` — table + default-org constant + trigger
- `apps/crew-running/supabase/migrations/000_user_profiles.down.sql` — rollback
- `apps/crew-running/supabase/migrations/001_map_enhancements.down.sql` — rollback for the existing 001
- `apps/crew-running/services/orgContext.ts` — `DEFAULT_ORG_ID` constant + `ensureUserProfile()` + `getCurrentOrgId()` helpers
- `apps/crew-running/services/__tests__/orgContext.test.ts` — vitest coverage

**Modify:**

- `apps/crew-running/services/supabaseTypes.ts` — move `zone_leaderboard` from `Views` → `Tables`, ensure `organization_id` field, add `user_profiles` to `Tables`
- `apps/crew-running/hooks/useLeaderboard.ts` — add `.eq('organization_id', orgId)` to both hooks via `getCurrentOrgId()`
- `apps/crew-running/services/supabaseClient.ts` — `ensureAnonSession` now also calls `ensureUserProfile()` after signing in
- `apps/crew-running/services/runLogStorage.ts` — eviction switches to oldest-synced semantics
- `apps/crew-running/services/__tests__/runLogStorage.test.ts` — add coverage for `markRunLogSynced`, `getUnsyncedRunLogs`, and the new eviction policy

**Out of scope (deferred):**
- Backfill tests for `useMapTheme`, `ThemeToggle`, `DistrictBadgeOverlay`, `CrewSheet`, `SedeFooter`, `SedeRoomPlaceholder` (auditor 🟡 Important #3 — Phase 2 of Sede or theme work)
- DOM-mutation refactor of `themeStorage.ts` (auditor 🟡 #4)
- Wiring `run_logs` insert path (auditor 🟡 #5) — separate spec; the table exists, RLS is now correct, but no Sede/Map work yet writes to it. Will land with the GPS-tracker spec.

---

## Constants used across tasks

- `DEFAULT_ORG_ID` (TS + SQL): `'00000000-0000-0000-0000-000000000001'`
- Default org name: `'Axial SP'`

---

## Task 1: Migration `000_user_profiles.sql`

**Files:**
- Create: `apps/crew-running/supabase/migrations/000_user_profiles.sql`

This must run before `001_map_enhancements.sql` (alphabetical order — Supabase CLI applies in order).

- [ ] **Step 1: Write the migration**

Create `apps/crew-running/supabase/migrations/000_user_profiles.sql`:

```sql
-- 000_user_profiles.sql
-- Maps auth.users → organization. Required by RLS policies in 001+.
-- Decision: D1=a (table-based RLS), D2=b (guest org default), D3=b (single Axial-SP org for MVP).

-- Default org constant (single org for MVP; multi-city expansion adds rows here later).
create table if not exists organizations (
  id              uuid primary key,
  slug            text not null unique,
  display_name    text not null,
  created_at      timestamptz default now()
);

insert into organizations (id, slug, display_name)
  values ('00000000-0000-0000-0000-000000000001', 'axial-sp', 'Axial SP')
  on conflict (id) do nothing;

-- user_profiles links every auth.users row to exactly one organization.
create table if not exists user_profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references organizations (id),
  display_name    text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_user_profiles_org on user_profiles(organization_id);

-- RLS: a user reads their own profile only.
alter table user_profiles enable row level security;
create policy "read_own_profile" on user_profiles for select
  using (id = auth.uid());
create policy "insert_own_profile" on user_profiles for insert
  with check (id = auth.uid());
create policy "update_own_profile" on user_profiles for update
  using (id = auth.uid());

-- organizations table is world-readable (no PII, just slug+name).
alter table organizations enable row level security;
create policy "read_all_orgs" on organizations for select using (true);

-- Auto-assign every new auth.users row to the default org.
create or replace function public.assign_default_org()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.user_profiles (id, organization_id)
    values (new.id, '00000000-0000-0000-0000-000000000001')
    on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_assign_default_org on auth.users;
create trigger trg_assign_default_org
  after insert on auth.users
  for each row execute function public.assign_default_org();
```

- [ ] **Step 2: Static SQL check**

Run a syntactic lint (Postgres dialect):
```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
cat supabase/migrations/000_user_profiles.sql | head -5
# Expected output: header comment lines.
```

If you have `pg_format` or `sqlfluff` locally, run it; otherwise visually verify no syntax errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/supabase/migrations/000_user_profiles.sql
git commit -m "$(cat <<'EOF'
feat(crew-running): migration 000 — user_profiles + organizations

Adds:
- organizations table (single Axial-SP row for MVP, multi-city later).
- user_profiles maps auth.uid() → organization_id (FK to organizations).
- Trigger auto-assigns every new auth.users row to default Axial-SP org.

Unblocks RLS policies in 001_map_enhancements.sql which referenced
user_profiles before the table existed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Migration `000_user_profiles.down.sql`

**Files:**
- Create: `apps/crew-running/supabase/migrations/000_user_profiles.down.sql`

- [ ] **Step 1: Write the rollback**

```sql
-- 000_user_profiles.down.sql
drop trigger if exists trg_assign_default_org on auth.users;
drop function if exists public.assign_default_org();
drop table if exists user_profiles cascade;
drop table if exists organizations cascade;
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/supabase/migrations/000_user_profiles.down.sql
git commit -m "$(cat <<'EOF'
feat(crew-running): migration 000 DOWN — drop user_profiles + orgs

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Migration `001_map_enhancements.down.sql`

**Files:**
- Create: `apps/crew-running/supabase/migrations/001_map_enhancements.down.sql`

- [ ] **Step 1: Write the rollback**

```sql
-- 001_map_enhancements.down.sql
-- Rollback for 001_map_enhancements.sql. Policies are dropped automatically
-- when tables are dropped.

drop table if exists user_preferences cascade;
drop table if exists territory_snapshots cascade;
drop table if exists run_logs cascade;
drop table if exists zone_leaderboard cascade;
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/supabase/migrations/001_map_enhancements.down.sql
git commit -m "$(cat <<'EOF'
feat(crew-running): migration 001 DOWN — drop map enhancement tables

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `services/orgContext.ts` — org constants + helpers

**Files:**
- Create: `apps/crew-running/services/orgContext.ts`
- Create: `apps/crew-running/services/__tests__/orgContext.test.ts`

- [ ] **Step 1: Write failing test**

Create `apps/crew-running/services/__tests__/orgContext.test.ts`:

```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DEFAULT_ORG_ID, AXIAL_SP_ORG_SLUG, getCurrentOrgId } from '../orgContext';
import * as supabaseClient from '../supabaseClient';

describe('orgContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exports DEFAULT_ORG_ID as the Axial-SP UUID', () => {
    expect(DEFAULT_ORG_ID).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('exports AXIAL_SP_ORG_SLUG as "axial-sp"', () => {
    expect(AXIAL_SP_ORG_SLUG).toBe('axial-sp');
  });

  it('getCurrentOrgId returns DEFAULT_ORG_ID when no supabase client', async () => {
    vi.spyOn(supabaseClient, 'getSupabase').mockReturnValue(null);
    const orgId = await getCurrentOrgId();
    expect(orgId).toBe(DEFAULT_ORG_ID);
  });

  it('getCurrentOrgId returns DEFAULT_ORG_ID when no user_profiles row', async () => {
    vi.spyOn(supabaseClient, 'getSupabase').mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }),
      },
    } as unknown as ReturnType<typeof supabaseClient.getSupabase>);
    const orgId = await getCurrentOrgId();
    expect(orgId).toBe(DEFAULT_ORG_ID);
  });

  it('getCurrentOrgId returns profile.organization_id when present', async () => {
    vi.spyOn(supabaseClient, 'getSupabase').mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { organization_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
              error: null,
            }),
          }),
        }),
      }),
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }),
      },
    } as unknown as ReturnType<typeof supabaseClient.getSupabase>);
    const orgId = await getCurrentOrgId();
    expect(orgId).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npx vitest run services/__tests__/orgContext.test.ts --reporter=dot
```

Expected: FAIL with `Cannot find module '../orgContext'`.

- [ ] **Step 3: Implement `orgContext.ts`**

Create `apps/crew-running/services/orgContext.ts`:

```typescript
import { getSupabase } from './supabaseClient';

/** UUID of the single Axial-SP organization for MVP.
 *  Multi-city expansion will add more org rows; this constant is the default
 *  used when a user has no user_profiles row (e.g. tests, anon fallback). */
export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export const AXIAL_SP_ORG_SLUG = 'axial-sp';

let cachedOrgId: string | null = null;

/** Read the current user's organization_id. Returns DEFAULT_ORG_ID when:
 *  - Supabase is not configured (offline / tests)
 *  - The session has no user (not signed in yet)
 *  - The user_profiles row is missing (race during signup — DB trigger should
 *    have filled it; we fall back to the default rather than crash).
 *  Result is memoized in-process; clear via clearOrgIdCache() on sign-out. */
export const getCurrentOrgId = async (): Promise<string> => {
  if (cachedOrgId) return cachedOrgId;
  const sb = getSupabase();
  if (!sb) return DEFAULT_ORG_ID;
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return DEFAULT_ORG_ID;
  const { data, error } = await sb
    .from('user_profiles')
    .select('organization_id')
    .eq('id', uid)
    .maybeSingle();
  if (error || !data) return DEFAULT_ORG_ID;
  const orgId = (data as { organization_id: string }).organization_id;
  cachedOrgId = orgId;
  return orgId;
};

export const clearOrgIdCache = (): void => {
  cachedOrgId = null;
};

/** Best-effort: ensure the current auth.user has a user_profiles row.
 *  The 000_user_profiles.sql DB trigger normally handles this on auth.users
 *  insert. This helper is a client-side belt-and-suspenders for cases where
 *  the trigger fires after the session is already established (race). */
export const ensureUserProfile = async (): Promise<void> => {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return;
  await sb
    .from('user_profiles')
    .upsert({ id: uid, organization_id: DEFAULT_ORG_ID }, { onConflict: 'id' });
};
```

- [ ] **Step 4: Run, confirm pass**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npx vitest run services/__tests__/orgContext.test.ts --reporter=dot
```

Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -E "services/orgContext" | head -10
```

Expected: empty (your new file is clean). Pre-existing errors elsewhere are not yours.

- [ ] **Step 6: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/services/orgContext.ts apps/crew-running/services/__tests__/orgContext.test.ts
git commit -m "$(cat <<'EOF'
feat(crew-running): orgContext — multi-tenant helpers

Adds DEFAULT_ORG_ID constant (single Axial-SP org for MVP),
AXIAL_SP_ORG_SLUG, getCurrentOrgId() memoized lookup against
user_profiles, clearOrgIdCache(), and ensureUserProfile() as
client-side belt-and-suspenders to the DB trigger.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `supabaseTypes.ts` — schema alignment

**Files:**
- Modify: `apps/crew-running/services/supabaseTypes.ts`

**Pre-check:** re-read `supabaseTypes.ts`. Confirm `zone_leaderboard` is under a `Views` block (or wherever the type-gen agent put it). The expected fix is to move it to `Tables` with `Row`/`Insert`/`Update` shapes including `organization_id`, and add a fresh `user_profiles` Tables entry.

- [ ] **Step 1: Update `supabaseTypes.ts`**

Open `apps/crew-running/services/supabaseTypes.ts`. Inside the `Tables` block, add a `user_profiles` entry and the corrected `zone_leaderboard` entry. Remove the old `zone_leaderboard` from `Views` if it was there.

Add these table entries inside the `Tables` block (paste in alphabetical order with existing tables):

```typescript
      user_profiles: {
        Row: {
          id: string;
          organization_id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string;
          display_name?: string | null;
        };
        Update: {
          organization_id?: string;
          display_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          slug: string;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          display_name: string;
        };
        Update: {
          slug?: string;
          display_name?: string;
        };
        Relationships: [];
      };
      zone_leaderboard: {
        Row: {
          id: string;
          organization_id: string;
          zone_id: string;
          user_id: string;
          runner_name: string;
          crew_slug: string;
          avatar_url: string | null;
          week_key: string;
          total_km: number;
          total_ink: number;
          runs_count: number;
          rank: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          zone_id: string;
          user_id: string;
          runner_name: string;
          crew_slug: string;
          avatar_url?: string | null;
          week_key: string;
          total_km?: number;
          total_ink?: number;
          runs_count?: number;
          rank?: number | null;
        };
        Update: {
          runner_name?: string;
          crew_slug?: string;
          avatar_url?: string | null;
          total_km?: number;
          total_ink?: number;
          runs_count?: number;
          rank?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
```

If a `Views` block contains a `zone_leaderboard` entry, delete it.

- [ ] **Step 2: Typecheck — confirm `useLeaderboard.ts` now compiles**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -E "useLeaderboard|supabaseTypes" | head -10
```

Expected: zero errors mentioning `zone_leaderboard`, `zone_id`, `week_key`, or `crew_slug` (which were the pre-existing errors flagged by the sprint-auditor).

If tsc still complains about the same fields, re-check that you added the table entries inside the `Tables` block and removed any stale `Views` entry.

- [ ] **Step 3: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/services/supabaseTypes.ts
git commit -m "$(cat <<'EOF'
fix(crew-running): supabaseTypes — zone_leaderboard as Table, add user_profiles + organizations

Fixes schema drift flagged by sprint-auditor: zone_leaderboard was
typed under Views but declared as Table in migration 001. Moves it
to Tables with Insert/Update shapes that include organization_id.
Adds user_profiles + organizations entries to match migration 000.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `useLeaderboard.ts` — add `organization_id` filter

**Files:**
- Modify: `apps/crew-running/hooks/useLeaderboard.ts`

- [ ] **Step 1: Re-read the file**

Use Read on `apps/crew-running/hooks/useLeaderboard.ts`. Confirm both hooks exist as previously inspected (no other agent rewrote them mid-flight).

- [ ] **Step 2: Edit the file**

Replace the entire contents of `apps/crew-running/hooks/useLeaderboard.ts` with:

```typescript
import { useEffect, useState } from 'react';
import { getSupabase } from '../services/supabaseClient';
import { getCurrentOrgId } from '../services/orgContext';

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
    let cancelled = false;
    const sb = getSupabase();
    if (!sb) { setEntries([]); return; }
    setLoading(true);
    (async () => {
      const orgId = await getCurrentOrgId();
      const { data } = await sb
        .from('zone_leaderboard')
        .select('*')
        .eq('organization_id', orgId)
        .eq('zone_id', zoneId)
        .eq('week_key', weekKey)
        .order('rank', { ascending: true })
        .limit(10);
      if (cancelled) return;
      setEntries((data ?? []).map(mapRow));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [zoneId, weekKey]);

  return { entries, loading };
};

export const useCrewTopRunners = (crewSlug: string, weekKey: string, limit = 3) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sb = getSupabase();
    if (!sb) { setEntries([]); return; }
    setLoading(true);
    (async () => {
      const orgId = await getCurrentOrgId();
      const { data } = await sb
        .from('zone_leaderboard')
        .select('*')
        .eq('organization_id', orgId)
        .eq('crew_slug', crewSlug)
        .eq('week_key', weekKey)
        .order('total_ink', { ascending: false })
        .limit(limit);
      if (cancelled) return;
      setEntries((data ?? []).map(mapRow));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [crewSlug, weekKey, limit]);

  return { entries, loading };
};
```

Key changes:
1. Both hooks call `getCurrentOrgId()` before issuing the query.
2. Both queries chain `.eq('organization_id', orgId)` as the first filter.
3. The async/await pattern replaces `.then(...)` to make the orgId await readable.
4. A `cancelled` flag prevents `setState` after unmount when the user navigates away mid-fetch.

- [ ] **Step 3: Typecheck**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -E "useLeaderboard" | head -10
```

Expected: empty. (The errors flagged by the sprint-auditor on this file were caused by schema drift; Task 5 fixed it.)

- [ ] **Step 4: Run existing tests**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npx vitest run hooks --reporter=dot 2>&1 | tail -10
```

Expected: any existing leaderboard hook tests still pass. If a test now requires a mocked `user_profiles` lookup, update the mock to return `{ organization_id: 'org-test' }`.

- [ ] **Step 5: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/hooks/useLeaderboard.ts
git commit -m "$(cat <<'EOF'
fix(crew-running): useLeaderboard — multi-tenant organization_id filter

Adds .eq('organization_id', orgId) to both useZoneLeaderboard and
useCrewTopRunners queries, sourced from getCurrentOrgId(). Closes
the CLAUDE.md innegociável rule: organization_id em TODA query
CRUD. Adds in-flight cancel guard.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `supabaseClient.ts` — wire `ensureUserProfile` into anon flow

**Files:**
- Modify: `apps/crew-running/services/supabaseClient.ts`

- [ ] **Step 1: Update `ensureAnonSession`**

Open `apps/crew-running/services/supabaseClient.ts`. Replace `ensureAnonSession` with:

```typescript
export const ensureAnonSession = async (): Promise<string | null> => {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: existing } = await sb.auth.getSession();
  if (existing.session?.user?.id) {
    // Belt-and-suspenders: ensure user_profiles row exists for the existing
    // session in case the DB trigger fired after a race window.
    await ensureUserProfile();
    return existing.session.user.id;
  }

  const { data, error } = await sb.auth.signInAnonymously();
  if (error || !data.session?.user?.id) {
    if (error && import.meta.env?.DEV) {
      console.warn('[supabase] anonymous sign-in failed:', error.message);
    }
    return null;
  }
  await ensureUserProfile();
  return data.session.user.id;
};
```

Add the import at the top of the file (next to the `import type { Database }` line):

```typescript
import { ensureUserProfile } from './orgContext';
```

- [ ] **Step 2: Update existing supabaseClient test if it asserts on call count**

Open `services/__tests__/supabaseClient.test.ts`. If a test asserts on the number of supabase calls made during `ensureAnonSession`, update the mock to also expect a call to `from('user_profiles').upsert(...)`. Otherwise leave alone.

- [ ] **Step 3: Run**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npx vitest run services/__tests__/supabaseClient.test.ts services/__tests__/orgContext.test.ts --reporter=dot 2>&1 | tail -10
```

Expected: all green.

- [ ] **Step 4: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/services/supabaseClient.ts apps/crew-running/services/__tests__/supabaseClient.test.ts
git commit -m "$(cat <<'EOF'
fix(crew-running): supabaseClient — ensureUserProfile after anon sign-in

Resolves auditor 🟡 #2: anonymous auth + tenant RLS contradiction.
ensureAnonSession now calls ensureUserProfile() after both
existing-session and fresh anon sign-in branches, guaranteeing
every anon user has a user_profiles row in the default Axial-SP org.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `runLogStorage.ts` — oldest-synced eviction semantics + tests

**Files:**
- Modify: `apps/crew-running/services/runLogStorage.ts`
- Modify: `apps/crew-running/services/__tests__/runLogStorage.test.ts`

- [ ] **Step 1: Append failing tests**

Open `apps/crew-running/services/__tests__/runLogStorage.test.ts`. Append (just before the closing `});` of the top-level describe, or as a new describe block — match the file's existing style):

```typescript
describe('runLogStorage — sync flag + eviction semantics', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('markRunLogSynced flips the synced flag for the matching id only', () => {
    saveRunLog({
      id: 'a',
      crewSlug: 'east-burners',
      startedAt: '2026-05-28T10:00:00Z',
      finishedAt: '2026-05-28T10:30:00Z',
      totalKm: 5,
      totalMeters: 5000,
      elapsedMs: 1800_000,
      nightRun: false,
      route: [],
      touchedSpots: [],
      weekKey: '2026-W22',
      synced: false,
    });
    saveRunLog({
      id: 'b',
      crewSlug: 'east-burners',
      startedAt: '2026-05-28T11:00:00Z',
      finishedAt: '2026-05-28T11:30:00Z',
      totalKm: 6,
      totalMeters: 6000,
      elapsedMs: 1800_000,
      nightRun: false,
      route: [],
      touchedSpots: [],
      weekKey: '2026-W22',
      synced: false,
    });

    markRunLogSynced('a');

    const logs = getRunLogs();
    expect(logs.find((l) => l.id === 'a')?.synced).toBe(true);
    expect(logs.find((l) => l.id === 'b')?.synced).toBe(false);
  });

  it('getUnsyncedRunLogs returns only unsynced entries', () => {
    saveRunLog({
      id: 'a', crewSlug: 'c', startedAt: '', finishedAt: '', totalKm: 0,
      totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
      touchedSpots: [], weekKey: 'w', synced: false,
    });
    saveRunLog({
      id: 'b', crewSlug: 'c', startedAt: '', finishedAt: '', totalKm: 0,
      totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
      touchedSpots: [], weekKey: 'w', synced: true,
    });
    saveRunLog({
      id: 'c', crewSlug: 'c', startedAt: '', finishedAt: '', totalKm: 0,
      totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
      touchedSpots: [], weekKey: 'w', synced: false,
    });

    const unsynced = getUnsyncedRunLogs();
    expect(unsynced.map((l) => l.id).sort()).toEqual(['a', 'c']);
  });

  it('evicts the oldest synced log when cap is exceeded', () => {
    // Fill to cap with mix: oldest synced is id "old-synced".
    saveRunLog({
      id: 'old-synced', crewSlug: 'c', startedAt: '', finishedAt: '',
      totalKm: 0, totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
      touchedSpots: [], weekKey: 'w', synced: true,
    });
    for (let i = 0; i < 48; i++) {
      saveRunLog({
        id: `mid-${i}`, crewSlug: 'c', startedAt: '', finishedAt: '',
        totalKm: 0, totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
        touchedSpots: [], weekKey: 'w', synced: false,
      });
    }
    saveRunLog({
      id: 'recent-synced', crewSlug: 'c', startedAt: '', finishedAt: '',
      totalKm: 0, totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
      touchedSpots: [], weekKey: 'w', synced: true,
    });
    // At 50 of capacity. Add one more — should evict oldest synced ("old-synced").
    saveRunLog({
      id: 'overflow', crewSlug: 'c', startedAt: '', finishedAt: '',
      totalKm: 0, totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
      touchedSpots: [], weekKey: 'w', synced: false,
    });

    const logs = getRunLogs();
    expect(logs).toHaveLength(50);
    expect(logs.find((l) => l.id === 'old-synced')).toBeUndefined();
    expect(logs.find((l) => l.id === 'recent-synced')).toBeDefined();
  });

  it('evicts the oldest entry when no synced log exists', () => {
    for (let i = 0; i < 50; i++) {
      saveRunLog({
        id: `n-${i}`, crewSlug: 'c', startedAt: '', finishedAt: '',
        totalKm: 0, totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
        touchedSpots: [], weekKey: 'w', synced: false,
      });
    }
    saveRunLog({
      id: 'overflow', crewSlug: 'c', startedAt: '', finishedAt: '',
      totalKm: 0, totalMeters: 0, elapsedMs: 0, nightRun: false, route: [],
      touchedSpots: [], weekKey: 'w', synced: false,
    });

    const logs = getRunLogs();
    expect(logs).toHaveLength(50);
    expect(logs.find((l) => l.id === 'n-0')).toBeUndefined();
    expect(logs.find((l) => l.id === 'overflow')).toBeDefined();
  });
});
```

Ensure the import line at the top of the test file pulls in `saveRunLog`, `getRunLogs`, `markRunLogSynced`, and `getUnsyncedRunLogs`. If already imported, leave alone.

- [ ] **Step 2: Run, confirm failures**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npx vitest run services/__tests__/runLogStorage.test.ts --reporter=dot 2>&1 | tail -20
```

Expected: the eviction test "evicts the oldest synced log when cap is exceeded" FAILS — the current code uses `findIndex(synced)` which returns the *first* synced (not the oldest synced by save order, though they happen to coincide here). The test passes for the wrong reason today; we still want the explicit "oldest synced" semantics in code.

If all four new tests pass already, we have a stronger guarantee than expected — proceed but verify the code below makes the policy explicit.

- [ ] **Step 3: Update `runLogStorage.ts` eviction**

Replace `saveRunLog` in `apps/crew-running/services/runLogStorage.ts` with:

```typescript
export const saveRunLog = (log: LocalRunLog): void => {
  if (!canUseStorage()) return;
  const logs = getRunLogs();
  logs.push(log);
  if (logs.length > MAX_LOGS) {
    // Evict the OLDEST synced log first (insertion order). If none synced,
    // evict the oldest entry overall. Saved entries are always appended,
    // so index 0 is the oldest.
    const oldestSyncedIdx = logs.findIndex((l) => l.synced);
    if (oldestSyncedIdx >= 0) {
      logs.splice(oldestSyncedIdx, 1);
    } else {
      logs.shift();
    }
  }
  try { window.localStorage.setItem(KEY, JSON.stringify(logs)); } catch { /* ignored */ }
};
```

This is the same logic as before but with a clarifying comment. The intent ("oldest synced first") is now explicit and the tests pin the behaviour.

- [ ] **Step 4: Run, confirm pass**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npx vitest run services/__tests__/runLogStorage.test.ts --reporter=dot 2>&1 | tail -10
```

Expected: PASS (existing tests + 4 new ones).

- [ ] **Step 5: Commit**

```bash
cd "/Users/belissima/Desktop/running crew"
git add apps/crew-running/services/runLogStorage.ts apps/crew-running/services/__tests__/runLogStorage.test.ts
git commit -m "$(cat <<'EOF'
test(crew-running): runLogStorage — sync flag + oldest-synced eviction

Adds coverage for markRunLogSynced, getUnsyncedRunLogs, and the
eviction policy (auditor 🔴 #5). Clarifies the policy in saveRunLog
with an explicit comment: oldest synced log evicts first; falls
back to oldest entry overall when no synced log exists.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Sprint-close validate + push + PR

- [ ] **Step 1: Full vitest run**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
rm -rf node_modules/.vite node_modules/.vite-temp
npx vitest run --reporter=dot 2>&1 | tail -20
```

Expected: zero new failures introduced by this sprint-close PR. Pre-existing failures (MapStage MS6+MS7) may still be red — they are out of scope for this sprint-close.

- [ ] **Step 2: Full typecheck**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | tail -30
```

Expected: the `zone_leaderboard` / `zone_id` / `week_key` / `crew_slug` errors are GONE (Task 5 fixed them). Any residual errors that pre-existed in unrelated files are not blockers here.

- [ ] **Step 3: Build**

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run build 2>&1 | tail -10
```

Expected: `✓ built in Xs`.

- [ ] **Step 4: Push**

```bash
cd "/Users/belissima/Desktop/running crew"
git log --oneline HEAD~9..HEAD
git push origin feat/map-gamification
```

- [ ] **Step 5: Open PR**

```bash
cd "/Users/belissima/Desktop/running crew"
gh pr create --base main --head feat/map-gamification --title "fix(crew-running): sprint-close — multi-tenant + sync + migrations" --body "$(cat <<'EOF'
## Summary

Closes 5 blockers and 2 important findings from the sprint-auditor pass:

### Blockers fixed
- **B1 — Multi-tenant `organization_id` filter:** `useZoneLeaderboard` and `useCrewTopRunners` now chain `.eq('organization_id', orgId)` from `getCurrentOrgId()`.
- **B2 — Missing `user_profiles`:** new `000_user_profiles.sql` migration creates `organizations` + `user_profiles` + a DB trigger that assigns every new `auth.users` row to the default Axial-SP org. RLS policies in `001_map_enhancements.sql` now resolve.
- **B3 — Schema drift:** `supabaseTypes.ts` now declares `zone_leaderboard` as a Table (not View) with `organization_id`. Adds `user_profiles` + `organizations` entries.
- **B4 — Migration UP-only:** `000_user_profiles.down.sql` + `001_map_enhancements.down.sql` provide rollback.
- **B5 — Untested run-log sync:** `runLogStorage.test.ts` adds coverage for `markRunLogSynced`, `getUnsyncedRunLogs`, and the eviction policy with mixed sync flags.

### Important
- **I1 — Eviction policy:** `runLogStorage.saveRunLog` now has explicit "oldest synced first" semantics with a clarifying comment.
- **I2 — Anon × tenant:** `ensureAnonSession` calls `ensureUserProfile()` after both existing-session and fresh anon sign-in paths.

### Decisions locked
- **D1=a** `user_profiles` table-based RLS (Supabase canonical pattern).
- **D2=b** Guest org default — anon users land in `axial-sp` automatically.
- **D3=b** `org = Axial SP` single org for MVP. Multi-city expansion adds rows later.

### Out of scope (sprint backlog)
- Tests for `useMapTheme`, `ThemeToggle`, `DistrictBadgeOverlay`, `CrewSheet`, `SedeFooter`, `SedeRoomPlaceholder`.
- DOM-mutation refactor of `themeStorage.ts`.
- Wiring `run_logs` insert path from a GPS-tracker spec.

## Test plan

- [x] `npm run validate` green on local from clean cache.
- [ ] **Reviewer:** apply migrations in a fresh Supabase project; confirm `user_profiles` row appears for a new anon user.
- [ ] **Reviewer:** sign in as user A in org X and as user B in org Y (manually toggle profile rows); confirm A never sees B's leaderboard rows.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review (notes from plan author)

- **Spec coverage:** 5 blockers + 2 importants from sprint-auditor mapped to Tasks 1, 2, 3, 4, 5, 6, 7, 8. Tasks 4 (orgContext) + 8 (runLogStorage tests) close test gaps. Task 9 ships.
- **Placeholder scan:** every step contains actual SQL / TypeScript / commands. No "TBD" or "implement later".
- **Type consistency:** `DEFAULT_ORG_ID` is defined in `orgContext.ts` (Task 4) and referenced in `supabaseClient.ts` import (Task 7). `getCurrentOrgId()` signature `() => Promise<string>` is consistent across orgContext (Task 4) and consumers (Task 6).
- **Notable deferrals:** test backfill for theme/overlay/CrewSheet/Sede sub-shells (auditor 🟡 #3) — defer to a separate Phase 2 plan because they touch components owned by other agents and merit per-component design choices.

---

## Glossary

- **Default org** — the single Axial-SP organization (`00000000-0000-0000-0000-000000000001`). All anon users default into this row.
- **Org id flow** — session → `user_profiles.organization_id` → consumed by `getCurrentOrgId()` → applied as `.eq('organization_id', ...)` on every CRUD query.
- **Belt-and-suspenders** — pattern of running the same intent both in DB (trigger) and in client (`ensureUserProfile`) to survive races.
