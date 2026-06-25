<script setup lang="ts">
import { getFeaturedProjects } from '~/data/projects'

const { t } = useI18n()
const localePath = useLocalePath()
const imageKit = useImageKit()
const projects = getFeaturedProjects()
const gridRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!gridRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  const cards = gridRef.value.querySelectorAll('.work-card')
  gsap.from(cards, {
    y: 80,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: gridRef.value,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  })
})
</script>

<template>
  <section class="work-section section">
    <div class="work-section__header container">
      <p class="section-label">
        {{ t('work.label') }}
      </p>
      <ProjectOutlineText
        :text="t('work.heading')"
        tag="h2"
        size="display"
        class="work-section__heading"
      />
    </div>

    <div ref="gridRef" class="work-section__grid container container--wide">
      <NuxtLink
        v-for="(project, index) in projects"
        :key="project.slug"
        :to="localePath(`/work/${project.slug}`)"
        class="work-card project-link card"
        :class="{ 'work-card--large': index === 0 }"
        data-cursor="view"
      >
        <div class="work-card__image-wrap">
          <img
            :src="imageKit.thumbnail(project.thumbnail, 1200, 800)"
            :srcset="imageKit.srcset(project.thumbnail)"
            :alt="project.title"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
            class="work-card__image"
          >
        </div>
        <div class="project-overlay">
          <div>
            <h3 class="work-card__title">
              {{ project.title }}
            </h3>
            <div class="work-card__meta label">
              <span>{{ project.category }}</span>
              <span>{{ project.year }}</span>
            </div>
            <span class="project-cta">{{ t('work.viewProject') }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="work-section__footer container">
      <NuxtLink :to="localePath('/work')" class="link-arrow" data-cursor="view">
        {{ t('work.viewAll') }}
        <span class="arrow-icon">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.work-section {
  &__header {
    margin-bottom: $space-10;
  }

  &__heading {
    max-width: 14ch;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $grid-gap;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__footer {
    margin-top: $space-10;
    text-align: center;
  }
}

.work-card {
  position: relative;
  height: 45vh;
  min-height: 280px;
  border-radius: $radius-lg;

  &--large {
    @media (min-width: 768px) {
      grid-column: 1 / -1;
      height: 60vh;
    }
  }

  &__image-wrap {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $dur-xslow $ease-out-expo;
    filter: brightness(0.85);
  }

  &:hover &__image {
    transform: scale(1.05);
    filter: brightness(1);
  }

  &__title {
    font-family: $font-display;
    font-size: $text-2xl;
    font-weight: 300;
    margin-bottom: $space-2;
    color: $color-text;
  }

  &__meta {
    display: flex;
    gap: $space-4;
    color: $color-text-muted;
    margin-bottom: $space-4;
  }
}
</style>
