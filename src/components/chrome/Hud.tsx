'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { channels } from '@/content/site';
import { store, useSignal } from '@/lib/bus';
import { ScrollTrigger } from '@/lib/gsap';
import { sfxTick, unlockAudio } from '@/lib/sfx';
import { scrollToEl } from './SmoothScroll';
import { Scramble } from './Scramble';

const pad = (n: number, l = 2) => String(n).padStart(l, '0');

/** Running SMPTE timecode (24 fps) since the broadcast started. */
function Timecode() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    let last = '';
    const tick = () => {
      const f = Math.floor(((performance.now() - t0) / 1000) * 24);
      const s = Math.floor(f / 24);
      const tc = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 24)}`;
      if (tc !== last && ref.current) ref.current.textContent = last = tc;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <span ref={ref} className="mono tabular-nums" aria-hidden>
      00:00:00:00
    </span>
  );
}

/**
 * Sections declare data-channel="2" data-segment="ORIGINALS". The section that
 * crosses the middle of the viewport owns the HUD.
 */
function useChannelTracking() {
  const pathname = usePathname();
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-channel]')];
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        // Created before the pinned sections, so refresh after them to get post-pin positions.
        refreshPriority: -1,
        onToggle: (self) => {
          if (!self.isActive) return;
          const n = Number(el.dataset.channel);
          const ch = channels.find((c) => c.n === n) ?? channels[0];
          store.channel.set({ n, id: ch.id, name: ch.name, segment: el.dataset.segment || ch.name });
        },
      }),
    );
    ScrollTrigger.refresh();
    return () => triggers.forEach((t) => t.kill());
  }, [pathname]);
}

export function Hud() {
  useChannelTracking();
  const ch = useSignal(store.channel);
  const sound = useSignal(store.sound);
  const guide = useSignal(store.guideOpen);
  const pathname = usePathname();
  const onGold = ch.segment === 'INQUIRY';

  // Remote control: number keys 1–6 change channel, G opens the guide.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input,textarea,select,[contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (store.player.get()) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 6) {
        const target = document.querySelector<HTMLElement>(`[data-channel-start="${n}"]`);
        if (target) {
          e.preventDefault();
          scrollToEl(target);
        }
      }
      if (e.key.toLowerCase() === 'g') store.guideOpen.set(!store.guideOpen.get());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const color = onGold ? 'text-black' : 'text-paper';
  return (
    <>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-[70] flex items-start justify-between px-[var(--gutter)] pt-4 pb-6 transition-colors duration-300 ${color} ${
          onGold ? '' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-4">
          <Link
            href="/"
            aria-label="Culture Shock — home"
            className="block w-[74px] md:w-[92px]"
            data-cursor="view"
            data-cursor-label="HOME"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/brand/logo.svg" alt="" width={92} height={42} className="h-auto w-full" />
          </Link>
          <div className="mono flex items-center gap-2 text-[11px] md:text-[12px]">
            <span className="rec-dot inline-block h-2 w-2 rounded-full bg-[#ff2a2a] shadow-[0_0_10px_#ff2a2a]" aria-hidden />
            <span className="font-medium">REC</span>
            <span className="opacity-40 max-sm:hidden">|</span>
            <span className="max-sm:hidden">
              <Timecode />
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <div className="mono hidden text-right text-[12px] leading-tight sm:block" aria-live="polite">
            <div data-hud-channel className="font-medium">
              CH {pad(ch.n)} — {ch.name}
            </div>
            <div className="opacity-50">▸ {pathname.startsWith('/work/') ? 'CASE STUDY' : ch.segment}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              store.sound.set(!sound);
              setTimeout(() => sfxTick(), 20);
            }}
            aria-pressed={sound}
            aria-label={sound ? 'Mute site sound' : 'Turn on site sound'}
            className={`mono flex h-9 items-center gap-2 rounded-full border px-3 text-[11px] transition-colors ${onGold ? 'border-black/40 hover:bg-black hover:text-gold' : 'border-paper/25 hover:border-gold hover:text-gold'}`}
          >
            <SoundBars on={sound} />
            <span className="max-sm:hidden">{sound ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>
          <button
            type="button"
            onClick={() => store.guideOpen.set(!guide)}
            aria-expanded={guide}
            aria-controls="channel-guide"
            className={`mono flex h-9 items-center gap-2 rounded-full px-3 text-[11px] font-medium transition-colors ${onGold ? 'bg-black text-gold' : 'bg-gold text-black hover:bg-gold-hot'}`}
          >
            <span aria-hidden>▤</span> GUIDE
          </button>
        </div>
      </header>

      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-[70] hidden items-end justify-between px-[var(--gutter)] pt-8 pb-4 transition-colors duration-300 md:flex ${color} ${
          onGold ? '' : 'bg-gradient-to-t from-black/70 to-transparent'
        }`}
      >
        <p className="mono text-[11px] tracking-[0.12em]">
          DMV <span className="text-gold">•</span> AVAILABLE FOR TRAVEL
        </p>
        <nav aria-label="Channels" className="pointer-events-auto hidden items-center gap-1 md:flex">
          {channels.map((c) => (
            <button
              key={c.n}
              type="button"
              onClick={() => {
                const target = document.querySelector<HTMLElement>(`[data-channel-start="${c.n}"]`);
                if (target) scrollToEl(target);
                else window.location.href = `/#ch-${c.id}`;
              }}
              aria-label={`Channel ${c.n}: ${c.name}`}
              aria-current={ch.n === c.n ? 'true' : undefined}
              className={`mono grid h-7 min-w-7 place-items-center rounded-sm px-1.5 text-[11px] transition-colors ${
                ch.n === c.n ? (onGold ? 'bg-black text-gold' : 'bg-gold text-black') : 'opacity-50 hover:opacity-100'
              }`}
            >
              {pad(c.n)}
            </button>
          ))}
        </nav>
      </div>
      <Guide />
    </>
  );
}

function SoundBars({ on }: { on: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0.5, 1, 0.7, 0.9].map((h, i) => (
        <span
          key={i}
          className="w-[2px] bg-current"
          style={{
            height: on ? `${h * 100}%` : `${30 + h * 30}%`,
            opacity: on ? 1 : 0.55,
            animation: on ? `eq 0.${6 + i}s ease-in-out ${i * 0.1}s infinite alternate` : undefined,
          }}
        />
      ))}
      <style>{`@keyframes eq{from{transform:scaleY(.3)}to{transform:scaleY(1)}}`}</style>
    </span>
  );
}

/** TV-guide overlay listing the channels (G or the GUIDE button). */
function Guide() {
  const open = useSignal(store.guideOpen);
  const ch = useSignal(store.channel);
  const first = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && store.guideOpen.set(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  if (!mounted) return null;
  const go = (n: number, id: string) => {
    store.guideOpen.set(false);
    const target = document.querySelector<HTMLElement>(`[data-channel-start="${n}"]`);
    if (target) setTimeout(() => scrollToEl(target), 50);
    else window.location.href = `/#ch-${id}`;
  };
  return (
    <div
      id="channel-guide"
      role="dialog"
      aria-modal="true"
      aria-label="Channel guide"
      hidden={!open}
      className="fixed inset-0 z-[80] bg-black/92 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && store.guideOpen.set(false)}
    >
      <div className="mx-auto flex h-full max-w-5xl flex-col justify-center px-[var(--gutter)]">
        <p className="mono mb-6 text-[12px] text-gold">CULTURE SHOCK — ON AIR · PROGRAM GUIDE</p>
        <ul className="divide-y divide-paper/10 border-y border-paper/10">
          {channels.map((c, i) => (
            <li key={c.n}>
              <button
                ref={i === 0 ? first : undefined}
                type="button"
                onClick={() => go(c.n, c.id)}
                className="group flex w-full items-baseline gap-6 py-4 text-left md:py-5"
              >
                <span className="mono w-16 text-[13px] text-gold">CH {pad(c.n)}</span>
                <span className="display text-[clamp(40px,7vw,88px)] text-paper transition-colors group-hover:text-gold group-focus-visible:text-gold">
                  <Scramble text={c.name} />
                </span>
                {ch.n === c.n && <span className="mono ml-auto text-[11px] text-[#ff4b4b]">● NOW PLAYING</span>}
              </button>
            </li>
          ))}
        </ul>
        <p className="mono mt-6 text-[11px] opacity-50">TIP: PRESS 1–6 TO CHANGE CHANNEL · G FOR GUIDE · ESC TO CLOSE</p>
      </div>
    </div>
  );
}
