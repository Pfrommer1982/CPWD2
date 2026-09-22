export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=UTF-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  const siteUrl = (useRuntimeConfig().public.siteUrl as string).replace(/\/$/, '')
  return buildLlmsTxt(siteUrl)
})
