import ImageKit from 'imagekit'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  if (!config.imagekitPublicKey || !config.imagekitPrivateKey) {
    throw createError({ statusCode: 500, message: 'ImageKit credentials not configured' })
  }

  const imagekit = new ImageKit({
    publicKey: config.imagekitPublicKey,
    privateKey: config.imagekitPrivateKey,
    urlEndpoint: config.public.imagekitUrlEndpoint,
  })

  return imagekit.getAuthenticationParameters()
})
