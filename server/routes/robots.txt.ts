export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=UTF-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')

  const siteUrl = (useRuntimeConfig().public.siteUrl as string).replace(/\/$/, '')

  return `User-agent: *
Allow: /

Disallow: /api/
Disallow: /stats
Disallow: /_nuxt/

# Public pages may be read by search engines and AI answer engines.
# Machine-readable summary: ${siteUrl}/llms.txt

Sitemap: ${siteUrl}/sitemap.xml
`
})
