import type {
  AuditCategoryId,
  AuditMetric,
  AuditRecommendation,
  AuditStrategy,
  SiteAuditResult,
} from '~/types/site-audit'
import {
  getAuditExplanation,
  getCategoryFallbackFix,
  getMetricExplanation,
  type AuditLocale,
} from './explanations'
import { computeHealthScore, scoreToStatus, toPercent } from './score'

interface LighthouseAudit {
  id?: string
  title?: string
  description?: string
  score?: number | null
  scoreDisplayMode?: string
  displayValue?: string
  numericValue?: number
}

interface LighthouseCategory {
  id?: string
  score?: number | null
  auditRefs?: Array<{ id: string; weight?: number }>
}

interface LighthouseResult {
  categories?: Record<string, LighthouseCategory>
  audits?: Record<string, LighthouseAudit>
  lighthouseVersion?: string
  fetchTime?: string
  finalUrl?: string
}

const CATEGORY_IDS: AuditCategoryId[] = ['performance', 'accessibility', 'best-practices', 'seo']

const METRIC_IDS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interaction-to-next-paint',
] as const

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function categoryScores(lh: LighthouseResult) {
  const scores: Record<AuditCategoryId, number> = {
    performance: 0,
    accessibility: 0,
    'best-practices': 0,
    seo: 0,
  }

  for (const id of CATEGORY_IDS) {
    const pct = toPercent(lh.categories?.[id]?.score ?? null)
    scores[id] = pct ?? 0
  }

  return scores
}

function buildMetrics(audits: Record<string, LighthouseAudit>, locale: AuditLocale): AuditMetric[] {
  const metrics: AuditMetric[] = []

  for (const id of METRIC_IDS) {
    const audit = audits[id]
    if (!audit) continue

    const score = toPercent(audit.score ?? null)
    metrics.push({
      id,
      title: stripHtml(audit.title || id),
      displayValue: audit.displayValue || '-',
      numericValue: typeof audit.numericValue === 'number' ? audit.numericValue : null,
      score,
      status: score == null ? null : scoreToStatus(score),
      explanation: getMetricExplanation(id, locale)
        || (locale === 'en'
          ? 'Loading metric from the Lighthouse measurement.'
          : 'Laadmetriek uit de Lighthouse-meting.'),
    })
  }

  return metrics
}

function impactRank(impact: AuditRecommendation['impact']): number {
  if (impact === 'high') return 3
  if (impact === 'medium') return 2
  return 1
}

function buildRecommendations(
  lh: LighthouseResult,
  audits: Record<string, LighthouseAudit>,
  locale: AuditLocale,
): AuditRecommendation[] {
  const candidates: AuditRecommendation[] = []

  for (const categoryId of CATEGORY_IDS) {
    const refs = lh.categories?.[categoryId]?.auditRefs ?? []
    for (const ref of refs) {
      const audit = audits[ref.id]
      if (!audit?.id) continue
      if (audit.scoreDisplayMode === 'informative' || audit.scoreDisplayMode === 'manual' || audit.scoreDisplayMode === 'notApplicable') {
        continue
      }
      if (audit.score != null && audit.score >= 0.9) continue
      if (audit.score == null && !audit.displayValue) continue

      const mapped = getAuditExplanation(audit.id, locale)
      const weight = ref.weight ?? 0
      const scoreGap = audit.score == null ? 1 : 1 - audit.score
      const category = mapped?.category ?? categoryId

      candidates.push({
        id: audit.id,
        title: mapped?.friendlyTitle ?? stripHtml(audit.title || audit.id),
        description: mapped?.description ?? (stripHtml(audit.description || '') || (
          locale === 'en'
            ? 'This check scored too low in the Lighthouse measurement.'
            : 'Deze check scoort te laag in de Lighthouse-meting.'
        )),
        recommendation: mapped?.recommendation ?? getCategoryFallbackFix(category, locale),
        category,
        impact: mapped?.impact ?? (weight >= 1 || scoreGap > 0.5 ? 'high' : scoreGap > 0.25 ? 'medium' : 'low'),
        difficulty: mapped?.difficulty ?? 'medium',
        displayValue: audit.displayValue ?? null,
        officialTitle: stripHtml(audit.title || audit.id),
      })
    }
  }

  const unique = new Map<string, AuditRecommendation>()
  for (const item of candidates) {
    if (!unique.has(item.id)) unique.set(item.id, item)
  }

  return [...unique.values()]
    .sort((a, b) => impactRank(b.impact) - impactRank(a.impact) || a.title.localeCompare(b.title))
    .slice(0, 5)
}

export function normalizePagespeedResponse(
  raw: Record<string, unknown>,
  strategy: AuditStrategy,
  requestedUrl: string,
  locale: AuditLocale = 'nl',
): SiteAuditResult | null {
  const lh = raw.lighthouseResult as LighthouseResult | undefined
  if (!lh?.categories || !lh.audits) return null

  const scores = categoryScores(lh)
  for (const id of CATEGORY_IDS) {
    if (lh.categories[id]?.score == null) return null
  }

  const healthScore = computeHealthScore(scores)
  const audits = lh.audits

  return {
    url: (typeof lh.finalUrl === 'string' && lh.finalUrl) || requestedUrl,
    fetchedAt: new Date().toISOString(),
    strategy,
    healthScore,
    healthStatus: scoreToStatus(healthScore),
    categories: CATEGORY_IDS.map(id => ({
      id,
      score: scores[id],
      status: scoreToStatus(scores[id]),
    })),
    metrics: buildMetrics(audits, locale),
    recommendations: buildRecommendations(lh, audits, locale),
    lighthouseVersion: lh.lighthouseVersion ?? null,
    fetchTime: lh.fetchTime ?? null,
  }
}
