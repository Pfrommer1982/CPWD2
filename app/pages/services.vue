<script setup lang="ts">
definePageMeta({ layout: 'default' })

const seo = useSectionTranslations('seo')
const nav = useSectionTranslations('nav')

useSeo(computed(() => ({
  title: seo.t('services.title'),
  description: seo.t('services.description'),
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: nav.t('services'), path: '/services' },
  ],
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
