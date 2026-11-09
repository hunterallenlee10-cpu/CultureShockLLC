'use client';
import { useEffect, useRef } from 'react';
import { manifesto } from '@/content/site';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/bus';
import { BoltRule } from '../brand/Bolt';
import { BrushReveal } from '../brand/BrushReveal';
import { Corners } from '../brand/Corners';

/** Splits "[[gold phrase]]" markup into words, tagging gold ones. */
function words(body: string) {
  const out: { w: string; gold: boolean }[] = [];
  body.split(/(\[\[.*?\]\])/).forEach((chunk) => {
    const gold = chunk.startsWith('[[');
    chunk
      .replace(/\[\[|\]\]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => out.push({ w, gold }));
  });
  return out;
}

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const list = words(manifesto.body);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ws = el.querySelectorAll<HTMLElement>('[data-w]');
    if (prefersReducedMotion()) {
      ws.forEach((w) => (w.style.color = w.dataset.gold ? 'var(--shock-gold)' : 'var(--paper)'));
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el.querySelector('[data-body]'), start: 'top 78%', end: 'bottom 45%', scrub: 0.6 },
      });
      ws.forEach((w, i) => {
        tl.to(w, { color: w.dataset.gold ? '#F5B300' : '#F5F3EE', duration: 1, ease: 'none' }, i * 0.35);
      });
      gsap.fromTo(
        stamp.current,
        { scale: 1.6, opacity: 0, rotate: -6 },
        {
          scale: 1,
          opacity: 1,
          rotate: -2.5,
          duration: 0.45,
          ease: 'back.out(2.2)',
          scrollTrigger: { trigger: stamp.current, start: 'top 85%', once: true },
          onComplete: () => {
            gsap.fromTo(stamp.current, { x: 6, y: -4 }, { x: 0, y: 0, duration: 0.08, ease: 'steps(2)' });
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-channel="1"
      data-segment="WHO WE ARE"
      aria-labelledby="who-we-are"
      className="relative overflow-hidden bg-black px-[var(--gutter)] py-[clamp(110px,16vw,220px)]"
    >
      <Corners size="clamp(150px, 24vw, 380px)" className="opacity-80" />
      <div className="relative mx-auto max-w-[1180px]">
        <BoltRule className="mx-auto mb-8 max-w-[520px]" />
        <BrushReveal className="text-center">
          <h2 id="who-we-are" className="display distress text-[clamp(56px,10vw,150px)]">
            <span className="text-paper">WHO WE </span>
            <span className="text-gold">ARE</span>
          </h2>
        </BrushReveal>
        <p className="tag mt-6 text-center text-[13px] text-paper/70 md:text-[15px]">
          {manifesto.kicker.split(' ').slice(0, 3).join(' ')}{' '}
          <span className="text-gold">{manifesto.kicker.split(' ').slice(3).join(' ')}</span>
        </p>

        <p
          data-body
          className="mx-auto mt-14 max-w-[24ch] text-center font-medium leading-[1.12] tracking-[-0.02em] text-[clamp(30px,4.6vw,66px)] md:max-w-[26ch]"
        >
          {list.map(({ w, gold }, i) => (
            <span key={i} data-w data-gold={gold ? '' : undefined} className={gold ? 'italic' : ''} style={{ color: '#3a3936' }}>
              {w}{' '}
            </span>
          ))}
        </p>

        <div className="mt-[clamp(70px,9vw,120px)] flex justify-center">
          <div ref={stamp} className="slab px-[clamp(28px,5vw,72px)] py-[clamp(14px,2vw,26px)]" style={{ transform: 'rotate(-2.5deg)' }}>
            <p className="display text-[clamp(34px,6.4vw,104px)] tracking-[0.01em]">{manifesto.stamp}</p>
          </div>
        </div>
        <BoltRule className="mx-auto mt-16 max-w-[520px]" />
      </div>
    </section>
  );
}
