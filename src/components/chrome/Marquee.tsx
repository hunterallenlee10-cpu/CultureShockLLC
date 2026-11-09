'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion, store } from '@/lib/bus';

/** Infinite marquee whose speed (and direction) reacts to scroll velocity. */
export function Marquee({
  children,
  speed = 60,
  className = '',
  reverse = false,
  label,
}: {
  children: React.ReactNode;
  speed?: number; // px per second at rest
  className?: string;
  reverse?: boolean;
  label?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let dir = reverse ? 1 : -1;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      const v = store.velocity.current;
      if (Math.abs(v) > 0.5) dir = (v > 0 ? -1 : 1) * (reverse ? -1 : 1);
      const boost = 1 + Math.min(8, Math.abs(v) * 0.35);
      x += dir * speed * boost * (dt / 1000);
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
      el.style.setProperty('--skew', `${Math.max(-8, Math.min(8, v * -0.25))}deg`);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [speed, reverse]);
  return (
    <div className={`overflow-hidden ${className}`} role={label ? 'marquee' : undefined} aria-label={label}>
      <div ref={track} className="marquee-track" aria-hidden={label ? true : undefined}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
