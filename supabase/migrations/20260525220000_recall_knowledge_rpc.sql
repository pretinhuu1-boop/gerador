-- Native pgvector ANN search for recall_knowledge.
--
-- Replaces the client-side cosine ranking (which scanned only the first 800
-- rows in arbitrary order and missed best matches once the table passed ~500
-- records). With 1543+ rows in the seed alone, the previous approach had a
-- ~50% miss rate. This RPC uses the HNSW index directly.
--
-- Returns rows ordered by cosine distance (smallest first = most similar),
-- already filtered by `active`, by visibility (global rows OR caller's pins),
-- and optionally by `kind`. `1 - distance` is exposed as `similarity` (0..1).

create or replace function public.match_hermes_knowledge(
  query_embedding extensions.vector(768),
  match_count int default 5,
  filter_kind text default null,
  for_user_id uuid default null
)
returns table (
  id uuid,
  kind text,
  slug text,
  title text,
  summary text,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    k.id,
    k.kind,
    k.slug,
    k.title,
    k.summary,
    k.content,
    k.metadata,
    1 - (k.embedding <=> query_embedding) as similarity
  from public.hermes_knowledge k
  where k.active
    and k.embedding is not null
    and (for_user_id is null or k.user_id is null or k.user_id = for_user_id)
    and (filter_kind is null or k.kind = filter_kind)
  order by k.embedding <=> query_embedding
  limit greatest(1, least(50, match_count));
$$;

comment on function public.match_hermes_knowledge is
  'ANN search over hermes_knowledge using pgvector + HNSW. Caller passes a 768d Gemini embedding; gets back top-k matches with cosine similarity score. Scoped to global (user_id NULL) + the caller''s own pins.';

-- Allow authenticated + service_role to call it.
grant execute on function public.match_hermes_knowledge(
  extensions.vector(768), int, text, uuid
) to authenticated, service_role;
