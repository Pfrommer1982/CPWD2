<script setup lang="ts">
import { localeList, resolveLocaleMessage } from '~/utils/i18n'

const privacy = useSectionTranslations('privacy')

const panelRef = ref<HTMLElement | null>(null)
const inView = ref(false)
const phase = ref(0)
const displayText = ref('')
const streamLines = ref<string[]>([])

const GLYPHS = '0123456789ABCDEF'
const PLAIN = computed(() => privacy.t('encrypt.plain'))
const STATUS = computed(() => privacy.t('encrypt.status'))

const tags = computed(() => {
  const raw = privacy.tm('encrypt.tags')
  return localeList<string>(raw).map(item => resolveLocaleMessage(item, privacy.rt))
})

let raf = 0
let observer: IntersectionObserver | null = null
const { enableHeavyFx } = useGraphicsCapability()

function hexLine(len = 28) {
  return Array.from({ length: len }, () => GLYPHS[Math.floor(Math.random() * 16)]).join('')
}

function scrambleText(target: string, progress: number) {
  return target.split('').map((char, i) => {
    if (char === ' ') return ' '
    if (i / target.length < progress) return char
    return GLYPHS[Math.floor(Math.random() * 16)]
  }).join('')
}

function tick(time: number) {
  raf = requestAnimationFrame(tick)
  if (!inView.value) return

  const t = time * 0.001
  phase.value = (Math.sin(t * 0.85) + 1) * 0.5

  if (!enableHeavyFx.value) {
    displayText.value = PLAIN.value
    return
  }

  const cycle = (t * 0.35) % 1
  if (cycle < 0.35) {
    displayText.value = PLAIN.value
  } else if (cycle < 0.65) {
    const p = (cycle - 0.35) / 0.3
    displayText.value = scrambleText(PLAIN.value, p)
  } else {
    displayText.value = `0x${hexLine(12)}…`
  }

  if (Math.floor(t * 8) % 2 === 0) {
    streamLines.value = [
      hexLine(32),
      hexLine(32),
      hexLine(32),
      hexLine(32),
      hexLine(32),
    ]
  }
}

function start() {
  streamLines.value = Array.from({ length: 5 }, () => hexLine(32))
  displayText.value = PLAIN.value
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(raf)
  raf = 0
}

onMounted(() => {
  displayText.value = PLAIN.value
  streamLines.value = Array.from({ length: 5 }, () => hexLine(32))

  const el = panelRef.value
  if (!el) return

  if (!enableHeavyFx.value) return

  observer = new IntersectionObserver(
    ([entry]) => {
      inView.value = entry?.isIntersecting ?? false
      if (inView.value) start()
      else stop()
    },
    { threshold: 0.2 },
  )
  observer.observe(el)
})

onUnmounted(() => {
  stop()
  observer?.disconnect()
})

watch(PLAIN, () => {
  if (inView.value) displayText.value = PLAIN.value
})
</script>

<template>
  <div ref="panelRef" class="encrypt-panel" aria-hidden="true">
    <div class="encrypt-panel__frame">
      <span class="encrypt-panel__corner encrypt-panel__corner--tl" />
      <span class="encrypt-panel__corner encrypt-panel__corner--tr" />
      <span class="encrypt-panel__corner encrypt-panel__corner--bl" />
      <span class="encrypt-panel__corner encrypt-panel__corner--br" />
    </div>

    <header class="encrypt-panel__head font-mono">
      <span>{{ privacy.t('encrypt.label') }}</span>
      <span class="encrypt-panel__lock" :style="{ opacity: 0.45 + phase * 0.55 }">
        <span class="encrypt-panel__lock-shackle" />
        <span class="encrypt-panel__lock-body" />
      </span>
    </header>

    <div class="encrypt-panel__stream font-mono">
      <span
        v-for="(line, i) in streamLines"
        :key="`hex-${i}`"
        class="encrypt-panel__hex"
      >
        {{ line }}
      </span>
    </div>

    <div class="encrypt-panel__cipher">
      <span class="encrypt-panel__cipher-label font-mono">INPUT</span>
      <p class="encrypt-panel__cipher-text font-mono">{{ displayText }}</p>
      <span class="encrypt-panel__cipher-label font-mono">OUTPUT</span>
      <p class="encrypt-panel__cipher-status font-mono">{{ STATUS }}</p>
      <div class="encrypt-panel__scanline" :style="{ top: `${phase * 100}%` }" />
    </div>

    <div class="encrypt-panel__tags">
      <span
        v-for="tag in tags"
        :key="tag"
        class="encrypt-panel__tag font-mono"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.encrypt-panel {
  position: relative;
  padding: clamp(16px, 2.5vw, 22px);
  border: 1px solid rgba($color-gold, 0.2);
  border-radius: $radius-md;
  background:
    linear-gradient(160deg, rgba(8, 14, 11, 0.95), rgba(5, 8, 7, 0.98)),
    radial-gradient(circle at 80% 0%, rgba(56, 150, 90, 0.1), transparent 55%);
  overflow: hidden;
  min-height: clamp(220px, 28vh, 280px);

  &__frame {
    position: absolute;
    inset: 10px;
    pointer-events: none;
  }

  &__corner {
    position: absolute;
    width: 14px;
    height: 14px;
    border-color: rgba(56, 150, 90, 0.45);
    border-style: solid;
    border-width: 0;

    &--tl { top: 0; left: 0; border-top-width: 1px; border-left-width: 1px; }
    &--tr { top: 0; right: 0; border-top-width: 1px; border-right-width: 1px; }
    &--bl { bottom: 0; left: 0; border-bottom-width: 1px; border-left-width: 1px; }
    &--br { bottom: 0; right: 0; border-bottom-width: 1px; border-right-width: 1px; }
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.62rem;
    letter-spacing: $tracking-wider;
    color: rgba($color-gold, 0.55);
    text-transform: uppercase;
    margin-bottom: $space-3;
  }

  &__lock {
    position: relative;
    width: 14px;
    height: 16px;
    transition: opacity 0.2s ease;
  }

  &__lock-shackle {
    position: absolute;
    top: 0;
    left: 2px;
    width: 10px;
    height: 8px;
    border: 1.5px solid rgba($color-gold-light, 0.75);
    border-bottom: 0;
    border-radius: 6px 6px 0 0;
  }

  &__lock-body {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 14px;
    height: 10px;
    border-radius: 2px;
    background: rgba($color-gold, 0.55);
    box-shadow: 0 0 10px rgba(56, 150, 90, 0.35);
  }

  &__stream {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: $space-3;
    opacity: 0.35;
    mask-image: linear-gradient(to bottom, #000 30%, transparent 100%);
  }

  &__hex {
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    color: rgba(56, 150, 90, 0.75);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__cipher {
    position: relative;
    padding: $space-3;
    border: 1px solid rgba($color-gold, 0.12);
    border-radius: $radius-sm;
    background: rgba(0, 0, 0, 0.25);
    overflow: hidden;
    margin-bottom: $space-3;
  }

  &__cipher-label {
    display: block;
    font-size: 0.55rem;
    letter-spacing: $tracking-wider;
    color: rgba($color-text-faint, 0.85);
    margin-bottom: 4px;
  }

  &__cipher-text {
    margin: 0 0 $space-3;
    font-size: clamp(0.72rem, 1.2vw, 0.82rem);
    letter-spacing: 0.04em;
    color: rgba($color-text-muted, 0.95);
    min-height: 1.4em;
  }

  &__cipher-status {
    margin: 0;
    font-size: clamp(0.68rem, 1.1vw, 0.78rem);
    letter-spacing: $tracking-wider;
    color: rgba($color-gold-light, 0.9);
    text-transform: uppercase;
  }

  &__scanline {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba($color-gold-light, 0.55), transparent);
    pointer-events: none;
    opacity: 0.7;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }

  &__tag {
    padding: 4px 8px;
    border: 1px solid rgba($color-gold, 0.18);
    border-radius: $radius-full;
    font-size: 0.55rem;
    letter-spacing: $tracking-wider;
    color: rgba($color-gold, 0.65);
    text-transform: uppercase;
  }
}
</style>
