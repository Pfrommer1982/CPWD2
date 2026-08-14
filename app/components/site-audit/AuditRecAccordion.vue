<script setup lang="ts">
import type { AuditRecommendation } from '~/types/site-audit'

const props = defineProps<{
  item: AuditRecommendation
  index: number
}>()

const copy = useSectionTranslations('websiteScanner')

const open = ref(false)
const uid = useId()
const buttonId = computed(() => `audit-rec-q-${uid}`)
const panelId = computed(() => `audit-rec-a-${uid}`)
const number = computed(() => String(props.index + 1).padStart(2, '0'))

function impactLabel(value: string) {
  return copy.t(`impact.${value}`)
}

function difficultyLabel(value: string) {
  return copy.t(`difficulty.${value}`)
}

function toggle() {
  open.value = !open.value
}
</script>

<template>
  <article class="audit-rec-accordion" :class="{ 'audit-rec-accordion--open': open }">
    <h4 class="audit-rec-accordion__heading">
      <button
        :id="buttonId"
        type="button"
        class="audit-rec-accordion__trigger"
        :aria-expanded="open"
        :aria-controls="panelId"
        data-cursor="hover"
        @click="toggle"
      >
        <span class="audit-rec-accordion__number font-mono">{{ number }}</span>
        <span class="audit-rec-accordion__copy">
          <span class="audit-rec-accordion__title font-display">{{ item.title }}</span>
          <span class="audit-rec-accordion__tags font-mono">
            <span>{{ copy.t('report.impact') }} · {{ impactLabel(item.impact) }}</span>
            <span>{{ copy.t('report.difficulty') }} · {{ difficultyLabel(item.difficulty) }}</span>
          </span>
        </span>
        <span class="audit-rec-accordion__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
        </span>
      </button>
    </h4>

    <div
      :id="panelId"
      class="audit-rec-accordion__panel"
      role="region"
      :aria-labelledby="buttonId"
      :hidden="!open"
    >
      <div class="audit-rec-accordion__panel-inner">
        <p class="audit-rec-accordion__body">{{ item.description }}</p>
        <p v-if="item.displayValue" class="audit-rec-accordion__metric font-mono">
          {{ item.displayValue }}
        </p>

        <div class="audit-rec-accordion__fix">
          <p class="audit-rec-accordion__fix-label font-mono">{{ copy.t('report.howToFix') }}</p>
          <p class="audit-rec-accordion__fix-text">{{ item.recommendation }}</p>
        </div>

        <p class="audit-rec-accordion__official font-mono">{{ item.officialTitle }}</p>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.audit-rec-accordion {
  border: 1px solid $color-border;
  border-radius: $radius-md;
  background: $color-bg-alt;
  min-width: 0;
  overflow-wrap: anywhere;
}

.audit-rec-accordion__heading {
  margin: 0;
}

.audit-rec-accordion__trigger {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: $space-3;
  width: 100%;
  padding: clamp($space-4, 3vw, $space-5);
  background: none;
  border: 0;
  text-align: left;
  cursor: pointer;
  color: $color-text-muted;
  transition: color $dur-fast $ease-gold;

  &:hover {
    color: $color-text;
  }

  &:focus-visible {
    outline: 2px solid $color-gold;
    outline-offset: 2px;
  }
}

.audit-rec-accordion__number {
  margin-top: 0.35rem;
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  color: $color-comms;
}

.audit-rec-accordion__copy {
  display: grid;
  gap: $space-2;
  min-width: 0;
}

.audit-rec-accordion__title {
  font-size: clamp($text-lg, 3.5vw, $text-xl);
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: inherit;
}

.audit-rec-accordion__tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2 $space-3;
  font-size: $text-xs;
  letter-spacing: $tracking-wide;
  text-transform: uppercase;
  color: $color-gold-light;
}

.audit-rec-accordion__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-top: 0.15rem;
  border: 1px solid $color-border;
  color: $color-comms;
  flex-shrink: 0;
  transition: transform $dur-med $ease-gold, border-color $dur-fast $ease-gold;

  .audit-rec-accordion--open & {
    transform: rotate(135deg);
    border-color: $color-border-hover;
  }
}

.audit-rec-accordion__panel[hidden] {
  display: none;
}

.audit-rec-accordion__panel-inner {
  display: grid;
  gap: $space-4;
  padding: 0 clamp($space-4, 3vw, $space-5) clamp($space-4, 3vw, $space-5);
  padding-left: calc(clamp($space-4, 3vw, $space-5) + 2ch + $space-3);

  @media (max-width: 560px) {
    padding-left: clamp($space-4, 3vw, $space-5);
  }
}

.audit-rec-accordion__body {
  margin: 0;
  color: $color-text-muted;
  line-height: $leading-relaxed;
}

.audit-rec-accordion__metric {
  margin: 0;
  font-size: $text-xs;
  color: $color-text-faint;
}

.audit-rec-accordion__fix {
  padding-top: $space-4;
  border-top: 1px solid $color-border;
}

.audit-rec-accordion__fix-label {
  margin: 0 0 $space-2;
  font-size: $text-xs;
  letter-spacing: $tracking-widest;
  text-transform: uppercase;
  color: $color-gold-light;
}

.audit-rec-accordion__fix-text {
  margin: 0;
  color: $color-text;
  line-height: $leading-relaxed;
}

.audit-rec-accordion__official {
  margin: 0;
  font-size: 0.68rem;
  color: $color-text-faint;
}
</style>
