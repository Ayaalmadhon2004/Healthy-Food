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

export function getClientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown";
}
