# NutriFlow -- documentation

Bilingual (Arabic/English) food and nutrition app for Gaza: community kitchens, recipes, a meal tracker, doctors, and a free retrieval-based nutrition assistant.

This directory is a wiki maintained by an LLM: linked markdown pages, nothing outside the
repository. The rules are in [`CLAUDE.md`](CLAUDE.md).

## Start here

1. [[overview]] -- app layout, proxy, data layer, i18n, PWA
2. [[auth-and-roles]] -- sign-in, roles, where authorization is checked
3. [[gaza-time-and-reservation-day]] -- how days are defined everywhere
4. [[community-kitchens]], [[meal-tracker]], [[doctors-and-appointments]], [[recipes-tips-and-favorites]], [[reports-and-support]] -- the feature subsystems
5. [[nutrition-assistant]] -- how the assistant answers, and its traps
6. [[free-by-default-assistant]] -- why it costs nothing to run
7. [[local-setup-and-deploy]], [[environment-variables]], [[npm-scripts-and-ci]] -- running and checking the app

---

## concepts

- [[gaza-time-and-reservation-day]] -- Asia/Gaza days, instants vs UTC calendar dates

## architecture

- [[overview]] -- routing under app/[lang], proxy.ts, Prisma/Supabase, i18n, PWA

## subsystems

- [[auth-and-roles]] -- Supabase sign-in, USER/ORG/ADMIN/DOCTOR, authorization placement
- [[community-kitchens]] -- kitchens, serialized meal reservations, capacity, org dashboard
- [[recipes-tips-and-favorites]] -- cached content, favorites toggle
- [[meal-tracker]] -- meals, calorie goal, monthly stats
- [[doctors-and-appointments]] -- booking, status flow, notifications, doctor linking
- [[reports-and-support]] -- area reports, support tickets, rate limiter
- [[nutrition-assistant]] -- triage, hybrid retrieval, answer generation, knowledge base

## decisions

- [[free-by-default-assistant]] -- extractive answers by default, Gemini free tier optional, Claude opt-in

## reference

- [[environment-variables]] -- every env var the code reads (names only)
- [[npm-scripts-and-ci]] -- package scripts and the CI pipeline order

## operations

- [[local-setup-and-deploy]] -- install, db push, seed, run, deploy, keep-alive cron
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
