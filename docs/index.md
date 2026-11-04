# NutriFlow -- documentation

Bilingual (Arabic/English) food and nutrition app for Gaza: community kitchens, recipes, a meal tracker, doctors, and a free retrieval-based nutrition assistant.

This directory is a wiki maintained by an LLM: linked markdown pages, nothing outside the
repository. The rules are in [`CLAUDE.md`](CLAUDE.md).

## Start here

1. [[nutrition-assistant]] -- how the assistant answers, and its traps
2. [[free-by-default-assistant]] -- why it costs nothing to run

More pages are added as work touches new areas; the rest of the app (recipes, kitchens, tracker,
doctors, auth) is not documented here yet.

---

## concepts

_None yet._

## architecture

_None yet._

## subsystems

- [[nutrition-assistant]] -- triage, hybrid retrieval, answer generation, knowledge base

## decisions

- [[free-by-default-assistant]] -- extractive answers by default, Gemini free tier optional, Claude opt-in

## reference

_None yet._

## operations

- [[assistant-setup]] -- free setup, env vars, first run
- [[knowledge-base]] -- adding documents, source policy, how the current batch was gathered
- [[assistant-evaluation]] -- evaluation set, targets, offline and live runs

## history

_None yet._

---

## Using this wiki

```
/docs-sync     right after a deploy or release -- reads only what changed since verified_at
/docs-lint     integrity check (orphans, broken links, broken sources, stale, unverified)
/docs-query    ask the docs. If it is not there, the answer says so
/docs-status   commits not yet reflected, stale pages, recent work
```

Every page carries `verified_at`, the commit it was checked against. Change code, run
`/docs-sync`.
