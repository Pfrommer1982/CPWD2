import { isIP } from 'node:net'
import type { H3Event } from 'h3'

interface VisitorContext {
  ip: string | null
  city: string | null
  region: string | null
  country: string | null
  vpn: boolean | null
  proxy: boolean | null
  tor: boolean | null
  provider: string | null
  networkService: string | null
}

interface NetworkLookup {
  vpn: boolean | null
  proxy: boolean | null
  tor: boolean | null
  provider: string | null
  networkService: string | null
}

const MAX_HEADER_LENGTH = 128
const MAX_LOCATION_LENGTH = 64

export default defineEventHandler(async (event): Promise<VisitorContext> => {
  setResponseHeaders(event, {
    'cache-control': 'private, no-store, max-age=0',
    'x-content-type-options': 'nosniff',
  })

  const ip = firstPublicIp([
    getRequestHeader(event, 'cf-connecting-ip'),
    getRequestHeader(event, 'x-vercel-forwarded-for'),
    getRequestHeader(event, 'x-forwarded-for'),
    getRequestHeader(event, 'x-real-ip'),
    getRequestHeader(event, 'x-nf-client-connection-ip'),
  ])

  const city = firstLocationValue([
    getRequestHeader(event, 'x-vercel-ip-city'),
    getRequestHeader(event, 'cf-ipcity'),
    getRequestHeader(event, 'x-city'),
  ])

  const region = firstLocationValue([
    getRequestHeader(event, 'x-vercel-ip-country-region'),
    getRequestHeader(event, 'cf-region'),
    getRequestHeader(event, 'x-region'),
  ])

  const country = firstCountryCode([
    getRequestHeader(event, 'x-vercel-ip-country'),
    getRequestHeader(event, 'cf-ipcountry'),
    getRequestHeader(event, 'x-country'),
  ])

  const network = ip ? await lookupNetworkStatus(ip, event) : unknownNetworkStatus()

  return { ip, city, region, country, ...network }
})

async function lookupNetworkStatus(
  ip: string,
  event: H3Event,
): Promise<NetworkLookup> {
  const config = useRuntimeConfig(event)
  const url = new URL('https://api.ipapi.is/')
  url.searchParams.set('q', ip)

  const apiKey = typeof config.ipapiIsApiKey === 'string' ? config.ipapiIsApiKey.trim() : ''
  if (apiKey) url.searchParams.set('key', apiKey)

  try {
    const response = await $fetch<Record<string, unknown>>(url.toString(), {
      timeout: 1000,
      retry: 0,
    })

    const vpn = response.is_vpn === true
    const proxy = response.is_proxy === true
    const tor = response.is_tor === true
    const hasPositiveSignal = vpn || proxy || tor
    const provider = sanitizeLocationValue(
      typeof response.company_name === 'string' ? response.company_name : undefined,
    )

    return {
      vpn,
      proxy,
      tor,
      provider,
      networkService: hasPositiveSignal ? provider : null,
    }
  } catch {
    return unknownNetworkStatus()
  }
}

function unknownNetworkStatus(): NetworkLookup {
  return {
    vpn: null,
    proxy: null,
    tor: null,
    provider: null,
    networkService: null,
  }
}

function firstPublicIp(values: Array<string | undefined>): string | null {
  for (const value of values) {
    if (!value) continue

    const first = value.slice(0, MAX_HEADER_LENGTH).split(',')[0]
    const normalized = normalizeIp(first ?? '')
    if (normalized && !isPrivateOrReservedIp(normalized)) return normalized
  }

  return null
}

function normalizeIp(value: string): string | null {
  let candidate = value.trim().replace(/^"|"$/g, '')

  if (candidate.startsWith('[')) {
    const bracketEnd = candidate.indexOf(']')
    if (bracketEnd < 0) return null
    candidate = candidate.slice(1, bracketEnd)
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    candidate = candidate.replace(/:\d+$/, '')
  }

  if (candidate.toLowerCase().startsWith('::ffff:')) {
    const mapped = candidate.slice(7)
    if (isIP(mapped) === 4) candidate = mapped
  }

  return isIP(candidate) ? candidate : null
}

function isPrivateOrReservedIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a = 0, b = 0, c = 0] = ip.split('.').map(Number)

    return (
      a === 0
      || a === 10
      || a === 127
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168)
      || (a === 192 && b === 0 && (c === 0 || c === 2))
      || (a === 198 && (b === 18 || b === 19))
      || (a === 198 && b === 51 && c === 100)
      || (a === 203 && b === 0 && c === 113)
      || a >= 224
    )
  }

  const normalized = ip.toLowerCase()
  return (
    normalized === '::'
    || normalized === '::1'
    || normalized.startsWith('fc')
    || normalized.startsWith('fd')
    || /^fe[89ab]/.test(normalized)
    || normalized.startsWith('ff')
    || normalized.startsWith('2001:db8')
  )
}

function firstLocationValue(values: Array<string | undefined>): string | null {
  for (const value of values) {
    const sanitized = sanitizeLocationValue(value)
    if (sanitized) return sanitized
  }

  return null
}

function sanitizeLocationValue(value: string | undefined): string | null {
  if (!value) return null

  const raw = value.slice(0, MAX_HEADER_LENGTH)
  let decoded = raw

  try {
    decoded = decodeURIComponent(raw)
  } catch {
    // A malformed encoded header is treated as plain text and sanitized below.
  }

  const sanitized = decoded
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s.,'’()&-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LOCATION_LENGTH)

  return sanitized || null
}

function firstCountryCode(values: Array<string | undefined>): string | null {
  for (const value of values) {
    const code = value?.slice(0, 8).trim().toUpperCase()
    if (code && /^[A-Z]{2}$/.test(code) && code !== 'XX') return code
  }

  return null
}
