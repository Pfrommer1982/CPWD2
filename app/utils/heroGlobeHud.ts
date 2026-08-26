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
const HERO_HUD_LOCATION_PULSE_DELAY_MS = 260
const HERO_HUD_LOCATION_PULSE_PERIOD_MS = 580
const HERO_HUD_LOCATION_PULSE_CYCLES = 3
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
  const rowH = 16

  ctx.save()
  ctx.globalAlpha = alpha

  ctx.fillStyle = `rgba(${HUD_BG}, 0.92)`
  ctx.fillRect(rowX, targetY - rowH / 2, rowW, rowH)
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.16)`
  ctx.fillRect(rowX, targetY - rowH / 2, rowW, rowH)
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.86)`
  ctx.lineWidth = 1

  ctx.beginPath()
  ctx.moveTo(rowX, targetY - 2)
  ctx.lineTo(rowX, targetY - rowH / 2)
  ctx.lineTo(rowX + 9, targetY - rowH / 2)
  ctx.moveTo(rowX + rowW - 9, targetY - rowH / 2)
  ctx.lineTo(rowX + rowW, targetY - rowH / 2)
  ctx.lineTo(rowX + rowW, targetY - 1)
  ctx.moveTo(rowX + rowW, targetY + 1)
  ctx.lineTo(rowX + rowW, targetY + rowH / 2)
  ctx.lineTo(rowX + rowW - 9, targetY + rowH / 2)
  ctx.moveTo(rowX + 9, targetY + rowH / 2)
  ctx.lineTo(rowX, targetY + rowH / 2)
  ctx.lineTo(rowX, targetY + 1)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = '700 8.5px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.96)`
  ctx.fillText(fitHudText(ctx, `MATCH/${record.ip}`, rowW - 12), rowX + 6, targetY + 3)
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
  ctx.fillStyle = `rgba(${HUD_BG}, 0.96)`
  ctx.fillRect(bx + 4, by + 4, bw - 8, 24)
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.42)`
  ctx.beginPath()
  ctx.moveTo(bx + 4, by + 28)
  ctx.lineTo(bx + bw - 4, by + 28)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = '700 9.5px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.95)`
  ctx.fillText(fitHudText(ctx, label, bw * 0.58), bx + 10, by + 19)
  ctx.textAlign = 'right'
  ctx.font = '600 7.5px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.9)`
  ctx.fillText(fitHudText(ctx, detail, bw * 0.36), bx + bw - 10, by + 19)
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
  const panelW = bw * 0.92
  const panelH = 65
  const panelX = bx + (bw - panelW) / 2
  const panelY = by + bh * 0.5 - panelH / 2

  ctx.save()
  ctx.fillStyle = `rgba(${HUD_BG}, 0.97)`
  ctx.fillRect(panelX, panelY, panelW, panelH)
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.055)`
  ctx.fillRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2)
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.72)`
  drawCornerBrackets(ctx, panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, 10)

  ctx.textAlign = 'center'
  ctx.font = '700 14px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.98)`
  ctx.fillText(fitHudText(ctx, record.labels.accessCheck, panelW - 22), panelX + panelW / 2, panelY + 23)
  ctx.font = '600 9.5px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.94)`
  ctx.fillText(fitHudText(ctx, record.labels.accessStatus, panelW - 22), panelX + panelW / 2, panelY + 41)

  const segments = 14
  const active = Math.max(1, Math.ceil(progress * segments))
  const gap = 2
  const segmentW = (panelW - 24 - gap * (segments - 1)) / segments
  for (let i = 0; i < segments; i++) {
    ctx.fillStyle = i < active
      ? `rgba(${COMMS_RGB_LIGHT}, ${0.34 + (i / segments) * 0.5})`
      : `rgba(${COMMS_RGB}, 0.12)`
    ctx.fillRect(panelX + 12 + i * (segmentW + gap), panelY + 53, segmentW, 4)
  }
  ctx.restore()
}

function drawRecordDetailLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxWidth: number,
  label: string,
  value: string,
  scale: number,
) {
  const gap = 7 * scale

  ctx.textAlign = 'left'
  ctx.font = `700 ${9 * scale}px "Courier New", monospace`
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.98)`
  const fittedLabel = fitHudText(ctx, label, maxWidth * 0.34)
  ctx.fillText(fittedLabel, x, y)

  const labelW = ctx.measureText(fittedLabel).width
  const valueX = x + labelW + gap
  const valueW = Math.max(18, maxWidth - labelW - gap)
  ctx.font = `600 ${10 * scale}px "Courier New", monospace`
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.96)`
  ctx.fillText(fitHudText(ctx, value, valueW), valueX, y)
}

function drawPulsingLocationLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxWidth: number,
  label: string,
  value: string,
  scale: number,
  pulseStrength: number | null,
) {
  if (pulseStrength === null) {
    drawRecordDetailLine(ctx, x, y, maxWidth, label, value, scale)
    return
  }

  const pulse = Math.min(1, Math.max(0, pulseStrength))
  const inheritedAlpha = ctx.globalAlpha
  const highlightY = y - 12 * scale
  const highlightH = 16 * scale

  ctx.save()
  ctx.globalAlpha = inheritedAlpha
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.035 + pulse * 0.14})`
  ctx.fillRect(x - 4 * scale, highlightY, maxWidth + 8 * scale, highlightH)
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.12 + pulse * 0.46})`
  ctx.fillRect(x - 4 * scale, highlightY, 2 * scale, highlightH)

  ctx.globalAlpha = inheritedAlpha * (0.46 + pulse * 0.38)
  drawRecordDetailLine(ctx, x, y, maxWidth, label, value, scale)

  ctx.globalAlpha = inheritedAlpha * pulse * 0.22
  ctx.textAlign = 'left'
  ctx.font = `700 ${9 * scale}px "Courier New", monospace`
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 1)`
  const fittedLabel = fitHudText(ctx, label, maxWidth * 0.34)
  ctx.fillText(fittedLabel, x, y)

  const labelW = ctx.measureText(fittedLabel).width
  const valueX = x + labelW + 7 * scale
  const valueW = Math.max(18, maxWidth - labelW - 7 * scale)
  ctx.font = `700 ${10 * scale}px "Courier New", monospace`
  ctx.fillText(fitHudText(ctx, value, valueW), valueX, y)
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
  locationPulse: number | null,
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
  const open = easeOutCubic(openProgress)
  const detailCount = 2 + (hasProvider ? 1 : 0) + (hasMaskedNetwork ? 1 : 0)
  const idealCalloutH = 103 + (detailCount - 1) * 18
  const scale = Math.min(1, Math.max(0.72, (bh - 10) / idealCalloutH))
  const calloutH = idealCalloutH * scale
  const finalW = bw * 0.9
  const finalX = bx + (bw - finalW) / 2
  const calloutX = rowX + (finalX - rowX) * open
  const calloutW = rowW + (finalW - rowW) * open
  const preferredY = targetY - calloutH * 0.52
  const calloutY = Math.max(by + 5, Math.min(preferredY, by + bh - calloutH - 5))
  const copyX = calloutX + 12 * scale
  const copyW = calloutW - 24 * scale
  const textAlpha = easeOutCubic(Math.max(0, (openProgress - 0.25) / 0.75))
  const visibleH = 12 + (calloutH - 12) * open
  const calloutCenterY = calloutY + calloutH / 2
  const clipCenterY = targetY + (calloutCenterY - targetY) * open
  const clipY = clipCenterY - visibleH / 2

  ctx.save()
  ctx.fillStyle = `rgba(${HUD_BG}, ${0.7 * open})`
  ctx.fillRect(bx + 3, by + 29, bw - 6, bh - 32)

  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.36 * open})`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(rowX + rowW, targetY)
  ctx.lineTo(calloutX + calloutW, targetY)
  ctx.stroke()

  ctx.beginPath()
  ctx.rect(calloutX - 2, clipY, calloutW + 4, visibleH)
  ctx.clip()

  ctx.fillStyle = `rgba(${HUD_BG}, 0.985)`
  ctx.fillRect(calloutX, calloutY, calloutW, calloutH)
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.075)`
  ctx.fillRect(calloutX, calloutY, calloutW, calloutH)
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.44 + open * 0.3})`
  drawCornerBrackets(
    ctx,
    calloutX + calloutW / 2,
    calloutY + calloutH / 2,
    calloutW,
    calloutH,
    10 * scale,
  )

  ctx.globalAlpha = textAlpha

  ctx.textAlign = 'left'
  ctx.font = `700 ${10.5 * scale}px "Courier New", monospace`
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.94)`
  ctx.fillText(fitHudText(ctx, record.labels.matched, copyW), copyX, calloutY + 19 * scale)

  if (activeSignals.length) {
    const badge = activeSignals.join('/')
    ctx.font = `700 ${8.5 * scale}px "Courier New", monospace`
    const badgeW = ctx.measureText(badge).width + 10 * scale
    const badgeH = 15 * scale
    const badgeX = calloutX + calloutW - badgeW - 9 * scale
    const badgeY = calloutY + 7 * scale
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.2)`
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH)
    ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.7)`
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH)
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.96)`
    ctx.fillText(badge, badgeX + 5 * scale, badgeY + 11 * scale)
  }

  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.28)`
  ctx.beginPath()
  ctx.moveTo(copyX, calloutY + 28 * scale)
  ctx.lineTo(calloutX + calloutW - 12 * scale, calloutY + 28 * scale)
  ctx.stroke()

  let detailY = calloutY + 46 * scale
  const detailGap = 18 * scale

  drawRecordDetailLine(ctx, copyX, detailY, copyW, record.labels.ip, record.ip, scale)
  detailY += detailGap
  drawPulsingLocationLine(
    ctx,
    copyX,
    detailY,
    copyW,
    record.labels.location,
    record.location,
    scale,
    locationPulse,
  )
  detailY += detailGap

  if (record.provider) {
    drawRecordDetailLine(ctx, copyX, detailY, copyW, record.labels.provider, record.provider, scale)
    detailY += detailGap
  }

  if (hasMaskedNetwork) {
    const exitLabel = record.vpn ? record.labels.vpnExit : activeSignals.join('/')
    const service = record.networkService && record.networkService !== record.provider
      ? ` · ${record.networkService}`
      : ''
    drawRecordDetailLine(
      ctx,
      copyX,
      detailY,
      copyW,
      exitLabel,
      `${record.labels.masked}${service}`,
      scale,
    )
    detailY += detailGap
  }

  if (grantedProgress > 0.001) {
    const granted = easeOutCubic(grantedProgress)
    const stampY = detailY + 2 * scale
    const stampH = 37 * scale
    ctx.globalAlpha = granted * textAlpha
    ctx.fillStyle = `rgba(${HUD_BG}, 0.92)`
    ctx.fillRect(copyX, stampY, copyW, stampH)
    ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.78)`
    ctx.strokeRect(copyX, stampY, copyW, stampH)
    ctx.textAlign = 'center'
    ctx.font = `700 ${14 * scale}px "Courier New", monospace`
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 1)`
    ctx.fillText(fitHudText(ctx, record.labels.granted, copyW - 12 * scale), calloutX + calloutW / 2, stampY + 17 * scale)
    ctx.font = `700 ${8.5 * scale}px "Courier New", monospace`
    ctx.fillStyle = `rgba(${COMMS_RGB}, 0.96)`
    ctx.fillText(fitHudText(ctx, record.labels.welcome, copyW - 12 * scale), calloutX + calloutW / 2, stampY + 30 * scale)
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

interface MobileHudLayout {
  x: number
  y: number
  w: number
  h: number
  compact: boolean
}

function mobileHudLayout(w: number, h: number): MobileHudLayout {
  const compact = h < 720
  const margin = w < 390 ? 18 : 20
  const panelH = compact ? 118 : h < 900 ? 150 : 158

  return {
    x: margin,
    y: compact ? 74 : 76,
    w: w - margin * 2,
    h: panelH,
    compact,
  }
}

function drawMobilePanelFrame(
  ctx: CanvasRenderingContext2D,
  layout: MobileHudLayout,
  t: number,
) {
  const { x, y, w, h } = layout

  ctx.fillStyle = `rgba(${HUD_BG}, 0.992)`
  ctx.fillRect(x, y, w, h)

  const wash = ctx.createLinearGradient(x, y, x + w, y + h)
  wash.addColorStop(0, `rgba(${COMMS_RGB_LIGHT}, 0.07)`)
  wash.addColorStop(0.48, `rgba(${COMMS_RGB}, 0.018)`)
  wash.addColorStop(1, `rgba(${HUD_BG}, 0.08)`)
  ctx.fillStyle = wash
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)

  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.62)`
  ctx.lineWidth = 1
  drawCornerBrackets(ctx, x + w / 2, y + h / 2, w, h, layout.compact ? 10 : 13)

  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.12)`
  for (let i = 0; i < 3; i++) {
    const seed = Math.floor(t * 8) * 17 + i * 47
    const rowW = 28 + hudSeed(seed) * Math.min(86, w * 0.28)
    const rowX = x + 10 + hudSeed(seed + 3) * Math.max(1, w - rowW - 20)
    const rowY = y + 14 + hudSeed(seed + 8) * Math.max(1, h - 28)
    ctx.fillRect(rowX, rowY, rowW, 1)
  }
}

function drawMobileProgress(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  progress: number,
) {
  const segments = 12
  const gap = 3
  const segmentW = (w - gap * (segments - 1)) / segments
  const active = Math.max(1, Math.ceil(Math.min(1, Math.max(0, progress)) * segments))

  for (let i = 0; i < segments; i++) {
    ctx.fillStyle = i < active
      ? `rgba(${COMMS_RGB_LIGHT}, ${0.46 + i / segments * 0.42})`
      : `rgba(${COMMS_RGB}, 0.13)`
    ctx.fillRect(x + i * (segmentW + gap), y, segmentW, 4)
  }
}

function drawMobileStateHeader(
  ctx: CanvasRenderingContext2D,
  layout: MobileHudLayout,
  label: string,
  detail: string,
) {
  const { x, y, w } = layout
  const inset = 12

  ctx.textAlign = 'left'
  ctx.font = '700 12px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.98)`
  ctx.fillText(fitHudText(ctx, label, w * 0.61), x + inset, y + 20)

  ctx.textAlign = 'right'
  ctx.font = '600 8px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.88)`
  ctx.fillText(fitHudText(ctx, detail, w * 0.33), x + w - inset, y + 20)

  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.28)`
  ctx.beginPath()
  ctx.moveTo(x + inset, y + 28)
  ctx.lineTo(x + w - inset, y + 28)
  ctx.stroke()
}

function drawMobileAuthorization(
  ctx: CanvasRenderingContext2D,
  layout: MobileHudLayout,
  progress: number,
  record: HeroHudVisitorRecord,
) {
  const { x, y, w, h } = layout
  const copyW = w - 28

  ctx.textAlign = 'center'
  ctx.font = `700 ${layout.compact ? 11 : 13}px "Courier New", monospace`
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 1)`
  ctx.fillText(fitHudText(ctx, record.labels.accessCheck, copyW), x + w / 2, y + (layout.compact ? 37 : 46))

  ctx.font = `600 ${layout.compact ? 8.5 : 9.5}px "Courier New", monospace`
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.96)`
  ctx.fillText(fitHudText(ctx, record.labels.accessStatus, copyW), x + w / 2, y + (layout.compact ? 57 : 70))

  drawMobileProgress(
    ctx,
    x + 16,
    y + h - (layout.compact ? 26 : 34),
    w - 32,
    progress,
  )

  ctx.textAlign = 'right'
  ctx.font = '8px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.48)`
  ctx.fillText(`${Math.round(progress * 100).toString().padStart(2, '0')}% // AUTH`, x + w - 16, y + h - 10)
}

function drawMobileSearchRows(
  ctx: CanvasRenderingContext2D,
  layout: MobileHudLayout,
  t: number,
  scanProgress: number,
  selectedAlpha: number,
  record: HeroHudVisitorRecord,
) {
  const { x, y, w, h } = layout
  const inset = 13
  const rowsTop = y + 43
  const rowGap = layout.compact ? 21 : 26
  const rowH = layout.compact ? 15 : 18
  const selectedRow = 1

  ctx.save()
  ctx.beginPath()
  ctx.rect(x + 4, y + 30, w - 8, h - 35)
  ctx.clip()

  for (let i = 0; i < 3; i++) {
    const rowY = rowsTop + i * rowGap
    const rowSeed = Math.floor(t * 7) + i * 71
    const code = i === selectedRow && selectedAlpha > 0.001
      ? `MATCH/${record.ip}`
      : formatDataLine(rowSeed, i % 2)

    if (i === selectedRow && selectedAlpha > 0.001) {
      ctx.globalAlpha = selectedAlpha
      ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.15)`
      ctx.fillRect(x + inset - 3, rowY - 11, w - inset * 2 + 6, rowH)
      ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.86)`
      ctx.strokeRect(x + inset - 3, rowY - 11, w - inset * 2 + 6, rowH)
    }

    ctx.globalAlpha = i === selectedRow && selectedAlpha > 0.001 ? selectedAlpha : 0.42
    ctx.textAlign = 'left'
    ctx.font = `${i === selectedRow && selectedAlpha > 0.001 ? 700 : 500} ${layout.compact ? 8 : 8.5}px "Courier New", monospace`
    ctx.fillStyle = i === selectedRow && selectedAlpha > 0.001
      ? `rgba(${COMMS_RGB_LIGHT}, 1)`
      : `rgba(${COMMS_RGB}, 0.92)`
    ctx.fillText(fitHudText(ctx, code, w - inset * 2), x + inset, rowY)
  }

  ctx.globalAlpha = 1
  const travel = Math.min(1, Math.max(0, scanProgress))
  const scanY = rowsTop - 13 + travel * (rowGap * 2 + rowH + 8)
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.12)`
  ctx.fillRect(x + 5, scanY - 4, w - 10, 8)
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.66)`
  ctx.beginPath()
  ctx.moveTo(x + 5, scanY)
  ctx.lineTo(x + w - 5, scanY)
  ctx.stroke()
  ctx.restore()
}

function drawMobileDetailLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  valueWeight = 600,
) {
  ctx.textAlign = 'left'
  ctx.font = '700 9px "Courier New", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.98)`
  const fittedLabel = fitHudText(ctx, label, w * 0.27)
  ctx.fillText(fittedLabel, x, y)

  const labelW = ctx.measureText(fittedLabel).width
  const valueX = x + labelW + 8
  ctx.font = `${valueWeight} 10px "Courier New", monospace`
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.98)`
  ctx.fillText(fitHudText(ctx, value, w - labelW - 8), valueX, y)
}

function drawMobileLocationLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  pulseStrength: number | null,
) {
  if (pulseStrength === null) {
    drawMobileDetailLine(ctx, x, y, w, label, value, 700)
    return
  }

  const pulse = Math.min(1, Math.max(0, pulseStrength))
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.045 + pulse * 0.15})`
  ctx.fillRect(x - 4, y - 12, w + 8, 16)
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.18 + pulse * 0.44})`
  ctx.fillRect(x - 4, y - 12, 2, 16)
  ctx.globalAlpha *= 0.58 + pulse * 0.42
  drawMobileDetailLine(ctx, x, y, w, label, value, 700)
}

function drawMobileVisitorRecord(
  ctx: CanvasRenderingContext2D,
  layout: MobileHudLayout,
  openProgress: number,
  grantedProgress: number,
  locationPulse: number | null,
  record: HeroHudVisitorRecord,
) {
  const { x, y, w, h } = layout
  const open = easeOutCubic(openProgress)
  const inset = 14
  const copyW = w - inset * 2
  const activeSignals = [
    record.vpn ? record.labels.vpn : '',
    record.proxy ? record.labels.proxy : '',
    record.tor ? record.labels.tor : '',
  ].filter(Boolean)
  const hasMaskedNetwork = activeSignals.length > 0
  const clipH = Math.max(1, (h - 32) * open)
  const clipY = y + 30 + ((h - 32) - clipH) / 2

  ctx.save()
  ctx.beginPath()
  ctx.rect(x + 4, clipY, w - 8, clipH)
  ctx.clip()
  ctx.globalAlpha = easeOutCubic(Math.max(0, (openProgress - 0.12) / 0.88))

  if (activeSignals.length) {
    const badge = activeSignals.join('/')
    ctx.font = '700 8px "Courier New", monospace'
    const badgeW = ctx.measureText(badge).width + 10
    const badgeX = x + w - inset - badgeW
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.2)`
    ctx.fillRect(badgeX, y + 35, badgeW, 15)
    ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.72)`
    ctx.strokeRect(badgeX, y + 35, badgeW, 15)
    ctx.textAlign = 'center'
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 1)`
    ctx.fillText(badge, badgeX + badgeW / 2, y + 46)
  }

  const firstLineY = y + (layout.compact ? 48 : 52)
  const lineGap = layout.compact ? 16 : 18
  let detailY = firstLineY
  drawMobileDetailLine(ctx, x + inset, detailY, copyW, record.labels.ip, record.ip, 700)
  detailY += lineGap

  ctx.save()
  drawMobileLocationLine(
    ctx,
    x + inset,
    detailY,
    copyW,
    record.labels.location,
    record.location,
    locationPulse,
  )
  ctx.restore()
  detailY += lineGap

  if (record.provider) {
    drawMobileDetailLine(ctx, x + inset, detailY, copyW, record.labels.provider, record.provider)
    detailY += lineGap
  }

  if (hasMaskedNetwork && !layout.compact) {
    const exitLabel = record.vpn ? record.labels.vpnExit : activeSignals.join('/')
    const service = record.networkService && record.networkService !== record.provider
      ? ` · ${record.networkService}`
      : ''
    drawMobileDetailLine(
      ctx,
      x + inset,
      detailY,
      copyW,
      exitLabel,
      `${record.labels.masked}${service}`,
    )
  }

  if (grantedProgress > 0.001) {
    const granted = easeOutCubic(grantedProgress)
    const stampH = layout.compact ? 25 : 31
    const stampY = y + h - stampH - 7
    ctx.globalAlpha = granted
    ctx.fillStyle = `rgba(${HUD_BG}, 0.96)`
    ctx.fillRect(x + 8, stampY, w - 16, stampH)
    ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.82)`
    ctx.strokeRect(x + 8, stampY, w - 16, stampH)
    ctx.textAlign = 'center'
    ctx.font = `700 ${layout.compact ? 13 : 15}px "Courier New", monospace`
    ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 1)`
    ctx.fillText(fitHudText(ctx, record.labels.granted, w - 30), x + w / 2, stampY + (layout.compact ? 17 : 18))

    if (!layout.compact) {
      ctx.font = '700 8px "Courier New", monospace'
      ctx.fillStyle = `rgba(${COMMS_RGB}, 0.96)`
      ctx.fillText(fitHudText(ctx, record.labels.welcome, w - 30), x + w / 2, stampY + 27)
    }
  }

  ctx.restore()
}

function drawMobileVisitorHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeMs: number,
  visitorHit: HeroHudVisitorHit | null,
) {
  if (!visitorHit) return

  const elapsed = timeMs - visitorHit.startTimeMs
  if (!visitorHit.static && (elapsed < 0 || elapsed >= HERO_HUD_HIT_TOTAL_MS)) return

  const searchAt = HERO_HUD_ACCESS_CHECK_MS
  const settleAt = searchAt + HERO_HUD_SEARCH_MS
  const blinkAt = settleAt + HERO_HUD_HIT_SETTLE_MS
  const expandAt = blinkAt + HERO_HUD_HIT_BLINK_MS
  const holdAt = expandAt + HERO_HUD_HIT_EXPAND_MS
  const releaseAt = holdAt + HERO_HUD_HIT_HOLD_MS
  const layout = mobileHudLayout(w, h)
  const renderTimeMs = visitorHit.static ? visitorHit.startTimeMs : timeMs
  const t = renderTimeMs * 0.001
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

  let panelAlpha = 1
  let panelScaleY = 1
  if (!visitorHit.static && elapsed >= releaseAt) {
    const release = easeInOutCubic((elapsed - releaseAt) / HERO_HUD_HIT_RELEASE_MS)
    panelAlpha = 1 - release
    panelScaleY = 1 - release * 0.78
  }

  ctx.save()
  ctx.globalAlpha = panelAlpha
  if (panelScaleY < 1) {
    const centerY = layout.y + layout.h / 2
    ctx.translate(0, centerY)
    ctx.scale(1, panelScaleY)
    ctx.translate(0, -centerY)
  }
  drawMobilePanelFrame(ctx, layout, t)

  if (visitorHit.static) {
    drawMobileStateHeader(ctx, layout, visitorHit.record.labels.granted, `AUTH/0x${matchHash}`)
    drawMobileVisitorRecord(ctx, layout, 1, 1, null, visitorHit.record)
    ctx.restore()
    return
  }

  if (elapsed < searchAt) {
    drawMobileAuthorization(ctx, layout, elapsed / HERO_HUD_ACCESS_CHECK_MS, visitorHit.record)
  } else if (elapsed < settleAt) {
    const search = (elapsed - searchAt) / HERO_HUD_SEARCH_MS
    drawMobileStateHeader(
      ctx,
      layout,
      visitorHit.record.labels.searching,
      `${recordCount.toString().padStart(4, '0')} // #${searchHash}`,
    )
    drawMobileSearchRows(ctx, layout, t, (search * 2.35) % 1, 0, visitorHit.record)
  } else if (elapsed < blinkAt) {
    const settle = easeInOutCubic((elapsed - settleAt) / HERO_HUD_HIT_SETTLE_MS)
    drawMobileStateHeader(
      ctx,
      layout,
      visitorHit.record.labels.searching,
      `${recordCount.toString().padStart(4, '0')} // #${searchHash}`,
    )
    drawMobileSearchRows(
      ctx,
      layout,
      t,
      0.2 + settle * 0.38,
      easeOutCubic(Math.max(0, (settle - 0.72) / 0.28)),
      visitorHit.record,
    )
  } else if (elapsed < expandAt) {
    const blink = (elapsed - blinkAt) / HERO_HUD_HIT_BLINK_MS
    const selectionAlpha = Math.floor(blink * 6) % 2 === 0 ? 1 : 0.18
    drawMobileStateHeader(ctx, layout, visitorHit.record.labels.matched, `LOCK // #${matchHash}`)
    drawMobileSearchRows(ctx, layout, t, 0.58, selectionAlpha, visitorHit.record)
  } else {
    const recordOpen = elapsed < holdAt
      ? (elapsed - expandAt) / HERO_HUD_HIT_EXPAND_MS
      : elapsed < releaseAt
        ? 1
        : 1 - easeInOutCubic((elapsed - releaseAt) / HERO_HUD_HIT_RELEASE_MS)
    const grantedProgress = elapsed < holdAt
      ? 0
      : elapsed < releaseAt
        ? Math.min(1, (elapsed - holdAt) / 260)
        : 1 - easeInOutCubic((elapsed - releaseAt) / HERO_HUD_HIT_RELEASE_MS)
    const pulseElapsed = elapsed - expandAt - HERO_HUD_LOCATION_PULSE_DELAY_MS
    const pulseDuration = HERO_HUD_LOCATION_PULSE_PERIOD_MS * HERO_HUD_LOCATION_PULSE_CYCLES
    const locationPulse = pulseElapsed >= 0 && pulseElapsed <= pulseDuration
      ? 0.5 + 0.5 * Math.cos((pulseElapsed / HERO_HUD_LOCATION_PULSE_PERIOD_MS) * Math.PI * 2)
      : null
    const stateLabel = grantedProgress > 0.001
      ? visitorHit.record.labels.granted
      : visitorHit.record.labels.matched
    const stateDetail = grantedProgress > 0.001
      ? `AUTH // #${matchHash}`
      : `LOCK // #${matchHash}`

    drawMobileStateHeader(ctx, layout, stateLabel, stateDetail)
    drawMobileVisitorRecord(
      ctx,
      layout,
      recordOpen,
      grantedProgress,
      locationPulse,
      visitorHit.record,
    )
  }

  ctx.restore()
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
  if (w < 520) {
    drawMobileVisitorHud(ctx, w, h, timeMs, visitorHit)
    return
  }

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
  let locationPulse: number | null = null
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

    if (!visitorHit.static && recordOpen > 0.001) {
      const pulseElapsed = elapsed - expandAt - HERO_HUD_LOCATION_PULSE_DELAY_MS
      const pulseDuration = HERO_HUD_LOCATION_PULSE_PERIOD_MS * HERO_HUD_LOCATION_PULSE_CYCLES
      if (pulseElapsed >= 0 && pulseElapsed <= pulseDuration) {
        locationPulse = 0.5 + 0.5 * Math.cos(
          (pulseElapsed / HERO_HUD_LOCATION_PULSE_PERIOD_MS) * Math.PI * 2,
        )
      }
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
        locationPulse,
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
