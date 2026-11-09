import { Hero } from '@/components/sections/Hero';
import { Ticker } from '@/components/sections/Ticker';
import { Manifesto } from '@/components/sections/Manifesto';
import { Divisions } from '@/components/sections/Divisions';
import { Originals } from '@/components/sections/Originals';
import { Work } from '@/components/sections/Work';
import { Sports } from '@/components/sections/Sports';
import { Proof } from '@/components/sections/Proof';
import { Founder } from '@/components/sections/Founder';
import { Bts } from '@/components/sections/Bts';
import { TravelMap } from '@/components/sections/TravelMap';
import { Join } from '@/components/sections/Join';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { site } from '@/content/site';
import { originals } from '@/content/originals';
import { founder } from '@/content/founder';
import { services } from '@/content/services';
import { fullVideo, imgUrl, media } from '@/lib/media';
import { Picture } from '@/components/media/Picture';
import { projects } from '@/content/projects';
import { divisions } from '@/content/services';
import { photoAlts } from '@/content/alts';

function jsonLd() {
  const url = site.url;
  const abs = (p: string) => new URL(p, url).toString();
  const reel = fullVideo('reel-23');
  const iso = (s: number) => `PT${Math.floor(s / 60)}M${Math.round(s % 60)}S`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': `${url}#business`,
        name: site.name,
        alternateName: site.legalName,
        description: site.seo.description,
        url,
        logo: abs('/media/brand/logo.svg'),
        image: abs(imgUrl('hero-poster', 1280, 'webp')),
        slogan: site.tagline,
        areaServed: [
          { '@type': 'City', name: 'Washington, DC' },
          { '@type': 'State', name: 'Maryland' },
          { '@type': 'State', name: 'Virginia' },
        ],
        address: { '@type': 'PostalAddress', addressRegion: 'MD', addressCountry: 'US' }, // TODO: confirm business address
        sameAs: [site.instagram],
        founder: { '@id': `${url}#founder` },
        knowsAbout: services.map((s) => s.toLowerCase()),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services',
          itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s } })),
        },
      },
      {
        '@type': 'Person',
        '@id': `${url}#founder`,
        name: 'Brandon J. Griffin',
        honorificSuffix: 'M.A.',
        jobTitle: 'Founder + Creative Director',
        description: `${founder.disciplines.join(', ')}. ${founder.vision}`,
        image: abs(imgUrl('founder', 640, 'webp')),
        sameAs: [founder.instagram],
        worksFor: { '@id': `${url}#business` },
      },
      ...(reel
        ? [
            {
              '@type': 'VideoObject',
              name: 'Culture Shock — 2024 Reel',
              description: 'The 2024 Culture Shock showreel: sports, music, lifestyle and brand work from the DMV.',
              thumbnailUrl: abs(imgUrl('hero-poster', 1280, 'webp')),
              uploadDate: '2025-01-03',
              duration: iso(reel.duration),
              contentUrl: abs(reel.mp4),
              embedUrl: 'https://www.instagram.com/p/DEWCBc9xy_R/',
              publisher: { '@id': `${url}#business` },
            },
          ]
        : []),
      ...originals.map((e) => {
        const v = media.videos[e.video];
        return {
          '@type': 'VideoObject',
          name: e.title,
          description: e.excerpt,
          thumbnailUrl: abs(v?.loop.poster || imgUrl('hero-poster')),
          uploadDate: e.posted,
          duration: v ? iso(v.duration) : undefined,
          embedUrl: e.permalink,
          url: e.permalink,
          publisher: { '@id': `${url}#business` },
          ...(e.plays
            ? {
                interactionStatistic: {
                  '@type': 'InteractionCounter',
                  interactionType: { '@type': 'WatchAction' },
                  userInteractionCount: e.plays,
                },
              }
            : {}),
        };
      }),
    ],
  };
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, '\\u003c') }} />
      <Hero />
      <Ticker />
      <Manifesto />
      <Divisions
        stills={Object.fromEntries(
          divisions
            .flatMap((d) => d.stills)
            .map((k) => [
              k,
              <Picture key={k} k={k} alt={photoAlts[k] ?? '378 Coaching brand photoshoot'} fill sizes="200px" className="object-cover" />,
            ]),
        )}
      />
      <Originals />
      <Work
        images={Object.fromEntries(
          projects
            .filter((p) => p.tileImage)
            .map((p) => [
              p.slug,
              <Picture
                key={p.slug}
                k={p.tileImage!}
                alt={p.alt}
                fill
                sizes={p.tile === 'P' ? '(min-width: 768px) 25vw, 50vw' : '(min-width: 768px) 50vw, 100vw'}
                className="object-cover"
              />,
            ]),
        )}
      />
      <Sports />
      <Proof />
      <Founder />
      <Bts />
      <TravelMap background={<Picture k="photo-19-08" alt="" fill sizes="100vw" className="object-cover opacity-30" />} />
      <Join />
      <Contact />
      <Footer />
    </>
  );
}
