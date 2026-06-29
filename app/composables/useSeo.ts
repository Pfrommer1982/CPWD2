import { toValue, type MaybeRefOrGetter } from 'vue'

export interface SeoOptions {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  noindex?: boolean
  canonicalPath?: string
}

export function useSeo(options: MaybeRefOrGetter<SeoOptions>) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const { locale } = useI18n()
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

  useHead(() => {
    const opts = toValue(options)
    const fullTitle = opts.title.includes('CPWD')
      ? opts.title
      : `${opts.title} — CPWD`

    const canonical = `${siteUrl}${opts.canonicalPath ?? route.path}`

    const image = opts.image
      ? (opts.image.startsWith('http') ? opts.image : `${siteUrl}${opts.image}`)
      : `${siteUrl}/og-image.jpg`

    const robots = opts.noindex ? 'noindex, nofollow' : 'index, follow'
    const ogLocale = locale.value === 'nl' ? 'nl_NL' : 'en_US'

    return {
      title: fullTitle,
      htmlAttrs: { lang: locale.value },
      link: [
        { rel: 'canonical', href: canonical },
      ],
      meta: [
        { name: 'description', content: opts.description },
        { name: 'robots', content: robots },
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: opts.description },
        { property: 'og:image', content: image },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: canonical },
        { property: 'og:type', content: opts.type ?? 'website' },
        { property: 'og:locale', content: ogLocale },
        { property: 'og:site_name', content: 'CPWD — Christoph Pfrommer' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: fullTitle },
        { name: 'twitter:description', content: opts.description },
        { name: 'twitter:image', content: image },
      ],
    }
  })
}
