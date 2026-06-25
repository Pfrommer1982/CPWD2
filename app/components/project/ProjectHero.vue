<script setup lang="ts">
import type { Project } from '~/types'

const props = defineProps<{ project: Project }>()

const heroRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!import.meta.client) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  if (imageRef.value) {
    gsap.fromTo(
      imageRef.value,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.4,
        ease: 'power4.inOut',
      },
    )
  }

  if (titleRef.value) {
    gsap.from(titleRef.value, {
      y: 100,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      ease: 'power3.out',
    })
  }

  if (imageRef.value && heroRef.value) {
    gsap.to(imageRef.value, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }
})
</script>

<template>
  <section ref="heroRef" class="project-hero">
    <div ref="imageRef" class="project-hero__image-wrap">
      <img :src="project.heroImage" :alt="project.title" class="project-hero__image">
    </div>
    <div class="project-hero__content">
      <h1 ref="titleRef" class="project-hero__title font-display">
        {{ project.title }}
      </h1>
      <p class="project-hero__subtitle">
        {{ project.subtitle }}
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.project-hero {
  position: relative;
  height: 100svh;
  overflow: hidden;

  &__image-wrap {
    position: absolute;
    inset: 0;
    will-change: transform;
  }

  &__image {
    width: 100%;
    height: 120%;
    object-fit: cover;
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $space-3xl $grid-gutter;
    background: linear-gradient(to top, rgba($color-bg, 0.9), transparent);
    z-index: 2;
  }

  &__title {
    font-size: $text-4xl;
    line-height: 0.95;
    margin-bottom: $space-md;
  }

  &__subtitle {
    font-size: $text-lg;
    color: $color-text-muted;
  }
}
</style>
