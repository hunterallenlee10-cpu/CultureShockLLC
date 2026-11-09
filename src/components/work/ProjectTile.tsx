'use client';
import type { Project } from '@/content/projects';
import { LoopVideo } from '../media/LoopVideo';
import { TransitionLink } from './TransitionLink';

const SPAN: Record<Project['tile'], string> = {
  L: 'col-span-2 aspect-video md:aspect-auto md:col-span-6 md:row-span-2',
  S: 'col-span-2 aspect-[3/2] md:aspect-auto md:col-span-6 md:row-span-2',
  P: 'col-span-1 aspect-[9/16] md:aspect-auto md:col-span-3 md:row-span-4',
};

export function ProjectTile({ p, index, hidden, image }: { p: Project; index: number; hidden?: boolean; image?: React.ReactNode }) {
  const isVideo = !!p.tileVideo;
  return (
    <div data-flip-id={p.slug} className={`${SPAN[p.tile]} ${hidden ? 'hidden' : ''}`}>
      <TransitionLink
        href={`/work/${p.slug}`}
        slug={p.slug}
        data-hover-scope
        data-cursor={isVideo ? 'play' : 'view'}
        data-cursor-label={isVideo ? 'PLAY ▶' : 'VIEW ↗'}
        className="group relative block h-full w-full overflow-hidden rounded-[4px] bg-ink"
      >
        <div data-vt-source className="absolute inset-0">
          {isVideo ? (
            <LoopVideo
              k={p.tileVideo!}
              label={p.alt}
              group="work"
              className="cover-media transition-transform duration-[1.2s] ease-[var(--ease-shock)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-shock)] group-hover:scale-[1.04]">
              {image}
            </div>
          )}
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30 transition-opacity duration-500 group-hover:opacity-70"
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-[4px] ring-0 ring-gold transition-[box-shadow] duration-300 group-hover:ring-2 group-focus-visible:ring-2"
        />

        <div aria-hidden className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 md:p-4">
          <span className="mono rounded-sm bg-black/60 px-2 py-1 text-[10px] text-gold backdrop-blur-sm md:text-[11px]">
            {String(index + 1).padStart(2, '0')} / {p.categories[0]}
          </span>
          {p.runtime && (
            <span className="mono rounded-sm bg-black/60 px-2 py-1 text-[10px] text-paper/80 backdrop-blur-sm md:text-[11px]">
              {p.runtime}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 md:p-5">
          {/* Huge gold-outlined title on hover */}
          <p
            aria-hidden
            className="display text-outline-gold pointer-events-none mb-1 hidden translate-y-4 text-[clamp(30px,3.4vw,58px)] opacity-0 transition-all duration-500 ease-[var(--ease-shock)] group-hover:translate-y-0 group-hover:opacity-100 md:block"
          >
            {p.client}
          </p>
          <h3 className="display-800 text-[clamp(17px,1.7vw,26px)] leading-[1] text-paper">{p.title}</h3>
          <p className="mono mt-1.5 text-[10px] text-paper/55 md:text-[11px]">
            {p.year}
            {p.location ? ` · ${p.location}` : ''}
            <span className="sr-only"> — view case study</span>
          </p>
        </div>
      </TransitionLink>
    </div>
  );
}
