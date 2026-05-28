-- content_renders — tracks each MP4 render job
create type render_status as enum (
  'queued', 'tts', 'rendering', 'uploading', 'rendered', 'error', 'cancelled'
);

create table public.content_renders (
  id              uuid primary key default gen_random_uuid(),
  draft_id        uuid not null references public.content_drafts(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  status          render_status not null default 'queued',
  voice_id        text,
  quality         text not null default 'preview',
  mp4_url         text,
  audio_urls      jsonb not null default '[]'::jsonb,
  duration_s      numeric(6,2),
  size_bytes      bigint,
  progress        smallint not null default 0 check (progress between 0 and 100),
  stage           text,
  error           text,
  retry_count     smallint not null default 0,
  started_at      timestamptz,
  ended_at        timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index content_renders_user_status_idx
  on public.content_renders (user_id, status, created_at desc);
create index content_renders_draft_idx
  on public.content_renders (draft_id, created_at desc);
create index content_renders_retry_idx
  on public.content_renders (status, retry_count) where status = 'error';

create trigger content_renders_touch_updated_at
  before update on public.content_renders
  for each row execute function public.touch_updated_at();

alter table public.content_renders enable row level security;

create policy "content_renders_owner_all"
  on public.content_renders for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on column public.content_renders.audio_urls is
  'Array of {beat_index, url, duration_s} for the synthesized TTS clips.';
comment on column public.content_renders.stage is
  'Free-form latest stage string for UI ("synthesizing beat 3 of 8", "rendering frame 240").';
