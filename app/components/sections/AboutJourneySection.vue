<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { localeList, resolveLocaleMessage } from '~/utils/i18n'

const GITHUB_AVATAR = 'https://avatars.githubusercontent.com/u/90003610?v=4'
const GITHUB_URL = 'https://github.com/Pfrommer1982'

const about = useSectionTranslations('about')
const localePath = useLocalePath()
const { parseHighlightedBody } = useSplitText()

const isMobile = useMediaQuery('(max-width: 1099px)', { ssrWidth: 1100 })
const layout = computed(() => (isMobile.value ? 'mobile' : 'desktop'))

const rootRef = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const spineFillRef = ref<HTMLElement | null>(null)
const chapterRefs = ref<HTMLElement[]>([])
const finaleRef = ref<HTMLElement | null>(null)
const activeChapter = ref(-1)
const journeyReady = ref(false)
const statRefs = ref<HTMLElement[]>([])

const spineCodes = ['OP-01', 'INTEL-02', 'WPN-03', 'REC-04'] as const

const operatorFields = computed(() => {
  const raw = about.tm('page.operator.fields')
  return localeList<{ key: string; value: string }>(raw).map(f => ({
    key: resolveLocaleMessage(f.key, about.rt),
    value: resolveLocaleMessage(f.value, about.rt),
  }))
})

const missionDirectives = computed(() => {
  const raw = about.tm('page.mission.directives')
  return localeList<string>(raw).map(d => resolveLocaleMessage(d, about.rt))
})

const loadoutItems = computed(() => {
  const raw = about.tm('page.loadout.items')
  return localeList<Record<string, unknown>>(raw).map(item => ({
    name: resolveLocaleMessage(item.name, about.rt),
    type: resolveLocaleMessage(item.type, about.rt),
    desc: resolveLocaleMessage(item.desc, about.rt),
  }))
})

const missionBodyHtml = computed(() => parseHighlightedBody(about.t('page.mission.body')))

const stats = [
  { value: 5, suffix: '+', key: 'years' },
  { value: 30, suffix: '+', key: 'projects' },
  { value: 12, suffix: '', key: 'clients' },
  { value: 18, suffix: '', key: 'repos' },
]

function setChapterRef(el: Element | null, index: number) {
  if (el) chapterRefs.value[index] = el as HTMLElement
}

function titleWords(title: string) {
  return title.split(/\s+/).filter(Boolean)
}

function spinePointActive(index: number) {
  return activeChapter.value >= index
}

useAboutJourney({
  root: rootRef,
  chapters: chapterRefs,
  spineFill: spineFillRef,
  hero: heroRef,
  finale: finaleRef,
  activeChapter,
  layout,
  ready: journeyReady,
})

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    journeyReady.value = true
  })

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  statRefs.value.forEach((el, i) => {
    const target = stats[i]
    if (!el || !target) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target.value,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
      onUpdate: () => {
        el.textContent = `${Math.round(obj.val)}${target.suffix}`
      },
    })
  })
})
</script>

<template>
  <div ref="rootRef" class="about-journey">
    <AboutIntelBackdrop :root="rootRef" :ready="journeyReady" />

    <header ref="heroRef" class="about-journey__hero">
      <div class="about-journey__hero-inner container">
        <div class="about-journey__stamp font-mono" data-hero-fade>
          {{ about.t('page.hero.classification') }}
        </div>
        <span class="section-label" data-hero-fade>{{ about.t('page.hero.label') }}</span>
        <p class="about-journey__file-id font-mono" data-hero-fade>{{ about.t('page.hero.fileId') }}</p>
        <h1 class="about-journey__heading font-display">
          <span
            v-for="(word, wi) in titleWords(about.t('page.hero.heading'))"
            :key="`ah-${wi}`"
            class="about-journey__heading-word"
          >
            <span data-hero-word class="about-journey__heading-inner">{{ word }}</span>
          </span>
        </h1>
        <p class="about-journey__intro" data-hero-fade>
          {{ about.t('page.hero.intro') }}
        </p>
        <span class="about-journey__hint font-mono" data-hero-fade>
          {{ about.t('page.hero.scrollHint') }}
        </span>
      </div>
    </header>

    <div
      v-if="layout === 'desktop'"
      class="about-journey__hud"
      aria-hidden="true"
    >
      <div class="about-journey__hud-frame">
        <span class="about-journey__hud-corner about-journey__hud-corner--tl" />
        <span class="about-journey__hud-corner about-journey__hud-corner--tr" />
        <span class="about-journey__hud-corner about-journey__hud-corner--bl" />
        <span class="about-journey__hud-corner about-journey__hud-corner--br" />

        <aside class="about-journey__spine">
          <div class="about-journey__spine-track">
            <div ref="spineFillRef" class="about-journey__spine-fill" />
          </div>
          <ol class="about-journey__spine-points">
            <li
              class="about-journey__spine-point"
              :class="{ 'about-journey__spine-point--active': activeChapter >= -1 }"
            >
              <span class="about-journey__spine-dot" />
              <span class="about-journey__spine-label font-mono">{{ about.t('page.spine.departure') }}</span>
            </li>
            <li
              v-for="(code, index) in spineCodes"
              :key="code"
              class="about-journey__spine-point"
              :class="{ 'about-journey__spine-point--active': spinePointActive(index) }"
            >
              <span class="about-journey__spine-dot" />
              <span class="about-journey__spine-label font-mono">{{ code }}</span>
            </li>
            <li
              class="about-journey__spine-point"
              :class="{ 'about-journey__spine-point--active': activeChapter >= spineCodes.length }"
            >
              <span class="about-journey__spine-dot" />
              <span class="about-journey__spine-label font-mono">{{ about.t('page.spine.arrival') }}</span>
            </li>
          </ol>
        </aside>
      </div>
    </div>

    <div class="about-journey__route">
      <!-- OP-01 Operator -->
      <article
        :ref="el => setChapterRef(el, 0)"
        class="about-chapter"
        :class="{ 'about-chapter--mobile': layout === 'mobile' }"
      >
        <div class="about-chapter__sticky">
          <span class="about-chapter__code font-mono">{{ about.t('page.operator.code') }}</span>
          <div class="about-chapter__inner container about-chapter__inner--split">
            <div class="about-chapter__visual">
              <AboutDossierFeed
                :avatar="GITHUB_AVATAR"
                :connecting="about.t('page.operator.feedConnecting')"
                :downloading="about.t('page.operator.feedDownloading')"
                :live="about.t('page.operator.feedLive')"
                :placeholder="about.t('page.operator.photoPlaceholder')"
              />
            </div>
            <div class="about-chapter__content" data-chapter-side="right">
              <span class="section-label">{{ about.t('page.operator.label') }}</span>
              <h2 class="about-chapter__title font-display">
                <span
                  v-for="(word, wi) in titleWords(about.t('page.operator.heading'))"
                  :key="`op-${wi}`"
                  class="about-chapter__title-word"
                >
                  <span class="about-chapter__title-inner" data-chapter-word>{{ word }}</span>
                </span>
              </h2>
              <p class="about-chapter__role font-mono" data-chapter-fade>
                {{ about.t('page.operator.role') }}
              </p>
              <p class="about-chapter__desc" data-chapter-desc>
                {{ about.t('page.operator.bio') }}
              </p>
              <dl class="about-dossier-fields" data-chapter-fade>
                <div
                  v-for="field in operatorFields"
                  :key="field.key"
                  class="about-dossier-fields__row"
                >
                  <dt class="about-dossier-fields__key font-mono">{{ field.key }}</dt>
                  <dd class="about-dossier-fields__val font-mono">{{ field.value }}</dd>
                </div>
              </dl>
              <a
                :href="GITHUB_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="about-dossier-link font-mono"
                data-chapter-fade
                data-cursor="hover"
              >
                {{ about.t('page.operator.github') }} →
              </a>
            </div>
          </div>
        </div>
      </article>

      <!-- INTEL-02 Mission -->
      <article
        :ref="el => setChapterRef(el, 1)"
        class="about-chapter"
        :class="{ 'about-chapter--mobile': layout === 'mobile' }"
      >
        <div class="about-chapter__sticky">
          <span class="about-chapter__code font-mono">{{ about.t('page.mission.code') }}</span>
          <div class="about-chapter__inner container">
            <div class="about-chapter__content about-chapter__content--wide" data-chapter-side="left">
              <span class="section-label">{{ about.t('page.mission.label') }}</span>
              <h2 class="about-chapter__title font-display">
                <span
                  v-for="(word, wi) in titleWords(about.t('page.mission.heading'))"
                  :key="`mi-${wi}`"
                  class="about-chapter__title-word"
                >
                  <span class="about-chapter__title-inner" data-chapter-word>{{ word }}</span>
                </span>
              </h2>
              <p class="about-chapter__desc about-chapter__desc--rich" data-chapter-desc v-html="missionBodyHtml" />
              <ul class="about-directives">
                <li
                  v-for="(directive, di) in missionDirectives"
                  :key="`dir-${di}`"
                  class="about-directives__item font-mono"
                  data-chapter-item
                >
                  <span class="about-directives__index">{{ String(di + 1).padStart(2, '0') }}</span>
                  {{ directive }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      <!-- WPN-03 Loadout -->
      <article
        :ref="el => setChapterRef(el, 2)"
        class="about-chapter"
        :class="{ 'about-chapter--mobile': layout === 'mobile' }"
      >
        <div class="about-chapter__sticky">
          <span class="about-chapter__code font-mono">{{ about.t('page.loadout.code') }}</span>
          <div class="about-chapter__inner container">
            <div class="about-chapter__content about-chapter__content--wide" data-chapter-side="right">
              <span class="section-label">{{ about.t('page.loadout.label') }}</span>
              <h2 class="about-chapter__title font-display">
                <span
                  v-for="(word, wi) in titleWords(about.t('page.loadout.heading'))"
                  :key="`ld-${wi}`"
                  class="about-chapter__title-word"
                >
                  <span class="about-chapter__title-inner" data-chapter-word>{{ word }}</span>
                </span>
              </h2>
              <p class="about-chapter__desc" data-chapter-desc>
                {{ about.t('page.loadout.intro') }}
              </p>
              <div class="about-loadout">
                <header class="about-loadout__head font-mono">
                  <span class="about-loadout__head-slot">Slot</span>
                  <span class="about-loadout__head-sys">System</span>
                  <span class="about-loadout__head-cap">Capability</span>
                </header>
                <article
                  v-for="(item, li) in loadoutItems"
                  :key="item.name"
                  class="about-loadout__row"
                  data-chapter-item
                >
                  <span class="about-loadout__slot font-mono">{{ String(li + 1).padStart(2, '0') }}</span>
                  <div class="about-loadout__sys">
                    <span class="about-loadout__type font-mono">{{ item.type }}</span>
                    <h3 class="about-loadout__name font-mono">{{ item.name }}</h3>
                  </div>
                  <p class="about-loadout__desc">{{ item.desc }}</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- REC-04 Record -->
      <article
        :ref="el => setChapterRef(el, 3)"
        class="about-chapter"
        :class="{ 'about-chapter--mobile': layout === 'mobile' }"
      >
        <div class="about-chapter__sticky">
          <span class="about-chapter__code font-mono">{{ about.t('page.record.code') }}</span>
          <div class="about-chapter__inner container">
            <div class="about-chapter__content about-chapter__content--center" data-chapter-side="left">
              <span class="section-label">{{ about.t('page.record.label') }}</span>
              <h2 class="about-chapter__title font-display">
                <span
                  v-for="(word, wi) in titleWords(about.t('page.record.heading'))"
                  :key="`rec-${wi}`"
                  class="about-chapter__title-word"
                >
                  <span class="about-chapter__title-inner" data-chapter-word>{{ word }}</span>
                </span>
              </h2>
              <p class="about-chapter__desc" data-chapter-desc>
                {{ about.t('page.record.intro') }}
              </p>
              <div class="about-record">
                <div
                  v-for="(stat, si) in stats"
                  :key="stat.key"
                  class="about-record__stat"
                  data-chapter-item
                >
                  <span
                    :ref="el => { if (el) statRefs[si] = el as HTMLElement }"
                    class="about-record__value font-display"
                  >0</span>
                  <span class="about-record__label font-mono">
                    {{ about.t(`page.record.stats.${stat.key}`) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- CLR-05 CTA -->
      <footer
        ref="finaleRef"
        class="about-chapter about-chapter--finale"
        :class="{ 'about-chapter--mobile': layout === 'mobile' }"
      >
        <div class="about-chapter__inner about-chapter__inner--finale container">
          <span class="about-chapter__code about-chapter__code--finale font-mono">{{ about.t('page.cta.code') }}</span>
          <div class="about-chapter__content about-chapter__content--center">
            <span class="section-label" data-chapter-fade>{{ about.t('page.cta.label') }}</span>
            <h2 class="about-chapter__title about-chapter__title--finale font-display">
              <span
                v-for="(word, wi) in titleWords(about.t('page.cta.heading'))"
                :key="`cta-${wi}`"
                class="about-chapter__title-word"
              >
                <span class="about-chapter__title-inner" data-chapter-word>{{ word }}</span>
              </span>
            </h2>
            <p class="about-chapter__desc about-chapter__desc--finale" data-chapter-desc>
              {{ about.t('page.cta.subtext') }}
            </p>
            <GsapMagneticButton
              :to="localePath('/contact')"
              variant="primary"
              class="about-chapter__cta"
              data-chapter-fade
            >
              {{ about.t('page.cta.button') }}
              <span aria-hidden="true">→</span>
            </GsapMagneticButton>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-journey {
  position: relative;
  z-index: 2;
  background: transparent;
  overflow: visible;

  &__hero {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    padding: clamp(120px, 18vh, 180px) 0 clamp(64px, 10vh, 96px);
    z-index: 2;

    @media (min-width: 1100px) {
      padding-top: clamp(108px, 14vh, 148px);
    }
  }

  &__hero-inner {
    position: relative;
    z-index: 2;
    max-width: min(920px, 90vw);

    @media (min-width: 1100px) {
      padding-left: clamp(108px, 11vw, 148px);
    }
  }

  &__stamp {
    display: block;
    width: fit-content;
    font-size: 9px;
    letter-spacing: $tracking-wider;
    color: rgba($color-gold, 0.55);
    border: 1px solid rgba($color-gold, 0.25);
    padding: 4px 10px;
    margin-bottom: $space-5;
  }

  &__hero-inner > .section-label {
    display: flex;
    width: fit-content;
  }

  &__file-id {
    font-size: 10px;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
    margin-bottom: $space-4;
  }

  &__heading {
    font-size: clamp(3rem, 7vw + 1rem, 7rem);
    font-weight: 300;
    line-height: 0.92;
    letter-spacing: $tracking-tight;
    margin-block: $space-6;
    perspective: 900px;
  }

  &__heading-word {
    display: inline-block;
    overflow: hidden;
    margin-right: 0.2em;
    vertical-align: top;
  }

  &__heading-inner {
    display: inline-block;
  }

  &__intro {
    font-size: clamp($text-lg, 1vw + 1rem, $text-xl);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    max-width: 52ch;
    margin-bottom: $space-8;
  }

  &__hint {
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  &__hud {
    position: fixed;
    inset: calc(88px + 10px) clamp(14px, 2.2vw, 32px) clamp(14px, 2vh, 24px) clamp(14px, 2.2vw, 32px);
    z-index: 3;
    pointer-events: none;

    @media (max-width: 1099px) {
      display: none;
    }
  }

  &__hud-frame {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid rgba($color-gold, 0.09);
  }

  &__hud-corner {
    position: absolute;
    width: 18px;
    height: 18px;
    border-color: rgba($color-gold, 0.28);
    border-style: solid;

    &--tl {
      top: -1px;
      left: -1px;
      border-width: 1px 0 0 1px;
    }

    &--tr {
      top: -1px;
      right: -1px;
      border-width: 1px 1px 0 0;
    }

    &--bl {
      bottom: -1px;
      left: -1px;
      border-width: 0 0 1px 1px;
    }

    &--br {
      bottom: -1px;
      right: -1px;
      border-width: 0 1px 1px 0;
    }
  }

  &__spine {
    position: absolute;
    left: clamp(14px, 1.6vw, 22px);
    top: clamp(20px, 4vh, 36px);
    bottom: clamp(20px, 4vh, 36px);
    display: flex;
    align-items: stretch;
    gap: 10px;
    max-width: 96px;
  }

  &__spine-track {
    position: relative;
    width: 1px;
    flex-shrink: 0;
    align-self: stretch;
    background: rgba($color-gold, 0.12);
    overflow: hidden;
  }

  &__spine-fill {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, $color-gold-dark, $color-gold-light);
    transform-origin: top center;
    transform: scaleY(0);
  }

  &__spine-points {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    min-height: 0;
    list-style: none;
    padding: 2px 0;
    margin: 0;
  }

  &__spine-point {
    display: flex;
    align-items: center;
    gap: 7px;
    opacity: 0.35;
    transition: opacity $dur-med $ease-gold;

    &--active {
      opacity: 1;
    }
  }

  &__spine-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid rgba($color-gold, 0.45);
    background: $color-bg;

    .about-journey__spine-point--active & {
      background: $color-gold;
      border-color: $color-gold-light;
      box-shadow: 0 0 10px rgba($color-gold, 0.45);
    }
  }

  &__spine-label {
    font-size: 7px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $color-text-faint;
    white-space: nowrap;
    line-height: 1.2;

    .about-journey__spine-point--active & {
      color: $color-gold;
    }
  }

  &__route {
    position: relative;
    z-index: 2;

    @media (min-width: 1100px) {
      padding-left: clamp(108px, 11vw, 148px);
    }
  }
}

.about-chapter {
  position: relative;
  min-height: 125vh;
  background: transparent;

  &--mobile {
    min-height: auto;
    padding-block: clamp(56px, 12vh, 88px);
  }

  &--finale {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  &__sticky {
    position: sticky;
    top: 0;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    z-index: 2;

    .about-chapter--mobile & {
      position: relative;
      top: auto;
      min-height: auto;
    }
  }

  &__code {
    position: absolute;
    top: clamp(80px, 12vh, 120px);
    right: clamp(16px, 4vw, 48px);
    font-size: clamp(4rem, 10vw, 9rem);
    font-weight: 300;
    line-height: 1;
    color: $color-gold;
    opacity: 0.06;
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.04em;

    &--finale {
      top: 50%;
      right: clamp(12px, 4vw, 48px);
      transform: translateY(-50%);
    }

    .about-chapter--mobile & {
      top: $space-5;
      right: $space-5;
      font-size: clamp(2.5rem, 12vw, 4rem);
    }
  }

  &__inner {
    position: relative;
    z-index: 2;
    width: 100%;

    &--split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: clamp(40px, 6vw, 80px);
      align-items: center;

      @media (max-width: 899px) {
        grid-template-columns: 1fr;
      }
    }

    &--finale {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: min(100vh, 100dvh);
    }
  }

  &__visual {
    position: relative;
  }

  &__content {
    position: relative;

    &--wide {
      max-width: min(780px, 92vw);
    }

    &--center {
      text-align: center;
      margin-inline: auto;
      max-width: min(680px, 92vw);
    }
  }

  &__title {
    font-size: clamp(2rem, 4vw + 0.5rem, 3.75rem);
    font-weight: 300;
    line-height: 1.05;
    letter-spacing: $tracking-tight;
    margin-block: $space-5;

    &--finale {
      font-size: clamp(2.25rem, 5vw + 0.5rem, 4.5rem);
    }
  }

  &__title-word {
    display: inline-block;
    overflow: hidden;
    margin-right: 0.18em;
    vertical-align: top;
  }

  &__title-inner {
    display: inline-block;
  }

  &__role {
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-gold;
    margin-bottom: $space-5;
  }

  &__desc {
    font-size: clamp($text-base, 0.5vw + 1rem, $text-lg);
    line-height: $leading-relaxed;
    color: $color-text-muted;
    max-width: 52ch;
    margin-bottom: $space-6;

    &--rich :deep(em) {
      font-style: normal;
      color: $color-text;
    }

    &--finale {
      margin-inline: auto;
    }
  }

  &__cta {
    margin-top: $space-6;
  }
}

.about-dossier-fields {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: $space-6;
  border: 1px solid $color-border;

  &__row {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: $space-4;
    padding: 10px 14px;
    border-bottom: 1px solid $color-border;

    &:last-child {
      border-bottom: none;
    }
  }

  &__key {
    font-size: 9px;
    letter-spacing: $tracking-wider;
    color: $color-text-faint;
  }

  &__val {
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text;
  }
}

.about-dossier-link {
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
  text-transform: uppercase;
  color: $color-gold;
  text-decoration: none;
  transition: opacity $dur-fast $ease-gold;

  &:hover {
    opacity: 0.75;
  }
}

.about-directives {
  list-style: none;
  padding: 0;
  margin: $space-6 0 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid $color-border;

  &__item {
    display: flex;
    align-items: baseline;
    gap: $space-4;
    padding: 14px 16px;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    text-transform: uppercase;
    color: $color-text-muted;
    border-bottom: 1px solid $color-border;

    &:last-child {
      border-bottom: none;
    }
  }

  &__index {
    color: $color-gold;
    flex-shrink: 0;
  }
}

.about-loadout {
  margin-top: $space-6;
  border: 1px solid $color-border;
  background: rgba($color-surface, 0.35);

  &__head {
    display: grid;
    grid-template-columns: 52px minmax(120px, 0.45fr) 1fr;
    gap: $space-4;
    padding: 10px 16px;
    border-bottom: 1px solid rgba($color-gold, 0.15);
    font-size: 8px;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: rgba($color-gold, 0.55);
  }

  &__row {
    display: grid;
    grid-template-columns: 52px minmax(120px, 0.45fr) 1fr;
    gap: $space-4;
    align-items: start;
    padding: 16px;
    border-bottom: 1px solid $color-border;
    transition: background-color $dur-fast $ease-gold;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba($color-gold, 0.03);
    }
  }

  &__slot {
    font-size: 9px;
    letter-spacing: $tracking-wider;
    color: $color-gold;
    padding-top: 2px;
  }

  &__sys {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__type {
    font-size: 7px;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  &__name {
    font-size: $text-sm;
    letter-spacing: $tracking-wide;
    color: $color-text;
    line-height: 1.2;
  }

  &__desc {
    font-size: $text-sm;
    line-height: $leading-normal;
    color: $color-text-muted;
    margin: 0;
  }

  @media (max-width: 640px) {
    &__head {
      display: none;
    }

    &__row {
      grid-template-columns: 40px 1fr;
      grid-template-rows: auto auto;
      gap: $space-2 $space-4;
    }

    &__desc {
      grid-column: 2;
    }
  }
}

.about-record {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
  margin-top: $space-8;
  padding-top: $space-8;
  border-top: 1px solid $color-border;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
  }

  &__stat {
    text-align: center;
    padding: $space-4;
  }

  &__value {
    display: block;
    font-size: clamp(2rem, 4vw, 3rem);
    color: $color-gold;
    line-height: 1;
    margin-bottom: $space-3;
  }

  &__label {
    font-size: 9px;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;
  }
}
</style>
