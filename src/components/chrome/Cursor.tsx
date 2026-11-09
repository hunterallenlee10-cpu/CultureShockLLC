'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { isTouch, store } from '@/lib/bus';

const LABELS: Record<string, string> = { play: 'PLAY ▶', drag: 'DRAG ⇆', view: 'VIEW ↗' };

/**
 * Gold dot that becomes a 72px disc over media. Elements opt in with
 * data-cursor="play|drag|view" (optionally data-cursor-label). Hidden on touch.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isTouch() || !dot.current || !disc.current) return;
    document.documentElement.classList.add('has-cursor');
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' });
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' });
    const xc = gsap.quickTo(disc.current, 'x', { duration: 0.35, ease: 'power3' });
    const yc = gsap.quickTo(disc.current, 'y', { duration: 0.35, ease: 'power3' });
    let mode = 'default';
    const setMode = (m: string, text?: string) => {
      if (m === mode && !text) return;
      mode = m;
      const on = m !== 'default' && m !== 'hidden';
      if (label.current) label.current.textContent = text || LABELS[m] || '';
      gsap.to(disc.current, { scale: on ? 1 : 0, opacity: on ? 1 : 0, duration: 0.35, ease: on ? 'back.out(2)' : 'power3.out' });
      gsap.to(dot.current, { scale: on ? 0 : m === 'hidden' ? 0 : 1, duration: 0.2 });
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      xd(e.clientX);
      yd(e.clientY);
      xc(e.clientX);
      yc(e.clientY);
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      if (t) setMode(t.dataset.cursor || 'default', t.dataset.cursorLabel);
      else {
        const interactive = (e.target as HTMLElement | null)?.closest('a,button,input,select,textarea,label,[role="slider"]');
        gsap.to(dot.current, { scale: interactive ? 2.2 : 1, duration: 0.2 });
        setMode('default');
      }
    };
    const leave = () => gsap.to([dot.current, disc.current], { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to(dot.current, { opacity: 1, duration: 0.2 });
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('pointerenter', enter);
    const unsub = store.cursor.subscribe((c) => setMode(c.mode, c.label));
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerenter', enter);
      document.documentElement.classList.remove('has-cursor');
      unsub();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] hidden [@media(pointer:fine)]:block">
      <div ref={dot} className="absolute -left-[5px] -top-[5px] h-[10px] w-[10px] rounded-full bg-gold mix-blend-difference" />
      <div
        ref={disc}
        className="absolute -left-9 -top-9 grid h-[72px] w-[72px] scale-0 place-items-center rounded-full bg-gold text-black opacity-0 shadow-[0_0_30px_rgba(245,179,0,.45)]"
      >
        <span ref={label} className="display-800 text-[13px] tracking-[0.08em]" />
      </div>
    </div>
  );
}
