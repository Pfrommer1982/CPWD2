<script setup lang="ts">
import type { Group, Mesh, PerspectiveCamera, Points, Scene, WebGLRenderer } from 'three'
import { COMMS_THREE, COMMS_THREE_LIGHT } from '~/constants/brand'
import {
  attachGlobeFacingShader,
  buildGlobePoints,
  cobeLatLonTo3D,
  createGlobeAtmosphereMesh,
  createGlobeHaloTexture,
  createGlobePixelTexture,
  globeSeeded,
  loadGlobeLandMask,
} from '~/utils/globeCore'
import { drawHeroGlobeHud } from '~/utils/heroGlobeHud'
import {
  createMissilePaths,
  disposeMissilePaths,
  updateMissilePath,
  type MissilePathRuntime,
} from '~/utils/heroGlobeMissiles'

const props = defineProps<{
  scrollProgress?: number
}>()

const wrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hudRef = ref<HTMLCanvasElement | null>(null)

const GLOBE_RADIUS = 2.28
const IDLE_ROT_Y = -1.05
const SCROLL_ROT_RANGE = 1.1
const CAMERA_Z_START = 5.35
const CAMERA_Z_END = 8.6
const CAMERA_FOV_START = 34
const CAMERA_FOV_END = 42
const SCALE_START = 0.92
const SCALE_END = 0.72
const HUD_INTRO_MS = 1300

let hudIntroStart = 0
let hudIntroStarted = false
let hudIntroReduced = false
let hudCanReplayIntro = false
let hudRunning = false
let hudRaf = 0

let raf = 0
let running = false
let disposeThree: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null

let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let renderer: WebGLRenderer | null = null
let globeGroup: Group | null = null
let globePoints: Points | null = null
let globeGlowPoints: Points | null = null
let starGroup: Group | null = null
let starLayerLeftFar: Group | null = null
let starLayerLeftNear: Group | null = null
let starLayerLeftFarGeo: import('three').BufferGeometry | null = null
let starLayerLeftFarPhases: Float32Array | null = null
let starLayerLeftFarSpeeds: Float32Array | null = null
let starLayerLeftFarBase: Float32Array | null = null
let starLayerLeftFarGold: Float32Array | null = null
let starLayerLeftNearGeo: import('three').BufferGeometry | null = null
let starLayerLeftNearPhases: Float32Array | null = null
let starLayerLeftNearSpeeds: Float32Array | null = null
let starLayerLeftNearBase: Float32Array | null = null
let starLayerLeftNearGold: Float32Array | null = null
let atmosphereMesh: Mesh | null = null
let occluderMesh: Mesh | null = null
let satelliteGroup: Group | null = null
let orbitRing: import('three').Line | null = null
let missilePaths: MissilePathRuntime[] = []
let missileGroup: Group | null = null
const SAT_ORBIT = { radius: 3.15, inclination: 0.46, node: 0.38, speed: 0.22 }

let globeRotation = IDLE_ROT_Y
let smoothProgress = 0
let globeOffsetX = 2.35

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

function globeScreenOffset(aspect: number) {
  return 1.88 + Math.max(0, aspect - 1) * 0.48
}

interface StarLayerConfig {
  count: number
  xMin: number
  xMax: number
  ySpread: number
  zMin: number
  zMax: number
  size: number
  opacity: number
  goldChance?: number
}

function createStarLayer(
  THREE: typeof import('three'),
  texture: import('three').CanvasTexture,
  config: StarLayerConfig,
) {
  const { count, xMin, xMax, ySpread, zMin, zMax, size, opacity, goldChance = 0.26 } = config
  const pos = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const speeds = new Float32Array(count)
  const baseBright = new Float32Array(count)
  const isGold = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const sx = globeSeeded(i * 4.1)
    const sy = globeSeeded(i * 5.3)
    const sz = globeSeeded(i * 6.7)

    pos[i * 3] = xMin + sx * (xMax - xMin)
    pos[i * 3 + 1] = (sy - 0.5) * ySpread
    pos[i * 3 + 2] = zMin + sz * (zMax - zMin)

    phases[i] = globeSeeded(i * 7.1) * Math.PI * 2
    speeds[i] = 0.22 + globeSeeded(i * 8.3) * 0.55
    baseBright[i] = 0.62 + globeSeeded(i * 9.7) * 0.38
    isGold[i] = globeSeeded(i * 11.3) > (1 - goldChance) ? 1 : 0

    const depthNorm = (pos[i * 3 + 2] - zMin) / Math.max(zMax - zMin, 0.001)
    const depth = 0.52 + depthNorm * 0.48
    const gold = isGold[i] > 0.5
    const b = baseBright[i] * depth
    colors[i * 3] = (gold ? 0.27 : 0.95) * b
    colors[i * 3 + 1] = (gold ? 0.91 : 0.93) * b
    colors[i * 3 + 2] = (gold ? 0.54 : 0.91) * b
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      depthTest: true,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    }),
  )

  const group = new THREE.Group()
  group.add(points)

  return { group, geo, points, phases, speeds, baseBright, isGold, zMin, zMax }
}

function updateStarTwinkle(
  timeMs: number,
  geo: import('three').BufferGeometry,
  phases: Float32Array,
  speeds: Float32Array,
  baseBright: Float32Array,
  isGold: Float32Array,
  zMin: number,
  zMax: number,
) {
  const colorAttr = geo.getAttribute('color')
  if (!colorAttr) return

  const colors = colorAttr.array as Float32Array
  const t = timeMs * 0.001

  for (let i = 0; i < phases.length; i++) {
    const depthNorm = (geo.attributes.position!.array[i * 3 + 2] - zMin) / Math.max(zMax - zMin, 0.001)
    const depth = 0.55 + depthNorm * 0.45
    const wave = Math.sin(t * speeds[i] + phases[i])
    const twinkle = Math.min(1, Math.max(0.45, baseBright[i] + wave * 0.22))
    const gold = isGold[i] > 0.5

    colors[i * 3] = (gold ? 0.27 : 0.95) * twinkle * depth
    colors[i * 3 + 1] = (gold ? 0.91 : 0.93) * twinkle * depth
    colors[i * 3 + 2] = (gold ? 0.54 : 0.91) * twinkle * depth
  }

  colorAttr.needsUpdate = true
}

function createTacticalGrid(THREE: typeof import('three'), radius: number) {
  const group = new THREE.Group()
  const lineMat = new THREE.LineBasicMaterial({
    color: COMMS_THREE,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  })

  const addMeridian = (lonDeg: number) => {
    const verts: number[] = []
    for (let i = 0; i <= 72; i++) {
      const lat = -90 + (180 * i) / 72
      const p = cobeLatLonTo3D(lat, lonDeg, radius)
      verts.push(p.x, p.y, p.z)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    group.add(new THREE.Line(geo, lineMat))
  }

  const addParallel = (latDeg: number) => {
    const verts: number[] = []
    for (let i = 0; i <= 96; i++) {
      const lon = -180 + (360 * i) / 96
      const p = cobeLatLonTo3D(latDeg, lon, radius)
      verts.push(p.x, p.y, p.z)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    group.add(new THREE.Line(geo, lineMat))
  }

  ;[-60, 0, 60].forEach(addMeridian)
  ;[-30, 30].forEach(addParallel)

  return group
}

function createOrbitRing(THREE: typeof import('three'), radius: number) {
  const verts: number[] = []
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2
    verts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  return new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({
      color: COMMS_THREE,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }),
  )
}

function createSatellite(THREE: typeof import('three')) {
  const group = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.045, 0.045),
    new THREE.MeshBasicMaterial({ color: COMMS_THREE_LIGHT, transparent: true, opacity: 0.7 }),
  )
  const panelMat = new THREE.MeshBasicMaterial({ color: COMMS_THREE, transparent: true, opacity: 0.45 })
  const panelL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.018, 0.07), panelMat)
  panelL.position.x = -0.1
  const panelR = panelL.clone()
  panelR.position.x = 0.1
  group.add(body, panelL, panelR)
  return group
}

function resizeCanvas() {
  const wrap = wrapRef.value
  const canvas = canvasRef.value
  if (!wrap || !canvas || !camera || !renderer) return

  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (w < 1 || h < 1) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  renderer.setPixelRatio(dpr)
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()

  const hud = hudRef.value
  if (hud) {
    const dpr = Math.min(window.devicePixelRatio, 2)
    hud.width = Math.floor(w * dpr)
    hud.height = Math.floor(h * dpr)
    hud.style.width = `${w}px`
    hud.style.height = `${h}px`
  }

  globeOffsetX = globeScreenOffset(w / h)
  if (globeGroup && smoothProgress < 0.02) {
    globeGroup.position.x = globeOffsetX
  }
}

async function initThree() {
  const canvas = canvasRef.value
  if (!canvas || !wrapRef.value || scene) return

  const landMask = await loadGlobeLandMask()
  const THREE = await import('three')

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(CAMERA_FOV_START, 1, 0.1, 100)
  camera.position.z = CAMERA_Z_START

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setClearColor(0x000000, 0)
  renderer.sortObjects = true

  const starCircleSize = 64
  const starCircleCanvas = document.createElement('canvas')
  starCircleCanvas.width = starCircleSize
  starCircleCanvas.height = starCircleSize
  const starCircleCtx = starCircleCanvas.getContext('2d')
  if (starCircleCtx) {
    const c = starCircleSize / 2
    const glow = starCircleCtx.createRadialGradient(c, c, 0, c, c, c)
    glow.addColorStop(0, 'rgba(255,255,255,1)')
    glow.addColorStop(0.35, 'rgba(255,255,255,0.95)')
    glow.addColorStop(0.7, 'rgba(200,255,220,0.35)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    starCircleCtx.fillStyle = glow
    starCircleCtx.fillRect(0, 0, starCircleSize, starCircleSize)
  }
  const starTexture = new THREE.CanvasTexture(starCircleCanvas)

  const starBackdrop = createStarLayer(THREE, starTexture, {
    count: 420,
    xMin: -8,
    xMax: 6,
    ySpread: 22,
    zMin: -11,
    zMax: -6,
    size: 0.032,
    opacity: 0.72,
  })

  const starLeftFar = createStarLayer(THREE, starTexture, {
    count: 200,
    xMin: -7.5,
    xMax: 0.5,
    ySpread: 18,
    zMin: -8.5,
    zMax: -4.8,
    size: 0.042,
    opacity: 0.88,
    goldChance: 0.28,
  })

  const starLeftNear = createStarLayer(THREE, starTexture, {
    count: 130,
    xMin: -6.8,
    xMax: 1.2,
    ySpread: 16,
    zMin: -4.6,
    zMax: -2.4,
    size: 0.056,
    opacity: 0.96,
    goldChance: 0.34,
  })

  starLayerLeftFar = starLeftFar.group
  starLayerLeftNear = starLeftNear.group
  starLayerLeftFarGeo = starLeftFar.geo
  starLayerLeftFarPhases = starLeftFar.phases
  starLayerLeftFarSpeeds = starLeftFar.speeds
  starLayerLeftFarBase = starLeftFar.baseBright
  starLayerLeftFarGold = starLeftFar.isGold
  starLayerLeftNearGeo = starLeftNear.geo
  starLayerLeftNearPhases = starLeftNear.phases
  starLayerLeftNearSpeeds = starLeftNear.speeds
  starLayerLeftNearBase = starLeftNear.baseBright
  starLayerLeftNearGold = starLeftNear.isGold

  starGroup = new THREE.Group()
  starGroup.add(starBackdrop.group)
  starGroup.add(starLayerLeftFar)
  starGroup.add(starLayerLeftNear)
  starGroup.position.x = 0.15
  starGroup.renderOrder = 0
  scene.add(starGroup)

  globeGroup = new THREE.Group()
  globeGroup.renderOrder = 1
  globeOffsetX = globeScreenOffset(wrapRef.value.clientWidth / Math.max(wrapRef.value.clientHeight, 1))
  globeGroup.position.x = globeOffsetX

  const occluderMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  occluderMat.colorWrite = false
  occluderMat.depthWrite = true
  occluderMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 0.988, 48, 48), occluderMat)
  occluderMesh.renderOrder = 0
  scene.add(occluderMesh)

  globeGroup.add(createTacticalGrid(THREE, GLOBE_RADIUS * 1.004))

  const orbitGroup = new THREE.Group()
  orbitGroup.rotation.order = 'YXZ'
  orbitGroup.rotation.y = SAT_ORBIT.node
  orbitGroup.rotation.x = SAT_ORBIT.inclination
  orbitRing = createOrbitRing(THREE, SAT_ORBIT.radius)
  orbitGroup.add(orbitRing)
  satelliteGroup = createSatellite(THREE)
  orbitGroup.add(satelliteGroup)
  globeGroup.add(orbitGroup)

  missileGroup = new THREE.Group()
  missilePaths = createMissilePaths(THREE, GLOBE_RADIUS)
  missilePaths.forEach((path) => {
    missileGroup!.add(path.glow, path.arc, path.launchMarker, path.impactMarker, path.warhead)
  })
  globeGroup.add(missileGroup)

  const dotTexture = createGlobePixelTexture(THREE)
  const haloTexture = createGlobeHaloTexture(THREE)
  const { positions, colors } = buildGlobePoints(GLOBE_RADIUS, landMask)

  const globeGeo = new THREE.BufferGeometry()
  globeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  globeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  globeGlowPoints = new THREE.Points(
    globeGeo,
    new THREE.PointsMaterial({
      size: 0.072,
      map: haloTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    }),
  )
  attachGlobeFacingShader(globeGlowPoints.material as import('three').PointsMaterial, 0.92)
  globeGroup.add(globeGlowPoints)

  globePoints = new THREE.Points(
    globeGeo,
    new THREE.PointsMaterial({
      size: 0.021,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    }),
  )
  attachGlobeFacingShader(globePoints.material as import('three').PointsMaterial)
  globeGroup.add(globePoints)

  atmosphereMesh = createGlobeAtmosphereMesh(THREE, GLOBE_RADIUS, 0.78)
  globeGroup.add(atmosphereMesh)

  scene.add(globeGroup)
  resizeCanvas()

  disposeThree = () => {
    starTexture.dispose()
    dotTexture.dispose()
    haloTexture.dispose()
    ;[starBackdrop, starLeftFar, starLeftNear].forEach((layer) => {
      layer.geo.dispose()
      ;(layer.points.material as import('three').Material).dispose()
    })
    globeGeo.dispose()
    ;(globePoints?.material as import('three').Material)?.dispose()
    ;(globeGlowPoints?.material as import('three').Material)?.dispose()
    globeGroup?.traverse((obj) => {
      const mesh = obj as import('three').Mesh
      mesh.geometry?.dispose()
      const mat = mesh.material
      if (Array.isArray(mat)) mat.forEach(m => m.dispose())
      else mat?.dispose()
    })
    renderer?.dispose()
    scene = null
    camera = null
    renderer = null
    globeGroup = null
    globePoints = null
    globeGlowPoints = null
    starGroup = null
    starLayerLeftFar = null
    starLayerLeftNear = null
    starLayerLeftFarGeo = null
    starLayerLeftFarPhases = null
    starLayerLeftFarSpeeds = null
    starLayerLeftFarBase = null
    starLayerLeftFarGold = null
    starLayerLeftNearGeo = null
    starLayerLeftNearPhases = null
    starLayerLeftNearSpeeds = null
    starLayerLeftNearBase = null
    starLayerLeftNearGold = null
    atmosphereMesh = null
    occluderMesh = null
    satelliteGroup = null
    orbitRing = null
    missileGroup = null
    disposeMissilePaths(missilePaths)
    missilePaths = []
  }
}

function hudIntroProgress(time: number) {
  if (hudIntroReduced) return 1
  if (!hudIntroStarted) return 0
  return Math.min(1, (time - hudIntroStart) / HUD_INTRO_MS)
}

function beginHudIntro() {
  hudIntroStart = performance.now()
  hudIntroStarted = true
}

function resetHudIntro() {
  hudIntroStarted = false
}

function tickHudIntroScroll() {
  if (hudIntroReduced) return

  if (smoothProgress > 0.12) {
    hudCanReplayIntro = true
    resetHudIntro()
    return
  }

  if (hudCanReplayIntro && smoothProgress < 0.04) {
    beginHudIntro()
    hudCanReplayIntro = false
  }
}

function drawHudOverlay(time: number) {
  const hud = hudRef.value
  const wrap = wrapRef.value
  if (!hud || !wrap) return

  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (w < 1 || h < 1) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  const ctx = hud.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  drawHeroGlobeHud(ctx, w, h, time, smoothProgress, hudIntroProgress(time))
}

function renderFrame(time: number) {
  const target = smoothstep(props.scrollProgress ?? 0)
  smoothProgress = lerp(smoothProgress, target, 0.06)
  const t = time * 0.001

  if (starGroup) {
    starGroup.rotation.y = Math.sin(t * 0.13) * 0.07 + smoothProgress * 0.12
    starGroup.rotation.x = Math.sin(t * 0.16) * 0.032 + smoothProgress * 0.04

    if (starLayerLeftFar) {
      starLayerLeftFar.rotation.y = Math.sin(t * 0.19 + 0.6) * 0.028
      starLayerLeftFar.rotation.x = Math.sin(t * 0.22) * 0.014
    }

    if (starLayerLeftNear) {
      starLayerLeftNear.rotation.y = Math.sin(t * 0.24 + 1.2) * 0.038
      starLayerLeftNear.rotation.x = Math.sin(t * 0.28) * 0.018
      starLayerLeftNear.position.z = Math.sin(t * 0.72) * 0.08
    }

    if (
      starLayerLeftFarGeo
      && starLayerLeftFarPhases
      && starLayerLeftFarSpeeds
      && starLayerLeftFarBase
      && starLayerLeftFarGold
    ) {
      updateStarTwinkle(
        time,
        starLayerLeftFarGeo,
        starLayerLeftFarPhases,
        starLayerLeftFarSpeeds,
        starLayerLeftFarBase,
        starLayerLeftFarGold,
        -8.5,
        -4.8,
      )
    }

    if (
      starLayerLeftNearGeo
      && starLayerLeftNearPhases
      && starLayerLeftNearSpeeds
      && starLayerLeftNearBase
      && starLayerLeftNearGold
    ) {
      updateStarTwinkle(
        time,
        starLayerLeftNearGeo,
        starLayerLeftNearPhases,
        starLayerLeftNearSpeeds,
        starLayerLeftNearBase,
        starLayerLeftNearGold,
        -4.6,
        -2.4,
      )
    }
  }

  if (globeGroup && camera) {
    globeRotation += 0.001 * (1 - smoothProgress * 0.4)
    const rotY = globeRotation + smoothProgress * SCROLL_ROT_RANGE
    const tiltX = Math.sin(time * 0.00014) * 0.035 * (1 - smoothProgress * 0.55) + smoothProgress * 0.14

    globeGroup.rotation.set(tiltX, rotY, 0, 'YXZ')

    const scale = lerp(SCALE_START, SCALE_END, smoothProgress)
    globeGroup.scale.setScalar(scale)

    const offsetX = lerp(globeOffsetX, globeOffsetX * 0.72, smoothProgress)
    globeGroup.position.x = offsetX
    globeGroup.position.y = lerp(0, -0.35, smoothProgress)

    camera.position.z = lerp(CAMERA_Z_START, CAMERA_Z_END, smoothProgress)
    camera.fov = lerp(CAMERA_FOV_START, CAMERA_FOV_END, smoothProgress)
    camera.updateProjectionMatrix()

    if (atmosphereMesh) {
      const mat = atmosphereMesh.material as import('three').ShaderMaterial
      mat.uniforms.intensity.value = lerp(0.78, 0.52, smoothProgress)
    }

    if (satelliteGroup) {
      const angle = t * SAT_ORBIT.speed
      const r = SAT_ORBIT.radius
      satelliteGroup.position.set(
        Math.cos(angle) * r,
        0,
        Math.sin(angle) * r,
      )
      satelliteGroup.lookAt(
        Math.cos(angle + 0.12) * r,
        0,
        Math.sin(angle + 0.12) * r,
      )
    }

    missilePaths.forEach((path) => updateMissilePath(path, t))
  }

  if (scene && camera && renderer && occluderMesh && starGroup && globeGroup) {
    renderer.setClearColor(0x000000, 0)
    renderer.clear(true, true, true)

    occluderMesh.position.copy(globeGroup.position)
    occluderMesh.rotation.copy(globeGroup.rotation)
    occluderMesh.scale.copy(globeGroup.scale)
    occluderMesh.visible = true
    starGroup.visible = false
    globeGroup.visible = false
    renderer.render(scene, camera)

    starGroup.visible = true
    globeGroup.visible = true
    occluderMesh.visible = false
    renderer.autoClear = false
    renderer.render(scene, camera)
    renderer.autoClear = true
  }

  if (running) raf = requestAnimationFrame(renderFrame)
}

function hudFrame(time: number) {
  tickHudIntroScroll()
  drawHudOverlay(time)
  if (hudRunning) hudRaf = requestAnimationFrame(hudFrame)
}

function startHudLoop() {
  if (hudRunning || !import.meta.client) return
  hudRunning = true
  hudRaf = requestAnimationFrame(hudFrame)
}

function stopHudLoop() {
  hudRunning = false
  cancelAnimationFrame(hudRaf)
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

async function boot() {
  if (!import.meta.client) return
  await nextTick()
  if (!canvasRef.value || !wrapRef.value) return

  hudIntroReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  startHudLoop()

  await initThree()
  if (!scene) return

  if (hudIntroReduced) {
    beginHudIntro()
  }
  else {
    hudCanReplayIntro = false
  }

  renderFrame(performance.now())

  if (!hudIntroReduced) {
    start()
    window.setTimeout(() => {
      if (!hudIntroStarted) beginHudIntro()
    }, 3200)
  }

  resizeObserver = new ResizeObserver(() => resizeCanvas())
  resizeObserver.observe(wrapRef.value)
}

defineExpose({ beginHudIntro })

watch(() => props.scrollProgress, () => {
  if (!running && scene) {
    renderFrame(performance.now())
  }
})

onMounted(() => {
  boot()
})

onUnmounted(() => {
  stop()
  stopHudLoop()
  resizeObserver?.disconnect()
  disposeThree?.()
})
</script>

<template>
  <div ref="wrapRef" class="hero-globe" aria-hidden="true">
    <ClientOnly>
      <canvas ref="canvasRef" class="hero-globe__canvas" />
      <canvas ref="hudRef" class="hero-globe__hud" />
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.hero-globe {
  position: absolute;
  inset: 0;
  z-index: $z-base;
  overflow: hidden;
  pointer-events: none;

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__hud {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>
