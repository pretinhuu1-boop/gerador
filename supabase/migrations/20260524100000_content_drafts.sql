-- Content drafts — roteiros faceless gerados pelo ContentAgent
-- Each draft is a structured script (hook + beats[] + cta) tied to a user and optionally a channel.

set search_path to public;

create type content_format as enum ('short', 'long', 'reel', 'tiktok', 'flyer', 'thumbnail');
create type content_status as enum ('draft', 'approved', 'rendering', 'rendered', 'published', 'archived');

create table public.content_drafts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  channel_id        uuid references public.channels(id) on delete set null,
  session_id        uuid references public.hermes_sessions(id) on delete set null,
  format            content_format not null default 'short',
  title             text not null,
  hook              text,
  thesis            text,
  beats             jsonb not null default '[]'::jsonb,
  cta               text,
  hashtags          text[] not null default '{}',
  duration_seconds  integer,
  metadata          jsonb not null default '{}'::jsonb,
  status            content_status not null default 'draft',
  generated_by      text,
  model             text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index content_drafts_user_idx on public.content_drafts (user_id, status, created_at desc);
create index content_drafts_channel_idx on public.content_drafts (channel_id, created_at desc);
create index content_drafts_session_idx on public.content_drafts (session_id);

create trigger content_drafts_touch_updated_at
  before update on public.content_drafts
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.content_drafts enable row level security;

create policy "content_drafts_owner_all"
  on public.content_drafts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on column public.content_drafts.beats is
  'JSON array of script beats. Each beat: { t?: seconds, text: string, b_roll?: string, caption?: string, voice?: string }.';
comment on column public.content_drafts.metadata is
  'Free-form structured data — e.g. style refs, tone, target persona, voice id, render parameters.';
