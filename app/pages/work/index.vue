<script setup lang="ts">
import { projects } from '~/data/projects'

definePageMeta({ layout: 'default' })

const work = useSectionTranslations('work')
const seo = useSectionTranslations('seo')
const localePath = useLocalePath()

useSeo(computed(() => ({
  title: seo.t('work.title'),
  description: seo.t('work.description'),
})))

const sortedProjects = computed(() =>
  [...projects].sort((a, b) => a.order - b.order),
)

const heroRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!import.meta.client || !heroRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroRef.value,
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
  })

  tl.from(heroRef.value.querySelector('.work-hero__label'), {
    y: 16,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
  })
    .from(heroRef.value.querySelector('.work-hero__title'), {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, '-=0.45')
    .from(heroRef.value.querySelector('.work-hero__intro'), {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.55')
})
</script>

<template>
  <div class="work-page">
    <section ref="heroRef" class="work-hero section">
      <div class="work-hero__backdrop" aria-hidden="true">
        <div class="work-hero__grid" />
        <div class="work-hero__glow" />
      </div>

      <div class="container work-hero__inner">
        <span class="section-label work-hero__label">{{ work.t('label') }}</span>
        <h1 class="work-hero__title font-display">
          {{ work.t('heading') }}
        </h1>
        <p class="work-hero__intro copy-width">
          {{ work.t('intro') }}
        </p>
      </div>
    </section>

    <WorkIndexExplorer :projects="sortedProjects" />

    <section class="work-cta section">
      <div class="container work-cta__inner">
        <div class="work-cta__copy">
          <span class="section-label">LOCK IN</span>
          <h2 class="work-cta__title font-display">
            {{ work.t('cta.heading') }}
          </h2>
          <p class="work-cta__body">
            {{ work.t('cta.body') }}
          </p>
        </div>
        <GsapMagneticButton :to="localePath('/contact')" variant="primary">
          {{ work.t('cta.button') }}
        </GsapMagneticButton>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.work-page {
  position: relative;
  z-index: 2;
  padding-top: 100px;
}

.work-hero {
  position: relative;
  padding-bottom: $space-10;
  overflow: hidden;

  &__backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__grid {
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image:
      linear-gradient(rgba($color-gold, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba($color-gold, 0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 92%);
  }

  &__glow {
    position: absolute;
    top: -20%;
    right: -10%;
    width: min(48vw, 420px);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($color-gold, 0.12), transparent 68%);
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__title {
    margin-top: $space-5;
    font-size: clamp(3rem, 2rem + 5vw, 6rem);
    font-weight: 500;
    letter-spacing: $tracking-tight;
    line-height: 0.95;
    max-width: 12ch;
  }

  &__intro {
    margin-top: $space-6;
    font-size: $text-lg;
    line-height: $leading-relaxed;
    color: $color-text-muted;
  }
}

.work-cta {
  padding-bottom: $space-20;

  &__inner {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: $space-8;
    padding: $space-8;
    border: 1px solid $color-border;
    background:
      linear-gradient(135deg, rgba($color-gold, 0.05), transparent 42%),
      rgba($color-surface, 0.55);

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__title {
    margin-top: $space-4;
    font-size: $text-2xl;
    font-weight: 500;
    max-width: 16ch;
  }

  &__body {
    margin-top: $space-3;
    max-width: 42ch;
    color: $color-text-muted;
    line-height: $leading-relaxed;
  }
}
</style>
