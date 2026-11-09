/** CH 05 — hl-bts-01 card + BTS reels (captions from MANIFEST.json). */
export const btsHeader = {
  title: ['BEHIND', 'THE', 'SCENES'],
  line: 'ON SET WITH CULTURE SHOCK',
  values: ['SHOOT', 'DIRECT', 'CREATE'],
};

/** “The setup vs. the shot” before/after slider pairs. */
export const setupVsShot = [
  {
    id: 'interview',
    label: 'Interview setup',
    caption: 'The setup vs. what we captured. 🎥',
    detail: 'Finding the right angle, working with the available light, and making small adjustments until the shot feels right.',
    before: 'bts01-setup',
    after: 'bts01-shot',
    href: 'https://www.instagram.com/p/Dfc15dJhV0F/',
  },
  {
    id: 'fx3',
    label: 'Night walk, Sony FX3',
    caption: 'The set up vs. the shot 📸 on Sony FX3',
    detail: 'Gimbal, color grade, one street light.',
    before: 'bts22-setup',
    after: 'bts22-shot',
    href: 'https://www.instagram.com/p/DGjtlGCxgUs/',
  },
] as const;

/** Film strip of BTS loops. */
export const btsStrip = [
  { key: 'reel-02', label: 'POV: Life in production' },
  { key: 'hl-bts-02', label: 'Monitor check' },
  { key: 'reel-12', label: 'Flow state strikes at midnight' },
  { key: 'hl-bts-04', label: 'Event room setup' },
  { key: 'reel-13', label: '2 days. 2 cities. 1 bag.' },
  { key: 'hl-bts-06', label: 'Rig + monitor' },
  { key: 'reel-10', label: 'Milwaukee day trip ✈️' },
  { key: 'hl-bts-03', label: 'Night shoot' },
  { key: 'reel-03', label: 'Sometimes it works 🤷🏾‍♂️' },
  { key: 'hl-bts-08', label: 'Camera in hand' },
  { key: 'hl-bts-05', label: 'One Bite Fest NYC' },
  { key: 'hl-bts-07', label: 'One Bite Fest — BTS' },
];
