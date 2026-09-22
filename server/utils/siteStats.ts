import { createHmac, createHash, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { H3Event } from 'h3'
import { get } from '@vercel/blob'

const COOKIE = 'cpwd_stats'
const MAX_AGE_SEC = 60 * 60 * 24 * 30
const BLOB_PATH = 'cpwd/site-stats.json'
const FILE_PATH = resolve(process.cwd(), '.data/site-stats.json')
const RETAIN_DAYS = 90
const SERIES_DAYS = 14
const MAX_PAGES = 40
const MAX_COUNTRIES = 30

export type SiteEvent = 'pageview' | 'contact' | 'estimate' | 'scan'
export type StatsStore = 'blob' | 'file' | 'memory'

interface DayBucket {
  pageviews: number
  contacts: number
  estimates: number
  scans: number
}

interface SiteStatsData {
  version: 1
  totals: DayBucket
  days: Record<string, DayBucket>
  pages: Record<string, number>
  countries: Record<string, number>
}

export interface SiteStatsSnapshot {
  store: StatsStore
  persistent: boolean
  totals: DayBucket
  today: DayBucket
  series: Array<DayBucket & { date: string }>
  pages: Array<{ path: string, count: number }>
  countries: Array<{ code: string, count: number }>
}

const memory: { data: SiteStatsData | null, forced: boolean } = {
  data: null,
  forced: false,
}

let queue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.then(() => undefined, () => undefined)
  return run
}

export function statsPassword(): string {
  const value = useRuntimeConfig().statsPassword
  return typeof value === 'string' ? value.trim() : ''
}

export function statsConfigured(): boolean {
  return statsPassword().length >= 8
}

function blobToken(): string {
  const value = useRuntimeConfig().blobReadWriteToken
  return typeof value === 'string' ? value.trim() : ''
}

function blobEnabled(): boolean {
  return Boolean(blobToken() || process.env.BLOB_STORE_ID)
}

function blobOptions<T extends Record<string, unknown>>(options: T): T & { token?: string } {
  const token = blobToken()
  return token ? { ...options, token } : options
}

function emptyBucket(): DayBucket {
  return { pageviews: 0, contacts: 0, estimates: 0, scans: 0 }
}

function emptyStats(): SiteStatsData {
  return { version: 1, totals: emptyBucket(), days: {}, pages: {}, countries: {} }
}

function dayKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function shiftDay(daysBack: number): string {
  const [year = 1970, month = 1, day = 1] = dayKey().split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  utc.setUTCDate(utc.getUTCDate() - daysBack)
  const y = utc.getUTCFullYear()
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0')
  const d = String(utc.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function asBucket(value: unknown): DayBucket {
  const source = value && typeof value === 'object' ? value as Partial<DayBucket> : {}
  return {
    pageviews: positive(source.pageviews),
    contacts: positive(source.contacts),
    estimates: positive(source.estimates),
    scans: positive(source.scans),
  }
}

function positive(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number) || number < 0) return 0
  return Math.min(Math.floor(number), 50_000_000)
}

function parseStats(raw: string): SiteStatsData {
  try {
    const parsed = JSON.parse(raw) as Partial<SiteStatsData>
    const days: Record<string, DayBucket> = {}
    if (parsed.days && typeof parsed.days === 'object') {
      for (const [key, value] of Object.entries(parsed.days)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) days[key] = asBucket(value)
      }
    }
    return {
      version: 1,
      totals: asBucket(parsed.totals),
      days,
      pages: countMap(parsed.pages, 160),
      countries: countMap(parsed.countries, 2),
    }
  } catch {
    return emptyStats()
  }
}

function countMap(value: unknown, maxKey: number): Record<string, number> {
  if (!value || typeof value !== 'object') return {}
  const out: Record<string, number> = {}
  for (const [key, count] of Object.entries(value)) {
    if (key.length > maxKey) continue
    const next = positive(count)
    if (next > 0) out[key] = next
  }
  return out
}

function prune(data: SiteStatsData) {
  const oldest = shiftDay(RETAIN_DAYS - 1)
  for (const key of Object.keys(data.days)) {
    if (key < oldest) delete data.days[key]
  }
  data.pages = topCounts(data.pages, MAX_PAGES)
  data.countries = topCounts(data.countries, MAX_COUNTRIES)
}

function topCounts(map: Record<string, number>, limit: number): Record<string, number> {
  return Object.fromEntries(
    Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit),
  )
}

function preferredStore(): StatsStore {
  if (memory.forced) return 'memory'
  if (blobEnabled()) return 'blob'
  return 'file'
}

async function readStats(): Promise<{ data: SiteStatsData, store: StatsStore }> {
  const store = preferredStore()
  if (store === 'memory') return { data: memory.data ?? emptyStats(), store }

  try {
    if (store === 'blob') {
      const result = await get(BLOB_PATH, blobOptions({
        access: 'private' as const,
        useCache: false,
      }))
      if (!result?.stream || result.statusCode !== 200) {
        return { data: memory.data ?? emptyStats(), store }
      }
      const text = await new Response(result.stream).text()
      return { data: parseStats(text), store }
    }

    const text = await readFile(FILE_PATH, 'utf8')
    return { data: parseStats(text), store }
  } catch {
    return { data: memory.data ?? emptyStats(), store }
  }
}

async function writeStats(data: SiteStatsData, store: StatsStore) {
  prune(data)
  memory.data = data
  if (store === 'memory') return

  const body = JSON.stringify(data)
  try {
    if (store === 'blob') {
      const { put } = await import('@vercel/blob')
      await put(BLOB_PATH, body, blobOptions({
        access: 'private' as const,
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 60,
      }))
      return
    }

    await mkdir(dirname(FILE_PATH), { recursive: true })
    await writeFile(FILE_PATH, body, 'utf8')
  } catch (error) {
    memory.forced = true
    console.error('[stats] persistent store failed, keeping counts in memory', error)
  }
}

export function snapshot(data: SiteStatsData, store: StatsStore): SiteStatsSnapshot {
  const today = dayKey()
  const series = Array.from({ length: SERIES_DAYS }, (_, index) => {
    const date = shiftDay(SERIES_DAYS - 1 - index)
    return { date, ...asBucket(data.days[date]) }
  })

  return {
    store: memory.forced ? 'memory' : store,
    persistent: !memory.forced && store !== 'memory',
    totals: data.totals,
    today: asBucket(data.days[today]),
    series,
    pages: Object.entries(data.pages)
      .sort((a, b) => b[1] - a[1])
      .map(([path, count]) => ({ path, count })),
    countries: Object.entries(data.countries)
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count })),
  }
}

export async function readSiteStats(): Promise<SiteStatsSnapshot> {
  const { data, store } = await readStats()
  return snapshot(data, store)
}

export function recordSiteEvent(
  event: SiteEvent,
  meta: { path?: string, country?: string } = {},
) {
  return enqueue(async () => {
    const { data, store } = await readStats()
    const today = dayKey()
    const bucket = data.days[today] ?? emptyBucket()
    const field = event === 'pageview'
      ? 'pageviews'
      : event === 'contact'
        ? 'contacts'
        : event === 'estimate'
          ? 'estimates'
          : 'scans'

    bucket[field] += 1
    data.totals[field] += 1
    data.days[today] = bucket

    if (event === 'pageview' && meta.path) {
      data.pages[meta.path] = (data.pages[meta.path] ?? 0) + 1
    }
    if (event === 'pageview' && meta.country) {
      data.countries[meta.country] = (data.countries[meta.country] ?? 0) + 1
    }

    await writeStats(data, store)
  })
}

export function normalizeStatsPath(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const path = input.split('?')[0]?.split('#')[0] ?? ''
  if (!path.startsWith('/') || path.length > 120) return null
  if (path.startsWith('/stats') || path.startsWith('/api') || path.startsWith('/_')) return null
  if (!/^\/[a-z0-9/_~.-]*$/i.test(path)) return null
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

export function normalizeCountry(input: string | undefined): string | null {
  const code = input?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code) || code === 'XX') return null
  return code
}

export function isLikelyBot(userAgent: string | undefined): boolean {
  if (!userAgent || userAgent.length < 8) return true
  return /bot|crawler|spider|preview|slurp|wget|curl|headless|lighthouse|pagespeed|monitoring/i.test(userAgent)
}

function sign(exp: number, secret: string) {
  return createHmac('sha256', secret).update(`cpwd-stats.${exp}`).digest('base64url')
}

export function passwordsMatch(input: string, expected: string) {
  const left = createHash('sha256').update(input).digest()
  const right = createHash('sha256').update(expected).digest()
  return timingSafeEqual(left, right)
}

export function createStatsSession() {
  const exp = Date.now() + MAX_AGE_SEC * 1000
  return `${exp}.${sign(exp, statsPassword())}`
}

export function statsSessionValid(token: string | undefined): boolean {
  const secret = statsPassword()
  if (!secret || !token) return false
  const [expRaw, signature] = token.split('.')
  const exp = Number(expRaw)
  if (!expRaw || !signature || !Number.isFinite(exp) || exp < Date.now()) return false
  const expected = sign(exp, secret)
  const actualBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (actualBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(actualBuf, expectedBuf)
}

export function readStatsSession(event: H3Event) {
  return getCookie(event, COOKIE)
}

export function setStatsSession(event: H3Event) {
  setCookie(event, COOKIE, createStatsSession(), {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEC,
  })
}

export function clearStatsSession(event: H3Event) {
  deleteCookie(event, COOKIE, { path: '/' })
}

const recent = new Map<string, number>()

export function seenRecently(key: string, windowMs = 2000) {
  const now = Date.now()
  const previous = recent.get(key)
  if (previous && now - previous < windowMs) return true
  recent.set(key, now)
  if (recent.size > 500) {
    for (const [entry, at] of recent) {
      if (now - at >= windowMs) recent.delete(entry)
    }
  }
  return false
}

const attempts = new Map<string, { count: number, resetAt: number }>()

export function checkStatsAttempt(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucket = attempts.get(key)
  if (!bucket || now >= bucket.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}
