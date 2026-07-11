<script setup lang="ts">
definePageMeta({ layout: 'default' })

const seo = useSectionTranslations('seo')
const terms = useSectionTranslations('terms')

useSeo(computed(() => ({
  title: seo.t('terms.title'),
  description: seo.t('terms.description'),
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: terms.t('heading'), path: '/terms' },
  ],
})))
</script>

<template>
  <div class="page-terms">
    <SectionsTermsSection />
  </div>
</template>

<style lang="scss" scoped>
.page-terms {
  position: relative;
  z-index: 2;
}
</style>
