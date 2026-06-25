<script setup lang="ts">
const about = useSectionTranslations('about')
const { parseHighlightedBody } = useSplitText()

definePageMeta({ layout: 'default' })

const bodyHtml = computed(() => parseHighlightedBody(about.t('body')))
</script>

<template>
  <div class="page-about">
    <section class="page-about__hero">
      <span class="font-mono page-about__label">{{ about.t('label') }}</span>
      <GsapSplitText tag="h1" class="page-about__heading font-display">
        {{ about.t('heading') }}
      </GsapSplitText>
    </section>

    <section class="page-about__content">
      <p class="page-about__body" v-html="bodyHtml" />
      <ClientOnly>
        <ThreeFloatingGeometry />
      </ClientOnly>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-about {
  padding-top: 120px;

  &__hero {
    @include container;
    padding-block: $space-3xl;
  }

  &__label {
    color: $color-accent;
    display: block;
    margin-bottom: $space-md;
  }

  &__heading {
    font-size: $text-4xl;
    max-width: 16ch;
    line-height: 1;
  }

  &__content {
    @include container;
    display: grid;
    gap: $space-3xl;
    padding-block: $space-3xl;

    @media (min-width: 900px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__body {
    font-size: $text-xl;
    color: $color-text-muted;
    line-height: 1.7;
  }
}
</style>
