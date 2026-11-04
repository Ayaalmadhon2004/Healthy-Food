---
title: Assistant: free setup
type: operation
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: lib/rag/providers.ts
  - code: prisma/rag-setup.sql
verified_at: d72ddad
---

# Nutrition assistant: free setup

Everything runs at no cost by default.

| Piece | Cost | How |
| --- | --- | --- |
| Retrieval | free | default: in-memory BM25 plus n-gram similarity, no model and no extension. Optional `RAG_RETRIEVER=pgvector`: local e5 model (~100 MB download) with pgvector |
| Database | free tier | Postgres + pgvector on Supabase |
| Answers | free | assembled from the knowledge base itself (no model, nothing can be invented) |
| Smoother answers (optional) | free tier | add `GEMINI_API_KEY` from Google AI Studio |
| Claude (optional) | **paid** | only with `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` |

## Environment variables

- `LLM_PROVIDER`: `extractive` (default) | `gemini` | `anthropic`. If unset, `gemini` is used when `GEMINI_API_KEY` exists, otherwise `extractive`. Anthropic is never chosen automatically.
- `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-2.5-flash`; free-tier model names change, set it to a current one).
- `RAG_RETRIEVER`: `memory` (default) or `pgvector`. Switching to `pgvector` needs `npm run ingest` again so vectors are stored.
- `RAG_MODEL_CACHE_DIR`, `RAG_DISABLE_EMBEDDINGS=1`: only used in `pgvector` mode.

Local development and CI need a Postgres with the `vector` extension (for example the `pgvector/pgvector:pg16` image); with plain `postgres:16`, `prisma db push` fails with `type "vector" does not exist`.

## What the setup commands create

`npx prisma db push` creates the `knowledge_chunks` table from `prisma/schema.prisma` (a `vector(384)` column, a unique `sourceKey`, an index on `kind, lang`). It needs the `vector` extension to exist first. The two index statements at the end of `prisma/rag-setup.sql` are only used by `RAG_RETRIEVER=pgvector`; skip them in the default mode. Prisma does not know about them, so a later `db push` may offer to drop them.

## First run

1. Run `prisma/rag-setup.sql` in the Supabase SQL editor (its `vector` extension is still required by the table definition, even when the default retriever never uses it).
2. `npx prisma db push`, then run the two index statements at the end of `prisma/rag-setup.sql`.
3. `npm run ingest` (recipes, tips, kitchens and `data/knowledge/*.json`).
4. Start the app and open `/ar/assistant` or `/en/assistant`.

See `docs/knowledge-base.md` for adding documents and `docs/assistant-evaluation.md` for the tests.

## Troubleshooting: "The assistant is not available right now"

That message means retrieval failed, not that the question was refused. Find the server log line `chat: retrieval failed:` (Vercel: Logs, filter on `/api/chat`). It ends with the error name and database codes:

| Log line contains | Meaning | Fix |
| --- | --- | --- |
| `42P01` | table `knowledge_chunks` does not exist | run `prisma/rag-setup.sql`, then `npx prisma db push` |
| `P1001` or `Can't reach database server` | `DATABASE_URL` missing or wrong on the host | set `DATABASE_URL` (and `DIRECT_URL`) in the host's environment variables, then redeploy |
| `42704` or `type "vector"` | the `vector` extension is missing | `CREATE EXTENSION vector;` (rag-setup.sql) |
| none, and the answer is "no reliable information" | the table exists but is empty | run `npm run ingest` against that database |
| `retrieval timed out` | database too slow or unreachable from the host | check the connection string (use the pooled one on serverless) |

A preview deployment needs its own environment variables; a production-only variable is not visible to previews.
