<script setup lang="ts">
const barRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!import.meta.client) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap || !barRef.value) return

  gsap.to(barRef.value, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: (self: { progress: number }) => {
        if (barRef.value) {
          barRef.value.style.transform = `scaleX(${self.progress})`
        }
      },
    },
  })
})
</script>

<template>
  <div class="scroll-progress">
    <div ref="barRef" class="scroll-progress__bar" />
  </div>
</template>

<style lang="scss" scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: $z-nav + 1;
  background: rgba($color-text, 0.05);

  &__bar {
    height: 100%;
    width: 100%;
    background: $color-gold;
    transform: scaleX(0);
    transform-origin: left center;
  }
}
</style>
