-- pgvector + embedding column for semantic recall on hermes_memory
create extension if not exists vector with schema extensions;

alter table public.hermes_memory
  add column if not exists embedding extensions.vector(768);

-- HNSW index for cosine similarity (Gemini text-embedding-004 is 768d)
create index if not exists hermes_memory_embedding_idx
  on public.hermes_memory
  using hnsw (embedding extensions.vector_cosine_ops);

comment on column public.hermes_memory.embedding is
  'Gemini text-embedding-004 (768d) for semantic recall via recall_memory(query).';
