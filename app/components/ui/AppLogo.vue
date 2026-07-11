<script setup lang="ts">
const props = withDefaults(defineProps<{
  height?: number
}>(), {
  height: 36,
})

const size = computed(() => props.height / 250)
</script>

<template>
  <span class="app-logo-wrap">
    <UiCpwdLogo :size="size" />
  </span>
</template>

<style lang="scss" scoped>
.app-logo-wrap {
  display: inline-flex;
  line-height: 0;
}
</style>
