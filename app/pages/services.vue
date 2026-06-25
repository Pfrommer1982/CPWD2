<script setup lang="ts">
const { t, tm } = useI18n()

definePageMeta({ layout: 'default' })

const items = computed(() => tm('services.items') as Array<{
  number: string
  title: string
  desc: string
}>)
</script>

<template>
  <div class="page-services">
    <section class="page-services__hero">
      <span class="font-mono page-services__label">{{ t('services.label') }}</span>
      <h1 class="page-services__heading font-display">
        {{ t('services.heading') }}
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
