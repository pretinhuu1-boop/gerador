# SP Running Geo Data Pipeline — Design Spec

**Date**: 2026-05-28
**Branch**: `feat/map-gamification`
**Status**: Draft, pending implementation plan
**Supabase project**: `redaxkkxkjgsvrinrkph` (user-provided; not yet connected to current MCP)

---

## 1. Goal

Replace hand-curated 5-zone map data in `apps/crew-running/data/spLiveMap.ts` with real São Paulo geo data ingested from public sources (OpenStreetMap via Overpass, GeoSampa, IBGE). Catalog **96 official districts** of SP plus running infrastructure (parks, cycleways, footpaths, runnable secondary roads), persisted in Supabase PostGIS, served via edge functions, rendered in MapaCidade and MapStage.

This unlocks three downstream uses simultaneously:
1. **Visual** — richer map layer with real polygons and infra
2. **Route suggestion** — segments + spots data feed recommendation
3. **Analysis** — basis for proprietary user-run heatmap (future phase)

---

## 2. Constraints

- **Multi-tenant**: app uses `organization_id` per the global Lumi rule. User-generated tables (ownership, future user runs) MUST include `organization_id`. Catalog tables (`sp_*`) are **exempt by design** because data is global and public — ADR below.
- **Free / open data only**: Overpass API (OSM), GeoSampa (Prefeitura SP), IBGE shapefiles. No Strava Metro, no paid datasets in v1.
- **Existing layer coexistence**: `MapaCidade.tsx` (SVG) and `MapStage.tsx` (MapLibre GL) both consume the same data source. Two renderers, one source of truth (`services/spGeoApi.ts`).
- **Gates**: `npm run validate` in `apps/crew-running/` must remain green (contract + typecheck + tests + build + smoke).

---

## 3. ADR-001: Catalog tables exempt from `organization_id`

**Context**: Global rule (`CLAUDE.md`) requires `organization_id` on every CRUD-touched table for tenant isolation. SP geographic catalog (districts, parks, cycleways, footpaths, runnable roads) is **immutable public data** — Vila Madalena's polygon is identical for every tenant. Adding `organization_id` would require 96 × N orgs duplicated rows for districts, breaking referential integrity with `crew_district_ownership(district_id)` FK.

**Decision**: Catalog tables (`sp_districts`, `sp_parks`, `sp_cycleways`, `sp_footpaths`, `sp_runnable_roads`) live in `public` schema **without** `organization_id`. RLS policy: `FOR SELECT TO authenticated USING (true)`. Writes are service-role only (ingest script bypasses RLS).

**Consequence**: Global rule scope is **tenant-owned data**, not global catalogs. All user-generated tables (`crew_district_ownership`, future `user_runs`, future `crew_heatmap_agg`) carry `organization_id` and RLS escope by `auth.jwt() ->> 'organization_id'`.

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Build time (manual, ~mensal)                                    │
│                                                                  │
│  Overpass API ─┐                                                 │
│  GeoSampa WFS ─┼─► scripts/ingest-sp-geo/index.mjs              │
│  IBGE districts┘     (chunked NW/NE/SW/SE, retry+backoff)        │
│                            │                                     │
│                            ▼                                     │
│                  data/sp/raw/*.geojson (commited cache)          │
│                            │                                     │
│                            ▼                                     │
│              normalize + dedupe + enrich(district_id)            │
│                            │                                     │
│                            ▼                                     │
│                Supabase service-role: batch UPSERT 1000/lote     │
│                            │                                     │
│                            ▼                                     │
│             Tippecanoe: GeoJSON → MBTiles → Supabase Storage     │
└────────────────────────────┼─────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Supabase PostGIS                                                 │
│  Catalog (public):                                               │
│    sp_districts(96)  sp_parks  sp_cycleways                      │
│    sp_footpaths      sp_runnable_roads                           │
│  User-gen (multi-tenant):                                        │
│    crew_district_ownership                                       │
│  Storage bucket:                                                 │
│    geo-tiles/sp-spots/{z}/{x}/{y}.pbf                            │
└────────────────────────────┼─────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Supabase Edge Functions                                          │
│   /sp-geo/districts        → FeatureCollection (full, ~300KB gz) │
│   /sp-geo/spots?bbox&types → bbox-filtered FeatureCollection     │
│   /sp-geo/nearby?lng,lat,r → spots ordered by distance           │
│   /sp-geo/ownership        → ranking per district (7d window)    │
│ Cache-Control headers + Cloudflare edge cache                    │
└────────────────────────────┼─────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ apps/crew-running                                                │
│                                                                  │
│  services/spGeoApi.ts      (new) fetch + TTL cache               │
│  data/spLiveMap.ts         (rewrite) loadDistricts() async       │
│  data/spGeoJSON.ts         (update) ownership-aware FC builders  │
│  components/map/MapaCidade.tsx       (update) async load + state │
│  components/map/layers/                                          │
│    ZonesLayer.tsx          (rewrite) 96 polygons                 │
│    SpotsLayer.tsx          (update)  from API                    │
│    CycleLayer.tsx          (new)     linestrings                 │
│    FootpathLayer.tsx       (new)     linestrings                 │
│    RunnableRoadsLayer.tsx  (new)     opacity ∝ runnability_score │
│  components/map/MapStage.tsx (update) MVT source from Storage    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Data model (PostGIS)

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Catalog tables (public, no `organization_id`)

```sql
CREATE TABLE sp_districts (
  id              text PRIMARY KEY,         -- IBGE district code (ex 'BELA_VISTA')
  name            text NOT NULL,
  subprefecture   text NOT NULL,
  region          text NOT NULL,            -- 'CENTRO'|'NORTE'|'SUL'|'LESTE'|'OESTE'
  geometry        geometry(Polygon, 4326) NOT NULL,
  centroid        geometry(Point, 4326) GENERATED ALWAYS AS (ST_Centroid(geometry)) STORED,
  area_km2        numeric GENERATED ALWAYS AS (ST_Area(geometry::geography)/1e6) STORED,
  source          text NOT NULL,            -- 'IBGE_2022'|'GEOSAMPA'
  imported_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sp_districts_geom_gist ON sp_districts USING GIST (geometry);
CREATE INDEX sp_districts_region    ON sp_districts (region);

CREATE TABLE sp_parks (
  id              text PRIMARY KEY,         -- OSM 'way/123' or GeoSampa id
  name            text NOT NULL,
  geometry        geometry(MultiPolygon, 4326) NOT NULL,
  district_id     text REFERENCES sp_districts(id),
  tags            jsonb NOT NULL DEFAULT '{}',
  source          text NOT NULL,
  imported_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sp_parks_geom_gist  ON sp_parks USING GIST (geometry);
CREATE INDEX sp_parks_district   ON sp_parks (district_id);
CREATE INDEX sp_parks_name_trgm  ON sp_parks USING gin (name gin_trgm_ops);

CREATE TABLE sp_cycleways (
  id              text PRIMARY KEY,
  name            text,
  geometry        geometry(LineString, 4326) NOT NULL,
  surface         text,
  length_m        numeric GENERATED ALWAYS AS (ST_Length(geometry::geography)) STORED,
  district_id     text REFERENCES sp_districts(id),
  tags            jsonb NOT NULL DEFAULT '{}',
  source          text NOT NULL,
  imported_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sp_cycleways_geom_gist ON sp_cycleways USING GIST (geometry);
CREATE INDEX sp_cycleways_district  ON sp_cycleways (district_id);

CREATE TABLE sp_footpaths (
  id              text PRIMARY KEY,
  name            text,
  geometry        geometry(LineString, 4326) NOT NULL,
  surface         text,
  length_m        numeric GENERATED ALWAYS AS (ST_Length(geometry::geography)) STORED,
  district_id     text REFERENCES sp_districts(id),
  tags            jsonb NOT NULL DEFAULT '{}',
  source          text NOT NULL,
  imported_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sp_footpaths_geom_gist ON sp_footpaths USING GIST (geometry);
CREATE INDEX sp_footpaths_district  ON sp_footpaths (district_id);

CREATE TABLE sp_runnable_roads (
  id                  text PRIMARY KEY,
  name                text,
  geometry            geometry(LineString, 4326) NOT NULL,
  highway_type        text NOT NULL,           -- 'residential'|'unclassified'|'living_street'
  length_m            numeric GENERATED ALWAYS AS (ST_Length(geometry::geography)) STORED,
  district_id         text REFERENCES sp_districts(id),
  tags                jsonb NOT NULL DEFAULT '{}',
  runnability_score   numeric NOT NULL DEFAULT 0,  -- 0-1
  source              text NOT NULL,
  imported_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sp_runnable_roads_geom_gist ON sp_runnable_roads USING GIST (geometry);
CREATE INDEX sp_runnable_roads_district  ON sp_runnable_roads (district_id);
CREATE INDEX sp_runnable_roads_score     ON sp_runnable_roads (runnability_score DESC);

-- RLS: read pública pra authenticated
ALTER TABLE sp_districts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_parks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_cycleways        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_footpaths        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_runnable_roads   ENABLE ROW LEVEL SECURITY;

CREATE POLICY sp_districts_read      ON sp_districts      FOR SELECT TO authenticated USING (true);
CREATE POLICY sp_parks_read          ON sp_parks          FOR SELECT TO authenticated USING (true);
CREATE POLICY sp_cycleways_read      ON sp_cycleways      FOR SELECT TO authenticated USING (true);
CREATE POLICY sp_footpaths_read      ON sp_footpaths      FOR SELECT TO authenticated USING (true);
CREATE POLICY sp_runnable_roads_read ON sp_runnable_roads FOR SELECT TO authenticated USING (true);
```

### User-gen tables (multi-tenant)

```sql
CREATE TABLE crew_district_ownership (
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  district_id      text NOT NULL REFERENCES sp_districts(id),
  ownership_score  numeric NOT NULL DEFAULT 0,
  last_updated     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, district_id)
);
CREATE INDEX crew_ownership_org    ON crew_district_ownership (organization_id);
CREATE INDEX crew_ownership_score  ON crew_district_ownership (district_id, ownership_score DESC);

ALTER TABLE crew_district_ownership ENABLE ROW LEVEL SECURITY;

CREATE POLICY crew_ownership_read ON crew_district_ownership
  FOR SELECT TO authenticated USING (true);

CREATE POLICY crew_ownership_write ON crew_district_ownership
  FOR ALL TO authenticated
  USING       (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK  (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

### Migration files

```
apps/crew-running/db/migrations/
  20260528_001_sp_geo_catalog_up.sql      # extensions + sp_* tables + RLS
  20260528_001_sp_geo_catalog_down.sql    # drop tables (FK-aware order)
  20260528_002_crew_ownership_up.sql      # crew_district_ownership + RLS
  20260528_002_crew_ownership_down.sql    # drop
```

Both UP and DOWN are required per global rule.

---

## 6. Ingest pipeline

### Directory layout

```
apps/crew-running/scripts/ingest-sp-geo/
  index.mjs                 # orchestrator. CLI: --only, --skip-cache, --dry-run, --quadrants
  sources/
    overpass.mjs            # Overpass client; chunked NW/NE/SW/SE; retry+backoff
    geosampa.mjs            # GeoSampa WFS client
    ibge.mjs                # IBGE 2022 districts shapefile downloader+parser
  normalize/
    districts.mjs
    parks.mjs
    cycleways.mjs
    footpaths.mjs
    runnable-roads.mjs      # applies runnabilityScore + filters >= 0.5
  persist/
    supabase.mjs            # service-role client; batch UPSERT 1000/lote
  tiles/
    tippecanoe.mjs          # invokes tippecanoe CLI; uploads MBTiles to Storage
  __fixtures__/
    overpass-sample.json    # ~50KB real NW quadrant for tests
```

### Overpass chunking

```js
const SP_QUADRANTS = [
  { name: 'NW', bbox: [-46.85, -23.50, -46.62, -23.30] },
  { name: 'NE', bbox: [-46.62, -23.50, -46.35, -23.30] },
  { name: 'SW', bbox: [-46.85, -23.80, -46.62, -23.50] },
  { name: 'SE', bbox: [-46.62, -23.80, -46.35, -23.50] },
];
```

Dedupe by OSM id (`way/123`) when joining quadrants — features at boundary appear in both.

### Runnability heuristic

```js
function runnabilityScore(way) {
  let score = 0.3;                                         // residential base
  if (way.tags.highway === 'living_street')   score += 0.3;
  if (way.tags.sidewalk === 'both')            score += 0.2;
  if (way.tags.maxspeed && +way.tags.maxspeed <= 30) score += 0.2;
  if (way.tags.surface === 'asphalt')          score += 0.1;
  if (way.tags.lit === 'yes')                  score += 0.1;
  if (way.tags.foot === 'no' || way.tags.foot === 'private') return 0;
  return Math.min(score, 1);
}
// Persist only rows with score >= 0.5 → ~30k roads, not 200k.
```

### Idempotência

- Cache local em `apps/crew-running/data/sp/raw/{type}-{quadrant}.geojson` — commited to git
- `.gitattributes`: `apps/crew-running/data/sp/raw/*.geojson linguist-generated=true`
- UPSERT por `id` (OSM/IBGE stable id) → safe re-run
- Overpass retry: exponential backoff 1s/2s/4s/8s, max 5 tries; log error per failed quadrant and continue

### npm scripts

```json
{
  "ingest:sp": "node scripts/ingest-sp-geo/index.mjs",
  "ingest:sp:districts": "node scripts/ingest-sp-geo/index.mjs --only=districts",
  "ingest:sp:dry": "node scripts/ingest-sp-geo/index.mjs --dry-run",
  "ingest:sp:tiles": "node scripts/ingest-sp-geo/tiles/tippecanoe.mjs"
}
```

**Tippecanoe execution model**: by default `ingest:sp` invokes Tippecanoe automatically after persist completes (single command end-to-end). Standalone `ingest:sp:tiles` exists for re-generating tiles without re-fetching catalog data (cheap iteration on tile compression/zoom levels). Flag `--no-tiles` skips Tippecanoe step in main command.

### Dev mode

`INGEST_QUADRANTS=NW npm run ingest:sp` → 1 quadrante < 1min para iteração local.

### Secrets

Service role key lê de `.env.local` (gitignored). Never from `.env` (deployed). Script roda **local**, na máquina do dev.

---

## 7. API + tiles

### Edge functions

```
GET /functions/v1/sp-geo/districts
  Returns: FeatureCollection<Polygon, DistrictProps>  (~300KB gzip)
  Cache-Control: public, max-age=86400

GET /functions/v1/sp-geo/spots?bbox=lng1,lat1,lng2,lat2&types=park,cycleway,footpath,road
  Returns: FeatureCollection<Mixed>
  Cache-Control: public, max-age=3600
  Implementation: ST_Intersects(geometry, ST_MakeEnvelope(bbox, 4326))
  Limit 5000 features; paginate via cursor if exceeded

GET /functions/v1/sp-geo/nearby?lng=&lat=&radius_m=&types=
  Returns: ranked spots
  Implementation: ST_DWithin(geometry, ST_MakePoint(lng,lat)::geography, radius_m)
  ORDER BY ST_Distance ASC LIMIT 50

GET /functions/v1/sp-geo/ownership
  Returns: { [district_id]: { topCrew: {...}, ranking: [...3] } }
  Cache-Control: public, max-age=300
  Implementation: 7-day decay window (see Section 8)
```

### Tiles (MVT)

For high-zoom rendering of 50k+ spots/roads/cycle features, MapLibre consumes MVT tiles.

```
ingest-sp-geo (after persist)
  ↓
spawns tippecanoe (CLI, brew install tippecanoe)
  ↓
generates: sp-spots.mbtiles, sp-roads.mbtiles, sp-cycle.mbtiles
  ↓
uploads to Supabase Storage public bucket `geo-tiles/`
  ↓
MapLibre source URL: https://{project}.supabase.co/storage/v1/object/public/geo-tiles/sp-spots/{z}/{x}/{y}.pbf
```

Districts (96 features) served as plain GeoJSON; only Tippecanoe for high-cardinality layers.

### Client wrapper

`apps/crew-running/services/spGeoApi.ts`:

```ts
type Bbox = [number, number, number, number];

export interface SpGeoApi {
  fetchDistricts(): Promise<FeatureCollection<Polygon, DistrictProps>>;
  fetchSpots(bbox: Bbox, types: SpotType[]): Promise<FeatureCollection<Geometry, SpotProps>>;
  fetchNearby(lng: number, lat: number, radius_m: number, types: SpotType[]): Promise<NearbySpot[]>;
  fetchOwnership(): Promise<Record<string, OwnershipEntry>>;
}
// In-memory TTL cache:
//   districts: 24h
//   spots-bbox: 1h (key = quantized bbox)
//   ownership:  5min
//   nearby:    30s
```

---

## 8. MapaCidade integration

### Ownership decay (7 days)

```sql
-- Edge fn /sp-geo/ownership pseudo-query:
SELECT
  district_id,
  organization_id,
  SUM(ownership_score) AS score
FROM crew_district_ownership
WHERE last_updated >= now() - interval '7 days'
GROUP BY district_id, organization_id
ORDER BY district_id, score DESC;
-- Pick top 3 per district. Districts with zero recent contribution = neutral.
```

### Crew model migration (5 → N)

| Before | After |
|--------|-------|
| 5 hard-coded crews (`downtown-rush`, `north-breakers`, etc) | N crews (one per organization) |
| 1 crew owns 1 zone | N crews compete per district; top-3 colored |
| Static `ownership` constant | `crew_district_ownership` table, decay 7d |
| Region = zone | Region (`CENTRO`/`NORTE`/...) preserved as macro filter via `sp_districts.region` |

**5 historical crew slugs → macroregion mapping** (documented mapping, not column rename):

| Crew slug (legacy) | `sp_districts.region` value |
|--------------------|-----------------------------|
| `downtown-rush`    | `CENTRO`                    |
| `north-breakers`   | `NORTE`                     |
| `south-striders`   | `SUL`                       |
| `east-burners`     | `LESTE`                     |
| `west-flow`        | `OESTE`                     |

This mapping lives in `data/crewRegionMap.ts` (new constant). Legacy UI calling `crewSlug === 'downtown-rush'` continues to work; new code groups by `region` directly. Crews are now per-organization (each org has its own crew identity, not bound to one of the 5 slugs). The 5 slugs persist only as macroregion display filters / legacy art assets (character sheets in `runner-crew-sheets/`).

### Files modified

```
apps/crew-running/data/spLiveMap.ts          (REWRITE)
  - Remove SP_ZONE_MAP_FEATURES const
  - Export loadDistricts(): Promise<DistrictFeature[]>
  - Export SP_DISTRICTS_STUB (single placeholder for SSR/loading)

apps/crew-running/data/spGeoJSON.ts          (UPDATE)
  - toDistrictsGeoJSON(districts, ownership?) replaces toZonesGeoJSON

apps/crew-running/components/map/MapaCidade.tsx  (UPDATE)
  - useEffect → spGeoApi.fetchDistricts() on mount
  - Loading skeleton, error fallback (stub + retry)
  - Memoize 96-feature FC

apps/crew-running/components/map/layers/
  ZonesLayer.tsx         (REWRITE) renders 96 polygons; event delegation
  SpotsLayer.tsx         (UPDATE) consumes spots GeoJSON via spGeoApi
  CycleLayer.tsx         (NEW)
  FootpathLayer.tsx      (NEW)
  RunnableRoadsLayer.tsx (NEW) opacity ∝ runnability_score

apps/crew-running/components/map/MapStage.tsx (UPDATE)
  - Replace dummy raster source with MVT vector source from Storage
  - Add layers: districts (fill), spots (circle), cycle (line), roads (line)

apps/crew-running/services/spGeoApi.ts        (NEW)
apps/crew-running/services/__tests__/spGeoApi.test.ts (NEW)
```

### Performance budget

| Concern | Budget |
|---------|--------|
| First fetch districts (cold) | < 500ms |
| First fetch districts (cached) | < 50ms |
| ZonesLayer SVG render 96 polygons | < 50ms |
| MapLibre 50k MVT tile decode + paint | < 100ms |
| Client memory extra | < 30MB |

---

## 9. Testing strategy

### Schema migration

- Manual gate: run UP → `list_tables` confirms creation → run DOWN → tables removed → re-run UP → idempotent
- No automated PostGIS test framework in repo — manual review required before remote apply

### Ingest unit (vitest env=node)

```
scripts/ingest-sp-geo/normalize/runnable-roads.test.ts
  - Marginal Tietê (highway=trunk) → score = 0 (rejected)
  - Residential + sidewalk=both + maxspeed=30 → score > 0.7
  - Footway → ignored (different table)
  - foot=no → score = 0

scripts/ingest-sp-geo/normalize/districts.test.ts
  - IBGE shapefile fixture (1 mock district) → row tipada

scripts/ingest-sp-geo/sources/overpass.test.ts
  - Mock fetch; assert bbox query string per quadrant
  - Retry on 429/503 with backoff
  - Failure after 5 tries → throws QuadrantFailedError
```

### Ingest integration (mocked Supabase)

```
scripts/ingest-sp-geo/index.test.mjs
  - Orchestrator calls sources in order
  - persist receives batches of 1000 rows max
  - Failed quadrant logs error but does not halt
  - Dry-run mode does not call persist
```

### spGeoApi unit (vitest env=node)

```
services/spGeoApi.test.ts (100% target)
  - Mock fetch global
  - TTL respected (clock locked; second call hits cache)
  - bbox query string formatted correctly
  - 5xx → retry with backoff
  - 404 → returns null (not throw)
```

### Component unit (vitest env=happy-dom)

```
components/map/__tests__/MapaCidade.test.tsx     (UPDATE)
  - Loading skeleton during async fetch
  - 96 SVG paths once districts loaded
  - Error → fallback stub visible + retry button

components/map/layers/__tests__/ZonesLayer.test.tsx       (REWRITE)
  - Renders FeatureCollection of 96 → 96 <path> nodes
  - data-district-id attribute present

components/map/layers/__tests__/CycleLayer.test.tsx       (NEW)
components/map/layers/__tests__/RunnableRoadsLayer.test.tsx (NEW)
  - opacity ∝ runnability_score (score=0.5 → opacity=0.5, score=1 → opacity=1)
```

### Ownership

```
services/crewService.test.ts (UPDATE)
  - 7d decay: rows with last_updated > 7d ago excluded
  - Cross-org READ visible (no org filter on SELECT)
  - Cross-org WRITE blocked (RLS denial)
```

### E2E (Playwright via MCP)

**Smoke** (runs in PR, ~30s):
```
e2e/sp-geo/mapa-cidade-loads.spec.ts
  - Mock spGeoApi → 96 fake districts
  - Open HomePanel; assert 96 SVG paths
  - Click distrito → info card
  - Loading skeleton visible during mock delay
```

**Full pipeline** (runs in release branch, ~3min):
```
e2e/sp-geo/full-pipeline.spec.ts
  - supabase start (local stack)
  - Run ingest with small fixture (1 quadrant)
  - Verify SQL row counts in sp_* tables
  - Boot app pointing to local Supabase
  - Hit /sp-geo/districts → returns seeded districts
  - Render MapaCidade
  - Click distrito X → ownership endpoint called → ranking visible
```

**Ownership decay** (runs in PR, ~30s):
```
e2e/sp-geo/ownership-decay.spec.ts
  - Seed: 2 crews, 3 districts, runs at D-1, D-8, D-30
  - Hit /sp-geo/ownership
  - Crew A (D-1) = rank 1
  - Crew B (D-8, D-30) = neutral (decayed)
```

**Visual regression** (optional, runs in PR, ~15s):
```
e2e/sp-geo/visual-regression.spec.ts
  - Snapshot MapaCidade SVG in 3 states (loading, populated, error)
  - preview_screenshot via MCP
  - Pixel-diff toMatchSnapshot, threshold 5%
```

### Coverage targets

| Layer | Target |
|-------|--------|
| Migration | UP/DOWN tested manually; smoke verifies tables exist |
| Ingest | ≥80% unit + full-pipeline E2E happy path |
| spGeoApi | 100% unit + smoke E2E mock |
| Components | ≥70% unit + smoke E2E |
| Ownership | unit + ownership-decay E2E |

### Gates

- `npm run validate` (contract + typecheck + tests + build + smoke) must stay green
- vitest cache reset (`rm -rf node_modules/.vite*`) before validate if flaky
- Service role key never enters CI — full-pipeline E2E uses local Supabase

---

## 10. Open items (defer to implementation plan)

- Supabase MCP connection to `redaxkkxkjgsvrinrkph` — needs user to run `claude mcp add` + authenticate
- Schema inspection on the user's existing DB to detect collisions with `sp_*` or `crew_district_ownership` table names
- Tippecanoe install on dev machines — document in `apps/crew-running/CLAUDE.md` setup section
- Local Supabase stack (`supabase start`) docker requirement — document
- Auth: where does `organization_id` JWT claim come from today? — investigate during implementation
- Decision: anonymous users see map (read-only) or login-gated? — default: authenticated-only, revisit
- Migration of existing 5-zone data → can the 5 macroregions populate from `sp_districts.region` GROUP BY? Confirm during ingest.

---

## 11. Out of scope (this spec)

- Strava Metro integration (paid/partner data) — future phase
- User-generated run heatmap aggregation (`crew_heatmap_agg`) — needs `user_runs` persisted first, future phase
- Route suggestion algorithm (Dijkstra on segments) — separate spec after data lands
- Mobile native rendering — out of repo scope (web app only)
- Scheduled re-ingest (Vercel cron or Supabase scheduled fn) — start manual, automate later

---

## 12. Sign-off

Approved sections:
- [x] Section 1 — Architecture (multi-tenant baked in)
- [x] Section 2 — Data model (PostGIS schema)
- [x] Section 3 — Ingest pipeline (+ 2 ajustes: runnabilityScore tests + INGEST_QUADRANTS dev mode)
- [x] Section 4 — API + tiles (edge fns + Tippecanoe MVT)
- [x] Section 5 — MapaCidade integration (decay 7d)
- [x] Section 6 — Testing strategy (with full E2E)

Next: implementation plan via `superpowers:writing-plans`.
