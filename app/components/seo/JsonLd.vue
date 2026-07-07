<script setup lang="ts">
const props = defineProps<{
  data: Record<string, unknown>
  id?: string
}>()

const jsonString = computed(() => JSON.stringify(props.data))

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: `json-ld-${props.id ?? 'default'}`,
      innerHTML: jsonString,
    },
  ],
})
</script>

<template />
