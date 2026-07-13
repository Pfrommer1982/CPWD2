<script setup lang="ts">
import {
  buildTacticalDataCells,
  formatTacticalLine,
  spinTacticalValue,
  type TacticalDataCell,
} from '~/utils/tacticalDataField'

const props = withDefaults(defineProps<{
  count?: number
  seed?: number
  liveCount?: number
}>(), {
  count: 24,
  seed: 3,
  liveCount: 2,
})

const rootRef = ref<HTMLElement | null>(null)
const cells = computed(() => buildTacticalDataCells(props.count, props.seed, props.liveCount))
const liveText = ref<Record<number, string>>({})

let observer: IntersectionObserver | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null
const { enableHeavyFx } = useGraphicsCapability()

function syncLiveCells(source: TacticalDataCell[]) {
  const next: Record<number, string> = { ...liveText.value }
  for (const cell of source) {
    if (!cell.live) continue
    next[cell.id] = formatTacticalLine(cell.prefix, cell.hex, spinTacticalValue(), cell.suffix)
  }
  liveText.value = next
}

function startLiveLoop() {
  stopLiveLoop()
  syncLiveCells(cells.value)
  tickTimer = setInterval(() => syncLiveCells(cells.value), 140)
}

function stopLiveLoop() {
  if (tickTimer) clearInterval(tickTimer)
  tickTimer = null
}

function setupObserver() {
  const el = rootRef.value
  if (!el || !enableHeavyFx.value) return

  observer?.disconnect()
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) startLiveLoop()
      else stopLiveLoop()
    },
    { threshold: 0.12 },
  )
  observer.observe(el)
}

watch(cells, (next) => {
  if (tickTimer) syncLiveCells(next)
}, { deep: true })

onMounted(() => {
  for (const cell of cells.value) {
    if (cell.live) liveText.value[cell.id] = cell.text
  }

  if (!enableHeavyFx.value) return
  setupObserver()
})

onUnmounted(() => {
  stopLiveLoop()
  observer?.disconnect()
})

function displayText(cell: TacticalDataCell) {
  if (!cell.live) return cell.text
  return liveText.value[cell.id] ?? cell.text
}
</script>

<template>
  <div ref="rootRef" class="tactical-data" aria-hidden="true">
    <span
      v-for="cell in cells"
      :key="cell.id"
      class="tactical-data__cell font-mono"
      :class="{ 'tactical-data__cell--live': cell.live }"
      :style="{
        left: cell.left,
        top: cell.top,
        opacity: cell.opacity,
        fontSize: cell.size,
      }"
    >{{ displayText(cell) }}</span>
  </div>
</template>

<style lang="scss" scoped>
.tactical-data {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  mask-image: radial-gradient(ellipse 92% 82% at 50% 48%, black 25%, transparent 85%);

  &__cell {
    position: absolute;
    letter-spacing: 0.06em;
    color: rgba($color-gold-light, 0.85);
    white-space: nowrap;
    user-select: none;

    &--live {
      color: rgba($color-gold-light, 0.95);
      text-shadow: 0 0 12px rgba(56, 150, 90, 0.22);
    }
  }
}
</style>
