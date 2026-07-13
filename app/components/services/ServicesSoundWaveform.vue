<script setup lang="ts">
const props = withDefaults(defineProps<{
  active?: boolean
  mobile?: boolean
}>(), {
  active: true,
  mobile: false,
})

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const BAR_COUNT = 48
const STATIC_BARS = Array.from({ length: 24 }, (_, i) => {
  const wave = Math.sin(i * 0.55) * 0.35 + Math.sin(i * 1.2) * 0.2
  return `${Math.round(28 + Math.abs(wave) * 52)}%`
})

let raf = 0
let running = false
let phase = 0

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = canvas.getBoundingClientRect()
  if (rect.width < 1) return

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, rect.width, rect.height)

  const w = rect.width
  const h = rect.height
  const gap = 3
  const barW = (w - gap * (BAR_COUNT - 1)) / BAR_COUNT
  const mid = h * 0.52

  phase += 0.07

  for (let i = 0; i < BAR_COUNT; i++) {
    const t = i / BAR_COUNT
    const wave = Math.sin(phase + t * Math.PI * 4) * 0.35
      + Math.sin(phase * 1.7 + t * Math.PI * 9) * 0.2
      + Math.sin(phase * 0.5 + i * 0.3) * 0.15
    const amp = (0.25 + Math.abs(wave)) * h * 0.42
    const x = i * (barW + gap)
    const grad = ctx.createLinearGradient(0, mid - amp, 0, mid + amp)
    grad.addColorStop(0, 'rgba(80, 168, 114, 0.9)')
    grad.addColorStop(0.5, 'rgba(56, 150, 90, 0.55)')
    grad.addColorStop(1, 'rgba(160, 133, 48, 0.25)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(x, mid - amp, barW, amp * 2, 2)
    ctx.fill()
  }

  if (running) raf = requestAnimationFrame(draw)
}

function start() {
  if (props.mobile || running) return
  running = true
  draw()
}

function stop() {
  running = false
  cancelAnimationFrame(raf)
}

watch(() => props.active, (isActive) => {
  if (!import.meta.client || props.mobile) return
  if (isActive) start()
  else stop()
}, { immediate: true })

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!import.meta.client || props.mobile) return

  const { enableHeavyFx } = useGraphicsCapability()
  if (!enableHeavyFx.value) {
    phase = 1.2
    draw()
    return
  }

  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (running || props.active) draw()
    })
    resizeObserver.observe(canvasRef.value)
  }
})

onUnmounted(() => {
  stop()
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="rootRef"
    class="svc-scene svc-sound"
    :class="{
      'svc-scene--stacked': mobile,
      'svc-scene--static': mobile,
    }"
    aria-hidden="true"
  >
    <div class="svc-sound__panel svc-scene__stage">
      <div class="svc-sound__ring svc-sound__ring--outer" />
      <div class="svc-sound__ring svc-sound__ring--inner" />
      <div v-if="mobile" class="svc-sound__bars-static">
        <span
          v-for="(height, i) in STATIC_BARS"
          :key="i"
          class="svc-sound__bar"
          :style="{ '--h': height }"
        />
      </div>
      <canvas v-else ref="canvasRef" class="svc-sound__canvas" />
      <span class="svc-sound__label font-mono">48kHz · stereo</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.svc-sound {
  &__panel {
    width: clamp(240px, 32vw, 380px);
    aspect-ratio: 1.15;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(56, 150, 90, 0.15);

    &--outer {
      inset: 0;
      animation: sound-spin 24s linear infinite;
    }

    &--inner {
      inset: 14%;
      border-color: rgba(80, 168, 114, 0.12);
      animation: sound-spin 18s linear infinite reverse;
    }
  }

  &__canvas {
    position: relative;
    z-index: 1;
    width: 78%;
    height: 42%;
  }

  &__label {
    position: absolute;
    bottom: 8%;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(100, 118, 110, 0.85);
  }
}

@keyframes sound-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .svc-sound__ring {
    animation: none;
  }
}
</style>
