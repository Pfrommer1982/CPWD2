import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{
    name?: string
    email?: string
    message?: string
    website?: string
  }>(event)

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

  const toAddress = config.contactToEmail || 'info@cpwd.nl'
  const safeName = escapeHtml(name.trim())
  const safeEmail = escapeHtml(email.trim())
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br>')

  if (config.resendApiKey) {
    const resend = new Resend(config.resendApiKey)

    const { error } = await resend.emails.send({
      from: 'CPWD Contact <noreply@cpwd.nl>',
      to: toAddress,
      replyTo: email.trim(),
      subject: `Nieuw bericht van ${name.trim()}`,
      html: `
        <h2>Nieuw contactbericht</h2>
        <p><strong>Naam:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Bericht:</strong></p>
        <p>${safeMessage}</p>
      `,
    })

    if (error) {
      console.error('[contact] Resend error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Verzenden mislukt' })
    }
  } else if (import.meta.dev) {
    console.info('[contact]', { name: name.trim(), email: email.trim(), message: message.trim() })
  } else {
    throw createError({ statusCode: 503, statusMessage: 'Contactformulier is tijdelijk niet beschikbaar' })
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
