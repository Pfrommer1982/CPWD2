<script setup lang="ts">
const about = useSectionTranslations('about')
const localePath = useLocalePath()
const sectionRef = ref<HTMLElement | null>(null)

const outlineBody = computed(() => about.t('hook.body').replace(/\*/g, ''))
</script>

<template>
  <section ref="sectionRef" class="about-section">
    <div class="about-section__backdrop" aria-hidden="true">
      <EffectsTacticalRadarHud />
      <EffectsTacticalDataField />
    </div>

    <div class="about-section__grid">
      <div class="about-section__text">
        <span class="section-label">{{ about.t('hook.label') }}</span>
        <ProjectOutlineText
          :text="about.t('hook.heading')"
          tag="h2"
          size="display"
          class="about-section__heading"
          :trigger="sectionRef"
          scroll-start="top 92%"
          scroll-end="top 48%"
        />
        <ProjectOutlineText
          :text="outlineBody"
          tag="p"
          size="body"
          class="about-section__body"
          :trigger="sectionRef"
          scroll-start="top 88%"
          scroll-end="top 42%"
        />
        <GsapMagneticButton :to="localePath('/about')" variant="ghost" class="about-section__cta">
          {{ about.t('hook.cta') }}
        </GsapMagneticButton>
      </div>

      <div class="about-section__visual">
        <ClientOnly>
          <AboutHookTerminal :root="sectionRef" />
          <template #fallback>
            <div class="about-section__visual-fallback" aria-hidden="true" />
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.about-section {
  position: relative;
  padding-block: clamp(72px, 12vh, 120px);

  &__backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  &__grid {
    @include container;
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(40px, 6vw, 64px);

    @media (min-width: 900px) {
      grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
      align-items: stretch;
      gap: clamp(32px, 4vw, 56px);
    }
  }

  &__text {
    display: flex;
    flex-direction: column;
    justify-content: center;

    @media (min-width: 900px) {
      position: sticky;
      top: clamp(96px, 14vh, 140px);
      align-self: start;
    }
  }

  &__heading {
    margin-bottom: $space-xl;
  }

  &__body {
    margin-bottom: $space-xl;
  }

  &__visual {
    position: relative;
    min-height: clamp(420px, 52vh, 560px);
    border-radius: $radius-lg;
    overflow: hidden;
    border: 1px solid rgba($color-gold, 0.18);
    box-shadow:
      0 24px 80px rgba(0, 0, 0, 0.45),
      0 0 60px rgba(56, 150, 90, 0.06);

    @media (min-width: 900px) {
      min-height: clamp(460px, 56vh, 620px);
    }
  }

  &__visual-fallback {
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(10, 16, 12, 0.98) 0%, rgba(5, 8, 7, 1) 100%);
  }
}
</style>
