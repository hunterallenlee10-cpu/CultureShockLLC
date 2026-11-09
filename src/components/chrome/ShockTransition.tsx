'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion, store } from '@/lib/bus';
import { sfxStatic } from '@/lib/sfx';
import { Bolt } from '../brand/Bolt';

/**
 * Fires when the channel changes: a 250 ms gold brush wipe, a single-frame RGB
 * split on the HUD + a slice of the screen, and a lightning flash.
 * Premium, not cheesy: fast, low opacity, never blocks input.
 */
export function ShockTransition() {
  const root = useRef<HTMLDivElement>(null);
  const brush = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const split = useRef<HTMLDivElement>(null);
  const bolt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let prev = store.channel.get().n;
    let lastFire = 0;
    return store.channel.subscribe((ch) => {
      if (ch.n === prev) return;
      prev = ch.n;
      const now = performance.now();
      if (now - lastFire < 500 || !store.ready.get()) return;
      lastFire = now;
      sfxStatic();
      if (prefersReducedMotion()) {
        gsap.fromTo(flash.current, { opacity: 0.12 }, { opacity: 0, duration: 0.3, ease: 'none' });
        return;
      }
      const hud = document.querySelector<HTMLElement>('[data-hud-channel]');
      const tl = gsap.timeline();
      tl.set(root.current, { visibility: 'visible' })
        .fromTo(brush.current, { xPercent: -110, skewX: -18 }, { xPercent: 110, duration: 0.25, ease: 'power2.inOut' }, 0)
        .fromTo(
          split.current,
          { opacity: 1, y: () => window.innerHeight * (0.2 + Math.random() * 0.5) },
          { opacity: 0, duration: 0.05, ease: 'steps(1)' },
          0.08,
        )
        .fromTo(flash.current, { opacity: 0.22 }, { opacity: 0, duration: 0.16, ease: 'power1.out' }, 0.1)
        .fromTo(
          bolt.current,
          { opacity: 1, scale: 1.4, x: () => (Math.random() - 0.5) * window.innerWidth * 0.5 },
          { opacity: 0, scale: 1, duration: 0.18, ease: 'steps(3)' },
          0.1,
        )
        .set(root.current, { visibility: 'hidden' });
      if (hud) {
        hud.style.textShadow = '2px 0 0 rgba(255,0,60,.9), -2px 0 0 rgba(0,240,255,.9)';
        setTimeout(() => (hud.style.textShadow = ''), 60);
      }
    });
  }, []);

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[75] overflow-hidden" style={{ visibility: 'hidden' }}>
      <div
        ref={brush}
        className="absolute inset-y-[-10%] left-0 w-[70%] opacity-80"
        style={{ background: "url('/media/brand/brush-br.webp') center/100% 100% no-repeat" }}
      />
      <div
        ref={split}
        className="absolute inset-x-0 h-[14vh] opacity-0"
        style={{
          background: 'linear-gradient(90deg, rgba(255,0,60,.0), rgba(255,0,60,.35) 20%, rgba(0,240,255,.35) 60%, rgba(0,240,255,0))',
          mixBlendMode: 'screen',
          transform: 'translateX(1.5%)',
        }}
      />
      <div ref={flash} className="absolute inset-0 bg-white opacity-0 mix-blend-overlay" />
      <div
        ref={bolt}
        className="absolute left-1/2 top-1/2 -ml-[40px] -mt-[66px] w-[80px] text-gold-hot opacity-0 drop-shadow-[0_0_24px_rgba(255,201,60,.9)]"
      >
        <Bolt className="h-[132px] w-[80px]" />
      </div>
    </div>
  );
}
