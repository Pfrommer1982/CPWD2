<script setup lang="ts">
import type { Project, ProjectShowcase as ShowcaseData } from '~/data/projects'
import { getStatLabel } from '~/data/projects'

const props = defineProps<{
  project: Project
  showcase: ShowcaseData
}>()

const { locale, t } = useI18n()
const imageKit = useImageKit()
const pageRef = ref<HTMLElement>()
const heroMedia = ref<HTMLElement>()
const heroImg = ref<HTMLImageElement>()
const videoRef = ref<HTMLVideoElement>()

const taglineLines = computed(() =>
  locale.value === 'nl' ? props.showcase.tagline.nl : props.showcase.tagline.en,
)

const introText = computed(() =>
  locale.value === 'nl' ? props.showcase.intro.nl : props.showcase.intro.en,
)

onMounted(async () => {
  if (!import.meta.client || !pageRef.value) return

  const { createContext } = useGsap()
  await createContext(pageRef.value, async () => {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

    const { ScrollTrigger } = await import('gsap/ScrollTrigger')

    const heroTl = gsap.timeline({ delay: 0.15 })

    heroTl.from('.showcase-hero__line', {
      y: '120%',
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power4.out',
    })

    if (heroImg.value) {
      heroTl.from(heroImg.value, {
        scale: 1.08,
        opacity: 0,
        duration: 1.6,
        ease: 'power3.out',
      }, '-=0.8')
    }

    heroTl.from('.showcase-hero__meta, .showcase-hero__scroll', {
      opacity: 0,
      y: 24,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    }, '-=0.5')

    if (heroImg.value && heroMedia.value) {
      gsap.to(heroImg.value, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: heroMedia.value,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    gsap.utils.toArray<HTMLElement>('.reveal-item').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    gsap.utils.toArray<HTMLElement>('.reveal-block').forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: i * 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    gsap.utils.toArray<HTMLElement>('.device-shot').forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: i % 2 === 0 ? 80 : 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    if (videoRef.value) {
      ScrollTrigger.create({
        trigger: videoRef.value,
        start: 'top 80%',
        onEnter: () => { videoRef.value?.play().catch(() => {}) },
      })
    }

    await nextTick()
    await useLenis().refresh()
  })
})
</script>

<template>
  <div ref="pageRef" class="showcase" :style="{ '--project-accent': project.accentColor }">
    <section class="showcase-hero">
      <div ref="heroMedia" class="showcase-hero__media">
        <img
          ref="heroImg"
          :src="imageKit.responsive(project.heroImage, 1920)"
          :srcset="imageKit.srcset(project.heroImage)"
          :alt="project.title"
          sizes="100vw"
          fetchpriority="high"
          class="showcase-hero__img"
        >
        <div class="showcase-hero__vignette" />
        <div class="showcase-hero__grain" aria-hidden="true" />
      </div>

      <div class="showcase-hero__content container">
        <div class="showcase-hero__meta">
          <span class="label">{{ project.category }}</span>
          <span class="label showcase-hero__year">{{ project.year }}</span>
        </div>

        <h1 class="showcase-hero__title" aria-label="Accurate Black">
          <span
            v-for="(line, i) in taglineLines"
            :key="i"
            class="showcase-hero__line-wrap"
          >
            <span class="showcase-hero__line">{{ line }}</span>
          </span>
        </h1>
      </div>

      <div class="showcase-hero__scroll">
        <div class="showcase-hero__scroll-line" />
        <span class="label">Scroll</span>
      </div>
    </section>

    <section class="showcase-intro section">
      <div class="container showcase-intro__grid">
        <div class="showcase-intro__lead reveal-block">
          <span class="section-label">{{ project.title }}</span>
          <p class="showcase-intro__text">
            {{ introText }}
          </p>
        </div>

        <aside class="showcase-intro__aside reveal-block">
          <div class="showcase-intro__meta-item">
            <span class="label">{{ t('project.role') }}</span>
            <ul>
              <li v-for="role in project.role" :key="role">{{ role }}</li>
            </ul>
          </div>

          <div class="showcase-intro__meta-item">
            <span class="label">{{ t('project.technologies') }}</span>
            <div class="showcase-intro__tags">
              <span
                v-for="tech in project.technologies"
                :key="tech"
                class="showcase-intro__tag"
              >{{ tech }}</span>
            </div>
          </div>

          <div v-if="project.liveUrl" class="showcase-intro__meta-item">
            <span class="label">{{ t('project.live') }}</span>
            <a
              :href="project.liveUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="link-arrow"
            >
              {{ t('project.viewSite') }}
              <span class="arrow-icon">↗</span>
            </a>
          </div>
        </aside>
      </div>
    </section>

    <section class="showcase-devices section">
      <div class="container">
        <div
          v-for="(device, i) in showcase.devices"
          :key="device.src"
          class="device-shot"
          :class="{ 'device-shot--offset': i % 2 === 1 }"
        >
          <ProjectScreenshot
            :src="imageKit.screenshot(device.src, 1200)"
            :srcset="imageKit.srcsetScreenshot(device.src, [600, 900, 1200])"
            :alt="device.alt"
            sizes="(max-width: 768px) 100vw, 900px"
            fit="contain"
          />
        </div>
      </div>
    </section>

    <section
      v-for="group in showcase.imageGroups"
      :key="group.id"
      class="showcase-group section"
    >
      <div class="container">
        <div class="showcase-group__header reveal-block">
          <span class="section-label">{{ locale === 'nl' ? group.title.nl : group.title.en }}</span>
          <p class="showcase-group__body">
            {{ locale === 'nl' ? group.body.nl : group.body.en }}
          </p>
        </div>

        <ProjectImageGrid
          :images="group.images"
          :group-id="group.id"
        />
      </div>
    </section>

    <section class="showcase-video section">
      <div class="container">
        <div class="showcase-video__header reveal-block">
          <span class="section-label">
            {{ locale === 'nl' ? showcase.custom.title.nl : showcase.custom.title.en }}
          </span>
          <p class="showcase-video__body">
            {{ locale === 'nl' ? showcase.custom.body.nl : showcase.custom.body.en }}
          </p>
        </div>

        <div class="showcase-video__frame reveal-block">
          <video
            ref="videoRef"
            :src="imageKit.video(showcase.video.src)"
            :poster="showcase.video.poster ? imageKit.responsive(showcase.video.poster, 1200) : undefined"
            class="showcase-video__player"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
          />
          <div class="showcase-video__glow" aria-hidden="true" />
        </div>

        <p v-if="showcase.video.caption" class="showcase-video__caption">
          {{ locale === 'nl' ? showcase.video.caption.nl : showcase.video.caption.en }}
        </p>
      </div>
    </section>

    <section v-if="project.results?.length" class="showcase-results section">
      <div class="container">
        <div class="showcase-results__grid">
          <div
            v-for="stat in project.results"
            :key="getStatLabel(stat, locale)"
            class="showcase-results__stat reveal-block"
          >
            <div class="showcase-results__value">{{ stat.value }}</div>
            <div class="showcase-results__label">{{ getStatLabel(stat, locale) }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="showcase-stack section">
      <div class="container reveal-block">
        <span class="section-label">{{ t('project.technologies') }}</span>
        <ul class="showcase-stack__list">
          <li
            v-for="(tech, i) in showcase.stack"
            :key="tech"
            class="showcase-stack__item"
            :style="{ '--i': i }"
          >
            {{ tech }}
          </li>
        </ul>
      </div>
    </section>

    <section class="showcase-story section">
      <div class="container">
        <div class="showcase-story__grid">
          <div class="showcase-story__block reveal-block">
            <span class="section-label">{{ t('project.challenge') }}</span>
            <p class="showcase-story__text">
              {{ locale === 'nl' ? project.challenge.nl : project.challenge.en }}
            </p>
          </div>
          <div class="showcase-story__block reveal-block">
            <span class="section-label">{{ t('project.solution') }}</span>
            <p class="showcase-story__text">
              {{ locale === 'nl' ? project.solution.nl : project.solution.en }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="project.gallery.length" class="showcase-extra section">
      <div class="container">
        <span class="section-label reveal-block">{{ t('project.moreScreens') }}</span>
        <div class="showcase-extra__strip">
          <figure
            v-for="item in project.gallery"
            :key="item.src"
            class="showcase-extra__item reveal-item"
          >
            <ProjectScreenshot
              :src="imageKit.screenshot(item.src, 1400)"
              :alt="item.alt"
              fit="contain"
            />
            <figcaption class="showcase-extra__caption">{{ item.alt }}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.showcase-hero {
  position: relative;
  height: 100svh;
  min-height: 640px;
  overflow: hidden;
  background: $color-bg;

  &__media {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 112%;
    object-fit: cover;
    object-position: center 20%;
    will-change: transform;
  }

  &__vignette {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 100%, rgba(8, 8, 8, 0.95) 0%, transparent 70%),
      linear-gradient(to bottom, rgba(8, 8, 8, 0.35) 0%, rgba(8, 8, 8, 0.85) 100%);
  }

  &__grain {
    position: absolute;
    inset: 0;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  &__content {
    position: absolute;
    bottom: clamp(48px, 8vh, 96px);
    left: 0;
    right: 0;
  }

  &__meta {
    display: flex;
    gap: $space-6;
    margin-bottom: $space-5;
    color: $color-gold;
  }

  &__year {
    color: $color-text-muted;
  }

  &__title {
    font-family: $font-display;
    font-size: clamp(2.5rem, 5vw + 1rem, 6rem);
    font-weight: 300;
    line-height: 0.92;
    letter-spacing: $tracking-tight;
    color: $color-text;
    max-width: 14ch;
  }

  &__line-wrap {
    display: block;
    overflow: hidden;
    padding-bottom: 0.08em;
  }

  &__line {
    display: block;
  }

  &__scroll {
    position: absolute;
    bottom: $space-8;
    right: clamp(20px, 4vw, 60px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
    color: $color-text-faint;
  }

  &__scroll-line {
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, $color-gold, transparent);
    animation: scroll-bounce 2.5s ease-in-out infinite;
  }
}

.showcase-intro {
  border-bottom: 1px solid $color-border;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: $space-10;
    align-items: start;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  &__text {
    font-family: $font-display;
    font-size: $text-2xl;
    font-weight: 300;
    line-height: $leading-snug;
    color: $color-text-muted;
    margin-top: $space-5;
    max-width: 52ch;
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: $space-6;
    padding-top: $space-2;

    ul {
      list-style: none;
      margin-top: $space-2;
    }

    li {
      font-size: $text-sm;
      color: $color-text;
      line-height: $leading-relaxed;
    }
  }

  &__meta-item .label {
    display: block;
    margin-bottom: $space-2;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    margin-top: $space-2;
  }

  &__tag {
    padding: 4px 10px;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-family: $font-mono;
    font-size: $text-xs;
    color: $color-text-muted;
    letter-spacing: $tracking-wide;
  }
}

.showcase-devices {
  padding-block: $space-16;

  .container {
    display: flex;
    flex-direction: column;
    gap: $space-10;
    align-items: center;
  }
}

.device-shot {
  width: min(900px, 100%);
  filter: drop-shadow(0 32px 64px rgba(0, 0, 0, 0.45));

  &--offset {
    @media (min-width: 768px) {
      margin-left: auto;
      margin-right: clamp(0px, 8vw, 80px);
    }
  }
}

.showcase-group {
  &__header {
    max-width: 640px;
    margin-bottom: $space-8;
  }

  &__body {
    font-size: $text-base;
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin-top: $space-5;
  }

  & + & {
    padding-top: 0;
  }
}

.showcase-video {
  &__header {
    max-width: 640px;
    margin-bottom: $space-8;
  }

  &__body {
    font-size: $text-base;
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin-top: $space-5;
  }

  &__frame {
    position: relative;
    border-radius: $radius-md;
    overflow: hidden;
    border: 1px solid $color-border;
    background: $color-surface;
    aspect-ratio: 16 / 9;
  }

  &__player {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__glow {
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    box-shadow: inset 0 0 80px rgba(212, 175, 83, 0.06);
    pointer-events: none;
  }

  &__caption {
    margin-top: $space-4;
    text-align: center;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
  }
}

.showcase-results {
  background: $color-bg-alt;
  border-block: 1px solid $color-border;

  &__grid {
    display: flex;
    gap: $space-10;
    flex-wrap: wrap;
  }

  &__stat {
    flex: 1;
    min-width: 140px;
  }

  &__value {
    font-family: $font-display;
    font-size: $text-3xl;
    font-weight: 300;
    color: var(--project-accent, #{$color-gold});
    line-height: 1;
  }

  &__label {
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-muted;
    margin-top: $space-2;
  }
}

.showcase-stack {
  border-bottom: 1px solid $color-border;

  &__list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
    margin-top: $space-6;
  }

  &__item {
    padding: $space-3 $space-5;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-family: $font-mono;
    font-size: $text-sm;
    letter-spacing: $tracking-wide;
    color: $color-text;
    transition: border-color $dur-fast $ease-gold, color $dur-fast $ease-gold;

    &:hover {
      border-color: $color-gold;
      color: $color-gold;
    }
  }
}

.showcase-story {
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-10;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__block {
    border-top: 1px solid $color-border;
    padding-top: $space-5;
  }

  &__text {
    font-size: $text-base;
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin-top: $space-5;
  }
}

.showcase-extra {
  &__strip {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    margin-top: $space-8;
  }

  &__item {
    margin: 0;
    overflow: visible;
    background: transparent;
  }

  &__caption {
    padding: $space-3 $space-4;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
    text-align: center;
  }
}
</style>
