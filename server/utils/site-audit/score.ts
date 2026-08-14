import type { AuditStatus } from '~/types/site-audit'

/** CPWD Health Score weights - documented product formula. */
export const HEALTH_WEIGHTS = {
  performance: 0.4,
  seo: 0.25,
  accessibility: 0.2,
  'best-practices': 0.15,
} as const

export function scoreToStatus(score: number): AuditStatus {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 50) return 'needs-attention'
  return 'poor'
}

/** Convert Lighthouse 0-1 score to 0-100 integer. */
export function toPercent(score: number | null | undefined): number | null {
  if (score == null || Number.isNaN(score)) return null
  return Math.round(Math.min(1, Math.max(0, score)) * 100)
}

export function computeHealthScore(categories: {
  performance: number
  seo: number
  accessibility: number
  'best-practices': number
}): number {
  const raw =
    categories.performance * HEALTH_WEIGHTS.performance
    + categories.seo * HEALTH_WEIGHTS.seo
    + categories.accessibility * HEALTH_WEIGHTS.accessibility
    + categories['best-practices'] * HEALTH_WEIGHTS['best-practices']

  return Math.round(Math.min(100, Math.max(0, raw)))
}
