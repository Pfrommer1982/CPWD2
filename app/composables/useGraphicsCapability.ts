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

function isLowPowerDevice(): boolean {
  const cores = navigator.hardwareConcurrency ?? 4
  if (cores <= 2) return true

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (memory !== undefined && memory <= 4) return true

  return false
}

function computeTier(): GraphicsTier {
  if (state.prefersReducedMotion || !state.webgl) return 'static'
  if (state.isCoarsePointer || state.isTouch || state.lowPower) return 'reduced'
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
  state.lowPower = isLowPowerDevice()
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

  const canUseWebGL = computed(() => state.tier === 'full')
  const smoothScroll = computed(() => state.tier === 'full')
  const animateMotion = computed(() => state.tier !== 'static')
  const enableHeavyFx = computed(() => state.tier === 'full')

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
