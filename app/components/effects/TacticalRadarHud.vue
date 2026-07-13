<script setup lang="ts">
import {
  createInitialRadarBlips,
  drawTacticalRadarHud,
  updateRadarBlips,
  type RadarBlip,
} from '~/utils/tacticalRadarHud'

const wrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let raf = 0
let running = false
let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let blips: RadarBlip[] = []
let startTime = 0
const { enableHeavyFx } = useGraphicsCapability()
const staticFx = computed(() => !enableHeavyFx.value)

function resizeCanvas() {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return

  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (w < 1 || h < 1) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
}

function renderFrame(now: number) {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return

  const w = wrap.clientWidth
  const h = wrap.clientHeight
  const ctx = canvas.getContext('2d')
  if (!ctx || w < 1 || h < 1) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const t = (now - startTime) * 0.001
  if (!staticFx.value) updateRadarBlips(blips, t)
  drawTacticalRadarHud(ctx, w, h, t, blips, staticFx.value)

  if (running && enableHeavyFx.value) raf = requestAnimationFrame(renderFrame)
}

function start() {
  if (running) return
  if (!blips.length) blips = createInitialRadarBlips(0)
  startTime = performance.now()
  running = true
  resizeCanvas()
  raf = requestAnimationFrame(renderFrame)
}

function stop() {
  running = false
  cancelAnimationFrame(raf)
}

function setupObserver() {
  const el = wrapRef.value
  if (!el) return

  observer?.disconnect()
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) start()
      else stop()
    },
    { threshold: 0.08 },
  )
  observer.observe(el)
}

onMounted(() => {
  blips = createInitialRadarBlips(0)
  resizeCanvas()
  renderFrame(performance.now())

  if (!enableHeavyFx.value) return

  setupObserver()

  resizeObserver = new ResizeObserver(() => resizeCanvas())
  if (wrapRef.value) resizeObserver.observe(wrapRef.value)
})

onUnmounted(() => {
  stop()
  observer?.disconnect()
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="wrapRef" class="tactical-radar" aria-hidden="true">
    <canvas ref="canvasRef" class="tactical-radar__canvas" />
  </div>
</template>

<style lang="scss" scoped>
.tactical-radar {
  position: absolute;
  left: clamp(4%, 10vw, 16%);
  top: 52%;
  width: clamp(180px, 24vw, 300px);
  aspect-ratio: 1;
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.62;
  mask-image: radial-gradient(circle at 50% 50%, black 35%, transparent 78%);

  @media (max-width: 899px) {
    left: auto;
    right: 4%;
    top: 18%;
    width: clamp(140px, 36vw, 200px);
    opacity: 0.38;
  }

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
