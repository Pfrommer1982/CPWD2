<script setup lang="ts">
import ServiceScene from '~/components/ServiceScene.vue'
import { useMediaQuery } from '@vueuse/core'
import { localeList, localeTags, resolveLocaleMessage, type ServiceLocaleItem } from '~/utils/i18n'
import { resolveElementRef, type TemplateRefValue } from '~/utils/dom'

const services = useSectionTranslations('services')
const localePath = useLocalePath()

const isMobile = useMediaQuery('(max-width: 767px)', { ssrWidth: 768 })
const layout = computed(() => (isMobile.value ? 'mobile' : 'desktop'))
const rootRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const panelRefs = ref<HTMLElement[]>([])
const bgRefs = ref<HTMLElement[]>([])
const progress = ref(0)
const introRingRef = ref<HTMLElement | null>(null)
const introDecoRef = ref<HTMLElement | null>(null)

const items = computed(() => {
  const raw = services.tm('items')
  return localeList<Record<string, unknown>>(raw).map(item => ({
    number: resolveLocaleMessage(item.number, services.rt),
    title: resolveLocaleMessage(item.title, services.rt),
    desc: resolveLocaleMessage(item.desc, services.rt),
    tags: localeTags(item.tags).map(tag => resolveLocaleMessage(tag, services.rt)),
  } satisfies ServiceLocaleItem))
})

const panelCount = computed(() => items.value.length + 2)
const progressLabel = computed(() => String(progress.value + 1).padStart(2, '0'))
const totalLabel = computed(() => String(panelCount.value).padStart(2, '0'))

const sceneAccents = [
  'radial-gradient(ellipse 90% 70% at 20% 30%, rgba(56, 150, 90, 0.14) 0%, transparent 55%)',
  'radial-gradient(ellipse 80% 60% at 75% 25%, rgba(56, 150, 90, 0.11) 0%, transparent 50%)',
  'radial-gradient(ellipse 70% 55% at 50% 80%, rgba(56, 150, 90, 0.09) 0%, transparent 45%)',
  'radial-gradient(ellipse 85% 65% at 15% 70%, rgba(80, 168, 114, 0.1) 0%, transparent 50%)',
  'radial-gradient(ellipse 75% 50% at 85% 50%, rgba(56, 150, 90, 0.12) 0%, transparent 48%)',
  'radial-gradient(ellipse 65% 45% at 40% 20%, rgba(160, 133, 48, 0.08) 0%, transparent 42%)',
  'radial-gradient(ellipse 95% 75% at 60% 40%, rgba(56, 150, 90, 0.15) 0%, transparent 55%)',
  'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(56, 150, 90, 0.18) 0%, transparent 60%)',
]

function setPanelRef(el: TemplateRefValue, index: number) {
  const resolved = resolveElementRef(el)
  if (resolved) panelRefs.value[index] = resolved
}

function setBgRef(el: TemplateRefValue, index: number) {
  const resolved = resolveElementRef(el)
  if (resolved) bgRefs.value[index] = resolved
}

function titleWords(title: string) {
  return title.split(/\s+/).filter(Boolean)
}

function isSceneActive(panelIndex: number) {
  return progress.value === panelIndex
}

useServicesScroll({
  root: rootRef,
  track: trackRef,
  panels: panelRefs,
  backgrounds: bgRefs,
  progress,
  panelCount,
  layout,
})

useIlluminateRing({ ring: introRingRef, trackArea: introDecoRef })
</script>

<template>
  <section
    ref="rootRef"
    class="services-xp"
    aria-labelledby="services-xp-heading"
  >
    <!-- Desktop: pinned horizontal scroll -->
    <div v-if="layout === 'desktop'" class="services-xp__stage services-xp__stage--desktop">
      <div class="services-xp__viewport">
        <!-- Layered backgrounds -->
        <div class="services-xp__bg-stack" aria-hidden="true">
          <div
            v-for="(_, i) in panelCount"
            :key="`bg-${i}`"
            :ref="el => setBgRef(el, i)"
            class="services-xp__bg-slide"
            :style="{ background: sceneAccents[i % sceneAccents.length] }"
          />
          <div class="services-xp__bg-base" />
          <div class="services-xp__noise" />
          <div class="services-xp__vignette" />
          <div class="services-xp__sweep" data-parallax="0.3" />
        </div>

        <!-- Progress rail -->
        <div class="services-xp__rail" aria-hidden="true">
          <span class="services-xp__rail-label">{{ services.t('label') }}</span>
          <div class="services-xp__rail-track">
            <div
              class="services-xp__rail-fill"
              :style="{ transform: `scaleX(${(progress + 1) / panelCount})` }"
            />
          </div>
          <span class="services-xp__rail-count font-mono">{{ progressLabel }} / {{ totalLabel }}</span>
        </div>

        <!-- Horizontal track -->
        <div ref="trackRef" class="services-xp__track">
          <!-- Intro scene -->
          <article
            :ref="el => setPanelRef(el, 0)"
            class="services-panel services-panel--intro"
          >
            <div class="container services-panel__frame">
              <div class="services-panel__content copy-width--wide">
                <span class="section-label services-panel__eyebrow">{{ services.t('label') }}</span>
                <h2 id="services-xp-heading" class="services-panel__hero-title font-display">
                  <span
                    v-for="(word, wi) in titleWords(services.t('heading'))"
                    :key="`intro-${wi}`"
                    class="services-panel__title-word"
                  >
                    <span class="services-panel__title-inner">{{ word }}</span>
                  </span>
                </h2>
                <p class="services-panel__desc services-panel__desc--intro">
                  {{ services.t('intro') }}
                </p>
                <span class="services-panel__hint font-mono">{{ services.t('scrollHint') }}</span>
              </div>
            </div>
            <div
              ref="introDecoRef"
              class="services-panel__deco services-panel__deco--intro"
              data-parallax="1.5"
              aria-hidden="true"
            >
              <span ref="introRingRef" class="services-panel__ring">
                <span class="services-panel__ring-surface" />
                <span class="services-panel__ring-surface services-panel__ring-surface--mid" />
                <span class="services-panel__ring-surface services-panel__ring-surface--inner" />
                <svg
                  class="services-panel__ring-cross"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <line x1="0" y1="50" x2="100" y2="50" />
                  <line x1="50" y1="0" x2="50" y2="100" />
                </svg>
                <span class="services-panel__ring-dot" aria-hidden="true" />
              </span>
            </div>
          </article>

          <!-- Service scenes -->
          <article
            v-for="(item, index) in items"
            :key="item.number"
            :ref="el => setPanelRef(el, index + 1)"
            class="services-panel"
          >
            <span class="services-panel__index font-display" aria-hidden="true">{{ item.number }}</span>
            <div class="container services-panel__frame">
              <div class="services-panel__content">
                <span class="services-panel__number label">{{ item.number }}</span>
                <h3 class="services-panel__title font-display">
                  <span
                    v-for="(word, wi) in titleWords(item.title)"
                    :key="`${item.number}-${wi}`"
                    class="services-panel__title-word"
                  >
                    <span class="services-panel__title-inner">{{ word }}</span>
                  </span>
                </h3>
                <p class="services-panel__desc">{{ item.desc }}</p>
                <ul v-if="item.tags.length" class="services-panel__tags">
                  <li
                    v-for="tag in item.tags"
                    :key="tag"
                    class="services-panel__tag font-mono"
                  >
                    {{ tag }}
                  </li>
                </ul>
              </div>
            </div>
            <div
              class="services-panel__deco services-panel__deco--scene"
              aria-hidden="true"
            >
              <ServiceScene :number="item.number" :active="isSceneActive(index + 1)" />
            </div>
          </article>

          <!-- Finale scene -->
          <article
            :ref="el => setPanelRef(el, items.length + 1)"
            class="services-panel services-panel--finale"
          >
            <div class="container services-panel__frame">
              <div class="services-panel__content services-panel__content--center copy-width">
                <span class="section-label">{{ services.t('cta.label') }}</span>
                <h3 class="services-panel__finale-title font-display">
                  <span
                    v-for="(word, wi) in titleWords(services.t('cta.heading'))"
                    :key="`cta-${wi}`"
                    class="services-panel__title-word"
                  >
                    <span class="services-panel__title-inner">{{ word }}</span>
                  </span>
                </h3>
                <p class="services-panel__desc services-panel__desc--finale">
                  {{ services.t('cta.subtext') }}
                </p>
                <GsapMagneticButton
                  :to="localePath('/contact')"
                  variant="primary"
                  class="services-panel__cta"
                >
                  {{ services.t('cta.button') }}
                  <span class="services-panel__cta-arrow">→</span>
                </GsapMagneticButton>
              </div>
            </div>
            <div class="services-panel__deco services-panel__deco--finale" data-parallax="0.8" aria-hidden="true">
              <span class="services-panel__glow" />
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Mobile: simplified vertical story -->
    <div v-if="layout === 'mobile'" class="services-xp__stage services-xp__stage--mobile">
      <header class="services-xp__mobile-header">
        <span class="section-label">{{ services.t('label') }}</span>
        <h2 class="services-xp__mobile-heading font-display">{{ services.t('heading') }}</h2>
        <p class="services-xp__mobile-intro">{{ services.t('intro') }}</p>
      </header>

      <article
        v-for="(item, index) in items"
        :key="`m-${item.number}`"
        :ref="el => setPanelRef(el, index + 1)"
        class="services-panel services-panel--mobile"
      >
        <div
          :ref="el => setBgRef(el, index + 1)"
          class="services-xp__mobile-bg"
          :style="{ background: sceneAccents[(index + 1) % sceneAccents.length] }"
          aria-hidden="true"
        />
        <span class="services-panel__index services-panel__index--mobile font-display">{{ item.number }}</span>
        <div class="services-panel__content">
          <span class="services-panel__number label">{{ item.number }}</span>
          <h3 class="services-panel__title services-panel__title--mobile font-display">
            <span
              v-for="(word, wi) in titleWords(item.title)"
              :key="`${item.number}-m-${wi}`"
              class="services-panel__title-word"
            >
              <span class="services-panel__title-inner">{{ word }}</span>
            </span>
          </h3>
          <p class="services-panel__desc">{{ item.desc }}</p>
          <ul v-if="item.tags.length" class="services-panel__tags">
            <li v-for="tag in item.tags" :key="tag" class="services-panel__tag font-mono">{{ tag }}</li>
          </ul>
        </div>
      </article>

      <footer
        :ref="el => setPanelRef(el, items.length + 1)"
        class="services-panel services-panel--mobile services-panel--finale-mobile"
      >
        <div
          :ref="el => setBgRef(el, items.length + 1)"
          class="services-xp__mobile-bg"
          :style="{ background: sceneAccents[sceneAccents.length - 1] }"
          aria-hidden="true"
        />
        <div class="services-panel__content services-panel__content--center">
          <span class="section-label">{{ services.t('cta.label') }}</span>
          <h3 class="services-panel__finale-title services-panel__finale-title--mobile font-display">
            {{ services.t('cta.heading') }}
          </h3>
          <p class="services-panel__desc">{{ services.t('cta.subtext') }}</p>
          <GsapMagneticButton :to="localePath('/contact')" variant="primary">
            {{ services.t('cta.button') }} →
          </GsapMagneticButton>
        </div>
      </footer>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.services-xp {
  position: relative;
  background: $color-bg;
  border-block: 1px solid $color-border;
  overflow: hidden;

  &__stage--desktop {
    display: block;
  }

  &__stage--mobile {
    display: block;
    width: 100%;
    max-width: none;
    margin-inline: auto;
    padding-block: clamp(48px, 10vh, 96px);
    padding-inline: $page-gutter;
    overflow-x: clip;
  }

  &__viewport {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  &__bg-stack {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  &__bg-base {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, $color-bg 0%, $color-bg-alt 50%, $color-bg 100%);
  }

  &__bg-slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    will-change: transform, opacity;
    transform: translate3d(0, 0, 0);
  }

  &__noise {
    position: absolute;
    inset: 0;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  &__vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(8, 8, 8, 0.75) 100%);
  }

  &__sweep {
    position: absolute;
    top: -20%;
    left: -30%;
    width: 60%;
    height: 140%;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(56, 150, 90, 0.04) 50%,
      transparent 60%
    );
    transform: rotate(-8deg);
    will-change: transform;
    pointer-events: none;
  }

  &__rail {
    position: absolute;
    left: var(--site-inset);
    bottom: clamp(32px, 5vh, 56px);
    z-index: 20;
    display: flex;
    align-items: center;
    gap: $space-5;
  }

  &__rail-label {
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }

  &__rail-track {
    width: 120px;
    height: 1px;
    background: $color-border;
    overflow: hidden;
  }

  &__rail-fill {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, $color-gold-dark, $color-gold-light);
    transform-origin: left center;
    will-change: transform;
  }

  &__rail-count {
    font-size: $text-xs;
    color: $color-gold;
    letter-spacing: $tracking-wide;
  }

  &__track {
    position: relative;
    z-index: 10;
    display: flex;
    height: 100vh;
    will-change: transform;
    backface-visibility: hidden;
  }

  &__mobile-header {
    margin-bottom: clamp(48px, 10vh, 80px);
  }

  &__mobile-heading {
    font-size: clamp(2rem, 8vw, $text-3xl);
    font-weight: 300;
    line-height: $leading-tight;
    margin-block: $space-5;
    color: $color-text;
    max-width: 18ch;
  }

  &__mobile-intro {
    font-size: clamp($text-base, 3.8vw, $text-lg);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    max-width: none;
  }

  &__mobile-bg {
    position: absolute;
    inset: 0;
    opacity: 0.45;
    pointer-events: none;
    border-radius: inherit;
  }
}

.services-panel {
  position: relative;
  flex: 0 0 100vw;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  padding-block: clamp(48px, 8vh, 96px);
  padding-inline: 0;
  overflow: hidden;

  &__frame {
    position: relative;
    z-index: 2;
    width: 100%;
  }

  &--intro {
    .services-panel__content {
      max-width: none;
    }

    .services-panel__hero-title {
      font-size: clamp(3.5rem, 7vw + 1rem, 9rem);
      font-weight: 300;
      line-height: 0.92;
      letter-spacing: $tracking-tight;
      max-width: 14ch;
      margin-bottom: $space-6;
    }
  }

  &--finale {
    justify-content: center;
    text-align: center;
  }

  &:not(&--intro):not(&--finale):not(&--mobile) {
    --panel-scene-gap: clamp(20px, 2.5vw, 40px);
    --panel-index-zone: clamp(6.5rem, 12vw, 10rem);
    --panel-index-inset: var(--site-inset);

    .services-panel__content {
      max-width: clamp(22rem, 42vw, 38rem);
    }

    .services-panel__desc {
      max-width: none;
    }

    .services-panel__index {
      right: var(--panel-index-inset);
      transform: translateY(-50%);
      transform-origin: right center;
      font-size: clamp(6.5rem, 14vw, 17rem);
      line-height: 0.88;
    }

    .services-panel__deco--scene {
      left: clamp(50%, 44vw, 56%);
      right: calc(var(--panel-index-inset) + var(--panel-index-zone) + var(--panel-scene-gap));
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.service-scene-host),
      :deep(.svc-scene) {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :deep(.svc-scene__stage),
      :deep(.svc-design__panel),
      :deep(.svc-cloud__panel),
      :deep(.svc-pipeline__layout),
      :deep(.svc-sound__panel),
      :deep(.svc-motion__panel),
      :deep(.svc-brand__panel) {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        width: clamp(248px, 24vw, 312px);
        max-width: 100%;
        margin: 0;
      }

      :deep(.svc-design__panel) {
        width: clamp(228px, 22vw, 288px);
      }

      :deep(.svc-cloud__panel) {
        width: clamp(248px, 24vw, 312px);
        max-height: min(312px, 46vh);
      }
    }
  }

  &--mobile {
    position: relative;
    flex: none;
    width: 100%;
    height: auto;
    min-height: auto;
    padding:
      clamp(32px, 7vh, 56px)
      clamp(20px, 5vw, 28px)
      clamp(48px, 12vw, 72px);
    margin-bottom: $space-6;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    background: rgba(15, 15, 15, 0.5);
    overflow: hidden;

    .services-panel__content {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      column-gap: clamp(12px, 4vw, 20px);
      row-gap: clamp(16px, 4vw, 22px);
      width: 100%;
      max-width: none;
      padding-right: 0;
    }

    .services-panel__number {
      grid-column: 1;
      grid-row: 1;
      margin-bottom: 0;
      align-self: start;
      padding-top: 0.2em;
    }

    .services-panel__title--mobile {
      grid-column: 2;
      grid-row: 1;
      max-width: none;
      margin-bottom: 0;
      align-self: start;
    }

    .services-panel__desc {
      grid-column: 1 / -1;
      max-width: none;
      width: 100%;
      text-wrap: pretty;
      font-size: clamp($text-base, 3.6vw, $text-lg);
    }

    .services-panel__tags {
      grid-column: 1 / -1;
      width: 100%;
      margin-top: 0;
      gap: clamp(6px, 2vw, 10px);
    }

    .services-panel__tag {
      font-size: clamp(0.62rem, 2.8vw, 0.72rem);
    }
  }

  &--finale-mobile {
    margin-bottom: 0;
    padding-block: clamp(64px, 12vh, 96px);
    border-color: rgba(56, 150, 90, 0.2);

    // Reset the two-column grid inherited from the regular service cards so the
    // CTA reads as a single centred column (label, heading, copy, button).
    .services-panel__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-right: 0;
    }

    .services-panel__desc {
      max-width: 46ch;
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    will-change: transform;

    &--center {
      max-width: none;
      margin-inline: auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }

  &__eyebrow {
    margin-bottom: $space-6;
  }

  &__hint {
    display: inline-flex;
    align-items: center;
    gap: $space-3;
    margin-top: $space-10;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
    text-transform: uppercase;

    &::after {
      content: '';
      width: 40px;
      height: 1px;
      background: linear-gradient(90deg, $color-gold, transparent);
      animation: hint-pulse 2.4s ease-in-out infinite;
    }
  }

  &__index {
    position: absolute;
    top: 50%;
    right: var(--site-inset);
    transform: translateY(-50%);
    z-index: 0;
    font-size: clamp(8rem, 18vw, 20rem);
    font-weight: 300;
    line-height: 1;
    color: $color-gold;
    opacity: 0.08;
    pointer-events: none;
    user-select: none;
    will-change: transform, opacity;

    &--mobile {
      top: auto;
      bottom: clamp(4px, 1.5vw, 12px);
      right: clamp(8px, 3vw, 16px);
      transform: none;
      font-size: clamp(5rem, 36vw, 9rem);
      line-height: 0.82;
      opacity: 0.045;
    }
  }

  &__number {
    display: block;
    margin-bottom: $space-5;
    color: $color-gold;
  }

  &__title {
    font-size: clamp(2.5rem, 5vw + 0.5rem, 6rem);
    font-weight: 300;
    line-height: 0.95;
    letter-spacing: $tracking-tight;
    margin-bottom: $space-6;
    perspective: 800px;

    &--mobile {
      font-size: clamp(1.75rem, 7.5vw, 2.5rem);
      max-width: 14ch;
      line-height: 1.05;
    }
  }

  &__title-word {
    display: inline-block;
    overflow: hidden;
    margin-right: 0.22em;
    vertical-align: top;
  }

  &__title-inner {
    display: inline-block;
    will-change: transform, opacity;
    transform: translate3d(0, 0, 0);
  }

  &__finale-title {
    font-size: clamp(2.5rem, 5vw + 0.5rem, 5.5rem);
    font-weight: 300;
    line-height: 1;
    margin-block: $space-5 $space-6;
    perspective: 800px;

    &--mobile {
      font-size: clamp(2rem, 7vw, 3.5rem);
    }
  }

  &__desc {
    font-size: clamp($text-base, 1vw + 0.8rem, $text-xl);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    max-width: 48ch;
    will-change: transform, opacity, clip-path;

    &--intro {
      font-size: $text-xl;
      max-width: 42ch;
    }

    &--finale {
      margin-bottom: $space-8;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    list-style: none;
    margin-top: $space-6;
  }

  &__tag {
    padding: 6px 14px;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
    will-change: transform, opacity;
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    gap: $space-4;
  }

  &__cta-arrow {
    transition: transform $dur-med $ease-out-expo;
  }

  &__deco {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    will-change: transform;

    &--intro {
      pointer-events: auto;
    }

    &--scene {
      pointer-events: none;
      z-index: 3;
    }

    &--finale {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__ring {
    --ratio-x: 0.5;
    --ratio-y: 0.75;
    --from-center: 0.5;
    --shimmer-angle: 0deg;
    --noise-x: 0px;
    --noise-y: 0px;
    --shimmer-pulse: 0.75;
    --ring-thickness: clamp(14px, 3vw, 24px);
    --ring-thickness-mid: clamp(7px, 1.5vw, 11px);
    --ring-thickness-inner: clamp(10px, 2vw, 16px);
    --ring-bgoffsetx: calc(2.9px * var(--ratio-x) + var(--noise-x));
    --ring-bgoffsety: calc(4.3px * var(--ratio-y) + var(--noise-y));
    --ring-pointerx: calc(100% * var(--ratio-x));
    --ring-pointery: calc(100% * var(--ratio-y));

    position: absolute;
    top: 50%;
    right: max(10vw, calc(var(--site-inset) + clamp(24px, 4vw, 80px)));
    width: clamp(200px, 30vw, 480px);
    height: clamp(200px, 30vw, 480px);
    border-radius: 50%;
    pointer-events: none;
    transform: translate3d(0, calc(-50% + clamp(28px, 5vh, 64px)), 0.01px);
    isolation: isolate;
  }

  &__ring-surface {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    padding: var(--ring-thickness);
    background:
      conic-gradient(
        from var(--shimmer-angle),
        rgba(56, 150, 90, 0.14) 0deg,
        rgba(242, 238, 232, 0.38) 55deg,
        rgba(80, 168, 114, 0.52) 110deg,
        rgba(100, 118, 110, 0.14) 180deg,
        rgba(242, 238, 232, 0.3) 250deg,
        rgba(56, 150, 90, 0.22) 320deg,
        rgba(56, 150, 90, 0.12) 360deg
      ),
      linear-gradient(135deg, rgba(56, 150, 90, 0.22), rgba(80, 168, 114, 0.1)),
      url('https://assets.codepen.io/13471/noise-top.png'),
      url('https://assets.codepen.io/13471/noise-top.png'),
      radial-gradient(
        farthest-corner circle at var(--ring-pointerx) var(--ring-pointery),
        rgba(242, 238, 232, 0.88) 0,
        rgba(80, 168, 114, 0.48) 52px,
        rgba(56, 150, 90, 0.22) 96px,
        rgba(56, 150, 90, 0.12) 100%
      );
    background-position:
      center,
      center,
      calc(70% + var(--ring-bgoffsetx)) calc(70% + var(--ring-bgoffsety)),
      calc(30% - var(--ring-bgoffsetx)) calc(30% - var(--ring-bgoffsety)),
      center;
    background-size: cover, cover, 160px auto, 352px auto, cover;
    background-blend-mode: overlay, normal, multiply, overlay, overlay;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    filter: drop-shadow(0 0 20px rgba(56, 150, 90, 0.22)) brightness(calc(1.08 + var(--shimmer-pulse) * 0.14));

    &--mid {
      inset: 38%;
      padding: var(--ring-thickness-mid);
      opacity: calc(0.62 + var(--shimmer-pulse) * 0.24);
      filter: drop-shadow(0 0 14px rgba(80, 168, 114, 0.16)) brightness(calc(1.06 + var(--shimmer-pulse) * 0.1));
    }

    &--inner {
      inset: 15%;
      padding: var(--ring-thickness-inner);
      opacity: calc(0.68 + var(--shimmer-pulse) * 0.26);
      filter: drop-shadow(0 0 16px rgba(56, 150, 90, 0.16)) brightness(calc(1.05 + var(--shimmer-pulse) * 0.1));
    }
  }

  &__ring-cross {
    position: absolute;
    inset: -8%;
    z-index: 3;
    pointer-events: none;

    line {
      stroke: rgba(200, 198, 192, 0.62);
      stroke-width: 0.65;
      vector-effect: non-scaling-stroke;
      shape-rendering: crispEdges;
    }
  }

  &__ring-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 4;
    width: clamp(7px, 0.95vw, 11px);
    height: clamp(7px, 0.95vw, 11px);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgba(242, 238, 232, 1) 0%,
      rgba(80, 168, 114, 0.92) 42%,
      rgba(56, 150, 90, 0.78) 100%
    );
    box-shadow:
      0 0 calc(6px + var(--shimmer-pulse) * 8px) rgba(56, 150, 90, calc(0.28 + var(--shimmer-pulse) * 0.18)),
      0 0 calc(2px + var(--shimmer-pulse) * 3px) rgba(242, 238, 232, 0.55);
    filter: brightness(calc(1.02 + var(--shimmer-pulse) * 0.12));
  }

  &__line {
    position: absolute;
    bottom: 20%;
    left: 8%;
    width: clamp(80px, 15vw, 200px);
    height: 1px;
    background: linear-gradient(90deg, $color-gold, transparent);
    opacity: 0.4;
  }

  &__glow {
    width: clamp(300px, 50vw, 600px);
    height: clamp(300px, 50vw, 600px);
    border-radius: 50%;
    background: radial-gradient(circle, $color-gold-glow 0%, transparent 70%);
    opacity: 0.8;
  }
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.3; transform: scaleX(0.6); }
  50% { opacity: 1; transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .services-xp__track,
  .services-xp__stage--desktop .services-panel__title-inner,
  .services-xp__stage--desktop .services-panel__desc,
  .services-xp__stage--desktop .services-panel__tag,
  .services-xp__bg-slide {
    will-change: auto;
    transform: none !important;
    opacity: 1 !important;
    clip-path: none !important;
  }
}
</style>
