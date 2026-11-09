import { reviews } from '@/content/reviews';
import { workedWith } from '@/content/services';
import { DragScroll } from '../chrome/DragScroll';
import { Marquee } from '../chrome/Marquee';
import { Picture } from '../media/Picture';
import { BoltRule } from '../brand/Bolt';
import { BrushReveal } from '../brand/BrushReveal';

function StarsBubble() {
  return (
    <svg viewBox="0 0 260 120" className="h-auto w-[min(60vw,240px)] text-gold" role="img" aria-label="Five stars">
      <path
        d="M14 8h232a8 8 0 0 1 8 8v62a8 8 0 0 1-8 8H66l-30 26 6-26H14a8 8 0 0 1-8-8V16a8 8 0 0 1 8-8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          transform={`translate(${44 + i * 43} 47)`}
          d="M0-18 5.3-6.2 18-5.6 8.2 2.7 11.4 15 0 8.2-11.4 15-8.2 2.7-18-5.6-5.3-6.2Z"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function Proof() {
  return (
    <section
      data-channel="4"
      data-segment="CLIENT REVIEWS"
      aria-labelledby="reviews-title"
      className="relative overflow-hidden bg-ink py-[clamp(100px,13vw,170px)]"
    >
      <div
        className="halftone pointer-events-none absolute left-0 top-0 h-[60%] w-[30%]"
        style={{ ['--hx' as string]: '0%', ['--hy' as string]: '0%' }}
        aria-hidden
      />
      <header className="relative flex flex-col items-center px-[var(--gutter)] text-center">
        <BrushReveal>
          <h2 id="reviews-title" className="display distress text-[clamp(64px,11vw,170px)]">
            <span className="block text-paper">CLIENT</span>
            <span className="block text-gold">REVIEWS</span>
          </h2>
        </BrushReveal>
        <div className="mt-8">
          <StarsBubble />
        </div>
        <p className="tag mt-6 text-[clamp(18px,2vw,26px)] tracking-[0.16em]">
          <span className="text-paper">REAL FEEDBACK.</span> <span className="text-gold">REAL RESULTS.</span>
        </p>
        <BoltRule className="mt-5 max-w-[360px]" />
        <p className="tag mt-5 text-[12px] text-paper/70 md:text-[13px]">
          QUALITY <span className="text-gold">•</span> PROFESSIONALISM <span className="text-gold">•</span> TRUST
        </p>
      </header>

      <DragScroll label="Client reviews — drag or scroll horizontally" className="mt-[clamp(50px,7vw,90px)]">
        <ul className="flex w-max items-stretch gap-5 px-[var(--gutter)] pb-4">
          {reviews.map((r, i) => (
            <li
              key={i}
              className={`relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[6px] border border-paper/10 bg-black transition-transform duration-300 [transform:skewX(calc(var(--drag-v,0)*-4deg))] ${
                r.quote.length > 300 ? 'w-[min(88vw,760px)]' : r.image ? 'w-[min(84vw,620px)]' : 'w-[min(80vw,460px)]'
              }`}
            >
              {r.image && (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Picture k={r.image} alt={r.imageAlt || ''} fill sizes="(min-width: 768px) 620px, 84vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                </div>
              )}
              <figure className="flex flex-1 flex-col justify-between gap-8 p-[clamp(22px,3vw,40px)]">
                {r.kind === 'text' ? (
                  <div className="my-auto">
                    <p className="mono mb-3 text-[11px] text-paper/50">iMESSAGE · DELIVERED</p>
                    <blockquote className="relative max-w-[30ch] rounded-[22px] rounded-bl-[6px] bg-[#2b2b30] px-5 py-4 text-[clamp(18px,1.7vw,24px)] leading-snug text-paper">
                      {r.quote}
                    </blockquote>
                  </div>
                ) : (
                  <div className={r.quote.length > 300 ? '' : 'my-auto'}>
                    <p className="text-gold" aria-label="5 out of 5 stars">
                      <span aria-hidden className="text-[22px] tracking-[0.15em]">
                        ★★★★★
                      </span>
                    </p>
                    <blockquote
                      className={`mt-4 text-paper ${r.quote.length > 300 ? 'text-[clamp(17px,1.45vw,21px)] leading-[1.55]' : 'display-800 text-[clamp(34px,3.6vw,58px)] leading-[0.98]'}`}
                    >
                      “{r.quote}”
                    </blockquote>
                  </div>
                )}
                <figcaption className="mono flex items-center gap-3 text-[11px] text-paper/60">
                  <span className="h-px w-8 bg-gold" /> {r.who.toUpperCase()}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </DragScroll>

      <div className="mt-[clamp(60px,8vw,110px)] border-y border-paper/10 py-5">
        <p className="mono mb-3 px-[var(--gutter)] text-[11px] text-paper/50">WORKED WITH</p>
        <Marquee speed={45} reverse label={`Worked with: ${workedWith.join(', ')}`}>
          {workedWith.map((n, i) => (
            <span
              key={n}
              className={`display flex items-center whitespace-nowrap text-[clamp(30px,4vw,60px)] ${i % 2 ? 'text-outline-gold' : 'text-paper'}`}
            >
              <span className="px-[0.5em]">{n}</span>
              <span className="text-[0.6em] text-gold" aria-hidden>
                ⚡
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
