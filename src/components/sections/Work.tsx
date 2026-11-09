'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { projects, type Project } from '@/content/projects';
import { clientCategories, type ClientCategory } from '@/content/services';
import { Flip, gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/bus';
import { ProjectTile } from '../work/ProjectTile';
import { BrushReveal } from '../brand/BrushReveal';
import { Scramble } from '../chrome/Scramble';
import { scrollToEl } from '../chrome/SmoothScroll';

/** Grid order is tuned so the wide (6×2) and tall (3×4) tiles interlock in 4-row bands. */
const ORDER = [
  'collegebound-scholars-luncheon',
  'paco-panama',
  'franks-pizza-one-bite',
  '378-coaching',
  'c-cubed-contracting',
  'keeping-hopes-alive',
  'friday-night-lights',
  'the-proposal',
  'nothing-into-something',
  'master-crowns-buildout',
  'collegebound-ambassadors',
  'homecoming',
  'construction-process',
  'education-content',
  'headshots',
];
const ordered = ORDER.map((s) => projects.find((p) => p.slug === s)).filter(Boolean) as Project[];

type Filter = 'ALL' | ClientCategory;

export function Work({ images = {} }: { images?: Record<string, React.ReactNode> }) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const visible = (p: Project) => filter === 'ALL' || p.categories.includes(filter);
  const count = (f: Filter) => (f === 'ALL' ? ordered.length : ordered.filter((p) => p.categories.includes(f)).length);

  const choose = (f: Filter) => {
    if (f === filter) return;
    if (grid.current && !prefersReducedMotion()) flipState.current = Flip.getState(grid.current.querySelectorAll('[data-flip-id]'));
    setFilter(f);
  };

  useLayoutEffect(() => {
    if (!flipState.current || !grid.current) return;
    Flip.from(flipState.current, {
      targets: grid.current.querySelectorAll('[data-flip-id]'),
      duration: 0.6,
      ease: 'power3.inOut',
      scale: true,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.15 }),
    });
    flipState.current = null;
  }, [filter]);

  return (
    <section
      id="ch-work"
      data-channel="3"
      data-channel-start="3"
      data-segment="SELECTED WORK"
      aria-labelledby="work-title"
      className="relative bg-black px-[var(--gutter)] py-[clamp(100px,13vw,180px)]"
    >
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <BrushReveal>
            <p className="mono mb-3 text-[12px] text-gold">CH 03 · SELECTED WORK BY CULTURE SHOCK</p>
            <h2 id="work-title" className="display distress text-[clamp(64px,11vw,176px)]">
              <span className="text-paper">OUR </span>
              <span className="text-gold">WORK</span>
            </h2>
            <p className="tag mt-3 text-[13px] text-paper/70">
              FILM <span className="text-gold">•</span> CONTENT <span className="text-gold">•</span> CULTURE
            </p>
          </BrushReveal>

          <div role="group" aria-label="Filter work by client type" className="flex flex-wrap gap-2 lg:max-w-[640px] lg:justify-end">
            {(['ALL', ...clientCategories] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => choose(f)}
                className={`mono flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] transition-colors ${
                  filter === f ? 'border-gold bg-gold text-black' : 'border-paper/20 text-paper/80 hover:border-gold hover:text-gold'
                }`}
              >
                <Scramble text={f} />
                <sup className="text-[9px] opacity-60">{count(f)}</sup>
              </button>
            ))}
          </div>
        </header>
        <p className="sr-only" aria-live="polite">
          Showing {ordered.filter(visible).length} projects{filter !== 'ALL' ? ` for ${filter.toLowerCase()}` : ''}.
        </p>

        <div className="[container-type:inline-size]">
          <div
            ref={grid}
            className="grid grid-cols-2 gap-3 md:grid-flow-dense md:grid-cols-12 md:gap-3 md:[grid-auto-rows:calc((100cqw-11*12px)/12*1.5)]"
          >
            {ordered.map((p, i) => (
              <ProjectTile key={p.slug} p={p} index={i} hidden={!visible(p)} image={images[p.slug]} />
            ))}
            <div data-flip-id="cta" className={`col-span-2 md:col-span-3 md:row-span-4 ${filter === 'ALL' ? '' : 'hidden'}`}>
              <a
                href="#ch-contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToEl('#ch-contact');
                }}
                data-cursor="view"
                data-cursor-label="LET’S GO"
                className="group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-[4px] bg-gold p-5 text-black"
              >
                <span className="mono text-[11px]">16 / YOUR STORY</span>
                <span className="display text-[clamp(40px,4.4vw,76px)]">
                  YOUR
                  <br />
                  PROJECT
                  <br />
                  HERE.
                </span>
                <span className="display-800 flex items-center gap-2 text-[18px] tracking-[0.06em]">
                  START A PROJECT <span className="transition-transform group-hover:translate-x-2">→</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
