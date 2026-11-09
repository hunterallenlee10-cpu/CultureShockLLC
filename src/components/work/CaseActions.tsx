'use client';
import { fullVideo } from '@/lib/media-client';
import { openPlayer } from '../media/FullscreenPlayer';
import { Crackle, Magnetic } from '../chrome/Magnetic';

export function CaseActions({ video, title, links }: { video?: string; title: string; links: { label: string; href: string }[] }) {
  const full = video ? fullVideo(video) : null;
  return (
    <div className="flex flex-wrap gap-3">
      {full && (
        <Magnetic>
          <button
            type="button"
            className="btn-gold text-[15px]"
            data-cursor="play"
            onClick={() => openPlayer({ src: { mp4: full.mp4, webm: full.webm }, poster: full.poster, title })}
          >
            <Crackle />▶ PLAY THE FULL CUT
          </button>
        </Magnetic>
      )}
      {links.map((l, i) => (
        <a
          key={l.href + i}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${!full && i === 0 ? 'btn-gold' : 'btn-ghost'} text-[15px]`}
        >
          {l.label.toUpperCase()} ↗
        </a>
      ))}
    </div>
  );
}
