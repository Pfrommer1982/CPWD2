<script setup lang="ts">
withDefaults(defineProps<{
  href?: string
  to?: string
  variant?: 'primary' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
})

const btnRef = ref<HTMLElement | null>(null)
const { bindMagnet } = useMagnet(0.35)

onMounted(() => {
  bindMagnet(btnRef.value)
})
</script>

<template>
  <NuxtLink
    v-if="to"
    ref="btnRef"
    :to="to"
    class="magnetic-btn"
    :class="variant === 'primary' ? 'btn-primary' : 'btn-ghost'"
    data-cursor="hover"
  >
    <span class="magnetic-btn__inner"><slot /></span>
  </NuxtLink>
  <a
    v-else-if="href"
    ref="btnRef"
    :href="href"
    class="magnetic-btn"
    :class="variant === 'primary' ? 'btn-primary' : 'btn-ghost'"
    data-cursor="hover"
  >
    <span class="magnetic-btn__inner"><slot /></span>
  </a>
  <button
    v-else
    ref="btnRef"
    :type="type"
    class="magnetic-btn"
    :class="variant === 'primary' ? 'btn-primary' : 'btn-ghost'"
    :disabled="disabled"
    data-cursor="hover"
  >
    <span class="magnetic-btn__inner"><slot /></span>
  </button>
</template>

<style lang="scss" scoped>
.magnetic-btn {
  &__inner {
    pointer-events: none;
  }
}
</style>
