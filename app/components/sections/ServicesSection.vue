<script setup lang="ts">
const { t, tm } = useI18n()
const sectionRef = ref<HTMLElement | null>(null)
const activeIndex = ref<number | null>(null)

const items = computed(() => tm('services.items') as Array<{
  number: string
  title: string
  desc: string
}>)

onMounted(async () => {
  if (!sectionRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  gsap.from(sectionRef.value.querySelectorAll('.services-section__item'), {
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  })
})
</script>

<template>
  <section ref="sectionRef" class="services-section">
    <div class="services-section__header">
      <span class="services-section__label font-mono">{{ t('services.label') }}</span>
      <h2 class="services-section__heading font-display">
        {{ t('services.heading') }}
      </h2>
    </div>

    <div class="services-section__list">
      <div
        v-for="(item, index) in items"
        :key="item.number"
        class="services-section__item"
        :class="{
          'services-section__item--active': activeIndex === index,
          'services-section__item--dimmed': activeIndex !== null && activeIndex !== index,
        }"
        @mouseenter="activeIndex = index"
        @mouseleave="activeIndex = null"
      >
        <span class="services-section__number font-mono">{{ item.number }}</span>
        <div class="services-section__content">
          <h3 class="services-section__title">{{ item.title }}</h3>
          <p class="services-section__desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.services-section {
  @include container;
  padding-block: $space-4xl;

  &__header {
    margin-bottom: $space-3xl;
  }

  &__label {
    display: block;
    color: $color-accent;
    margin-bottom: $space-md;
  }

  &__heading {
    font-size: $text-3xl;
  }

  &__list {
    border-top: 1px solid $color-border;
  }

  &__item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: $space-xl;
    padding: $space-xl 0;
    border-bottom: 1px solid $color-border;
    opacity: 1;
    transition: opacity $duration-med $ease-out-expo;

    &--dimmed {
      opacity: 0.3;
    }

    &--active {
      opacity: 1;
    }
  }

  &__number {
    color: $color-text-muted;
    font-size: $text-sm;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-xl;
    margin-bottom: $space-sm;
    transition: color $duration-fast $ease-out-expo;
  }

  &__item--active &__title {
    color: $color-accent;
  }

  &__desc {
    color: $color-text-muted;
    max-width: 50ch;
    line-height: 1.6;
  }
}
</style>
