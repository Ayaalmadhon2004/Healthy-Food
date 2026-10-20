// All "day" logic in the app follows Gaza local time, not the server's timezone.
export const APP_TIMEZONE = "Asia/Gaza";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

function localParts(date) {
  const p = {};
  for (const { type, value } of formatter.formatToParts(date)) p[type] = Number(value);
  return p;
}

// Calendar date (year, month 1-12, day) of an instant in Gaza.
export function getGazaDateParts(date = new Date()) {
  const { year, month, day } = localParts(date);
  return { year, month, day };
}

// Day of the month (1-31) of an instant in Gaza.
export function getGazaDayOfMonth(date) {
  return getGazaDateParts(new Date(date)).day;
}

function offsetMs(instant) {
  const p = localParts(instant);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

// The instant at which the given Gaza calendar day starts (handles DST).
export function gazaDayStart(year, month, day) {
  const guess = new Date(Date.UTC(year, month - 1, day));
  let start = new Date(guess.getTime() - offsetMs(guess));
  start = new Date(guess.getTime() - offsetMs(start));
  return start;
}

export function getGazaTodayStart(now = new Date()) {
  const { year, month, day } = getGazaDateParts(now);
  return gazaDayStart(year, month, day);
}

// [start, end) of a Gaza calendar month. `month` is 1-12.
export function getGazaMonthRange(year, month) {
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return { start: gazaDayStart(year, month, 1), end: gazaDayStart(nextYear, nextMonth, 1) };
}

// Reservations are for "tomorrow" in Gaza, stored as that calendar date at 00:00 UTC.
export function getReservationTargetDate(now = new Date()) {
  const { year, month, day } = getGazaDateParts(now);
  return new Date(Date.UTC(year, month - 1, day + 1));
}
