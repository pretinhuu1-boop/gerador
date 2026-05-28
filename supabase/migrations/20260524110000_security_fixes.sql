-- Address Supabase security advisor findings on Channel OS objects.

-- 1) touch_updated_at — pin search_path so it's immutable.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) channels_with_latest_metric — recreate with security_invoker so RLS of
-- the caller applies (otherwise the view acts as definer and bypasses RLS).
drop view if exists public.channels_with_latest_metric;
create view public.channels_with_latest_metric
with (security_invoker = on)
as
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
  'Channels joined with the most recent metric snapshot (lateral, fast, security_invoker).';
