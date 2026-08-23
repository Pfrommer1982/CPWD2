<script setup lang="ts">
definePageMeta({ layout: 'default' })

const copy = useSectionTranslations('projectEstimator')
const seo = useSectionTranslations('seo')
const nav = useSectionTranslations('nav')

useSeo(computed(() => ({
  title: seo.t('projectEstimator.title'),
  description: seo.t('projectEstimator.description'),
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: nav.t('projectEstimator'), path: '/project-estimator' },
  ],
})))
</script>

<template>
  <div class="project-estimator-page">
    <section class="project-estimator-page__hero section" data-page-hero>
      <div class="container">
        <p class="section-label" data-hero-fade>{{ copy.t('eyebrow') }}</p>
        <UiStaggeredHeroTitle
          :text="copy.t('title')"
          class="project-estimator-page__title"
        />
        <p class="project-estimator-page__lead copy-width" data-hero-fade>{{ copy.t('lead') }}</p>
      </div>
    </section>

    <section class="project-estimator-page__tool section">
      <div class="container">
        <ProjectEstimatorWizard />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.project-estimator-page__hero {
  padding-top: clamp(6.5rem, 12vh, 8.5rem);
  padding-bottom: $space-5;
}

.project-estimator-page__title {
  margin: $space-3 0 $space-3;
  max-width: 16ch;
}

.project-estimator-page__lead {
  margin: 0;
  color: $color-text-muted;
  font-size: $text-lg;
  line-height: $leading-relaxed;
}

.project-estimator-page__tool {
  padding-top: 0;
  padding-bottom: clamp(5rem, 12vh, 8rem);
}
</style>
