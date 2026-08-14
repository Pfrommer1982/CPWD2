<script setup lang="ts">
import { getProjectBySlug, getNextProject } from '~/data/projects'

definePageMeta({ layout: 'project' })

const projectI18n = useSectionTranslations('project')
const nav = useSectionTranslations('nav')
const localePath = useLocalePath()
const route = useRoute()
const imageKit = useImageKit()

const slug = route.params.slug as string
const project = getProjectBySlug(slug)
const nextProject = getNextProject(slug)

if (!project?.hasLegacy || !project.showcase) {
  throw createError({ statusCode: 404, statusMessage: 'Legacy versie niet gevonden' })
}

const showcase = project.showcase
const legacyHero = project.legacyHeroImage ?? project.heroImage
/** Showcase reads `project.heroImage` - point it at the legacy asset. */
const legacyProject = { ...project, heroImage: legacyHero }

useSeo({
  title: `${project.title} - Legacy`,
  description: project.subtitle,
  image: imageKit.hero(legacyHero),
  imageAlt: project.title,
  type: 'article',
  canonicalPath: `/work/${project.slug}/legacy`,
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: nav.t('work'), path: '/work' },
    { name: project.title, path: `/work/${project.slug}` },
    { name: projectI18n.t('legacy.badge'), path: `/work/${project.slug}/legacy` },
  ],
})

const pageRef = ref<HTMLElement>()
const nextSection = ref<HTMLElement>()
const nextBg = ref<HTMLElement>()

onMounted(async () => {
  if (!import.meta.client) return

  const { createContext } = useGsap()
  const scope = pageRef.value ?? document.querySelector('.project-legacy-page')
  if (!scope) return

  await createContext(scope as Element, async () => {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

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
  })
})
</script>

<template>
  <div
    ref="pageRef"
    class="project-legacy-page"
    :style="{ '--project-accent': project.accentColor }"
  >
    <SeoProjectSchema :project="legacyProject" />

    <div class="legacy-banner">
      <div class="container legacy-banner__inner">
        <span class="legacy-banner__badge font-mono">{{ projectI18n.t('legacy.badge') }}</span>
        <NuxtLink
          :to="localePath(`/work/${project.slug}`)"
          class="legacy-banner__back font-mono"
          data-cursor="view"
        >
          ← {{ projectI18n.t('legacy.back') }}
        </NuxtLink>
      </div>
    </div>

    <ProjectShowcase
      :project="legacyProject"
      :showcase="showcase"
    />

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
.legacy-banner {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid $color-border;
  background: rgba(5, 8, 7, 0.88);
  backdrop-filter: blur(12px);

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-4;
    min-height: 52px;
    padding-block: $space-3;
  }

  &__badge {
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-muted;
    border: 1px solid $color-border;
    padding: 4px 10px;
    border-radius: $radius-sm;
  }

  &__back {
    color: $color-gold;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    text-transform: uppercase;
    transition: color $dur-fast $ease-gold;

    &:hover {
      color: $color-gold-light;
    }
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
