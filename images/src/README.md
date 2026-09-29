# Originals — $SI

The artwork everything served is derived from. **Nothing in here is loaded by
the page**; it is the source shelf, so any served file can be re-cut without
going back to whoever made the original.

| File | What it is | What comes from it |
|---|---|---|
| `si_logo.png` | The chrome **SI** monogram as supplied, 1774×887, RGBA with a transparent ground | `images/si_mark.png` (trimmed to its own alpha bounds), `images/si_mark.webp` (the served copy), and every icon: `images/favicon.png`, `icon-192`, `icon-512`, `apple-touch-icon`, `/favicon.ico` |
| `si_header.png` | The supplied header, 1983×793. **Only the parts with no person in them are used** — see below | `images/hero_scene.webp` (the full-bleed hero), `images/hero_earth.webp`, and the ground colour `#010d29` sampled from its own night sky |
| `launch_banner.jpg` | The banner the token launched with, 1280×427, pulled from thestonks.exchange by `.github/workflows/fetch-art.yml`. Also carries the two portraits | the six company marks in `images/dist/`, cut from the logo row across its middle |
| `si_footer.png` | The supplied footer, 1983×793. **Only its upper third is used** — see below | `images/footer_band.webp` |

## Why only part of two of them is used

Both supplied images are photoreal composites of **real, identifiable people**
in scenes that never happened: the header places Donald Trump and Xi Jinping
either side of the Earth, and the footer seats six recognisable technology
executives around a boardroom table. Published on a page selling a token, that
reads as those people endorsing it. Neither ships, and that constraint was
agreed before any of this was built.

What does ship is **the part of each picture that has no people in it**, which
turned out to be the best part of both:

- **`hero_scene.webp`** — the hero the page actually serves, 2400×1000. Two
  people-free pieces of the header composited: the starfield and nebula from
  the **column between the two figures** (x 0.38–0.58, which is sky top to
  bottom), mirror-tiled out to full width, with the full-width Earth band
  feathered across the bottom. Mirror-tiling rather than stretching, because
  stretching that column six times over smeared the nebula into horizontal
  streaks; mirrored it just reads as more sky.
- **`hero_earth.webp`** — the bottom 38% of the header: the curve of the Earth
  at night, city lights, and the blue and red network arcs sweeping across it.
  The blue-left / red-right framing survives the crop, so the geopolitical
  reading is still there without either likeness.
- **`footer_band.webp`** — the top 34% of the footer: the night skyline, the
  holographic globe, and **both flags** — the US flag at the left edge, the
  Chinese flag at the right. Every face is below the crop line.

So the flags, the Earth, the circuitry and the two-power framing all remain.
Only the fabricated people are gone.

The two source files stay here as provenance. They are not referenced by any
page, but the repo root is what the host serves, so they remain publicly
reachable at their URL — say the word and they come out of the repo entirely.

## The commands

```bash
# hero — the Earth limb, below where the two figures end (0.62 of the height).
# Checked visually at 0.58/0.60/0.62/0.64: below 0.62 a sliver of shoulder and
# of the US flag survives in the top corners.
python3 - <<'EOF'
from PIL import Image
h = Image.open('images/src/si_header.png').convert('RGB')
W, H = h.size
hero = h.crop((0, int(H*0.62), W, H))
hero = hero.resize((1920, round(hero.height * 1920 / hero.width)), Image.LANCZOS)
hero.save('images/hero_earth.webp', 'WEBP', quality=88, method=6)

# footer band — skyline, globe and both flags, above the seated figures.
f = Image.open('images/src/si_footer.png').convert('RGB')
W2, H2 = f.size
band = f.crop((0, 0, W2, int(H2*0.34)))
band = band.resize((1920, round(band.height * 1920 / band.width)), Image.LANCZOS)
band.save('images/footer_band.webp', 'WEBP', quality=88, method=6)

# the mark — trimmed to its own alpha bounds, then a served WebP at 1000px
# (the hero shows it at ~440, so this covers a 2× display).
m = Image.open('images/src/si_logo.png').convert('RGBA')
mark = m.crop(m.getbbox())
mark.save('images/si_mark.png', 'PNG', optimize=True)
mark.resize((1000, round(mark.height*1000/mark.width)), Image.LANCZOS) \
    .save('images/si_mark.webp', 'WEBP', quality=90, method=6)
EOF
```

```bash
# icons — the monogram centred on a square with a 6% margin, left TRANSPARENT
# so it sits on a light or a dark tab strip without carrying a white card.
# The apple-touch one is the exception and is flattened onto #010d29, because
# iOS renders a transparent home-screen icon as pure black.
#   favicon.png 512 · icon-192 · icon-512 · apple-touch-icon 180 · favicon.ico
# favicon.ico sits at the REPO ROOT because browsers request /favicon.ico on
# their own, whatever the <link> tags say. It carries 16–256px.
```

```bash
# social card — 1200×630, which every platform documents and none of them cuts
# into. The Earth band is LETTERBOXED across the bottom and its top edge
# feathered 90px into the ground, with the mark above it.
```

**Letterbox the card, never crop it.** X crops a large-image card to 2:1 and
takes the **sides** — on a 6.6:1 band that would leave a strip of ocean.

**Never crop a wide band squarer than its own ratio.** `object-fit: cover`
crops silently: on a sibling site a 3:1 footer given a 2:1 box kept the middle
67% and rendered as a blank band of sky, with the artwork perfectly intact in
the file. `footer_band.webp` is 7.4:1 and `hero_earth.webp` 6.6:1 — both want
boxes at least that wide, and the stylesheet sets their ratios explicitly.

## Still useful, if you have it

- **A hero clip.** Drop it in as `si_header.mp4` and say so: the hero can run a
  muted, looping, audio-stripped clip instead of the still, with the poster cut
  from the clip's own **first** frame so the hand-off does not jump. Same rule
  applies — no fabricated likenesses in it.
- **Anything with more vertical room.** Both supplied files are 2.5:1 and the
  usable crops are much wider than that, which is why the hero composes the
  Earth band against a deep field rather than filling the whole frame with
  photography. A taller original would give the hero more picture.

## Logos not needed from you

Stonks Exchange and Stockify ship already; Base is drawn as vector in the page.
The tokenized-equity company logos wait on the discovery run — the page renders
only the names the Stockify index actually holds, which may be fewer than the
six the mockup drew.
