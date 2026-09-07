const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.slice(4, 8 + len)), 8 + len);
  return chunk;
}
function encodePNG(width, height, rgba) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawScanlines[y * (1 + width * 4)] = 0;
    rgba.copy(rawScanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idatChunk = makeChunk('IDAT', zlib.deflateSync(rawScanlines, { level: 9 }));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function unfilterPNG(buf) {
  let offset = 8;
  const idatChunks = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') idatChunks.push(buf.slice(offset + 8, offset + 8 + len));
    offset += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bpp = 4;
  const stride = 1 + width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  const prevRow = Buffer.alloc(width * bpp);
  const currRow = Buffer.alloc(width * bpp);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[y * stride];
    const rowOffset = y * stride + 1;
    for (let x = 0; x < width * bpp; x++) {
      const raw = decompressed[rowOffset + x];
      const a = x >= bpp ? currRow[x - bpp] : 0;
      const b = prevRow[x];
      const c = x >= bpp ? prevRow[x - bpp] : 0;
      let val = 0;
      if (filterType === 0) val = raw;
      else if (filterType === 1) val = (raw + a) & 0xff;
      else if (filterType === 2) val = (raw + b) & 0xff;
      else if (filterType === 3) val = (raw + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        val = (raw + pr) & 0xff;
      }
      currRow[x] = val;
    }
    currRow.copy(pixels, y * width * 4);
    currRow.copy(prevRow);
  }
  return { width, height, pixels };
}

// High quality area-averaging downsampler
function resizeRGBA(srcWidth, srcHeight, srcPixels, dstWidth, dstHeight) {
  const dstPixels = Buffer.alloc(dstWidth * dstHeight * 4);
  const xRatio = srcWidth / dstWidth;
  const yRatio = srcHeight / dstHeight;

  for (let dy = 0; dy < dstHeight; dy++) {
    const syStart = dy * yRatio;
    const syEnd = (dy + 1) * yRatio;
    const syMin = Math.floor(syStart);
    const syMax = Math.min(srcHeight - 1, Math.floor(syEnd));

    for (let dx = 0; dx < dstWidth; dx++) {
      const sxStart = dx * xRatio;
      const sxEnd = (dx + 1) * xRatio;
      const sxMin = Math.floor(sxStart);
      const sxMax = Math.min(srcWidth - 1, Math.floor(sxEnd));

      let totalWeight = 0;
      let r = 0, g = 0, b = 0, a = 0;

      for (let sy = syMin; sy <= syMax; sy++) {
        const yWeight = Math.min(sy + 1, syEnd) - Math.max(sy, syStart);
        if (yWeight <= 0) continue;

        for (let sx = sxMin; sx <= sxMax; sx++) {
          const xWeight = Math.min(sx + 1, sxEnd) - Math.max(sx, sxStart);
          if (xWeight <= 0) continue;

          const weight = xWeight * yWeight;
          const sIdx = (sy * srcWidth + sx) * 4;
          const sa = srcPixels[sIdx + 3] / 255;

          // Premultiplied alpha weighting for smooth edges
          r += srcPixels[sIdx] * sa * weight;
          g += srcPixels[sIdx + 1] * sa * weight;
          b += srcPixels[sIdx + 2] * sa * weight;
          a += srcPixels[sIdx + 3] * weight;
          totalWeight += weight;
        }
      }

      const dIdx = (dy * dstWidth + dx) * 4;
      if (totalWeight > 0 && a > 0) {
        const finalA = a / totalWeight;
        const norm = (finalA / 255) * totalWeight;
        dstPixels[dIdx] = Math.round(Math.min(255, Math.max(0, r / norm)));
        dstPixels[dIdx + 1] = Math.round(Math.min(255, Math.max(0, g / norm)));
        dstPixels[dIdx + 2] = Math.round(Math.min(255, Math.max(0, b / norm)));
        dstPixels[dIdx + 3] = Math.round(Math.min(255, Math.max(0, finalA)));
      }
    }
  }
  return dstPixels;
}

const transPath = path.join(__dirname, '..', 'assets', 'images', 'instructify-kenya-logo-transparent.png');
const transBuf = fs.readFileSync(transPath);
const { width, height, pixels } = unfilterPNG(transBuf);

console.log('Generating variants from transparent master...');

// Generate 128x128 for navbars / icons
const p128 = resizeRGBA(width, height, pixels, 128, 128);
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'instructify-logo-128.png'), encodePNG(128, 128, p128));

// Generate 64x64 for small badges / headers
const p64 = resizeRGBA(width, height, pixels, 64, 64);
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'instructify-logo-64.png'), encodePNG(64, 64, p64));

// Generate 32x32 for favicon
const p32 = resizeRGBA(width, height, pixels, 32, 32);
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'instructify-logo-32.png'), encodePNG(32, 32, p32));

// Generate SVG wrapper that embeds high-res transparent PNG as well
const base64Data = transBuf.toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <title>Instructify Kenya Logo</title>
  <image href="data:image/png;base64,${base64Data}" width="1024" height="1024" preserveAspectRatio="xMidYMid meet" />
</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'instructify-logo.svg'), svgContent);
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'instructify-icon.svg'), svgContent);
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'instructify-logo-dark.svg'), svgContent);

console.log('Variants and SVG fallbacks successfully generated!');
