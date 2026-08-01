# A Galaxy Made of You 🌌

A personal, cinematic, mobile-first romantic website. No backend required —
all progress (letters read, stars found, secrets unlocked) is saved in the
browser's `localStorage`.

## How to view it

Just open `index.html` in a browser, or upload the whole folder to any static
host (Netlify, Vercel, GitHub Pages, or even a shared Google Drive link via a
static-site service). Everything is plain HTML/CSS/JS — no build step, no
dependencies to install.

**The lock code is `0719`.**

## What you still need to add

The site is fully wired up and works right now with soft gradient fallbacks
and emoji in place of missing media, so nothing breaks if you skip this step.
But to get the full cinematic effect described in the brief, drop your own
files into `assets/` using these exact names:

### assets/video/
- `space-loop.mp4` — the one shared background: black space, stars, camera
  drifting forward. This plays behind every screen (lock, homepage, Mercury,
  Neptune, Venus, black hole) — you only need this single file now.
- `supernova-transition.webm` — the one-time explosion/transition after
  entering the correct code
- `venus-message.mp4` — your personal video message. It's hidden until she
  taps the bouquet, then reveals + plays with sound. It pauses automatically
  if she leaves Venus, and resets so it's ready to play again next visit.

Each screen tints the shared background a different color (see `js/main.js` /
`css/style.css` — the `.tint--*` classes) so Mercury reads lavender, Neptune
reads blue, Venus reads blush pink, etc., without needing six separate clips.

### assets/images/
- `bouquet.png` — the Venus bouquet
- `star1.png`, `star2.png`, `star3.png` — the three star sprites for Neptune
- `mercury-icon.png`, `neptune-icon.png`, `venus-icon.png` — small icons shown
  inside each planet badge on the homepage. Until you add these, a matching
  emoji (💌 🌌 🌷) shows in their place automatically.

### assets/audio/
- `lock-theme.mp3`
- `homepage-theme.mp3`
- `neptune-theme.mp3`
- `venus-theme.mp3` *(currently unused — Venus's sound now comes from
  `venus-message.mp4` instead, so nothing overlaps it. Safe to ignore, or ask
  me to wire it back in as ambient background under the video if you want.)*
- `singularity-theme.mp3`
- `engk-engot.mp3` (wrong lock code sfx)
- `unlock-chime.mp3` (correct lock code sfx)
- `mwah.mp3` (BABY easter egg sfx)

Note: Mercury no longer uses `mercury-theme.mp3` — your Spotify playlist
(below) is the music there instead, so the two never overlap.

Any file you don't provide is skipped gracefully — videos fall back to a
matching gradient, images fall back to an emoji, and audio simply stays
silent for that track.

## Your Spotify playlist in Mercury

Open `index.html`, search for `YOUR_PLAYLIST_ID` (inside the `<iframe
id="mercury-spotify-embed">` tag), and replace it with your actual playlist:

1. In Spotify, open your playlist → **Share → Copy link to playlist**.
2. You'll get something like `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`.
3. The part after `/playlist/` (before any `?`) is the ID — paste just that
   into `YOUR_PLAYLIST_ID` in the iframe's `data-src`.

It loads and starts playing automatically the moment she opens Mercury, and
fully stops (not just muted) the moment she leaves — so it never overlaps
with anything else.

## Fixing the "music overlaps" bug

This was an actual bug in the audio code (not something you did) — switching
screens quickly could leave the old track playing on top of the new one.
It's fixed now in `js/audio.js`: each track fades out/in independently
instead of sharing one timer, so only one track is ever audible at a time,
and leaving a screen properly stops its music instead of leaving it running
in the background.

## What still needs your real words

### The letters (start here to type them in!)
Open `js/data.js` and find `LETTER_CONTENT` near the top. It's organized by
category, and each category is just a list of `{ hint, text }` entries — one
per letter, in the order they'll appear in the shelf. For example, to fill in
the first Yearning letter:

```js
LETTER_CONTENT.yearning[0] = { hint:"open when you miss me", text:"I miss you most around midnight, when..." };
```

- `hint` is the short teaser that floats up when she hovers (desktop) or taps
  once (mobile) on the envelope, before she opens it.
- `text` is the actual letter. Leave it as `""` and that letter shows a
  blank "still waiting to be written" placeholder card automatically — the
  placeholder isn't something you need to remove by hand, it just disappears
  on its own the moment you type real words into `text`.

Everything else you still need to write:
- **4 secret letters** in `SECRET_LETTERS` (same idea — fill in `text`)
- **100 "reasons I love you"** stars for Neptune (`REASON_TEMPLATES` /
  `buildStars`), plus one hidden bonus star (`HIDDEN_STAR`)
- **The final love letter**, revealed line by line after the black hole —
  it's the `FINAL_LETTER_LINES` array near the bottom of `js/data.js`. Each
  string in that list is one line that gets revealed on its own; edit them
  directly (the last line is shown bigger/centered on purpose, per the
  original brief).

The counts, unlock logic, shelf layout, and animations are already built —
you only need to swap in your own sentences.

## How the secrets unlock

| Secret Letter | Unlocks when… |
|---|---|
| 1 | All 100 stars in Neptune are found |
| 2 | The visitor's local device clock hits exactly 11:11 |
| 3 | All 64 regular letters have been read |
| 4 | Every planet is visited, all 100 stars found, the bouquet opened, the Venus song played, and the BABY easter egg activated |

A toast notification ("✉️ Unknown Signal Detected") appears top-right the
moment any secret unlocks.

## The BABY easter egg

Typing **BABY** anywhere on the site (any screen, any time) pops up the
proposal-style modal with a heart-rain celebration.

## Neptune's star layout

Stars now sit on a shuffled 10×10 grid with a little random jitter inside
each cell — that's what keeps 100 stars from ever bunching up or overlapping
while still looking scattered and organic, with a gentle twinkle/drift on
each one.

## Letter hint tooltips (Mercury)

Each envelope has a small floating hint bubble (from `LETTER_CONTENT`'s
`hint` field) that shows what the letter is about before you open it — hover
to preview on desktop, or tap once to preview and tap again to open on
touchscreens.

## Notes on structure

- `index.html` — all screens/sections in one page, shown/hidden with CSS classes
- `css/style.css` — full design system (palette, type, animations, responsive rules)
- `js/data.js` — all written content (letters, star reasons, final letter)
- `js/audio.js` — global audio manager (single-track crossfading, sfx, mute)
- `js/main.js` — app logic: navigation, lock screen, unlock conditions, rendering

Everything is commented by section so you can find what you need quickly.
