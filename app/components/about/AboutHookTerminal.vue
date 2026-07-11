<script setup lang="ts">
import { localeList, resolveLocaleMessage } from '~/utils/i18n'

const about = useSectionTranslations('about')
const terminalRef = ref<HTMLElement | null>(null)

const inView = ref(false)
const t = ref(0)
const reducedMotion = ref(false)

const BAR_COUNT = 10
const SPEC_COUNT = 36

interface ScanItem {
  code: string
  label: string
  status: 'pass' | 'fail'
}

const scanItems = computed(() => {
  const raw = about.tm('hook.terminal.scanItems')
  return localeList<ScanItem>(raw).map(item => ({
    code: resolveLocaleMessage(item.code, about.rt),
    label: resolveLocaleMessage(item.label, about.rt),
    status: resolveLocaleMessage(item.status, about.rt) as 'pass' | 'fail',
  }))
})

const barHeights = ref(Array.from({ length: BAR_COUNT }, () => 0.3))
const specHeights = ref(Array.from({ length: SPEC_COUNT }, () => 0.15))
const loadProgress = ref<number[]>([])

const timerDisplay = computed(() => {
  if (!inView.value) return '3.0'
  const pulse = (Math.sin(t.value * 1.4) + 1) * 0.5
  return (1.6 + pulse * 1.35).toFixed(1)
})

const activeLoadIndex = computed(() => {
  if (!loadProgress.value.length) return 0
  let best = 0
  let bestVal = -1
  loadProgress.value.forEach((p, i) => {
    if (p > bestVal && p < 0.98) {
      bestVal = p
      best = i
    }
  })
  return best
})

let raf = 0
let observer: IntersectionObserver | null = null

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function tick(time: number) {
  raf = requestAnimationFrame(tick)
  if (!inView.value) return

  t.value = time * 0.001
  const now = t.value

  if (reducedMotion.value) {
    barHeights.value = barHeights.value.map((_, i) => 0.35 + (i % 3) * 0.12)
    specHeights.value = specHeights.value.map((_, i) => 0.2 + (i % 5) * 0.06)
    loadProgress.value = scanItems.value.map((item, i) => (
      item.status === 'pass' ? 0.92 : 0.38 + i * 0.08
    ))
    return
  }

  barHeights.value = barHeights.value.map((_, i) => {
    const wave = Math.sin(now * 1.6 + i * 0.72) * 0.5 + 0.5
    const accent = Math.sin(now * 2.8 + i * 0.28) * 0.15
    return clamp(0.14 + wave * 0.62 + accent, 0.1, 0.96)
  })

  specHeights.value = specHeights.value.map((_, i) => {
    const dist = Math.abs(i - SPEC_COUNT / 2) / (SPEC_COUNT / 2)
    const wave = Math.sin(now * 4.2 + i * 0.55) * 0.5 + 0.5
    const envelope = 1 - dist * 0.55
    return clamp((0.06 + wave * envelope * 0.88) * (0.85 + Math.sin(now * 0.9 + i) * 0.15), 0.05, 1)
  })

  const count = scanItems.value.length || 1
  const cycle = (now * 0.28) % (count * 1.15)
  loadProgress.value = scanItems.value.map((item, i) => {
    const start = i * 1.15
    const local = cycle - start
    if (local < 0) {
      return item.status === 'pass' ? 0.88 : 0.22
    }
    if (local < 0.85) {
      const target = item.status === 'pass' ? 0.94 : 0.52
      return clamp(local / 0.85 * target, 0.08, target)
    }
    return item.status === 'pass' ? 0.94 : 0.52
  })
}

function startLoop() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(tick)
}

function stopLoop() {
  cancelAnimationFrame(raf)
  raf = 0
}

function setupObserver() {
  const el = terminalRef.value
  if (!el) return

  observer?.disconnect()
  observer = new IntersectionObserver(
    ([entry]) => {
      inView.value = entry?.isIntersecting ?? false
      if (inView.value) startLoop()
      else stopLoop()
    },
    { threshold: 0.2 },
  )
  observer.observe(el)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  loadProgress.value = scanItems.value.map(() => 0)
  setupObserver()
})

onUnmounted(() => {
  stopLoop()
  observer?.disconnect()
})
</script>

<template>
  <div ref="terminalRef" class="hook-panel" aria-hidden="true">
    <div class="hook-panel__bg">
      <div class="hook-panel__grid" />
    </div>

    <div class="hook-panel__frame">
      <span class="hook-panel__corner hook-panel__corner--tl" />
      <span class="hook-panel__corner hook-panel__corner--tr" />
      <span class="hook-panel__corner hook-panel__corner--bl" />
      <span class="hook-panel__corner hook-panel__corner--br" />
    </div>

    <div class="hook-panel__content">
      <header class="hook-panel__head font-mono">
        <span class="hook-panel__tag">{{ about.t('hook.terminal.scanTag') }}</span>
        <span class="hook-panel__live">
          <span class="hook-panel__live-dot" />
          live
        </span>
      </header>

      <div class="hook-panel__timer font-mono">
        <span class="hook-panel__timer-label">{{ about.t('hook.terminal.timerLabel') }}</span>
        <span class="hook-panel__timer-value">{{ timerDisplay }}s</span>
      </div>

      <div class="hook-panel__block">
        <p class="hook-panel__block-label font-mono">Engagement</p>
        <div class="hook-panel__bars" aria-hidden="true">
          <span
            v-for="(h, i) in barHeights"
            :key="`bar-${i}`"
            class="hook-panel__bar"
            :style="{ height: `${h * 100}%` }"
          />
        </div>
      </div>

      <div class="hook-panel__block hook-panel__block--spec">
        <p class="hook-panel__block-label font-mono">Signaal</p>
        <div class="hook-panel__spec" aria-hidden="true">
          <span
            v-for="(h, i) in specHeights"
            :key="`spec-${i}`"
            class="hook-panel__spec-bar"
            :style="{ height: `${h * 100}%` }"
          />
        </div>
      </div>

      <div class="hook-panel__scan">
        <p class="hook-panel__scan-title font-mono">{{ about.t('hook.terminal.scanTitle') }}</p>
        <ul class="hook-panel__loads">
          <li
            v-for="(item, i) in scanItems"
            :key="item.code"
            class="hook-panel__load font-mono"
            :class="{ 'hook-panel__load--active': activeLoadIndex === i }"
          >
            <span class="hook-panel__load-label">{{ item.label }}</span>
            <span class="hook-panel__load-track">
              <span
                class="hook-panel__load-fill"
                :class="{
                  'hook-panel__load-fill--pass': item.status === 'pass',
                  'hook-panel__load-fill--fail': item.status === 'fail',
                }"
                :style="{ transform: `scaleX(${loadProgress[i] ?? 0})` }"
              />
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hook-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: inherit;
  overflow: hidden;
  border-radius: inherit;
  background: linear-gradient(165deg, rgba(10, 16, 12, 0.98) 0%, rgba(5, 8, 7, 1) 100%);

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__grid {
    position: absolute;
    inset: 0;
    opacity: 0.18;
    background-image:
      linear-gradient(rgba(56, 150, 90, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 150, 90, 0.06) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: radial-gradient(ellipse 90% 80% at 50% 40%, #000 20%, transparent 78%);
  }

  &__frame {
    position: absolute;
    inset: clamp(14px, 2.5vw, 22px);
    pointer-events: none;
    z-index: 2;
  }

  &__corner {
    position: absolute;
    width: 18px;
    height: 18px;
    border-color: rgba($color-gold, 0.3);
    border-style: solid;
    border-width: 0;

    &--tl { top: 0; left: 0; border-top-width: 1px; border-left-width: 1px; }
    &--tr { top: 0; right: 0; border-top-width: 1px; border-right-width: 1px; }
    &--bl { bottom: 0; left: 0; border-bottom-width: 1px; border-left-width: 1px; }
    &--br { bottom: 0; right: 0; border-bottom-width: 1px; border-right-width: 1px; }
  }

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: clamp(16px, 2.5vh, 22px);
    height: 100%;
    padding: clamp(22px, 3.5vw, 32px);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba($color-gold, 0.5);
  }

  &__tag {
    color: rgba($color-gold-light, 0.65);
  }

  &__live {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: rgba($color-text-faint, 0.8);
  }

  &__live-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(56, 150, 90, 0.85);
    box-shadow: 0 0 6px rgba(56, 150, 90, 0.5);
    animation: hook-live 2s ease-in-out infinite;
  }

  &__timer {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__timer-label {
    font-size: 8px;
    letter-spacing: 0.16em;
    color: rgba($color-text-muted, 0.75);
  }

  &__timer-value {
    font-size: clamp(2rem, 4.5vw, 2.75rem);
    line-height: 1;
    color: rgba($color-text, 0.9);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  &__block {
    padding: $space-3;
    border: 1px solid rgba($color-gold, 0.1);
    border-radius: $radius-sm;
    background: rgba(5, 8, 7, 0.5);
  }

  &__block-label {
    margin: 0 0 $space-2;
    font-size: 8px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba($color-gold, 0.42);
  }

  &__bars {
    display: flex;
    align-items: flex-end;
    gap: clamp(4px, 0.8vw, 7px);
    height: clamp(64px, 10vh, 88px);
  }

  &__bar {
    flex: 1;
    min-height: 6px;
    border-radius: 2px 2px 0 0;
    background: linear-gradient(
      to top,
      rgba($color-gold-dark, 0.35),
      rgba($color-gold-light, 0.75)
    );
    transform-origin: bottom center;
    will-change: height;
    transition: height 0.12s ease-out;
  }

  &__spec {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: clamp(48px, 7vh, 64px);
  }

  &__spec-bar {
    flex: 1;
    min-height: 3px;
    border-radius: 1px 1px 0 0;
    background: linear-gradient(
      to top,
      rgba(56, 150, 90, 0.25),
      rgba(56, 150, 90, 0.72)
    );
    opacity: 0.85;
    will-change: height;
    transition: height 0.08s linear;
  }

  &__scan {
    margin-top: auto;
    padding-top: $space-2;
  }

  &__scan-title {
    margin: 0 0 $space-3;
    font-size: 8px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba($color-gold, 0.42);
  }

  &__loads {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__load {
    display: grid;
    grid-template-columns: 1fr minmax(0, 42%);
    align-items: center;
    gap: $space-3;
    opacity: 0.55;
    transition: opacity 0.35s ease;

    &--active {
      opacity: 1;
    }
  }

  &__load-label {
    font-size: 9px;
    letter-spacing: 0.04em;
    color: rgba($color-text-muted, 0.9);
    line-height: 1.3;
  }

  &__load-track {
    display: block;
    height: 4px;
    border-radius: 2px;
    background: rgba($color-gold, 0.1);
    overflow: hidden;
  }

  &__load-fill {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    transform-origin: left center;
    transform: scaleX(0);
    will-change: transform;

    &--pass {
      background: linear-gradient(90deg, rgba($color-gold-dark, 0.6), rgba($color-gold-light, 0.9));
    }

    &--fail {
      background: linear-gradient(90deg, rgba($color-error, 0.45), rgba($color-error, 0.75));
    }
  }
}

@keyframes hook-live {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .hook-panel__live-dot {
    animation: none;
  }

  .hook-panel__bar,
  .hook-panel__spec-bar {
    transition: none;
  }
}
</style>
