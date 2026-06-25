import ImageKit from 'imagekit'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const folder = (query.folder as string) || '/'

  if (!config.imagekitPublicKey || !config.imagekitPrivateKey) {
    throw createError({ statusCode: 500, message: 'ImageKit credentials not configured' })
  }

  const imagekit = new ImageKit({
    publicKey: config.imagekitPublicKey,
    privateKey: config.imagekitPrivateKey,
    urlEndpoint: config.public.imagekitUrlEndpoint,
  })

  try {
    const files = await imagekit.listFiles({
      path: folder,
      fileType: 'image',
    })
    return { success: true, files }
  } catch {
    throw createError({ statusCode: 500, message: 'ImageKit error' })
  }
})
