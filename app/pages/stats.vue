<script setup lang="ts">
definePageMeta({
  hideFooter: true,
})

useSeo({
  title: 'Stats',
  description: 'Interne statistieken van CPWD.',
  noindex: true,
})

interface DayBucket {
  pageviews: number
  contacts: number
  estimates: number
  scans: number
}

interface StatsSnapshot {
  store: 'blob' | 'file' | 'memory'
  persistent: boolean
  totals: DayBucket
  today: DayBucket
  series: Array<DayBucket & { date: string }>
  pages: Array<{ path: string, count: number }>
  countries: Array<{ code: string, count: number }>
}

const { locale } = useI18n()
const password = ref('')
const error = ref('')
const loading = ref(true)
const submitting = ref(false)
const configured = ref(true)
const authenticated = ref(false)
const stats = ref<StatsSnapshot | null>(null)

const copy = computed(() => locale.value === 'en'
  ? {
      eyebrow: 'Private',
      title: 'CPWD stats',
      lead: 'Anonymous totals only. No IP addresses, names or message content.',
      password: 'Password',
      open: 'Open',
      wrong: 'That password is not right.',
      limited: 'Too many attempts. Wait a few minutes.',
      missing: 'Set STATS_PASSWORD in the environment. At least 8 characters. The page stays closed until then.',
      unavailable: 'Stats are not available right now.',
      logout: 'Lock',
      today: 'Today',
      views: 'Page views',
      contacts: 'Contact',
      estimates: 'Planner',
      scans: 'Scans',
      days: 'Last 14 days',
      pages: 'Pages',
      countries: 'Countries',
      empty: 'Nothing counted yet. Totals start once people use the site.',
      memory: 'These numbers live in this server process only. Connect a Vercel Blob store so they survive a deploy.',
    }
  : {
      eyebrow: 'Afgeschermd',
      title: 'CPWD stats',
      lead: 'Alleen anonieme totalen. Geen IP-adressen, namen of berichtinhoud.',
      password: 'Wachtwoord',
      open: 'Open',
      wrong: 'Dat wachtwoord klopt niet.',
      limited: 'Te vaak geprobeerd. Wacht een paar minuten.',
      missing: 'Zet STATS_PASSWORD in de omgeving. Minstens 8 tekens. Tot die tijd blijft deze pagina dicht.',
      unavailable: 'Stats zijn nu niet beschikbaar.',
      logout: 'Vergrendel',
      today: 'Vandaag',
      views: 'Paginaweergaven',
      contacts: 'Contact',
      estimates: 'Planner',
      scans: 'Scans',
      days: 'Laatste 14 dagen',
      pages: "Pagina's",
      countries: 'Landen',
      empty: 'Nog niets geteld. De totalen lopen op zodra de site gebruikt wordt.',
      memory: 'Deze cijfers blijven alleen in dit serverproces staan. Koppel een Vercel Blob store, anders zijn ze na een deploy weg.',
    })

const numberFormat = computed(() => new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'nl-NL'))
const regionNames = computed(() => {
  try {
    return new Intl.DisplayNames([locale.value === 'en' ? 'en' : 'nl'], { type: 'region' })
  } catch {
    return null
  }
})

const maxViews = computed(() => Math.max(1, ...(stats.value?.series.map(day => day.pageviews) ?? [1])))

function formatCount(value: number) {
  return numberFormat.value.format(value)
}

function countryLabel(code: string) {
  return regionNames.value?.of(code) || code
}

function dayLabel(date: string) {
  const [, month = '', day = ''] = date.split('-')
  return `${Number(day)}/${Number(month)}`
}

async function loadSession() {
  const session = await $fetch<{ configured: boolean, authenticated: boolean }>('/api/stats/session')
  configured.value = session.configured
  authenticated.value = session.authenticated
  if (session.authenticated) await loadStats()
}

async function loadStats() {
  stats.value = await $fetch<StatsSnapshot>('/api/stats')
}

async function unlock() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/stats/session', {
      method: 'POST',
      body: { password: password.value },
    })
    password.value = ''
    authenticated.value = true
    await loadStats()
  } catch (err: unknown) {
    const status = typeof err === 'object' && err && 'statusCode' in err
      ? Number((err as { statusCode?: number }).statusCode)
      : 0
    error.value = status === 429
      ? copy.value.limited
      : status === 503
        ? copy.value.missing
        : copy.value.wrong
  } finally {
    submitting.value = false
  }
}

async function lock() {
  await $fetch('/api/stats/session', { method: 'DELETE' })
  authenticated.value = false
  stats.value = null
}

onMounted(async () => {
  try {
    await loadSession()
  } catch {
    error.value = copy.value.unavailable
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="stats-page">
    <div class="container stats-page__inner">
      <header class="stats-page__header">
        <p class="label">{{ copy.eyebrow }}</p>
        <div class="stats-page__title-row">
          <h1>{{ copy.title }}</h1>
          <button
            v-if="authenticated"
            type="button"
            class="stats-page__lock"
            @click="lock"
          >
            {{ copy.logout }}
          </button>
        </div>
        <p class="stats-page__lead">{{ copy.lead }}</p>
      </header>

      <p v-if="loading" class="stats-page__status font-mono">…</p>

      <form
        v-else-if="!authenticated"
        class="stats-gate"
        @submit.prevent="unlock"
      >
        <p v-if="!configured" class="stats-gate__note">{{ copy.missing }}</p>
        <template v-else>
          <label class="stats-gate__label font-mono" for="stats-password">{{ copy.password }}</label>
          <div class="stats-gate__row">
            <input
              id="stats-password"
              v-model="password"
              type="password"
              name="password"
              autocomplete="current-password"
              required
              class="stats-gate__input"
            >
            <button type="submit" class="project-live-cta stats-gate__submit" :disabled="submitting">
              {{ copy.open }}
            </button>
          </div>
          <p v-if="error" class="stats-gate__error">{{ error }}</p>
        </template>
      </form>

      <template v-else-if="stats">
        <p v-if="!stats.persistent" class="stats-page__warn">{{ copy.memory }}</p>

        <section class="stats-grid">
          <article class="stats-card">
            <span class="label">{{ copy.views }}</span>
            <strong>{{ formatCount(stats.totals.pageviews) }}</strong>
            <small>{{ copy.today }} {{ formatCount(stats.today.pageviews) }}</small>
          </article>
          <article class="stats-card">
            <span class="label">{{ copy.contacts }}</span>
            <strong>{{ formatCount(stats.totals.contacts) }}</strong>
            <small>{{ copy.today }} {{ formatCount(stats.today.contacts) }}</small>
          </article>
          <article class="stats-card">
            <span class="label">{{ copy.estimates }}</span>
            <strong>{{ formatCount(stats.totals.estimates) }}</strong>
            <small>{{ copy.today }} {{ formatCount(stats.today.estimates) }}</small>
          </article>
          <article class="stats-card">
            <span class="label">{{ copy.scans }}</span>
            <strong>{{ formatCount(stats.totals.scans) }}</strong>
            <small>{{ copy.today }} {{ formatCount(stats.today.scans) }}</small>
          </article>
        </section>

        <section class="stats-block">
          <h2 class="label">{{ copy.days }}</h2>
          <div class="stats-bars" :aria-label="copy.days">
            <div v-for="day in stats.series" :key="day.date" class="stats-bars__col">
              <span class="stats-bars__value font-mono">{{ day.pageviews || '' }}</span>
              <span
                class="stats-bars__bar"
                :style="{ height: `${Math.max(day.pageviews ? 8 : 2, (day.pageviews / maxViews) * 100)}%` }"
              />
              <span class="stats-bars__label font-mono">{{ dayLabel(day.date) }}</span>
            </div>
          </div>
        </section>

        <div class="stats-split">
          <section class="stats-block">
            <h2 class="label">{{ copy.pages }}</h2>
            <p v-if="!stats.pages.length" class="stats-page__status">{{ copy.empty }}</p>
            <ol v-else class="stats-list">
              <li v-for="page in stats.pages" :key="page.path">
                <span>{{ page.path }}</span>
                <strong class="font-mono">{{ formatCount(page.count) }}</strong>
              </li>
            </ol>
          </section>

          <section class="stats-block">
            <h2 class="label">{{ copy.countries }}</h2>
            <p v-if="!stats.countries.length" class="stats-page__status">{{ copy.empty }}</p>
            <ol v-else class="stats-list">
              <li v-for="country in stats.countries" :key="country.code">
                <span>{{ countryLabel(country.code) }}</span>
                <strong class="font-mono">{{ formatCount(country.count) }}</strong>
              </li>
            </ol>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stats-page {
  min-height: 100svh;
  padding: clamp(120px, 16vh, 160px) 0 clamp(64px, 10vh, 96px);
  background: $color-bg;

  &__inner {
    max-width: 980px;
  }

  &__header {
    margin-bottom: $space-8;
  }

  &__title-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: $space-4;
    margin-top: $space-3;

    h1 {
      margin: 0;
      font-family: $font-display;
      font-size: clamp(3rem, 6vw, 5.5rem);
      font-weight: 300;
      line-height: 0.92;
      letter-spacing: $tracking-tight;
    }
  }

  &__lead,
  &__status,
  &__warn {
    max-width: 62ch;
    margin-top: $space-4;
    color: $color-text-muted;
    line-height: $leading-relaxed;
  }

  &__warn {
    padding: $space-4 $space-5;
    border: 1px solid rgba($color-gold, 0.45);
    color: $color-gold-light;
  }

  &__lock {
    margin-bottom: 0.4rem;
    color: $color-text-muted;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    cursor: pointer;

    &:hover {
      color: $color-gold;
    }
  }
}

.stats-gate {
  max-width: 520px;

  &__note,
  &__error {
    color: $color-text-muted;
    line-height: $leading-relaxed;
  }

  &__error {
    margin-top: $space-4;
    color: $color-gold-light;
  }

  &__label {
    display: block;
    margin-bottom: $space-3;
    color: $color-text-faint;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
    align-items: center;
  }

  &__input {
    flex: 1 1 220px;
    min-width: 0;
    padding: 1rem 1.1rem;
    border: 1px solid $color-border;
    background: $color-bg-alt;
    color: $color-text;
    font: inherit;
    font-size: 1rem;

    &:focus {
      outline: 1px solid $color-gold;
      border-color: $color-gold;
    }
  }

  &__submit {
    margin-top: 0;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: $space-3;
  margin-top: $space-8;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.stats-card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  min-height: 140px;
  padding: $space-5;
  border: 1px solid $color-border;
  background: $color-bg-alt;

  strong {
    font-family: $font-display;
    font-size: clamp(2.2rem, 4vw, 3.4rem);
    font-weight: 300;
    line-height: 0.9;
    color: $color-gold-light;
  }

  small {
    color: $color-text-faint;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    text-transform: uppercase;
  }
}

.stats-block {
  margin-top: $space-10;

  h2 {
    margin-bottom: $space-5;
    color: $color-text-faint;
  }
}

.stats-bars {
  display: grid;
  grid-template-columns: repeat(14, minmax(0, 1fr));
  gap: 6px;
  height: 180px;
  align-items: end;

  &__col {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    min-width: 0;
  }

  &__value,
  &__label {
    color: $color-text-faint;
    font-size: 0.65rem;
    letter-spacing: 0.04em;
  }

  &__value {
    min-height: 1em;
    margin-bottom: 6px;
  }

  &__bar {
    width: 100%;
    max-width: 28px;
    background: $color-gold;
    opacity: 0.85;
  }

  &__label {
    margin-top: 8px;
  }
}

.stats-split {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: clamp(24px, 4vw, 48px);

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
}

.stats-list {
  list-style: none;

  li {
    display: flex;
    justify-content: space-between;
    gap: $space-4;
    padding: $space-3 0;
    border-top: 1px solid $color-border;
    color: $color-text;
  }

  strong {
    color: $color-gold-light;
  }
}
</style>
