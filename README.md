# Culture Shock — “On Air”

Spec site for **Culture Shock**, a DMV multimedia production company. The whole site is staged as a live broadcast: six channels (HOME, ORIGINALS, WORK, SPORTS, BTS, CONTACT), a persistent broadcast HUD (● REC + running SMPTE timecode, channel readout, sound toggle), and a gold brush-wipe “shock” transition every time the channel changes.

Every image and video comes from Culture Shock’s own Instagram posts and story highlights. All copy comes from their captions and highlight cards. Nothing is stock, invented, or placeholder. Anything the captions don’t confirm is marked `TODO: confirm with client` and shows up as a dashed gold flag on the page.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · GSAP (ScrollTrigger, Flip) · Lenis · OGL (one WebGL canvas) · Resend.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Remote control: keys **1–6** change channel, **G** opens the program guide.

---

## Media pipeline

Raw assets are never shipped. `scripts/prepare-media.mjs` turns the asset pack into web media under `public/media` and writes the typed index `src/content/media.json` (read by `src/lib/media.ts` on the server and by a slim `media.client.json` in the browser).

### 1. Get the raw assets

```bash
pip install gdown
mkdir -p assets-raw && cd assets-raw
gdown 1j2P825gjMGHerAQ1wQJeLPMRkPxwwEYT -O culture-shock-assets.zip
unzip -q culture-shock-assets.zip && rm culture-shock-assets.zip
cd ..
```

`assets-raw/` and `media-full/` are gitignored.

### 2. Run it

```bash
npm run media                                   # everything except full-length cuts (~15 min on 4 cores)
node scripts/prepare-media.mjs --stage=full     # full-length MP4 + WebM (slow, ~1 h)
node scripts/prepare-media.mjs --stage=loops --force   # redo one stage
node scripts/build-map.mjs                      # US map path data for the travel section
```

Stages: `images, logo, textures, loops, clips, stills, cuts, hero, full, index`. Outputs are cached, so a file that already exists is skipped unless you pass `--force`. Requires `ffmpeg` with libx264 + libvpx-vp9.

| Stage | Output |
|---|---|
| images | Every JPG → AVIF + WebP at 640/1280/1920 (never upscaled) + 16px blur placeholder. Founder portrait cropped out of `hl-about-04`. |
| logo | `brand/logo.svg`: the wordmark traced from the 1080² JPG (gold layer + black silhouette, gold gradient). JPG kept as fallback. |
| textures | Their gold brush slashes + halftone cut from `hl-about-01`, keyed off black → `brush-tl.webp`, `brush-br.webp`. Procedural `grunge.png` mask for the distressed headline finish. |
| loops | A 6s silent hover loop for every clip (540w portrait / 960w landscape, ≤600 KB, MP4 + WebM), starting at the most kinetic window found by scene detection. First-frame poster for each. |
| clips | The “setup vs. the shot” slider pairs cut from reels 01 and 22. |
| stills | 4 gallery frames per case-study video + named frames (Cardinals athlete shoot, helmet, tunnel). |
| cuts | Hard-cut timestamps inside each loop (drives the sports wall’s camera flash). |
| hero | 21.2s seamless 16:9 loop from the 2024 reel (12 shots) at 1280w ≤4 MB and 960w ≤1.5 MB, plus a 9:16 mobile loop from reels 35, 05 and 11. |
| full | Full-length H.264 + VP9, max 1080 on the long edge. The 2024 reel goes to `public/media/full`; everything else goes to `media-full/` for Vercel Blob. |

### Fixes applied to the footage (verified frame by frame)

- **Reels 30, 31, 32, 34, 35, 36** were posted rotated 90°. `transpose=2` (90° counter-clockwise) stands the players up. Once upright these are **16:9 landscape** clips, so the sports wall shows them as tall slats with `object-fit: cover` that widen to the full frame on hover.
- **Reel 33** (FNL) and **reel 20** are landscape clips letterboxed inside 9:16 → cropped to `720×400`.
- **Reel 22** is pillarboxed → cropped.
- **hl-sports-02…06** and **hl-bts-03** are landscape bands on a gradient fill (the black-bar detector misses these) → cropped to the band, measured per clip.
- The Instagram covers for reels 20, 22, 23, 24 and 30–36 were sideways, letterboxed or black, so their posters are regenerated from the fixed video.

### Budget

`public/media` ≈ 106 MB (budget 120 MB): images 29 MB, loops 54 MB, hero 12 MB, 2024 reel ~12 MB, brand 0.4 MB. The other full-length cuts are ~300 MB, so they live on **Vercel Blob**:

```bash
BLOB_READ_WRITE_TOKEN=… node scripts/upload-blob.mjs
# then set NEXT_PUBLIC_MEDIA_BLOB_BASE=<printed URL> in Vercel
```

Until that variable is set, case studies and Originals fall back to their loops + “Watch on Instagram”, and the “Play the full cut” buttons stay hidden.

---

## Editing content

All copy lives in `src/content/`. Components only read from these files.

| File | What |
|---|---|
| `site.ts` | Brand, SEO, hero copy, manifesto, contact copy + form options, hiring band |
| `services.ts` | Service list (ticker), the three divisions, client categories, “Worked with” names, gear line |
| `originals.ts` | CH 02 episodes (title, caption excerpt, runtime, plays, permalink) |
| `projects.ts` | CH 03 projects + case studies (`/work/[slug]`) |
| `reviews.ts` | Client reviews, verbatim, with descriptive attributions only |
| `founder.ts` | Meet the Founder |
| `sports.ts`, `bts.ts`, `travel.ts` | Section content |
| `alts.ts` | Alt text for every photo |

To add a project, add its media to the asset pack, re-run `npm run media`, then add an entry to `projects.ts` (and its slug to `ORDER` in `src/components/sections/Work.tsx`).

---

## Architecture notes

- **One WebGL canvas.** Only the hero runs a shader: chromatic aberration that opens up with scroll velocity, a horizontal sync tear, grain, scanlines and vignette. The Originals CRT glass is CSS (curved bezel, glass highlight, scanlines, channel-flip static) to stay within that budget.
- **LCP:** the hero poster (AVIF/WebP, art-directed 16:9 / 9:16, preloaded) is the LCP element. The video and WebGL start only after `load` + preloader.
- **Video:** every loop uses `preload="none"` + poster, attaches sources ~600px before entering the viewport, plays only while ≥35% visible, and is capped per group (≤3 at once in the work grid).
- **Reduced motion:** no shader, no autoplay, no Lenis, no preloader. Reveals become crossfades.
- **Media index split:** `media.json` (images, blur placeholders) stays on the server; client components get `media.client.json` (~30 KB) so the image index never ships as JavaScript.
- **View Transitions:** work tiles morph into the case-study hero (`TransitionLink`), with a normal navigation fallback.
- **SEO:** metadata, OG image (`app/opengraph-image.tsx`: wordmark + their brush slashes), JSON-LD `LocalBusiness` (areaServed DC/MD/VA), `VideoObject` (2024 reel + each Original), `Person` (founder), `CreativeWork` per case study, sitemap and robots.

## QA

```bash
npm run build && npm start
node scripts/screenshots.mjs        # → qa/screens/{desktop,mobile}/*.png at 1440×900 and 390×844
```

---

## TODO — needs client confirmation before launch

**Permissions and people**
- [ ] **Founder photo**: currently cropped from the “Meet the Founder” story card (`hl-about-04`, ~425px wide). Get the original, higher-resolution photo.
- [ ] **Reel 27 (“Never playin”)**: shows someone in the same “FILM CREW” cap and orange “500” shirt as the founder photo. Confirm it’s Brandon before using it (it isn’t used yet).
- [ ] **Clients listed by name** (Worked-with marquee + case studies): CollegeBound Foundation, C Cubed Contracting, Master Crowns, 378 Coaching, Keeping Hopes Alive, Franks Pizza & Pasta, Paco Panama, Davon Ferguson, @maudfetti. Confirm each is OK to feature.
- [ ] **Minors on camera**: Early Education Center content (children in a classroom), the CollegeBound luncheon, and the Morgan State homecoming crowd. Confirm media releases.
- [ ] **Early Education Center**: the client’s name isn’t in any caption.
- [ ] **Keeping Hopes Alive** (Karahn Alston), **Franks Pizza & Pasta / One Bite Fest**, **C Cubed owner Chris Fatogoma**: names come from the brief, not captions. Confirm spelling and scope.
- [ ] **Homecoming**: Morgan State shirts and the bear mascot are in frame, and the caption says “bears”. Confirm it’s Morgan State and that it’s OK to name them.
- [ ] **High school football**: confirm the teams/schools and permission to feature (Knights vs Engineers, Swords vs Owls, FNL).
- [ ] **Reel 24 is not a music video.** It’s *Davon Ferguson — 2023 Official Highlights*, cut to a @veezeworst track, and it contains TV-broadcast clips (scorebugs at ~0:56 and ~1:12). Confirm usage rights before featuring it.
- [ ] **Originals use third-party footage** (games, NFL broadcast clips, album art) as commentary. Fine on Instagram, but worth a check before it autoplays on the company site.
- [ ] **Reviews**: transcribed verbatim with no names. Confirm the reviewers are OK being quoted.

**Business details**
- [ ] **Contact form email**: set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (see `.env.example`) and verify the sending domain in Resend. Until then the form validates, then points people to the Google inquiry form.
- [ ] **Budget ranges** in the form (`site.ts → contact.budgets`) are placeholders. Set real bands.
- [ ] **Case-study details** flagged `TODO:` in `projects.ts` (venues, dates, crew, deliverables).
- [ ] **Business address / region** for JSON-LD (`app/page.tsx`, currently `addressRegion: MD`).
- [ ] **Domain**: set `NEXT_PUBLIC_SITE_URL`.
- [ ] **Full-length cuts**: upload to Vercel Blob (above) and set `NEXT_PUBLIC_MEDIA_BLOB_BASE`.
