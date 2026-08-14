const MAX_URL_LENGTH = 2048

const BLOCKED_HOSTS = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
])

function isPrivateIpv4(hostname: string): boolean {
  const m = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const parts = m.slice(1).map(Number)
  if (parts.some(n => Number.isNaN(n) || n > 255) || parts.length !== 4) return true
  const a = parts[0]!
  const b = parts[1]!
  if (a === 10) return true
  if (a === 127) return true
  if (a === 0) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true
  return false
}

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (!host) return true
  if (BLOCKED_HOSTS.has(host)) return true
  if (host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return true
  if (host === '::1' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) return true
  if (isPrivateIpv4(host)) return true
  return false
}

export type UrlValidationResult =
  | { ok: true; url: string; hostname: string }
  | { ok: false; reason: 'empty' | 'too_long' | 'invalid' | 'scheme' | 'private' }

/**
 * Normalize and validate a public http(s) URL for site audit.
 * Adds https:// when protocol is missing.
 */
export function normalizeAuditUrl(raw: string): UrlValidationResult {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, reason: 'empty' }
  if (trimmed.length > MAX_URL_LENGTH) return { ok: false, reason: 'too_long' }

  const lowered = trimmed.toLowerCase()
  if (
    lowered.startsWith('javascript:')
    || lowered.startsWith('data:')
    || lowered.startsWith('file:')
    || lowered.startsWith('ftp:')
    || lowered.startsWith('blob:')
    || lowered.startsWith('vbscript:')
  ) {
    return { ok: false, reason: 'scheme' }
  }

  let candidate = trimmed
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`
  }

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return { ok: false, reason: 'invalid' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'scheme' }
  }

  if (!parsed.hostname || parsed.hostname.includes(' ')) {
    return { ok: false, reason: 'invalid' }
  }

  if (isPrivateHostname(parsed.hostname)) {
    return { ok: false, reason: 'private' }
  }

  parsed.hash = ''
  return { ok: true, url: parsed.toString(), hostname: parsed.hostname }
}

export const AUDIT_URL_MAX_LENGTH = MAX_URL_LENGTH
