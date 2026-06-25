<script setup lang="ts">
import type { Project } from '~/types'

defineProps<{ project: Project }>()
const projectI18n = useSectionTranslations('project')
</script>

<template>
  <div class="project-info">
    <div class="project-info__item">
      <span class="project-info__label font-mono">Category</span>
      <span>{{ project.category }}</span>
    </div>
    <div class="project-info__divider" />
    <div class="project-info__item">
      <span class="project-info__label font-mono">Year</span>
      <span>{{ project.year }}</span>
    </div>
    <div class="project-info__divider" />
    <div class="project-info__item">
      <span class="project-info__label font-mono">{{ projectI18n.t('role') }}</span>
      <span>{{ project.role.join(', ') }}</span>
    </div>
    <div class="project-info__divider" />
    <div class="project-info__item project-info__item--tags">
      <span class="project-info__label font-mono">{{ projectI18n.t('technologies') }}</span>
      <div class="project-info__tags">
        <span v-for="tech in project.technologies" :key="tech" class="project-info__tag font-mono">
          {{ tech }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-info {
  @include container;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-lg;
  padding-block: $space-xl;
  border-bottom: 1px solid $color-border;

  &__item {
    display: flex;
    flex-direction: column;
    gap: $space-xs;

    &--tags {
      flex: 1;
      min-width: 200px;
    }
  }

  &__label {
    color: $color-text-muted;
    font-size: $text-xs;
  }

  &__divider {
    width: 1px;
    height: 32px;
    background: $color-border;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-sm;
  }

  &__tag {
    padding: $space-xs $space-md;
    border: 1px solid $color-border;
    border-radius: $border-radius-full;
    font-size: $text-xs;
    color: $color-text-muted;
  }
}
</style>
