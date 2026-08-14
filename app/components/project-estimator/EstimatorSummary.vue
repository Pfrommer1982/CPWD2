<script setup lang="ts">
import type { ProjectEstimateConfig, ProjectEstimateResult } from '~/types/project-estimate'
import { PROJECT_PRICING } from '~/data/projectPricing'

const props = defineProps<{
  config: ProjectEstimateConfig
  estimate: ProjectEstimateResult | null
  projectCode: string
  showResult: boolean
  copied: boolean
}>()

const emit = defineEmits<{
  request: []
  reset: []
  copy: []
}>()

const copy = useSectionTranslations('projectEstimator')

function formatEuro(value: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

const typeLabel = computed(() => {
  if (!props.config.type) return '-'
  return copy.t(`type.${props.config.type}.label`)
})

const featureLabels = computed(() => {
  if (!props.config.features.length) return []
  return props.config.features.map(id => copy.t(`features.${id}.label`))
})

const showPages = computed(() => Boolean(
  props.config.type && PROJECT_PRICING.types[props.config.type].usesPages,
))
</script>

<template>
  <div class="estimate-summary">
    <p class="estimate-summary__label font-mono">{{ copy.t('summary.label') }}</p>

    <dl class="estimate-summary__rows font-mono">
      <div class="estimate-summary__row">
        <dt>{{ copy.t('summary.project') }}</dt>
        <dd>{{ typeLabel }}</dd>
      </div>
      <div v-if="showPages" class="estimate-summary__row">
        <dt>{{ copy.t('summary.pages') }}</dt>
        <dd>{{ config.pages }}</dd>
      </div>
      <div class="estimate-summary__row">
        <dt>{{ copy.t('summary.design') }}</dt>
        <dd>{{ copy.t(`design.${config.design}.label`) }}</dd>
      </div>
      <div class="estimate-summary__row">
        <dt>{{ copy.t('summary.content') }}</dt>
        <dd>{{ copy.t(`content.${config.content}.label`) }}</dd>
      </div>
      <div class="estimate-summary__row">
        <dt>{{ copy.t('summary.hosting') }}</dt>
        <dd>{{ copy.t(`hosting.${config.hosting}.label`) }}</dd>
      </div>
      <div class="estimate-summary__row estimate-summary__row--modules">
        <dt>{{ copy.t('summary.features') }}</dt>
        <dd>
          <template v-if="!featureLabels.length">{{ copy.t('summary.none') }}</template>
          <ul v-else class="estimate-summary__modules">
            <li v-for="label in featureLabels" :key="label">{{ label }}</li>
          </ul>
        </dd>
      </div>
    </dl>

    <div class="estimate-summary__divider" />

    <div v-if="showResult && estimate" class="estimate-summary__price">
      <p class="estimate-summary__price-label font-mono">{{ copy.t('summary.priceLabel') }}</p>
      <p class="estimate-summary__range font-display">
        {{ formatEuro(estimate.range.low) }} - {{ formatEuro(estimate.range.high) }}
      </p>
      <p class="estimate-summary__note">{{ copy.t('summary.nonBinding') }}</p>
      <p class="estimate-summary__body">{{ copy.t('summary.nonBindingBody') }}</p>
      <p class="estimate-summary__body">{{ copy.t('summary.positioning') }}</p>

      <div v-if="estimate.hostingYearly" class="estimate-summary__optional font-mono">
        <span>{{ copy.t('summary.optional') }}</span>
        <strong>{{ copy.t('summary.hosting') }} {{ formatEuro(estimate.hostingYearly) }} {{ copy.t('hosting.perYear') }}</strong>
      </div>

      <div class="estimate-summary__meta font-mono">
        <div>
          <span>{{ copy.t('summary.complexity') }}</span>
          <strong>{{ copy.t(`summary.complexityLevels.${estimate.complexity}`) }}</strong>
        </div>
        <div>
          <span>{{ copy.t('summary.build') }}</span>
          <strong>{{ copy.t(`summary.buildWindows.${estimate.buildWindow}`) }}</strong>
        </div>
      </div>

      <p v-if="estimate.needsIntake" class="estimate-summary__intake font-mono">
        {{ copy.t('summary.intake') }}
      </p>
      <p v-if="estimate.needsIntake" class="estimate-summary__body">
        {{ copy.t('summary.intakeNote') }}
      </p>

      <div class="estimate-summary__code font-mono">
        <div class="estimate-summary__code-id">
          <span>{{ copy.t('summary.projectId') }}</span>
          <strong>{{ projectCode }}</strong>
        </div>
        <button type="button" class="btn-ghost" data-cursor="hover" @click="emit('copy')">
          {{ copied ? copy.t('nav.copied') : copy.t('nav.copyCode') }}
        </button>
      </div>

      <div class="estimate-summary__cta">
        <button type="button" class="btn-primary" data-cursor="hover" @click="emit('request')">
          {{ copy.t('nav.request') }}
        </button>
        <button type="button" class="btn-ghost" data-cursor="hover" @click="emit('reset')">
          {{ copy.t('nav.reset') }}
        </button>
      </div>

      <p class="estimate-summary__disclaimer">{{ copy.t('summary.disclaimer') }}</p>
    </div>

    <div v-else class="estimate-summary__waiting font-mono">
      <p>{{ copy.t('summary.priceLabel') }}</p>
      <p>-</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.estimate-summary {
  border: 1px solid rgba(56, 150, 90, 0.18);
  border-radius: 2px;
  padding: $space-4;
  background:
    linear-gradient(180deg, rgba(56, 150, 90, 0.06), transparent 30%),
    rgba(8, 12, 10, 0.9);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  min-width: 0;
}

.estimate-summary__label {
  margin: 0 0 $space-4;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: $color-text-faint;
}

.estimate-summary__rows {
  margin: 0;
  display: grid;
  gap: 0.65rem;
  min-width: 0;
}

.estimate-summary__row {
  display: grid;
  grid-template-columns: minmax(5.5rem, 0.42fr) minmax(0, 1fr);
  gap: $space-3;
  align-items: start;
  min-width: 0;

  dt {
    margin: 0;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $color-text-faint;
    padding-top: 0.1rem;
  }

  dd {
    margin: 0;
    min-width: 0;
    color: $color-text;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  &--modules {
    align-items: start;

    dt { padding-top: 0.15rem; }
  }
}

.estimate-summary__modules {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.28rem;
  max-height: 9rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;

  li {
    color: $color-text;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
}

.estimate-summary__divider {
  margin: $space-4 0;
  border-top: 1px solid rgba(56, 150, 90, 0.14);
}

.estimate-summary__price {
  display: grid;
  gap: $space-3;
  min-width: 0;
}

.estimate-summary__price-label {
  margin: 0;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: $color-gold-light;
}

.estimate-summary__range {
  margin: 0;
  font-size: clamp(1.55rem, 2.8vw, 2.1rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.estimate-summary__note {
  margin: 0;
  font-family: $font-mono;
  font-size: $text-xs;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $color-text-muted;
}

.estimate-summary__body,
.estimate-summary__disclaimer {
  margin: 0;
  color: $color-text-muted;
  font-size: $text-sm;
  line-height: $leading-relaxed;
}

.estimate-summary__disclaimer {
  font-size: $text-xs;
  color: $color-text-faint;
}

.estimate-summary__optional,
.estimate-summary__meta > div,
.estimate-summary__code-id {
  display: grid;
  gap: 0.3rem;
  min-width: 0;

  span {
    color: $color-text-faint;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  strong {
    color: $color-text;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
}

.estimate-summary__meta {
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-3;

  @media (min-width: 420px) {
    grid-template-columns: 1fr 1fr;
  }
}

.estimate-summary__intake {
  margin: 0;
  color: #d4a24c;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.estimate-summary__code {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: $space-3;
  min-width: 0;
}

.estimate-summary__cta {
  display: grid;
  gap: $space-3;
}

.estimate-summary__waiting {
  color: $color-text-faint;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  p { margin: 0 0 $space-2; }
}
</style>
