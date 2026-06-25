<script setup lang="ts">
const common = useSectionTranslations('common')
const text = computed(() => common.t('marquee.items'))

const row1 = ref<HTMLElement>()
const row2 = ref<HTMLElement>()

const BASE_SPEED_1 = 28
const BASE_SPEED_2 = 22
const MIN_SPEED_FACTOR = 0.22

let pos1 = 0
let pos2 = 0
let loopWidth1 = 0
let loopWidth2 = 0
let scrollInfluence = 0
let speedFactor = 1
let tickerFn: ((time: number) => void) | null = null
let lenisScrollHandler: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null

function measure() {
  if (row1.value) loopWidth1 = row1.value.scrollWidth / 2
  if (row2.value) loopWidth2 = row2.value.scrollWidth / 2
  if (loopWidth2 && pos2 === 0) pos2 = -loopWidth2
}

function applyTransforms() {
  if (row1.value) {
    row1.value.style.transform = `translate3d(${pos1}px, 0, 0)`
  }
  if (row2.value) {
    row2.value.style.transform = `translate3d(${pos2}px, 0, 0)`
  }
}

onMounted(async () => {
  if (!import.meta.client) return

  await nextTick()
  measure()

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(measure)
    if (row1.value) resizeObserver.observe(row1.value)
    if (row2.value) resizeObserver.observe(row2.value)
  } else {
    window.addEventListener('resize', measure)
  }

  const { init: initLenis } = useLenis()
  const lenis = await initLenis()

  if (lenis) {
    lenisScrollHandler = () => {
      scrollInfluence = Math.abs(lenis.velocity ?? 0)
    }
    lenis.on('scroll', lenisScrollHandler)
  }

  const { init: initGsap } = useGsap()
  const gsap = await initGsap()
  if (!gsap) return

  let lastTime = performance.now()

  tickerFn = () => {
    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now

    scrollInfluence *= 0.9

    const targetFactor = 1 / (1 + scrollInfluence * 0.018)
    speedFactor += (Math.max(MIN_SPEED_FACTOR, targetFactor) - speedFactor) * 0.06

    if (loopWidth1 > 0) {
      pos1 -= BASE_SPEED_1 * speedFactor * dt
      if (pos1 <= -loopWidth1) pos1 += loopWidth1
    }

    if (loopWidth2 > 0) {
      pos2 += BASE_SPEED_2 * speedFactor * dt
      if (pos2 >= 0) pos2 -= loopWidth2
    }

    applyTransforms()
  }

  gsap.ticker.add(tickerFn)
})

onUnmounted(() => {
  if (tickerFn) {
    import('gsap').then(({ gsap }) => gsap.ticker.remove(tickerFn!))
  }

  const { lenis } = useLenis()
  if (lenis && lenisScrollHandler) {
    lenis.off('scroll', lenisScrollHandler)
  }

  resizeObserver?.disconnect()
  window.removeEventListener('resize', measure)
})
</script>

<template>
  <section class="marquee">
    <div class="marquee__border" />
    <div class="marquee__track">
      <div ref="row1" class="marquee__row">
        <span v-for="n in 4" :key="`a-${n}`" class="marquee__item font-mono">{{ text }}</span>
      </div>
    </div>
    <div class="marquee__track">
      <div ref="row2" class="marquee__row marquee__row--reverse">
        <span v-for="n in 4" :key="`b-${n}`" class="marquee__item font-mono">{{ text }}</span>
      </div>
    </div>
    <div class="marquee__border" />
  </section>
</template>

<style lang="scss" scoped>
.marquee {
  padding-block: $space-xl;
  overflow: hidden;

  &__border {
    height: 1px;
    background: $color-border;
  }

  &__track {
    overflow: hidden;
    padding-block: $space-md;
  }

  &__row {
    display: flex;
    width: max-content;
    white-space: nowrap;
    will-change: transform;
    backface-visibility: hidden;
  }

  &__item {
    flex-shrink: 0;
    padding-inline: $space-xl;
    color: $color-text-muted;
    font-size: $text-sm;
  }
}
</style>
