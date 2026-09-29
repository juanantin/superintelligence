#!/usr/bin/env node
/* ==========================================================================
   holdings-probe.mjs — what this token's Stockify index actually holds and
   has paid out, per name, written to data/holdings.json for the page to read.

   WHY THIS EXISTS RATHER THAN A CHAIN SCAN.

   The indexer measures one reward token in and out of the rewards index. That
   is exact for FEES (they arrive as ETH) but it cannot produce a per-name
   payout, because this index does not pay in one token: it collects ETH, buys
   six tokenized equities by weight, and pays those out per name.

   Reading the six wrapper contracts off chain needs an unfiltered eth_getLogs
   over the index's whole history. The public Base endpoint refuses a wide
   range, degrades to 1,250-block windows, and then rate-limits after ~51
   calls — around a quarter of the 222,000 blocks since launch. A 20,000-block
   window completes but finds nothing, because rounds are far rarer than the
   panel's "payout round: 15 min" suggests: that is a MINIMUM interval, and
   the last entries were a day old. Set an RPC_URL secret and the chain scan
   becomes viable; until then this is the honest source.

   So the figures here come from the index's own published panel — the same
   page a holder would open to check. Nothing is computed or inferred: each
   number is read off that page, and anything that cannot be read is written
   as null rather than guessed.

     node scripts/holdings-probe.mjs

   Needs network, so it runs from .github/workflows/holdings.yml.
   ========================================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function siteConfig() {
  const src = readFileSync(path.join(ROOT, 'config.js'), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window.SITE_CONFIG || {};
}

const CFG = siteConfig();
const URL = CFG.links?.rewardsBy;
if (!URL) {
  console.log('config.js has no links.rewardsBy — nothing to read.');
  process.exit(0);
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });

let text = '';
let addrHits = [];
try {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(6000);
  text = await page.evaluate(() => document.body.innerText);

  /* Every 0x address the panel links to or prints, with whatever text sits
     nearest it. The six wrapper contracts cannot be read off a public RPC —
     see the header — but the panel names them, and an address that is on the
     page is a fact about the index rather than an inference. */
  addrHits = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href]').forEach((a) => {
      const m = (a.getAttribute('href') || '').match(/0x[a-fA-F0-9]{40}/);
      if (m) out.push({ addr: m[0], text: (a.innerText || '').trim().slice(0, 40),
                        near: (a.closest('tr,li,div')?.innerText || '').trim().slice(0, 120) });
    });
    document.querySelectorAll('*').forEach((el) => {
      if (el.children.length) return;
      const m = (el.textContent || '').match(/0x[a-fA-F0-9]{40}/);
      if (m) out.push({ addr: m[0], text: (el.textContent || '').trim().slice(0, 40),
                        near: (el.parentElement?.innerText || '').trim().slice(0, 120) });
    });
    return out;
  });
} catch (err) {
  console.log('could not load the panel:', err.message);
  await browser.close();
  process.exit(0);
}
await browser.close();

const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
console.log(`read ${lines.length} lines from ${URL}\n`);

const num = (s) => {
  if (s == null) return null;
  const m = String(s).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};

/* The value a panel prints under a label sits in the NEXT element, so it
   arrives as the next line. Matching the label exactly and taking the line
   after it is what the layout actually guarantees; a keyword filter kept the
   labels and dropped the figures on the first attempt at this. */
function after(label, offset = 1) {
  const i = lines.findIndex((l) => l.toUpperCase() === label.toUpperCase());
  return i >= 0 ? lines[i + offset] : null;
}

/* Per-name payouts. The panel prints them twice: once as a single summary
   line ("0.4803 NVDAc · 0.3208 AAPLc · …") and once as a table. The summary
   line is parsed first because it is one regex over one string; the table is
   the fallback, and it is also where the weights come from. */
const holdings = [];
const summary = lines.find((l) => /\d\s+[A-Z]{2,6}c(\s*·|$)/.test(l) && (l.match(/·/g) || []).length >= 2);
if (summary) {
  for (const m of summary.matchAll(/([\d.]+)\s+([A-Z]{2,6}c)\b/g)) {
    holdings.push({ ticker: m[2], tokens: Number(m[1]), weightPct: null, name: null });
  }
  console.log('summary line:', summary);
}

/* The table rows read: TICKERc / Company / 17% / 0.4803 / TICKERc — so a
   weight and a company name can be attached to each ticker already found. */
for (let i = 0; i < lines.length; i++) {
  const t = lines[i];
  if (!/^[A-Z]{2,6}c$/.test(t)) continue;
  const name = lines[i + 1];
  const weight = lines[i + 2];
  const amount = lines[i + 3];
  if (!/^\d+(\.\d+)?%$/.test(weight || '')) continue;
  let row = holdings.find((h) => h.ticker === t);
  if (!row) { row = { ticker: t, tokens: num(amount), weightPct: null, name: null }; holdings.push(row); }
  if (row.weightPct == null) row.weightPct = num(weight);
  if (row.name == null && name && !/^\d/.test(name)) row.name = name;
  if (row.tokens == null) row.tokens = num(amount);
}

const out = {
  __doc: [
    'Per-name holdings and payouts for this token, read from its own Stockify',
    'index panel by scripts/holdings-probe.mjs. Every figure here is printed on',
    'that page; nothing is computed, inferred or carried over. A field the page',
    'does not show is null, and the site renders null as an em dash.',
    '',
    'This is a PANEL READING, not a chain scan — see the header of',
    'scripts/holdings-probe.mjs for why the chain scan is not yet viable on a',
    'public RPC, and what would make it so.',
  ],
  source: URL,
  readAt: new Date().toISOString(),
  paidToHoldersUsd: num(after('PAID TO HOLDERS')),
  feesCollectedUsd: num(after('FEES COLLECTED')),
  feesCollectedToken: after('FEES COLLECTED', 2) || null,
  roundsPaid: num(after('ROUNDS PAID')),
  walletPayments: num(after('ROUNDS PAID', 2)),
  holderSharePct: num(after('TO HOLDERS')),
  whatItHolds: after('WHAT IT HOLDS'),
  holdings,
};

/* Attach a contract address to a name when the panel puts one next to that
   name's ticker. Matched on the ticker appearing in the link's own text or
   its immediate row — never on position, which would silently mis-assign
   every address the moment the panel's layout shifted. */
const KNOWN = new Set(['si', CFG.contractAddress?.toLowerCase(),
                       CFG.contracts?.rewardsIndex?.toLowerCase()].filter(Boolean));
for (const h of out.holdings) {
  const tick = String(h.ticker).toUpperCase();
  const bare = tick.replace(/C$/, '');
  /* The link's OWN text only — not the surrounding row. Matching the row
     pulled in the activity feed, whose entries read "PAID OUT 0.0296 TSLAc to
     90 holders" and link to a wallet or a transaction, not to the wrapper
     contract. Two of those survived to verification and came back with no
     symbol() at all, which is what proved the row match wrong. */
  const hit = addrHits.find((a) => {
    if (KNOWN.has(a.addr.toLowerCase())) return false;
    const hay = String(a.text || '').toUpperCase();
    return hay.includes(tick) || new RegExp('\\b' + bare + 'C\\b').test(hay);
  });
  h.address = hit ? hit.addr : null;
}
const withAddr = out.holdings.filter((h) => h.address).length;
console.log(`\naddresses on the panel: ${addrHits.length} seen, ${withAddr}/${out.holdings.length} matched to a name`);
if (withAddr < out.holdings.length) {
  console.log('  (unmatched names keep address null — the page did not name one)');
}
for (const a of addrHits.slice(0, 25)) {
  console.log(`  ${a.addr}  ${a.text || '(no text)'}`);
}

/* Validate BEFORE writing. Writing first and exiting non-zero afterwards
   still leaves an empty file on disk, and the workflow's commit step runs on
   always() — so a bad load would have published a blank panel over a good one. */
if (!out.holdings.length) {
  console.log('no holdings parsed — the panel layout may have changed.');
  console.log('Not writing data/holdings.json; the existing one stands.');
  process.exit(1);
}

writeFileSync(path.join(ROOT, 'data/holdings.json'), JSON.stringify(out, null, 2) + '\n');

console.log('--- holdings.json ---');
console.log(`  paid to holders   $${out.paidToHoldersUsd}`);
console.log(`  fees collected    $${out.feesCollectedUsd}  (${out.feesCollectedToken})`);
console.log(`  rounds paid       ${out.roundsPaid}  ·  ${out.walletPayments} wallet payments`);
console.log(`  to holders        ${out.holderSharePct}%`);
console.log(`  what it holds     ${out.whatItHolds}`);
for (const h of out.holdings) {
  console.log(`  ${String(h.ticker).padEnd(7)} ${String(h.name ?? '—').padEnd(10)} ${String(h.weightPct ?? '—').padStart(4)}%  ${h.tokens}`);
}

console.log(`\n${out.holdings.length} names parsed.`);
