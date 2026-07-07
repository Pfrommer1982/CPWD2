<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { localeList, resolveLocaleMessage } from '~/utils/i18n'
import { resolveElementRef, type TemplateRefValue } from '~/utils/dom'
import { CPWD_GITHUB_URL, CPWD_LINKEDIN_URL } from '~/constants/brand'

const contact = useSectionTranslations('contact')

const isMobile = useMediaQuery('(max-width: 1099px)', { ssrWidth: 1100 })
const layout = computed(() => (isMobile.value ? 'mobile' : 'desktop'))

const rootRef = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const spineFillRef = ref<HTMLElement | null>(null)
const chapterRefs = ref<HTMLElement[]>([])
const finaleRef = ref<HTMLElement | null>(null)
const activeChapter = ref(-1)
const journeyReady = ref(false)

const spineCodes = ['SAT-01', 'GND-02', 'ENC-03'] as const

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const honeypot = ref('')

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const feedback = ref<'success' | 'error' | null>(null)

const {
  phase: txPhase,
  encryptSubStep,
  sessionId,
  operatorCipher,
  addressCipher,
  cipherLines,
  aesBlocks,
  keyIv,
  keySession,
  keyProgress,
  payloadHash,
  hashProgress,
  transmitProgress,
  transmitHop,
  encryptProgress,
  telemetry,
  runPreparePhase,
  runEncryptPhase,
  runHashPhase,
  runTransmitPhase,
  reset: resetTransmit,
} = useContactTransmitAnimation()

const transmitHops = computed(() => {
  const raw = contact.tm('page.transmit.hops')
  return localeList<string>(raw).map(h => resolveLocaleMessage(h, contact.rt))
})

const encryptStepLabel = computed(() => {
  if (txPhase.value === 'prepare') return contact.t('page.transmit.prepareLabel')
  if (txPhase.value === 'hash') return contact.t('page.transmit.hashVerifyLabel')
  if (txPhase.value !== 'encrypt') return ''
  if (encryptSubStep.value === 'metadata') return contact.t('page.transmit.metadataLabel')
  if (encryptSubStep.value === 'keygen') return contact.t('page.transmit.keygenLabel')
  return contact.t('page.transmit.encryptLabel')
})

const isTransmitting = computed(() => txPhase.value !== 'idle')

const orbitalTelemetry = computed(() => {
  const raw = contact.tm('page.orbital.telemetry')
  return localeList<string>(raw).map(t => resolveLocaleMessage(t, contact.rt))
})

const groundNodes = computed(() => {
  const raw = contact.tm('page.ground.nodes')
  return localeList<{ code: string; name: string; status: string }>(raw).map(n => ({
    code: resolveLocaleMessage(n.code, contact.rt),
    name: resolveLocaleMessage(n.name, contact.rt),
    status: resolveLocaleMessage(n.status, contact.rt),
  }))
})

const secureDirectives = computed(() => {
  const raw = contact.tm('page.secure.directives')
  return localeList<string>(raw).map(d => resolveLocaleMessage(d, contact.rt))
})

const txStatus = computed(() => {
  if (txPhase.value === 'prepare') return contact.t('page.transmit.prepareLabel')
  if (txPhase.value === 'encrypt') return encryptStepLabel.value
  if (txPhase.value === 'hash') return contact.t('page.transmit.hashVerifyLabel')
  if (txPhase.value === 'transmit') return contact.t('page.transmit.transmitLabel')
  if (txPhase.value === 'complete' && status.value === 'success') return contact.t('page.transmit.statusSuccess')
  if (txPhase.value === 'complete' && status.value === 'error') return contact.t('page.transmit.statusError')
  if (status.value === 'loading') return contact.t('page.transmit.statusLoading')
  if (status.value === 'success') return contact.t('page.transmit.statusSuccess')
  if (status.value === 'error') return contact.t('page.transmit.statusError')
  return contact.t('page.transmit.statusIdle')
})

function setChapterRef(el: TemplateRefValue, index: number) {
  const resolved = resolveElementRef(el)
  if (resolved) chapterRefs.value[index] = resolved
}

function titleWords(title: string) {
  return title.split(/\s+/).filter(Boolean)
}

function spinePointActive(index: number) {
  return activeChapter.value >= index
}

async function submitForm() {
  if (isTransmitting.value || honeypot.value) return

  feedback.value = null
  status.value = 'loading'
  const payload = {
    name: form.name,
    email: form.email,
    message: form.message,
    website: honeypot.value,
  }

  try {
    await runPreparePhase()
    await runEncryptPhase(payload.name, payload.email, payload.message)
    await runHashPhase(payload.name, payload.email, payload.message)

    const [, fetchResult] = await Promise.all([
      runTransmitPhase(transmitHops.value.length),
      $fetch('/api/contact', { method: 'POST', body: payload }),
    ])

    void fetchResult
    status.value = 'success'
    txPhase.value = 'complete'
    form.name = ''
    form.email = ''
    form.message = ''

    await new Promise(r => setTimeout(r, 3200))
    feedback.value = 'success'
    resetTransmit()
    status.value = 'idle'

    await new Promise(r => setTimeout(r, 6000))
    if (feedback.value === 'success') feedback.value = null
  } catch {
    status.value = 'error'
    txPhase.value = 'complete'

    await new Promise(r => setTimeout(r, 3200))
    feedback.value = 'error'
    resetTransmit()
    status.value = 'idle'
  }
}

useContactJourney({
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
})
</script>

<template>
  <div ref="rootRef" class="contact-journey">
    <ClientOnly>
      <ContactCommBackdrop
        :root="rootRef"
        :finale="finaleRef"
        :ready="journeyReady"
        :active-chapter="activeChapter"
        :transmit-active="isTransmitting"
      />
    </ClientOnly>

    <header ref="heroRef" class="contact-journey__hero">
      <div class="contact-journey__hero-inner container">
        <div class="contact-journey__stamp font-mono" data-hero-fade>
          {{ contact.t('page.hero.classification') }}
        </div>
        <span class="section-label" data-hero-fade>{{ contact.t('page.hero.label') }}</span>
        <p class="contact-journey__file-id font-mono" data-hero-fade>{{ contact.t('page.hero.fileId') }}</p>
        <h1 class="contact-journey__heading font-display">
          <span
            v-for="(word, wi) in titleWords(contact.t('page.hero.heading'))"
            :key="`ch-${wi}`"
            class="contact-journey__heading-word"
          >
            <span data-hero-word class="contact-journey__heading-inner">{{ word }}</span>
          </span>
        </h1>
        <p class="contact-journey__intro" data-hero-fade>
          {{ contact.t('page.hero.intro') }}
        </p>
        <div class="contact-journey__hero-meta" data-hero-fade>
          <span class="contact-journey__hero-available label">{{ contact.t('page.hero.available') }}</span>
        </div>
        <span class="contact-journey__hint font-mono" data-hero-fade>
          {{ contact.t('page.hero.scrollHint') }}
        </span>
      </div>
    </header>

    <div
      v-if="layout === 'desktop'"
      class="contact-journey__hud"
      aria-hidden="true"
    >
      <div class="contact-journey__hud-frame">
        <span class="contact-journey__hud-corner contact-journey__hud-corner--tl" />
        <span class="contact-journey__hud-corner contact-journey__hud-corner--tr" />
        <span class="contact-journey__hud-corner contact-journey__hud-corner--bl" />
        <span class="contact-journey__hud-corner contact-journey__hud-corner--br" />

        <aside class="contact-journey__spine">
          <div class="contact-journey__spine-track">
            <div ref="spineFillRef" class="contact-journey__spine-fill" />
          </div>
          <ol class="contact-journey__spine-points">
            <li
              class="contact-journey__spine-point"
              :class="{ 'contact-journey__spine-point--active': activeChapter >= -1 }"
            >
              <span class="contact-journey__spine-dot" />
              <span class="contact-journey__spine-label font-mono">{{ contact.t('page.spine.departure') }}</span>
            </li>
            <li
              v-for="(code, index) in spineCodes"
              :key="code"
              class="contact-journey__spine-point"
              :class="{ 'contact-journey__spine-point--active': spinePointActive(index) }"
            >
              <span class="contact-journey__spine-dot" />
              <span class="contact-journey__spine-label font-mono">{{ code }}</span>
            </li>
            <li
              class="contact-journey__spine-point"
              :class="{ 'contact-journey__spine-point--active': activeChapter >= spineCodes.length }"
            >
              <span class="contact-journey__spine-dot" />
              <span class="contact-journey__spine-label font-mono">{{ contact.t('page.spine.arrival') }}</span>
            </li>
          </ol>
        </aside>
      </div>
    </div>

    <div class="contact-journey__route">
      <!-- SAT-01 Orbital -->
      <article
        :ref="el => setChapterRef(el, 0)"
        class="contact-chapter"
        :class="{ 'contact-chapter--mobile': layout === 'mobile' }"
      >
        <div class="contact-chapter__sticky">
          <span class="contact-chapter__code font-mono">{{ contact.t('page.orbital.code') }}</span>
          <div class="contact-chapter__inner container">
            <div class="contact-chapter__content" data-chapter-side="right">
              <span class="section-label">{{ contact.t('page.orbital.label') }}</span>
              <h2 class="contact-chapter__title font-display">
                <span
                  v-for="(word, wi) in titleWords(contact.t('page.orbital.heading'))"
                  :key="`orb-${wi}`"
                  class="contact-chapter__title-word"
                >
                  <span class="contact-chapter__title-inner" data-chapter-word>{{ word }}</span>
                </span>
              </h2>
              <p class="contact-chapter__desc" data-chapter-desc>
                {{ contact.t('page.orbital.body') }}
              </p>
              <ul class="contact-telemetry">
                <li
                  v-for="(line, ti) in orbitalTelemetry"
                  :key="`tel-${ti}`"
                  class="contact-telemetry__line font-mono"
                  data-chapter-fade
                >
                  {{ line }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      <!-- GND-02 Ground -->
      <article
        :ref="el => setChapterRef(el, 1)"
        class="contact-chapter"
        :class="{ 'contact-chapter--mobile': layout === 'mobile' }"
      >
        <div class="contact-chapter__sticky">
          <span class="contact-chapter__code font-mono">{{ contact.t('page.ground.code') }}</span>
          <div class="contact-chapter__inner container">
            <div class="contact-chapter__content contact-chapter__content--wide" data-chapter-side="left">
              <span class="section-label">{{ contact.t('page.ground.label') }}</span>
              <h2 class="contact-chapter__title font-display">
                <span
                  v-for="(word, wi) in titleWords(contact.t('page.ground.heading'))"
                  :key="`gnd-${wi}`"
                  class="contact-chapter__title-word"
                >
                  <span class="contact-chapter__title-inner" data-chapter-word>{{ word }}</span>
                </span>
              </h2>
              <p class="contact-chapter__desc" data-chapter-desc>
                {{ contact.t('page.ground.body') }}
              </p>
              <div class="contact-node-grid">
                <article
                  v-for="node in groundNodes"
                  :key="node.code"
                  class="contact-node-grid__item"
                  data-chapter-item
                >
                  <span class="contact-node-grid__code font-mono">{{ node.code }}</span>
                  <h3 class="contact-node-grid__name font-mono">{{ node.name }}</h3>
                  <span class="contact-node-grid__status font-mono">{{ node.status }}</span>
                </article>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- ENC-03 Secure -->
      <article
        :ref="el => setChapterRef(el, 2)"
        class="contact-chapter"
        :class="{ 'contact-chapter--mobile': layout === 'mobile' }"
      >
        <div class="contact-chapter__sticky">
          <span class="contact-chapter__code font-mono">{{ contact.t('page.secure.code') }}</span>
          <div class="contact-chapter__inner container">
            <div class="contact-chapter__content" data-chapter-side="right">
              <span class="section-label">{{ contact.t('page.secure.label') }}</span>
              <h2 class="contact-chapter__title font-display">
                <span
                  v-for="(word, wi) in titleWords(contact.t('page.secure.heading'))"
                  :key="`enc-${wi}`"
                  class="contact-chapter__title-word"
                >
                  <span class="contact-chapter__title-inner" data-chapter-word>{{ word }}</span>
                </span>
              </h2>
              <p class="contact-chapter__desc" data-chapter-desc>
                {{ contact.t('page.secure.body') }}
              </p>
              <ul class="contact-directives">
                <li
                  v-for="(directive, di) in secureDirectives"
                  :key="`dir-${di}`"
                  class="contact-directives__item font-mono"
                  data-chapter-item
                >
                  <span class="contact-directives__index">{{ String(di + 1).padStart(2, '0') }}</span>
                  {{ directive }}
                </li>
              </ul>
              <a
                :href="`mailto:${contact.t('email')}`"
                class="contact-email-link font-mono"
                data-chapter-fade
                data-cursor="hover"
              >
                {{ contact.t('email') }} →
              </a>
            </div>
          </div>
        </div>
      </article>

      <!-- TX-04 Transmit -->
      <footer
        ref="finaleRef"
        class="contact-chapter contact-chapter--finale"
        :class="{ 'contact-chapter--mobile': layout === 'mobile' }"
      >
        <div class="contact-chapter__sticky">
          <span class="contact-chapter__code font-mono">{{ contact.t('page.transmit.code') }}</span>
          <div class="contact-chapter__inner container">
            <div class="contact-terminal" data-chapter-fade>
              <div class="contact-terminal__header font-mono">
                <span class="contact-terminal__prompt">{{ contact.t('page.transmit.terminalPrompt') }}</span>
                <span
                  class="contact-terminal__status"
                  :class="{
                    'contact-terminal__status--ok': status === 'success',
                    'contact-terminal__status--err': status === 'error',
                    'contact-terminal__status--busy': isTransmitting || status === 'loading',
                  }"
                >
                  {{ txStatus }}
                </span>
              </div>

              <div class="contact-terminal__body" :class="{ 'contact-terminal__body--locked': isTransmitting }">
                <div class="contact-terminal__intro">
                  <span class="section-label">{{ contact.t('page.transmit.label') }}</span>
                  <h2 class="contact-terminal__heading font-display">
                    {{ contact.t('page.transmit.heading') }}
                  </h2>
                  <p class="contact-terminal__subtext">
                    {{ contact.t('page.transmit.subtext') }}
                  </p>

                  <div class="contact-terminal__direct">
                    <span class="label">{{ contact.t('page.direct.label') }}</span>
                    <a
                      :href="`mailto:${contact.t('email')}`"
                      class="contact-terminal__email link-slide"
                    >
                      {{ contact.t('email') }}
                    </a>
                    <p class="contact-terminal__response label">
                      {{ contact.t('page.direct.responseTime') }}
                    </p>
                  </div>

                  <div class="contact-terminal__availability">
                    <span class="contact-terminal__availability-dot" aria-hidden="true" />
                    <div>
                      <p class="contact-terminal__availability-status label">
                        {{ contact.t('page.direct.availableStatus') }}
                      </p>
                      <p class="contact-terminal__availability-detail label">
                        {{ contact.t('page.direct.availableDetail') }}
                      </p>
                    </div>
                  </div>

                  <div class="contact-terminal__social font-mono">
                    <span class="contact-terminal__social-label">{{ contact.t('page.social.label') }}</span>
                    <div class="contact-terminal__social-links">
                      <a
                        :href="CPWD_LINKEDIN_URL"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="contact-terminal__social-link"
                        data-cursor="hover"
                      >
                        <svg class="contact-terminal__social-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <span>{{ contact.t('page.social.linkedin') }}</span>
                      </a>
                      <a
                        :href="CPWD_GITHUB_URL"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="contact-terminal__social-link"
                        data-cursor="hover"
                      >
                        <svg class="contact-terminal__social-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        <span>{{ contact.t('page.social.github') }}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <form
                  class="contact-terminal__form"
                  :class="{ 'contact-terminal__form--hidden': isTransmitting }"
                  @submit.prevent="submitForm"
                >
                  <div class="contact-terminal__field">
                    <label for="contact-name" class="font-mono">{{ contact.t('form.name') }}</label>
                    <input
                      id="contact-name"
                      v-model="form.name"
                      type="text"
                      required
                      autocomplete="name"
                      :disabled="isTransmitting"
                    >
                  </div>
                  <div class="contact-terminal__field">
                    <label for="contact-email" class="font-mono">{{ contact.t('form.email') }}</label>
                    <input
                      id="contact-email"
                      v-model="form.email"
                      type="email"
                      required
                      autocomplete="email"
                      :disabled="isTransmitting"
                    >
                  </div>
                  <div class="contact-terminal__field">
                    <label for="contact-message" class="font-mono">{{ contact.t('form.message') }}</label>
                    <textarea
                      id="contact-message"
                      v-model="form.message"
                      rows="5"
                      required
                      :disabled="isTransmitting"
                    />
                  </div>
                  <input
                    v-model="honeypot"
                    type="text"
                    name="website"
                    tabindex="-1"
                    autocomplete="off"
                    class="contact-terminal__honeypot"
                    aria-hidden="true"
                  >
                  <GsapMagneticButton type="submit" class="contact-terminal__submit" :disabled="isTransmitting">
                    {{ isTransmitting ? contact.t('form.loading') : contact.t('form.submit') }}
                    <span aria-hidden="true">→</span>
                  </GsapMagneticButton>
                </form>

                <Transition name="contact-tx">
                  <div
                    v-if="isTransmitting"
                    class="contact-transmit font-mono"
                    aria-live="polite"
                  >
                    <div v-if="txPhase === 'prepare'" class="contact-transmit__block">
                      <div class="contact-transmit__label">
                        {{ contact.t('page.transmit.prepareLabel') }}
                      </div>
                      <div class="contact-transmit__session">
                        <span class="contact-transmit__session-key">{{ contact.t('page.transmit.sessionLabel') }}</span>
                        <code>{{ sessionId || '…' }}</code>
                      </div>
                      <div class="contact-transmit__scanline" aria-hidden="true" />
                    </div>

                    <div v-if="txPhase === 'encrypt'" class="contact-transmit__block">
                      <div class="contact-transmit__label">
                        {{ encryptStepLabel }}
                        <span class="contact-transmit__pct">{{ encryptProgress }}%</span>
                      </div>

                      <div v-if="encryptSubStep === 'metadata'" class="contact-transmit__meta">
                        <div class="contact-transmit__meta-row">
                          <span>{{ contact.t('page.transmit.operatorField') }}</span>
                          <code>{{ operatorCipher || '…' }}</code>
                        </div>
                        <div class="contact-transmit__meta-row">
                          <span>{{ contact.t('page.transmit.addressField') }}</span>
                          <code>{{ addressCipher || '…' }}</code>
                        </div>
                      </div>

                      <template v-if="encryptSubStep === 'payload'">
                        <div class="contact-transmit__blocks-label">{{ contact.t('page.transmit.blocksLabel') }}</div>
                        <div class="contact-transmit__blocks" aria-hidden="true">
                          <span
                            v-for="(block, i) in aesBlocks"
                            :key="`blk-${i}`"
                            class="contact-transmit__block-cell"
                            :class="`contact-transmit__block-cell--${block}`"
                          />
                        </div>
                        <div class="contact-transmit__cipher-wrap">
                          <pre class="contact-transmit__cipher">{{ cipherLines.join('\n') || '…' }}</pre>
                          <div class="contact-transmit__scanline" aria-hidden="true" />
                        </div>
                      </template>

                      <div v-if="encryptSubStep === 'keygen'" class="contact-transmit__keys">
                        <div class="contact-transmit__key-row">
                          <span>{{ contact.t('page.transmit.keyIvLabel') }}</span>
                          <code>{{ keyIv || '…' }}</code>
                        </div>
                        <div class="contact-transmit__key-row">
                          <span>{{ contact.t('page.transmit.keySessionLabel') }}</span>
                          <code>{{ keySession || '…' }}</code>
                        </div>
                        <div class="contact-transmit__key-bar">
                          <div class="contact-transmit__key-bar-fill" :style="{ width: `${keyProgress}%` }" />
                        </div>
                      </div>
                    </div>

                    <div v-if="txPhase === 'hash'" class="contact-transmit__block">
                      <div class="contact-transmit__label">
                        {{ contact.t('page.transmit.hashVerifyLabel') }}
                        <span class="contact-transmit__pct">{{ hashProgress }}%</span>
                      </div>
                      <div class="contact-transmit__hash">
                        <span class="contact-transmit__hash-key">{{ contact.t('page.transmit.hashLabel') }}</span>
                        <code>{{ payloadHash || '…' }}</code>
                      </div>
                    </div>

                    <div v-if="txPhase === 'transmit'" class="contact-transmit__block">
                      <div class="contact-transmit__label">
                        {{ contact.t('page.transmit.transmitLabel') }}
                        <span class="contact-transmit__pct">{{ transmitProgress }}%</span>
                      </div>

                      <div class="contact-transmit__hops">
                        <span
                          v-for="(hop, i) in transmitHops"
                          :key="`hop-${i}`"
                          class="contact-transmit__hop"
                          :class="{
                            'contact-transmit__hop--done': i < transmitHop,
                            'contact-transmit__hop--active': i === transmitHop,
                          }"
                        >
                          {{ hop }}
                        </span>
                      </div>

                      <div class="contact-transmit__bar">
                        <div class="contact-transmit__bar-fill" :style="{ width: `${transmitProgress}%` }">
                          <span class="contact-transmit__bar-glow" aria-hidden="true" />
                        </div>
                      </div>

                      <div class="contact-transmit__telemetry">
                        <span>{{ contact.t('page.transmit.telemetry.snr') }} {{ telemetry.snr.toFixed(1) }} dB</span>
                        <span>{{ contact.t('page.transmit.telemetry.latency') }} {{ Math.round(telemetry.latency) }} ms</span>
                        <span>{{ contact.t('page.transmit.telemetry.bitrate') }} {{ telemetry.bitrate }} kbps</span>
                      </div>

                      <p class="contact-transmit__route">{{ contact.t('page.transmit.route') }}</p>

                      <div class="contact-transmit__packets" aria-hidden="true">
                        <span
                          v-for="i in 6"
                          :key="`pkt-${i}`"
                          class="contact-transmit__packet"
                          :style="{ animationDelay: `${i * 0.28}s`, animationDuration: `${1.1 + (i % 3) * 0.25}s` }"
                        >
                          {{ contact.t('page.transmit.packet') }}-{{ String(i).padStart(2, '0') }}
                        </span>
                      </div>
                    </div>

                    <div
                      v-if="txPhase === 'complete'"
                      class="contact-transmit__result"
                      :class="status === 'success'
                        ? 'contact-transmit__result--ok'
                        : 'contact-transmit__result--err'"
                      role="status"
                    >
                      <span class="contact-transmit__result-code font-mono">
                        {{ status === 'success' ? 'ACK // 200' : 'NACK // 500' }}
                      </span>
                      <p class="contact-transmit__result-text">
                        {{ status === 'success' ? contact.t('form.success') : contact.t('form.error') }}
                      </p>
                    </div>
                  </div>
                </Transition>

                <Transition name="contact-tx">
                  <p
                    v-if="feedback"
                    class="contact-terminal__feedback font-mono"
                    :class="feedback === 'success'
                      ? 'contact-terminal__feedback--ok'
                      : 'contact-terminal__feedback--err'"
                    role="status"
                  >
                    {{ feedback === 'success' ? contact.t('form.success') : contact.t('form.error') }}
                  </p>
                </Transition>
              </div>

              <span class="contact-terminal__corner contact-terminal__corner--tl" aria-hidden="true" />
              <span class="contact-terminal__corner contact-terminal__corner--tr" aria-hidden="true" />
              <span class="contact-terminal__corner contact-terminal__corner--bl" aria-hidden="true" />
              <span class="contact-terminal__corner contact-terminal__corner--br" aria-hidden="true" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contact-journey {
  position: relative;
  z-index: 2;
  background: transparent;
  overflow: visible;

  --contact-hud-top: calc(88px + 10px);
  --contact-hud-bottom: clamp(14px, 2vh, 24px);
  --contact-hud-height: calc(100dvh - var(--contact-hud-top) - var(--contact-hud-bottom));

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
    margin-bottom: $space-5;
  }

  &__hero-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-4;
    margin-bottom: $space-8;
  }

  &__hero-available {
    color: #4caf50;
  }

  &__hint {
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    color: $color-text-faint;
  }

  &__hud {
    position: fixed;
    inset: var(--contact-hud-top) clamp(14px, 2.2vw, 32px) var(--contact-hud-bottom) clamp(14px, 2.2vw, 32px);
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

    &--tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
    &--tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
    &--bl { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
    &--br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
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

    &--active { opacity: 1; }
  }

  &__spine-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid rgba($color-gold, 0.45);
    background: $color-bg;

    .contact-journey__spine-point--active & {
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

    .contact-journey__spine-point--active & {
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

.contact-chapter {
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
    overflow: hidden;

    @media (min-width: 1100px) {
      align-items: stretch;
      justify-content: center;
    }
  }

  &__sticky {
    position: sticky;
    top: 0;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    z-index: 2;

    .contact-chapter--finale & {
      @media (min-width: 1100px) {
        position: relative;
        top: auto;
        width: 100%;
        min-height: var(--contact-hud-height);
        height: var(--contact-hud-height);
        margin-top: var(--contact-hud-top);
        margin-bottom: var(--contact-hud-bottom);
        align-items: center;
        justify-content: center;
      }
    }

    .contact-chapter--mobile & {
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

    .contact-chapter--finale & {
      @media (min-width: 1100px) {
        top: 50%;
        right: clamp(12px, 4vw, 48px);
        transform: translateY(-50%);
      }
    }
  }

  &__inner {
    width: 100%;
    padding-block: clamp(48px, 8vh, 80px);

    .contact-chapter--finale & {
      @media (min-width: 1100px) {
        padding-block: 0;
      }
    }
  }

  &__content {
    max-width: min(520px, 92vw);
    margin-left: auto;
    margin-right: clamp(16px, 4vw, 48px);

    &--wide {
      max-width: min(680px, 94vw);
      margin-left: clamp(16px, 4vw, 48px);
      margin-right: auto;
    }

    @media (max-width: 1099px) {
      margin-left: auto;
      margin-right: auto;
    }
  }

  &__title {
    font-size: clamp(2rem, 4vw + 0.5rem, 3.5rem);
    font-weight: 300;
    line-height: 1.05;
    margin-block: $space-5;
  }

  &__title-word {
    display: inline-block;
    overflow: hidden;
    margin-right: 0.18em;
  }

  &__title-inner {
    display: inline-block;
  }

  &__desc {
    font-size: $text-lg;
    line-height: $leading-relaxed;
    color: $color-text-muted;
    margin-bottom: $space-6;
    max-width: 48ch;
  }
}

.contact-telemetry {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $space-2;

  &__line {
    font-size: 10px;
    letter-spacing: 0.06em;
    color: rgba($color-gold, 0.65);
    padding: 6px 10px;
    border-left: 2px solid rgba($color-gold, 0.35);
    background: rgba($color-surface, 0.45);
  }
}

.contact-node-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-3;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }

  &__item {
    padding: $space-4;
    border: 1px solid rgba($color-gold, 0.15);
    background: rgba($color-surface, 0.55);
    transition: border-color $duration-fast $ease-out-expo;

    &:hover {
      border-color: rgba($color-gold, 0.35);
    }
  }

  &__code {
    display: block;
    font-size: 9px;
    letter-spacing: 0.14em;
    color: rgba($color-gold, 0.55);
    margin-bottom: $space-2;
  }

  &__name {
    font-size: $text-sm;
    color: $color-text;
    margin-bottom: $space-2;
  }

  &__status {
    font-size: 9px;
    letter-spacing: 0.08em;
    color: $color-text-faint;
  }
}

.contact-directives {
  list-style: none;
  padding: 0;
  margin: 0 0 $space-6;
  display: flex;
  flex-direction: column;
  gap: $space-3;

  &__item {
    display: flex;
    align-items: baseline;
    gap: $space-3;
    font-size: $text-sm;
    color: $color-text-muted;
    padding: $space-3 $space-4;
    border: 1px solid rgba($color-gold, 0.1);
    background: rgba($color-surface, 0.35);
  }

  &__index {
    font-size: 10px;
    color: rgba($color-gold, 0.6);
    flex-shrink: 0;
  }
}

.contact-email-link {
  display: inline-block;
  font-size: $text-sm;
  letter-spacing: 0.06em;
  color: $color-gold;
  transition: color $duration-fast $ease-out-expo;

  &:hover {
    color: $color-gold-light;
  }
}

.contact-terminal {
  position: relative;
  width: 100%;
  max-width: min(920px, 94vw);
  margin-inline: auto;
  border: 1px solid rgba($color-gold, 0.22);
  background: rgba(8, 8, 10, 0.82);
  backdrop-filter: blur(12px);

  &__header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: $space-3;
    padding: $space-3 $space-5;
    border-bottom: 1px solid rgba($color-gold, 0.12);
    font-size: 9px;
    letter-spacing: 0.08em;
  }

  &__prompt {
    color: rgba($color-gold, 0.55);
  }

  &__status {
    color: $color-text-faint;

    &--ok { color: rgba($color-gold, 0.9); }
    &--err { color: $color-accent-alt; }
    &--busy { color: rgba($color-gold-light, 0.75); }
  }

  &__body {
    display: grid;
    gap: $space-6;
    padding: clamp($space-6, 4vw, $space-8);
    position: relative;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1.1fr;
      align-items: start;
    }

    &--locked {
      min-height: clamp(280px, 36vh, 420px);
    }
  }

  &__heading {
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 300;
    margin-block: $space-4;
  }

  &__subtext {
    font-size: $text-base;
    color: $color-text-muted;
    line-height: $leading-relaxed;
    max-width: 36ch;
    margin-bottom: $space-5;
  }

  &__direct {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    margin-bottom: $space-5;

    .label {
      color: $color-text-faint;
    }
  }

  &__email {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 300;
    color: $color-text;
  }

  &__response {
    color: $color-text-faint;
  }

  &__availability {
    display: flex;
    align-items: center;
    gap: $space-4;
    padding: $space-4 $space-5;
    margin-bottom: $space-5;
    border: 1px solid rgba(76, 175, 80, 0.28);
    border-radius: $radius-lg;
    background: rgba(76, 175, 80, 0.05);
  }

  &__availability-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4caf50;
    flex-shrink: 0;
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
    animation: availability-ping 2s ease-out infinite;
  }

  &__availability-status {
    color: #4caf50;
    margin-bottom: 2px;
  }

  &__availability-detail {
    color: $color-text-faint;
  }

  &__honeypot {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    transition: opacity 0.35s $ease-out-expo;

    &--hidden {
      opacity: 0;
      pointer-events: none;
      position: absolute;
      inset: 0;
      visibility: hidden;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-2;

    label {
      font-size: 9px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: $color-text-faint;
    }

    input,
    textarea {
      background: rgba($color-surface, 0.8);
      border: 1px solid rgba($color-gold, 0.18);
      border-radius: $border-radius-sm;
      padding: $space-3 $space-4;
      color: $color-text;
      font-family: $font-body;
      font-size: $text-base;
      transition: border-color $duration-fast $ease-out-expo;

      &:focus {
        outline: none;
        border-color: rgba($color-gold, 0.55);
      }
    }

    textarea {
      resize: vertical;
      min-height: 120px;
    }
  }

  &__submit {
    align-self: flex-start;
    margin-top: $space-2;
  }

  &__social {
    margin-top: $space-5;
  }

  &__social-label {
    display: block;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $color-text-faint;
    margin-bottom: $space-2;
  }

  &__social-links {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }

  &__social-link {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: $space-2 $space-3;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba($color-gold, 0.72);
    border: 1px solid rgba($color-gold, 0.15);
    background: rgba($color-surface, 0.45);
    transition: color $duration-fast $ease-out-expo, border-color $duration-fast $ease-out-expo;

    &:hover {
      color: $color-gold-light;
      border-color: rgba($color-gold, 0.35);
    }
  }

  &__social-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  &__corner {
    position: absolute;
    width: 14px;
    height: 14px;
    border-color: rgba($color-gold, 0.45);
    border-style: solid;

    &--tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
    &--tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
    &--bl { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
    &--br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
  }
}

.contact-transmit {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: $space-5;
  padding: $space-4;
  border: 1px solid rgba($color-gold, 0.18);
  background: rgba(8, 8, 12, 0.92);

  &__block {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba($color-gold, 0.75);
  }

  &__pct {
    color: rgba($color-gold-light, 0.9);
  }

  &__session {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 9px;

    code {
      font-family: $font-mono;
      font-size: 10px;
      letter-spacing: 0.1em;
      color: rgba($color-gold-light, 0.88);
    }
  }

  &__session-key {
    color: $color-text-faint;
    letter-spacing: 0.12em;
  }

  &__meta,
  &__keys {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__meta-row,
  &__key-row {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: $space-2;
    align-items: start;
    font-size: 9px;

    span {
      color: $color-text-faint;
      letter-spacing: 0.1em;
      padding-top: 2px;
    }

    code {
      font-family: $font-mono;
      font-size: 9px;
      letter-spacing: 0.06em;
      color: rgba($color-gold-light, 0.82);
      word-break: break-all;
    }
  }

  &__blocks-label {
    font-size: 8px;
    letter-spacing: 0.14em;
    color: rgba($color-gold, 0.45);
  }

  &__blocks {
    display: inline-grid;
    grid-template-columns: repeat(4, 11px);
    gap: 3px;
    width: fit-content;
    max-width: 100%;
  }

  &__block-cell {
    width: 11px;
    height: 11px;
    border: 1px solid rgba($color-gold, 0.12);
    background: rgba($color-bg, 0.6);
    transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

    &--scrambling {
      border-color: rgba($color-gold, 0.35);
      background: rgba($color-gold, 0.08);
      animation: contact-blk-pulse 0.45s ease-in-out infinite alternate;
    }

    &--sealed {
      border-color: rgba($color-gold, 0.5);
      background: rgba($color-gold, 0.14);
      box-shadow: inset 0 0 8px rgba($color-gold, 0.12);
    }
  }

  &__key-bar {
    height: 2px;
    background: rgba($color-gold, 0.1);
    overflow: hidden;
  }

  &__key-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, $color-gold-dark, $color-gold-light);
    box-shadow: 0 0 8px rgba($color-gold, 0.35);
    transition: width 0.06s linear;
  }

  &__cipher-wrap {
    position: relative;
    max-height: 120px;
    overflow: hidden;
    border: 1px solid rgba($color-gold, 0.12);
    background: rgba($color-bg, 0.85);
    padding: $space-3;
  }

  &__scanline {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba($color-gold, 0.06) 48%,
      rgba($color-gold, 0.14) 50%,
      rgba($color-gold, 0.06) 52%,
      transparent 100%
    );
    background-size: 100% 200%;
    animation: contact-tx-scan 2.4s linear infinite;
  }

  &__cipher {
    margin: 0;
    font-size: 10px;
    line-height: 1.55;
    letter-spacing: 0.06em;
    color: rgba($color-gold-light, 0.82);
    word-break: break-all;
    white-space: pre-wrap;
  }

  &__hash {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 9px;

    code {
      font-family: $font-mono;
      font-size: 9px;
      letter-spacing: 0.08em;
      color: rgba($color-gold, 0.65);
      word-break: break-all;
    }
  }

  &__hash-key {
    color: $color-text-faint;
    letter-spacing: 0.1em;
  }

  &__bar {
    height: 3px;
    background: rgba($color-gold, 0.12);
    overflow: hidden;
  }

  &__bar-fill {
    position: relative;
    height: 100%;
    background: linear-gradient(90deg, $color-gold-dark, $color-gold-light);
    transition: width 0.08s linear;
    box-shadow: 0 0 12px rgba($color-gold, 0.45);
    overflow: hidden;
  }

  &__bar-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    animation: contact-bar-shimmer 1.2s ease-in-out infinite;
  }

  &__hops {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__hop {
    font-size: 8px;
    letter-spacing: 0.1em;
    padding: 3px 6px;
    border: 1px solid rgba($color-gold, 0.12);
    color: rgba($color-text-faint, 0.85);
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;

    &--active {
      color: rgba($color-gold-light, 0.95);
      border-color: rgba($color-gold, 0.45);
      background: rgba($color-gold, 0.1);
      box-shadow: 0 0 10px rgba($color-gold, 0.12);
    }

    &--done {
      color: rgba($color-gold, 0.65);
      border-color: rgba($color-gold, 0.28);
    }
  }

  &__telemetry {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
    font-size: 8px;
    letter-spacing: 0.1em;
    color: rgba($color-gold, 0.6);
  }

  &__route {
    font-size: 9px;
    letter-spacing: 0.12em;
    color: rgba($color-gold, 0.55);
    margin: 0;
  }

  &__packets {
    position: relative;
    height: 18px;
    overflow: hidden;
  }

  &__packet {
    position: absolute;
    left: -10%;
    top: 2px;
    font-size: 8px;
    letter-spacing: 0.14em;
    color: rgba($color-gold-light, 0.85);
    animation: contact-pkt-fly 1.4s linear infinite;
  }

  &__result {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding: $space-5;
    border: 1px solid rgba($color-gold, 0.2);
    text-align: center;

    &--ok {
      border-color: rgba($color-gold, 0.45);
      background: rgba($color-gold, 0.06);
      box-shadow: 0 0 24px rgba($color-gold, 0.08);
    }

    &--err {
      border-color: rgba($color-accent-alt, 0.45);
      background: rgba($color-accent-alt, 0.06);
    }
  }

  &__result-code {
    font-size: 10px;
    letter-spacing: 0.14em;
    color: rgba($color-gold, 0.7);

    .contact-transmit__result--err & {
      color: rgba($color-accent-alt, 0.85);
    }
  }

  &__result-text {
    margin: 0;
    font-family: $font-body;
    font-size: $text-base;
    line-height: $leading-relaxed;
    color: $color-text;

    .contact-transmit__result--ok & {
      color: $color-gold-light;
    }

    .contact-transmit__result--err & {
      color: rgba($color-accent-alt, 0.95);
    }
  }
}

.contact-terminal__feedback {
  grid-column: 1 / -1;
  margin: 0;
  padding: $space-3 $space-4;
  font-size: $text-sm;
  letter-spacing: 0.04em;
  border-left: 2px solid transparent;

  &--ok {
    color: $color-gold-light;
    background: rgba($color-gold, 0.06);
    border-left-color: $color-gold;
  }

  &--err {
    color: rgba($color-accent-alt, 0.95);
    background: rgba($color-accent-alt, 0.06);
    border-left-color: $color-accent-alt;
  }
}

.contact-tx-enter-active,
.contact-tx-leave-active {
  transition: opacity 0.35s $ease-out-expo, transform 0.35s $ease-out-expo;
}

.contact-tx-enter-from,
.contact-tx-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes contact-pkt-fly {
  from { left: -8%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  to { left: 108%; opacity: 0; }
}

@keyframes contact-blk-pulse {
  from { opacity: 0.55; }
  to { opacity: 1; }
}

@keyframes contact-tx-scan {
  from { background-position: 0 -100%; }
  to { background-position: 0 100%; }
}

@keyframes contact-bar-shimmer {
  from { transform: translateX(-120%); }
  to { transform: translateX(220%); }
}

@keyframes availability-ping {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.45); }
  70% { box-shadow: 0 0 0 8px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}
</style>
