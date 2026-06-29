<script setup lang="ts">
definePageMeta({
  layout: 'default',
  hideFooter: true,
})

const seo = useSectionTranslations('seo')

useSeo(computed(() => ({
  title: seo.t('contact.title'),
  description: seo.t('contact.description'),
})))
</script>

<template>
  <div class="page-contact">
    <SectionsContactJourneySection />
  </div>
</template>

<style lang="scss" scoped>
.page-contact {
  position: relative;
  z-index: 2;
  padding-top: 0;
}
</style>
