#!/usr/bin/env node
/**
 * Derives src/content/media.client.json — the slim index client components import
 * (videos, clips, hero sources, still-poster URLs). Images and their blur
 * placeholders stay server-side in media.json and reach the browser as rendered HTML.
 * Runs automatically at the end of prepare-media and before `next build`.
 */
import fs from 'node:fs';
const m = JSON.parse(fs.readFileSync('src/content/media.json', 'utf8'));
const videos = {};
for (const [k, v] of Object.entries(m.videos)) {
  videos[k] = {
    orientation: v.orientation,
    aspect: v.aspect,
    duration: v.duration,
    loop: v.loop && {
      mp4: v.loop.mp4,
      webm: v.loop.webm,
      poster: v.loop.poster,
      width: v.loop.width,
      height: v.loop.height,
      blurDataURL: v.loop.blurDataURL,
      cuts: v.loop.cuts || [],
    },
    ...(v.full
      ? {
          full: {
            location: v.full.location,
            mp4: v.full.mp4,
            webm: v.full.webm,
            width: v.full.width,
            height: v.full.height,
            duration: v.full.duration,
          },
        }
      : {}),
  };
}
const clips = Object.fromEntries(
  Object.entries(m.clips || {}).map(([k, c]) => [
    k,
    { mp4: c.mp4, webm: c.webm, poster: c.poster, width: c.width, height: c.height, blurDataURL: c.blurDataURL },
  ]),
);
const posters = {};
for (const [k, i] of Object.entries(m.images))
  if (k.endsWith('-still') || k.startsWith('hero')) posters[k] = `${i.src}-${i.widths.find((w) => w >= 1280) ?? i.widths.at(-1)}.webp`;
const hero = {
  desktop: Object.fromEntries(Object.entries(m.hero.desktop).map(([k, v]) => [k, v.src])),
  mobile: Object.fromEntries(Object.entries(m.hero.mobile).map(([k, v]) => [k, v.src])),
};
const out = { videos, clips, posters, hero };
fs.writeFileSync('src/content/media.client.json', JSON.stringify(out));
console.log('[media] media.client.json', (JSON.stringify(out).length / 1024).toFixed(1), 'KB');
