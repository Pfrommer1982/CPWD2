import sharp from 'sharp'
import { unlinkSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const width = 1200
const height = 630

const cx = width / 2
const markCy = 230
const mark = 280
const lineW = (4 / 250) * mark
const dotR = (10 / 250) * mark
const glow1 = dotR * 2.2
const glow2 = dotR * 3.4
const half = mark / 2

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="bg-glow" cx="50%" cy="38%" r="45%">
      <stop offset="0%" stop-color="#38965A" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#050807" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#050807"/>
  <rect width="${width}" height="${height}" fill="url(#bg-glow)"/>
  <line x1="${cx - half}" y1="${markCy}" x2="${cx + half}" y2="${markCy}" stroke="#f1f1f1" stroke-width="${lineW}" stroke-linecap="square"/>
  <line x1="${cx}" y1="${markCy - half}" x2="${cx}" y2="${markCy + half}" stroke="#f1f1f1" stroke-width="${lineW}" stroke-linecap="square"/>
  <circle cx="${cx}" cy="${markCy}" r="${glow2}" fill="#38965A" opacity="0.12"/>
  <circle cx="${cx}" cy="${markCy}" r="${glow1}" fill="#38965A" opacity="0.28"/>
  <circle cx="${cx}" cy="${markCy}" r="${dotR}" fill="#38965A"/>
</svg>
`

const basePath = join(root, 'public/og-image-base.jpg')
const outPath = join(root, 'public/og-image.jpg')

await sharp(Buffer.from(svg))
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(basePath)

const overlay = spawnSync('python3', [join(root, 'scripts/overlay-og-text.py'), basePath, outPath], {
  encoding: 'utf8',
})

if (overlay.status !== 0) {
  console.error(overlay.stderr || overlay.stdout)
  process.exit(overlay.status ?? 1)
}

try {
  unlinkSync(basePath)
}
catch {
  // ignore
}

console.log('Wrote public/og-image.jpg (1200x630)')
