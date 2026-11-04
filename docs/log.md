# Work log

Append-only. Newest entries at the bottom.

---

## [2026-11-04] setup | docs/ wiki scaffolded

- Categories: concepts - architecture - subsystems - decisions - reference - operations - history
- Baseline commit: `d4776e2`
- Created: `docs/{CLAUDE,index,log}.md`, `raw/`, 4 `.claude/commands/docs-*`,
  and `.claude/scripts/docs-lint.py`

## [2026-11-04] seed | started in grow mode

- Wrote from code: `subsystems/nutrition-assistant` (the RAG assistant added this session) and
  `decisions/free-by-default-assistant`. Covered only `lib/rag/`, `app/api/chat`, `scripts/ingest-knowledge.ts`
  and `data/knowledge`. The rest of the app is not documented yet.
- Pre-existing notes `docs/knowledge-base.md`, `assistant-setup.md`, `assistant-evaluation.md` were left in place.
