/* ==========================================================================
   What the indexer watches — $SI on Base.
   --------------------------------------------------------------------------
   ⚠ NOTHING HERE IS FILLED IN YET, AND THAT IS THE POINT. Every address and
   every decimals value below must be READ FROM THE NETWORK by
   .github/workflows/discover.yml (scripts/discover-token.mjs) before it is
   written here. None of it may be carried over from the token this site was
   copied from.

   MISSING at the bottom is therefore non-empty, and both
   scripts/index-rewards.mjs and the worker REFUSE TO SCAN while it is. That
   refusal is the safety: a run against an unset index sums nothing and commits
   nulls every quarter hour, which on the page is indistinguishable from a site
   that is broken.

   Once discovery reports, reconcile against what thestonks.exchange and
   stockify.finance publish for $SI before trusting a number —
   scripts/panel-probe.mjs prints both side by side. On a sibling they agreed
   to five decimal places, which is the bar.
   ========================================================================== */

export const CHAIN_ID = 8453;                    // Base

export const TOKENS = {
  // The token people buy. Supplied by the owner.
  STR: '0xD8690690E1E5e3c4AeE2832D30C666BfE49D5CA4',
  /* WETH — what FEES ARRIVE IN, read from the chain as the quote side of the
     pool and corroborated by the Stockify panel ("FEES COLLECTED $724 /
     0.2682 ETH"). symbol() "WETH", name() "Wrapped Ether", decimals() 18.

     ⚠ NOT what holders receive. This index is not the one-reward-token shape
     the template assumes: it collects ETH, buys six tokenized equities by
     weight, and pays those out per name (NVDAc, AAPLc, GOOGLc, AMZNc, SPCXc,
     TSLAc). So `feesIn` below is exact, and `paidOut` measures the ETH spent
     buying on holders' behalf — which is the right magnitude for a USD
     figure, but is NOT a count of stock tokens and must never be labelled as
     one. Per-name token counts need the six wrapper addresses, which
     discover-flows is still reading off chain. */
  KEX: '0x4200000000000000000000000000000000000006',
};

export const CONTRACTS = {
  // The trading pair: SI/WETH on Uniswap v3, the deepest of this token's two
  // pairs (the other is a v4 SI/USDC pool holding $2.28).
  pool: '0x1fF0Ffe0c516d6146ff0d072FBe6FA3a98674c53',
  /* Where trading fees accrue. PLATFORM-WIDE — the identical address on every
     sibling, which is three builds' worth of proof — so NO STREAM MAY SUM IT:
     doing so reports the whole platform's fees as this token's. Recorded only
     so it can be excluded from the holder count. */
  feeLocker: '0x71D1D363176723f85d98B8B430DF33cde89f0A7f',
  /* The distributor holders are paid from, from /api/fee-routing. Per token —
     which is what makes summing it this token's flows rather than the
     platform's.

     The owner's Stockify link names
     0x4e2e072c38735bd0b9374f429cf0ae1c07412450. It is NOT written here yet:
     discover.yml carries it in CANDIDATES so the run reports whether the
     reward token really flows both in and out of it first. */
  rewardsIndex: '0x4E2e072C38735BD0b9374F429Cf0AE1c07412450',
};

/* The block $SI launched at. ⚠ From discovery, corroborated two ways: the
   platform's /api/coins block_number, and a timestamp search for the pool's
   own pairCreatedAt. Left at 0 or null the scan would start at genesis and
   never finish. */
export const START_BLOCK = 51737858;

/* Decimals, per token, TO BE READ FROM EACH CONTRACT rather than assumed. Two
   constants, never one, even when they agree: on a sibling they differed — its
   reward token's decimals() returns 8 where the token itself is 18 — and
   sharing a constant there published 25.244695737 as 2.5244695737e-9, every
   digit right and the scale out by ten billion. A token that is "obviously 18"
   is exactly the one nobody checks. */
export const STR_DECIMALS = 18;   // $SI's own decimals(), read on chain
export const KEX_DECIMALS = 18;   // WETH's own decimals(), read on chain

/* Everything that has to be real before a scan means anything. index-rewards
   and the worker both refuse to run while this list is non-empty. */
/* Share of the measured outflow that reaches holders.

   ⚠ 1, NOT 0.9 — and that is a MEASUREMENT, not a disagreement with the panel.
   The panel does read "TO HOLDERS 90%", but this index's protocol cut never
   leaves the index as WETH, so it is not in what this scan measures. The first
   full backfill proved it:

     feesIn   0.26819049 ETH
     paidOut  0.24135144 ETH
     ratio    0.899925

   The outflow is ALREADY exactly 90% of the inflow. Multiplying it by 0.9
   again applies the cut twice: it published $584.50 where the index's own
   panel says $638 paid to holders — 8.4% low. Unmultiplied it is $649.45,
   within 1.8% of the panel, the remainder being drift between what the
   equities cost when bought and what they are worth now.

   So the multiplier belongs where the outflow includes the protocol's cut.
   Here it does not. If the platform ever routes that cut through the index in
   the reward token, this must go back to 0.9 — check the ratio above against
   a fresh backfill before changing it either way. */
export const HOLDER_SHARE = 1;
export const PROTOCOL_ADDRESS = null;

/* HOLDER_SHARE is in this list, which the siblings' copies did not do. There it
   defaulted to 0.9 and the scan ran, publishing a provisional payout figure
   that looked exactly like a verified one. Here a scan cannot start until this
   token's own Stockify panel has been read — the figure is either right or
   absent, never provisionally wrong. */
export const MISSING = Object.entries({
  'TOKENS.KEX': TOKENS.KEX,
  'CONTRACTS.pool': CONTRACTS.pool,
  'CONTRACTS.rewardsIndex': CONTRACTS.rewardsIndex,
  START_BLOCK,
  STR_DECIMALS,
  KEX_DECIMALS,
  HOLDER_SHARE,
}).filter(([, v]) => v === null || v === undefined || v === '').map(([k]) => k);

/* The three flows the totals are built from:

     `feesIn`   reward tokens ARRIVING at the distributor — "fees collected"
     `paidOut`  everything LEAVING it: holder payments plus the protocol's cut,
                so it is not the "distributed" figure on its own
     `holders`  every token transfer folded into a running balance per address;
                addresses left holding something are the holder count

   Verify these against the platform's own panel before trusting them. */
export const STREAMS = [
  { id: 'feesIn', kind: 'sum', token: TOKENS.KEX, to: CONTRACTS.rewardsIndex, decimals: KEX_DECIMALS },
  { id: 'paidOut', kind: 'sum', token: TOKENS.KEX, from: CONTRACTS.rewardsIndex, decimals: KEX_DECIMALS },
  { id: 'holders', kind: 'balances', token: TOKENS.STR, decimals: STR_DECIMALS },
];

if (PROTOCOL_ADDRESS) {
  STREAMS.push({
    id: 'protocolOut', kind: 'sum', token: TOKENS.KEX,
    from: CONTRACTS.rewardsIndex, to: PROTOCOL_ADDRESS, decimals: KEX_DECIMALS,
  });
}

/** Tokens that actually reached holders. */
export function holderPayout(totals) {
  const paidOut = totals.paidOut ?? 0;
  if (PROTOCOL_ADDRESS) return Math.max(0, paidOut - (totals.protocolOut ?? 0));
  /* Unguarded on purpose, as in the template: HOLDER_SHARE being null is
     caught by MISSING above, which stops the scan before this runs. Returning
     null here instead would reach `distributed.toFixed(2)` in
     scripts/index-rewards.mjs and publish `null * price` as a zero. */
  return paidOut * HOLDER_SHARE;
}

/* Addresses that hold supply but are not holders in the sense the tile means:
   the pool itself, the fee locker, the rewards contract. */
export const EXCLUDE_FROM_HOLDERS = [
  CONTRACTS.pool,
  CONTRACTS.feeLocker,
  CONTRACTS.rewardsIndex,
].filter(Boolean).map((a) => a.toLowerCase());

/* Scan pacing. A Worker run is short, so it takes bites and resumes. Raise
   MAX_CHUNKS_PER_RUN to backfill faster; lower CHUNK_SIZE if the RPC complains
   (it halves automatically anyway). */
export const CHUNK_SIZE = 2000;
export const MAX_CHUNKS_PER_RUN = 60;
export const CONFIRMATIONS = 5;

// Price the token totals in USD. Public, no key.
export const DEXSCREENER_PAIR =
  'https://api.dexscreener.com/latest/dex/pairs/base/' + CONTRACTS.pool;
export const DEXSCREENER_KEX_TOKEN =
  'https://api.dexscreener.com/latest/dex/tokens/' + TOKENS.KEX;
