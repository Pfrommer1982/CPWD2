<script setup lang="ts">
const common = useSectionTranslations('common')
</script>

<template>
  <section class="motion-section">
    <ClientOnly>
      <EffectsDotFieldCanvas variant="tunnel" :density="1.1" :intensity="1.15" interactive />
    </ClientOnly>

    <div class="motion-section__vignette" aria-hidden="true" />

    <div class="motion-section__content container">
      <span class="section-label motion-section__label">{{ common.t('motion.label') }}</span>
      <ProjectOutlineText
        :text="common.t('motion.heading')"
        tag="h2"
        size="display"
        scroll-start="top 85%"
        scroll-end="top 25%"
      />
      <ProjectOutlineText
        :text="common.t('motion.body')"
        tag="p"
        size="body"
        scroll-start="top 80%"
        scroll-end="top 35%"
        class="motion-section__body"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.motion-section {
  position: relative;
  min-height: clamp(480px, 72vh, 820px);
  display: flex;
  align-items: center;
  overflow: hidden;
  background: $color-bg;
  border-block: 1px solid $color-border;

  &__vignette {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 50% 50%, transparent 0%, rgba(8, 8, 8, 0.65) 100%),
      linear-gradient(to bottom, rgba(8, 8, 8, 0.5) 0%, transparent 30%, transparent 70%, rgba(8, 8, 8, 0.55) 100%);
    pointer-events: none;
    z-index: 1;
  }

  &__content {
    position: relative;
    z-index: 2;
    padding-block: clamp(64px, 10vh, 120px);
    max-width: 900px;
  }

  &__label {
    margin-bottom: $space-6;
  }

  &__body {
    margin-top: clamp(24px, 4vh, 40px);
  }
}
</style>
