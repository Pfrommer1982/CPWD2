<script setup lang="ts">
const { t } = useI18n()
const text = computed(() => t('marquee.items'))
const offset1 = ref(0)
const offset2 = ref(0)

const { pause, resume } = useRafFn(({ delta }) => {
  offset1.value -= delta * 0.04
  offset2.value += delta * 0.03

  if (offset1.value <= -50) offset1.value = 0
  if (offset2.value >= 0) offset2.value = -50
}, { immediate: true })
</script>

<template>
  <section class="marquee">
    <div class="marquee__border" />
    <div class="marquee__track">
      <div class="marquee__row" :style="{ transform: `translateX(${offset1}%)` }">
        <span v-for="n in 4" :key="`a-${n}`" class="marquee__item font-mono">{{ text }}</span>
      </div>
    </div>
    <div class="marquee__track">
      <div class="marquee__row marquee__row--reverse" :style="{ transform: `translateX(${offset2}%)` }">
        <span v-for="n in 4" :key="`b-${n}`" class="marquee__item font-mono">{{ text }}</span>
      </div>
    </div>
    <div class="marquee__border" />
  </section>
</template>

<style lang="scss" scoped>
.marquee {
  padding-block: $space-xl;
  overflow: hidden;

  &__border {
    height: 1px;
    background: $color-border;
  }

  &__track {
    overflow: hidden;
    padding-block: $space-md;
  }

  &__row {
    display: flex;
    white-space: nowrap;
    will-change: transform;
  }

  &__item {
    padding-inline: $space-xl;
    color: $color-text-muted;
    font-size: $text-sm;
  }
}
</style>
