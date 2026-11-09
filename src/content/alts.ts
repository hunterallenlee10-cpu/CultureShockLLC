/**
 * Alt text for every photo, written from what is in the frame.
 * Video frames fall back to "Frame from <project>" (see altFor()).
 */
const proposal = [
  'The couple embracing in front of a white balloon heart and lit-up MARRY ME letters',
  'Close-up of the engagement ring on her hand',
  'The newly engaged couple smiling as she shows the ring',
  'The couple posing with the ring in front of the balloon heart',
  'The bride-to-be celebrating with a friend in a green dress',
  'Neon sign reading “It was always you” on a dark curtain',
  'The proposal set: balloon heart, candles and MARRY ME marquee letters',
];
const coaching = [
  'The 378 Coaching founder laughing at her desk with a coffee mug',
  'At her desk under the 378 Coaching sign, mug in hand',
  'Working at her laptop beneath the 378 Coaching logo',
  'Standing portrait in a denim jacket and pink dress, holding a mug',
  'Desk details: a “God is within her, she will not fall” sign, flowers and mug',
  'Smiling at her desk with the 378 Coaching sign behind her',
  'Resting her chin on her hand at the desk, faith sign in the foreground',
  'At the laptop under the 378 Coaching logo',
  'Typing at her laptop, desk calendar in the foreground',
  'Close-up of the “God is within her” sign, pink mug and BELIEVE block',
  'Laughing at her desk, mug in hand',
];
const construction = [
  'C Cubed contractor in a pink shirt walking through an open office',
  'Two contractors talking through the space, one pointing at the ceiling',
  'Walking the corridor during a site visit',
  'The team reviewing plans at a table',
  'Contractor explaining a detail at the plans table',
  'Pointing across the table while reviewing plans',
];
const ambassadors = [
  'Graphic: “Meet our CBF Ambassadors” collage of student portraits',
  ...Array.from({ length: 12 }, () => 'CollegeBound Foundation student ambassador portrait on a soft backdrop'),
];
const homecoming = [
  'The Morgan State bear mascot posing with a young fan at homecoming',
  'A fan in purple posing at night under the stadium lights',
  'Fan in a Morgan State shirt throwing up a sign at night',
  'A man in a jacket posing in front of the packed stands',
  'Friends posing with peace signs in the homecoming crowd',
  'Two friends taking a selfie together at homecoming',
  'A man in a Morgan State jacket on the track',
  'A camera crew interviewing on the track',
  'Homecoming court in sashes and crowns',
  'A young fan in sunglasses in the crowd',
];

const pad = (n: number) => String(n).padStart(2, '0');
export const photoAlts: Record<string, string> = {
  ...Object.fromEntries(proposal.map((a, i) => [`photo-09-${pad(i + 1)}`, a])),
  ...Object.fromEntries(coaching.map((a, i) => [`photo-15-${pad(i + 1)}`, a])),
  ...Object.fromEntries(construction.map((a, i) => [`photo-19-${pad(i + 1)}`, a])),
  'photo-19-08': 'An airplane wing over the clouds at sunset',
  ...Object.fromEntries(ambassadors.map((a, i) => [`photo-21-${pad(i + 1)}`, a])),
  'photo-29-01': 'Headshot of a young man with locs in a green sweatshirt against a red backdrop',
  'photo-29-02': 'Headshot, looking down and to the side, against a red backdrop',
  ...Object.fromEntries(homecoming.map((a, i) => [`photo-37-${pad(i + 1)}`, a])),
  'still-cardinals': 'The “Home Sweet Home” athlete shoot: a young athlete in a red and gold jersey at a table',
  'still-helmet': 'Close-up of a football player in a white and gold helmet',
  'still-tunnel': 'A performer in a stadium tunnel',
};

export const altFor = (key: string, project: string, n: number, total: number) =>
  photoAlts[key] ?? `Frame ${n} of ${total} from ${project}`;
