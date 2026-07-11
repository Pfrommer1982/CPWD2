import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const width = 1200
const height = 630

// Logo mark proportions from CpwdLogo (250px base): full cross, 4px lines, 20px dot
const cx = width / 2
const cy = height / 2
const mark = 320
const lineW = (4 / 250) * mark
const dotR = (10 / 250) * mark
const glow1 = dotR * 2.2
const glow2 = dotR * 3.4
const half = mark / 2

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="bg-glow" cx="50%" cy="46%" r="42%">
      <stop offset="0%" stop-color="#38965A" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#050807" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#050807"/>
  <rect width="${width}" height="${height}" fill="url(#bg-glow)"/>
  <line x1="${cx - half}" y1="${cy}" x2="${cx + half}" y2="${cy}" stroke="#f1f1f1" stroke-width="${lineW}" stroke-linecap="square"/>
  <line x1="${cx}" y1="${cy - half}" x2="${cx}" y2="${cy + half}" stroke="#f1f1f1" stroke-width="${lineW}" stroke-linecap="square"/>
  <circle cx="${cx}" cy="${cy}" r="${glow2}" fill="#38965A" opacity="0.12"/>
  <circle cx="${cx}" cy="${cy}" r="${glow1}" fill="#38965A" opacity="0.28"/>
  <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="#38965A"/>
</svg>
`

await sharp(Buffer.from(svg))
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(join(root, 'public/og-image.jpg'))

console.log('Wrote public/og-image.jpg (1200x630)')
