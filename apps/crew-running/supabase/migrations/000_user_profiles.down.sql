-- 000_user_profiles.down.sql
drop trigger if exists trg_assign_default_org on auth.users;
drop function if exists public.assign_default_org();
drop table if exists user_profiles cascade;
drop table if exists organizations cascade;
