'use client';
import { useEffect, useRef, useState } from 'react';
import { btsHeader, btsStrip, setupVsShot } from '@/content/bts';
import { gear } from '@/content/services';
import { clip } from '@/lib/media-client';
import { gsap } from '@/lib/gsap';
import { isTouch, prefersReducedMotion } from '@/lib/bus';
import { LoopVideo } from '../media/LoopVideo';
import { BoltRule } from '../brand/Bolt';
import { BrushReveal } from '../brand/BrushReveal';
import { Corners } from '../brand/Corners';

function CameraMark() {
  return (
    <svg
      viewBox="0 0 160 90"
      className="h-auto w-[min(46vw,190px)] text-gold"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
    >
      <path d="M8 4H2v12M152 4h6v12M8 86H2V74M152 86h6V74" />
      <path d="M46 34h56v34H46zM102 44l18-9v32l-18-9M58 34v-8h24v8M50 68l-6 10M98 68l6 10" />
      <circle cx="64" cy="51" r="10" />
      <circle cx="64" cy="51" r="4" />
      <path d="M84 26h10v-6h12" />
    </svg>
  );
}

function SetupVsShot() {
  const [tab, setTab] = useState(0);
  const [pos, setPos] = useState(52);
  const [inView, setInView] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pair = setupVsShot[tab];
  const after = clip(pair.after);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const setFromX = (x: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)));
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="flex justify-center">
        <div
          ref={box}
          className="relative w-full touch-pan-y select-none overflow-hidden rounded-[4px] bg-ink"
          style={{ aspectRatio: `${after.width} / ${after.height}`, maxWidth: after.height > after.width ? 'min(100%, 46vh)' : '100%' }}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            setFromX(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          data-cursor="drag"
        >
          <LoopVideo
            key={`a-${pair.id}`}
            k={pair.after}
            isClip
            label={`The shot: ${pair.label}`}
            mode="controlled"
            active={inView}
            group="wall"
            className="cover-media"
          />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <LoopVideo
              key={`b-${pair.id}`}
              k={pair.before}
              isClip
              label={`The setup: ${pair.label}`}
              mode="controlled"
              active={inView}
              group="wall"
              className="cover-media"
            />
          </div>
          <span className="display-800 absolute left-3 top-3 rounded-sm bg-black/70 px-2 py-1 text-[14px] text-paper">THE SETUP</span>
          <span className="display-800 absolute right-3 top-3 rounded-sm bg-gold px-2 py-1 text-[14px] text-black">THE SHOT</span>
          <div
            className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-gold shadow-[0_0_20px_rgba(245,179,0,.8)]"
            style={{ left: `${pos}%` }}
          >
            <div
              role="slider"
              tabIndex={0}
              aria-label="Compare the setup and the shot"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              aria-valuetext={`${Math.round(pos)}% setup`}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
                if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
                if (e.key === 'Home') setPos(0);
                if (e.key === 'End') setPos(100);
              }}
              className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-black shadow-xl"
            >
              <span className="mono text-[13px] font-medium">⇆</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div role="tablist" aria-label="Choose a setup" className="mb-6 flex flex-wrap gap-2">
          {setupVsShot.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={tab === i}
              onClick={() => {
                setTab(i);
                setPos(52);
              }}
              className={`mono rounded-full border px-4 py-2 text-[12px] transition-colors ${tab === i ? 'border-gold bg-gold text-black' : 'border-paper/20 hover:border-gold hover:text-gold'}`}
            >
              {p.label.toUpperCase()}
            </button>
          ))}
        </div>
        <h3 className="display text-[clamp(44px,5.4vw,84px)]">
          <span className="text-paper">THE SETUP</span>
          <br />
          <span className="text-gold">VS. THE SHOT</span>
        </h3>
        <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-paper/80">“{pair.caption}”</p>
        <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-paper/60">{pair.detail}</p>
        <a
          href={pair.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono mt-6 inline-block text-[12px] text-gold underline-offset-4 hover:underline"
        >
          WATCH THE FULL POST ON INSTAGRAM ↗
        </a>
      </div>
    </div>
  );
}

function FilmStrip() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const w = wrap.current;
    const t = track.current;
    if (!w || !t || prefersReducedMotion() || isTouch()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        t,
        { x: 0 },
        {
          x: () => -(t.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
        },
      );
    }, w);
    // Tilt with mouse velocity
    const skew = gsap.quickTo(t, 'skewX', { duration: 0.6, ease: 'power3' });
    const rot = gsap.quickTo(t, 'rotate', { duration: 0.8, ease: 'power3' });
    let lx = 0;
    let lt = performance.now();
    let settle: ReturnType<typeof setTimeout>;
    const move = (e: PointerEvent) => {
      const now = performance.now();
      const v = (e.clientX - lx) / Math.max(1, now - lt);
      lx = e.clientX;
      lt = now;
      skew(Math.max(-10, Math.min(10, v * -6)));
      rot(Math.max(-2, Math.min(2, v * 1.2)));
      clearTimeout(settle);
      settle = setTimeout(() => {
        skew(0);
        rot(0);
      }, 120);
    };
    w.addEventListener('pointermove', move);
    return () => {
      ctx.revert();
      w.removeEventListener('pointermove', move);
      clearTimeout(settle);
    };
  }, []);
  const holes = 'repeating-linear-gradient(90deg, transparent 0 14px, #1c1b1f 14px 30px)';
  return (
    <div
      ref={wrap}
      className="relative mt-[clamp(70px,9vw,120px)] overflow-hidden py-8 max-md:overflow-x-auto max-md:[scrollbar-width:none]"
    >
      <ul
        ref={track}
        className="relative flex w-max gap-0 bg-[#0b0b0d] px-[var(--gutter)] py-7 will-change-transform"
        aria-label="Behind-the-scenes clips"
      >
        <span aria-hidden className="absolute inset-x-0 top-2 h-3" style={{ background: holes }} />
        <span aria-hidden className="absolute inset-x-0 bottom-2 h-3" style={{ background: holes }} />
        {btsStrip.map((b, i) => (
          <li
            key={b.key}
            className="relative mx-1.5 aspect-[9/16] w-[clamp(150px,15vw,230px)] shrink-0 overflow-hidden rounded-[2px] bg-ink"
          >
            <LoopVideo k={b.key} label={`Behind the scenes: ${b.label}`} group="strip" className="cover-media" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10">
              <p className="mono text-[10px] text-gold">{String(i + 1).padStart(2, '0')}A</p>
              <p className="display-800 text-[17px] leading-[1] text-paper">{b.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bts() {
  return (
    <section
      id="ch-bts"
      data-channel="5"
      data-segment="ON SET"
      aria-labelledby="bts-title"
      className="relative overflow-hidden bg-black py-[clamp(100px,13vw,170px)]"
    >
      <Corners br={false} size="clamp(150px, 22vw, 360px)" className="opacity-80" />
      <header className="relative flex flex-col items-center px-[var(--gutter)] text-center">
        <p className="mono mb-4 text-[12px] text-gold">CH 05 · BEHIND THE SCENES</p>
        <BrushReveal>
          <h2 id="bts-title" className="display distress text-[clamp(64px,11vw,168px)]">
            <span className="text-paper">
              {btsHeader.title[0]} {btsHeader.title[1]}{' '}
            </span>
            <span className="text-gold">{btsHeader.title[2]}</span>
          </h2>
        </BrushReveal>
        <div className="my-8">
          <CameraMark />
        </div>
        <p className="tag border-y border-gold/70 px-4 py-2 text-[clamp(14px,1.5vw,18px)] tracking-[0.18em] text-paper">
          ON SET WITH <span className="text-gold">CULTURE SHOCK</span>
        </p>
        <p className="tag mt-5 flex flex-wrap justify-center gap-x-4 text-[12px] text-paper/70 md:text-[13px]">
          {btsHeader.values.map((v, i) => (
            <span key={v} className="flex items-center gap-4">
              {i > 0 && <span className="text-gold">•</span>}
              {v}
            </span>
          ))}
          <span className="text-gold" aria-hidden>
            ⚡
          </span>
        </p>
      </header>

      <div className="mx-auto mt-[clamp(60px,8vw,110px)] max-w-[1320px] px-[var(--gutter)]">
        <SetupVsShot />
      </div>

      <FilmStrip />

      <div className="mx-auto mt-10 flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-[var(--gutter)]">
        <p className="mono text-[12px] text-paper/70">
          <span className="text-gold">CAMERA DEPT —</span> {gear.toUpperCase()}
        </p>
        <BoltRule width="w-[min(100%,360px)]" />
      </div>
    </section>
  );
}
