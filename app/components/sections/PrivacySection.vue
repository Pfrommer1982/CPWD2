<script setup lang="ts">
import { localeList, resolveLocaleMessage } from '~/utils/i18n'

const privacy = useSectionTranslations('privacy')
const localePath = useLocalePath()
const sectionRef = ref<HTMLElement | null>(null)

interface PrivacySection {
  id: string
  title: string
  paragraphs: string[]
}

const sections = computed(() => {
  const raw = privacy.tm('sections')
  return localeList<Record<string, unknown>>(raw).map((item) => {
    const paragraphsRaw = item.paragraphs
    const paragraphs = localeList<string>(paragraphsRaw).map(p =>
      resolveLocaleMessage(p, privacy.rt),
    )
    return {
      id: resolveLocaleMessage(item.id, privacy.rt),
      title: resolveLocaleMessage(item.title, privacy.rt),
      paragraphs,
    } satisfies PrivacySection
  })
})

const rights = computed(() => {
  const raw = privacy.tm('rights')
  return localeList<string>(raw).map(item => resolveLocaleMessage(item, privacy.rt))
})
</script>

<template>
  <section ref="sectionRef" class="privacy-page">
    <div class="privacy-page__backdrop" aria-hidden="true">
      <div class="privacy-page__shield" />
      <div class="privacy-page__grid" />
    </div>

    <div class="privacy-page__inner container">
      <header class="privacy-page__hero">
        <div class="privacy-page__hero-copy">
          <div class="privacy-page__hero-meta">
            <span class="section-label">{{ privacy.t('label') }}</span>
            <span class="privacy-page__badge font-mono">{{ privacy.t('badge') }}</span>
          </div>
          <h1 class="privacy-page__heading font-display">
            {{ privacy.t('heading') }}
          </h1>
          <p class="privacy-page__intro">
            {{ privacy.t('intro') }}
          </p>
          <p class="privacy-page__updated font-mono">
            {{ privacy.t('updatedLabel') }} · {{ privacy.t('updatedDate') }}
          </p>
        </div>

        <LegalPrivacyEncryptStream class="privacy-page__encrypt" />
      </header>

      <div class="privacy-page__layout">
        <nav class="privacy-page__nav" :aria-label="privacy.t('navLabel')">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="privacy-page__nav-link font-mono"
          >
            {{ section.title }}
          </a>
        </nav>

        <div class="privacy-page__content">
          <article
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            class="privacy-page__card"
          >
            <div class="privacy-page__card-head">
              <span class="privacy-page__card-icon" aria-hidden="true" />
              <h2 class="privacy-page__card-title font-display">
                {{ section.title }}
              </h2>
            </div>
            <p
              v-for="(paragraph, i) in section.paragraphs"
              :key="`${section.id}-${i}`"
              class="privacy-page__card-body"
            >
              {{ paragraph }}
            </p>
          </article>

          <aside class="privacy-page__rights">
            <h2 class="privacy-page__rights-title font-display">
              {{ privacy.t('rightsTitle') }}
            </h2>
            <p class="privacy-page__rights-intro">
              {{ privacy.t('rightsIntro') }}
            </p>
            <ul class="privacy-page__rights-list">
              <li
                v-for="(right, i) in rights"
                :key="`right-${i}`"
                class="privacy-page__rights-item font-mono"
              >
                {{ right }}
              </li>
            </ul>
          </aside>

          <footer class="privacy-page__footer">
            <div class="privacy-page__footer-block">
              <h3 class="privacy-page__footer-title font-mono">
                {{ privacy.t('contactTitle') }}
              </h3>
              <p class="privacy-page__footer-body">
                {{ privacy.t('contactBody') }}
              </p>
            </div>
            <div class="privacy-page__footer-block">
              <h3 class="privacy-page__footer-title font-mono">
                {{ privacy.t('authorityTitle') }}
              </h3>
              <p class="privacy-page__footer-body">
                {{ privacy.t('authorityBody') }}
              </p>
            </div>
          </footer>

          <NuxtLink :to="localePath('/contact')" class="privacy-page__back">
            ← info@cpwd.nl
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.privacy-page {
  position: relative;
  padding: clamp(96px, 14vh, 128px) 0 clamp(72px, 10vh, 96px);
  overflow: hidden;

  &__backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__shield {
    position: absolute;
    top: 8%;
    right: -8%;
    width: min(420px, 55vw);
    height: min(420px, 55vw);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56, 150, 90, 0.12) 0%, transparent 68%);
    mask-image: radial-gradient(circle, #000 25%, transparent 72%);
  }

  &__grid {
    position: absolute;
    inset: 0;
    opacity: 0.16;
    background-image:
      linear-gradient(rgba(56, 150, 90, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 150, 90, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 80% 60% at 30% 20%, #000 10%, transparent 75%);
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__hero {
    display: grid;
    gap: clamp(28px, 4vw, 40px);
    margin-bottom: clamp(40px, 6vh, 56px);

    @media (min-width: 900px) {
      grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
      align-items: start;
    }
  }

  &__hero-copy {
    max-width: 52ch;
  }

  &__encrypt {
    width: 100%;
  }

  &__hero-meta {
    display: flex;
    align-items: center;
    gap: $space-4;
    margin-bottom: $space-5;
  }

  &__badge {
    padding: 4px 10px;
    border: 1px solid rgba($color-gold, 0.28);
    border-radius: $radius-full;
    font-size: 0.62rem;
    letter-spacing: $tracking-wider;
    color: rgba($color-gold-light, 0.75);
    text-transform: uppercase;
  }

  &__heading {
    font-size: clamp(2.2rem, 4.5vw, 3.4rem);
    font-weight: 300;
    line-height: 1.05;
    letter-spacing: $tracking-tight;
    margin-bottom: $space-5;
  }

  &__intro {
    font-size: clamp($text-base, 1.1vw, $text-lg);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin-bottom: $space-4;
  }

  &__updated {
    font-size: 0.68rem;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
    text-transform: uppercase;
  }

  &__layout {
    display: grid;
    gap: clamp(32px, 4vw, 48px);

    @media (min-width: 900px) {
      grid-template-columns: minmax(0, 200px) minmax(0, 1fr);
      align-items: start;
    }
  }

  &__nav {
    display: none;
    flex-direction: column;
    gap: $space-2;
    position: sticky;
    top: clamp(96px, 14vh, 120px);

    @media (min-width: 900px) {
      display: flex;
    }
  }

  &__nav-link {
    font-size: 0.68rem;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
    text-decoration: none;
    padding: 6px 0;
    border-left: 2px solid transparent;
    padding-left: $space-3;
    transition: color 0.2s ease, border-color 0.2s ease;

    &:hover {
      color: $color-gold-light;
      border-color: rgba($color-gold, 0.45);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__card {
    padding: clamp(20px, 3vw, 28px);
    border: 1px solid rgba($color-gold, 0.14);
    border-radius: $radius-md;
    background: rgba($color-bg-alt, 0.55);
    scroll-margin-top: 120px;
  }

  &__card-head {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin-bottom: $space-4;
  }

  &__card-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid rgba($color-gold, 0.35);
    background:
      radial-gradient(circle at 50% 35%, rgba($color-gold-light, 0.35), transparent 60%),
      rgba(56, 150, 90, 0.08);
    flex-shrink: 0;

    &::after {
      content: '';
      display: block;
      width: 8px;
      height: 10px;
      margin: 7px auto 0;
      border: 1px solid rgba($color-gold-light, 0.6);
      border-radius: 2px 2px 4px 4px;
    }
  }

  &__card-title {
    font-size: clamp(1.15rem, 2vw, 1.45rem);
    font-weight: 300;
    line-height: 1.15;
    letter-spacing: $tracking-tight;
  }

  &__card-body {
    font-size: $text-sm;
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin: 0 0 $space-3;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__rights {
    padding: clamp(24px, 3.5vw, 32px);
    border: 1px solid rgba(56, 150, 90, 0.22);
    border-radius: $radius-md;
    background:
      linear-gradient(145deg, rgba(56, 150, 90, 0.08), rgba($color-bg-alt, 0.6));
  }

  &__rights-title {
    font-size: clamp(1.25rem, 2.2vw, 1.6rem);
    font-weight: 300;
    margin-bottom: $space-3;
  }

  &__rights-intro {
    font-size: $text-sm;
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin-bottom: $space-4;
  }

  &__rights-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: $space-2;

    @media (min-width: 640px) {
      grid-template-columns: 1fr 1fr;
      gap: $space-3 $space-5;
    }
  }

  &__rights-item {
    font-size: 0.72rem;
    letter-spacing: 0.03em;
    color: rgba($color-text-muted, 0.95);
    padding-left: $space-4;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.45em;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba($color-gold, 0.65);
    }
  }

  &__footer {
    display: grid;
    gap: $space-5;
    padding-top: $space-4;
    border-top: 1px solid $color-border;

    @media (min-width: 640px) {
      grid-template-columns: 1fr 1fr;
    }
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
    margin: 0;
  }

  &__back {
    align-self: flex-start;
    margin-top: $space-2;
    font-size: $text-sm;
    color: $color-text-faint;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $color-gold-light;
    }
  }
}
</style>
