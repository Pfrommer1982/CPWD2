<script setup lang="ts">
import { getFeaturedProjects } from '~/data/projects'

const { t } = useI18n()
const localePath = useLocalePath()
const { setCursorState } = useCursor()
const projects = getFeaturedProjects()
const gridRef = ref<HTMLElement | null>(null)

function onCardEnter() {
  setCursorState('view')
}

function onCardLeave() {
  setCursorState('default')
}

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
  <section class="work-section">
    <div class="work-section__header">
      <span class="work-section__label font-mono">{{ t('work.label') }}</span>
      <GsapSplitText tag="h2" class="work-section__heading font-display">
        {{ t('work.heading') }}
      </GsapSplitText>
    </div>

    <div ref="gridRef" class="work-section__grid">
      <NuxtLink
        v-for="(project, index) in projects"
        :key="project.id"
        :to="localePath(`/work/${project.slug}`)"
        class="work-card"
        :class="{ 'work-card--large': index === 0 }"
        data-cursor="view"
        @mouseenter="onCardEnter"
        @mouseleave="onCardLeave"
      >
        <div class="work-card__image-wrap">
          <img
            :src="project.thumbnail"
            :alt="project.title"
            loading="lazy"
            class="work-card__image"
          >
        </div>
        <div class="work-card__overlay">
          <h3 class="work-card__title font-display">
            {{ project.title }}
          </h3>
          <div class="work-card__meta font-mono">
            <span>{{ project.category }}</span>
            <span>{{ project.year }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="work-section__footer">
      <GsapMagneticButton :to="localePath('/work')" variant="ghost">
        {{ t('work.viewAll') }}
      </GsapMagneticButton>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.work-section {
  @include container;
  padding-block: $space-4xl;

  &__header {
    margin-bottom: $space-3xl;
  }

  &__label {
    display: block;
    color: $color-accent;
    margin-bottom: $space-md;
  }

  &__heading {
    font-size: $text-3xl;
    max-width: 12ch;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $grid-gutter;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__footer {
    margin-top: $space-2xl;
    text-align: center;
  }
}

.work-card {
  position: relative;
  overflow: hidden;
  border-radius: $border-radius-md;
  height: 45vh;
  min-height: 280px;

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
    transition: transform $duration-xslow $ease-out-expo;
  }

  &:hover &__image {
    transform: scale(1.05);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: $space-xl;
    background: linear-gradient(to top, rgba($color-bg, 0.85) 0%, transparent 60%);
    transform: translateY(30%);
    transition: transform $duration-med $ease-out-expo;
  }

  &:hover &__overlay {
    transform: translateY(0);
  }

  &__title {
    font-size: $text-2xl;
    margin-bottom: $space-sm;
  }

  &__meta {
    display: flex;
    gap: $space-md;
    color: $color-text-muted;
    font-size: $text-xs;
  }
}
</style>
