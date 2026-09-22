<script setup lang="ts">
import { CPWD_GITHUB_URL, CPWD_LINKEDIN_URL } from '~/constants/brand'

const config = useRuntimeConfig()
const { locale } = useI18n()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Christoph',
  url: siteUrl,
  jobTitle: 'Web Developer // CPWD',
  description: locale.value === 'nl'
    ? 'Bouwt maatwerk websites en webapps bij CPWD, vanuit Nederland.'
    : 'Builds bespoke websites and web apps at CPWD, from the Netherlands.',
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
