<script setup lang="ts">
const props = defineProps<{
  progress: number
  target: string
  strategy: 'mobile' | 'desktop'
}>()

const copy = useSectionTranslations('websiteScanner')
const reducedMotion = usePreferredReducedMotion()

const BOOT_LINES = [
  'CONNECTION ESTABLISHED',
  'HANDSHAKE COMPLETE',
  'TESTING NOW',
  'INITIALIZING TARGET ANALYSIS',
  'RESOLVING PUBLIC ENDPOINT',
  'ESTABLISHING MEASUREMENT PROFILE',
  'RUNNING PERFORMANCE AUDIT',
  'ANALYZING RENDER PIPELINE',
  'INSPECTING CORE WEB VITALS',
  'CHECKING DOCUMENT STRUCTURE',
  'ANALYZING SEARCH VISIBILITY',
  'VERIFYING ACCESSIBILITY SIGNALS',
  'PROCESSING LIGHTHOUSE TELEMETRY',
  'CORRELATING AUDIT RESULTS',
  'CALCULATING PRIORITY MATRIX',
  'GENERATING HUMAN-READABLE REPORT',
] as const

const HEX = '0123456789ABCDEF'

function hx(n: number) {
  let s = ''
  for (let i = 0; i < n; i++) s += HEX[Math.floor(Math.random() * 16)]
  return s
}

function pad(n: number, size = 2) {
  return String(n).padStart(size, '0')
}

function stamp() {
  const d = new Date()
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(Math.floor(d.getUTCMilliseconds() / 10))}`
}

function randomDecorLine() {
  const kinds = [
    () => `${stamp()}  CH/${hx(2)}  ${hx(8)}-${hx(4)}`,
    () => `AUTH  ok  cipher=TLS_AES_${[128, 256][Math.floor(Math.random() * 2)]}_GCM`,
    () => `RTT   ${20 + Math.floor(Math.random() * 80)}ms  hop=${1 + Math.floor(Math.random() * 4)}`,
    () => `HASH  sha256:${hx(12)}…${hx(4)}`,
    () => `NODE  eu-ams-${pad(1 + Math.floor(Math.random() * 9), 2)}  alive`,
    () => `PERF  sample=${hx(6)}  weight=${(Math.random()).toFixed(2)}`,
  ]
  return kinds[Math.floor(Math.random() * kinds.length)]!()
}

interface PacketRow {
  id: number
  time: string
  channel: string
  payload: string
  size: string
  state: 'sync' | 'ack' | 'load'
}

interface CipherBlock {
  id: number
  glyph: string
  level: 0 | 1 | 2 | 3
}

const COLS = 10
const BLOCK_COUNT = COLS * 6

const activeBoot = ref(0)
const logLines = ref<Array<{ kind: 'status' | 'decor'; text: string }>>([])
const streamA = ref(hx(44))
const streamB = ref(hx(44))
const streamC = ref(hx(36))
const sessionId = ref(hx(8))
const frameCount = ref(1000 + Math.floor(Math.random() * 4000))
const cipherCursor = ref(0)
const digestHead = ref(hx(8))
const digestTail = ref(hx(4))

const packets = ref<PacketRow[]>(
  Array.from({ length: 7 }, (_, i) => ({
    id: i,
    time: stamp(),
    channel: `0x${hx(3)}`,
    payload: `${hx(4)} ${hx(4)} ${hx(4)} ${hx(4)}`,
    size: `${40 + Math.floor(Math.random() * 180)}B`,
    state: (['sync', 'ack', 'load'] as const)[i % 3]!,
  })),
)

const cipherBlocks = ref<CipherBlock[]>(
  Array.from({ length: BLOCK_COUNT }, (_, i) => ({
    id: i,
    glyph: hx(1),
    level: (Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3),
  })),
)

const displayedProgress = computed(() => Math.min(100, Math.round(props.progress)))
const hostLabel = computed(() => props.target.replace(/^https?:\/\//, '').split('/')[0] || props.target)
const sealedCount = computed(() => Math.min(BLOCK_COUNT, Math.round((props.progress / 100) * BLOCK_COUNT)))
const cipherProgress = computed(() => Math.min(100, Math.round(props.progress * 0.92 + 4)))

let bootTimer: ReturnType<typeof setInterval> | null = null
let decorTimer: ReturnType<typeof setInterval> | null = null
let streamTimer: ReturnType<typeof setInterval> | null = null
let fxTimer: ReturnType<typeof setInterval> | null = null
let packetId = 7

function pushStatus(text: string) {
  logLines.value = [...logLines.value.slice(-11), { kind: 'status', text }]
}

function pushDecor() {
  logLines.value = [...logLines.value.slice(-11), { kind: 'decor', text: randomDecorLine() }]
}

onMounted(() => {
  pushStatus(BOOT_LINES[0]!)
  activeBoot.value = 0

  if (reducedMotion.value === 'reduce') {
    pushStatus(BOOT_LINES[2]!)
    return
  }

  bootTimer = setInterval(() => {
    const maxIdx = Math.min(
      BOOT_LINES.length - 1,
      Math.floor((props.progress / 94) * (BOOT_LINES.length - 1)),
    )
    if (maxIdx > activeBoot.value) {
      activeBoot.value = maxIdx
      pushStatus(BOOT_LINES[maxIdx]!)
    }
  }, 350)

  decorTimer = setInterval(() => pushDecor(), 520)

  streamTimer = setInterval(() => {
    streamA.value = hx(44)
    streamB.value = hx(44)
    streamC.value = hx(36)
    sessionId.value = hx(8)
    frameCount.value += 1 + Math.floor(Math.random() * 3)
  }, 110)

  fxTimer = setInterval(() => {
    cipherCursor.value = (cipherCursor.value + 1) % BLOCK_COUNT
    digestHead.value = hx(8)
    digestTail.value = hx(4)

    packetId += 1
    packets.value = [
      {
        id: packetId,
        time: stamp(),
        channel: `0x${hx(3)}`,
        payload: `${hx(4)} ${hx(4)} ${hx(4)} ${hx(4)}`,
        size: `${48 + Math.floor(Math.random() * 160)}B`,
        state: (['sync', 'ack', 'load'] as const)[Math.floor(Math.random() * 3)]!,
      },
      ...packets.value.slice(0, 6),
    ]

    const sealed = Math.min(BLOCK_COUNT, Math.round((props.progress / 100) * BLOCK_COUNT))
    cipherBlocks.value = cipherBlocks.value.map((block, i) => {
      if (i === cipherCursor.value || Math.random() > 0.82) {
        const nearSealed = i < sealed
        const roll = Math.random()
        const level = nearSealed
          ? (roll > 0.55 ? 3 : roll > 0.25 ? 2 : 1)
          : (roll > 0.7 ? 2 : roll > 0.4 ? 1 : 0)
        return {
          ...block,
          glyph: hx(1),
          level: level as 0 | 1 | 2 | 3,
        }
      }
      return block
    })
  }, 160)
})

onBeforeUnmount(() => {
  if (bootTimer) clearInterval(bootTimer)
  if (decorTimer) clearInterval(decorTimer)
  if (streamTimer) clearInterval(streamTimer)
  if (fxTimer) clearInterval(fxTimer)
})

watch(() => props.progress, (value) => {
  if (value >= 100) pushStatus(copy.t('scanner.status.ready'))
})
</script>

<template>
  <section
    class="audit-scanner"
    :class="{ 'audit-scanner--reduced': reducedMotion === 'reduce' }"
    aria-busy="true"
    :aria-label="copy.t('scanner.aria')"
  >
    <div class="audit-scanner__scanline" aria-hidden="true" />
    <div class="audit-scanner__vignette" aria-hidden="true" />

    <header class="audit-scanner__live font-mono" aria-live="polite">
      <span class="audit-scanner__pulse" aria-hidden="true" />
      <span>{{ BOOT_LINES[Math.min(activeBoot, BOOT_LINES.length - 1)] }}</span>
      <span class="audit-scanner__live-meta">SEC/{{ sessionId.slice(0, 4) }}</span>
      <span class="audit-scanner__live-pct">{{ displayedProgress }}%</span>
    </header>

    <div class="audit-scanner__grid">
      <div class="audit-scanner__col" aria-hidden="true">
        <aside class="audit-scanner__panel">
          <div class="audit-scanner__panel-head">
            <span>{{ copy.t('scanner.logLabel') }}</span>
            <span class="audit-scanner__panel-tag">LIVE</span>
          </div>
          <ul class="audit-scanner__log">
            <li
              v-for="(line, i) in logLines"
              :key="`${i}-${line.text}`"
              :class="line.kind === 'decor' ? 'is-decor' : 'is-status'"
            >
              <span class="audit-scanner__log-prefix">{{ line.kind === 'decor' ? '·' : '›' }}</span>
              {{ line.text }}
            </li>
          </ul>
        </aside>

        <aside class="audit-scanner__panel audit-scanner__panel--packets">
          <div class="audit-scanner__panel-head">
            <span>PACKET TRACE</span>
            <span class="audit-scanner__panel-tag">ENC</span>
          </div>
          <div class="audit-scanner__packets">
            <div class="audit-scanner__packets-head font-mono">
              <span>TIME</span>
              <span>CH</span>
              <span>PAYLOAD</span>
              <span>SZ</span>
            </div>
            <div
              v-for="row in packets"
              :key="row.id"
              class="audit-scanner__packet font-mono"
              :data-state="row.state"
            >
              <span>{{ row.time }}</span>
              <span>{{ row.channel }}</span>
              <span>{{ row.payload }}</span>
              <span>{{ row.size }}</span>
              <i class="audit-scanner__packet-bar" />
            </div>
          </div>
        </aside>
      </div>

      <div class="audit-scanner__center">
        <div class="audit-scanner__mobile-rail audit-scanner__mobile-rail--top" aria-hidden="true">
          <div class="audit-scanner__mobile-rail-head font-mono">
            <span>PACKET TRACE</span>
            <span>{{ strategy.toUpperCase() }}</span>
          </div>
          <div class="audit-scanner__mobile-packets font-mono">
            <div
              v-for="row in packets.slice(0, 5)"
              :key="`m-${row.id}`"
              class="audit-scanner__mobile-packet"
              :data-state="row.state"
            >
              <span>{{ row.time }}</span>
              <span>{{ row.channel }}</span>
              <span>{{ row.payload }}</span>
            </div>
          </div>
        </div>

        <div class="audit-scanner__ring" aria-hidden="true">
          <div class="audit-scanner__ring-glow" />
          <div class="audit-scanner__ring-orbit" />
          <div class="audit-scanner__ring-orbit audit-scanner__ring-orbit--inner" />
          <div class="audit-scanner__ring-scan" />
          <div class="audit-scanner__ring-core">
            <span class="audit-scanner__pct font-mono">{{ displayedProgress }}</span>
            <span class="audit-scanner__pct-label font-mono">PCT</span>
          </div>
        </div>

        <div
          class="audit-scanner__bar"
          role="progressbar"
          :aria-valuenow="displayedProgress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span class="audit-scanner__bar-fill" :style="{ width: `${displayedProgress}%` }" />
        </div>

        <p class="audit-scanner__target font-mono">{{ target }}</p>

        <div class="audit-scanner__streams font-mono" aria-hidden="true">
          <p>{{ streamA }}</p>
          <p>{{ streamB }}</p>
          <p>{{ streamC }}</p>
        </div>

        <div class="audit-scanner__mobile-rail audit-scanner__mobile-rail--bottom" aria-hidden="true">
          <div class="audit-scanner__mobile-rail-head font-mono">
            <span>CIPHER BLOCKS</span>
            <span>{{ sealedCount }}/{{ BLOCK_COUNT }}</span>
          </div>
          <div class="audit-scanner__mobile-cipher">
            <span
              v-for="(block, i) in cipherBlocks"
              :key="`mc-${block.id}`"
              class="audit-scanner__cipher-cell"
              :class="{
                'is-hot': i === cipherCursor,
                [`is-l${block.level}`]: true,
                'is-sealed': i < sealedCount,
              }"
            >{{ block.glyph }}</span>
          </div>
        </div>
      </div>

      <div class="audit-scanner__col" aria-hidden="true">
        <aside class="audit-scanner__panel">
          <div class="audit-scanner__panel-head">
            <span>TARGET</span>
            <span class="audit-scanner__panel-tag">{{ strategy.toUpperCase() }}</span>
          </div>
          <div class="audit-scanner__meta">
            <div class="audit-scanner__meta-row">
              <span>HOST</span>
              <strong>{{ hostLabel }}</strong>
            </div>
            <div class="audit-scanner__meta-row">
              <span>ENGINE</span>
              <strong>LIGHTHOUSE</strong>
            </div>
            <div class="audit-scanner__meta-row">
              <span>AUDITS</span>
              <strong>{{ displayedProgress >= 100 ? 'COMPLETE' : 'RUNNING' }}</strong>
            </div>
            <div class="audit-scanner__meta-row">
              <span>SIGNALS</span>
              <strong>{{ displayedProgress >= 72 ? 'CORRELATED' : 'PROCESSING' }}</strong>
            </div>
            <div class="audit-scanner__meta-row">
              <span>SESSION</span>
              <strong>0x{{ sessionId }}</strong>
            </div>
            <div class="audit-scanner__meta-row">
              <span>FRAMES</span>
              <strong>{{ frameCount }}</strong>
            </div>
          </div>
        </aside>

        <aside class="audit-scanner__panel audit-scanner__panel--cipher">
          <div class="audit-scanner__panel-head">
            <span>CIPHER BLOCKS</span>
            <span class="audit-scanner__panel-tag">{{ cipherProgress }}%</span>
          </div>

          <div class="audit-scanner__cipher">
            <div class="audit-scanner__cipher-grid">
              <span
                v-for="(block, i) in cipherBlocks"
                :key="block.id"
                class="audit-scanner__cipher-cell"
                :class="{
                  'is-hot': i === cipherCursor,
                  [`is-l${block.level}`]: true,
                  'is-sealed': i < sealedCount,
                }"
              >{{ block.glyph }}</span>
            </div>

            <div class="audit-scanner__cipher-meta font-mono">
              <div class="audit-scanner__cipher-meta-row">
                <span>DIGEST</span>
                <strong>sha256:{{ digestHead }}...{{ digestTail }}</strong>
              </div>
              <div class="audit-scanner__cipher-meta-row">
                <span>SEALED</span>
                <strong>{{ sealedCount }}/{{ BLOCK_COUNT }}</strong>
              </div>
              <div class="audit-scanner__cipher-meta-row">
                <span>MODE</span>
                <strong>AES-GCM / {{ strategy.toUpperCase() }}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.audit-scanner {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  background:
    radial-gradient(ellipse 80% 55% at 50% 42%, rgba(56, 150, 90, 0.1), transparent 60%),
    $color-bg;
  overflow: hidden;

  @media (max-width: 959px) {
    padding-top: calc(env(safe-area-inset-top, 0px) + 2.75rem);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(56, 150, 90, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 150, 90, 0.045) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse at center, black 35%, transparent 85%);
    pointer-events: none;
    opacity: 0.9;
  }
}

.audit-scanner__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.45) 100%);
  z-index: 0;
}

.audit-scanner__scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(80, 168, 114, 0.045),
    transparent
  );
  animation: audit-scanline 4.5s linear infinite;
  z-index: 2;
  pointer-events: none;
}

.audit-scanner__live {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-2 $space-3;
  margin-bottom: $space-3;
  padding-bottom: $space-3;
  border-bottom: 1px solid rgba(56, 150, 90, 0.14);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $color-gold-light;
  min-width: 0;

  @media (min-width: 960px) {
    margin-bottom: $space-4;
    font-size: $text-xs;
    letter-spacing: 0.18em;
  }
}

.audit-scanner__pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $color-gold-light;
  box-shadow: 0 0 0 0 rgba(80, 168, 114, 0.55);
  animation: audit-pulse 1.8s ease-out infinite;
  flex-shrink: 0;
}

.audit-scanner__live-meta {
  color: $color-text-faint;
  letter-spacing: 0.14em;

  @media (max-width: 479px) {
    display: none;
  }
}

.audit-scanner__live-pct {
  margin-left: auto;
  color: $color-text;
  letter-spacing: 0.12em;
}

.audit-scanner__grid {
  position: relative;
  z-index: 1;
  flex: 1;
  display: grid;
  gap: $space-3;
  grid-template-columns: 1fr;
  min-height: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(17rem, 1fr) minmax(18rem, 1.2fr) minmax(17rem, 1fr);
  }
}

.audit-scanner__col {
  display: none;
  min-height: 0;

  @media (min-width: 960px) {
    display: grid;
    grid-template-rows: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: $space-3;
  }
}

.audit-scanner__panel {
  position: relative;
  border: 1px solid rgba(56, 150, 90, 0.16);
  border-radius: 2px;
  background:
    linear-gradient(180deg, rgba(56, 150, 90, 0.05), transparent 28%),
    rgba(8, 12, 10, 0.88);
  padding: $space-3 $space-4 $space-4;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border-color: rgba(80, 168, 114, 0.45);
    border-style: solid;
    pointer-events: none;
  }

  &::before {
    top: 6px;
    left: 6px;
    border-width: 1px 0 0 1px;
  }

  &::after {
    right: 6px;
    bottom: 6px;
    border-width: 0 1px 1px 0;
  }
}

.audit-scanner__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  margin-bottom: $space-3;
  font-family: $font-mono;
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: $color-text-faint;
}

.audit-scanner__panel-tag {
  color: $color-gold-light;
  border: 1px solid rgba(80, 168, 114, 0.28);
  padding: 0.15rem 0.4rem;
  letter-spacing: 0.14em;
}

.audit-scanner__log {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.38rem;
  font-family: $font-mono;
  font-size: 0.66rem;
  line-height: 1.4;
  overflow: hidden;
  align-content: start;
  flex: 1;
}

.audit-scanner__log li.is-status {
  color: rgba(232, 241, 236, 0.78);
}

.audit-scanner__log li.is-decor {
  color: $color-text-faint;
}

.audit-scanner__log-prefix {
  color: $color-gold;
  margin-right: 0.35rem;
}

.audit-scanner__packets {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
}

.audit-scanner__packets-head,
.audit-scanner__packet {
  display: grid;
  grid-template-columns: 5.6rem 2.6rem 1fr 2.4rem;
  gap: 0.45rem;
  align-items: center;
}

.audit-scanner__packets-head {
  font-size: 0.55rem;
  letter-spacing: 0.14em;
  color: $color-text-faint;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(56, 150, 90, 0.12);
}

.audit-scanner__packet {
  position: relative;
  font-size: 0.6rem;
  letter-spacing: 0.04em;
  color: rgba(232, 241, 236, 0.7);
  padding: 0.38rem 0 0.45rem;
  border-bottom: 1px solid rgba(56, 150, 90, 0.06);
  animation: packet-in 0.45s $ease-out-expo;

  &[data-state='sync'] { color: rgba(80, 168, 114, 0.9); }
  &[data-state='ack'] { color: rgba(232, 241, 236, 0.62); }
  &[data-state='load'] { color: rgba(212, 162, 76, 0.85); }
}

.audit-scanner__packet-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(80, 168, 114, 0.55), transparent 70%);
  transform-origin: left center;
  animation: packet-bar 1.8s ease-out;
}

.audit-scanner__center {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: $space-4;
  padding: $space-5 $space-4;
  border: 1px solid rgba(56, 150, 90, 0.16);
  border-radius: 2px;
  background:
    radial-gradient(circle at center, rgba(56, 150, 90, 0.1), transparent 55%),
    rgba(8, 12, 10, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  min-width: 0;
  width: 100%;
  overflow: hidden;

  @media (max-width: 959px) {
    align-content: start;
    gap: $space-3;
    padding: $space-4 $space-3;
    overflow-y: auto;
  }
}

.audit-scanner__mobile-rail {
  width: 100%;
  min-width: 0;
  display: grid;
  gap: $space-2;
  padding: $space-3;
  border: 1px solid rgba(56, 150, 90, 0.14);
  background: rgba(0, 0, 0, 0.28);

  @media (min-width: 960px) {
    display: none;
  }
}

.audit-scanner__mobile-rail-head {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: $color-text-faint;
}

.audit-scanner__mobile-packets {
  display: grid;
  gap: 0.28rem;
  width: 100%;
  min-width: 0;
}

.audit-scanner__mobile-packet {
  display: grid;
  grid-template-columns: 5.2rem 2.4rem minmax(0, 1fr);
  gap: 0.4rem;
  font-size: 0.58rem;
  letter-spacing: 0.04em;
  color: rgba(232, 241, 236, 0.62);
  min-width: 0;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &[data-state='sync'] { color: rgba(80, 168, 114, 0.9); }
  &[data-state='ack'] { color: rgba(232, 241, 236, 0.55); }
  &[data-state='load'] { color: rgba(212, 162, 76, 0.85); }
}

.audit-scanner__mobile-cipher {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 2px;
  width: 100%;
}

.audit-scanner__ring {
  position: relative;
  width: min(240px, 52vw);
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;

  @media (min-width: 960px) {
    width: min(280px, 58vw);
  }
}

.audit-scanner__ring-glow {
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56, 150, 90, 0.16), transparent 68%);
  filter: blur(8px);
}

.audit-scanner__ring-orbit {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(56, 150, 90, 0.28);

  &--inner {
    inset: 16%;
    border-color: rgba(56, 150, 90, 0.16);
  }
}

.audit-scanner__ring-scan {
  position: absolute;
  inset: 6%;
  border-radius: 50%;
  border: 1px dashed rgba(80, 168, 114, 0.28);
  animation: audit-spin 14s linear infinite;
}

.audit-scanner__ring-core {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.15rem;
}

.audit-scanner__pct {
  font-size: clamp(3rem, 7vw, 4.2rem);
  line-height: 0.9;
  color: $color-text;
  letter-spacing: -0.05em;
  text-shadow: 0 0 40px rgba(80, 168, 114, 0.25);
}

.audit-scanner__pct-label {
  font-size: 0.65rem;
  letter-spacing: 0.28em;
  color: $color-gold;
}

.audit-scanner__bar {
  width: min(320px, 82%);
  height: 2px;
  background: rgba(56, 150, 90, 0.12);
  overflow: hidden;
}

.audit-scanner__bar-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, rgba(30, 102, 64, 0.9), $color-gold-light);
  box-shadow: 0 0 12px rgba(80, 168, 114, 0.45);
  transition: width 80ms linear;
}

.audit-scanner__target {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: $color-text-muted;
  text-align: center;
  word-break: break-all;
}

.audit-scanner__streams {
  width: min(360px, 90%);
  display: grid;
  gap: 0.2rem;
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  color: rgba(80, 168, 114, 0.38);
  text-align: center;

  p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }

  @media (max-width: 959px) {
    display: none;
  }
}

.audit-scanner__meta {
  display: grid;
  gap: 0;
}

.audit-scanner__meta-row {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(56, 150, 90, 0.08);
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  span { color: $color-text-faint; }
  strong {
    color: rgba(232, 241, 236, 0.88);
    font-weight: 500;
    text-align: right;
    word-break: break-all;
  }
}

.audit-scanner__cipher {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: $space-3;
}

.audit-scanner__cipher-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 3px;
  align-content: start;
  min-height: 0;
  padding: 2px;
}

.audit-scanner__cipher-cell {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  font-family: $font-mono;
  font-size: clamp(0.55rem, 0.85vw, 0.72rem);
  letter-spacing: 0;
  border: 1px solid rgba(56, 150, 90, 0.1);
  background: rgba(0, 0, 0, 0.28);
  color: rgba(69, 87, 81, 0.85);
  transition:
    background 160ms ease,
    color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;

  &.is-l1 {
    color: rgba(123, 143, 134, 0.9);
    border-color: rgba(56, 150, 90, 0.16);
    background: rgba(56, 150, 90, 0.05);
  }

  &.is-l2 {
    color: rgba(80, 168, 114, 0.88);
    border-color: rgba(80, 168, 114, 0.28);
    background: rgba(56, 150, 90, 0.1);
  }

  &.is-l3,
  &.is-sealed {
    color: $color-text;
    border-color: rgba(80, 168, 114, 0.42);
    background: rgba(56, 150, 90, 0.18);
    box-shadow: inset 0 0 0 1px rgba(80, 168, 114, 0.08);
  }

  &.is-hot {
    color: #fff;
    border-color: $color-gold-light;
    background: rgba(80, 168, 114, 0.38);
    box-shadow: 0 0 10px rgba(80, 168, 114, 0.35);
  }
}

.audit-scanner__cipher-meta {
  display: grid;
  gap: 0;
  border-top: 1px solid rgba(56, 150, 90, 0.12);
  padding-top: 0.35rem;
}

.audit-scanner__cipher-meta-row {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(56, 150, 90, 0.07);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  span { color: $color-text-faint; }
  strong {
    color: rgba(232, 241, 236, 0.88);
    font-weight: 500;
    text-align: right;
    word-break: break-all;
  }
}

.audit-scanner--reduced {
  .audit-scanner__ring-scan,
  .audit-scanner__scanline,
  .audit-scanner__pulse,
  .audit-scanner__packet,
  .audit-scanner__packet-bar {
    animation: none;
  }
}

@keyframes audit-spin {
  to { transform: rotate(360deg); }
}

@keyframes audit-scanline {
  from { top: -15%; }
  to { top: 110%; }
}

@keyframes audit-pulse {
  0% { box-shadow: 0 0 0 0 rgba(80, 168, 114, 0.5); opacity: 1; }
  70% { box-shadow: 0 0 0 10px rgba(80, 168, 114, 0); opacity: 0.7; }
  100% { box-shadow: 0 0 0 0 rgba(80, 168, 114, 0); opacity: 1; }
}

@keyframes packet-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes packet-bar {
  from { transform: scaleX(0); opacity: 1; }
  to { transform: scaleX(1); opacity: 0.15; }
}
</style>
