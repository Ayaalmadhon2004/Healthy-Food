import { getReservationTargetDate } from "@/lib/dates";

export const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const MAX_DAYS_AHEAD = 60;
export const MAX_NOTE_LENGTH = 500;
// Appointments carry a day, not a time, so a doctor's load is capped per day.
export const MAX_APPOINTMENTS_PER_DAY = 10;

export function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === "string" && (APPOINTMENT_STATUSES as readonly string[]).includes(value);
}

const DOCTOR_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function nextStatuses(from: string): AppointmentStatus[] {
  return isAppointmentStatus(from) ? DOCTOR_TRANSITIONS[from] : [];
}

export function canDoctorMove(from: string, to: string): boolean {
  return isAppointmentStatus(from) && isAppointmentStatus(to) && DOCTOR_TRANSITIONS[from].includes(to);
}

// Cancelled and completed visits no longer take a slot.
export const ACTIVE_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED"];

export function canPatientCancel(status: string): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}

// "YYYY-MM-DD" from the booking form -> that day at 00:00 UTC, or null if it is not a real day
// between tomorrow (Gaza time) and MAX_DAYS_AHEAD days later.
export function parseAppointmentDate(value: unknown, now: Date = new Date()): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;

  const earliest = getReservationTargetDate(now);
  const latest = new Date(earliest.getTime() + (MAX_DAYS_AHEAD - 1) * 86_400_000);
  return date >= earliest && date <= latest ? date : null;
}

export interface DoctorStats {
  patients: number;
  upcoming: number;
  pending: number;
}
