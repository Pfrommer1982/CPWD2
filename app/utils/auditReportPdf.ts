import type { jsPDF as JsPdfClass } from 'jspdf'
import type { SiteAuditResult } from '~/types/site-audit'

export interface AuditReportPdfLabels {
  title: string
  generatedOn: string
  url: string
  strategy: string
  healthScore: string
  categories: string
  biggestProblems: string
  problem: string
  howToFix: string
  impact: string
  difficulty: string
  noProblems: string
  disclaimer: string
  footer: string
  strategyMobile: string
  strategyDesktop: string
  categoryLabels: Record<string, string>
  statusLabels: Record<string, string>
  impactLabels: Record<string, string>
  difficultyLabels: Record<string, string>
}

type PdfDoc = InstanceType<typeof JsPdfClass>

const MARGIN = 20
const PAGE_BOTTOM = 277
const GREEN: [number, number, number] = [56, 150, 90]
const MUTED: [number, number, number] = [90, 100, 95]
const TEXT: [number, number, number] = [20, 28, 24]

function wrapLines(doc: PdfDoc, text: string, width: number) {
  return doc.splitTextToSize(text || '', width) as string[]
}

function ensureSpace(doc: PdfDoc, y: number, needed: number): number {
  if (y + needed > PAGE_BOTTOM) {
    doc.addPage()
    return MARGIN
  }
  return y
}

export function fillAuditReportPdf(
  doc: PdfDoc,
  result: SiteAuditResult,
  labels: AuditReportPdfLabels,
) {
  const maxWidth = 210 - MARGIN * 2
  let y = MARGIN

  const strategyLabel = result.strategy === 'mobile'
    ? labels.strategyMobile
    : labels.strategyDesktop

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(result.fetchedAt))

  doc.setTextColor(...GREEN)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(labels.title, MARGIN, y)
  y += 8

  doc.setDrawColor(...GREEN)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y, MARGIN + maxWidth, y)
  y += 8

  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`${labels.generatedOn}: ${dateLabel}`, MARGIN, y)
  y += 6

  doc.setTextColor(...TEXT)
  doc.setFontSize(10)
  const urlLines = wrapLines(doc, `${labels.url}: ${result.url}`, maxWidth)
  doc.text(urlLines, MARGIN, y)
  y += urlLines.length * 5 + 2
  doc.text(`${labels.strategy}: ${strategyLabel}`, MARGIN, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...GREEN)
  doc.text(labels.healthScore, MARGIN, y)
  y += 7

  doc.setTextColor(...TEXT)
  doc.setFontSize(22)
  const status = labels.statusLabels[result.healthStatus] || result.healthStatus
  doc.text(`${result.healthScore} / 100  (${status})`, MARGIN, y)
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...GREEN)
  doc.text(labels.categories, MARGIN, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...TEXT)
  for (const category of result.categories) {
    y = ensureSpace(doc, y, 6)
    const name = labels.categoryLabels[category.id] || category.id
    const catStatus = labels.statusLabels[category.status] || category.status
    doc.text(`${name}: ${category.score}  (${catStatus})`, MARGIN, y)
    y += 6
  }

  y += 6
  y = ensureSpace(doc, y, 14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...GREEN)
  doc.text(labels.biggestProblems, MARGIN, y)
  y += 8

  const problems = result.recommendations.slice(0, 5)

  if (!problems.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text(labels.noProblems, MARGIN, y)
    y += 8
  }
  else {
    problems.forEach((item, index) => {
      const impact = labels.impactLabels[item.impact] || item.impact
      const difficulty = labels.difficultyLabels[item.difficulty] || item.difficulty
      const titleLines = wrapLines(doc, `${index + 1}. ${item.title}`, maxWidth)
      const problemLines = wrapLines(doc, `${labels.problem}: ${item.description}`, maxWidth)
      const metaLine = `${labels.impact}: ${impact}  |  ${labels.difficulty}: ${difficulty}`

      y = ensureSpace(doc, y, 28)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...TEXT)
      doc.text(titleLines, MARGIN, y)
      y += titleLines.length * 5 + 1

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text(metaLine, MARGIN, y)
      y += 5

      doc.setFontSize(9)
      doc.setTextColor(...TEXT)
      doc.text(problemLines, MARGIN, y)
      y += problemLines.length * 4.5 + 2

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...GREEN)
      doc.setFontSize(9)
      doc.text(`${labels.howToFix}:`, MARGIN, y)
      y += 5

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...TEXT)
      const fixBodyLines = wrapLines(doc, item.recommendation, maxWidth)
      y = ensureSpace(doc, y, fixBodyLines.length * 4.5 + 8)
      doc.text(fixBodyLines, MARGIN, y)
      y += fixBodyLines.length * 4.5 + 8
    })
  }

  y = ensureSpace(doc, y, 18)
  doc.setDrawColor(...GREEN)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, MARGIN + maxWidth, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  const disclaimerLines = wrapLines(doc, labels.disclaimer, maxWidth)
  doc.text(disclaimerLines, MARGIN, y)
  y += disclaimerLines.length * 4 + 4
  doc.text(labels.footer, MARGIN, y)
}

export function auditPdfFilename(url: string, fetchedAt: string): string {
  let host = 'site'
  try {
    host = new URL(url).hostname || host
  }
  catch {
    host = url.replace(/^https?:\/\//, '').split('/')[0] || host
  }

  const safeHost = host
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'site'

  const date = new Date(fetchedAt)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `cpwd-audit-${safeHost}-${yyyy}-${mm}-${dd}.pdf`
}
