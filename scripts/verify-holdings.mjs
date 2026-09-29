#!/usr/bin/env node
/* ==========================================================================
   verify-holdings.mjs — prove the addresses in data/holdings.json are the
   contracts they are claimed to be.

   holdings-probe reads those addresses off a third-party page. That makes
   each one a CLAIM, not a fact: the panel's layout can shift, a link can move
   row, and a plausible-looking address next to the right ticker is exactly
   the kind of thing nobody re-checks. So every address gets symbol() and
   decimals() read off chain here, and the symbol has to match the ticker the
   panel filed it under or the address is dropped to null.

   Twelve eth_calls, no getLogs — this is nothing like the unfiltered log scan
   the public endpoint refuses, so it runs comfortably without a private RPC.

     RPC_URL=https://mainnet.base.org node scripts/verify-holdings.mjs
   ========================================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RPC = process.env.RPC_URL || 'https://mainnet.base.org';
const FILE = path.join(ROOT, 'data/holdings.json');

const data = JSON.parse(readFileSync(FILE, 'utf8'));
if (!Array.isArray(data.holdings) || !data.holdings.length) {
  console.log('no holdings to verify.');
  process.exit(0);
}

let id = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* The public Base endpoint throttles per IP and GitHub's runners share them,
   so twelve calls fired back to back got "over rate limit" on the last four —
   which then looked like four failed contracts rather than one busy node.
   Spaced, and retried with backoff, so a throttle cannot be mistaken for a
   reading. */
async function ethCall(to, selector, tries = 4) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(RPC, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: ++id, method: 'eth_call',
        params: [{ to, data: selector }, 'latest'],
      }),
    });
    const j = await res.json().catch(() => ({ error: { message: 'bad JSON' } }));
    if (!j.error) return j.result;
    const throttled = /rate limit|too many|429/i.test(j.error.message || '');
    if (!throttled || attempt >= tries) throw new Error(j.error.message);
    await sleep(attempt * 1500);
  }
}

/* A string return is ABI-encoded: offset, length, then the bytes. Some older
   tokens return a bare bytes32 instead, so both shapes are handled — reading
   only the first would silently produce mojibake for the other. */
function decodeString(hex) {
  if (!hex || hex === '0x') return null;
  const body = hex.slice(2);
  if (body.length === 64) {
    const bytes = Buffer.from(body, 'hex');
    const end = bytes.indexOf(0);
    return bytes.slice(0, end === -1 ? bytes.length : end).toString('utf8').trim() || null;
  }
  const len = parseInt(body.slice(64, 128), 16);
  if (!Number.isFinite(len) || len <= 0) return null;
  return Buffer.from(body.slice(128, 128 + len * 2), 'hex').toString('utf8').trim() || null;
}

const SYMBOL = '0x95d89b41';
const DECIMALS = '0x313ce567';

let verified = 0, dropped = 0;

for (const h of data.holdings) {
  if (!h.address) { console.log(`${String(h.ticker).padEnd(7)} no address on the panel — skipped`); continue; }

  let symbol = null, decimals = null, err = null, empty = false;
  try {
    const raw = await ethCall(h.address, SYMBOL);
    await sleep(350);
    /* An empty return is not a mismatch — it means the address has no
       symbol() at all, so it is not a token contract. Almost certainly a
       wallet or a transaction the panel linked next to that ticker. Worth
       saying differently, because the fix is different. */
    if (!raw || raw === '0x') empty = true;
    symbol = decodeString(raw);
    const d = await ethCall(h.address, DECIMALS);
    await sleep(350);
    decimals = d && d !== '0x' ? parseInt(d, 16) : null;
  } catch (e) { err = e.message; }

  if (err) {
    console.log(`${String(h.ticker).padEnd(7)} ${h.address}  READ FAILED: ${err}`);
    /* A failed read is not a disproof — the node may simply be busy — so the
       address stands and is marked unverified rather than thrown away. */
    h.verified = false;
    continue;
  }

  if (empty) {
    console.log(`${String(h.ticker).padEnd(7)} ${h.address}  has no symbol() — not a token contract, dropping`);
    h.address = null; h.symbol = null; h.decimals = null; h.verified = false;
    dropped++;
    continue;
  }

  const claimed = String(h.ticker).toUpperCase();
  const got = String(symbol || '').toUpperCase();
  const ok = got && (got === claimed || got.replace(/C$/, '') === claimed.replace(/C$/, ''));

  if (ok) {
    h.symbol = symbol;
    h.decimals = decimals;
    h.verified = true;
    verified++;
    console.log(`${String(h.ticker).padEnd(7)} ${h.address}  symbol() "${symbol}"  decimals() ${decimals}  ✓`);
  } else {
    console.log(`${String(h.ticker).padEnd(7)} ${h.address}  symbol() "${symbol}" does NOT match — dropping the address`);
    h.address = null;
    h.symbol = null;
    h.decimals = null;
    h.verified = false;
    dropped++;
  }
}

data.verifiedAt = new Date().toISOString();
writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

console.log(`\n${verified}/${data.holdings.length} verified on chain` + (dropped ? `, ${dropped} dropped as mismatched` : ''));
if (dropped) {
  console.log('A dropped address means the panel put a contract next to a ticker it does not belong to,');
  console.log('or its layout moved. The name keeps its figures; it just has no contract attached.');
}
