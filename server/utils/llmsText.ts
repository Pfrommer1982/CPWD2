import { CPWD_CONTACT_EMAIL, CPWD_GITHUB_URL, CPWD_LINKEDIN_URL, CPWD_SITE_NAME } from '../../app/constants/brand'
import { knowledgeArticles } from '../../app/data/knowledge'
import { PROJECT_PRICING } from '../../app/data/projectPricing'
import type { KnowledgeBlock } from '../../app/data/knowledge'

function plain(text: string) {
  return text.replace(/\*/g, '')
}

function blockText(block: KnowledgeBlock, lang: 'nl' | 'en') {
  if (block.type === 'list') {
    return block.content[lang].map(item => `- ${plain(item)}`).join('\n')
  }
  return plain(block.content[lang])
}

export function buildLlmsTxt(siteUrl: string) {
  const onePage = PROJECT_PRICING.types['one-page'].base
  const portfolio = PROJECT_PRICING.types.portfolio.base
  const business = PROJECT_PRICING.types.business.base
  const webshop = PROJECT_PRICING.types.webshop.base
  const webapp = PROJECT_PRICING.types.webapp.base
  const hosting = PROJECT_PRICING.hosting.cpwd

  return `# ${CPWD_SITE_NAME}

> CPWD is een webdevelopment-bureau in Nederland. Het bureau ontwerpt en bouwt maatwerk websites en webapps, van briefing tot livegang en hosting. CPWD is a web development studio in the Netherlands. It designs and builds bespoke websites and web apps.

Werktaal: Nederlands en Engels. Klanten in Nederland en daarbuiten. De bedragen hieronder zijn startprijzen in euro. Extra pagina's en opties komen erbij. De offerte daarna is een vaste prijs. Een vrijblijvende indicatie staat op ${siteUrl}/project-estimator.

## Startprijzen (EUR)

- One-page website: ${onePage}
- Portfolio website: ${portfolio}
- Bedrijfswebsite: ${business}
- Webshop: ${webshop}
- Webapp: ${webapp}
- Hosting per jaar via CPWD: ${hosting}
- Extra pagina: ${PROJECT_PRICING.pagePrice}

## Pagina's

- [Home](${siteUrl}/): Website laten maken in Nederland
- [Diensten](${siteUrl}/services): Webdesign, webdevelopment, hosting, motion, sound en merk
- [Werk](${siteUrl}/work): Portfolio, waaronder CareerPulse en Accurate Black
- [Over](${siteUrl}/about): Het bureau en de aanpak
- [Website planner](${siteUrl}/project-estimator): Vrijblijvende prijsindicatie
- [Website scanner](${siteUrl}/website-scanner): Gratis scan van snelheid, SEO en techniek
- [Kennisbank](${siteUrl}/faq): Vragen over prijs, proces, techniek en SEO
- [Contact](${siteUrl}/contact): info@cpwd.nl, antwoord binnen 24 uur op werkdagen

## Kennisbank

${knowledgeArticles.map(article => `- [${article.question.nl}](${siteUrl}/faq/${article.slug}): ${article.answer.nl}`).join('\n')}

## Contact

- E-mail: ${CPWD_CONTACT_EMAIL}
- LinkedIn: ${CPWD_LINKEDIN_URL}
- GitHub: ${CPWD_GITHUB_URL}
- Volledige tekst voor taalmodellen: ${siteUrl}/llms-full.txt
`
}

export function buildLlmsFullTxt(siteUrl: string) {
  const articles = knowledgeArticles.map((article) => {
    const nlBody = article.body.map(block => blockText(block, 'nl')).join('\n\n')
    const enBody = article.body.map(block => blockText(block, 'en')).join('\n\n')
    return `## ${article.question.nl}

${article.answer.nl}

${nlBody}

### ${article.question.en}

${article.answer.en}

${enBody}
`
  }).join('\n')

  return `${buildLlmsTxt(siteUrl)}
# Volledige kennisbank

${articles}`
}
