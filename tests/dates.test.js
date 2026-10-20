import test from "node:test";
import assert from "node:assert/strict";
import {
  getGazaDayOfMonth,
  getGazaMonthRange,
  getGazaTodayStart,
  getReservationTargetDate,
} from "../lib/dates.ts";

const iso = (d) => d.toISOString();

test("reservation date is tomorrow in Gaza, even near midnight (winter, UTC+2)", () => {
  assert.equal(iso(getReservationTargetDate(new Date("2026-01-15T21:30:00Z"))), "2026-01-16T00:00:00.000Z");
  // 22:30Z is already Jan 16 in Gaza
  assert.equal(iso(getReservationTargetDate(new Date("2026-01-15T22:30:00Z"))), "2026-01-17T00:00:00.000Z");
});

test("reservation date in summer time (UTC+3)", () => {
  assert.equal(iso(getReservationTargetDate(new Date("2026-07-15T20:30:00Z"))), "2026-07-16T00:00:00.000Z");
  assert.equal(iso(getReservationTargetDate(new Date("2026-07-15T21:30:00Z"))), "2026-07-17T00:00:00.000Z");
});

test("reservation date rolls over the year", () => {
  assert.equal(iso(getReservationTargetDate(new Date("2026-12-31T10:00:00Z"))), "2027-01-01T00:00:00.000Z");
});

test("start of the Gaza day", () => {
  assert.equal(iso(getGazaTodayStart(new Date("2026-01-15T10:00:00Z"))), "2026-01-14T22:00:00.000Z");
  assert.equal(iso(getGazaTodayStart(new Date("2026-07-15T10:00:00Z"))), "2026-07-14T21:00:00.000Z");
});

test("month ranges are [start, end) in Gaza time", () => {
  const dec = getGazaMonthRange(2026, 12);
  assert.equal(iso(dec.start), "2026-11-30T22:00:00.000Z");
  assert.equal(iso(dec.end), "2026-12-31T22:00:00.000Z");
});

test("a meal logged at 23:30Z on Jan 31 belongs to Feb 1 in Gaza", () => {
  const meal = new Date("2026-01-31T23:30:00Z");
  assert.equal(getGazaDayOfMonth(meal), 1);
  assert.ok(meal >= getGazaMonthRange(2026, 1).end);
});
