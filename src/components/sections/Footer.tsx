import { site } from '@/content/site';

/** Giant wordmark that splits apart with an RGB offset on hover. */
export function Footer() {
  return (
    <footer
      data-channel="6"
      data-segment="SIGN-OFF"
      className="relative overflow-hidden bg-black px-[var(--gutter)] pb-24 pt-[clamp(70px,9vw,120px)]"
    >
      <div className="group relative mx-auto max-w-[1600px]" data-cursor="view" data-cursor-label="⚡">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/brand/logo.svg"
            alt="Culture Shock"
            width={1600}
            height={730}
            className="relative z-10 h-auto w-full transition-[clip-path,transform] duration-500 ease-[var(--ease-shock)] [clip-path:inset(0_0_50%_0)] group-hover:-translate-x-[1.2%] group-hover:-translate-y-[2%]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/brand/logo.svg"
            alt=""
            aria-hidden
            width={1600}
            height={730}
            className="absolute inset-0 z-10 h-auto w-full transition-transform duration-500 ease-[var(--ease-shock)] [clip-path:inset(50%_0_0_0)] group-hover:translate-x-[1.2%] group-hover:translate-y-[2%]"
          />
          {/* RGB ghosts */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/brand/logo.svg"
            alt=""
            aria-hidden
            width={1600}
            height={730}
            className="absolute inset-0 h-auto w-full opacity-0 mix-blend-screen transition-all duration-300 [filter:url(#rgb-r)] group-hover:-translate-x-[0.8%] group-hover:opacity-80"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/brand/logo.svg"
            alt=""
            aria-hidden
            width={1600}
            height={730}
            className="absolute inset-0 h-auto w-full opacity-0 mix-blend-screen transition-all duration-300 [filter:url(#rgb-b)] group-hover:translate-x-[0.8%] group-hover:opacity-80"
          />
          <svg aria-hidden className="absolute h-0 w-0">
            <filter id="rgb-r">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
            </filter>
            <filter id="rgb-b">
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0.9  0 0 1 0 0  0 0 0 1 0" />
            </filter>
          </svg>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1600px] flex-col gap-6 border-t border-paper/10 pt-8 md:flex-row md:items-center md:justify-between">
        <p className="tag text-[13px] text-paper">
          📍 DMV <span className="text-gold">|</span> AVAILABLE FOR TRAVEL
        </p>
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[13px] text-gold underline-offset-4 hover:underline"
        >
          INSTAGRAM {site.handle} ↗
        </a>
        <p className="mono text-[12px] text-paper/50">{site.copyright}</p>
      </div>
    </footer>
  );
}
