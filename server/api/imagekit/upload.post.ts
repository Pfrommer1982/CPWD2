import ImageKit from 'imagekit'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!config.imagekitPublicKey || !config.imagekitPrivateKey) {
    throw createError({ statusCode: 500, message: 'ImageKit credentials not configured' })
  }

  const imagekit = new ImageKit({
    publicKey: config.imagekitPublicKey,
    privateKey: config.imagekitPrivateKey,
    urlEndpoint: config.public.imagekitUrlEndpoint,
  })

  try {
    const result = await imagekit.upload({
      file: body.file,
      fileName: body.fileName || `upload-${Date.now()}`,
      folder: body.folder || '/uploads',
    })
    return { success: true, result }
  } catch {
    throw createError({ statusCode: 500, message: 'Upload failed' })
  }
})
