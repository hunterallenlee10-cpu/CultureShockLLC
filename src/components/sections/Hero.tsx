import { getImageProps } from 'next/image';
import { hero, manifesto } from '@/content/site';
import { img, pickWidth } from '@/lib/media';
import { Corners } from '../brand/Corners';
import { HeroVideo } from './HeroVideo';
import { HeroCtas } from './HeroCtas';

function heroPoster() {
  const d = img('hero-poster');
  const m = img('hero-mobile-poster');
  const props = (k: typeof d, fmt: 'avif' | 'webp', sizes = '100vw') =>
    getImageProps({
      src: k.src,
      alt: '',
      width: k.width,
      height: k.height,
      sizes,
      priority: true,
      loader: ({ width }) => `${k.src}-${pickWidth(k.widths, width)}.${fmt}`,
    }).props;
  const srcset = (k: typeof d, fmt: 'avif' | 'webp') => k.widths.map((w) => `${k.src}-${w}.${fmt} ${w}w`).join(', ');
  return { d, m, props, srcset };
}

export function Hero() {
  const { d, m, props, srcset } = heroPoster();
  const MOBILE = '(max-width: 767px) and (orientation: portrait)';
  const fallback = props(d, 'webp');

  return (
    <section
      id="ch-home"
      data-channel="1"
      data-channel-start="1"
      data-segment="LIVE"
      aria-label="Culture Shock — we create stories worth watching"
      className="relative isolate h-[100svh] min-h-[620px] overflow-hidden bg-black"
    >
      {/* The poster is the LCP element: preload the right AVIF for each layout (React hoists these to <head>). */}
      <link
        rel="preload"
        as="image"
        type="image/avif"
        media={MOBILE}
        imageSrcSet={srcset(m, 'avif')}
        imageSizes="100vw"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        type="image/avif"
        media={`not all and ${MOBILE}`}
        imageSrcSet={srcset(d, 'avif')}
        imageSizes="100vw"
        fetchPriority="high"
      />
      {/* 2px short of full-bleed: Chrome ignores viewport-filling images as LCP candidates. */}
      <picture>
        <source media={MOBILE} type="image/avif" srcSet={srcset(m, 'avif')} sizes="100vw" />
        <source media={MOBILE} type="image/webp" srcSet={srcset(m, 'webp')} sizes="100vw" />
        <source type="image/avif" srcSet={srcset(d, 'avif')} sizes="100vw" />
        <img
          {...fallback}
          srcSet={srcset(d, 'webp')}
          alt=""
          className="absolute inset-x-0 top-0 h-[calc(100%-2px)] w-full object-cover opacity-80"
        />
      </picture>
      <HeroVideo />

      {/* grade + legibility */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_60%,transparent_0%,rgba(5,5,5,.25)_45%,rgba(5,5,5,.85)_100%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent" />
      <Corners br={false} halftone={false} size="clamp(140px, 22vw, 360px)" className="top-[72px] opacity-80 mix-blend-screen" />

      <div className="relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[clamp(72px,11vh,120px)]">
        <p className="tag mb-5 flex flex-wrap items-center gap-x-3 text-[12px] text-paper/80 md:text-[13px]">
          {manifesto.taglines.map((t, i) => (
            <span key={t} className="flex items-center gap-3">
              {i > 0 && <span className="text-gold">|</span>}
              {t}
            </span>
          ))}
        </p>
        <h1 className="display distress text-[clamp(58px,11.5vw,188px)]">
          {hero.lines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.04em]">
              <span
                className={`hero-line block ${i === 1 ? 'text-gold' : 'text-paper'}`}
                style={{ animationDelay: `calc(var(--hero-delay) + ${i * 0.12}s)` }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
        <div className="hero-fade mt-6 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-paper/80 md:text-[17px]">{hero.sub}</p>
          <HeroCtas />
        </div>
      </div>

      <div
        aria-hidden
        className="mono absolute bottom-[clamp(72px,11vh,120px)] right-[var(--gutter)] z-10 hidden flex-col items-end gap-1 text-right text-[11px] text-paper/50 xl:flex"
      >
        <span>SRC: 2024 REEL</span>
        <span>CAM: SONY FX3 / FX30</span>
      </div>
      <style>{`
        :root { --hero-delay: 1.62s; }
        html[data-seen] { --hero-delay: .15s; }
        .hero-line { transform: translateY(105%); animation: hero-line .9s var(--ease-shock) forwards; }
        .hero-fade { opacity: 0; animation: hero-fade .8s calc(var(--hero-delay) + .35s) ease forwards; }
        @keyframes hero-line { to { transform: none; } }
        @keyframes hero-fade { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .hero-line { transform: none; } .hero-fade { opacity: 1; } }
      `}</style>
    </section>
  );
}
