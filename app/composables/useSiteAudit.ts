import type { AuditStrategy, SiteAuditResponse, SiteAuditResult } from '~/types/site-audit'

export type SiteAuditPhase = 'idle' | 'scanning' | 'complete' | 'error'

export interface SiteAuditClientError {
  code: string
  message: string
}

export function useSiteAudit() {
  const copy = useSectionTranslations('websiteScanner')
  const { locale } = useI18n()

  const phase = ref<SiteAuditPhase>('idle')
  const inputUrl = ref('')
  const strategy = ref<AuditStrategy>('mobile')
  const progress = ref(0)
  const result = ref<SiteAuditResult | null>(null)
  const error = ref<SiteAuditClientError | null>(null)
  const scanLabel = ref('')

  let progressTimer: ReturnType<typeof setInterval> | null = null
  let apiDone = false

  function normalizeClientUrl(raw: string): { ok: true; url: string } | { ok: false; message: string } {
    const trimmed = raw.trim()
    if (!trimmed) {
      return { ok: false, message: copy.t('errors.empty') }
    }
    if (trimmed.length > 2048) {
      return { ok: false, message: copy.t('errors.tooLong') }
    }

    const lowered = trimmed.toLowerCase()
    if (
      lowered.startsWith('javascript:')
      || lowered.startsWith('data:')
      || lowered.startsWith('file:')
      || lowered.startsWith('ftp:')
    ) {
      return { ok: false, message: copy.t('errors.httpOnly') }
    }

    let candidate = trimmed
    if (!/^https?:\/\//i.test(candidate)) {
      candidate = `https://${candidate}`
    }

    try {
      const parsed = new URL(candidate)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { ok: false, message: copy.t('errors.httpOnly') }
      }
      if (!parsed.hostname.includes('.')) {
        return { ok: false, message: copy.t('errors.invalid') }
      }
      parsed.hash = ''
      return { ok: true, url: parsed.toString() }
    }
    catch {
      return { ok: false, message: copy.t('errors.invalid') }
    }
  }

  function clearProgressTimer() {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  /**
   * Asymptotic progress: climbs toward 94% while waiting, never reaches 100%
   * until the real API response arrives.
   */
  function startProgressAnimation() {
    clearProgressTimer()
    progress.value = 0
    apiDone = false
    const started = Date.now()

    progressTimer = setInterval(() => {
      if (apiDone) return
      const elapsed = Date.now() - started
      let target = 15
      if (elapsed > 1200) target = 35
      if (elapsed > 2800) target = 55
      if (elapsed > 4500) target = 72
      if (elapsed > 7000) target = 88
      if (elapsed > 10000) target = 94

      const next = progress.value + Math.max(0.15, (target - progress.value) * 0.08)
      progress.value = Math.min(target, next)
    }, 80)
  }

  async function finishProgress() {
    apiDone = true
    clearProgressTimer()
    const from = progress.value
    const steps = 10
    for (let i = 1; i <= steps; i++) {
      progress.value = from + ((100 - from) * i) / steps
      await new Promise(r => setTimeout(r, 28))
    }
    progress.value = 100
  }

  async function runScan(options?: { url?: string; strategy?: AuditStrategy; mock?: boolean }) {
    const raw = options?.url ?? inputUrl.value
    const validated = normalizeClientUrl(raw)
    if (!validated.ok) {
      phase.value = 'error'
      error.value = { code: 'invalid_url', message: validated.message }
      return
    }

    inputUrl.value = validated.url
    if (options?.strategy) strategy.value = options.strategy

    phase.value = 'scanning'
    error.value = null
    result.value = null
    scanLabel.value = validated.url
    startProgressAnimation()

    try {
      const body: Record<string, unknown> = {
        url: validated.url,
        strategy: strategy.value,
        locale: locale.value === 'en' ? 'en' : 'nl',
      }
      if (import.meta.dev && (options?.mock || false)) {
        body.mock = true
      }

      const response = await $fetch<SiteAuditResponse>('/api/site-audit', {
        method: 'POST',
        body,
      })

      await finishProgress()
      result.value = response.result
      phase.value = 'complete'
    }
    catch (err: unknown) {
      clearProgressTimer()
      apiDone = true
      progress.value = 0

      const fetchError = err as {
        statusCode?: number
        statusMessage?: string
        data?: { code?: string; message?: string; data?: { code?: string } }
      }

      const code =
        fetchError?.data?.data?.code
        || fetchError?.data?.code
        || (fetchError.statusCode === 429 ? 'rate_limited' : 'unavailable')

      const knownCodes = [
        'invalid_url',
        'missing_key',
        'rate_limited',
        'timeout',
        'unreachable',
        'quota',
        'incomplete',
        'unavailable',
      ] as const

      const codeKey = knownCodes.includes(code as typeof knownCodes[number])
        ? (code as typeof knownCodes[number])
        : 'unavailable'

      const message =
        fetchError?.statusMessage
        || fetchError?.data?.message
        || copy.t(`errors.${codeKey}`)

      error.value = { code: String(code), message: String(message) }
      phase.value = 'error'
    }
  }

  function resetToInput() {
    clearProgressTimer()
    phase.value = 'idle'
    progress.value = 0
    result.value = null
    error.value = null
    scanLabel.value = ''
  }

  function retest() {
    if (!inputUrl.value) return
    void runScan({ url: inputUrl.value, strategy: strategy.value })
  }

  function testAnother() {
    resetToInput()
  }

  onBeforeUnmount(() => {
    clearProgressTimer()
  })

  return {
    phase,
    inputUrl,
    strategy,
    progress,
    result,
    error,
    scanLabel,
    normalizeClientUrl,
    runScan,
    resetToInput,
    retest,
    testAnother,
  }
}
