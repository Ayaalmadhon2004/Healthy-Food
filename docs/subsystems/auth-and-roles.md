---
title: Auth and roles
type: subsystem
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: app/api/auth/signup/route.ts
  - code: app/api/auth/login/route.ts
  - code: app/api/auth/logout/route.ts
  - code: app/api/auth/me/route.ts
  - code: app/actions/authActions.ts
  - code: lib/auth.ts
  - code: lib/supabase/server.ts
  - code: lib/validations/auth.ts
  - code: proxy.ts
  - code: prisma/schema.prisma
  - code: app/[lang]/dashboard/reports/page.tsx
  - code: app/[lang]/dashboard/doctors/page.tsx
  - code: app/[lang]/dashboard/organization/[id]/edit/page.tsx
  - code: hooks/useUserData.tsx
verified_at: 8b565be
---

# Auth and roles

Sign-in is Supabase Auth with session cookies; the app's own `User` table (same id as the Supabase user) holds the profile and the `role`.

## Routes

- `POST /api/auth/signup`: rate limited (5 per 10 minutes per IP), validates with a Zod schema built from the request's messages (`lib/validations/auth.ts`: name 2-50 chars, password at least 8 with an upper-case letter, a digit and a symbol), rejects a registered email with 409, creates the Supabase user with the service-role client (email pre-confirmed), then inserts the `User` row.
- `POST /api/auth/login`: rate limited (10 per minute per IP), `signInWithPassword`, then returns the profile and the user's favourite recipes.
- `POST /api/auth/logout` signs out of Supabase; `GET /api/auth/me` returns `{ user }` or `null`.
- Rate limiting is explained in [[reports-and-support]].

## Roles

`Role` is `USER` (default), `ORG`, `ADMIN`, `DOCTOR`. `isOrgRole` in `lib/auth.ts` is true for `ORG` and `ADMIN`; that is the gate for kitchen management ([[community-kitchens]]) and area-report review ([[reports-and-support]]). `ADMIN` alone manages support tickets and links doctor accounts; `DOCTOR` runs appointments ([[doctors-and-appointments]]). Signup always creates a `USER`. How an account becomes `ORG` or `ADMIN` is not done in any code path found (unverified; presumably edited in the database).

## Where checks happen

`proxy.ts` only answers "is anyone signed in" for `/dashboard`, `/doctors/book`, `/tracker`, `/report-area`, `/support` (see [[overview]]). Role checks live in the Server Actions and in a few server pages (reports, doctors admin, kitchen edit).

> ⚠️ Authorization must be repeated inside every Server Action and route. Server Actions are callable without visiting the page, and the proxy checks neither role nor the `/dashboard/organization` client page. Always derive the user from `getSessionUser()`; actions ignore any user id passed by the browser (several keep an unused `_userId` argument only for compatibility).

> ⚠️ Signup creates the Supabase user first and the `User` row second. If the row insert fails the route deletes the Supabase user again; keep that compensation, otherwise a login succeeds with no profile.

> ⚠️ `getSessionUser()` returns `null` when the Supabase user has no `User` row, so a session without a profile is treated as signed out. Tests rely on this (`tests/mealActions.test.js`).

> ⚠️ `getSupabaseAdmin()` throws without `SUPABASE_SERVICE_ROLE_KEY`; that key is server-only and is read only in `lib/supabase/server.ts`. See [[environment-variables]].
