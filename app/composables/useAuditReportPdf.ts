import type { SiteAuditResult } from '~/types/site-audit'
import {
  auditPdfFilename,
  fillAuditReportPdf,
  type AuditReportPdfLabels,
} from '~/utils/auditReportPdf'

export function useAuditReportPdf() {
  const copy = useSectionTranslations('websiteScanner')
  const generating = ref(false)

  function buildLabels(): AuditReportPdfLabels {
    return {
      title: copy.t('pdf.title'),
      generatedOn: copy.t('pdf.generatedOn'),
      url: copy.t('pdf.url'),
      strategy: copy.t('pdf.strategy'),
      healthScore: copy.t('pdf.healthScore'),
      categories: copy.t('pdf.categories'),
      biggestProblems: copy.t('pdf.biggestProblems'),
      problem: copy.t('pdf.problem'),
      howToFix: copy.t('pdf.howToFix'),
      impact: copy.t('pdf.impact'),
      difficulty: copy.t('pdf.difficulty'),
      noProblems: copy.t('pdf.noProblems'),
      disclaimer: copy.t('pdf.disclaimer'),
      footer: copy.t('pdf.footer'),
      strategyMobile: copy.t('report.mobile'),
      strategyDesktop: copy.t('report.desktop'),
      categoryLabels: {
        performance: copy.t('categories.performance'),
        seo: copy.t('categories.seo'),
        accessibility: copy.t('categories.accessibility'),
        'best-practices': copy.t('categories.best-practices'),
      },
      statusLabels: {
        excellent: copy.t('status.excellent'),
        good: copy.t('status.good'),
        'needs-attention': copy.t('status.needs-attention'),
        poor: copy.t('status.poor'),
      },
      impactLabels: {
        high: copy.t('impact.high'),
        medium: copy.t('impact.medium'),
        low: copy.t('impact.low'),
      },
      difficultyLabels: {
        easy: copy.t('difficulty.easy'),
        medium: copy.t('difficulty.medium'),
        hard: copy.t('difficulty.hard'),
      },
    }
  }

  async function downloadSummaryPdf(result: SiteAuditResult) {
    if (!import.meta.client || generating.value) return

    generating.value = true
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      fillAuditReportPdf(doc, result, buildLabels())

      const blob = doc.output('blob')
      const filename = auditPdfFilename(result.url, result.fetchedAt)
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filename
      anchor.rel = 'noopener'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    }
    finally {
      generating.value = false
    }
  }

  return {
    generating,
    downloadSummaryPdf,
  }
}
