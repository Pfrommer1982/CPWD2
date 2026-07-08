<script setup lang="ts">
import type { KnowledgeArticle } from '~/data/knowledge'

const props = defineProps<{ articles: KnowledgeArticle[] }>()

const { locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'nl'))

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: props.articles.map(article => ({
    '@type': 'Question',
    name: article.question[lang.value],
    acceptedAnswer: {
      '@type': 'Answer',
      text: article.answer[lang.value],
    },
  })),
}))
</script>

<template>
  <SeoJsonLd id="faq" :data="schema" />
</template>
