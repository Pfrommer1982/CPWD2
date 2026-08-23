<script setup lang="ts">
import type { FeatureId, ProjectEstimateConfig, ProjectEstimateResult, WebsitePlannerAnswers } from '~/types/project-estimate'

const props = defineProps<{
  answers: WebsitePlannerAnswers
  config: ProjectEstimateConfig
  estimate: ProjectEstimateResult
  projectCode: string
  copied: boolean
}>()
const emit = defineEmits<{ request: []; edit: []; reset: []; copy: [] }>()
const copy = useSectionTranslations('projectEstimator')
const { locale } = useI18n()

const recommendation = computed(() => {
  const hasGoal = (goal: WebsitePlannerAnswers['goals'][number]) => props.answers.goals.includes(goal)
  if (hasGoal('tool') && hasGoal('sell')) return copy.t('recommendation.combinations.toolSell')
  if (hasGoal('sell') && hasGoal('show-work')) return copy.t('recommendation.combinations.sellShowWork')
  if (hasGoal('leads') && hasGoal('show-work')) return copy.t('recommendation.combinations.leadsShowWork')
  return copy.t(`recommendation.types.${props.config.type || 'business'}`)
})
const why = computed(() => {
  const concreteGoals = props.answers.goals.filter(goal => goal !== 'unsure')
  const goals = concreteGoals.length ? concreteGoals : ['unsure']
  const items = [
    ...goals.map(goal => `goal.${goal}`),
    ...props.answers.actions.map(action => `action.${action}`),
    `scope.${props.answers.scope || 'unsure'}`,
  ]
  if (props.answers.updates === 'occasional' || props.answers.updates === 'regular') items.push(`updates.${props.answers.updates}`)
  return [...new Set(items)]
})
const included = computed(() => {
  const items = ['responsive', 'foundation']
  if (props.config.pages > 1) items.push('pages')
  for (const feature of props.config.features) items.push(`features.${feature as FeatureId}`)
  if (props.config.content !== 'self') items.push(`content.${props.config.content}`)
  items.push(`design.${props.config.design}`)
  return [...new Set(items)]
})
function formatEuro(value: number) {
  return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <article class="proposal">
    <p class="proposal__eyebrow font-mono">{{ copy.t('recommendation.eyebrow') }}</p>
    <h2 class="proposal__title font-display">{{ recommendation }}</h2>
    <p class="proposal__lead">{{ copy.t('recommendation.lead') }}</p>

    <div class="proposal__columns">
      <section>
        <h3>{{ copy.t('recommendation.whyTitle') }}</h3>
        <ul class="proposal__list">
          <li v-for="key in why" :key="key"><span aria-hidden="true">✓</span>{{ copy.t(`recommendation.why.${key}`) }}</li>
        </ul>
      </section>
      <section>
        <h3>{{ copy.t('recommendation.includedTitle') }}</h3>
        <ul class="proposal__list">
          <li v-for="key in included" :key="key"><span aria-hidden="true">✓</span>{{ copy.t(`recommendation.included.${key}`, { pages: config.pages }) }}</li>
        </ul>
      </section>
    </div>

    <section class="proposal__price">
      <p class="font-mono">{{ copy.t('summary.priceLabel') }}</p>
      <div><strong class="font-display">{{ formatEuro(estimate.range.low) }}–{{ formatEuro(estimate.range.high) }}</strong><span>{{ copy.t('recommendation.once') }}</span></div>
      <small>{{ copy.t('summary.nonBinding') }}</small>
    </section>

    <div v-if="estimate.hostingYearly" class="proposal__care">
      <div><span class="font-mono">{{ copy.t('summary.optional') }}</span><strong>{{ copy.t('recommendation.careTitle') }}</strong></div>
      <strong>{{ formatEuro(estimate.hostingYearly) }} {{ copy.t('hosting.perYear') }}</strong>
      <p v-if="answers.care === 'advice'">{{ copy.t('recommendation.careAdvice') }}</p>
    </div>

    <div class="proposal__facts">
      <div><span class="font-mono">{{ copy.t('summary.build') }}</span><strong>{{ copy.t(`summary.buildWindows.${estimate.buildWindow}`) }}</strong></div>
      <div><span class="font-mono">{{ copy.t('recommendation.intakeLabel') }}</span><strong>{{ estimate.needsIntake ? copy.t('recommendation.intakeYes') : copy.t('recommendation.intakeNo') }}</strong></div>
    </div>

    <div class="proposal__actions">
      <button type="button" class="btn-primary" @click="emit('request')">{{ copy.t('nav.request') }}</button>
      <button type="button" class="btn-ghost" @click="emit('edit')">{{ copy.t('nav.edit') }}</button>
      <button type="button" class="btn-ghost" @click="emit('reset')">{{ copy.t('nav.reset') }}</button>
    </div>

    <details class="proposal__details">
      <summary>{{ copy.t('recommendation.details') }}</summary>
      <p>{{ copy.t('summary.disclaimer') }}</p>
      <div><span class="font-mono">{{ copy.t('summary.projectId') }}: {{ projectCode }}</span><button type="button" @click="emit('copy')">{{ copied ? copy.t('nav.copied') : copy.t('nav.copyCode') }}</button></div>
    </details>
  </article>
</template>

<style scoped lang="scss">
.proposal { min-height: 41rem; padding: clamp($space-5, 5vw, $space-6); border: 1px solid rgba($color-comms, .22); background: linear-gradient(145deg, rgba($color-comms, .08), transparent 38%), rgba(8, 12, 10, .82); }
.proposal__eyebrow { margin: 0 0 $space-3; color: $color-gold-light; font-size: .66rem; letter-spacing: .14em; text-transform: uppercase; }
.proposal__title { margin: 0; max-width: 18ch; font-size: clamp(1.9rem, 3.8vw, 3.2rem); line-height: .95; @media (max-width: 480px) { font-size: clamp(1.9rem, 10vw, 2.5rem); } }
.proposal__lead { max-width: 60ch; margin: $space-4 0 0; color: $color-text-muted; line-height: $leading-relaxed; }
.proposal__columns { display: grid; gap: $space-5; margin-top: $space-6; @media (min-width: 700px) { grid-template-columns: 1fr 1fr; } h3 { margin: 0 0 $space-3; font-size: $text-lg; } }
.proposal__list { list-style: none; display: grid; gap: $space-2; margin: 0; padding: 0; li { display: grid; grid-template-columns: 1rem 1fr; gap: $space-2; color: $color-text-muted; line-height: 1.45; span { color: $color-comms-light; } } }
.proposal__price { margin-top: $space-6; padding: $space-5 0; border-block: 1px solid $color-border-hover; p, small { margin: 0; color: $color-text-faint; font-size: $text-xs; text-transform: uppercase; letter-spacing: .1em; } div { display: flex; flex-wrap: wrap; align-items: baseline; gap: $space-3; margin: $space-2 0; } strong { font-size: clamp(2.2rem, 6vw, 4.4rem); font-variant-numeric: tabular-nums; line-height: 1; white-space: nowrap; } span { color: $color-text-muted; } }
.proposal__care { display: grid; grid-template-columns: 1fr auto; gap: $space-2 $space-4; padding: $space-4; margin-top: $space-4; border: 1px solid $color-border; background: rgba($color-comms, .05); div { display: grid; } span { color: $color-gold-light; font-size: .6rem; text-transform: uppercase; } p { grid-column: 1 / -1; margin: 0; color: $color-text-muted; font-size: $text-sm; } }
.proposal__facts { display: grid; gap: $space-3; margin-top: $space-4; @media (min-width: 520px) { grid-template-columns: 1fr 1fr; } div { display: grid; gap: .35rem; padding: $space-4; border: 1px solid $color-border; } span { color: $color-text-faint; font-size: .62rem; text-transform: uppercase; } }
.proposal__actions { display: flex; flex-wrap: wrap; gap: $space-3; margin-top: $space-5; }
.proposal__details { margin-top: $space-5; color: $color-text-faint; font-size: $text-xs; summary { cursor: pointer; } p { line-height: $leading-relaxed; } div { display: flex; flex-wrap: wrap; justify-content: space-between; gap: $space-2; } button { border: 0; background: none; color: $color-comms-light; cursor: pointer; } }
</style>
