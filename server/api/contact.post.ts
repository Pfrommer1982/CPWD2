export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{
    name: string
    email: string
    message: string
  }>(event)

  if (!body.name || !body.email || !body.message) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  // Placeholder: integrate Resend or Nodemailer when RESEND_API_KEY is set
  if (config.resendApiKey) {
    // await send via Resend API
  }

  return { success: true, message: 'Message received' }
})
