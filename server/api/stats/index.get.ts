export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'cache-control': 'private, no-store',
  })

  if (!statsConfigured() || !statsSessionValid(readStatsSession(event))) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return readSiteStats()
})
