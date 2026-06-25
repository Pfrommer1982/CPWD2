// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/scss/main.scss'],

  vite: {
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
    locales: [
      { code: 'nl', name: 'Nederlands', file: 'nl.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'nl',
    langDir: 'locales',
    strategy: 'prefix_except_default',
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
      htmlAttrs: { lang: 'nl' },
      title: 'CPWD — Creative Web Development',
      meta: [
        { name: 'description', content: 'CPWD — immersive digital experiences, animation-driven websites and high-end web development.' },
        { property: 'og:image', content: '/og-image.jpg' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&family=Space+Mono&display=swap',
        },
      ],
    },
  },
})
