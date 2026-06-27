<script setup lang="ts">
const props = withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: true,
})

const rootRef = ref<HTMLElement | null>(null)
const terminalRef = ref<HTMLElement | null>(null)
const activeRef = toRef(props, 'active')

const steps = ['commit', 'build', 'test', 'deploy']
const lines = [
  '$ git push origin main',
  '→ running nuxt build...',
  '→ 142 modules transformed',
  '✓ deployed to edge',
]

useVisibleTimeline({
  root: rootRef,
  active: activeRef,
  factory: ({ gsap, reduced }) => {
  const stepEls = rootRef.value?.querySelectorAll<HTMLElement>('[data-step]') ?? []
  const connectors = rootRef.value?.querySelectorAll<SVGElement>('[data-connector]') ?? []
  const lineEls = terminalRef.value?.querySelectorAll<HTMLElement>('[data-line]') ?? []

  if (!stepEls.length || !lineEls.length) return null

  if (reduced) {
    gsap.set(stepEls, { '--step': 1 })
    gsap.set(connectors, { strokeDashoffset: 0, opacity: 1 })
    gsap.set(lineEls, { opacity: 1, x: 0 })
    return null
  }

  gsap.set(stepEls, { '--step': 0 })
  gsap.set(connectors, { strokeDashoffset: 40, opacity: 0.25 })
  gsap.set(lineEls, { opacity: 0, x: -8 })

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })

  tl.set(stepEls, { '--step': 0 })
  tl.set(connectors, { strokeDashoffset: 40, opacity: 0.25 })
  tl.set(lineEls, { opacity: 0, x: -8 })

  stepEls.forEach((step, i) => {
    tl.to(step, { '--step': 1, duration: 0.35, ease: 'power2.out' }, i * 0.55)
    if (connectors[i]) {
      tl.to(connectors[i], { strokeDashoffset: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, i * 0.55 + 0.15)
    }
    if (lineEls[i]) {
      tl.to(lineEls[i], { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, i * 0.55 + 0.2)
    }
  })

  tl.to({}, { duration: 1.2 })

  return tl
  },
})
</script>

<template>
  <div ref="rootRef" class="svc-scene svc-pipeline" aria-hidden="true">
    <div class="svc-pipeline__layout">
      <ol class="svc-pipeline__steps">
        <li
          v-for="step in steps"
          :key="step"
          data-step
          class="svc-pipeline__step font-mono"
        >
          <span class="svc-pipeline__dot" />
          <span class="svc-pipeline__label">{{ step }}</span>
        </li>
      </ol>
      <svg class="svc-pipeline__connectors" viewBox="0 0 4 180" preserveAspectRatio="none" aria-hidden="true">
        <line
          v-for="i in 3"
          :key="i"
          data-connector
          x1="2"
          :y1="(i - 1) * 45 + 22"
          x2="2"
          :y2="(i - 1) * 45 + 45"
        />
      </svg>
      <div ref="terminalRef" class="svc-pipeline__terminal">
        <span class="svc-pipeline__terminal-head font-mono">bash</span>
        <p
          v-for="(line, i) in lines"
          :key="i"
          data-line
          class="svc-pipeline__line font-mono"
        >
          {{ line }}
        </p>
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

.svc-pipeline {
  &__layout {
    position: absolute;
    top: 50%;
    left: 52%;
    transform: translateY(-50%);
    display: grid;
    grid-template-columns: auto 12px minmax(160px, 1fr);
    gap: $space-5;
    align-items: start;
    width: clamp(260px, 34vw, 400px);
    padding: clamp(16px, 2vw, 24px);
    border: 1px solid rgba(212, 175, 83, 0.16);
    border-radius: 12px;
    background: rgba(12, 12, 12, 0.92);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  }

  &__steps {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin: 8px 0 0;
    padding: 0;
  }

  &__step {
    --step: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(138, 128, 112, calc(0.5 + var(--step) * 0.5));
    transition: color 0.2s;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(212, 175, 83, calc(0.25 + var(--step) * 0.55));
    background: rgba(212, 175, 83, calc(var(--step) * 0.85));
    box-shadow: 0 0 calc(var(--step) * 12px) rgba(212, 175, 83, calc(var(--step) * 0.45));
  }

  &__connectors {
    width: 4px;
    height: 140px;
    margin-top: 18px;

    line {
      stroke: rgba(232, 201, 122, 0.65);
      stroke-width: 2;
      stroke-dasharray: 40;
      vector-effect: non-scaling-stroke;
    }
  }

  &__terminal {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;
  }

  &__terminal-head {
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(212, 175, 83, 0.65);
    margin-bottom: 4px;
  }

  &__line {
    margin: 0;
    font-size: clamp(9px, 0.9vw, 11px);
    line-height: 1.4;
    color: rgba(242, 238, 232, 0.82);
    opacity: 0.35;
  }
}

@media (max-width: 767px) {
  .svc-pipeline__layout {
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    width: min(92%, 340px);
  }
}
</style>
