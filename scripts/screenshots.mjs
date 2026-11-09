#!/usr/bin/env node
/**
 * QA screenshots: every section at 1440×900 and 390×844, plus case studies.
 *   npm run build && npm start   (in another terminal)
 *   node scripts/screenshots.mjs [baseUrl]
 * Output: qa/screens/<viewport>/NN-<section>.png
 */
import { createRequire } from 'node:module';
// Uses the project's playwright if installed, else the globally installed one.
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs/promises';

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = 'qa/screens';
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrollTo(page, y) {
  await page.evaluate((y) => {
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
    window.scrollTo(0, y);
  }, y);
}

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const dir = `${OUT}/${vp.name}`;
  await fs.mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: !!vp.isMobile,
    hasTouch: !!vp.hasTouch,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${dir}/00-preloader.png` });
  await sleep(2600);
  await page.screenshot({ path: `${dir}/01-hero.png` });

  const sections = await page.evaluate(() =>
    [...document.querySelectorAll('main > section, main > div > .pin-spacer > section, main > .pin-spacer > section, main > div[data-channel], main > footer')].map(
      (el, i) => ({
        i,
        name: (el.getAttribute('data-segment') || el.id || el.tagName).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        top: el.getBoundingClientRect().top + window.scrollY,
        height: el.getBoundingClientRect().height,
      }),
    ),
  );
  let n = 2;
  for (const s of sections.slice(1)) {
    const shots = s.height > vp.height * 1.6 ? [0, Math.min(s.height - vp.height, vp.height * 0.9), s.height - vp.height] : [0];
    for (const [k, off] of shots.entries()) {
      await scrollTo(page, Math.max(0, s.top + off));
      await sleep(1500);
      await page.screenshot({ path: `${dir}/${String(n).padStart(2, '0')}-${s.name}${shots.length > 1 ? `-${k + 1}` : ''}.png` });
      n++;
    }
  }
  // Interactions: hover a division, a work tile, a sports slat (desktop only)
  if (vp.name === 'desktop') {
    for (const [sel, name] of [
      ['[aria-label^="CULTURE SHOCK CREATIVE"]', 'hover-division'],
      ['a[aria-label^="Routes like Tyreek"]', 'hover-sports'],
      ['a[href="/work/paco-panama"]', 'hover-work'],
    ]) {
      const el = page.locator(sel).first();
      if (await el.count()) {
        await el.scrollIntoViewIfNeeded();
        await scrollTo(page, await el.evaluate((e) => e.getBoundingClientRect().top + window.scrollY - 120));
        await sleep(600);
        await el.hover();
        await sleep(1400);
        await page.screenshot({ path: `${dir}/${String(n++).padStart(2, '0')}-${name}.png` });
      }
    }
  }
  for (const slug of ['collegebound-scholars-luncheon', 'paco-panama', '378-coaching']) {
    await page.goto(`${BASE}/work/${slug}`, { waitUntil: 'networkidle' });
    await sleep(1800);
    await page.screenshot({ path: `${dir}/case-${slug}-1.png` });
    await scrollTo(page, vp.height * 1.05);
    await sleep(1200);
    await page.screenshot({ path: `${dir}/case-${slug}-2.png` });
    await scrollTo(page, vp.height * 2.2);
    await sleep(1200);
    await page.screenshot({ path: `${dir}/case-${slug}-3.png` });
  }
  console.log(vp.name, 'shots done', errors.length ? `\nERRORS:\n${[...new Set(errors)].join('\n')}` : '(no console errors)');
  await ctx.close();
}
await browser.close();
