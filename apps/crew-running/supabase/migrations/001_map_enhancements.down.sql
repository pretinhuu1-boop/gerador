-- 001_map_enhancements.down.sql
-- Rollback for 001_map_enhancements.sql. Policies are dropped automatically
-- when tables are dropped.

drop table if exists user_preferences cascade;
drop table if exists territory_snapshots cascade;
drop table if exists run_logs cascade;
drop table if exists zone_leaderboard cascade;
