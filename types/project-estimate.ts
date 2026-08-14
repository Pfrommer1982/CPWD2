export type ProjectTypeId =
  | 'one-page'
  | 'business'
  | 'portfolio'
  | 'webshop'
  | 'webapp'

export type DesignLevelId = 'clean' | 'custom' | 'showcase'

export type ContentOptionId = 'self' | 'polish' | 'full'

export type HostingOptionId = 'self' | 'cpwd'

export type FeatureId =
  | 'contact-form'
  | 'cms'
  | 'blog'
  | 'multilingual'
  | 'maps'
  | 'newsletter'
  | 'social'
  | 'analytics'
  | 'advanced-animations'
  | 'api'
  | 'accounts'
  | 'dashboard'
  | 'ai'
  | 'payments'
  | 'booking'

export type ComplexityLevel = 'low' | 'medium' | 'high' | 'custom'

export type BuildWindowId =
  | 'about-1-week'
  | 'about-1-2-weeks'
  | 'about-2-3-weeks'
  | 'about-2-4-weeks'
  | 'after-intake'

export interface ProjectEstimateConfig {
  type: ProjectTypeId | null
  pages: number
  design: DesignLevelId
  features: FeatureId[]
  content: ContentOptionId
  hosting: HostingOptionId
}

export interface PriceRange {
  base: number
  low: number
  high: number
}

export interface ProjectEstimateResult {
  projectTotal: number
  range: PriceRange
  hostingYearly: number
  complexity: ComplexityLevel
  complexityScore: number
  buildWindow: BuildWindowId
  needsIntake: boolean
  includedPages: number
  extraPages: number
  projectCode: string
}

export interface ProjectEstimateRequestPayload {
  name: string
  email: string
  company?: string
  phone?: string
  note?: string
  website?: string
  locale: 'nl' | 'en'
  estimate: {
    projectCode: string
    type: ProjectTypeId
    pages: number
    design: DesignLevelId
    features: FeatureId[]
    content: ContentOptionId
    hosting: HostingOptionId
    rangeLow: number
    rangeHigh: number
    projectTotal: number
    hostingYearly: number
    complexity: ComplexityLevel
    buildWindow: BuildWindowId
    needsIntake: boolean
  }
}
