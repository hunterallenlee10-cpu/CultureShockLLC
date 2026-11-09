#!/usr/bin/env node
/**
 * Uploads the full-length transcodes in media-full/ to Vercel Blob and prints the
 * base URL to set as NEXT_PUBLIC_MEDIA_BLOB_BASE. Only the 2024 reel ships in
 * /public; everything else lives here to keep the repo under the 120 MB budget.
 *
 *   BLOB_READ_WRITE_TOKEN=… node scripts/upload-blob.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { put } from '@vercel/blob';

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('Set BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob → your store → .env.local).');
  process.exit(1);
}
const dir = 'media-full';
const files = fs.readdirSync(dir).filter((f) => /\.(mp4|webm)$/.test(f));
let base = '';
for (const f of files) {
  const type = f.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
  const res = await put(`media/full/${f}`, fs.createReadStream(path.join(dir, f)), {
    access: 'public',
    token,
    contentType: type,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
    multipart: true,
  });
  base = res.url.slice(0, res.url.lastIndexOf('/'));
  console.log('✓', f, '→', res.url);
}
console.log(`\nDone. Set this in Vercel (and .env.local):\nNEXT_PUBLIC_MEDIA_BLOB_BASE=${base}`);
