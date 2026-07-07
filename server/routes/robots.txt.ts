export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=UTF-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')

  const siteUrl = (useRuntimeConfig().public.siteUrl as string).replace(/\/$/, '')

  return `User-agent: *
Allow: /

Disallow: /api/
Disallow: /_nuxt/

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
})
