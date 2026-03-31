#!/usr/bin/env node
/**
 * scripts/gen-icons.js
 * Generates PNG app icons from pure Node.js (no external image deps).
 * Usage: node scripts/gen-icons.js
 *
 * Design: diagonal gradient #3b82f6 → #6366f1 background,
 *         white ">" chevron symbol (representing API send).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// ── CRC32 ─────────────────────────────────────────────────────────────────

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG encoder ───────────────────────────────────────────────────────────

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(d.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, d])));
  return Buffer.concat([lenBuf, t, d, crcBuf]);
}

function toPng(rgba, w, h) {
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA

  // Build filtered scanlines — filter type 0 (None) per row
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const rowStart = y * (1 + w * 4);
    raw[rowStart] = 0; // filter byte
    const src = y * w * 4;
    for (let b = 0; b < w * 4; b++) raw[rowStart + 1 + b] = rgba[src + b];
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdrData),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Drawing ───────────────────────────────────────────────────────────────

function lerp(a, b, t) {
  return Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
}

function drawIcon(size) {
  const rgba = new Uint8Array(size * size * 4);

  // Diagonal gradient: #3b82f6 (top-left) → #6366f1 (bottom-right)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * (size - 1));
      const i = (y * size + x) * 4;
      rgba[i] = lerp(0x3b, 0x63, t); // R
      rgba[i + 1] = lerp(0x82, 0x66, t); // G
      rgba[i + 2] = lerp(0xf6, 0xf1, t); // B
      rgba[i + 3] = 255;
    }
  }

  // Anti-aliased ">" chevron in white
  // Two line segments meeting at the right tip
  const sw = Math.max(2.5, size * 0.115); // half-stroke-width
  const tipX = size * 0.7;
  const tipY = size * 0.5;
  const openX = size * 0.3;
  const topY = size * 0.27;
  const botY = size * 0.73;

  function drawSeg(x0, y0, x1, y1) {
    const dx = x1 - x0,
      dy = y1 - y0;
    const len2 = dx * dx + dy * dy;
    const pad = Math.ceil(sw) + 1;
    const minX = Math.max(0, Math.floor(Math.min(x0, x1) - pad));
    const maxX = Math.min(size - 1, Math.ceil(Math.max(x0, x1) + pad));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1) - pad));
    const maxY = Math.min(size - 1, Math.ceil(Math.max(y0, y1) + pad));

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / len2));
        const qx = x0 + t * dx - px;
        const qy = y0 + t * dy - py;
        const dist = Math.sqrt(qx * qx + qy * qy);
        // AA coverage: 1 at dist=0, 0 at dist=sw/2+0.5
        const cov = Math.max(0, Math.min(1, sw / 2 - dist + 0.5));
        if (cov <= 0) continue;
        const i = (py * size + px) * 4;
        rgba[i] = lerp(rgba[i], 255, cov);
        rgba[i + 1] = lerp(rgba[i + 1], 255, cov);
        rgba[i + 2] = lerp(rgba[i + 2], 255, cov);
      }
    }
  }

  drawSeg(openX, topY, tipX, tipY); // upper arm
  drawSeg(openX, botY, tipX, tipY); // lower arm

  return rgba;
}

// ── Generate ──────────────────────────────────────────────────────────────

mkdirSync('assets/icons', { recursive: true });

const TARGETS = [
  [32, 'assets/favicon.png'],
  [192, 'assets/icons/icon-192.png'],
  [512, 'assets/icons/icon-512.png'],
];

for (const [size, path] of TARGETS) {
  const png = toPng(drawIcon(size), size, size);
  writeFileSync(path, png);
  console.log(`✓  ${path}  (${size}×${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}
