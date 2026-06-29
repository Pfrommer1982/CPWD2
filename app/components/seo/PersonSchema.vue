<script setup lang="ts">
import { CPWD_GITHUB_URL } from '~/constants/brand'

const config = useRuntimeConfig()
const { locale } = useI18n()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Christoph Pfrommer',
  url: siteUrl,
  jobTitle: 'Creative Developer',
  description: locale.value === 'nl'
    ? 'Freelance creative developer in Nederland, gespecialiseerd in Nuxt, GSAP en Three.js.'
    : 'Freelance creative developer based in the Netherlands, specialized in Nuxt, GSAP and Three.js.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'NL',
  },
  sameAs: [CPWD_GITHUB_URL],
  knowsAbout: [
    'Web Development',
    'Nuxt.js',
    'Vue.js',
    'GSAP',
    'Three.js',
    'Creative Development',
    'Frontend Development',
    'Motion Design',
  ],
}))
</script>

<template>
  <SeoJsonLd :data="schema" />
</template>
