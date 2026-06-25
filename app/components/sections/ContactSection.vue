<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const sectionRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!sectionRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  gsap.from(sectionRef.value.querySelector('.contact-section__heading'), {
    y: 80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  })
})
</script>

<template>
  <section ref="sectionRef" class="contact-section">
    <ThreeNoiseBackground />
    <div class="contact-section__inner">
      <span class="contact-section__label font-mono">{{ t('contact.label') }}</span>
      <h2 class="contact-section__heading font-display">
        {{ t('contact.heading') }}
      </h2>
      <p class="contact-section__subtext">
        {{ t('contact.subtext') }}
      </p>
      <a :href="`mailto:${t('contact.email')}`" class="contact-section__email link-underline">
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
  }

  &__label {
    display: block;
    color: $color-accent;
    margin-bottom: $space-md;
  }

  &__heading {
    font-size: $text-4xl;
    margin-bottom: $space-lg;
    line-height: 1;
  }

  &__subtext {
    color: $color-text-muted;
    margin-bottom: $space-xl;
    max-width: 40ch;
    margin-inline: auto;
  }

  &__email {
    display: inline-block;
    font-family: $font-display;
    font-size: $text-2xl;
    margin-bottom: $space-2xl;
    transition: color $duration-fast $ease-out-expo;

    &:hover {
      color: $color-accent;
    }
  }

  &__cta {
    display: inline-flex;
  }
}
</style>
