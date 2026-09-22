<script setup lang="ts">
import { PROJECT_PRICING } from '~/data/projectPricing'

const answers = useSectionTranslations('answers')
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { locale } = useI18n()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

const priceParams = {
  onePage: PROJECT_PRICING.types['one-page'].base,
  portfolio: PROJECT_PRICING.types.portfolio.base,
  business: PROJECT_PRICING.types.business.base,
  webshop: PROJECT_PRICING.types.webshop.base,
  webapp: PROJECT_PRICING.types.webapp.base,
  hosting: PROJECT_PRICING.hosting.cpwd,
}

const itemKeys = ['what', 'price', 'time', 'where'] as const

const items = computed(() => itemKeys.map((key) => ({
  q: answers.t(`items.${key}.q`),
  a: key === 'price' ? answers.t(`items.${key}.a`, priceParams) : answers.t(`items.${key}.a`),
  more: answers.t(`items.${key}.more`),
  href: answers.t(`items.${key}.href`),
})))

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: locale.value === 'nl'
        ? 'Website laten maken in Nederland'
        : 'Custom website, built in the Netherlands',
      description: answers.t('intro'),
      inLanguage: locale.value === 'nl' ? 'nl-NL' : 'en-US',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      primaryImageOfPage: `${siteUrl}/og-image.jpg`,
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.home-answers__intro', '.home-answers__a'],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      url: `${siteUrl}/`,
      inLanguage: locale.value === 'nl' ? 'nl-NL' : 'en-US',
      mainEntity: items.value.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ],
}))
</script>

<template>
  <section class="home-answers" aria-labelledby="home-answers-heading">
    <SeoJsonLd id="home-answers" :data="schema" />
    <div class="container">
      <p class="section-label">{{ answers.t('label') }}</p>
      <h2 id="home-answers-heading" class="home-answers__heading font-display">
        {{ answers.t('heading') }}
      </h2>
      <p class="home-answers__intro">{{ answers.t('intro') }}</p>

      <dl class="home-answers__list">
        <div v-for="item in items" :key="item.href" class="home-answers__item">
          <dt class="home-answers__q">{{ item.q }}</dt>
          <dd class="home-answers__body">
            <p class="home-answers__a">{{ item.a }}</p>
            <NuxtLink :to="localePath(item.href)" class="home-answers__more" data-cursor="hover">
              {{ item.more }}
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-answers {
  position: relative;
  padding-block: clamp(72px, 12vh, 120px);
  background: $color-bg;
  border-top: 1px solid $color-border;

  &__heading {
    max-width: 22ch;
    font-size: clamp(1.8rem, 3.2vw, 2.6rem);
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }

  &__intro {
    max-width: 42rem;
    margin-top: $space-6;
    color: $color-text-muted;
    font-size: 1.05rem;
    line-height: 1.6;
  }

  &__list {
    margin-top: clamp(40px, 6vh, 72px);
    border-top: 1px solid $color-border;
  }

  &__item {
    display: grid;
    gap: 12px 48px;
    padding-block: 28px;
    border-bottom: 1px solid $color-border;

    @media (min-width: 800px) {
      grid-template-columns: minmax(200px, 280px) 1fr;
      align-items: start;
    }
  }

  &__q {
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-widest;
    text-transform: uppercase;
    color: $color-gold;
  }

  &__a {
    max-width: 46rem;
    color: $color-text;
    line-height: 1.6;
  }

  &__more {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 14px;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    text-transform: uppercase;
    color: $color-text;

    &:hover {
      color: $color-gold;
    }
  }
}
</style>
