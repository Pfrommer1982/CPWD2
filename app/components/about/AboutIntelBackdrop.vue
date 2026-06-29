<script setup lang="ts">
const props = defineProps<{
  root?: HTMLElement | null
  ready?: boolean
}>()

const wrapRef = ref<HTMLElement | null>(null)
const webglRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLCanvasElement | null>(null)

const GOLD = '69, 232, 138'
const GOLD_LIGHT = '122, 245, 176'
const DIM = '100, 118, 110'

let raf = 0
let running = false
let initialized = false
let scrollTrigger: import('gsap/ScrollTrigger').ScrollTrigger | null = null
let threeDispose: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null

let scrollProgress = 0
let scrollProgressTarget = 0
let lockBlend = 0
let lockBlendTarget = 0

let starGeo: import('three').BufferGeometry | null = null
let starGroup: import('three').Group | null = null
let starMaterial: import('three').PointsMaterial | null = null
let starTexture: import('three').CanvasTexture | null = null
let starPhases: Float32Array | null = null
let starSpeeds: Float32Array | null = null
let starBaseBright: Float32Array | null = null
let scene: import('three').Scene | null = null
let camera: import('three').PerspectiveCamera | null = null
let renderer: import('three').WebGLRenderer | null = null

interface RadarBlip {
  angle: number
  dist: number
  born: number
  ttl: number
  size: number
  lastHit: number
}

const radarBlips: RadarBlip[] = []
const MAX_BLIPS = 5
const SWEEP_ARC = 0.62
const BLIP_PERSIST = 1.15

function hudFrameInsets(w: number, h: number) {
  const side = Math.max(14, Math.min(32, w * 0.022))
  const bottom = Math.max(14, Math.min(24, h * 0.02))
  const top = 98
  const labelPadX = 36
  const labelPadY = 22
  return { top, side, bottom, labelPadX, labelPadY }
}

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

function unwrapEl(el: HTMLElement | null | undefined) {
  return el ?? null
}

function updateStarTwinkle(timeMs: number) {
  if (!starGeo || !starPhases || !starSpeeds || !starBaseBright) return
  const colorAttr = starGeo.getAttribute('color')
  if (!colorAttr) return

  const colors = colorAttr.array as Float32Array
  const t = timeMs * 0.001

  for (let i = 0; i < starPhases.length; i++) {
    const wave = Math.sin(t * starSpeeds[i] + starPhases[i])
    const twinkle = Math.min(1, Math.max(0.25, starBaseBright[i] + wave * 0.22))
    colors[i * 3] = 0.95 * twinkle
    colors[i * 3 + 1] = 0.91 * twinkle
    colors[i * 3 + 2] = 0.82 * twinkle
  }
  colorAttr.needsUpdate = true
}

async function initThree() {
  const canvas = webglRef.value
  if (!canvas || !wrapRef.value || scene) return

  const THREE = await import('three')
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  const starCount = 800
  const starPos = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)
  starPhases = new Float32Array(starCount)
  starSpeeds = new Float32Array(starCount)
  starBaseBright = new Float32Array(starCount)

  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (seeded(i * 4.1) - 0.5) * 22
    starPos[i * 3 + 1] = (seeded(i * 5.3) - 0.5) * 22
    starPos[i * 3 + 2] = -16 + seeded(i * 6.7) * 12
    starPhases[i] = seeded(i * 7.1) * Math.PI * 2
    starSpeeds[i] = 0.3 + seeded(i * 8.3) * 1.2
    starBaseBright[i] = 0.45 + seeded(i * 9.7) * 0.4
    const b = starBaseBright[i]
    starColors[i * 3] = 0.95 * b
    starColors[i * 3 + 1] = 0.91 * b
    starColors[i * 3 + 2] = 0.82 * b
  }

  const circleSize = 64
  const circleCanvas = document.createElement('canvas')
  circleCanvas.width = circleSize
  circleCanvas.height = circleSize
  const circleCtx = circleCanvas.getContext('2d')
  if (circleCtx) {
    circleCtx.beginPath()
    circleCtx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2)
    circleCtx.fillStyle = '#ffffff'
    circleCtx.fill()
  }
  starTexture = new THREE.CanvasTexture(circleCanvas)

  starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
  starMaterial = new THREE.PointsMaterial({
    size: 0.02,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
    sizeAttenuation: true,
  })

  starGroup = new THREE.Group()
  starGroup.add(new THREE.Points(starGeo, starMaterial))
  scene.add(starGroup)

  const resize = () => {
    if (!camera || !renderer || !wrapRef.value) return
    const w = wrapRef.value.clientWidth || window.innerWidth
    const h = wrapRef.value.clientHeight || window.innerHeight
    if (w < 1 || h < 1) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(wrapRef.value)
  window.addEventListener('resize', resize)

  threeDispose = () => {
    window.removeEventListener('resize', resize)
    resizeObserver?.disconnect()
    renderer?.dispose()
    starGeo?.dispose()
    starTexture?.dispose()
    starMaterial?.dispose()
    scene = null
    camera = null
    renderer = null
    starGroup = null
    starGeo = null
    starMaterial = null
    starTexture = null
    starPhases = null
    starSpeeds = null
    starBaseBright = null
  }
}

function updateRadarBlips(time: number) {
  if (radarBlips.length === 0) {
    for (let i = 0; i < 2; i++) {
      radarBlips.push({
        angle: seeded(i + 1) * Math.PI * 2,
        dist: 0.28 + seeded(i + 3) * 0.55,
        born: time,
        ttl: 12 + seeded(i + 5) * 8,
        size: 0.7 + seeded(i + 7) * 0.35,
        lastHit: -999,
      })
    }
  }

  if (radarBlips.length < MAX_BLIPS && Math.random() < 0.0038) {
    const angle = Math.random() * Math.PI * 2
    const tooClose = radarBlips.some((b) => {
      let d = Math.abs(b.angle - angle)
      if (d > Math.PI) d = Math.PI * 2 - d
      return d < 0.55
    })
    if (tooClose) return

    radarBlips.push({
      angle,
      dist: 0.22 + Math.random() * 0.62,
      born: time,
      ttl: 8 + Math.random() * 6,
      size: 0.65 + Math.random() * 0.45,
      lastHit: -999,
    })
  }

  for (let i = radarBlips.length - 1; i >= 0; i--) {
    if (time - radarBlips[i].born > radarBlips[i].ttl) radarBlips.splice(i, 1)
  }
}

function blipSweepIntensity(blip: RadarBlip, sweep: number, time: number) {
  let diff = blip.angle - sweep
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2

  if (diff <= 0 && diff >= -SWEEP_ARC) {
    const hit = 1 - Math.abs(diff) / SWEEP_ARC
    blip.lastHit = time
    return hit
  }

  if (blip.lastHit > 0) {
    const since = time - blip.lastHit
    if (since < BLIP_PERSIST) {
      return (1 - since / BLIP_PERSIST) * 0.48
    }
  }

  return 0
}

function drawRadarBlipSmear(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  blip: RadarBlip,
  intensity: number,
  fade: number,
) {
  const alpha = fade * intensity
  if (alpha < 0.02) return

  const inBeam = intensity > 0.55
  const core = 3.5 + blip.size * 4.5
  const glowR = core * (inBeam ? 6.5 : 4.5)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  const glow = ctx.createRadialGradient(bx, by, 0, bx, by, glowR)
  glow.addColorStop(0, `rgba(${GOLD_LIGHT}, ${alpha * 0.55})`)
  glow.addColorStop(0.25, `rgba(${GOLD}, ${alpha * 0.32})`)
  glow.addColorStop(0.55, `rgba(${GOLD}, ${alpha * 0.1})`)
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.globalAlpha = 1
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.ellipse(bx, by, glowR * 0.95, glowR * 0.72, blip.angle * 0.35, 0, Math.PI * 2)
  ctx.fill()

  const smear = ctx.createRadialGradient(bx, by, 0, bx, by, core * 2.2)
  smear.addColorStop(0, `rgba(${GOLD_LIGHT}, ${alpha * 0.95})`)
  smear.addColorStop(0.35, `rgba(${GOLD}, ${alpha * 0.45})`)
  smear.addColorStop(0.75, `rgba(${GOLD}, ${alpha * 0.08})`)
  smear.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = smear
  ctx.beginPath()
  ctx.ellipse(
    bx,
    by,
    core * 1.55,
    core * 0.72,
    blip.angle + 0.45,
    0,
    Math.PI * 2,
  )
  ctx.fill()

  if (inBeam) {
    ctx.globalAlpha = alpha * 0.35
    ctx.strokeStyle = `rgba(${GOLD_LIGHT}, 0.5)`
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.ellipse(bx, by, core * 2.4, core * 1.1, blip.angle, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

function drawRadarBlips(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  time: number,
  sweep: number,
) {
  radarBlips.forEach((blip) => {
    const age = time - blip.born
    const life = age / blip.ttl
    const bx = cx + Math.cos(blip.angle) * baseR * blip.dist
    const by = cy + Math.sin(blip.angle) * baseR * blip.dist
    const intensity = blipSweepIntensity(blip, sweep, time)
    const fade = 1 - life * 0.85

    if (intensity <= 0.02) return

    drawRadarBlipSmear(ctx, bx, by, blip, intensity, fade)

    if (intensity > 0.72) {
      ctx.globalAlpha = fade * intensity * 0.55
      ctx.font = '8px monospace'
      ctx.fillStyle = `rgba(${GOLD_LIGHT}, 0.9)`
      ctx.textAlign = 'left'
      ctx.fillText('CONTACT', bx + 10, by - 6)
    }
  })
}

function drawRadarHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  progress: number,
  lock: number,
) {
  const cx = w * (0.5 - progress * 0.04)
  const cy = h * 0.5
  const baseR = Math.min(w, h) * (0.34 + progress * 0.08)
  const sweep = time * 0.55
  const alpha = 0.24 + lock * 0.32
  const frame = hudFrameInsets(w, h)

  ctx.save()

  ctx.globalAlpha = 0.05 + lock * 0.06
  ctx.fillStyle = `rgba(${GOLD}, 0.12)`
  ctx.beginPath()
  ctx.arc(cx, cy, baseR, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = `rgba(${GOLD}, ${alpha})`
  ctx.lineWidth = 1

  for (let i = 1; i <= 4; i++) {
    ctx.globalAlpha = 0.14 + (5 - i) * 0.045
    ctx.beginPath()
    ctx.arc(cx, cy, baseR * (i / 4), 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.globalAlpha = 0.12
  ctx.beginPath()
  ctx.moveTo(cx - baseR, cy)
  ctx.lineTo(cx + baseR, cy)
  ctx.moveTo(cx, cy - baseR)
  ctx.lineTo(cx, cy + baseR)
  ctx.stroke()

  ctx.globalAlpha = 0.22 + lock * 0.28
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, baseR, sweep - SWEEP_ARC, sweep)
  ctx.closePath()
  ctx.fillStyle = `rgba(${GOLD}, 0.14)`
  ctx.fill()
  ctx.strokeStyle = `rgba(${GOLD_LIGHT}, ${0.42 + lock * 0.45})`
  ctx.lineWidth = 1.2
  ctx.stroke()

  drawRadarBlips(ctx, cx, cy, baseR, time, sweep)

  const trackedContacts = radarBlips.filter((b) => b.lastHit > 0 && time - b.lastHit < 4).length

  const blink = Math.sin(time * 4) > 0.85 ? 1 : 0.45
  ctx.globalAlpha = (0.5 + lock * 0.45) * blink
  ctx.strokeStyle = `rgba(${GOLD_LIGHT}, 0.9)`
  ctx.lineWidth = 1.2
  const ch = baseR * 0.12
  ctx.beginPath()
  ctx.moveTo(cx - ch, cy)
  ctx.lineTo(cx + ch, cy)
  ctx.moveTo(cx, cy - ch)
  ctx.lineTo(cx, cy + ch)
  ctx.stroke()

  ctx.globalAlpha = 0.62 + lock * 0.3
  ctx.strokeStyle = `rgba(${GOLD}, 0.55)`
  ctx.lineWidth = 0.5
  const bracket = 18
  const corners = [
    [frame.side, frame.top],
    [w - frame.side, frame.top],
    [frame.side, h - frame.bottom],
    [w - frame.side, h - frame.bottom],
  ] as const
  corners.forEach(([x, y], i) => {
    const sx = i % 2 === 0 ? 1 : -1
    const sy = i < 2 ? 1 : -1
    ctx.beginPath()
    ctx.moveTo(x, y + sy * bracket)
    ctx.lineTo(x, y)
    ctx.lineTo(x + sx * bracket, y)
    ctx.stroke()
  })

  const labelY = h - frame.bottom - frame.labelPadY
  const labelLeftX = frame.side + frame.labelPadX
  const labelRightX = w - frame.side - frame.labelPadX

  ctx.font = '9px monospace'
  ctx.fillStyle = `rgba(${DIM}, ${0.55 + lock * 0.25})`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`RADAR // SCOPE ${(progress * 100).toFixed(0)}%`, labelLeftX, labelY)
  ctx.textAlign = 'right'
  ctx.fillText(
    trackedContacts > 0 ? `CONTACTS ${trackedContacts}` : `LOCK ${(lock * 100).toFixed(0)}%`,
    labelRightX,
    labelY,
  )

  ctx.restore()
}

function drawOverlay(time: number) {
  const canvas = overlayRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return

  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (w < 1 || h < 1) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  drawRadarHud(ctx, w, h, time, scrollProgress, lockBlend)
}

function renderFrame(time: number) {
  const timeSec = time * 0.001
  scrollProgress = lerp(scrollProgress, scrollProgressTarget, 0.038)
  lockBlend = lerp(lockBlend, lockBlendTarget, 0.045)
  lockBlendTarget = smoothstep((scrollProgress - 0.55) / 0.35)

  updateRadarBlips(timeSec)
  updateStarTwinkle(time)

  if (starGroup) {
    starGroup.rotation.y = time * 0.00004 + scrollProgress * 0.12
    starGroup.rotation.x = scrollProgress * 0.04
  }

  if (scene && camera && renderer) {
    renderer.render(scene, camera)
  }

  drawOverlay(time * 0.001)

  if (running) raf = requestAnimationFrame(renderFrame)
}

async function bindScroll() {
  scrollTrigger?.kill()
  if (!unwrapEl(props.root)) return

  const { init } = useGsap()
  await init()
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')

  scrollTrigger = ScrollTrigger.create({
    trigger: unwrapEl(props.root),
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.2,
    onUpdate: (self) => {
      scrollProgressTarget = self.progress
    },
  })

  ScrollTrigger.refresh()
  await useLenis().refresh()
}

async function boot() {
  if (!import.meta.client || initialized) return
  await nextTick()
  if (!webglRef.value || !wrapRef.value) return

  await initThree()
  if (!scene) return

  initialized = true
  await bindScroll()
  renderFrame(performance.now())

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) {
    running = true
    raf = requestAnimationFrame(renderFrame)
  }
}

watch(() => props.ready, (isReady) => {
  if (isReady) boot()
}, { immediate: true })

onUnmounted(() => {
  running = false
  cancelAnimationFrame(raf)
  scrollTrigger?.kill()
  threeDispose?.()
  initialized = false
})
</script>

<template>
  <Teleport to="body">
    <div ref="wrapRef" class="about-intel-backdrop" aria-hidden="true">
      <canvas ref="webglRef" class="about-intel-backdrop__webgl" />
      <canvas ref="overlayRef" class="about-intel-backdrop__overlay" />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.about-intel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.84;
  background: $color-bg;

  &__webgl,
  &__overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  &__overlay {
    z-index: 1;
  }
}
</style>
