/**
 * Simple in-memory rate limiter for the public site-audit endpoint.
 * Best-effort abuse protection (resets on server restart / multi-instance).
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 6

export function checkAuditRateLimit(key: string): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (existing.count >= MAX_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { allowed: true }
}

/** Periodic cleanup to avoid unbounded growth. */
export function pruneAuditRateLimits() {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}
