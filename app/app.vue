<script setup lang="ts">
const config = useRuntimeConfig()

const pageTransition = {
  name: 'page',
  mode: 'out-in' as const,
}

useHead(() => {
  const verification = config.public.googleSiteVerification as string
  if (!verification) return {}

  return {
    meta: [
      { name: 'google-site-verification', content: verification },
    ],
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
</template>
