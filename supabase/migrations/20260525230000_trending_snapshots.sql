-- Trending snapshots — cache de YouTube `videos.list chart=mostPopular` por
-- (region, category) com TTL ~4h. Scout/ContentAgent consultam pra pegar
-- contexto do que está bombando agora.

create table if not exists public.trending_snapshots (
  id           uuid primary key default gen_random_uuid(),
  region_code  text not null default 'BR',                -- ISO 3166-1 alpha-2
  category_id  text,                                       -- YouTube category id; null = any
  videos       jsonb not null default '[]'::jsonb,         -- array of normalized video records
  fetched_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '4 hours'
);

create index if not exists trending_snapshots_lookup_idx
  on public.trending_snapshots (region_code, category_id, fetched_at desc);

comment on table public.trending_snapshots is
  'Cached YouTube trending feed per (region, category). TTL 4h via expires_at — tools fetch fresh when expired.';

-- RLS: read-only for any authenticated user (data is non-sensitive public YouTube info)
alter table public.trending_snapshots enable row level security;
drop policy if exists "trending_read" on public.trending_snapshots;
create policy "trending_read"
  on public.trending_snapshots
  for select
  to authenticated
  using (true);

-- Service role writes (gateway tool refreshes from YouTube API).
