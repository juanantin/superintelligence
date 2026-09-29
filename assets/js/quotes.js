/* ==========================================================================
   QUOTES AND DISTRIBUTION — the two data-driven sections
   --------------------------------------------------------------------------
   Both arrays below are EMPTY, and both sections hide themselves while they
   are. That is deliberate, and it is the whole point of this file existing
   rather than the content being written into index.html.
   ========================================================================== */

/* --------------------------------------------------------------------------
   QUOTES — the "in their own words" wall.

   The design this site was built from showed seven dated posts from Donald
   Trump, Elon Musk, Jensen Huang, Sam Altman, Jeff Bezos, Tim Cook and Sundar
   Pichai, each with a verified badge and like / retweet / view counts, plus a
   Trump poll reading "2.4M votes · Final results". None of it was real. Built
   that way the wall reads as screenshots of real posts, which is a
   fabrication attributed to named living people.

   THE RULE FOR THIS ARRAY: every entry is a real, verifiable public statement,
   and every entry carries a link to its source. No engagement counts — there
   is no field for them, on purpose. No verified badges. No chrome that makes a
   card look like a captured post.

   A quote that cannot be sourced does not go in. Not "source it later": the
   card does not ship. This sandbox has no outbound network, so quotes cannot
   be verified from here — they come from the owner with links, or a runner
   fetches the URL to confirm one.

   Shape:
     {
       quote:  'The exact words, quoted accurately.',
       name:   'Speaker Name',
       role:   'Their role, factually stated',
       date:   '2026-03-14',              // the real date of the statement
       href:   'https://…',               // the post, interview or article
       source: 'X'                        // where it was said, for the label
     }
   -------------------------------------------------------------------------- */
window.QUOTES = [
];

/* --------------------------------------------------------------------------
   DISTRIBUTION — the per-name payout row.

   The design showed six company cards: Google/$GOOGL, NVIDIA/$NVDA,
   Apple/$AAPL, SpaceX/$SPCX, Tesla/$TSLA and Amazon/$AMZN, each with a token
   amount and a dollar figure.

   THIS SITE RENDERS ONLY WHAT THE STOCKIFY INDEX ACTUALLY HOLDS. How many
   names that is comes from the discovery run and from scripts/panel-probe.mjs,
   which prints the index's own panel — on a sibling it read "WHAT IT HOLDS:
   1 name, fixed at creation". If it holds one name, this row shows one card.

   Two specifics worth remembering:
     · SpaceX is NOT publicly traded, so whatever "$SPCX" was meant to be has
       to come from the index or not appear.
     · This template pays holders in ONE reward token, the pool's quote side.
       A six-name basket may genuinely be how this index works — but that is a
       thing to read, not to assume.

   If per-name distribution is not available on chain, this array stays empty
   and the section never appears. An invented tile is worse than no tile.

   Shape:
     { name: 'Company', ticker: 'TICK', tokens: 12.34, usd: 567.89,
       logo: 'images/dist/tick.png' }
   -------------------------------------------------------------------------- */
window.DISTRIBUTION = [
];
