import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public/favicon.svg'))

const outputs = [
  { size: 16, file: 'favicon-16.png' },
  { size: 32, file: 'favicon-32.png' },
  { size: 48, file: 'favicon-48.png' },
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 192, file: 'favicon-192.png' },
  { size: 512, file: 'favicon-512.png' },
  { size: 32, file: 'favicon.ico' },
]

for (const { size, file } of outputs) {
  await sharp(svg).resize(size, size).png().toFile(join(root, 'public', file))
  console.log(`Wrote public/${file} (${size}x${size})`)
}
