import { COMMS_RGB, COMMS_RGB_LIGHT } from '~/constants/brand'

const SWEEP_ARC = 0.58
const BLIP_PERSIST = 1.1
const MAX_BLIPS = 4

export interface RadarBlip {
  angle: number
  dist: number
  born: number
  ttl: number
  size: number
  lastHit: number
}

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function createInitialRadarBlips(time: number, count = 4): RadarBlip[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: seeded(i + 1) * Math.PI * 2,
    dist: 0.3 + seeded(i + 3) * 0.5,
    born: time,
    ttl: 14 + seeded(i + 5) * 6,
    size: 0.7 + seeded(i + 7) * 0.3,
    lastHit: -999,
  }))
}

export function updateRadarBlips(blips: RadarBlip[], time: number) {
  if (blips.length < MAX_BLIPS && Math.random() < 0.004) {
    const angle = Math.random() * Math.PI * 2
    const tooClose = blips.some((b) => {
      let d = Math.abs(b.angle - angle)
      if (d > Math.PI) d = Math.PI * 2 - d
      return d < 0.5
    })
    if (!tooClose) {
      blips.push({
        angle,
        dist: 0.25 + Math.random() * 0.58,
        born: time,
        ttl: 9 + Math.random() * 5,
        size: 0.65 + Math.random() * 0.4,
        lastHit: -999,
      })
    }
  }

  for (let i = blips.length - 1; i >= 0; i--) {
    if (time - blips[i].born > blips[i].ttl) blips.splice(i, 1)
  }
}

function blipSweepIntensity(blip: RadarBlip, sweep: number, time: number) {
  let diff = blip.angle - sweep
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2

  if (diff <= 0 && diff >= -SWEEP_ARC) {
    blip.lastHit = time
    return 1 - Math.abs(diff) / SWEEP_ARC
  }

  if (blip.lastHit > 0) {
    const since = time - blip.lastHit
    if (since < BLIP_PERSIST) return (1 - since / BLIP_PERSIST) * 0.42
  }

  return 0
}

function drawBlip(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  blip: RadarBlip,
  intensity: number,
  fade: number,
) {
  const alpha = fade * intensity
  if (alpha < 0.02) return

  const core = 2.5 + blip.size * 3.5
  const glowR = core * (intensity > 0.55 ? 5.5 : 3.8)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const glow = ctx.createRadialGradient(bx, by, 0, bx, by, glowR)
  glow.addColorStop(0, `rgba(${COMMS_RGB_LIGHT}, ${alpha * 0.5})`)
  glow.addColorStop(0.4, `rgba(${COMMS_RGB}, ${alpha * 0.15})`)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(bx, by, glowR, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawBlips(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  time: number,
  sweep: number,
  blips: RadarBlip[],
) {
  for (const blip of blips) {
    const age = time - blip.born
    const fade = 1 - age / blip.ttl * 0.85
    const intensity = blipSweepIntensity(blip, sweep, time)
    if (intensity <= 0.02) continue
    const bx = cx + Math.cos(blip.angle) * radius * blip.dist
    const by = cy + Math.sin(blip.angle) * radius * blip.dist
    drawBlip(ctx, bx, by, blip, intensity, fade)
  }
}

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  len: number,
) {
  ctx.beginPath()
  ctx.moveTo(x, y + len)
  ctx.lineTo(x, y)
  ctx.lineTo(x + len, y)
  ctx.moveTo(x + size - len, y)
  ctx.lineTo(x + size, y)
  ctx.lineTo(x + size, y + len)
  ctx.moveTo(x + size, y + size - len)
  ctx.lineTo(x + size, y + size)
  ctx.lineTo(x + size - len, y + size)
  ctx.moveTo(x + len, y + size)
  ctx.lineTo(x, y + size)
  ctx.lineTo(x, y + size - len)
  ctx.stroke()
}

export function drawTacticalRadarHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  blips: RadarBlip[],
  staticFrame = false,
) {
  const cx = w * 0.5
  const cy = h * 0.5
  const radius = Math.min(w, h) * 0.42
  const sweep = staticFrame ? 0.85 : time * 0.48

  ctx.clearRect(0, 0, w, h)
  ctx.save()

  ctx.globalAlpha = 0.06
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.2)`
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = `rgba(${COMMS_RGB}, 0.35)`
  ctx.lineWidth = 1
  for (let i = 1; i <= 4; i++) {
    ctx.globalAlpha = 0.1 + (5 - i) * 0.04
    ctx.beginPath()
    ctx.arc(cx, cy, radius * (i / 4), 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.globalAlpha = 0.1
  ctx.beginPath()
  ctx.moveTo(cx - radius, cy)
  ctx.lineTo(cx + radius, cy)
  ctx.moveTo(cx, cy - radius)
  ctx.lineTo(cx, cy + radius)
  ctx.stroke()

  if (!staticFrame) {
    ctx.globalAlpha = 0.2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, sweep - SWEEP_ARC, sweep)
    ctx.closePath()
    ctx.fillStyle = `rgba(${COMMS_RGB}, 0.16)`
    ctx.fill()
    ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.55)`
    ctx.lineWidth = 1.2
    ctx.stroke()
  }

  drawBlips(ctx, cx, cy, radius, time, sweep, blips)

  ctx.globalAlpha = 0.45
  ctx.strokeStyle = `rgba(${COMMS_RGB_LIGHT}, 0.75)`
  ctx.lineWidth = 1
  const ch = radius * 0.1
  ctx.beginPath()
  ctx.moveTo(cx - ch, cy)
  ctx.lineTo(cx + ch, cy)
  ctx.moveTo(cx, cy - ch)
  ctx.lineTo(cx, cy + ch)
  ctx.stroke()

  const pad = radius * 0.08
  const box = radius * 2 + pad * 2
  const bx = cx - radius - pad
  const by = cy - radius - pad
  ctx.globalAlpha = 0.35
  ctx.strokeStyle = `rgba(${COMMS_RGB}, 0.45)`
  drawCornerBrackets(ctx, bx, by, box, 10)

  ctx.globalAlpha = 0.5
  ctx.font = '8px "Share Tech Mono", monospace'
  ctx.fillStyle = `rgba(${COMMS_RGB_LIGHT}, 0.75)`
  ctx.textAlign = 'center'
  ctx.fillText('RADAR // SCAN', cx, by - 6)

  const contacts = blips.filter(b => b.lastHit > 0 && time - b.lastHit < 3.5).length
  ctx.globalAlpha = 0.42
  ctx.fillStyle = `rgba(${COMMS_RGB}, 0.65)`
  ctx.fillText(contacts > 0 ? `CONTACTS ${contacts}` : 'NO LOCK', cx, by + box + 14)

  ctx.restore()
}
