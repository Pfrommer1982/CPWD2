import { projects } from '../../app/data/projects'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/xml')

  const siteUrl = (useRuntimeConfig().public.siteUrl as string).replace(/\/$/, '')

  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'monthly' },
    { path: '/work', priority: '0.9', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/services', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.9', changefreq: 'yearly' },
  ]

  const projectPages = projects.map(p => ({
    path: `/work/${p.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  }))

  const allPages = [...staticPages, ...projectPages]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`
})
