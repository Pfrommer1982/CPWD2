<script setup lang="ts">
const loaderComplete = ref(false)

function onLoaderComplete() {
  loaderComplete.value = true
}

onMounted(() => {
  useLenis().init()
})
</script>

<template>
  <div class="layout-default">
    <UiAppLoader @complete="onLoaderComplete" />
    <UiAppCursor />
    <UiAppNav />
    <main class="layout-default__main">
      <slot />
    </main>
    <UiAppFooter />
    <GsapScrollProgress />
  </div>
</template>

<style lang="scss" scoped>
.layout-default {
  position: relative;
  min-height: 100vh;

  &__main {
    position: relative;
    z-index: $z-content;
  }
}
</style>
