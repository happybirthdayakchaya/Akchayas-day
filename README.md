# A Birthday Story for Akchaya 🌹

A cinematic, scene-by-scene interactive birthday experience — built to feel
like a story that unfolds, not a template. Red & white theme, roses as the
recurring motif, warming into a deep-burgundy finale.

The story runs as named chapters with interactive moments along the way:

```
Countdown 10 → 1
        → Opening → Ch.1 → Photo → Ch.2 → Birthday Reveal 🎊
        → Living numbers ⏱️ → Cake (blow out 30 candles) 🎂
        → Ch.3 → Gift (tap to unwrap) 🎁 → Special Video
        → Scratch card 🎟️ → Ch.4 → 30 Wishes
        → Letter 💌 → Ch.5 → Finale 🎆
```

**Interactive moments**
| Scene | What she does |
| --- | --- |
| 🎂 Cake | Taps to blow out 30 candles → flames wave out in sequence, smoke curls, confetti. Then **cuts the cake**: a knife swings down, sparklers ignite and three confetti volleys go off |
| 🎁 Gift | Taps the wrapped box → lid lifts, light pours out; it opens into the special video |
| 🎟️ Scratch | Drags a finger across foil to uncover a private message (tap-to-reveal fallback for keyboard) |
| 🎈 Balloons | On the cake and finale scenes, balloons can be **tapped to pop** — sound + a scatter of scraps |
| ▶️ Every video | A **fullscreen button** (with an iPhone fallback, since iOS only allows the video element itself to go fullscreen) |
| 🌹 Thumbnails | Every clip — the 36 wishes *and* the special video — shows a rose card while it loads, and it stays if the network drops |
| ⏱️ Living numbers | A live count of how long she has been alive — days (rolling up on arrival), then hours/mins/secs ticking every second. Driven by `birthDateISO` |
| 💌 Letter | Your message writes itself out in handwriting; a tap completes it instantly |
| 🎆 Finale | Tapping anywhere sends up a firework from that spot |
| ✨ Everywhere | Rose petals and sparkles trail her finger / the cursor across the whole story |

Built with **Vite + React + TypeScript + Tailwind v4 + Framer Motion**.

---

## Quick start

```bash
npm install
npm run dev      # local dev at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

---

## 1. Edit the content (no component code needed)

Everything personal lives in **`src/config/content.ts`**:

| Field | What it is |
| --- | --- |
| `person.name` | `Akchaya` |
| `person.nickname` | Her pet name — leave blank to use the real name |
| `person.milestoneAge` | `30` (drives the "30 wishes for 30 years" framing) |
| `birthdayISO` | Midnight in her timezone — `2026-09-12T00:00:00+05:30` (IST) |
| `signature` | `From all of us` |
| `flags` | Feature toggles (see below) |
| `copy.*` | Every line of on-screen text, per scene |
| `copy.chapters` | The five chapter cards — `{ label, title }` each |
| `copy.scratch.message` | **The private message under the scratch card — write your own** |
| `copy.letter.body` | **The handwritten letter — write your own.** Short warm sentences land better than long paragraphs |
| `copy.letter.signedBy` | Your name at the bottom of the letter (blank hides the line) |
| `birthDateISO` | Her date (and time) of birth — drives the live "days alive" counter |
| `secretNote` | The hidden message revealed by the rose in the finale 🌹 |

### Feature toggles (`content.flags`)

| Flag | Default | Meaning |
| --- | --- | --- |
| `autoAdvanceWishes` | `true` | Wishes play one after another automatically |
| `wishGapMs` | `0` | Pause between wishes — `0` starts the next clip the instant the previous one ends |
| `allowSkip` | `true` | Allow skipping the special video / individual wishes |
| `resume` | `true` | Resume the current scene on refresh (per browser session) |
| `shareEnabled` | `true` | Show the discreet share button on the finale |
| `chapterDurationMs` | `3200` | How long a chapter title card holds before auto-advancing |
| `copy.countIn.skip` | `skip intro` | Label of the skip shown **only from her second visit onward** (remembered in `localStorage`, key `Akchaya-birthday:visited`) |
| `pauseMusicDuringVideo` | `true` | **Music stops completely while any video plays**, so voices stay clear. Set `false` to merely dip it underneath instead |
| `soundEffects` | `true` | Little synthesised sounds on the interactive moments |

## 2. The 30 wishes

Edit **`src/config/wishes.ts`** — the wishes are data, not duplicated
components. Fill in the real people (shown on screen) in order:

```ts
const PEOPLE = [
  { name: 'Priya', caption: 'college roommate' },
  { name: 'Amma' },
  …
]
```

Entry 1 plays `01.mp4`, entry 2 plays `02.mp4`, and so on. The counter
("07 of 30") follows the list length, so fewer or more than 30 is fine.

### Mixed portrait and landscape clips

**Just drop them in — no adjustment needed.** The player reads each clip's
real dimensions as it loads and reshapes its frame to match: portrait clips
run tall, landscape clips run wide, and the video is `object-contain` inside
that frame, so **nothing is ever cropped**. The frame eases between shapes
with a CSS transition.

Optionally add `orientation: 'landscape'` to an entry to declare the shape up
front, so the frame doesn't adjust as that clip loads:

```ts
{ name: 'Ravi', orientation: 'landscape' },
```

---

## 3. Drop in the media

Put the real files here (filenames matter):

```
public/assets/
├─ images/
│  └─ landscape-collage.jpg      ← the landscape photo/collage
├─ audio/
│  └─ birthday-music.mp3         ← background music (loops; ducks under videos)
└─ videos/
   ├─ special-video.mp4          ← the special landscape video (<2 min)
   └─ wishes/
      ├─ 01.mp4 … 30.mp4         ← the 30 vertical (9:16) wish clips
```

Until a file exists, that scene shows a tasteful fallback (the story never
breaks).

> ⚠️ **Windows double-extension gotcha.** Windows hides known file
> extensions, so renaming a file to `landscape-collage.jpg` in Explorer can
> silently produce `landscape-collage.jpg.jpg`, and the site won't find it.
> Check with `ls public/assets/images`, or turn on
> *View → Show → File name extensions* in Explorer before renaming.

### Shrink the photos before shipping

```bash
npm run optimize:images
```

Resizes anything in `public/assets/images` to 2200px wide and re-encodes it
(the collage went 4.8 MB → 365 KB, −92%). Your originals are copied to
`<name>.original.jpg` first and every run re-encodes from that backup, so it
is safe to run repeatedly and nothing is ever lost. Those `.original.*` files
are git-ignored.

## Sound

There is **always music**, with no asset required:

- **No `birthday-music.mp3`?** A soft, looping music-box score is synthesised
  live in the browser (warm I–V–vi–IV progression with a pad underneath) —
  see `src/audio/engine.ts`. Nothing to license, nothing to download.
- **Drop in `birthday-music.mp3`** and it takes over automatically — no code
  change. The synth is only the fallback.

The same engine produces the interaction sounds (a breath across the candles,
a pop as the ribbon gives way, a chime, sparkles) — all synthesised, no files.

🎵 **The music box plays "Happy Birthday" the moment she reaches the cake.**
The ambient score steps aside for the tune and resumes afterwards. The melody
is public domain and is synthesised note by note, so there is no recording to
license. (If you supply your own `birthday-music.mp3`, the tune is skipped —
we don't talk over your track.)

**Video audio is protected.** Whenever a video plays, the music is faded out
and fully stopped (the file is paused; the synth stops scheduling entirely),
then eased back in afterwards. Nothing bleeds under the 30 wishes. Flip
`pauseMusicDuringVideo` to `false` if you'd rather it just dip quietly.

Sound only ever begins after a real interaction (browsers require this), and
the ♪ control in the corner mutes everything.

### Using a CDN / object storage for the videos (recommended at scale)

30 clips push past most static hosts' file limits. Serve the media from a CDN
without touching any component: set one env var (see `.env.example`):

```
VITE_MEDIA_BASE_URL=https://your-bucket.example.com
```

The bucket must mirror the same folders (`images/`, `audio/`, `videos/`,
`videos/wishes/`). **Recommended:** Cloudflare R2 — S3-compatible, **zero
egress fees**, and proper HTTP range requests for smooth video seeking.

---

## 4. Deploy

- **App (code):** any static host works — Cloudflare Pages, Vercel, Netlify,
  or GitHub Pages. Build command `npm run build`, output dir `dist/`.
  `vite.config.ts` uses a relative `base` so it works on subpaths too.
- **Videos:** keep them out of git — host on Cloudflare R2 (or similar) and
  point `VITE_MEDIA_BASE_URL` at it. This keeps the repo lean and playback fast.

Privacy: the page ships with `noindex, nofollow` so it stays out of search.

---

## Performance & craft notes

- **Wishes never load all 30 at once** — only a 3-wide window (previous /
  current / next) is mounted; leaving clips are unmounted to free memory, only
  one plays at a time, and the next is preloaded.
- **Music stops entirely under video** so the voices are never muddied, and
  the synth scheduler halts too (no audio work during the 30 clips).
- **`prefers-reduced-motion`** is respected: the petal canvas is dropped and
  heavy transforms collapse to gentle fades.
- **Scenes cross-fade** (stacked absolutely) so a stalled animation frame can
  never freeze the story mid-transition.
- **Nine transition styles** in `motion/transitions.ts` — `iris`, `curtain`,
  `swoosh`, `flip`, `zoomThrough`, `bloom`, `rise`, `deepen`, `dissolve` — mapped
  per scene so no two consecutive moments move alike. Chapter cards always use
  `curtain`, turning the repetition into a motif. A warm band of light sweeps
  across on every change.
- **The cake** is drawn entirely in SVG — ivory tiers with piped shell borders,
  gold pearl trim, sugar roses (the site's motif, iced on) and a gold stand.
  Ivory was chosen over red so it reads clearly against the burgundy backdrop.
- **The 30 candles** are laid out on an ellipse and drawn back-to-front, so near
  flames correctly overlap far ones. Three flicker cycles at different speeds
  are assigned round-robin so the flames never move in unison.
- Keyboard: ← / → move between wishes; space toggles video playback.

## Architecture

```
src/
├─ config/     content.ts · wishes.ts · media.ts   (all copy + data + media base)
├─ audio/      engine.ts                            (synth music score + SFX)
├─ context/    ExperienceProvider · AudioProvider   (scene state, music + ducking)
├─ motion/     tokens.ts · transitions.ts           (durations, easings, variants)
├─ components/ SceneManager · ambient/ · ui/ · media/
└─ scenes/     Loading · Countdown · Opening · Chapter · Photo · BirthdayReveal ·
               Numbers · Cake · Gift · SpecialVideo · Scratch · WishesIntro ·
               WishPlayer · Letter · Finale
```

Celebration effects live in `components/ambient/`: `Confetti` (one-shot burst),
`Fireworks`, `Balloons`, `PetalCanvas` (ambient fall) and `TouchTrail` (petals
following the pointer). All are skipped under reduced motion, and each
animation loop stops itself when there is nothing left to draw.
