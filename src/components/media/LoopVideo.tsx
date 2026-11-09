'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { cmedia, type LoopEntry } from '@/lib/media-client';
import { lowData, preferMp4, prefersReducedMotion } from '@/lib/bus';

/* ------------------------------------------------------------------------
 * Playback budget: at most N loops per group play at once (oldest yields).
 * --------------------------------------------------------------------- */
const LIMITS: Record<string, number> = { work: 3, global: 4, sports: 5, strip: 4, hero: 1, wall: 6 };
const playing = new Map<string, HTMLVideoElement[]>();
function claim(group: string, v: HTMLVideoElement) {
  const list = (playing.get(group) || []).filter((x) => x !== v && !x.paused);
  list.push(v);
  const limit = LIMITS[group] ?? 4;
  while (list.length > limit) list.shift()?.pause();
  playing.set(group, list);
}
function release(group: string, v: HTMLVideoElement) {
  playing.set(
    group,
    (playing.get(group) || []).filter((x) => x !== v),
  );
}

type Props = {
  /** Media key (reel-05, hl-work-08 …) or a clip key when `isClip`. */
  k: string;
  isClip?: boolean;
  label: string;
  className?: string;
  /** inview: play while ≥35% visible · hover: play on hover of [data-hover-scope] · controlled: use `active` */
  mode?: 'inview' | 'hover' | 'controlled';
  active?: boolean;
  group?: string;
  /** Start loading immediately (above the fold). */
  eager?: boolean;
  style?: React.CSSProperties;
  onFrame?: (t: number, v: HTMLVideoElement) => void;
  fit?: 'cover' | 'contain';
  vtName?: string;
};

export type LoopVideoHandle = { el: HTMLVideoElement | null };

export const LoopVideo = forwardRef<LoopVideoHandle, Props>(function LoopVideo(
  { k, isClip, label, className, mode = 'inview', active, group = 'global', eager, style, onFrame, fit = 'cover', vtName },
  ref,
) {
  const entry: Omit<LoopEntry, 'cuts'> | undefined = isClip ? cmedia.clips[k] : cmedia.videos[k]?.loop;
  const v = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(!!eager);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [canAuto, setCanAuto] = useState(true);
  useImperativeHandle(ref, () => ({ el: v.current }), []);

  useEffect(() => setCanAuto(!prefersReducedMotion() && !lowData()), []);

  // Attach sources when near the viewport; track ≥35% visibility.
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: '600px 0px' });
    const vis = new IntersectionObserver(([e]) => setVisible(e.intersectionRatio >= 0.35), { threshold: [0, 0.35, 0.6] });
    near.observe(el);
    vis.observe(el);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, []);

  useEffect(() => {
    if (load) v.current?.load();
  }, [load]);

  // Hover scope
  useEffect(() => {
    if (mode !== 'hover') return;
    const scope = v.current?.closest('[data-hover-scope]') || v.current;
    if (!scope) return;
    const on = () => setHovered(true);
    const off = () => setHovered(false);
    scope.addEventListener('pointerenter', on);
    scope.addEventListener('pointerleave', off);
    scope.addEventListener('focusin', on);
    scope.addEventListener('focusout', off);
    return () => {
      scope.removeEventListener('pointerenter', on);
      scope.removeEventListener('pointerleave', off);
      scope.removeEventListener('focusin', on);
      scope.removeEventListener('focusout', off);
    };
  }, [mode]);

  const shouldPlay =
    canAuto && load && visible && (mode === 'inview' || (mode === 'hover' && hovered) || (mode === 'controlled' && !!active));

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (shouldPlay) {
      const p = el.play();
      claim(group, el);
      p?.catch(() => {});
    } else {
      el.pause();
      release(group, el);
      if (mode === 'hover') el.currentTime = 0;
    }
  }, [shouldPlay, group, mode]);

  useEffect(() => {
    if (!onFrame || !shouldPlay) return;
    const el = v.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      onFrame(el.currentTime, el);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onFrame, shouldPlay]);

  if (!entry) return null;
  return (
    <video
      ref={v}
      className={className}
      style={{
        objectFit: fit,
        backgroundImage: `url(${entry.blurDataURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        viewTransitionName: vtName,
        ...style,
      }}
      poster={entry.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      disablePictureInPicture
      width={entry.width}
      height={entry.height}
    >
      {load &&
        (preferMp4()
          ? [<source key="m" src={entry.mp4} type="video/mp4" />, <source key="w" src={entry.webm} type="video/webm" />]
          : [<source key="w" src={entry.webm} type="video/webm" />, <source key="m" src={entry.mp4} type="video/mp4" />])}
    </video>
  );
});
