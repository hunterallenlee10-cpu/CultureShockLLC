'use client';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/bus';

const GLYPHS = '⚡0123456789:⚡';

/** Text that scrambles through ⚡ and timecode digits when its parent link/button is hovered or focused. */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const host = el?.closest('a,button') as HTMLElement | null;
    if (!el || !host || prefersReducedMotion()) return;
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const dur = 420;
      const step = () => {
        const p = Math.min(1, (performance.now() - start) / dur);
        const reveal = Math.floor(p * text.length);
        el.textContent = text
          .split('')
          .map((ch, i) => (i < reveal || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join('');
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    host.addEventListener('pointerenter', run);
    host.addEventListener('focus', run);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointerenter', run);
      host.removeEventListener('focus', run);
    };
  }, [text]);
  return (
    <>
      <span ref={ref} className={className} aria-hidden>
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
