import { COMMS_THREE } from '~/constants/brand'

export const GLOBE_LAND_MASK_URL = '/globe/land-texture.png'
export const GLOBE_MAP_SAMPLES = 44000
export const GLOBE_MAP_BRIGHTNESS = 8.5
export const GLOBE_LIGHT_DIR = { x: 0.55, y: 0.35, z: 0.75 }
export const GLOBE_COBE_DIFFUSE = 1.15

export const GLOBE_ATMOSPHERE_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`

export const GLOBE_ATMOSPHERE_FRAG = /* glsl */`
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

function fract(x: number) {
  return x - Math.floor(x)
}

export function globeSeeded(n: number) {
  const x = Math.sin(n * 9999.123) * 10000
  return x - Math.floor(x)
}

export async function loadGlobeLandMask() {
  if (!import.meta.client) return null

  try {
    const img = new Image()
    img.src = GLOBE_LAND_MASK_URL
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

function landBlob(lat: number, lon: number, clat: number, clon: number, slat: number, slon: number, amp: number) {
  const dlat = (lat - clat) / slat
  const dlon = (lon - clon) / slon
  return amp * Math.exp(-(dlat * dlat + dlon * dlon))
}

/** Fallback when /globe/land-texture.png is unavailable — keeps the dotted globe readable. */
export function proceduralLandSample(latDeg: number, lonDeg: number) {
  let v = 0
  v += landBlob(latDeg, lonDeg, 5, 18, 20, 24, 0.95)
  v += landBlob(latDeg, lonDeg, 48, 12, 14, 20, 0.88)
  v += landBlob(latDeg, lonDeg, 52, 5.5, 7, 5, 0.82)
  v += landBlob(latDeg, lonDeg, 35, 105, 24, 38, 0.92)
  v += landBlob(latDeg, lonDeg, 42, -98, 26, 38, 0.9)
  v += landBlob(latDeg, lonDeg, -12, -58, 24, 28, 0.84)
  v += landBlob(latDeg, lonDeg, -22, 134, 18, 30, 0.78)
  v += landBlob(latDeg, lonDeg, 68, -42, 16, 36, 0.55)
  v += landBlob(latDeg, lonDeg, -62, 18, 14, 55, 0.42)

  const grain = globeSeeded(Math.floor(latDeg * 2.7) * 991 + Math.floor(lonDeg * 2.1) * 137)
  v = Math.min(1, v * 0.88 + grain * 0.12 * (v > 0.18 ? 1 : 0.35))

  return v
}

export function cobeLatLonTo3D(latDeg: number, lonDeg: number, radius: number) {
  const latRad = (latDeg * Math.PI) / 180
  const lonRad = (lonDeg * Math.PI) / 180 - Math.PI
  const cosLat = Math.cos(latRad)
  return {
    x: -cosLat * Math.cos(lonRad) * radius,
    y: Math.sin(latRad) * radius,
    z: cosLat * Math.sin(lonRad) * radius,
  }
}

function landMapSample(landMask: ImageData | null, latRad: number, lonDeg: number) {
  if (!landMask) return proceduralLandSample((latRad * 180) / Math.PI, lonDeg)

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
  return (landMask.data[idx] ?? 0) / 255
}

function landDiffuse(x: number, y: number, z: number, radius: number) {
  const nx = x / radius
  const ny = y / radius
  const nz = z / radius
  const dot = nx * GLOBE_LIGHT_DIR.x + ny * GLOBE_LIGHT_DIR.y + nz * GLOBE_LIGHT_DIR.z
  return Math.max(0.76, Math.min(1, Math.pow(Math.max(0, dot), 0.45) * GLOBE_COBE_DIFFUSE * 0.48 + 0.76))
}

export function createGlobePixelTexture(THREE: typeof import('three'), size = 32) {
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

export function createGlobeHaloTexture(THREE: typeof import('three'), size = 64) {
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

export function attachGlobeFacingShader(
  material: import('three').PointsMaterial,
  neonBoost = 1,
) {
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
  material.needsUpdate = true
}

export function buildGlobePoints(radius: number, landMask: ImageData | null) {
  const positions: number[] = []
  const colors: number[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < GLOBE_MAP_SAMPLES; i++) {
    const y = 1 - (i / Math.max(GLOBE_MAP_SAMPLES - 1, 1)) * 2
    const theta = golden * i
    const latRad = Math.asin(Math.max(-1, Math.min(1, y)))
    const latDeg = (latRad * 180) / Math.PI
    const lonDeg = ((((theta + Math.PI) % (Math.PI * 2)) - Math.PI) * 180) / Math.PI

    const mapColor = landMapSample(landMask, latRad, lonDeg)
    const nl = isNetherlands(latDeg, lonDeg)
    if (mapColor < 0.06 && !nl) continue

    const p = cobeLatLonTo3D(latDeg, lonDeg, radius)
    positions.push(p.x, p.y, p.z)

    const diffuse = landDiffuse(p.x, p.y, p.z, radius)
    const sample = Math.min(1, Math.pow(mapColor * GLOBE_MAP_BRIGHTNESS, 0.82) * diffuse)
    const twinkle = 0.9 + globeSeeded(i * 3.1) * 0.1
    const matrix = 0.92 + globeSeeded(i * 5.7 + latDeg) * 0.08

    if (nl) {
      colors.push(0.18 * sample * twinkle * matrix, 1 * sample * twinkle * matrix, 0.58 * sample * twinkle * matrix)
    } else {
      colors.push(0.04 * sample * twinkle * matrix, 1 * sample * twinkle * matrix, 0.46 * sample * twinkle * matrix)
    }
  }

  return { positions, colors }
}

export function createGlobeAtmosphereMesh(
  THREE: typeof import('three'),
  radius: number,
  intensity = 0.58,
) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.038, 72, 72),
    new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(COMMS_THREE) },
        intensity: { value: intensity },
        power: { value: 3.6 },
      },
      vertexShader: GLOBE_ATMOSPHERE_VERT,
      fragmentShader: GLOBE_ATMOSPHERE_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    }),
  )
}
