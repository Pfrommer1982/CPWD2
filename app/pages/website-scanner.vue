<script setup lang="ts">
import type { AuditStrategy } from '~/types/site-audit'

definePageMeta({ layout: 'default' })

const copy = useSectionTranslations('websiteScanner')
const seo = useSectionTranslations('seo')
const nav = useSectionTranslations('nav')
const route = useRoute()
const router = useRouter()
const { scrollTo } = useLenis()
const reducedMotion = usePreferredReducedMotion()

const {
  phase,
  inputUrl,
  strategy,
  progress,
  result,
  error,
  scanLabel,
  runScan,
  retest,
  testAnother,
} = useSiteAudit()

useSeo(computed(() => ({
  title: seo.t('websiteScanner.title'),
  description: seo.t('websiteScanner.description'),
  breadcrumbs: [
    { name: 'CPWD', path: '/' },
    { name: nav.t('websiteScanner'), path: '/website-scanner' },
  ],
})))

const showCompletion = ref(false)
const resultsRef = ref<HTMLElement | null>(null)
const NAV_SCROLL_OFFSET = -88

onMounted(() => {
  const q = route.query.url
  if (typeof q === 'string' && q.trim()) {
    inputUrl.value = q.trim()
  }
})

watch(inputUrl, (value) => {
  const trimmed = value.trim()
  const nextQuery = { ...route.query } as Record<string, string | string[] | undefined>
  if (trimmed) nextQuery.url = trimmed
  else delete nextQuery.url

  router.replace({ query: nextQuery })
})

watch(phase, (value, previous) => {
  if (value === 'scanning') {
    document.body.style.overflow = 'hidden'
  }

  if (value === 'complete' && previous === 'scanning') {
    showCompletion.value = true
    document.body.style.overflow = 'hidden'
  }

  if (value === 'error' || value === 'idle') {
    showCompletion.value = false
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

async function dismissCompletionAndScroll() {
  showCompletion.value = false
  document.body.style.overflow = ''

  await nextTick()
  await nextTick()

  const target = document.getElementById('audit-report-start') || resultsRef.value
  if (!target) return

  const { lenis: lenisInstance } = useLenis()
  if (lenisInstance) {
    scrollTo(target, { offset: NAV_SCROLL_OFFSET })
  }
  else {
    target.scrollIntoView({
      behavior: reducedMotion.value === 'reduce' ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const focusEl = document.getElementById('audit-report-start')
  if (focusEl instanceof HTMLElement) {
    focusEl.focus({ preventScroll: true })
  }
}

async function onSubmit() {
  await runScan()
}

async function onRetest() {
  await retest()
}

async function onSwitchStrategy(next: AuditStrategy) {
  if (strategy.value === next && phase.value === 'complete') return
  strategy.value = next
  await runScan({ url: inputUrl.value, strategy: next })
}
</script>

<template>
  <div class="website-scanner" :class="{ 'website-scanner--scanning': phase === 'scanning' || showCompletion }">
    <section class="website-scanner__hero section" data-page-hero>
      <div class="container">
        <p class="section-label" data-hero-fade>{{ copy.t('eyebrow') }}</p>
        <UiStaggeredHeroTitle
          :text="copy.t('title')"
          class="website-scanner__title"
        />
        <p class="website-scanner__lead copy-width" data-hero-fade>{{ copy.t('lead') }}</p>

        <SiteAuditInput
          v-model="inputUrl"
          data-hero-fade
          :disabled="phase === 'scanning'"
          :error="phase === 'error' ? error?.message : null"
          @submit="onSubmit"
        />

        <p class="website-scanner__disclaimer font-mono" data-hero-fade>
          {{ copy.t('disclaimer') }}
        </p>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="phase === 'scanning' || showCompletion"
        id="website-scanner-scan"
        class="website-scanner__overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="copy.t('scanner.aria')"
      >
        <div v-if="showCompletion" class="website-scanner__complete" aria-live="polite">
          <p class="website-scanner__complete-label font-mono">
            {{ copy.t('scanner.complete') }}
          </p>
          <button
            type="button"
            class="btn-primary"
            data-cursor="hover"
            :aria-label="copy.t('scanner.viewReportAria')"
            @click="dismissCompletionAndScroll"
          >
            {{ copy.t('scanner.viewReport') }}
          </button>
        </div>
        <SiteAuditScanner
          v-else
          :progress="progress"
          :target="scanLabel || inputUrl"
          :strategy="strategy"
        />
      </div>
    </Teleport>

    <section
      v-if="phase === 'complete' && result && !showCompletion"
      ref="resultsRef"
      class="website-scanner__results section"
    >
      <div class="container">
        <SiteAuditReport
          :result="result"
          @retest="onRetest"
          @another="testAnother"
          @switch-strategy="onSwitchStrategy"
        />
      </div>
    </section>

    <section v-if="phase === 'error'" class="website-scanner__error section">
      <div class="container">
        <div class="website-scanner__error-card" role="alert">
          <p class="section-label">{{ copy.t('errorTitle') }}</p>
          <p>{{ error?.message }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.website-scanner {
  min-height: auto;
}

.website-scanner__hero {
  padding-top: clamp(6.5rem, 12vh, 8.5rem);
  padding-bottom: clamp(5rem, 14vh, 9rem);
}

.website-scanner__title {
  margin: $space-3 0 $space-3;
  max-width: 14ch;
}

.website-scanner__lead {
  margin: 0 0 $space-5;
  color: $color-text-muted;
  font-size: $text-lg;
  line-height: $leading-relaxed;
}

.website-scanner__disclaimer {
  margin: $space-6 0 0;
  max-width: 42rem;
  font-size: $text-xs;
  line-height: $leading-relaxed;
  color: $color-text-faint;
  letter-spacing: $tracking-wide;
}

.website-scanner__overlay {
  position: fixed;
  inset: 0;
  z-index: $z-overlay;
  display: grid;
  padding: 0;
  background: $color-bg;
}

.website-scanner__results {
  padding-top: $space-6;
  padding-bottom: $space-10;
  min-width: 0;
  overflow-x: clip;

  .container {
    min-width: 0;
  }
}

.website-scanner__error {
  padding-top: 0;
  padding-bottom: $space-8;
}

.website-scanner__complete {
  place-self: center;
  min-width: min(32rem, 92vw);
  display: grid;
  justify-items: center;
  gap: $space-5;
  padding: clamp($space-6, 5vw, $space-8) $space-5;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: $color-bg-alt;
  animation: scanner-pulse 0.7s ease;
}

.website-scanner__complete-label {
  margin: 0;
  letter-spacing: $tracking-widest;
  text-transform: uppercase;
  color: $color-gold-light;
  text-align: center;
}

.website-scanner__error-card {
  max-width: 40rem;
  padding: $space-5;
  border: 1px solid rgba(196, 75, 58, 0.35);
  border-radius: $radius-md;
  background: rgba(196, 75, 58, 0.06);

  p:last-child {
    margin: $space-3 0 0;
    color: $color-text-muted;
    line-height: $leading-relaxed;
  }
}

@keyframes scanner-pulse {
  from { opacity: 0.4; transform: scale(0.985); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .website-scanner__complete {
    animation: none;
  }
}
</style>
