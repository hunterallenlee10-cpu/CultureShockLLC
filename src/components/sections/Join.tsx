import { hiring, site } from '@/content/site';
import { Picture } from '../media/Picture';

export function Join() {
  return (
    <section
      data-channel="5"
      data-segment="NOW HIRING"
      aria-labelledby="join-title"
      className="relative border-y border-gold/30 bg-ink px-[var(--gutter)] py-[clamp(60px,8vw,100px)]"
    >
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,320px)]">
        <a
          href={hiring.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-[3px] border border-paper/10 max-md:max-w-[260px]"
          data-cursor="view"
        >
          <Picture
            k="hiring"
            alt="Culture Shock hiring graphic: Join the team — interns and entry-level creatives"
            sizes="300px"
            className="h-auto w-full"
          />
        </a>
        <div>
          <p className="mono mb-3 flex items-center gap-2 text-[12px] text-gold">
            <span className="rec-dot h-2 w-2 rounded-full bg-[#ff2a2a]" /> NOW HIRING
          </p>
          <h2 id="join-title" className="display text-[clamp(38px,5vw,76px)]">
            <span className="text-paper">⚡ JOIN THE CULTURE SHOCK </span>
            <span className="text-gold">TEAM.</span>
          </h2>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-paper/80">{hiring.body}</p>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-paper/60">{hiring.who}</p>
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <p className="tag mb-3 text-[12px] text-paper/60">WE’RE CURRENTLY HIRING FOR</p>
          <ul className="space-y-2">
            {hiring.roles.map((r) => (
              <li key={r} className="display-800 border-b border-paper/10 pb-2 text-[22px] text-paper">
                {r}
              </li>
            ))}
          </ul>
          <p className="tag mt-5 text-[13px] text-gold">{hiring.kicker}</p>
          <p className="mt-3 text-[14px] text-paper/70">{hiring.apply}</p>
          <a
            href={`mailto:${site.hiringEmail}?subject=${encodeURIComponent('Join the Culture Shock team')}`}
            className="mono mt-1 inline-block text-[14px] text-gold underline underline-offset-4"
          >
            📩 {site.hiringEmail}
          </a>
        </div>
      </div>
    </section>
  );
}
