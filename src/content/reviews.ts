/**
 * Transcribed verbatim from their CLIENT REVIEWS highlight. No names were shown,
 * so attributions are descriptive labels only. Do not add names without permission.
 */
export type Review = {
  stars?: 5;
  who: string;
  kind: 'review' | 'text';
  quote: string;
  /** Optional image key paired with the quote. */
  image?: string;
  imageAlt?: string;
};

export const reviews: Review[] = [
  {
    stars: 5,
    who: 'Construction client',
    kind: 'review',
    quote:
      'I’ve been working with Culture Shock on a few of our construction projects and the quality of work has been top tier. He really knows how to capture the story of a project, not just the finished space but the process behind it. The footage always comes out clean, professional, and exactly the kind of content we need for marketing our work. What I appreciate most is how easy he is to work with. Shows up on time, understands the vision, and brings creative ideas to the table. For our recent salon project he helped us capture everything from client reactions to the final walkthrough and the videos came out great. If you’re looking for someone who can take your brand content to the next level, I definitely recommend Culture Shock.',
  },
  {
    stars: 5,
    who: 'Client',
    kind: 'review',
    quote: 'Awesome! Professional, fast, reliable & creative. I’ll be booking long term.',
  },
  {
    who: 'Client (text message)',
    kind: 'text',
    quote: 'We locked in on everything moving forward bro love the work you really exceeded my expectations‼️',
  },
  {
    stars: 5,
    who: 'Parent, athlete shoot',
    kind: 'review',
    quote:
      'Let me start off by saying how professional Brandon is. My son and I shared our ideas and Brandon made it come to life‼️ I am a very happy customer and now friend.. thank you Brandon our family appreciate you‼️',
    image: 'still-cardinals',
    imageAlt: 'The “Home Sweet Home” athlete shoot: a young athlete in a red and gold Cardinals jersey at a table',
  },
  {
    who: 'Client (text message)',
    kind: 'text',
    quote: 'Oh my goodness! These pictures are ABSOLUTELY BEAUTIFUL!!! Thank you soooo much!!!!',
    image: 'photo-09-03',
    imageAlt: 'A frame from the proposal photoshoot',
  },
  {
    stars: 5,
    who: 'Client',
    kind: 'review',
    quote: 'Very quick with responses. I would 10/10 recommend! Thank you again. I will refer you to others.',
  },
  {
    stars: 5,
    who: 'Client',
    kind: 'review',
    quote: 'Great service, quick replies, & quality product!',
  },
];
