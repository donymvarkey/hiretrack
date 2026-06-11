import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const splashDir = join(root, 'public', 'splash')
mkdirSync(splashDir, { recursive: true })

// Apple device profiles: [cssWidth, cssHeight, devicePixelRatio]
// Covers modern iPhones and iPads (portrait orientation values).
const devices = [
  [320, 568, 2], // iPhone SE (1st), 5/5s
  [375, 667, 2], // iPhone SE (2/3), 8, 7, 6s
  [414, 736, 3], // iPhone 8 Plus, 7 Plus
  [375, 812, 3], // iPhone X, XS, 11 Pro, 12/13 mini
  [414, 896, 2], // iPhone XR, 11
  [414, 896, 3], // iPhone XS Max, 11 Pro Max
  [390, 844, 3], // iPhone 12, 12 Pro, 13, 13 Pro, 14
  [428, 926, 3], // iPhone 12/13 Pro Max, 14 Plus
  [393, 852, 3], // iPhone 14 Pro, 15, 15 Pro, 16
  [430, 932, 3], // iPhone 14 Pro Max, 15 Plus/Pro Max, 16 Plus
  [402, 874, 3], // iPhone 16 Pro
  [440, 956, 3], // iPhone 16 Pro Max
  [744, 1133, 2], // iPad mini 6
  [768, 1024, 2], // iPad mini/Air/9.7"
  [810, 1080, 2], // iPad 10.2"
  [820, 1180, 2], // iPad Air 10.9"
  [834, 1112, 2], // iPad Pro 10.5"
  [834, 1194, 2], // iPad Pro 11"
  [1024, 1366, 2], // iPad Pro 12.9"
]

const FROM = '#4f46e5'
const TO = '#8b5cf6'

/** Build a full-bleed splash SVG at exact pixel dimensions. */
function buildSvg(pxW, pxH) {
  const min = Math.min(pxW, pxH)
  const tile = Math.round(min * 0.2)
  const tileX = Math.round((pxW - tile) / 2)
  const tileY = Math.round((pxH - tile) / 2 - tile * 0.42)
  const tileR = Math.round(tile * 0.24)
  const scale = tile / 512
  const fontSize = Math.round(tile * 0.3)
  const textY = tileY + tile + Math.round(tile * 0.62)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 ${pxW} ${pxH}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${FROM}"/>
      <stop offset="100%" stop-color="${TO}"/>
    </linearGradient>
  </defs>
  <rect width="${pxW}" height="${pxH}" fill="url(#bg)"/>
  <rect x="${tileX}" y="${tileY}" width="${tile}" height="${tile}" rx="${tileR}" fill="#ffffff" fill-opacity="0.16"/>
  <g transform="translate(${tileX}, ${tileY}) scale(${scale})">
    <g fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round">
      <rect x="128" y="190" width="256" height="170" rx="28"/>
      <path d="M206 190v-26a26 26 0 0 1 26-26h48a26 26 0 0 1 26 26v26"/>
      <path d="M128 250h256"/>
    </g>
    <circle cx="256" cy="250" r="16" fill="#ffffff"/>
  </g>
  <text x="${pxW / 2}" y="${textY}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" letter-spacing="0.5">HireTrack</text>
</svg>`
}

const links = []

for (const [w, h, dpr] of devices) {
  const orientations = [
    { name: 'portrait', pxW: w * dpr, pxH: h * dpr },
    { name: 'landscape', pxW: h * dpr, pxH: w * dpr },
  ]
  for (const o of orientations) {
    const file = `apple-splash-${o.pxW}x${o.pxH}.png`
    const svg = buildSvg(o.pxW, o.pxH)
    await sharp(Buffer.from(svg)).png().toFile(join(splashDir, file))
    const media = `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: ${o.name})`
    links.push(`    <link rel="apple-touch-startup-image" media="${media}" href="/splash/${file}" />`)
    console.log(`generated splash/${file} (${o.pxW}x${o.pxH})`)
  }
}

// Write the link tags to a partial (outside public/) so they can be pasted into index.html
writeFileSync(join(root, 'scripts', 'splash-links.html'), links.join('\n') + '\n')
console.log(`\nWrote ${links.length} link tags to scripts/splash-links.html`)
