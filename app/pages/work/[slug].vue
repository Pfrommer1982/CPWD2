<script setup lang="ts">
import { getProjectBySlug, getNextProject, getStatLabel } from '~/data/projects'
import type { ProjectGalleryItem } from '~/data/projects'

definePageMeta({ layout: 'project' })

const { locale } = useI18n()
const projectI18n = useSectionTranslations('project')
const localePath = useLocalePath()
const route = useRoute()
const imageKit = useImageKit()

const slug = route.params.slug as string
const project = getProjectBySlug(slug)
const nextProject = getNextProject(slug)

if (!project) {
  throw createError({ statusCode: 404, statusMessage: 'Project niet gevonden' })
}

useHead({
  title: `${project.title}, CPWD`,
  meta: [
    { name: 'description', content: project.subtitle },
    { property: 'og:title', content: project.title },
    { property: 'og:description', content: project.subtitle },
    { property: 'og:image', content: imageKit.hero(project.heroImage) },
  ],
})

const nonDuoItems = computed(() =>
  project.gallery.filter(item => item.layout !== 'duo'),
)

const isVideoItem = (item: ProjectGalleryItem) =>
  item.type === 'video' || imageKit.isVideoPath(item.src)

const duoPairs = computed(() => {
  const duos = project.gallery.filter(item => item.layout === 'duo')
  const pairs: ProjectGalleryItem[][] = []
  for (let i = 0; i < duos.length; i += 2) {
    if (duos[i + 1]) {
      pairs.push([duos[i], duos[i + 1]])
    } else {
      pairs.push([duos[i]])
    }
  }
  return pairs
})

const pageRef = ref<HTMLElement>()
const heroSection = ref<HTMLElement>()
const heroImg = ref<HTMLImageElement>()
const heroContent = ref<HTMLElement>()
const nextSection = ref<HTMLElement>()
const nextBg = ref<HTMLElement>()

onMounted(async () => {
  if (!import.meta.client) return

  const { createContext } = useGsap()
  const scope = pageRef.value ?? document.querySelector('.project-page')
  if (!scope) return

  await createContext(scope as Element, async () => {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

    if (project.showcase) {
      if (nextBg.value && nextSection.value) {
        gsap.to(nextBg.value, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: nextSection.value,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
      await useLenis().refresh()
      return
    }

    const heroTl = gsap.timeline({ delay: 0.1 })

    if (heroImg.value) {
      heroTl.from(heroImg.value, {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.4,
        ease: 'power4.out',
      })
    }

    if (heroContent.value) {
      heroTl.from(heroContent.value, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
      }, '-=0.5')
    }

    heroTl.from('.project-hero__scroll', {
      opacity: 0,
      duration: 0.6,
    }, '-=0.3')

    if (heroImg.value && heroSection.value) {
      gsap.to(heroImg.value, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection.value,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    gsap.utils.toArray<HTMLElement>('.will-reveal').forEach((el) => {
      const delay = parseFloat(el.style.getPropertyValue('--delay') || '0')
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    gsap.utils.toArray<HTMLElement>('.project-gallery__row').forEach((row) => {
      const items = row.querySelectorAll('.project-gallery__item')
      gsap.fromTo(
        items,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: row,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    if (nextBg.value && nextSection.value) {
      gsap.to(nextBg.value, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: nextSection.value,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }
  })
})
</script>

<template>
  <div ref="pageRef" class="project-page" :style="{ '--project-accent': project.accentColor }">
    <ProjectShowcase
      v-if="project.showcase"
      :project="project"
      :showcase="project.showcase"
    />

    <template v-else>
      <div ref="pageRef">
        <section ref="heroSection" class="project-hero">
          <div class="project-hero__media">
            <img
              ref="heroImg"
              :src="imageKit.hero(project.heroImage)"
              :srcset="imageKit.srcset(project.heroImage)"
              :alt="project.title"
              sizes="100vw"
              fetchpriority="high"
              class="project-hero__img"
            >
            <div class="project-hero__overlay" />
          </div>

          <div ref="heroContent" class="project-hero__content container">
            <div class="project-hero__meta">
              <span class="label">{{ project.category }}</span>
              <span class="label project-hero__year">{{ project.year }}</span>
            </div>
            <h1 class="project-hero__title">
              {{ project.title }}
            </h1>
          </div>

          <div class="project-hero__scroll">
            <div class="project-hero__scroll-line" />
            <span class="label">Scroll</span>
          </div>
        </section>

        <section class="project-info section">
          <div class="container">
            <div class="project-info__grid">
              <div class="project-info__description">
                <p class="project-info__subtitle">
                  {{ project.subtitle }}
                </p>
              </div>

              <div class="project-info__meta">
                <div class="project-info__meta-item">
                  <span class="label">{{ projectI18n.t('role') }}</span>
                  <ul>
                    <li v-for="role in project.role" :key="role">
                      {{ role }}
                    </li>
                  </ul>
                </div>

                <div class="project-info__meta-item">
                  <span class="label">{{ projectI18n.t('technologies') }}</span>
                  <div class="project-info__tags">
                    <span
                      v-for="tech in project.technologies"
                      :key="tech"
                      class="project-info__tag"
                    >{{ tech }}</span>
                  </div>
                </div>

                <div v-if="project.liveUrl" class="project-info__meta-item">
                  <span class="label">{{ projectI18n.t('live') }}</span>
                  <a
                    :href="project.liveUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-arrow"
                  >
                    {{ projectI18n.t('viewSite') }}
                    <span class="arrow-icon">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="project-story section">
          <div class="container">
            <div class="project-story__grid">
              <div class="project-story__block will-reveal">
                <span class="section-label">{{ projectI18n.t('challenge') }}</span>
                <p class="project-story__text">
                  {{ locale === 'nl' ? project.challenge.nl : project.challenge.en }}
                </p>
              </div>

              <div class="project-story__block will-reveal">
                <span class="section-label">{{ projectI18n.t('solution') }}</span>
                <p class="project-story__text">
                  {{ locale === 'nl' ? project.solution.nl : project.solution.en }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section v-if="project.results?.length" class="project-results section">
          <div class="container">
            <div class="project-results__grid">
              <div
                v-for="(stat, i) in project.results"
                :key="getStatLabel(stat, locale)"
                class="stat will-reveal"
                :style="{ '--delay': `${i * 0.1}s` }"
              >
                <div class="stat__number">
                  {{ stat.value }}
                </div>
                <div class="stat__label">
                  {{ getStatLabel(stat, locale) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="project-gallery section">
          <template v-for="(item, index) in nonDuoItems" :key="`${item.src}-${index}`">
            <div
              v-if="item.layout === 'full'"
              class="project-gallery__row project-gallery__row--full"
            >
              <div class="project-gallery__item project-gallery__item--full will-reveal">
                <video
                  v-if="isVideoItem(item)"
                  :src="imageKit.video(item.src)"
                  class="project-gallery__video"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="metadata"
                />
                <ProjectScreenshot
                  v-else
                  :src="imageKit.screenshot(item.src, 1600)"
                  :srcset="imageKit.srcsetScreenshot(item.src)"
                  :alt="item.alt"
                  sizes="100vw"
                  :fit="item.fit === 'contain' ? 'contain' : 'cover'"
                />
                <p v-if="item.caption" class="project-gallery__caption">
                  {{ item.caption }}
                </p>
              </div>
            </div>

            <div
              v-else-if="item.layout === 'half-left' || item.layout === 'half-right'"
              class="project-gallery__row"
              :class="`project-gallery__row--${item.layout}`"
            >
              <div class="project-gallery__item will-reveal">
                <ProjectScreenshot
                  :src="imageKit.screenshot(item.src, 1000)"
                  :srcset="imageKit.srcsetScreenshot(item.src, [600, 1000, 1400])"
                  :alt="item.alt"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  :fit="item.fit === 'contain' ? 'contain' : 'cover'"
                />
              </div>
            </div>
          </template>

          <div
            v-for="(pair, i) in duoPairs"
            :key="`duo-${i}`"
            class="project-gallery__row project-gallery__row--duo container"
          >
            <div
              v-for="item in pair"
              :key="item.src"
              class="project-gallery__item will-reveal"
            >
              <ProjectScreenshot
                :src="imageKit.screenshot(item.src, 900)"
                :srcset="imageKit.srcsetScreenshot(item.src, [500, 900, 1200])"
                :alt="item.alt"
                sizes="(max-width: 768px) 100vw, 50vw"
                fit="cover"
              />
              <p v-if="item.caption" class="project-gallery__caption">
                {{ item.caption }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </template>

    <section v-if="nextProject" ref="nextSection" class="project-next">
      <NuxtLink
        :to="localePath(`/work/${nextProject.slug}`)"
        class="project-next__link"
        data-cursor="view"
      >
        <div ref="nextBg" class="project-next__bg">
          <img
            :src="imageKit.responsive(nextProject.thumbnail, 1600)"
            :alt="nextProject.title"
            loading="lazy"
            class="project-next__bg-img"
          >
          <div class="project-next__bg-overlay" />
        </div>

        <div class="project-next__content container">
          <span class="section-label project-next__label">{{ projectI18n.t('nextProject') }}</span>
          <h2 class="project-next__title">
            {{ nextProject.title }}
          </h2>
          <span class="label project-next__category">{{ nextProject.category }}</span>
        </div>
      </NuxtLink>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.project-hero {
  position: relative;
  height: 100svh;
  min-height: 600px;
  overflow: hidden;
  background: $color-bg;

  &__media {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 110%;
    object-fit: cover;
    object-position: center;
    will-change: transform;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(8, 8, 8, 0.85) 0%,
      rgba(8, 8, 8, 0.3) 40%,
      rgba(8, 8, 8, 0.1) 100%
    );
  }

  &__content {
    position: absolute;
    bottom: $space-12;
    left: 0;
    right: 0;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: $space-6;
    margin-bottom: $space-4;
    color: $color-gold;
  }

  &__year {
    color: $color-text-muted;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-4xl;
    font-weight: 300;
    line-height: $leading-tight;
    letter-spacing: $tracking-tight;
    color: $color-text;
    max-width: 900px;
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

.project-info {
  border-bottom: 1px solid $color-border;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: $space-10;
    align-items: start;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  &__subtitle {
    font-family: $font-display;
    font-size: $text-2xl;
    font-weight: 300;
    line-height: $leading-snug;
    color: $color-text-muted;
    max-width: 640px;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: $space-6;
    padding-top: 4px;

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
    display: inline-block;
    padding: 4px 10px;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-family: $font-mono;
    font-size: $text-xs;
    color: $color-text-muted;
    letter-spacing: $tracking-wide;
    transition: border-color $dur-fast $ease-gold, color $dur-fast $ease-gold;

    &:hover {
      border-color: $color-gold;
      color: $color-gold;
    }
  }
}

.project-story {
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-10;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: $space-8;
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

.project-results {
  background: $color-bg-alt;
  border-top: 1px solid $color-border;
  border-bottom: 1px solid $color-border;

  &__grid {
    display: flex;
    gap: $space-10;
    flex-wrap: wrap;

    @media (max-width: 600px) {
      flex-direction: column;
      gap: $space-8;
    }
  }

  .stat {
    flex: 1;
    min-width: 160px;

    &__number {
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
}

.project-gallery {
  padding: 0;

  &__row {
    margin-bottom: 2px;

    &--full {
      width: 100%;
    }

    &--duo {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    &--half-left,
    &--half-right {
      max-width: $content-width;
      margin-left: auto;
      margin-right: auto;
      padding: 0 clamp(20px, 4vw, 60px);
    }
  }

  &__item {
    overflow: visible;
    background: transparent;

    &--full {
      width: 100%;

      :deep(.project-shot--cover) {
        aspect-ratio: 16 / 9;
      }
    }

    :deep(.project-shot) {
      width: 100%;
    }
  }

  &__video {
    width: 100%;
    display: block;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
  }

  &__caption {
    font-family: $font-mono;
    font-size: $text-xs;
    color: $color-text-faint;
    letter-spacing: $tracking-wide;
    padding: $space-3 0;
    text-align: center;
  }
}

.project-next {
  position: relative;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;

  &__link {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;

    &:hover .project-next__bg-img {
      transform: scale(1.04);
    }
  }

  &__bg {
    position: absolute;
    inset: 0;
    overflow: hidden;

    &-img {
      width: 100%;
      height: 115%;
      object-fit: cover;
      will-change: transform;
      transition: transform $dur-xslow $ease-gold;
    }

    &-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(8, 8, 8, 0.9) 0%,
        rgba(8, 8, 8, 0.5) 50%,
        rgba(8, 8, 8, 0.2) 100%
      );
    }
  }

  &__content {
    position: absolute;
    bottom: $space-12;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__label {
    color: $color-gold;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-3xl;
    font-weight: 300;
    color: $color-text;
    line-height: $leading-tight;
    letter-spacing: $tracking-tight;
    transition: color $dur-fast $ease-gold;

    .project-next__link:hover & {
      color: $color-gold-light;
    }
  }

  &__category {
    color: $color-text-muted;
  }
}
</style>
