<script setup lang="ts">
const { cursorState, cursorVisible } = useCursor()
const dotRef = ref<HTMLElement | null>(null)
const ringRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)

const isTouch = ref(true)

onMounted(async () => {
  isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouch.value) return

  document.body.classList.add('has-custom-cursor')

  const gsap = (await import('gsap')).gsap
  let mouseX = 0
  let mouseY = 0

  const onMove = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY

    if (dotRef.value) {
      gsap.to(dotRef.value, { x: mouseX, y: mouseY, duration: 0.1, ease: 'power2.out' })
    }
    if (ringRef.value) {
      gsap.to(ringRef.value, { x: mouseX, y: mouseY, duration: 0.35, ease: 'power2.out' })
    }
    if (labelRef.value) {
      gsap.to(labelRef.value, { x: mouseX, y: mouseY, duration: 0.25, ease: 'power2.out' })
    }
  }

  window.addEventListener('mousemove', onMove)

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove)
    document.body.classList.remove('has-custom-cursor')
  })
})
</script>

<template>
  <div
    v-if="!isTouch"
    class="app-cursor"
    :class="[`app-cursor--${cursorState}`, { 'app-cursor--visible': cursorVisible }]"
  >
    <div ref="dotRef" class="app-cursor__dot" />
    <div ref="ringRef" class="app-cursor__ring" />
    <div ref="labelRef" class="app-cursor__label">
      VIEW →
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-cursor {
  &__dot,
  &__ring,
  &__label {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: $z-cursor;
    transform: translate(-50%, -50%);
    will-change: transform;
  }

  &__dot {
    width: 6px;
    height: 6px;
    background: $color-text;
    border-radius: 50%;
  }

  &__ring {
    width: 40px;
    height: 40px;
    border: 1px solid rgba($color-text, 0.5);
    border-radius: 50%;
    transition: width $duration-med $ease-out-expo,
      height $duration-med $ease-out-expo,
      background $duration-med $ease-out-expo,
      border-color $duration-med $ease-out-expo,
      opacity $duration-med $ease-out-expo;
  }

  &__label {
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: 0.15em;
    opacity: 0;
    transition: opacity $duration-fast $ease-out-expo;
  }

  &--hover {
    .app-cursor__ring {
      width: 56px;
      height: 56px;
      background: rgba($color-accent, 0.15);
      border-color: $color-accent;
    }
  }

  &--view {
    .app-cursor__ring {
      opacity: 0;
    }

    .app-cursor__label {
      opacity: 1;
    }
  }

  &--drag {
    .app-cursor__ring {
      width: 32px;
      height: 32px;
      border-style: dashed;
    }
  }
}
</style>
