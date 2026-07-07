<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{ project: Project }>()

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')
const imageKit = useImageKit()

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: props.project.title,
  description: props.project.subtitle,
  image: imageKit.hero(props.project.heroImage),
  creator: {
    '@type': 'Person',
    name: 'Christoph Pfrommer',
    url: siteUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: 'CPWD',
    url: siteUrl,
  },
  dateCreated: String(props.project.year),
  url: `${siteUrl}/work/${props.project.slug}`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'CPWD',
    url: siteUrl,
  },
  ...(props.project.liveUrl ? { sameAs: props.project.liveUrl } : {}),
}))
</script>

<template>
  <SeoJsonLd id="project" :data="schema" />
</template>
