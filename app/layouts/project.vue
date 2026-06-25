<script setup lang="ts">
onMounted(() => {
  useLenis().init()
})
</script>

<template>
  <div class="layout-project">
    <UiAppCursor />
    <UiAppNav />
    <main class="layout-project__main">
      <slot />
    </main>
    <GsapScrollProgress />
  </div>
</template>

<style lang="scss" scoped>
.layout-project {
  position: relative;
  min-height: 100vh;
  background: $color-bg;

  &__main {
    position: relative;
    z-index: $z-content;
  }
}
</style>
