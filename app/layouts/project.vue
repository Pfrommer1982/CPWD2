<template>
  <div class="layout-project">
    <SeoSiteSchema />
    <UiAppCursor />
    <UiAppNav />
    <main>
      <slot />
    </main>
    <SectionsFinaleSection />
  </div>
</template>

<style lang="scss">
.layout-project {
  background: $color-bg;
  min-height: 100vh;
}
</style>
