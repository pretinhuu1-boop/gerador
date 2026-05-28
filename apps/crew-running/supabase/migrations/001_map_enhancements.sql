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
