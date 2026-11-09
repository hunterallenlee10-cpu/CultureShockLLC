import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects, projectBySlug } from '@/content/projects';
import { site } from '@/content/site';
import { hasImg, imgUrl, media } from '@/lib/media';
import { LoopVideo } from '@/components/media/LoopVideo';
import { Picture } from '@/components/media/Picture';
import { DragScroll } from '@/components/chrome/DragScroll';
import { CaseActions } from '@/components/work/CaseActions';
import { NextProject } from '@/components/work/NextProject';
import { BoltRule } from '@/components/brand/Bolt';
import { Corners } from '@/components/brand/Corners';
import { Footer } from '@/components/sections/Footer';
import { altFor } from '@/content/alts';

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

const posterKey = (p: NonNullable<ReturnType<typeof projectBySlug>>) =>
  p.hero.type === 'image' ? p.hero.key : hasImg(`${p.hero.key}-still`) ? `${p.hero.key}-still` : 'hero-poster';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  const description = `${p.logline} ${p.brief}`
    .replace(/TODO:[^.]*\.?/g, '')
    .trim()
    .slice(0, 200);
  return {
    title: p.title,
    description,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: `${p.title} — Culture Shock`, description, images: [{ url: imgUrl(posterKey(p), 1280, 'webp') }], type: 'article' },
  };
}

/** Renders copy, flagging "TODO: …" notes so unconfirmed details are never passed off as fact. */
function Copy({ text }: { text: string }) {
  const [said, todo] = text.split(/TODO:/);
  return (
    <>
      {said.trim() && <span>{said.trim()} </span>}
      {todo && (
        <span className="mono mt-3 block rounded-sm border border-dashed border-gold/70 px-3 py-2 text-[12px] leading-relaxed text-gold">
          TODO: {todo.trim()}
        </span>
      )}
    </>
  );
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];
  const heroVideo = p.hero.type === 'video' ? media.videos[p.hero.key] : null;
  const portrait = heroVideo
    ? heroVideo.orientation === 'portrait' || heroVideo.aspect < 1
    : p.hero.type === 'image' && media.images[p.hero.key].aspect < 1;
  const bg = posterKey(p);
  const gallery = p.gallery.filter(hasImg);
  const heroMedia =
    p.hero.type === 'video' ? (
      <LoopVideo k={p.hero.key} label={p.alt} eager group="hero" className="cover-media" />
    ) : (
      <Picture k={p.hero.key} alt={p.alt} fill priority sizes={portrait ? '420px' : '100vw'} className="object-cover" />
    );

  return (
    <article data-channel="3" data-segment={p.client.toUpperCase().slice(0, 28)} className="bg-black">
      {/* HERO */}
      <header className="relative isolate flex min-h-[100svh] items-end overflow-hidden px-[var(--gutter)] pb-[clamp(40px,7vh,80px)] pt-28">
        {portrait ? (
          <div aria-hidden className="absolute inset-0 -z-10">
            <Picture k={bg} alt="" fill sizes="100vw" priority className="scale-110 object-cover opacity-50 blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
          </div>
        ) : (
          <>
            <div data-vt-target={p.slug} style={{ viewTransitionName: 'project-hero' }} className="absolute inset-0 -z-20 bg-ink">
              {heroMedia}
            </div>
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#050505_0%,rgba(5,5,5,.75)_30%,rgba(5,5,5,.1)_65%,rgba(5,5,5,.45)_100%)]"
            />
          </>
        )}
        <Corners br={false} halftone={false} size="clamp(120px, 18vw, 300px)" className="-z-10 top-[64px] opacity-70" />

        <div className={`mx-auto grid w-full max-w-[1500px] items-end gap-10 ${portrait ? 'lg:grid-cols-[minmax(0,1fr)_auto]' : ''}`}>
          <div className={portrait ? 'order-2 lg:order-1' : ''}>
            <p className="mono mb-4 flex flex-wrap gap-2 text-[11px]">
              {p.categories.map((c) => (
                <span key={c} className="rounded-sm bg-gold px-2 py-1 text-black">
                  {c}
                </span>
              ))}
              <span className="rounded-sm border border-paper/20 bg-black/40 px-2 py-1 text-paper/80">
                {p.year}
                {p.location ? ` · ${p.location}` : ''}
                {p.runtime ? ` · ${p.runtime}` : ''}
              </span>
            </p>
            <h1 className="display distress max-w-[16ch] text-[clamp(46px,6.6vw,112px)] text-paper">{p.title}</h1>
            <div className="mt-8">
              <CaseActions video={p.fullVideo} title={p.title} links={p.links} />
            </div>
          </div>
          {portrait && (
            <div
              data-vt-target={p.slug}
              style={{ viewTransitionName: 'project-hero' }}
              className="relative order-1 mx-auto aspect-[9/16] h-[min(72svh,760px)] overflow-hidden rounded-[4px] bg-ink shadow-[0_40px_120px_rgba(0,0,0,.7)] lg:order-2"
            >
              {heroMedia}
              <span className="mono absolute left-3 top-3 flex items-center gap-2 rounded-sm bg-black/60 px-2 py-1 text-[10px] text-paper">
                <span className="rec-dot h-1.5 w-1.5 rounded-full bg-[#ff2a2a]" /> CH 03 · {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* LOGLINE */}
      <section className="px-[var(--gutter)] py-[clamp(70px,10vw,140px)]">
        <div className="mx-auto max-w-[1200px] text-center">
          <BoltRule className="mx-auto mb-10 max-w-[360px]" />
          <p className="display-800 text-[clamp(34px,4.6vw,72px)] normal-case text-paper">“{p.logline}”</p>
          <p className="mono mt-6 text-[12px] text-paper/50">CLIENT — {p.client.toUpperCase()}</p>
        </div>
      </section>

      {/* BRIEF / SHOOT / CUT */}
      <section className="px-[var(--gutter)] pb-[clamp(70px,10vw,140px)]">
        <div className="mx-auto grid max-w-[1400px] gap-px overflow-hidden rounded-[4px] bg-paper/10 md:grid-cols-3">
          {[
            ['THE BRIEF', p.brief],
            ['THE SHOOT', p.shoot],
            ['THE CUT', p.cut],
          ].map(([h, t], n) => (
            <div key={h} className="bg-black p-[clamp(24px,3vw,44px)]">
              <p className="mono mb-5 text-[12px] text-gold">0{n + 1}</p>
              <h2 className="display mb-5 text-[clamp(34px,3.4vw,52px)] text-paper">{h}</h2>
              <p className="text-[16px] leading-relaxed text-paper/80">
                <Copy text={t} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* STILLS */}
      {gallery.length > 0 && (
        <section aria-label="Stills" className="pb-[clamp(70px,10vw,140px)]">
          <div className="mx-auto mb-6 flex max-w-[1500px] items-end justify-between px-[var(--gutter)]">
            <h2 className="display text-[clamp(34px,4vw,64px)]">
              <span className="text-paper">STILLS </span>
              <span className="text-gold">/ FRAMES</span>
            </h2>
            <p className="mono text-[11px] text-paper/50">{gallery.length} FRAMES · DRAG ⇆</p>
          </div>
          <DragScroll label={`${p.title} stills — drag or scroll horizontally`}>
            <ul className="flex w-max gap-4 px-[var(--gutter)] pb-2">
              {gallery.map((k, n) => {
                const e = media.images[k];
                return (
                  <li
                    key={k}
                    className="relative h-[min(62vh,620px)] shrink-0 overflow-hidden rounded-[3px] bg-ink"
                    style={{ aspectRatio: `${e.width} / ${e.height}` }}
                  >
                    <Picture
                      k={k}
                      alt={altFor(k, p.title, n + 1, gallery.length)}
                      fill
                      sizes="(min-width: 768px) 50vw, 90vw"
                      className="pointer-events-none object-cover"
                    />
                    <span className="mono absolute bottom-2 left-2 rounded-sm bg-black/60 px-1.5 py-0.5 text-[10px] text-paper/80">
                      {String(n + 1).padStart(2, '0')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </DragScroll>
        </section>
      )}

      <NextProject
        p={next}
        image={next.tileImage ? <Picture k={next.tileImage} alt="" fill sizes="100vw" className="object-cover" /> : undefined}
      />
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: p.title,
            abstract: p.logline,
            dateCreated: p.year,
            creator: { '@type': 'Organization', name: site.name, url: site.url },
            image: new URL(imgUrl(bg, 1280, 'webp'), site.url).toString(),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </article>
  );
}
