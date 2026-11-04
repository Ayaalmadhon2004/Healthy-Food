---
title: Meal tracker
type: subsystem
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: app/actions/mealActions.ts
  - code: lib/calorieGoal.ts
  - code: lib/dates.ts
  - code: lib/dashboardStats.ts
  - code: app/actions/statsActions.ts
  - code: app/[lang]/tracker/page.tsx
  - code: app/[lang]/dashboard/tracker/monthly/page.tsx
  - code: components/mealTracker/MonthlyDashboard.tsx
  - code: prisma/schema.prisma
  - code: tests/mealActions.test.js
  - code: tests/calorieGoal.test.js
verified_at: 8b565be
---

# Meal tracker

Signed-in users log meals (`Meal`: type, food name, calories) and see progress against a daily calorie goal. Pages: `/[lang]/tracker` (today) and `/[lang]/dashboard/tracker/monthly` (month grid and stats); both require login ([[overview]]).

## Actions (`app/actions/mealActions.ts`)

- `addMealAction`: calories must be an integer from 0 to 20000. `getMealsAction`: meals since Gaza midnight. `deleteMealAction`: deletes only the caller's own meal (`deleteMany` with the user id, so someone else's id reports "not found").
- `getMonthlyGridDataAction` returns calories per Gaza day of month plus the goal; `getMonthlyStatsAction` returns the average of days that have meals, the number of "commitment days" (total above 0 and at or under the goal) and the meal count.
- The user is always the session user; the `_userId` parameter of the monthly and reservation actions is ignored ([[auth-and-roles]]). Day boundaries come from [[gaza-time-and-reservation-day]].

## Calorie goal

`lib/calorieGoal.ts`: default 2000, allowed 800 to 6000. It is stored in the existing `User.health_goals` JSON column as `dailyCalories`, so no schema change was needed. `getCalorieGoalAction` and `setCalorieGoalAction` read and write it; out-of-range values return `INVALID_GOAL`.

> ⚠️ `health_goals` is created as an empty array at signup and may hold other keys. `withCalorieGoal` copies existing keys and `readCalorieGoal` ignores arrays; writing `{ dailyCalories }` directly would drop the other keys. `tests/mealActions.test.js` checks that they are kept.

> ⚠️ "Today" and month buckets use Gaza time, never the server timezone. A meal logged at 23:30 in Gaza must land on that Gaza day.

## Dashboard numbers

The role cards on `/dashboard` come from `getDashboardStatsAction` (organisations, see [[community-kitchens]]) and `getDoctorStatsAction` (doctors, see [[doctors-and-appointments]]); the plain user view shows tracker shortcuts.
