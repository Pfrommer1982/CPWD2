<script setup lang="ts">
import ServiceScene from '~/components/ServiceScene.vue'
import { useMediaQuery } from '@vueuse/core'
import { localeList, localeTags, resolveLocaleMessage, type ServiceLocaleItem } from '~/utils/i18n'
import { resolveElementRef, type TemplateRefValue } from '~/utils/dom'

const services = useSectionTranslations('services')
const localePath = useLocalePath()

const isMobile = useMediaQuery('(max-width: 899px)', { ssrWidth: 900 })
const layout = computed(() => (isMobile.value ? 'mobile' : 'desktop'))

const rootRef = ref<HTMLElement | null>(null)
const slideRefs = ref<HTMLElement[]>([])
const activeIndex = ref(0)
const progress = ref(0)

const items = computed(() => {
  const raw = services.tm('items')
  return localeList<Record<string, unknown>>(raw).map(item => ({
    number: resolveLocaleMessage(item.number, services.rt),
    title: resolveLocaleMessage(item.title, services.rt),
    desc: resolveLocaleMessage(item.desc, services.rt),
    tags: localeTags(item.tags).map(tag => resolveLocaleMessage(tag, services.rt)),
  } satisfies ServiceLocaleItem))
})

const activeItem = computed(() => items.value[activeIndex.value] ?? items.value[0])

function setSlideRef(el: TemplateRefValue, index: number) {
  const resolved = resolveElementRef(el)
  if (resolved) slideRefs.value[index] = resolved
}

const { selectChapter } = useServicesCarousel({
  root: rootRef,
  slides: slideRefs,
  activeIndex,
  progress,
  itemCount: computed(() => items.value.length),
})
</script>

<template>
  <section
    ref="rootRef"
    class="services-intro"
    aria-labelledby="services-intro-heading"
  >
    <div class="services-intro__backdrop" aria-hidden="true">
      <div class="services-intro__glow" />
      <div class="services-intro__grid" />
      <div class="services-intro__noise" />
    </div>

    <!-- Desktop -->
    <div v-if="layout === 'desktop'" class="services-intro__desktop">
      <div class="services-intro__layout container">
        <aside class="services-intro__aside">
          <span class="section-label">{{ services.t('label') }}</span>
          <h2 id="services-intro-heading" class="services-intro__heading font-display">
            {{ services.t('heading') }}
          </h2>
          <p class="services-intro__copy">
            {{ services.t('intro') }}
          </p>

          <GsapMagneticButton
            :to="localePath('/services')"
            variant="ghost"
            class="services-intro__cta"
            data-cursor="view"
          >
            {{ services.t('teaser.cta') }}
            <span aria-hidden="true">→</span>
          </GsapMagneticButton>

          <div class="services-intro__index" role="list" :aria-label="services.t('label')">
            <span class="services-intro__index-label font-mono">{{ services.t('teaser.previewLabel') }}</span>
            <button
              v-for="(item, index) in items"
              :key="`rail-${item.number}`"
              type="button"
              role="listitem"
              class="services-intro__chapter"
              :class="{ 'services-intro__chapter--active': activeIndex === index }"
              :aria-current="activeIndex === index ? 'true' : undefined"
              @click="selectChapter(index)"
            >
              <span class="services-intro__chapter-row">
                <span class="services-intro__chapter-number font-mono">{{ item.number }}</span>
                <span class="services-intro__chapter-title">{{ item.title }}</span>
              </span>
              <span class="services-intro__chapter-bar" aria-hidden="true">
                <span
                  class="services-intro__chapter-fill"
                  :style="{ transform: `scaleX(${activeIndex === index ? progress : 0})` }"
                />
              </span>
            </button>
          </div>
        </aside>

        <div class="services-intro__stage">
          <div class="services-intro__preview">
            <span class="services-intro__preview-frame" aria-hidden="true" />
            <span
              class="services-intro__preview-index font-display"
              aria-hidden="true"
            >
              {{ activeItem?.number }}
            </span>

            <div
              v-for="(item, index) in items"
              :key="`slide-${item.number}`"
              :ref="el => setSlideRef(el, index)"
              class="services-intro__slide"
              :aria-hidden="activeIndex !== index"
            >
              <ServiceScene
                :number="item.number"
                :active="activeIndex === index"
                embedded
              />
            </div>

            <div class="services-intro__slide-caption">
              <span class="label">{{ activeItem?.number }}</span>
              <h3 class="services-intro__slide-title font-display">
                {{ activeItem?.title }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile -->
    <div v-if="layout === 'mobile'" class="services-intro__mobile container">
      <header class="services-intro__mobile-header">
        <span class="section-label">{{ services.t('label') }}</span>
        <h2 id="services-intro-heading" class="services-intro__heading font-display">
          {{ services.t('heading') }}
        </h2>
        <p class="services-intro__copy">
          {{ services.t('intro') }}
        </p>
      </header>

      <div class="services-intro__mobile-stage">
        <div class="services-intro__preview services-intro__preview--mobile">
          <span class="services-intro__preview-frame" aria-hidden="true" />
          <span class="services-intro__preview-index font-display" aria-hidden="true">
            {{ activeItem?.number }}
          </span>

          <div
            v-for="(item, index) in items"
            :key="`m-slide-${item.number}`"
            :ref="el => setSlideRef(el, index)"
            class="services-intro__slide"
            :aria-hidden="activeIndex !== index"
          >
            <ServiceScene
              :number="item.number"
              :active="activeIndex === index"
              embedded
            />
          </div>

          <div class="services-intro__slide-caption">
            <span class="label">{{ activeItem?.number }}</span>
            <h3 class="services-intro__slide-title font-display">
              {{ activeItem?.title }}
            </h3>
          </div>
        </div>

        <div class="services-intro__mobile-now">
          <div class="services-intro__mobile-now-meta">
            <span class="services-intro__chapter-number font-mono">{{ activeItem?.number }}</span>
            <span class="services-intro__chapter-title">{{ activeItem?.title }}</span>
            <span class="services-intro__mobile-counter font-mono">
              {{ activeIndex + 1 }}/{{ items.length }}
            </span>
          </div>
          <span class="services-intro__chapter-bar" aria-hidden="true">
            <span
              class="services-intro__chapter-fill"
              :style="{ transform: `scaleX(${progress})` }"
            />
          </span>
        </div>
      </div>

      <GsapMagneticButton
        :to="localePath('/services')"
        variant="primary"
        class="services-intro__mobile-cta"
      >
        {{ services.t('teaser.cta') }}
        <span aria-hidden="true">→</span>
      </GsapMagneticButton>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.services-intro {
  position: relative;
  background: $color-bg;
  border-block: 1px solid $color-border;
  overflow: hidden;

  &__backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__glow {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 55% 45% at 72% 42%, rgba(56, 150, 90, 0.12), transparent 68%),
      radial-gradient(ellipse 40% 35% at 18% 68%, rgba(56, 150, 90, 0.06), transparent 70%);
  }

  &__grid {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image:
      linear-gradient(rgba($color-gold, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba($color-gold, 0.04) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 85% 70% at 60% 50%, #000 15%, transparent 75%);
  }

  &__noise {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  &__desktop {
    position: relative;
    z-index: 1;
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: clamp(32px, 4vw, 56px);
    align-items: center;
    padding-block: clamp(72px, 10vh, 96px);
  }

  &__aside {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 34ch;
  }

  &__heading {
    margin-block: $space-5 $space-4;
    font-size: clamp(2.2rem, 3.6vw, 3.6rem);
    font-weight: 300;
    line-height: 1.02;
    letter-spacing: $tracking-tight;
    color: $color-text;
    text-wrap: balance;
  }

  &__copy {
    font-size: clamp($text-base, 1.1vw, $text-lg);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    max-width: 42ch;
  }

  &__cta {
    align-self: flex-start;
    margin-top: $space-6;
  }

  &__index {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    margin-top: clamp(32px, 5vh, 48px);
    padding-top: $space-5;
    border-top: 1px solid $color-border;
  }

  &__index-label {
    font-size: 0.62rem;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
    text-transform: uppercase;
    margin-bottom: $space-2;
  }

  &__chapter {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    padding: 8px 0;
    border: 0;
    background: none;
    text-align: left;
    cursor: pointer;
    color: inherit;
    transition: opacity 0.25s ease;

    &:hover {
      .services-intro__chapter-title {
        color: $color-text;
      }
    }

    &--active {
      .services-intro__chapter-number {
        color: $color-gold;
      }

      .services-intro__chapter-title {
        color: $color-text;
      }
    }
  }

  &__mobile-now {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    padding: 12px 14px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background: rgba($color-bg-alt, 0.45);
  }

  &__mobile-now-meta {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: baseline;
    gap: $space-3;

    .services-intro__chapter-number {
      color: $color-gold;
    }

    .services-intro__chapter-title {
      color: $color-text;
    }
  }

  &__mobile-counter {
    font-size: 0.62rem;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
  }

  &__chapter-row {
    display: flex;
    align-items: baseline;
    gap: $space-3;
  }

  &__chapter-number {
    font-size: 0.68rem;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
    min-width: 1.6rem;
    transition: color 0.25s ease;
  }

  &__chapter-title {
    font-size: $text-sm;
    color: $color-text-muted;
    letter-spacing: $tracking-wide;
    transition: color 0.25s ease;
  }

  &__chapter-bar {
    display: block;
    height: 2px;
    border-radius: 2px;
    background: rgba($color-gold, 0.15);
    overflow: hidden;
  }

  &__chapter-fill {
    display: block;
    width: 100%;
    height: 100%;
    background: $color-gold;
    transform-origin: left center;
    transform: scaleX(0);
    will-change: transform;
  }

  &__stage {
    position: relative;
    min-height: clamp(420px, 58vh, 600px);
  }

  &__preview {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: inherit;
    border-radius: $radius-lg;
    overflow: hidden;
    border: 1px solid rgba($color-gold, 0.2);
    background:
      linear-gradient(160deg, rgba($color-bg-alt, 0.96), rgba($color-bg, 0.9)),
      radial-gradient(circle at 50% 0%, rgba($color-gold, 0.08), transparent 58%);
    box-shadow:
      0 28px 80px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);

    &--mobile {
      min-height: clamp(260px, 52vw, 340px);
      margin-bottom: $space-4;
    }
  }

  &__preview-frame {
    position: absolute;
    inset: 14px;
    border: 1px solid rgba($color-gold, 0.12);
    border-radius: calc($radius-lg - 6px);
    pointer-events: none;
    z-index: 4;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border-color: rgba(56, 150, 90, 0.55);
      border-style: solid;
    }

    &::before {
      top: -1px;
      left: -1px;
      border-width: 1px 0 0 1px;
    }

    &::after {
      right: -1px;
      bottom: -1px;
      border-width: 0 1px 1px 0;
    }
  }

  &__preview-index {
    position: absolute;
    top: clamp(28px, 3.5vw, 40px);
    right: clamp(28px, 3.5vw, 40px);
    z-index: 3;
    font-size: clamp(3.5rem, 7vw, 5.5rem);
    line-height: 0.85;
    color: $color-gold;
    opacity: 0.08;
    pointer-events: none;
    user-select: none;
  }

  &__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    will-change: transform, opacity;
    backface-visibility: hidden;

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
      width: min(88%, 360px);
      max-width: 100%;
      margin: 0;
    }
  }

  &__slide-caption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    padding: clamp(20px, 2.5vw, 28px);
    background: linear-gradient(to top, rgba($color-bg, 0.94), rgba($color-bg, 0.35), transparent);
    pointer-events: none;
  }

  &__slide-title {
    margin-top: $space-2;
    font-size: clamp(1.5rem, 2.2vw, 2.25rem);
    font-weight: 300;
    line-height: 1.05;
    letter-spacing: $tracking-tight;
    color: $color-text;
  }

  &__mobile {
    position: relative;
    z-index: 1;
    padding-block: clamp(56px, 10vh, 88px);
  }

  &__mobile-header {
    margin-bottom: clamp(24px, 5vh, 36px);
  }

  &__mobile-stage {
    margin-bottom: clamp(28px, 5vh, 40px);
  }

  &__mobile-cta {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .services-intro__slide {
    will-change: auto;
    transform: none !important;
    opacity: 1 !important;
    transition: none;
  }

  .services-intro__chapter-fill {
    will-change: auto;
  }
}
</style>
