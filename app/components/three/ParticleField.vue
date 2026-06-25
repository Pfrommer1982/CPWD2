<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { init } = useThree(canvasRef)

onMounted(() => {
  init({ particleCount: 2000 })
})
</script>

<template>
  <ClientOnly>
    <canvas ref="canvasRef" class="particle-field" />
  </ClientOnly>
</template>

<style lang="scss" scoped>
.particle-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: $z-canvas;
  pointer-events: none;
}
</style>
