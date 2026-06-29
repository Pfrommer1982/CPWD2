<script setup lang="ts">
const props = defineProps<{ data: Record<string, unknown> }>()

const jsonString = computed(() => JSON.stringify(props.data))

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'json-ld',
      innerHTML: jsonString,
    },
  ],
})
</script>

<template />
