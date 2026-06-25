<script setup lang="ts">
import { projects } from '~/data/projects'

const { t } = useI18n()
const localePath = useLocalePath()
const { setCursorState } = useCursor()

definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="page-work">
    <section class="page-work__hero">
      <span class="font-mono page-work__label">{{ t('work.label') }}</span>
      <h1 class="page-work__heading font-display">
        {{ t('work.heading') }}
      </h1>
    </section>

    <div class="page-work__grid">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="localePath(`/work/${project.slug}`)"
        class="page-work__card"
        @mouseenter="setCursorState('view')"
        @mouseleave="setCursorState('default')"
      >
        <img :src="project.thumbnail" :alt="project.title" loading="lazy">
        <div class="page-work__overlay">
          <h2 class="font-display">{{ project.title }}</h2>
          <span class="font-mono">{{ project.category }} — {{ project.year }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-work {
  padding-top: 120px;

  &__hero {
    @include container;
    padding-block: $space-3xl;
  }

  &__label {
    color: $color-accent;
    display: block;
    margin-bottom: $space-md;
  }

  &__heading {
    font-size: $text-4xl;
  }

  &__grid {
    @include container;
    display: grid;
    grid-template-columns: 1fr;
    gap: $grid-gutter;
    padding-bottom: $space-4xl;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__card {
    position: relative;
    height: 50vh;
    min-height: 300px;
    overflow: hidden;
    border-radius: $border-radius-md;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $duration-xslow $ease-out-expo;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: $space-xl;
    background: linear-gradient(to top, rgba($color-bg, 0.85), transparent);

    h2 {
      font-size: $text-2xl;
      margin-bottom: $space-sm;
    }

    span {
      color: $color-text-muted;
      font-size: $text-xs;
    }
  }
}
</style>
