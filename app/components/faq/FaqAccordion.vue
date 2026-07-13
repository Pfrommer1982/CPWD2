<script setup lang="ts">
import type { KnowledgeArticle } from '~/data/knowledge'

const props = defineProps<{
  article: KnowledgeArticle
  index: number
}>()

const faq = useSectionTranslations('faq')
const { locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => (locale.value === 'en' ? 'en' : 'nl'))
const open = ref(false)
const decoding = ref(false)
const progress = ref(0)

const uid = useId()
const buttonId = computed(() => `faq-q-${uid}`)
const panelId = computed(() => `faq-a-${uid}`)

const number = computed(() => String(props.index + 1).padStart(2, '0'))
const progressText = computed(() => String(progress.value).padStart(3, '0'))

const LOADER_DURATION = 460
const { animateMotion } = useGraphicsCapability()
let raf = 0

function stopLoader() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function runLoader() {
  stopLoader()
  decoding.value = true
  progress.value = 0

  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min((now - start) / LOADER_DURATION, 1)
    // Stepped, retro cadence rather than a perfectly smooth fill.
    progress.value = Math.round(t * 20) * 5
    if (t < 1) {
      raf = requestAnimationFrame(step)
    }
    else {
      progress.value = 100
      decoding.value = false
      raf = 0
    }
  }
  raf = requestAnimationFrame(step)
}

function toggle() {
  if (open.value) {
    open.value = false
    stopLoader()
    decoding.value = false
    return
  }

  open.value = true
  if (!animateMotion.value) {
    decoding.value = false
    progress.value = 100
    return
  }
  runLoader()
}

onUnmounted(stopLoader)
</script>

<template>
  <div class="faq-item" :class="{ 'faq-item--open': open }">
    <h3 class="faq-item__heading">
      <button
        :id="buttonId"
        type="button"
        class="faq-item__trigger"
        :aria-expanded="open"
        :aria-controls="panelId"
        data-cursor="hover"
        @click="toggle"
      >
        <span class="faq-item__number font-mono">{{ number }}</span>
        <span class="faq-item__question font-display">{{ article.question[lang] }}</span>
        <span class="faq-item__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
        </span>
      </button>
    </h3>

    <div
      :id="panelId"
      class="faq-item__panel"
      role="region"
      :aria-labelledby="buttonId"
      :hidden="!open"
    >
      <div class="faq-item__panel-inner">
        <div
          v-if="decoding"
          class="faq-item__loader font-mono"
          aria-hidden="true"
        >
          <div class="faq-item__loader-head">
            <span>DECRYPTING</span>
            <span>{{ progressText }}%</span>
          </div>
          <div class="faq-item__loader-track">
            <div class="faq-item__loader-fill" :style="{ width: `${progress}%` }" />
          </div>
        </div>

        <div v-show="!decoding" class="faq-item__reveal">
          <p class="faq-item__answer">{{ article.answer[lang] }}</p>
          <NuxtLink
            :to="localePath(`/faq/${article.slug}`)"
            class="faq-item__link font-mono"
            data-cursor="hover"
          >
            {{ faq.t('readArticle') }}
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.faq-item {
  border-bottom: 1px solid $color-border;
}

.faq-item__heading {
  margin: 0;
}

.faq-item__trigger {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: clamp(12px, 2vw, 24px);
  width: 100%;
  padding: clamp(18px, 2.4vw, 28px) 0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: $color-text-muted;
  transition: color $dur-fast $ease-gold;

  &:hover {
    color: $color-text;
  }

  &:focus-visible {
    outline: 1px solid $color-comms;
    outline-offset: 4px;
  }
}

.faq-item__number {
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  color: $color-comms;
}

.faq-item__question {
  font-size: clamp(1.1rem, 1.6vw, 1.4rem);
  font-weight: 500;
  letter-spacing: $tracking-tight;
  line-height: 1.25;
  color: inherit;
}

.faq-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid $color-border;
  color: $color-comms;
  transition: transform $dur-med $ease-gold, border-color $dur-fast $ease-gold;

  .faq-item--open & {
    transform: rotate(135deg);
    border-color: $color-border-hover;
  }
}

.faq-item__panel[hidden] {
  display: none;
}

.faq-item__panel-inner {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: 0 0 clamp(20px, 2.4vw, 28px) calc(clamp(12px, 2vw, 24px) + 2ch);

  @media (max-width: 560px) {
    padding-left: 0;
  }
}

.faq-item__loader {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  max-width: 68ch;
  padding: $space-2 0;
}

.faq-item__loader-head {
  display: flex;
  justify-content: space-between;
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  color: $color-comms-light;
}

.faq-item__loader-track {
  position: relative;
  height: 10px;
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

.faq-item__loader-fill {
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    $color-comms 0,
    $color-comms 6px,
    $color-comms-light 6px,
    $color-comms-light 8px
  );
  box-shadow: 0 0 12px rgba($color-comms, 0.55);
  transition: width 40ms linear;
}

.faq-item__reveal {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  animation: faq-reveal-in $dur-med $ease-out-expo both;
}

@keyframes faq-reveal-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.faq-item__answer {
  max-width: 68ch;
  font-size: $text-base;
  line-height: $leading-relaxed;
  color: $color-text-muted;
}

.faq-item__link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  text-transform: uppercase;
  color: $color-comms;
  transition: gap $dur-fast $ease-gold, color $dur-fast $ease-gold;

  &:hover {
    color: $color-comms-light;
    gap: $space-3;
  }

  &:focus-visible {
    outline: 1px solid $color-comms;
    outline-offset: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq-item__reveal {
    animation: none;
  }
}
</style>
