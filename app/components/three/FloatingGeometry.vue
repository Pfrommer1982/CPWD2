<script setup lang="ts">
import { COMMS_THREE } from '~/constants/brand'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { canUseWebGL } = useGraphicsCapability()

onMounted(async () => {
  if (!import.meta.client || !canUseWebGL.value) return

  const canvas = canvasRef.value
  if (!canvas) return

  const THREE = await import('three')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const geometries = [
    new THREE.IcosahedronGeometry(0.6, 0),
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TetrahedronGeometry(0.4, 0),
  ]

  const material = new THREE.MeshBasicMaterial({
    color: COMMS_THREE,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  })

  const meshes = geometries.map((geo, i) => {
    const mesh = new THREE.Mesh(geo, material)
    mesh.position.set((i - 1) * 2, 0, -i * 0.5)
    scene.add(mesh)
    return mesh
  })

  let animationId = 0
  const start = performance.now()

  function animate() {
    animationId = requestAnimationFrame(animate)
    const t = (performance.now() - start) / 1000

    meshes.forEach((mesh, i) => {
      mesh.rotation.x = t * 0.2 * (i + 1)
      mesh.rotation.y = t * 0.15 * (i + 1)
      mesh.position.y = Math.sin(t + i) * 0.3
    })

    renderer.render(scene, camera)
  }

  function handleResize() {
    if (!canvas) return
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  }

  window.addEventListener('resize', handleResize)
  animate()

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)
    geometries.forEach(g => g.dispose())
    material.dispose()
    renderer.dispose()
  })
})
</script>

<template>
  <ClientOnly>
    <div v-if="!canUseWebGL" class="floating-geo floating-geo--static" aria-hidden="true" />
    <canvas v-else ref="canvasRef" class="floating-geo" />
  </ClientOnly>
</template>

<style lang="scss" scoped>
.floating-geo {
  width: 100%;
  height: 100%;
  min-height: 400px;

  &--static {
    min-height: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(56, 150, 90, 0.08), transparent 70%);
  }
}
</style>
