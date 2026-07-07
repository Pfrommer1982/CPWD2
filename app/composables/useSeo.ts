import { toValue, type MaybeRefOrGetter } from 'vue'
import { CPWD_SITE_NAME, COMMS_HEX } from '~/constants/brand'

export interface BreadcrumbItem {
  name: string
  path: string
}

export interface SeoOptions {
  title: string
  description: string
  image?: string
  imageAlt?: string
  type?: 'website' | 'article' | 'profile'
  noindex?: boolean
  canonicalPath?: string
  breadcrumbs?: BreadcrumbItem[]
}

function buildBreadcrumbSchema(siteUrl: string, items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  }
}

export function useSeo(options: MaybeRefOrGetter<SeoOptions>) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const { locale } = useI18n()
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

  useHead(() => {
    const opts = toValue(options)
    const brand = CPWD_SITE_NAME
    const fullTitle = opts.title === brand || opts.title.endsWith(` | ${brand}`)
      ? opts.title
      : `${opts.title} | ${brand}`

    const canonical = `${siteUrl}${opts.canonicalPath ?? route.path}`

    const image = opts.image
      ? (opts.image.startsWith('http') ? opts.image : `${siteUrl}${opts.image}`)
      : `${siteUrl}/og-image.jpg`

    const imageAlt = opts.imageAlt ?? `${brand} - ${opts.title}`
    const robots = opts.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    const ogLocale = locale.value === 'nl' ? 'nl_NL' : 'en_US'
    const ogLocaleAlternate = locale.value === 'nl' ? 'en_US' : 'nl_NL'

    const scripts = opts.breadcrumbs?.length
      ? [{
          type: 'application/ld+json',
          key: 'json-ld-breadcrumb',
          innerHTML: JSON.stringify(buildBreadcrumbSchema(siteUrl, opts.breadcrumbs)),
        }]
      : []

    return {
      title: fullTitle,
      htmlAttrs: { lang: locale.value },
      link: [
        { rel: 'canonical', href: canonical },
      ],
      meta: [
        { name: 'description', content: opts.description },
        { name: 'robots', content: robots },
        { name: 'author', content: 'Christoph Pfrommer' },
        { name: 'publisher', content: brand },
        { name: 'theme-color', content: COMMS_HEX },
        { name: 'geo.region', content: 'NL' },
        { name: 'geo.placename', content: 'Netherlands' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: opts.description },
        { property: 'og:image', content: image },
        { property: 'og:image:secure_url', content: image },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: imageAlt },
        { property: 'og:url', content: canonical },
        { property: 'og:type', content: opts.type ?? 'website' },
        { property: 'og:locale', content: ogLocale },
        { property: 'og:locale:alternate', content: ogLocaleAlternate },
        { property: 'og:site_name', content: brand },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: fullTitle },
        { name: 'twitter:description', content: opts.description },
        { name: 'twitter:image', content: image },
        { name: 'twitter:image:alt', content: imageAlt },
      ],
      script: scripts,
    }
  })
}
