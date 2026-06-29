const PREFIXES = ['SIG', 'VEC', 'HZ', 'RNG', 'PKT', 'TRK', 'ALT', 'BUF', 'LAT', 'LON']
const SUFFIXES = ['OK', 'RX', 'TX', 'SYNC', 'LOCK']

function seed(n: number) {
  const x = Math.sin(n * 43758.5453) * 10000
  return x - Math.floor(x)
}

export interface TacticalDataCell {
  id: number
  text: string
  prefix: string
  hex: string
  suffix: string
  live: boolean
  left: string
  top: string
  opacity: number
  size: string
}

export function formatTacticalLine(prefix: string, hex: string, val: string | number, suffix: string) {
  return `${prefix}/${hex} ${val} ${suffix}`
}

export function spinTacticalValue() {
  return (Math.random() * 9999).toFixed(Math.random() > 0.55 ? 0 : 1)
}

export function buildTacticalDataCells(count: number, seedOffset = 0, liveCount = 2): TacticalDataCell[] {
  const liveIds = new Set<number>()
  for (let i = 0; i < liveCount; i++) {
    liveIds.add(Math.floor(seed(seedOffset * 31 + i * 17.3) * count))
  }

  return Array.from({ length: count }, (_, i) => {
    const n = i + seedOffset * 997
    const hex = Math.floor(seed(n * 4.1) * 0xffffff).toString(16).toUpperCase().padStart(6, '0')
    const prefix = PREFIXES[i % PREFIXES.length]
    const suffix = SUFFIXES[Math.floor(seed(n * 6.7) * SUFFIXES.length)]
    const val = (seed(n * 8.3) * 9999).toFixed(seed(n * 9.1) > 0.5 ? 0 : 1)
    const live = liveIds.has(i)

    return {
      id: i,
      prefix,
      hex,
      suffix,
      live,
      text: formatTacticalLine(prefix, hex, val, suffix),
      left: `${6 + seed(n * 2.1) * 88}%`,
      top: `${4 + seed(n * 3.3) * 92}%`,
      opacity: live ? 0.28 + seed(n * 5.9) * 0.18 : 0.12 + seed(n * 5.9) * 0.22,
      size: live || seed(n * 7.2) > 0.72 ? '8px' : '7px',
    }
  })
}
