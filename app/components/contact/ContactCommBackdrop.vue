<script setup lang="ts">
import { COMMS_RGB, COMMS_RGB_LIGHT } from '~/constants/brand'

const props = defineProps<{
  root?: HTMLElement | null
  finale?: HTMLElement | null
  ready?: boolean
  activeChapter?: number
  transmitActive?: boolean
}>()

const wrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const COMMS = COMMS_RGB
const COMMS_LIGHT = COMMS_RGB_LIGHT
const DIM = '92, 130, 108'

interface NetNode {
  id: string
  label: string
  sub?: string
  x: number
  y: number
  tier: 'satellite' | 'hub' | 'ground'
  phase: number
  appear: number
}

interface NetLink {
  from: string
  to: string
  scrollStart: number
  scrollEnd: number
}

const NODES: NetNode[] = [
  { id: 'sat-a', label: 'LEO-042', sub: 'KA', x: 0.18, y: 0.13, tier: 'satellite', phase: 0.2, appear: 0.04 },
  { id: 'sat-b', label: 'LEO-118', sub: 'KU', x: 0.5, y: 0.09, tier: 'satellite', phase: 1.4, appear: 0.06 },
  { id: 'sat-c', label: 'LEO-203', sub: 'X', x: 0.82, y: 0.14, tier: 'satellite', phase: 2.8, appear: 0.08 },
  { id: 'hub', label: 'UPLINK GATE', sub: 'CPWD', x: 0.5, y: 0.38, tier: 'hub', phase: 0, appear: 0.14 },
  { id: 'modem', label: 'MODEM', sub: 'DSL', x: 0.1, y: 0.76, tier: 'ground', phase: 0.5, appear: 0.34 },
  { id: 'wifi', label: 'Wi-Fi 6', sub: '802.11ax', x: 0.26, y: 0.7, tier: 'ground', phase: 1.1, appear: 0.38 },
  { id: 'lte', label: 'LTE', sub: '4G', x: 0.42, y: 0.78, tier: 'ground', phase: 1.8, appear: 0.42 },
  { id: '5g', label: '5G NR', sub: 'mmWave', x: 0.58, y: 0.71, tier: 'ground', phase: 2.4, appear: 0.46 },
  { id: 'fiber', label: 'FIBER', sub: 'CORE', x: 0.74, y: 0.77, tier: 'ground', phase: 3.0, appear: 0.5 },
  { id: 'dish', label: 'SAT DISH', sub: 'C-BAND', x: 0.9, y: 0.72, tier: 'ground', phase: 3.6, appear: 0.54 },
]

const LINKS: NetLink[] = [
  { from: 'sat-a', to: 'hub', scrollStart: 0.06, scrollEnd: 0.16 },
  { from: 'sat-b', to: 'hub', scrollStart: 0.09, scrollEnd: 0.19 },
  { from: 'sat-c', to: 'hub', scrollStart: 0.12, scrollEnd: 0.22 },
  { from: 'hub', to: 'modem', scrollStart: 0.28, scrollEnd: 0.38 },
  { from: 'hub', to: 'wifi', scrollStart: 0.32, scrollEnd: 0.42 },
  { from: 'hub', to: 'lte', scrollStart: 0.36, scrollEnd: 0.46 },
  { from: 'hub', to: '5g', scrollStart: 0.4, scrollEnd: 0.5 },
  { from: 'hub', to: 'fiber', scrollStart: 0.44, scrollEnd: 0.54 },
  { from: 'hub', to: 'dish', scrollStart: 0.48, scrollEnd: 0.58 },
]

let raf = 0
let running = false
let initialized = false
let scrollTrigger: import('gsap/ScrollTrigger').ScrollTrigger | null = null
let resizeObserver: ResizeObserver | null = null

let scrollProgress = 0
let scrollProgressTarget = 0

const stars: { x: number; y: number; b: number; p: number; s: number }[] = []

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t))
  return x * x * (3 - 2 * x)
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function nodeById(id: string) {
  return NODES.find(n => n.id === id)!
}

function linkProgress(link: NetLink, scroll: number) {
  const span = Math.max(link.scrollEnd - link.scrollStart, 0.001)
  return smoothstep((scroll - link.scrollStart) / span)
}

function nodeAlpha(node: NetNode, scroll: number) {
  const base = smoothstep((scroll - node.appear) / 0.07)
  if (base <= 0.01) return 0.06

  const inbound = LINKS.filter(l => l.to === node.id)
  const outbound = LINKS.filter(l => l.from === node.id)
  const links = [...inbound, ...outbound]

  if (links.length === 0) return base * 0.55

  const avgLink = links.reduce((sum, l) => sum + linkProgress(l, scroll), 0) / links.length
  const lit = node.tier === 'hub'
    ? Math.max(avgLink, smoothstep((scroll - 0.14) / 0.1))
    : avgLink

  return clamp01(0.08 + base * (0.25 + lit * 0.7))
}

function quadPoint(
  ax: number, ay: number,
  cx: number, cy: number,
  bx: number, by: number,
  t: number,
) {
  const u = 1 - t
  return {
    x: u * u * ax + 2 * u * t * cx + t * t * bx,
    y: u * u * ay + 2 * u * t * cy + t * t * by,
  }
}

function linkPath(
  ax: number, ay: number, bx: number, by: number,
  w: number, h: number,
) {
  const mx = (ax + bx) * 0.5
  const my = (ay + by) * 0.5
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const bend = Math.min(w, h) * 0.06
  return { cx: mx + nx * bend, cy: my + ny * bend }
}

function traceQuadPath(
  ctx: CanvasRenderingContext2D,
  ax: number, ay: number,
  cx: number, cy: number,
  bx: number, by: number,
  progress: number,
) {
  const steps = Math.max(2, Math.ceil(progress * 36))
  ctx.moveTo(ax, ay)
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * progress
    const p = quadPoint(ax, ay, cx, cy, bx, by, t)
    ctx.lineTo(p.x, p.y)
  }
}

function drawLink(
  ctx: CanvasRenderingContext2D,
  link: NetLink,
  w: number,
  h: number,
  time: number,
  scroll: number,
) {
  const progress = linkProgress(link, scroll)
  if (progress <= 0.005) return

  const a = nodeById(link.from)
  const b = nodeById(link.to)
  const ax = a.x * w
  const ay = a.y * h
  const bx = b.x * w
  const by = b.y * h
  const { cx, cy } = linkPath(ax, ay, bx, by, w, h)

  const alpha = clamp01(0.12 + progress * 0.88)
  const lit = progress >= 0.98

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = lit
    ? `rgba(${COMMS_LIGHT}, ${0.38 + progress * 0.22})`
    : `rgba(${COMMS}, ${0.18 + progress * 0.2})`
  ctx.lineWidth = lit ? 1.15 : 0.85
  ctx.setLineDash(lit ? [] : [5, 7])
  if (!lit) ctx.lineDashOffset = -time * 0.045
  ctx.beginPath()
  traceQuadPath(ctx, ax, ay, cx, cy, bx, by, progress)
  ctx.stroke()
  ctx.setLineDash([])

  if (progress > 0.12) {
    const pulseT = (time * 0.0004 + seeded(link.from.charCodeAt(0) + link.to.charCodeAt(0)) * 2) % 1
    const travel = pulseT * progress
    const p = quadPoint(ax, ay, cx, cy, bx, by, travel)
    ctx.globalAlpha = alpha * (0.45 + progress * 0.5)
    ctx.fillStyle = `rgba(${COMMS_LIGHT}, ${0.85})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, lit ? 2.6 : 2, 0, Math.PI * 2)
    ctx.fill()
  }

  if (lit && progress >= 0.99) {
    const flash = 0.5 + Math.sin(time * 0.004 + link.scrollStart * 20) * 0.5
    const end = quadPoint(ax, ay, cx, cy, bx, by, 1)
    ctx.globalAlpha = flash * 0.35
    ctx.strokeStyle = `rgba(${COMMS_LIGHT}, 0.9)`
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(end.x, end.y, 5, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

function drawSatelliteOrbit(
  ctx: CanvasRenderingContext2D,
  node: NetNode,
  w: number,
  h: number,
  time: number,
  alpha: number,
  scroll: number,
) {
  const cx = node.x * w
  const cy = node.y * h
  const rx = 28 + seeded(node.phase) * 12
  const ry = 14 + seeded(node.phase + 1) * 6
  const rot = time * 0.00008 * (node.phase % 2 === 0 ? 1 : -1)
  const orbitAlpha = alpha * smoothstep((scroll - node.appear) / 0.1)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.globalAlpha = orbitAlpha * 0.4
  ctx.strokeStyle = `rgba(${COMMS}, 0.22)`
  ctx.lineWidth = 0.6
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: NetNode,
  w: number,
  h: number,
  time: number,
  alpha: number,
  scroll: number,
) {
  if (alpha <= 0.07) return

  const cx = node.x * w
  const cy = node.y * h
  const pulse = 0.7 + Math.sin(time * 0.002 + node.phase) * 0.3
  const tier = node.tier
  const connected = alpha > 0.45

  if (tier === 'satellite') {
    drawSatelliteOrbit(ctx, node, w, h, time, alpha, scroll)
  }

  ctx.save()
  ctx.globalAlpha = alpha

  const boxW = tier === 'hub' ? 88 : tier === 'satellite' ? 52 : 64
  const boxH = tier === 'hub' ? 36 : 28
  const bx = cx - boxW / 2
  const by = cy - boxH / 2

  if (tier === 'hub') {
    const hubRing = smoothstep((scroll - 0.18) / 0.12)
    ctx.strokeStyle = `rgba(${COMMS_LIGHT}, ${(0.25 + hubRing * 0.45) * pulse})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, 42 + pulse * 4 * hubRing, 0, Math.PI * 2)
    ctx.stroke()
    if (hubRing > 0.5) {
      ctx.beginPath()
      ctx.arc(cx, cy, 28, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  ctx.fillStyle = `rgba(8, 8, 10, ${0.55 + alpha * 0.3})`
  ctx.fillRect(bx, by, boxW, boxH)
  ctx.strokeStyle = `rgba(${COMMS}, ${(connected ? 0.55 : 0.22) * pulse})`
  ctx.lineWidth = 1
  ctx.strokeRect(bx, by, boxW, boxH)

  if (tier === 'satellite') {
    ctx.fillStyle = `rgba(${COMMS_LIGHT}, ${(0.35 + alpha * 0.5) * pulse})`
    ctx.fillRect(cx - 4, cy - 3, 8, 6)
    ctx.fillStyle = `rgba(${COMMS}, ${0.35 * pulse})`
    ctx.fillRect(cx - 10, cy - 1, 6, 2)
    ctx.fillRect(cx + 4, cy - 1, 6, 2)
  }

  if (tier === 'ground') {
    ctx.strokeStyle = `rgba(${COMMS}, ${(0.2 + alpha * 0.35) * pulse})`
    ctx.beginPath()
    ctx.moveTo(cx - 8, cy + 6)
    ctx.lineTo(cx, cy - 6)
    ctx.lineTo(cx + 8, cy + 6)
    ctx.closePath()
    ctx.stroke()
  }

  ctx.font = `${tier === 'hub' ? 10 : 8}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = `rgba(${COMMS_LIGHT}, ${(0.35 + alpha * 0.6) * pulse})`
  ctx.fillText(node.label, cx, cy - (node.sub ? 3 : 0))
  if (node.sub) {
    ctx.font = '7px monospace'
    ctx.fillStyle = `rgba(${DIM}, ${(0.45 + alpha * 0.45) * pulse})`
    ctx.fillText(node.sub, cx, cy + 9)
  }

  ctx.restore()
}

function activeRouteCount(scroll: number) {
  return LINKS.filter(l => linkProgress(l, scroll) >= 0.98).length
}

function drawHud(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, scroll: number) {
  const insets = {
    top: 98,
    side: Math.max(14, Math.min(32, w * 0.022)),
    bottom: Math.max(14, Math.min(24, h * 0.02)),
  }

  const routes = activeRouteCount(scroll)
  const sigBase = 42 + scroll * 52 + routes * 2.8

  ctx.save()
  ctx.strokeStyle = `rgba(${COMMS}, ${0.06 + scroll * 0.06})`
  ctx.lineWidth = 1
  ctx.strokeRect(
    insets.side,
    insets.top,
    w - insets.side * 2,
    h - insets.top - insets.bottom,
  )

  const corners = [
    [insets.side, insets.top],
    [w - insets.side, insets.top],
    [insets.side, h - insets.bottom],
    [w - insets.side, h - insets.bottom],
  ]
  corners.forEach(([x, y], i) => {
    ctx.strokeStyle = `rgba(${COMMS}, ${0.18 + scroll * 0.14})`
    ctx.beginPath()
    const s = 16
    if (i === 0) { ctx.moveTo(x, y + s); ctx.lineTo(x, y); ctx.lineTo(x + s, y) }
    if (i === 1) { ctx.moveTo(x - s, y); ctx.lineTo(x, y); ctx.lineTo(x, y + s) }
    if (i === 2) { ctx.moveTo(x, y - s); ctx.lineTo(x, y); ctx.lineTo(x + s, y) }
    if (i === 3) { ctx.moveTo(x - s, y); ctx.lineTo(x, y); ctx.lineTo(x, y - s) }
    ctx.stroke()
  })

  ctx.font = '9px monospace'
  ctx.fillStyle = `rgba(${DIM}, ${0.35 + scroll * 0.25})`
  ctx.textAlign = 'left'
  ctx.fillText('COMMS // SCOPE', insets.side + 36, insets.top + 22)
  ctx.textAlign = 'right'
  ctx.fillText(`ROUTES: ${routes}/${LINKS.length}`, w - insets.side - 36, insets.top + 22)
  ctx.fillText(
    `SIG: ${(sigBase + Math.sin(time * 0.001) * 1.5).toFixed(1)}%`,
    w - insets.side - 36,
    h - insets.bottom - 14,
  )
  ctx.textAlign = 'left'
  const status = scroll < 0.22
    ? 'ACQUIRING SAT-LINK'
    : scroll < 0.58
      ? 'GROUND HANDSHAKE'
      : scroll < 0.78
        ? 'CHANNEL SECURE'
        : 'UPLINK READY'
  ctx.fillText(`UPLINK ARRAY // ${status}`, insets.side + 36, h - insets.bottom - 14)

  ctx.restore()
}

function drawFrame(time: number) {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  const w = wrap.clientWidth || window.innerWidth
  const h = wrap.clientHeight || window.innerHeight
  if (w < 1 || h < 1) return

  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr
    canvas.height = h * dpr
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  scrollProgress = lerp(scrollProgress, scrollProgressTarget, 0.028)
  const scroll = props.transmitActive ? Math.max(scrollProgress, 0.88) : scrollProgress

  ctx.fillStyle = '#060a08'
  ctx.fillRect(0, 0, w, h)

  stars.forEach((s) => {
    const tw = 0.55 + Math.sin(time * 0.001 * s.s + s.p) * 0.35
    ctx.fillStyle = `rgba(${COMMS_LIGHT}, ${s.b * tw * (0.28 + scroll * 0.32)})`
    ctx.fillRect(s.x * w, s.y * h, 1.2, 1.2)
  })

  if (w >= 1100) drawHud(ctx, w, h, time, scroll)

  const txBoost = props.transmitActive ? 1.5 : 1
  const txTime = props.transmitActive ? time * 2.4 : time

  LINKS.forEach(link => drawLink(ctx, link, w, h, txTime, scroll))

  NODES.forEach((node) => {
    let alpha = nodeAlpha(node, scroll)
    if (props.transmitActive) {
      alpha = Math.min(1, alpha * txBoost + (node.tier === 'hub' ? 0.15 : 0.08))
    }
    drawNode(ctx, node, w, h, txTime, alpha, scroll)
  })

  const secureFrame = smoothstep((scroll - 0.62) / 0.12)
  if (secureFrame > 0.02 || props.transmitActive) {
    const frameAlpha = props.transmitActive ? 0.14 : 0.08 * secureFrame
    ctx.save()
    ctx.globalAlpha = frameAlpha + Math.sin(time * 0.003) * 0.025
    ctx.strokeStyle = `rgba(${COMMS}, 0.55)`
    ctx.setLineDash([2, 10])
    ctx.lineWidth = 0.5
    ctx.strokeRect(w * 0.08, h * 0.22, w * 0.84, h * 0.58)
    ctx.restore()
  }

  if (scroll > 0.75 || props.transmitActive) {
    const hub = nodeById('hub')
    const hx = hub.x * w
    const hy = hub.y * h
    const lockPulse = 0.5 + Math.sin(time * 0.0025) * 0.5
    ctx.save()
    ctx.globalAlpha = (0.06 + lockPulse * 0.08) * smoothstep((scroll - 0.72) / 0.1)
    ctx.strokeStyle = `rgba(${COMMS_LIGHT}, 0.7)`
    ctx.beginPath()
    ctx.arc(hx, hy, 58 + lockPulse * 8, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

function renderLoop(time: number) {
  drawFrame(time)
  if (running) raf = requestAnimationFrame(renderLoop)
}

function start() {
  if (running || !import.meta.client) return
  running = true
  raf = requestAnimationFrame(renderLoop)
}

function stop() {
  running = false
  cancelAnimationFrame(raf)
}

function initStars() {
  stars.length = 0
  for (let i = 0; i < 280; i++) {
    stars.push({
      x: seeded(i * 3.1),
      y: seeded(i * 7.3),
      b: 0.3 + seeded(i) * 0.7,
      p: seeded(i + 50) * Math.PI * 2,
      s: 0.4 + seeded(i + 90) * 1.2,
    })
  }
}

async function bindScroll() {
  scrollTrigger?.kill()
  if (!props.root) return

  try {
    const { init } = useGsap()
    await init()
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')

    scrollTrigger = ScrollTrigger.create({
      trigger: props.root,
      start: 'top top',
      ...(props.finale
        ? { endTrigger: props.finale, end: 'top top' }
        : { end: 'bottom bottom' }),
      scrub: 1.6,
      onUpdate: (self) => {
        scrollProgressTarget = self.progress
      },
    })

    ScrollTrigger.refresh()
  } catch (error) {
    console.warn('[ContactCommBackdrop] ScrollTrigger bind failed:', error)
  }
}

async function boot() {
  if (!import.meta.client || initialized) return
  await nextTick()
  if (!wrapRef.value || !canvasRef.value) return

  try {
    initStars()
    initialized = true
    await bindScroll()
    drawFrame(performance.now())

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) start()

    resizeObserver = new ResizeObserver(() => drawFrame(performance.now()))
    resizeObserver.observe(wrapRef.value)
  } catch (error) {
    console.warn('[ContactCommBackdrop] Boot failed:', error)
  }
}

watch(() => props.root, async (root) => {
  if (root && initialized) {
    await bindScroll()
  }
})

watch(() => [props.ready, props.finale] as const, ([isReady]) => {
  if (isReady) boot()
}, { immediate: true })

watch(() => props.finale, async () => {
  if (initialized) await bindScroll()
})

onUnmounted(() => {
  stop()
  scrollTrigger?.kill()
  resizeObserver?.disconnect()
  initialized = false
})
</script>

<template>
  <Teleport to="body">
    <div ref="wrapRef" class="contact-comm-backdrop" aria-hidden="true">
      <canvas ref="canvasRef" class="contact-comm-backdrop__canvas" />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.contact-comm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.84;
  background: radial-gradient(ellipse at 50% 38%, #0a1410 0%, #060908 55%, #050706 100%);

  &__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
