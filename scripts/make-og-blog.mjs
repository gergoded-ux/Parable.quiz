// scripts/make-og-blog.mjs
// Generates public/og-blog.png (1200x630): the default social-share image for
// blog articles. Cream brand gradient + logo + wordmark.
// Usage: node scripts/make-og-blog.mjs
import sharp from 'sharp';

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf5ee"/>
      <stop offset="100%" stop-color="#f0dcc4"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#d4a574" stroke-width="3" rx="28"/>
  <text x="${W / 2}" y="400" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="96" font-weight="bold" fill="#4a2f15">Eikonia</text>
  <text x="${W / 2}" y="470" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#6b4423">Honest, hopeful reads on faith and life</text>
  <text x="${W / 2}" y="560" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#735630">eikonia.art</text>
</svg>`;

const logo = await sharp('public/logo.webp').resize(180, 180).png().toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: Math.round(W / 2 - 90), top: 90 }])
  .png()
  .toFile('public/og-blog.png');

console.log('wrote public/og-blog.png');
