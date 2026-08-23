<script setup lang="ts">
import type { PlannerActionId, PlannerCapabilityId, PlannerCareId, PlannerContentId, PlannerGoalId, PlannerScopeId, PlannerUpdatesId, PlannerVisualId, WebsitePlannerAnswers } from '~/types/project-estimate'

const copy = useSectionTranslations('projectEstimator')
const { locale } = useI18n()
const questionTitle = ref<HTMLElement | null>(null)
const copied = ref(false)
const {
  answers, config, projectCode, stepIndex, currentStep, visibleSteps, estimate,
  showResult, calculating, requestOpen, setAnswer, toggleGoal, toggleAction, toggleCapability, nextStep,
  prevStep, goToStep, runCalculation, reset, openRequest,
} = useProjectEstimate()

const options = {
  goal: ['leads', 'show-work', 'sell', 'tool', 'unsure'] as PlannerGoalId[],
  action: ['contact', 'call', 'booking', 'buy', 'login', 'information'] as PlannerActionId[],
  scope: ['minimal', 'few', 'many', 'unsure'] as PlannerScopeId[],
  updates: ['never', 'occasional', 'regular', 'unsure'] as PlannerUpdatesId[],
  capabilities: ['languages', 'booking', 'newsletter', 'login', 'integration', 'statistics', 'ai', 'none'] as PlannerCapabilityId[],
  content: ['ready', 'polish', 'full'] as PlannerContentId[],
  visual: ['calm', 'custom', 'showcase'] as PlannerVisualId[],
  care: ['cpwd', 'self', 'advice'] as PlannerCareId[],
}
const progress = computed(() => Math.round(((stepIndex.value + 1) / visibleSteps.value.length) * 100))
const isLast = computed(() => stepIndex.value === visibleSteps.value.length - 1)
const stepComplete = computed(() => currentStep.value === 'goal'
  ? answers.goals.length > 0
  : currentStep.value === 'action'
    ? answers.actions.length > 0
    : currentStep.value === 'capabilities'
      || (currentStep.value === 'styleCare' ? Boolean(answers.visual && answers.care) : Boolean(answers[currentStep.value as keyof WebsitePlannerAnswers])))
const answerRows = computed(() => visibleSteps.value.map((step) => {
  let value = ''
  if (step === 'goal') {
    value = answers.goals.length ? answers.goals.map(id => copy.t(`questions.goal.options.${id}.label`)).join(', ') : copy.t('overview.open')
  }
  else if (step === 'action') {
    value = answers.actions.length ? answers.actions.map(id => copy.t(`questions.action.options.${id}.label`)).join(', ') : copy.t('overview.open')
  }
  else if (step === 'styleCare') {
    value = [answers.visual && copy.t(`questions.visual.options.${answers.visual}.label`), answers.care && copy.t(`questions.care.options.${answers.care}.label`)].filter(Boolean).join(' · ')
  }
  else if (step === 'capabilities') {
    value = answers.capabilities.length ? answers.capabilities.map(id => copy.t(`questions.capabilities.options.${id}.label`)).join(', ') : copy.t('overview.open')
  }
  else {
    const answer = answers[step as keyof WebsitePlannerAnswers]
    value = answer ? copy.t(`questions.${step}.options.${answer}.label`) : copy.t('overview.open')
  }
  return { step, value }
}))

function selectSingle(key: keyof WebsitePlannerAnswers, value: string) { setAnswer(key, value as never) }
function toggleMulti(step: 'goal' | 'action', id: string) {
  if (step === 'goal') toggleGoal(id as PlannerGoalId)
  else toggleAction(id as PlannerActionId)
}
function multiSelected(step: 'goal' | 'action', id: string) {
  return step === 'goal' ? answers.goals.includes(id as PlannerGoalId) : answers.actions.includes(id as PlannerActionId)
}
async function focusQuestion() { await nextTick(); questionTitle.value?.focus({ preventScroll: true }) }
async function next() {
  if (!stepComplete.value || calculating.value) return
  if (isLast.value) return runCalculation()
  nextStep(); await focusQuestion()
}
async function back() { if (stepIndex.value) { prevStep(); await focusQuestion() } }
async function editAnswers() { requestOpen.value = false; showResult.value = false; goToStep(0); await focusQuestion() }
async function openStep(index: number) { goToStep(index); showResult.value = false; await focusQuestion() }
async function copyCode() {
  try { await navigator.clipboard.writeText(projectCode.value); copied.value = true; window.setTimeout(() => { copied.value = false }, 1600) }
  catch { copied.value = false }
}
function formatEuro(value: number) {
  return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <div class="planner" :class="{ 'planner--result': showResult }">
    <div class="planner__progress">
      <div class="planner__progress-meta font-mono">
        <span>{{ showResult ? copy.t('progress.complete') : copy.t('progress.question', { current: stepIndex + 1, total: visibleSteps.length }) }}</span>
        <span>{{ showResult ? 100 : progress }}%</span>
      </div>
      <div class="planner__progress-track" aria-hidden="true"><span :style="{ width: `${showResult ? 100 : progress}%` }" /></div>
    </div>

    <div class="planner__layout">
      <main class="planner__main">
        <ProjectEstimatorSummary
          v-if="showResult && estimate" :answers="answers" :config="config" :estimate="estimate"
          :project-code="projectCode" :copied="copied" @request="openRequest" @edit="editAnswers"
          @reset="reset" @copy="copyCode"
        />
        <section v-else class="planner__question" :aria-labelledby="`planner-question-${currentStep}`">
          <div class="planner__question-stage">
            <div :key="currentStep" class="planner__question-content">
              <p class="planner__question-label font-mono">{{ copy.t(`steps.${currentStep}`) }}</p>
              <h2 :id="`planner-question-${currentStep}`" ref="questionTitle" class="planner__question-title font-display" tabindex="-1">{{ copy.t(`questions.${currentStep}.title`) }}</h2>
              <p v-if="copy.te(`questions.${currentStep}.hint`)" class="planner__question-hint">{{ copy.t(`questions.${currentStep}.hint`) }}</p>

              <div v-if="currentStep === 'styleCare'" class="planner__double-question">
                <div>
                  <h3 class="planner__subheading">{{ copy.t('questions.visual.title') }}</h3>
                  <div class="planner__choices planner__choices--compact">
                    <button v-for="id in options.visual" :key="id" type="button" class="planner-choice" :class="{ 'is-selected': answers.visual === id }" :aria-pressed="answers.visual === id" @click="selectSingle('visual', id)">
                      <span class="planner-choice__mark" aria-hidden="true">{{ answers.visual === id ? '✓' : '' }}</span><span><strong>{{ copy.t(`questions.visual.options.${id}.label`) }}</strong><small>{{ copy.t(`questions.visual.options.${id}.body`) }}</small></span>
                    </button>
                  </div>
                </div>
                <div>
                  <h3 class="planner__subheading">{{ copy.t('questions.care.title') }}</h3>
                  <div class="planner__choices planner__choices--compact">
                    <button v-for="id in options.care" :key="id" type="button" class="planner-choice" :class="{ 'is-selected': answers.care === id }" :aria-pressed="answers.care === id" @click="selectSingle('care', id)">
                      <span class="planner-choice__mark" aria-hidden="true">{{ answers.care === id ? '✓' : '' }}</span><span><strong>{{ copy.t(`questions.care.options.${id}.label`) }}</strong><small>{{ copy.t(`questions.care.options.${id}.body`) }}</small></span>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else-if="currentStep === 'goal' || currentStep === 'action'" class="planner__choices">
                <button v-for="id in options[currentStep]" :key="id" type="button" class="planner-choice" :class="{ 'is-selected': multiSelected(currentStep, id) }" :aria-pressed="multiSelected(currentStep, id)" @click="toggleMulti(currentStep, id)">
                  <span class="planner-choice__mark" aria-hidden="true">{{ multiSelected(currentStep, id) ? '✓' : '' }}</span><span><strong>{{ copy.t(`questions.${currentStep}.options.${id}.label`) }}</strong><small>{{ copy.t(`questions.${currentStep}.options.${id}.body`) }}</small></span>
                </button>
              </div>
              <div v-else-if="currentStep === 'capabilities'" class="planner__choices planner__choices--grid">
                <button v-for="id in options.capabilities" :key="id" type="button" class="planner-choice" :class="{ 'is-selected': answers.capabilities.includes(id) }" :aria-pressed="answers.capabilities.includes(id)" @click="toggleCapability(id)">
                  <span class="planner-choice__mark" aria-hidden="true">{{ answers.capabilities.includes(id) ? '✓' : '' }}</span><span><strong>{{ copy.t(`questions.capabilities.options.${id}.label`) }}</strong><small>{{ copy.t(`questions.capabilities.options.${id}.body`) }}</small></span>
                </button>
              </div>
              <div v-else class="planner__choices">
                <button v-for="id in options[currentStep as keyof typeof options]" :key="id" type="button" class="planner-choice" :class="{ 'is-selected': answers[currentStep as keyof WebsitePlannerAnswers] === id }" :aria-pressed="answers[currentStep as keyof WebsitePlannerAnswers] === id" @click="selectSingle(currentStep as keyof WebsitePlannerAnswers, id)">
                  <span class="planner-choice__mark" aria-hidden="true">{{ answers[currentStep as keyof WebsitePlannerAnswers] === id ? '✓' : '' }}</span><span><strong>{{ copy.t(`questions.${currentStep}.options.${id}.label`) }}</strong><small>{{ copy.t(`questions.${currentStep}.options.${id}.body`) }}</small></span>
                </button>
              </div>
            </div>
          </div>
          <div class="planner__actions">
            <button type="button" class="btn-ghost" :disabled="stepIndex === 0" @click="back">{{ copy.t('nav.back') }}</button>
            <button type="button" class="btn-primary" :disabled="!stepComplete || calculating" @click="next">{{ calculating ? copy.t('nav.building') : isLast ? copy.t('nav.proposal') : copy.t('nav.nextQuestion') }}</button>
          </div>
        </section>
      </main>

      <aside class="planner__overview" aria-labelledby="planner-overview-title">
        <p class="planner__overview-label font-mono">{{ copy.t('overview.eyebrow') }}</p>
        <h2 id="planner-overview-title" class="planner__overview-title font-display">{{ showResult ? copy.t('overview.ready') : copy.t('overview.title') }}</h2>
        <ol class="planner__answer-list">
          <li v-for="(row, index) in answerRows" :key="row.step" :class="{ 'is-current': !showResult && index === stepIndex }">
            <span class="planner__answer-index font-mono">{{ String(index + 1).padStart(2, '0') }}</span><span><strong>{{ copy.t(`steps.${row.step}`) }}</strong><small>{{ row.value }}</small></span>
            <button v-if="showResult" type="button" :aria-label="copy.t('overview.editStep')" @click="openStep(index)">{{ copy.t('overview.edit') }}</button>
          </li>
        </ol>
        <div v-if="showResult && estimate" class="planner__overview-price"><span class="font-mono">{{ copy.t('summary.priceLabel') }}</span><strong>{{ formatEuro(estimate.range.low) }}–{{ formatEuro(estimate.range.high) }}</strong></div>
      </aside>
    </div>

    <ProjectEstimatorInfraMap v-if="showResult && estimate && config.type" class="planner__infra" :config="{ ...config, type: config.type }" :estimate="estimate" />
    <div v-if="requestOpen && estimate && config.type" class="planner__request"><ProjectEstimatorRequestForm :estimate="estimate" :config="{ ...config, type: config.type }" @close="requestOpen = false" /></div>
  </div>
</template>

<style scoped lang="scss">
.planner { display: grid; gap: $space-5; min-width: 0; }
.planner__progress { display: grid; gap: $space-2; }
.planner__progress-meta { display: flex; justify-content: space-between; color: $color-comms-light; font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; }
.planner__progress-track { height: 3px; background: rgba($color-comms, .14); overflow: hidden; span { display: block; height: 100%; background: $color-comms-light; transition: width .35s $ease-out-expo; } }
.planner__layout { display: grid; gap: $space-4; min-width: 0; @media (min-width: 960px) { grid-template-columns: minmax(0, 1.45fr) minmax(18rem, .75fr); align-items: start; } }
.planner__main, .planner__overview { min-width: 0; }
.planner__question, .planner__overview { border: 1px solid rgba($color-comms, .2); background: linear-gradient(180deg, rgba($color-comms, .055), transparent 28%), rgba(8, 12, 10, .72); }
.planner__question { display: flex; min-height: 41rem; flex-direction: column; @media (max-width: 959px) { min-height: auto; } }
.planner__question-stage { flex: 1; padding: clamp($space-4, 4vw, $space-6); }
.planner__question-content { animation: planner-enter .28s $ease-out-expo both; }
.planner__question-label, .planner__overview-label { margin: 0 0 $space-3; color: $color-gold-light; font-size: .64rem; letter-spacing: .14em; text-transform: uppercase; }
.planner__question-title { margin: 0; max-width: 18ch; font-size: clamp(2rem, 4vw, 3.2rem); line-height: .98; outline: none; }
.planner__question-hint { margin: $space-3 0 0; max-width: 62ch; color: $color-text-muted; line-height: $leading-relaxed; }
.planner__choices { display: grid; gap: $space-3; margin-top: $space-5; &--grid { @media (min-width: 640px) { grid-template-columns: 1fr 1fr; } } &--compact { margin-top: $space-3; } }
.planner-choice { display: grid; grid-template-columns: 1.4rem 1fr; gap: $space-3; min-height: 4.5rem; padding: $space-3 $space-4; border: 1px solid $color-border; background: rgba($color-bg, .35); color: $color-text; text-align: left; transition: border-color .2s, background .2s, transform .2s; cursor: pointer; &:hover, &:focus-visible { border-color: $color-border-hover; transform: translateX(2px); } &.is-selected { border-color: $color-comms-light; background: rgba($color-comms, .1); box-shadow: inset 3px 0 $color-comms-light; } strong, small { display: block; } strong { font-size: $text-base; } small { margin-top: .3rem; color: $color-text-muted; font-size: $text-sm; line-height: 1.45; } }
.planner-choice__mark { display: grid; place-items: center; width: 1.3rem; height: 1.3rem; margin-top: .1rem; border: 1px solid $color-border-hover; color: $color-comms-light; font: 700 .8rem $font-mono; }
.planner__double-question { display: grid; gap: $space-5; margin-top: $space-4; @media (min-width: 700px) { grid-template-columns: 1fr 1fr; } }
.planner__subheading { margin: 0; font-size: $text-lg; }
.planner__actions { display: flex; justify-content: space-between; gap: $space-3; padding: $space-4 clamp($space-4, 4vw, $space-6); border-top: 1px solid $color-border; }
.planner__overview { padding: $space-5; @media (min-width: 960px) { position: sticky; top: 5.5rem; } }
.planner__overview-title { margin: 0 0 $space-4; font-size: clamp(1.6rem, 2.5vw, 2.25rem); }
.planner__answer-list { list-style: none; display: grid; margin: 0; padding: 0; li { display: grid; grid-template-columns: 2rem minmax(0, 1fr) auto; gap: $space-2; padding: $space-3 0; border-top: 1px solid $color-border; opacity: .62; &.is-current { opacity: 1; } strong, small { display: block; } strong { font-size: $text-sm; } small { margin-top: .2rem; color: $color-text-muted; font-size: $text-xs; line-height: 1.4; } button { align-self: start; border: 0; background: none; color: $color-comms-light; font: .65rem $font-mono; text-transform: uppercase; cursor: pointer; } } }
.planner__answer-index { color: $color-gold-light; font-size: .62rem; }
.planner__overview-price { display: grid; gap: .35rem; padding-top: $space-4; border-top: 1px solid $color-border-hover; span { color: $color-text-faint; font-size: .62rem; text-transform: uppercase; } strong { font-family: $font-display; font-size: clamp(1.5rem, 3vw, 2rem); font-variant-numeric: tabular-nums; white-space: nowrap; } }
@keyframes planner-enter { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .planner__question-content { animation: none; } .planner__progress-track span, .planner-choice { transition: none; } }
</style>
