const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function resizeNearestOrBilinear(srcPng, targetWidth, targetHeight, pad = 0) {
  const outPng = new PNG({ width: targetWidth, height: targetHeight });
  
  // Calculate source aspect ratio and fit within target
  const innerW = targetWidth - pad * 2;
  const innerH = targetHeight - pad * 2;
  const scale = Math.min(innerW / srcPng.width, innerH / srcPng.height);
  const drawW = Math.round(srcPng.width * scale);
  const drawH = Math.round(srcPng.height * scale);
  const offsetX = Math.round((targetWidth - drawW) / 2);
  const offsetY = Math.round((targetHeight - drawH) / 2);

  // Initialize with transparent
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (targetWidth * y + x) << 2;
      outPng.data[idx] = 0;
      outPng.data[idx + 1] = 0;
      outPng.data[idx + 2] = 0;
      outPng.data[idx + 3] = 0;
    }
  }

  // Bilinear interpolation
  for (let dy = 0; dy < drawH; dy++) {
    const sy = (dy / (drawH - 1 || 1)) * (srcPng.height - 1);
    const y0 = Math.floor(sy);
    const y1 = Math.min(y0 + 1, srcPng.height - 1);
    const fy = sy - y0;

    for (let dx = 0; dx < drawW; dx++) {
      const sx = (dx / (drawW - 1 || 1)) * (srcPng.width - 1);
      const x0 = Math.floor(sx);
      const x1 = Math.min(x0 + 1, srcPng.width - 1);
      const fx = sx - x0;

      const idx00 = (srcPng.width * y0 + x0) << 2;
      const idx10 = (srcPng.width * y0 + x1) << 2;
      const idx01 = (srcPng.width * y1 + x0) << 2;
      const idx11 = (srcPng.width * y1 + x1) << 2;

      const outX = offsetX + dx;
      const outY = offsetY + dy;
      if (outX < 0 || outX >= targetWidth || outY < 0 || outY >= targetHeight) continue;
      const outIdx = (targetWidth * outY + outX) << 2;

      for (let c = 0; c < 4; c++) {
        const top = srcPng.data[idx00 + c] * (1 - fx) + srcPng.data[idx10 + c] * fx;
        const bottom = srcPng.data[idx01 + c] * (1 - fx) + srcPng.data[idx11 + c] * fx;
        outPng.data[outIdx + c] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
  }

  return outPng;
}

function createIcoFile(pngBuffer32) {
  // 6-byte ICONDIR header
  // 16-byte ICONDIRENTRY
  // Followed by PNG payload
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO image
  header.writeUInt16LE(1, 4); // 1 image in file

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // Width 32
  entry.writeUInt8(32, 1); // Height 32
  entry.writeUInt8(0, 2);  // Colors (0 for truecolor)
  entry.writeUInt8(0, 3);  // Reserved
  entry.writeUInt16LE(1, 4); // Color planes
  entry.writeUInt16LE(32, 6); // Bits per pixel
  entry.writeUInt32LE(pngBuffer32.length, 8); // Size of image data
  entry.writeUInt32LE(22, 12); // Offset to image data (6 + 16 = 22)

  return Buffer.concat([header, entry, pngBuffer32]);
}

const srcFile = path.resolve(__dirname, '../assets/images/instructify-kenya-icon.png');
const srcData = fs.readFileSync(srcFile);
const srcPng = PNG.sync.read(srcData);

// 1. 32x32 Favicon
const png32 = resizeNearestOrBilinear(srcPng, 32, 32, 1);
const buf32 = PNG.sync.write(png32);
fs.writeFileSync(path.resolve(__dirname, '../assets/images/favicon-32x32.png'), buf32);

// 2. 16x16 Favicon
const png16 = resizeNearestOrBilinear(srcPng, 16, 16, 0);
const buf16 = PNG.sync.write(png16);
fs.writeFileSync(path.resolve(__dirname, '../assets/images/favicon-16x16.png'), buf16);

// 3. 180x180 Apple Touch Icon
const png180 = resizeNearestOrBilinear(srcPng, 180, 180, 16);
const buf180 = PNG.sync.write(png180);
fs.writeFileSync(path.resolve(__dirname, '../assets/images/apple-touch-icon.png'), buf180);

// 4. favicon.ico
const icoBuf = createIcoFile(buf32);
fs.writeFileSync(path.resolve(__dirname, '../favicon.ico'), icoBuf);
fs.writeFileSync(path.resolve(__dirname, '../assets/images/favicon.ico'), icoBuf);

console.log('✅ Generated favicon-32x32.png, favicon-16x16.png, apple-touch-icon.png, and favicon.ico!');
