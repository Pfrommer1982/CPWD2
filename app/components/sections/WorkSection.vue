<script setup lang="ts">
import { getFeaturedProjects } from '~/data/projects'

const { locale } = useI18n()
const work = useSectionTranslations('work')
const localePath = useLocalePath()
const imageKit = useImageKit()
const { animateMotion } = useGraphicsCapability()
const projects = getFeaturedProjects()
const gridRef = ref<HTMLElement | null>(null)

function badgeLabel(badge: { nl: string; en: string }) {
  return locale.value === 'nl' ? badge.nl : badge.en
}

let animationCtx: ReturnType<typeof import('gsap').gsap.context> | null = null

onMounted(async () => {
  if (!import.meta.client || !gridRef.value) return

  // Reduced-motion / no-JS-friendly: keep cards visible. Never leave them stuck at opacity 0.
  if (!animateMotion.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap || !gridRef.value) return

  const cases = gridRef.value.querySelectorAll<HTMLElement>('.work-case')
  if (!cases.length) return

  animationCtx = gsap.context(() => {
    cases.forEach((caseEl) => {
      const copy = caseEl.querySelector<HTMLElement>('.work-case__copy')
      const media = caseEl.querySelector<HTMLElement>('.work-case__media')
      const image = caseEl.querySelector<HTMLElement>('.work-case__image')
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: caseEl,
          start: 'top 92%',
          once: true,
          toggleActions: 'play none none none',
        },
      })

      if (copy) {
        timeline.from(copy, {
          y: 42,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }, 0)
      }

      if (media) {
        timeline.from(media, {
          clipPath: 'inset(8% 0 8% 0)',
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          clearProps: 'clip-path,opacity',
        }, 0.08)
      }

      if (image) {
        timeline.from(image, {
          scale: 1.035,
          duration: 1.35,
          ease: 'power3.out',
          clearProps: 'transform',
        }, 0.08)
      }
    })
  }, gridRef.value)

  await nextTick()
  await useLenis().refresh()
})

onUnmounted(() => {
  animationCtx?.revert()
  animationCtx = null
})
</script>

<template>
  <section class="work-section section">
    <div class="work-section__header container">
      <p class="section-label">
        {{ work.t('label') }}
      </p>
      <ProjectOutlineText
        :text="work.t('heading')"
        tag="h2"
        size="display"
        class="work-section__heading"
      />
    </div>

    <div ref="gridRef" class="work-section__reel container container--wide">
      <article
        v-for="(project, index) in projects"
        :key="project.slug"
        class="work-section__chapter"
      >
        <NuxtLink
          :to="localePath(`/work/${project.slug}`)"
          class="work-case"
          :class="{ 'work-case--reverse': index % 2 === 1 }"
          :style="{ '--work-accent': project.accentColor }"
          :aria-label="`${work.t('viewProject')}: ${project.title}`"
          data-cursor="view"
        >
          <div class="work-case__copy">
            <div class="work-case__chapter-mark font-mono" aria-hidden="true">
              <span class="work-case__index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="work-case__rule" />
            </div>

            <div class="work-case__meta font-mono">
              <span>{{ project.category }}</span>
              <span>{{ project.year }}</span>
            </div>

            <h3 class="work-case__title">
              {{ project.title }}
            </h3>

            <p class="work-case__subtitle">
              {{ project.subtitle }}
            </p>

            <span class="work-case__cta font-mono">
              {{ work.t('viewProject') }}
              <span class="work-case__cta-line" aria-hidden="true" />
              <span class="work-case__arrow" aria-hidden="true">→</span>
            </span>
          </div>

          <div class="work-case__media">
            <img
              :src="imageKit.thumbnail(project.heroImage || project.thumbnail, 1200, 800)"
              :srcset="imageKit.srcset(project.heroImage || project.thumbnail)"
              :alt="project.title"
              sizes="(max-width: 767px) calc(100vw - 40px), 68vw"
              loading="lazy"
              class="work-case__image"
            >
            <span
              v-if="project.badge"
              class="work-case__badge font-mono"
            >{{ badgeLabel(project.badge) }}</span>
          </div>
        </NuxtLink>
      </article>
    </div>

    <div class="work-section__footer container">
      <NuxtLink :to="localePath('/work')" class="link-arrow" data-cursor="view">
        {{ work.t('viewAll') }}
        <span class="arrow-icon">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.work-section {
  &__header {
    margin-bottom: $space-10;
  }

  &__heading {
    max-width: 14ch;
  }

  &__reel {
    display: flex;
    flex-direction: column;
    gap: clamp(88px, 13vw, 176px);
  }

  &__footer {
    margin-top: $space-10;
    text-align: center;

    // Match section secondary type (outline heading / card meta), not primary CTA white.
    .link-arrow {
      color: $color-text-muted;

      &:hover {
        color: $color-gold;
      }
    }
  }
}

.work-case {
  --work-accent: #{$color-gold};

  display: grid;
  grid-template-columns: minmax(240px, 4fr) minmax(0, 8fr);
  grid-template-areas: 'copy media';
  align-items: center;
  gap: clamp(40px, 6vw, 96px);
  color: $color-text;
  text-decoration: none;

  &--reverse {
    grid-template-columns: minmax(0, 8fr) minmax(240px, 4fr);
    grid-template-areas: 'media copy';
  }

  &__copy {
    grid-area: copy;
    position: relative;
    z-index: 2;
    min-width: 0;
  }

  &__chapter-mark {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin-bottom: clamp($space-5, 4vw, $space-8);
    color: var(--work-accent);
  }

  &__index {
    font-size: $text-sm;
    letter-spacing: $tracking-widest;
  }

  &__rule {
    display: block;
    width: clamp(32px, 5vw, 72px);
    height: 1px;
    background: var(--work-accent);
    transform-origin: left;
    transition: transform $dur-med $ease-out-expo;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3 $space-5;
    margin-bottom: $space-4;
    color: $color-text-muted;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
  }

  &__title {
    margin: 0;
    font-family: $font-display;
    font-size: clamp(3rem, 4.2vw + 0.4rem, 5.25rem);
    font-weight: 300;
    line-height: 0.92;
    letter-spacing: $tracking-tight;
    color: $color-text;
  }

  &__subtitle {
    max-width: 38ch;
    margin-top: $space-5;
    color: $color-text-muted;
    font-size: $text-base;
    line-height: $leading-relaxed;
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    gap: $space-3;
    margin-top: $space-6;
    color: $color-text;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
  }

  &__cta-line {
    width: 32px;
    height: 1px;
    background: var(--work-accent);
    transform-origin: left;
    transition: transform $dur-med $ease-out-expo;
  }

  &__arrow {
    color: var(--work-accent);
    transition: transform $dur-med $ease-out-expo;
  }

  &__media {
    grid-area: media;
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    border: 1px solid $color-border;
    background: $color-bg-alt;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $dur-xslow $ease-out-expo;
  }

  &__badge {
    position: absolute;
    top: $space-4;
    left: $space-4;
    z-index: 2;
    padding: 8px 14px;
    border: 1px solid rgba(56, 150, 90, 0.55);
    border-radius: $radius-sm;
    background: rgba(10, 16, 12, 0.92);
    box-shadow: 0 0 0 1px rgba(5, 8, 7, 0.45), 0 8px 24px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(12px);
    color: $color-gold-light;
    font-size: $text-sm;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    line-height: 1.2;
    font-weight: 500;
    pointer-events: none;
  }

  &:hover &__image,
  &:focus-visible &__image {
    transform: scale(1.025);
  }

  &:hover &__rule,
  &:focus-visible &__rule,
  &:hover &__cta-line,
  &:focus-visible &__cta-line {
    transform: scaleX(1.25);
  }

  &:hover &__arrow,
  &:focus-visible &__arrow {
    transform: translateX(5px);
  }

  &:focus-visible {
    outline: 1px solid var(--work-accent);
    outline-offset: 12px;
  }

  @media (max-width: 899px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'copy'
      'media';
    gap: $space-6;

    &--reverse {
      grid-template-columns: 1fr;
      grid-template-areas:
        'copy'
        'media';
    }

    &__title {
      font-size: clamp(2.4rem, 11vw, 3.75rem);
    }

    &__subtitle {
      margin-top: $space-4;
    }

    &__media {
      aspect-ratio: 4 / 3;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__image,
    &__rule,
    &__cta-line,
    &__arrow {
      transition: none;
    }
  }
}
</style>
