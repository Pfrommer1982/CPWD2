<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { fx, glitchShift, start: startGlitch, stop: stopGlitch } = useCommsScreenGlitch()

const GRAIN_SIZE = 192
const INTENSITY = 0.55

let raf = 0
let frame = 0
let imageData: ImageData | null = null
let ctx: CanvasRenderingContext2D | null = null
const reducedMotion = ref(false)

const glitchStyle = computed(() => ({
  '--glitch-x': `${glitchShift.value.x}px`,
  '--glitch-y': `${glitchShift.value.y}px`,
}))

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return false

  canvas.width = GRAIN_SIZE
  canvas.height = GRAIN_SIZE
  ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return false

  imageData = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE)
  return true
}

function paintGrain(snowBoost = 0) {
  if (!ctx || !imageData) return

  const boost = 1 + snowBoost
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const n = Math.random()
    const speck = n > 0.93 ? 1 : n * n
    data[i] = speck * 18 * INTENSITY * boost
    data[i + 1] = (70 + speck * 185) * INTENSITY * boost
    data[i + 2] = speck * 42 * INTENSITY * boost
    data[i + 3] = (14 + speck * 38) * INTENSITY * boost
  }

  ctx.putImageData(imageData, 0, 0)
}

function tick() {
  frame++
  if (!reducedMotion.value && frame % 2 === 0) {
    paintGrain(fx.snow ? 0.65 : 0)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (initCanvas()) {
    paintGrain()
    if (!reducedMotion.value) {
      raf = requestAnimationFrame(tick)
      startGlitch()
    }
  }
})

onUnmounted(() => {
  stopGlitch()
  cancelAnimationFrame(raf)
  raf = 0
  ctx = null
  imageData = null
})
</script>

<template>
  <div
    class="comms-screen"
    aria-hidden="true"
    :class="{
      'comms-screen--tear': fx.tear,
      'comms-screen--tracking': fx.tracking,
      'comms-screen--chroma': fx.chroma,
      'comms-screen--dropout': fx.dropout,
      'comms-screen--snow': fx.snow,
      'comms-screen--radar': fx.radar,
    }"
    :style="glitchStyle"
  >
    <div
      class="comms-screen__pulse"
      :class="{ 'comms-screen__pulse--static': reducedMotion }"
    >
      <canvas ref="canvasRef" class="comms-screen__grain" />
      <div class="comms-screen__scanlines" />
      <div class="comms-screen__mask" />
      <div class="comms-screen__phosphor" />
    </div>

    <div class="comms-screen__glitch-bars" />
    <div class="comms-screen__glitch-chroma" />
    <div class="comms-screen__glitch-radar" />
    <div class="comms-screen__vignette" />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

.comms-screen {
  position: fixed;
  inset: 0;
  z-index: $z-comms-screen;
  pointer-events: none;
  overflow: hidden;
  isolation: isolate;

  &__pulse {
    position: absolute;
    inset: 0;
    animation: comms-screen-pulse 8.5s ease-in-out infinite;

    &--static {
      animation: none;
    }
  }

  &__grain {
    position: absolute;
    inset: -50%;
    width: 200%;
    height: 200%;
    opacity: 0.061;
    mix-blend-mode: soft-light;
    image-rendering: pixelated;
    transform: translateZ(0);
  }

  &__scanlines {
    position: absolute;
    inset: 0;
    opacity: 0.154;
    background: repeating-linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 1px,
      rgba(0, 0, 0, 0.154) 2px,
      rgba(0, 0, 0, 0) 3px
    );
    background-size: 100% 3px;
  }

  &__mask {
    position: absolute;
    inset: 0;
    opacity: 0.033;
    background: repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 2px,
      rgba(0, 0, 0, 0.077) 3px,
      rgba(0, 0, 0, 0) 4px
    );
    background-size: 4px 100%;
  }

  &__phosphor {
    position: absolute;
    inset: 0;
    opacity: 0.039;
    background:
      radial-gradient(ellipse 120% 90% at 50% 45%, rgba(56, 150, 90, 0.121), transparent 62%),
      linear-gradient(180deg, rgba(56, 150, 90, 0.028), rgba(8, 20, 12, 0.066));
    mix-blend-mode: screen;
  }

  &__glitch-bars,
  &__glitch-chroma,
  &__glitch-radar {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
  }

  &__glitch-bars {
    background: repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 18px,
      rgba(0, 0, 0, 0.55) 19px,
      rgba(56, 150, 90, 0.12) 20px,
      transparent 21px
    );
    mix-blend-mode: overlay;
  }

  &__glitch-chroma {
    background: linear-gradient(
      90deg,
      rgba(56, 150, 90, 0.14) 0,
      transparent 32%,
      transparent 68%,
      rgba(80, 168, 114, 0.08) 100%
    );
    mix-blend-mode: screen;
  }

  &__glitch-radar {
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(56, 150, 90, 0.22) 48%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(56, 150, 90, 0.18) 52%,
      transparent 100%
    );
    background-size: 100% 220%;
    background-position: 0 -120%;
    mix-blend-mode: screen;
  }

  &__vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 78% 74% at 50% 48%,
      transparent 42%,
      rgba(0, 0, 0, 0.152) 100%
    );
  }

  &--tear {
    .comms-screen__pulse {
      transform: translate3d(var(--glitch-x), var(--glitch-y), 0);
      animation: comms-glitch-tear 0.1s steps(2) 4;
    }
  }

  &--tracking {
    .comms-screen__pulse {
      transform: skewX(-0.6deg) translate3d(var(--glitch-x), var(--glitch-y), 0);
      animation: comms-glitch-tracking 0.14s steps(3) 3;
    }
  }

  &--chroma .comms-screen__glitch-chroma {
    opacity: 1;
    animation: comms-glitch-chroma 0.12s steps(2) 5;
  }

  &--dropout .comms-screen__glitch-bars {
    opacity: 1;
    animation: comms-glitch-dropout 0.08s steps(2) 3;
  }

  &--snow .comms-screen__grain {
    opacity: 0.11;
  }

  &--radar .comms-screen__glitch-radar {
    opacity: 1;
    animation: comms-glitch-radar 0.45s linear 1;
  }
}

@keyframes comms-screen-pulse {
  0%, 100% { opacity: 0.78; }
  50% { opacity: 1; }
}

@keyframes comms-glitch-tear {
  0% { transform: translate3d(calc(var(--glitch-x) * -1.5), 0, 0); }
  50% { transform: translate3d(var(--glitch-x), calc(var(--glitch-y) * 0.5), 0); }
  100% { transform: translate3d(calc(var(--glitch-x) * 0.5), var(--glitch-y), 0); }
}

@keyframes comms-glitch-tracking {
  0%, 100% { transform: skewX(0deg) translate3d(0, 0, 0); }
  33% { transform: skewX(-1.2deg) translate3d(var(--glitch-x), 2px, 0); }
  66% { transform: skewX(0.8deg) translate3d(calc(var(--glitch-x) * -0.5), -3px, 0); }
}

@keyframes comms-glitch-chroma {
  0%, 100% { transform: translateX(0); filter: none; }
  25% { transform: translateX(-4px); filter: hue-rotate(8deg); }
  75% { transform: translateX(5px); filter: hue-rotate(-6deg); }
}

@keyframes comms-glitch-dropout {
  0%, 100% { opacity: 0; }
  40% { opacity: 0.85; }
}

@keyframes comms-glitch-radar {
  from { background-position: 0 -120%; }
  to { background-position: 0 220%; }
}

@media (prefers-reduced-motion: reduce) {
  .comms-screen__pulse {
    animation: none;
  }

  .comms-screen--tear .comms-screen__pulse,
  .comms-screen--tracking .comms-screen__pulse,
  .comms-screen--chroma .comms-screen__glitch-chroma,
  .comms-screen--dropout .comms-screen__glitch-bars,
  .comms-screen--radar .comms-screen__glitch-radar {
    animation: none;
  }
}
</style>
