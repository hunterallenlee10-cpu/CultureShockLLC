'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sportsHeader, sportsReplay, sportsWall } from '@/content/sports';
import { gsap } from '@/lib/gsap';
import { cmedia } from '@/lib/media-client';
import { prefersReducedMotion } from '@/lib/bus';
import { LoopVideo } from '../media/LoopVideo';
import { BoltRule } from '../brand/Bolt';
import { Corners } from '../brand/Corners';

/** The hand-drawn play from hl-sports-01: X's, O's and a route arrow, drawn on scroll. */
function PlayDiagram() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGGeometryElement>('[data-draw]');
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.to(paths, {
        strokeDashoffset: 0,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: svg, start: 'top 85%', end: 'bottom 40%', scrub: 0.5 },
      });
    }, svg);
    return () => ctx.revert();
  }, []);
  const X = (x: number, y: number) => `M${x - 7} ${y - 7} L${x + 7} ${y + 7} M${x + 7} ${y - 7} L${x - 7} ${y + 7}`;
  const O = (x: number, y: number) => `M${x + 8} ${y} a8 8 0 1 0 -16 0 a8 8 0 1 0 16 0`;
  return (
    <svg
      ref={ref}
      viewBox="0 0 220 120"
      className="h-auto w-[min(70vw,300px)] text-gold"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {[
        [30, 22],
        [58, 18],
        [92, 26],
        [120, 50],
        [150, 52],
      ].map(([x, y], i) => (
        <path key={`x${i}`} data-draw d={X(x, y)} />
      ))}
      {[
        [24, 60],
        [52, 56],
        [80, 62],
        [52, 92],
      ].map(([x, y], i) => (
        <path key={`o${i}`} data-draw d={O(x, y)} />
      ))}
      <path data-draw d="M90 62 C 104 58, 112 44, 136 34 S 170 20, 192 8" />
      <path data-draw d="M180 6 L193 7 L188 19" />
    </svg>
  );
}

function WallSlat({ item, on, dim, onEnter }: { item: (typeof sportsWall)[number]; on: boolean; dim: boolean; onEnter: () => void }) {
  const flash = useRef<HTMLDivElement>(null);
  const prev = useRef(0);
  const cuts = useMemo(() => cmedia.videos[item.key]?.loop.cuts ?? [], [item.key]);
  const onFrame = useCallback(
    (t: number) => {
      const p = prev.current;
      const hit = t < p || cuts.some((c) => c > p && c <= t);
      prev.current = t;
      if (hit && flash.current && !prefersReducedMotion()) {
        gsap.fromTo(flash.current, { opacity: 0.85 }, { opacity: 0, duration: 0.16, ease: 'power2.out' });
      }
    },
    [cuts],
  );
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={onEnter}
      onFocus={onEnter}
      data-cursor="play"
      aria-label={`${item.chip} — watch on Instagram`}
      className="group relative block min-w-0 overflow-hidden rounded-[3px] bg-ink transition-[flex-grow,filter] duration-700 ease-[var(--ease-shock)] max-md:aspect-[9/14] max-md:w-[64vw] max-md:shrink-0 max-md:snap-center md:[flex:var(--grow)_1_0%]"
      style={{ ['--grow' as string]: on ? 3.4 : 1, filter: dim ? 'brightness(.42) saturate(.6)' : 'none' }}
    >
      <LoopVideo
        k={item.key}
        label={`High school football highlight: ${item.chip}`}
        group="sports"
        onFrame={onFrame}
        className="cover-media"
      />
      <div ref={flash} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0 mix-blend-screen" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <span className="display-800 absolute bottom-4 left-4 rounded-sm bg-gold px-2.5 py-1 text-[15px] tracking-[0.04em] text-black md:text-[17px]">
        {item.chip}
      </span>
    </a>
  );
}

export function Sports() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section
      id="ch-sports"
      data-channel="4"
      data-channel-start="4"
      data-segment="CINEMATIC HIGHLIGHTS"
      aria-labelledby="sports-title"
      className="relative overflow-hidden bg-black pb-[clamp(90px,12vw,160px)]"
    >
      {/* stadium lights */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[90vh]">
        <div className="absolute left-[12%] top-[-20%] h-[90%] w-[34%] rotate-[18deg] bg-[radial-gradient(ellipse_at_top,rgba(255,250,230,.16),transparent_65%)] motion-safe:animate-[flick_6s_infinite]" />
        <div className="absolute right-[12%] top-[-20%] h-[90%] w-[34%] -rotate-[18deg] bg-[radial-gradient(ellipse_at_top,rgba(255,250,230,.14),transparent_65%)] motion-safe:animate-[flick_7.3s_infinite]" />
        <style>{`@keyframes flick{0%,100%{opacity:1}47%{opacity:1}48%{opacity:.55}49%{opacity:1}72%{opacity:.85}}`}</style>
      </div>
      <Corners br={false} size="clamp(140px, 22vw, 360px)" className="opacity-80" />

      <header className="relative flex flex-col items-center px-[var(--gutter)] pt-[clamp(110px,14vw,190px)] text-center">
        <p className="mono mb-4 text-[12px] text-gold">CH 04 · SPORTS</p>
        <h2 id="sports-title" className="display distress">
          <span className="block text-[clamp(70px,13vw,210px)] text-paper">{sportsHeader.title}</span>
          <span className="block text-[clamp(44px,8vw,128px)] text-gold">{sportsHeader.subtitle.join(' ')}</span>
        </h2>
        <div className="my-8">
          <PlayDiagram />
        </div>
        <BoltRule className="max-w-[420px]" />
        <p className="tag mt-6 text-[clamp(18px,2vw,26px)] tracking-[0.16em]">
          <span className="text-paper">{sportsHeader.lines[0]}</span> <span className="text-gold">{sportsHeader.lines[1]}</span>
        </p>
        <p className="tag mt-4 flex flex-wrap justify-center gap-x-4 text-[12px] text-paper/70 md:text-[13px]">
          {sportsHeader.values.map((v, i) => (
            <span key={v} className="flex items-center gap-4">
              {i > 0 && <span className="text-gold">•</span>}
              {v}
            </span>
          ))}
        </p>
      </header>

      {/* The wall */}
      <div
        className="relative mt-[clamp(50px,7vw,90px)] flex gap-2 px-[var(--gutter)] max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:[scrollbar-width:none] md:h-[min(80vh,780px)]"
        onPointerLeave={() => setHover(null)}
        aria-label="Football highlight reels"
        role="list"
      >
        {sportsWall.map((item, i) => (
          <div role="listitem" key={item.key} className="contents">
            <WallSlat item={item} on={hover === i} dim={hover !== null && hover !== i} onEnter={() => setHover(i)} />
          </div>
        ))}
      </div>

      {/* Replay strip */}
      <div className="mt-6 px-[var(--gutter)]">
        <p className="mono mb-3 flex items-center gap-2 text-[11px] text-paper/60">
          <span className="text-[#ff4b4b]">●</span> REPLAY
        </p>
        <ul
          className="flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]"
          tabIndex={0}
          aria-label="More sports clips — scroll horizontally"
          data-cursor="drag"
        >
          {sportsReplay.map((r) => (
            <li
              key={r.key}
              className="relative aspect-video w-[min(62vw,340px)] shrink-0 snap-start overflow-hidden rounded-[3px] bg-ink"
              data-hover-scope
            >
              <LoopVideo k={r.key} label={`Sports clip: ${r.chip}`} mode="hover" group="strip" className="cover-media" />
              <span className="mono absolute bottom-2 left-2 rounded-sm bg-black/70 px-2 py-0.5 text-[10px] text-paper">{r.chip}</span>
              {r.href && (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                  aria-label={`${r.chip} on Instagram`}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
