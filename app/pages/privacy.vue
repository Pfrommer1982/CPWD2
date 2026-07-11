<script setup lang="ts">
definePageMeta({ layout: 'default' })

const seo = useSectionTranslations('seo')
const privacy = useSectionTranslations('privacy')

useSeo(computed(() => ({
  title: seo.t('privacy.title'),
  description: seo.t('privacy.description'),
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: privacy.t('heading'), path: '/privacy' },
  ],
})))
</script>

<template>
  <div class="page-privacy">
    <SectionsPrivacySection />
  </div>
</template>

<style lang="scss" scoped>
.page-privacy {
  position: relative;
  z-index: 2;
}
</style>
