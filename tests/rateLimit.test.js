import test from "node:test";
import assert from "node:assert/strict";
import { getClientIp, rateLimit } from "../lib/rateLimit.js";

test("allows up to the limit, then blocks with a retry time", () => {
  const key = `test-${Math.random()}`;
  const opts = { limit: 3, windowMs: 60_000 };
  for (let i = 0; i < 3; i++) assert.equal(rateLimit(key, opts).ok, true);
  const blocked = rateLimit(key, opts);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfter > 0 && blocked.retryAfter <= 60);
});

test("keys are independent and the window resets", async () => {
  const opts = { limit: 1, windowMs: 20 };
  assert.equal(rateLimit("a-reset", opts).ok, true);
  assert.equal(rateLimit("a-reset", opts).ok, false);
  assert.equal(rateLimit("b-reset", opts).ok, true);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(rateLimit("a-reset", opts).ok, true);
});

test("getClientIp prefers the first x-forwarded-for entry", () => {
  const req = (h) => ({ headers: new Headers(h) });
  assert.equal(getClientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })), "1.2.3.4");
  assert.equal(getClientIp(req({ "x-real-ip": "9.9.9.9" })), "9.9.9.9");
  assert.equal(getClientIp(req({})), "unknown");
});
