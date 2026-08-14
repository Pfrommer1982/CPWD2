import type { AuditStrategy } from '~/types/site-audit'

export interface PagespeedFetchOk {
  ok: true
  data: Record<string, unknown>
}

export interface PagespeedFetchErr {
  ok: false
  code: 'timeout' | 'quota' | 'unreachable' | 'unavailable' | 'incomplete'
  status?: number
}

export type PagespeedFetchResult = PagespeedFetchOk | PagespeedFetchErr

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const TIMEOUT_MS = 55_000

export async function fetchPagespeedReport(options: {
  url: string
  strategy: AuditStrategy
  apiKey: string
}): Promise<PagespeedFetchResult> {
  const categories = ['performance', 'accessibility', 'best-practices', 'seo'] as const
  const params = new URLSearchParams({
    url: options.url,
    strategy: options.strategy,
    key: options.apiKey,
  })
  for (const category of categories) {
    params.append('category', category)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (response.status === 429) {
      return { ok: false, code: 'quota', status: 429 }
    }

    if (response.status === 400 || response.status === 404) {
      return { ok: false, code: 'unreachable', status: response.status }
    }

    if (!response.ok) {
      return { ok: false, code: 'unavailable', status: response.status }
    }

    const data = await response.json() as Record<string, unknown>
    if (!data || typeof data !== 'object' || !data.lighthouseResult) {
      return { ok: false, code: 'incomplete' }
    }

    return { ok: true, data }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, code: 'timeout' }
    }
    return { ok: false, code: 'unavailable' }
  } finally {
    clearTimeout(timer)
  }
}
