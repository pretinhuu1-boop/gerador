-- Add template_id to content_renders so the pipeline knows which Remotion
-- composition to invoke. Defaults to 'StoriesVertical' for backwards-compat
-- with the existing renders. Optional template_id on content_drafts caches
-- the user's last picked template so the next render defaults to it.

alter table public.content_renders
  add column if not exists template_id text not null default 'StoriesVertical';

alter table public.content_drafts
  add column if not exists template_id text;

create index if not exists content_renders_template_id_idx
  on public.content_renders (template_id);

comment on column public.content_renders.template_id is
  'Remotion composition id (matches <Composition id> in remotion/Root.tsx). One of StoriesVertical, RedditStories, TopList, Audiogram.';

comment on column public.content_drafts.template_id is
  'Last template the user picked for this draft — used as default on the next render.';
