export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'cache-control': 'private, no-store',
  })

  if (!statsConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Stats access is not configured' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkStatsAttempt(`login:${ip}`, 8, 10 * 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts' })
  }

  const body = await readBody<{ password?: string }>(event)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!password || !passwordsMatch(password, statsPassword())) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  setStatsSession(event)
  return { ok: true }
})
