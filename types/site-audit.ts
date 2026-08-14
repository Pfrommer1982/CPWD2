export type AuditStrategy = 'mobile' | 'desktop'

export type AuditCategoryId = 'performance' | 'accessibility' | 'best-practices' | 'seo'

export type AuditStatus = 'excellent' | 'good' | 'needs-attention' | 'poor'

export type AuditImpact = 'high' | 'medium' | 'low'
export type AuditDifficulty = 'easy' | 'medium' | 'hard'

export interface AuditCategoryScore {
  id: AuditCategoryId
  score: number
  status: AuditStatus
}

export interface AuditMetric {
  id: string
  title: string
  displayValue: string
  numericValue: number | null
  score: number | null
  status: AuditStatus | null
  explanation: string
}

export interface AuditRecommendation {
  id: string
  title: string
  description: string
  recommendation: string
  category: AuditCategoryId | 'other'
  impact: AuditImpact
  difficulty: AuditDifficulty
  displayValue: string | null
  officialTitle: string
}

export interface SiteAuditResult {
  url: string
  fetchedAt: string
  strategy: AuditStrategy
  /** CPWD composite health score 0-100 (Performance 40%, SEO 25%, A11y 20%, Best Practices 15%). */
  healthScore: number
  healthStatus: AuditStatus
  categories: AuditCategoryScore[]
  metrics: AuditMetric[]
  recommendations: AuditRecommendation[]
  lighthouseVersion: string | null
  fetchTime: string | null
}

export interface SiteAuditResponse {
  ok: true
  result: SiteAuditResult
  availableStrategies: AuditStrategy[]
}

export interface SiteAuditErrorBody {
  ok: false
  code:
    | 'invalid_url'
    | 'missing_key'
    | 'rate_limited'
    | 'timeout'
    | 'unreachable'
    | 'quota'
    | 'incomplete'
    | 'unavailable'
  message: string
}
