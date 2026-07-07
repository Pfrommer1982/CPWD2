import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const width = 1200
const height = 630

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#38965A" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#000000"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <line x1="120" y1="315" x2="1080" y2="315" stroke="#C8C9C9" stroke-width="2" opacity="0.35"/>
  <line x1="600" y1="80" x2="600" y2="550" stroke="#C8C9C9" stroke-width="2" opacity="0.35"/>
  <circle cx="600" cy="315" r="90" fill="#38965A" opacity="0.18"/>
  <circle cx="600" cy="315" r="48" fill="#38965A"/>
  <text x="600" y="430" text-anchor="middle" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" letter-spacing="8">CPWD</text>
  <text x="600" y="490" text-anchor="middle" fill="#C8C9C9" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="2">Webdevelopment uit Nederland</text>
</svg>
`

await sharp(Buffer.from(svg))
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(join(root, 'public/og-image.jpg'))

console.log('Wrote public/og-image.jpg (1200x630)')
