import { prisma } from "@/lib/prisma";
import { decide, getClientIp } from "@/lib/rateLimitCore";
import type { RateLimitOptions, RateLimitResult } from "@/lib/rateLimitCore";

export type { RateLimitOptions, RateLimitResult };
export { getClientIp };

const CLEANUP_PROBABILITY = 0.01;
const MS_PER_SECOND = 1000;
const MIN_RETENTION_MS = 3600 * MS_PER_SECOND;

interface HitRow {
  count: number;
  remaining_ms: number;
}

/**
 * Durable fixed-window limiter backed by PostgreSQL. A single INSERT ... ON CONFLICT
 * DO UPDATE makes the increment atomic across concurrent requests and instances; the
 * database clock is used so instances cannot disagree about window boundaries.
 * Fails open (and logs) if the database is unavailable.
 */
export async function rateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
  const { limit, windowMs } = opts;
  try {
    const rows = await prisma.$queryRaw<HitRow[]>`
      INSERT INTO "rate_limits" ("key", "windowStart", "count")
      VALUES (${key}, (now() AT TIME ZONE 'UTC'), 1)
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "rate_limits"."windowStart" + (${windowMs}::double precision * interval '1 millisecond') <= (now() AT TIME ZONE 'UTC')
          THEN 1 ELSE "rate_limits"."count" + 1 END,
        "windowStart" = CASE
          WHEN "rate_limits"."windowStart" + (${windowMs}::double precision * interval '1 millisecond') <= (now() AT TIME ZONE 'UTC')
          THEN (now() AT TIME ZONE 'UTC') ELSE "rate_limits"."windowStart" END
      RETURNING "count",
        (EXTRACT(EPOCH FROM ("windowStart" + (${windowMs}::double precision * interval '1 millisecond') - (now() AT TIME ZONE 'UTC'))) * ${MS_PER_SECOND})::double precision AS remaining_ms`;

    const row = rows[0];
    if (!row) return { ok: true, retryAfter: 0 };

    if (Math.random() < CLEANUP_PROBABILITY) void cleanupExpired(windowMs);

    // Express the DB result as a WindowState relative to "now = 0".
    return decide({ windowStart: Number(row.remaining_ms) - windowMs, count: Number(row.count) }, 0, { limit, windowMs });
  } catch (error) {
    console.error("Rate limiter unavailable, failing open:", error instanceof Error ? error.message : error);
    return { ok: true, retryAfter: 0 };
  }
}

async function cleanupExpired(windowMs: number): Promise<void> {
  try {
    const retention = Math.max(windowMs, MIN_RETENTION_MS);
    await prisma.$executeRaw`
      DELETE FROM "rate_limits"
      WHERE "windowStart" < (now() AT TIME ZONE 'UTC') - (${retention}::double precision * interval '1 millisecond')`;
  } catch (error) {
    console.error("Rate limit cleanup failed:", error instanceof Error ? error.message : error);
  }
}
