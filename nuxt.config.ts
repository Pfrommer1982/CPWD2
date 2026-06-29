// https://nuxt.com/docs/api/configuration/nuxt-config
import { createI18nLocaleConfig } from './app/i18n/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/scss/main.scss'],

  vite: {
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
    public: {
      imagekitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  app: {
    head: {
      htmlAttrs: {},
      title: 'CPWD, Creative Web Development',
      meta: [
        { name: 'description', content: 'CPWD, locked-in digital experiences, crosshair-sharp websites and high-end web development.' },
        { property: 'og:image', content: '/og-image.jpg' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
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
