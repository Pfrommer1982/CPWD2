<script setup lang="ts">
import ServiceScene from '~/components/ServiceScene.vue'
import { useMediaQuery } from '@vueuse/core'
import { localeList, localeTags, resolveLocaleMessage, type ServiceLocaleItem } from '~/utils/i18n'

const services = useSectionTranslations('services')
const localePath = useLocalePath()

const isMobile = useMediaQuery('(max-width: 1099px)', { ssrWidth: 1100 })
const layout = computed(() => (isMobile.value ? 'mobile' : 'desktop'))

const rootRef = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const spineFillRef = ref<HTMLElement | null>(null)
const chapterRefs = ref<HTMLElement[]>([])
const finaleRef = ref<HTMLElement | null>(null)
const activeChapter = ref(-1)
const journeyReady = ref(false)

const items = computed(() => {
  const raw = services.tm('items')
  return localeList<Record<string, unknown>>(raw).map(item => ({
    number: resolveLocaleMessage(item.number, services.rt),
    title: resolveLocaleMessage(item.title, services.rt),
    desc: resolveLocaleMessage(item.desc, services.rt),
    tags: localeTags(item.tags).map(tag => resolveLocaleMessage(tag, services.rt)),
  } satisfies ServiceLocaleItem))
})

function setChapterRef(el: Element | null, index: number) {
  if (el) chapterRefs.value[index] = el as HTMLElement
}

function titleWords(title: string) {
  return title.split(/\s+/).filter(Boolean)
}

function isSceneActive(index: number) {
  return activeChapter.value === index
}

function spinePointActive(index: number) {
  return activeChapter.value >= index
}

useServicesJourney({
  root: rootRef,
  chapters: chapterRefs,
  spineFill: spineFillRef,
  hero: heroRef,
  finale: finaleRef,
  activeChapter,
  layout,
  ready: journeyReady,
})

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    journeyReady.value = true
  })
})
</script>

<template>
  <div ref="rootRef" class="services-journey">
    <ServicesJourneyBackdrop
      :root="rootRef"
      :hero="heroRef"
      :chapters="chapterRefs"
      :finale="finaleRef"
      :ready="journeyReady"
    />

    <header ref="heroRef" class="services-journey__hero">
      <div class="services-journey__hero-inner container">
        <span class="section-label" data-hero-fade>{{ services.t('journey.label') }}</span>
        <h1 class="services-journey__heading font-display">
          <span
            v-for="(word, wi) in titleWords(services.t('journey.heading'))"
            :key="`jh-${wi}`"
            class="services-journey__heading-word"
          >
            <span data-hero-word class="services-journey__heading-inner">{{ word }}</span>
          </span>
        </h1>
        <p class="services-journey__intro" data-hero-fade>
          {{ services.t('journey.intro') }}
        </p>
        <span class="services-journey__hint font-mono" data-hero-fade>
          {{ services.t('journey.scrollHint') }}
        </span>
      </div>
      <div class="services-journey__hero-line" aria-hidden="true" />
    </header>

    <aside
      v-if="layout === 'desktop'"
      class="services-journey__spine"
      aria-hidden="true"
    >
      <div class="services-journey__spine-track">
        <div ref="spineFillRef" class="services-journey__spine-fill" />
      </div>
      <ol class="services-journey__spine-points">
        <li
          class="services-journey__spine-point"
          :class="{ 'services-journey__spine-point--active': activeChapter >= -1 }"
        >
          <span class="services-journey__spine-dot" />
          <span class="services-journey__spine-label font-mono">{{ services.t('journey.departure') }}</span>
        </li>
        <li
          v-for="(item, index) in items"
          :key="`sp-${item.number}`"
          class="services-journey__spine-point"
          :class="{ 'services-journey__spine-point--active': spinePointActive(index) }"
        >
          <span class="services-journey__spine-dot" />
          <span class="services-journey__spine-label font-mono">{{ item.number }}</span>
        </li>
        <li
          class="services-journey__spine-point"
          :class="{ 'services-journey__spine-point--active': activeChapter >= items.length }"
        >
          <span class="services-journey__spine-dot" />
          <span class="services-journey__spine-label font-mono">{{ services.t('journey.arrival') }}</span>
        </li>
      </ol>
    </aside>

    <div class="services-journey__route">
      <article
        v-for="(item, index) in items"
        :key="item.number"
        :ref="el => setChapterRef(el, index)"
        class="journey-chapter"
        :class="{ 'journey-chapter--mobile': layout === 'mobile' }"
      >
        <span class="journey-chapter__index font-display" aria-hidden="true">{{ item.number }}</span>

        <div class="journey-chapter__sticky">
          <div
            class="journey-chapter__inner container"
            :class="{ 'journey-chapter__inner--reverse': index % 2 === 1 && layout === 'desktop' }"
          >
          <div
            class="journey-chapter__content"
            :data-chapter-side="index % 2 === 0 ? 'left' : 'right'"
          >
            <span class="section-label" data-chapter-fade>
              {{ services.t('journey.chapter') }} {{ item.number }}
            </span>
            <h2 class="journey-chapter__title font-display">
              <span
                v-for="(word, wi) in titleWords(item.title)"
                :key="`${item.number}-t-${wi}`"
                class="journey-chapter__title-word"
              >
                <span class="journey-chapter__title-inner" data-chapter-word>{{ word }}</span>
              </span>
            </h2>
            <p class="journey-chapter__desc" data-chapter-desc>{{ item.desc }}</p>
            <ul v-if="item.tags.length" class="journey-chapter__tags">
              <li
                v-for="tag in item.tags"
                :key="tag"
                class="journey-chapter__tag font-mono"
                data-chapter-tag
              >
                {{ tag }}
              </li>
            </ul>
          </div>

          <div
            v-if="layout === 'desktop'"
            class="journey-chapter__scene"
            :class="[
              index % 2 === 0 ? 'journey-chapter__scene--trailing' : 'journey-chapter__scene--leading',
              (index === 2 || index === 3) && 'journey-chapter__scene--spacious',
            ]"
            aria-hidden="true"
          >
            <ServiceScene
              :number="item.number"
              :active="isSceneActive(index)"
              embedded
            />
          </div>
        </div>
        </div>
      </article>

      <footer
        ref="finaleRef"
        class="journey-chapter journey-chapter--finale"
        :class="{ 'journey-chapter--mobile': layout === 'mobile' }"
      >
        <div class="journey-chapter__inner journey-chapter__inner--finale container">
          <div class="journey-chapter__content journey-chapter__content--center">
            <span class="section-label" data-chapter-fade>{{ services.t('cta.label') }}</span>
            <h2 class="journey-chapter__finale-title font-display">
              <span
                v-for="(word, wi) in titleWords(services.t('cta.heading'))"
                :key="`fin-${wi}`"
                class="journey-chapter__title-word"
              >
                <span class="journey-chapter__title-inner" data-chapter-word>{{ word }}</span>
              </span>
            </h2>
            <p class="journey-chapter__desc journey-chapter__desc--finale" data-chapter-desc>
              {{ services.t('cta.subtext') }}
            </p>
            <GsapMagneticButton
              :to="localePath('/contact')"
              variant="primary"
              class="journey-chapter__cta"
              data-chapter-fade
            >
              {{ services.t('cta.button') }}
              <span aria-hidden="true">→</span>
            </GsapMagneticButton>
          </div>
          <div v-if="layout === 'desktop'" class="journey-chapter__finale-glow" aria-hidden="true" />
        </div>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.services-journey {
  position: relative;
  z-index: 2;
  background: transparent;
  overflow: visible;

  &__hero {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    padding: clamp(120px, 18vh, 180px) 0 clamp(64px, 10vh, 96px);
    z-index: 2;
  }

  &__hero-inner {
    position: relative;
    z-index: 2;
    max-width: min(920px, 90vw);
  }

  &__heading {
    font-size: clamp(3rem, 7vw + 1rem, 7.5rem);
    font-weight: 300;
    line-height: 0.92;
    letter-spacing: $tracking-tight;
    margin-block: $space-6;
    perspective: 900px;
  }

  &__heading-word {
    display: inline-block;
    overflow: hidden;
    margin-right: 0.2em;
    vertical-align: top;
  }

  &__heading-inner {
    display: inline-block;
  }

  &__intro {
    font-size: clamp($text-lg, 1vw + 1rem, $text-xl);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    max-width: 52ch;
    margin-bottom: $space-8;
  }

  &__hint {
    display: inline-flex;
    align-items: center;
    gap: $space-3;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;

    &::after {
      content: '';
      width: 48px;
      height: 1px;
      background: linear-gradient(90deg, $color-gold, transparent);
      animation: journey-hint 2.4s ease-in-out infinite;
    }
  }

  &__hero-line {
    position: absolute;
    bottom: 0;
    left: clamp(24px, 5vw, 80px);
    width: 1px;
    height: clamp(80px, 12vh, 140px);
    background: linear-gradient(180deg, $color-gold, transparent);
    opacity: 0.5;
  }

  &__spine {
    position: fixed;
    left: clamp(16px, 3vw, 40px);
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    display: flex;
    align-items: stretch;
    gap: $space-4;
    pointer-events: none;

    @media (max-width: 767px) {
      display: none;
    }
  }

  &__spine-track {
    position: relative;
    width: 1px;
    align-self: stretch;
    min-height: 280px;
    background: rgba(56, 150, 90, 0.12);
  }

  &__spine-fill {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, $color-gold-dark, $color-gold-light);
    transform-origin: top center;
    transform: scaleY(0);
  }

  &__spine-points {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: $space-3;
    margin: 0;
    padding: 0;
    min-height: 280px;
  }

  &__spine-point {
    display: flex;
    align-items: center;
    gap: $space-3;
    opacity: 0.35;
    transition: opacity $dur-med $ease-gold;

    &--active {
      opacity: 1;
    }
  }

  &__spine-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: 1px solid rgba(56, 150, 90, 0.45);
    background: $color-bg;
    transition:
      background-color $dur-med $ease-gold,
      box-shadow $dur-med $ease-gold,
      border-color $dur-med $ease-gold;

    .services-journey__spine-point--active & {
      background: $color-gold;
      border-color: $color-gold-light;
      box-shadow: 0 0 12px rgba(56, 150, 90, 0.45);
    }
  }

  &__spine-label {
    font-size: 9px;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;
    white-space: nowrap;

    .services-journey__spine-point--active & {
      color: $color-gold;
    }
  }

  &__route {
    position: relative;
    z-index: 2;
  }
}

.journey-chapter {
  position: relative;
  min-height: 125vh;
  background: transparent;

  &--mobile {
    min-height: auto;
    padding-block: clamp(56px, 12vh, 88px);
  }

  &--finale {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  &__sticky {
    position: sticky;
    top: 0;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    z-index: 2;

    .journey-chapter--mobile & {
      position: relative;
      top: auto;
      min-height: auto;
    }
  }

  &__index {
    position: absolute;
    top: 50%;
    right: clamp(12px, 4vw, 48px);
    transform: translateY(-50%);
    font-size: clamp(7rem, 16vw, 18rem);
    font-weight: 300;
    line-height: 1;
    color: $color-gold;
    opacity: 0.07;
    pointer-events: none;
    user-select: none;

    .journey-chapter--mobile & {
      top: $space-5;
      right: $space-5;
      transform: none;
      font-size: clamp(3.5rem, 14vw, 5rem);
    }
  }

  &__inner {
    position: relative;
    z-index: 2;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: clamp(48px, 6vw, 96px);
    padding-block: clamp(32px, 5vh, 56px);

    &--reverse {
      flex-direction: row-reverse;
    }

    .journey-chapter--mobile & {
      flex-direction: column;
      gap: $space-6;
      padding-block: 0;
    }

    &--finale {
      flex-direction: column;
      justify-content: center;
      text-align: center;
      padding-block: clamp(80px, 12vh, 120px);
      min-height: min(100vh, 100dvh);
    }
  }

  @media (max-width: 1099px) {
    &__inner:not(&__inner--finale) {
      flex-direction: column !important;
      align-items: stretch;
      gap: clamp(32px, 6vh, 56px);
      padding-block: clamp(48px, 8vh, 72px);
    }

    &__content {
      flex: 1 1 auto;
      max-width: min(520px, 100%);
      margin-inline: 0 !important;
    }

    &__scene {
      flex: 0 0 auto;
      width: 100%;
      min-height: clamp(280px, 40vh, 420px);
      height: auto;
      padding-block: clamp(28px, 5vh, 48px);
      overflow: visible;
    }
  }

  @media (max-width: 639px) {
    &__inner--finale {
      padding-block: clamp(64px, 10vh, 96px);
    }

    &__finale-title {
      font-size: clamp(2rem, 8vw, 2.75rem);
    }
  }

  &__content {
    flex: 0 1 520px;
    min-width: 0;
    max-width: 520px;
    position: relative;
    z-index: 3;
    align-self: center;

    &[data-chapter-side='right'] {
      margin-inline-start: auto;
    }

    &--center {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: min(640px, calc(100vw - 48px));
      margin-inline: auto;
      position: relative;
      z-index: 4;
      isolation: isolate;
    }
  }

  &__title {
    font-size: clamp(2.25rem, 4.5vw + 0.5rem, 5rem);
    font-weight: 300;
    line-height: 0.95;
    letter-spacing: $tracking-tight;
    margin-bottom: $space-6;
    perspective: 800px;
  }

  &__title-word {
    display: inline-block;
    overflow: hidden;
    margin-right: 0.2em;
    vertical-align: top;
  }

  &__title-inner {
    display: inline-block;
  }

  &__finale-title {
    font-size: clamp(2.5rem, 5vw + 0.5rem, 5.5rem);
    font-weight: 300;
    line-height: 1;
    margin-block: $space-5 $space-6;
  }

  &__desc {
    font-size: clamp($text-base, 0.8vw + 0.9rem, $text-xl);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    max-width: 48ch;

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
  }

  &__scene {
    position: relative;
    z-index: 1;
    flex: 1 1 0;
    min-width: 0;
    min-height: clamp(340px, 52vh, 560px);
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    padding-block: clamp(40px, 6vh, 72px);
    padding-inline: clamp(12px, 2vw, 28px);
    overflow: visible;
    isolation: isolate;

    &--spacious {
      min-height: clamp(400px, 58vh, 620px);
      padding-block: clamp(48px, 7vh, 80px);
    }

    &--leading {
      justify-content: flex-start;

      :deep(.service-scene-host--embedded) {
        justify-content: flex-start;
      }

      :deep(.svc-scene) {
        justify-content: flex-start;
      }

      :deep(.svc-design__panel),
      :deep(.svc-cloud__panel),
      :deep(.svc-scene__stage),
      :deep(.svc-pipeline__layout),
      :deep(.svc-sound__panel),
      :deep(.svc-motion__panel),
      :deep(.svc-brand__panel) {
        margin-inline: 0 auto;
      }
    }

    &--trailing {
      justify-content: flex-end;

      :deep(.service-scene-host--embedded) {
        justify-content: flex-end;
      }

      :deep(.svc-scene) {
        justify-content: flex-end;
      }

      :deep(.svc-design__panel),
      :deep(.svc-cloud__panel),
      :deep(.svc-scene__stage),
      :deep(.svc-pipeline__layout),
      :deep(.svc-sound__panel),
      :deep(.svc-motion__panel),
      :deep(.svc-brand__panel) {
        margin-inline: auto 0;
      }
    }
  }

  &__finale-glow {
    position: absolute;
    inset: 0;
    margin: auto;
    width: clamp(200px, 40vw, 520px);
    height: clamp(200px, 40vw, 520px);
    border-radius: 50%;
    background: radial-gradient(circle, $color-gold-glow 0%, transparent 70%);
    opacity: 0.9;
    pointer-events: none;
    z-index: 0;

    @media (max-width: 1099px) {
      width: clamp(160px, 55vw, 360px);
      height: clamp(160px, 55vw, 360px);
      opacity: 0.55;
    }
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    gap: $space-4;
  }
}

@keyframes journey-hint {
  0%, 100% { opacity: 0.3; transform: scaleX(0.6); }
  50% { opacity: 1; transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .services-journey__hint::after {
    animation: none;
  }
}
</style>
