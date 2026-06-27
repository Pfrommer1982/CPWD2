<script setup lang="ts">
const loaderDone = ref(false)
const i18nHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang ?? 'nl',
  },
}))

function onLoaderComplete() {
  loaderDone.value = true
}
</script>

<template>
  <div class="layout">
    <UiAppLoader v-if="!loaderDone" @complete="onLoaderComplete" />
    <UiAppCursor />
    <UiAppNav />
    <main class="layout__main">
      <slot />
    </main>
    <SectionsFinaleSection />
    <GsapScrollProgress />
  </div>
</template>

<style lang="scss">
.layout {
  min-height: 100vh;
  background: $color-bg;
  color: $color-text;
}
</style>
