<script setup lang="ts">
import type { KnowledgeArticle } from '~/data/knowledge'
import { CPWD_SITE_NAME } from '~/constants/brand'

const props = defineProps<{ article: KnowledgeArticle }>()

const config = useRuntimeConfig()
const { locale } = useI18n()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')
const lang = computed(() => (locale.value === 'en' ? 'en' : 'nl'))

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: props.article.question[lang.value],
  description: props.article.answer[lang.value],
  articleSection: props.article.categoryId,
  keywords: props.article.keywords.join(', '),
  inLanguage: locale.value === 'en' ? 'en' : 'nl',
  datePublished: props.article.updated,
  dateModified: props.article.updated,
  url: `${siteUrl}/faq/${props.article.slug}`,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${siteUrl}/faq/${props.article.slug}`,
  },
  author: {
    '@type': 'Organization',
    name: CPWD_SITE_NAME,
    url: siteUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: CPWD_SITE_NAME,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon-512.png`,
    },
  },
  isPartOf: {
    '@type': 'WebSite',
    name: CPWD_SITE_NAME,
    url: siteUrl,
  },
}))
</script>

<template>
  <SeoJsonLd id="article" :data="schema" />
</template>
