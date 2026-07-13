<script setup lang="ts">
import {
  sortedKnowledgeCategories,
  getArticlesByCategory,
  knowledgeArticles,
  type KnowledgeArticle,
} from '~/data/knowledge'

definePageMeta({ layout: 'default' })

const faq = useSectionTranslations('faq')
const seo = useSectionTranslations('seo')
const nav = useSectionTranslations('nav')
const { locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => (locale.value === 'en' ? 'en' : 'nl'))

useSeo(computed(() => ({
  title: seo.t('faq.title'),
  description: seo.t('faq.description'),
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: nav.t('faq'), path: '/faq' },
  ],
})))

const query = ref('')
const appliedQuery = ref('')
const searching = ref(false)
const scrambleText = ref('')

function matches(article: KnowledgeArticle, term: string): boolean {
  const haystack = [
    article.question[lang.value],
    article.answer[lang.value],
    ...article.keywords,
  ].join(' ').toLowerCase()
  return haystack.includes(term)
}

const groupedCategories = computed(() => {
  const term = appliedQuery.value.trim().toLowerCase()
  return sortedKnowledgeCategories
    .map(category => {
      const categoryText = `${category.title[lang.value]} ${category.description[lang.value]}`.toLowerCase()
      const categoryMatches = !term || categoryText.includes(term)
      const articles = getArticlesByCategory(category.id)
        .filter(article => !term || categoryMatches || matches(article, term))
      return { category, articles }
    })
    .filter(group => group.articles.length > 0)
})

const hasResults = computed(() => groupedCategories.value.length > 0)
const matchCount = computed(() =>
  groupedCategories.value.reduce((sum, group) => sum + group.articles.length, 0),
)

const totalArticles = knowledgeArticles.length
const { enableHeavyFx, animateMotion } = useGraphicsCapability()

const GLYPHS = '01<>[]/\\#*+=ABCDEF0123456789'
let scrambleRaf = 0
let searchTimer: ReturnType<typeof setTimeout> | null = null

function stopScramble() {
  if (scrambleRaf) cancelAnimationFrame(scrambleRaf)
  scrambleRaf = 0
}

function startScramble(target: string) {
  stopScramble()
  const start = performance.now()
  const duration = 520

  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1)
    const locked = Math.floor(t * target.length)
    let out = ''
    for (let i = 0; i < target.length; i++) {
      const char = target[i] ?? ''
      if (i < locked || char === ' ' || char === '"') out += char
      else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    }
    scrambleText.value = out
    if (t < 1) scrambleRaf = requestAnimationFrame(step)
    else { scrambleText.value = target; scrambleRaf = 0 }
  }

  scrambleRaf = requestAnimationFrame(step)
}

function runSearchDecrypt(value: string) {
  if (searchTimer) clearTimeout(searchTimer)
  const term = value.trim()

  if (!animateMotion.value) {
    appliedQuery.value = value
    searching.value = false
    return
  }

  searching.value = true
  startScramble(term ? `DECRYPTING QUERY: "${term}"` : 'RESETTING INDEX')

  searchTimer = setTimeout(() => {
    appliedQuery.value = value
    searching.value = false
    stopScramble()
  }, term ? 600 : 320)
}

watch(query, (value) => {
  runSearchDecrypt(value)
})

onUnmounted(() => {
  stopScramble()
  if (searchTimer) clearTimeout(searchTimer)
})

const pageRef = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!import.meta.client) return
  if (!animateMotion.value) return

  const { init, createContext } = useGsap()
  const gsap = await init()
  if (!gsap || !heroRef.value) return

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroRef.value,
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
  })

  tl.from(heroRef.value.querySelector('.faq-hero__label'), {
    y: 16,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
  })
    .from(heroRef.value.querySelector('.faq-hero__title'), {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, '-=0.45')
    .from(heroRef.value.querySelector('.faq-hero__intro'), {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.55')
    .from(heroRef.value.querySelector('.faq-hero__readout'), {
      y: 16,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, '-=0.5')
    .from(heroRef.value.querySelector('.faq-hero__search'), {
      y: 16,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, '-=0.55')

  const scope = pageRef.value
  if (!scope) return

  await createContext(scope, () => {
    gsap.utils.toArray<HTMLElement>('.faq-category').forEach((category) => {
      const head = category.querySelector('.faq-category__head')
      const items = category.querySelectorAll('.faq-item')

      if (head) {
        gsap.from(head, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: category,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        })
      }

      if (items.length) {
        gsap.from(items, {
          y: 26,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: category,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        })
      }
    })
  })
})
</script>

<template>
  <div ref="pageRef" class="faq-page">
    <SeoFaqSchema :articles="knowledgeArticles" />

    <ClientOnly>
      <div v-if="enableHeavyFx" class="faq-page__fx" aria-hidden="true">
        <EffectsTacticalDataField :count="34" :seed="7" :live-count="5" />
        <div class="faq-page__scan" />
      </div>
    </ClientOnly>

    <section ref="heroRef" class="faq-hero section">
      <div class="faq-hero__backdrop" aria-hidden="true">
        <div class="faq-hero__grid" />
        <div class="faq-hero__glow" />
        <ClientOnly>
          <EffectsTacticalRadarHud v-if="enableHeavyFx" />
        </ClientOnly>
      </div>

      <div class="container faq-hero__inner">
        <span class="section-label faq-hero__label">{{ faq.t('label') }}</span>
        <h1 class="faq-hero__title font-display">
          {{ faq.t('heading') }}
        </h1>
        <p class="faq-hero__intro copy-width">
          {{ faq.t('intro') }}
        </p>

        <div class="faq-hero__readout font-mono" aria-hidden="true">
          <span class="faq-hero__readout-dot" />
          <span>KB-INDEX // {{ String(totalArticles).padStart(2, '0') }} FILES DECRYPTED</span>
        </div>

        <div class="faq-hero__search">
          <svg class="faq-hero__search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" stroke-linecap="round" />
          </svg>
          <input
            v-model="query"
            type="search"
            class="faq-hero__search-input font-mono"
            :placeholder="faq.t('searchPlaceholder')"
            :aria-label="faq.t('searchLabel')"
          >
          <button
            v-if="query"
            type="button"
            class="faq-hero__search-clear"
            :aria-label="faq.t('clearSearch')"
            data-cursor="hover"
            @click="query = ''"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div
          v-if="searching || appliedQuery"
          class="faq-hero__status font-mono"
          aria-live="polite"
        >
          <template v-if="searching">
            <span class="faq-hero__status-bar" aria-hidden="true">
              <span class="faq-hero__status-bar-fill" />
            </span>
            <span class="faq-hero__status-text">{{ scrambleText }}</span>
          </template>
          <template v-else>
            <span class="faq-hero__status-dot" aria-hidden="true" />
            <span class="faq-hero__status-text">
              {{ matchCount }} {{ matchCount === 1 ? 'MATCH' : 'MATCHES' }} // "{{ appliedQuery }}"
            </span>
          </template>
        </div>
      </div>
    </section>

    <div class="container faq-body" :class="{ 'faq-body--searching': searching }">
      <p v-if="!hasResults" class="faq-body__empty">
        {{ faq.t('noResults') }}
      </p>

      <section
        v-for="group in groupedCategories"
        :key="group.category.id"
        class="faq-category"
      >
        <header class="faq-category__head">
          <span class="faq-category__code font-mono">
            <span class="faq-category__code-tick" aria-hidden="true" />
            {{ group.category.code }}
          </span>
          <h2 class="faq-category__title font-display">{{ group.category.title[lang] }}</h2>
          <p class="faq-category__desc">{{ group.category.description[lang] }}</p>
        </header>

        <div class="faq-category__list">
          <FaqAccordion
            v-for="(article, index) in group.articles"
            :key="article.slug"
            :article="article"
            :index="index"
          />
        </div>
      </section>
    </div>

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
.faq-page {
  position: relative;
  z-index: 2;
  padding-top: 100px;
}

.faq-page__fx {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.55;
  overflow: hidden;
}

.faq-page__scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 140px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba($color-comms, 0.05) 45%,
    rgba($color-comms-light, 0.08) 50%,
    rgba($color-comms, 0.05) 55%,
    transparent
  );
  animation: faq-scan 8s linear infinite;
}

@keyframes faq-scan {
  0% { transform: translateY(-160px); }
  100% { transform: translateY(100vh); }
}

.faq-hero {
  position: relative;
  padding-bottom: $space-8;
  overflow: hidden;

  &__backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__grid {
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image:
      linear-gradient(rgba($color-gold, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba($color-gold, 0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 92%);
  }

  &__glow {
    position: absolute;
    top: -20%;
    right: -10%;
    width: min(48vw, 420px);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($color-gold, 0.12), transparent 68%);
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__title {
    margin-top: $space-5;
    font-size: clamp(3rem, 2rem + 5vw, 6rem);
    font-weight: 500;
    letter-spacing: $tracking-tight;
    line-height: 0.95;
    max-width: 14ch;
  }

  &__intro {
    margin-top: $space-6;
    font-size: $text-lg;
    line-height: $leading-relaxed;
    color: $color-text-muted;
  }

  &__readout {
    display: inline-flex;
    align-items: center;
    gap: $space-3;
    margin-top: $space-6;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    color: $color-comms-light;
  }

  &__readout-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $color-comms-light;
    box-shadow: 0 0 10px rgba($color-comms, 0.6);
    animation: faq-blink 1.6s steps(1) infinite;
  }

  &__search {
    position: relative;
    display: flex;
    align-items: center;
    gap: $space-3;
    margin-top: $space-6;
    max-width: 480px;
    padding: 0 $space-4;
    border: 1px solid $color-border;
    background: rgba($color-surface, 0.5);
    transition: border-color $dur-fast $ease-gold;

    &:focus-within {
      border-color: $color-border-hover;
    }
  }

  &__search-icon {
    flex-shrink: 0;
    color: $color-comms;
  }

  &__search-input {
    flex: 1;
    width: 100%;
    padding: $space-4 0;
    background: none;
    border: none;
    color: $color-text;
    font-size: $text-sm;
    letter-spacing: $tracking-wide;

    &::placeholder {
      color: $color-text-faint;
    }

    &:focus {
      outline: none;
    }

    // Hide the browser's native (blue) clear button; we render our own.
    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }
  }

  &__search-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: $color-error;
    transition: color $dur-fast $ease-gold, transform $dur-fast $ease-gold;

    &:hover {
      color: #D9634F;
      transform: rotate(90deg);
    }

    &:focus-visible {
      outline: 1px solid $color-error;
      outline-offset: 3px;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin-top: $space-4;
    min-height: 16px;
    max-width: 480px;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-comms-light;
  }

  &__status-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $color-comms-light;
    box-shadow: 0 0 8px rgba($color-comms, 0.6);
  }

  &__status-bar {
    position: relative;
    flex-shrink: 0;
    width: 64px;
    height: 8px;
    border: 1px solid $color-border-hover;
    overflow: hidden;
    background: repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 4px,
      rgba($color-comms, 0.08) 4px,
      rgba($color-comms, 0.08) 5px
    );
  }

  &__status-bar-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40%;
    background: repeating-linear-gradient(
      90deg,
      $color-comms 0,
      $color-comms 4px,
      $color-comms-light 4px,
      $color-comms-light 6px
    );
    box-shadow: 0 0 10px rgba($color-comms, 0.5);
    animation: faq-search-sweep 0.7s linear infinite;
  }
}

@keyframes faq-search-sweep {
  0% { left: -45%; }
  100% { left: 105%; }
}

.faq-body--searching {
  opacity: 0.28;
  filter: blur(2px);
}

@keyframes faq-blink {
  0%, 60% { opacity: 1; }
  61%, 100% { opacity: 0.25; }
}

.faq-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: $space-12;
  padding-top: $space-8;
  padding-bottom: $space-16;
  transition: opacity $dur-med $ease-gold, filter $dur-med $ease-gold;
}

.faq-body__empty {
  padding: $space-8 0;
  font-size: $text-base;
  color: $color-text-muted;
}

.faq-category {
  &__head {
    max-width: 60ch;
    margin-bottom: $space-5;
  }

  &__code {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    color: $color-comms;
  }

  &__code-tick {
    width: 18px;
    height: 1px;
    background: $color-comms;
    box-shadow: 0 0 8px rgba($color-comms, 0.5);
  }

  &__title {
    margin-top: $space-2;
    font-size: $text-2xl;
    font-weight: 500;
    letter-spacing: $tracking-tight;
    color: $color-text;
  }

  &__desc {
    margin-top: $space-3;
    font-size: $text-base;
    line-height: $leading-relaxed;
    color: $color-text-muted;
  }

  &__list {
    border-top: 1px solid $color-border;
  }
}

.faq-cta {
  position: relative;
  z-index: 2;
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

@media (prefers-reduced-motion: reduce) {
  .faq-page__scan,
  .faq-hero__readout-dot,
  .faq-hero__status-bar-fill {
    animation: none;
  }

  .faq-body,
  .faq-body--searching {
    opacity: 1;
    filter: none;
    transition: none;
  }
}
</style>
