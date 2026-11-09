'use client';
import { useState } from 'react';
import { divisions, divisionsFooter } from '@/content/services';
import { LoopVideo } from '../media/LoopVideo';
import { BoltRule } from '../brand/Bolt';
import { BrushReveal } from '../brand/BrushReveal';

export function Divisions({ stills = {} }: { stills?: Record<string, React.ReactNode> }) {
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState(0); // mobile accordion

  return (
    <section
      data-channel="1"
      data-segment="THE VISION"
      aria-labelledby="divisions-title"
      className="relative bg-black px-[var(--gutter)] pb-[clamp(90px,12vw,160px)]"
    >
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <BrushReveal>
            <p className="tag mb-3 text-[13px] text-gold">— THE VISION —</p>
            <h2 id="divisions-title" className="display distress text-[clamp(44px,7vw,112px)]">
              <span className="text-paper">MORE THAN A CREATIVE AGENCY.</span>
              <br />
              <span className="text-gold">A MEDIA COMPANY BUILT AROUND CULTURE.</span>
            </h2>
          </BrushReveal>
        </header>

        {/* Desktop: expanding panels */}
        <div className="hidden h-[min(78vh,760px)] gap-3 lg:flex" onPointerLeave={() => setActive(null)}>
          {divisions.map((d, i) => {
            const on = active === i;
            return (
              <article
                key={d.id}
                tabIndex={0}
                aria-label={`${d.name.join(' ')} — ${d.tag}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                data-cursor="play"
                data-cursor-label={on ? 'ON AIR' : 'PLAY ▶'}
                className="group relative min-w-0 overflow-hidden rounded-[4px] bg-ink outline-offset-4 transition-[flex-grow] duration-700 ease-[var(--ease-shock)]"
                style={{ flexGrow: on ? 2.6 : 1, flexBasis: 0 }}
              >
                <LoopVideo
                  k={d.loop}
                  label={d.alt}
                  mode="controlled"
                  active={on}
                  className={`cover-media transition-[filter,transform] duration-700 ${on ? 'scale-100 grayscale-0' : 'scale-[1.06] grayscale brightness-[.55]'}`}
                />
                {'secondaryLoop' in d && d.secondaryLoop && (
                  <div
                    className={`absolute bottom-6 right-6 aspect-[9/16] w-[22%] overflow-hidden rounded-sm border border-gold/60 shadow-2xl transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <LoopVideo
                      k={d.secondaryLoop}
                      label="The Wire episode, Culture Shock Films"
                      mode="controlled"
                      active={on}
                      className="cover-media"
                    />
                  </div>
                )}
                {d.stills.length > 0 && (
                  <div
                    className={`absolute bottom-6 right-6 flex gap-3 transition-all duration-500 ${on ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
                  >
                    {d.stills.map((s, j) => (
                      <div
                        key={s}
                        className="relative aspect-[3/2] w-[150px] overflow-hidden rounded-sm border border-gold/60 shadow-2xl lg:w-[190px]"
                        style={{ rotate: `${j ? 3 : -2}deg` }}
                      >
                        {stills[s]}
                      </div>
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
                  <span className="mono text-[12px] text-gold">DIV 0{i + 1}</span>
                  <span className={`mono flex items-center gap-2 text-[11px] transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="rec-dot h-1.5 w-1.5 rounded-full bg-[#ff2a2a]" /> LIVE
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                  <p className="tag mb-2 text-[12px] text-gold">{d.tag}</p>
                  <h3 className="display text-[clamp(34px,3.6vw,64px)]">
                    <span className="text-paper">{d.name[0]}</span>
                    <br />
                    <span className="text-gold">{d.name[1]}</span>
                  </h3>
                  <p
                    className={`mt-4 max-w-[44ch] text-[15px] leading-relaxed text-paper/85 transition-all duration-500 ${
                      on ? 'max-h-40 translate-y-0 opacity-100' : 'max-h-0 translate-y-3 opacity-0'
                    } ${d.stills.length || ('secondaryLoop' in d && d.secondaryLoop) ? 'lg:max-w-[38ch]' : ''}`}
                  >
                    {d.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile: accordion */}
        <div className="flex flex-col gap-3 lg:hidden">
          {divisions.map((d, i) => {
            const on = open === i;
            return (
              <div key={d.id} className="overflow-hidden rounded-[4px] bg-ink">
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`div-panel-${d.id}`}
                  onClick={() => setOpen(on ? -1 : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="display text-[34px]">
                    <span className="text-paper">{d.name[0]} </span>
                    <span className="text-gold">{d.name[1]}</span>
                  </span>
                  <span className={`mono text-gold transition-transform ${on ? 'rotate-45' : ''}`} aria-hidden>
                    +
                  </span>
                </button>
                <div id={`div-panel-${d.id}`} hidden={!on}>
                  <div className="relative aspect-[4/5]">
                    <LoopVideo k={d.loop} label={d.alt} mode="controlled" active={on} className="cover-media" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                  </div>
                  <div className="p-5 pt-0">
                    <p className="tag mb-2 text-[12px] text-gold">{d.tag}</p>
                    <p className="text-[15px] leading-relaxed text-paper/85">{d.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 text-center">
          <BoltRule className="max-w-[420px]" />
          <p className="tag text-[13px] text-paper md:text-[15px]">
            FROM ONE-TIME PRODUCTIONS TO <span className="text-gold">{divisionsFooter.replace('FROM ONE-TIME PRODUCTIONS TO ', '')}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
