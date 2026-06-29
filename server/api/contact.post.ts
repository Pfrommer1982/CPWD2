import { Resend } from 'resend'

interface ContactBody {
  name?: string
  email?: string
  message?: string
  website?: string
}

interface ResendErrorShape {
  message?: string
  name?: string
  statusCode?: number
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<ContactBody>(event)

  if (body.website) {
    return { success: true }
  }

  const { name, email, message } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Alle velden zijn verplicht' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Ongeldig e-mailadres' })
  }

  const payload = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  }

  const toAddress = config.contactToEmail || 'info@cpwd.nl'
  const fromAddress = config.contactFromEmail || 'CPWD Contact <noreply@cpwd.nl>'
  const safeName = escapeHtml(payload.name)
  const safeEmail = escapeHtml(payload.email)
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, '<br>')

  if (!config.resendApiKey || config.resendApiKey.includes('xxxx')) {
    if (import.meta.dev) {
      console.info('[contact] dev mode — no Resend key, logged message:', payload)
      return { success: true }
    }
    throw createError({ statusCode: 503, statusMessage: 'Contactformulier is tijdelijk niet beschikbaar' })
  }

  const resend = new Resend(config.resendApiKey)

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: toAddress,
    replyTo: payload.email,
    subject: `Nieuw bericht van ${payload.name}`,
    html: `
      <h2>Nieuw contactbericht</h2>
      <p><strong>Naam:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Bericht:</strong></p>
      <p>${safeMessage}</p>
    `,
  })

  if (error) {
    const resendError = error as ResendErrorShape
    console.error('[contact] Resend error:', resendError)

    const domainUnverified = resendError.message?.includes('domain is not verified')

    if (import.meta.dev && domainUnverified) {
      console.warn('[contact] Resend domain not verified — logged message in dev instead of email')
      console.info('[contact]', payload)
      return { success: true }
    }

    if (domainUnverified) {
      throw createError({
        statusCode: 503,
        statusMessage: 'E-mail verzenden is nog niet geconfigureerd. Probeer het later opnieuw of mail direct naar info@cpwd.nl',
      })
    }

    throw createError({ statusCode: 502, statusMessage: 'Verzenden mislukt. Probeer het later opnieuw.' })
  }

  return { success: true }
})

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
