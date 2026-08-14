import type { AuditStrategy, SiteAuditResponse } from '~/types/site-audit'
import { normalizeAuditLocale, type AuditLocale } from '../utils/site-audit/explanations'
import { createMockSiteAuditResult } from '../utils/site-audit/mock'
import { normalizePagespeedResponse } from '../utils/site-audit/normalize'
import { fetchPagespeedReport } from '../utils/site-audit/pagespeed'
import { checkAuditRateLimit, pruneAuditRateLimits } from '../utils/site-audit/rateLimit'
import { normalizeAuditUrl } from '../utils/site-audit/url'

interface SiteAuditBody {
  url?: string
  strategy?: AuditStrategy
  locale?: string
  /** Dev-only: force mock without calling Google. Ignored in production. */
  mock?: boolean
}

const PUBLIC_MESSAGES: Record<AuditLocale, Record<string, string>> = {
  nl: {
    invalid_url: 'Dit adres lijkt niet geldig. Gebruik een website zoals voorbeeld.nl of https://voorbeeld.nl.',
    missing_key: 'De scanner is tijdelijk niet beschikbaar. Probeer het later opnieuw.',
    rate_limited: 'Je hebt te snel achter elkaar gescand. Wacht even en probeer het opnieuw.',
    timeout: 'De analyse duurde te lang. Controleer het adres of probeer het later opnieuw.',
    unreachable: 'We konden deze website op dit moment niet analyseren. Controleer het adres of probeer het later opnieuw.',
    quota: 'De scanner is momenteel druk bezet. Probeer het over een paar minuten opnieuw.',
    incomplete: 'We ontvingen onvolledige meetgegevens. Probeer het later opnieuw.',
    unavailable: 'We konden deze website op dit moment niet analyseren. Probeer het later opnieuw.',
  },
  en: {
    invalid_url: 'This address does not look valid. Use a site like example.com or https://example.com.',
    missing_key: 'The scanner is temporarily unavailable. Please try again later.',
    rate_limited: 'You scanned too quickly in a row. Wait a moment and try again.',
    timeout: 'The analysis took too long. Check the address or try again later.',
    unreachable: 'We could not analyze this website right now. Check the address or try again later.',
    quota: 'The scanner is busy right now. Try again in a few minutes.',
    incomplete: 'We received incomplete measurement data. Please try again later.',
    unavailable: 'We could not analyze this website right now. Please try again later.',
  },
}

function clientKey(event: Parameters<typeof getRequestIP>[0]): string {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  return `audit:${ip}`
}

export default defineEventHandler(async (event): Promise<SiteAuditResponse> => {
  pruneAuditRateLimits()

  const body = await readBody<SiteAuditBody>(event)
  const locale = normalizeAuditLocale(body?.locale)

  const rate = checkAuditRateLimit(clientKey(event))
  if (!rate.allowed) {
    setHeader(event, 'Retry-After', rate.retryAfterSec)
    throw createError({
      statusCode: 429,
      statusMessage: PUBLIC_MESSAGES[locale].rate_limited,
      data: { code: 'rate_limited' },
    })
  }

  const validated = normalizeAuditUrl(body?.url || '')

  if (!validated.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: PUBLIC_MESSAGES[locale].invalid_url,
      data: { code: 'invalid_url' },
    })
  }

  const strategy: AuditStrategy = body?.strategy === 'desktop' ? 'desktop' : 'mobile'
  const config = useRuntimeConfig()
  const apiKey = (config.googlePagespeedApiKey as string | undefined) || ''

  const allowMock = import.meta.dev && (body?.mock === true || process.env.SITE_AUDIT_MOCK === '1')

  if (allowMock) {
    await new Promise(resolve => setTimeout(resolve, 900))
    return {
      ok: true,
      result: createMockSiteAuditResult(validated.url, locale),
      availableStrategies: ['mobile', 'desktop'],
    }
  }

  if (!apiKey || apiKey.includes('xxxx')) {
    if (import.meta.dev) {
      console.warn('[site-audit] GOOGLE_PAGESPEED_API_KEY missing - set the key or use SITE_AUDIT_MOCK=1 / body.mock')
      throw createError({
        statusCode: 503,
        statusMessage: locale === 'en'
          ? 'GOOGLE_PAGESPEED_API_KEY is missing. Set the key in .env or use SITE_AUDIT_MOCK=1 for UI development.'
          : 'GOOGLE_PAGESPEED_API_KEY ontbreekt. Zet de key in .env of gebruik SITE_AUDIT_MOCK=1 voor UI-development.',
        data: { code: 'missing_key', dev: true },
      })
    }

    throw createError({
      statusCode: 503,
      statusMessage: PUBLIC_MESSAGES[locale].missing_key,
      data: { code: 'missing_key' },
    })
  }

  const fetched = await fetchPagespeedReport({
    url: validated.url,
    strategy,
    apiKey,
  })

  if (!fetched.ok) {
    const statusMap = {
      timeout: 504,
      quota: 429,
      unreachable: 422,
      incomplete: 502,
      unavailable: 502,
    } as const

    throw createError({
      statusCode: statusMap[fetched.code],
      statusMessage: PUBLIC_MESSAGES[locale][fetched.code],
      data: { code: fetched.code },
    })
  }

  const result = normalizePagespeedResponse(fetched.data, strategy, validated.url, locale)
  if (!result) {
    throw createError({
      statusCode: 502,
      statusMessage: PUBLIC_MESSAGES[locale].incomplete,
      data: { code: 'incomplete' },
    })
  }

  return {
    ok: true,
    result,
    availableStrategies: ['mobile', 'desktop'],
  }
})
