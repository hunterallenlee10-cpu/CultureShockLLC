'use client';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion, store } from '@/lib/bus';
import { Bolt } from '../brand/Bolt';

const KEY = 'cs-seen';

/**
 * "ACQUIRING SIGNAL": TV static → timecode 00:00:00:00 → 00:00:01:12 → gold brush
 * slash → wordmark slams in with a 2-frame shake and a lightning strike. 1.8 s total.
 * The sequence itself is pure CSS (globals.css), so it finishes even if JS is slow;
 * JS adds the static, the counter and the sessionStorage skip for repeat visits.
 */
export function Preloader() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tc = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const seen = document.documentElement.hasAttribute('data-seen');
    if (seen || prefersReducedMotion()) {
      store.ready.set(true);
      return;
    }
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {}
    // Static
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    let raf = 0;
    const t0 = performance.now();
    if (c && ctx) {
      const img = ctx.createImageData(c.width, c.height);
      const draw = () => {
        for (let i = 0; i < img.data.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
          img.data[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        const el = performance.now() - t0;
        // 00:00:00:00 → 00:00:01:12 (36 frames @ 24fps) over 1.3 s
        const f = Math.min(36, Math.floor((el / 1300) * 36));
        if (tc.current) tc.current.textContent = `00:00:${String(Math.floor(f / 24)).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}`;
        if (el < 1400) raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    }
    const done = setTimeout(() => store.ready.set(true), 1500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, []);

  return (
    <div className="preloader" aria-hidden>
      <canvas ref={canvas} width={160} height={90} className="pre-static" />
      <div className="mono absolute left-[var(--gutter)] top-5 flex items-center gap-2 text-[12px] text-paper">
        <span className="rec-dot inline-block h-2 w-2 rounded-full bg-[#ff2a2a]" /> ACQUIRING SIGNAL
      </div>
      <span ref={tc} className="mono absolute bottom-5 right-[var(--gutter)] text-[13px] text-gold tabular-nums">
        00:00:00:00
      </span>
      <div className="pre-slash" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/brand/logo.svg" alt="" className="pre-logo" width={640} height={290} />
      <div className="pre-bolt text-gold-hot">
        <Bolt className="h-auto w-full" />
      </div>
      <div className="pre-flash" />
    </div>
  );
}

/** Inline, render-blocking: hides the preloader on repeat visits before first paint. */
export const preloaderScript = `try{if(sessionStorage.getItem('${KEY}'))document.documentElement.setAttribute('data-seen','')}catch(e){}`;
