// https://nuxt.com/docs/api/configuration/nuxt-config
import { createI18nLocaleConfig } from './app/i18n/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/scss/main.scss'],

  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
  },

  nitro: {
    compressPublicAssets: true,
    minify: true,
  },

  routeRules: {
    '/work/career-pulse': { redirect: { to: '/work/careerpulse', statusCode: 301 } },
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap'],
            three: ['three'],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'gsap',
        'gsap/ScrollTrigger',
        'lenis',
        'three',
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/scss/_variables.scss" as *;
            @use "~/assets/scss/_mixins.scss" as *;
          `,
        },
      },
    },
  },

  i18n: {
    restructureDir: 'app/i18n',
    langDir: 'locales',
    lazy: true,
    defaultLocale: 'nl',
    fallbackLocale: 'en',
    locales: createI18nLocaleConfig(),
    strategy: 'no_prefix',
    vueI18n: './i18n.config.ts',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'nl',
    },
  },

  runtimeConfig: {
    imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    contactToEmail: process.env.CONTACT_TO_EMAIL || 'info@cpwd.nl',
    contactFromEmail: process.env.CONTACT_FROM_EMAIL || 'CPWD Contact <noreply@cpwd.nl>',
    public: {
      imagekitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.cpwd.nl',
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'nl',
      },
      title: 'CPWD',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'CPWD bouwt maatwerk websites en webapps vanuit Nederland. Webdesign, development en online lancering.' },
        { name: 'author', content: 'Christoph Pfrommer' },
        { name: 'publisher', content: 'CPWD' },
        { name: 'theme-color', content: '#38965A' },
        { name: 'geo.region', content: 'NL' },
        { name: 'geo.placename', content: 'Netherlands' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'CPWD' },
        { property: 'og:locale', content: 'nl_NL' },
        { property: 'og:image', content: 'https://www.cpwd.nl/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://ik.imagekit.io' },
        { rel: 'dns-prefetch', href: 'https://ik.imagekit.io' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap',
        },
      ],
    },
  },
})
