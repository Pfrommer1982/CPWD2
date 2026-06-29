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

const nodes = [
  { id: 'ams', label: 'AMS', x: 50, y: 50, origin: true },
  { id: 'lon', label: 'LON', x: 42, y: 38 },
  { id: 'nyc', label: 'NYC', x: 22, y: 42 },
  { id: 'sfo', label: 'SFO', x: 12, y: 48 },
  { id: 'sgp', label: 'SGP', x: 78, y: 58 },
  { id: 'syd', label: 'SYD', x: 82, y: 72 },
  { id: 'tky', label: 'TKY', x: 86, y: 44 },
]

const edges = [
  ['ams', 'lon'],
  ['ams', 'nyc'],
  ['ams', 'sgp'],
  ['ams', 'tky'],
  ['sgp', 'syd'],
  ['nyc', 'sfo'],
]

function edgePath(from: string, to: string) {
  const a = nodes.find(n => n.id === from)!
  const b = nodes.find(n => n.id === to)!
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
}

useVisibleTimeline({
  root: rootRef,
  active: activeRef,
  staticMode,
  factory: ({ gsap, reduced }) => {
  const pulses = rootRef.value?.querySelectorAll<HTMLElement>('[data-pulse]') ?? []
  const lines = rootRef.value?.querySelectorAll<SVGPathElement>('[data-edge]') ?? []
  const labels = rootRef.value?.querySelectorAll<HTMLElement>('[data-node]') ?? []

  if (reduced) {
    gsap.set(lines, { strokeDashoffset: 0, opacity: 0.8 })
    gsap.set(labels, { opacity: 1, scale: 1 })
    return null
  }

  gsap.set(lines, { strokeDashoffset: 100, opacity: 0.2 })
  gsap.set(labels, { opacity: 0.35, scale: 0.85 })
  gsap.set(pulses, { scale: 0.6, opacity: 0 })

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 })

  tl.to(pulses[0], { scale: 1.8, opacity: 0.5, duration: 0.8, ease: 'power2.out' })
  tl.to(pulses[0], { scale: 2.4, opacity: 0, duration: 0.8, ease: 'power1.in' }, '-=0.3')

  lines.forEach((line, i) => {
    tl.to(line, { strokeDashoffset: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.15 + i * 0.12)
  })

  labels.forEach((node, i) => {
    tl.to(node, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, 0.3 + i * 0.08)
  })

  tl.to({}, { duration: 1.4 })

  tl.to(lines, { opacity: 0.15, duration: 0.5 })
  tl.to(labels, { opacity: 0.35, scale: 0.85, duration: 0.5 }, '<')
  tl.set(lines, { strokeDashoffset: 100 })
  tl.set(pulses[0], { scale: 0.6, opacity: 0 })

  return tl
  },
})
</script>

<template>
  <div
    ref="rootRef"
    class="svc-scene svc-cloud"
    :class="{
      'svc-scene--stacked': mobile,
      'svc-scene--static': mobile,
    }"
    aria-hidden="true"
  >
    <div class="svc-cloud__panel svc-scene__stage">
      <span class="svc-cloud__title font-mono">Edge network</span>
      <svg class="svc-cloud__map" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="38" class="svc-cloud__globe" />
        <path
          v-for="([from, to], i) in edges"
          :key="`${from}-${to}`"
          data-edge
          :d="edgePath(from, to)"
          class="svc-cloud__edge"
        />
        <g v-for="node in nodes" :key="node.id">
          <circle
            v-if="node.origin"
            cx="50"
            cy="50"
            r="4"
            class="svc-cloud__hub"
          />
          <circle
            v-if="node.origin"
            data-pulse
            cx="50"
            cy="50"
            r="4"
            class="svc-cloud__pulse"
          />
          <g :transform="`translate(${node.x}, ${node.y})`">
            <circle r="2.2" class="svc-cloud__node-dot" />
            <text
              data-node
              y="-5"
              text-anchor="middle"
              class="svc-cloud__node-label font-mono"
            >
              {{ node.label }}
            </text>
          </g>
        </g>
      </svg>
      <div class="svc-cloud__stats font-mono">
        <span><em>CDN</em> 99.9% uptime</span>
        <span><em>RTT</em> 24ms avg</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.svc-cloud {
  &__panel {
    width: clamp(240px, 30vw, 360px);
    padding: clamp(16px, 2vw, 22px);
    border: 1px solid rgba(56, 150, 90, 0.16);
    border-radius: 50%;
    aspect-ratio: 1;
    background: radial-gradient(circle at 50% 40%, rgba(56, 150, 90, 0.08), rgba(10, 10, 10, 0.95) 65%);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .svc-scene--stacked & {
      width: min(100%, 280px);
    }
  }

  &__title {
    position: absolute;
    top: 14%;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(56, 150, 90, 0.65);
  }

  &__map {
    width: 72%;
    height: 72%;
    overflow: visible;
  }

  &__globe {
    fill: none;
    stroke: rgba(56, 150, 90, 0.12);
    stroke-width: 0.5;
  }

  &__edge {
    fill: none;
    stroke: rgba(80, 168, 114, 0.55);
    stroke-width: 0.6;
    stroke-dasharray: 100;
    vector-effect: non-scaling-stroke;
  }

  &__hub {
    fill: rgba(56, 150, 90, 0.95);
  }

  &__pulse {
    fill: none;
    stroke: rgba(56, 150, 90, 0.5);
    stroke-width: 0.8;
    transform-origin: 50px 50px;
    transform-box: fill-box;
  }

  &__node-dot {
    fill: rgba(80, 168, 114, 0.85);
  }

  &__node-label {
    font-size: 4.5px;
    letter-spacing: 0.08em;
    fill: rgba(242, 238, 232, 0.75);
    opacity: 0.35;
    transform-box: fill-box;
    transform-origin: center;
  }

  &__stats {
    position: absolute;
    bottom: 14%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 8px;
    letter-spacing: 0.06em;
    color: rgba(100, 118, 110, 0.85);

    em {
      font-style: normal;
      color: rgba(56, 150, 90, 0.75);
      margin-right: 4px;
    }
  }
}
</style>
