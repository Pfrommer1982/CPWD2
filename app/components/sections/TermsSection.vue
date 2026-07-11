<script setup lang="ts">
import { localeList, resolveLocaleMessage } from '~/utils/i18n'

const terms = useSectionTranslations('terms')
const localePath = useLocalePath()

const sectionRef = ref<HTMLElement | null>(null)
const stampRef = ref<HTMLElement | null>(null)
const articlesRef = ref<HTMLElement | null>(null)

interface TermArticle {
  num: string
  title: string
  body: string
}

const articles = computed(() => {
  const raw = terms.tm('articles')
  return localeList<Record<string, unknown>>(raw).map(item => ({
    num: resolveLocaleMessage(item.num, terms.rt),
    title: resolveLocaleMessage(item.title, terms.rt),
    body: resolveLocaleMessage(item.body, terms.rt),
  } satisfies TermArticle))
})

onMounted(async () => {
  if (!import.meta.client || !sectionRef.value) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  const { init, createContext } = useGsap()
  const gsap = await init()
  if (!gsap) return

  await createContext(sectionRef.value, () => {
    if (stampRef.value) {
      gsap.from(stampRef.value, {
        scale: 2.4,
        rotation: -18,
        opacity: 0,
        duration: 0.85,
        ease: 'back.out(1.4)',
        delay: 0.25,
      })
    }

    const articleEls = articlesRef.value?.querySelectorAll('.terms-page__article') ?? []
    articleEls.forEach((el, i) => {
      gsap.from(el, {
        x: i % 2 === 0 ? -24 : 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      })
    })
  })
})
</script>

<template>
  <section ref="sectionRef" class="terms-page">
    <div class="terms-page__backdrop" aria-hidden="true">
      <div class="terms-page__blueprint" />
      <div class="terms-page__rule terms-page__rule--h" />
      <div class="terms-page__rule terms-page__rule--v" />
    </div>

    <div class="terms-page__inner container">
      <header class="terms-page__hero">
        <div class="terms-page__doc-head font-mono">
          <span class="terms-page__ref">{{ terms.t('ref') }}</span>
          <span class="terms-page__version">
            {{ terms.t('updatedLabel') }} · {{ terms.t('updatedDate') }}
          </span>
        </div>

        <span class="section-label">{{ terms.t('label') }}</span>
        <h1 class="terms-page__heading font-display">
          {{ terms.t('heading') }}
        </h1>
        <p class="terms-page__intro">
          {{ terms.t('intro') }}
        </p>

        <div ref="stampRef" class="terms-page__seal" aria-hidden="true">
          <span class="terms-page__seal-ring" />
          <span class="terms-page__seal-text font-display">{{ terms.t('stamp') }}</span>
          <span class="terms-page__seal-approved font-mono">{{ terms.t('sealApproved') }}</span>
        </div>
      </header>

      <ol ref="articlesRef" class="terms-page__articles">
        <li
          v-for="article in articles"
          :key="article.num"
          class="terms-page__article"
        >
          <span class="terms-page__article-num font-mono">{{ article.num }}</span>
          <div class="terms-page__article-body">
            <h2 class="terms-page__article-title font-display">
              {{ article.title }}
            </h2>
            <p class="terms-page__article-text">
              {{ article.body }}
            </p>
          </div>
        </li>
      </ol>

      <footer class="terms-page__footer">
        <div class="terms-page__footer-inner">
          <h3 class="terms-page__footer-title font-mono">
            {{ terms.t('contactTitle') }}
          </h3>
          <p class="terms-page__footer-body">
            {{ terms.t('contactBody') }}
          </p>

          <div class="terms-page__signature">
            <UiAppLogo :height="72" />
            <span class="terms-page__signature-label font-mono">{{ terms.t('sealSigned') }}</span>
          </div>

          <NuxtLink :to="localePath('/contact')" class="terms-page__footer-link">
            info@cpwd.nl →
          </NuxtLink>
        </div>
      </footer>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.terms-page {
  position: relative;
  padding: clamp(96px, 14vh, 128px) 0 clamp(72px, 10vh, 96px);
  overflow: hidden;
  background: $color-bg;

  &__backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__blueprint {
    position: absolute;
    inset: 0;
    opacity: 0.22;
    background-image:
      linear-gradient(rgba($color-gold, 0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba($color-gold, 0.07) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(to bottom, #000 0%, transparent 92%);
  }

  &__rule {
    position: absolute;
    background: rgba($color-gold, 0.08);
    pointer-events: none;

    &--h {
      top: clamp(120px, 18vh, 180px);
      left: 0;
      right: 0;
      height: 1px;
    }

    &--v {
      top: 0;
      bottom: 0;
      left: clamp(48px, 8vw, 120px);
      width: 1px;
      opacity: 0.35;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__hero {
    position: relative;
    max-width: 58ch;
    margin-bottom: clamp(48px, 7vh, 64px);
    padding-bottom: clamp(32px, 5vh, 48px);
    padding-right: clamp(100px, 16vw, 160px);
    border-bottom: 1px solid $color-border;
  }

  &__doc-head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: $space-3;
    margin-bottom: $space-5;
    font-size: 0.68rem;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
    text-transform: uppercase;
  }

  &__ref {
    color: rgba($color-gold, 0.55);
  }

  &__heading {
    font-size: clamp(2.2rem, 4.5vw, 3.4rem);
    font-weight: 300;
    line-height: 1.05;
    letter-spacing: $tracking-tight;
    margin: $space-5 0;
  }

  &__intro {
    font-size: clamp($text-base, 1.1vw, $text-lg);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    max-width: 48ch;
  }

  &__seal {
    position: absolute;
    top: clamp(8px, 2vh, 24px);
    right: 0;
    width: clamp(88px, 14vw, 120px);
    height: clamp(88px, 14vw, 120px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: rotate(-12deg);
    will-change: transform, opacity;
  }

  &__seal-ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba($color-gold, 0.45);
    border-radius: 50%;
    box-shadow:
      inset 0 0 0 4px rgba($color-bg, 0.9),
      inset 0 0 0 5px rgba($color-gold, 0.2),
      0 0 24px rgba($color-gold, 0.12);

    &::before {
      content: '';
      position: absolute;
      inset: 8px;
      border: 1px dashed rgba($color-gold, 0.25);
      border-radius: 50%;
    }
  }

  &__seal-text {
    position: relative;
    z-index: 1;
    font-size: clamp(1rem, 2vw, 1.25rem);
    font-weight: 300;
    letter-spacing: 0.12em;
    color: rgba($color-gold-light, 0.85);
  }

  &__seal-approved {
    position: relative;
    z-index: 1;
    margin-top: 2px;
    font-size: 0.48rem;
    letter-spacing: $tracking-wider;
    color: rgba($color-gold, 0.55);
    text-transform: uppercase;
  }

  &__articles {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__article {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: clamp(16px, 3vw, 28px);
    padding: clamp(24px, 4vw, 32px) 0;
    border-bottom: 1px solid rgba($color-border, 0.85);

    @media (min-width: 768px) {
      grid-template-columns: 72px 1fr;
    }
  }

  &__article-num {
    font-size: clamp(1.5rem, 3vw, 2rem);
    line-height: 1;
    letter-spacing: $tracking-tight;
    color: rgba($color-gold, 0.35);
    padding-top: 0.15em;
  }

  &__article-title {
    font-size: clamp(1.15rem, 2vw, 1.5rem);
    font-weight: 300;
    line-height: 1.15;
    letter-spacing: $tracking-tight;
    margin-bottom: $space-3;
    padding-left: $space-4;
    border-left: 2px solid rgba($color-gold, 0.45);
  }

  &__article-text {
    font-size: $text-sm;
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin: 0;
    max-width: 62ch;
  }

  &__footer {
    margin-top: clamp(40px, 6vh, 56px);
  }

  &__footer-inner {
    padding: clamp(24px, 4vw, 32px);
    border: 1px solid rgba($color-gold, 0.18);
    border-radius: $radius-md;
    background:
      repeating-linear-gradient(
        -45deg,
        rgba($color-bg-alt, 0.4) 0,
        rgba($color-bg-alt, 0.4) 2px,
        rgba($color-bg, 0.2) 2px,
        rgba($color-bg, 0.2) 4px
      );
  }

  &__footer-title {
    font-size: 0.68rem;
    letter-spacing: $tracking-wider;
    color: $color-gold;
    text-transform: uppercase;
    margin-bottom: $space-2;
  }

  &__footer-body {
    font-size: $text-sm;
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin: 0 0 $space-4;
  }

  &__signature {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    margin-bottom: $space-4;
    padding: clamp(20px, 3vw, 28px) clamp(16px, 3vw, 24px);
    border: 1px solid rgba($color-gold, 0.1);
    border-radius: $radius-sm;
    background: rgba($color-bg-alt, 0.35);
  }

  &__signature-label {
    margin-top: $space-3;
    font-size: 0.62rem;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
    text-transform: uppercase;
  }

  &__footer-link {
    font-size: $text-sm;
    color: $color-gold-light;
    text-decoration: none;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

@media (max-width: 767px) {
  .terms-page__hero {
    padding-right: 0;
    padding-bottom: clamp(120px, 22vw, 140px);
  }

  .terms-page__seal {
    top: auto;
    bottom: 0;
    right: 0;
  }
}
</style>
