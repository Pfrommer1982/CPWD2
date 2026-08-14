<script setup lang="ts">
import type { ProjectEstimateConfig, ProjectEstimateResult } from '~/types/project-estimate'
import { PROJECT_PRICING } from '~/data/projectPricing'

const props = defineProps<{
  config: ProjectEstimateConfig & { type: NonNullable<ProjectEstimateConfig['type']> }
  estimate: ProjectEstimateResult
}>()

const emit = defineEmits<{
  close: []
}>()

const copy = useSectionTranslations('projectEstimator')
const localePath = useLocalePath()
const { locale } = useI18n()

const form = reactive({
  name: '',
  email: '',
  company: '',
  phone: '',
  note: '',
})
const honeypot = ref('')
const sending = ref(false)
const success = ref(false)
const error = ref('')

const txStatus = computed(() => {
  if (sending.value) return copy.t('request.statusSending')
  if (success.value) return copy.t('request.statusSent')
  if (error.value) return copy.t('request.statusError')
  return copy.t('request.statusReady')
})

function formatEuro(value: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function buildMessage() {
  const lines = [
    `Project estimator aanvraag (${props.estimate.projectCode})`,
    '',
    `Type: ${copy.t(`type.${props.config.type}.label`)}`,
    PROJECT_PRICING.types[props.config.type].usesPages ? `Paginas: ${props.config.pages}` : null,
    `Design: ${copy.t(`design.${props.config.design}.label`)}`,
    `Content: ${copy.t(`content.${props.config.content}.label`)}`,
    `Hosting: ${copy.t(`hosting.${props.config.hosting}.label`)}`,
    `Modules: ${props.config.features.length ? props.config.features.map(id => copy.t(`features.${id}.label`)).join(', ') : '-'}`,
    `Prijsindicatie: ${formatEuro(props.estimate.range.low)} - ${formatEuro(props.estimate.range.high)}`,
    `Projecttotaal (basis): ${formatEuro(props.estimate.projectTotal)}`,
    props.estimate.hostingYearly ? `Hosting jaarlijks: ${formatEuro(props.estimate.hostingYearly)}` : null,
    `Complexiteit: ${copy.t(`summary.complexityLevels.${props.estimate.complexity}`)}`,
    `Doorlooptijd: ${copy.t(`summary.buildWindows.${props.estimate.buildWindow}`)}`,
    `Intake nodig: ${props.estimate.needsIntake ? 'ja' : 'nee'}`,
    '',
    'Toelichting:',
    form.note.trim() || '-',
  ]

  return lines.filter(line => line !== null).join('\n')
}

async function onSubmit() {
  if (sending.value || honeypot.value) return
  error.value = ''
  success.value = false
  sending.value = true

  try {
    await $fetch('/api/project-estimate', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        company: form.company,
        phone: form.phone,
        note: form.note,
        website: honeypot.value,
        locale: locale.value === 'en' ? 'en' : 'nl',
        estimate: {
          projectCode: props.estimate.projectCode,
          type: props.config.type,
          pages: props.config.pages,
          design: props.config.design,
          features: props.config.features,
          content: props.config.content,
          hosting: props.config.hosting,
          rangeLow: props.estimate.range.low,
          rangeHigh: props.estimate.range.high,
          projectTotal: props.estimate.projectTotal,
          hostingYearly: props.estimate.hostingYearly,
          complexity: props.estimate.complexity,
          buildWindow: props.estimate.buildWindow,
          needsIntake: props.estimate.needsIntake,
        },
        message: buildMessage(),
      },
    })
    success.value = true
  }
  catch {
    error.value = copy.t('request.error')
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="estimate-request" aria-labelledby="estimate-request-title">
    <div class="estimate-request__header font-mono">
      <span class="estimate-request__prompt">{{ copy.t('request.terminalPrompt') }}</span>
      <div class="estimate-request__header-end">
        <span
          class="estimate-request__status"
          :class="{
            'is-ok': success,
            'is-err': Boolean(error),
            'is-busy': sending,
          }"
        >
          {{ txStatus }}
        </span>
        <button
          type="button"
          class="estimate-request__close"
          :aria-label="copy.t('request.close')"
          data-cursor="hover"
          @click="emit('close')"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>

    <div class="estimate-request__body">
      <div class="estimate-request__intro">
        <span class="section-label">{{ copy.t('request.label') }}</span>
        <h2 id="estimate-request-title" class="estimate-request__heading font-display">
          {{ copy.t('request.title') }}
        </h2>
        <p class="estimate-request__lead">{{ copy.t('request.lead') }}</p>

        <div class="estimate-request__meta font-mono">
          <div>
            <span>{{ copy.t('summary.projectId') }}</span>
            <strong>{{ estimate.projectCode }}</strong>
          </div>
          <div>
            <span>{{ copy.t('summary.priceLabel') }}</span>
            <strong>{{ formatEuro(estimate.range.low) }} - {{ formatEuro(estimate.range.high) }}</strong>
          </div>
        </div>
      </div>

      <form class="estimate-request__form" @submit.prevent="onSubmit">
        <div class="estimate-request__field">
          <label for="estimate-name" class="font-mono">{{ copy.t('request.name') }}</label>
          <input
            id="estimate-name"
            v-model="form.name"
            type="text"
            name="name"
            required
            autocomplete="name"
            :disabled="sending || success"
            data-cursor="text"
          >
        </div>

        <div class="estimate-request__field">
          <label for="estimate-email" class="font-mono">{{ copy.t('request.email') }}</label>
          <input
            id="estimate-email"
            v-model="form.email"
            type="email"
            name="email"
            required
            autocomplete="email"
            :disabled="sending || success"
            data-cursor="text"
          >
        </div>

        <div class="estimate-request__field">
          <label for="estimate-company" class="font-mono">{{ copy.t('request.company') }}</label>
          <input
            id="estimate-company"
            v-model="form.company"
            type="text"
            name="company"
            autocomplete="organization"
            :disabled="sending || success"
            data-cursor="text"
          >
        </div>

        <div class="estimate-request__field">
          <label for="estimate-phone" class="font-mono">{{ copy.t('request.phone') }}</label>
          <input
            id="estimate-phone"
            v-model="form.phone"
            type="tel"
            name="phone"
            autocomplete="tel"
            :disabled="sending || success"
            data-cursor="text"
          >
        </div>

        <div class="estimate-request__field">
          <label for="estimate-note" class="font-mono">{{ copy.t('request.note') }}</label>
          <textarea
            id="estimate-note"
            v-model="form.note"
            name="note"
            rows="5"
            :disabled="sending || success"
            data-cursor="text"
          />
        </div>

        <input
          v-model="honeypot"
          class="estimate-request__hp"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        >

        <p class="estimate-request__privacy">
          {{ copy.t('request.privacy') }}
          <NuxtLink :to="localePath('/privacy')" data-cursor="hover">{{ copy.t('request.privacyLink') }}</NuxtLink>.
        </p>

        <GsapMagneticButton
          type="submit"
          class="estimate-request__submit"
          :disabled="sending || success"
        >
          {{ sending ? copy.t('request.sending') : copy.t('request.submit') }}
          <span aria-hidden="true">→</span>
        </GsapMagneticButton>

        <p
          v-if="success || error"
          class="estimate-request__feedback font-mono"
          :class="success ? 'is-ok' : 'is-err'"
          :role="success ? 'status' : 'alert'"
        >
          {{ success ? copy.t('request.success') : error }}
        </p>
      </form>
    </div>

    <span class="estimate-request__corner estimate-request__corner--tl" aria-hidden="true" />
    <span class="estimate-request__corner estimate-request__corner--tr" aria-hidden="true" />
    <span class="estimate-request__corner estimate-request__corner--bl" aria-hidden="true" />
    <span class="estimate-request__corner estimate-request__corner--br" aria-hidden="true" />
  </section>
</template>

<style scoped lang="scss">
.estimate-request {
  position: relative;
  width: 100%;
  border: 1px solid rgba($color-gold, 0.22);
  background: rgba(8, 8, 10, 0.82);
  backdrop-filter: blur(12px);
}

.estimate-request__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding: $space-3 $space-5;
  border-bottom: 1px solid rgba($color-gold, 0.12);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.estimate-request__prompt {
  color: rgba($color-gold, 0.55);
  text-transform: uppercase;
}

.estimate-request__header-end {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.estimate-request__status {
  color: $color-text-faint;
  text-transform: uppercase;

  &.is-ok { color: rgba($color-gold, 0.9); }
  &.is-err { color: $color-error; }
  &.is-busy { color: rgba($color-gold-light, 0.75); }
}

.estimate-request__close {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba($color-gold, 0.18);
  border-radius: $radius-sm;
  background: rgba(8, 12, 10, 0.72);
  color: $color-text;
  cursor: pointer;
  transition: border-color $dur-fast $ease-out-expo, color $dur-fast $ease-out-expo;

  span {
    font-size: 1.7rem;
    line-height: 1;
    transform: translateY(-0.04rem);
  }

  &:hover {
    border-color: rgba($color-gold, 0.45);
    color: $color-gold-light;
  }

  &:focus-visible {
    outline: 2px solid $color-gold;
    outline-offset: 2px;
  }
}

.estimate-request__body {
  display: grid;
  gap: $space-6;
  padding: clamp($space-5, 4vw, $space-8);

  @media (min-width: 860px) {
    grid-template-columns: 0.95fr 1.15fr;
    align-items: start;
  }
}

.estimate-request__heading {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 300;
  margin-block: $space-4;
}

.estimate-request__lead {
  margin: 0 0 $space-5;
  max-width: 36ch;
  color: $color-text-muted;
  font-size: $text-base;
  line-height: $leading-relaxed;
}

.estimate-request__meta {
  display: grid;
  gap: $space-3;

  > div {
    display: grid;
    gap: 0.3rem;
  }

  span {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  strong {
    color: $color-text;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
}

.estimate-request__form {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.estimate-request__field {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  label {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  input,
  textarea {
    width: 100%;
    padding: $space-3 $space-4;
    border: 1px solid rgba($color-gold, 0.18);
    border-radius: $border-radius-sm;
    background: rgba($color-surface, 0.8);
    color: $color-text;
    font-family: $font-body;
    font-size: $text-base;
    transition: border-color $duration-fast $ease-out-expo;

    &:focus {
      outline: none;
      border-color: rgba($color-gold, 0.55);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }
}

.estimate-request__hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.estimate-request__privacy {
  margin: 0;
  font-size: $text-xs;
  color: $color-text-faint;
  line-height: $leading-relaxed;

  a {
    color: $color-gold-light;
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
}

.estimate-request__submit {
  align-self: flex-start;
  margin-top: $space-2;
}

.estimate-request__feedback {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: $leading-relaxed;

  &.is-ok { color: rgba($color-gold, 0.9); }
  &.is-err { color: $color-error; }
}

.estimate-request__corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: rgba($color-gold, 0.55);
  border-style: solid;
  pointer-events: none;

  &--tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
  &--tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
  &--bl { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
  &--br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
}
</style>
