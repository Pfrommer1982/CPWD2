import { COMMS_RGB, COMMS_RGB_LIGHT } from '~/constants/brand'

const DATA_PREFIXES = ['PKT', 'VEC', 'ALT', 'SIG', 'BUF', 'TRK', 'RNG', 'HZ', 'LAT', 'LON']
const DATA_SUFFIXES = ['OK', 'RX', 'TX', 'SYNC', 'LOCK', 'ARM', 'GO', 'HOLD']
const HUD_BG = '5, 8, 7'

function hudSeed(n: number) {
  const x = Math.sin(n * 43758.5453) * 10000
  return x - Math.floor(x)
}

/** Irregular scroll speed — slow drift with occasional brief bursts. */
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
) {
  if (w < 520) return

  const t = timeMs * 0.001
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
  const scanY = by + ((t * scanRate + scrollProgress * 0.12) % 1) * bh
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, ${0.22 * contentAlpha})`
  ctx.beginPath()
  ctx.moveTo(bx, scanY)
  ctx.lineTo(bx + bw, scanY)
  ctx.stroke()

  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, ${(0.06 + Math.sin(t * 18) * 0.03) * contentAlpha})`
  ctx.fillRect(bx, scanY - 6, bw, 12)

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
