-- Missions framework — multi-step pipelines orchestrated by Hermes.
-- Prefixed with `hermes_` to avoid collision with the pre-existing Taura
-- `missions` table (different application on the same Postgres).

create type hermes_mission_status as enum (
  'draft', 'planning', 'approved', 'running', 'paused', 'done', 'error', 'cancelled'
);

create type hermes_mission_step_status as enum (
  'pending', 'running', 'done', 'error', 'skipped', 'cancelled'
);

create table public.hermes_missions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  session_id      uuid references public.hermes_sessions(id) on delete set null,
  title           text not null,
  brief           text not null,
  plan            jsonb not null default '{}'::jsonb,
  status          hermes_mission_status not null default 'draft',
  progress        smallint not null default 0 check (progress between 0 and 100),
  outputs         jsonb not null default '{}'::jsonb,
  metadata        jsonb not null default '{}'::jsonb,
  total_steps     smallint not null default 0,
  done_steps      smallint not null default 0,
  started_at      timestamptz,
  ended_at        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index hermes_missions_user_status_idx
  on public.hermes_missions (user_id, status, created_at desc);
create index hermes_missions_session_idx
  on public.hermes_missions (session_id, created_at desc);

create trigger hermes_missions_touch_updated_at
  before update on public.hermes_missions
  for each row execute function public.touch_updated_at();

create table public.hermes_mission_steps (
  id              uuid primary key default gen_random_uuid(),
  mission_id      uuid not null references public.hermes_missions(id) on delete cascade,
  step_index      smallint not null,
  title           text not null,
  agent_key       text not null,
  tool_name       text,
  tool_args       jsonb not null default '{}'::jsonb,
  depends_on      smallint[],
  status          hermes_mission_step_status not null default 'pending',
  result          jsonb,
  error           text,
  started_at      timestamptz,
  ended_at        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (mission_id, step_index)
);

create index hermes_mission_steps_mission_idx
  on public.hermes_mission_steps (mission_id, step_index);
create index hermes_mission_steps_status_idx
  on public.hermes_mission_steps (status);

create trigger hermes_mission_steps_touch_updated_at
  before update on public.hermes_mission_steps
  for each row execute function public.touch_updated_at();

create table public.hermes_custom_agents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  key             text not null,
  name            text not null,
  badge           text not null,
  badge_color     text not null default '#a855f7',
  role            text,
  description     text,
  model           text not null,
  system_prompt   text not null,
  allowed_tools   text[] not null default '{}',
  temperature     numeric(3,2) not null default 0.6,
  active          boolean not null default true,
  created_by_mission uuid references public.hermes_missions(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, key)
);

create index hermes_custom_agents_user_idx
  on public.hermes_custom_agents (user_id, active);

create trigger hermes_custom_agents_touch_updated_at
  before update on public.hermes_custom_agents
  for each row execute function public.touch_updated_at();

alter table public.hermes_missions       enable row level security;
alter table public.hermes_mission_steps  enable row level security;
alter table public.hermes_custom_agents  enable row level security;

create policy "hermes_missions_owner_all"
  on public.hermes_missions for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "hermes_mission_steps_owner_all"
  on public.hermes_mission_steps for all to authenticated
  using (
    exists (select 1 from public.hermes_missions m
            where m.id = hermes_mission_steps.mission_id and m.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.hermes_missions m
            where m.id = hermes_mission_steps.mission_id and m.user_id = auth.uid())
  );

create policy "hermes_custom_agents_owner_all"
  on public.hermes_custom_agents for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on column public.hermes_missions.plan is
  'JSON plan: {steps: [{step_index, title, agent_key, tool_name, tool_args, depends_on?}]}';
comment on column public.hermes_missions.outputs is
  'Aggregated outputs from steps — e.g. {draft_ids: [...], render_ids: [...]}';
