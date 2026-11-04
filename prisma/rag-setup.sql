-- One-time setup for the nutrition assistant's knowledge base. Run it in the Supabase SQL editor
-- (or with psql) BEFORE `npx prisma db push`, because the table has a pgvector column.
CREATE EXTENSION IF NOT EXISTS vector;

-- Only needed with RAG_RETRIEVER=pgvector (the default retriever scores passages in memory and ignores them).
-- Prisma does not know these two indexes, so a later `prisma db push` may offer to drop them.
-- Created/changed by `prisma db push`; the two indexes below are not expressible in schema.prisma, so run
-- this part AFTER db push.
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
  ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS knowledge_chunks_fts_idx
  ON knowledge_chunks USING gin (to_tsvector('simple', "searchText"));
