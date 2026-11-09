#!/usr/bin/env node
/**
 * Cross-device audit: scrolls every page top to bottom on several device profiles,
 * screenshots each viewport, and reports console/page errors, failed requests,
 * broken images/videos, horizontal overflow, and elements wider than the screen.
 *
 *   node scripts/audit.mjs [baseUrl]      → qa/audit/<device>/*.png + qa/audit/report.json
 */
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';

const { chromium, devices } = createRequire(import.meta.url)('playwright');
const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = 'qa/audit';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROFILES = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 } },
  { name: 'laptop-1280', viewport: { width: 1280, height: 720 } },
  { name: 'tablet-ipad-pro', ...devices['iPad Pro 11'] },
  { name: 'iphone-13', ...devices['iPhone 13'] },
  { name: 'iphone-se-375', ...devices['iPhone 13 Mini'], viewport: { width: 360, height: 640 } },
  { name: 'pixel-7', ...devices['Pixel 7'] },
];
const PAGES = ['/', '/work/collegebound-scholars-luncheon', '/work/paco-panama', '/work/378-coaching'];

async function scrollTo(page, y) {
  await page.evaluate((y) => {
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
    window.scrollTo(0, y);
  }, y);
}

const report = {};
const browser = await chromium.launch();
for (const prof of PROFILES) {
  const { name, ...ctxOpts } = prof;
  const ctx = await browser.newContext({ ...ctxOpts, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const issues = [];
  page.on('pageerror', (e) => issues.push({ type: 'pageerror', msg: String(e).slice(0, 300) }));
  page.on('console', (m) => m.type() === 'error' && issues.push({ type: 'console', msg: m.text().slice(0, 300) }));
  page.on('response', (r) => r.status() >= 400 && issues.push({ type: 'http', msg: `${r.status()} ${r.url()}` }));
  page.on('requestfailed', (r) => {
    const f = r.failure()?.errorText || '';
    if (!/ERR_ABORTED/.test(f)) issues.push({ type: 'requestfailed', msg: `${f} ${r.url()}` });
  });
  await fs.mkdir(`${OUT}/${name}`, { recursive: true });

  for (const path of PAGES) {
    const slug = path === '/' ? 'home' : path.split('/').pop();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await sleep(path === '/' ? 2600 : 1500);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = ctxOpts.viewport.height;
    let n = 0;
    for (let y = 0; y < H; y += Math.round(vh * 0.85)) {
      await scrollTo(page, y);
      await sleep(path === '/' ? 900 : 600);
      // Horizontal overflow + offenders at this scroll position
      const ov = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const out = [];
        for (const el of document.querySelectorAll('main *')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) continue;
          if (r.right > vw + 2 || r.left < -2) {
            // ignore things inside intentional horizontal scrollers / clipped containers
            let p = el.parentElement, clipped = false;
            while (p && p !== document.body) {
              const cs = getComputedStyle(p);
              if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 2 && pr.left >= -2) { clipped = true; break; } }
              p = p.parentElement;
            }
            if (!clipped) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} [${Math.round(r.left)}→${Math.round(r.right)}] "${(el.textContent || '').trim().slice(0, 40)}"`);
          }
        }
        return { pageOverflow: document.documentElement.scrollWidth - vw, offenders: [...new Set(out)].slice(0, 6) };
      });
      if (ov.pageOverflow > 1 || ov.offenders.length) issues.push({ type: 'overflow', msg: `${path} y=${y} pageOverflow=${ov.pageOverflow}`, offenders: ov.offenders });
      await page.screenshot({ path: `${OUT}/${name}/${slug}-${String(n++).padStart(2, '0')}.png` });
    }
    // Media health after scrolling the whole page
    const media = await page.evaluate(() => ({
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc.split('/').pop()),
      videoErrors: [...document.querySelectorAll('video')].filter((v) => v.error).map((v) => `${v.currentSrc.split('/').pop()} code=${v.error.code}`),
      videosWithSrc: [...document.querySelectorAll('video')].filter((v) => v.currentSrc).length,
      videosPlayed: [...document.querySelectorAll('video')].filter((v) => v.currentTime > 0).length,
    }));
    if (media.brokenImgs.length) issues.push({ type: 'img', msg: `${path}: ${media.brokenImgs.join(', ')}` });
    if (media.videoErrors.length) issues.push({ type: 'video', msg: `${path}: ${media.videoErrors.join(', ')}` });
    report[`${name} ${path}`] = media;
  }
  report[name] = issues;
  console.log(`${name}: ${issues.length} issue(s)`);
  for (const i of issues.slice(0, 25)) console.log('  -', i.type, i.msg, i.offenders ? '\n      ' + i.offenders.join('\n      ') : '');
  await ctx.close();
}
await fs.writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 1));
await browser.close();
