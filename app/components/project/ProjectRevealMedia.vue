<script setup lang="ts">
withDefaults(defineProps<{
  src?: string
  srcset?: string
  sizes?: string
  alt: string
  fit?: 'cover' | 'contain'
  layout?: 'full' | 'half-left' | 'half-right'
  loading?: 'lazy' | 'eager'
  fetchpriority?: 'high' | 'low' | 'auto'
}>(), {
  fit: 'cover',
  layout: 'full',
  loading: 'lazy',
})
</script>

<template>
  <figure
    class="reveal-media"
    :class="[
      `reveal-media--${layout}`,
      fit === 'contain' ? 'reveal-media--contain' : '',
    ]"
  >
    <div class="reveal-media__clip">
      <div class="reveal-media__inner">
        <slot>
          <img
            v-if="src"
            :src="src"
            :srcset="srcset"
            :sizes="sizes"
            :alt="alt"
            :loading="loading"
            :fetchpriority="fetchpriority"
            class="reveal-media__img"
            :class="`reveal-media__img--${fit}`"
          >
        </slot>
      </div>
    </div>
    <figcaption v-if="$slots.caption" class="reveal-media__caption">
      <slot name="caption" />
    </figcaption>
  </figure>
</template>

<style lang="scss" scoped>
.reveal-media {
  margin: 0;

  &--full {
    width: 100%;
  }

  &--half-left,
  &--half-right {
    width: min(72vw, 920px);

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  &--half-left {
    margin-right: auto;
    padding-left: clamp(20px, 4vw, 60px);
  }

  &--half-right {
    margin-left: auto;
    padding-right: clamp(20px, 4vw, 60px);
  }

  &__clip {
    overflow: hidden;
    will-change: clip-path;
    background: $color-bg-alt;
  }

  &--full:not(.reveal-media--contain) &__clip {
    aspect-ratio: 16 / 9;

    @media (max-width: 768px) {
      aspect-ratio: 4 / 3;
    }
  }

  &--half-left:not(.reveal-media--contain) &__clip,
  &--half-right:not(.reveal-media--contain) &__clip {
    aspect-ratio: 4 / 3;
  }

  &--contain &__clip {
    aspect-ratio: auto;
  }

  &__inner {
    width: 100%;
    will-change: transform;
  }

  &:not(.reveal-media--contain) &__inner {
    height: 115%;
  }

  &--contain &__inner {
    height: auto;
  }

  &__img {
    display: block;
    width: 100%;
    height: 100%;

    &--cover {
      object-fit: cover;
      object-position: center top;
    }

    &--contain {
      object-fit: contain;
      object-position: center center;
      background: $color-bg-alt;
      height: auto;
      min-height: min(50vh, 480px);
    }
  }

  &__caption {
    padding: $space-4 clamp(20px, 4vw, 60px) 0;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
    text-align: center;
  }
}
</style>
