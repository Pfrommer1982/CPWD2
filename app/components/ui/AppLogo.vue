<script setup lang="ts">
withDefaults(defineProps<{
  height?: number
}>(), {
  height: 36,
})

const imageKit = useImageKit()
</script>

<template>
  <span class="app-logo-wrap" :style="{ '--logo-h': `${height}px` }">
    <img
      :src="imageKit.logo(height)"
      alt="CPWD"
      class="app-logo"
      decoding="async"
    >
    <span class="app-logo__dot" aria-hidden="true" />
  </span>
</template>

<style lang="scss" scoped>
.app-logo-wrap {
  position: relative;
  display: inline-flex;
  line-height: 0;
}

.app-logo {
  display: block;
  width: auto;
  height: var(--logo-h, 36px);
  object-fit: contain;
}

.app-logo__dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--logo-h) * 0.085);
  height: calc(var(--logo-h) * 0.085);
  min-width: 3px;
  min-height: 3px;
  border-radius: 50%;
  background: $color-gold;
  box-shadow: 0 0 calc(var(--logo-h) * 0.12) rgba(69, 232, 138, 0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
