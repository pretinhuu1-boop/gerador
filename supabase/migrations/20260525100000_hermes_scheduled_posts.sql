-- Scheduled posts — Publisher agent stages content for multi-platform publish.
-- OAuth integrations stay as stubs for now; the row is the source of truth.
-- Prefixed hermes_ to avoid colliding with the Taura legacy scheduled_posts table.

create type hermes_scheduled_post_platform as enum ('youtube', 'tiktok', 'instagram');
create type hermes_scheduled_post_status as enum (
  'scheduled', 'publishing', 'published', 'failed', 'cancelled'
);

create table public.hermes_scheduled_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  draft_id        uuid references public.content_drafts(id) on delete set null,
  render_id       uuid references public.content_renders(id) on delete set null,
  channel_id      uuid references public.channels(id) on delete set null,
  platform        hermes_scheduled_post_platform not null,
  title           text not null,
  description     text,
  hashtags        text[] not null default '{}',
  scheduled_for   timestamptz not null,
  status          hermes_scheduled_post_status not null default 'scheduled',
  external_id     text,
  external_url    text,
  error           text,
  retry_count     smallint not null default 0,
  metadata        jsonb not null default '{}'::jsonb,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index hermes_scheduled_posts_user_status_idx
  on public.hermes_scheduled_posts (user_id, status, scheduled_for);
create index hermes_scheduled_posts_due_idx
  on public.hermes_scheduled_posts (status, scheduled_for) where status = 'scheduled';
create index hermes_scheduled_posts_draft_idx
  on public.hermes_scheduled_posts (draft_id);

create trigger hermes_scheduled_posts_touch_updated_at
  before update on public.hermes_scheduled_posts
  for each row execute function public.touch_updated_at();

alter table public.hermes_scheduled_posts enable row level security;

create policy "hermes_scheduled_posts_owner_all"
  on public.hermes_scheduled_posts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on table public.hermes_scheduled_posts is
  'Publisher agent queue — staged posts per platform. Worker (TBD) picks status=scheduled rows whose scheduled_for <= now() and does the actual platform upload.';
