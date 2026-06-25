<script setup lang="ts">
withDefaults(defineProps<{
  src: string
  alt: string
  srcset?: string
  sizes?: string
  fit?: 'cover' | 'contain'
  loading?: 'lazy' | 'eager'
  fetchpriority?: 'high' | 'low' | 'auto'
}>(), {
  fit: 'cover',
  loading: 'lazy',
})
</script>

<template>
  <div class="project-shot" :class="`project-shot--${fit}`">
    <img
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      :loading="loading"
      :fetchpriority="fetchpriority"
      class="project-shot__img"
    >
  </div>
</template>

<style lang="scss" scoped>
.project-shot {
  overflow: hidden;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  background: $color-bg-alt;
  box-shadow: inset 0 0 0 1px rgba(8, 8, 8, 0.6);

  &--cover {
    width: 100%;
    height: 100%;
  }

  &--contain {
    width: 100%;
  }

  &__img {
    display: block;
    transform: scale(1.012);
    transform-origin: center center;
  }

  &--cover &__img {
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    max-width: none;
    margin: -2px;
    object-fit: cover;
    object-position: top center;
  }

  &--contain &__img {
    width: calc(100% + 4px);
    max-width: none;
    height: auto;
    margin: -2px;
    object-fit: contain;
  }
}
</style>
