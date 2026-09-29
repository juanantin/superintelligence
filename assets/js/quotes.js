/* ==========================================================================
   QUOTES AND DISTRIBUTION — the two data-driven sections
   ========================================================================== */

/* --------------------------------------------------------------------------
   THE WALL.

   Two kinds of card, and the difference matters:

     kind: 'project'  — $SI's own messaging, on $SI's own account. The project
                        writing about itself. Safe to edit freely; it is your
                        words about your token.

     kind: 'sourced'  — somebody ELSE's real, public statement. Requires the
                        exact quote, the person's name, the real date and a
                        LINK TO THE SOURCE. Any entry missing one of those is
                        skipped by the renderer rather than rendered without
                        it.

   The cards below are all `project`. The design this was built from filled
   this wall with seven dated posts from Donald Trump, Elon Musk, Jensen Huang,
   Sam Altman, Jeff Bezos, Tim Cook and Sundar Pichai, each with a verified
   badge and like / retweet / view counts, plus a poll reading "2.4M votes ·
   Final results". None of those posts exist. Shipping them would be putting
   invented words in the mouths of seven named living people on a page selling
   a token — which is a fabrication about real people, and is the one thing
   that does not ship here whoever asks.

   TO ADD A REAL ONE: paste the post URL and I will read it and add a
   'sourced' card with the true text, name and date. There are no engagement
   fields anywhere in this file, on purpose — a like count cannot be verified
   from a URL and it is pure decoration on a claim.
   -------------------------------------------------------------------------- */
window.QUOTES = [
  {
    kind: 'project',
    text: 'The superintelligence race is the defining industrial story of the decade. $SI puts holders on the right side of it.',
    href: 'https://x.com/SuperIQ_base',
  },
  {
    kind: 'project',
    text: 'Every trade in $SI generates fees. Those fees route to the rewards index. The index pays holders. No staking, no claiming.',
    href: 'https://x.com/SuperIQ_base',
  },
  {
    kind: 'project',
    text: '1,000,000,000 $SI. Fixed supply, launched on Stonks Exchange, living on Base.',
    href: 'https://x.com/SuperIQ_base',
  },
  {
    kind: 'project',
    text: 'Holder rewards are powered by Stockify — tokenized equity exposure, distributed automatically.',
    href: 'https://x.com/SuperIQ_base',
  },
  {
    kind: 'project',
    text: 'You do not have to pick which company wins the race. The index holds the basket.',
    href: 'https://x.com/SuperIQ_base',
  },
  {
    kind: 'project',
    text: 'Real companies. Real progress. Real rewards.',
    href: 'https://x.com/SuperIQ_base',
  },
  {
    kind: 'project',
    text: 'Same technology. A brighter tomorrow.',
    href: 'https://x.com/SuperIQ_base',
  },
];

/* --------------------------------------------------------------------------
   DISTRIBUTION — the per-name payout row.

   The six names below are NOT from the mockup. They are the six the platform
   itself publishes for this token, read from thestonks.exchange /api/coins in
   the discovery run:

     "$SI — Super Intelligence Race. Hold $SI and earn rewards in $NVDA,
      $AMZN, $AAPL, $GOOGL, $TSLA & $SPCX. Built on Base."

   So the basket is real and it is six names. What is NOT yet known is whether
   a PER-NAME distribution figure can be read on chain at all — the indexer
   measures one reward token's flow in and out of the rewards index, not a
   split across six. Until that is settled every figure here is null, which
   renders as an em dash. A tile with a made-up number would be worse than no
   tile.

   ⚠ $SPCX: SpaceX is not publicly traded. Whatever that ticker wraps comes
   from the index, and the label says "tokenized instrument", never "shares".
   -------------------------------------------------------------------------- */
/* The marks in images/dist/ are cut from THIS TOKEN'S OWN launch banner
   (images/src/launch_banner.jpg), which carries all six in a row — so they
   arrived with the token rather than being fetched from six companies'
   websites. They appear descriptively, to identify which tokenized
   instruments the index holds, and the footer carries the non-affiliation
   notice that says so. */
window.DISTRIBUTION = [
  { name: 'Google',  ticker: 'GOOGL', tokens: null, usd: null, logo: 'images/dist/googl.png' },
  { name: 'NVIDIA',  ticker: 'NVDA',  tokens: null, usd: null, logo: 'images/dist/nvda.png' },
  { name: 'Apple',   ticker: 'AAPL',  tokens: null, usd: null, logo: 'images/dist/aapl.png' },
  { name: 'SpaceX',  ticker: 'SPCX',  tokens: null, usd: null, logo: 'images/dist/spcx.png' },
  { name: 'Tesla',   ticker: 'TSLA',  tokens: null, usd: null, logo: 'images/dist/tsla.png' },
  { name: 'Amazon',  ticker: 'AMZN',  tokens: null, usd: null, logo: 'images/dist/amzn.png' },
];
