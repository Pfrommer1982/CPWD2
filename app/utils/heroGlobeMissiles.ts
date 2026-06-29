import { COMMS_THREE, COMMS_THREE_LIGHT } from '~/constants/brand'
import { cobeLatLonTo3D } from '~/utils/globeCore'

export interface MissileRoute {
  from: [number, number]
  to: [number, number]
  apogee: number
  speed: number
  phase: number
}

export const HERO_MISSILE_ROUTES: MissileRoute[] = [
  { from: [39, -98], to: [52, 5], apogee: 1.08, speed: 0.13, phase: 0.08 },
  { from: [30, 122], to: [-14, -40], apogee: 1.22, speed: 0.1, phase: 0.38 },
  { from: [62, 28], to: [34, 44], apogee: 0.82, speed: 0.15, phase: 0.68 },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function unitVec(lat: number, lon: number) {
  const p = cobeLatLonTo3D(lat, lon, 1)
  const len = Math.hypot(p.x, p.y, p.z)
  return { x: p.x / len, y: p.y / len, z: p.z / len }
}

function slerpUnit(
  a: { x: number, y: number, z: number },
  b: { x: number, y: number, z: number },
  t: number,
) {
  let dot = a.x * b.x + a.y * b.y + a.z * b.z
  dot = Math.max(-1, Math.min(1, dot))
  const omega = Math.acos(dot)
  if (omega < 1e-5) {
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      z: lerp(a.z, b.z, t),
    }
  }
  const sinOmega = Math.sin(omega)
  const s0 = Math.sin((1 - t) * omega) / sinOmega
  const s1 = Math.sin(t * omega) / sinOmega
  return {
    x: s0 * a.x + s1 * b.x,
    y: s0 * a.y + s1 * b.y,
    z: s0 * a.z + s1 * b.z,
  }
}

export function buildBallisticArcPoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius: number,
  apogee: number,
  segments = 80,
) {
  const u0 = unitVec(lat1, lon1)
  const u1 = unitVec(lat2, lon2)
  const positions = new Float32Array((segments + 1) * 3)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const u = slerpUnit(u0, u1, t)
    const lift = 1 + (apogee / radius) * Math.sin(Math.PI * t)
    const r = radius * lift
    positions[i * 3] = u.x * r
    positions[i * 3 + 1] = u.y * r
    positions[i * 3 + 2] = u.z * r
  }

  return positions
}

export interface MissilePathRuntime {
  route: MissileRoute
  positions: Float32Array
  arc: import('three').Line
  glow: import('three').Line
  warhead: import('three').Mesh
  launchMarker: import('three').Mesh
  impactMarker: import('three').Mesh
  segmentCount: number
}

function orientRingToSurface(
  ring: import('three').Mesh,
  lat: number,
  lon: number,
  radius: number,
) {
  const pos = cobeLatLonTo3D(lat, lon, radius)
  ring.position.set(pos.x, pos.y, pos.z)
  ring.lookAt(0, 0, 0)
}

export function createMissilePaths(
  THREE: typeof import('three'),
  radius: number,
  routes: MissileRoute[] = HERO_MISSILE_ROUTES,
): MissilePathRuntime[] {
  return routes.map((route) => {
    const arcRadius = radius * 1.01
    const positions = buildBallisticArcPoints(
      route.from[0],
      route.from[1],
      route.to[0],
      route.to[1],
      arcRadius,
      route.apogee,
    )
    const segmentCount = positions.length / 3 - 1

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))

    const glow = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        color: COMMS_THREE,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )

    const arc = new THREE.Line(
      geo.clone(),
      new THREE.LineBasicMaterial({
        color: COMMS_THREE_LIGHT,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      }),
    )

    const warhead = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 8, 8),
      new THREE.MeshBasicMaterial({
        color: COMMS_THREE_LIGHT,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )

    const launchMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.034, 0.046, 24),
      new THREE.MeshBasicMaterial({
        color: COMMS_THREE_LIGHT,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    )

    const impactMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.042, 0.058, 24),
      new THREE.MeshBasicMaterial({
        color: COMMS_THREE_LIGHT,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    )

    orientRingToSurface(launchMarker, route.from[0], route.from[1], radius * 1.014)
    orientRingToSurface(impactMarker, route.to[0], route.to[1], radius * 1.014)

    return {
      route,
      positions,
      arc,
      glow,
      warhead,
      launchMarker,
      impactMarker,
      segmentCount,
    }
  })
}

export function updateMissilePath(path: MissilePathRuntime, timeSec: number) {
  const { route, positions, segmentCount, warhead, launchMarker, impactMarker } = path
  const progress = (timeSec * route.speed + route.phase) % 1
  const idx = progress * segmentCount
  const i0 = Math.floor(idx)
  const i1 = Math.min(segmentCount, i0 + 1)
  const u = idx - i0

  warhead.position.set(
    lerp(positions[i0 * 3], positions[i1 * 3], u),
    lerp(positions[i0 * 3 + 1], positions[i1 * 3 + 1], u),
    lerp(positions[i0 * 3 + 2], positions[i1 * 3 + 2], u),
  )

  const launching = progress < 0.06
  const impacting = progress > 0.9
  launchMarker.scale.setScalar(launching ? 1.2 + Math.sin(timeSec * 28) * 0.12 : 1)
  impactMarker.scale.setScalar(impacting ? 1.15 + Math.sin(timeSec * 32) * 0.18 : 1)

  const arcMat = path.arc.material as import('three').LineBasicMaterial
  arcMat.opacity = 0.34 + Math.sin(timeSec * 1.4 + route.phase * 6) * 0.08
}

export function disposeMissilePaths(paths: MissilePathRuntime[]) {
  paths.forEach((path) => {
    path.arc.geometry.dispose()
    path.glow.geometry.dispose()
    ;(path.arc.material as import('three').Material).dispose()
    ;(path.glow.material as import('three').Material).dispose()
    ;(path.warhead.material as import('three').Material).dispose()
    path.warhead.geometry.dispose()
    ;(path.launchMarker.material as import('three').Material).dispose()
    path.launchMarker.geometry.dispose()
    ;(path.impactMarker.material as import('three').Material).dispose()
    path.impactMarker.geometry.dispose()
  })
}
