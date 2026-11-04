---
title: Local setup and deploy
type: operation
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: README.md
  - code: .env.example
  - code: package.json
  - code: prisma/seed.js
  - code: prisma/rag-setup.sql
  - code: app/api/cron/keep-alive/route.ts
  - code: next.config.ts
verified_at: 496a084
---

# Local setup and deploy

Assistant-specific setup is in `docs/assistant-setup.md`; variable meanings are in [[environment-variables]]; scripts and CI in [[npm-scripts-and-ci]].

## Local run

1. Node.js 22.18 or newer (the unit tests import TypeScript directly), a PostgreSQL database and a Supabase project.
2. `cp .env.example .env` and fill it in (never commit `.env`; `.env.example` holds placeholders only and is committed).
3. `npm install` (also runs `prisma generate`).
4. If you want the assistant, run only the first statement of `prisma/rag-setup.sql` (`CREATE EXTENSION IF NOT EXISTS vector;`), then `npx prisma db push`, then `npm run ingest`. The two index statements at the end of that file need the table to exist and are only used by `RAG_RETRIEVER=pgvector`.
5. `npx prisma db seed` for recipes, tips, doctors, kitchens and the nutrition guide. `node prisma/seed.js --recipes-only` refreshes only recipes.
6. `npm run dev` serves on port 3000; `npm run build` then `npm start` serves on 3001.

> ⚠️ The schema contains a `vector(384)` column for the assistant, so `prisma db push` fails on a Postgres without the `vector` extension. Run `prisma/rag-setup.sql` (or `CREATE EXTENSION vector`) first. See [[nutrition-assistant]].

> ⚠️ `npm run build` queries the database while generating pages, so seed before building; a build against an empty database fails or produces empty pages (unverified which).

## Deploy

The README targets Vercel with Supabase PostgreSQL; the repo has no Vercel config file (unverified how the platform is configured beyond the README). On Vercel the production URL is detected automatically for canonical links. Set `CRON_SECRET` and the Supabase variables in the platform.

## Keep-alive route

`GET /api/cron/keep-alive` runs one trivial query so a sleeping free-tier database wakes up. It requires `Authorization: Bearer <CRON_SECRET>` (what Vercel Cron sends). No cron schedule is defined in the repo, so something external must call it (unverified).

> ⚠️ With `CRON_SECRET` unset, the route is open in development and returns 401 in production. Set the secret before relying on it.

After a deploy, run `/docs-sync` (see `docs/CLAUDE.md`).

> ⚠️ `.gitignore` ignores `.env*`, so `.env.example` needs its own `!.env.example` line. It was missed once: the file
> existed only on one machine, the README told everyone to copy it, and a fresh clone had nothing to copy. Keep real
> values out of it; it must contain placeholders only.
