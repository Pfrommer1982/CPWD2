<script setup lang="ts">
import {
  CPWD_CONTACT_EMAIL,
  CPWD_GITHUB_URL,
  CPWD_LINKEDIN_URL,
  CPWD_SITE_NAME,
} from '~/constants/brand'

const config = useRuntimeConfig()
const { locale } = useI18n()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

const organizationId = `${siteUrl}/#organization`
const websiteId = `${siteUrl}/#website`
const personId = `${siteUrl}/#person`

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': organizationId,
      name: CPWD_SITE_NAME,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon-512.png`,
        width: 512,
        height: 512,
      },
      image: `${siteUrl}/og-image.jpg`,
      description: locale.value === 'nl'
        ? 'CPWD is een webdevelopment-bureau uit Nederland. Maatwerk websites, webapps en cloud hosting.'
        : 'CPWD is a web development agency based in the Netherlands. Bespoke websites, web apps and cloud hosting.',
      email: CPWD_CONTACT_EMAIL,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NL',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Netherlands',
      },
      founder: { '@id': personId },
      sameAs: [CPWD_LINKEDIN_URL, CPWD_GITHUB_URL],
      contactPoint: {
        '@type': 'ContactPoint',
        email: CPWD_CONTACT_EMAIL,
        contactType: 'customer service',
        availableLanguage: ['Dutch', 'English'],
      },
      knowsAbout: [
        'Web Development',
        'Web Design',
        'Frontend Development',
        'Cloud Hosting',
        'Motion Design',
        'Sound Design',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: CPWD_SITE_NAME,
      url: siteUrl,
      description: locale.value === 'nl'
        ? 'CPWD bouwt maatwerk websites en webapps vanuit Nederland.'
        : 'CPWD builds bespoke websites and web apps from the Netherlands.',
      inLanguage: ['nl-NL', 'en-US'],
      publisher: { '@id': organizationId },
    },
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Christoph Pfrommer',
      url: siteUrl,
      jobTitle: 'Web Developer',
      worksFor: { '@id': organizationId },
      description: locale.value === 'nl'
        ? 'Oprichter van CPWD. Webdevelopment-bureau uit Nederland.'
        : 'Founder of CPWD. Web development agency based in the Netherlands.',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NL',
      },
      sameAs: [CPWD_GITHUB_URL, CPWD_LINKEDIN_URL],
    },
  ],
}))
</script>

<template>
  <SeoJsonLd id="site" :data="schema" />
</template>
