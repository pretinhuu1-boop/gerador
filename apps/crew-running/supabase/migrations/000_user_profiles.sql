-- 000_user_profiles.sql
-- Maps auth.users → organization. Required by RLS policies in 001+.
-- Decision: D1=a (table-based RLS), D2=b (guest org default), D3=b (single Axial-SP org for MVP).

-- Default org constant (single org for MVP; multi-city expansion adds rows here later).
create table if not exists organizations (
  id              uuid primary key,
  slug            text not null unique,
  display_name    text not null,
  created_at      timestamptz default now()
);

insert into organizations (id, slug, display_name)
  values ('00000000-0000-0000-0000-000000000001', 'axial-sp', 'Axial SP')
  on conflict (id) do nothing;

-- user_profiles links every auth.users row to exactly one organization.
create table if not exists user_profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references organizations (id),
  display_name    text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_user_profiles_org on user_profiles(organization_id);

-- RLS: a user reads their own profile only.
alter table user_profiles enable row level security;
create policy "read_own_profile" on user_profiles for select
  using (id = auth.uid());
create policy "insert_own_profile" on user_profiles for insert
  with check (id = auth.uid());
create policy "update_own_profile" on user_profiles for update
  using (id = auth.uid());

-- organizations table is world-readable (no PII, just slug+name).
alter table organizations enable row level security;
create policy "read_all_orgs" on organizations for select using (true);

-- Auto-assign every new auth.users row to the default org.
create or replace function public.assign_default_org()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.user_profiles (id, organization_id)
    values (new.id, '00000000-0000-0000-0000-000000000001')
    on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_assign_default_org on auth.users;
create trigger trg_assign_default_org
  after insert on auth.users
  for each row execute function public.assign_default_org();
