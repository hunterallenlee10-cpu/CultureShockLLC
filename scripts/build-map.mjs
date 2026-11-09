#!/usr/bin/env node
/**
 * Builds the "Available for travel" map: a projected US outline (from us-atlas)
 * and the cities from their posts, written to src/content/us-map.json so the
 * site ships plain SVG path data and no mapping library.
 */
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { presimplify, simplify, quantile } from 'topojson-simplify';

const require = createRequire(import.meta.url);
const raw = require('us-atlas/states-10m.json');
const pre = presimplify(raw);
const us = simplify(pre, quantile(pre, 0.12));
const W = 975,
  H = 610;
const projection = geoAlbersUsa()
  .scale(1300)
  .translate([W / 2, H / 2]);
const path = geoPath(projection);
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1));

const nation = round(path(feature(us, us.objects.nation)));
const states = round(path(mesh(us, us.objects.states, (a, b) => a !== b)));
const cities = {
  dmv: { label: 'DMV', sub: 'Baltimore · DC · VA — home base', lonlat: [-76.85, 39.05] },
  chicago: { label: 'Chicago', lonlat: [-87.63, 41.88] },
  milwaukee: { label: 'Milwaukee', lonlat: [-87.91, 43.04] },
  atlanta: { label: 'Atlanta', lonlat: [-84.39, 33.75] },
  nyc: { label: 'New York', lonlat: [-74.0, 40.71] },
};
for (const c of Object.values(cities)) c.xy = projection(c.lonlat).map((n) => +n.toFixed(1));
await fs.writeFile('src/content/us-map.json', JSON.stringify({ width: W, height: H, nation, states, cities }));
console.log(
  'us-map.json',
  (JSON.stringify({ nation, states }).length / 1024).toFixed(0),
  'KB',
  Object.fromEntries(Object.entries(cities).map(([k, c]) => [k, c.xy])),
);
