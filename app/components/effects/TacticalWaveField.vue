<script setup lang="ts">
import { COMMS_RGB, COMMS_RGB_LIGHT } from '~/constants/brand'

const COMMS = COMMS_RGB
const COMMS_LIGHT = COMMS_RGB_LIGHT

interface Wave {
  yFrac: number
  amp: number
  freq: number
  speed: number
  offset: number
  alpha: number
}

const WAVES: Wave[] = [
  { yFrac: 0.24, amp: 26, freq: 0.010, speed: 0.0011, offset: 0.0, alpha: 0.16 },
  { yFrac: 0.5, amp: 40, freq: 0.006, speed: 0.0007, offset: 1.7, alpha: 0.2 },
  { yFrac: 0.76, amp: 22, freq: 0.014, speed: 0.0015, offset: 3.4, alpha: 0.14 },
]

const wrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let raf = 0
let running = false
let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let startTime = 0
const reducedMotion = ref(false)

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

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.strokeStyle = `rgba(${COMMS}, 0.04)`
  ctx.lineWidth = 1
  const gap = 64
  for (let x = 0; x <= w; x += gap) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y <= h; y += gap) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  ctx.restore()
}

function drawWave(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, wave: Wave) {
  const baseY = wave.yFrac * h
  ctx.save()
  ctx.beginPath()
  let headX = 0
  let headY = baseY
  for (let x = 0; x <= w; x += 4) {
    const envelope = 0.6 + 0.4 * Math.sin(t * 0.0004 + x * 0.0012 + wave.offset)
    const y = baseY + Math.sin(x * wave.freq + t * wave.speed + wave.offset) * wave.amp * envelope
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
    headX = x
    headY = y
  }
  ctx.strokeStyle = `rgba(${COMMS}, ${wave.alpha})`
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()

  // Bright travelling node riding the wave crest.
  const nodeT = (t * 0.00016 + wave.offset * 0.15) % 1
  const nx = nodeT * w
  const envelope = 0.6 + 0.4 * Math.sin(t * 0.0004 + nx * 0.0012 + wave.offset)
  const ny = baseY + Math.sin(nx * wave.freq + t * wave.speed + wave.offset) * wave.amp * envelope
  ctx.save()
  ctx.fillStyle = `rgba(${COMMS_LIGHT}, ${Math.min(0.9, wave.alpha * 3)})`
  ctx.shadowColor = `rgba(${COMMS}, 0.6)`
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.arc(nx, ny, 2.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  void headX
  void headY
}

function drawSweep(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const x = ((t * 0.03) % (w + 200)) - 100
  ctx.save()
  const grad = ctx.createLinearGradient(x - 60, 0, x + 60, 0)
  grad.addColorStop(0, `rgba(${COMMS}, 0)`)
  grad.addColorStop(0.5, `rgba(${COMMS_LIGHT}, 0.08)`)
  grad.addColorStop(1, `rgba(${COMMS}, 0)`)
  ctx.fillStyle = grad
  ctx.fillRect(x - 60, 0, 120, h)

  ctx.strokeStyle = `rgba(${COMMS_LIGHT}, 0.12)`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, 0)
  ctx.lineTo(x, h)
  ctx.stroke()
  ctx.restore()
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
  ctx.clearRect(0, 0, w, h)

  const t = reducedMotion.value ? 0 : now - startTime

  drawGrid(ctx, w, h)
  if (!reducedMotion.value) drawSweep(ctx, w, h, t)
  WAVES.forEach(wave => drawWave(ctx, w, h, t, wave))

  if (running && !reducedMotion.value) raf = requestAnimationFrame(renderFrame)
}

function start() {
  if (running) return
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
    { threshold: 0.02 },
  )
  observer.observe(el)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resizeCanvas()

  if (reducedMotion.value) {
    renderFrame(performance.now())
  }
  else {
    setupObserver()
  }

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    if (!running) renderFrame(performance.now())
  })
  if (wrapRef.value) resizeObserver.observe(wrapRef.value)
})

onUnmounted(() => {
  stop()
  observer?.disconnect()
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="wrapRef" class="tactical-wave" aria-hidden="true">
    <canvas ref="canvasRef" class="tactical-wave__canvas" />
  </div>
</template>

<style lang="scss" scoped>
.tactical-wave {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  // Reveal the signal mostly at the side margins, keep the reading column clear.
  mask-image: linear-gradient(
    90deg,
    black 0%,
    black 18%,
    transparent 38%,
    transparent 62%,
    black 82%,
    black 100%
  );

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
