import type { Ref } from 'vue'
import { COMMS_THREE } from '~/constants/brand'

interface ThreeContext {
  scene: import('three').Scene
  camera: import('three').PerspectiveCamera
  renderer: import('three').WebGLRenderer
  animationId: number
  dispose: () => void
}

export function useThree(canvasRef: Ref<HTMLCanvasElement | null>) {
  let context: ThreeContext | null = null
  const { canUseWebGL } = useGraphicsCapability()

  async function init(options: {
    particleCount?: number
    onAnimate?: (ctx: ThreeContext, elapsed: number) => void
  } = {}) {
    if (!import.meta.client || !canvasRef.value) return null
    if (!canUseWebGL.value) return null

    const THREE = await import('three')
    const canvas = canvasRef.value
    const { particleCount = 2000, onAnimate } = options

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      velocities[i * 3] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: COMMS_THREE,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const startTime = performance.now()
    let animationId = 0

    const positionAttr = geometry.attributes.position!

    function animate() {
      animationId = requestAnimationFrame(animate)
      const elapsed = (performance.now() - startTime) / 1000
      const pos = positionAttr.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const vx = velocities[i * 3] ?? 0
        const vy = velocities[i * 3 + 1] ?? 0
        const vz = velocities[i * 3 + 2] ?? 0
        pos[i * 3] = (pos[i * 3] ?? 0) + vx + Math.sin(elapsed + i) * 0.0005
        pos[i * 3 + 1] = (pos[i * 3 + 1] ?? 0) + vy + Math.cos(elapsed * 0.5 + i) * 0.0005
        pos[i * 3 + 2] = (pos[i * 3 + 2] ?? 0) + vz

        if (Math.abs(pos[i * 3] ?? 0) > 10) velocities[i * 3] = (velocities[i * 3] ?? 0) * -1
        if (Math.abs(pos[i * 3 + 1] ?? 0) > 10) velocities[i * 3 + 1] = (velocities[i * 3 + 1] ?? 0) * -1
      }

      positionAttr.needsUpdate = true
      particles.rotation.y = elapsed * 0.02

      if (onAnimate && context) {
        onAnimate(context, elapsed)
      }

      renderer.render(scene, camera)
    }

    function handleResize() {
      if (!canvasRef.value) return
      const w = canvasRef.value.clientWidth
      const h = canvasRef.value.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)
    animate()

    const dispose = () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }

    context = { scene, camera, renderer, animationId, dispose }
    return context
  }

  onUnmounted(() => {
    context?.dispose()
    context = null
  })

  return { init, canUseWebGL }
}
