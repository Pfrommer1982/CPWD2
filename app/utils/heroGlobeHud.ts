import { COMMS_RGB, COMMS_RGB_LIGHT } from '~/constants/brand'

const DATA_PREFIXES = ['PKT', 'VEC', 'ALT', 'SIG', 'BUF', 'TRK', 'RNG', 'HZ', 'LAT', 'LON']
const DATA_SUFFIXES = ['OK', 'RX', 'TX', 'SYNC', 'LOCK', 'ARM', 'GO', 'HOLD']
const HUD_BG = '5, 8, 7'

export const HERO_HUD_ACCESS_CHECK_MS = 750
export const HERO_HUD_SEARCH_MS = 1150
export const HERO_HUD_HIT_SETTLE_MS = 650
export const HERO_HUD_HIT_BLINK_MS = 700
export const HERO_HUD_HIT_EXPAND_MS = 450
export const HERO_HUD_HIT_HOLD_MS = 1900
export const HERO_HUD_HIT_RELEASE_MS = 650
export const HERO_HUD_GRANT_AT_MS = HERO_HUD_ACCESS_CHECK_MS
  + HERO_HUD_SEARCH_MS
  + HERO_HUD_HIT_SETTLE_MS
  + HERO_HUD_HIT_BLINK_MS
  + HERO_HUD_HIT_EXPAND_MS
export const HERO_HUD_HIT_TOTAL_MS = HERO_HUD_GRANT_AT_MS
  + HERO_HUD_HIT_HOLD_MS
  + HERO_HUD_HIT_RELEASE_MS

export interface HeroHudVisitorRecord {
  ip: string
  location: string
  vpn: boolean
  proxy: boolean
  tor: boolean
  provider: string | null
  networkService: string | null
  labels: {
    found: string
    ip: string
    location: string
    provider: string
    vpn: string
    proxy: string
    tor: string
    vpnExit: string
    masked: string
    accessCheck: string
    accessStatus: string
    searching: string
    matched: string
    granted: string
    welcome: string
  }
}

export interface HeroHudVisitorHit {
  startTimeMs: number
  record: HeroHudVisitorRecord
  static: boolean
}

function hudSeed(n: number) {
  const x = Math.sin(n * 43758.5453) * 10000
  return x - Math.floor(x)
}

/** Irregular scroll speed - slow drift with occasional brief bursts. */
function scrollRate(t: number, channel: number) {
  const slot = Math.floor(t * (0.05 + channel * 0.008))
  const base = 0.35 + hudSeed(slot + channel * 47) * 0.55
  const wave = Math.sin(t * (0.22 + channel * 0.05) + channel * 1.3) * 0.18
  const surge = Math.sin(t * (1.2 + channel * 0.12) + 0.8) > 0.94
    ? 0.2 + hudSeed(slot + 11) * 0.65
    : 0
  return 0.12 + (base + wave + surge) * 0.75
}

function scrollOffset(t: number, channel: number) {
  const rate = scrollRate(t, channel)
  const rateLag = scrollRate(t * 0.82 + 0.4, channel + 9)
  return t * rate + Math.sin(t * (0.45 + channel * 0.1)) * 1.2 + t * rateLag * 0.08
}

function easeOutCubic(p: number) {
  const t = Math.min(1, Math.max(0, p))
  return 1 - (1 - t) ** 3
}

function easeInOutCubic(p: number) {
  const t = Math.min(1, Math.max(0, p))
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}

function drawIntroScanLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  alpha: number,
) {
  ctx.save()
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.72 * alpha})`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.stroke()
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.14 * alpha})`
  ctx.fillRect(x, y - 2, w, 4)
  ctx.restore()
}

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  len: number,
) {
  const x0 = cx - w / 2
  const x1 = cx + w / 2
  const y0 = cy - h / 2
  const y1 = cy + h / 2

  ctx.beginPath()
  ctx.moveTo(x0, y0 + len)
  ctx.lineTo(x0, y0)
  ctx.lineTo(x0 + len, y0)
  ctx.moveTo(x1 - len, y0)
  ctx.lineTo(x1, y0)
  ctx.lineTo(x1, y0 + len)
  ctx.moveTo(x1, y1 - len)
  ctx.lineTo(x1, y1)
  ctx.lineTo(x1 - len, y1)
  ctx.moveTo(x0 + len, y1)
  ctx.lineTo(x0, y1)
  ctx.lineTo(x0, y1 - len)
  ctx.stroke()
}

function drawScanBackdrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  ctx.fillStyle = `rgba(${HUD_BG}, 0.78)`
  ctx.fillRect(x, y, w, h)

  const cx = x + w / 2
  const cy = y + h / 2
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.58)
  grad.addColorStop(0, `rgba(${HUD_BG}, 0.35)`)
  grad.addColorStop(1, `rgba(${HUD_BG}, 0.88)`)
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)

  ctx.restore()
}

function drawStaticInterference(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  const tick = Math.floor(t * (10 + hudSeed(Math.floor(t * 0.3)) * 8))

  for (let i = 0; i < 48; i++) {
    const seed = tick * 131 + i * 919
    const bandY = y + hudSeed(seed) * h
    const bandW = w * (0.08 + hudSeed(seed + 3) * 0.55)
    const bandX = x + hudSeed(seed + 7) * (w - bandW)
    ctx.fillStyle = `rgba(${COMMS_RGB}, ${0.03 + hudSeed(seed + 5) * 0.04})`
    ctx.fillRect(bandX, bandY, bandW, 1)
  }

  for (let i = 0; i < 28; i++) {
    const seed = tick * 67 + i * 433
    const px = x + hudSeed(seed) * w
    const py = y + hudSeed(seed + 17) * h
    ctx.fillStyle = `rgba(${COMMS_RGB}, ${0.02 + hudSeed(seed + 41) * 0.03})`
    ctx.fillRect(px, py, 1, 1)
  }

  if (Math.sin(t * 11.7) > 0.94 || Math.sin(t * 23.1 + 1.2) > 0.97) {
    const gy = y + hudSeed(Math.floor(t * 30)) * (h - 8)
    const gw = w * (0.18 + hudSeed(tick) * 0.35)
    const gx = x + hudSeed(tick + 9) * (w - gw)
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.08)`
    ctx.fillRect(gx, gy, gw, 2)
  }

  for (let i = 0; i < 4; i++) {
    const vx = x + (i / 3) * w
    ctx.fillStyle = `rgba(${COMMS_RGB}, 0.02)`
    ctx.fillRect(vx, y, 1, h)
  }

  ctx.restore()
}

function formatDataLine(index: number, col: number) {
  const n = Math.floor(hudSeed(index * 997 + col * 7919) * 999999)
  const hex = n.toString(16).toUpperCase().padStart(6, '0')
  const prefix = DATA_PREFIXES[(index + col) % DATA_PREFIXES.length]
  const suffix = DATA_SUFFIXES[(index + col * 2) % DATA_SUFFIXES.length]
  const val = (hudSeed(n) * 9999).toFixed(hudSeed(n + 1) > 0.5 ? 1 : 0)
  return `${prefix}/${hex} ${val} ${suffix}`
}

function drawScrollingData(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  const lineH = 9
  const rows = Math.floor(h / lineH) - 1
  const colW = w / 2

  ctx.font = '7px "Courier New", monospace'

  for (let col = 0; col < 2; col++) {
    const colX = x + 8 + col * colW
    const scroll = scrollOffset(t, col)
    for (let r = 0; r < rows; r++) {
      const rowIndex = Math.floor(r + scroll) + col * 3
      const flicker = Math.sin(t * 9 + rowIndex) > 0.92 ? 0.14 : 0.26 + (r % 3) * 0.05
      ctx.fillStyle = `rgba(${COMMS_RGB}, ${flicker})`
      ctx.fillText(formatDataLine(rowIndex, col), colX, y + 11 + r * lineH)
    }
  }

  ctx.restore()
}

function fitHudText(
  ctx: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
) {
  if (ctx.measureText(value).width <= maxWidth) return value

  let fitted = value
  while (fitted.length > 1 && ctx.measureText(`${fitted}…`).width > maxWidth) {
    fitted = fitted.slice(0, -1)
  }
  return `${fitted}…`
}

function drawSelectionRow(
  ctx: CanvasRenderingContext2D,
  bx: number,
  bw: number,
  targetY: number,
  alpha: number,
  record: HeroHudVisitorRecord,
) {
  const colW = bw / 2
  const rowX = bx + colW + 4
  const rowW = colW - 8

  ctx.save()
  ctx.globalAlpha = alpha

  ctx.fillStyle = `rgba(${HUD_BG}, 0.92)`
  ctx.fillRect(rowX, targetY - 6, rowW, 12)
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.16)`
  ctx.fillRect(rowX, targetY - 6, rowW, 12)
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.86)`
  ctx.lineWidth = 1

  ctx.beginPath()
  ctx.moveTo(rowX, targetY - 1)
  ctx.lineTo(rowX, targetY - 6)
  ctx.lineTo(rowX + 8, targetY - 6)
  ctx.moveTo(rowX + rowW - 8, targetY - 6)
  ctx.lineTo(rowX + rowW, targetY - 6)
  ctx.lineTo(rowX + rowW, targetY - 1)
  ctx.moveTo(rowX + rowW, targetY + 1)
  ctx.lineTo(rowX + rowW, targetY + 6)
  ctx.lineTo(rowX + rowW - 8, targetY + 6)
  ctx.moveTo(rowX + 8, targetY + 6)
  ctx.lineTo(rowX, targetY + 6)
  ctx.lineTo(rowX, targetY + 1)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = '600 7px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.96)`
  ctx.fillText(fitHudText(ctx, `MATCH/${record.ip}`, rowW - 10), rowX + 5, targetY + 3)
  ctx.restore()
}

function drawSequenceStatusStrip(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  label: string,
  detail: string,
  alpha = 1,
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = `rgba(${HUD_BG}, 0.92)`
  ctx.fillRect(bx + 4, by + 4, bw - 8, 17)
  ctx.strokeStyle = `rgba(${COMMS_RGB}, 0.45)`
  ctx.beginPath()
  ctx.moveTo(bx + 4, by + 21)
  ctx.lineTo(bx + bw - 4, by + 21)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = '600 7px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.95)`
  ctx.fillText(fitHudText(ctx, label, bw * 0.56), bx + 9, by + 15)
  ctx.textAlign = 'right'
  ctx.font = '6px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.78)`
  ctx.fillText(fitHudText(ctx, detail, bw * 0.38), bx + bw - 9, by + 15)
  ctx.restore()
}

function drawAuthorizationCheck(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  progress: number,
  record: HeroHudVisitorRecord,
) {
  const panelW = bw * 0.76
  const panelH = 44
  const panelX = bx + (bw - panelW) / 2
  const panelY = by + bh * 0.5 - panelH / 2

  ctx.save()
  ctx.fillStyle = `rgba(${HUD_BG}, 0.9)`
  ctx.fillRect(panelX, panelY, panelW, panelH)
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.56)`
  drawCornerBrackets(ctx, panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, 7)

  ctx.textAlign = 'center'
  ctx.font = '600 10px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.98)`
  ctx.fillText(fitHudText(ctx, record.labels.accessCheck, panelW - 18), panelX + panelW / 2, panelY + 17)
  ctx.font = '7px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.82)`
  ctx.fillText(fitHudText(ctx, record.labels.accessStatus, panelW - 18), panelX + panelW / 2, panelY + 30)

  const segments = 14
  const active = Math.max(1, Math.ceil(progress * segments))
  const gap = 2
  const segmentW = (panelW - 20 - gap * (segments - 1)) / segments
  for (let i = 0; i < segments; i++) {
    ctx.fillStyle = i < active
      ? `rgba(${COMMS_RGB_LIGHT}, ${0.34 + (i / segments) * 0.5})`
      : `rgba(${COMMS_RGB}, 0.12)`
    ctx.fillRect(panelX + 10 + i * (segmentW + gap), panelY + 37, segmentW, 2)
  }
  ctx.restore()
}

function drawExpandedVisitorRecord(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  targetY: number,
  openProgress: number,
  grantedProgress: number,
  record: HeroHudVisitorRecord,
) {
  const colW = bw / 2
  const rowX = bx + colW + 4
  const rowW = colW - 8
  const activeSignals = [
    record.vpn ? record.labels.vpn : '',
    record.proxy ? record.labels.proxy : '',
    record.tor ? record.labels.tor : '',
  ].filter(Boolean)
  const hasMaskedNetwork = activeSignals.length > 0
  const hasProvider = Boolean(record.provider)
  const calloutH = 70 + (hasProvider ? 13 : 0) + (hasMaskedNetwork ? 14 : 0)
  const calloutY = Math.max(by + 25, Math.min(targetY - calloutH * 0.52, by + bh - calloutH - 8))
  const copyW = rowW - 10
  const open = easeOutCubic(openProgress)
  const visibleH = 12 + (calloutH - 12) * open
  const clipY = targetY - visibleH / 2

  ctx.save()
  ctx.beginPath()
  ctx.rect(rowX - 2, clipY, rowW + 4, visibleH)
  ctx.clip()

  ctx.fillStyle = `rgba(${HUD_BG}, 0.95)`
  ctx.fillRect(rowX, calloutY, rowW, calloutH)
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.06)`
  ctx.fillRect(rowX, calloutY, rowW, calloutH)
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.44 + open * 0.3})`
  drawCornerBrackets(ctx, rowX + rowW / 2, calloutY + calloutH / 2, rowW, calloutH, 8)

  ctx.textAlign = 'left'
  ctx.font = '600 7px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.94)`
  ctx.fillText(fitHudText(ctx, record.labels.matched, copyW), rowX + 5, calloutY + 11)

  if (activeSignals.length) {
    const badge = activeSignals.join('/')
    ctx.font = '600 6px "Courier New", monospace'
    const badgeW = ctx.measureText(badge).width + 6
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.16)`
    ctx.fillRect(rowX + rowW - badgeW - 4, calloutY + 3, badgeW, 9)
    ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.5)`
    ctx.strokeRect(rowX + rowW - badgeW - 4, calloutY + 3, badgeW, 9)
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.96)`
    ctx.fillText(badge, rowX + rowW - badgeW - 1, calloutY + 11)
  }

  ctx.font = '7px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.82)`
  ctx.fillText(
    fitHudText(ctx, `${record.labels.ip} ${record.ip}`, copyW),
    rowX + 5,
    calloutY + 25,
  )
  ctx.fillText(
    fitHudText(ctx, `${record.labels.location} ${record.location}`, copyW),
    rowX + 5,
    calloutY + 38,
  )

  let detailY = calloutY + 51

  if (record.provider) {
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.8)`
    ctx.fillText(
      fitHudText(ctx, `${record.labels.provider} ${record.provider}`, copyW),
      rowX + 5,
      detailY,
    )
    detailY += 13
  }

  if (hasMaskedNetwork) {
    const exitLabel = record.vpn ? record.labels.vpnExit : activeSignals.join('/')
    const service = record.networkService && record.networkService !== record.provider
      ? ` · ${record.networkService}`
      : ''
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.8)`
    ctx.fillText(
      fitHudText(ctx, `${exitLabel} // ${record.labels.masked}${service}`, copyW),
      rowX + 5,
      detailY,
    )
    detailY += 14
  }

  if (grantedProgress > 0.001) {
    const granted = easeOutCubic(grantedProgress)
    const stampY = detailY + 1
    ctx.globalAlpha = granted
    ctx.fillStyle = `rgba(${HUD_BG}, 0.86)`
    ctx.fillRect(rowX + 4, stampY - 10, rowW - 8, 25)
    ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.65)`
    ctx.strokeRect(rowX + 4, stampY - 10, rowW - 8, 25)
    ctx.textAlign = 'center'
    ctx.font = '700 10px "Courier New", monospace'
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 1)`
    ctx.fillText(fitHudText(ctx, record.labels.granted, rowW - 16), rowX + rowW / 2, stampY)
    ctx.font = '600 6px "Courier New", monospace'
    ctx.fillStyle = `rgba(${COMMS_RGB}, 0.88)`
    ctx.fillText(fitHudText(ctx, record.labels.welcome, rowW - 16), rowX + rowW / 2, stampY + 10)
  }
  ctx.restore()
}

function drawTickerStrip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  t: number,
) {
  const scroll = scrollOffset(t, 7)
  const start = Math.floor(scroll * 0.9)
  let strip = ''
  for (let i = 0; i < 14; i++) {
    const n = Math.floor(hudSeed(start + i * 17) * 999)
    strip += `${n.toString(16).toUpperCase().padStart(3, '0')} `
  }

  ctx.font = '7px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.35)`
  ctx.textAlign = 'left'
  ctx.fillText(strip, x, y)
}

export function drawHeroGlobeHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeMs: number,
  scrollProgress: number,
  hudIntro = 1,
  visitorHit: HeroHudVisitorHit | null = null,
) {
  if (w < 520) return

  const renderTimeMs = visitorHit?.static ? visitorHit.startTimeMs : timeMs
  const t = renderTimeMs * 0.001
  const cx = w * (0.76 + scrollProgress * 0.04)
  const cy = h * 0.5
  const radius = Math.min(w, h) * (0.36 - scrollProgress * 0.04)
  const bw = radius * 1.05
  const bh = radius * 1.02
  const bx = cx - bw / 2
  const by = cy - bh / 2

  const lineT = easeOutCubic(Math.min(1, hudIntro / 0.22))
  const expandT = easeOutCubic(Math.max(0, (hudIntro - 0.18) / 0.82))
  const lineW = bw * lineT
  const lineX = cx - lineW / 2

  if (expandT <= 0.001) {
    drawIntroScanLine(ctx, lineX, cy, lineW, lineT)
    return
  }

  const revealH = Math.max(2, bh * expandT)
  const clipY = cy - revealH / 2
  const bracketLen = 6 + expandT * 12
  const contentAlpha = easeOutCubic(Math.max(0, (expandT - 0.12) / 0.88))
  const sideFade = easeOutCubic(Math.max(0, (expandT - 0.52) / 0.48))

  drawIntroScanLine(ctx, bx, cy, bw, Math.min(1, lineT * 0.85 + expandT * 0.15))

  ctx.save()
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.15 + contentAlpha * 0.85

  ctx.beginPath()
  ctx.rect(bx, clipY, bw, revealH)
  ctx.clip()

  drawScanBackdrop(ctx, bx, by, bw, bh)
  drawStaticInterference(ctx, bx, by, bw, bh, t)
  drawScrollingData(ctx, bx, by, bw, bh, t)

  ctx.strokeStyle = `rgba(${COMMS_RGB}, ${(0.28 + Math.sin(t * 1.6) * 0.06) * contentAlpha})`
  drawCornerBrackets(ctx, cx, cy, bw, bh, bracketLen)

  const scanRate = 0.018 + scrollRate(t, 20) * 0.004
  const normalScanY = by + ((t * scanRate + scrollProgress * 0.12) % 1) * bh
  let scanY = normalScanY
  let selectionAlpha = 0
  let recordOpen = 0
  let grantedProgress = 0
  let statusLabel = ''
  let statusDetail = ''
  let showAuthorization = false
  let authorizationProgress = 0
  const targetRow = Math.round((bh * 0.62 - 11) / 9)
  const targetScanY = by + 11 + targetRow * 9 - 3

  if (visitorHit) {
    const elapsed = timeMs - visitorHit.startTimeMs
    const searchAt = HERO_HUD_ACCESS_CHECK_MS
    const settleAt = searchAt + HERO_HUD_SEARCH_MS
    const blinkAt = settleAt + HERO_HUD_HIT_SETTLE_MS
    const expandAt = blinkAt + HERO_HUD_HIT_BLINK_MS
    const holdAt = expandAt + HERO_HUD_HIT_EXPAND_MS
    const releaseAt = holdAt + HERO_HUD_HIT_HOLD_MS
    const sequenceSeed = Math.floor(visitorHit.startTimeMs * 0.01)
    const searchHash = Math.floor(hudSeed(sequenceSeed + Math.floor(Math.max(0, elapsed) / 90)) * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, '0')
    const matchHash = Math.floor(hudSeed(sequenceSeed + 997) * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, '0')
    const recordCount = 2048 + Math.floor(hudSeed(sequenceSeed + Math.floor(Math.max(0, elapsed) / 120)) * 7951)

    if (visitorHit.static) {
      scanY = targetScanY
      selectionAlpha = 1
      recordOpen = 1
      grantedProgress = 1
      statusLabel = visitorHit.record.labels.granted
      statusDetail = `AUTH/0x${matchHash}`
    } else if (elapsed >= 0 && elapsed < searchAt) {
      showAuthorization = true
      authorizationProgress = elapsed / HERO_HUD_ACCESS_CHECK_MS
    } else if (elapsed >= searchAt && elapsed < settleAt) {
      const search = (elapsed - searchAt) / HERO_HUD_SEARCH_MS
      const startT = visitorHit.startTimeMs * 0.001
      const startRate = 0.018 + scrollRate(startT, 20) * 0.004
      const startPosition = (startT * startRate + scrollProgress * 0.12) % 1
      scanY = by + ((startPosition + search * 2.35) % 1) * bh
      statusLabel = visitorHit.record.labels.searching
      statusDetail = `${recordCount.toString().padStart(4, '0')} // #${searchHash}`
    } else if (elapsed >= settleAt && elapsed < blinkAt) {
      const settle = easeInOutCubic((elapsed - settleAt) / HERO_HUD_HIT_SETTLE_MS)
      const startT = visitorHit.startTimeMs * 0.001
      const startRate = 0.018 + scrollRate(startT, 20) * 0.004
      const startPosition = (startT * startRate + scrollProgress * 0.12) % 1
      const searchEndY = by + ((startPosition + 2.35) % 1) * bh
      scanY = searchEndY + (targetScanY - searchEndY) * settle
      statusLabel = visitorHit.record.labels.searching
      statusDetail = `${recordCount.toString().padStart(4, '0')} // #${searchHash}`
      selectionAlpha = easeOutCubic(Math.max(0, (settle - 0.72) / 0.28))
    } else if (elapsed >= blinkAt && elapsed < expandAt) {
      const blinkProgress = (elapsed - blinkAt) / HERO_HUD_HIT_BLINK_MS
      scanY = targetScanY
      selectionAlpha = Math.floor(blinkProgress * 6) % 2 === 0 ? 1 : 0.22
      statusLabel = visitorHit.record.labels.matched
      statusDetail = `LOCK // #${matchHash}`
    } else if (elapsed >= expandAt && elapsed < holdAt) {
      scanY = targetScanY
      selectionAlpha = 1
      recordOpen = (elapsed - expandAt) / HERO_HUD_HIT_EXPAND_MS
      statusLabel = visitorHit.record.labels.matched
      statusDetail = `LOCK // #${matchHash}`
    } else if (elapsed >= holdAt && elapsed < releaseAt) {
      scanY = targetScanY
      selectionAlpha = 1
      recordOpen = 1
      grantedProgress = Math.min(1, (elapsed - holdAt) / 260)
      statusLabel = visitorHit.record.labels.granted
      statusDetail = `AUTH // #${matchHash}`
    } else if (elapsed >= releaseAt && elapsed < HERO_HUD_HIT_TOTAL_MS) {
      const release = easeInOutCubic(
        (elapsed - releaseAt) / HERO_HUD_HIT_RELEASE_MS,
      )
      scanY = targetScanY + (normalScanY - targetScanY) * release
      selectionAlpha = 1 - release
      recordOpen = 1 - release
      grantedProgress = 1 - release
      statusLabel = visitorHit.record.labels.granted
      statusDetail = 'SESSION // OPEN'
    }
  }

  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.22 * contentAlpha})`
  ctx.beginPath()
  ctx.moveTo(bx, scanY)
  ctx.lineTo(bx + bw, scanY)
  ctx.stroke()

  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, ${(0.06 + Math.sin(t * 18) * 0.03) * contentAlpha})`
  ctx.fillRect(bx, scanY - 6, bw, 12)

  if (visitorHit) {
    if (showAuthorization) {
      drawAuthorizationCheck(
        ctx,
        bx,
        by,
        bw,
        bh,
        authorizationProgress,
        visitorHit.record,
      )
    }
    if (statusLabel) {
      drawSequenceStatusStrip(ctx, bx, by, bw, statusLabel, statusDetail, contentAlpha)
    }
    if (selectionAlpha > 0.001) {
      drawSelectionRow(
        ctx,
        bx,
        bw,
        targetScanY,
        selectionAlpha * contentAlpha,
        visitorHit.record,
      )
    }
    if (recordOpen > 0.001) {
      drawExpandedVisitorRecord(
        ctx,
        bx,
        by,
        bw,
        bh,
        targetScanY,
        recordOpen,
        grantedProgress,
        visitorHit.record,
      )
    }
  }

  ctx.strokeStyle = `rgba(${COMMS_RGB}, ${0.45 * contentAlpha})`
  ctx.beginPath()
  ctx.arc(cx, cy, 4, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - 10, cy)
  ctx.lineTo(cx + 10, cy)
  ctx.moveTo(cx, cy - 10)
  ctx.lineTo(cx, cy + 10)
  ctx.stroke()

  if (expandT > 0.88) {
    drawTickerStrip(ctx, bx, by + bh + 10, bw, t)
  }

  ctx.restore()

  ctx.save()
  const blink = Math.sin(t * 3.2) > 0.75 ? 0.35 : 1
  ctx.globalAlpha = (0.55 + scrollProgress * 0.15) * sideFade
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.85 * blink})`
  ctx.font = '600 9px "Courier New", monospace'
  ctx.textAlign = 'left'

  const tx = cx + bw / 2 + 16
  const ty = by + 8
  const sig = (98.1 + Math.sin(t * 0.7) * 0.4).toFixed(1)
  const uplink = Math.round(78 + Math.sin(t * 0.45) * 4)
  const hash = Math.floor(hudSeed(Math.floor(scrollOffset(t, 3)) * 13) * 0xffffff).toString(16).toUpperCase().padStart(6, '0')

  ctx.fillText('CPWD // WEB DEVELOPMENT', tx, ty)
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.75)`
  ctx.font = '9px "Courier New", monospace'
  ctx.fillText(`LOAD ${'█'.repeat(Math.floor(uplink / 10))}${'░'.repeat(10 - Math.floor(uplink / 10))} ${uplink}%`, tx, ty + 16)
  ctx.fillText(`SIG ${sig}%  ::  ONLINE`, tx, ty + 32)
  ctx.fillText(`NL BASE  ::  GLOBAL CLIENTS`, tx, ty + 48)
  ctx.fillText(`ID 0x${hash}  STATUS OK`, tx, ty + 64)

  ctx.textAlign = 'right'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.5)`
  ctx.fillText('CPWD.NL', bx - 12, by + 8)
  ctx.fillText('STATUS: OPEN', bx - 12, by + 22)

  const sideScroll = scrollOffset(t, 5)
  ctx.font = '7px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.38)`
  for (let i = 0; i < 6; i++) {
    const n = Math.floor(hudSeed(Math.floor(sideScroll) + i * 43) * 9999)
    ctx.fillText(`${n}Hz`, bx - 12, by + 40 + i * 11)
  }

  ctx.restore()
}
