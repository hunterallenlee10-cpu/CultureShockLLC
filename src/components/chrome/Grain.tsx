'use client';
import { useEffect, useRef } from 'react';

/** Fixed film grain (animated noise at ~5% opacity) + very faint scanlines. CSS-animated, no canvas loop. */
export function Grain() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const ctx = c.getContext('2d');
    if (!ctx || !ref.current) return;
    const d = ctx.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
    ref.current.style.backgroundImage = `url(${c.toDataURL('image/png')})`;
  }, []);
  return (
    <>
      <div
        ref={ref}
        aria-hidden
        className="pointer-events-none fixed -inset-[50%] z-[60] opacity-[0.05] mix-blend-overlay motion-safe:animate-[grain_0.9s_steps(6)_infinite]"
        style={{ backgroundSize: '160px 160px' }}
      />
      <div aria-hidden className="scanlines pointer-events-none fixed inset-0 z-[59] opacity-60" />
      <style>{`@keyframes grain{0%{transform:translate(0,0)}17%{transform:translate(-5%,3%)}33%{transform:translate(4%,-6%)}50%{transform:translate(-8%,5%)}67%{transform:translate(6%,8%)}83%{transform:translate(-3%,-7%)}100%{transform:translate(0,0)}}`}</style>
    </>
  );
}
