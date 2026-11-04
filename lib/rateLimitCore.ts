// Pure fixed-window logic (no DB, no path aliases) so it can be unit-tested directly.
// lib/rateLimit.ts applies the same window rule atomically inside PostgreSQL.

const MS_PER_SECOND = 1000;

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number;
}

export interface WindowState {
  windowStart: number; // epoch ms
  count: number;
}

/** Register one hit against an optional previous state; starts a fresh window if expired. */
export function applyHit(prev: WindowState | null, now: number, windowMs: number): WindowState {
  if (!prev || prev.windowStart + windowMs <= now) return { windowStart: now, count: 1 };
  return { windowStart: prev.windowStart, count: prev.count + 1 };
}

/** Turn a window state into an allow/deny decision; retryAfter is in whole seconds. */
export function decide(state: WindowState, now: number, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  if (state.count <= limit) return { ok: true, retryAfter: 0 };
  const remainingMs = state.windowStart + windowMs - now;
  return { ok: false, retryAfter: Math.max(1, Math.ceil(remainingMs / MS_PER_SECOND)) };
}

// An IPv6 address is at most 45 characters; anything longer is not an address and must not become a database key.
const MAX_IP_CHARS = 45;

function validIp(value: string | null): string | null {
  const ip = value?.trim() ?? "";
  return ip && ip.length <= MAX_IP_CHARS ? ip : null;
}

/**
 * Client address for rate limiting. Order of trust:
 *  1. `x-vercel-forwarded-for` and 2. `x-real-ip`: set by the platform edge, which overwrites any client-supplied value.
 *  3. `x-forwarded-for`: a client can send its own entries, and each proxy APPENDS the address it saw, so the FIRST entry is
 *     attacker-controlled. We take the LAST entry, i.e. the one added by the nearest proxy. This assumes exactly one trusted
 *     proxy in front of the app; with more, the last entry is that proxy's address and limits become shared (safe, not bypassable).
 * Falls back to "unknown" (one shared bucket) when nothing usable is present.
 */
export function getClientIp(request: { headers: Headers }): string {
  const { headers } = request;
  const forwarded = headers.get("x-forwarded-for")?.split(",").pop() ?? null;
  return validIp(headers.get("x-vercel-forwarded-for")?.split(",")[0] ?? null) ?? validIp(headers.get("x-real-ip")) ?? validIp(forwarded) ?? "unknown";
}
