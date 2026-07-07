<script setup lang="ts">
import { CPWD_GITHUB_URL, CPWD_LINKEDIN_URL } from '~/constants/brand'

const config = useRuntimeConfig()
const { locale } = useI18n()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Christoph Pfrommer',
  url: siteUrl,
  jobTitle: locale.value === 'nl' ? 'Web Developer // CPWD' : 'Web Developer // CPWD',
  description: locale.value === 'nl'
    ? 'Oprichter van CPWD. Webdevelopment-bureau uit Nederland. Maatwerk websites en webapps.'
    : 'Founder of CPWD. Web development agency based in the Netherlands. Bespoke websites and web apps.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'NL',
  },
  sameAs: [CPWD_GITHUB_URL, CPWD_LINKEDIN_URL],
  knowsAbout: [
    'Web Development',
    'Web Design',
    'Frontend Development',
    'Cloud Hosting',
    'Motion Design',
    'Sound Design',
  ],
}))
</script>

<template>
  <SeoJsonLd :data="schema" />
</template>
