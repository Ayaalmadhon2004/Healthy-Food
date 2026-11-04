---
title: Gaza time and the reservation day
type: concept
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: lib/dates.ts
  - code: lib/appointments.ts
  - code: app/actions/mealActions.ts
  - code: tests/dates.test.js
  - code: tests/mealActions.test.js
verified_at: 8b565be
---

# Gaza time and the reservation day

All "day" logic follows the `Asia/Gaza` timezone, not the server's clock (`APP_TIMEZONE` in `lib/dates.ts`). Helpers: today's start, day of month, month range, and the instant a Gaza calendar day starts (daylight saving handled by round-tripping through `Intl`).

## Two representations of a day

- **Instants** (meals, month ranges): "today" for the tracker begins at Gaza midnight, so `getGazaTodayStart` and `getGazaMonthRange` return real instants. See [[meal-tracker]].
- **Calendar dates** (reservations, appointments): stored as that date at 00:00 UTC. `getReservationTargetDate` returns tomorrow's Gaza date this way. [[community-kitchens]] uses it for `MealOrder.targetDate`; [[doctors-and-appointments]] reuses it as the earliest bookable day (`parseAppointmentDate` in `lib/appointments.ts`).

> ⚠️ Never build a day with `new Date()` plus local midnight or compare reservation dates with instants. A server in UTC and a user in Gaza disagree for hours every night. Use the helpers in `lib/dates.ts`; `tests/mealActions.test.js` checks that "today" starts at Gaza midnight, not UTC midnight.
