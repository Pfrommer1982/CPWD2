<script setup lang="ts">
import { resolveElementRef, type TemplateRefValue } from '~/utils/dom'
import { CPWD_GITHUB_URL, CPWD_LINKEDIN_URL } from '~/constants/brand'

interface FinaleRow {
  text: string
  reveal: string
  action?: string
}

const finale = useSectionTranslations('common.finale')
const localePath = useLocalePath()
const year = new Date().getFullYear()

const textRefs = ref<HTMLElement[]>([])

const rows = computed(() => {
  const raw = finale.tm('rows')
  return localeList<Record<string, unknown>>(raw).map(item => {
    const actionRaw = item.action
    const action = actionRaw != null && actionRaw !== ''
      ? resolveLocaleMessage(actionRaw, finale.rt)
      : undefined

    return {
      text: resolveLocaleMessage(item.text, finale.rt),
      reveal: resolveLocaleMessage(item.reveal, finale.rt),
      action: action || undefined,
    } satisfies FinaleRow
  })
})

function setTextRef(el: TemplateRefValue, index: number) {
  const resolved = resolveElementRef(el)
  if (resolved) textRefs.value[index] = resolved
}

function rowHref(row: FinaleRow): string | undefined {
  switch (row.action) {
    case 'contact': return localePath('/contact')
    case 'faq': return localePath('/faq')
    case 'email': return 'mailto:info@cpwd.nl'
    case 'linkedin': return CPWD_LINKEDIN_URL
    case 'github': return CPWD_GITHUB_URL
    default: return undefined
  }
}

function isExternal(row: FinaleRow) {
  return row.action === 'linkedin' || row.action === 'github'
}

useFinaleScene({ scrollLayers: textRefs })
</script>

<template>
  <footer class="finale" aria-label="Contact">
    <div class="finale__fade" aria-hidden="true" />

    <div class="finale__inner container">
      <span class="section-label finale__label">{{ finale.t('label') }}</span>

      <div class="finale__stack">
        <component
          :is="rowHref(row) ? 'a' : 'article'"
          v-for="(row, index) in rows"
          :key="`${row.text}-${index}`"
          class="finale-row"
          :class="{ 'finale-row--link': !!rowHref(row) }"
          :href="rowHref(row)"
          :target="isExternal(row) ? '_blank' : undefined"
          :rel="isExternal(row) ? 'noopener noreferrer' : undefined"
          :aria-label="rowHref(row) ? row.reveal : undefined"
          data-cursor="hover"
        >
          <h2
            :ref="el => setTextRef(el, index)"
            class="finale-row__text"
          >
            {{ row.text }}
            <span class="finale-row__hover" aria-hidden="true">{{ row.reveal }}</span>
          </h2>
        </component>
      </div>

      <div class="finale__meta">
        <div class="finale__meta-left">
          <NuxtLink :to="localePath('/')" class="finale__logo" aria-label="CPWD">
            <UiAppLogo :height="32" />
          </NuxtLink>
          <span class="finale__location font-mono">{{ finale.t('location') }}</span>
        </div>
        <nav class="finale__legal font-mono" :aria-label="finale.t('privacyLink')">
          <NuxtLink :to="localePath('/privacy')" class="finale__legal-link">
            {{ finale.t('privacyLink') }}
          </NuxtLink>
          <span class="finale__legal-sep" aria-hidden="true">·</span>
          <NuxtLink :to="localePath('/terms')" class="finale__legal-link">
            {{ finale.t('termsLink') }}
          </NuxtLink>
        </nav>
        <p class="finale__copy font-mono">
          {{ finale.t('copy', { year }) }}
        </p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.finale {
  position: relative;
  padding: $space-12 0 clamp($space-10, 22vh, $space-16);
  background: $color-bg;
  overflow-x: clip;

  @media (max-width: 767px) {
    padding: $space-10 0 clamp($space-8, 18vh, $space-12);
  }
}

.finale__fade {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(to bottom, $color-bg-alt, transparent);
  pointer-events: none;
  z-index: 1;
}

.finale__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.finale__label {
  margin-bottom: $space-6;
}

.finale__stack {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.finale-row {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: none;
}

.finale-row__text {
  position: relative;
  margin: 0;
  width: 100%;
  padding: clamp(8px, 1vw, 12px) 0;
  font-family: $font-display;
  font-size: clamp(1.45rem, 2.4vw, 2.25rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.08;
  color: rgba(100, 118, 110, 0.22);
  background: linear-gradient(to right, $color-text, $color-text) no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  background-size: 0%;
  border-bottom: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  will-change: background-size;
}

.finale-row--link .finale-row__text {
  font-family: $font-body;
  font-size: clamp(0.95rem, 1.4vw, 1.15rem);
  font-weight: 400;
  letter-spacing: $tracking-wide;
  text-transform: uppercase;
  line-height: 1.2;
}

// Solid panel wipe — different text, not a recolor
.finale-row__hover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: inherit;
  background-color: $color-gold;
  color: $color-bg;
  clip-path: polygon(0 50%, 100% 50%, 100% 50%, 0 50%);
  transform-origin: center center;
  transition: clip-path 0.4s cubic-bezier(0.1, 0.5, 0.5, 1);
  will-change: clip-path;
  font-family: inherit;
  font-size: inherit;
  font-weight: 400;
  font-style: italic;
  letter-spacing: inherit;
  text-transform: inherit;
  line-height: inherit;
}

.finale-row--link .finale-row__hover {
  font-family: $font-body;
  font-size: clamp(0.95rem, 1.4vw, 1.15rem);
  font-weight: 500;
  font-style: normal;
  letter-spacing: $tracking-wide;
  text-transform: uppercase;
}

.finale-row:hover .finale-row__hover,
.finale-row:focus-within .finale-row__hover {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.finale__meta {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'brand legal'
    'copy copy';
  align-items: end;
  gap: $space-4 $space-5;
  padding-top: $space-6;
  margin-top: $space-6;
  border-top: 1px solid $color-border;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'brand'
      'legal'
      'copy';
  }
}

.finale__meta-left {
  grid-area: brand;
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.finale__legal {
  grid-area: legal;
  display: flex;
  align-items: center;
  gap: $space-3;
  justify-self: end;

  @media (max-width: 767px) {
    justify-self: start;
  }
}

.finale__legal-link {
  font-size: $text-xs;
  letter-spacing: $tracking-wide;
  color: $color-text-faint;
  text-decoration: none;
  text-transform: uppercase;
  transition: color $dur-fast $ease-gold;

  &:hover {
    color: $color-gold-light;
  }
}

.finale__legal-sep {
  color: rgba($color-text-faint, 0.45);
  font-size: $text-xs;
}

.finale__copy {
  grid-area: copy;
  font-size: $text-xs;
  color: $color-text-faint;
  letter-spacing: $tracking-wide;
  margin: 0;
}

.finale__logo {
  opacity: 0.6;
  transition: opacity $dur-fast $ease-gold;

  &:hover {
    opacity: 1;
  }
}

.finale__location {
  font-size: $text-xs;
  letter-spacing: $tracking-wide;
  color: $color-text-faint;
  text-transform: uppercase;
}

@media (hover: none) and (pointer: coarse) {
  .finale-row:active .finale-row__hover {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

@media (max-width: 767px) {
  .finale-row__text {
    font-size: clamp(1.25rem, 5.5vw, 1.65rem);
    background-size: 100% !important;
  }

  .finale-row--link .finale-row__text,
  .finale-row--link .finale-row__hover {
    font-size: clamp(0.85rem, 3.5vw, 1rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .finale-row__text {
    background-size: 100% !important;
  }

  .finale-row__hover {
    transition: none;
  }

  .finale-row:hover .finale-row__hover,
  .finale-row:focus-within .finale-row__hover {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}
</style>
