'use client';
import type { Project } from '@/content/projects';
import { LoopVideo } from '../media/LoopVideo';
import { TransitionLink } from './TransitionLink';

/** "Next project" footer: hovering previews the next video. */
export function NextProject({ p, image }: { p: Project; image?: React.ReactNode }) {
  return (
    <TransitionLink
      href={`/work/${p.slug}`}
      slug={p.slug}
      data-hover-scope
      data-cursor="view"
      data-cursor-label="NEXT ↗"
      className="group relative block overflow-hidden border-t border-paper/10 bg-black px-[var(--gutter)] py-[clamp(60px,9vw,130px)]"
    >
      <div
        data-vt-source
        className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-60 group-focus-visible:opacity-60"
      >
        {p.tileVideo ? <LoopVideo k={p.tileVideo} label={p.alt} mode="hover" className="cover-media" /> : image}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-[1500px]">
        <p className="mono mb-4 text-[12px] text-gold">NEXT PROJECT ▸ UP NEXT ON CH 03</p>
        <p className="display text-[clamp(44px,8vw,128px)] text-paper transition-colors group-hover:text-gold">
          {p.client === 'TODO: confirm client name' ? p.title : p.title.split(' — ')[0]}
          <span className="ml-4 inline-block transition-transform duration-500 group-hover:translate-x-4" aria-hidden>
            →
          </span>
        </p>
        <p className="mt-3 max-w-[60ch] text-[16px] text-paper/70">{p.logline}</p>
      </div>
    </TransitionLink>
  );
}
