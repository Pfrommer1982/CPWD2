<script setup lang="ts">
import { getProjectBySlug, getNextProject } from '~/data/projects'

const route = useRoute()
const { t } = useI18n()

const slug = computed(() => route.params.slug as string)
const project = computed(() => getProjectBySlug(slug.value))
const nextProject = computed(() => getNextProject(slug.value))

definePageMeta({ layout: 'project' })

if (!project.value) {
  throw createError({ statusCode: 404, message: 'Project not found' })
}

useHead({
  title: `${project.value.title} — CPWD`,
})
</script>

<template>
  <article v-if="project" class="project-page">
    <ProjectHero :project="project" />
    <ProjectInfo :project="project" />

    <section class="project-page__text">
      <div class="project-page__block">
        <h2 class="font-mono project-page__label">{{ t('project.challenge') }}</h2>
        <p>{{ project.challenge }}</p>
      </div>
      <div class="project-page__block">
        <h2 class="font-mono project-page__label">{{ t('project.solution') }}</h2>
        <p>{{ project.solution }}</p>
      </div>
    </section>

    <ProjectGallery :items="project.gallery" />

    <section v-if="project.results.length" class="project-page__results">
      <h2 class="font-mono project-page__results-label">{{ t('project.results') }}</h2>
      <div class="project-page__stats">
        <div v-for="stat in project.results" :key="stat.label" class="project-page__stat">
          <span class="project-page__stat-value font-display">{{ stat.value }}</span>
          <span class="project-page__stat-label font-mono">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <ProjectNext v-if="nextProject" :project="nextProject" />
  </article>
</template>

<style lang="scss" scoped>
.project-page {
  &__text {
    @include container;
    display: grid;
    gap: $space-3xl;
    padding-block: $space-3xl;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__label {
    color: $color-accent;
    margin-bottom: $space-md;
    display: block;
  }

  &__block p {
    font-size: $text-lg;
    color: $color-text-muted;
    line-height: 1.7;
  }

  &__results {
    @include container;
    padding-block: $space-3xl;
    border-top: 1px solid $color-border;
  }

  &__results-label {
    color: $color-accent;
    margin-bottom: $space-2xl;
    display: block;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: $space-xl;
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
