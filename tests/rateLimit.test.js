import test from "node:test";
import assert from "node:assert/strict";
import { applyHit, decide, getClientIp } from "../lib/rateLimitCore.ts";

const run = (hits, opts) => {
  let state = null;
  const results = [];
  for (const at of hits) {
    state = applyHit(state, at, opts.windowMs);
    results.push(decide(state, at, opts));
  }
  return results;
};

test("allows up to the limit, then blocks with a retry time", () => {
  const opts = { limit: 3, windowMs: 60_000 };
  const r = run([0, 1000, 2000, 3000], opts);
  assert.deepEqual(r.slice(0, 3).map((x) => x.ok), [true, true, true]);
  assert.equal(r[3].ok, false);
  assert.equal(r[3].retryAfter, 57);
});

test("window resets exactly at its boundary", () => {
  const opts = { limit: 1, windowMs: 1000 };
  const r = run([0, 999, 1000], opts);
  assert.deepEqual(r.map((x) => x.ok), [true, false, true]);
});

test("blocked hits keep the original window start (fixed window)", () => {
  let s = applyHit(null, 100, 1000);
  s = applyHit(s, 900, 1000);
  assert.deepEqual(s, { windowStart: 100, count: 2 });
});

test("retryAfter is at least 1 second", () => {
  const s = { windowStart: 0, count: 5 };
  assert.equal(decide(s, 999, { limit: 1, windowMs: 1000 }).retryAfter, 1);
});

test("getClientIp prefers the first x-forwarded-for entry", () => {
  const req = (h) => ({ headers: new Headers(h) });
  assert.equal(getClientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })), "1.2.3.4");
  assert.equal(getClientIp(req({ "x-real-ip": "9.9.9.9" })), "9.9.9.9");
  assert.equal(getClientIp(req({})), "unknown");
});
