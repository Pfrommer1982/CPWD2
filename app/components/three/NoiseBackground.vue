<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { enableHeavyFx } = useGraphicsCapability()
let animationId = 0

onMounted(() => {
  if (!import.meta.client || !enableHeavyFx.value) return

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
    <div v-if="!enableHeavyFx" class="noise-bg noise-bg--static" aria-hidden="true" />
    <canvas v-else ref="canvasRef" class="noise-bg" />
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

  &--static {
    background:
      radial-gradient(ellipse 70% 50% at 50% 40%, rgba(56, 150, 90, 0.05), transparent 70%),
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.015) 0,
        rgba(255, 255, 255, 0.015) 1px,
        transparent 1px,
        transparent 3px
      );
    opacity: 0.35;
  }
}
</style>
