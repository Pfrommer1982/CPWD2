<script setup lang="ts">
const props = withDefaults(defineProps<{
  href?: string
  to?: string
  variant?: 'primary' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  type: 'button',
})

const btnRef = ref<HTMLElement | null>(null)
const { bindMagnet } = useMagnet(0.35)
const { setCursorState } = useCursor()

onMounted(() => {
  bindMagnet(btnRef.value)
})

function onEnter() {
  setCursorState('hover')
}

function onLeave() {
  setCursorState('default')
}
</script>

<template>
  <component
    :is="to ? resolveComponent('NuxtLink') : href ? 'a' : 'button'"
    ref="btnRef"
    :to="to"
    :href="href"
    :type="to || href ? undefined : type"
    class="magnetic-btn"
    :class="[`magnetic-btn--${variant}`]"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <span class="magnetic-btn__inner">
      <slot />
    </span>
  </component>
</template>

<style lang="scss" scoped>
@use 'sass:color';
.magnetic-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $space-md $space-xl;
  border-radius: $border-radius-full;
  font-family: $font-body;
  font-size: $text-sm;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: background $duration-med $ease-out-expo,
    color $duration-med $ease-out-expo;

  &--primary {
    background: $color-accent;
    color: $color-bg;

    &:hover {
      background: color.adjust($color-accent, $lightness: 5%);
    }
  }

  &--ghost {
    background: transparent;
    color: $color-text;
    border: 1px solid $color-border;

    &:hover {
      border-color: $color-accent;
      color: $color-accent;
    }
  }

  &__inner {
    pointer-events: none;
  }
}
</style>
