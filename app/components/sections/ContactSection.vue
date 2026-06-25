<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const sectionRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!sectionRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  gsap.from(sectionRef.value.querySelector('.contact-section__email'), {
    y: 24,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  })
})
</script>

<template>
  <section ref="sectionRef" class="contact-section">
    <ThreeNoiseBackground />
    <div class="contact-section__inner">
      <p class="section-label contact-section__label">{{ t('contact.label') }}</p>
      <ProjectOutlineText
        :text="t('contact.heading')"
        tag="h2"
        size="display"
        class="contact-section__heading"
      />
      <ProjectOutlineText
        :text="t('contact.subtext')"
        tag="p"
        size="body"
        scroll-start="top 85%"
        scroll-end="top 45%"
        class="contact-section__subtext"
      />
      <a :href="`mailto:${t('contact.email')}`" class="contact-section__email link-slide">
        {{ t('contact.email') }}
      </a>
      <GsapMagneticButton :to="localePath('/contact')" class="contact-section__cta">
        {{ t('contact.cta') }}
      </GsapMagneticButton>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.contact-section {
  position: relative;
  padding-block: $space-4xl;
  overflow: hidden;
  background: linear-gradient(180deg, $color-bg 0%, $color-bg-alt 100%);

  &__inner {
    @include container;
    position: relative;
    z-index: $z-content;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__label {
    justify-content: center;
    margin-bottom: $space-6;
  }

  &__heading {
    margin-bottom: $space-6;
    max-width: 16ch;
  }

  &__subtext {
    margin-bottom: $space-xl;
    max-width: 42ch;
  }

  &__email {
    display: inline-block;
    font-family: $font-display;
    font-size: $text-2xl;
    margin-bottom: $space-2xl;
    transition: color $duration-fast $ease-out-expo;

    &:hover {
      color: $color-gold-light;
    }
  }

  &__cta {
    display: inline-flex;
  }
}
</style>
