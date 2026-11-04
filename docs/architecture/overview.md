---
title: Architecture overview
type: architecture
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: proxy.ts
  - code: next.config.ts
  - code: lib/prisma.ts
  - code: lib/auth.ts
  - code: lib/data.ts
  - code: lib/revalidate.ts
  - code: prisma/schema.prisma
  - code: prisma.config.ts
  - code: lib/i18n.ts
  - code: lib/i18n-routing.ts
  - code: locales/en.json
  - code: locales/ar.json
  - code: app/sw.ts
  - code: app/[lang]/layout.tsx
  - code: tests/locales.test.js
  - code: tests/i18nRouting.test.js
verified_at: 52abf18
---

# Architecture overview

NutriFlow is one Next.js 16 app (App Router, React 19) with PostgreSQL through Prisma and Supabase Auth for sign-in. Server Actions in `app/actions/` do most writes; a handful of Route Handlers in `app/api/` serve client fetches. The nutrition assistant is covered by [[nutrition-assistant]]; everything else is listed in the subsystem pages linked below.

## Routing layout

Every page lives under `app/[lang]/` (`en` or `ar`). The layout (`app/[lang]/layout.tsx`) 404s unknown languages, sets `dir`/`lang` and mounts the navbar, footer and language/user providers. Page folders: `recipes`, `tips`, `gaza-kitchen`, `doctors` (+ `book`), `tracker`, `favorites`, `report-area`, `support`, `login`, `signup`, `assistant`, and `dashboard/*` (organization, reports, patients, appointments, doctors, tracker). A catch-all `[...rest]` renders the not-found page. API routes sit outside the locale tree under `app/api/` (auth, favorites, kitchens, doctors, notifications, cron, chat).

## proxy.ts

Next 16 calls the request interceptor `proxy.ts` (the repo has no legacy middleware file). It does three things in order:

1. skips static files and framework paths,
2. applies the locale decision from `lib/i18n-routing.ts` (bare paths get a 307 to `/en/...` or `/ar/...`, using the `lang` cookie, then `Accept-Language`, then English) and passes the language on in an `x-lang` request header,
3. for protected pages checks for a Supabase session cookie, verifying the user with Supabase; on public pages with a session cookie it only refreshes the session.

The protected list is `/dashboard`, `/doctors/book`, `/tracker`, `/report-area`, `/support`. Details of who may do what are in [[auth-and-roles]].

> ⚠️ The locale redirect depends on the `lang` cookie and `Accept-Language`, so the proxy marks it `private, no-store` and `Vary: Cookie, Accept-Language`. Dropping those headers lets a shared cache send one visitor's language to everyone.

> ⚠️ The list of signed-in pages exists twice: `PROTECTED_ROUTES` in `proxy.ts` (redirect to login) and `PROTECTED_PAGES` in `next.config.ts` (`private, no-store` cache header). Adding a protected page means editing both, otherwise the page is guarded but may be stored by a shared cache.

> ⚠️ Server Actions and API routes have no `[lang]` route param. They read the language from the `x-lang` header the proxy sets, then the Referer path, then the `lang` cookie (`getRequestLang` in `lib/i18n.ts`). Code that bypasses the proxy (tests, direct calls) falls back to the cookie or English.

## Data layer

`lib/prisma.ts` builds one `PrismaClient` over a `pg` pool using `DATABASE_URL` and reuses it across hot reloads in development. `prisma/schema.prisma` has these main models: `User` (id equals the Supabase user id, `role`), `FoodRecipe`, `HealthTip`, `Kitchen`, `MealOrder`, `Doctor`, `Appointment`, `Notification`, `Meal`, `Favorite`, `SupportTicket`, `AreaReport`, `RateLimit`, `NutritionGuide` and the assistant's `KnowledgeChunk`. Display text (names, titles, advice) is stored as `{ ar, en }` JSON. `prisma.config.ts` points the Prisma CLI at `DATABASE_URL` and the seed script.

Read-mostly content (recipes, tips, doctors, nutrition guide) is read through `lib/data.ts`, which wraps queries in `unstable_cache` for one hour with tags. See [[recipes-tips-and-favorites]]. Actions that change data call `revalidateLocalized` (`lib/revalidate.ts`) so both language URLs refresh.

`lib/auth.ts` is the single place that turns the Supabase session cookie into `{ id, role }` by reading the `User` row.

## Internationalisation

`lib/i18n-routing.ts` is the only code that maps paths and languages (pure functions, unit tested in `tests/i18nRouting.test.js`). `lib/i18n.ts` loads `locales/en.json` or `locales/ar.json`; the `server.*` section holds user-facing error messages for actions.

> ⚠️ `tests/locales.test.js` fails when the two locale files do not have exactly the same keys or when any value is empty. Add every new string to both files in the same change.

## PWA

`next.config.ts` wraps the config with Serwist, which builds `app/sw.ts` into the worker file under `public` and is disabled in development. The worker never caches `/api/*` (network only), caches build assets and images, and for a bare navigation that fails offline falls back to a cached localized page and then the static offline page in `public`. `next.config.ts` also sets security headers and a no-cache header for the generated worker.

> ⚠️ The generated worker file under `public` is a build artefact (git-ignored). Edit `app/sw.ts`, never the generated file, and keep API responses network-only so a shared device cannot show the previous person's data.

## Related

[[community-kitchens]] - [[meal-tracker]] - [[doctors-and-appointments]] - [[reports-and-support]] - [[gaza-time-and-reservation-day]] - [[environment-variables]] - [[local-setup-and-deploy]]
