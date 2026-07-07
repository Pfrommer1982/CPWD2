<script setup lang="ts">
definePageMeta({ layout: 'default' })

const seo = useSectionTranslations('seo')
const nav = useSectionTranslations('nav')

useSeo(computed(() => ({
  title: seo.t('about.title'),
  description: seo.t('about.description'),
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: nav.t('about'), path: '/about' },
  ],
})))
</script>

<template>
  <div class="page-about">
    <SectionsAboutJourneySection />
  </div>
</template>

<style lang="scss" scoped>
.page-about {
  position: relative;
  z-index: 2;
  padding-top: 0;
}
</style>
