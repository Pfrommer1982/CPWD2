<script setup lang="ts">
const pageTransition = {
  name: 'page',
  mode: 'out-in' as const,
}

onMounted(() => {
  useLenis().init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
</template>
