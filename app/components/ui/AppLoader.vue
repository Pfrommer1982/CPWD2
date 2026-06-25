<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()

const progress = ref(0)
const visible = ref(true)
const loaderRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const hasVisited = localStorage.getItem('portfolio-visited')
  if (hasVisited) {
    visible.value = false
    emit('complete')
    return
  }

  const duration = 1500
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    progress.value = Math.min(Math.round((elapsed / duration) * 100), 100)

    if (elapsed < duration) {
      requestAnimationFrame(tick)
    } else {
      dismiss()
    }
  }

  requestAnimationFrame(tick)
})

async function dismiss() {
  localStorage.setItem('portfolio-visited', 'true')

  const gsap = (await import('gsap')).gsap
  if (loaderRef.value) {
    await gsap.to(loaderRef.value, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut',
    })
  }

  visible.value = false
  emit('complete')
}
</script>

<template>
  <div v-if="visible" ref="loaderRef" class="app-loader">
    <div class="app-loader__inner">
      <p class="app-loader__logo">
        CPWD
      </p>
      <div class="app-loader__ring" />
      <p class="app-loader__progress label">
        {{ progress }}%
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-loader {
  position: fixed;
  inset: 0;
  z-index: $z-loader;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;

  &__inner {
    text-align: center;
  }

  &__logo {
    font-family: $font-display;
    font-size: $text-3xl;
    font-weight: 300;
    letter-spacing: $tracking-wide;
    color: $color-gold;
    margin-bottom: $space-8;
    opacity: 0;
    animation: fade-in 0.6s $ease-out-expo 0.2s forwards;
  }

  &__ring {
    width: 48px;
    height: 48px;
    margin: 0 auto $space-6;
    border: 1px solid $color-border;
    border-top-color: $color-gold;
    border-radius: 50%;
    animation: spin-gold 1s linear infinite;
  }

  &__progress {
    color: $color-text-muted;
  }
}
</style>
