<script setup lang="ts">
const props = defineProps<{
  images: { src: string; alt: string }[]
  groupId: string
}>()

const imageKit = useImageKit()
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const resolvedImages = computed(() =>
  props.images.map(img => ({
    ...img,
    url: imageKit.screenshot(img.src, 1600),
  })),
)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>

<template>
  <div class="image-grid" :data-group="groupId">
    <button
      v-for="(image, index) in resolvedImages"
      :key="image.src"
      type="button"
      class="image-grid__item reveal-item"
      :style="{ '--i': index }"
      @click="openLightbox(index)"
    >
      <ProjectScreenshot
        :src="imageKit.screenshot(image.src, 800)"
        :srcset="imageKit.srcsetScreenshot(image.src, [400, 800, 1200])"
        :alt="image.alt"
        sizes="(max-width: 640px) 100vw, 50vw"
        fit="cover"
      />
      <span class="image-grid__overlay">
        <span class="image-grid__zoom">+</span>
      </span>
    </button>
  </div>

  <ProjectLightbox
    v-if="lightboxOpen"
    :images="resolvedImages"
    :initial-index="lightboxIndex"
    @close="lightboxOpen = false"
  />
</template>

<style lang="scss" scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(8px, 1.5vw, 16px);

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }

  &__item {
    position: relative;
    padding: 0;
    background: transparent;
    border: none;
    overflow: visible;
    cursor: pointer;
    aspect-ratio: 16 / 10;

    :deep(.project-shot) {
      width: 100%;
      height: 100%;
      transition: border-color $dur-fast $ease-gold;

      .project-shot__img {
        transition: transform $dur-slow $ease-gold;
      }
    }

    &:hover {
      :deep(.project-shot) {
        border-color: $color-border-hover;
      }

      :deep(.project-shot__img) {
        transform: scale(1.04);
      }

      .image-grid__overlay {
        opacity: 1;
      }
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(8, 8, 8, 0.45);
    opacity: 0;
    transition: opacity $dur-fast $ease-gold;
    border-radius: $radius-md;
    pointer-events: none;
  }

  &__zoom {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $color-gold;
    border-radius: $radius-full;
    font-family: $font-mono;
    font-size: $text-xl;
    color: $color-gold;
  }
}
</style>
