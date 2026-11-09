/** hl-about-03 "WHAT WE DO" — exact service list. */
export const services = [
  'VIDEO PRODUCTION',
  'PHOTOGRAPHY',
  'BRANDED CONTENT',
  'EVENT COVERAGE',
  'SOCIAL CONTENT',
  'DOCUMENTARY & STORYTELLING',
] as const;

/** hl-about-06 "THE VISION" — the three divisions, their words. */
export const divisions = [
  {
    id: 'media',
    name: ['CULTURE SHOCK', 'MEDIA'],
    tag: 'ORIGINAL CONTENT.',
    body: 'Original content people actually follow us to watch. Sports. Music. Culture. Interviews. Mini-docs. Recurring shows. Events. Personalities.',
    loop: 'reel-05',
    stills: [] as string[],
    alt: 'Culture Shock Original: the host in the violet LED studio talking video game soundtracks',
  },
  {
    id: 'creative',
    name: ['CULTURE SHOCK', 'CREATIVE'],
    tag: 'CREATIVE PRODUCTION.',
    body: 'Branded content. Campaigns. Social media. Photography. Documentaries. Storytelling that helps brands, organizations, athletes and entrepreneurs connect and grow.',
    loop: 'hl-work-08',
    stills: ['photo-15-03', 'photo-15-07'],
    alt: 'C Cubed Contracting owner Chris Fatogoma on camera in a hi-vis shirt',
  },
  {
    id: 'films',
    name: ['CULTURE SHOCK', 'FILMS'],
    tag: 'FILM.',
    body: 'Narrative and documentary filmmaking at the highest level. Creative freedom. Bigger stories. Bigger productions. Lasting impact.',
    loop: 'reel-16',
    secondaryLoop: 'reel-06',
    stills: [] as string[],
    alt: 'Master Crowns commercial buildout mini-doc: the finished space',
  },
] as const;

export const divisionsFooter = 'FROM ONE-TIME PRODUCTIONS TO ONGOING CREATIVE PARTNERSHIPS.';

export const vision =
  'Our vision is to build Culture Shock into a home for original media, branded storytelling and film — creating work that documents culture, shapes it and gives people something worth watching.';

/** hl-about-05 "WHO WE WORK WITH" + the categories used to filter the work grid. */
export const clientCategories = ['BRANDS', 'ORGANIZATIONS', 'ENTREPRENEURS', 'SPORTS', 'EVENTS', 'MUSIC'] as const;
export type ClientCategory = (typeof clientCategories)[number];

/** "Worked with" marquee — names only, never logos. TODO: confirm each client is OK being listed. */
export const workedWith = [
  'CollegeBound Foundation',
  'C Cubed Contracting',
  'Master Crowns',
  '378 Coaching',
  'Keeping Hopes Alive',
  'Franks Pizza & Pasta',
  'Paco Panama',
];

/** Gear, as captioned on their posts (#13, #20, #22, #29, poster for #13 "SIGMA 24-70"). */
export const gear = 'Shot on Sony FX3 / FX30 · Sigma 24-70';
