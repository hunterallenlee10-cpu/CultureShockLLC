import { founder } from '@/content/founder';
import { Picture } from '../media/Picture';
import { BoltRule } from '../brand/Bolt';
import { BrushReveal } from '../brand/BrushReveal';
import { Corners } from '../brand/Corners';

const ICONS: Record<string, React.ReactNode> = {
  Filmmaker: <path d="M3 7h11v10H3zM14 10l6-3v10l-6-3M6 7V5h5v2" />,
  Photographer: <path d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  Storyteller: <path d="M4 20l1-5L16 4l4 4L9 19zM14 6l4 4" />,
};

export function Founder() {
  return (
    <section
      data-channel="5"
      data-channel-start="5"
      data-segment="MEET THE FOUNDER"
      aria-labelledby="founder-title"
      className="relative overflow-hidden bg-black px-[var(--gutter)] py-[clamp(100px,13vw,180px)]"
    >
      <Corners tl={false} size="clamp(160px, 24vw, 380px)" className="opacity-85" />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-[clamp(40px,6vw,96px)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <BrushReveal stroke={false}>
          <figure
            className="group relative mx-auto aspect-[425/735] w-full max-w-[440px] overflow-hidden rounded-[4px] bg-ink"
            data-cursor="view"
            data-cursor-label="COLOR"
          >
            <Picture
              k={founder.image}
              alt={founder.imageAlt}
              fill
              sizes="(min-width: 768px) 440px, 90vw"
              className="object-cover grayscale contrast-[1.15] transition-[filter] duration-700 group-hover:grayscale-0 group-hover:contrast-100"
            />
            {/* gold/black duotone */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gold mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0"
            />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(5,5,5,.75))]" />
            <div aria-hidden className="absolute -right-2 top-0 h-full w-10 -skew-x-[8deg] bg-gold" />
            <figcaption className="mono absolute bottom-4 left-4 text-[11px] text-paper/80">REC ● FOUNDER CAM</figcaption>
          </figure>
        </BrushReveal>

        <div>
          <BoltRule className="mb-6 max-w-[320px]" />
          <h2 id="founder-title" className="display distress">
            <span className="tag block text-[clamp(22px,2.6vw,36px)] tracking-[0.2em] text-paper">{founder.kicker}</span>
            <span className="block text-[clamp(72px,10vw,150px)] text-paper">{founder.title}</span>
          </h2>
          <svg aria-hidden viewBox="0 0 300 14" className="mt-1 h-3 w-[min(70%,360px)] text-gold" preserveAspectRatio="none">
            <path d="M2 10 C 80 2, 200 2, 298 6" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
          <p className="display-800 mt-6 text-[clamp(30px,3.4vw,52px)] text-gold">{founder.name}</p>
          <p className="tag mt-2 text-[12px] text-paper/70 md:text-[13px]">{founder.role}</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {founder.disciplines.map((d) => (
              <li key={d} className="tag flex items-center gap-2 text-[13px] text-paper">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-gold"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {ICONS[d]}
                </svg>
                {d}
              </li>
            ))}
          </ul>
          <blockquote className="mt-8 max-w-[52ch] border-l-2 border-gold pl-5 text-[clamp(17px,1.5vw,21px)] leading-relaxed text-paper/85">
            {founder.vision}
          </blockquote>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={founder.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost text-[15px]">
              {founder.handle} ON INSTAGRAM ↗
            </a>
            <p className="mono text-[11px] text-paper/50">{founder.credit.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
