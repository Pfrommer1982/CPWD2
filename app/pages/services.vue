<script setup lang="ts">
definePageMeta({ layout: 'default' })

const seo = useSectionTranslations('seo')

useSeo(computed(() => ({
  title: seo.t('services.title'),
  description: seo.t('services.description'),
})))
</script>

<template>
  <div class="page-services">
    <SectionsServicesJourneySection />
  </div>
</template>

<style lang="scss" scoped>
.page-services {
  position: relative;
  z-index: 2;
  padding-top: 0;
}
</style>
