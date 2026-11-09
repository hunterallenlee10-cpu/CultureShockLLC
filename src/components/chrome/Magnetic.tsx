'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { isTouch, prefersReducedMotion } from '@/lib/bus';

/** Pulls its child toward the pointer when nearby. */
export function Magnetic({
  children,
  strength = 0.35,
  className = '',
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}

/** Lightning crackle paths drawn around the gold pill on hover. */
export function Crackle() {
  return (
    <svg className="crackle" viewBox="0 0 200 70" preserveAspectRatio="none" aria-hidden>
      <path d="M4 34 L22 20 L30 30 L52 6 L60 18 L84 4 L96 16 L120 2 L132 14 L156 4 L168 18 L196 10" />
      <path d="M4 40 L26 52 L36 42 L58 66 L70 52 L92 66 L104 54 L128 68 L140 54 L162 66 L176 50 L196 60" />
      <path d="M2 30 L12 36 L4 44 M198 28 L188 36 L196 44" />
    </svg>
  );
}
