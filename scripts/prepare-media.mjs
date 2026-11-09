#!/usr/bin/env node
/**
 * Culture Shock — media prep pipeline.
 *
 * Reads the raw asset pack in assets-raw/culture-shock-assets (never shipped)
 * and writes web-ready media to public/media plus a typed index at
 * src/content/media.json (consumed by src/lib/media.ts).
 *
 *   node scripts/prepare-media.mjs                 # everything except full-length transcodes
 *   node scripts/prepare-media.mjs --stage=full    # full-length MP4 + WebM (slow)
 *   node scripts/prepare-media.mjs --stage=loops,images --force
 *
 * Stages: images, logo, loops, hero, full, index. Outputs are cached: a file that
 * already exists is skipped unless --force is passed.
 *
 * Requires ffmpeg/ffprobe on PATH (libx264 + libvpx-vp9) and `sharp` + `potrace`.
 */
import { execFile as _execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import potrace from 'potrace';

const execFile = promisify(_execFile);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RAW = path.join(ROOT, 'assets-raw/culture-shock-assets');
const OUT = path.join(ROOT, 'public/media');
const FULL_OUT = path.join(ROOT, 'media-full'); // gitignored; upload to Vercel Blob
const INDEX = path.join(ROOT, 'src/content/media.json');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const FORCE = !!args.force;
const STAGES = new Set((args.stage ? String(args.stage) : 'images,logo,textures,loops,clips,stills,cuts,hero,index').split(','));
if (STAGES.has('full')) STAGES.add('index');

/* ----------------------------------------------------------------------------
 * Per-clip fixes, verified by eye (see README → "Media notes").
 *  - transpose=2 (90° counter-clockwise) stands the sideways football clips up.
 *    Once upright they are 16:9 landscape footage.
 *  - crop removes letterbox bars / gradient fills so no bars ever ship.
 * ------------------------------------------------------------------------- */
const FIX = {
  'reel-30': { transpose: 2 },
  'reel-31': { transpose: 2 },
  'reel-32': { transpose: 2 },
  'reel-34': { transpose: 2 },
  'reel-35': { transpose: 2 },
  'reel-36': { transpose: 2 },
  'reel-33': { crop: '720:400:0:440' }, // landscape clip letterboxed in 9:16
  'reel-20': { crop: '720:400:0:440' },
  'reel-22': { crop: '1196:676:42:0' }, // pillarboxed
  'hl-sports-02': { crop: '720:400:0:422' }, // landscape band on a gradient fill
  'hl-sports-03': { crop: '720:404:0:416' },
  'hl-sports-04': { crop: '720:404:0:356' },
  'hl-sports-05': { crop: '720:398:0:442' },
  'hl-sports-06': { crop: '720:398:0:442' },
  'hl-bts-03': { crop: '720:370:0:455' },
};

/** Poster frames regenerated from the fixed video (IG cover is sideways / letterboxed / black). */
const REGEN_POSTER = new Set([
  'reel-20',
  'reel-22',
  'reel-23',
  'reel-24',
  'reel-30',
  'reel-31',
  'reel-32',
  'reel-33',
  'reel-34',
  'reel-35',
  'reel-36',
]);

/** Manual loop-start overrides (seconds). Everything else uses scene detection. */
const LOOP_START = {
  'reel-23': 31.1, // game-day action, skips the film-leader countdown
  'reel-01': 14.0, // the shot, not the tripod
  'reel-22': 13.0,
  'reel-35': 13.0, // open-field action (the scene-detected window opens on a white whip-pan)
};

/** Clips the hero is cut from: [start, end] seconds in reel-23-showreel-2024. */
const HERO_SEGMENTS = [
  [13.25, 14.45], // team bursts out of the smoke
  [14.55, 16.8], // tunnel performance shot
  [21.08, 21.8], // Cardinals players
  [24.5, 26.8], // "Home Sweet Home" athlete shoot
  [31.12, 33.6], // game-day action
  [53.29, 53.75], // helmet close-up
  [56.58, 58.6], // night game
  [59.05, 60.5], // helmet close-up, white/gold
  [38.75, 41.2], // beach
  [63.17, 65.6], // game action
  [16.92, 18.35], // beach, two men
  [74.25, 76.3], // the tackle
];
/** 9:16 mobile hero: [key, start, end]. Only Culture Shock's own footage (no third-party clips). */
const MOBILE_HERO_SEGMENTS = [
  // Caption-free footage only: burned-in captions collide with the hero headline.
  ['reel-35', 0.2, 3.0], // walk-out through the smoke
  ['reel-23', 14.55, 16.8], // tunnel performance shot (centre-cropped to 9:16)
  ['reel-35', 13.0, 15.4], // open-field run
  ['reel-23', 24.5, 26.6], // "Home Sweet Home" athlete shoot
  ['reel-35', 9.1, 11.4], // athlete close-up
  ['reel-23', 59.05, 60.5], // helmet close-up
  ['reel-35', 32.0, 34.5],
];

const PHOTO_WIDTHS = [640, 1280, 1920];
const LOOP_SECONDS = 6;
const LOOP_MAX_BYTES = 600 * 1024;
const CPU = Math.max(1, os.cpus().length);

/* ---------------------------------------------------------------- helpers -- */
const log = (...a) => console.log('[media]', ...a);
const rel = (p) => path.relative(ROOT, p);
const fileKey = (base) => {
  const m = base.match(/^(reel-\d+|hl-[a-z]+-\d+|photo-\d+)/);
  if (!m) return base;
  if (m[1].startsWith('photo-')) {
    const n = base.match(/-(\d+)$/);
    return `${m[1]}-${n ? n[1] : '01'}`;
  }
  return m[1];
};
async function ff(argv, opts = {}) {
  try {
    return await execFile('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...argv], {
      maxBuffer: 1 << 28,
      ...opts,
    });
  } catch (e) {
    throw new Error(`ffmpeg failed: ${argv.join(' ')}\n${e.stderr || e.message}`);
  }
}
async function probe(file) {
  const { stdout } = await execFile('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height,r_frame_rate:format=duration',
    '-of',
    'json',
    file,
  ]);
  const j = JSON.parse(stdout);
  return {
    width: j.streams[0].width,
    height: j.streams[0].height,
    duration: parseFloat(j.format.duration),
  };
}
const exists = (p) => !FORCE && existsSync(p);
const size = async (p) => (await fs.stat(p)).size;
async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}
async function blurDataURL(input) {
  const buf = await sharp(input).resize(16).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

/** Filter chain that makes a raw clip upright and bar-free, at its native resolution. */
function fixChain(key) {
  const f = FIX[key] || {};
  const parts = [];
  if (f.crop) parts.push(`crop=${f.crop}`);
  if (f.transpose) parts.push(`transpose=${f.transpose}`);
  return parts;
}
/** Output dimensions after the fix chain. */
function fixedDims(key, w, h) {
  const f = FIX[key] || {};
  if (f.crop) {
    const [cw, ch] = f.crop.split(':').map(Number);
    w = cw;
    h = ch;
  }
  if (f.transpose) [w, h] = [h, w];
  return { w, h };
}
const even = (n) => Math.max(2, Math.round(n / 2) * 2);

/* ------------------------------------------------------------ inventory --- */
async function inventory() {
  const vids = [];
  for (const dir of ['02_reels_video', '05_highlights']) {
    for (const f of (await fs.readdir(path.join(RAW, dir))).sort()) {
      if (!f.endsWith('.mp4')) continue;
      const base = f.replace(/\.mp4$/, '');
      vids.push({ key: fileKey(base), base, file: path.join(RAW, dir, f) });
    }
  }
  const imgs = [];
  for (const dir of ['01_brand', '03_reels_posters', '04_photos', '05_highlights']) {
    for (const f of (await fs.readdir(path.join(RAW, dir))).sort()) {
      if (!/\.jpe?g$/.test(f)) continue;
      const base = f.replace(/\.jpe?g$/, '');
      let key = fileKey(base);
      if (dir === '03_reels_posters') key = `${fileKey(base)}-cover`;
      if (dir === '01_brand') key = base.startsWith('logo') ? 'logo' : 'hiring';
      imgs.push({ key, base, dir, file: path.join(RAW, dir, f) });
    }
  }
  return { vids, imgs };
}

/* --------------------------------------------------------------- images --- */
async function processImage(key, input, alt = {}) {
  const meta = await sharp(input).metadata();
  const W = meta.width,
    H = meta.height;
  let widths = PHOTO_WIDTHS.filter((w) => w <= W);
  if (!widths.length) widths = [W];
  else if (W < 1920 && W > widths.at(-1) * 1.15) widths.push(W); // keep native width too
  await fs.mkdir(path.join(OUT, 'img'), { recursive: true });
  for (const w of widths) {
    const avif = path.join(OUT, 'img', `${key}-${w}.avif`);
    const webp = path.join(OUT, 'img', `${key}-${w}.webp`);
    if (!exists(avif)) await sharp(input).resize(w).avif({ quality: 50, effort: 4 }).toFile(avif);
    if (!exists(webp)) await sharp(input).resize(w).webp({ quality: 72 }).toFile(webp);
  }
  return {
    src: `/media/img/${key}`,
    widths,
    width: W,
    height: H,
    aspect: +(W / H).toFixed(4),
    blurDataURL: await blurDataURL(input),
    ...alt,
  };
}

async function stageImages(imgs, index) {
  log(`images: ${imgs.length} source JPGs`);
  index.images ||= {};
  await pool(imgs, CPU, async (im) => {
    // IG covers we replace with frames from the fixed video are skipped here.
    if (im.dir === '03_reels_posters' && REGEN_POSTER.has(im.key.replace('-cover', ''))) return;
    index.images[im.key] = await processImage(im.key, im.file, { source: `${im.dir}/${im.base}.jpg` });
  });
  // Founder portrait, cropped out of the "Meet the Founder" card (hl-about-04).
  const founder = await sharp(path.join(RAW, '05_highlights/hl-about-04.jpg'))
    .extract({ left: 140, top: 805, width: 425, height: 735 })
    .toBuffer();
  await fs.mkdir(path.join(OUT, 'brand'), { recursive: true });
  await sharp(founder).jpeg({ quality: 88 }).toFile(path.join(OUT, 'brand/founder.jpg'));
  index.images.founder = await processImage('founder', founder, {
    source: '05_highlights/hl-about-04.jpg (crop 140,805 425x735)',
  });
  // Logo raster fallback
  await sharp(path.join(RAW, '01_brand/logo-culture-shock-profile.jpg')).jpeg({ quality: 88 }).toFile(path.join(OUT, 'brand/logo.jpg'));
}

/* ----------------------------------------------------------------- logo --- */
function trace(buf, opts) {
  return new Promise((res, rej) => potrace.trace(buf, opts, (err, svg) => (err ? rej(err) : res(svg))));
}
// Coordinates are traced at 3x, so whole numbers keep sub-pixel precision at 1x.
const pathsOf = (svg) =>
  [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1].replace(/-?\d+\.\d+/g, (n) => String(Math.round(+n)))).join(' ');

async function stageLogo() {
  const svgOut = path.join(OUT, 'brand/logo.svg');
  if (exists(svgOut)) return log('logo: cached');
  log('logo: vectorizing wordmark');
  const SCALE = 3;
  const src = path.join(RAW, '01_brand/logo-culture-shock-profile.jpg');
  const { data, info } = await sharp(src)
    .resize(1080 * SCALE, 1080 * SCALE, { kernel: 'lanczos3' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  // Gold = warm, bright pixels. Everything else is the black field / letter interiors.
  const gold = new Uint8Array(W * H);
  let minX = W,
    minY = H,
    maxX = 0,
    maxY = 0;
  for (let i = 0, p = 0; i < W * H; i++, p += 3) {
    const r = data[p],
      g = data[p + 1],
      b = data[p + 2];
    if (r > 110 && g > 70 && r - b > 70) {
      gold[i] = 1;
      const x = i % W,
        y = (i / W) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const pad = 6 * SCALE;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad);
  maxY = Math.min(H - 1, maxY + pad);
  const cw = maxX - minX + 1,
    ch = maxY - minY + 1;
  // Silhouette = gold plus every enclosed interior (flood the outside from the border).
  const outside = new Uint8Array(cw * ch);
  const stack = [];
  const at = (x, y) => gold[(y + minY) * W + (x + minX)];
  for (let x = 0; x < cw; x++) stack.push(x, 0, x, ch - 1);
  for (let y = 0; y < ch; y++) stack.push(0, y, cw - 1, y);
  while (stack.length) {
    const y = stack.pop(),
      x = stack.pop();
    if (x < 0 || y < 0 || x >= cw || y >= ch) continue;
    const i = y * cw + x;
    if (outside[i] || at(x, y)) continue;
    outside[i] = 1;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  const toPng = (fn) => {
    const buf = Buffer.alloc(cw * ch);
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) buf[y * cw + x] = fn(x, y) ? 0 : 255;
    return sharp(buf, { raw: { width: cw, height: ch, channels: 1 } })
      .png()
      .toBuffer();
  };
  const goldPng = await toPng((x, y) => at(x, y));
  const silPng = await toPng((x, y) => !outside[y * cw + x]);
  const opts = { threshold: 128, turdSize: 40 * SCALE, optTolerance: 0.35, alphaMax: 0.9 };
  const goldD = pathsOf(await trace(goldPng, opts));
  const silD = pathsOf(await trace(silPng, { ...opts, turdSize: 400 * SCALE }));
  const vb = `0 0 ${cw} ${ch}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-labelledby="t">
<title id="t">Culture Shock</title>
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#FFD54A"/><stop offset=".45" stop-color="#F5B300"/><stop offset="1" stop-color="#C98A00"/>
</linearGradient></defs>
<path class="cs-sil" d="${silD}" fill="#050505"/>
<path class="cs-gold" d="${goldD}" fill="url(#g)" fill-rule="evenodd"/>
</svg>
`;
  await fs.writeFile(svgOut, svg);
  // Also emit the raw path data so React components can inline + animate it.
  await fs.writeFile(
    path.join(ROOT, 'src/content/logo-paths.json'),
    JSON.stringify({ viewBox: vb, width: cw, height: ch, silhouette: silD, gold: goldD }),
  );
  // Raster check so the trace can be eyeballed next to the original.
  await sharp(Buffer.from(svg)).resize(1200).flatten({ background: '#050505' }).png().toFile(path.join(ROOT, 'media-full/_logo-check.png'));
  log(`logo: ${rel(svgOut)} (${((await size(svgOut)) / 1024).toFixed(0)} KB)`);
}

/* ------------------------------------------------------------- textures --- */
/**
 * Brand textures lifted from their own ABOUT card (hl-about-01): the gold brush
 * slashes + halftone clusters in the corners, keyed off the black field
 * (luminance → alpha, un-premultiplied) so they composite on any dark panel.
 * Plus a procedural grunge mask that gives display type their worn, scratched finish.
 */
async function keyOutBlack(input, region, outFile) {
  const { data, info } = await sharp(input).extract(region).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, p = 0, q = 0; i < info.width * info.height; i++, p += 3, q += 4) {
    const r = data[p],
      g = data[p + 1],
      b = data[p + 2];
    const a = Math.max(0, Math.min(255, (Math.max(r, g) - 28) * 2.4));
    const k = a > 0 ? 255 / a : 0;
    out[q] = Math.min(255, r * k);
    out[q + 1] = Math.min(255, g * k);
    out[q + 2] = Math.min(255, b * k);
    out[q + 3] = a;
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(outFile);
}

async function stageTextures() {
  const dir = path.join(OUT, 'brand');
  await fs.mkdir(dir, { recursive: true });
  const card = path.join(RAW, '05_highlights/hl-about-01.jpg');
  const tl = path.join(dir, 'brush-tl.webp');
  const br = path.join(dir, 'brush-br.webp');
  if (!exists(tl)) await keyOutBlack(card, { left: 0, top: 0, width: 440, height: 540 }, tl);
  if (!exists(br)) await keyOutBlack(card, { left: 900, top: 1905, width: 420, height: 441 }, br);
  // Grunge mask: opaque white with specks and short vertical scratches knocked out.
  const grunge = path.join(dir, 'grunge.png');
  if (!exists(grunge)) {
    const S = 512;
    const a = Buffer.alloc(S * S, 255);
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const hole = (x, y, v = 0) => {
      a[((y + S) % S) * S + ((x + S) % S)] = v;
    };
    for (let i = 0; i < 5200; i++) {
      const x = (rnd() * S) | 0,
        y = (rnd() * S) | 0,
        r = rnd() < 0.85 ? 0 : 1;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) hole(x + dx, y + dy, (rnd() * 90) | 0);
    }
    for (let i = 0; i < 260; i++) {
      const x = (rnd() * S) | 0,
        y = (rnd() * S) | 0,
        len = 6 + ((rnd() * 46) | 0);
      for (let k = 0; k < len; k++) if (rnd() > 0.18) hole(x + ((k / 14) | 0), y + k, (rnd() * 70) | 0);
    }
    await sharp(Buffer.alloc(S * S * 3, 255), { raw: { width: S, height: S, channels: 3 } })
      .joinChannel(a, { raw: { width: S, height: S, channels: 1 } })
      .png({ compressionLevel: 9, palette: true })
      .toFile(grunge);
  }
  log('textures: brush-tl.webp, brush-br.webp, grunge.png');
}

/* ---------------------------------------------------------------- loops --- */
/** Per-frame scene-change scores at 12 fps on a downscaled, fixed copy. */
async function sceneScores(v) {
  const chain = [...fixChain(v.key), 'fps=12', 'scale=192:-2', "select='gte(scene,0)'", 'metadata=print:file=-'];
  const { stdout } = await ff(['-i', v.file, '-an', '-vf', chain.join(','), '-f', 'null', '-'], {
    maxBuffer: 1 << 28,
  });
  const out = [];
  let t = 0;
  for (const line of stdout.split('\n')) {
    const mt = line.match(/pts_time:([\d.]+)/);
    if (mt) t = parseFloat(mt[1]);
    const ms = line.match(/lavfi\.scene_score=([\d.]+)/);
    if (ms) out.push([t, parseFloat(ms[1])]);
  }
  return out;
}
/** Most kinetic 6s window: most hard cuts (score>0.3) + mean motion, end cards excluded. */
function pickWindow(scores, duration) {
  const tail = Math.min(4, duration * 0.12);
  const maxStart = Math.max(0, duration - tail - LOOP_SECONDS);
  let best = { t: Math.min(0.5, maxStart), s: -1 };
  for (let t = 0.4; t <= maxStart; t += 0.25) {
    const win = scores.filter(([x]) => x >= t && x < t + LOOP_SECONDS);
    if (!win.length) continue;
    const cuts = win.filter(([, s]) => s > 0.3).length;
    const mean = win.reduce((a, [, s]) => a + s, 0) / win.length;
    const sc = cuts + mean * 20;
    if (sc > best.s) best = { t, s: sc };
  }
  // Start exactly on a cut if one lands in the first 1.5 s, so the loop opens on a clean frame.
  const cut = scores.find(([x, s]) => x >= best.t && x <= best.t + 1.5 && s > 0.3);
  const start = cut ? cut[0] + 0.05 : best.t;
  return +Math.min(start, maxStart).toFixed(2);
}

function loopScale(w, h) {
  // 540px wide for vertical/near-square sources; 960px wide for landscape.
  return w > h * 1.15 ? `scale=960:-2:flags=lanczos` : `scale=540:-2:flags=lanczos`;
}

async function encodeLoop(input, chain, start, dur, outBase, opts = {}) {
  const vf = [...chain, 'fps=24', 'format=yuv420p'].join(',');
  const mp4 = `${outBase}.mp4`,
    webm = `${outBase}.webm`;
  const maxBytes = opts.maxBytes ?? LOOP_MAX_BYTES;
  const kbps = Math.floor(((maxBytes * 8) / dur / 1000) * 0.92);
  for (const [file, enc] of [
    [
      mp4,
      (q) => [
        '-c:v',
        'libx264',
        '-preset',
        'slow',
        '-crf',
        String(q),
        '-maxrate',
        `${kbps}k`,
        '-bufsize',
        `${kbps * 2}k`,
        '-profile:v',
        'high',
        '-movflags',
        '+faststart',
      ],
    ],
    [
      webm,
      (q) => [
        '-c:v',
        'libvpx-vp9',
        '-crf',
        String(q + 10),
        '-b:v',
        `${Math.floor(kbps * 0.8)}k`,
        '-maxrate',
        `${kbps}k`,
        '-row-mt',
        '1',
        '-deadline',
        'good',
        '-cpu-used',
        '2',
      ],
    ],
  ]) {
    if (exists(file)) continue;
    let q = opts.crf ?? 25;
    for (let attempt = 0; attempt < 4; attempt++) {
      await ff(['-ss', String(start), '-t', String(dur), '-i', input, '-an', '-vf', vf, ...enc(q), file]);
      if ((await size(file)) <= maxBytes) break;
      q += 3;
    }
  }
  return { mp4, webm };
}

async function stageLoops(vids, index) {
  index.videos ||= {};
  await fs.mkdir(path.join(OUT, 'loops'), { recursive: true });
  await fs.mkdir(path.join(OUT, 'img'), { recursive: true });
  log(`loops: ${vids.length} clips`);
  await pool(vids, Math.max(1, Math.floor(CPU / 2)), async (v) => {
    const p = await probe(v.file);
    const { w, h } = fixedDims(v.key, p.width, p.height);
    let start = LOOP_START[v.key];
    if (start == null) start = pickWindow(await sceneScores(v), p.duration);
    const dur = Math.min(LOOP_SECONDS, p.duration - start - 0.1);
    const chain = [...fixChain(v.key), loopScale(w, h)];
    const outBase = path.join(OUT, 'loops', v.key);
    await encodeLoop(v.file, chain, start, dur, outBase);
    // First-frame poster for the loop (so there is no flash when it starts).
    const posterJpg = `${outBase}.jpg`;
    if (!exists(posterJpg))
      await ff(['-ss', String(start), '-i', v.file, '-frames:v', '1', '-vf', chain.join(','), '-q:v', '4', posterJpg]);
    const lp = await probe(`${outBase}.mp4`);
    // Full-resolution poster frame (replaces bad IG covers, and gives every clip a still).
    const fullChain = [...fixChain(v.key)];
    const longEdge = Math.max(w, h);
    if (longEdge > 1920) fullChain.push(w >= h ? 'scale=1920:-2' : 'scale=-2:1920');
    const still = path.join(FULL_OUT, 'stills', `${v.key}.png`);
    await fs.mkdir(path.dirname(still), { recursive: true });
    if (!exists(still)) {
      const t = REGEN_POSTER.has(v.key) && v.key !== 'reel-23' ? start + 0.6 : start;
      await ff(['-ss', String(t), '-i', v.file, '-frames:v', '1', ...(fullChain.length ? ['-vf', fullChain.join(',')] : []), still]);
    }
    const stillMeta = await processImage(`${v.key}-still`, still, { source: `${v.base}.mp4 @ ${start}s` });
    index.images[`${v.key}-still`] = stillMeta;
    index.videos[v.key] = {
      ...(index.videos[v.key] || {}),
      key: v.key,
      base: v.base,
      sourceWidth: w,
      sourceHeight: h,
      duration: +p.duration.toFixed(2),
      orientation: w > h * 1.15 ? 'landscape' : h > w * 1.15 ? 'portrait' : 'square',
      aspect: +(w / h).toFixed(4),
      fix: FIX[v.key] || null,
      loop: {
        mp4: `/media/loops/${v.key}.mp4`,
        webm: `/media/loops/${v.key}.webm`,
        poster: `/media/loops/${v.key}.jpg`,
        width: lp.width,
        height: lp.height,
        start,
        duration: +lp.duration.toFixed(2),
        blurDataURL: await blurDataURL(posterJpg),
        bytes: { mp4: await size(`${outBase}.mp4`), webm: await size(`${outBase}.webm`) },
      },
    };
    log(
      `  loop ${v.key} @${start}s ${lp.width}x${lp.height} mp4=${(index.videos[v.key].loop.bytes.mp4 / 1024) | 0}KB webm=${(index.videos[v.key].loop.bytes.webm / 1024) | 0}KB`,
    );
  });
}

/* ---------------------------------------------------------------- clips --- */
/** Hand-picked sub-clips: the "setup vs. the shot" slider pairs. [source, start, end] */
const CLIPS = {
  'bts01-setup': ['reel-01', 11.6, 17.4], // camera + monitor framing the empty chair
  'bts01-shot': ['reel-01', 22.2, 28.0], // the interview it captured
  'bts22-setup': ['reel-22', 3.1, 6.9], // operator in the car with the FX3
  'bts22-shot': ['reel-22', 8.2, 14.0], // the night walk it captured
};
async function stageClips(vids, index) {
  const byKey = Object.fromEntries(vids.map((v) => [v.key, v.file]));
  index.clips ||= {};
  for (const [name, [key, a, b]] of Object.entries(CLIPS)) {
    const p = await probe(byKey[key]);
    const { w, h } = fixedDims(key, p.width, p.height);
    const chain = [...fixChain(key), loopScale(w, h)];
    const outBase = path.join(OUT, 'loops', name);
    await encodeLoop(byKey[key], chain, a, b - a, outBase);
    if (!exists(`${outBase}.jpg`))
      await ff(['-ss', String(a), '-i', byKey[key], '-frames:v', '1', '-vf', chain.join(','), '-q:v', '4', `${outBase}.jpg`]);
    const lp = await probe(`${outBase}.mp4`);
    index.clips[name] = {
      source: key,
      start: a,
      end: b,
      mp4: `/media/loops/${name}.mp4`,
      webm: `/media/loops/${name}.webm`,
      poster: `/media/loops/${name}.jpg`,
      width: lp.width,
      height: lp.height,
      blurDataURL: await blurDataURL(`${outBase}.jpg`),
    };
  }
  log(`clips: ${Object.keys(CLIPS).join(', ')}`);
}

/* --------------------------------------------------------------- stills --- */
/** Gallery frames for case studies built from video. 4 evenly spaced, end cards skipped. */
const STILL_SOURCES = [
  'reel-08',
  'reel-14',
  'reel-16',
  'reel-17',
  'reel-19',
  'reel-24',
  'reel-25',
  'reel-28',
  'hl-work-03',
  'hl-work-04',
  'hl-work-05',
  'hl-work-07',
  'hl-work-08',
  'hl-work-09',
  'hl-work-10',
  'hl-work-11',
  'hl-bts-05',
  'hl-bts-07',
];
/** Specific named frames. */
const NAMED_STILLS = {
  'still-cardinals': ['reel-23', 25.6], // "Home Sweet Home" Cardinals athlete shoot
  'still-tunnel': ['reel-23', 15.4], // tunnel performance
  'still-helmet': ['reel-23', 59.6], // helmet close-up
};
async function grabFrame(file, key, t, out) {
  const chain = [...fixChain(key)];
  await ff(['-ss', String(t), '-i', file, '-frames:v', '1', ...(chain.length ? ['-vf', chain.join(',')] : []), out]);
}
async function stageStills(vids, index) {
  const byKey = Object.fromEntries(vids.map((v) => [v.key, v.file]));
  const dir = path.join(FULL_OUT, 'stills');
  await fs.mkdir(dir, { recursive: true });
  index.stills ||= {};
  await pool(STILL_SOURCES, CPU, async (key) => {
    const p = await probe(byKey[key]);
    const keys = [];
    for (const [i, frac] of [0.12, 0.34, 0.56, 0.74].entries()) {
      let t = p.duration * frac;
      const png = path.join(dir, `${key}-g${i + 1}.png`);
      if (!exists(png)) {
        // Nudge forward past near-black frames (fades, cuts to black).
        for (let tries = 0; tries < 5; tries++) {
          await grabFrame(byKey[key], key, t, png);
          const { channels } = await sharp(png).stats();
          if (channels.slice(0, 3).reduce((s, c) => s + c.mean, 0) / 3 > 28) break;
          t += 1.3;
        }
      }
      const id = `${key}-g${i + 1}`;
      // Gallery frames only need 640/1280.
      index.images[id] = await processImageWidths(id, png, [640, 1280], { source: `${key} @ ${t.toFixed(1)}s` });
      keys.push(id);
    }
    index.stills[key] = keys;
  });
  for (const [name, [key, t]] of Object.entries(NAMED_STILLS)) {
    const png = path.join(dir, `${name}.png`);
    if (!exists(png)) await grabFrame(byKey[key], key, t, png);
    index.images[name] = await processImageWidths(name, png, [640, 1280], { source: `${key} @ ${t}s` });
  }
  log(`stills: ${STILL_SOURCES.length} videos × 4 + ${Object.keys(NAMED_STILLS).length} named`);
}
async function processImageWidths(key, input, widths, extra) {
  const meta = await sharp(input).metadata();
  const ws = widths.filter((w) => w <= meta.width);
  if (!ws.length) ws.push(meta.width);
  for (const w of ws) {
    const avif = path.join(OUT, 'img', `${key}-${w}.avif`);
    const webp = path.join(OUT, 'img', `${key}-${w}.webp`);
    if (!exists(avif)) await sharp(input).resize(w).avif({ quality: 48, effort: 4 }).toFile(avif);
    if (!exists(webp)) await sharp(input).resize(w).webp({ quality: 70 }).toFile(webp);
  }
  return {
    src: `/media/img/${key}`,
    widths: ws,
    width: meta.width,
    height: meta.height,
    aspect: +(meta.width / meta.height).toFixed(4),
    blurDataURL: await blurDataURL(input),
    ...extra,
  };
}

/* ----------------------------------------------------------------- cuts --- */
/** Hard-cut timestamps inside each loop (drives the sports wall "camera flash"). */
async function stageCuts(index) {
  const keys = Object.keys(index.videos).filter((k) => index.videos[k].loop);
  await pool(keys, CPU, async (key) => {
    const file = path.join(OUT, 'loops', `${key}.mp4`);
    const { stdout } = await ff([
      '-i',
      file,
      '-an',
      '-vf',
      "scale=160:-2,select='gt(scene,0.32)',metadata=print:file=-",
      '-f',
      'null',
      '-',
    ]);
    const cuts = [...stdout.matchAll(/pts_time:([\d.]+)/g)].map((m) => +(+m[1]).toFixed(2)).filter((t) => t > 0.15);
    index.videos[key].loop.cuts = cuts;
  });
  log(`cuts: ${keys.length} loops`);
}

/* ----------------------------------------------------------------- hero --- */
async function concatSegments(inputs, segments, chainFor, outFile, codecArgs) {
  if (exists(outFile)) return;
  const fileIdx = new Map();
  const argv = [];
  for (const [key] of segments)
    if (!fileIdx.has(key)) {
      fileIdx.set(key, fileIdx.size);
      argv.push('-i', inputs[key]);
    }
  const parts = segments.map(
    ([key, a, b], i) =>
      `[${fileIdx.get(key)}:v]trim=start=${a}:end=${b},setpts=PTS-STARTPTS,${chainFor(key)},fps=24,format=yuv420p,setsar=1[s${i}]`,
  );
  const fc = `${parts.join(';')};${segments.map((_, i) => `[s${i}]`).join('')}concat=n=${segments.length}:v=1:a=0[out]`;
  await ff([...argv, '-filter_complex', fc, '-map', '[out]', '-an', ...codecArgs, outFile]);
}

async function stageHero(vids, index) {
  const dir = path.join(OUT, 'hero');
  await fs.mkdir(dir, { recursive: true });
  const byKey = Object.fromEntries(vids.map((v) => [v.key, v.file]));
  const segs = HERO_SEGMENTS.map(([a, b]) => ['reel-23', a, b]);
  const total = HERO_SEGMENTS.reduce((s, [a, b]) => s + (b - a), 0);
  log(`hero: ${total.toFixed(1)}s from reel-23 (${HERO_SEGMENTS.length} shots)`);
  // The showreel source is 1276x718, so the large hero is native 1280w (no upscale to 1920).
  const variants = [
    { name: 'hero-1280', scale: 'scale=1280:720:flags=lanczos', maxBytes: 4 * 1024 * 1024 },
    { name: 'hero-960', scale: 'scale=960:540:flags=lanczos', maxBytes: 1.5 * 1024 * 1024 },
  ];
  index.hero = { desktop: {}, mobile: {} };
  for (const v of variants) {
    const kbps = Math.floor(((v.maxBytes * 8) / total / 1000) * 0.9);
    for (const [ext, codec] of [
      [
        'mp4',
        [
          '-c:v',
          'libx264',
          '-preset',
          'slow',
          '-crf',
          '23',
          '-maxrate',
          `${kbps}k`,
          '-bufsize',
          `${kbps * 2}k`,
          '-profile:v',
          'high',
          '-movflags',
          '+faststart',
        ],
      ],
      [
        'webm',
        [
          '-c:v',
          'libvpx-vp9',
          '-crf',
          '33',
          '-b:v',
          `${Math.floor(kbps * 0.85)}k`,
          '-maxrate',
          `${kbps}k`,
          '-row-mt',
          '1',
          '-deadline',
          'good',
          '-cpu-used',
          '2',
        ],
      ],
    ]) {
      const out = path.join(dir, `${v.name}.${ext}`);
      await concatSegments(byKey, segs, () => v.scale, out, codec);
      index.hero.desktop[`${v.name}.${ext}`] = { src: `/media/hero/${v.name}.${ext}`, bytes: await size(out) };
    }
  }
  // Mobile 9:16 hero: landscape sources are centre-cropped to 9:16 after rotation.
  const mobileChain = (key) => {
    const chain = fixChain(key);
    const f = FIX[key];
    // Landscape sources (rotated football clips, the 2024 reel) are centre-cropped to 9:16.
    if (f?.transpose || key === 'reel-23') chain.push('crop=ih*9/16:ih');
    chain.push('scale=540:960:flags=lanczos');
    return chain.join(',');
  };
  const mTotal = MOBILE_HERO_SEGMENTS.reduce((s, [, a, b]) => s + (b - a), 0);
  const mMax = 1.5 * 1024 * 1024;
  const mk = Math.floor(((mMax * 8) / mTotal / 1000) * 0.9);
  for (const [ext, codec] of [
    [
      'mp4',
      [
        '-c:v',
        'libx264',
        '-preset',
        'slow',
        '-crf',
        '24',
        '-maxrate',
        `${mk}k`,
        '-bufsize',
        `${mk * 2}k`,
        '-profile:v',
        'high',
        '-movflags',
        '+faststart',
      ],
    ],
    [
      'webm',
      [
        '-c:v',
        'libvpx-vp9',
        '-crf',
        '34',
        '-b:v',
        `${Math.floor(mk * 0.85)}k`,
        '-maxrate',
        `${mk}k`,
        '-row-mt',
        '1',
        '-deadline',
        'good',
        '-cpu-used',
        '2',
      ],
    ],
  ]) {
    const out = path.join(dir, `hero-mobile.${ext}`);
    await concatSegments(byKey, MOBILE_HERO_SEGMENTS, mobileChain, out, codec);
    index.hero.mobile[`hero-mobile.${ext}`] = { src: `/media/hero/hero-mobile.${ext}`, bytes: await size(out) };
  }
  // Posters = first frame of each loop (LCP element), as AVIF/WebP + JPG.
  for (const [name, src] of [
    ['hero-poster', 'hero-1280.mp4'],
    ['hero-mobile-poster', 'hero-mobile.mp4'],
  ]) {
    const png = path.join(FULL_OUT, `${name}.png`);
    await fs.mkdir(FULL_OUT, { recursive: true });
    if (!exists(png)) await ff(['-i', path.join(dir, src), '-frames:v', '1', png]);
    index.images[name] = await processImage(name, png, { source: `hero/${src} frame 0` });
  }
  index.hero.segments = HERO_SEGMENTS;
  index.hero.mobileSegments = MOBILE_HERO_SEGMENTS;
  index.hero.duration = +total.toFixed(2);
  index.hero.mobileDuration = +mTotal.toFixed(2);
}

/* ----------------------------------------------------------------- full --- */
/** Full-length transcodes. The 2024 reel ships in /public; the rest go to Vercel Blob. */
const PUBLIC_FULL = new Set(['reel-23']);
async function stageFull(vids, index) {
  await fs.mkdir(FULL_OUT, { recursive: true });
  await fs.mkdir(path.join(OUT, 'full'), { recursive: true });
  log(`full: ${vids.length} clips (H.264 + VP9, max 1080 long edge)`);
  await pool(vids, 2, async (v) => {
    const p = await probe(v.file);
    const { w, h } = fixedDims(v.key, p.width, p.height);
    const chain = [...fixChain(v.key)];
    if (Math.max(w, h) > 1080) chain.push(w >= h ? 'scale=1080:-2:flags=lanczos' : 'scale=-2:1080:flags=lanczos');
    chain.push('format=yuv420p');
    // Public cuts ship MP4 only (budget); their WebM goes to Blob with everything else.
    const isPub = PUBLIC_FULL.has(v.key);
    const mp4 = path.join(isPub ? path.join(OUT, 'full') : FULL_OUT, `${v.key}.mp4`);
    const webm = path.join(FULL_OUT, `${v.key}.webm`);
    const crf = isPub ? '25' : '23';
    const audio = ['-c:a', 'aac', '-b:a', '128k'];
    if (!exists(mp4))
      await ff([
        '-i',
        v.file,
        '-vf',
        chain.join(','),
        '-c:v',
        'libx264',
        '-crf',
        crf,
        '-preset',
        'slow',
        '-movflags',
        '+faststart',
        '-pix_fmt',
        'yuv420p',
        ...audio,
        mp4,
      ]);
    if (!exists(webm))
      await ff([
        '-i',
        v.file,
        '-vf',
        chain.join(','),
        '-c:v',
        'libvpx-vp9',
        '-crf',
        '33',
        '-b:v',
        '0',
        '-row-mt',
        '1',
        '-deadline',
        'good',
        '-cpu-used',
        '3',
        '-c:a',
        'libopus',
        '-b:a',
        '96k',
        webm,
      ]);
    const fp = await probe(mp4);
    const isPublic = PUBLIC_FULL.has(v.key);
    index.videos[v.key] = {
      ...(index.videos[v.key] || {}),
      full: {
        // Public files are served from /media/full. Blob files resolve through
        // NEXT_PUBLIC_MEDIA_BLOB_BASE (see src/lib/media.ts) once uploaded.
        location: isPublic ? 'public' : 'blob',
        mp4: isPublic ? `/media/full/${v.key}.mp4` : `${v.key}.mp4`,
        webm: isPublic ? null : `${v.key}.webm`, // public cuts: MP4 only
        width: fp.width,
        height: fp.height,
        duration: +fp.duration.toFixed(2),
        bytes: { mp4: await size(mp4), webm: await size(webm) },
      },
    };
    log(
      `  full ${v.key} ${fp.width}x${fp.height} ${(index.videos[v.key].full.bytes.mp4 / 1048576).toFixed(1)}MB → ${isPublic ? 'public' : 'media-full/'}`,
    );
  });
}

/* ---------------------------------------------------------------- index --- */
async function dirSize(d) {
  let total = 0;
  for (const e of await fs.readdir(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    total += e.isDirectory() ? await dirSize(p) : (await fs.stat(p)).size;
  }
  return total;
}

async function main() {
  const t0 = Date.now();
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(FULL_OUT, { recursive: true });
  await fs.mkdir(path.dirname(INDEX), { recursive: true });
  const index = existsSync(INDEX) ? JSON.parse(await fs.readFile(INDEX, 'utf8')) : {};
  index.images ||= {};
  index.videos ||= {};
  const { vids, imgs } = await inventory();
  if (STAGES.has('images')) await stageImages(imgs, index);
  if (STAGES.has('logo')) await stageLogo();
  if (STAGES.has('textures')) await stageTextures();
  if (STAGES.has('loops')) await stageLoops(vids, index);
  if (STAGES.has('clips')) await stageClips(vids, index);
  if (STAGES.has('stills')) await stageStills(vids, index);
  if (STAGES.has('cuts')) await stageCuts(index);
  if (STAGES.has('hero')) await stageHero(vids, index);
  if (STAGES.has('full')) await stageFull(vids, index);
  if (STAGES.has('index')) {
    const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
    index.images = sorted(index.images);
    index.videos = sorted(index.videos);
    index.generatedAt = new Date().toISOString();
    index.publicBytes = await dirSize(OUT);
    await fs.writeFile(INDEX, JSON.stringify(index, null, 1));
    log(`index → ${rel(INDEX)}; public/media = ${(index.publicBytes / 1048576).toFixed(1)} MB`);
    if (index.publicBytes > 120 * 1048576) log('WARNING: public/media exceeds the 120 MB budget');
  }
  log(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
