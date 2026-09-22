export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'cache-control': 'private, no-store',
  })

  return {
    configured: statsConfigured(),
    authenticated: statsSessionValid(readStatsSession(event)),
  }
})
