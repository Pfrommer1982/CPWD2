import { PROJECT_PRICING } from '~/data/projectPricing'
import type {
  BuildWindowId,
  ComplexityLevel,
  FeatureId,
  PriceRange,
  ProjectEstimateConfig,
  ProjectEstimateResult,
  ProjectTypeId,
} from '~/types/project-estimate'

const DEFAULT_CONFIG: ProjectEstimateConfig = {
  type: null,
  pages: 3,
  design: 'clean',
  features: [],
  content: 'self',
  hosting: 'self',
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step
}

function clampPages(type: ProjectTypeId | null, pages: number) {
  if (!type) return pages
  const meta = PROJECT_PRICING.types[type]
  if (!meta.usesPages) return meta.includedPages || 1
  const min = Math.max(1, meta.includedPages)
  return Math.min(PROJECT_PRICING.maxPages, Math.max(min, pages))
}

function buildPriceRange(base: number): PriceRange {
  const { lowFactor, highFactor, roundTo } = PROJECT_PRICING.range
  const low = Math.max(roundTo, roundToStep(base * lowFactor, roundTo))
  const high = Math.max(low + roundTo, roundToStep(base * highFactor, roundTo))
  return { base, low, high }
}

function complexityLevel(score: number, needsIntake: boolean): ComplexityLevel {
  if (needsIntake || score >= 12) return 'custom'
  if (score >= 8) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

function buildWindow(type: ProjectTypeId | null, level: ComplexityLevel, needsIntake: boolean): BuildWindowId {
  if (!type || needsIntake || type === 'webapp' || level === 'custom') return 'after-intake'
  if (type === 'webshop') return 'about-2-4-weeks'
  if (type === 'one-page' && level === 'low') return 'about-1-week'
  if (level === 'high') return 'about-2-3-weeks'
  if (type === 'business' || type === 'portfolio') return 'about-1-2-weeks'
  return 'about-1-2-weeks'
}

function createProjectCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 5; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `CPWD-${out}`
}

function encodeConfig(config: ProjectEstimateConfig): string {
  const payload = [
    config.type || '',
    String(config.pages),
    config.design,
    config.features.join('.'),
    config.content,
    config.hosting,
  ].join('|')
  if (import.meta.client) {
    return btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  }
  return Buffer.from(payload, 'utf8').toString('base64url')
}

function decodeConfig(raw: string): ProjectEstimateConfig | null {
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const decoded = import.meta.client
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString('utf8')
    const [type, pages, design, features, content, hosting] = decoded.split('|')
    const parsedType = (type || null) as ProjectEstimateConfig['type']
    const knownTypes = Object.keys(PROJECT_PRICING.types)
    if (parsedType && !knownTypes.includes(parsedType)) return null

    return {
      type: parsedType,
      pages: Number(pages) || DEFAULT_CONFIG.pages,
      design: (design as ProjectEstimateConfig['design']) || 'clean',
      features: features
        ? features.split('.').filter(Boolean) as FeatureId[]
        : [],
      content: (content as ProjectEstimateConfig['content']) || 'self',
      hosting: (hosting as ProjectEstimateConfig['hosting']) || 'self',
    }
  }
  catch {
    return null
  }
}

export function computeProjectEstimate(
  config: ProjectEstimateConfig,
  projectCode: string,
): ProjectEstimateResult | null {
  if (!config.type) return null

  const typeMeta = PROJECT_PRICING.types[config.type]
  const pages = clampPages(config.type, config.pages)
  const includedPages = typeMeta.usesPages ? typeMeta.includedPages : typeMeta.includedPages || 1
  const extraPages = typeMeta.usesPages ? Math.max(0, pages - includedPages) : 0

  let projectTotal = typeMeta.base
  projectTotal += extraPages * PROJECT_PRICING.pagePrice
  projectTotal += PROJECT_PRICING.design[config.design].price
  projectTotal += PROJECT_PRICING.content[config.content].price

  let complexityScore = typeMeta.complexityBase
  complexityScore += PROJECT_PRICING.design[config.design].complexity
  complexityScore += PROJECT_PRICING.content[config.content].complexity
  complexityScore += Math.floor(extraPages / 3)

  let customCount = 0
  for (const featureId of config.features) {
    const feature = PROJECT_PRICING.features[featureId]
    if (!feature) continue
    projectTotal += feature.price
    complexityScore += feature.complexity
    if (feature.custom) customCount += 1
  }

  if (config.type === 'webapp') customCount += 1

  const needsIntake = config.type === 'webapp'
    || customCount >= 2
    || (customCount >= 1 && (config.type === 'webshop' || complexityScore >= 9))
  const complexity = complexityLevel(complexityScore, needsIntake)
  const hostingYearly = config.hosting === 'cpwd' ? PROJECT_PRICING.hosting.cpwd : 0

  return {
    projectTotal,
    range: buildPriceRange(projectTotal),
    hostingYearly,
    complexity,
    complexityScore,
    buildWindow: buildWindow(config.type, complexity, needsIntake),
    needsIntake,
    includedPages,
    extraPages,
    projectCode,
  }
}

export function useProjectEstimate() {
  const route = useRoute()
  const router = useRouter()
  const reducedMotion = usePreferredReducedMotion()

  const config = reactive<ProjectEstimateConfig>({ ...DEFAULT_CONFIG })
  const projectCode = ref(createProjectCode())
  const stepIndex = ref(0)
  const showResult = ref(false)
  const calculating = ref(false)
  const calculatingLine = ref(0)
  const statusLine = ref('')
  const requestOpen = ref(false)
  let calcTimer: ReturnType<typeof setTimeout> | null = null
  let syncingQuery = false

  const typeMeta = computed(() => (config.type ? PROJECT_PRICING.types[config.type] : null))
  const usesPages = computed(() => Boolean(typeMeta.value?.usesPages))

  const visibleSteps = computed(() => {
    const steps: Array<'type' | 'pages' | 'design' | 'features' | 'content' | 'hosting'> = ['type']
    if (usesPages.value) steps.push('pages')
    steps.push('design', 'features', 'content', 'hosting')
    return steps
  })

  const currentStep = computed(() => visibleSteps.value[Math.min(stepIndex.value, visibleSteps.value.length - 1)]!)

  const estimate = computed(() => computeProjectEstimate({
    ...config,
    pages: clampPages(config.type, config.pages),
  }, projectCode.value))

  const canCalculate = computed(() => Boolean(config.type))

  function pulseStatus(key: string) {
    statusLine.value = key
  }

  function setType(type: ProjectTypeId) {
    config.type = type
    config.pages = clampPages(type, config.pages || PROJECT_PRICING.types[type].includedPages || 3)
    if (type === 'webshop' && !config.features.includes('payments')) {
      // soft suggestion only in UI; do not auto-add
    }
    pulseStatus('type')
    showResult.value = false
  }

  function setPages(pages: number) {
    config.pages = clampPages(config.type, pages)
    pulseStatus('pages')
    showResult.value = false
  }

  function setDesign(design: ProjectEstimateConfig['design']) {
    config.design = design
    pulseStatus('design')
    showResult.value = false
  }

  function toggleFeature(id: FeatureId) {
    const idx = config.features.indexOf(id)
    if (idx >= 0) config.features.splice(idx, 1)
    else config.features.push(id)
    pulseStatus('features')
    showResult.value = false
  }

  function setContent(content: ProjectEstimateConfig['content']) {
    config.content = content
    pulseStatus('content')
    showResult.value = false
  }

  function setHosting(hosting: ProjectEstimateConfig['hosting']) {
    config.hosting = hosting
    pulseStatus('hosting')
    showResult.value = false
  }

  function nextStep() {
    if (stepIndex.value < visibleSteps.value.length - 1) stepIndex.value += 1
  }

  function prevStep() {
    if (stepIndex.value > 0) stepIndex.value -= 1
  }

  function goToStep(index: number) {
    stepIndex.value = Math.max(0, Math.min(visibleSteps.value.length - 1, index))
  }

  async function runCalculation() {
    if (!canCalculate.value) return
    calculating.value = true
    calculatingLine.value = 0
    showResult.value = false

    const lines = 5
    const delay = reducedMotion.value === 'reduce' ? 0 : 220

    for (let i = 0; i < lines; i++) {
      calculatingLine.value = i
      if (delay) await new Promise(r => setTimeout(r, delay))
    }

    calculating.value = false
    showResult.value = true
    pulseStatus('ready')
    requestOpen.value = false
  }

  function reset() {
    Object.assign(config, { ...DEFAULT_CONFIG, features: [] as FeatureId[] })
    config.features = []
    projectCode.value = createProjectCode()
    stepIndex.value = 0
    showResult.value = false
    calculating.value = false
    requestOpen.value = false
    statusLine.value = 'reset'
  }

  function openRequest() {
    if (!estimate.value) return
    requestOpen.value = true
  }

  function syncFromQuery() {
    const raw = route.query.e
    if (typeof raw !== 'string' || !raw) return
    const parsed = decodeConfig(raw)
    if (!parsed) return
    Object.assign(config, parsed)
    config.features = [...parsed.features]
    config.pages = clampPages(parsed.type, parsed.pages)
    if (parsed.type) {
      showResult.value = true
      stepIndex.value = Math.max(0, visibleSteps.value.length - 1)
    }
  }

  function writeQuery() {
    if (!import.meta.client || syncingQuery) return
    const nextQuery = { ...route.query } as Record<string, string | string[] | undefined>
    if (!config.type) {
      delete nextQuery.e
    }
    else {
      nextQuery.e = encodeConfig({
        ...config,
        pages: clampPages(config.type, config.pages),
      })
    }
    syncingQuery = true
    router.replace({ query: nextQuery }).finally(() => {
      syncingQuery = false
    })
  }

  onMounted(() => {
    syncFromQuery()
  })

  watch(
    () => ({
      type: config.type,
      pages: config.pages,
      design: config.design,
      features: [...config.features],
      content: config.content,
      hosting: config.hosting,
    }),
    () => {
      if (config.type && usesPages.value) {
        config.pages = clampPages(config.type, config.pages)
      }
      writeQuery()
    },
    { deep: true },
  )

  watch(visibleSteps, (steps) => {
    if (stepIndex.value > steps.length - 1) stepIndex.value = steps.length - 1
  })

  onBeforeUnmount(() => {
    if (calcTimer) clearTimeout(calcTimer)
  })

  return {
    config,
    projectCode,
    stepIndex,
    currentStep,
    visibleSteps,
    usesPages,
    typeMeta,
    estimate,
    canCalculate,
    showResult,
    calculating,
    calculatingLine,
    statusLine,
    requestOpen,
    pricing: PROJECT_PRICING,
    setType,
    setPages,
    setDesign,
    toggleFeature,
    setContent,
    setHosting,
    nextStep,
    prevStep,
    goToStep,
    runCalculation,
    reset,
    openRequest,
  }
}
