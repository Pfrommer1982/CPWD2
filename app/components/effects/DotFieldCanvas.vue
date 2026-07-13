<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'wave' | 'tunnel' | 'flow'
  density?: number
  intensity?: number
  interactive?: boolean
}>(), {
  variant: 'flow',
  density: 1,
  intensity: 1,
  interactive: false,
})

const canvasRef = ref<HTMLCanvasElement>()
const wrapperRef = ref<HTMLElement>()
const { enableHeavyFx } = useGraphicsCapability()

let frameId = 0
let time = 0
let pointer = { x: 0.5, y: 0.5 }
let targetPointer = { x: 0.5, y: 0.5 }
let resizeHandler: (() => void) | null = null
let pointerHandler: ((e: PointerEvent) => void) | null = null

function draw(ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const spacing = 26 / props.density
  const cols = Math.ceil(width / spacing) + 3
  const rows = Math.ceil(height / spacing) + 3
  const cx = width * (0.5 + (pointer.x - 0.5) * 0.08)
  const cy = height * (0.5 + (pointer.y - 0.5) * 0.08)
  const intensity = props.intensity

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const baseX = col * spacing - spacing
      const baseY = row * spacing - spacing

      let offsetX = 0
      let offsetY = 0
      let size = 1.2
      let alpha = 0.12

      const dx = baseX - cx
      const dy = baseY - cy
      const dist = Math.hypot(dx, dy)

      if (props.variant === 'wave') {
        const wave = Math.sin(baseX * 0.012 + time * 1.1) * Math.cos(baseY * 0.01 + time * 0.85)
        offsetY = wave * 10 * intensity
        size = 1.4 + (wave * 0.5 + 0.5) * 2.2
        alpha = 0.1 + (wave * 0.5 + 0.5) * 0.45
      } else if (props.variant === 'tunnel') {
        const ring = Math.sin(dist * 0.028 - time * 1.4)
        const ringNorm = ring * 0.5 + 0.5
        const pulse = Math.sin(Math.atan2(dy, dx) * 4 + time * 0.6) * 0.5 + 0.5
        size = 0.9 + ringNorm * 2.4 * pulse * intensity
        alpha = 0.08 + ringNorm * 0.5 * pulse
        offsetX = (dx / (dist || 1)) * ring * 3 * intensity
        offsetY = (dy / (dist || 1)) * ring * 3 * intensity
      } else {
        const flow = Math.sin(baseX * 0.01 + baseY * 0.008 + time * 0.9)
        const radial = Math.sin(dist * 0.022 - time * 1.1)
        const blendNorm = (flow * 0.55 + radial * 0.45) * 0.5 + 0.5
        offsetX = Math.cos(baseY * 0.015 + time) * (blendNorm - 0.5) * 12 * intensity
        offsetY = Math.sin(baseX * 0.015 + time * 0.8) * (blendNorm - 0.5) * 12 * intensity
        size = 1.1 + blendNorm * 2
        alpha = 0.1 + blendNorm * 0.42
      }

      size = Math.max(0.6, size)
      alpha = Math.max(0, Math.min(1, alpha))
      if (alpha < 0.03) continue

      const isGold = (col + row) % 11 === 0 && alpha > 0.22
      const x = baseX + offsetX
      const y = baseY + offsetY

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = isGold
        ? `rgba(56, 150, 90, ${alpha * 1.15})`
        : `rgba(235, 230, 220, ${alpha})`
      ctx.fill()
    }
  }
}

function onPointerMove(e: PointerEvent) {
  if (!props.interactive || !wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  targetPointer.x = (e.clientX - rect.left) / rect.width
  targetPointer.y = (e.clientY - rect.top) / rect.height
}

onMounted(() => {
  if (!import.meta.client || !canvasRef.value) return
  if (!enableHeavyFx.value) return

  const staticFx = !enableHeavyFx.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = 0
  let height = 0
  let dpr = 1

  const resize = () => {
    if (!wrapperRef.value) return
    dpr = Math.min(window.devicePixelRatio, 2)
    width = wrapperRef.value.clientWidth
    height = wrapperRef.value.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    if (staticFx) draw(ctx, width, height, dpr)
  }

  resize()
  resizeHandler = resize
  window.addEventListener('resize', resize)

  if (props.interactive) {
    pointerHandler = onPointerMove
    window.addEventListener('pointermove', onPointerMove)
  }

  const tick = () => {
    if (staticFx) return

    time += 0.016
    pointer.x += (targetPointer.x - pointer.x) * 0.04
    pointer.y += (targetPointer.y - pointer.y) * 0.04
    draw(ctx, width, height, dpr)
    frameId = requestAnimationFrame(tick)
  }

  if (!staticFx) tick()
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (pointerHandler) window.removeEventListener('pointermove', pointerHandler)
})
</script>

<template>
  <div ref="wrapperRef" class="dot-field" aria-hidden="true">
    <div v-if="!enableHeavyFx" class="graphics-fallback-dots" />
    <canvas v-else ref="canvasRef" class="dot-field__canvas" />
  </div>
</template>

<style lang="scss" scoped>
.dot-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
