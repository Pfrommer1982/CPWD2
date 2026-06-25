<script setup lang="ts">
import { localeList, localeTags, type ServiceLocaleItem } from '~/utils/i18n'

const { t, tm } = useI18n()
const sectionRef = ref<HTMLElement | null>(null)
const activeIndex = ref<number | null>(null)

const items = computed(() => {
  const raw = tm('services.items')
  return localeList<ServiceLocaleItem>(raw).map(item => ({
    ...item,
    tags: localeTags(item.tags),
  }))
})

onMounted(async () => {
  if (!sectionRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  gsap.utils.toArray<HTMLElement>('.service-card').forEach((card, i) => {
    gsap.fromTo(
      card,
      { y: 48, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        delay: i * 0.07,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      },
    )
  })
})
</script>

<template>
  <section ref="sectionRef" class="services-section section">
    <div class="container">
      <div class="services-section__header">
        <span class="section-label">{{ t('services.label') }}</span>
        <ProjectOutlineText
          :text="t('services.heading')"
          tag="h2"
          size="display"
          class="services-section__heading"
        />
        <ProjectOutlineText
          :text="t('services.intro')"
          tag="p"
          size="body"
          scroll-start="top 88%"
          scroll-end="top 45%"
          class="services-section__intro"
        />
      </div>

      <div class="services-section__grid">
        <article
          v-for="(item, index) in items"
          :key="item.number"
          class="service-card"
          :class="{ 'service-card--active': activeIndex === index }"
          @mouseenter="activeIndex = index"
          @mouseleave="activeIndex = null"
        >
          <div class="service-card__top">
            <span class="service-card__number label">{{ item.number }}</span>
            <span class="service-card__line" aria-hidden="true" />
          </div>

          <h3 class="service-card__title">
            {{ item.title }}
          </h3>

          <p class="service-card__desc">
            {{ item.desc }}
          </p>

          <ul v-if="item.tags.length" class="service-card__tags">
            <li
              v-for="tag in item.tags"
              :key="tag"
              class="service-card__tag"
            >
              {{ tag }}
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.services-section {
  border-block: 1px solid $color-border;
  background: linear-gradient(180deg, $color-bg 0%, $color-bg-alt 50%, $color-bg 100%);

  &__header {
    max-width: 900px;
    margin-bottom: clamp(48px, 8vh, 80px);

    .section-label {
      display: block;
      margin-bottom: $space-6;
    }
  }

  &__heading {
    margin-bottom: $space-6;
  }

  &__intro {
    max-width: 52ch;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(12px, 1.5vw, 16px);

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 1100px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}

.service-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: clamp(24px, 3vw, 32px);
  min-height: 260px;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: rgba(15, 15, 15, 0.6);
  transition:
    border-color $dur-med $ease-gold,
    background $dur-med $ease-gold,
    transform $dur-med $ease-gold,
    box-shadow $dur-med $ease-gold;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, $color-gold-glow, transparent 70%);
    opacity: 0;
    transition: opacity $dur-med $ease-gold;
    pointer-events: none;
  }

  &:hover,
  &--active {
    border-color: $color-border-hover;
    background: rgba(22, 22, 22, 0.85);
    transform: translateY(-3px);
    box-shadow: $shadow-gold-sm;

    &::before {
      opacity: 1;
    }

    .service-card__title {
      color: $color-gold-light;
    }

    .service-card__line {
      width: 100%;
    }
  }

  &__top {
    display: flex;
    align-items: center;
    gap: $space-4;
  }

  &__number {
    color: $color-gold;
    flex-shrink: 0;
  }

  &__line {
    display: block;
    height: 1px;
    flex: 1;
    width: 32px;
    background: linear-gradient(to right, $color-gold, transparent);
    transition: width $dur-slow $ease-out-expo;
  }

  &__title {
    position: relative;
    z-index: 1;
    font-family: $font-display;
    font-size: $text-2xl;
    font-weight: 300;
    line-height: $leading-tight;
    letter-spacing: $tracking-tight;
    color: $color-text;
    transition: color $dur-fast $ease-gold;
  }

  &__desc {
    position: relative;
    z-index: 1;
    flex: 1;
    font-size: $text-sm;
    line-height: $leading-relaxed;
    color: $color-text-muted;
  }

  &__tags {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    list-style: none;
    margin-top: auto;
    padding-top: $space-2;
  }

  &__tag {
    padding: 4px 10px;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
    transition: border-color $dur-fast $ease-gold, color $dur-fast $ease-gold;
  }

  &:hover &__tag,
  &--active &__tag {
    border-color: rgba(212, 175, 83, 0.28);
    color: $color-text-muted;
  }
}
</style>
