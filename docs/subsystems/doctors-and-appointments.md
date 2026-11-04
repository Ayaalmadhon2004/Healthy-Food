---
title: Doctors and appointments
type: subsystem
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: app/actions/appointmentActions.ts
  - code: lib/appointments.ts
  - code: app/actions/statsActions.ts
  - code: app/api/doctors/route.ts
  - code: app/api/notifications/unread/route.ts
  - code: app/[lang]/doctors/book/page.tsx
  - code: app/[lang]/dashboard/patients/page.tsx
  - code: app/[lang]/dashboard/appointments/page.tsx
  - code: app/[lang]/dashboard/doctors/page.tsx
  - code: components/NotificationBell.tsx
  - code: prisma/schema.prisma
  - code: tests/appointments.test.js
verified_at: 8b565be
---

# Doctors and appointments

`Doctor` profiles are seeded and shown at `/[lang]/doctors`. A signed-in user requests a visit at `/[lang]/doctors/book`; the doctor manages requests from `/dashboard/patients`; the patient sees them in `/dashboard/appointments`.

## Booking

`requestAppointmentAction` takes a doctor id, a day string `YYYY-MM-DD` and a note (max 500 chars). `parseAppointmentDate` accepts real days from tomorrow (Gaza) up to 60 days ahead ([[gaza-time-and-reservation-day]]). A doctor cannot book with themself. Appointments carry a day, not a time, so each doctor accepts at most 10 active (`PENDING` or `CONFIRMED`) requests per day. `Appointment` is unique on patient, doctor and day, which surfaces as "duplicate".

> ⚠️ The per-day count and the insert must stay in the same `Serializable` transaction (`app/actions/appointmentActions.ts:42`), retried on Prisma `P2034`. Without it two patients can both take the last slot.

## Status flow

Statuses: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`. A doctor may move PENDING to CONFIRMED or CANCELLED, and CONFIRMED to COMPLETED or CANCELLED (`canDoctorMove`); finished states are final. A patient may cancel PENDING or CONFIRMED (`cancelMyAppointmentAction`). Cancelled and completed visits free the slot.

> ⚠️ `updateAppointmentStatusAction` puts the old status in the `updateMany` where clause and writes the patient's `Notification` in the same transaction. That stops two quick clicks skipping a step and guarantees a status change is never silent. Do not split them. Only the doctor linked to that appointment may change it.

## Notifications

`Notification` copies the doctor's name and visit date so the message still reads right if the appointment is deleted. `GET /api/notifications/unread` returns `{ count }` (0 when signed out) for the navbar bell, with `no-store`; `markNotificationsReadAction` marks all as read.

## Linking doctor accounts

An `ADMIN` links a user account to a doctor profile by email (`linkDoctorAccountAction`, page `/dashboard/doctors`): the account's role becomes `DOCTOR`; an empty email unlinks and returns the old account to `USER`. `ORG` and `ADMIN` accounts are refused so they are not locked out. See [[auth-and-roles]].

> ⚠️ `GET /api/doctors` selects public fields only, leaving out phone and email. Keep it that way when adding columns.

`getDoctorStatsAction` gives the doctor dashboard cards (distinct patients, upcoming confirmed visits, pending requests).
