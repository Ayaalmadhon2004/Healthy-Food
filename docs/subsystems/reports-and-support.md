---
title: Area reports, support tickets and rate limiting
type: subsystem
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: app/actions/reportActions.ts
  - code: app/actions/supportActions.ts
  - code: lib/reportStatus.ts
  - code: lib/validations/support.ts
  - code: lib/rateLimit.ts
  - code: lib/rateLimitCore.ts
  - code: app/[lang]/report-area/page.tsx
  - code: app/[lang]/dashboard/reports/page.tsx
  - code: app/[lang]/support/page.tsx
  - code: prisma/schema.prisma
  - code: tests/rateLimit.test.js
  - code: tests/support.test.js
  - code: tests/reportAuthActions.test.js
verified_at: 959592c
---

# Area reports, support tickets and rate limiting

## Area reports

Residents report a neighbourhood that distribution does not reach at `/[lang]/report-area` (login required). `submitAreaReportAction` checks both fields are non-empty strings (area up to 200 chars, description up to 2000), stores an `AreaReport` with status `pending` and redirects to the dashboard. `ORG` and `ADMIN` ([[auth-and-roles]]) review them at `/dashboard/reports` (`getAllReportsAction`, which includes the reporter's name and email) and set the status to `pending`, `seen` or `investigated` (`updateReportStatusAction`, validated by `isReportStatus`). The report count also feeds the organisation cards in [[community-kitchens]].

## Support tickets

`/[lang]/support` (login required). `createTicketAction` is limited to 5 tickets per 10 minutes per user, then validated by Zod (subject 3-120, message 10-2000 characters). Statuses are `OPEN`, `IN_PROGRESS`, `CLOSED`. Only `ADMIN` can view all tickets and change status (`canManageTickets`, `updateTicketStatusAction`); the form returns short codes (`unauthorized`, `rate_limited`, `invalid`, `failed`).

## Rate limiting

`lib/rateLimit.ts` is a durable fixed-window limiter in the `rate_limits` table. One `INSERT ... ON CONFLICT DO UPDATE` increments the counter atomically and uses the database clock, so several instances agree on window edges; about 1% of calls also delete expired rows. `lib/rateLimitCore.ts` holds the pure window logic and `getClientIp` (`x-vercel-forwarded-for`, then `x-real-ip`, then the LAST `x-forwarded-for` entry, then "unknown"; values that are empty or longer than 45 characters are ignored). Keys: `signup:<ip>` 5 per 10 minutes, `login:<ip>` 10 per minute, `support:<userId>` 5 per 10 minutes. The assistant route has its own limit ([[nutrition-assistant]]).

> ⚠️ The limiter fails open: if the database call throws, it logs and allows the request. It protects against abuse, not outages; do not use it as an authorization gate.

> ⚠️ `getClientIp` assumes exactly one trusted proxy in front of the app (as on Vercel). The first `x-forwarded-for` entry is client-controlled, so it is never used; locally, without a proxy, every client can look alike or be `unknown`. Do not go back to the first entry: it let a guest dodge every rate limit by sending a fake header.

> ⚠️ `lib/rateLimit.ts` writes raw SQL against `"rate_limits"` and its column names. Renaming `RateLimit` fields in `prisma/schema.prisma` breaks it without a type error.
