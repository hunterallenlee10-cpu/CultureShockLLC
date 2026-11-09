'use client';
import { hero } from '@/content/site';
import { cmedia, fullVideo } from '@/lib/media-client';
import { openPlayer } from '../media/FullscreenPlayer';
import { Crackle, Magnetic } from '../chrome/Magnetic';
import { scrollToEl } from '../chrome/SmoothScroll';

export function HeroCtas() {
  const reel = fullVideo('reel-23');
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Magnetic>
        <button
          type="button"
          className="btn-ghost text-[15px] md:text-[16px]"
          disabled={!reel}
          data-cursor="play"
          onClick={() =>
            reel &&
            openPlayer({
              src: { mp4: reel.mp4, webm: reel.webm },
              poster: cmedia.posters['hero-poster'],
              title: 'Culture Shock — 2024 Reel',
              aspect: 16 / 9,
            })
          }
        >
          {hero.playLabel}
        </button>
      </Magnetic>
      <Magnetic>
        <a
          href="#ch-contact"
          className="btn-gold text-[15px] md:text-[16px]"
          onClick={(e) => {
            e.preventDefault();
            scrollToEl('#ch-contact');
          }}
        >
          <Crackle />
          {hero.ctaLabel}
          <span aria-hidden>⚡</span>
        </a>
      </Magnetic>
    </div>
  );
}
