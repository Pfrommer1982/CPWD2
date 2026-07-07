<script setup lang="ts">
import type { Project, ProjectShowcase as ShowcaseData } from '~/data/projects'
import { getStatLabel } from '~/data/projects'

const props = defineProps<{
  project: Project
  showcase: ShowcaseData
}>()

const { locale } = useI18n()
const projectI18n = useSectionTranslations('project')
const imageKit = useImageKit()
const pageRef = ref<HTMLElement>()
const heroMedia = ref<HTMLElement>()
const heroClip = ref<HTMLElement>()
const heroInner = ref<HTMLElement>()

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const taglineLines = computed(() =>
  locale.value === 'nl' ? props.showcase.tagline.nl : props.showcase.tagline.en,
)

const introText = computed(() =>
  locale.value === 'nl' ? props.showcase.intro.nl : props.showcase.intro.en,
)

const videoTitle = computed(() => {
  const video = props.showcase.video
  if (video.title) return locale.value === 'nl' ? video.title.nl : video.title.en
  return locale.value === 'nl' ? props.showcase.custom.title.nl : props.showcase.custom.title.en
})

const videoBody = computed(() => {
  const video = props.showcase.video
  if (video.body) return locale.value === 'nl' ? video.body.nl : video.body.en
  return locale.value === 'nl' ? props.showcase.custom.body.nl : props.showcase.custom.body.en
})

const videoCaption = computed(() => {
  const caption = props.showcase.video.caption
  if (!caption) return undefined
  return locale.value === 'nl' ? caption.nl : caption.en
})

const lightboxImages = computed(() => {
  const fromGroups = props.showcase.imageGroups.flatMap(g => g.images)
  const fromGallery = props.project.gallery.map(item => ({
    src: item.src,
    alt: item.alt,
  }))
  return [...fromGroups, ...fromGallery].map(img => ({
    ...img,
    url: imageKit.screenshot(img.src, 1800),
  }))
})

function openLightbox(src: string) {
  const idx = lightboxImages.value.findIndex(img => img.src === src)
  if (idx === -1) return
  lightboxIndex.value = idx
  lightboxOpen.value = true
}

onMounted(async () => {
  if (!import.meta.client || !pageRef.value) return

  const { createContext } = useGsap()
  await createContext(pageRef.value, async () => {
    const page = pageRef.value
    if (!page) return

    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

    const { ScrollTrigger } = await import('gsap/ScrollTrigger')

    const heroTl = gsap.timeline({ delay: 0.08 })

    if (heroClip.value) {
      heroTl.from(heroClip.value, {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.5,
        ease: 'power4.out',
      })
    }

    heroTl.from('.showcase-hero__line', {
      y: '120%',
      opacity: 0,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power4.out',
    }, '-=0.85')

    heroTl.from('.showcase-hero__meta, .showcase-hero__scroll', {
      opacity: 0,
      y: 28,
      duration: 0.85,
      stagger: 0.12,
      ease: 'power3.out',
    }, '-=0.55')

    if (heroInner.value && heroMedia.value) {
      gsap.to(heroInner.value, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: heroMedia.value,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    gsap.utils.toArray<HTMLElement>('.overview-reveal').forEach((el, i) => {
      gsap.from(el, {
        y: 48,
        opacity: 0,
        duration: 1,
        delay: i * 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      })
    })

    gsap.utils.toArray<HTMLElement>('.device-reveal').forEach((el, i) => {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: i * 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      })
    })

    gsap.utils.toArray<HTMLElement>('.gallery-tile__clip').forEach((clip, i) => {
      gsap.fromTo(
        clip,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1,
          delay: (i % 2) * 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: clip,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    const videoMedia = page.querySelector('.project-video__media')
    if (videoMedia) {
      gsap.fromTo(
        videoMedia,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: videoMedia,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        },
      )
    }

    gsap.utils.toArray<HTMLElement>('.showcase-results__stat').forEach((el, i) => {
      gsap.from(el, {
        y: 36,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      })
    })

    await nextTick()
    await useLenis().refresh()
  })
})
</script>

<template>
  <div ref="pageRef" class="showcase" :style="{ '--project-accent': project.accentColor }">
    <section class="showcase-hero">
      <div ref="heroMedia" class="showcase-hero__media">
        <div ref="heroClip" class="showcase-hero__clip">
          <div ref="heroInner" class="showcase-hero__inner">
            <img
              :src="imageKit.responsive(project.heroImage, 1920)"
              :srcset="imageKit.srcset(project.heroImage)"
              :alt="project.title"
              sizes="100vw"
              fetchpriority="high"
              class="showcase-hero__img"
            >
          </div>
        </div>
        <div class="showcase-hero__vignette" />
        <div class="showcase-hero__grain" aria-hidden="true" />
      </div>

      <div class="showcase-hero__content container">
        <div class="showcase-hero__meta">
          <span class="label">{{ project.category }}</span>
          <span class="label showcase-hero__year">{{ project.year }}</span>
        </div>

        <h1 class="showcase-hero__title" :aria-label="project.title">
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

    <section class="showcase-video showcase-video--hero section">
      <div class="container showcase-video__head-wrap">
        <div class="showcase-video__head">
          <span class="section-label">{{ videoTitle }}</span>
          <ProjectOutlineText
            :text="videoBody"
            size="display"
          />
        </div>
      </div>

      <div class="showcase-video__stage">
        <ProjectVideoPlayer
          large
          :src="showcase.video.src"
          :poster="showcase.video.poster"
          :caption="videoCaption"
          :accent-color="project.accentColor"
        />
      </div>
    </section>

    <section class="showcase-overview section">
      <div class="container">
        <p class="showcase-overview__eyebrow overview-reveal section-label">
          {{ projectI18n.t('overview') }}
        </p>
        <h2 class="showcase-overview__title overview-reveal">
          {{ project.title }}
        </h2>

        <div class="showcase-overview__grid">
          <div class="showcase-overview__col overview-reveal">
            <span class="label showcase-overview__key">• {{ projectI18n.t('role') }}</span>
            <ul class="showcase-overview__list">
              <li v-for="role in project.role" :key="role">{{ role }}</li>
            </ul>
          </div>

          <div class="showcase-overview__col overview-reveal">
            <span class="label showcase-overview__key">• {{ projectI18n.t('year') }}</span>
            <p class="showcase-overview__value">{{ project.year }}</p>
          </div>

          <div class="showcase-overview__col showcase-overview__col--wide overview-reveal">
            <span class="label showcase-overview__key">• {{ projectI18n.t('note') }}</span>
            <ProjectOutlineText
              :text="introText"
              size="body"
              scroll-start="top 90%"
              scroll-end="top 50%"
            />
          </div>

          <div v-if="project.liveUrl" class="showcase-overview__col overview-reveal">
            <span class="label showcase-overview__key">• {{ projectI18n.t('live') }}</span>
            <a
              :href="project.liveUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="link-arrow showcase-overview__link"
            >
              {{ projectI18n.t('viewSite') }}
              <span class="arrow-icon">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="showcase-devices section">
      <div class="container showcase-devices__stack">
        <figure
          v-for="device in showcase.devices"
          :key="device.src"
          class="showcase-devices__item device-reveal"
        >
          <ProjectScreenshot
            :src="imageKit.screenshot(device.src, 1200)"
            :srcset="imageKit.srcsetScreenshot(device.src, [600, 900, 1200])"
            :alt="device.alt"
            sizes="(max-width: 768px) 100vw, 760px"
            fit="contain"
          />
        </figure>
      </div>
    </section>

    <section
      v-for="group in showcase.imageGroups"
      :key="group.id"
      class="showcase-chapter section"
    >
      <div class="container showcase-chapter__head">
        <span class="section-label">
          {{ locale === 'nl' ? group.title.nl : group.title.en }}
        </span>
        <ProjectOutlineText
          :text="locale === 'nl' ? group.body.nl : group.body.en"
          size="display"
        />
      </div>

      <div class="container">
        <div class="showcase-chapter__grid">
          <button
            v-for="image in group.images"
            :key="image.src"
            type="button"
            class="gallery-tile"
            @click="openLightbox(image.src)"
          >
            <div class="gallery-tile__clip">
              <ProjectScreenshot
                :src="imageKit.screenshot(image.src, 900)"
                :srcset="imageKit.srcsetScreenshot(image.src, [500, 900, 1400])"
                :alt="image.alt"
                sizes="(max-width: 640px) 100vw, 50vw"
                fit="cover"
              />
            </div>
            <span class="gallery-tile__label">{{ image.alt }}</span>
          </button>
        </div>
      </div>
    </section>

    <section v-if="project.gallery.length" class="showcase-chapter section">
      <div class="container showcase-chapter__head">
        <span class="section-label">{{ projectI18n.t('moreScreens') }}</span>
      </div>

      <div class="container">
        <div class="showcase-chapter__grid">
          <button
            v-for="item in project.gallery"
            :key="item.src"
            type="button"
            class="gallery-tile"
            @click="openLightbox(item.src)"
          >
            <div class="gallery-tile__clip">
              <ProjectScreenshot
                :src="imageKit.screenshot(item.src, 900)"
                :srcset="imageKit.srcsetScreenshot(item.src, [500, 900, 1400])"
                :alt="item.alt"
                sizes="(max-width: 640px) 100vw, 50vw"
                :fit="item.fit === 'contain' ? 'contain' : 'cover'"
              />
            </div>
            <span v-if="item.caption || item.alt" class="gallery-tile__label">
              {{ item.caption || item.alt }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <section v-if="project.results?.length" class="showcase-results section">
      <div class="container">
        <div class="showcase-results__grid">
          <div
            v-for="stat in project.results"
            :key="getStatLabel(stat, locale)"
            class="showcase-results__stat"
          >
            <div class="showcase-results__value">{{ stat.value }}</div>
            <div class="showcase-results__label">{{ getStatLabel(stat, locale) }}</div>
          </div>
        </div>
      </div>
    </section>

    <ProjectLightbox
      v-if="lightboxOpen"
      :images="lightboxImages"
      :initial-index="lightboxIndex"
      @close="lightboxOpen = false"
    />
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

  &__clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
    will-change: clip-path;
  }

  &__inner {
    width: 100%;
    height: 118%;
    will-change: transform;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
  }

  &__vignette {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 100%, rgba(8, 8, 8, 0.95) 0%, transparent 70%),
      linear-gradient(to bottom, rgba(8, 8, 8, 0.35) 0%, rgba(8, 8, 8, 0.88) 100%);
    pointer-events: none;
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
    z-index: 2;
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
    z-index: 2;
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

.showcase-overview {
  border-bottom: 1px solid $color-border;
  padding-block: clamp(64px, 10vh, 120px);

  &__eyebrow {
    margin-bottom: $space-5;
  }

  &__title {
    font-family: $font-display;
    font-size: clamp(2rem, 4vw + 0.5rem, 4rem);
    font-weight: 300;
    line-height: $leading-tight;
    letter-spacing: $tracking-tight;
    color: $color-text;
    margin-bottom: clamp(40px, 6vh, 72px);
    max-width: 16ch;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(32px, 5vw, 56px);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__col {
    &--wide {
      grid-column: 1 / -1;
    }
  }

  &__key {
    display: block;
    margin-bottom: $space-3;
    color: $color-text-faint;
  }

  &__list {
    list-style: none;

    li {
      font-size: $text-sm;
      color: $color-text;
      line-height: $leading-relaxed;

      & + li {
        margin-top: $space-1;
      }
    }
  }

  &__value {
    font-family: $font-display;
    font-size: $text-2xl;
    font-weight: 300;
    color: $color-text;
  }

  &__link {
    margin-top: $space-1;
  }
}

.showcase-devices {
  border-bottom: 1px solid $color-border;

  &__stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(32px, 5vh, 56px);
    max-width: 760px;
  }

  &__item {
    margin: 0;
    width: 100%;
  }
}

.showcase-chapter {
  padding-block: clamp(72px, 11vh, 128px);
  border-bottom: 1px solid $color-border;

  &__head {
    margin-bottom: clamp(40px, 6vh, 64px);
    max-width: 900px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(12px, 1.5vw, 18px);

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
}

.gallery-tile {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;

  &__clip {
    overflow: hidden;
    border-radius: $radius-md;
    will-change: clip-path;

    :deep(.project-shot) {
      border-radius: inherit;
      aspect-ratio: 16 / 10;
    }

    :deep(.project-shot--cover) {
      height: 100%;
    }

    :deep(.project-shot__img) {
      transform: none;
      transition: transform $dur-slow $ease-gold;
    }
  }

  &:hover :deep(.project-shot__img) {
    transform: scale(1.03);
  }

  &__label {
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
    padding-inline: $space-1;
  }
}

.showcase-video {
  &__head-wrap {
    margin-bottom: clamp(16px, 3vw, 28px);
  }

  &__head {
    max-width: min(100%, 900px);
  }

  &__stage {
    width: 100vw;
    max-width: 100vw;
    margin-left: calc(50% - 50vw);
    padding-inline: 0;
  }

  &--hero {
    position: relative;
    z-index: 2;
    padding-block: clamp(16px, 3vw, 32px);
    background: linear-gradient(180deg, rgba($color-bg, 0.72), $color-bg 48%);
    border-top: 1px solid $color-border;

    :deep(.project-video__controls),
    :deep(.project-video__caption) {
      width: min(100%, $content-width);
      margin-inline: auto;
      padding-inline: $page-gutter;
    }
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
</style>
