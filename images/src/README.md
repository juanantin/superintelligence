# Artwork to supply — $SI

**Drop your files in this folder** (`images/src/`) with **exactly the filenames
in the first column.** Everything the page actually serves is derived from
these by script, so you never have to produce a resized or reformatted copy
yourself — supply the largest, cleanest original you have and the build cuts
the rest.

Nothing in `images/src/` is loaded by the browser. It is the source shelf.

---

## What is needed

| Supply this file | What it is | Shape / size | Used for |
|---|---|---|---|
| `hero_scene.png` | The hero backdrop: the curve of the Earth at night, city lights along the limb, star field above. Dark, cinematic, no people. | **2400 × 1000** (2.4 : 1), **minimum 1920 wide** | The full-bleed hero band, and the social card derived from it |
| `si_mark.png` | The chrome **SI** monogram on its own — the lettering only, **transparent background**, no ring, no card, no drop shadow baked in. | **Square, 1024 × 1024** or larger | The large hero mark, the top-bar monogram, the favicon, the 192/512 PWA icons and the iOS home-screen icon |
| `pitch_texture.png` | *Optional.* An abstract or generic backdrop for the mid-page pitch strip — circuitry, a data lattice, a dark gradient field. No recognisable people. | **3 : 1**, e.g. 2400 × 800 | The band behind "BUY $SI. EARN THE TECH RACE." |
| `section_wide.png` | The wide image that sits above the footer, where the mockup had the boardroom photograph. **A room, a skyline, a server hall, circuitry or an abstract field — no people.** See *What I cannot build* below. | **3 : 1**, e.g. 2400 × 800, **never squarer than 3 : 1** | The wide band above the footer |
| `footer_art.png` | *Optional.* A dark band for behind the footer lockups. If you skip it the footer renders on flat colour, which is fine. | **3 : 1**, e.g. 2400 × 800 | The footer ground |

### Ratios are not advice

Two of these are load-bearing and have bitten this template before:

- **A wide image must never be cropped squarer than the ratio in the table.**
  `object-fit: cover` crops silently: give a 3 : 1 picture a 2 : 1 box and the
  browser keeps the middle 67% and throws the sides away — on a sibling site
  that turned a footer into a blank band of sky, with the artwork perfectly
  intact in the file.
- **The social card is letterboxed, never cropped.** X crops a large-image
  card to 2 : 1 and takes the **sides**. `hero_scene.png` is wider than that,
  so it is padded onto 1200 × 630 rather than trimmed into it.

### The mark, specifically

`si_mark.png` is resized down to **16px** for a browser tab. Supply the
monogram *alone* — if the file is a full scene with the SI lettering somewhere
inside it, the favicon is a smudge. Transparent, so it sits on a light or a
dark tab strip without carrying a white card around with it. (The iOS icon is
the one exception and gets flattened onto a solid ground during the build,
because iOS renders a transparent home-screen icon as pure black.)

### Formats

PNG or WebP for anything with transparency, PNG or high-quality JPEG for the
photographic scenes. Do not pre-compress: the build produces the small
served copies, and it cannot recover detail you have already thrown away.

### If you have a hero clip instead of a still

Supply it as `si_header.mp4` and say so — the template can run a looping,
muted, audio-stripped clip in the hero instead of the still, and the poster
frame is then cut from the clip's own **first** frame so the hand-off to
playback does not jump.

---

## Logos I do *not* need from you

- **Stonks Exchange** and **Stockify** — the footer lockups carry these
  already.
- **Base** — drawn as vector in the page, not loaded as a file.
- **The tokenized-equity company logos** for the distribution row — hold off
  on these until the discovery run reports what the Stockify index actually
  holds. The mockup shows six names; the index may hold fewer, and the page
  renders only what is really there. Once the run reports back I will tell you
  exactly which logos are needed, if any.

---

## What I cannot build, and why

Two things in the mockup are not going to ship as drawn, and you have already
agreed to this — recording it here so it is not a surprise later:

1. **No fabricated likenesses of real people.** That is the Trump and Xi
   portraits flanking the hero, and the six-executive boardroom image. The
   geopolitical framing stays — flags, the Earth, the SI mark, circuitry — but
   built from imagery that does not place real individuals in scenes that did
   not happen, and never in a way that reads as their endorsement of the
   token. `section_wide.png` above is the slot the boardroom image occupied.
   If you hold genuine licensed photographs and want them used editorially,
   that is a conversation worth having — send them and we will look at it.
2. **No invented posts, quotes or engagement counts.** The "LATEST ON X" wall
   ships as **real, sourced statements**: each card carries the actual quote,
   the person's name, the real date, and a link to the source. No like or
   view counts, and no chrome that makes a card look like a screenshot of a
   post. **Send me the sources** — a list of post URLs, or interview/article
   links — and I will build a card per quote. A quote I cannot point at a
   source for does not ship, and this sandbox has no network, so I cannot go
   and verify one myself.

---

## After you drop the files in

Tell me they are in and I will derive and commit everything the page serves:
the hero at display width, the letterboxed social card, the favicon, the two
PWA icons and the iOS icon, plus the section bands. The derivation commands
land in this file as they are written, so any of it can be re-cut later
without going back to whoever made the original.
