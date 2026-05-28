# Map Enhancements: Rankings, History, Theming & 96 Districts

**Date:** 2026-05-28
**Status:** Draft
**Priority order:** Rankings + Crew Cards > History > Theming > 96 Districts
**Depends on:** [SP Running Geo Data Pipeline](./2026-05-28-sp-running-geo-data-pipeline-design.md) (for 96-district polygons)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Rankings + Crew Cards](#2-rankings--crew-cards)
3. [History Layer (3 Sublayers)](#3-history-layer)
4. [Map Theming (Full Custom Palette)](#4-map-theming)
5. [96 Districts Visual Integration](#5-96-districts-visual-integration)
6. [Supabase Schema (Consolidated)](#6-supabase-schema)
7. [Testing Strategy](#7-testing-strategy)
8. [ADRs](#8-adrs)

---

## 1. Overview

Four interconnected features that transform the map from a static display into a living, competitive, personalized experience:

- **Rankings + Crew Cards** — weekly zone leaderboards, enriched crew cards with leader + top 3 runners
- **History** — 3 sublayers (past routes, badge conquest pins, territory evolution timeline)
- **Theming** — full dark/light palette affecting basemap + overlays + HUD + UI chrome
- **96 Districts** — white-bordered neutral districts that gain crew color + badge overlay when conquered

### Architecture Approach

Supabase-first. All persistent data lives in Supabase PostGIS with RLS. localStorage serves as offline cache with background sync. Theme preference stored locally + synced.

### Shared Infrastructure

- Supabase client (already in project via `@supabase/supabase-js`)
- `organization_id` on all user-generated tables (CLAUDE.md mandate)
- Offline-first sync pattern: write to localStorage immediately, queue Supabase upsert on connectivity
- MapLibre layer specs become theme-aware functions (currently hardcoded constants)

---

## 2. Rankings + Crew Cards

### 2.1 Supabase Table: `zone_leaderboard`

```sql
create table zone_leaderboard (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  zone_id         text not null,
  user_id         uuid not null references auth.users,
  runner_name     text not null,
  crew_slug       text not null,
  avatar_url      text,
  week_key        text not null,          -- ISO week '2026-W22'
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
  with check (
    auth.uid() = user_id
    AND organization_id = (select organization_id from user_profiles where id = auth.uid())
  );
create policy "update_own" on zone_leaderboard for update
  using (auth.uid() = user_id);

create index idx_leaderboard_zone_week on zone_leaderboard(zone_id, week_key);
create index idx_leaderboard_crew_week on zone_leaderboard(crew_slug, week_key);
```

### 2.2 Edge Function: `update-leaderboard`

Triggered at run completion. Receives:
```typescript
{ zoneId: string; km: number; ink: number; weekKey: string; runnerName: string; crewSlug: string; avatarUrl?: string }
```

Steps:
1. Upsert row in `zone_leaderboard` (increment km, ink, runs_count)
2. Recompute `rank` atomically via CTE (safe under concurrent writes):
   ```sql
   WITH ranked AS (
     SELECT id, ROW_NUMBER() OVER (ORDER BY total_ink DESC, total_km DESC, created_at ASC) as r
     FROM zone_leaderboard WHERE zone_id = $1 AND week_key = $2
     FOR UPDATE
   )
   UPDATE zone_leaderboard SET rank = ranked.r
   FROM ranked
   WHERE zone_leaderboard.id = ranked.id;
   ```
   `FOR UPDATE` provides row-level locking. `created_at ASC` breaks ties deterministically.

### 2.3 Enriched CrewSheet Component

Current `CrewSheet` enhanced with:

| Section | Data Source | Assets Used |
|---------|------------|-------------|
| Leader portrait | Static | `/crews/{slug}/leader.png` |
| Top 3 runners this week | `zone_leaderboard` query (crew_slug, current week, limit 3) | `/crews/{slug}/members/member_{1-3}.png` |
| Territory % | `ownershipByZone` (already in MapStage) | Zone fill color |
| Crew stats | Aggregated from leaderboard | Runs count, active members |

Layout:
```
┌─────────────────────────────────┐
│ [Badge 128px]  CREW NAME        │
│                Zone · Mission   │
├─────────────────────────────────┤
│ [Leader.png]  LÍDER DA CREW     │
│               Runner name       │
├─────────────────────────────────┤
│ TOP 3 DA SEMANA                 │
│ 1. [member_1] Name   12.4km    │
│ 2. [member_2] Name    8.7km    │
│ 3. [member_3] Name    6.1km    │
├─────────────────────────────────┤
│ TERRITÓRIO: 72%    RUNS: 34    │
│ MEMBROS ATIVOS: 12             │
└─────────────────────────────────┘
```

### 2.4 ZoneLeaderboard Component

New component, rendered inside ZoneSheet when user taps "VER RANKING":

| Field | Source |
|-------|--------|
| Top 10 runners | `zone_leaderboard` WHERE zone_id + current week, ORDER BY rank |
| Each row | rank position, runner name, crew badge (32px), km, ink |
| User highlight | Own row highlighted with accent color. Component receives `currentUserId` from `getSelfUserId()` context. |
| Empty state | "Nenhum runner nesta zona esta semana" |

### 2.5 Data Flow

```
Run completes
  → runTracker.stopRun() saves snapshot locally
  → call Supabase edge function update-leaderboard
  → zone_leaderboard updated, rank recomputed

User opens ZoneSheet
  → ZoneSheet renders existing content + "VER RANKING" button
  → Click → query zone_leaderboard(zoneId, currentWeek)
  → Render ZoneLeaderboard

User opens CrewSheet (clicks crew marker on map)
  → Query zone_leaderboard(crewSlug, currentWeek, limit 3)
  → Render enriched card with leader + top 3
```

---

## 3. History Layer

HISTÓRIA button activates the history layer group. Three sublayers toggled independently via chip buttons inside a history toolbar.

### 3.1 Sublayer A: Past Routes

#### Persistence — `run_logs` Table

```sql
create table run_logs (
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
  synced          boolean default false,
  created_at      timestamptz default now()
);

alter table run_logs enable row level security;
create policy "read_own" on run_logs for select using (auth.uid() = user_id);
create policy "insert_own" on run_logs for insert
  with check (
    auth.uid() = user_id
    AND organization_id = (select organization_id from user_profiles where id = auth.uid())
  );

create index idx_run_logs_user_week on run_logs(user_id, week_key);
create index idx_run_logs_route on run_logs using gist(route);
```

#### Offline-First Sync

1. Run completes → save full GPS trace to `localStorage` key `crewRunLogs` (array, capped at 50 runs)
2. When online → background upsert to Supabase `run_logs` (mark `synced: true` locally). Cap local storage at 50 runs — oldest synced runs purged first.
3. On history layer open → read local first, supplement with Supabase query for older runs

#### Rendering

- Each route as a MapLibre `LineString` Source/Layer
- Color: crew accent of the run's `crew_slug`
- Opacity: `0.7` for runs < 7 days old, `0.4` for 7-30 days, `0.15` for older
- Line width: 2px
- Max 20 routes rendered simultaneously (most recent first)

### 3.2 Sublayer B: Badge Conquest Pins

#### Enriched Unlock Event

```typescript
interface BadgeUnlockEvent {
  badgeId: BadgeId;
  zoneId: SpZoneId;
  unlockedAt: string;       // ISO 8601 timestamp
  runId?: string;            // UUID from run_logs
}
```

Stored in `RunnerProgress.badgeUnlockEvents: BadgeUnlockEvent[]`.

Change to `evaluateBadgeUnlocks()` in `badges.ts`:
- Accept `currentZoneId: SpZoneId` parameter
- When new badge unlocked, create `BadgeUnlockEvent` with zone + timestamp
- Persist to `RunnerProgress` (localStorage) + sync to Supabase `runner_progress` table

#### Rendering

- MapLibre Markers at zone center for each unlocked badge
- Icon: achievement image (`/crews/{slug}/achievements/achievement_{n}.png`) — 40px
- Sticker overlay from `/crews/{slug}/stickers/sticker_{n}.png` — decorative
- Click → tooltip: badge name, unlock date, zone name
- Cluster when zoomed out: if 2+ badges within 80px screen distance, show single cluster marker with count badge. Cluster marker = stacked achievement icons with "+N" label. Uses `supercluster` library (MapLibre standard).

### 3.3 Sublayer C: Territory Evolution

#### Weekly Snapshots — `territory_snapshots` Table

```sql
create table territory_snapshots (
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
```

#### Snapshot Trigger

Lazy snapshot on first access of new week (same pattern as ink decay):
1. On `getRunnerProgress()` call, check if `weekKey` changed since last snapshot
2. If yes, write current `inkPerZone` state to `territory_snapshots` for previous week
3. If user skipped weeks, backfill missing weeks from last known state
4. Sync to Supabase in background
5. Fallback: Supabase scheduled function (weekly cron) catches users who didn't open the app that week

#### Rendering

- Temporal slider UI (horizontal scrubber): week selector
- Zone fills change color/opacity per snapshot week
- Animation: smooth transition between weeks (300ms ease)
- Default position: current week
- Range: last 12 weeks (or all available data)

### 3.4 History Sub-Toggle UI

When HISTÓRIA layer is active, a floating toolbar appears above LayerRail:

```
┌──────────────────────────────────────┐
│  ● ROTAS    ○ CONQUISTAS    ○ TERR.  │
└──────────────────────────────────────┘
```

Same chip-button pattern as LayerRail. State stored in `MapLayerState` extension:

```typescript
interface HistorySubLayers {
  routes: boolean;
  badges: boolean;
  territory: boolean;
}
```

Persisted alongside map layer prefs in localStorage. On read, missing keys default to `true` (forward-compatible if new sublayers added later). Validation: if parsed value is not a plain object, reset to defaults.

---

## 4. Map Theming

### 4.1 Theme Interface

```typescript
interface MapTheme {
  id: 'dark' | 'light';
  label: string;
  basemapUrl: string;
  zone: {
    neutralOutlineColor: string;      // districts without crew
    neutralOutlineWidth: number;
    fillOpacityRange: [number, number];
    conqueredOutlineWidth: number;
  };
  spot: {
    strokeColor: string;
    fillColor: string;
    activeColor: string;
  };
  signal: {
    color: string;
    opacity: number;
  };
  roads: {
    color: string;
    opacity: number;
  };
  trail: {
    opacity: number;
    width: number;
  };
  history: {
    routeOpacityRecent: number;
    routeOpacityOld: number;
    badgePinBackground: string;
  };
  hud: {
    background: string;
    text: string;
    accent: string;
    border: string;
  };
  ui: {
    chrome: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    overlayBackground: string;
  };
}
```

### 4.2 Concrete Palettes

#### Dark Theme (current, formalized)

```typescript
const DARK_THEME: MapTheme = {
  id: 'dark',
  label: 'Noite',
  basemapUrl: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
  zone: {
    neutralOutlineColor: '#ffffff',
    neutralOutlineWidth: 1.5,
    fillOpacityRange: [0.08, 0.35],
    conqueredOutlineWidth: 3,
  },
  spot: { strokeColor: '#fff', fillColor: 'transparent', activeColor: '#fff' },
  signal: { color: '#C9302C', opacity: 0.6 },
  roads: { color: '#555', opacity: 0.3 },
  trail: { opacity: 0.85, width: 3 },
  history: { routeOpacityRecent: 0.7, routeOpacityOld: 0.15, badgePinBackground: 'rgba(0,0,0,0.8)' },
  hud: { background: 'rgba(0,0,0,0.85)', text: '#e8e8e8', accent: 'var(--crew-accent)', border: 'rgba(255,255,255,0.1)' },
  ui: {
    chrome: '#0a0a0a',
    surface: '#141414',
    text: '#e8e8e8',
    textMuted: '#888',
    border: 'rgba(255,255,255,0.08)',
    overlayBackground: 'rgba(0,0,0,0.92)',
  },
};
```

#### Light Theme

```typescript
const LIGHT_THEME: MapTheme = {
  id: 'light',
  label: 'Dia',
  basemapUrl: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
  zone: {
    neutralOutlineColor: '#1a1a1a',
    neutralOutlineWidth: 1.5,
    fillOpacityRange: [0.12, 0.45],
    conqueredOutlineWidth: 3,
  },
  spot: { strokeColor: '#333', fillColor: 'transparent', activeColor: '#111' },
  signal: { color: '#E04040', opacity: 0.7 },
  roads: { color: '#bbb', opacity: 0.35 },
  trail: { opacity: 0.8, width: 3 },
  history: { routeOpacityRecent: 0.65, routeOpacityOld: 0.12, badgePinBackground: 'rgba(255,255,255,0.9)' },
  hud: { background: 'rgba(255,255,255,0.92)', text: '#1a1a1a', accent: 'var(--crew-accent)', border: 'rgba(0,0,0,0.08)' },
  ui: {
    chrome: '#f5f5f0',
    surface: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#666',
    border: 'rgba(0,0,0,0.08)',
    overlayBackground: 'rgba(255,255,255,0.95)',
  },
};
```

### 4.3 Persistence

- `localStorage` key: `crewMapTheme` → `'dark' | 'light'`
- Sync to Supabase `user_preferences` table (key-value)
- Default: respect `prefers-color-scheme` media query on first visit, fallback `dark`
- On read: validate value is `'dark'` or `'light'`, fallback to default if corrupted/missing. Same validation on Supabase sync read.

### 4.4 CSS Implementation

`data-theme` attribute on `<html>` element. CSS custom properties:

```css
:root, [data-theme="dark"] {
  --ui-chrome: #0a0a0a;
  --ui-surface: #141414;
  --ui-text: #e8e8e8;
  --ui-text-muted: #888;
  --ui-border: rgba(255,255,255,0.08);
  --ui-overlay-bg: rgba(0,0,0,0.92);
  --hud-bg: rgba(0,0,0,0.85);
  --hud-text: #e8e8e8;
  --hud-border: rgba(255,255,255,0.1);
  /* --crew-accent and --crew-secondary set inline by crew context, not by theme */
}

[data-theme="light"] {
  --ui-chrome: #f5f5f0;
  --ui-surface: #ffffff;
  --ui-text: #1a1a1a;
  --ui-text-muted: #666;
  --ui-border: rgba(0,0,0,0.08);
  --ui-overlay-bg: rgba(255,255,255,0.95);
  --hud-bg: rgba(255,255,255,0.92);
  --hud-text: #1a1a1a;
  --hud-border: rgba(0,0,0,0.08);
}
```

### 4.5 MapLibre Layer Specs

Current hardcoded constants (`ZONE_FILL`, `ZONE_OUTLINE`, etc.) become factory functions:

```typescript
const buildZoneFill = (theme: MapTheme): FillLayerSpecification => ({
  id: 'sp-zone-fill',
  type: 'fill',
  source: 'sp-zones',
  paint: {
    'fill-color': ['get', 'color'],
    'fill-opacity': [
      'interpolate', ['linear'], ['get', 'ownership'],
      0, theme.zone.fillOpacityRange[0],
      1, theme.zone.fillOpacityRange[1],
    ],
  },
});
```

Rebuilt via `useMemo` when theme changes. MapGL `mapStyle` prop updated to `theme.basemapUrl`.

### 4.6 Toggle UI

- **ConfigPanel**: theme selector (dark/light cards with preview)
- **MapStage HUD**: floating toggle button (sun/moon icon), top-right near profile badge

---

## 5. 96 Districts Visual Integration

Depends on [SP Running Geo Data Pipeline](./2026-05-28-sp-running-geo-data-pipeline-design.md) for district polygon data from Supabase PostGIS.

### 5.1 District Visual States

| State | Border | Fill | Badge Overlay |
|-------|--------|------|---------------|
| Unconquered | white (dark) / black (light), 1.5px | transparent, 0.03 opacity | none |
| Partial (< 100% ink) | crew color, opacity ∝ ownership | crew color, 0.08–0.25 | none |
| Conquered (100%) | crew color, 3px solid | crew color, 0.35 | crew badge (64px) at centroid |

**Dominant crew rule:** District `dominantCrew` = crew with most total ink in that district. Tiebreaker: earliest `inkUpdatedAt` wins (first mover advantage).

### 5.2 GeoJSON Feature Properties

Each of 96 district polygons enriched with:

```json
{
  "type": "Feature",
  "properties": {
    "id": "liberdade",
    "name": "Liberdade",
    "ownership": 0.72,
    "dominantCrew": "east-burners",
    "crewColor": "#E85D2C",
    "crewBadge": "/crews/east-burners/badge_64.png",
    "conquered": false
  },
  "geometry": { "type": "Polygon", "coordinates": [...] }
}
```

### 5.3 MapLibre Paint Expressions

```javascript
// District outline color: theme neutral if no crew, crew color if claimed
'line-color': ['case',
  ['has', 'dominantCrew'], ['get', 'crewColor'],
  theme.zone.neutralOutlineColor
],
'line-width': ['case',
  ['get', 'conquered'], theme.zone.conqueredOutlineWidth,
  theme.zone.neutralOutlineWidth
],
'line-opacity': ['case',
  ['has', 'dominantCrew'],
  ['interpolate', ['linear'], ['get', 'ownership'], 0, 0.3, 1, 0.9],
  0.5
],

// District fill: transparent if unclaimed, crew color if claimed
'fill-color': ['case',
  ['has', 'dominantCrew'], ['get', 'crewColor'],
  'transparent'
],
'fill-opacity': ['case',
  ['has', 'dominantCrew'],
  ['interpolate', ['linear'], ['get', 'ownership'],
    0, theme.zone.fillOpacityRange[0],
    1, theme.zone.fillOpacityRange[1]
  ],
  0.03
]
```

### 5.4 Badge Overlay Markers

For conquered districts (`ownership >= 1.0`):
- Render crew badge (`badge_64.png`) as MapLibre Marker at district centroid
- Pulse animation on conquest event: `scale(1) → scale(1.15) → scale(1)` over 1.2s ease-in-out, plays once on first render after conquest. No continuous pulse (performance).
- Tooltip on hover: "Zona {name} — dominada por {crew.name}"

### 5.5 Transition from 5 Zones to 96 Districts

- Keep `SP_ZONE_MAP_FEATURES` (5 macro-zones) as crew home territories
- 96 districts are subdivisions — each district belongs to one macro-zone
- District `dominantCrew` initially set by macro-zone crew, shifts based on runner ink
- Macro-zone crew markers remain at zone center (live layer)
- Migration: forward-only. Existing ink data maps to districts based on zone→district membership. No retroactive GPS re-analysis. Cutover date = deployment date of 96-district feature.

---

## 6. Supabase Schema (Consolidated)

All new tables for this spec:

| Table | Purpose | RLS |
|-------|---------|-----|
| `zone_leaderboard` | Weekly rankings per zone | Read: all. Write: own rows. |
| `run_logs` | GPS traces of completed runs | Read/write: own rows only. |
| `territory_snapshots` | Weekly ink/ownership snapshots | Read/write: own rows only. |
| `user_preferences` | Theme + other preferences (key-value) | Read/write: own rows only. |

Tables from geo-data-pipeline spec (referenced, not created here):
- `sp_districts` — 96 district polygons (catalog, no org_id per ADR-001 from geo-data-pipeline spec: catalog/public reference data is exempt from multi-tenant org_id requirement)
- `sp_parks`, `sp_cycleways`, `sp_running_roads` — infrastructure

### Shared Patterns

- All user-generated tables have `organization_id` column (CLAUDE.md mandate)
- Catalog tables (sp_districts, etc.) exempt per ADR-001
- All tables have `created_at timestamptz default now()`
- RLS enabled on all tables
- Indexes on common query patterns (zone+week, user+week)

---

## 7. Testing Strategy

### Unit Tests

| Component | What to Test |
|-----------|-------------|
| `buildZoneFill(theme)` | Returns correct paint spec per theme |
| `buildZoneOutline(theme)` | Neutral vs crew outline color |
| Badge unlock enrichment | `BadgeUnlockEvent` created with zone + timestamp |
| Offline sync queue | Runs queued when offline, sent when online |
| Territory snapshot | Lazy snapshot triggers on week change |
| Theme persistence | Load/save/default behavior |

### Integration Tests

| Flow | Assertion |
|------|-----------|
| Run completion → leaderboard update | Row upserted, rank recomputed |
| Run completion → run_logs sync | GPS trace in Supabase matches local |
| Theme toggle | basemapUrl changes, CSS vars swap, layers rebuild |
| History sublayer toggle | Correct sources appear/disappear in MapGL |
| District conquest | Fill/outline/badge update when ownership hits 1.0 |

### E2E Tests

| Scenario | Steps |
|----------|-------|
| Complete run, check leaderboard | Start run → stop → open ZoneSheet → see own rank |
| Toggle theme mid-session | Open map → toggle light → verify basemap + HUD colors → toggle back |
| View history routes | Complete 2 runs → enable HISTÓRIA → ROTAS → see 2 LineStrings |
| Conquer district | Accumulate ink → district border turns crew color → badge appears at 100% |

---

## 8. ADRs

### ADR-002: Offline-First Run Logs

**Context:** Users run outdoors where connectivity is unreliable. GPS traces must not be lost.
**Decision:** Write run_logs to localStorage immediately on completion. Background sync to Supabase when online. Cap local storage at 50 runs (oldest purged after sync).
**Consequence:** Local-first reads are fast. Supabase serves as backup + enables social features (shared routes, crew history).

### ADR-003: Lazy Territory Snapshots

**Context:** Weekly snapshots needed for territory evolution timeline, but no server-side cron available.
**Decision:** Snapshot taken lazily on first `getRunnerProgress()` call of a new week. Previous week's ink state written to `territory_snapshots`.
**Consequence:** Snapshot timing is approximate (first access of new week, not midnight Sunday). Acceptable for weekly granularity.

### ADR-004: Theme-Aware Layer Factories

**Context:** MapLibre layer specs (ZONE_FILL, etc.) are currently hardcoded constants. Theming requires dynamic values.
**Decision:** Convert constants to factory functions `buildLayerSpec(theme: MapTheme)`. Rebuild via `useMemo` on theme change.
**Consequence:** Slight complexity increase. MapGL re-renders on theme change (acceptable — theme toggle is infrequent).

### ADR-005: 96 Districts Coexist with 5 Macro-Zones

**Context:** Replacing 5 zones with 96 districts could break existing crew identity.
**Decision:** Keep 5 macro-zones as crew home territories. 96 districts are subdivisions. Each district inherits initial crew from macro-zone but can shift based on runner ink.
**Consequence:** Crew identity preserved. Granular competition at district level. Macro-zone markers (live layer) remain at zone centers.
