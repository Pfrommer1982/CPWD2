<script setup lang="ts">
import type { AuditStatus, SiteAuditResult } from '~/types/site-audit'

const props = defineProps<{
  result: SiteAuditResult
}>()

const emit = defineEmits<{
  retest: []
  another: []
  'switch-strategy': [strategy: 'mobile' | 'desktop']
}>()

const copy = useSectionTranslations('websiteScanner')
const { generating, downloadSummaryPdf } = useAuditReportPdf()

function statusLabel(status: AuditStatus) {
  return copy.t(`status.${status}`)
}

function categoryLabel(id: string) {
  return copy.t(`categories.${id}`)
}

async function onDownloadPdf() {
  await downloadSummaryPdf(props.result)
}
</script>

<template>
  <section
    id="audit-report-start"
    class="audit-report"
    tabindex="-1"
  >
    <header class="audit-report__toolbar">
      <div>
        <p class="section-label">{{ copy.t('report.label') }}</p>
        <p class="audit-report__url font-mono">{{ result.url }}</p>
      </div>
      <div class="audit-report__actions">
        <div class="audit-report__strategy" role="group" :aria-label="copy.t('report.strategyLabel')">
          <button
            type="button"
            class="audit-report__strategy-btn"
            :class="{ 'is-active': result.strategy === 'mobile' }"
            @click="emit('switch-strategy', 'mobile')"
          >
            {{ copy.t('report.mobile') }}
          </button>
          <button
            type="button"
            class="audit-report__strategy-btn"
            :class="{ 'is-active': result.strategy === 'desktop' }"
            @click="emit('switch-strategy', 'desktop')"
          >
            {{ copy.t('report.desktop') }}
          </button>
        </div>
        <button
          type="button"
          class="btn-ghost"
          data-cursor="hover"
          :disabled="generating"
          :aria-label="copy.t('report.downloadPdfAria')"
          @click="onDownloadPdf"
        >
          {{ generating ? copy.t('report.downloadPdfGenerating') : copy.t('report.downloadPdf') }}
        </button>
        <button type="button" class="btn-ghost" data-cursor="hover" @click="emit('retest')">
          {{ copy.t('report.retest') }}
        </button>
        <button type="button" class="btn-primary" data-cursor="hover" @click="emit('another')">
          {{ copy.t('report.another') }}
        </button>
      </div>
    </header>

    <div class="audit-report__health">
      <div class="audit-report__health-copy">
        <p class="font-mono audit-report__eyebrow">{{ copy.t('report.healthLabel') }}</p>
        <h2 class="audit-report__health-score font-display">
          {{ result.healthScore }}
          <span>/ 100</span>
        </h2>
        <p class="audit-report__health-status" :data-status="result.healthStatus">
          {{ statusLabel(result.healthStatus) }}
        </p>
        <p class="audit-report__health-note text-muted">
          {{ copy.t('report.healthNote') }}
        </p>
      </div>
    </div>

    <div class="audit-report__scores">
      <article
        v-for="category in result.categories"
        :key="category.id"
        class="audit-score-card"
        :data-status="category.status"
      >
        <p class="audit-score-card__label font-mono">{{ categoryLabel(category.id) }}</p>
        <p class="audit-score-card__value font-display">{{ category.score }}</p>
        <p class="audit-score-card__status">{{ statusLabel(category.status) }}</p>
      </article>
    </div>

    <section v-if="result.recommendations.length" class="audit-report__block">
      <p class="section-label">{{ copy.t('report.priorityLabel') }}</p>
      <h3 class="audit-report__heading font-display">{{ copy.t('report.priorityTitle') }}</h3>
      <div class="audit-recs">
        <SiteAuditRecAccordion
          v-for="(item, index) in result.recommendations"
          :key="item.id"
          :item="item"
          :index="index"
        />
      </div>
    </section>

    <section v-if="result.metrics.length" class="audit-report__block">
      <p class="section-label">{{ copy.t('report.metricsLabel') }}</p>
      <h3 class="audit-report__heading font-display">{{ copy.t('report.metricsTitle') }}</h3>
      <div class="audit-metrics">
        <details
          v-for="metric in result.metrics"
          :key="metric.id"
          class="audit-metric"
        >
          <summary>
            <span class="audit-metric__title">{{ metric.title }}</span>
            <span class="audit-metric__value font-mono">{{ metric.displayValue }}</span>
          </summary>
          <p class="audit-metric__explain">{{ metric.explanation }}</p>
        </details>
      </div>
    </section>

    <footer class="audit-report__footer">
      <button
        type="button"
        class="btn-ghost"
        data-cursor="hover"
        :disabled="generating"
        @click="onDownloadPdf"
      >
        {{ generating ? copy.t('report.downloadPdfGenerating') : copy.t('report.downloadPdf') }}
      </button>
      <button type="button" class="btn-ghost" data-cursor="hover" @click="emit('retest')">
        {{ copy.t('report.retest') }}
      </button>
      <button type="button" class="btn-primary" data-cursor="hover" @click="emit('another')">
        {{ copy.t('report.another') }}
      </button>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.audit-report {
  display: grid;
  gap: clamp($space-6, 5vw, $space-8);
  min-width: 0;
  width: 100%;
  overflow-x: clip;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid $color-gold;
    outline-offset: 4px;
  }
}

.audit-report__toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: $space-4;
  align-items: flex-start;
  min-width: 0;

  > div:first-child {
    min-width: 0;
    flex: 1 1 14rem;
  }
}

.audit-report__url {
  margin: $space-2 0 0;
  color: $color-text-muted;
  font-size: $text-sm;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.audit-report__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  align-items: center;
  width: 100%;

  @media (min-width: 720px) {
    width: auto;
    justify-content: flex-end;
    max-width: 100%;
  }

  .btn-ghost,
  .btn-primary {
    flex: 1 1 auto;
    min-width: 0;
    text-align: center;

    @media (min-width: 720px) {
      flex: 0 0 auto;
    }
  }
}

.audit-report__strategy {
  display: inline-flex;
  width: 100%;
  border: 1px solid $color-border;
  border-radius: $radius-full;
  overflow: hidden;

  @media (min-width: 720px) {
    width: auto;
  }
}

.audit-report__strategy-btn {
  flex: 1;
  border: 0;
  background: transparent;
  color: $color-text-muted;
  font-family: $font-mono;
  font-size: $text-xs;
  letter-spacing: $tracking-wide;
  text-transform: uppercase;
  padding: 0.55rem 0.9rem;
  cursor: pointer;

  &.is-active {
    background: $color-gold-muted;
    color: $color-gold-light;
  }

  &:focus-visible {
    outline: 2px solid $color-gold;
    outline-offset: 2px;
  }
}

.audit-report__health {
  padding: clamp($space-5, 4vw, $space-8) clamp($space-4, 3vw, $space-5);
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background:
    radial-gradient(ellipse at top left, rgba(56, 150, 90, 0.12), transparent 55%),
    $color-bg-alt;
  min-width: 0;
}

.audit-report__eyebrow {
  margin: 0 0 $space-3;
  font-size: $text-xs;
  letter-spacing: $tracking-widest;
  text-transform: uppercase;
  color: $color-gold-light;
}

.audit-report__health-score {
  margin: 0;
  font-size: clamp(3.2rem, 16vw, 6rem);
  line-height: 0.9;
  letter-spacing: -0.04em;
  word-break: break-word;

  span {
    font-size: 0.35em;
    color: $color-text-muted;
    margin-left: 0.2em;
  }
}

.audit-report__health-status {
  margin: $space-3 0;
  font-family: $font-mono;
  font-size: $text-sm;
  letter-spacing: $tracking-widest;
  text-transform: uppercase;

  &[data-status='excellent'],
  &[data-status='good'] {
    color: $color-gold-light;
  }

  &[data-status='needs-attention'] {
    color: #d4a24c;
  }

  &[data-status='poor'] {
    color: $color-error;
  }
}

.audit-report__health-note {
  max-width: 36rem;
  margin: 0;
  font-size: $text-sm;
  line-height: $leading-relaxed;
}

.audit-report__scores {
  display: grid;
  gap: $space-3;
  grid-template-columns: 1fr;
  min-width: 0;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.audit-score-card {
  padding: $space-4;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  background: $color-surface;
  min-width: 0;
}

.audit-score-card__label {
  margin: 0;
  font-size: $text-xs;
  letter-spacing: $tracking-widest;
  text-transform: uppercase;
  color: $color-text-faint;
}

.audit-score-card__value {
  margin: $space-3 0 $space-2;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1;
}

.audit-score-card__status {
  margin: 0;
  font-family: $font-mono;
  font-size: $text-xs;
  letter-spacing: $tracking-wide;
  text-transform: uppercase;
  color: $color-text-muted;
}

.audit-report__block {
  display: grid;
  gap: $space-4;
  min-width: 0;
}

.audit-report__heading {
  margin: 0;
  font-size: clamp(1.45rem, 4.5vw, 2.2rem);
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}

.audit-recs {
  display: grid;
  gap: $space-4;
  min-width: 0;
}

.audit-metrics {
  display: grid;
  gap: $space-3;
  min-width: 0;
}

.audit-metric {
  border: 1px solid $color-border;
  border-radius: $radius-md;
  background: $color-surface;
  padding: 0 clamp($space-3, 2.5vw, $space-4);
  min-width: 0;

  summary {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $space-2;
    padding: $space-4 0;
    cursor: pointer;
    list-style: none;
    min-width: 0;

    @media (min-width: 640px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: $space-3;
    }

    &::-webkit-details-marker {
      display: none;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }
}

.audit-metric__title {
  font-family: $font-display;
  font-size: clamp($text-base, 3.2vw, $text-lg);
  min-width: 0;
  overflow-wrap: anywhere;
}

.audit-metric__value {
  color: $color-gold-light;
  font-size: $text-sm;
  flex-shrink: 0;
  overflow-wrap: anywhere;
}

.audit-metric__explain {
  margin: 0 0 $space-4;
  color: $color-text-muted;
  line-height: $leading-relaxed;
}

.audit-report__footer {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  padding-top: $space-4;
  border-top: 1px solid $color-border;

  .btn-ghost,
  .btn-primary {
    flex: 1 1 10rem;
    text-align: center;
  }
}
</style>
