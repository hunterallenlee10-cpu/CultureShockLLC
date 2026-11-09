/**
 * Site-wide copy. Edit freely — components read from here.
 * Everything below is taken from Culture Shock's own posts and story-highlight cards.
 */
export const site = {
  name: 'Culture Shock',
  legalName: 'Culture Shock Media + Production',
  tagline: 'We create stories worth watching.',
  pillars: 'Film • Content • Culture',
  location: 'DMV | Available for travel',
  handle: '@_culturesh0ck',
  instagram: 'https://www.instagram.com/_culturesh0ck/',
  founderHandle: '@_griff8',
  founderInstagram: 'https://www.instagram.com/_griff8/',
  inquiryForm: 'https://forms.gle/6EYZjfDeGeY7xHz6A',
  hiringEmail: 'griff8@cultureshockllc.org',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cultureshock.example',
  seo: {
    title: 'Culture Shock | Film, Content & Media Production — DMV',
    description:
      'Culture Shock is a DMV multimedia production company built around storytelling, creativity and culture — video production, photography, branded content, event coverage, sports and documentary. Available for travel.',
  },
  copyright: '© 2026 Culture Shock Media + Production',
} as const;

/** The six channels of the "On Air" broadcast. Each section on the page belongs to one. */
export const channels = [
  { n: 1, id: 'home', name: 'HOME' },
  { n: 2, id: 'originals', name: 'ORIGINALS' },
  { n: 3, id: 'work', name: 'WORK' },
  { n: 4, id: 'sports', name: 'SPORTS' },
  { n: 5, id: 'bts', name: 'BTS' },
  { n: 6, id: 'contact', name: 'CONTACT' },
] as const;
export type ChannelId = (typeof channels)[number]['id'];

export const hero = {
  lines: ['WE CREATE STORIES', 'WORTH WATCHING.'],
  sub: 'Film • Content • Culture ⚡ Broadcasting & media production — DMV, available for travel.',
  playLabel: '▶ PLAY THE 2024 REEL',
  ctaLabel: 'START A PROJECT',
};

/** hl-about-02 "WHO WE ARE" — their words, verbatim. */
export const manifesto = {
  kicker: 'MORE THAN A PRODUCTION COMPANY.',
  taglines: ['STORYTELLING', 'CREATIVITY', 'CULTURE'],
  // Wrap the gold phrase in [[ ]].
  body: 'Culture Shock is a multimedia production company built around [[storytelling, creativity and culture.]] We create compelling visual content for brands, organizations, athletes, events and people — turning ideas and real moments into stories worth watching.',
  stamp: 'CREATE. CONNECT. IMPACT.',
};

/** hl-about-07 "LET'S CREATE SOMETHING." */
export const contact = {
  title: ["LET'S", 'CREATE', 'SOMETHING.'],
  body: 'Have a story to tell, a brand to build, or an idea worth bringing to life? Let’s make something people remember.',
  secondary: 'PREFER THE INQUIRY FORM? ↗',
  signoff: 'FROM CONCEPT TO FINAL CUT.',
  projectTypes: [
    'Video Production',
    'Photography',
    'Branded Content',
    'Event Coverage',
    'Social Content',
    'Documentary',
    'Sports',
    'Music Video',
  ],
  // TODO: confirm budget bands with the client.
  budgets: ['Under $1,000', '$1,000 – $2,500', '$2,500 – $5,000', '$5,000 – $10,000', '$10,000+', 'Not sure yet'],
};

/** Post #26 — the hiring graphic. Full caption, verbatim. */
export const hiring = {
  headline: '⚡ Join the Culture Shock team.',
  short: 'We’re looking for interns and entry-level creatives.',
  body: 'We’re looking for interns and entry-level creatives who are ready to create, learn, and grow in the world of media production. If you’re passionate about storytelling, sports, entertainment, digital content, or filmmaking, this is your chance to get real hands-on experience.',
  roles: ['🎥 Videography', '✂️ Video Editing', '📝 Sports, Fashion & Pop Culture Writing', '📱 Social Media Content Creation'],
  who: 'Whether you’re a graduating senior, recent graduate, or emerging creative looking to sharpen your skills, we want people who are hungry to build something bigger.',
  kicker: 'Real projects. Real production experience. Real opportunities.',
  apply: 'Send your resume, portfolio, and social media handles to:',
  permalink: 'https://www.instagram.com/p/DZGo1OiA9Yg/',
};
