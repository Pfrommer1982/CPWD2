<script setup lang="ts">
const props = withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: true,
})

const rootRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)
const activeRef = toRef(props, 'active')

const layers = [
  { label: 'bg', speed: 0.15, y: 0 },
  { label: 'mid', speed: 0.45, y: 12 },
  { label: 'fg', speed: 0.85, y: 24 },
]

useVisibleTimeline({
  root: rootRef,
  active: activeRef,
  factory: ({ gsap, reduced }) => {
  const playhead = rootRef.value?.querySelector<HTMLElement>('[data-playhead]')
  const layerEls = previewRef.value?.querySelectorAll<HTMLElement>('[data-layer]') ?? []
  const keys = rootRef.value?.querySelectorAll<HTMLElement>('[data-key]') ?? []

  if (!playhead || !layerEls.length) return null

  if (reduced) {
    gsap.set(playhead, { left: '60%' })
    layerEls.forEach((el) => {
      const speed = Number(el.dataset.speed) || 0.5
      gsap.set(el, { y: -0.6 * 40 * speed })
    })
    return null
  }

  gsap.set(playhead, { left: '0%' })
  gsap.set(layerEls, { y: 0 })
  gsap.set(keys, { opacity: 0.35, scale: 0.85 })

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })

  tl.to(playhead, {
    left: '100%',
    duration: 2.8,
    ease: 'none',
    onUpdate() {
      const progress = gsap.getProperty(playhead, 'left') as string
      const pct = parseFloat(progress) / 100
      layerEls.forEach((el, i) => {
        const speed = Number(el.dataset.speed) || 0.5
        gsap.set(el, { y: -pct * 40 * speed })
      })
    },
  })

  keys.forEach((key, i) => {
    tl.to(key, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }, (i / keys.length) * 2.4)
    tl.to(key, { opacity: 0.35, scale: 0.85, duration: 0.15 }, (i / keys.length) * 2.4 + 0.35)
  })

  tl.set(playhead, { left: '0%' })
  tl.set(layerEls, { y: 0 })

  return tl
  },
})
</script>

<template>
  <div ref="rootRef" class="svc-scene svc-motion" aria-hidden="true">
    <div class="svc-motion__panel">
      <div ref="previewRef" class="svc-motion__preview">
        <div
          v-for="layer in layers"
          :key="layer.label"
          data-layer
          :data-speed="layer.speed"
          class="svc-motion__layer"
          :class="`svc-motion__layer--${layer.label}`"
        />
        <span class="svc-motion__preview-label font-mono">scroll preview</span>
      </div>
      <div class="svc-motion__timeline">
        <div class="svc-motion__track">
          <span
            v-for="i in 5"
            :key="i"
            data-key
            class="svc-motion__key"
            :style="{ left: `${(i - 1) * 25}%` }"
          />
          <span data-playhead class="svc-motion__playhead" />
        </div>
        <div class="svc-motion__labels font-mono">
          <span>0s</span>
          <span>ScrollTrigger</span>
          <span>2.8s</span>
        </div>
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

.svc-motion {
  &__panel {
    position: absolute;
    top: 50%;
    left: 52%;
    transform: translateY(-50%);
    width: clamp(240px, 32vw, 380px);
    padding: clamp(14px, 2vw, 20px);
    border: 1px solid rgba(212, 175, 83, 0.16);
    border-radius: 12px;
    background: rgba(12, 12, 12, 0.92);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  }

  &__preview {
    position: relative;
    height: clamp(120px, 16vw, 180px);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(212, 175, 83, 0.1);
    background: rgba(8, 8, 8, 0.8);
    margin-bottom: $space-5;
  }

  &__layer {
    position: absolute;
    left: 10%;
    right: 10%;
    height: 28%;
    border-radius: 6px;
    will-change: transform;

    &--bg {
      top: 18%;
      background: linear-gradient(90deg, rgba(212, 175, 83, 0.08), rgba(212, 175, 83, 0.02));
    }

    &--mid {
      top: 38%;
      background: linear-gradient(90deg, rgba(232, 201, 122, 0.14), rgba(212, 175, 83, 0.06));
    }

    &--fg {
      top: 58%;
      background: linear-gradient(90deg, rgba(242, 238, 232, 0.12), rgba(212, 175, 83, 0.08));
      border: 1px solid rgba(212, 175, 83, 0.15);
    }
  }

  &__preview-label {
    position: absolute;
    bottom: 8px;
    left: 10px;
    font-size: 8px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(138, 128, 112, 0.75);
  }

  &__timeline {
    padding-top: 4px;
  }

  &__track {
    position: relative;
    height: 28px;
    border-radius: 6px;
    background: rgba(212, 175, 83, 0.06);
    border: 1px solid rgba(212, 175, 83, 0.12);
  }

  &__key {
    position: absolute;
    top: 50%;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    transform: translate(-50%, -50%) rotate(45deg);
    background: rgba(212, 175, 83, 0.35);
    border: 1px solid rgba(232, 201, 122, 0.45);
    opacity: 0.35;
  }

  &__playhead {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 0;
    width: 2px;
    background: rgba(232, 201, 122, 0.95);
    box-shadow: 0 0 10px rgba(212, 175, 83, 0.5);
  }

  &__labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 8px;
    letter-spacing: 0.08em;
    color: rgba(138, 128, 112, 0.75);
  }
}

@media (max-width: 767px) {
  .svc-motion__panel {
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
  }
}
</style>
