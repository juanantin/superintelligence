/* ==========================================================================
   SITE CONFIGURATION — $SI (Super Intelligence) on Base
   --------------------------------------------------------------------------
   This is the only file you need to edit to point the site at a token.

   ⚠ EVERY FACT THE NETWORK CAN ANSWER IS null ON PURPOSE. Four things were
   supplied by the owner and are set below: the contract address, the X handle,
   the Stockify index link and the launch page. Everything else — the pool, the
   reward token and its symbol()/name()/decimals(), the launch block, the fee
   locker, the rewards index, holderShare — comes from
   .github/workflows/discover.yml and nowhere else.

   Not caution for its own sake. Guessing a decimals() on a sibling published
   25.244695737 as 2.5244695737e-9: every digit right, the scale out by ten
   billion. Another sibling's went the other way. A null renders as an em dash,
   which is the honest answer while the figure is unknown; an inherited number
   renders as a confident lie.
   ========================================================================== */

window.SITE_CONFIG = {
  /* Build stamp. Shown in the ?debug=1 panel, so you can confirm which version
     a browser actually has rather than guessing at a cache. Bump it together
     with the ?v= on the script tags in index.html whenever you deploy —
     `node scripts/stamp.mjs` moves all of them at once. */
  version: '9',

  /* ---- Token ---------------------------------------------------------- */

  // The token people buy. Supplied by the owner. The CA chip copies this, the
  // chart button links to it, and DexScreener is searched by it. Nothing on
  // the dashboard resolves without it.
  contractAddress: '0xD8690690E1E5e3c4AeE2832D30C666BfE49D5CA4',

  /* The token holders are paid in — the quote side of the pool — used to price
     distributed rewards in USD.

     ⚠ NOT YET KNOWN. discover.yml reports the deepest pair's other side and
     reads symbol(), name() and decimals() off chain. Until it has, this stays
     null: a sibling's reward token answers symbol() with "AMZNc", so neither
     the address nor the ticker is inferable from branding. */
  rewardTokenAddress: null,

  // Free, keyless, CORS-enabled. Used as the last price source, because it
  // covers tokens DexScreener has no pair for — an index token among them.
  geckoterminalBase: 'https://api.geckoterminal.com/api/v2',

  chain: 'base',    // DexScreener chain slug
  chainId: 8453,    // EVM chain id

  /* The block $SI launched at. The chain scan starts here.
     ⚠ NOT YET KNOWN — and a sibling's block here would mean scanning a range
     that has nothing to do with this token. discover.yml resolves it two ways
     (the platform's /api/coins block_number, and a timestamp search for the
     pool's own pairCreatedAt) and they should agree. */
  launchBlock: 51737858,

  /* How the reward token is recognised among everything that touches the
     distributor. Matched case-insensitively and as a SUBSTRING against each
     token's own symbol(), because platforms decorate the ticker they wrap —
     a sibling's reward token answers "AMZNc", not "AMZN", and an exact
     comparison would have missed it.

     ⚠ NOT YET KNOWN. With this null the configured address is used instead,
     never a ticker inherited from the token this repo was copied from. Raw
     amounts cannot tell tokens apart: a distributor sees the trading token's
     large flows beside the reward token's fractional ones, and picking the
     larger put 7,205,199 on a tile whose true figure was a fraction of one. */
  rewardTokenSymbol: null,

  /* Holders' share of what leaves the rewards index — the rest is the
     protocol's cut, so the outflow is NOT the distributed figure on its own.

     ✓ READ FROM THIS TOKEN'S OWN STOCKIFY PANEL on 2026-09-29, not inherited:
     "TO HOLDERS 90% — 10% protocol · 0% creator". The panel's own totals
     corroborate it: FEES COLLECTED $724 against PAID TO HOLDERS $638, which
     is 88% — 90% less the drift between buying the holdings and pricing them
     now. Creator earnings read "—", "all of it goes to holders". */
  holderShare: 0.9,

  /* Related contracts.
       pool         the trading pair — DexScreener is asked about THIS pool
                    first, and only falls back to searching by token address
       rewardPool   the reward token's own pair, used to price it
       feeLocker    where trading fees accrue
       rewardsIndex the distributor holders are paid from

     All null until discovery reports them. `pool` especially: it is read on
     every load and DexScreener is asked about it BEFORE it searches by token
     address, so a wrong pool here silently reports another token's market cap,
     liquidity and volume no matter what contractAddress says. Null means the
     search by contract address is used instead — correct, if slower. */
  contracts: {
    /* The trading pair: SI/WETH on Uniswap v3, from the platform's /api/coins
       and corroborated by DexScreener resolving the same pair. Named here
       because DexScreener is asked about THIS pool before it searches, and
       this token has TWO pairs: this one with $9,573 of liquidity, and a
       Uniswap v4 SI/USDC pool with $2.28. They report market caps of 10,968
       and 15,435 — a 41% difference — so leaving this null made every load a
       coin flip between them. */
    pool: '0x1fF0Ffe0c516d6146ff0d072FBe6FA3a98674c53',
    rewardPool: null,
    /* Where trading fees accrue. PLATFORM-WIDE — byte-for-byte the same
       address on every sibling — so it is never summed: doing that reports the
       whole platform's fees as this token's. Recorded only so it can be
       excluded from the holder count. */
    feeLocker: '0x71D1D363176723f85d98B8B430DF33cde89f0A7f',
    /* The distributor holders are paid from. Per token, and the only one of
       these that is this token's alone. Not derivable on chain — it is a
       routing decision, reported by the platform's /api/fee-routing.

       The owner's Stockify link names 0x4e2e072c38735bd0b9374f429cf0ae1c07412450.
       That address is seeded into discover.yml's CANDIDATES rather than
       written here, so the run reports whether the reward token really flows
       both IN and OUT of it before this site treats it as the distributor. */
    rewardsIndex: '0x4E2e072C38735BD0b9374F429Cf0AE1c07412450',
  },

  /* ---- Links ---------------------------------------------------------- */

  links: {
    // Supplied by the owner.
    x: 'https://x.com/SuperIQ_base',

    // Leave null to auto-build a DexScreener link from the contract address.
    chart: null,

    // The two footer lockups — both hrefs are written from here. Supplied by
    // the owner.
    launchedIn: 'https://www.thestonks.exchange/token/0xd8690690e1e5e3c4aee2832d30c666bfe49d5ca4',
    rewardsBy: 'https://www.stockify.finance/indices/0x4e2e072c38735bd0b9374f429cf0ae1c07412450',
  },

  /* ======================================================================
     DATA SOURCES
     Each source fills in the fields it knows about. Later sources win, so
     `rewards` can override anything. Whatever no source provides falls back
     to `stats` below, and anything still missing renders as "—".
     ====================================================================== */

  sources: {

    /* Market cap, liquidity, 24h volume, and the token price.
       Public API, no key, CORS-enabled. Ranked ABOVE the committed rewards
       snapshot for these three, so a stale file can never outrank the live
       pool. */
    dexscreener: {
      enabled: true,
    },

    /* Holder count. DexScreener does not report holders, and no single
       explorer is reliable for a freshly launched token — a zero usually means
       "not indexed yet" rather than "no holders", so a zero is treated as no
       answer and falls through.

       Run the page with ?debug=1 to see which provider answered. */
    holders: {
      enabled: true,

      /* `onchain` ALONE, deliberately. It folds the token's own Transfer logs
         into balances, exactly as the indexer does, so it is right by
         construction rather than by an explorer's luck. On a freshly launched
         token the explorers are worse than nothing: GeckoTerminal answered 21
         for a sibling that had made 365 wallet payments, and Blockscout 500s
         on a token that new. If no RPC answers, the tile shows a dash, which
         beats a confident wrong number. */
      providers: ['onchain'],

      onchain: {
        /* Tried in order; the first to answer runs the whole scan, since
           public nodes differ in how wide a getLogs range they allow and
           swapping mid-scan would make the chunk size meaningless.

           Seven, because a public endpoint's bad minute should not be the
           dashboard's bad day. Observed in a real browser: mainnet.base.org
           answers 500 under a sustained scan and publicnode answers 403 —
           between them they ended a scan that was 94% complete while a third
           URL sat unused. */
        rpcUrls: [
          'https://mainnet.base.org',
          'https://base.drpc.org',
          'https://base-mainnet.public.blastapi.io',
          'https://base.meowrpc.com',
          'https://1rpc.io/base',
          // Last two: observed refusing a browser outright rather than being
          // busy — publicnode with a 403, llamarpc with no CORS header at all.
          'https://base-rpc.publicnode.com',
          'https://base.llamarpc.com',
        ],

        // Defaults to CFG.launchBlock; set it here to scan a shorter window.
        startBlock: null,

        chunkSize: 10000,      // halves itself when a window is refused, and
                               // climbs back after a few clean ones
        /* How small a window may get before the scan gives up on the node
           instead. 1,000 was not small enough: one dense stretch of a
           sibling's trading refused at every size down to it, on all seven
           endpoints, and the cursor stopped there permanently. */
        minChunkSize: 200,
        confirmations: 5,      // stay clear of a reorg

        /* A page load spends at most this many requests, banks what it
           scanned in localStorage, and the next load resumes. The count is
           published only once the scan reaches the head: a partial fold has
           seen sends whose receives are in unread blocks, so it under-counts. */
        maxCallsPerLoad: 200,

        // Defaults to contracts.pool, feeLocker and rewardsIndex — they hold
        // supply without being holders.
        exclude: null,

        /* Fallbacks for the fee/payout queries, tried only if a node refuses
           eth_getLogs without an `address`. The unfiltered query is the better
           question, because it reports whichever token actually moved rather
           than trusting a guess.
           ⚠ EMPTY ON PURPOSE. This token's own rewards index goes here once
           discovery confirms it; a sibling's address would ask about the
           wrong contract. */
        feeTokenCandidates: [
        ],
      },

      blockscoutBase: 'https://base.blockscout.com',
      geckoterminalBase: 'https://api.geckoterminal.com/api/v2',
      etherscanApiKey: '',
      moralisApiKey: '',
    },

    /* Rewards figures — total fees collected and total rewards distributed.
       Protocol numbers, so no explorer has them. Fed by
       scripts/index-rewards.mjs, which scans Base and rewrites
       data/rewards.json on a schedule.

       NOTE: this source is merged LAST for the reward figures, so stale
       figures here would override DexScreener's market metrics. It ships with
       every field null, which renders as em dashes — safe to publish. */
    rewards: {
      enabled: true,

      // A string, or an array of them — the first source with a number for a
      // metric wins, so a live worker URL goes in front of the committed file.
      url: 'data/rewards.json',

      fields: {
        totalFeesCollected: [
          'totalFeesCollected', 'totalFeesUsd', 'feesCollectedUsd', 'fees.totalUsd',
          'data.totalFeesCollected', 'stats.totalFeesCollected',
        ],
        totalFeesTokens: ['totalFeesTokens', 'feesTokens', 'data.totalFeesTokens'],
        totalDistributed: [
          'totalDistributed', 'totalRewardsDistributed', 'rewardsDistributed',
          'data.totalDistributed', 'stats.totalDistributed',
        ],
        totalDistributedUsd: [
          'totalDistributedUsd', 'totalRewardsDistributedUsd', 'rewardsDistributedUsd',
          'data.totalDistributedUsd', 'stats.totalDistributedUsd',
        ],
        holders: [
          'holders', 'holderCount', 'totalHolders', 'data.holders', 'stats.holders',
        ],
        marketCap: ['marketCap', 'marketCapUsd', 'data.marketCap'],
        liquidity: ['liquidity', 'liquidityUsd', 'data.liquidity'],
        volume24h: ['volume24h', 'volume24hUsd', 'volumeUsd24h', 'data.volume24h'],
      },
    },
  },

  // How often to refresh, in seconds. 0 disables auto-refresh.
  refreshSeconds: 60,

  /* ---- Fallbacks ------------------------------------------------------ */
  // Used only where no source supplies a value. Every field null: a tile with
  // no source shows "—" rather than a number that isn't real.

  stats: {
    totalFeesCollected: null,
    totalFeesTokens: null,
    totalDistributed: null,
    totalDistributedUsd: null,
    holders: null,
    marketCap: null,
    liquidity: null,
    volume24h: null,
  },

};
