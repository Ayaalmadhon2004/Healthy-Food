---
title: Free by default assistant
type: decision
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: lib/rag/providers.ts
  - code: lib/rag/extractive.ts
  - code: lib/rag/gemini.ts
  - code: lib/rag/generate.ts
  - raw: docs/assistant-setup.md
verified_at: c9ae59e
---

# Free by default assistant

**Decision.** The assistant must cost nothing to run. `chooseProvider` (`lib/rag/providers.ts:12`) picks:
`extractive` (no model; the answer is assembled from the retrieved passages) unless `GEMINI_API_KEY` is
set (Gemini free tier), and Claude only when `LLM_PROVIDER=anthropic` is set explicitly.

**Why.** The project owner asked for no running cost. The extractive path also cannot invent facts,
which matters for health content for families in Gaza. Embeddings are local and the database is a free
Supabase tier.

**How extractive answers are built.** The sentences that share words with the question are ranked (`lib/rag/extractive.ts`); the opening line comes from the highest-ranked passage that has a matching sentence (retrieval's judgement beats a sentence that merely shares more words), the next best sentences are cited bullets, at most two per passage, and passages scoring far below the best are skipped. If no sentence matches, it falls back to the opening of the top passage.

**Cost of the choice.** Extractive answers read less smoothly than a model's and cannot combine
passages. Gemini's free tier has rate limits and its model names change (`GEMINI_MODEL` overrides the
default); its path was tested only with a faked `fetch`, never against the real service.

> ⚠️ Do not make Claude the automatic choice when `ANTHROPIC_API_KEY` exists. That would quietly start
> billing; `tests/rag-providers.test.js` asserts it never happens.

See [[nutrition-assistant]] for the request flow.
