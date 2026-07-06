<script setup lang="ts">
import type { Project } from '~/data/projects'

const props = defineProps<{
  projects: Project[]
}>()

const work = useSectionTranslations('work')
const localePath = useLocalePath()
const imageKit = useImageKit()

const rootRef = ref<HTMLElement | null>(null)

const yearRange = computed(() => {
  const years = props.projects.map(p => p.year)
  const min = Math.min(...years)
  const max = Math.max(...years)
  return min === max ? String(min) : `${min} - ${max}`
})

function padIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

onMounted(async () => {
  if (!import.meta.client || !rootRef.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  gsap.from(rootRef.value.querySelectorAll('.work-dossier'), {
    y: 40,
    opacity: 0,
    duration: 0.9,
    stagger: 0.14,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: rootRef.value,
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
  })
})
</script>

<template>
  <section ref="rootRef" class="work-explorer">
    <div class="container work-explorer__head">
      <span class="section-label">{{ work.t('index.label') }}</span>
      <dl class="work-explorer__stats font-mono">
        <div class="work-explorer__stat">
          <dt>{{ work.t('stats.projects') }}</dt>
          <dd>{{ projects.length }}</dd>
        </div>
        <div class="work-explorer__stat">
          <dt>{{ work.t('stats.live') }}</dt>
          <dd>{{ projects.filter(p => p.liveUrl).length }}</dd>
        </div>
        <div class="work-explorer__stat">
          <dt>{{ work.t('stats.years') }}</dt>
          <dd>{{ yearRange }}</dd>
        </div>
      </dl>
    </div>

    <div class="container work-explorer__grid">
      <NuxtLink
        v-for="(project, index) in projects"
        :key="project.slug"
        :to="localePath(`/work/${project.slug}`)"
        class="work-dossier"
        :style="{ '--project-accent': project.accentColor }"
        data-cursor="view"
      >
        <div class="work-dossier__frame">
          <span class="work-dossier__corner work-dossier__corner--tl" />
          <span class="work-dossier__corner work-dossier__corner--tr" />
          <span class="work-dossier__corner work-dossier__corner--bl" />
          <span class="work-dossier__corner work-dossier__corner--br" />

          <div class="work-dossier__hud font-mono">
            <span>PRJ-{{ padIndex(index) }}</span>
            <span v-if="project.liveUrl">● {{ work.t('index.live') }}</span>
            <span>{{ project.year }}</span>
          </div>

          <div class="work-dossier__media">
            <img
              :src="imageKit.thumbnail(project.heroImage || project.thumbnail, 1200, 800)"
              :srcset="imageKit.srcset(project.heroImage || project.thumbnail, [600, 900, 1200, 1600])"
              :alt="project.title"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              class="work-dossier__img"
            >
            <div class="work-dossier__scan" aria-hidden="true" />
            <div class="work-dossier__crosshair" aria-hidden="true">
              <span />
              <span />
              <span class="work-dossier__crosshair-dot" />
            </div>
            <div class="work-dossier__vignette" aria-hidden="true" />
          </div>
        </div>

        <div class="work-dossier__body">
          <div class="work-dossier__meta font-mono">
            <span>{{ project.category }}</span>
          </div>

          <h2 class="work-dossier__title font-display">
            {{ project.title }}
          </h2>

          <p class="work-dossier__subtitle">
            {{ project.subtitle }}
          </p>

          <ul v-if="project.technologies.length" class="work-dossier__tags font-mono">
            <li v-for="tech in project.technologies.slice(0, 3)" :key="tech">
              {{ tech }}
            </li>
          </ul>

          <span class="work-dossier__cta font-mono">
            {{ work.t('index.open') }} →
          </span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.work-explorer {
  padding-bottom: $space-16;

  &__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: $space-6;
    margin-bottom: $space-8;
    padding-bottom: $space-6;
    border-bottom: 1px solid $color-border;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__stats {
    display: flex;
    gap: $space-6;
  }

  &__stat {
    text-align: right;

    @media (max-width: 640px) {
      text-align: left;
    }

    dt {
      font-size: $text-xs;
      letter-spacing: $tracking-wider;
      text-transform: uppercase;
      color: $color-text-faint;
      margin-bottom: $space-1;
    }

    dd {
      font-size: $text-xl;
      color: $color-gold-light;
      line-height: 1;
    }
  }

  &__grid {
    display: grid;
    gap: clamp(20px, 3vw, 32px);

    @media (min-width: 900px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

.work-dossier {
  display: flex;
  flex-direction: column;
  gap: $space-5;
  color: inherit;
  text-decoration: none;

  &__frame {
    position: relative;
    padding: $space-3;
    background:
      linear-gradient(180deg, rgba($color-gold, 0.04), transparent 30%),
      rgba($color-bg-alt, 0.88);
    border: 1px solid $color-border;
    transition:
      border-color $dur-med $ease-gold,
      box-shadow $dur-med $ease-gold;
  }

  &:hover &__frame {
    border-color: rgba($color-gold, 0.32);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
  }

  &:hover &__scan {
    animation: work-dossier-scan 0.85s $ease-out-expo forwards;
  }

  &:hover &__img {
    transform: scale(1.04);
    filter: brightness(1);
  }

  &:hover &__cta {
    color: var(--project-accent, $color-gold-light);
  }

  &__corner {
    position: absolute;
    width: 16px;
    height: 16px;
    border-color: rgba($color-gold, 0.38);
    border-style: solid;
    pointer-events: none;
    z-index: 3;
    transition: border-color $dur-med $ease-gold;

    .work-dossier:hover & {
      border-color: var(--project-accent, $color-gold);
    }

    &--tl { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
    &--tr { top: 8px; right: 8px; border-width: 1px 1px 0 0; }
    &--bl { bottom: 8px; left: 8px; border-width: 0 0 1px 1px; }
    &--br { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
  }

  &__hud {
    display: flex;
    justify-content: space-between;
    gap: $space-3;
    margin-bottom: $space-3;
    font-size: 0.68rem;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  &__media {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 10;
    border: 1px solid rgba($color-gold, 0.1);
    background: $color-surface;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.88);
    transition: transform $dur-xslow $ease-out-expo, filter $dur-med ease;
  }

  &__scan {
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba($color-gold-light, 0.12) 20%,
      var(--project-accent, $color-gold-light) 50%,
      rgba($color-gold-light, 0.12) 80%,
      transparent
    );
    box-shadow: 0 0 16px rgba($color-gold, 0.35);
    opacity: 0;
    pointer-events: none;
    z-index: 2;
  }

  &__crosshair {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
    z-index: 2;
    opacity: 0.55;
    transition: opacity $dur-med ease;

    .work-dossier:hover & {
      opacity: 0.85;
    }

    span:not(.work-dossier__crosshair-dot) {
      position: absolute;
      background: rgba($color-gold, 0.35);

      &:first-child {
        width: 24px;
        height: 1px;
      }

      &:nth-child(2) {
        width: 1px;
        height: 24px;
      }
    }
  }

  &__crosshair-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--project-accent, $color-gold);
    box-shadow: 0 0 10px rgba($color-gold, 0.5);
  }

  &__vignette {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, transparent 55%, rgba($color-bg, 0.72)),
      radial-gradient(circle at center, transparent 50%, rgba($color-bg, 0.18) 100%);
    pointer-events: none;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding: 0 $space-1;
  }

  &__meta {
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  &__title {
    font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
    font-weight: 500;
    letter-spacing: $tracking-tight;
    line-height: $leading-tight;
  }

  &__subtitle {
    font-size: $text-sm;
    line-height: $leading-relaxed;
    color: $color-text-muted;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;

    li {
      padding: 4px 8px;
      border: 1px solid rgba($color-gold, 0.14);
      font-size: 0.68rem;
      letter-spacing: $tracking-wide;
      text-transform: uppercase;
      color: $color-text-muted;
    }
  }

  &__cta {
    margin-top: $space-2;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text;
    transition: color $dur-med ease;
  }
}

@keyframes work-dossier-scan {
  0% {
    top: 0;
    opacity: 0;
  }

  15% {
    opacity: 1;
  }

  100% {
    top: 100%;
    opacity: 0;
  }
}
</style>
