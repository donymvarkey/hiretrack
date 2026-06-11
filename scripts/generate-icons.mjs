import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = join(root, 'public', 'icons')
mkdirSync(iconsDir, { recursive: true })

const svg = readFileSync(join(iconsDir, 'icon.svg'))

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'maskable-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const { file, size } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, file))
  console.log(`generated icons/${file} (${size}x${size})`)
}
