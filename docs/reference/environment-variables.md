---
title: Environment variables
type: reference
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: .env.example
  - code: lib/prisma.ts
  - code: prisma.config.ts
  - code: lib/supabase/server.ts
  - code: lib/supabase/client.ts
  - code: proxy.ts
  - code: lib/site.ts
  - code: app/api/cron/keep-alive/route.ts
  - code: tests/eval/run-live.mjs
  - code: lib/rag/providers.ts
  - code: lib/rag/gemini.ts
  - code: lib/rag/generate.ts
  - code: lib/rag/embed.ts
  - code: .github/workflows/ci.yml
verified_at: d45844d
---

# Environment variables

Names only; values are never recorded. Template: `.env.example`. Assistant variables are explained in `docs/assistant-setup.md` and [[free-by-default-assistant]].

| Variable | Read by | Purpose |
|---|---|---|
| `DATABASE_URL` | `lib/prisma.ts`, `prisma.config.ts`, tests | PostgreSQL connection for the app and the Prisma CLI |
| `DIRECT_URL` | `tests/eval/run-live.mjs` only | Direct connection for the live assistant evaluation |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `proxy.ts`, `lib/supabase/*` | Supabase client (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/server.ts` | Server only, used by signup to create users |
| `CRON_SECRET` | `app/api/cron/keep-alive/route.ts` | Bearer secret for the keep-alive route |
| `NEXT_PUBLIC_SITE_URL` | `lib/site.ts` | Public origin for canonicals, sitemap, robots |
| `VERCEL_PROJECT_PRODUCTION_URL` | `lib/site.ts` | Set by Vercel; fallback for the site origin |
| `NODE_ENV` | `lib/prisma.ts`, `next.config.ts`, cron route | Standard Node mode |
| `LLM_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `ANTHROPIC_API_KEY` | `lib/rag/*` | Optional assistant providers |
| `RAG_DISABLE_EMBEDDINGS`, `RAG_MODEL_CACHE_DIR` | `lib/rag/embed.ts` | Local embedding model switches |

> ⚠️ `DIRECT_URL` is documented as the direct connection "for migrations", but `prisma.config.ts` reads only `DATABASE_URL`, and no app code reads `DIRECT_URL`. A pooled `DATABASE_URL` is therefore also what `prisma db push` uses. CI sets `DIRECT_URL` anyway.

> ⚠️ Without `CRON_SECRET` the keep-alive route is open outside production and returns 401 in production. See [[local-setup-and-deploy]].

> ⚠️ `proxy.ts` and the Supabase clients use the non-null public Supabase variables; if they are missing, `createSupabaseServerClient` returns `null` and routes answer with a config error instead of throwing ([[auth-and-roles]]). CI uses placeholder values for them.
