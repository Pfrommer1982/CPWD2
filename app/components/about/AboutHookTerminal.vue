<script setup lang="ts">
import { localeList, resolveLocaleMessage } from '~/utils/i18n'

const props = defineProps<{
  root: HTMLElement | null
}>()

const about = useSectionTranslations('about')
const progress = ref(0)
const rootRef = toRef(props, 'root')
const terminalRef = ref<HTMLElement | null>(null)

useAboutHookScroll(progress, rootRef)

const inView = ref(false)
const idleT = ref(0)
const idleTimer = ref('2.8')
const idleDelta = ref(22)
const idleCheckIndex = ref(0)
const reducedMotion = ref(false)

let raf = 0
let observer: IntersectionObserver | null = null

interface ScanItem {
  code: string
  label: string
  status: 'pass' | 'fail'
}

interface DossierLine {
  key: string
  tease: string
  level: 'redacted' | 'partial'
}

const scanItems = computed(() => {
  const raw = about.tm('hook.terminal.scanItems')
  return localeList<ScanItem>(raw).map(item => ({
    code: resolveLocaleMessage(item.code, about.rt),
    label: resolveLocaleMessage(item.label, about.rt),
    status: resolveLocaleMessage(item.status, about.rt) as 'pass' | 'fail',
  }))
})

const dossierLines = computed(() => {
  const raw = about.tm('hook.terminal.dossierLines')
  return localeList<DossierLine>(raw).map(item => ({
    key: resolveLocaleMessage(item.key, about.rt),
    tease: resolveLocaleMessage(item.tease, about.rt),
    level: resolveLocaleMessage(item.level, about.rt) as 'redacted' | 'partial',
  }))
})

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

const scanPhase = computed(() => clamp01(progress.value / 0.42))
const isIdleScroll = computed(() => progress.value < 0.04)

const ambientPhase = computed(() => {
  if (!inView.value) return 0
  const wave = (Math.sin(idleT.value * 1.05) + 1) * 0.5
  return 0.18 + wave * 0.28
})

const motionScan = computed(() => (
  isIdleScroll.value ? Math.max(scanPhase.value, ambientPhase.value) : scanPhase.value
))

const dossierPhase = computed(() => clamp01((progress.value - 0.28) / 0.52))
const idleDossierPulse = computed(() => (
  inView.value && isIdleScroll.value
    ? 0.08 + (Math.sin(idleT.value * 0.75) + 1) * 0.06
    : 0
))

const timerDisplay = computed(() => {
  if (isIdleScroll.value && scanPhase.value < 0.05) return idleTimer.value
  return Math.max(0, 3 - scanPhase.value * 3).toFixed(1)
})

const scanOpacity = computed(() => {
  if (isIdleScroll.value) return 1
  return 1 - clamp01((progress.value - 0.38) / 0.35) * 0.88
})

const dossierOpacity = computed(() => (
  Math.max(dossierPhase.value, idleDossierPulse.value)
))

const clearancePhase = computed(() => (
  Math.max(clamp01((progress.value - 0.72) / 0.28), idleDossierPulse.value * 0.85)
))

const verdictVisible = computed(() => motionScan.value > 0.72)

function scanItemProgress(index: number) {
  if (isIdleScroll.value && scanPhase.value < 0.08) {
    if (index < idleCheckIndex.value) return 0.92
    if (index === idleCheckIndex.value) return 0.55 + Math.sin(idleT.value * 4) * 0.15
    if (index === idleCheckIndex.value + 1) return 0.28
    return 0.14
  }
  const threshold = 0.18 + index * 0.24
  return clamp01((motionScan.value - threshold) / 0.2)
}

function dossierLineProgress(index: number) {
  const threshold = 0.12 + index * 0.18
  return clamp01((dossierPhase.value - threshold) / 0.22)
}

function redactWidth(line: DossierLine, index: number) {
  const p = dossierLineProgress(index)
  if (line.level === 'redacted') return `${88 - p * 8}%`
  return `${Math.max(12, 100 - p * 88)}%`
}

interface TelemetryMetric {
  id: string
  label: string
  final: string
  spin: () => string
}

const telemetryMetrics: TelemetryMetric[] = [
  {
    id: 'bounce',
    label: 'BOUNCE',
    final: '68%',
    spin: () => `${Math.floor(12 + Math.random() * 78)}%`,
  },
  {
    id: 'lcp',
    label: 'LCP',
    final: '4.2s',
    spin: () => `${(0.8 + Math.random() * 5.5).toFixed(1)}s`,
  },
  {
    id: 'depth',
    label: 'DEPTH',
    final: '12%',
    spin: () => `${Math.floor(Math.random() * 89)}%`,
  },
  {
    id: 'cls',
    label: 'CLS',
    final: '0.31',
    spin: () => (Math.random() * 0.45).toFixed(2),
  },
]

const metricValues = ref<Record<string, string>>(
  Object.fromEntries(telemetryMetrics.map(m => [m.id, m.spin()])),
)

const metricsLocked = computed(() => !isIdleScroll.value && scanPhase.value > 0.62)
const chartPointCount = 28
const chartNoise = ref<number[]>(Array.from({ length: chartPointCount }, () => Math.random()))

const chartPoints = computed(() => {
  const decline = motionScan.value * 0.42
  const idleWobble = inView.value ? Math.sin(idleT.value * 2.2) * 0.04 : 0
  return chartNoise.value.map((n, i) => {
    const t = i / (chartPointCount - 1)
    const trend = 1 - t * 0.35 - decline
    return Math.max(0.08, Math.min(0.98, n * 0.55 + trend * 0.45 + idleWobble))
  })
})

const chartLinePath = computed(() => {
  const pts = chartPoints.value
  return pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * 100
    const y = 100 - v * 88
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
})

const chartAreaPath = computed(() => {
  const line = chartLinePath.value
  return `${line} L100,100 L0,100 Z`
})

const chartReveal = computed(() => {
  if (inView.value && isIdleScroll.value) return 0.94
  return clamp01(motionScan.value / 0.35)
})

const chartDeltaDisplay = computed(() => {
  if (isIdleScroll.value && scanPhase.value < 0.05) return idleDelta.value
  return Math.round(18 + motionScan.value * 42)
})

const crosshairOffset = computed(() => {
  if (!inView.value || reducedMotion.value) {
    return { x: 0, y: 0 }
  }
  return {
    x: Math.sin(idleT.value * 1.35) * 16,
    y: Math.cos(idleT.value * 1.05) * 11,
  }
})

const gridOffset = computed(() => {
  if (!inView.value || reducedMotion.value) return { x: 0, y: 0 }
  return {
    x: -((idleT.value * 6) % 24),
    y: -((idleT.value * 4) % 24),
  }
})

let spinTimer: ReturnType<typeof setInterval> | null = null
let chartTimer: ReturnType<typeof setInterval> | null = null

function syncMetrics() {
  if (metricsLocked.value) {
    telemetryMetrics.forEach((m) => {
      metricValues.value[m.id] = m.final
    })
    return
  }
  telemetryMetrics.forEach((m) => {
    metricValues.value[m.id] = m.spin()
  })
}

function tickChartNoise() {
  if (!inView.value) return
  if (metricsLocked.value) {
    chartNoise.value = chartNoise.value.map((prev) => {
      const next = prev + (Math.random() - 0.5) * 0.06
      return Math.max(0.05, Math.min(0.95, next))
    })
    return
  }
  chartNoise.value = chartNoise.value.map((prev) => {
    const next = prev + (Math.random() - 0.5) * 0.35
    return Math.max(0.05, Math.min(0.95, next))
  })
}

function tickIdleValues() {
  if (!inView.value || !isIdleScroll.value) return
  idleTimer.value = (1.8 + Math.random() * 1.15).toFixed(1)
  idleDelta.value = Math.round(16 + Math.random() * 28)
}

function tickIdleChecklist() {
  if (!inView.value || !isIdleScroll.value) return
  const count = scanItems.value.length || 1
  idleCheckIndex.value = (idleCheckIndex.value + 1) % count
}

function tickAmbient(time: number) {
  if (!inView.value || reducedMotion.value) return
  idleT.value = time * 0.001
  raf = requestAnimationFrame(tickAmbient)
}

function startDataLoop() {
  stopDataLoop()
  syncMetrics()
  spinTimer = setInterval(syncMetrics, 95)
  chartTimer = setInterval(tickChartNoise, 160)
  idleTimerInterval = setInterval(tickIdleValues, 420)
  idleCheckInterval = setInterval(tickIdleChecklist, 1400)
  if (!reducedMotion.value) {
    raf = requestAnimationFrame(tickAmbient)
  }
}

let idleTimerInterval: ReturnType<typeof setInterval> | null = null
let idleCheckInterval: ReturnType<typeof setInterval> | null = null

function stopDataLoop() {
  if (spinTimer) clearInterval(spinTimer)
  if (chartTimer) clearInterval(chartTimer)
  if (idleTimerInterval) clearInterval(idleTimerInterval)
  if (idleCheckInterval) clearInterval(idleCheckInterval)
  cancelAnimationFrame(raf)
  spinTimer = null
  chartTimer = null
  idleTimerInterval = null
  idleCheckInterval = null
  raf = 0
}

function setupObserver() {
  const el = terminalRef.value
  if (!el) return

  observer?.disconnect()
  observer = new IntersectionObserver(
    ([entry]) => {
      inView.value = entry?.isIntersecting ?? false
      if (inView.value) startDataLoop()
      else stopDataLoop()
    },
    { threshold: 0.15 },
  )
  observer.observe(el)
}

watch(metricsLocked, (locked) => {
  if (locked) syncMetrics()
})

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  setupObserver()
})

onUnmounted(() => {
  stopDataLoop()
  observer?.disconnect()
})
</script>

<template>
  <div ref="terminalRef" class="hook-terminal" aria-hidden="true">
    <div class="hook-terminal__bg">
      <div
        class="hook-terminal__grid"
        :style="{ transform: `translate(${gridOffset.x}px, ${gridOffset.y}px)` }"
      />
      <div class="hook-terminal__noise" />
    </div>

    <div class="hook-terminal__frame">
      <span class="hook-terminal__corner hook-terminal__corner--tl" />
      <span class="hook-terminal__corner hook-terminal__corner--tr" />
      <span class="hook-terminal__corner hook-terminal__corner--bl" />
      <span class="hook-terminal__corner hook-terminal__corner--br" />
    </div>

    <div
      class="hook-terminal__crosshair"
      :style="{ transform: `translate(calc(-50% + ${crosshairOffset.x}px), calc(-50% + ${crosshairOffset.y}px))` }"
    >
      <span class="hook-terminal__crosshair-h" />
      <span class="hook-terminal__crosshair-v" />
      <span class="hook-terminal__crosshair-dot" />
      <span class="hook-terminal__crosshair-ring" />
    </div>

    <!-- Phase 1: Target scan -->
    <div
      class="hook-terminal__scan"
      :style="{ opacity: scanOpacity, transform: `translateY(${scanOpacity < 0.5 ? (1 - scanOpacity) * 16 : 0}px)` }"
    >
      <header class="hook-terminal__head font-mono">
        <span class="hook-terminal__tag">{{ about.t('hook.terminal.scanTag') }}</span>
        <span class="hook-terminal__pulse" />
      </header>

      <div class="hook-terminal__timer font-mono">
        <span class="hook-terminal__timer-label">{{ about.t('hook.terminal.timerLabel') }}</span>
        <span class="hook-terminal__timer-value">{{ timerDisplay }}s</span>
      </div>

      <div
        class="hook-terminal__telemetry"
        :style="{ opacity: chartReveal }"
      >
        <div
          v-for="metric in telemetryMetrics"
          :key="metric.id"
          class="hook-terminal__metric font-mono"
          :class="{ 'hook-terminal__metric--locked': metricsLocked }"
        >
          <span class="hook-terminal__metric-label">{{ metric.label }}</span>
          <span class="hook-terminal__metric-value">{{ metricValues[metric.id] }}</span>
        </div>
      </div>

      <div
        class="hook-terminal__chart-wrap"
        :style="{ opacity: chartReveal, transform: `scaleY(${0.85 + chartReveal * 0.15})` }"
      >
        <div class="hook-terminal__chart-head font-mono">
          <span>ENGAGEMENT TRACE</span>
          <span class="hook-terminal__chart-delta">▼ {{ chartDeltaDisplay }}%</span>
        </div>
        <svg
          class="hook-terminal__chart"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hook-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="rgba(56, 150, 90, 0.28)" />
              <stop offset="100%" stop-color="rgba(56, 150, 90, 0)" />
            </linearGradient>
          </defs>
          <path
            class="hook-terminal__chart-area"
            :d="chartAreaPath"
            fill="url(#hook-chart-fill)"
          />
          <path
            class="hook-terminal__chart-line"
            :d="chartLinePath"
            :style="{ strokeDashoffset: `${(1 - chartReveal) * 120}` }"
          />
          <line
            v-for="i in 4"
            :key="`grid-${i}`"
            class="hook-terminal__chart-grid"
            :x1="0"
            :y1="i * 25"
            :x2="100"
            :y2="i * 25"
          />
        </svg>
        <div class="hook-terminal__chart-bars" aria-hidden="true">
          <span
            v-for="(v, i) in chartPoints.slice(0, 12)"
            :key="`bar-${i}`"
            class="hook-terminal__chart-bar"
            :style="{ height: `${v * 100}%`, opacity: 0.35 + v * 0.45 }"
          />
        </div>
        <span
          class="hook-terminal__chart-scanline hook-terminal__chart-scanline--idle"
          :style="{ top: `${(motionScan * 88 + (idleT * 22) % 100) % 100}%` }"
        />
      </div>

      <p class="hook-terminal__scan-title font-mono">{{ about.t('hook.terminal.scanTitle') }}</p>

      <ul class="hook-terminal__checklist">
        <li
          v-for="(item, i) in scanItems"
          :key="item.code"
          class="hook-terminal__check-item font-mono"
          :style="{ opacity: scanItemProgress(i), transform: `translateX(${(1 - scanItemProgress(i)) * -12}px)` }"
        >
          <span class="hook-terminal__check-code">{{ item.code }}</span>
          <span
            class="hook-terminal__check-status"
            :class="{
              'hook-terminal__check-status--pass': item.status === 'pass',
              'hook-terminal__check-status--fail': item.status === 'fail',
            }"
          >
            {{ item.status === 'pass' ? 'PASS' : 'FAIL' }}
          </span>
          <span class="hook-terminal__check-label">{{ item.label }}</span>
        </li>
      </ul>

      <div
        class="hook-terminal__verdict font-mono"
        :style="{ opacity: verdictVisible ? clamp01((motionScan - 0.72) / 0.2) : 0 }"
      >
        <span class="hook-terminal__verdict-code">VERDICT</span>
        <span class="hook-terminal__verdict-main">{{ about.t('hook.terminal.verdict') }}</span>
        <span class="hook-terminal__verdict-sub">{{ about.t('hook.terminal.verdictSub') }}</span>
      </div>
    </div>

    <!-- Phase 2: Partial clearance dossier -->
    <div
      class="hook-terminal__dossier"
      :style="{ opacity: dossierOpacity }"
    >
      <header class="hook-terminal__head font-mono">
        <span class="hook-terminal__tag">{{ about.t('hook.terminal.dossierTag') }}</span>
        <span class="hook-terminal__file-id">REF-HOOK-001</span>
      </header>

      <p class="hook-terminal__dossier-title font-mono">{{ about.t('hook.terminal.dossierTitle') }}</p>

      <ul class="hook-terminal__dossier-lines">
        <li
          v-for="(line, i) in dossierLines"
          :key="line.key"
          class="hook-terminal__dossier-line font-mono"
          :style="{ opacity: dossierLineProgress(i) }"
        >
          <span class="hook-terminal__line-key">{{ line.key }}</span>
          <div class="hook-terminal__line-value">
            <span
              v-if="line.tease"
              class="hook-terminal__line-tease"
            >{{ line.tease }}</span>
            <span
              class="hook-terminal__line-redact"
              :style="{ width: redactWidth(line, i) }"
            />
          </div>
        </li>
      </ul>

      <p
        class="hook-terminal__clearance font-mono"
        :style="{ opacity: clearancePhase }"
      >
        {{ about.t('hook.terminal.clearanceNote') }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hook-terminal {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: inherit;
  overflow: hidden;
  border-radius: inherit;
  background: linear-gradient(160deg, rgba(10, 16, 12, 0.98) 0%, rgba(5, 8, 7, 1) 100%);

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__grid {
    position: absolute;
    inset: 0;
    opacity: 0.42;
    background-image:
      linear-gradient(rgba(56, 150, 90, 0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 150, 90, 0.07) 1px, transparent 1px);
    background-size: 24px 24px;
    will-change: transform;
  }

  &__noise {
    position: absolute;
    inset: 0;
    opacity: 0.032;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  &__frame {
    position: absolute;
    inset: clamp(14px, 2.5vw, 22px);
    pointer-events: none;
    z-index: 4;
  }

  &__corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: rgba($color-gold, 0.35);
    border-style: solid;
    border-width: 0;

    &--tl { top: 0; left: 0; border-top-width: 1px; border-left-width: 1px; }
    &--tr { top: 0; right: 0; border-top-width: 1px; border-right-width: 1px; }
    &--bl { bottom: 0; left: 0; border-bottom-width: 1px; border-left-width: 1px; }
    &--br { bottom: 0; right: 0; border-bottom-width: 1px; border-right-width: 1px; }
  }

  &__crosshair {
    position: absolute;
    top: 38%;
    left: 50%;
    width: 64px;
    height: 64px;
    z-index: 1;
    pointer-events: none;
    opacity: 0.28;
    will-change: transform;
  }

  &__crosshair-h,
  &__crosshair-v {
    position: absolute;
    background: rgba($color-gold-light, 0.55);
  }

  &__crosshair-h {
    top: 50%;
    left: -10px;
    right: -10px;
    height: 1px;
    transform: translateY(-50%);
  }

  &__crosshair-v {
    left: 50%;
    top: -10px;
    bottom: -10px;
    width: 1px;
    transform: translateX(-50%);
  }

  &__crosshair-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba($color-gold-light, 0.85);
    transform: translate(-50%, -50%);
  }

  &__crosshair-ring {
    position: absolute;
    inset: 0;
    border: 1px solid rgba($color-gold, 0.25);
    border-radius: 50%;
    animation: hook-pulse 2.4s ease-in-out infinite;
  }

  &__scan,
  &__dossier {
    position: absolute;
    inset: clamp(18px, 3vw, 28px);
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: $space-4;
    will-change: opacity, transform;
  }

  &__dossier {
    justify-content: flex-end;
    padding-bottom: clamp(8px, 2vh, 16px);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba($color-gold, 0.55);
  }

  &__tag {
    color: rgba($color-gold-light, 0.7);
  }

  &__pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $color-error;
    box-shadow: 0 0 8px rgba($color-error, 0.6);
    animation: hook-blink 1.2s step-end infinite;
  }

  &__file-id {
    color: rgba($color-text-faint, 0.85);
  }

  &__timer {
    display: flex;
    align-items: baseline;
    gap: $space-3;
    margin-top: $space-2;
  }

  &__timer-label {
    font-size: 8px;
    letter-spacing: 0.16em;
    color: rgba($color-text-muted, 0.85);
  }

  &__timer-value {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    line-height: 1;
    color: rgba($color-text, 0.92);
    text-shadow: 0 0 20px rgba(56, 150, 90, 0.25);
    font-variant-numeric: tabular-nums;
  }

  &__telemetry {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $space-2;
    margin-top: $space-1;
  }

  &__metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: $space-2 $space-2;
    border: 1px solid rgba($color-gold, 0.12);
    border-radius: $radius-sm;
    background: rgba(8, 12, 10, 0.55);
    min-width: 0;

    &--locked .hook-terminal__metric-value {
      color: rgba($color-error, 0.92);
    }
  }

  &__metric-label {
    font-size: 7px;
    letter-spacing: 0.12em;
    color: rgba($color-gold, 0.45);
  }

  &__metric-value {
    font-size: 10px;
    letter-spacing: 0.04em;
    color: rgba($color-gold-light, 0.88);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__chart-wrap {
    position: relative;
    margin-top: $space-1;
    padding: $space-3;
    border: 1px solid rgba($color-gold, 0.14);
    border-radius: $radius-sm;
    background: rgba(5, 8, 7, 0.65);
    transform-origin: bottom center;
    overflow: hidden;
  }

  &__chart-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-2;
    font-size: 7px;
    letter-spacing: 0.14em;
    color: rgba($color-text-muted, 0.85);
  }

  &__chart-delta {
    color: rgba($color-error, 0.85);
  }

  &__chart {
    display: block;
    width: 100%;
    height: clamp(72px, 12vh, 96px);
  }

  &__chart-area {
    opacity: 0.85;
  }

  &__chart-line {
    fill: none;
    stroke: rgba($color-gold-light, 0.85);
    stroke-width: 1.4;
    vector-effect: non-scaling-stroke;
    stroke-dasharray: 120;
    filter: drop-shadow(0 0 4px rgba(56, 150, 90, 0.35));
  }

  &__chart-grid {
    stroke: rgba($color-gold, 0.08);
    stroke-width: 0.5;
    vector-effect: non-scaling-stroke;
  }

  &__chart-bars {
    position: absolute;
    left: $space-3;
    right: $space-3;
    bottom: $space-3;
    height: clamp(72px, 12vh, 96px);
    display: flex;
    align-items: flex-end;
    gap: 3px;
    pointer-events: none;
    opacity: 0.18;
  }

  &__chart-bar {
    flex: 1;
    min-height: 4px;
    background: linear-gradient(to top, rgba($color-gold-dark, 0.2), rgba($color-gold-light, 0.55));
    border-radius: 1px 1px 0 0;
    transform-origin: bottom center;
    transition: height 0.15s linear;
  }

  &__chart-scanline {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba($color-gold-light, 0.55), transparent);
    pointer-events: none;
    opacity: 0.6;

    &--idle {
      animation: hook-scan-sweep 2.8s linear infinite;
    }
  }

  &__scan-title,
  &__dossier-title {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba($color-gold, 0.45);
    margin: 0;
  }

  &__checklist {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: $space-3;
    margin: $space-2 0 0;
    padding: 0;
  }

  &__check-item {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    gap: $space-3;
    font-size: 9px;
    letter-spacing: 0.08em;
  }

  &__check-code {
    color: rgba($color-text-faint, 0.9);
    min-width: 42px;
  }

  &__check-status {
    padding: 2px 6px;
    border-radius: $radius-full;
    font-size: 8px;
    letter-spacing: 0.1em;

    &--pass {
      color: rgba($color-gold-light, 0.9);
      border: 1px solid rgba($color-gold, 0.35);
      background: rgba($color-gold, 0.08);
    }

    &--fail {
      color: rgba($color-error, 0.95);
      border: 1px solid rgba($color-error, 0.35);
      background: rgba($color-error, 0.08);
    }
  }

  &__check-label {
    color: rgba($color-text-muted, 0.9);
  }

  &__verdict {
    margin-top: auto;
    padding-top: $space-4;
    border-top: 1px solid rgba($color-gold, 0.12);
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__verdict-code {
    font-size: 8px;
    letter-spacing: 0.16em;
    color: rgba($color-error, 0.75);
  }

  &__verdict-main {
    font-size: 11px;
    letter-spacing: 0.12em;
    color: rgba($color-error, 0.95);
  }

  &__verdict-sub {
    font-size: 9px;
    color: rgba($color-text-muted, 0.85);
  }

  &__dossier-lines {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: $space-4;
    margin: $space-3 0 0;
    padding: 0;
  }

  &__dossier-line {
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: $space-3;
    align-items: center;
    font-size: 9px;
    letter-spacing: 0.08em;
  }

  &__line-key {
    color: rgba($color-gold, 0.5);
  }

  &__line-value {
    position: relative;
    min-height: 18px;
    display: flex;
    align-items: center;
  }

  &__line-tease {
    position: relative;
    z-index: 1;
    color: rgba($color-text-muted, 0.85);
    padding-right: $space-2;
  }

  &__line-redact {
    position: absolute;
    top: 2px;
    left: 0;
    height: calc(100% - 4px);
    background: repeating-linear-gradient(
      -12deg,
      rgba(12, 16, 14, 0.88) 0,
      rgba(12, 16, 14, 0.88) 4px,
      rgba(56, 150, 90, 0.16) 4px,
      rgba(56, 150, 90, 0.16) 8px
    );
    border: 1px solid rgba($color-gold, 0.15);
    transition: width 0.1s linear;
  }

  &__clearance {
    margin-top: auto;
    padding-top: $space-4;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba($color-gold-light, 0.65);
    text-align: center;
  }
}

@keyframes hook-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

@keyframes hook-pulse {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.06); opacity: 0.55; }
}

@keyframes hook-scan-sweep {
  0% { opacity: 0.15; }
  50% { opacity: 0.75; }
  100% { opacity: 0.15; }
}

@media (prefers-reduced-motion: reduce) {
  .hook-terminal__chart-scanline--idle {
    animation: none;
  }
}
</style>
