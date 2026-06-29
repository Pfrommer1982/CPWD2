<script setup lang="ts">
import type { Group, Line, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { COMMS_RGB, COMMS_RGB_LIGHT, COMMS_THREE, COMMS_THREE_LIGHT } from '~/constants/brand'
import { NL_OUTLINE_CENTROID, NL_OUTLINE_RINGS } from '~/data/nl-outline'

const props = defineProps<{
  root?: HTMLElement | null
  hero?: HTMLElement | null
  chapters?: HTMLElement[]
  finale?: HTMLElement | null
  ready?: boolean
}>()

const wrapRef = ref<HTMLElement | null>(null)
const webglRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLCanvasElement | null>(null)

const GOLD = COMMS_RGB
const GOLD_LIGHT = COMMS_RGB_LIGHT
const DIM = '100, 118, 110'
const MASTER_OPACITY = 0.38

interface SectionTarget {
  globeX: number
  globeY: number
  label: string
  code: string
  telemetry: string[]
}

const SECTION_META: SectionTarget[] = [
  { globeX: 0.84, globeY: 0.06, label: 'ORBITAL OPS', code: 'DEP-00', telemetry: ['UPLINK: ACTIVE', 'ORBIT: LEO-042', 'SIG: 98.2%'] },
  { globeX: 0.58, globeY: 0.03, label: 'DESIGN GRID', code: 'SEC-01', telemetry: ['GRID: 128x128', 'LAYER: UI/UX', 'LOCK: PENDING'] },
  { globeX: 0.32, globeY: 0, label: 'BUILD UPLINK', code: 'SEC-02', telemetry: ['BUILD: NUXT 3', 'HASH: 8f2a1c', 'DEPLOY: QUEUED'] },
  { globeX: 0.06, globeY: 0.02, label: 'CLOUD NODES', code: 'SEC-03', telemetry: ['NODES: 14/14', 'CDN: EDGE-OK', 'LAT: 12ms'] },
  { globeX: -0.2, globeY: 0, label: 'SIGNAL ARRAY', code: 'SEC-04', telemetry: ['FREQ: 44.1kHz', 'CH: STEREO', 'GAIN: -3dB'] },
  { globeX: -0.44, globeY: -0.02, label: 'MOTION VECTORS', code: 'SEC-05', telemetry: ['GSAP: ACTIVE', 'SCRUB: 0.65', 'FPS: 60'] },
  { globeX: -0.26, globeY: 0.02, label: 'BRAND MATRIX', code: 'SEC-06', telemetry: ['IDENT: CPWD', 'TONE: COMMS', 'SYNC: OK'] },
  { globeX: 0, globeY: 0, label: 'TARGET LOCK', code: 'ARR-07', telemetry: ['LOCK: ACQUIRED', 'RANGE: 0.0km', 'STATUS: GO'] },
]

interface OrbitalPath {
  radius: number
  speed: number
  phase: number
  rotX: number
  rotY: number
  size: number
  trail: number
}

const ORBITAL_PATHS: OrbitalPath[] = [
  { radius: 2.05, speed: 0.028, phase: 0.2, rotX: Math.PI / 2 - 0.35, rotY: 0, size: 3.5, trail: 0.35 },
  { radius: 2.27, speed: -0.022, phase: 2.1, rotX: Math.PI / 2, rotY: 0.6, size: 3, trail: 0.28 },
  { radius: 2.49, speed: 0.019, phase: 4.4, rotX: Math.PI / 2 + 0.35, rotY: 1.2, size: 2.8, trail: 0.22 },
]

interface HudFeed {
  xRatio: number
  yRatio: number
  align: 'left' | 'right'
  seed: number
  lines: string[]
}

const GLOBE_SCREEN_TRAVEL = 0.26
const [NL_LAT, NL_LON] = NL_OUTLINE_CENTROID
const NL_ZOOM_SCALE = 5.2
const NL_CAMERA_Z = 2.15
const NL_CAMERA_FOV = 26
// Cap matches reference screenshot (~finaleZoom 0.35 on old scale).
const NL_ZOOM_AMOUNT_MAX = 0.35

function finaleZoomAmount(zoom: number) {
  return Math.min(Math.max(zoom, 0), 1) * NL_ZOOM_AMOUNT_MAX
}
const FINALE_INDEX = SECTION_META.length - 1

const LAND_MASK_URL = '/globe/land-texture.png'
const MAP_SAMPLES = 44000
const MAP_BRIGHTNESS = 8.5
const LIGHT_DIR = { x: 0.55, y: 0.35, z: 0.75 }
const COBE_DIFFUSE = 1.15

function fract(x: number) {
  return x - Math.floor(x)
}

const HUD_FEEDS: HudFeed[] = [
  { xRatio: 0.04, yRatio: 0.22, align: 'left', seed: 1, lines: ['SYS/TELEMETRY', 'LAT: 52.3676', 'LON: 4.9041', 'ALT: 000842 KM'] },
  { xRatio: 0.04, yRatio: 0.62, align: 'left', seed: 2, lines: ['COMMS/ARRAY', 'PKT: 0x4F2A8C', 'BAND: X-KU', 'NOISE: -112dBm'] },
  { xRatio: 0.88, yRatio: 0.28, align: 'right', seed: 3, lines: ['ORBIT/DATA', 'INC: 51.6°', 'VEL: 7.66 KM/S', 'PER: 92.4 MIN'] },
  { xRatio: 0.88, yRatio: 0.68, align: 'right', seed: 4, lines: ['TARGET/SCAN', 'BRG: 247°', 'RNG: 1842 KM', 'TGT: ACQUIRED'] },
]

let raf = 0
let running = false
let initialized = false
let scrollTrigger: import('gsap/ScrollTrigger').ScrollTrigger | null = null
let threeDispose: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null
let landMask: ImageData | null = null
let threeModule: typeof import('three') | null = null

let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let renderer: WebGLRenderer | null = null
let globeGroup: Group | null = null
let globePoints: import('three').Points | null = null
let globeGlowPoints: import('three').Points | null = null
let atmosphereGlow: Mesh | null = null

const ATMOSPHERE_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`

const ATMOSPHERE_FRAG = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  void main() {
    float fresnel = 1.0 - abs(dot(normalize(vNormal), vViewDir));
    float alpha = pow(fresnel, power) * intensity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(glowColor, alpha);
  }
`
let nlMarkerGroup: Group | null = null
let nlOutlineLines: Line[] = []
let nlOutlineGlowLines: Line[] = []
let starGeo: import('three').BufferGeometry | null = null
let starGroup: Group | null = null
let starMaterial: import('three').PointsMaterial | null = null
let starTexture: import('three').CanvasTexture | null = null
let starPhases: Float32Array | null = null
let starSpeeds: Float32Array | null = null
let starBaseBright: Float32Array | null = null
let starIsGold: Float32Array | null = null
let starDepthNorm: Float32Array | null = null
let starBaseRotY = 0
let starBaseRotX = 0
let satelliteGroups: Group[] = []
let orbitGroups: Group[] = []
let globeRotation = 0
let scrollProgress = 0
let scrollProgressTarget = 0

const sectionOpacities = new Float32Array(SECTION_META.length)
const sectionOpacitiesTarget = new Float32Array(SECTION_META.length)

let globePos = { x: SECTION_META[0].globeX, y: SECTION_META[0].globeY }
let globePosTarget = { x: SECTION_META[0].globeX, y: SECTION_META[0].globeY }
let finaleBlend = 0
let finaleBlendTarget = 0
let finaleRotate = 0
let finaleZoom = 0
let finaleLockUi = 0
let nlLockQuat: import('three').Quaternion | null = null
let freeGlobeQuat: import('three').Quaternion | null = null
let nlProjectVec: import('three').Vector3 | null = null
const nlScreen = { x: 0, y: 0, visible: false }
let lockUiTypewriterStart = -1

function unwrapEl(el: HTMLElement | null | undefined | { value?: HTMLElement | null }) {
  if (!el) return null
  if (typeof el === 'object' && 'value' in el) return el.value ?? null
  return el
}

function chaptersList() {
  const raw = props.chapters as HTMLElement[] | { value?: HTMLElement[] } | undefined
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'object' && 'value' in raw) return (raw.value ?? []).filter(Boolean)
  return []
}

function seeded(n: number) {
  const x = Math.sin(n * 9999.123) * 10000
  return x - Math.floor(x)
}

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

function sectionOpacity(rect: DOMRect, vh: number) {
  const center = rect.top + rect.height * 0.5
  const dist = Math.abs(center - vh * 0.5)
  return 1 - smoothstep(dist / (vh * 0.58))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function globePathAt(t: number) {
  const max = SECTION_META.length - 1
  const clamped = Math.max(0, Math.min(1, t))
  const pos = clamped * max
  const i = Math.min(Math.floor(pos), max - 1)
  const u = smoothstep(pos - i)
  const a = SECTION_META[i]
  const b = SECTION_META[i + 1]
  return {
    x: lerp(a.globeX, b.globeX, u),
    y: lerp(a.globeY, b.globeY, u),
  }
}

const FINALE_ANIM_START_VIEWPORT = 2.35
const FINALE_ANIM_END_TOP = 0
const FINALE_ANIM_SNAP_TOP = 12

function finalePhases(blend: number) {
  const rotate = smoothstep(Math.min(1, blend / 0.78))
  const zoom = smoothstep(Math.max(0, (blend - 0.68) / 0.32))
  return { rotate, zoom }
}

function finaleRotationBlend(blend: number) {
  return finalePhases(blend).rotate
}

function finaleLockUiBlend(blend: number, rotate: number) {
  const rotateReady = smoothstep((rotate - 0.88) / 0.12)
  const scrollReady = smoothstep((blend - 0.8) / 0.2)
  return rotateReady * scrollReady
}

async function loadLandMask() {
  if (!import.meta.client) return null

  try {
    const img = new Image()
    img.src = LAND_MASK_URL
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('land mask load failed'))
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
  } catch {
    return null
  }
}

function isNetherlands(latDeg: number, lonDeg: number) {
  return latDeg >= 50.7 && latDeg <= 53.7 && lonDeg >= 3.2 && lonDeg <= 7.3
}

function cobeLatLonTo3D(latDeg: number, lonDeg: number, radius: number) {
  const latRad = (latDeg * Math.PI) / 180
  const lonRad = (lonDeg * Math.PI) / 180 - Math.PI
  const cosLat = Math.cos(latRad)
  return {
    x: -cosLat * Math.cos(lonRad) * radius,
    y: Math.sin(latRad) * radius,
    z: cosLat * Math.sin(lonRad) * radius,
  }
}

function landMapSample(latRad: number, lonDeg: number) {
  if (!landMask) return 0

  const lonRad = (lonDeg * Math.PI) / 180 - Math.PI
  const cosLat = Math.cos(latRad)
  const gx = -cosLat * Math.cos(lonRad)
  const gy = Math.sin(latRad)
  const gz = cosLat * Math.sin(lonRad)
  const gPhi = Math.asin(Math.max(-1, Math.min(1, gy)))
  const cosPhi = Math.cos(gPhi)
  let gTheta = Math.acos(Math.max(-1, Math.min(1, -gx / (Math.abs(cosPhi) < 1e-6 ? 1 : cosPhi))))
  if (gz < 0) gTheta = -gTheta

  const u = fract((gTheta * 0.5) / Math.PI)
  const v = fract(-(gPhi / Math.PI + 0.5))
  const x = Math.floor(u * landMask.width)
  const y = Math.floor(v * landMask.height)
  const cx = Math.max(0, Math.min(landMask.width - 1, x))
  const cy = Math.max(0, Math.min(landMask.height - 1, y))
  const idx = (cy * landMask.width + cx) * 4
  return landMask.data[idx] / 255
}

function landDiffuse(x: number, y: number, z: number, radius: number) {
  const nx = x / radius
  const ny = y / radius
  const nz = z / radius
  const dot = nx * LIGHT_DIR.x + ny * LIGHT_DIR.y + nz * LIGHT_DIR.z
  return Math.max(0.76, Math.min(1, Math.pow(Math.max(0, dot), 0.45) * COBE_DIFFUSE * 0.48 + 0.76))
}

function createGlobePixelTexture(THREE: typeof import('three'), size = 32) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const c = size / 2
  const halo = ctx.createRadialGradient(c, c, 0, c, c, size / 2)
  halo.addColorStop(0, 'rgba(255,255,255,1)')
  halo.addColorStop(0.12, 'rgba(255,255,255,1)')
  halo.addColorStop(0.26, 'rgba(80, 168, 114, 0.65)')
  halo.addColorStop(0.48, 'rgba(56, 150, 90, 0.16)')
  halo.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(c - 1.5, c - 1.5, 3, 3)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function createGlobeHaloTexture(THREE: typeof import('three'), size = 64) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const c = size / 2
  const g = ctx.createRadialGradient(c, c, 0, c, c, size / 2)
  g.addColorStop(0, 'rgba(80, 168, 114, 0.82)')
  g.addColorStop(0.22, 'rgba(56, 150, 90, 0.4)')
  g.addColorStop(0.55, 'rgba(56, 150, 90, 0.1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function buildGlobePoints(radius: number) {
  const positions: number[] = []
  const colors: number[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < MAP_SAMPLES; i++) {
    const y = 1 - (i / Math.max(MAP_SAMPLES - 1, 1)) * 2
    const theta = golden * i
    const latRad = Math.asin(Math.max(-1, Math.min(1, y)))
    const latDeg = (latRad * 180) / Math.PI
    const lonDeg = ((((theta + Math.PI) % (Math.PI * 2)) - Math.PI) * 180) / Math.PI

    const mapColor = landMapSample(latRad, lonDeg)
    const nl = isNetherlands(latDeg, lonDeg)
    if (mapColor < 0.06 && !nl) continue

    const p = cobeLatLonTo3D(latDeg, lonDeg, radius)
    positions.push(p.x, p.y, p.z)

    const diffuse = landDiffuse(p.x, p.y, p.z, radius)
    const sample = Math.min(1, Math.pow(mapColor * MAP_BRIGHTNESS, 0.82) * diffuse)
    const twinkle = 0.9 + seeded(i * 3.1) * 0.1
    const matrix = 0.92 + seeded(i * 5.7 + latDeg) * 0.08

    if (nl) {
      colors.push(0.18 * sample * twinkle * matrix, 1 * sample * twinkle * matrix, 0.58 * sample * twinkle * matrix)
    } else {
      colors.push(0.04 * sample * twinkle * matrix, 1 * sample * twinkle * matrix, 0.46 * sample * twinkle * matrix)
    }
  }

  return { positions, colors }
}

function refreshSectionTargets() {
  if (!import.meta.client) return

  const vh = window.innerHeight
  const finale = finaleElement()
  const sections: (HTMLElement | null | undefined)[] = [
    unwrapEl(props.hero),
    ...chaptersList(),
    finale,
  ]

  sections.forEach((el, i) => {
    if (!el || i >= SECTION_META.length) return
    sectionOpacitiesTarget[i] = sectionOpacity(el.getBoundingClientRect(), vh)
  })

  let total = 0
  for (let i = 0; i < sectionOpacitiesTarget.length; i++) total += sectionOpacitiesTarget[i]
  if (total < 0.01) sectionOpacitiesTarget[0] = 1

  updateFinaleBlendFromScroll()
}

function updateSmoothState() {
  const opacityEase = 0.028
  const globeEase = 0.024
  const scrollEase = 0.032

  for (let i = 0; i < sectionOpacities.length; i++) {
    sectionOpacities[i] = lerp(sectionOpacities[i], sectionOpacitiesTarget[i], opacityEase)
  }

  scrollProgress = lerp(scrollProgress, scrollProgressTarget, scrollEase)
  const blendEase = finaleBlendTarget >= 0.95 ? 0.08 : 0.042
  finaleBlend = lerp(finaleBlend, finaleBlendTarget, blendEase)

  const path = globePathAt(scrollProgress)
  globePosTarget.x = path.x
  globePosTarget.y = path.y

  globePos.x = lerp(globePos.x, globePosTarget.x, globeEase)
  globePos.y = lerp(globePos.y, globePosTarget.y, globeEase)

  finaleRotate = finaleRotationBlend(finaleBlend)
  finaleZoom = finalePhases(finaleBlend).zoom
  finaleLockUi = finaleLockUiBlend(finaleBlend, finaleRotate)

  if (finaleBlendTarget >= 0.99) {
    finaleBlend = Math.max(finaleBlend, 0.985)
  }
  if (finaleBlend >= 0.97) {
    finaleRotate = 1
    finaleZoom = 1
    finaleLockUi = 1
  }
}

function finaleElement() {
  return unwrapEl(props.finale)
    ?? chaptersList().find(el => el.classList.contains('journey-chapter--finale'))
    ?? null
}

function rotatePointXYZ(
  x: number,
  y: number,
  z: number,
  rotX: number,
  rotY: number,
  rotZ: number,
) {
  let x1 = x
  let y1 = y * Math.cos(rotX) - z * Math.sin(rotX)
  let z1 = y * Math.sin(rotX) + z * Math.cos(rotX)

  let x2 = x1 * Math.cos(rotY) + z1 * Math.sin(rotY)
  let z2 = -x1 * Math.sin(rotY) + z1 * Math.cos(rotY)
  let y2 = y1

  let x3 = x2 * Math.cos(rotZ) - y2 * Math.sin(rotZ)
  let y3 = x2 * Math.sin(rotZ) + y2 * Math.cos(rotZ)

  return { x: x3, y: y3, z: z2 }
}

function updateFinaleBlendFromScroll() {
  const finale = finaleElement()
  if (!finale) return

  const vh = window.innerHeight
  const finaleRect = finale.getBoundingClientRect()
  const animStartTop = vh * FINALE_ANIM_START_VIEWPORT
  const animEndTop = FINALE_ANIM_END_TOP

  // Freeze once "Klaar om te locken" fills the viewport (top aligned).
  if (finaleRect.top <= FINALE_ANIM_SNAP_TOP) {
    finaleBlendTarget = 1
    return
  }

  const traveled = animStartTop - finaleRect.top
  const total = animStartTop - animEndTop
  const raw = traveled / Math.max(total, 1)

  finaleBlendTarget = smoothstep(Math.max(0, Math.min(1, raw)))
}

function updateStarTwinkle(timeMs: number) {
  if (!starGeo || !starPhases || !starSpeeds || !starBaseBright || !starIsGold || !starDepthNorm) return

  const colorAttr = starGeo.getAttribute('color')
  if (!colorAttr) return

  const colors = colorAttr.array as Float32Array
  const t = timeMs * 0.001

  for (let i = 0; i < starPhases.length; i++) {
    const wave = Math.sin(t * starSpeeds[i] + starPhases[i])
    const drift = Math.sin(t * starSpeeds[i] * 0.27 + starPhases[i] * 1.6) * 0.12
    const tick = Math.floor(t * starSpeeds[i] * 1.2 + starPhases[i] * 0.4)
    const blink = seeded(tick * 17.3 + i * 4.9) > 0.974 ? 1.4 : 1
    const twinkle = Math.min(1, Math.max(0.22, (starBaseBright[i] + wave * 0.28 + drift) * blink))
    const depth = 0.58 + starDepthNorm[i] * 0.42
    const gold = starIsGold[i] > 0.5

    colors[i * 3] = (gold ? 0.27 : 0.95) * twinkle * depth
    colors[i * 3 + 1] = (gold ? 0.91 : 0.93) * twinkle * depth
    colors[i * 3 + 2] = (gold ? 0.54 : 0.91) * twinkle * depth
  }

  colorAttr.needsUpdate = true
}

async function initThree() {
  const canvas = webglRef.value
  if (!canvas || !wrapRef.value || scene) return

  landMask = await loadLandMask()

  try {
    const THREE = await import('three')
    threeModule = THREE
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
    camera.position.z = 6.2

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const starCount = 1000
    const starPos = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)
    starPhases = new Float32Array(starCount)
    starSpeeds = new Float32Array(starCount)
    starBaseBright = new Float32Array(starCount)
    starIsGold = new Float32Array(starCount)
    starDepthNorm = new Float32Array(starCount)

    const starZMin = -18
    const starZMax = -4

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (seeded(i * 4.1) - 0.5) * 24
      starPos[i * 3 + 1] = (seeded(i * 5.3) - 0.5) * 24
      starPos[i * 3 + 2] = starZMin + seeded(i * 6.7) * (starZMax - starZMin)

      starPhases[i] = seeded(i * 7.1) * Math.PI * 2
      starSpeeds[i] = 0.3 + seeded(i * 8.3) * 1.5
      starBaseBright[i] = 0.48 + seeded(i * 9.7) * 0.44
      starIsGold[i] = seeded(i * 11.3) > 0.7 ? 1 : 0
      starDepthNorm[i] = (starPos[i * 3 + 2] - starZMin) / (starZMax - starZMin)

      const gold = starIsGold[i] > 0.5
      const depth = 0.58 + starDepthNorm[i] * 0.42
      const b = starBaseBright[i] * depth
      starColors[i * 3] = (gold ? 0.27 : 0.95) * b
      starColors[i * 3 + 1] = (gold ? 0.91 : 0.93) * b
      starColors[i * 3 + 2] = (gold ? 0.54 : 0.91) * b
    }

    const starCircleSize = 64
    const starCircleCanvas = document.createElement('canvas')
    starCircleCanvas.width = starCircleSize
    starCircleCanvas.height = starCircleSize
    const starCircleCtx = starCircleCanvas.getContext('2d')
    if (starCircleCtx) {
      starCircleCtx.beginPath()
      starCircleCtx.arc(starCircleSize / 2, starCircleSize / 2, starCircleSize / 2, 0, Math.PI * 2)
      starCircleCtx.fillStyle = '#ffffff'
      starCircleCtx.fill()
    }
    starTexture = new THREE.CanvasTexture(starCircleCanvas)

    starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    starMaterial = new THREE.PointsMaterial({
      size: 0.022,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      sizeAttenuation: true,
    })
    const stars = new THREE.Points(starGeo, starMaterial)
    starGroup = new THREE.Group()
    starGroup.add(stars)
    scene.add(starGroup)

    globeGroup = new THREE.Group()

    const dotTexture = createGlobePixelTexture(THREE)
    const haloTexture = createGlobeHaloTexture(THREE)

    const { positions, colors } = buildGlobePoints(1.55)
    const globeGeo = new THREE.BufferGeometry()
    globeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    globeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const attachGlobeFacingShader = (material: import('three').PointsMaterial, neonBoost = 1) => {
      material.onBeforeCompile = (shader) => {
        shader.vertexShader = `
          varying float vFacing;
          ${shader.vertexShader}
        `.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vec4 globeMv = modelViewMatrix * vec4(transformed, 1.0);
          vFacing = dot(normalize(normalMatrix * normalize(transformed)), normalize(-globeMv.xyz));`,
        )
        shader.fragmentShader = `
          varying float vFacing;
          ${shader.fragmentShader}
        `.replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>
          if (vFacing < 0.015) discard;
          #ifdef USE_COLOR
          gl_FragColor.rgb *= vec3(0.72, ${(1.28 * neonBoost).toFixed(2)}, 0.98);
          #endif`,
        )
      }
    }

    globeGlowPoints = new THREE.Points(
      globeGeo,
      new THREE.PointsMaterial({
        size: 0.034,
        map: haloTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      }),
    )
    attachGlobeFacingShader(globeGlowPoints.material as import('three').PointsMaterial, 0.85)
    globeGroup.add(globeGlowPoints)

    globePoints = new THREE.Points(
      globeGeo,
      new THREE.PointsMaterial({
        size: 0.0105,
        map: dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.94,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      }),
    )
    attachGlobeFacingShader(globePoints.material as import('three').PointsMaterial)
    globeGroup.add(globePoints)

    atmosphereGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.61, 72, 72),
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(COMMS_THREE) },
          intensity: { value: 0.58 },
          power: { value: 3.6 },
        },
        vertexShader: ATMOSPHERE_VERT,
        fragmentShader: ATMOSPHERE_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
      }),
    )
    globeGroup.add(atmosphereGlow)

    const addNlRingLine = (
      ring: [number, number][],
      radius: number,
      material: import('three').LineBasicMaterial,
    ) => {
      const verts: number[] = []
      ring.forEach(([lat, lon]) => {
        const p = cobeLatLonTo3D(lat, lon, radius)
        verts.push(p.x, p.y, p.z)
      })
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      const line = new THREE.LineLoop(geo, material)
      globeGroup.add(line)
      return line
    }

    NL_OUTLINE_RINGS.forEach((ring) => {
      nlOutlineGlowLines.push(
        addNlRingLine(ring, 1.603, new THREE.LineBasicMaterial({
          color: COMMS_THREE,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })),
        addNlRingLine(ring, 1.599, new THREE.LineBasicMaterial({
          color: COMMS_THREE_LIGHT,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })),
      )
      nlOutlineLines.push(
        addNlRingLine(ring, 1.595, new THREE.LineBasicMaterial({
          color: COMMS_THREE_LIGHT,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        })),
      )
    })

    const nlPos = cobeLatLonTo3D(NL_LAT, NL_LON, 1.598)
    const nlNormal = new THREE.Vector3(nlPos.x, nlPos.y, nlPos.z).normalize()
    nlLockQuat = new THREE.Quaternion().setFromUnitVectors(nlNormal, new THREE.Vector3(0, 0, 1))
    freeGlobeQuat = new THREE.Quaternion()
    nlProjectVec = new THREE.Vector3()
    nlMarkerGroup = new THREE.Group()
    const nlCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 10),
      new THREE.MeshBasicMaterial({ color: COMMS_THREE_LIGHT, transparent: true, opacity: 0.95 }),
    )
    nlCore.position.set(nlPos.x, nlPos.y, nlPos.z)
    const nlRing = new THREE.Mesh(
      new THREE.RingGeometry(0.045, 0.055, 24),
      new THREE.MeshBasicMaterial({ color: COMMS_THREE, transparent: true, opacity: 0.65, side: THREE.DoubleSide }),
    )
    nlRing.position.copy(nlCore.position)
    nlRing.lookAt(0, 0, 0)
    nlMarkerGroup.add(nlCore, nlRing)
    nlMarkerGroup.visible = false
    globeGroup.add(nlMarkerGroup)

    ORBITAL_PATHS.forEach((path, i) => {
      const orbitGroup = new THREE.Group()
      orbitGroup.rotation.x = path.rotX
      orbitGroup.rotation.y = path.rotY

      const ringGeo = new THREE.RingGeometry(path.radius - 0.005, path.radius + 0.005, 128)
      const ring = new THREE.LineLoop(
        ringGeo,
        new THREE.LineBasicMaterial({ color: COMMS_THREE, transparent: true, opacity: 0.06 - i * 0.012 }),
      )
      orbitGroup.add(ring)

      const satGroup = new THREE.Group()
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.04, 0.04),
        new THREE.MeshBasicMaterial({ color: COMMS_THREE_LIGHT, transparent: true, opacity: 0.55 }),
      )
      const panelL = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.02, 0.06),
        new THREE.MeshBasicMaterial({ color: COMMS_THREE, transparent: true, opacity: 0.35 }),
      )
      panelL.position.x = -0.08
      const panelR = panelL.clone()
      panelR.position.x = 0.08
      satGroup.add(body, panelL, panelR)
      satGroup.userData.orbit = path
      orbitGroup.add(satGroup)

      globeGroup.add(orbitGroup)
      orbitGroups.push(orbitGroup)
      satelliteGroups.push(satGroup)
    })

    scene.add(globeGroup)

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
      globeGeo.dispose()
      nlOutlineLines.forEach(line => line.geometry.dispose())
      nlOutlineGlowLines.forEach(line => line.geometry.dispose())
      dotTexture.dispose()
      haloTexture.dispose()
      atmosphereGlow?.geometry.dispose()
      ;(atmosphereGlow?.material as import('three').Material)?.dispose()
      ;(globePoints?.material as import('three').Material)?.dispose()
      ;(globeGlowPoints?.material as import('three').Material)?.dispose()
      nlOutlineLines.forEach(line => (line.material as import('three').Material).dispose())
      nlOutlineGlowLines.forEach(line => (line.material as import('three').Material).dispose())
      orbitGroups.forEach((group) => {
        group.traverse((child) => {
          if ('geometry' in child && child.geometry) (child.geometry as import('three').BufferGeometry).dispose()
          if ('material' in child && child.material) {
            const mat = child.material as import('three').Material | import('three').Material[]
            if (Array.isArray(mat)) mat.forEach(m => m.dispose())
            else mat.dispose()
          }
        })
      })
      scene = null
      camera = null
      renderer = null
      starGeo = null
      starGroup = null
      starMaterial = null
      starTexture = null
      starPhases = null
      starSpeeds = null
      starBaseBright = null
      starIsGold = null
      starDepthNorm = null
      globeGroup = null
      globePoints = null
      globeGlowPoints = null
      atmosphereGlow = null
      nlMarkerGroup = null
      nlOutlineLines = []
      nlOutlineGlowLines = []
      nlLockQuat = null
      freeGlobeQuat = null
      satelliteGroups = []
      orbitGroups = []
    }
  } catch (error) {
    console.warn('[ServicesJourneyBackdrop] Three.js init failed:', error)
  }
}

function updateSatellites(timeMs: number) {
  const t = timeMs * 0.001
  satelliteGroups.forEach((group) => {
    const orbit = group.userData.orbit as OrbitalPath
    const angle = t * orbit.speed + orbit.phase
    group.position.set(
      Math.cos(angle) * orbit.radius,
      Math.sin(angle) * orbit.radius,
      0,
    )
    group.lookAt(0, 0, 0)
  })
}

function telemetryValue(seed: number, time: number, kind: 'hex' | 'deg' | 'float') {
  const tick = Math.floor(time * 0.8 + seed * 10)
  const r = seeded(tick + seed * 17)
  if (kind === 'hex') return `0x${Math.floor(r * 0xffffff).toString(16).toUpperCase().padStart(6, '0')}`
  if (kind === 'deg') return `${(r * 360).toFixed(1)}°`
  if (kind === 'float') return (r * 999).toFixed(2)
  return Math.floor(r * 9999).toString().padStart(4, '0')
}

function viewportTier(w: number) {
  if (w < 640) return 'narrow' as const
  if (w < 1100) return 'medium' as const
  return 'wide' as const
}

function getFinaleContentRect() {
  const finale = finaleElement()
  if (!finale) return null
  const content = finale.querySelector('.journey-chapter__content') as HTMLElement | null
  return (content ?? finale).getBoundingClientRect()
}

function rectsOverlap(a: DOMRect, x: number, y: number, w: number, h: number, pad = 16) {
  return !(
    a.right + pad < x
    || x + w + pad < a.left
    || a.bottom + pad < y
    || y + h + pad < a.top
  )
}

function finaleGlobeOffset(w: number) {
  const tier = viewportTier(w)
  if (tier === 'narrow') return { x: -0.38, y: -0.1 }
  if (tier === 'medium') return { x: 0.42, y: -0.02 }
  return { x: 0.52, y: 0 }
}

function drawTelemetryBlock(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  feed: HudFeed,
  time: number,
  masterAlpha: number,
) {
  const x = feed.xRatio * w
  const y = feed.yRatio * h
  const alpha = 0.22 * masterAlpha

  ctx.save()
  ctx.font = '9px monospace'
  ctx.textAlign = feed.align
  ctx.textBaseline = 'top'

  feed.lines.forEach((line, i) => {
    let text = line
    if (line.includes(':') && i > 0) {
      const [key] = line.split(':')
      if (key.includes('LAT') || key.includes('LON')) {
        text = `${key}: ${(52 + Math.sin(time * 0.2 + feed.seed) * 3).toFixed(4)}`
      } else if (key.includes('PKT') || key.includes('HASH')) {
        text = `${key}: ${telemetryValue(feed.seed + i, time, 'hex')}`
      } else if (key.includes('BRG') || key.includes('INC')) {
        text = `${key}: ${telemetryValue(feed.seed + i, time, 'deg')}`
      } else if (key.includes('RNG') || key.includes('ALT') || key.includes('VEL')) {
        text = `${key}: ${telemetryValue(feed.seed + i, time, 'float')}`
      } else if (key.includes('SIG') || key.includes('NOISE')) {
        text = `${key}: ${(80 + seeded(time * 0.5 + feed.seed) * 20).toFixed(1)}%`
      }
    }

    ctx.fillStyle = i === 0
      ? `rgba(${GOLD}, ${alpha * 1.6})`
      : `rgba(${DIM}, ${alpha * (0.85 + seeded(i + feed.seed) * 0.3)})`
    ctx.fillText(text, x, y + i * 13)
  })

  ctx.strokeStyle = `rgba(${GOLD}, ${alpha * 0.5})`
  ctx.lineWidth = 0.5
  const boxW = 118
  const boxH = feed.lines.length * 13 + 6
  const bx = feed.align === 'left' ? x - 4 : x - boxW + 4
  ctx.strokeRect(bx, y - 4, boxW, boxH)

  ctx.restore()
}

function drawSectionOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  index: number,
  opacity: number,
  time: number,
) {
  if (opacity < 0.015) return
  if (index === FINALE_INDEX) return
  const meta = SECTION_META[index]
  const side = meta.globeX >= 0 ? 1 : -1
  const anchorX = w * (0.5 + meta.globeX * GLOBE_SCREEN_TRAVEL)
  const anchorY = h * (0.42 + meta.globeY * 0.12)
  const alpha = opacity * 0.55

  ctx.save()
  ctx.globalAlpha = alpha

  ctx.strokeStyle = `rgba(${GOLD}, 0.12)`
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.arc(anchorX, anchorY, 72 + index * 2, 0, Math.PI * 2)
  ctx.stroke()

  ctx.setLineDash([2, 6])
  ctx.strokeStyle = `rgba(${GOLD_LIGHT}, 0.14)`
  ctx.beginPath()
  ctx.arc(anchorX, anchorY, 98, time * 0.08 + index * 0.3, time * 0.08 + index * 0.3 + 1.1)
  ctx.stroke()
  ctx.setLineDash([])

  const tx = side > 0 ? w * 0.56 : w * 0.06
  ctx.font = '9px monospace'
  ctx.fillStyle = `rgba(${GOLD}, 0.4)`
  ctx.fillText(meta.code, tx, h * 0.12)
  ctx.fillStyle = `rgba(${DIM}, 0.32)`
  ctx.fillText(meta.label, tx, h * 0.12 + 12)

  meta.telemetry.forEach((line, li) => {
    const [key] = line.split(':')
    let val = line
    if (key.includes('HASH') || key.includes('PKT')) val = `${key}: ${telemetryValue(index + li, time, 'hex')}`
    ctx.fillStyle = `rgba(${DIM}, 0.28)`
    ctx.fillText(val, tx, h * 0.12 + 28 + li * 12)
  })

  ctx.restore()
}

function resolveNlLockPanelNearPin(
  w: number,
  h: number,
  tier: ReturnType<typeof viewportTier>,
  cx: number,
  cy: number,
  contentRect: DOMRect | null,
  panelW: number,
  panelH: number,
) {
  const edge = Math.max(24, Math.min(48, w * 0.04))
  const gap = tier === 'narrow' ? 20 : 28
  const diag = tier === 'narrow' ? 24 : 40
  let panelX: number
  let panelY: number

  if (tier === 'narrow') {
    panelX = Math.max(edge, Math.min(cx - panelW * 0.35, w - panelW - edge))
    panelY = cy - panelH - gap - diag
  } else {
    panelX = cx + diag * 0.75
    panelY = cy - panelH - gap - diag

    if (panelX + panelW > w - edge) {
      panelX = cx - panelW - diag * 0.55
    }
    if (panelX < edge) {
      panelX = edge
    }
  }

  panelX = Math.max(edge, Math.min(panelX, w - panelW - edge))
  panelY = Math.max(edge + 48, Math.min(panelY, h - panelH - edge))

  if (contentRect && rectsOverlap(contentRect, panelX, panelY, panelW, panelH, 20)) {
    panelY = Math.max(edge + 48, contentRect.top - panelH - gap)
    panelX = Math.min(w - panelW - edge, Math.max(edge, contentRect.right + gap))
  }

  return { panelX, panelY }
}

const TYPEWRITER_CHARS_PER_SEC = 34
const TYPEWRITER_PAUSE_SEC = 2

function typewriterTypeDuration(lines: string[], charsPerSec = TYPEWRITER_CHARS_PER_SEC) {
  return lines.join('\n').length / charsPerSec
}

function typewriterCycleElapsed(elapsedSec: number, lines: string[], pauseSec = TYPEWRITER_PAUSE_SEC) {
  const typeDuration = typewriterTypeDuration(lines)
  const cycleDuration = typeDuration + pauseSec
  if (elapsedSec <= 0) return 0
  const cyclePos = elapsedSec % cycleDuration
  return Math.min(cyclePos, typeDuration)
}

function typewriterVisibleText(lines: string[], elapsedSec: number, charsPerSec = TYPEWRITER_CHARS_PER_SEC) {
  const effective = typewriterCycleElapsed(elapsedSec, lines)
  const count = Math.min(lines.join('\n').length, Math.floor(Math.max(0, effective) * charsPerSec))
  let idx = 0
  return lines.map((line) => {
    const start = idx
    idx += line.length + 1
    if (count <= start) return ''
    return line.slice(0, Math.min(line.length, count - start))
  })
}

function typewriterInPause(elapsedSec: number, lines: string[]) {
  const typeDuration = typewriterTypeDuration(lines)
  const cycleDuration = typeDuration + TYPEWRITER_PAUSE_SEC
  if (elapsedSec <= 0) return false
  const cyclePos = elapsedSec % cycleDuration
  return cyclePos >= typeDuration
}

function updateNlScreenProjection() {
  if (!camera || !nlMarkerGroup || !nlProjectVec || !wrapRef.value) {
    nlScreen.visible = false
    return
  }

  const child = nlMarkerGroup.children[0]
  if (!child) {
    nlScreen.visible = false
    return
  }

  child.getWorldPosition(nlProjectVec)
  nlProjectVec.project(camera)

  const w = wrapRef.value.clientWidth || window.innerWidth
  const h = wrapRef.value.clientHeight || window.innerHeight
  nlScreen.x = (nlProjectVec.x * 0.5 + 0.5) * w
  nlScreen.y = (-nlProjectVec.y * 0.5 + 0.5) * h
  nlScreen.visible = nlProjectVec.z < 1
    && nlProjectVec.z > -1
    && nlScreen.x > 24
    && nlScreen.x < w - 24
    && nlScreen.y > 24
    && nlScreen.y < h - 24
}

function drawNetherlandsLock(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  blend: number,
) {
  if (blend < 0.04 || !nlScreen.visible) return

  const tier = viewportTier(w)
  const contentRect = getFinaleContentRect()
  const pulse = 0.92 + Math.sin(time * 2.2) * 0.08 * (1 - blend)
  const alpha = blend * 0.96
  const fontSize = tier === 'narrow' ? 10 : 9
  const lineH = tier === 'narrow' ? 14 : 13
  const padX = 14
  const padY = 12

  const lines = [
    'TARGET/NL — LOCKED',
    `LAT: ${NL_LAT.toFixed(4)}° N`,
    `LON: ${NL_LON.toFixed(4)}° E`,
    'MGRS: 31U ED 51892',
    'SECTOR: NLD CORE',
    'BASE: CPWD HQ',
  ]

  ctx.save()
  ctx.font = `${fontSize}px monospace`
  const maxLineW = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0)
  const panelW = Math.ceil(maxLineW + padX * 2)
  const panelH = padY * 2 + (lines.length - 1) * lineH + fontSize

  const cx = nlScreen.x
  const cy = nlScreen.y
  const { panelX, panelY } = resolveNlLockPanelNearPin(w, h, tier, cx, cy, contentRect, panelW, panelH)
  const boxPad = 8
  const boxX = panelX - boxPad
  const boxY = panelY - boxPad
  const boxW = panelW + boxPad * 2
  const boxH = panelH + boxPad * 2
  const textX = panelX + padX

  if (blend > 0.08 && lockUiTypewriterStart < 0) {
    lockUiTypewriterStart = time
  }
  if (blend < 0.04) {
    lockUiTypewriterStart = -1
  }

  const elapsed = lockUiTypewriterStart >= 0 ? time - lockUiTypewriterStart : 0
  const visibleLines = typewriterVisibleText(lines, elapsed)
  const inPause = typewriterInPause(elapsed, lines)
  const typingDone = inPause || visibleLines.every((line, i) => line.length >= lines[i].length)

  ctx.globalAlpha = alpha

  ctx.strokeStyle = `rgba(${GOLD}, ${0.28 * blend})`
  ctx.lineWidth = 1
  ctx.setLineDash([4, 5])
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  const leadX = panelX + panelW * 0.22
  const leadY = panelY + panelH
  ctx.lineTo(leadX, leadY)
  ctx.stroke()
  ctx.setLineDash([])

  for (let i = 0; i < 3; i++) {
    const r = 8 + i * 6 + pulse * 3
    ctx.strokeStyle = `rgba(${GOLD}, ${(0.38 - i * 0.09) * pulse * blend})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.strokeStyle = `rgba(${GOLD_LIGHT}, ${0.78 * pulse})`
  ctx.lineWidth = 1
  const arm = tier === 'narrow' ? 14 : 18
  const gap = 7
  ctx.beginPath()
  ctx.moveTo(cx - arm, cy); ctx.lineTo(cx - gap, cy)
  ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + arm, cy)
  ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy - gap)
  ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + arm)
  ctx.stroke()

  ctx.fillStyle = `rgba(${GOLD_LIGHT}, ${0.98 * pulse})`
  ctx.beginPath()
  ctx.arc(cx, cy, tier === 'narrow' ? 3 : 3.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(8, 8, 10, ${0.72 * blend})`
  ctx.fillRect(boxX, boxY, boxW, boxH)

  ctx.strokeStyle = `rgba(${GOLD}, ${0.55 * pulse})`
  ctx.lineWidth = 1
  ctx.strokeRect(boxX, boxY, boxW, boxH)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  const cursorBlink = Math.floor(time * 2.8) % 2 === 0

  const cursorLineIdx = typingDone
    ? lines.length - 1
    : visibleLines.findIndex((visible, i) => visible.length < lines[i].length)

  visibleLines.forEach((visible, i) => {
    const y = panelY + padY + fontSize + i * lineH
    ctx.fillStyle = i === 0
      ? `rgba(${GOLD_LIGHT}, ${0.92 * pulse})`
      : `rgba(${GOLD}, ${0.72 * pulse})`
    ctx.fillText(visible, textX, y)

    if (cursorBlink && i === cursorLineIdx) {
      const cursorX = textX + ctx.measureText(visible).width + 2
      ctx.fillStyle = `rgba(${GOLD_LIGHT}, ${0.95 * pulse})`
      ctx.fillRect(cursorX, y - fontSize + 2, 6, fontSize - 2)
    }
  })

  ctx.restore()
}

function drawOverlay(time: number) {
  const canvas = overlayRef.value
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

  HUD_FEEDS.forEach((feed) => {
    const zoomAmt = finaleZoomAmount(finaleZoom)
    if (zoomAmt > 0.1 || finaleLockUi > 0.2) return
    if (w < 720 && (feed.xRatio < 0.5 ? feed.yRatio > 0.5 : feed.yRatio < 0.55)) return
    drawTelemetryBlock(ctx, w, h, feed, time, MASTER_OPACITY * (1 - zoomAmt * 0.85))
  })

  if (w >= 640) {
    for (let i = 0; i < SECTION_META.length; i++) {
      drawSectionOverlay(ctx, w, h, i, sectionOpacities[i], time)
    }
  }

  drawNetherlandsLock(ctx, w, h, time, finaleLockUi)
}

function renderFrame(time: number) {
  refreshSectionTargets()
  updateSmoothState()
  updateStarTwinkle(time)

  if (starGroup) {
    const zoomAmt = finaleZoomAmount(finaleZoom)
    const drift = 1 - zoomAmt * 0.45
    starBaseRotY += 0.0002 * drift
    starBaseRotX += 0.0001 * drift
    starGroup.rotation.y = starBaseRotY + scrollProgress * 0.35 * (1 - finaleRotate)
    starGroup.rotation.x = starBaseRotX + scrollProgress * 0.08 * (1 - finaleRotate)
  }

  if (globeGroup && camera && threeModule && freeGlobeQuat && nlLockQuat) {
    const rotateT = finaleBlend >= 0.96 ? 1 : finaleRotate
    const inFinale = finaleBlend > 0.04
    const zoomAmt = finaleZoomAmount(finaleZoom)
    globeRotation += 0.0012 * (1 - rotateT * 0.98) * (inFinale ? 0.35 : 1)

    freeGlobeQuat.setFromEuler(new threeModule.Euler(
      Math.sin(time * 0.00018) * 0.05 * (1 - rotateT),
      globeRotation + scrollProgress * 0.28 * (1 - rotateT) * (inFinale ? 0.2 : 1),
      0,
      'YXZ',
    ))
    globeGroup.quaternion.copy(freeGlobeQuat).slerp(nlLockQuat, rotateT)

    const vw = wrapRef.value?.clientWidth ?? window.innerWidth
    const finOffset = finaleGlobeOffset(vw)

    globeGroup.scale.setScalar(lerp(1, NL_ZOOM_SCALE, zoomAmt))
    globeGroup.position.x = lerp(globePos.x, finOffset.x, zoomAmt)
    globeGroup.position.y = lerp(globePos.y, finOffset.y, zoomAmt)

    camera.position.z = lerp(6.2, NL_CAMERA_Z, zoomAmt)
    camera.fov = lerp(48, NL_CAMERA_FOV, zoomAmt)
    camera.updateProjectionMatrix()

    if (globePoints) {
      const mat = globePoints.material as import('three').PointsMaterial
      mat.size = lerp(0.0105, 0.0115, zoomAmt)
    }

    if (globeGlowPoints) {
      const mat = globeGlowPoints.material as import('three').PointsMaterial
      mat.size = lerp(0.034, 0.038, zoomAmt)
      mat.opacity = lerp(0.16, 0.2, zoomAmt)
    }

    if (atmosphereGlow) {
      const mat = atmosphereGlow.material as import('three').ShaderMaterial
      mat.uniforms.intensity.value = lerp(0.58, 0.68, zoomAmt)
    }

    if (nlMarkerGroup) {
      nlMarkerGroup.visible = false
    }

    const outlineAlpha = finaleRotate * 0.85
    nlOutlineGlowLines.forEach((line, i) => {
      const mat = line.material as import('three').LineBasicMaterial
      mat.opacity = outlineAlpha * (i % 2 === 0 ? 0.28 : 0.42)
      line.visible = finaleRotate > 0.05
    })
    nlOutlineLines.forEach((line) => {
      const mat = line.material as import('three').LineBasicMaterial
      mat.opacity = outlineAlpha
      line.visible = finaleRotate > 0.05
    })

    orbitGroups.forEach((group, i) => {
      group.visible = zoomAmt < 0.14
      group.rotation.z = time * 0.00005 * (i % 2 === 0 ? 1 : -1)
    })

    updateSatellites(time)
    updateNlScreenProjection()
  }

  if (scene && camera && renderer) {
    renderer.render(scene, camera)
  }

  drawOverlay(time * 0.001)

  if (running) raf = requestAnimationFrame(renderFrame)
}

function start() {
  if (running || !import.meta.client) return
  running = true
  raf = requestAnimationFrame(renderFrame)
}

function stop() {
  running = false
  cancelAnimationFrame(raf)
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
    scrub: 1.4,
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
  if (!scene || !globeGroup) return

  initialized = true
  await bindScroll()

  refreshSectionTargets()
  sectionOpacities.set(sectionOpacitiesTarget)
  renderFrame(performance.now())

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) start()
}

watch(() => props.ready, (isReady) => {
  if (isReady) boot()
}, { immediate: true })

onUnmounted(() => {
  stop()
  scrollTrigger?.kill()
  threeDispose?.()
  initialized = false
})
</script>

<template>
  <Teleport to="body">
    <div ref="wrapRef" class="journey-backdrop" aria-hidden="true">
      <canvas ref="webglRef" class="journey-backdrop__webgl" />
      <canvas ref="overlayRef" class="journey-backdrop__overlay" />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.journey-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.88;
  background: #030504;

  &__webgl,
  &__overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  &__webgl {
    filter: saturate(1.35) brightness(1.12);
  }

  &__overlay {
    z-index: 1;
  }
}
</style>
