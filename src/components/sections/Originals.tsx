'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { originals } from '@/content/originals';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { sfxStatic } from '@/lib/sfx';
import { cmedia, fullVideo } from '@/lib/media-client';
import { LoopVideo } from '../media/LoopVideo';
import { openPlayer } from '../media/FullscreenPlayer';
import { BrushReveal } from '../brand/BrushReveal';

const fmt = (n: number) => n.toLocaleString('en-US');
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 1 : 1).replace(/\.0$/, '')}K` : String(n));

export function Originals() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [noise, setNoise] = useState('');

  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 160;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const d = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
    setNoise(c.toDataURL());
  }, []);

  // Layout effect: the pin must be reverted before React removes the DOM on navigation.
  useLayoutEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const cards = [...tr.querySelectorAll<HTMLElement>('[data-ep]')];
    const pickActive = () => {
      const mid = window.innerWidth / 2;
      let best = 0;
      let bestD = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setActive((prev) => {
        if (prev !== best) sfxStatic(0.18, 0.06);
        return best;
      });
    };
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        // Measure from the tween (not the scroll) so the active set tracks the smoothed position.
        onUpdate: pickActive,
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
    // Mobile / reduced motion: native horizontal scroll with snap.
    const onScroll = () => pickActive();
    tr.parentElement?.addEventListener('scroll', onScroll, { passive: true });
    ScrollTrigger.refresh();
    return () => {
      mm.revert();
      tr.parentElement?.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="relative">
      <section
        ref={root}
        id="ch-originals"
        data-channel="2"
        data-channel-start="2"
        data-segment="NOW SHOWING"
        aria-labelledby="originals-title"
        className="relative isolate overflow-hidden bg-[#07040d] md:h-[100svh]"
        style={{ ['--static' as string]: noise ? `url(${noise})` : 'none' }}
      >
        {/* LED studio glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[10%] top-[10%] h-[80%] w-[60%] rounded-full bg-led-violet opacity-40 blur-[140px] motion-safe:animate-[ledA_9s_ease-in-out_infinite_alternate]" />
          <div className="absolute -right-[10%] bottom-[-10%] h-[80%] w-[60%] rounded-full bg-led-magenta opacity-35 blur-[150px] motion-safe:animate-[ledB_11s_ease-in-out_infinite_alternate]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#07040d_85%)]" />
          <style>{`@keyframes ledA{to{transform:translate(12%,8%) scale(1.15)}}@keyframes ledB{to{transform:translate(-10%,-6%) scale(1.1)}}`}</style>
        </div>

        <div className="flex h-full flex-col pt-[clamp(84px,11vh,120px)] pb-8 md:pb-[clamp(40px,6vh,70px)]">
          <header className="flex flex-wrap items-end justify-between gap-4 px-[var(--gutter)]">
            <BrushReveal stroke={false}>
              <p className="mono mb-2 text-[12px] text-[#ff7ad1]">CH 02 · CULTURE SHOCK MEDIA · ORIGINAL CONTENT</p>
              <h2 id="originals-title" className="display distress text-[clamp(48px,7.4vw,124px)]">
                <span className="text-paper">CULTURE SHOCK </span>
                <span className="bg-gradient-to-r from-[#b78bff] to-led-magenta bg-clip-text text-transparent">ORIGINALS</span>
              </h2>
            </BrushReveal>
            {/* TV-guide listing */}
            <ol className="mono hidden gap-1 text-[11px] lg:flex" aria-label="Episode guide">
              {originals.map((e, i) => (
                <li
                  key={e.slug}
                  className={`rounded-sm border px-2.5 py-1.5 transition-colors ${active === i ? 'border-led-magenta bg-led-magenta/20 text-paper' : 'border-paper/15 text-paper/50'}`}
                >
                  {e.ep} · {e.runtime}
                </li>
              ))}
            </ol>
          </header>

          <div
            className="mt-8 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:mt-[clamp(20px,4vh,48px)] md:overflow-visible max-md:snap-x max-md:snap-mandatory"
            tabIndex={0}
            aria-label="Originals episodes — scroll horizontally"
            data-cursor="drag"
          >
            <div
              ref={track}
              className="flex h-full w-max items-center gap-[clamp(40px,6vw,110px)] px-[var(--gutter)] will-change-transform"
            >
              {originals.map((e, i) => {
                const v = cmedia.videos[e.video];
                const full = fullVideo(e.video);
                const on = active === i;
                return (
                  <article
                    key={e.slug}
                    data-ep
                    className={`flex snap-center items-center gap-[clamp(20px,3vw,48px)] max-md:w-[86vw] max-md:flex-col max-md:items-start ${e.lead ? 'md:pr-6' : ''}`}
                  >
                    {/* CRT set */}
                    <div
                      className={`relative shrink-0 rounded-[28px] bg-gradient-to-b from-[#2a2630] to-[#121015] p-[14px] pb-[46px] shadow-[0_40px_80px_rgba(0,0,0,.6),inset_0_1px_0_rgba(255,255,255,.08)] transition-transform duration-700 ${on ? 'scale-100' : 'scale-[.92]'} ${e.lead ? 'h-[min(62vh,620px)] max-md:h-[64vh]' : 'h-[min(54vh,540px)] max-md:h-[60vh]'} aspect-[3/4.15]`}
                    >
                      <div className="relative h-full overflow-hidden rounded-[22px/30px] bg-black shadow-[inset_0_0_40px_rgba(0,0,0,.9)]">
                        {v && (
                          <LoopVideo
                            k={e.video}
                            label={`${e.title} — Culture Shock Original`}
                            mode="controlled"
                            active={on}
                            group="global"
                            className={`cover-media transition-[filter] duration-500 ${on ? '' : 'brightness-50 saturate-50'}`}
                          />
                        )}
                        {/* channel-flip static */}
                        <div
                          key={on ? `on-${i}` : `off-${i}`}
                          aria-hidden
                          className="pointer-events-none absolute inset-0 mix-blend-screen"
                          style={{
                            backgroundImage: 'var(--static)',
                            backgroundSize: '120px 160px',
                            imageRendering: 'pixelated',
                            animation: on ? 'crt-flip .45s steps(6) forwards' : 'none',
                            opacity: on ? undefined : 0,
                          }}
                        />
                        {/* curved glass */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-[22px/30px] bg-[radial-gradient(120%_90%_at_30%_15%,rgba(255,255,255,.16),transparent_40%)]"
                        />
                        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_30px_rgba(0,0,0,.55)]" />
                        <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-90" />
                        <div
                          aria-hidden
                          className="mono pointer-events-none absolute left-3 top-3 text-[11px] text-[#7dff9b] [text-shadow:0_0_6px_#2bff6a]"
                        >
                          CH 02-{String(i + 1).padStart(2, '0')}
                        </div>
                      </div>
                      {/* knobs */}
                      <div aria-hidden className="absolute inset-x-5 bottom-3 flex items-center justify-between">
                        <span className="mono text-[10px] tracking-[0.3em] text-paper/40">CULTURE SHOCK</span>
                        <span className="flex gap-2">
                          <span className="h-5 w-5 rounded-full bg-gradient-to-b from-[#3a3540] to-[#16141a] shadow-inner" />
                          <span className="h-5 w-5 rounded-full bg-gradient-to-b from-[#3a3540] to-[#16141a] shadow-inner" />
                        </span>
                      </div>
                      {e.badge && (
                        <div className="display absolute -right-5 -top-5 rotate-[8deg] rounded-sm bg-gold px-3 py-1.5 text-[22px] text-black shadow-[0_10px_30px_rgba(245,179,0,.4)]">
                          {e.badge}
                        </div>
                      )}
                    </div>

                    {/* listing */}
                    <div
                      className={`w-[min(34vw,420px)] transition-opacity duration-500 max-md:w-full ${on ? 'opacity-100' : 'opacity-50'}`}
                    >
                      <p className="mono mb-3 flex flex-wrap gap-x-3 text-[12px] text-[#ff7ad1]">
                        <span>{e.ep}</span>
                        <span className="text-paper/50">RUNTIME {e.runtime}</span>
                        {e.lead && <span className="text-gold">● LEAD EPISODE</span>}
                      </p>
                      <h3 className={`display text-paper ${e.lead ? 'text-[clamp(36px,4vw,64px)]' : 'text-[clamp(30px,3.2vw,50px)]'}`}>
                        {e.title}
                      </h3>
                      <p className="mt-4 line-clamp-4 text-[15px] leading-relaxed text-paper/75">{e.excerpt}</p>
                      {e.plays && (
                        <p className="mono mt-4 text-[12px] text-paper/60">
                          <span className="text-paper">{fmt(e.plays)}</span> plays
                          {e.likes ? (
                            <>
                              {' '}
                              · <span className="text-paper">{compact(e.likes)}</span> likes
                            </>
                          ) : null}
                        </p>
                      )}
                      <div className="mt-6 flex flex-wrap gap-3">
                        {full && (
                          <button
                            type="button"
                            data-cursor="play"
                            onClick={() => openPlayer({ src: { mp4: full.mp4, webm: full.webm }, poster: full.poster, title: e.title })}
                            className="btn-gold text-[14px]"
                          >
                            ▶ WATCH HERE
                          </button>
                        )}
                        <a href={e.permalink} target="_blank" rel="noopener noreferrer" className="btn-ghost text-[14px]">
                          WATCH ON INSTAGRAM ↗
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
              <div aria-hidden className="w-[10vw] shrink-0" />
            </div>
          </div>
        </div>
        <style>{`@keyframes crt-flip{0%{opacity:.95}70%{opacity:.5}100%{opacity:0}}`}</style>
      </section>
    </div>
  );
}
