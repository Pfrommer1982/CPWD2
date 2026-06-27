<script setup lang="ts">
import { projects } from '~/data/projects'

definePageMeta({ layout: 'default' })

const work = useSectionTranslations('work')
const localePath = useLocalePath()
const imageKit = useImageKit()

useHead({ title: 'Work, CPWD' })

const sortedProjects = computed(() =>
  [...projects].sort((a, b) => a.order - b.order),
)

function getCardSize(index: number): 'large' | 'small' {
  const pattern = [0, 3, 4, 7, 8]
  return pattern.includes(index % 8) ? 'large' : 'small'
}

const cards = ref<HTMLElement[]>([])

onMounted(async () => {
  if (!import.meta.client) return

  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  cards.value?.forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 50,
      duration: 0.9,
      ease: 'power3.out',
      delay: (i % 2) * 0.12,
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    })
  })

  onUnmounted(() => ScrollTrigger.getAll().forEach(st => st.kill()))
})
</script>

<template>
  <div class="work-page">
    <section class="work-header section">
      <div class="container">
        <span class="section-label">{{ work.t('label') }}</span>
        <h1 class="work-header__title">
          {{ work.t('heading') }}
        </h1>
      </div>
    </section>

    <section class="work-grid">
      <div class="work-grid__inner">
        <article
          v-for="(project, index) in sortedProjects"
          :key="project.slug"
          ref="cards"
          class="work-card"
          :class="`work-card--${getCardSize(index)}`"
        >
          <NuxtLink
            :to="localePath(`/work/${project.slug}`)"
            class="work-card__link"
            data-cursor="view"
          >
            <div class="work-card__media">
              <img
                :src="imageKit.thumbnail(project.thumbnail, 1200, 800)"
                :srcset="imageKit.srcset(project.thumbnail)"
                :alt="project.title"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                class="work-card__img"
              >
            </div>

            <div class="work-card__overlay">
              <div class="work-card__overlay-content">
                <span class="label">{{ project.category }}</span>
                <span class="label work-card__year">{{ project.year }}</span>
              </div>
              <div class="work-card__cta">
                <span>{{ work.t('viewProject') }}</span>
                <span>→</span>
              </div>
            </div>

            <div class="work-card__info">
              <h2 class="work-card__title">
                {{ project.title }}
              </h2>
            </div>
          </NuxtLink>
        </article>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.work-page {
  padding-top: 100px;
}

.work-header {
  padding-bottom: $space-10;

  &__title {
    font-family: $font-display;
    font-size: $text-4xl;
    font-weight: 300;
    letter-spacing: $tracking-tight;
    margin-top: $space-5;
    max-width: 700px;
  }
}

.work-grid {
  &__inner {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
}

.work-card {
  position: relative;
  overflow: hidden;
  background: $color-surface;

  &--large {
    grid-column: span 2;
    aspect-ratio: 16 / 7;

    @media (max-width: 640px) {
      grid-column: span 1;
      aspect-ratio: 4 / 3;
    }
  }

  &--small {
    aspect-ratio: 4 / 3;
  }

  &__link {
    display: block;
    height: 100%;
  }

  &__media {
    height: 100%;
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $dur-xslow $ease-gold;
    filter: brightness(0.9);
  }

  &:hover &__img {
    transform: scale(1.04);
    filter: brightness(1);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(8, 8, 8, 0.92) 0%,
      rgba(8, 8, 8, 0.3) 50%,
      transparent 100%
    );
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: $space-5;
    opacity: 0;
    transition: opacity $dur-med $ease-gold;
    pointer-events: none;
  }

  &:hover &__overlay {
    opacity: 1;
  }

  &__overlay-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    color: $color-gold;
  }

  &__year {
    color: $color-text-muted;
  }

  &__cta {
    display: flex;
    align-items: center;
    gap: $space-3;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-widest;
    text-transform: uppercase;
    color: $color-text;
    transform: translateY(8px);
    transition: transform $dur-med $ease-out-expo;
  }

  &:hover &__cta {
    transform: translateY(0);
  }

  &__info {
    padding: $space-4 $space-5 $space-5;
    background: $color-bg;
    border-top: 1px solid $color-border;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-lg;
    font-weight: 300;
    color: $color-text;
  }
}
</style>
