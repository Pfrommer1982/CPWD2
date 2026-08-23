<script setup lang="ts">
const hero = useSectionTranslations('hero')
const localePath = useLocalePath()

const sectionRef = ref<HTMLElement | null>(null)
const globeRef = ref<{ beginHudIntro: () => void } | null>(null)
const globeScrollProgress = ref(0)

const headlineLines = computed(() => [
  hero.t('line1'),
  { text: hero.t('line2'), accent: true },
  hero.t('line3'),
])

useHeroGlobeScroll(globeScrollProgress, sectionRef)

function startHudIntro() {
  if (globeRef.value) {
    globeRef.value.beginHudIntro()
    return
  }
  requestAnimationFrame(startHudIntro)
}

onMounted(async () => {
  if (!import.meta.client) return
  const { animateMotion } = useGraphicsCapability()
  if (!animateMotion.value) return

  const { gsap } = await import('gsap')

  gsap.from('.hero-globe', {
    opacity: 0,
    x: 48,
    duration: 1.4,
    delay: 0.35,
    ease: 'power3.out',
    onStart: startHudIntro,
  })
})
</script>

<template>
  <section ref="sectionRef" class="hero section--hero" data-page-hero>
    <HeroGlobe ref="globeRef" :scroll-progress="globeScrollProgress" />

    <div class="hero__noise" />

    <div class="container hero__shell">
      <div class="hero__content copy-width">
        <p class="hero__label section-label" data-hero-fade>
          CPWD
        </p>

        <UiStaggeredHeroTitle
          :lines="headlineLines"
          class="hero__headline"
        />

        <div class="hero__bottom" data-hero-fade>
          <NuxtLink :to="localePath('/work')" class="link-arrow" data-cursor="view">
            {{ hero.t('cta') }}
            <span class="arrow-icon">→</span>
          </NuxtLink>

          <p class="hero__sub">
            {{ hero.t('locationBefore') }}
            <span class="text-gold">{{ hero.t('locationPlace') }}</span>,
            {{ hero.t('locationAfter') }}
          </p>
        </div>
      </div>
    </div>

    <div class="hero__scroll" data-hero-fade>
      <div class="hero__scroll-line" />
      <span class="label">Scroll</span>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background: $color-bg;

  &__noise {
    position: absolute;
    inset: 0;
    z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.5;
  }

  &__shell {
    position: relative;
    z-index: $z-raised;
  }

  &__content {
    position: relative;
    padding-top: 120px;
    padding-bottom: 80px;
  }

  &__headline,
  &__bottom,
  &__label {
    text-shadow:
      0 2px 18px rgba(0, 0, 0, 0.55),
      0 0 32px rgba(8, 8, 8, 0.4);
  }

  &__label {
    margin-bottom: $space-8;
  }

  &__headline {
    font-size: clamp(2.6rem, 5vw + 0.4rem, 5.4rem);
    margin-bottom: $space-12;
  }

  &__bottom {
    display: flex;
    align-items: center;
    gap: $space-10;
    flex-wrap: wrap;
  }

  &__sub {
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
  }

  &__scroll {
    position: absolute;
    bottom: $space-8;
    left: 50%;
    transform: translateX(-50%);
    z-index: $z-raised;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
  }

  &__scroll-line {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, $color-gold, transparent);
    animation: scroll-bounce 2s ease-in-out infinite;
  }
}
</style>
