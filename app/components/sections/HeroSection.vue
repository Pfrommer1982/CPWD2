<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const sectionRef = ref<HTMLElement | null>(null)
const line1Ref = ref<HTMLElement | null>(null)
const line2Ref = ref<HTMLElement | null>(null)
const line3Ref = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!import.meta.client) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  const lines = [line1Ref.value, line2Ref.value, line3Ref.value].filter(Boolean)

  gsap.from(lines, {
    y: 120,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.3,
  })
})
</script>

<template>
  <section ref="sectionRef" class="hero">
    <ThreeParticleField />

    <div class="hero__content">
      <h1 class="hero__title">
        <span ref="line1Ref" class="hero__line">{{ t('hero.line1') }}</span>
        <span ref="line2Ref" class="hero__line hero__line--italic italic-serif">{{ t('hero.line2') }}</span>
        <span ref="line3Ref" class="hero__line">{{ t('hero.line3') }}</span>
      </h1>

      <p class="hero__descriptor font-mono">
        {{ t('hero.descriptor') }}
      </p>

      <div class="hero__cta">
        <GsapMagneticButton :to="localePath('/work')">
          {{ t('hero.cta') }}
        </GsapMagneticButton>
      </div>

      <div class="hero__scroll animate-pulse-arrow">
        <span>↓</span>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: $color-bg;

  &__content {
    @include container;
    position: relative;
    z-index: $z-content;
    width: 100%;
    padding-block: $space-4xl $space-3xl;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-hero;
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin-bottom: $space-2xl;
  }

  &__line {
    display: block;

    &--italic {
      color: $color-text;
    }
  }

  &__descriptor {
    position: absolute;
    bottom: $space-3xl;
    right: $grid-gutter;
    color: $color-text-muted;
    max-width: 200px;
    text-align: right;
  }

  &__cta {
    margin-top: $space-xl;
  }

  &__scroll {
    position: absolute;
    bottom: $space-xl;
    left: 50%;
    transform: translateX(-50%);
    font-size: $text-xl;
    color: $color-text-muted;
  }
}
</style>
