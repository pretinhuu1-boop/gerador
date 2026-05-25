-- Storage bucket for rendered MP4s + audio clips + retry pg_cron job

-- 1) Bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'renders',
  'renders',
  false,
  524288000,                                    -- 500 MB upload cap
  array['audio/mpeg', 'video/mp4', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

-- 2) Storage RLS — owner read/write under path renders/{user_id}/...
create policy "renders_owner_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'renders'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "renders_owner_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'renders'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "renders_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'renders'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'renders'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "renders_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'renders'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3) pg_cron — every 30 min, requeue errored renders below max retries.
create extension if not exists pg_cron;

select cron.schedule(
  'requeue_failed_renders',
  '*/30 * * * *',
  $$
    update public.content_renders
    set status = 'queued',
        error = null,
        retry_count = retry_count + 1
    where status = 'error' and retry_count < 3
  $$
);
