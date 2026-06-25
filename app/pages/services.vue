<script setup lang="ts">
const services = useSectionTranslations('services')

definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="page-services">
    <section class="page-services__hero">
      <span class="font-mono page-services__label">{{ services.t('label') }}</span>
      <h1 class="page-services__heading font-display">
        {{ services.t('heading') }}
      </h1>
    </section>

    <SectionsServicesSection />
  </div>
</template>

<style lang="scss" scoped>
.page-services {
  padding-top: 120px;

  &__hero {
    @include container;
    padding-block: $space-3xl $space-xl;
  }

  &__label {
    color: $color-accent;
    display: block;
    margin-bottom: $space-md;
  }

  &__heading {
    font-size: $text-4xl;
  }
}
</style>
