import { CPWD_LOGO_PATH } from '~/constants/brand'

export function useImageKit() {
  const config = useRuntimeConfig()
  const urlEndpoint = config.public.imagekitUrlEndpoint as string

  function encodePath(path: string): string {
    return path
      .split('/')
      .map(segment => (segment ? encodeURIComponent(segment) : ''))
      .join('/')
  }

  function buildUrl(path: string, transforms?: string): string {
    if (!path) return ''
    if (path.startsWith('http')) return path

    const encodedPath = encodePath(path)

    if (!urlEndpoint) return encodedPath

    const base = urlEndpoint.replace(/\/$/, '')
    if (transforms) {
      return `${base}/tr:${transforms}${encodedPath}`
    }
    return `${base}${encodedPath}`
  }

  function parseAssetPath(path: string): { assetPath: string; search: string } {
    if (!path.startsWith('http')) {
      return { assetPath: path, search: '' }
    }

    const url = new URL(path)
    return {
      assetPath: url.pathname,
      search: url.search.replace(/^\?/, ''),
    }
  }

  function appendSearch(baseUrl: string, search: string) {
    if (!search) return baseUrl
    const joiner = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${joiner}${search}`
  }

  /** ImageKit video URL — orig-true bypasses transformation quota and serves the source mp4. */
  function video(path: string) {
    if (!path) return ''

    if (path.startsWith('http')) {
      const url = new URL(path)
      url.searchParams.set('tr', 'orig-true')
      return url.toString()
    }

    const base = buildUrl(path)
    if (!base) return ''

    const url = new URL(base)
    url.searchParams.set('tr', 'orig-true')
    return url.toString()
  }

  function isVideoPath(path: string): boolean {
    return /\.(mp4|webm|mov)$/i.test(path)
  }

  function responsive(path: string, w = 1200): string {
    return buildUrl(path, `w-${w},q-85,f-auto`)
  }

  function srcset(path: string, widths = [400, 800, 1200, 1600, 2000]): string {
    return widths
      .map(w => `${buildUrl(path, `w-${w},q-85,f-auto`)} ${w}w`)
      .join(', ')
  }

  function thumbnail(path: string, w = 800, h = 600): string {
    return buildUrl(path, `w-${w},h-${h},c-at_max,q-80,f-auto`)
  }

  function hero(path: string): string {
    return buildUrl(path, 'w-1920,q-90,f-auto')
  }

  function logo(h = 48): string {
    return buildUrl(CPWD_LOGO_PATH, `h-${h},q-90,f-auto`)
  }

  function screenshot(path: string, w = 1200): string {
    return buildUrl(path, `w-${w},e-trim,q-85,f-auto`)
  }

  function srcsetScreenshot(path: string, widths = [400, 800, 1200, 1600, 2000]): string {
    return widths
      .map(w => `${buildUrl(path, `w-${w},e-trim,q-85,f-auto`)} ${w}w`)
      .join(', ')
  }

  async function fetchImages(folder = '/') {
    return await $fetch('/api/imagekit/images', { query: { folder } })
  }

  async function getAuthParams() {
    return await $fetch('/api/imagekit/auth')
  }

  return { buildUrl, encodePath, srcset, srcsetScreenshot, thumbnail, hero, responsive, screenshot, logo, video, isVideoPath, fetchImages, getAuthParams }
}
