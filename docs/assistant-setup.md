---
title: Assistant: free setup
type: operation
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: lib/rag/providers.ts
  - code: prisma/rag-setup.sql
verified_at: 4f15bf3
---

# Nutrition assistant: free setup

Everything runs at no cost by default.

| Piece | Cost | How |
| --- | --- | --- |
| Embeddings | free | local model (`Xenova/multilingual-e5-small`), downloaded once (~100 MB) |
| Database | free tier | Postgres + pgvector on Supabase |
| Answers | free | assembled from the knowledge base itself (no model, nothing can be invented) |
| Smoother answers (optional) | free tier | add `GEMINI_API_KEY` from Google AI Studio |
| Claude (optional) | **paid** | only with `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` |

## Environment variables

- `LLM_PROVIDER`: `extractive` (default) | `gemini` | `anthropic`. If unset, `gemini` is used when `GEMINI_API_KEY` exists, otherwise `extractive`. Anthropic is never chosen automatically.
- `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-2.5-flash`; free-tier model names change, set it to a current one).
- `RAG_MODEL_CACHE_DIR`: where the embedding model is cached. `RAG_DISABLE_EMBEDDINGS=1` skips it (full-text search only).

Local development and CI need a Postgres with the `vector` extension (for example the `pgvector/pgvector:pg16` image); with plain `postgres:16`, `prisma db push` fails with `type "vector" does not exist`.

## First run

1. Run `prisma/rag-setup.sql` in the Supabase SQL editor.
2. `npx prisma db push`, then run the two index statements at the end of `prisma/rag-setup.sql`.
3. `npm run ingest` (recipes, tips, kitchens and `data/knowledge/*.json`).
4. Start the app and open `/ar/assistant` or `/en/assistant`.

See `docs/knowledge-base.md` for adding documents and `docs/assistant-evaluation.md` for the tests.
