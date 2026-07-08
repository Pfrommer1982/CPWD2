<script setup lang="ts">
import {
  getArticleBySlug,
  getCategoryById,
  getRelatedArticles,
} from '~/data/knowledge'

definePageMeta({ layout: 'default' })

const faq = useSectionTranslations('faq')
const nav = useSectionTranslations('nav')
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => (locale.value === 'en' ? 'en' : 'nl'))

const slug = route.params.slug as string
const article = getArticleBySlug(slug)

if (!article) {
  throw createError({ statusCode: 404, statusMessage: 'Artikel niet gevonden' })
}

const category = getCategoryById(article.categoryId)
const related = getRelatedArticles(slug)

const updatedLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.updated)),
)

useSeo(computed(() => ({
  title: article.question[lang.value],
  description: article.answer[lang.value],
  type: 'article' as const,
  canonicalPath: `/faq/${article.slug}`,
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: nav.t('faq'), path: '/faq' },
    { name: article.question[lang.value], path: `/faq/${article.slug}` },
  ],
})))

const enableFx = ref(false)
const articleRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!import.meta.client) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  enableFx.value = !reduced && !coarse

  const scope = articleRef.value
  if (reduced || !scope) return

  const { init, createContext } = useGsap()
  const gsap = await init()
  if (!gsap) return

  await createContext(scope, () => {
    const head = scope.querySelector('.faq-article__head')
    if (head) {
      gsap.from(head, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
    }

    gsap.utils.toArray<HTMLElement>('.faq-article__reveal').forEach((el) => {
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })
  })
})
</script>

<template>
  <div class="faq-article-page">
    <SeoArticleSchema :article="article" />

    <ClientOnly>
      <div v-if="enableFx" class="faq-article-page__fx" aria-hidden="true">
        <EffectsTacticalWaveField />
      </div>
    </ClientOnly>

    <article ref="articleRef" class="container faq-article">
      <NuxtLink
        :to="localePath('/faq')"
        class="faq-article__back-top font-mono"
        data-cursor="hover"
      >
        <span class="faq-article__back-top-arrow" aria-hidden="true">←</span>
        <span>{{ faq.t('backToHub') }}</span>
      </NuxtLink>

      <nav class="faq-article__breadcrumb font-mono" aria-label="Breadcrumb">
        <NuxtLink :to="localePath('/faq')" data-cursor="hover">{{ faq.t('label') }}</NuxtLink>
        <span aria-hidden="true">/</span>
        <span v-if="category" class="faq-article__breadcrumb-current">
          {{ category.title[lang] }}
        </span>
      </nav>

      <header class="faq-article__head">
        <span v-if="category" class="faq-article__category font-mono">
          <span class="faq-article__category-tick" aria-hidden="true" />
          {{ category.code }} · {{ category.title[lang] }}
        </span>
        <h1 class="faq-article__title font-display">
          {{ article.question[lang] }}
        </h1>
        <p class="faq-article__lead">
          {{ article.answer[lang] }}
        </p>
        <span class="faq-article__updated font-mono">
          {{ faq.t('updatedLabel') }}: {{ updatedLabel }}
        </span>
      </header>

      <div class="faq-article__content faq-article__reveal">
        <FaqArticleBody :blocks="article.body" />
      </div>

      <section v-if="related.length" class="faq-article__related faq-article__reveal">
        <h2 class="faq-article__related-title font-mono">{{ faq.t('relatedLabel') }}</h2>
        <ul class="faq-article__related-list" role="list">
          <li v-for="item in related" :key="item.slug">
            <NuxtLink
              :to="localePath(`/faq/${item.slug}`)"
              class="faq-article__related-link"
              data-cursor="hover"
            >
              <span class="faq-article__related-question font-display">{{ item.question[lang] }}</span>
              <span class="faq-article__related-arrow" aria-hidden="true">→</span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <NuxtLink :to="localePath('/faq')" class="faq-article__back font-mono" data-cursor="hover">
        <span aria-hidden="true">←</span>
        {{ faq.t('backToHub') }}
      </NuxtLink>
    </article>

    <section class="faq-cta section">
      <div class="container faq-cta__inner">
        <div class="faq-cta__copy">
          <span class="section-label">{{ faq.t('cta.label') }}</span>
          <h2 class="faq-cta__title font-display">
            {{ faq.t('cta.heading') }}
          </h2>
          <p class="faq-cta__body">
            {{ faq.t('cta.body') }}
          </p>
        </div>
        <GsapMagneticButton :to="localePath('/contact')" variant="primary">
          {{ faq.t('cta.button') }}
        </GsapMagneticButton>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.faq-article-page {
  position: relative;
  z-index: 2;
  padding-top: 140px;
}

.faq-article-page__fx {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.4;
  overflow: hidden;
}

.faq-article__category-tick {
  display: inline-block;
  width: 16px;
  height: 1px;
  margin-right: $space-2;
  vertical-align: middle;
  background: $color-comms;
  box-shadow: 0 0 8px rgba($color-comms, 0.5);
}

.faq-article {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-width: 820px;
}

.faq-article__breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-2;
  font-size: $text-xs;
  letter-spacing: $tracking-wide;
  color: $color-text-faint;

  a {
    color: $color-comms;
    transition: color $dur-fast $ease-gold;

    &:hover {
      color: $color-comms-light;
    }
  }
}

.faq-article__breadcrumb-current {
  color: $color-text-muted;
}

.faq-article__head {
  margin-top: $space-6;
  padding-bottom: $space-6;
  border-bottom: 1px solid $color-border;
}

.faq-article__category {
  display: block;
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  color: $color-comms;
}

.faq-article__title {
  margin-top: $space-4;
  font-size: clamp(2.2rem, 1.6rem + 3vw, 3.6rem);
  font-weight: 500;
  letter-spacing: $tracking-tight;
  line-height: 1.05;
  color: $color-text;
}

.faq-article__lead {
  margin-top: $space-5;
  font-size: $text-lg;
  line-height: $leading-relaxed;
  color: $color-text;
}

.faq-article__updated {
  display: block;
  margin-top: $space-5;
  font-size: $text-xs;
  letter-spacing: $tracking-wide;
  color: $color-text-faint;
}

.faq-article__content {
  margin-top: $space-8;
}

.faq-article__related {
  margin-top: $space-12;
  padding-top: $space-6;
  border-top: 1px solid $color-border;
}

.faq-article__related-title {
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  text-transform: uppercase;
  color: $color-text-muted;
}

.faq-article__related-list {
  display: flex;
  flex-direction: column;
  margin: $space-4 0 0;
  padding: 0;
  list-style: none;
}

.faq-article__related-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  padding: $space-4 0;
  border-bottom: 1px solid $color-border;
  color: $color-text-muted;
  transition: color $dur-fast $ease-gold;

  &:hover {
    color: $color-text;
  }
}

.faq-article__related-question {
  font-size: $text-lg;
  font-weight: 500;
  letter-spacing: $tracking-tight;
}

.faq-article__related-arrow {
  color: $color-comms;
  transition: transform $dur-fast $ease-gold;

  .faq-article__related-link:hover & {
    transform: translateX(4px);
  }
}

.faq-article__back-top {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  margin-bottom: $space-6;
  padding: $space-2 $space-4;
  border: 1px solid rgba($color-comms, 0.35);
  border-radius: 999px;
  background: rgba($color-comms, 0.06);
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  text-transform: uppercase;
  color: $color-comms;
  transition:
    border-color $dur-fast $ease-gold,
    background $dur-fast $ease-gold,
    color $dur-fast $ease-gold;

  &:hover {
    border-color: rgba($color-comms, 0.7);
    background: rgba($color-comms, 0.12);
    color: $color-comms-light;
  }

  &:hover .faq-article__back-top-arrow {
    transform: translateX(-3px);
  }
}

.faq-article__back-top-arrow {
  display: inline-block;
  transition: transform $dur-fast $ease-gold;
}

.faq-article__back {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  margin-top: $space-10;
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  text-transform: uppercase;
  color: $color-comms;
  transition: gap $dur-fast $ease-gold;

  &:hover {
    gap: $space-3;
  }
}

.faq-cta {
  position: relative;
  z-index: 1;
  margin-top: $space-16;
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
    max-width: 18ch;
  }

  &__body {
    margin-top: $space-3;
    max-width: 46ch;
    color: $color-text-muted;
    line-height: $leading-relaxed;
  }
}
</style>
