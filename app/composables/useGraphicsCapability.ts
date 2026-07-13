import { detectWebGL } from '~/utils/webgl'

export type GraphicsTier = 'full' | 'reduced' | 'static'

const state = reactive({
  initialized: false,
  tier: 'static' as GraphicsTier,
  webgl: false,
  prefersReducedMotion: false,
  isCoarsePointer: false,
  isTouch: false,
  lowPower: false,
})

function isLowPowerDesktop(): boolean {
  // Phones/tablets often under-report cores and RAM — never mark them low-power here.
  if (navigator.maxTouchPoints > 0) return false
  if (window.matchMedia('(pointer: coarse)').matches) return false

  const cores = navigator.hardwareConcurrency ?? 8
  if (cores <= 2) return true

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (memory !== undefined && memory <= 2) return true

  return false
}

function computeTier(): GraphicsTier {
  if (state.prefersReducedMotion || !state.webgl) return 'static'
  if (state.lowPower) return 'reduced'
  return 'full'
}

function applyDocumentTier() {
  const root = document.documentElement
  root.classList.toggle('graphics-tier-static', state.tier === 'static')
  root.classList.toggle('graphics-tier-reduced', state.tier === 'reduced')
  root.classList.toggle('graphics-tier-full', state.tier === 'full')
}

function readCapability() {
  if (!import.meta.client) return

  state.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  state.isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  state.isTouch = navigator.maxTouchPoints > 0
  state.lowPower = isLowPowerDesktop()
  state.webgl = detectWebGL()
  state.tier = computeTier()
  state.initialized = true
  applyDocumentTier()
}

let listenersBound = false

function bindListeners() {
  if (!import.meta.client || listenersBound) return
  listenersBound = true

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pointerQuery = window.matchMedia('(pointer: coarse)')

  const refresh = () => readCapability()

  motionQuery.addEventListener('change', refresh)
  pointerQuery.addEventListener('change', refresh)
}

export function initGraphicsCapability() {
  if (!import.meta.client || state.initialized) return
  readCapability()
  bindListeners()
}

export function useGraphicsCapability() {
  if (import.meta.client) initGraphicsCapability()

  // WebGL + canvas effects: on whenever the GPU supports it (incl. high-end phones).
  const canUseWebGL = computed(() => state.webgl && !state.prefersReducedMotion)
  const enableHeavyFx = computed(() => state.webgl && !state.prefersReducedMotion)

  // GSAP / scroll-linked motion: off only for OS-level reduced-motion preference.
  const animateMotion = computed(() => !state.prefersReducedMotion)

  // Lenis smooth scroll: desktop pointer only — native touch scroll stays smoother on iOS.
  const smoothScroll = computed(() => (
    !state.prefersReducedMotion
    && !state.isCoarsePointer
    && !state.isTouch
  ))

  return {
    tier: computed(() => state.tier),
    initialized: computed(() => state.initialized),
    webgl: computed(() => state.webgl),
    prefersReducedMotion: computed(() => state.prefersReducedMotion),
    isCoarsePointer: computed(() => state.isCoarsePointer),
    isTouch: computed(() => state.isTouch),
    lowPower: computed(() => state.lowPower),
    canUseWebGL,
    smoothScroll,
    animateMotion,
    enableHeavyFx,
  }
}
