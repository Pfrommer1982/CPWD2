<script setup lang="ts">
import type { FeatureId, ProjectTypeId } from '~/types/project-estimate'

const copy = useSectionTranslations('projectEstimator')
const { animateMotion } = useGraphicsCapability()
const summaryRef = ref<HTMLElement | null>(null)
const stepsRailRef = ref<HTMLElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const requestFormRef = ref<HTMLElement | null>(null)

const {
  config,
  projectCode,
  stepIndex,
  currentStep,
  visibleSteps,
  estimate,
  canCalculate,
  showResult,
  calculating,
  calculatingLine,
  statusLine,
  requestOpen,
  pricing,
  setType,
  setPages,
  setDesign,
  toggleFeature,
  setContent,
  setHosting,
  nextStep,
  prevStep,
  goToStep,
  runCalculation,
  reset,
  openRequest,
} = useProjectEstimate()

const featureIds = Object.keys(pricing.features) as FeatureId[]
const typeIds = Object.keys(pricing.types) as ProjectTypeId[]
const copied = ref(false)

const decoding = ref(false)
const decryptProgress = ref(100)
const scrambleLines = ref<string[]>([])
const scrambleLabel = ref('')
const slideDir = ref<'forward' | 'back'>('forward')
let raf = 0
let transitioning = false

const SCRAMBLE_DURATION = 560
const CIPHER = '0123456789ABCDEF░▒▓█▌▐/<>=+*#@'

const decryptProgressText = computed(() => String(decryptProgress.value).padStart(3, '0'))
const isLastStep = computed(() => stepIndex.value >= visibleSteps.value.length - 1)
const progressPct = computed(() => {
  const total = Math.max(1, visibleSteps.value.length)
  return Math.round(((stepIndex.value + 1) / total) * 100)
})
const canAdvance = computed(() => canAdvanceFrom(currentStep.value) && !decoding.value)
const canGoBack = computed(() => stepIndex.value > 0 && !calculating.value && !decoding.value)
const maxUnlocked = ref(0)

function scramble(seed: string, length = 22) {
  let out = ''
  for (let i = 0; i < length; i++) {
    const idx = (seed.charCodeAt(i % seed.length) + i * 7) % CIPHER.length
    out += CIPHER[idx]
  }
  return out
}

function randomLine(length = 44) {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CIPHER[Math.floor(Math.random() * CIPHER.length)]!
  }
  return out
}

function buildScrambleFrame(target: string, reveal = 0) {
  const lines: string[] = []
  const width = 44
  const clean = target.toUpperCase().padEnd(width, ' ').slice(0, width)
  let resolved = ''
  for (let i = 0; i < width; i++) {
    if (i / width < reveal && clean[i] !== ' ') resolved += clean[i]
    else if (i / width < reveal) resolved += ' '
    else resolved += CIPHER[Math.floor(Math.random() * CIPHER.length)]!
  }
  lines.push(resolved)
  for (let i = 0; i < 5; i++) lines.push(randomLine(width))
  return lines
}

async function transitionSteps(
  direction: 'forward' | 'back',
  apply: () => void,
  targetLabel: string,
) {
  if (transitioning || calculating.value) return
  transitioning = true
  slideDir.value = direction

  // Always apply the step change first so tab clicks never fail.
  apply()
  showResult.value = false

  try {
    if (!import.meta.client || !animateMotion.value) return

    decoding.value = true
    scrambleLabel.value = targetLabel
    scrambleLines.value = buildScrambleFrame(targetLabel, 0)
    decryptProgress.value = 0

    await new Promise<void>((resolve) => {
      const start = performance.now()

      const tick = (now: number) => {
        const t = Math.min((now - start) / SCRAMBLE_DURATION, 1)
        decryptProgress.value = Math.round(t * 20) * 5
        const reveal = t < 0.45 ? 0 : (t - 0.45) / 0.55
        scrambleLines.value = buildScrambleFrame(targetLabel, reveal)

        if (t < 1) {
          raf = requestAnimationFrame(tick)
        }
        else {
          raf = 0
          resolve()
        }
      }
      raf = requestAnimationFrame(tick)
    })
  }
  finally {
    if (import.meta.client && raf) cancelAnimationFrame(raf)
    raf = 0
    transitioning = false
    decoding.value = false
    decryptProgress.value = 100
    scrambleLines.value = []
  }
}

function formatEuro(value: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function stepSummary(step: string) {
  if (step === 'type' && config.type) return copy.t(`type.${config.type}.label`)
  if (step === 'pages') return `${config.pages}`
  if (step === 'design') return copy.t(`design.${config.design}.label`)
  if (step === 'features') {
    if (!config.features.length) return copy.t('summary.none')
    return config.features.map(id => copy.t(`features.${id}.label`)).join(' / ')
  }
  if (step === 'content') return copy.t(`content.${config.content}.label`)
  if (step === 'hosting') return copy.t(`hosting.${config.hosting}.label`)
  return ''
}

function canAdvanceFrom(step: string) {
  if (step === 'type') return Boolean(config.type)
  if (step === 'pages') return config.pages >= 1
  if (step === 'design') return Boolean(config.design)
  if (step === 'features') return true
  if (step === 'content') return Boolean(config.content)
  if (step === 'hosting') return Boolean(config.hosting)
  return false
}

function isStepReachable(index: number) {
  if (calculating.value) return false
  if (index < 0 || index >= visibleSteps.value.length) return false
  // Any step already visited, or all steps once a result exists
  if (showResult.value) return true
  if (index <= maxUnlocked.value) return true
  if (index === stepIndex.value + 1 && canAdvanceFrom(currentStep.value)) return true
  return false
}

function openStep(index: number) {
  if (index === stepIndex.value && !showResult.value) return
  if (!isStepReachable(index) || transitioning || calculating.value) return
  const direction = index < stepIndex.value ? 'back' : 'forward'
  const step = visibleSteps.value[index]
  if (!step) return
  void transitionSteps(direction, () => {
    goToStep(index)
    if (index > maxUnlocked.value) maxUnlocked.value = index
  }, copy.t(`steps.${step}`))
}

function goBack() {
  if (!canGoBack.value) return
  const prev = visibleSteps.value[stepIndex.value - 1]
  if (!prev) return
  void transitionSteps('back', () => prevStep(), copy.t(`steps.${prev}`))
}

function confirmAndAdvance() {
  if (!canAdvance.value || calculating.value || transitioning) return

  if (isLastStep.value) {
    void onCalculate()
    return
  }

  const nextIndex = stepIndex.value + 1
  const next = visibleSteps.value[nextIndex]
  if (!next) return
  void transitionSteps('forward', () => {
    nextStep()
    if (nextIndex > maxUnlocked.value) maxUnlocked.value = nextIndex
  }, copy.t(`steps.${next}`))
}

function pickType(id: ProjectTypeId) {
  setType(id)
}

function pickDesign(id: 'clean' | 'custom' | 'showcase') {
  setDesign(id)
}

function pickContent(id: 'self' | 'polish' | 'full') {
  setContent(id)
}

function pickHosting(id: 'self' | 'cpwd') {
  setHosting(id)
}

function onToggleFeature(id: FeatureId) {
  toggleFeature(id)
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(projectCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1600)
  }
  catch {
    copied.value = false
  }
}

async function onOpenRequest() {
  openRequest()
  await nextTick()
  if (!import.meta.client || !requestFormRef.value) return

  const { scrollTo } = useLenis()
  try {
    scrollTo(requestFormRef.value, { offset: -24 })
  }
  catch {
    requestFormRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

async function onCalculate() {
  await runCalculation()
  await nextTick()
  if (import.meta.client && window.matchMedia('(max-width: 959px)').matches) {
    summaryRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function syncStepsRail() {
  if (!import.meta.client || !stepsRailRef.value) return
  const rail = stepsRailRef.value
  const active = rail.querySelector('.is-active') as HTMLElement | null
  if (!active) return
  const left = active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2
  rail.scrollTo({ left: Math.max(0, left), behavior: animateMotion.value ? 'smooth' : 'auto' })
}

watch(stepIndex, async (index) => {
  if (index > maxUnlocked.value) maxUnlocked.value = index
  await nextTick()
  syncStepsRail()
  if (viewportRef.value) viewportRef.value.scrollTop = 0
})

watch(showResult, (ready) => {
  if (ready) {
    maxUnlocked.value = Math.max(maxUnlocked.value, visibleSteps.value.length - 1)
  }
})

watch(() => config.type, (type) => {
  if (!type) maxUnlocked.value = 0
})

onBeforeUnmount(() => {
  if (import.meta.client && raf) cancelAnimationFrame(raf)
  raf = 0
})
</script>

<template>
  <div class="estimator" :class="{ 'estimator--result': showResult }">
    <div class="estimator__status font-mono" aria-live="polite">
      <span class="estimator__pulse" aria-hidden="true" />
      {{ statusLine ? copy.t(`status.${statusLine}`) : copy.t('summary.label') }}
    </div>

    <div class="estimator__layout">
      <div class="estimator__main">
        <div class="estimator-wizard">
          <div class="estimator-wizard__rail" aria-hidden="true">
            <div class="estimator-wizard__rail-meta font-mono">
              <span>{{ decoding ? copy.t('decrypt.decrypting') : 'CHANNEL' }}</span>
              <span>
                {{ decoding
                  ? `${decryptProgressText}%`
                  : `${String(stepIndex + 1).padStart(2, '0')} / ${String(visibleSteps.length).padStart(2, '0')}` }}
              </span>
            </div>
            <div class="estimator-wizard__rail-track">
              <div
                class="estimator-wizard__rail-fill"
                :class="{ 'is-decoding': decoding }"
                :style="{ width: `${decoding ? decryptProgress : progressPct}%` }"
              />
            </div>
          </div>

          <div
            ref="stepsRailRef"
            class="estimator-wizard__steps"
            role="tablist"
            :aria-label="copy.t('summary.label')"
          >
            <button
              v-for="(step, index) in visibleSteps"
              :key="step"
              type="button"
              class="estimator-wizard__step font-mono"
              :class="{
                'is-active': index === stepIndex,
                'is-sealed': index < stepIndex,
                'is-locked': !isStepReachable(index) && index !== stepIndex,
                'is-reachable': isStepReachable(index) && index !== stepIndex,
              }"
              role="tab"
              :aria-selected="index === stepIndex"
              :disabled="(!isStepReachable(index) && index !== stepIndex) || calculating"
              data-cursor="hover"
              @click="openStep(index)"
            >
              <span class="estimator-wizard__step-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="estimator-wizard__step-label">{{ copy.t(`steps.${step}`) }}</span>
              <span class="estimator-wizard__step-state">
                <template v-if="index < stepIndex">{{ copy.t('decrypt.sealed') }}</template>
                <template v-else-if="index === stepIndex">LIVE</template>
                <template v-else-if="isStepReachable(index)">READY</template>
                <template v-else>{{ copy.t('decrypt.encrypted') }}</template>
              </span>
              <span v-if="index < stepIndex" class="estimator-wizard__step-summary">{{ stepSummary(step) }}</span>
              <span v-else-if="index === stepIndex" class="estimator-wizard__step-summary is-live">LIVE CHANNEL</span>
              <span v-else-if="isStepReachable(index)" class="estimator-wizard__step-summary">{{ stepSummary(step) || copy.t('decrypt.unlock') }}</span>
              <span v-else class="estimator-wizard__step-cipher">{{ scramble(step) }}</span>
            </button>
          </div>

          <div class="estimator-wizard__stage">
            <div class="estimator__actions">
              <button
                v-if="canGoBack"
                type="button"
                class="btn-ghost"
                data-cursor="hover"
                @click="goBack"
              >
                {{ copy.t('nav.back') }}
              </button>
              <span v-else class="estimator__actions-spacer" aria-hidden="true" />
              <button
                type="button"
                class="btn-primary"
                :disabled="!canAdvance || calculating"
                data-cursor="hover"
                @click="confirmAndAdvance"
              >
                {{ isLastStep ? copy.t('nav.calculate') : copy.t('decrypt.continue') }}
              </button>
            </div>

            <div
              ref="viewportRef"
              class="estimator-wizard__viewport"
              :class="{ 'is-decoding': decoding }"
              data-lenis-prevent
            >
              <div
                v-if="decoding"
                class="estimator-wizard__scramble font-mono"
                aria-hidden="true"
              >
                <div class="estimator-wizard__scramble-head">
                  <span>{{ copy.t('decrypt.decrypting') }}</span>
                  <span>{{ decryptProgressText }}%</span>
                </div>
                <pre class="estimator-wizard__scramble-stream">{{ scrambleLines.join('\n') }}</pre>
              </div>

              <Transition
                :name="slideDir === 'back' ? 'estimator-slide-back' : 'estimator-slide'"
                mode="out-in"
              >
                <div
                  :key="currentStep"
                  class="estimator-wizard__pane"
                  :class="{ 'is-scrambled': decoding }"
                >
                <section v-if="currentStep === 'type'" class="estimator__panel">
                  <h2 class="estimator__panel-title font-display">{{ copy.t('type.title') }}</h2>
                  <div class="estimator__cards">
                    <button
                      v-for="id in typeIds"
                      :key="id"
                      type="button"
                      class="estimator-card"
                      :class="{ 'is-selected': config.type === id }"
                      data-cursor="hover"
                      @click="pickType(id)"
                    >
                      <span class="estimator-card__top font-mono">
                        <span>{{ copy.t('type.from') }}</span>
                        <strong>{{ formatEuro(pricing.types[id].base) }}</strong>
                      </span>
                      <span class="estimator-card__title font-display">{{ copy.t(`type.${id}.label`) }}</span>
                      <span class="estimator-card__body">{{ copy.t(`type.${id}.body`) }}</span>
                      <span v-if="copy.te(`type.${id}.note`)" class="estimator-card__note font-mono">
                        {{ copy.t(`type.${id}.note`) }}
                      </span>
                    </button>
                  </div>
                </section>

                <section v-else-if="currentStep === 'pages'" class="estimator__panel">
                  <h2 class="estimator__panel-title font-display">{{ copy.t('pages.title') }}</h2>
                  <p class="estimator__hint font-mono">
                    {{ copy.t('pages.included', { count: pricing.types[config.type || 'business'].includedPages }) }}
                  </p>
                  <div class="estimator__counter">
                    <button
                      type="button"
                      class="estimator__counter-btn"
                      :disabled="config.pages <= (pricing.types[config.type || 'business'].includedPages || 1)"
                      data-cursor="hover"
                      @click="setPages(config.pages - 1)"
                    >
                      -
                    </button>
                    <span class="estimator__counter-value font-display" aria-live="polite">{{ config.pages }}</span>
                    <button
                      type="button"
                      class="estimator__counter-btn"
                      :disabled="config.pages >= pricing.maxPages"
                      data-cursor="hover"
                      @click="setPages(config.pages + 1)"
                    >
                      +
                    </button>
                  </div>
                  <p class="estimator__hint font-mono">
                    {{ copy.t('pages.extra', { price: pricing.pagePrice }) }}
                  </p>
                  <p class="estimator__hint estimator__hint--reserve" aria-live="polite">
                    <template v-if="config.pages >= pricing.maxPages">
                      {{ copy.t('pages.overMax', { max: pricing.maxPages }) }}
                    </template>
                  </p>
                </section>

                <section v-else-if="currentStep === 'design'" class="estimator__panel">
                  <h2 class="estimator__panel-title font-display">{{ copy.t('design.title') }}</h2>
                  <div class="estimator__cards estimator__cards--three">
                    <button
                      v-for="id in (['clean', 'custom', 'showcase'] as const)"
                      :key="id"
                      type="button"
                      class="estimator-card"
                      :class="{ 'is-selected': config.design === id }"
                      data-cursor="hover"
                      @click="pickDesign(id)"
                    >
                      <span class="estimator-card__top font-mono">
                        <strong>{{ pricing.design[id].price ? `+ ${formatEuro(pricing.design[id].price)}` : formatEuro(0) }}</strong>
                      </span>
                      <span class="estimator-card__title font-display">{{ copy.t(`design.${id}.label`) }}</span>
                      <span class="estimator-card__body">{{ copy.t(`design.${id}.body`) }}</span>
                    </button>
                  </div>
                </section>

                <section v-else-if="currentStep === 'features'" class="estimator__panel">
                  <h2 class="estimator__panel-title font-display">{{ copy.t('features.title') }}</h2>
                  <p class="estimator__hint font-mono">{{ copy.t('features.multiHint') }}</p>
                  <div class="estimator__cards estimator__cards--features">
                    <button
                      v-for="id in featureIds"
                      :key="id"
                      type="button"
                      class="estimator-card estimator-card--toggle"
                      :class="{ 'is-selected': config.features.includes(id) }"
                      :aria-pressed="config.features.includes(id)"
                      data-cursor="hover"
                      @click="onToggleFeature(id)"
                    >
                      <span class="estimator-card__top font-mono">
                        <span>{{ pricing.features[id].custom ? copy.t('features.from') : '' }}</span>
                        <strong>+ {{ formatEuro(pricing.features[id].price) }}</strong>
                      </span>
                      <span class="estimator-card__title font-display">{{ copy.t(`features.${id}.label`) }}</span>
                      <span class="estimator-card__body">{{ copy.t(`features.${id}.body`) }}</span>
                    </button>
                  </div>
                </section>

                <section v-else-if="currentStep === 'content'" class="estimator__panel">
                  <h2 class="estimator__panel-title font-display">{{ copy.t('content.title') }}</h2>
                  <div class="estimator__cards estimator__cards--three">
                    <button
                      v-for="id in (['self', 'polish', 'full'] as const)"
                      :key="id"
                      type="button"
                      class="estimator-card"
                      :class="{ 'is-selected': config.content === id }"
                      data-cursor="hover"
                      @click="pickContent(id)"
                    >
                      <span class="estimator-card__top font-mono">
                        <strong>{{ pricing.content[id].price ? `+ ${formatEuro(pricing.content[id].price)}` : formatEuro(0) }}</strong>
                      </span>
                      <span class="estimator-card__title font-display">{{ copy.t(`content.${id}.label`) }}</span>
                      <span class="estimator-card__body">{{ copy.t(`content.${id}.body`) }}</span>
                    </button>
                  </div>
                </section>

                <section v-else-if="currentStep === 'hosting'" class="estimator__panel">
                  <h2 class="estimator__panel-title font-display">{{ copy.t('hosting.title') }}</h2>
                  <div class="estimator__cards estimator__cards--two">
                    <button
                      v-for="id in (['self', 'cpwd'] as const)"
                      :key="id"
                      type="button"
                      class="estimator-card"
                      :class="{ 'is-selected': config.hosting === id }"
                      data-cursor="hover"
                      @click="pickHosting(id)"
                    >
                      <span class="estimator-card__top font-mono">
                        <strong>
                          {{ id === 'cpwd' ? `${formatEuro(pricing.hosting.cpwd)} ${copy.t('hosting.perYear')}` : formatEuro(0) }}
                        </strong>
                      </span>
                      <span class="estimator-card__title font-display">{{ copy.t(`hosting.${id}.label`) }}</span>
                      <span class="estimator-card__body">{{ copy.t(`hosting.${id}.body`) }}</span>
                    </button>
                  </div>
                </section>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <div v-if="calculating" class="estimator__calc font-mono" aria-live="polite">
          <p
            v-for="(line, index) in copy.tm('calc.lines')"
            :key="index"
            :class="{ 'is-active': calculatingLine === index, 'is-done': calculatingLine > index }"
          >
            {{ typeof line === 'string' ? line : copy.rt(line) }}
          </p>
        </div>
      </div>

      <aside ref="summaryRef" class="estimator__side">
        <ProjectEstimatorSummary
          :config="config"
          :estimate="estimate"
          :project-code="projectCode"
          :show-result="showResult"
          :copied="copied"
          @request="onOpenRequest"
          @reset="reset"
          @copy="copyCode"
        />
      </aside>
    </div>

    <div
      v-if="requestOpen && estimate && config.type"
      ref="requestFormRef"
      class="estimator__request"
    >
      <ProjectEstimatorRequestForm
        :estimate="estimate"
        :config="{ ...config, type: config.type }"
        @close="requestOpen = false"
      />
    </div>

    <div
      v-if="estimate && showResult && !requestOpen"
      class="estimator__mobile-bar"
    >
      <div>
        <span class="font-mono">{{ copy.t('mobileBar.label') }}</span>
        <strong class="font-display">
          {{ formatEuro(estimate.range.low) }} - {{ formatEuro(estimate.range.high) }}
        </strong>
      </div>
      <button type="button" class="btn-primary" data-cursor="hover" @click="onOpenRequest">
        {{ copy.t('nav.request') }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.estimator {
  display: grid;
  gap: $space-4;
  min-width: 0;

  &:has(.estimator__mobile-bar) {
    padding-bottom: 5.5rem;

    @media (min-width: 960px) {
      padding-bottom: 0;
    }
  }
}

.estimator__status {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding-bottom: $space-3;
  border-bottom: 1px solid $color-border;
  font-size: $text-xs;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: $color-gold-light;
}

.estimator__pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $color-gold-light;
  animation: estimator-pulse 1.8s ease-out infinite;
}

.estimator__layout {
  display: grid;
  gap: $space-5;
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1.45fr) minmax(17rem, 0.9fr);
    align-items: start;
  }
}

.estimator__main,
.estimator__side { min-width: 0; }

.estimator__side {
  @media (min-width: 960px) {
    position: sticky;
    top: 5.5rem;
  }
}

.estimator-wizard {
  border: 1px solid rgba(56, 150, 90, 0.18);
  background:
    linear-gradient(180deg, rgba(56, 150, 90, 0.06), transparent 28%),
    rgba(8, 12, 10, 0.55);
  overflow: hidden;
}

.estimator-wizard__rail {
  display: grid;
  gap: $space-2;
  padding: $space-4 $space-4 0;
}

.estimator-wizard__rail-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: $color-comms-light;
}

.estimator-wizard__rail-track {
  height: 8px;
  border: 1px solid $color-border-hover;
  background: repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 5px,
    rgba($color-comms, 0.06) 5px,
    rgba($color-comms, 0.06) 6px
  );
  overflow: hidden;
}

.estimator-wizard__rail-fill {
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    $color-comms 0,
    $color-comms 6px,
    $color-comms-light 6px,
    $color-comms-light 8px
  );
  box-shadow: 0 0 12px rgba($color-comms, 0.45);
  transition: width 0.45s $ease-out-expo;

  &.is-decoding {
    transition: width 40ms linear;
  }
}

.estimator-wizard__steps {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(7.5rem, 1fr);
  gap: 0;
  overflow-x: auto;
  padding: $space-3 $space-4 0;
  border-bottom: 1px solid rgba(56, 150, 90, 0.12);
  scrollbar-width: thin;

  @media (max-width: 720px) {
    grid-auto-columns: minmax(6.5rem, 70%);
  }
}

.estimator-wizard__step {
  display: grid;
  gap: 0.2rem;
  align-content: start;
  height: 5.4rem;
  padding: $space-3 $space-3 $space-4;
  border: 0;
  border-right: 1px solid rgba(56, 150, 90, 0.1);
  background: transparent;
  color: $color-text-faint;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: color $dur-fast $ease-gold, background $dur-fast $ease-gold;

  &:last-child { border-right: 0; }

  &:disabled {
    cursor: default;
  }

  &.is-active {
    color: $color-text;
    background: linear-gradient(180deg, rgba(56, 150, 90, 0.1), transparent);
  }

  &.is-sealed,
  &.is-reachable {
    color: $color-gold-light;
  }

  &.is-reachable:hover,
  &.is-sealed:hover {
    color: $color-text;
    background: rgba(56, 150, 90, 0.08);
  }

  &.is-locked {
    opacity: 0.55;
  }

  &:focus-visible {
    outline: 2px solid $color-gold;
    outline-offset: -2px;
  }
}

.estimator-wizard__step-index {
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  color: $color-comms;
}

.estimator-wizard__step-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.estimator-wizard__step-state {
  font-size: 0.52rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $color-text-faint;

  .is-active & { color: $color-gold-light; }
  .is-sealed & { color: rgba(80, 168, 114, 0.75); }
}

.estimator-wizard__step-summary,
.estimator-wizard__step-cipher {
  font-size: 0.55rem;
  letter-spacing: 0.04em;
  text-transform: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is-live {
    color: $color-gold-light;
  }
}

.estimator-wizard__step-cipher {
  color: rgba(80, 168, 114, 0.4);
}

.estimator-wizard__stage {
  display: grid;
  gap: $space-4;
  padding: $space-5 $space-4 $space-4;

  @media (min-width: 720px) {
    padding: $space-5;
  }
}

.estimator-wizard__viewport {
  position: relative;
  max-height: min(34rem, 70vh);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  scrollbar-width: thin;

  &.is-decoding {
    min-height: 14rem;
    overflow: hidden;
  }
}

.estimator-wizard__scramble {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  align-content: start;
  gap: $space-3;
  padding: $space-2 $space-1 $space-4;
  background:
    linear-gradient(180deg, rgba(5, 8, 7, 0.97), rgba(8, 12, 10, 0.94));
}

.estimator-wizard__scramble-head {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: $color-comms-light;
}

.estimator-wizard__scramble-stream {
  margin: 0;
  font-size: clamp(0.62rem, 1.6vw, 0.75rem);
  line-height: 1.55;
  letter-spacing: 0.08em;
  color: rgba(80, 168, 114, 0.72);
  white-space: pre;
  overflow: hidden;
}

.estimator-wizard__pane {
  min-width: 0;
  padding-bottom: $space-3;

  &.is-scrambled {
    visibility: hidden;
    pointer-events: none;
  }
}

.estimator-slide-leave-active,
.estimator-slide-back-leave-active {
  pointer-events: none;
}

.estimator__panel-title {
  margin: 0 0 $space-3;
  font-size: clamp(1.35rem, 3vw, 1.8rem);
  letter-spacing: -0.02em;
}

.estimator__hint {
  margin: 0 0 $space-4;
  color: $color-text-faint;
  font-size: $text-xs;
  letter-spacing: 0.06em;
}

.estimator__counter + .estimator__hint,
.estimator__hint + .estimator__hint {
  margin-top: $space-3;
  margin-bottom: 0;
}

.estimator__hint--reserve {
  min-height: 1.25em;
}

.estimator__cards {
  display: grid;
  gap: $space-3;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &--three {
    @media (min-width: 900px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  &--two {
    @media (min-width: 640px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &--features {
    @media (min-width: 900px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}

.estimator-card {
  display: grid;
  gap: $space-2;
  text-align: left;
  padding: $space-4;
  border: 1px solid $color-border;
  border-radius: 2px;
  background:
    linear-gradient(180deg, rgba(56, 150, 90, 0.04), transparent 40%),
    rgba(8, 12, 10, 0.72);
  color: $color-text-muted;
  cursor: pointer;
  transition: border-color $dur-fast $ease-gold, color $dur-fast $ease-gold;

  &.is-selected {
    border-color: rgba(80, 168, 114, 0.55);
    color: $color-text;
    box-shadow: inset 0 0 0 1px rgba(80, 168, 114, 0.15);
  }

  &:hover {
    border-color: $color-border-hover;
    color: $color-text;
  }

  &:focus-visible {
    outline: 2px solid $color-gold;
    outline-offset: 2px;
  }
}

.estimator-card__top {
  display: flex;
  justify-content: space-between;
  gap: $space-2;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $color-gold-light;
}

.estimator-card__title {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  letter-spacing: -0.02em;
  color: inherit;
}

.estimator-card__body,
.estimator-card__note {
  font-size: $text-sm;
  line-height: $leading-relaxed;
}

.estimator-card__note {
  margin-top: $space-1;
  color: $color-text-faint;
}

.estimator__counter {
  display: inline-flex;
  align-items: center;
  gap: $space-4;
  margin-top: $space-2;
}

.estimator__counter-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid $color-border;
  background: $color-surface;
  color: $color-text;
  font-size: 1.2rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid $color-gold;
    outline-offset: 2px;
  }
}

.estimator__counter-value {
  min-width: 3rem;
  text-align: center;
  font-size: 2.4rem;
  line-height: 1;
}

.estimator__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding-bottom: $space-1;
}

.estimator__actions-spacer {
  flex: 0 0 auto;
  width: 0;
}

.estimator__calc {
  margin-top: $space-5;
  padding: $space-4;
  border: 1px solid $color-border;
  background: rgba(8, 12, 10, 0.85);
  display: grid;
  gap: 0.45rem;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $color-text-faint;

  .is-active { color: $color-gold-light; }
  .is-done { color: rgba(232, 241, 236, 0.55); }
}

.estimator__request {
  min-width: 0;
  scroll-margin-top: 5.5rem;
}

.estimator__mobile-bar {
  position: fixed;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.75rem;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding: $space-3 $space-4;
  border: 1px solid $color-border;
  background: rgba(5, 8, 7, 0.96);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);

  @media (min-width: 960px) {
    display: none;
  }

  span {
    display: block;
    font-size: 0.58rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  strong {
    display: block;
    font-size: 1.05rem;
    line-height: 1.15;
  }

  .btn-primary {
    flex: 0 0 auto;
    white-space: nowrap;
  }
}

.estimator-slide-enter-active,
.estimator-slide-leave-active,
.estimator-slide-back-enter-active,
.estimator-slide-back-leave-active {
  transition: opacity 0.22s $ease-out-expo;
}

.estimator-slide-enter-from,
.estimator-slide-back-enter-from,
.estimator-slide-leave-to,
.estimator-slide-back-leave-to {
  opacity: 0;
}

@keyframes estimator-pulse {
  0% { box-shadow: 0 0 0 0 rgba(80, 168, 114, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(80, 168, 114, 0); }
  100% { box-shadow: 0 0 0 0 rgba(80, 168, 114, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .estimator__pulse,
  .estimator-slide-enter-active,
  .estimator-slide-leave-active,
  .estimator-slide-back-enter-active,
  .estimator-slide-back-leave-active,
  .estimator-wizard__rail-fill {
    animation: none;
    transition: none;
  }
}
</style>
