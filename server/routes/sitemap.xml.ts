import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { projects } from '../../app/data/projects'

type ChangeFreq = 'daily' | 'weekly' | 'monthly' | 'yearly'

interface SitemapUrl {
  path: string
  changefreq: ChangeFreq
  priority: string
  lastmod: string
  images?: Array<{
    loc: string
    title?: string
  }>
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIsoDate(date: Date) {
  return date.toISOString()
}

function getLastModified(...relativePaths: string[]) {
  const fallback = new Date()

  for (const relativePath of relativePaths) {
    try {
      const absolutePath = resolve(process.cwd(), relativePath)
      const stats = statSync(absolutePath)
      return toIsoDate(stats.mtime)
    } catch {
      // Continue and use next candidate.
    }
  }

  return toIsoDate(fallback)
}

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=UTF-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  const siteUrl = (useRuntimeConfig().public.siteUrl as string).replace(/\/$/, '')
  const nowIso = toIsoDate(new Date())

  const staticPages: SitemapUrl[] = [
    {
      path: '/',
      priority: '1.0',
      changefreq: 'weekly',
      lastmod: getLastModified('app/pages/index.vue'),
      images: [
        { loc: `${siteUrl}/og-image.jpg`, title: 'CPWD' },
        { loc: `${siteUrl}/favicon-512.png`, title: 'CPWD logo' },
      ],
    },
    {
      path: '/work',
      priority: '0.95',
      changefreq: 'weekly',
      lastmod: getLastModified('app/pages/work/index.vue', 'app/components/work/WorkIndexExplorer.vue'),
    },
    {
      path: '/services',
      priority: '0.85',
      changefreq: 'monthly',
      lastmod: getLastModified('app/pages/services.vue', 'app/components/sections/ServicesSection.vue'),
    },
    {
      path: '/about',
      priority: '0.85',
      changefreq: 'monthly',
      lastmod: getLastModified('app/pages/about.vue', 'app/components/sections/AboutJourneySection.vue'),
    },
    {
      path: '/contact',
      priority: '0.9',
      changefreq: 'monthly',
      lastmod: getLastModified('app/pages/contact.vue', 'app/components/sections/ContactJourneySection.vue'),
    },
  ]

  const projectPages: SitemapUrl[] = projects.map((project) => ({
    path: `/work/${project.slug}`,
    priority: project.featured ? '0.8' : '0.7',
    changefreq: 'monthly',
    lastmod: getLastModified('app/data/projects.ts', 'app/pages/work/[slug].vue'),
    images: [{
      loc: project.heroImage.startsWith('http') ? project.heroImage : `${siteUrl}${project.heroImage}`,
      title: project.title,
    }],
  }))

  const allPages = [...staticPages, ...projectPages].map((page) => ({
    ...page,
    lastmod: page.lastmod || nowIso,
  }))

  const urlsXml = allPages.map((page) => {
    const imageXml = (page.images ?? []).map((image) => `
    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>${image.title ? `
      <image:title>${escapeXml(image.title)}</image:title>` : ''}
    </image:image>`).join('')

    return `  <url>
    <loc>${escapeXml(`${siteUrl}${page.path}`)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageXml}
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml}
</urlset>`
})
