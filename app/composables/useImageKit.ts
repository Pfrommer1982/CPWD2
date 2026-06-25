export function useImageKit() {
  const config = useRuntimeConfig()

  function buildUrl(path: string, transforms?: Record<string, string | number>) {
    const endpoint = config.public.imagekitUrlEndpoint
    if (!endpoint) return path

    const base = `${endpoint.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

    if (!transforms || Object.keys(transforms).length === 0) {
      return base
    }

    const tr = Object.entries(transforms)
      .map(([key, value]) => `${key}-${value}`)
      .join(',')

    return `${base}?tr=${tr}`
  }

  async function fetchImages(folder = '/') {
    return await $fetch('/api/imagekit/images', { query: { folder } })
  }

  async function getAuthParams() {
    return await $fetch('/api/imagekit/auth')
  }

  return {
    buildUrl,
    fetchImages,
    getAuthParams,
  }
}
