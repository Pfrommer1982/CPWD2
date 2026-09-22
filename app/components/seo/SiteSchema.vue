<script setup lang="ts">
import {
  CPWD_CONTACT_EMAIL,
  CPWD_GITHUB_URL,
  CPWD_LINKEDIN_URL,
  CPWD_SITE_NAME,
} from '~/constants/brand'
import { PROJECT_PRICING } from '~/data/projectPricing'

const config = useRuntimeConfig()
const { locale } = useI18n()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

const organizationId = `${siteUrl}/#organization`
const websiteId = `${siteUrl}/#website`
const personId = `${siteUrl}/#person`

const offerNames = {
  'one-page': { nl: 'One-page website', en: 'One-page website' },
  portfolio: { nl: 'Portfolio website', en: 'Portfolio website' },
  business: { nl: 'Bedrijfswebsite', en: 'Business website' },
  webshop: { nl: 'Webshop', en: 'Webshop' },
  webapp: { nl: 'Webapp', en: 'Web app' },
} as const

const schema = computed(() => {
  const lang = locale.value === 'nl' ? 'nl' : 'en'
  const startingNote = lang === 'nl'
    ? 'Startprijs in euro, exclusief extra pagina\'s en opties. De offerte daarna is een vaste prijs.'
    : 'Starting price in euros, excluding extra pages and options. The quote after that is a fixed price.'

  const serviceOffers = (Object.keys(offerNames) as Array<keyof typeof offerNames>).map((id) => ({
    '@type': 'Offer',
    name: offerNames[id][lang],
    price: String(PROJECT_PRICING.types[id].base),
    priceCurrency: 'EUR',
    url: `${siteUrl}/project-estimator`,
    availability: 'https://schema.org/InStock',
    description: startingNote,
    itemOffered: {
      '@type': 'Service',
      name: offerNames[id][lang],
      provider: { '@id': organizationId },
      areaServed: { '@type': 'Country', name: 'Netherlands' },
    },
  }))

  return ({
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
        ? 'CPWD is een webdevelopment-bureau in Nederland. Maatwerk websites en webapps, van briefing tot livegang en hosting.'
        : 'CPWD is a web development studio in the Netherlands. Bespoke websites and web apps, from brief to launch and hosting.',
      slogan: locale.value === 'nl'
        ? 'Maatwerk websites en webapps vanuit Nederland.'
        : 'Bespoke websites and web apps from the Netherlands.',
      priceRange: `€${PROJECT_PRICING.types['one-page'].base}-€${PROJECT_PRICING.types.webapp.base}`,
      email: CPWD_CONTACT_EMAIL,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NL',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Netherlands',
      },
      sameAs: [CPWD_LINKEDIN_URL, CPWD_GITHUB_URL],
      contactPoint: {
        '@type': 'ContactPoint',
        email: CPWD_CONTACT_EMAIL,
        contactType: 'customer service',
        availableLanguage: ['Dutch', 'English'],
      },
      knowsAbout: [
        'Website laten maken',
        'Webdevelopment',
        'Maatwerk website',
        'Webdesign',
        'Webapplicaties',
        'Web Development',
        'Web Design',
        'Cloud Hosting',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: locale.value === 'nl' ? 'Website types' : 'Website types',
        itemListElement: [
          ...serviceOffers,
          {
            '@type': 'Offer',
            name: locale.value === 'nl' ? 'Hosting per jaar' : 'Hosting per year',
            price: String(PROJECT_PRICING.hosting.cpwd),
            priceCurrency: 'EUR',
            url: `${siteUrl}/services`,
            description: locale.value === 'nl'
              ? 'Jaarlijkse hosting via CPWD.'
              : 'Yearly hosting with CPWD.',
          },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: CPWD_SITE_NAME,
      url: siteUrl,
      description: locale.value === 'nl'
        ? `CPWD bouwt maatwerk websites en webapps vanuit Nederland. One-page vanaf €${PROJECT_PRICING.types['one-page'].base}.`
        : `CPWD builds bespoke websites and web apps from the Netherlands. One-page sites from €${PROJECT_PRICING.types['one-page'].base}.`,
      inLanguage: ['nl-NL', 'en-US'],
      publisher: { '@id': organizationId },
    },
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Christoph',
      url: `${siteUrl}/about`,
      jobTitle: locale.value === 'nl' ? 'Webdeveloper' : 'Web developer',
      worksFor: { '@id': organizationId },
      description: locale.value === 'nl'
        ? 'Bouwt maatwerk websites en webapps bij CPWD, vanuit Nederland.'
        : 'Builds bespoke websites and web apps at CPWD, from the Netherlands.',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NL',
      },
      sameAs: [CPWD_GITHUB_URL, CPWD_LINKEDIN_URL],
    },
  ],
  })
})
</script>

<template>
  <SeoJsonLd id="site" :data="schema" />
</template>
