<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId = 0

onMounted(() => {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  function resize() {
    canvas!.width = canvas!.clientWidth
    canvas!.height = canvas!.clientHeight
  }

  resize()
  window.addEventListener('resize', resize)

  let time = 0

  function noise(x: number, y: number) {
    return Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time * 0.5)
  }

  function draw() {
    time += 0.005
    ctx!.fillStyle = '#0A0A0A'
    ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

    const imageData = ctx!.createImageData(canvas!.width, canvas!.height)
    const data = imageData.data

    for (let y = 0; y < canvas!.height; y += 2) {
      for (let x = 0; x < canvas!.width; x += 2) {
        const n = (noise(x, y) + 1) * 0.5
        const v = Math.floor(n * 12)
        const i = (y * canvas!.width + x) * 4
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }
    }

    ctx!.putImageData(imageData, 0, 0)
    animationId = requestAnimationFrame(draw)
  }

  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<template>
  <ClientOnly>
    <canvas ref="canvasRef" class="noise-bg" />
  </ClientOnly>
</template>

<style lang="scss" scoped>
.noise-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: $z-canvas;
  pointer-events: none;
  opacity: 0.4;
}
</style>
