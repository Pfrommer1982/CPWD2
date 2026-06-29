<script setup lang="ts">
import type { Project } from '~/types'

defineProps<{ project: Project }>()
const project = useSectionTranslations('project')
const localePath = useLocalePath()
const { setCursorState } = useCursor()
</script>

<template>
  <NuxtLink
    v-if="project"
    :to="localePath(`/work/${project.slug}`)"
    class="project-next"
    @mouseenter="setCursorState('view')"
    @mouseleave="setCursorState('default')"
  >
    <span class="section-label project-next__label">{{ project.t('next') }}</span>
    <h3 class="project-next__title font-display">
      {{ project.title }}
    </h3>
    <div class="project-next__image-wrap">
      <img :src="project.thumbnail" :alt="project.title" loading="lazy" class="project-next__image">
    </div>
    <span class="project-next__arrow">→</span>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.project-next {
  @include container;
  display: block;
  position: relative;
  padding-block: $space-3xl;
  border-top: 1px solid $color-border;
  overflow: hidden;

  &__label {
    margin-bottom: $space-md;
  }

  &__title {
    font-size: $text-3xl;
    margin-bottom: $space-xl;
    transition: color $duration-fast $ease-out-expo;
  }

  &:hover &__title {
    color: $color-accent;
  }

  &__image-wrap {
    height: 40vh;
    overflow: hidden;
    border-radius: $border-radius-md;
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

  &__arrow {
    position: absolute;
    top: $space-3xl;
    right: $grid-gutter;
    font-size: $text-3xl;
    transition: transform $duration-med $ease-out-expo;
  }

  &:hover &__arrow {
    transform: translateX(10px);
  }
}
</style>
