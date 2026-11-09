'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { store, useSignal } from '@/lib/bus';

const tc = (s: number) => {
  if (!isFinite(s)) s = 0;
  const f = Math.floor((s % 1) * 24);
  const p = (n: number) => String(Math.floor(n)).padStart(2, '0');
  return `${p(s / 3600)}:${p((s / 60) % 60)}:${p(s % 60)}:${p(f)}`;
};

/** Custom fullscreen player (opens via store.player). Plays with sound — it's opened by a click. */
export function FullscreenPlayer() {
  const item = useSignal(store.player);
  const v = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [idle, setIdle] = useState(false);

  const close = useCallback(() => store.player.set(null), []);

  useEffect(() => {
    if (!item) return;
    opener.current = document.activeElement as HTMLElement;
    window.__lenis?.stop();
    document.body.style.overflow = 'hidden';
    store.cursor.set({ mode: 'hidden' });
    closeBtn.current?.focus();
    const el = v.current;
    if (el) {
      el.muted = false;
      setMuted(false);
      el.play().catch(() => {
        el.muted = true;
        setMuted(true);
        el.play().catch(() => {});
      });
    }
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = '';
      store.cursor.set({ mode: 'default' });
      opener.current?.focus?.();
    };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), 2200);
    };
    const onKey = (e: KeyboardEvent) => {
      wake();
      const el = v.current;
      if (!el) return;
      if (e.key === 'Escape') close();
      else if (e.key === ' ' || e.key === 'k') {
        if (!(e.target as HTMLElement).closest('button,input')) {
          e.preventDefault();
          if (el.paused) void el.play();
          else el.pause();
        }
      } else if (e.key === 'm') {
        el.muted = !el.muted;
        setMuted(el.muted);
      } else if (e.key === 'ArrowRight' && !(e.target as HTMLElement).closest('input')) el.currentTime += 5;
      else if (e.key === 'ArrowLeft' && !(e.target as HTMLElement).closest('input')) el.currentTime -= 5;
      else if (e.key === 'Tab') {
        // focus trap
        const f = dialog.current?.querySelectorAll<HTMLElement>('button,input');
        if (!f?.length) return;
        const first = f[0],
          last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    wake();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', wake);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', wake);
    };
  }, [item, close]);

  if (!item) return null;
  const pct = dur ? (time / dur) * 100 : 0;
  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Video player: ${item.title}`}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black"
      style={{ cursor: idle ? 'none' : 'default' }}
    >
      <video
        ref={v}
        className="h-full w-full object-contain"
        poster={item.poster}
        playsInline
        preload="auto"
        onClick={() => (v.current?.paused ? v.current.play() : v.current?.pause())}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={close}
      >
        {item.src.webm && <source src={item.src.webm} type="video/webm" />}
        <source src={item.src.mp4} type="video/mp4" />
      </video>

      {/* HUD frame */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${idle && !paused ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="mono absolute left-[var(--gutter)] top-5 flex items-center gap-2 text-[12px]">
          <span className="rec-dot inline-block h-2 w-2 rounded-full bg-[#ff2a2a]" /> PLAYBACK — {item.title.toUpperCase()}
        </div>
      </div>
      <button
        ref={closeBtn}
        type="button"
        onClick={close}
        className={`mono absolute right-[var(--gutter)] top-4 z-10 rounded-full bg-gold px-4 py-2 text-[12px] font-medium text-black transition-opacity hover:bg-gold-hot ${idle && !paused ? 'opacity-0 focus:opacity-100' : ''}`}
      >
        ✕ CLOSE <span className="opacity-60">ESC</span>
      </button>

      <div
        className={`absolute inset-x-[var(--gutter)] bottom-6 z-10 flex items-center gap-4 transition-opacity duration-500 ${idle && !paused ? 'opacity-0 focus-within:opacity-100' : ''}`}
      >
        <button
          type="button"
          onClick={() => (v.current?.paused ? v.current.play() : v.current?.pause())}
          className="mono grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/30 text-[14px] hover:border-gold hover:text-gold"
          aria-label={paused ? 'Play' : 'Pause'}
        >
          {paused ? '▶' : '❚❚'}
        </button>
        <span className="mono w-[96px] shrink-0 text-[12px] tabular-nums text-gold">{tc(time)}</span>
        <div className="relative h-11 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-paper/20">
            <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={dur || 0}
            step={0.04}
            value={time}
            onChange={(e) => v.current && (v.current.currentTime = Number(e.target.value))}
            aria-label="Seek"
            aria-valuetext={tc(time)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <span className="mono w-[96px] shrink-0 text-right text-[12px] tabular-nums opacity-60 max-sm:hidden">{tc(dur)}</span>
        <button
          type="button"
          onClick={() => {
            if (!v.current) return;
            v.current.muted = !v.current.muted;
            setMuted(v.current.muted);
          }}
          className="mono h-11 shrink-0 rounded-full border border-paper/30 px-4 text-[12px] hover:border-gold hover:text-gold"
          aria-pressed={!muted}
        >
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
        <button
          type="button"
          onClick={() => (document.fullscreenElement ? document.exitFullscreen() : dialog.current?.requestFullscreen?.())}
          className="mono hidden h-11 shrink-0 rounded-full border border-paper/30 px-4 text-[12px] hover:border-gold hover:text-gold sm:block"
          aria-label="Toggle fullscreen"
        >
          ⛶
        </button>
      </div>
    </div>
  );
}

/** Helper for buttons: open the player. */
export function openPlayer(p: NonNullable<ReturnType<typeof store.player.get>>) {
  store.player.set(p);
}
