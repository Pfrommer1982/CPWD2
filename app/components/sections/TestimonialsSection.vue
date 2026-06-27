<script setup lang="ts">
import { localeList, resolveLocaleMessage } from '~/utils/i18n'

defineProps<{
  testimonials?: Array<{ quote: string, author: string, role: string }>
}>()

const common = useSectionTranslations('common.testimonials')

const items = computed(() => {
  const raw = common.tm('items')
  return localeList<Record<string, unknown>>(raw).map(item => ({
    quote: resolveLocaleMessage(item.quote, common.rt),
    author: resolveLocaleMessage(item.author, common.rt),
    role: resolveLocaleMessage(item.role, common.rt),
  }))
})
</script>

<template>
  <section class="testimonials-section">
    <div class="testimonials-section__inner">
      <div
        v-for="item in items"
        :key="item.author"
        class="testimonials-section__item"
      >
        <blockquote class="testimonials-section__quote font-display">
          "{{ item.quote }}"
        </blockquote>
        <cite class="testimonials-section__author font-mono">
          {{ item.author }}{{ common.t('authorSeparator') }}{{ item.role }}
        </cite>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.testimonials-section {
  @include container;
  padding-block: $space-3xl;
  border-block: 1px solid $color-border;

  &__inner {
    display: grid;
    gap: $space-2xl;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__quote {
    font-size: $text-xl;
    line-height: 1.4;
    margin-bottom: $space-lg;
    font-style: italic;
  }

  &__author {
    color: $color-text-muted;
    font-style: normal;
    font-size: $text-xs;
  }
}
</style>
