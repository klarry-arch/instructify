const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.slice(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function encodePNG(width, height, rgba) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // adaptive filtering
  ihdrData[12] = 0; // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawScanlines[y * (1 + width * 4)] = 0; // Filter None
    rgba.copy(rawScanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
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

const inputPath = 'C:\\Users\\Kay\\.gemini\\antigravity-ide\\brain\\c761984c-af7c-4d09-b06c-d8b66ccb6b6c\\.user_uploaded\\media_1788761755501.png';
const rawBuf = fs.readFileSync(inputPath);
const { width, height, pixels } = unfilterPNG(rawBuf);

console.log('Image dimensions:', width, 'x', height);

// 1. Copy raw pristine file to assets/images
const pristineDest = path.join(__dirname, '..', 'assets', 'images', 'instructify-kenya-logo.png');
fs.copyFileSync(inputPath, pristineDest);
console.log('Saved pristine logo to:', pristineDest);

// 2. Perform background removal using flood fill from edges
// Background color is close to #f7f7f9 (~247, 247, 249)
// Any pixel reachable from borders that has high luminance (e.g. > 235 on all channels) will be made transparent with anti-aliasing
const visited = new Uint8Array(width * height);
const queue = [];

function isBgCandidate(idx) {
  const r = pixels[idx];
  const g = pixels[idx + 1];
  const b = pixels[idx + 2];
  // Background in this image is off-white (240..255)
  return r > 228 && g > 228 && b > 228;
}

// Push all boundary pixels that are background candidates
for (let x = 0; x < width; x++) {
  const topIdx = (0 * width + x) * 4;
  if (isBgCandidate(topIdx)) { queue.push(0 * width + x); visited[0 * width + x] = 1; }
  const botIdx = ((height - 1) * width + x) * 4;
  if (isBgCandidate(botIdx)) { queue.push((height - 1) * width + x); visited[(height - 1) * width + x] = 1; }
}
for (let y = 0; y < height; y++) {
  const leftIdx = (y * width + 0) * 4;
  if (isBgCandidate(leftIdx) && !visited[y * width + 0]) { queue.push(y * width + 0); visited[y * width + 0] = 1; }
  const rightIdx = (y * width + (width - 1)) * 4;
  if (isBgCandidate(rightIdx) && !visited[y * width + (width - 1)]) { queue.push(y * width + (width - 1)); visited[y * width + (width - 1)] = 1; }
}

let head = 0;
while (head < queue.length) {
  const pos = queue[head++];
  const px = pos % width;
  const py = Math.floor(pos / width);

  const neighbors = [
    [px + 1, py],
    [px - 1, py],
    [px, py + 1],
    [px, py - 1]
  ];

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nPos = ny * width + nx;
      if (!visited[nPos]) {
        const nIdx = nPos * 4;
        if (isBgCandidate(nIdx)) {
          visited[nPos] = 1;
          queue.push(nPos);
        }
      }
    }
  }
}

console.log('Total background pixels marked by flood-fill:', queue.length, 'out of', width * height);

// Create transparent buffer with soft edges
const transparentPixels = Buffer.from(pixels);
for (let i = 0; i < width * height; i++) {
  if (visited[i]) {
    const idx = i * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    // Feather edge slightly based on brightness
    const minVal = Math.min(r, g, b);
    if (minVal >= 244) {
      transparentPixels[idx + 3] = 0; // 100% transparent
    } else {
      // Linear falloff between 230 and 244
      const alpha = Math.max(0, Math.min(255, Math.round(((244 - minVal) / 14) * 255)));
      transparentPixels[idx + 3] = alpha;
    }
  }
}

const transparentPngBuf = encodePNG(width, height, transparentPixels);
const transDest = path.join(__dirname, '..', 'assets', 'images', 'instructify-kenya-logo-transparent.png');
fs.writeFileSync(transDest, transparentPngBuf);
console.log('Saved transparent logo to:', transDest, 'Size:', transparentPngBuf.length);

// Also copy to logo.png
const logoDest = path.join(__dirname, '..', 'assets', 'images', 'logo.png');
fs.writeFileSync(logoDest, transparentPngBuf);
console.log('Updated assets/images/logo.png with transparent version');

// Also save high-quality clean white background version
const whiteDest = path.join(__dirname, '..', 'assets', 'images', 'instructify-kenya-logo-white-bg.png');
fs.copyFileSync(inputPath, whiteDest);
console.log('Saved white-bg logo to:', whiteDest);
