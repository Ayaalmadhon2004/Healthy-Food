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
verified_at: d4776e2
---

# Free by default assistant

**Decision.** The assistant must cost nothing to run. `chooseProvider` (`lib/rag/providers.ts:12`) picks:
`extractive` (no model; the answer is assembled from the retrieved passages) unless `GEMINI_API_KEY` is
set (Gemini free tier), and Claude only when `LLM_PROVIDER=anthropic` is set explicitly.

**Why.** The project owner asked for no running cost. The extractive path also cannot invent facts,
which matters for health content for families in Gaza. Embeddings are local and the database is a free
Supabase tier.

**Cost of the choice.** Extractive answers read less smoothly than a model's and cannot combine
passages. Gemini's free tier has rate limits and its model names change (`GEMINI_MODEL` overrides the
default); its path was tested only with a faked `fetch`, never against the real service.

> ⚠️ Do not make Claude the automatic choice when `ANTHROPIC_API_KEY` exists. That would quietly start
> billing; `tests/rag-providers.test.js` asserts it never happens.

See [[nutrition-assistant]] for the request flow.
