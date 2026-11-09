/**
 * CH 02 — Culture Shock Originals. Titles, captions, plays and likes come from MANIFEST.json.
 * Runtime is the real clip length.
 */
export type Episode = {
  ep: string;
  slug: string;
  video: string; // media key
  title: string;
  excerpt: string;
  runtime: string;
  posted: string;
  plays?: number;
  likes?: number;
  badge?: string;
  permalink: string;
  lead?: boolean;
};

export const originals: Episode[] = [
  {
    ep: 'EP 01',
    slug: 'video-game-soundtracks',
    video: 'reel-05',
    title: 'Before the algorithm, we had video game soundtracks.',
    excerpt: 'Before the algorithm, we had video game soundtracks. 🎮',
    runtime: '0:41',
    posted: '2026-09-21',
    plays: 106225,
    likes: 12718,
    badge: '100K+ VIEWS',
    permalink: 'https://www.instagram.com/p/DdkSnqAB8NZ/',
    lead: true,
  },
  {
    ep: 'EP 02',
    slug: 'music-videos-built-worlds',
    video: 'reel-04',
    title: 'When Music Videos Built Worlds',
    excerpt: 'Music videos used to be an experience of their own. 🎬 What’s one music video from your childhood you’ll never forget?',
    runtime: '0:55',
    posted: '2026-10-10',
    plays: 2716,
    likes: 161,
    permalink: 'https://www.instagram.com/p/DeVQ4h3ghtL/',
  },
  {
    ep: 'EP 03',
    slug: 'nevermind-35',
    video: 'reel-07',
    title: 'Nevermind: 35 Years Later',
    excerpt:
      '35 years ago today, Nevermind changed everything. 🎸 What started with modest expectations became one of the defining albums of its generation, and helped push an entirely different sound into the mainstream.',
    runtime: '0:34',
    posted: '2026-09-24',
    plays: 2294,
    likes: 136,
    permalink: 'https://www.instagram.com/p/Ddr9oLmB4CL/',
  },
  {
    ep: 'EP 04',
    slug: 'the-wire',
    video: 'reel-06',
    title: 'The Wire: why cultural context matters',
    excerpt:
      'The Wire wasn’t just writing characters. It was writing environments, circumstances, and the people shaped by them. Michael. Namond. Dukie. Randy. Same neighborhood. Completely different kids.',
    runtime: '2:09',
    posted: '2026-09-27',
    plays: 1343,
    likes: 60,
    permalink: 'https://www.instagram.com/p/DdxkH0WgEFp/',
  },
  {
    ep: 'EP 05',
    slug: 'production-ruined-football',
    video: 'reel-11',
    title: 'Working in production ruined football for me',
    excerpt:
      'Football looks a lot different when you start paying attention to everything except the football. 🎥🏈 What part of an NFL broadcast do you notice the most?',
    runtime: '1:10',
    posted: '2026-09-08',
    plays: 2907,
    permalink: 'https://www.instagram.com/p/DdC3tRLBCrR/',
  },
];
