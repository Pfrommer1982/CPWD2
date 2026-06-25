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
      <p class="app-loader__logo font-display">
        CPWD
      </p>
      <p class="app-loader__progress font-mono">
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
    font-size: $text-3xl;
    margin-bottom: $space-xl;
    opacity: 0;
    animation: fade-in 0.6s $ease-out-expo 0.2s forwards;
  }

  &__progress {
    color: $color-text-muted;
  }
}
</style>
