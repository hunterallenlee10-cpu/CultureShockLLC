import type { ClientCategory } from './services';

/**
 * CH 03 — Selected work. Every line is taken from the project's Instagram caption
 * (MANIFEST.json) or the WORK highlight. Anything the captions don't say is marked
 * "TODO: confirm with client" and rendered with a visible flag on the case study.
 */
export type Project = {
  slug: string;
  title: string;
  client: string;
  categories: ClientCategory[];
  year: string;
  location?: string;
  /** What the hero / tile shows. Video keys are media keys (reel-08, hl-work-05 …). */
  hero: { type: 'video'; key: string } | { type: 'image'; key: string };
  /** Bento tile: L = 16:9 wide, P = 9:16 tall, S = photo (3:2-ish). */
  tile: 'L' | 'P' | 'S';
  tileVideo?: string;
  tileImage?: string;
  /** Full-length cut to offer from the case study, if any. */
  fullVideo?: string;
  runtime?: string;
  logline: string;
  brief: string;
  shoot: string;
  cut: string;
  gallery: string[];
  links: { label: string; href: string }[];
  alt: string;
};

const ig = (code: string) => `https://www.instagram.com/p/${code}/`;
const range = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`);
const g = (key: string, n = 4) => Array.from({ length: n }, (_, i) => `${key}-g${i + 1}`);
const HIGHLIGHTS = 'https://www.instagram.com/_culturesh0ck/';

export const projects: Project[] = [
  {
    slug: 'collegebound-scholars-luncheon',
    title: 'CollegeBound Foundation — Scholars’ Luncheon',
    client: 'CollegeBound Foundation',
    categories: ['ORGANIZATIONS', 'EVENTS'],
    year: '2026',
    location: 'Baltimore, MD',
    hero: { type: 'video', key: 'reel-08' },
    tile: 'L',
    tileVideo: 'reel-08',
    fullVideo: 'reel-08',
    runtime: '2:13',
    logline: 'Celebrating the stories behind the achievement. 🎓',
    brief:
      'A look back at CollegeBound Foundation’s Scholars’ Luncheon — an afternoon recognizing the students, families, educators, and community helping make these moments possible.',
    shoot: 'Culture Shock had the opportunity to capture the day. TODO: confirm with client — venue, crew and camera package.',
    cut: 'A 2:13 recap that turns those moments into “a story that can live beyond the event.” This is the kind of work we love to create. ⚡',
    gallery: [...g('reel-08'), ...g('hl-work-03', 2)],
    links: [{ label: 'Watch on Instagram', href: ig('DdUCT2eBHVY') }],
    alt: 'CollegeBound Foundation Scholars’ Luncheon: guests and the Orioles mascot at the event',
  },
  {
    slug: 'collegebound-ambassadors',
    title: 'CollegeBound Foundation — Ambassador Portraits',
    client: 'CollegeBound Foundation',
    categories: ['ORGANIZATIONS'],
    year: '2026',
    location: 'Baltimore, MD',
    hero: { type: 'image', key: 'photo-21-02' },
    tile: 'P',
    tileImage: 'photo-21-02',
    logline: 'Student leaders sharing their college journeys to inspire the next generation. 🎓',
    brief:
      'Meet our CollegeBound Ambassadors — Baltimore high school graduates now at the University of Maryland, CCBC, Towson, Johns Hopkins, UMBC, UMES and Morgan State.',
    shoot: 'One portrait per ambassador. TODO: confirm with client — shoot date, location and lighting setup.',
    cut: 'Released as a 13-image carousel introducing each ambassador with their high school and current college.',
    gallery: [...range('photo-21', 13).slice(1), 'photo-21-01'],
    links: [{ label: 'View the carousel', href: ig('DT05ZGUDyIa') }],
    alt: 'Portrait of a CollegeBound Foundation student ambassador',
  },
  {
    slug: 'c-cubed-contracting',
    title: 'C Cubed Contracting — Production Day, Chicago',
    client: 'C Cubed Contracting',
    categories: ['BRANDS'],
    year: '2026',
    location: 'Chicago, IL',
    hero: { type: 'video', key: 'reel-17' },
    tile: 'P',
    tileVideo: 'reel-14',
    fullVideo: 'reel-14',
    logline: 'Different city. Same goal: create something worth watching. ⚡',
    brief: 'A production day with C Cubed in Chicago — on camera with owner Chris Fatogoma. “The work is taking us places.” ✈️🎥',
    shoot: 'Flew 700 miles for a couple clean shots ⚡️ — behind the scenes captured from our POV.',
    cut: 'A POV behind-the-scenes reel plus the owner feature. TODO: confirm with client — final deliverables.',
    gallery: [...g('hl-work-08', 2), ...g('reel-14'), ...g('reel-17', 2)],
    links: [
      { label: 'BTS reel on Instagram', href: ig('Dc1412cBjob') },
      { label: '“Flew 700 miles” on Instagram', href: ig('DYU7ZX4xhC2') },
    ],
    alt: 'POV shot of a camera rig and monitor on a C Cubed production day in Chicago',
  },
  {
    slug: 'master-crowns-buildout',
    title: 'Master Crowns — Commercial Buildout Doc',
    client: 'Master Crowns',
    categories: ['ENTREPRENEURS', 'BRANDS'],
    year: '2026',
    hero: { type: 'video', key: 'reel-16' },
    tile: 'P',
    tileVideo: 'reel-16',
    fullVideo: 'reel-16',
    runtime: '3:27',
    logline: 'Every business starts with a vision.',
    brief:
      'Then comes the plans. The construction. The inspections. And finally the moment you receive your Use & Occupancy. Proud to help bring Master Crowns’ vision to life.',
    shoot:
      'A commercial buildout completed by C Cubed Contracting, followed from plans to Use & Occupancy. TODO: confirm with client — shoot days and timeline.',
    cut: 'A 3:27 mini-doc of the buildout.',
    gallery: g('reel-16'),
    links: [{ label: 'Watch on Instagram', href: ig('DVrGxaCEdGj') }],
    alt: 'The finished Master Crowns space: a styling chair and hood dryer',
  },
  {
    slug: 'construction-process',
    title: 'Construction Series — Plans to Use & Occupancy',
    client: 'C Cubed Contracting',
    categories: ['BRANDS'],
    year: '2026',
    hero: { type: 'video', key: 'reel-28' },
    tile: 'P',
    tileVideo: 'reel-28',
    fullVideo: 'reel-28',
    runtime: '3:53',
    logline: 'Most people only see the finish. They do not see this part.',
    brief:
      'The plans on the table, the conversations, the moments where things change and you have to adjust in real time. Plans change. Conditions change. The expectation to deliver does not.',
    shoot:
      'On site through demo and pre-con: “The design called for plumbing and electrical in framed walls. The building gave us drywall glued to block.”',
    cut: 'Episodes like “Lesson learned: Demo exposes assumptions,” plus a photo carousel from the plans walkthrough. Every obstacle is tuition.',
    gallery: [...range('photo-19', 6), ...g('reel-28', 2), ...g('reel-19', 2)],
    links: [
      { label: '“Demo exposes assumptions”', href: ig('DUs5ZEBje6j') },
      { label: 'Plans carousel', href: ig('DXo6yL3DlfH') },
    ],
    alt: 'Contractor on site walking through a demo’d interior',
  },
  {
    slug: '378-coaching',
    title: '378 Coaching — Brand Photoshoot',
    client: '378 Coaching',
    categories: ['ENTREPRENEURS'],
    year: '2026',
    location: 'Baltimore, MD',
    hero: { type: 'image', key: 'photo-15-01' },
    tile: 'S',
    tileImage: 'photo-15-01',
    logline: 'Good branding starts before you ever say a word.',
    brief: 'A brand shoot with 378 Coaching — creating intentional imagery they can use across social, web, and marketing.',
    shoot: 'A brand photography session. TODO: confirm with client — location and date.',
    cut: 'A library of brand images for social, web and marketing. Ready to update your brand visuals? Let’s create ⚡️',
    gallery: range('photo-15', 11),
    links: [{ label: 'View on Instagram', href: ig('Dcv7v6Gj_Ps') }],
    alt: 'The 378 Coaching founder laughing at her desk with a coffee mug',
  },
  {
    slug: 'keeping-hopes-alive',
    title: 'Keeping Hopes Alive — Founder Story',
    client: 'Keeping Hopes Alive',
    categories: ['ORGANIZATIONS'],
    year: '2026',
    hero: { type: 'video', key: 'hl-work-05' },
    tile: 'P',
    tileVideo: 'hl-work-05',
    fullVideo: 'hl-work-05',
    logline: 'Founder story — Karahn Alston, Keeping Hopes Alive.',
    brief: 'TODO: confirm with client — project brief. Featured in the Culture Shock WORK highlight.',
    shoot: 'A founder interview on camera in front of the Keeping Hopes Alive backdrop. TODO: confirm with client — date and location.',
    cut: 'TODO: confirm with client — runtime and deliverables.',
    gallery: g('hl-work-05'),
    links: [{ label: 'WORK highlight on Instagram', href: HIGHLIGHTS }],
    alt: 'Karahn Alston speaking on camera in front of the Keeping Hopes Alive logo',
  },
  {
    slug: 'franks-pizza-one-bite',
    title: 'Franks Pizza & Pasta — One Bite Fest NYC 2025',
    client: 'Franks Pizza & Pasta',
    categories: ['BRANDS', 'EVENTS'],
    year: '2025',
    location: 'New York, NY',
    hero: { type: 'video', key: 'hl-work-04' },
    tile: 'P',
    tileVideo: 'hl-work-04',
    fullVideo: 'hl-work-04',
    logline: 'One Bite Fest NYC 2025.',
    brief: 'Content for Franks Pizza & Pasta at One Bite Fest NYC 2025. TODO: confirm with client — scope of work.',
    shoot: 'Close-up food coverage plus behind-the-scenes from our camera. TODO: confirm with client — crew and schedule.',
    cut: 'TODO: confirm with client — deliverables.',
    gallery: [...g('hl-work-04', 2), ...g('hl-work-09', 2), ...g('hl-bts-05', 2), ...g('hl-bts-07', 2)],
    links: [{ label: 'WORK highlight on Instagram', href: HIGHLIGHTS }],
    alt: 'A pizza being cut fresh for Franks Pizza & Pasta',
  },
  {
    slug: 'paco-panama',
    title: 'Paco Panama — “Johnny Dang” DMV Lifestyle Interview & Freestyle',
    client: 'Paco Panama',
    categories: ['MUSIC'],
    year: '2024',
    location: 'Studio Next Door',
    hero: { type: 'video', key: 'reel-25' },
    tile: 'P',
    tileVideo: 'reel-25',
    fullVideo: 'reel-25',
    runtime: '1:15',
    logline: 'Meet Paco. We talked lifestyle, culture, family, music and more.',
    brief:
      'DMV Lifestyle interview and freestyle 🔥 with @paco_panama — track: “Johnny Dang.” Curated by @justvibeofficial and @concertnextdoor.',
    shoot: '📍 Shot at @studio.next.door. 🎥 @_culturesh0ck @_griff8',
    cut: 'A teaser for the full episode: “Stay tuned for the full episode drop.”',
    gallery: g('reel-25'),
    links: [{ label: 'Watch on Instagram', href: ig('C9xrBUnRnk_') }],
    alt: 'Paco Panama at the mic against an orange studio wall',
  },
  {
    slug: 'nothing-into-something',
    title: 'Davon Ferguson — 2023 Official Highlights',
    client: 'Davon Ferguson',
    categories: ['SPORTS', 'MUSIC'],
    year: '2023',
    hero: { type: 'video', key: 'reel-24' },
    tile: 'L',
    tileVideo: 'reel-24',
    fullVideo: 'reel-24',
    runtime: '2:04',
    logline: 'Turned nothing into something and watched something turn into everything 🔮',
    brief: 'An athlete highlight film for Davon Ferguson’s 2023 season, cut to music by @veezeworst. #7reasons🖤',
    shoot: '🎥: @_griff8. TODO: confirm with client — which games Culture Shock shot, and clearance for the TV-broadcast clips in the cut.',
    cut: 'A 2:04 highlight film, cut 16:9 to the @veezeworst track.',
    gallery: g('reel-24'),
    links: [{ label: 'Watch on Instagram', href: ig('C0hpic0JSlG') }],
    alt: 'Game-day action from Davon Ferguson’s 2023 highlight film',
  },
  {
    slug: 'the-proposal',
    title: 'The Proposal',
    client: 'Private client',
    categories: ['EVENTS'],
    year: '2026',
    location: 'Maryland',
    hero: { type: 'image', key: 'photo-09-01' },
    tile: 'S',
    tileImage: 'photo-09-01',
    logline: 'Some moments only happen once. 💍',
    brief:
      'From the nerves before the question to the celebration after the yes — we had the opportunity to capture every part of this moment.',
    shoot: 'Proposal photography (#marylandphotography #dmvphotography). TODO: confirm with client — location and permission to feature.',
    cut: 'Congratulations to the happy couple. 🥂 Moments like these deserve to be remembered.',
    gallery: range('photo-09', 7),
    links: [{ label: 'View on Instagram', href: ig('DdNtQgwH7Qm') }],
    alt: 'The couple embracing in front of a white balloon heart and lit-up MARRY ME letters',
  },
  {
    slug: 'homecoming',
    title: 'Homecoming — Morgan State Bears',
    client: 'Morgan State homecoming',
    categories: ['EVENTS', 'SPORTS'],
    year: '2023',
    hero: { type: 'image', key: 'photo-37-01' },
    tile: 'S',
    tileImage: 'photo-37-01',
    logline: 'Homecoming around the corner 👀 see ya soon Bears 🫡 🧡💙',
    brief:
      'Homecoming photography — the mascot, the court, the crowd. TODO: confirm with client — Morgan State Bears (shirts and mascot are in frame) and permission to feature.',
    shoot: '📸: @_griff8',
    cut: 'A 10-image set.',
    gallery: range('photo-37', 10),
    links: [{ label: 'View on Instagram', href: ig('CxYJ_QmOHwF') }],
    alt: 'The Morgan State bear mascot posing with a young fan at homecoming',
  },
  {
    slug: 'headshots',
    title: 'Headshots — “Let your headshot be the opening scene”',
    client: '@maudfetti',
    categories: ['ENTREPRENEURS'],
    year: '2024',
    hero: { type: 'image', key: 'photo-29-01' },
    tile: 'P',
    tileImage: 'photo-29-01',
    logline: 'Every frame tells a story — let your headshot be the opening scene 🎬💫',
    brief: 'Headshots for @maudfetti.',
    shoot: '📸: @_griff8 · Camera: Sony FX30',
    cut: 'TODO: confirm with client — deliverables.',
    gallery: range('photo-29', 2),
    links: [{ label: 'View on Instagram', href: ig('DC435BURcP6') }],
    alt: 'Headshot of a young man with locs in a green sweatshirt against a red backdrop',
  },
  {
    slug: 'education-content',
    title: 'Early Education Center Content',
    client: 'TODO: confirm client name',
    categories: ['ORGANIZATIONS'],
    year: '2026',
    hero: { type: 'video', key: 'hl-work-07' },
    tile: 'P',
    tileVideo: 'hl-work-07',
    fullVideo: 'hl-work-07',
    logline: 'Classroom moments for an early education center.',
    brief: 'TODO: confirm with client — the center’s name and the project brief.',
    shoot:
      'Classroom coverage, featured in the Culture Shock WORK highlight. TODO: confirm media releases for the children on camera before launch.',
    cut: 'TODO: confirm with client — deliverables.',
    gallery: [...g('hl-work-07', 2), ...g('hl-work-10', 2), ...g('hl-work-11', 2)],
    links: [{ label: 'WORK highlight on Instagram', href: HIGHLIGHTS }],
    alt: 'A young student working on a craft project at a classroom table',
  },
  {
    slug: 'friday-night-lights',
    title: 'High School Football — Cinematic Highlights',
    client: 'High school football',
    categories: ['SPORTS'],
    year: '2024',
    hero: { type: 'video', key: 'reel-35' },
    tile: 'L',
    tileVideo: 'reel-35',
    fullVideo: 'reel-35',
    logline: 'Raw moments. Real energy.',
    brief:
      'Game-day edits from the 2024 high school football season — Knights vs Engineers, Swords vs Owls, FNL, Crashouts and “routes like Tyreek.”',
    shoot: 'Sideline coverage on the Sony FX30. TODO: confirm with client — teams, schools and permission to feature.',
    cut: 'Short, color-graded highlight edits for Instagram. The beauty of color grading. 🥰',
    gallery: [
      'reel-35-still',
      'reel-30-still',
      'reel-31-still',
      'reel-32-still',
      'reel-33-still',
      'reel-36-still',
      'still-helmet',
      'still-cardinals',
    ],
    links: [
      { label: '“Routes like Tyreek”', href: ig('C_geHIxSOh0') },
      { label: 'Knights vs Engineers', href: ig('DBo8eyjx04r') },
    ],
    alt: 'Players in red take the field through smoke before kickoff',
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
