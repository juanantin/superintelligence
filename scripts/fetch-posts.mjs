#!/usr/bin/env node
/* ==========================================================================
   fetch-posts.mjs — turn a list of X post URLs into the wall's card data.

   THE RULE THIS ENFORCES: a card on the wall quotes a real person or
   organisation, so its text, its author and its date must come from the post
   itself. Not from memory, not from a summary, not from what the link looks
   like it probably says. This sandbox cannot reach x.com at all — the egress
   proxy blocks it — so the fetch happens on a runner and anything that cannot
   be fetched is written as an ERROR rather than filled in.

   A URL that fails leaves no card. That is the point: the alternative is
   inventing words and putting a real account's name on them.

   Source of truth is X's own oEmbed endpoint, which serves public posts with
   no authentication and returns the author and the text as the post has them.
   If oEmbed refuses, the post page is loaded in a browser as a fallback.

     node scripts/fetch-posts.mjs

   Reads data/post-urls.json, writes data/posts.json.
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URLS_FILE = path.join(ROOT, 'data/post-urls.json');
const OUT_FILE = path.join(ROOT, 'data/posts.json');

if (!existsSync(URLS_FILE)) {
  console.log('data/post-urls.json is missing — nothing to fetch.');
  process.exit(0);
}
const urls = JSON.parse(readFileSync(URLS_FILE, 'utf8')).urls || [];
if (!urls.length) { console.log('no URLs listed.'); process.exit(0); }

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&apos;': "'", '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…',
};
function decode(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}
const stripTags = (s) => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');

/* X appends a shortlink for any attached media, so the fetched text ends
   "… pic.twitter.com/MkuWluXqEu". On a card that is noise — the card links to
   the post, where the media actually is. Trailing t.co links go the same way;
   a link in the MIDDLE of a sentence is left alone, because removing it would
   change what the post says. */
function tidy(t) {
  return String(t)
    .replace(/\s*(?:https?:\/\/)?pic\.(?:twitter|x)\.com\/\S+\s*$/gi, '')
    .replace(/\s*https?:\/\/t\.co\/\S+\s*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* The oEmbed html is a blockquote: a <p> with the post's text, then an em
   dash, the display name, the handle in parentheses, and a dated permalink. */
function parseOembed(j, url) {
  const html = j.html || '';
  const pm = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const text = pm ? tidy(decode(stripTags(pm[1]))) : null;

  const hm = html.match(/\(@([A-Za-z0-9_]{1,15})\)/);
  const handle = hm ? hm[1] : (String(j.author_url || '').match(/(?:twitter|x)\.com\/([A-Za-z0-9_]+)/) || [])[1] || null;

  /* The date is the text of the LAST anchor in the blockquote. Taking the
     first would pick up a t.co link inside the post body. */
  const anchors = [...html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => decode(stripTags(m[1])).trim());
  const dateText = anchors.length ? anchors[anchors.length - 1] : null;
  const parsed = dateText ? new Date(dateText) : null;
  const date = parsed && !isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : null;

  return { url, text, name: j.author_name || null, handle, date, dateText, via: 'oembed' };
}

async function viaOembed(url) {
  const api = 'https://publish.twitter.com/oembed?omit_script=1&dnt=true&url=' + encodeURIComponent(url);
  const res = await fetch(api, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('oembed HTTP ' + res.status);
  return parseOembed(await res.json(), url);
}

/* Fallback: the post page's own OpenGraph tags. og:description is the post
   text and og:title carries the display name. Used only when oEmbed refuses. */
async function viaBrowser(url) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    const page = await browser.newPage({ userAgent:
      'Mozilla/5.0 (compatible; SuperIntelligenceBase/1.0; +https://superintelligence-sigma.vercel.app)' });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    const meta = await page.evaluate(() => {
      const g = (p) => document.querySelector(`meta[property="${p}"]`)?.content
                    || document.querySelector(`meta[name="${p}"]`)?.content || null;
      const t = document.querySelector('article time');
      return { desc: g('og:description'), title: g('og:title'), dt: t ? t.getAttribute('datetime') : null };
    });
    const handle = (url.match(/(?:twitter|x)\.com\/([A-Za-z0-9_]+)\/status/) || [])[1] || null;
    const name = meta.title ? String(meta.title).replace(/\s+on X$/i, '').replace(/^["“]|["”]$/g, '').trim() : null;
    return {
      url,
      text: meta.desc ? tidy(String(meta.desc).replace(/^["“]|["”]$/g, '')) : null,
      name, handle,
      date: meta.dt ? String(meta.dt).slice(0, 10) : null,
      dateText: null, via: 'og',
    };
  } finally { await browser.close(); }
}

const posts = [];
const failures = [];

for (const url of urls) {
  let row = null, why = [];
  for (const [label, fn] of [['oembed', viaOembed], ['browser', viaBrowser]]) {
    try {
      const r = await fn(url);
      if (r && r.text && r.name) { row = r; break; }
      why.push(`${label}: returned no text`);
    } catch (e) { why.push(`${label}: ${e.message}`); }
  }

  if (!row) {
    console.log(`✗ ${url}\n    ${why.join('\n    ')}`);
    failures.push({ url, why });
    continue;
  }
  console.log(`✓ ${row.name} (@${row.handle}) ${row.date || '(no date)'} — ${String(row.text).slice(0, 72)}…  [${row.via}]`);
  posts.push(row);
  await new Promise((r) => setTimeout(r, 700));
}

const out = {
  __doc: [
    'Posts quoted on the wall, fetched from X by scripts/fetch-posts.mjs.',
    'Text, author, handle and date all come from the post itself — never from',
    'a summary and never from memory. A URL that cannot be fetched produces no',
    'card at all rather than an invented one, and lands in `failures` below so',
    'it is visible instead of silently missing.',
    '',
    'Edit data/post-urls.json to change which posts appear.',
  ],
  fetchedAt: new Date().toISOString(),
  posts,
  failures,
};

/* Never overwrite a good file with an empty one: a bad run would blank the
   wall, and X refusing for a minute is not a reason to drop every card. */
if (!posts.length) {
  console.log('\nnothing fetched — leaving data/posts.json as it is.');
  process.exit(1);
}

writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
console.log(`\n${posts.length}/${urls.length} fetched` + (failures.length ? `, ${failures.length} failed` : ''));
