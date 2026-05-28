-- OAuth connections per user per platform. Holds tokens needed to upload
-- videos to YouTube/TikTok/Instagram on behalf of the user.
--
-- Security note: access_token + refresh_token are stored in the clear here
-- — for production add Supabase Vault (pgsodium) and reference encrypted
-- secrets. For MVP RLS-by-user is acceptable given the gateway runs as
-- service_role anyway.

create table if not exists public.oauth_connections (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  platform              text not null check (platform in ('youtube','tiktok','instagram')),
  external_account_id   text not null,     -- channel id / open_id / IG account id
  display_name          text,
  handle                text,              -- @something
  avatar_url            text,
  access_token          text not null,
  refresh_token         text,
  scopes                text[] not null default '{}',
  expires_at            timestamptz,       -- access token expiry
  raw                   jsonb not null default '{}'::jsonb,  -- provider response payload
  connected_at          timestamptz not null default now(),
  refreshed_at          timestamptz,
  unique (user_id, platform, external_account_id)
);

create index if not exists oauth_connections_user_idx
  on public.oauth_connections (user_id, platform);

comment on table public.oauth_connections is
  'OAuth tokens for publishing — gateway uses service_role to read/refresh + upload.';

-- RLS: user can read own connections (no write — gateway-only)
alter table public.oauth_connections enable row level security;
drop policy if exists "oauth_read_own" on public.oauth_connections;
create policy "oauth_read_own"
  on public.oauth_connections
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "oauth_delete_own" on public.oauth_connections;
create policy "oauth_delete_own"
  on public.oauth_connections
  for delete
  to authenticated
  using (user_id = auth.uid());

-- Add a remote_external_id column to hermes_scheduled_posts so we can correlate
-- a staged post with the actual YouTube/TikTok video once uploaded.
alter table public.hermes_scheduled_posts
  add column if not exists remote_external_id text,
  add column if not exists remote_url text,
  add column if not exists uploaded_at timestamptz,
  add column if not exists upload_error text;

create index if not exists hermes_scheduled_posts_remote_idx
  on public.hermes_scheduled_posts (remote_external_id)
  where remote_external_id is not null;
