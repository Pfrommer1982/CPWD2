<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{ project: Project }>()

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: props.project.title,
  description: props.project.subtitle,
  creator: {
    '@type': 'Person',
    name: 'Christoph Pfrommer',
  },
  dateCreated: String(props.project.year),
  url: `${siteUrl}/work/${props.project.slug}`,
  ...(props.project.liveUrl ? { sameAs: props.project.liveUrl } : {}),
}))
</script>

<template>
  <SeoJsonLd :data="schema" />
</template>
