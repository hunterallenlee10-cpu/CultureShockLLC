'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion, store } from '@/lib/bus';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scroll driven by the GSAP ticker; publishes smoothed velocity to the store. */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = prefersReducedMotion();
    let lenis: Lenis | undefined;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.2, anchors: { offset: 0 } });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
    }
    let last = window.scrollY;
    const tick = (time: number) => {
      lenis?.raf(time * 1000);
      const y = window.scrollY;
      const raw = lenis ? lenis.velocity : y - last;
      last = y;
      store.velocity.current += (raw - store.velocity.current) * 0.18;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}

export function scrollToEl(target: string | HTMLElement, immediate = false) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { immediate, duration: 1.4 });
  else el.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
}
