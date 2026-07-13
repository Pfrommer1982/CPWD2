<script setup lang="ts">
const hero = useSectionTranslations('hero')
const localePath = useLocalePath()

const sectionRef = ref<HTMLElement | null>(null)
const globeRef = ref<{ beginHudIntro: () => void } | null>(null)
const labelEl = ref<HTMLElement>()
const bottomEl = ref<HTMLElement>()
const scrollEl = ref<HTMLElement>()
const globeScrollProgress = ref(0)

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

  const label = labelEl.value
  const bottom = bottomEl.value
  const scroll = scrollEl.value
  if (!label || !bottom || !scroll) return

  const tl = gsap.timeline({ delay: 0.5 })

  tl.from(label, {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power3.out',
  })
    .from('.hero__line', {
      y: 80,
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power4.out',
    }, '-=0.4')
    .from(bottom, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.5')
    .from(scroll, {
      opacity: 0,
      duration: 0.6,
    }, '-=0.3')
    .from('.hero-globe', {
      opacity: 0,
      x: 48,
      duration: 1.4,
      ease: 'power3.out',
      onStart: startHudIntro,
    }, '-=1.1')
})
</script>

<template>
  <section ref="sectionRef" class="hero section--hero">
    <HeroGlobe ref="globeRef" :scroll-progress="globeScrollProgress" />

    <div class="hero__noise" />

    <div class="container hero__shell">
      <div class="hero__content copy-width">
        <p ref="labelEl" class="hero__label section-label">
          CPWD
        </p>

        <h1 class="hero__headline">
          <span class="hero__line hero__line--body">{{ hero.t('line1') }}</span>
          <span class="hero__line hero__line--display"><em>{{ hero.t('line2') }}</em></span>
          <span class="hero__line hero__line--body">{{ hero.t('line3') }}</span>
        </h1>

        <div ref="bottomEl" class="hero__bottom">
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

    <div ref="scrollEl" class="hero__scroll">
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
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: $space-12;
  }

  &__line {
    display: block;
    overflow: hidden;

    &--body {
      font-family: $font-body;
      font-size: clamp(1.35rem, 1.1rem + 1.4vw, 2.25rem);
      font-weight: 400;
      letter-spacing: 0.02em;
      color: $color-text-muted;
      line-height: 1.15;
    }

    &--display {
      font-family: $font-display;
      font-size: clamp(2.4rem, 1.85rem + 3.2vw, 4.75rem);
      font-weight: 600;
      line-height: 0.98;
      letter-spacing: 0.04em;
      color: $color-text;

      em {
        font-style: normal;
        color: $color-gold-light;
      }
    }
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
