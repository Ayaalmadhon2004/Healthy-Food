---
title: Community kitchens and meal reservations
type: subsystem
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: app/actions/kitchenActions.ts
  - code: app/actions/mealActions.ts
  - code: app/actions/statsActions.ts
  - code: lib/capacity.ts
  - code: lib/dashboardStats.ts
  - code: lib/dates.ts
  - code: lib/imageUrl.ts
  - code: app/[lang]/gaza-kitchen/page.tsx
  - code: app/[lang]/dashboard/organization/page.tsx
  - code: app/api/kitchens/route.ts
  - code: components/kitchen/MealRegistration.tsx
  - code: prisma/schema.prisma
  - code: tests/kitchenActions.test.js
  - code: tests/capacity.test.js
verified_at: 8b565be
---

# Community kitchens and meal reservations

Kitchens are rows of `Kitchen` (localized name, region, distribution time, today's meal, `capacity`, contact, optional image). Residents reserve tomorrow's meal; organisations manage kitchens.

## Public page

`/[lang]/gaza-kitchen` loads kitchens through `getKitchensAction` (paged, newest first). Each `KitchenView` carries `capacityLimit` and `reservedTomorrow` (sum of `MealOrder.quantity` for tomorrow), so the UI shows the same remaining places the server enforces. The page is rebuilt at most once a minute (`revalidate = 60`) and immediately after reservation or kitchen changes. `GET /api/kitchens` returns the raw kitchen list.

## Reservations

`reserveMealAction` (`app/actions/mealActions.ts`) accepts a quantity of 1 to 20, for tomorrow in Gaza time ([[gaza-time-and-reservation-day]]). Inside one transaction it refuses a second booking by the same user for the same kitchen and day (`ALREADY_RESERVED`), sums existing quantities, and returns `NOT_ENOUGH_LEFT` with `remaining` if the total would pass the capacity; otherwise it creates the `MealOrder`. `MealOrder` is unique on user, kitchen and target date. `cancelMealAction` deletes the user's order for tomorrow; `checkUserReservation` tells the UI whether one exists. Error codes are plain strings (`LOGIN_REQUIRED`, `INVALID_QUANTITY`, `BUSY`, `GENERIC`) that `components/kitchen/MealRegistration.tsx` translates.

> ⚠️ The check-then-insert must stay inside the `Serializable` transaction (`app/actions/mealActions.ts:229`). Outside it, concurrent users all read the same total and overbook. A serialization failure (Prisma `P2034`) is retried up to five times with jitter, and a leftover failure becomes `BUSY`. `tests/kitchenActions.test.js` fires 12 parallel reservations at a 5-meal kitchen and asserts the total never exceeds capacity.

> ⚠️ Capacity is a `Json` column holding messy legacy values (`500`, `"350-500 families"`, `{ en, ar }`). Always read it with `getCapacityLimit` from `lib/capacity.ts` (largest number found, Arabic digits accepted, default 500, cap 100000), never as a raw number. Form input is validated strictly by `validateCapacityInput`.

## Organisation dashboard

`/[lang]/dashboard/organization` (client page) lists kitchens in a table with add, edit (`.../[id]/edit`, which checks the role on the server) and delete. `addKitchenAction`, `updateKitchenAction` and `deleteKitchenAction` all require `ORG` or `ADMIN` ([[auth-and-roles]]), validate names, capacity and image (`parseImageUrl`: https URL or `/assets/` path) and revalidate both kitchen pages. Adding a kitchen whose Arabic name starts like an existing one appends a counter to both names. `getDashboardStatsAction` (`app/actions/statsActions.ts`) returns tomorrow's reserved meals, the percent of combined capacity used (`buildDashboardStats`, capped at 100), kitchen count and area-report count for the dashboard cards.

> ⚠️ The organisation list page itself does no role check; the guard is the actions. Do not add a kitchen mutation that skips `getIsAuthorized`.
