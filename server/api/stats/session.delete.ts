export default defineEventHandler((event) => {
  clearStatsSession(event)
  return { ok: true }
})
