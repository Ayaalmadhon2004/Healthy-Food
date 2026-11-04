---
title: Nutrition assistant (RAG)
type: subsystem
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: lib/rag/chat.ts
  - code: lib/rag/safety.ts
  - code: lib/rag/retrieve.ts
  - code: lib/rag/fusion.ts
  - code: lib/rag/normalize.ts
  - code: lib/rag/prompt.ts
  - code: lib/rag/providers.ts
  - code: lib/rag/store.ts
  - code: app/api/chat/route.ts
  - code: scripts/ingest-knowledge.ts
  - code: data/knowledge
  - code: prisma/rag-setup.sql
verified_at: 4f15bf3
---

# Nutrition assistant (RAG)

An Arabic/English question-answering assistant at `/[lang]/assistant`. It answers only from a
knowledge base of the app's own recipes, tips and kitchens plus curated, sourced documents about
nutrition in Gaza. Free by default: see [[free-by-default-assistant]].

## Request flow

`POST /api/chat` (`app/api/chat/route.ts`) validates the body (`lib/rag/types.ts`), rate-limits per
user or IP, then `runChat` (`lib/rag/chat.ts`) does, in order:

1. **Triage** (`lib/rag/safety.ts`): emergency, out-of-scope or prompt-injection questions get a fixed
   reply and never reach retrieval or a model.
2. **Retrieve** (`lib/rag/retrieve.ts`): hybrid search, vectors plus Postgres full-text, merged with
   reciprocal rank fusion (`lib/rag/fusion.ts`). Passages below `MIN_RELEVANCE` are dropped.
3. **No passages left** means a fixed "no reliable information" reply, with no model call.
4. **Answer** from exactly those passages, streamed as SSE events (`meta`, `delta`, `done` or `error`).

## Knowledge base

- Table `knowledge_chunks` (`KnowledgeChunk` in `prisma/schema.prisma`), pgvector column set up by
  `prisma/rag-setup.sql`.
- `npm run ingest` (`scripts/ingest-knowledge.ts`) rebuilds chunks from the database plus
  `data/knowledge/*.json`. See `docs/knowledge-base.md` for how documents are added and how the current
  batch was gathered.
- Embeddings are local (`lib/rag/embed.ts`, multilingual-e5-small). If the model cannot load, search
  degrades to full-text only.

## Traps

> ⚠️ Arabic text is matched after `normalizeArabic` and article stripping (`lib/rag/normalize.ts:35`).
> The same function must build the stored `searchText` and the query terms, otherwise "المجدّرة" never
> meets "مجدّرة". After changing normalisation, re-run `npm run ingest` so stored text is rebuilt.

> ⚠️ Safety phrases in Arabic match at word starts only (`lib/rag/safety.ts:55`). A bare substring
> match turned "اسم", "جسم" and "موسم" into emergencies. A bare leading "ب" is deliberately not allowed
> as a prefix, so "بسم الله" stays quiet.

> ⚠️ Stored passages and the question are untrusted. `clean` in `lib/rag/prompt.ts:44` strips
> delimiter tags after NFKC and zero-width removal; keep that order or fullwidth and invisible-character
> lookalikes can close the `<context>` block.

> ⚠️ Generic query words must not count as evidence. Raising `LEXICAL_GAIN` once let a lone "best" in
> "best protein for muscle building" pull in breastfeeding and chlorine passages, which reads as the
> assistant making things up. The cure is the stopword list in `lib/rag/normalize.ts` plus
> `MIN_SCORE_SHARE` in `lib/rag/extractive.ts`, not a lower cutoff. In full-text-only mode a lone
> content word such as "اسهال" among filler words still declines; vectors are what answer such questions,
> and they could not be tried against the real model in the build sandbox.

> ⚠️ A single weak full-text hit must not pass the relevance cutoff (`LEXICAL_GAIN` in
> `lib/rag/fusion.ts:20`). Raising it makes one-word queries answerable but lets thin matches through;
> tests in `tests/rag-eval.test.js` lock the current behaviour. `COSINE_FLOOR` and `COSINE_CEIL`
> (`lib/rag/fusion.ts:13`) are estimates, not measured; tune them on real ingested data.

> ⚠️ Ingest prunes stale chunks only for kinds that produced chunks in that run
> (`lib/rag/store.ts:66`). Never call it with an empty keep-list; it refuses on purpose so a failed
> build cannot wipe the table.

> ⚠️ Run `prisma/rag-setup.sql` before `prisma db push` (the `vector` extension must exist), and run
> its two index statements after. Nothing in the repo applies them automatically.

> ⚠️ The curated documents were gathered from web search summaries, not full pages; their `sourceDate`
> is the access date. Do not present them as verified quotations.
