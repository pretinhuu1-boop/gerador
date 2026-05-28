-- Channel OS — initial schema
-- Tables: profiles, channels, channel_metrics, channel_videos,
--         hermes_sessions, hermes_messages, hermes_memory,
--         scout_runs, scout_run_channels

set search_path to public;

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================
-- ENUMs
-- ============================================================
create type platform_kind as enum ('youtube', 'tiktok', 'instagram');
create type channel_status as enum ('tracking', 'archived', 'deleted');
create type workspace_kind as enum ('scout', 'content', 'channel', 'publisher', 'mixed');
create type message_role as enum ('user', 'assistant', 'tool', 'system');
create type memory_kind as enum ('preference', 'fact', 'goal', 'channel_pin', 'rule');
create type run_status as enum ('queued', 'running', 'done', 'error', 'cancelled');

-- ============================================================
-- updated_at helper
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- profiles (mirrors auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  avatar_url    text,
  preferences   jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- channels
-- ============================================================
create table public.channels (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  platform          platform_kind not null,
  platform_id       text not null,
  handle            text,
  title             text not null,
  description       text,
  thumbnail_url     text,
  country           text,
  language          text,
  subscriber_count  bigint default 0,
  view_count        bigint default 0,
  video_count       integer default 0,
  status            channel_status not null default 'tracking',
  score             numeric(5,2),
  score_breakdown   jsonb not null default '{}'::jsonb,
  tags              text[] not null default '{}',
  notes             text,
  last_fetched_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, platform, platform_id)
);

create index channels_user_id_idx on public.channels (user_id);
create index channels_user_platform_idx on public.channels (user_id, platform);
create index channels_user_score_idx on public.channels (user_id, score desc nulls last);
create index channels_user_status_idx on public.channels (user_id, status);

create trigger channels_touch_updated_at
  before update on public.channels
  for each row execute function public.touch_updated_at();

-- ============================================================
-- channel_metrics (time series)
-- ============================================================
create table public.channel_metrics (
  id                uuid primary key default gen_random_uuid(),
  channel_id        uuid not null references public.channels(id) on delete cascade,
  captured_at       timestamptz not null default now(),
  subscriber_count  bigint,
  view_count        bigint,
  video_count       integer,
  score             numeric(5,2),
  extra             jsonb not null default '{}'::jsonb
);

create index channel_metrics_channel_captured_idx
  on public.channel_metrics (channel_id, captured_at desc);

-- ============================================================
-- channel_videos
-- ============================================================
create table public.channel_videos (
  id                  uuid primary key default gen_random_uuid(),
  channel_id          uuid not null references public.channels(id) on delete cascade,
  platform_video_id   text not null,
  title               text not null,
  description         text,
  thumbnail_url       text,
  published_at        timestamptz,
  duration_seconds    integer,
  view_count          bigint default 0,
  like_count          bigint default 0,
  comment_count       bigint default 0,
  extra               jsonb not null default '{}'::jsonb,
  fetched_at          timestamptz not null default now(),
  unique (channel_id, platform_video_id)
);

create index channel_videos_channel_published_idx
  on public.channel_videos (channel_id, published_at desc nulls last);
create index channel_videos_channel_views_idx
  on public.channel_videos (channel_id, view_count desc);

-- ============================================================
-- hermes_sessions
-- ============================================================
create table public.hermes_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  title           text,
  workspace_kind  workspace_kind not null default 'mixed',
  context         jsonb not null default '{}'::jsonb,
  last_message_at timestamptz,
  archived        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index hermes_sessions_user_idx
  on public.hermes_sessions (user_id, archived, last_message_at desc nulls last);

create trigger hermes_sessions_touch_updated_at
  before update on public.hermes_sessions
  for each row execute function public.touch_updated_at();

-- ============================================================
-- hermes_messages
-- ============================================================
create table public.hermes_messages (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.hermes_sessions(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          message_role not null,
  content       text,
  tool_calls    jsonb,
  tool_call_id  text,
  agent_name    text,
  model         text,
  usage         jsonb,
  created_at    timestamptz not null default now()
);

create index hermes_messages_session_created_idx
  on public.hermes_messages (session_id, created_at);
create index hermes_messages_user_created_idx
  on public.hermes_messages (user_id, created_at desc);

-- ============================================================
-- hermes_memory (persistent pins)
-- ============================================================
create table public.hermes_memory (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  kind                memory_kind not null,
  content             text not null,
  metadata            jsonb not null default '{}'::jsonb,
  importance          smallint not null default 3 check (importance between 1 and 5),
  active              boolean not null default true,
  source_session_id   uuid references public.hermes_sessions(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index hermes_memory_user_active_idx
  on public.hermes_memory (user_id, active, importance desc);
create index hermes_memory_user_kind_idx
  on public.hermes_memory (user_id, kind);

create trigger hermes_memory_touch_updated_at
  before update on public.hermes_memory
  for each row execute function public.touch_updated_at();

-- ============================================================
-- scout_runs
-- ============================================================
create table public.scout_runs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  session_id      uuid references public.hermes_sessions(id) on delete set null,
  query           text,
  parameters      jsonb not null default '{}'::jsonb,
  status          run_status not null default 'queued',
  started_at      timestamptz,
  ended_at        timestamptz,
  results_count   integer not null default 0,
  error           text,
  created_at      timestamptz not null default now()
);

create index scout_runs_user_created_idx
  on public.scout_runs (user_id, created_at desc);
create index scout_runs_user_status_idx
  on public.scout_runs (user_id, status);

-- ============================================================
-- scout_run_channels (M2M: which channels appeared in a run)
-- ============================================================
create table public.scout_run_channels (
  run_id      uuid not null references public.scout_runs(id) on delete cascade,
  channel_id  uuid not null references public.channels(id) on delete cascade,
  score       numeric(5,2),
  rank        integer,
  primary key (run_id, channel_id)
);

create index scout_run_channels_channel_idx on public.scout_run_channels (channel_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.channels            enable row level security;
alter table public.channel_metrics     enable row level security;
alter table public.channel_videos      enable row level security;
alter table public.hermes_sessions     enable row level security;
alter table public.hermes_messages     enable row level security;
alter table public.hermes_memory       enable row level security;
alter table public.scout_runs          enable row level security;
alter table public.scout_run_channels  enable row level security;

-- profiles: each user sees / edits only their own
create policy "profiles_self_read"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_self_update"
  on public.profiles for update to authenticated
  using (id = auth.uid());

-- channels
create policy "channels_owner_all"
  on public.channels for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- channel_metrics: derived from channels (check via channel_id ownership)
create policy "channel_metrics_owner_select"
  on public.channel_metrics for select to authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = channel_metrics.channel_id and c.user_id = auth.uid()
    )
  );
create policy "channel_metrics_owner_insert"
  on public.channel_metrics for insert to authenticated
  with check (
    exists (
      select 1 from public.channels c
      where c.id = channel_metrics.channel_id and c.user_id = auth.uid()
    )
  );

-- channel_videos: same pattern
create policy "channel_videos_owner_select"
  on public.channel_videos for select to authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = channel_videos.channel_id and c.user_id = auth.uid()
    )
  );
create policy "channel_videos_owner_write"
  on public.channel_videos for all to authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = channel_videos.channel_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.channels c
      where c.id = channel_videos.channel_id and c.user_id = auth.uid()
    )
  );

-- hermes_sessions
create policy "hermes_sessions_owner_all"
  on public.hermes_sessions for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- hermes_messages
create policy "hermes_messages_owner_all"
  on public.hermes_messages for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- hermes_memory
create policy "hermes_memory_owner_all"
  on public.hermes_memory for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- scout_runs
create policy "scout_runs_owner_all"
  on public.scout_runs for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- scout_run_channels (derived via run)
create policy "scout_run_channels_owner_all"
  on public.scout_run_channels for all to authenticated
  using (
    exists (
      select 1 from public.scout_runs r
      where r.id = scout_run_channels.run_id and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.scout_runs r
      where r.id = scout_run_channels.run_id and r.user_id = auth.uid()
    )
  );

-- ============================================================
-- Convenience view: latest metric per channel
-- ============================================================
create or replace view public.channels_with_latest_metric as
select
  c.*,
  m.captured_at         as latest_metric_at,
  m.subscriber_count    as latest_subscriber_count,
  m.view_count          as latest_view_count
from public.channels c
left join lateral (
  select cm.*
  from public.channel_metrics cm
  where cm.channel_id = c.id
  order by cm.captured_at desc
  limit 1
) m on true;

comment on view public.channels_with_latest_metric is
  'Channels joined with the most recent metric snapshot (lateral, fast).';
