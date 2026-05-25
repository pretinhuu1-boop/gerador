-- Hermes knowledge base — global creative library that sub-agents can semantic-search
-- via recall_knowledge(query, kind?). Seeded once from data/*.ts (export_knowledge.ts +
-- seed_knowledge.py), then expanded over time by ImproverAgent / user pins.
--
-- Kinds catalogued so far:
--   doc                 long markdown guides (DRC, CME, CLAFE, CIME, RSSE, WardrobeEngine,
--                       ImageScience_4K, actor_behavior, DOC_010, TrapStyleGuide, cinema_data)
--   meta_prompt         system prompts pra agentes especializados (VFX Supervisor etc)
--   cinema_genre        gêneros (sci-fi, noir, drama, neorrealismo_brasileiro)
--   style_preset        cinema_style_library (ammar, trap-grit, funk-periferia)
--   environment_preset  environment_library
--   narrative_preset    narrative_library
--   lens_preset         lenses_and_composition_library
--   b_roll_scenario     b_roll_library
--   vibe_preset         vibe_presets
--   context_modifier    context_modifiers
--   texture_preset      texture_library
--   prompt              prompt_library + bananaPromptLibrary
--   vfx_preset          VFX_EXPLOSION_PRESETS
--
-- user_id is NULL for global/shared knowledge; per-user pins can be added later
-- by setting user_id.

create table if not exists public.hermes_knowledge (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  kind        text not null,
  slug        text not null,
  title       text not null,
  summary     text,
  content     text not null,
  metadata    jsonb not null default '{}'::jsonb,
  embedding   extensions.vector(768),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Global rows have user_id IS NULL — unique on (kind, slug) avoids duplicate seeds.
create unique index if not exists hermes_knowledge_global_uniq
  on public.hermes_knowledge (kind, slug)
  where user_id is null;

create unique index if not exists hermes_knowledge_user_uniq
  on public.hermes_knowledge (user_id, kind, slug)
  where user_id is not null;

create index if not exists hermes_knowledge_kind_idx
  on public.hermes_knowledge (kind)
  where active;

create index if not exists hermes_knowledge_embedding_idx
  on public.hermes_knowledge
  using hnsw (embedding extensions.vector_cosine_ops);

comment on table public.hermes_knowledge is
  'Creative knowledge base shared across users. Sub-agents query via recall_knowledge() for semantic retrieval of style/lighting/lens/narrative/b-roll references.';
comment on column public.hermes_knowledge.embedding is
  'Gemini text-embedding-004 (768d) on title + summary + content[0..2k]. NULL until seeded.';

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.hermes_knowledge enable row level security;

-- Anyone authenticated can read global (user_id NULL) + their own pins.
drop policy if exists "hermes_knowledge_read" on public.hermes_knowledge;
create policy "hermes_knowledge_read"
  on public.hermes_knowledge
  for select
  to authenticated
  using (active and (user_id is null or user_id = auth.uid()));

-- Users can write their own per-user pins (kind+slug scoped to themselves).
drop policy if exists "hermes_knowledge_user_write" on public.hermes_knowledge;
create policy "hermes_knowledge_user_write"
  on public.hermes_knowledge
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Service role bypasses RLS (used by the gateway seeder for global rows).
