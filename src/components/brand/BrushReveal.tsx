'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/bus';

/**
 * Section-entrance reveal: a rough gold brush stroke draws across (stroke-dashoffset)
 * while a slanted clip-path wipe uncovers the content right behind it.
 */
export function BrushReveal({
  children,
  className = '',
  as: Tag = 'div',
  delay = 0,
  stroke = true,
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'header' | 'span';
  delay?: number;
  stroke?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !content.current) return;
    if (prefersReducedMotion()) {
      gsap.fromTo(
        content.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
      );
      return;
    }
    const len = path.current?.getTotalLength() ?? 0;
    if (path.current) gsap.set(path.current, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
    gsap.set(content.current, { clipPath: 'polygon(0% 0%, 0% 0%, -12% 100%, -12% 100%)' });
    const tl = gsap.timeline({ paused: true, delay });
    if (path.current) tl.to(path.current, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 0);
    tl.to(content.current, { clipPath: 'polygon(0% 0%, 112% 0%, 100% 100%, -12% 100%)', duration: 0.7, ease: 'power3.inOut' }, 0.08);
    if (path.current) tl.to(path.current, { opacity: 0, duration: 0.35 }, 0.62);
    tl.set(content.current, { clipPath: 'none' });
    const st = ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: () => tl.play() });
    return () => {
      st.kill();
      tl.kill();
    };
  }, [delay]);

  return (
    <Tag ref={root as React.Ref<HTMLDivElement>} className={`relative ${className}`}>
      <div ref={content}>{children}</div>
      {stroke && (
        <svg
          aria-hidden
          className="pointer-events-none absolute -inset-x-[4%] top-1/2 h-[70%] w-[108%] -translate-y-1/2 overflow-visible"
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="brush-rough" x="-5%" y="-40%" width="110%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="4" />
              <feDisplacementMap in="SourceGraphic" scale="9" />
            </filter>
          </defs>
          <path
            ref={path}
            d="M2 44 C 70 30, 140 40, 210 24 S 330 18, 398 10"
            fill="none"
            stroke="var(--shock-gold)"
            strokeWidth="16"
            strokeLinecap="round"
            filter="url(#brush-rough)"
            style={{ opacity: 0 }}
          />
        </svg>
      )}
    </Tag>
  );
}
