<script setup lang="ts">
withDefaults(defineProps<{
  height?: number
}>(), {
  height: 36,
})

const imageKit = useImageKit()
</script>

<template>
  <img
    :src="imageKit.logo(height)"
    alt="CPWD"
    class="app-logo"
    :style="{ '--logo-h': `${height}px` }"
    decoding="async"
  >
</template>

<style lang="scss" scoped>
.app-logo {
  display: block;
  width: auto;
  height: var(--logo-h, 36px);
  object-fit: contain;
}
</style>
