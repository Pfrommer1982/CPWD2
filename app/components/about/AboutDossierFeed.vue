<script setup lang="ts">
const props = defineProps<{
  avatar: string
  connecting: string
  downloading: string
  live: string
}>()

type FeedPhase = 'idle' | 'connecting' | 'downloading' | 'live'

const rootRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLElement | null>(null)
const grainCanvasRef = ref<HTMLCanvasElement | null>(null)
const phase = ref<FeedPhase>('idle')
const downloadProgress = ref(0)
const signalBars = ref(0)
const connectTick = ref(0)

const { fx, triggerBurst, start: startGlitch, stop: stopGlitch, wait } = useVideoFeedGlitch()

let observer: IntersectionObserver | null = null
let connectTimer: ReturnType<typeof setInterval> | null = null
let visibilityFrame = 0
let sequenceToken = 0
const isIntersecting = ref(false)

let grainRaf = 0
let grainRunning = false
let grainLastTime = 0
let grainCtx: CanvasRenderingContext2D | null = null
let grainW = 0
let grainH = 0
let grainResizeObserver: ResizeObserver | null = null
const lowPowerMode = ref(false)
const { enableHeavyFx } = useGraphicsCapability()

const GRAIN_ALPHA = 28
const GRAIN_FPS = 24
const GRAIN_FRAME_MS = 1000 / GRAIN_FPS

function resizeGrainCanvas() {
  const canvas = grainCanvasRef.value
  const container = videoRef.value
  if (!canvas || !container) return

  const w = container.clientWidth
  const h = container.clientHeight
  if (w < 1 || h < 1) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  grainW = Math.floor(w * dpr)
  grainH = Math.floor(h * dpr)
  canvas.width = grainW
  canvas.height = grainH
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  grainCtx = canvas.getContext('2d')
}

function generateFilmGrain() {
  if (!grainCtx || grainW < 1 || grainH < 1) return

  const imageData = grainCtx.createImageData(grainW, grainH)
  const pixels = imageData.data

  for (let i = 0; i < pixels.length; i += 4) {
    const gray = Math.random() * 255 | 0
    pixels[i] = gray
    pixels[i + 1] = gray
    pixels[i + 2] = gray
    pixels[i + 3] = GRAIN_ALPHA
  }

  grainCtx.putImageData(imageData, 0, 0)
}

function grainLoop(currentTime: number) {
  if (!grainRunning) return
  grainRaf = requestAnimationFrame(grainLoop)

  const elapsed = currentTime - grainLastTime
  if (elapsed >= GRAIN_FRAME_MS) {
    grainLastTime = currentTime - (elapsed % GRAIN_FRAME_MS)
    generateFilmGrain()
  }
}

function startFilmGrain() {
  if (!import.meta.client || grainRunning) return
  if (!enableHeavyFx.value) return
  if (lowPowerMode.value) return

  resizeGrainCanvas()
  grainLastTime = 0
  grainRunning = true
  generateFilmGrain()
  grainRaf = requestAnimationFrame(grainLoop)
}

function stopFilmGrain() {
  grainRunning = false
  cancelAnimationFrame(grainRaf)
}

function setupGrainResize() {
  if (!import.meta.client || !videoRef.value) return

  grainResizeObserver?.disconnect()
  grainResizeObserver = new ResizeObserver(() => {
    if (!grainRunning) return
    resizeGrainCanvas()
    generateFilmGrain()
  })
  grainResizeObserver.observe(videoRef.value)
}

watch(phase, (next) => {
  if (next === 'live') {
    nextTick(() => {
      setupGrainResize()
      requestAnimationFrame(() => {
        startFilmGrain()
      })
    })
  }
  else {
    stopFilmGrain()
  }
})

function cumulativeOpacity(el: HTMLElement | null): number {
  if (!import.meta.client || !el) return 0
  let opacity = 1
  let node: HTMLElement | null = el
  while (node) {
    const value = Number.parseFloat(getComputedStyle(node).opacity)
    if (!Number.isNaN(value)) opacity *= value
    node = node.parentElement
  }
  return opacity
}

function isVisibleEnough(): boolean {
  const el = rootRef.value
  if (!import.meta.client || !el) return false

  const rect = el.getBoundingClientRect()
  if (rect.height <= 0) return false

  const viewportHeight = window.innerHeight
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
  const ratio = visibleHeight / rect.height

  return ratio >= 0.28 && cumulativeOpacity(el) >= 0.45
}

function tryStartSequence() {
  if (phase.value !== 'idle') return
  if (!isIntersecting.value || !isVisibleEnough()) return
  runSequence()
}

function scheduleVisibilityCheck() {
  if (!import.meta.client) return
  cancelAnimationFrame(visibilityFrame)
  visibilityFrame = requestAnimationFrame(() => {
    tryStartSequence()
    if (phase.value === 'idle' && isIntersecting.value) {
      scheduleVisibilityCheck()
    }
  })
}

const connectLabel = computed(() => {
  const dots = '.'.repeat((connectTick.value % 3) + 1)
  return `${props.connecting}${dots}`
})

async function animateDownload() {
  const duration = 1600 + Math.random() * 900
  const start = performance.now()

  return new Promise<void>((resolve) => {
    function frame(now: number) {
      const t = Math.min(1, (now - start) / duration)
      downloadProgress.value = Math.round(t * 100)
      if (t >= 1) resolve()
      else requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  })
}

async function runSequence() {
  if (phase.value !== 'idle') return

  const token = ++sequenceToken
  phase.value = 'connecting'
  downloadProgress.value = 0
  signalBars.value = 0

  connectTimer = setInterval(() => {
    connectTick.value += 1
    signalBars.value = Math.min(5, signalBars.value + (Math.random() > 0.4 ? 1 : 0))
  }, 380)

  await wait(1400 + Math.random() * 700)
  if (token !== sequenceToken) return

  if (connectTimer) clearInterval(connectTimer)
  connectTimer = null
  phase.value = 'downloading'
  signalBars.value = 5

  await animateDownload()
  if (token !== sequenceToken) return

  phase.value = 'live'
  if (!lowPowerMode.value) {
    triggerBurst()
    await wait(120)
    triggerBurst()
    startGlitch()
  }
}

function resetSequence() {
  sequenceToken += 1
  if (connectTimer) clearInterval(connectTimer)
  connectTimer = null
  stopGlitch()
  phase.value = 'idle'
  downloadProgress.value = 0
  signalBars.value = 0
}

onMounted(async () => {
  if (!import.meta.client) return
  lowPowerMode.value = !enableHeavyFx.value
  await nextTick()
  if (!rootRef.value) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return
      isIntersecting.value = entry.isIntersecting
      if (entry.isIntersecting) scheduleVisibilityCheck()
      else cancelAnimationFrame(visibilityFrame)
    },
    { threshold: [0, 0.25, 0.5], rootMargin: '0px 0px -5% 0px' },
  )

  observer.observe(rootRef.value)
  scheduleVisibilityCheck()
})

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(visibilityFrame)
  grainResizeObserver?.disconnect()
  stopFilmGrain()
  if (connectTimer) clearInterval(connectTimer)
  resetSequence()
})
</script>

<template>
  <div
    ref="rootRef"
    class="dossier-feed"
    :class="{
      'dossier-feed--connecting': phase === 'connecting',
      'dossier-feed--downloading': phase === 'downloading',
      'dossier-feed--live': phase === 'live',
    }"
  >
    <div
      v-if="phase === 'idle'"
      class="dossier-feed__standby"
      aria-hidden="true"
    >
      <span class="dossier-feed__standby-tag font-mono">UPLINK</span>
      <span class="dossier-feed__standby-line font-mono">Standby</span>
      <div class="dossier-feed__boot-scan" aria-hidden="true" />
    </div>

    <div
      v-if="phase === 'connecting' || phase === 'downloading'"
      class="dossier-feed__boot"
      aria-live="polite"
    >
      <div class="dossier-feed__boot-header font-mono">
        <span class="dossier-feed__boot-tag">UPLINK</span>
        <span class="dossier-feed__boot-signal">
          <span
            v-for="i in 5"
            :key="`bar-${i}`"
            class="dossier-feed__boot-bar"
            :class="{ 'dossier-feed__boot-bar--on': i <= signalBars }"
          />
        </span>
      </div>

      <p class="dossier-feed__boot-status font-mono">
        {{ phase === 'connecting' ? connectLabel : downloading }}
      </p>

      <div v-if="phase === 'downloading'" class="dossier-feed__boot-progress">
        <div class="dossier-feed__boot-track">
          <div
            class="dossier-feed__boot-fill"
            :style="{ width: `${downloadProgress}%` }"
          />
        </div>
        <span class="dossier-feed__boot-pct font-mono">{{ downloadProgress }}%</span>
      </div>

      <div class="dossier-feed__boot-scan" aria-hidden="true" />
    </div>

    <div
      ref="videoRef"
      class="dossier-feed__video"
      :class="{ 'dossier-feed__video--visible': phase === 'live' }"
    >
      <div class="dossier-feed__feed">
        <img
          :src="avatar"
          alt=""
          class="dossier-feed__img"
          :class="{ 'dossier-feed__img--signal': fx.signal }"
          width="400"
          height="400"
        >
        <img
          :src="avatar"
          alt=""
          class="dossier-feed__img dossier-feed__img--ghost"
          :class="{ 'dossier-feed__img--tear': fx.tear }"
          width="400"
          height="400"
          aria-hidden="true"
        >
      </div>

      <div class="dossier-feed__pixels" aria-hidden="true" />
      <div
        class="dossier-feed__noise"
        :class="{ 'dossier-feed__noise--active': fx.snow }"
        aria-hidden="true"
      />
      <div
        class="dossier-feed__static-burst"
        :class="{ 'dossier-feed__static-burst--active': fx.burst }"
        aria-hidden="true"
      />
      <div class="dossier-feed__scan" aria-hidden="true" />
      <canvas ref="grainCanvasRef" class="dossier-feed__grain" aria-hidden="true" />
      <div
        class="dossier-feed__tracking"
        :class="{ 'dossier-feed__tracking--active': fx.tracking }"
        aria-hidden="true"
      />
      <div
        class="dossier-feed__dropout"
        :class="{ 'dossier-feed__dropout--active': fx.dropout }"
        aria-hidden="true"
      />
      <div
        class="dossier-feed__chroma"
        :class="{ 'dossier-feed__chroma--active': fx.chroma }"
        aria-hidden="true"
      />
      <div class="dossier-feed__frame" aria-hidden="true" />

      <span v-if="phase === 'live'" class="dossier-feed__live font-mono">{{ live }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dossier-feed {
  position: relative;
  aspect-ratio: 4 / 5;
  max-width: 420px;
  margin-inline: auto;
  background: $color-surface;
  border: 1px solid $color-border;
  overflow: hidden;

  &__standby {
    position: absolute;
    inset: 0;
    z-index: 15;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: $space-4;
    padding: clamp(20px, 5vw, 32px);
    background: rgba($color-bg, 0.94);
  }

  &__standby-tag {
    font-size: 9px;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-gold;
  }

  &__standby-line {
    font-size: clamp(0.68rem, 1.1vw, 0.78rem);
    letter-spacing: $tracking-wide;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  &__boot {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(20px, 5vw, 32px);
    background: rgba($color-bg, 0.96);
    gap: $space-5;
  }

  &__boot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9px;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  &__boot-tag {
    color: $color-gold;
  }

  &__boot-signal {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 14px;
  }

  &__boot-bar {
    width: 3px;
    height: 4px;
    background: rgba($color-gold, 0.15);
    transition: height $dur-fast $ease-gold, background-color $dur-fast $ease-gold;

    &--on {
      background: $color-gold;
      height: calc(4px + var(--i, 1) * 2px);
    }

    @for $i from 1 through 5 {
      &:nth-child(#{$i}).dossier-feed__boot-bar--on {
        height: #{4 + $i * 2}px;
      }
    }
  }

  &__boot-status {
    font-size: clamp(0.7rem, 1.2vw, 0.82rem);
    letter-spacing: $tracking-wide;
    text-transform: uppercase;
    color: $color-text-muted;
    min-height: 1.4em;
  }

  &__boot-progress {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__boot-track {
    height: 3px;
    background: rgba($color-gold, 0.12);
    overflow: hidden;
  }

  &__boot-fill {
    height: 100%;
    background: linear-gradient(90deg, $color-gold-dark, $color-gold-light);
    transition: width 0.08s linear;
  }

  &__boot-pct {
    font-size: 10px;
    letter-spacing: $tracking-wider;
    color: $color-gold;
  }

  &__boot-scan {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 2px,
      rgba($color-gold, 0.04) 2px,
      rgba($color-gold, 0.04) 3px
    );
    animation: feed-boot-scan 2.4s linear infinite;
  }

  &__video {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: scale(1.02);
    filter: blur(4px);
    transition:
      opacity 0.55s $ease-out-expo,
      transform 0.55s $ease-out-expo,
      filter 0.55s $ease-out-expo;

    &--visible {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }

  &__feed {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(0.85) contrast(1.08) saturate(0.75);
    opacity: 0.55;

    &--signal {
      animation: vhs-signal-loss 0.11s steps(6) infinite;
    }

    &--ghost {
      position: absolute;
      inset: 0;
      opacity: 0;
      pointer-events: none;
      filter: grayscale(0.6) contrast(1.25) saturate(1.1) blur(0.4px);
    }

    &--tear {
      opacity: 0.75;
      animation: vhs-band-tear 0.13s steps(5) infinite;
    }
  }

  &__pixels {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba($color-gold, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba($color-gold, 0.035) 1px, transparent 1px);
    background-size: 3px 3px;
    mix-blend-mode: overlay;
    pointer-events: none;
    z-index: 2;
  }

  &__noise {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E");
    background-size: 160px 160px;
    mix-blend-mode: soft-light;
    pointer-events: none;
    z-index: 3;
    animation: feed-noise-drift 0.5s steps(3) infinite;

    &--active {
      opacity: 0.42;
      animation: vhs-static-snow 0.07s steps(4) infinite;
    }
  }

  &__static-burst {
    position: absolute;
    inset: -4px;
    opacity: 0;
    pointer-events: none;
    z-index: 8;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E");
    background-size: 220px 220px;
    mix-blend-mode: overlay;

    &--active {
      opacity: 0.62;
      animation: vhs-static-snow 0.05s steps(5) infinite;
    }
  }

  &__scan {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 2px,
      rgba(0, 0, 0, 0.04) 2px,
      rgba(0, 0, 0, 0.04) 3px
    );
    pointer-events: none;
    z-index: 4;
  }

  &__grain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
    display: block;
    object-fit: cover;
  }

  &__tracking {
    position: absolute;
    left: -2%;
    right: -2%;
    height: 6px;
    top: -8%;
    opacity: 0;
    pointer-events: none;
    z-index: 9;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.22),
      rgba($color-gold, 0.12),
      rgba(255, 255, 255, 0.08),
      transparent
    );
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.08);

    &--active {
      opacity: 1;
      animation: vhs-tracking-roll 0.28s linear infinite;
    }
  }

  &__dropout {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    z-index: 10;
    background: rgba($color-text, 0.92);
    mix-blend-mode: soft-light;

    &--active {
      animation: vhs-dropout 0.18s steps(3) infinite;
    }
  }

  &__chroma {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    z-index: 5;
    background:
      linear-gradient(90deg, rgba(255, 40, 40, 0.07) 0, transparent 35%),
      linear-gradient(270deg, rgba(40, 180, 255, 0.06) 0, transparent 35%);
    mix-blend-mode: screen;

    &--active {
      opacity: 1;
      animation: vhs-chroma-smear 0.14s steps(4) infinite;
    }
  }

  &__frame {
    position: absolute;
    inset: 12px;
    border: 1px solid rgba($color-gold, 0.2);
    pointer-events: none;
    z-index: 11;
  }

  &__live {
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 12;
    font-size: 8px;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-gold;
    background: rgba($color-bg, 0.72);
    padding: 4px 8px;
    border: 1px solid rgba($color-gold, 0.25);

    &::before {
      content: '';
      display: inline-block;
      width: 5px;
      height: 5px;
      margin-right: 6px;
      border-radius: 50%;
      background: $color-gold;
      box-shadow: 0 0 8px rgba($color-gold, 0.6);
      animation: feed-live-blink 1.2s ease-in-out infinite;
      vertical-align: middle;
    }
  }
}

@keyframes feed-boot-scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

@keyframes feed-live-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

@keyframes feed-noise-drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-6px, 3px); }
}

@keyframes vhs-signal-loss {
  0% {
    transform: translateX(0) scaleX(1);
    filter: grayscale(0.85) contrast(1.08) saturate(0.75) blur(0);
    clip-path: inset(0 0 0 0);
  }

  18% {
    transform: translateX(-11px) scaleX(1.015);
    filter: grayscale(0.55) contrast(1.45) saturate(0.5) blur(0.8px);
  }

  36% {
    transform: translateX(8px) scaleX(0.99);
    filter: grayscale(0.9) contrast(0.78) saturate(0.6) blur(0.3px);
    clip-path: inset(38% 0 38% 0);
  }

  54% {
    transform: translateX(-5px) scaleX(1.008);
    filter: grayscale(0.7) contrast(1.55) brightness(1.15) blur(1px);
    clip-path: inset(0 0 0 0);
  }

  72% {
    transform: translateX(13px) scaleX(1.02);
    filter: grayscale(0.8) contrast(1.2) blur(0.5px);
    clip-path: inset(62% 0 18% 0);
  }

  100% {
    transform: translateX(0) scaleX(1);
    filter: grayscale(0.85) contrast(1.08) saturate(0.75) blur(0);
    clip-path: inset(0 0 0 0);
  }
}

@keyframes vhs-band-tear {
  0%, 100% {
    clip-path: inset(44% 0 52% 0);
    transform: translateX(0);
  }

  33% {
    clip-path: inset(44% 0 52% 0);
    transform: translateX(16px);
  }

  66% {
    clip-path: inset(18% 0 74% 0);
    transform: translateX(-12px);
  }
}

@keyframes vhs-static-snow {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-12px, 6px); }
  50% { transform: translate(8px, -4px); }
  75% { transform: translate(-6px, 8px); }
  100% { transform: translate(4px, 2px); }
}

@keyframes vhs-tracking-roll {
  0% { top: -8%; }
  100% { top: 108%; }
}

@keyframes vhs-dropout {
  0%, 45%, 100% { opacity: 0; }
  22% { opacity: 0.22; }
  68% { opacity: 0.1; }
}

@keyframes vhs-chroma-smear {
  0%, 100% { transform: translateX(0); opacity: 0.6; }
  50% { transform: translateX(6px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .dossier-feed {
    &__boot-scan,
    &__noise,
    &__live::before {
      animation: none;
    }

    &__video {
      transition: none;
    }

    &__img--signal,
    &__img--tear,
    &__noise--active,
    &__static-burst--active,
    &__tracking--active,
    &__dropout--active,
    &__chroma--active {
      animation: none !important;
    }

    &__img--tear {
      opacity: 0;
    }

    &__noise--active,
    &__static-burst--active,
    &__tracking--active,
    &__dropout--active,
    &__chroma--active {
      opacity: 0;
    }
  }
}
</style>
