<script setup lang="ts">
const props = withDefaults(defineProps<{
  active?: boolean
  mobile?: boolean
}>(), {
  active: true,
  mobile: false,
})

const rootRef = ref<HTMLElement | null>(null)
const activeRef = toRef(props, 'active')
const staticMode = toRef(props, 'mobile')

useVisibleTimeline({
  root: rootRef,
  active: activeRef,
  staticMode,
  factory: ({ gsap, reduced }) => {
    const ring = rootRef.value?.querySelector<SVGElement>('[data-ring]')
    const grid = rootRef.value?.querySelector<HTMLElement>('[data-grid]')
    const phi = rootRef.value?.querySelectorAll<SVGGeometryElement>('[data-phi]') ?? []
    const specimen = rootRef.value?.querySelector<HTMLElement>('[data-specimen]')
    const baselines = rootRef.value?.querySelectorAll<HTMLElement>('[data-baseline]') ?? []
    const chips = rootRef.value?.querySelectorAll<HTMLElement>('[data-chip]') ?? []
    const crosshair = rootRef.value?.querySelector<HTMLElement>('[data-crosshair]')
    const lock = rootRef.value?.querySelector<HTMLElement>('[data-lock]')
    const readouts = rootRef.value?.querySelectorAll<HTMLElement>('[data-readout]') ?? []

    if (!ring || !specimen) return null

    if (reduced) {
      gsap.set(ring, { strokeDashoffset: 0, opacity: 0.7 })
      gsap.set(grid, { opacity: 0.45 })
      gsap.set(phi, { strokeDashoffset: 0, opacity: 0.5 })
      gsap.set(specimen, { opacity: 1, scale: 1, filter: 'blur(0px)' })
      gsap.set(baselines, { scaleX: 1, opacity: 0.55 })
      gsap.set(chips, { opacity: 1, scale: 1 })
      gsap.set(crosshair, { opacity: 0.85 })
      gsap.set(crosshair?.querySelector('.svc-design__crosshair-dot'), { scale: 1 })
      gsap.set(lock, { opacity: 1, y: 0 })
      gsap.set(readouts, { opacity: 0.7, y: 0 })
      return null
    }

    gsap.set(ring, { strokeDashoffset: 420, opacity: 0 })
    gsap.set(grid, { opacity: 0 })
    gsap.set(phi, { strokeDashoffset: 120, opacity: 0 })
    gsap.set(specimen, { opacity: 0, scale: 0.88, filter: 'blur(6px)' })
    gsap.set(baselines, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
    gsap.set(chips, { opacity: 0, scale: 0.6 })
    gsap.set(crosshair, { opacity: 0 })
    gsap.set(crosshair?.querySelector('.svc-design__crosshair-dot'), { scale: 0.4 })
    gsap.set(lock, { opacity: 0, y: 8 })
    gsap.set(readouts, { opacity: 0, y: 6 })

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.85 })

    tl.to(ring, { strokeDashoffset: 0, opacity: 0.75, duration: 0.7, ease: 'power2.out' })
    tl.to(grid, { opacity: 0.5, duration: 0.45, ease: 'power1.out' }, 0.15)
    tl.to(phi, {
      strokeDashoffset: 0,
      opacity: 0.55,
      duration: 0.55,
      stagger: 0.1,
      ease: 'power2.out',
    }, 0.25)
    tl.to(specimen, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.65,
      ease: 'power3.out',
    }, 0.35)
    tl.to(baselines, {
      scaleX: 1,
      opacity: 0.6,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out',
    }, 0.55)
    tl.to(chips, {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      stagger: 0.08,
      ease: 'back.out(1.6)',
    }, 0.65)
    tl.to(readouts, {
      opacity: 0.75,
      y: 0,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.out',
    }, 0.75)
    tl.to(crosshair, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.9)
    tl.fromTo(crosshair?.querySelector('.svc-design__crosshair-dot'), {
      scale: 0.4,
    }, {
      scale: 1,
      duration: 0.35,
      ease: 'back.out(2)',
    }, 0.9)
    tl.to(lock, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1)
    tl.to({}, { duration: 1.4 })
    tl.to([lock, crosshair, readouts], {
      opacity: 0,
      duration: 0.25,
      stagger: 0.03,
      ease: 'power1.in',
    }, 2.55)
    tl.to(chips, { opacity: 0, scale: 0.85, duration: 0.3, stagger: 0.03 }, 2.55)
    tl.to(baselines, { opacity: 0, duration: 0.25 }, 2.6)
    tl.to(specimen, { opacity: 0, scale: 0.94, filter: 'blur(4px)', duration: 0.35 }, 2.65)
    tl.to(phi, { opacity: 0, duration: 0.25, stagger: 0.03 }, 2.65)
    tl.to(grid, { opacity: 0, duration: 0.25 }, 2.7)
    tl.to(ring, { strokeDashoffset: 420, opacity: 0, duration: 0.45, ease: 'power2.in' }, 2.7)

    return tl
  },
})
</script>

<template>
  <div
    ref="rootRef"
    class="svc-scene svc-design"
    :class="{
      'svc-scene--stacked': mobile,
      'svc-scene--static': mobile,
    }"
    aria-hidden="true"
  >
    <div class="svc-design__panel svc-scene__stage">
      <div class="svc-design__viewport">
        <span data-readout class="svc-design__readout svc-design__readout--type font-mono">TYPE</span>
        <span data-readout class="svc-design__readout svc-design__readout--grid font-mono">GRID 12</span>
        <span data-readout class="svc-design__readout svc-design__readout--phi font-mono">φ 1.618</span>

        <div data-grid class="svc-design__grid" aria-hidden="true" />

        <svg class="svc-design__phi" viewBox="0 0 280 280" aria-hidden="true">
          <line data-phi x1="28" y1="252" x2="252" y2="252" />
          <line data-phi x1="28" y1="252" x2="28" y2="28" />
          <line data-phi x1="28" y1="98" x2="252" y2="98" />
          <line data-phi x1="173" y1="28" x2="173" y2="252" />
          <circle data-ring cx="140" cy="140" r="118" fill="none" />
        </svg>

        <div data-specimen class="svc-design__specimen font-display">
          <span class="svc-design__glyph">Aa</span>
          <div class="svc-design__baselines">
            <span data-baseline class="svc-design__baseline" />
            <span data-baseline class="svc-design__baseline svc-design__baseline--short" />
            <span data-baseline class="svc-design__baseline svc-design__baseline--shorter" />
          </div>
        </div>

        <span
          data-chip
          class="svc-design__chip svc-design__chip--primary"
          :style="{ background: '#38965A' }"
        />
        <span
          data-chip
          class="svc-design__chip svc-design__chip--muted"
          :style="{ background: '#1E6640' }"
        />
        <span data-chip class="svc-design__chip svc-design__chip--light" />

        <div data-crosshair class="svc-design__crosshair" aria-hidden="true">
          <span class="svc-design__crosshair-h" />
          <span class="svc-design__crosshair-v" />
          <span class="svc-design__crosshair-dot" />
        </div>

        <span data-lock class="svc-design__lock font-mono">COMP LOCK</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.svc-design {
  &__panel {
    width: clamp(220px, 28vw, 340px);
    padding-block: 4px;
  }

  &__viewport {
    position: relative;
    aspect-ratio: 1;
    border: 1px solid rgba(56, 150, 90, 0.16);
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 42%, rgba(56, 150, 90, 0.07) 0%, transparent 55%),
      radial-gradient(circle at 50% 50%, rgba(8, 12, 10, 0.95) 0%, rgba(5, 8, 7, 0.99) 100%);
    box-shadow:
      0 0 0 1px rgba(56, 150, 90, 0.05) inset,
      0 16px 48px rgba(0, 0, 0, 0.4),
      0 0 32px rgba(56, 150, 90, 0.05);
    overflow: hidden;
  }

  &__grid {
    position: absolute;
    inset: 12%;
    border-radius: 50%;
    opacity: 0;
    background:
      linear-gradient(rgba(56, 150, 90, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 150, 90, 0.06) 1px, transparent 1px);
    background-size: 14px 14px;
    mask-image: radial-gradient(circle at 50% 50%, #000 35%, transparent 72%);
  }

  &__phi {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    line {
      stroke: rgba(80, 168, 114, 0.4);
      stroke-width: 1;
      stroke-dasharray: 120;
      vector-effect: non-scaling-stroke;
    }

    circle[data-ring] {
      stroke: rgba(80, 168, 114, 0.55);
      stroke-width: 1;
      stroke-dasharray: 420;
      vector-effect: non-scaling-stroke;
    }
  }

  &__specimen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding-top: 6%;
  }

  &__glyph {
    font-size: clamp(3.5rem, 8vw, 5rem);
    font-weight: 300;
    line-height: 1;
    letter-spacing: -0.04em;
    color: rgba(232, 241, 236, 0.92);
    text-shadow: 0 0 32px rgba(56, 150, 90, 0.25);
  }

  &__baselines {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: min(52%, 140px);
  }

  &__baseline {
    display: block;
    height: 1px;
    width: 100%;
    background: linear-gradient(90deg, rgba(80, 168, 114, 0.65), rgba(56, 150, 90, 0.15));
    transform-origin: left center;

    &--short { width: 78%; }
    &--shorter { width: 52%; opacity: 0.7; }
  }

  &__chip {
    position: absolute;
    width: clamp(22px, 3vw, 28px);
    height: clamp(22px, 3vw, 28px);
    border-radius: 4px;
    border: 1px solid rgba(232, 241, 236, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);

    &--primary {
      top: 18%;
      right: 16%;
    }

    &--muted {
      bottom: 22%;
      left: 14%;
      background: rgba(100, 118, 110, 0.35) !important;
    }

    &--light {
      bottom: 18%;
      right: 20%;
      background: linear-gradient(135deg, rgba(232, 241, 236, 0.85), rgba(123, 143, 134, 0.45));
    }
  }

  &__crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 48%;
    height: 48%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  &__crosshair-h,
  &__crosshair-v {
    position: absolute;
    background: rgba(80, 168, 114, 0.55);
  }

  &__crosshair-h {
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    transform: translateY(-50%);
  }

  &__crosshair-v {
    left: 50%;
    top: 0;
    width: 1px;
    height: 100%;
    transform: translateX(-50%);
  }

  &__crosshair-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: rgba(232, 241, 236, 0.9);
    box-shadow: 0 0 10px rgba(80, 168, 114, 0.65);
  }

  &__lock {
    position: absolute;
    bottom: 14%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 8px;
    letter-spacing: 0.2em;
    color: rgba(80, 168, 114, 0.85);
    padding: 4px 10px;
    border: 1px solid rgba(56, 150, 90, 0.25);
    border-radius: 999px;
    background: rgba(6, 10, 8, 0.75);
  }

  &__readout {
    position: absolute;
    font-size: 8px;
    letter-spacing: 0.14em;
    color: rgba(56, 150, 90, 0.55);
    opacity: 0;
    z-index: 2;

    &--type {
      top: 10%;
      left: 16%;
    }

    &--grid {
      top: 10%;
      right: 14%;
    }

    &--phi {
      bottom: 11%;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>
