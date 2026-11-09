'use client';
import { useEffect, useRef, useState } from 'react';
import map from '@/content/us-map.json';
import { travel } from '@/content/travel';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/bus';
import { LoopVideo } from '../media/LoopVideo';

type CityId = (typeof travel)[number]['id'];
const cities = map.cities as unknown as Record<string, { label: string; sub?: string; xy: [number, number] }>;

function arc([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lift = Math.hypot(dx, dy) * 0.45;
  // control point lifted "north" of the midpoint, like a flight path
  const nx = -dy / Math.hypot(dx, dy);
  const ny = dx / Math.hypot(dx, dy);
  const s = ny > 0 ? -1 : 1;
  return `M${x1} ${y1} Q${mx + nx * lift * s} ${my + ny * lift * s} ${x2} ${y2}`;
}

export function TravelMap({ background }: { background?: React.ReactNode }) {
  const [hot, setHot] = useState<CityId | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const home = cities.dmv.xy;

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const arcs = el.querySelectorAll<SVGPathElement>('[data-arc]');
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      arcs.forEach((a) => {
        const len = a.getTotalLength();
        gsap.set(a, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len });
      });
      gsap.to(arcs, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.inOut',
        stagger: 0.18,
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      });
      gsap.from(el.querySelectorAll('[data-city]'), {
        scale: 0,
        transformOrigin: 'center',
        duration: 0.5,
        ease: 'back.out(3)',
        stagger: 0.18,
        delay: 1,
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const active = travel.find((t) => t.id === hot);

  return (
    <section
      data-channel="5"
      data-segment="AVAILABLE FOR TRAVEL"
      aria-labelledby="travel-title"
      className="relative isolate overflow-hidden bg-black px-[var(--gutter)] py-[clamp(100px,12vw,170px)]"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        {background}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,5,.55),#050505_80%)]" />
      </div>

      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mono mb-3 text-[12px] text-gold">📍 DMV | AVAILABLE FOR TRAVEL</p>
            <h2 id="travel-title" className="display distress text-[clamp(56px,9vw,140px)]">
              <span className="text-paper">THE WORK IS </span>
              <span className="text-gold">TAKING US PLACES.</span>
            </h2>
          </div>
          <p className="max-w-[36ch] text-[15px] leading-relaxed text-paper/70">
            Home base in the DMV. Different city, same goal: create something worth watching. ⚡
          </p>
        </header>

        <div className="relative">
          <svg
            ref={svg}
            viewBox="430 70 545 400"
            className="h-auto w-full"
            role="img"
            aria-label="Map of the United States: flight paths from the DMV to Chicago, Milwaukee, Atlanta and New York"
          >
            <path d={map.nation} fill="rgba(245,243,238,.035)" stroke="rgba(245,243,238,.28)" strokeWidth="1" />
            <path d={map.states} fill="none" stroke="rgba(245,243,238,.08)" strokeWidth=".6" />
            {travel.map((t) => (
              <path
                key={t.id}
                data-arc
                d={arc(home, cities[t.id].xy)}
                fill="none"
                stroke={hot === t.id ? 'var(--gold-hot)' : 'var(--shock-gold)'}
                strokeWidth={hot === t.id ? 2.6 : 1.6}
                strokeLinecap="round"
                style={{ filter: hot === t.id ? 'drop-shadow(0 0 6px rgba(255,201,60,.9))' : undefined, transition: 'stroke-width .3s' }}
              />
            ))}
            {/* home base */}
            <g transform={`translate(${home[0]} ${home[1]})`}>
              <circle
                r="22"
                fill="var(--shock-gold)"
                opacity=".18"
                className="motion-safe:animate-[pulse-ring_2s_ease-out_infinite]"
                style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
              />
              <circle r="7" fill="var(--shock-gold)" />
              <text x="12" y="26" className="mono" fontSize="11" fill="var(--paper)">
                DMV — HOME BASE
              </text>
            </g>
            {travel.map((t) => {
              const [x, y] = cities[t.id].xy;
              const on = hot === t.id;
              return (
                <g
                  key={t.id}
                  data-city
                  transform={`translate(${x} ${y})`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${cities[t.id].label}: play clip`}
                  aria-pressed={on}
                  onPointerEnter={() => setHot(t.id)}
                  onFocus={() => setHot(t.id)}
                  onClick={() => setHot(t.id)}
                  className="cursor-pointer outline-none"
                  data-cursor="play"
                >
                  <circle r="16" fill="transparent" />
                  <circle r={on ? 7 : 5} fill={on ? 'var(--gold-hot)' : 'var(--paper)'} stroke="#050505" strokeWidth="2" />
                  <text
                    x={t.id === 'nyc' ? 10 : -10}
                    y={-12}
                    textAnchor={t.id === 'nyc' ? 'start' : 'end'}
                    className="display-800"
                    fontSize="17"
                    fill={on ? 'var(--gold-hot)' : 'var(--paper)'}
                  >
                    {cities[t.id].label.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* clip monitor */}
          <div
            className={`pointer-events-none absolute bottom-[4%] left-[2%] w-[min(38%,360px)] transition-all duration-500 max-md:static max-md:mt-6 max-md:w-full ${active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 max-md:hidden'}`}
            aria-live="polite"
          >
            {travel.map((t) => (
              <div key={t.id} className={hot === t.id ? 'block' : 'hidden'}>
                <div className="relative aspect-video overflow-hidden rounded-[3px] border border-gold/60 bg-ink shadow-[0_30px_80px_rgba(0,0,0,.7)]">
                  <LoopVideo
                    k={t.clip}
                    label={`${cities[t.id].label} clip`}
                    mode="controlled"
                    active={hot === t.id}
                    className="cover-media"
                  />
                  <span className="mono absolute left-2 top-2 rounded-sm bg-black/70 px-2 py-0.5 text-[10px] text-gold">
                    ● {cities[t.id].label.toUpperCase()}
                  </span>
                </div>
                <p className="mt-3 text-[14px] leading-snug text-paper/80">{t.note}</p>
              </div>
            ))}
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap gap-2 md:hidden">
          {travel.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={hot === t.id}
                onClick={() => setHot(t.id)}
                className={`mono rounded-full border px-4 py-2 text-[12px] ${hot === t.id ? 'border-gold bg-gold text-black' : 'border-paper/25'}`}
              >
                {cities[t.id].label.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <style>{`@keyframes pulse-ring{0%{transform:scale(.4);opacity:.6}100%{transform:scale(2.2);opacity:0}}`}</style>
    </section>
  );
}
