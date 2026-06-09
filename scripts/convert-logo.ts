// scripts/convert-logo.ts
// One-off: turn the generated circular logo PNG into transparent-corner WebPs for
// the favicon and the header wordmark. The source is a circular badge on a solid
// black square, so we (1) trim the black frame to the badge's bounding box,
// (2) square it, (3) knock out everything outside the circle so the corners are
// transparent on the cream UI, then (4) export sized, compressed WebP.
//
// Run: pnpm exec tsx scripts/convert-logo.ts ["C:\path\to\source.png"]
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Assemble a multi-size .ico from PNG-encoded entries (all modern browsers read
// PNG-in-ICO). sharp can't write .ico, so we build the container by hand.
function buildIco(images: Array<{ size: number; data: Buffer }>): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const entries = Buffer.alloc(16 * images.length);
  let offset = 6 + 16 * images.length;
  images.forEach((img, i) => {
    const e = entries.subarray(i * 16, i * 16 + 16);
    e.writeUInt8(img.size >= 256 ? 0 : img.size, 0); // width (0 = 256)
    e.writeUInt8(img.size >= 256 ? 0 : img.size, 1); // height
    e.writeUInt16LE(1, 4);  // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(img.data.length, 8); // size of image data
    e.writeUInt32LE(offset, 12);         // offset to image data
    offset += img.data.length;
  });
  return Buffer.concat([header, entries, ...images.map((i) => i.data)]);
}

const SRC = process.argv[2] ?? 'C:\\Users\\starl\\Downloads\\Generated_Image_June_09__.png';
const PUBLIC = join(process.cwd(), 'public');

async function main() {
  // 1) trim the solid black border down to the circular badge's bounding box
  const trimmed = await sharp(SRC).trim().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const size = Math.min(meta.width ?? 0, meta.height ?? 0);
  if (!size) throw new Error('could not read trimmed dimensions');

  // 2) center-square, then 3) mask to a circle (dest-in keeps only inside)
  const square = await sharp(trimmed).resize(size, size, { fit: 'cover', position: 'centre' }).toBuffer();
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );
  const circular = await sharp(square)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 4) export sized webp
  const outputs: Array<[string, number, number]> = [
    ['logo.webp', 512, 90], // header wordmark / Organization schema / general
    ['icon.webp', 96, 90],  // browser tab icon
  ];
  for (const [name, px, quality] of outputs) {
    const info = await sharp(circular).resize(px, px).webp({ quality, effort: 6 }).toFile(join(PUBLIC, name));
    console.log(`${name.padEnd(10)} ${px}x${px} -> ${(info.size / 1024).toFixed(1)} KB`);
  }

  // 5) replace app/favicon.ico so the E is the tab icon everywhere, including the
  // universal /favicon.ico that browsers request by default.
  const icoSizes = [16, 32, 48];
  const pngs = await Promise.all(icoSizes.map((s) => sharp(circular).resize(s, s).png().toBuffer()));
  const ico = buildIco(icoSizes.map((s, i) => ({ size: s, data: pngs[i] })));
  writeFileSync(join(process.cwd(), 'app', 'favicon.ico'), ico);
  console.log(`favicon.ico  ${icoSizes.join('/')}px -> ${(ico.length / 1024).toFixed(1)} KB`);

  console.log('Done. Wrote public/logo.webp, public/icon.webp, and app/favicon.ico (transparent corners).');
}
main();
