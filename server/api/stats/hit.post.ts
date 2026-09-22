export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'cache-control': 'private, no-store',
  })

  const userAgent = getRequestHeader(event, 'user-agent')
  if (isLikelyBot(userAgent)) return { ok: true }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkStatsAttempt(`hit:${ip}`, 40, 60_000)) return { ok: true }

  const raw = await readBody<unknown>(event).catch(() => null)
  const body = typeof raw === 'string'
    ? parseHitBody(raw)
    : raw && typeof raw === 'object'
      ? raw as { path?: string }
      : null
  const path = normalizeStatsPath(body?.path)
  if (!path) return { ok: true }
  if (seenRecently(`view:${ip}:${path}`)) return { ok: true }

  const country = normalizeCountry(
    getRequestHeader(event, 'x-vercel-ip-country')
    || getRequestHeader(event, 'cf-ipcountry'),
  )

  await recordSiteEvent('pageview', { path, country: country ?? undefined })
  return { ok: true }
})

function parseHitBody(raw: string): { path?: string } | null {
  try {
    const parsed = JSON.parse(raw) as { path?: string }
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}
