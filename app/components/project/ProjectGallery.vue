<script setup lang="ts">
import type { ProjectGalleryItem } from '~/data/projects'

defineProps<{ items: ProjectGalleryItem[] }>()

const galleryRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!galleryRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  const items = galleryRef.value.querySelectorAll('.gallery-item')
  items.forEach((item, i) => {
    const direction = i % 2 === 0 ? 60 : -60
    gsap.from(item, {
      x: direction,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })
  })
})
</script>

<template>
  <div ref="galleryRef" class="project-gallery">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="gallery-item"
      :class="`gallery-item--${item.layout}`"
    >
      <template v-if="item.type === 'image' || !item.type">
        <img :src="item.src" :alt="item.alt || item.caption || ''" loading="lazy" class="gallery-item__media">
      </template>
      <template v-else-if="item.type === 'video'">
        <video :src="item.src" controls class="gallery-item__media" />
      </template>
      <p v-if="item.caption" class="gallery-item__caption">
        {{ item.caption }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-gallery {
  @include container;
  display: flex;
  flex-direction: column;
  gap: $space-2xl;
  padding-block: $space-3xl;
}

.gallery-item {
  &--full &__media {
    width: 100%;
    border-radius: $border-radius-md;
  }

  &--half {
    display: grid;
    grid-template-columns: 1fr;
    gap: $grid-gutter;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &--left-text,
  &--right-text {
    display: grid;
    grid-template-columns: 1fr;
    gap: $space-xl;
    align-items: center;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &--right-text {
    @media (min-width: 768px) {
      .gallery-item__media { order: 2; }
      .gallery-item__caption { order: 1; }
    }
  }

  &__media {
    width: 100%;
    object-fit: cover;
    border-radius: $border-radius-md;
  }

  &__caption {
    font-size: $text-lg;
    color: $color-text-muted;
    line-height: 1.6;
  }
}
</style>
