<script setup lang="ts">
import type {
  FeatureId,
  ProjectEstimateConfig,
  ProjectEstimateResult,
} from '~/types/project-estimate'

const props = defineProps<{
  config: ProjectEstimateConfig & { type: NonNullable<ProjectEstimateConfig['type']> }
  estimate: ProjectEstimateResult
}>()

const copy = useSectionTranslations('projectEstimator')
const { animateMotion } = useGraphicsCapability()

type InfraNodeId =
  | 'visitors'
  | 'edge'
  | 'app'
  | 'origin'
  | 'cms'
  | 'payments'
  | 'accounts'
  | 'api'
  | 'analytics'
  | 'ai'
  | 'booking'
  | 'mail'

interface InfraNode {
  id: InfraNodeId
  x: number
  y: number
  label: string
  role: string
  kind: 'core' | 'service' | 'edge'
  code: string
}

interface InfraLink {
  id: string
  from: InfraNodeId
  to: InfraNodeId
  d: string
  delay: number
  duration: number
  primary?: boolean
}

const FEATURE_NODE_MAP: Partial<Record<FeatureId, InfraNodeId>> = {
  cms: 'cms',
  blog: 'cms',
  payments: 'payments',
  accounts: 'accounts',
  dashboard: 'accounts',
  api: 'api',
  analytics: 'analytics',
  ai: 'ai',
  booking: 'booking',
  newsletter: 'mail',
  'contact-form': 'mail',
}

const NODE_ICONS: Record<InfraNodeId, string[]> = {
  visitors: [
    'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z',
    'M5 20a7 7 0 0 1 14 0',
  ],
  edge: [
    'M4 14h4l2-6 3 10 2-4h5',
    'M3 19h18',
  ],
  app: [
    'M5 4h14v16H5z',
    'M9 8h6',
    'M9 12h6',
    'M9 16h4',
  ],
  origin: [
    'M4 18h16',
    'M7 18V9l5-4 5 4v9',
    'M10 18v-4h4v4',
  ],
  cms: [
    'M5 5h14v14H5z',
    'M8 9h8',
    'M8 12h8',
    'M8 15h5',
  ],
  payments: [
    'M4 8h16v10H4z',
    'M4 11h16',
    'M8 15h4',
  ],
  accounts: [
    'M12 11a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 11Z',
    'M6 19a6 6 0 0 1 12 0',
    'M17 8h3',
    'M18.5 6.5v3',
  ],
  api: [
    'M8 8h8v8H8z',
    'M5 12h3',
    'M16 12h3',
    'M12 5v3',
    'M12 16v3',
  ],
  analytics: [
    'M5 19V10',
    'M10 19V6',
    'M15 19v-8',
    'M20 19V8',
  ],
  ai: [
    'M12 4v2',
    'M12 18v2',
    'M4 12h2',
    'M18 12h2',
    'M7.05 7.05l1.4 1.4',
    'M15.55 15.55l1.4 1.4',
    'M16.95 7.05l-1.4 1.4',
    'M8.45 15.55l-1.4 1.4',
    'M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z',
  ],
  booking: [
    'M6 5h12v14H6z',
    'M9 3v4',
    'M15 3v4',
    'M6 10h12',
    'M9 14h2',
    'M13 14h2',
  ],
  mail: [
    'M4 7h16v11H4z',
    'M4 8l8 6 8-6',
  ],
}

const NODE_CODES: Record<InfraNodeId, string> = {
  visitors: '01',
  edge: '02',
  app: '03',
  origin: '04',
  cms: 'CMS',
  mail: 'MSG',
  analytics: 'ANL',
  payments: 'PAY',
  accounts: 'USR',
  api: 'API',
  ai: 'AI',
  booking: 'BKG',
}

function curve(x1: number, y1: number, x2: number, y2: number, lift = 0) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2 + lift
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
}

const activeServiceIds = computed(() => {
  const ids = new Set<InfraNodeId>()
  for (const feature of props.config.features) {
    const mapped = FEATURE_NODE_MAP[feature]
    if (mapped) ids.add(mapped)
  }
  if (props.config.type === 'webshop') ids.add('payments')
  if (props.config.type === 'webapp') ids.add('accounts')
  return ids
})

const nodes = computed<InfraNode[]>(() => {
  const list: InfraNode[] = [
    {
      id: 'visitors',
      x: 90,
      y: 220,
      label: copy.t('infra.nodes.visitors'),
      role: copy.t('infra.roles.visitors'),
      kind: 'edge',
      code: NODE_CODES.visitors,
    },
    {
      id: 'edge',
      x: 250,
      y: 220,
      label: copy.t('infra.nodes.edge'),
      role: copy.t('infra.roles.edge'),
      kind: 'edge',
      code: NODE_CODES.edge,
    },
    {
      id: 'app',
      x: 420,
      y: 220,
      label: copy.t(`infra.nodes.app.${props.config.type}`),
      role: copy.t('infra.roles.app'),
      kind: 'core',
      code: NODE_CODES.app,
    },
    {
      id: 'origin',
      x: 590,
      y: 220,
      label: copy.t(`infra.nodes.origin.${props.config.hosting}`),
      role: copy.t(`infra.roles.origin.${props.config.hosting}`),
      kind: 'core',
      code: NODE_CODES.origin,
    },
  ]

  const serviceSlots: Array<{ id: InfraNodeId; x: number; y: number }> = [
    { id: 'cms', x: 340, y: 78 },
    { id: 'mail', x: 420, y: 78 },
    { id: 'analytics', x: 500, y: 78 },
    { id: 'payments', x: 340, y: 362 },
    { id: 'accounts', x: 500, y: 362 },
    { id: 'api', x: 720, y: 120 },
    { id: 'ai', x: 720, y: 220 },
    { id: 'booking', x: 720, y: 320 },
  ]

  for (const slot of serviceSlots) {
    if (!activeServiceIds.value.has(slot.id)) continue
    list.push({
      id: slot.id,
      x: slot.x,
      y: slot.y,
      label: copy.t(`infra.nodes.${slot.id}`),
      role: copy.t(`infra.roles.${slot.id}`),
      kind: 'service',
      code: NODE_CODES[slot.id],
    })
  }

  return list
})

const nodeMap = computed(() => {
  const map = new Map<InfraNodeId, InfraNode>()
  for (const node of nodes.value) map.set(node.id, node)
  return map
})

const links = computed<InfraLink[]>(() => {
  const get = (id: InfraNodeId) => nodeMap.value.get(id)
  const out: InfraLink[] = []
  const intensity = props.estimate.complexity === 'low'
    ? 1
    : props.estimate.complexity === 'medium'
      ? 1.15
      : props.estimate.complexity === 'high'
        ? 1.35
        : 1.55

  const pushLink = (
    id: string,
    fromId: InfraNodeId,
    toId: InfraNodeId,
    lift: number,
    delay: number,
    duration: number,
    primary = false,
  ) => {
    const from = get(fromId)
    const to = get(toId)
    if (!from || !to) return
    out.push({
      id,
      from: fromId,
      to: toId,
      d: curve(from.x, from.y, to.x, to.y, lift),
      delay,
      duration: duration / intensity,
      primary,
    })
  }

  pushLink('visitors-edge', 'visitors', 'edge', -10, 0, 2.2, true)
  pushLink('edge-app', 'edge', 'app', 14, 0.28, 2, true)
  pushLink('app-origin', 'app', 'origin', -10, 0.55, 2.1, true)
  pushLink('origin-app', 'origin', 'app', 26, 1.05, 2.5, true)

  if (get('cms')) pushLink('app-cms', 'app', 'cms', -46, 0.18, 2.7)
  if (get('mail')) pushLink('app-mail', 'app', 'mail', -54, 0.5, 2.4)
  if (get('analytics')) pushLink('app-analytics', 'app', 'analytics', -42, 0.85, 2.6)
  if (get('payments')) pushLink('app-payments', 'app', 'payments', 46, 0.35, 2.3)
  if (get('accounts')) pushLink('app-accounts', 'app', 'accounts', 42, 0.75, 2.5)
  if (get('api')) pushLink('origin-api', 'origin', 'api', -28, 0.25, 2.2)
  if (get('ai')) pushLink('origin-ai', 'origin', 'ai', 0, 0.6, 2.4)
  if (get('booking')) pushLink('origin-booking', 'origin', 'booking', 28, 0.95, 2.3)

  return out
})

const statusLine = computed(() => {
  const services = Math.max(0, nodes.value.length - 4)
  return copy.t('infra.status', {
    services,
    complexity: copy.t(`summary.complexityLevels.${props.estimate.complexity}`),
  })
})

const flowSteps = computed(() => [
  { code: '01', label: copy.t('infra.flow.visitors') },
  { code: '02', label: copy.t('infra.flow.app') },
  { code: '03', label: copy.t('infra.flow.origin') },
])

const packetLoad = computed(() => {
  const base = 12 + props.estimate.complexityScore * 3
  return Math.min(96, base + props.config.features.length * 4)
})

const selectedId = ref<InfraNodeId>('app')

const selectedNode = computed(() => {
  return nodes.value.find(node => node.id === selectedId.value) || nodes.value[2] || nodes.value[0] || null
})

const selectedBody = computed(() => {
  const node = selectedNode.value
  if (!node) return ''
  if (node.id === 'app') return copy.t(`infra.explain.app.${props.config.type}`)
  if (node.id === 'origin') return copy.t(`infra.explain.origin.${props.config.hosting}`)
  return copy.t(`infra.explain.${node.id}`)
})

watch(nodes, (list) => {
  if (!list.some(node => node.id === selectedId.value)) {
    selectedId.value = list.find(node => node.id === 'app')?.id || list[0]?.id || 'visitors'
  }
}, { immediate: true })

function selectNode(id: InfraNodeId) {
  selectedId.value = id
}

function onNodeKeydown(event: KeyboardEvent, id: InfraNodeId) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectNode(id)
  }
}
</script>

<template>
  <section
    class="infra-map"
    :class="{ 'infra-map--motion': animateMotion }"
    aria-labelledby="infra-map-title"
  >
    <div class="infra-map__atmosphere" aria-hidden="true">
      <span class="infra-map__orb infra-map__orb--a" />
      <span class="infra-map__orb infra-map__orb--b" />
      <span class="infra-map__scan" />
    </div>

    <header class="infra-map__head">
      <div>
        <p class="infra-map__eyebrow font-mono">
          <span class="infra-map__live" aria-hidden="true" />
          {{ copy.t('infra.eyebrow') }}
        </p>
        <h2 id="infra-map-title" class="infra-map__title font-display">{{ copy.t('infra.title') }}</h2>
        <p class="infra-map__lead">{{ copy.t('infra.lead') }}</p>
      </div>

      <p class="infra-map__status font-mono">{{ statusLine }}</p>
    </header>

    <ol class="infra-map__flow font-mono">
      <li v-for="(step, index) in flowSteps" :key="step.code">
        <span class="infra-map__flow-code">{{ step.code }}</span>
        <span class="infra-map__flow-label">{{ step.label }}</span>
        <i v-if="index < flowSteps.length - 1" class="infra-map__flow-arrow" aria-hidden="true" />
      </li>
    </ol>

    <div class="infra-map__stage" data-lenis-prevent>
      <svg
        class="infra-map__svg"
        viewBox="0 0 820 450"
        role="group"
        :aria-label="copy.t('infra.title')"
      >
        <defs>
          <linearGradient id="infra-beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(80,168,114,0)" />
            <stop offset="35%" stop-color="rgba(80,168,114,0.55)" />
            <stop offset="65%" stop-color="rgba(212,175,55,0.45)" />
            <stop offset="100%" stop-color="rgba(80,168,114,0)" />
          </linearGradient>
          <linearGradient id="infra-card-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(18, 28, 22, 0.96)" />
            <stop offset="100%" stop-color="rgba(6, 10, 8, 0.98)" />
          </linearGradient>
          <radialGradient id="infra-node-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="rgba(80,168,114,0.38)" />
            <stop offset="55%" stop-color="rgba(80,168,114,0.08)" />
            <stop offset="100%" stop-color="rgba(80,168,114,0)" />
          </radialGradient>
          <filter id="infra-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="infra-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g class="infra-map__grid" aria-hidden="true">
          <line
            v-for="n in 13"
            :key="`v-${n}`"
            :x1="20 + n * 58"
            y1="18"
            :x2="20 + n * 58"
            y2="432"
          />
          <line
            v-for="n in 7"
            :key="`h-${n}`"
            x1="24"
            :y1="18 + n * 58"
            x2="796"
            :y2="18 + n * 58"
          />
        </g>

        <!-- Spine corridor behind main route -->
        <path
          class="infra-map__spine"
          d="M 90 220 C 180 188, 300 252, 420 220 S 540 188, 590 220"
          fill="none"
        />

        <g class="infra-map__links" fill="none">
          <path
            v-for="link in links"
            :key="`base-${link.id}`"
            class="infra-map__link"
            :class="{ 'is-primary': link.primary }"
            :d="link.d"
          />
          <path
            v-for="link in links"
            :key="`flow-${link.id}`"
            class="infra-map__link-flow"
            :class="{ 'is-primary': link.primary }"
            :d="link.d"
            :style="{ animationDuration: `${link.duration}s`, animationDelay: `${link.delay}s` }"
          />
        </g>

        <g v-if="animateMotion" class="infra-map__pulses" aria-hidden="true">
          <g
            v-for="link in links"
            :key="`pkt-${link.id}`"
            filter="url(#infra-glow)"
          >
            <rect
              class="infra-map__packet"
              :class="{ 'is-primary': link.primary }"
              x="-5"
              y="-2.5"
              width="10"
              height="5"
              rx="1.5"
            >
              <animateMotion
                :dur="`${link.duration}s`"
                :begin="`${link.delay}s`"
                repeatCount="indefinite"
                rotate="auto"
                :path="link.d"
              />
            </rect>
            <circle
              class="infra-map__packet-glow"
              r="7"
              filter="url(#infra-soft)"
            >
              <animateMotion
                :dur="`${link.duration}s`"
                :begin="`${link.delay}s`"
                repeatCount="indefinite"
                :path="link.d"
              />
            </circle>
          </g>
          <circle
            v-for="link in links"
            :key="`pulse-b-${link.id}`"
            class="infra-map__pulse-soft"
            r="2.4"
          >
            <animateMotion
              :dur="`${link.duration * 1.4}s`"
              :begin="`${link.delay + 0.9}s`"
              repeatCount="indefinite"
              :path="link.d"
            />
          </circle>
        </g>

        <g class="infra-map__nodes">
          <g
            v-for="node in nodes"
            :key="node.id"
            class="infra-map__node"
            :class="[
              `is-${node.kind}`,
              { 'is-active': selectedId === node.id, 'is-dim': selectedId && selectedId !== node.id },
            ]"
            :transform="`translate(${node.x} ${node.y})`"
            role="button"
            tabindex="0"
            :aria-pressed="selectedId === node.id"
            :aria-label="`${node.label}: ${node.role}`"
            data-cursor="hover"
            @click="selectNode(node.id)"
            @keydown="onNodeKeydown($event, node.id)"
          >
            <circle class="infra-map__node-glow" r="52" fill="url(#infra-node-glow)" />

            <rect class="infra-map__node-hit" x="-44" y="-44" width="88" height="88" rx="6" />
            <rect class="infra-map__node-card" x="-40" y="-40" width="80" height="80" rx="5" />
            <rect class="infra-map__node-frame" x="-40" y="-40" width="80" height="80" rx="5" />
            <path class="infra-map__node-bracket infra-map__node-bracket--tl" d="M -40 -28 V -40 H -28" />
            <path class="infra-map__node-bracket infra-map__node-bracket--tr" d="M 28 -40 H 40 V -28" />
            <path class="infra-map__node-bracket infra-map__node-bracket--bl" d="M -40 28 V 40 H -28" />
            <path class="infra-map__node-bracket infra-map__node-bracket--br" d="M 28 40 H 40 V 28" />

            <text class="infra-map__node-code" x="-28" y="-24">{{ node.code }}</text>

            <g
              class="infra-map__node-icon"
              transform="translate(-12 -10)"
              fill="none"
              stroke="currentColor"
              stroke-width="1.55"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                v-for="(d, index) in NODE_ICONS[node.id]"
                :key="`${node.id}-${index}`"
                :d="d"
              />
            </g>

            <text class="infra-map__node-label" y="54" text-anchor="middle">{{ node.label }}</text>
            <text class="infra-map__node-role" y="68" text-anchor="middle">{{ node.role }}</text>
          </g>
        </g>
      </svg>
    </div>

    <aside
      v-if="selectedNode"
      class="infra-map__detail"
      aria-live="polite"
    >
      <div class="infra-map__detail-top font-mono">
        <span>{{ selectedNode.code }}</span>
        <span>{{ copy.t('infra.inspect') }}</span>
      </div>
      <div class="infra-map__detail-body">
        <div class="infra-map__detail-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path
              v-for="(d, index) in NODE_ICONS[selectedNode.id]"
              :key="`detail-${selectedNode.id}-${index}`"
              :d="d"
            />
          </svg>
        </div>
        <div>
          <h3 class="infra-map__detail-title font-display">{{ selectedNode.label }}</h3>
          <p class="infra-map__detail-role font-mono">{{ selectedNode.role }}</p>
          <p class="infra-map__detail-text">{{ selectedBody }}</p>
        </div>
      </div>
    </aside>

    <ul class="infra-map__legend font-mono">
      <li><span class="is-edge" />{{ copy.t('infra.legend.edge') }}</li>
      <li><span class="is-core" />{{ copy.t('infra.legend.core') }}</li>
      <li><span class="is-service" />{{ copy.t('infra.legend.service') }}</li>
      <li class="infra-map__legend-note">{{ copy.t('infra.legend.packets') }}</li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.infra-map {
  position: relative;
  border: 1px solid rgba(56, 150, 90, 0.2);
  background: rgba(4, 7, 6, 0.96);
  overflow: hidden;
  isolation: isolate;
}

.infra-map__atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.infra-map__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(28px);
  opacity: 0.55;

  &--a {
    width: 18rem;
    height: 18rem;
    top: -6rem;
    left: -4rem;
    background: radial-gradient(circle, rgba(56, 150, 90, 0.28), transparent 68%);
  }

  &--b {
    width: 16rem;
    height: 16rem;
    right: -3rem;
    bottom: -5rem;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.14), transparent 70%);
  }
}

.infra-map__scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    transparent 0,
    transparent 3px,
    rgba(56, 150, 90, 0.025) 3px,
    rgba(56, 150, 90, 0.025) 4px
  );
  mask-image: linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent);
  opacity: 0.7;
}

.infra-map__head,
.infra-map__flow,
.infra-map__stage,
.infra-map__detail,
.infra-map__legend {
  position: relative;
  z-index: 1;
}

.infra-map__head {
  display: grid;
  gap: $space-4;
  padding: $space-5 $space-5 0;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.4fr) minmax(14rem, 0.8fr);
    align-items: end;
    gap: $space-6;
    padding-bottom: $space-4;
  }
}

.infra-map__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  margin: 0 0 $space-3;
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: $color-comms-light;
}

.infra-map__live {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $color-comms-light;
  box-shadow: 0 0 0 0 rgba(80, 168, 114, 0.5);
  animation: infra-live 1.8s ease-out infinite;
}

.infra-map__title {
  margin: 0 0 $space-3;
  font-size: clamp(1.7rem, 3.4vw, 2.35rem);
  letter-spacing: -0.035em;
  line-height: 0.95;
}

.infra-map__lead {
  margin: 0;
  max-width: 44ch;
  color: $color-text-muted;
  font-size: $text-sm;
  line-height: $leading-relaxed;
}

.infra-map__meters {
  display: grid;
  gap: $space-3;
  padding-bottom: $space-4;

  @media (min-width: 900px) {
    padding-bottom: 0;
  }
}

.infra-map__meter {
  display: grid;
  gap: 0.35rem;
  padding: $space-3 $space-4;
  border: 1px solid rgba(56, 150, 90, 0.2);
  background:
    linear-gradient(180deg, rgba(56, 150, 90, 0.08), transparent 70%),
    rgba(8, 12, 10, 0.72);

  span {
    font-size: 0.55rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  strong {
    font-size: 1.35rem;
    color: $color-gold-light;
    letter-spacing: 0.04em;
  }

  i {
    display: block;
    height: 6px;
    border: 1px solid rgba(56, 150, 90, 0.25);
    background: rgba(0, 0, 0, 0.35);
    overflow: hidden;

    b {
      display: block;
      height: 100%;
      background: repeating-linear-gradient(
        90deg,
        $color-comms 0,
        $color-comms 5px,
        $color-comms-light 5px,
        $color-comms-light 7px
      );
      box-shadow: 0 0 10px rgba(80, 168, 114, 0.45);
    }
  }
}

.infra-map__status {
  margin: 0;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $color-text-faint;

  @media (min-width: 900px) { justify-self: end; }
}

.infra-map__flow {
  list-style: none;
  display: grid;
  gap: $space-2;
  margin: 0;
  padding: $space-4 $space-5;
  border-top: 1px solid rgba(56, 150, 90, 0.1);
  border-bottom: 1px solid rgba(56, 150, 90, 0.1);

  @media (min-width: 820px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: $space-3;
  }

  li {
    position: relative;
    display: grid;
    gap: 0.35rem;
    min-height: 4.4rem;
    padding: $space-3;
    border: 1px solid rgba(56, 150, 90, 0.16);
    background:
      linear-gradient(160deg, rgba(56, 150, 90, 0.1), transparent 55%),
      rgba(8, 12, 10, 0.7);
  }
}

.infra-map__flow-code {
  font-size: 0.55rem;
  letter-spacing: 0.16em;
  color: $color-comms-light;
}

.infra-map__flow-label {
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: $color-text-muted;
  line-height: 1.35;
}

.infra-map__flow-arrow {
  display: none;

  @media (min-width: 820px) {
    display: block;
    position: absolute;
    top: 50%;
    right: -0.7rem;
    width: 0.7rem;
    height: 1px;
    background: rgba(80, 168, 114, 0.45);
    transform: translateY(-50%);

    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: -3px;
      border: 3px solid transparent;
      border-left-color: rgba(80, 168, 114, 0.55);
    }
  }
}

.infra-map__stage {
  padding: $space-3 $space-2 $space-2;
  overflow-x: auto;
  scrollbar-width: thin;

  @media (max-width: 700px) {
    padding: $space-2 0;
    overflow: hidden;
  }
}

.infra-map__svg {
  display: block;
  width: 100%;
  min-width: 760px;
  height: auto;

  @media (max-width: 700px) { min-width: 0; }
}

.infra-map__grid line {
  stroke: rgba(56, 150, 90, 0.055);
  stroke-width: 1;
}

.infra-map__spine {
  stroke: url(#infra-beam);
  stroke-width: 18;
  opacity: 0.22;
  filter: blur(1px);
}

.infra-map__link {
  stroke: rgba(80, 168, 114, 0.2);
  stroke-width: 1.3;

  &.is-primary {
    stroke: rgba(80, 168, 114, 0.34);
    stroke-width: 1.7;
  }
}

.infra-map__link-flow {
  stroke: rgba(125, 206, 160, 0.5);
  stroke-width: 1.15;
  stroke-dasharray: 4 11;
  opacity: 0.4;

  &.is-primary {
    stroke: rgba(212, 175, 55, 0.55);
    stroke-dasharray: 6 10;
    opacity: 0.55;
  }
}

.infra-map--motion .infra-map__link-flow {
  animation-name: infra-dash;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.infra-map__packet {
  fill: #8fd6ad;

  &.is-primary {
    fill: #d4bd6a;
  }
}

.infra-map__packet-glow {
  fill: rgba(125, 206, 160, 0.28);
}

.infra-map__pulse-soft {
  fill: rgba(125, 206, 160, 0.45);
}

.infra-map__node-card {
  fill: url(#infra-card-fill);
  stroke: rgba(80, 168, 114, 0.28);
  stroke-width: 1;
}

.infra-map__node-frame {
  fill: none;
  stroke: rgba(255, 255, 255, 0.03);
  stroke-width: 1;
}

.infra-map__node-bracket {
  fill: none;
  stroke: rgba(80, 168, 114, 0.7);
  stroke-width: 1.4;
}

.infra-map__node-code {
  fill: rgba(80, 168, 114, 0.7);
  font-family: $font-mono;
  font-size: 7px;
  letter-spacing: 0.12em;
}

.infra-map__node-icon {
  color: $color-comms-light;
}

.infra-map__node.is-core {
  .infra-map__node-card {
    stroke: rgba(212, 175, 55, 0.42);
  }

  .infra-map__node-bracket {
    stroke: rgba(212, 175, 55, 0.75);
  }

  .infra-map__node-code {
    fill: rgba(212, 175, 55, 0.75);
  }

  .infra-map__node-icon {
    color: $color-gold-light;
  }
}

.infra-map__node.is-service {
  .infra-map__node-card {
    stroke: rgba(80, 168, 114, 0.22);
  }

  .infra-map__node-bracket {
    stroke: rgba(80, 168, 114, 0.45);
  }
}

.infra-map__node-label {
  fill: rgba(232, 241, 236, 0.94);
  font-family: $font-mono;
  font-size: 10px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.infra-map__node-role {
  fill: rgba(232, 241, 236, 0.42);
  font-family: $font-mono;
  font-size: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.infra-map__node {
  cursor: pointer;
  outline: none;
  transition: opacity 0.25s ease;

  &:focus-visible .infra-map__node-frame {
    stroke: rgba(143, 214, 173, 0.55);
  }
}

.infra-map__node-hit {
  fill: transparent;
  pointer-events: all;
}

.infra-map__node.is-dim {
  opacity: 0.42;
}

.infra-map__node.is-active {
  opacity: 1;

  .infra-map__node-card {
    stroke: rgba(143, 214, 173, 0.7);
    filter: drop-shadow(0 0 10px rgba(80, 168, 114, 0.28));
  }

  .infra-map__node-bracket {
    stroke: rgba(143, 214, 173, 0.95);
  }

  .infra-map__node-glow {
    opacity: 1;
  }
}

.infra-map__node.is-core.is-active {
  .infra-map__node-card {
    stroke: rgba(232, 201, 104, 0.75);
    filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.28));
  }

  .infra-map__node-bracket {
    stroke: rgba(232, 201, 104, 0.95);
  }
}

.infra-map__detail {
  margin: 0 $space-5 $space-4;
  padding: $space-4 $space-5;
  border: 1px solid rgba(80, 168, 114, 0.22);
  background:
    linear-gradient(135deg, rgba(80, 168, 114, 0.08), transparent 55%),
    rgba(8, 14, 11, 0.72);
}

.infra-map__detail-top {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
  margin-bottom: $space-3;
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(80, 168, 114, 0.72);
}

.infra-map__detail-body {
  display: flex;
  gap: $space-4;
  align-items: flex-start;
}

.infra-map__detail-icon {
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(80, 168, 114, 0.35);
  color: $color-comms-light;
  background: rgba(80, 168, 114, 0.08);

  svg {
    width: 22px;
    height: 22px;
  }
}

.infra-map__detail-title {
  margin: 0 0 $space-1;
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  letter-spacing: 0.02em;
  color: $color-text;
}

.infra-map__detail-role {
  margin: 0 0 $space-2;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(80, 168, 114, 0.78);
}

.infra-map__detail-text {
  margin: 0;
  max-width: 54ch;
  font-size: 0.92rem;
  line-height: 1.55;
  color: rgba(232, 241, 236, 0.72);
}

.infra-map__legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: $space-4;
  align-items: center;
  margin: 0;
  padding: $space-3 $space-5 $space-4;
  border-top: 1px solid rgba(56, 150, 90, 0.12);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $color-text-faint;

  li {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
  }

  span {
    width: 10px;
    height: 10px;
    border: 1px solid rgba(80, 168, 114, 0.45);
    border-radius: 2px;

    &.is-core {
      border-color: rgba(212, 175, 55, 0.55);
      background: rgba(212, 175, 55, 0.28);
    }

    &.is-edge {
      background: rgba(80, 168, 114, 0.4);
    }

    &.is-service {
      background: rgba(80, 168, 114, 0.14);
    }
  }
}

.infra-map__legend-note {
  margin-left: auto;
  color: rgba(80, 168, 114, 0.7);
}

@keyframes infra-dash {
  to { stroke-dashoffset: -140; }
}

@keyframes infra-live {
  0% { box-shadow: 0 0 0 0 rgba(80, 168, 114, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(80, 168, 114, 0); }
  100% { box-shadow: 0 0 0 0 rgba(80, 168, 114, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .infra-map__live,
  .infra-map__link-flow {
    animation: none;
  }
}
</style>
