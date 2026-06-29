<script setup lang="ts">
const dotEl = ref<HTMLElement>()
const crosshairEl = ref<HTMLElement>()
const svgEl = ref<SVGSVGElement>()
const labelEl = ref<HTMLElement>()

const STROKE_DEFAULT = 'rgba(200, 200, 200, 0.92)'
const STROKE_HOVER = '#38965A'

onMounted(async () => {
  if (!import.meta.client) return
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return

  const { gsap } = await import('gsap')

  let mouseX = 0
  let mouseY = 0
  let crossX = 0
  let crossY = 0

  const onMove = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY
    gsap.set(dotEl.value, { x: mouseX, y: mouseY })
  }

  const tick = () => {
    crossX += (mouseX - crossX) * 0.14
    crossY += (mouseY - crossY) * 0.14
    gsap.set(crosshairEl.value, { x: crossX, y: crossY })
  }

  gsap.ticker.add(tick)
  window.addEventListener('mousemove', onMove)

  const setStroke = (color: string) => {
    svgEl.value?.style.setProperty('--cursor-stroke', color)
  }

  const setHover = () => {
    gsap.to(crosshairEl.value, { scale: 1.25, duration: 0.25, ease: 'power2.out' })
    gsap.to(dotEl.value, { scale: 1.4, duration: 0.2 })
    setStroke(STROKE_HOVER)
  }

  const setView = () => {
    if (labelEl.value) labelEl.value.textContent = 'VIEW'
    gsap.to(crosshairEl.value, { scale: 1.55, duration: 0.3, ease: 'power2.out' })
    gsap.to(dotEl.value, { scale: 0, duration: 0.2 })
    setStroke(STROKE_HOVER)
    gsap.to(labelEl.value, { opacity: 1, duration: 0.2 })
  }

  const resetCursor = () => {
    gsap.to(crosshairEl.value, { scale: 1, duration: 0.3, ease: 'power2.out' })
    gsap.to(dotEl.value, { scale: 1, duration: 0.2 })
    setStroke(STROKE_DEFAULT)
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
    <div class="cursor">
      <div ref="crosshairEl" class="cursor__crosshair">
        <svg
          ref="svgEl"
          class="cursor__mark"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line class="cursor__line" x1="0" y1="24" x2="48" y2="24" />
          <line class="cursor__line" x1="24" y1="0" x2="24" y2="48" />
        </svg>
        <span ref="labelEl" class="cursor__label" />
      </div>
      <div ref="dotEl" class="cursor__dot" />
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

.cursor__crosshair,
.cursor__dot {
  position: fixed;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  will-change: transform;
}

.cursor__crosshair {
  z-index: 1;
}

.cursor__dot {
  z-index: 2;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $color-gold;
  box-shadow: 0 0 8px rgba(56, 150, 90, 0.45);
}

.cursor__mark {
  --cursor-stroke: rgba(200, 200, 200, 0.92);
  display: block;
  width: 40px;
  height: 40px;
}

.cursor__line {
  stroke: var(--cursor-stroke);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  shape-rendering: crispEdges;
}

.cursor__label {
  position: absolute;
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  font-family: $font-mono;
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: $color-gold;
  opacity: 0;
  white-space: nowrap;
}
</style>
