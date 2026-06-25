<script setup lang="ts">
const pageTransition = {
  name: 'page',
  mode: 'out-in' as const,
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
</template>
