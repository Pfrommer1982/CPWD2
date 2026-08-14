import type { SiteAuditResult } from '~/types/site-audit'
import { getAuditExplanation, getMetricExplanation, type AuditLocale } from './explanations'
import { scoreToStatus } from './score'

/** Development-only fixture - never returned when NODE_ENV=production. */
export function createMockSiteAuditResult(url: string, locale: AuditLocale = 'nl'): SiteAuditResult {
  const categories = [
    { id: 'performance' as const, score: 68 },
    { id: 'seo' as const, score: 92 },
    { id: 'accessibility' as const, score: 84 },
    { id: 'best-practices' as const, score: 79 },
  ].map(c => ({ ...c, status: scoreToStatus(c.score) }))

  const image = getAuditExplanation('uses-responsive-images', locale)!
  const render = getAuditExplanation('render-blocking-resources', locale)!
  const contrast = getAuditExplanation('color-contrast', locale)!

  return {
    url,
    fetchedAt: new Date().toISOString(),
    strategy: 'mobile',
    healthScore: 78,
    healthStatus: scoreToStatus(78),
    categories,
    metrics: [
      {
        id: 'first-contentful-paint',
        title: 'First Contentful Paint',
        displayValue: '2.1 s',
        numericValue: 2100,
        score: 72,
        status: scoreToStatus(72),
        explanation: getMetricExplanation('first-contentful-paint', locale) || '',
      },
      {
        id: 'largest-contentful-paint',
        title: 'Largest Contentful Paint',
        displayValue: '3.4 s',
        numericValue: 3400,
        score: 58,
        status: scoreToStatus(58),
        explanation: getMetricExplanation('largest-contentful-paint', locale) || '',
      },
      {
        id: 'total-blocking-time',
        title: 'Total Blocking Time',
        displayValue: '280 ms',
        numericValue: 280,
        score: 70,
        status: scoreToStatus(70),
        explanation: getMetricExplanation('total-blocking-time', locale) || '',
      },
      {
        id: 'cumulative-layout-shift',
        title: 'Cumulative Layout Shift',
        displayValue: '0.08',
        numericValue: 0.08,
        score: 88,
        status: scoreToStatus(88),
        explanation: getMetricExplanation('cumulative-layout-shift', locale) || '',
      },
      {
        id: 'speed-index',
        title: 'Speed Index',
        displayValue: '3.8 s',
        numericValue: 3800,
        score: 65,
        status: scoreToStatus(65),
        explanation: getMetricExplanation('speed-index', locale) || '',
      },
    ],
    recommendations: [
      {
        id: 'uses-responsive-images',
        title: image.friendlyTitle,
        description: image.description,
        recommendation: image.recommendation,
        category: image.category,
        impact: image.impact,
        difficulty: image.difficulty,
        displayValue: locale === 'en' ? 'Estimated savings 1.2 s' : 'Geschatte besparing 1.2 s',
        officialTitle: 'Properly size images',
      },
      {
        id: 'render-blocking-resources',
        title: render.friendlyTitle,
        description: render.description,
        recommendation: render.recommendation,
        category: render.category,
        impact: render.impact,
        difficulty: render.difficulty,
        displayValue: null,
        officialTitle: 'Eliminate render-blocking resources',
      },
      {
        id: 'color-contrast',
        title: contrast.friendlyTitle,
        description: contrast.description,
        recommendation: contrast.recommendation,
        category: contrast.category,
        impact: contrast.impact,
        difficulty: contrast.difficulty,
        displayValue: null,
        officialTitle: 'Background and foreground colors do not have a sufficient contrast ratio.',
      },
    ],
    lighthouseVersion: 'mock',
    fetchTime: new Date().toISOString(),
  }
}
