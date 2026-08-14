import type {
  ContentOptionId,
  DesignLevelId,
  FeatureId,
  HostingOptionId,
  ProjectTypeId,
} from '~/types/project-estimate'

/**
 * Central pricing matrix for the Project Estimator.
 * Change amounts here only; UI and calculations read from this config.
 */
export const PROJECT_PRICING = {
  currency: 'EUR',
  maxPages: 20,
  pagePrice: 85,
  hostingYearly: 50,

  types: {
    'one-page': {
      base: 250,
      includedPages: 1,
      usesPages: false,
      complexityBase: 1,
    },
    business: {
      base: 450,
      includedPages: 3,
      usesPages: true,
      complexityBase: 2,
    },
    portfolio: {
      base: 350,
      includedPages: 3,
      usesPages: true,
      complexityBase: 2,
    },
    webshop: {
      base: 750,
      includedPages: 5,
      usesPages: true,
      complexityBase: 4,
    },
    webapp: {
      base: 900,
      includedPages: 0,
      usesPages: false,
      complexityBase: 5,
    },
  } satisfies Record<
    ProjectTypeId,
    { base: number; includedPages: number; usesPages: boolean; complexityBase: number }
  >,

  design: {
    clean: { price: 0, complexity: 0 },
    custom: { price: 175, complexity: 1 },
    showcase: { price: 350, complexity: 2 },
  } satisfies Record<DesignLevelId, { price: number; complexity: number }>,

  features: {
    'contact-form': { price: 50, complexity: 0, custom: false },
    cms: { price: 150, complexity: 1, custom: false },
    blog: { price: 100, complexity: 1, custom: false },
    multilingual: { price: 125, complexity: 1, custom: false },
    maps: { price: 35, complexity: 0, custom: false },
    newsletter: { price: 50, complexity: 0, custom: false },
    social: { price: 35, complexity: 0, custom: false },
    analytics: { price: 50, complexity: 0, custom: false },
    'advanced-animations': { price: 125, complexity: 1, custom: false },
    api: { price: 175, complexity: 2, custom: true },
    accounts: { price: 250, complexity: 2, custom: true },
    dashboard: { price: 300, complexity: 3, custom: true },
    ai: { price: 200, complexity: 2, custom: true },
    payments: { price: 250, complexity: 2, custom: true },
    booking: { price: 250, complexity: 2, custom: true },
  } satisfies Record<FeatureId, { price: number; complexity: number; custom: boolean }>,

  content: {
    self: { price: 0, complexity: 0 },
    polish: { price: 75, complexity: 0 },
    full: { price: 175, complexity: 1 },
  } satisfies Record<ContentOptionId, { price: number; complexity: number }>,

  hosting: {
    self: 0,
    cpwd: 50,
  } satisfies Record<HostingOptionId, number>,

  /** Features that push the estimate into intake territory when several are selected. */
  customFeatureIds: [
    'api',
    'accounts',
    'dashboard',
    'ai',
    'payments',
    'booking',
  ] as FeatureId[],

  range: {
    /** Soft band around the deterministic total (kept tight and useful). */
    lowFactor: 0.96,
    highFactor: 1.1,
    roundTo: 25,
  },
} as const

export type ProjectPricingConfig = typeof PROJECT_PRICING
