<script setup lang="ts">
const cursorEl = ref<HTMLElement>()
const dotEl = ref<HTMLElement>()
const ringEl = ref<HTMLElement>()
const labelEl = ref<HTMLElement>()

onMounted(async () => {
  if (!import.meta.client) return
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return

  const { gsap } = await import('gsap')

  let mouseX = 0
  let mouseY = 0
  let ringX = 0
  let ringY = 0

  const onMove = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY
    gsap.set(dotEl.value, { x: mouseX, y: mouseY })
  }

  const tick = () => {
    ringX += (mouseX - ringX) * 0.12
    ringY += (mouseY - ringY) * 0.12
    gsap.set(ringEl.value, { x: ringX, y: ringY })
  }

  gsap.ticker.add(tick)
  window.addEventListener('mousemove', onMove)

  const setHover = () => {
    gsap.to(ringEl.value, { scale: 1.8, borderColor: '#D4AF53', duration: 0.3 })
    gsap.to(dotEl.value, { scale: 0, duration: 0.2 })
  }

  const setView = () => {
    if (labelEl.value) labelEl.value.textContent = 'VIEW'
    gsap.to(ringEl.value, {
      scale: 2.5,
      borderColor: '#D4AF53',
      backgroundColor: 'rgba(212,175,83,0.1)',
      duration: 0.3,
    })
    gsap.to(dotEl.value, { scale: 0, duration: 0.2 })
    gsap.to(labelEl.value, { opacity: 1, duration: 0.2 })
  }

  const resetCursor = () => {
    gsap.to(ringEl.value, {
      scale: 1,
      borderColor: 'rgba(242,238,232,0.4)',
      backgroundColor: 'transparent',
      duration: 0.3,
    })
    gsap.to(dotEl.value, { scale: 1, duration: 0.2 })
    gsap.to(labelEl.value, { opacity: 0, duration: 0.1 })
  }

  function bindEl(el: Element) {
    if (el.hasAttribute('data-cursor-bound')) return
    el.setAttribute('data-cursor-bound', '')

    el.addEventListener('mouseenter', () => {
      const type = (el as HTMLElement).dataset.cursor
      if (type === 'view') setView()
      else setHover()
    })
    el.addEventListener('mouseleave', resetCursor)
  }

  document.querySelectorAll('a, button, [data-cursor]').forEach(bindEl)

  const observer = new MutationObserver(() => {
    document.querySelectorAll('a, button, [data-cursor]').forEach(bindEl)
  })
  observer.observe(document.body, { childList: true, subtree: true })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove)
    gsap.ticker.remove(tick)
    observer.disconnect()
  })
})
</script>

<template>
  <ClientOnly>
    <div ref="cursorEl" class="cursor">
      <div ref="dotEl" class="cursor__dot" />
      <div ref="ringEl" class="cursor__ring">
        <span ref="labelEl" class="cursor__label" />
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.cursor {
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  z-index: $z-cursor;

  @media (hover: none) {
    display: none;
  }
}

.cursor__dot {
  position: fixed;
  top: -3px;
  left: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $color-gold;
  transform-origin: center;
  will-change: transform;
}

.cursor__ring {
  position: fixed;
  top: -18px;
  left: -18px;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(242, 238, 232, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  will-change: transform;
}

.cursor__label {
  font-family: $font-mono;
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: $color-gold;
  opacity: 0;
  white-space: nowrap;
}
</style>
