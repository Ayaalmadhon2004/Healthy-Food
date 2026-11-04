---
title: Nutrition assistant (RAG)
type: subsystem
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: lib/rag/chat.ts
  - code: lib/rag/safety.ts
  - code: lib/rag/retrieve.ts
  - code: lib/rag/memoryIndex.ts
  - code: lib/rag/ngram.ts
  - code: lib/rag/mode.ts
  - code: lib/rag/fusion.ts
  - code: lib/rag/normalize.ts
  - code: lib/rag/prompt.ts
  - code: lib/rag/providers.ts
  - code: lib/rag/store.ts
  - code: app/api/chat/route.ts
  - code: scripts/ingest-knowledge.ts
  - code: data/knowledge
  - code: prisma/rag-setup.sql
  - code: .github/workflows/ci.yml
  - code: next.config.ts
  - code: components/assistant/AssistantChat.tsx
  - code: components/assistant/MessageBubble.tsx
  - code: components/assistant/chatStream.ts
  - code: components/assistant/idleTimer.ts
  - code: components/assistant/sseParser.ts
  - code: app/[lang]/assistant/loading.tsx
verified_at: 5603716
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
2. **Retrieve** (`lib/rag/retrieve.ts`): by default (`RAG_RETRIEVER` unset) an in-memory index (`lib/rag/memoryIndex.ts`)
   scores every passage with BM25 plus hashed character n-gram similarity (`lib/rag/ngram.ts`); no model, no pgvector.
   `RAG_RETRIEVER=pgvector` switches to the database-side hybrid search (e5 vectors plus Postgres full-text, merged by
   rank fusion in `lib/rag/fusion.ts`). Passages below `MIN_RELEVANCE` are dropped either way.
3. **No passages left** means a fixed "no reliable information" reply, with no model call.
4. **Answer** from exactly those passages, streamed as SSE events (`meta`, `delta`, `done` or `error`).

## Knowledge base

- Table `knowledge_chunks` (`KnowledgeChunk` in `prisma/schema.prisma`), pgvector column set up by
  `prisma/rag-setup.sql`.
- `npm run ingest` (`scripts/ingest-knowledge.ts`) rebuilds chunks from the database plus
  `data/knowledge/*.json`. See `docs/knowledge-base.md` for how documents are added and how the current
  batch was gathered.
- Default retrieval needs no embeddings. In `pgvector` mode embeddings are local (`lib/rag/embed.ts`, multilingual-e5-small);
  if the model cannot load, search degrades to full-text only. `npm run ingest` skips embedding in the default mode.

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

> ⚠️ The in-memory retriever's calibration (`relevanceOf` in `lib/rag/memoryIndex.ts`) was measured on 25 answerable
> and 8 unanswerable questions over the 19 curated documents (`tests/eval/retrieval-cases.json`): top-3 hit 24/25,
> answerable accepted 92%, unanswerable rejected 88%. The sample is small and the known miss is real: "best protein for
> muscle building" is accepted because the word "building" appears in a breastfeeding sentence. The n-gram vectors
> measure shared spelling, not meaning; a truly semantic model is better where it can run. Re-measure after adding
> recipes, tips and kitchens, and add the new failures to the cases file.

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

> ⚠️ Chat history comes from the browser and can be forged. `lib/rag/chat.ts` declines the whole request
> when any earlier USER turn contains an injection phrase; assistant turns are not trusted: `buildPrompt`
> wraps them in `<previous_assistant_output untrusted="true">` (that tag is also in `DELIMITER_TAGS`) and
> `capHistory` limits the total history sent. An old emergency turn is deliberately not replayed, or every
> follow-up would be blocked.

> ⚠️ `normalizeText` in `lib/rag/safety.ts` must strip zero-width and bidi control characters before
> anything else. Turning them into spaces let "ig<ZWSP>nore previous instructions" split the word and slip
> past triage.

> ⚠️ The streaming answer must NOT sit in an `aria-live` region (every delta would be read out). The chat
> has a separate sr-only `role="status"` for short states and a `role="alert"` used only for emergencies;
> the bubbles themselves carry no `role="alert"`, or the emergency text is announced twice
> (`components/assistant/AssistantChat.tsx`).

> ⚠️ A stalled stream aborts after `STREAM_IDLE_TIMEOUT_MS` of silence (`components/assistant/idleTimer.ts`)
> and shows the "unavailable" state with retry; a user Stop must stay a different path ("stopped").
> Component tests import the timer from its own file because the test loader cannot resolve extensionless
> relative imports.

> ⚠️ Run `prisma/rag-setup.sql` before `prisma db push` (the `vector` extension must exist), and run
> its two index statements after. Nothing in the repo applies them automatically.

> ⚠️ Every Postgres that runs `prisma db push` needs the `vector` extension first, CI included
> (`.github/workflows/ci.yml` uses the `pgvector/pgvector:pg16` image and creates the extension before
> `db push`). With plain `postgres:16` the push fails with `type "vector" does not exist`, which is what
> broke the first CI run of the assistant PR.

> ⚠️ `@huggingface/transformers` and `onnxruntime-node` ship native binaries, so `next.config.ts` lists them
> in `serverExternalPackages`. Remove that and the server bundle tries to pack `.node` files.

> ⚠️ The curated documents were gathered from web search summaries, not full pages; their `sourceDate`
> is the access date. Do not present them as verified quotations.
