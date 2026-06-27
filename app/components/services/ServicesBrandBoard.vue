<script setup lang="ts">
const props = withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: true,
})

const rootRef = ref<HTMLElement | null>(null)
const activeRef = toRef(props, 'active')

const tiles = [
  { id: 'type', label: 'Type', content: 'Aa' },
  { id: 'color', label: 'Color', content: '', swatch: '#D4AF53' },
  { id: 'logo', label: 'Mark', content: '＋' },
  { id: 'space', label: 'Space', content: '8' },
  { id: 'voice', label: 'Voice', content: 'Locked' },
  { id: 'grid', label: 'Grid', content: '12' },
]

useVisibleTimeline({
  root: rootRef,
  active: activeRef,
  factory: ({ gsap, reduced }) => {
  const tileEls = rootRef.value?.querySelectorAll<HTMLElement>('[data-tile]') ?? []
  const ruler = rootRef.value?.querySelector<HTMLElement>('[data-ruler]')

  if (reduced) {
    gsap.set(tileEls, { opacity: 1, scale: 1, rotateY: 0 })
    gsap.set(ruler, { scaleX: 1, opacity: 0.6 })
    return null
  }

  gsap.set(tileEls, { opacity: 0, scale: 0.72, rotateY: -28 })
  gsap.set(ruler, { scaleX: 0, opacity: 0 })

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 })

  tl.to(ruler, { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.out' })
  tl.to(tileEls, {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    duration: 0.55,
    stagger: { each: 0.08, from: 'center' },
    ease: 'back.out(1.4)',
  }, 0.15)
  tl.to({}, { duration: 1.3 })
  tl.to(tileEls, {
    opacity: 0,
    scale: 0.85,
    rotateY: 12,
    duration: 0.4,
    stagger: { each: 0.04, from: 'edges' },
    ease: 'power2.in',
  })
  tl.to(ruler, { scaleX: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }, '-=0.25')

  return tl
  },
})
</script>

<template>
  <div ref="rootRef" class="svc-scene svc-brand" aria-hidden="true">
    <div class="svc-brand__panel">
      <span data-ruler class="svc-brand__ruler font-mono">Identity system</span>
      <div class="svc-brand__grid">
        <article
          v-for="tile in tiles"
          :key="tile.id"
          data-tile
          class="svc-brand__tile"
        >
          <span class="svc-brand__tile-label font-mono">{{ tile.label }}</span>
          <span
            v-if="tile.swatch"
            class="svc-brand__swatch"
            :style="{ background: tile.swatch }"
          />
          <span v-else class="svc-brand__tile-content font-display">{{ tile.content }}</span>
        </article>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.svc-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.svc-brand {
  &__panel {
    position: absolute;
    top: 50%;
    left: 52%;
    transform: translateY(-50%);
    width: clamp(240px, 32vw, 380px);
    padding: clamp(16px, 2vw, 22px);
    perspective: 800px;
  }

  &__ruler {
    display: block;
    margin-bottom: $space-4;
    font-size: 9px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(212, 175, 83, 0.65);
    transform-origin: left center;
    opacity: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  &__tile {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(212, 175, 83, 0.18);
    background: rgba(16, 16, 16, 0.92);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    transform-style: preserve-3d;
    opacity: 0;
  }

  &__tile-label {
    font-size: 7px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(138, 128, 112, 0.8);
  }

  &__tile-content {
    font-size: clamp(1.4rem, 2.5vw, 2rem);
    font-weight: 300;
    line-height: 1;
    color: rgba(242, 238, 232, 0.9);
  }

  &__swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    box-shadow: 0 0 16px rgba(212, 175, 83, 0.35);
  }
}

@media (max-width: 767px) {
  .svc-brand__panel {
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
  }
}
</style>
