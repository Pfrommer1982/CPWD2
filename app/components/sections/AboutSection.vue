<script setup lang="ts">
const about = useSectionTranslations('about')
const localePath = useLocalePath()
const sectionRef = ref<HTMLElement | null>(null)

const outlineBody = computed(() => about.t('body').replace(/\*/g, ''))

const stats = [
  { value: 5, suffix: '+', key: 'years' },
  { value: 30, suffix: '+', key: 'projects' },
  { value: 12, suffix: '', key: 'clients' },
]

const statRefs = ref<HTMLElement[]>([])

onMounted(async () => {
  if (!sectionRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  statRefs.value.forEach((el, i) => {
    const target = stats[i]
    if (!el || !target) return

    const obj = { val: 0 }
    gsap.to(obj, {
      val: target.value,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      onUpdate: () => {
        el.textContent = `${Math.round(obj.val)}${target.suffix}`
      },
    })
  })
})
</script>

<template>
  <section ref="sectionRef" class="about-section">
    <div class="about-section__grid">
      <div class="about-section__text">
        <span class="section-label">{{ about.t('label') }}</span>
        <ProjectOutlineText
          :text="about.t('heading')"
          tag="h2"
          size="display"
          class="about-section__heading"
        />
        <ProjectOutlineText
          :text="outlineBody"
          tag="p"
          size="body"
          scroll-start="top 88%"
          scroll-end="top 40%"
          class="about-section__body"
        />
        <GsapMagneticButton :to="localePath('/about')" variant="ghost" class="about-section__cta">
          {{ about.t('cta') }}
        </GsapMagneticButton>
      </div>

      <div class="about-section__visual">
        <ClientOnly>
          <ThreeFloatingGeometry />
        </ClientOnly>
      </div>
    </div>

    <div class="about-section__stats">
      <div v-for="(stat, i) in stats" :key="stat.key" class="about-section__stat">
        <span :ref="el => { if (el) statRefs[i] = el as HTMLElement }" class="about-section__stat-value font-display">0</span>
        <span class="about-section__stat-label font-mono">{{ about.t(`stats.${stat.key}`) }}</span>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.about-section {
  @include container;
  padding-block: $space-4xl;

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $space-3xl;
    margin-bottom: $space-3xl;

    @media (min-width: 900px) {
      grid-template-columns: 1fr 1fr;
      align-items: center;
    }
  }

  &__heading {
    margin-bottom: $space-xl;
  }

  &__body {
    margin-bottom: $space-xl;
  }

  &__visual {
    position: relative;
    min-height: 400px;
    background: $color-surface;
    border-radius: $border-radius-md;
    overflow: hidden;
    border: 1px solid $color-border;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $grid-gutter;
    padding-top: $space-2xl;
    border-top: 1px solid $color-border;
  }

  &__stat {
    text-align: center;
  }

  &__stat-value {
    display: block;
    font-size: $text-3xl;
    color: $color-accent;
    margin-bottom: $space-sm;
  }

  &__stat-label {
    color: $color-text-muted;
    font-size: $text-xs;
  }
}
</style>
