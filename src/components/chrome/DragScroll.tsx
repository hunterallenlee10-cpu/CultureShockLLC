'use client';
import { useEffect, useRef } from 'react';
import { store } from '@/lib/bus';

/**
 * Horizontal scroller with mouse drag + inertia. Native scrolling is kept, so
 * touch, trackpads and the keyboard (arrow keys when focused) all still work.
 * Publishes its velocity to --drag-v for skew/tilt effects.
 */
export function DragScroll({ children, className = '', label }: { children: React.ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let raf = 0;
    let moved = false;
    const glide = () => {
      v *= 0.94;
      el.scrollLeft -= v;
      el.style.setProperty('--drag-v', String(Math.max(-1, Math.min(1, v / 40))));
      if (Math.abs(v) > 0.3) raf = requestAnimationFrame(glide);
      else el.style.setProperty('--drag-v', '0');
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      cancelAnimationFrame(raf);
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      lastT = performance.now();
      v = 0;
      store.cursor.set({ mode: 'drag', label: '⇆' });
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
      const now = performance.now();
      v = ((e.clientX - lastX) / Math.max(1, now - lastT)) * 16;
      lastX = e.clientX;
      lastT = now;
      el.style.setProperty('--drag-v', String(Math.max(-1, Math.min(1, v / 40))));
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      store.cursor.set({ mode: 'default' });
      raf = requestAnimationFrame(glide);
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, []);
  return (
    <div
      ref={ref}
      tabIndex={0}
      role="region"
      aria-label={label}
      data-cursor="drag"
      className={`select-none overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
