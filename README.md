# SUPER INTELLIGENCE — $SI

Single-page site for **$SI** on Base: a dark, cinematic marketing page over
the live on-chain dashboard machinery.

> **Bootstrap commit.** This is the asset-drop commit, pushed early so artwork
> can land while the rest is built. **What to supply, and under what filename,
> is in [`images/src/README.md`](images/src/README.md).** The site machinery
> is not in the tree yet — see *Status* below.

## The facts, as supplied

| | |
|---|---|
| Contract (Base) | `0xD8690690E1E5e3c4AeE2832D30C666BfE49D5CA4` |
| X | <https://x.com/SuperIQ_base> |
| Stockify index | <https://www.stockify.finance/indices/0x4e2e072c38735bd0b9374f429cf0ae1c07412450> |
| Launch page | <https://www.thestonks.exchange/token/0xd8690690e1e5e3c4aee2832d30c666bfe49d5ca4> |

Everything else this site needs — the pool, the reward token and its
`symbol()`/`name()`/`decimals()`, the launch block, the fee locker, the
holders' share — is **deliberately not written down yet.** It comes from the
discovery run against the chain and the platform, not from a guess and not
from the sibling site this is being copied from. Guessing a `decimals()`
published one sibling's figure at 10⁻¹⁰ of its true scale, and another's at
the reverse; the nulls are the point.

## Status

- [x] Asset specification — [`images/src/README.md`](images/src/README.md)
- [ ] Template machinery copied in from
      [`juanantin/purr`](https://github.com/juanantin/purr) — **blocked, see
      below**
- [ ] Discovery run: pool, reward token, launch block, fee locker, what the
      Stockify index holds
- [ ] Configs filled from what discovery reports
- [ ] Presentation rebuilt to the mockup (dark palette, hero, pitch strip,
      quote wall, dashboard, distribution row, footer)
- [ ] Vercel deployment URL wired in

**The copy step is currently blocked** by this environment's sandbox policy,
which declines to bulk-import one repository's tree into another. Nothing is
wrong with the template; the tooling simply will not move it without an
explicit go-ahead. Resolving that is the next step and everything downstream
waits on it.

## What ships, and what does not

The page renders **only what the chain and the index actually hold.** A figure
no source can supply renders as an em dash rather than as a number that is not
real, and the distribution row shows the names the index really holds — not
the six the mockup drew.

Two pieces of the mockup are being rebuilt rather than reproduced, by
agreement with the owner:

- **The quote wall** carries real, sourced public statements — actual quote,
  real name, real date, and a link to the source — with no invented engagement
  counts and no chrome that makes a card read as a screenshot of a post.
- **No fabricated likenesses.** The geopolitical framing stays; composites
  placing real people in scenes that did not happen do not, and nothing on the
  page implies any person or company endorses the token.

The footer carries a non-affiliation notice naming the companies and
individuals referenced.

## Holders are paid in a tokenized wrapper, not equity

Whatever the reward token turns out to be, it is a **tokenized wrapper** — a
sibling's reward token answers `symbol()` with `AMZNc`, which had to be read
off chain rather than inferred from the branding. The copy on this page will
not say holders receive company stock unless that is literally true.
