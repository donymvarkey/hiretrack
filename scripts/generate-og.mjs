import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'og-image.png')

const W = 1200
const H = 630

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="${W - 80}" cy="80" r="220" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="60" cy="${H - 40}" r="200" fill="#000000" fill-opacity="0.06"/>

  <!-- Logo tile -->
  <rect x="100" y="200" width="120" height="120" rx="28" fill="#ffffff" fill-opacity="0.16"/>
  <g transform="translate(100, 200) scale(${120 / 512})">
    <g fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round">
      <rect x="128" y="190" width="256" height="170" rx="28"/>
      <path d="M206 190v-26a26 26 0 0 1 26-26h48a26 26 0 0 1 26 26v26"/>
      <path d="M128 250h256"/>
    </g>
    <circle cx="256" cy="250" r="16" fill="#ffffff"/>
  </g>

  <text x="250" y="290" font-family="Helvetica, Arial, sans-serif" font-size="76" font-weight="700" fill="#ffffff">HireTrack</text>

  <text x="100" y="420" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="600" fill="#ffffff" fill-opacity="0.95">Track every job application, interview &amp; follow-up</text>
  <text x="100" y="478" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="400" fill="#ffffff" fill-opacity="0.8">Your personal job search command center.</text>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(out)
console.log('generated public/og-image.png (1200x630)')
