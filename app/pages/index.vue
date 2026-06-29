<script setup lang="ts">
definePageMeta({ layout: 'default' })

const seo = useSectionTranslations('seo')

useSeo(computed(() => ({
  title: seo.t('home.title'),
  description: seo.t('home.description'),
})))
</script>

<template>
  <div class="home">
    <SectionsHeroSection />
    <SectionsMarqueeSection />
    <SectionsWorkSection />
    <SectionsAboutSection />
    <SectionsServicesSection />
    <SectionsMotionSection />
  </div>
</template>
