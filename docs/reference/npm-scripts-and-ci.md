---
title: npm scripts and CI
type: reference
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: package.json
  - code: .github/workflows/ci.yml
  - code: tests/helpers/db.js
  - code: tests/helpers/hooks.mjs
  - code: prisma/rag-setup.sql
verified_at: 8b565be
---

# npm scripts and CI

| Script | Runs |
|---|---|
| `dev` | `next dev --webpack` |
| `build` | `next build --webpack` (reads recipes and tips from the database) |
| `start` | `next start -p 3001` |
| `postinstall` | `prisma generate` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit` for the app and for `tsconfig.sw.json` (service worker) |
| `test` | Node test runner over `tests/*.test.js`, with TypeScript and `@/` aliases resolved by `tests/helpers/register.mjs` |
| `ingest` | Rebuilds the assistant knowledge base (see [[nutrition-assistant]]) |

The Prisma seed command is configured in `package.json` as `node prisma/seed.js`.

## CI (`.github/workflows/ci.yml`)

Runs on pull requests and pushes to `main`, on Node 22 with a `pgvector/pgvector:pg16` service. Steps in order: `npm ci`, lint, typecheck, create the `vector` extension, `prisma db push`, `npm test`, `prisma db seed`, `npm run build`. Database and Supabase variables are placeholders; see [[environment-variables]].

> ⚠️ Action tests run against a real Postgres and are skipped when `DATABASE_URL` is unset (`skip: !hasDatabase` in `tests/*.test.js`). A local `npm test` without a database passes while skipping the reservation, booking, meal and report tests, which is why those protections ([[community-kitchens]], [[doctors-and-appointments]]) need a database to be exercised.

> ⚠️ In CI, `prisma db push` must run before `npm test`, and the `CREATE EXTENSION vector` step must run before `db push`, because `KnowledgeChunk` has a `vector(384)` column. A plain Postgres image fails at that step.

> ⚠️ `prisma db seed` must run before `npm run build`: the build prerenders pages that read recipes and tips from the database.

> ⚠️ Tests stub `next/cache`, `next/headers`, `next/navigation` and `@/lib/supabase/server` (`tests/helpers/hooks.mjs`). Code that imports another Next-only module in an action needs a new stub or the test run breaks.
