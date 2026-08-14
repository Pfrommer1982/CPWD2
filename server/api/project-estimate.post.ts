import { Resend } from 'resend'
import type { ProjectEstimateRequestPayload } from '~/types/project-estimate'

interface ResendErrorShape {
  message?: string
  name?: string
  statusCode?: number
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<ProjectEstimateRequestPayload & { message?: string }>(event)

  if (body.website) {
    return { success: true }
  }

  const name = body.name?.trim() || ''
  const email = body.email?.trim() || ''
  const message = body.message?.trim() || ''
  const company = body.company?.trim() || ''
  const phone = body.phone?.trim() || ''

  if (!name || !email || !message || !body.estimate?.projectCode) {
    throw createError({ statusCode: 400, statusMessage: 'Required fields missing' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }

  const toAddress = config.contactToEmail || 'info@cpwd.nl'
  const fromAddress = config.contactFromEmail || 'CPWD Contact <noreply@cpwd.nl>'
  const code = escapeHtml(body.estimate.projectCode)
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeCompany = escapeHtml(company || '-')
  const safePhone = escapeHtml(phone || '-')
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')

  const payload = {
    name,
    email,
    company,
    phone,
    message,
    estimate: body.estimate,
  }

  if (!config.resendApiKey || config.resendApiKey.includes('xxxx')) {
    if (import.meta.dev) {
      console.info('[project-estimate] dev mode - no Resend key, logged lead:', payload)
      return { success: true }
    }
    throw createError({ statusCode: 503, statusMessage: 'Estimate request temporarily unavailable' })
  }

  const resend = new Resend(config.resendApiKey)
  const { error } = await resend.emails.send({
    from: fromAddress,
    to: toAddress,
    replyTo: email,
    subject: `Project estimator · ${body.estimate.projectCode} · ${name}`,
    html: `
      <h2>Project estimator aanvraag</h2>
      <p><strong>Projectcode:</strong> ${code}</p>
      <p><strong>Naam:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Bedrijf:</strong> ${safeCompany}</p>
      <p><strong>Telefoon:</strong> ${safePhone}</p>
      <p><strong>Configuratie:</strong></p>
      <p>${safeMessage}</p>
    `,
  })

  if (error) {
    const resendError = error as ResendErrorShape
    console.error('[project-estimate] Resend error:', resendError)

    const domainUnverified = resendError.message?.includes('domain is not verified')
    if (import.meta.dev && domainUnverified) {
      console.info('[project-estimate]', payload)
      return { success: true }
    }

    throw createError({ statusCode: 502, statusMessage: 'Sending failed' })
  }

  return { success: true }
})
