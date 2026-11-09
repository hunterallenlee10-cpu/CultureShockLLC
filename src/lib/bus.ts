'use client';
import { useSyncExternalStore } from 'react';
/**
 * Tiny global store + event bus shared by the broadcast chrome (HUD, cursor,
 * transitions, players). Deliberately framework-free so GSAP/Lenis callbacks can
 * write to it every frame without re-rendering React.
 */
type Listener<T> = (v: T) => void;

function signal<T>(initial: T) {
  let value = initial;
  const subs = new Set<Listener<T>>();
  return {
    get: () => value,
    set(v: T) {
      if (Object.is(v, value)) return;
      value = v;
      subs.forEach((fn) => fn(v));
    },
    subscribe(fn: Listener<T>) {
      subs.add(fn);
      return () => void subs.delete(fn);
    },
  };
}

export type ChannelState = { n: number; id: string; name: string; segment: string };

export const store = {
  channel: signal<ChannelState>({ n: 1, id: 'home', name: 'HOME', segment: 'LIVE' }),
  sound: signal(false),
  /** Smoothed scroll velocity in px/frame (signed). Written by SmoothScroll. */
  velocity: { current: 0 },
  cursor: signal<{ mode: 'default' | 'play' | 'drag' | 'view' | 'hidden'; label?: string }>({ mode: 'default' }),
  player: signal<null | { src: { mp4: string; webm?: string }; poster?: string; title: string; aspect?: number }>(null),
  guideOpen: signal(false),
  /** Set once the preloader has finished (or was skipped). */
  ready: signal(false),
};

export function useSignal<T>(s: { get: () => T; subscribe: (fn: Listener<T>) => () => void }) {
  return useSyncExternalStore(s.subscribe, s.get, s.get);
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/** Save-Data / slow connections: skip autoplay. */
export const lowData = () => {
  if (typeof navigator === 'undefined') return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType || ''));
};

/**
 * Apple WebKit (Safari, and every browser on iPhone/iPad). It decodes H.264 in
 * hardware but VP9 often in software, so we hand it MP4 first.
 */
export const preferMp4 = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return iOS || (/Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Android/.test(ua));
};
