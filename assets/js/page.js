/* ==========================================================================
   PRESENTATION — the parts of the page app.js does not drive.
   --------------------------------------------------------------------------
   app.js owns the dashboard, the links and the clipboard. This file owns:

     1. the second set of action controls in the pitch strip, which app.js
        cannot bind because it binds by id and an id may appear once
     2. the quote wall, rendered from window.QUOTES
     3. the distribution row, rendered from window.DISTRIBUTION
     4. the "updated N seconds ago" stamp

   Loaded AFTER app.js, so CFG is already on window.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var address = String(CFG.contractAddress || '').trim();

  /* Identical to app.js's own shorten(). Both CA chips show the same string,
     and two different truncations of one address on one page reads as two
     different addresses. */
  function shorten(addr) {
    if (!addr) return '—';
    return addr.length <= 12 ? addr : addr.slice(0, 4) + '…' + addr.slice(-4);
  }

  /* ---------------------------------------------------------------------
     1. The duplicated controls in the pitch strip.

     app.js resolves #link-chart, #copy-ca and #ca-short. The pitch strip
     carries a second set, so those get their ids suffixed and are wired here
     against the SAME config values — the address is never typed into markup.
     --------------------------------------------------------------------- */

  var short2 = document.getElementById('ca-short-2');
  if (short2) short2.textContent = shorten(address);

  var chart2 = document.getElementById('link-chart-2');
  if (chart2) {
    chart2.href = (CFG.links && CFG.links.chart) ||
      ('https://dexscreener.com/' + (CFG.chain || 'base') + '/' + encodeURIComponent(address));
  }

  /* The copy button mirrors app.js's behaviour, including its fallback for
     pages not served over https:// or localhost, where the async clipboard
     API is unavailable. */
  var copy2 = document.getElementById('copy-ca-2');
  var toast = document.getElementById('copy-toast');
  var toastText = document.getElementById('toast-text');
  var toastTimer = null;

  function flash(message, isError) {
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.toggle('is-error', !!isError);
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  }

  function legacyCopy(text) {
    var el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(el);
    el.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(el);
    return ok;
  }

  if (copy2) {
    copy2.addEventListener('click', function () {
      if (!address) { flash('No address set', true); return; }
      function fallback() {
        var ok = legacyCopy(address);
        flash(ok ? 'Copied!' : 'Copy failed', !ok);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address)
          .then(function () { flash('Copied!'); })
          .catch(fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------------------------------------------------------------------
     2. The quote wall.

     Every card carries the quote, the name, the real date and A LINK TO THE
     SOURCE. An entry missing any of those is SKIPPED rather than rendered
     without it — an unsourced quote attributed to a named person is exactly
     what this section exists to avoid. There is no engagement-count field.
     --------------------------------------------------------------------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* An ISO date rendered in the reader's locale. Invalid or absent dates
     disqualify the card above, so this only ever sees a real one. */
  function prettyDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /* The speaker's initials, drawn in a disc. NOT a photograph: a portrait
     beside a quote starts to look like a profile card, which is the thing the
     mockup did and this does not. */
  function initials(name) {
    return String(name || '').trim().split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  }

  var quotes = Array.isArray(window.QUOTES) ? window.QUOTES : [];
  var usable = quotes.filter(function (q) {
    return q && q.quote && q.name && q.href && q.date && !isNaN(new Date(q.date).getTime());
  });

  var quotesWrap = document.getElementById('quotes');
  var quotesGrid = document.getElementById('quotes-grid');

  if (quotesWrap && quotesGrid && usable.length) {
    quotesGrid.innerHTML = usable.map(function (q) {
      return '' +
        '<li class="quote rise">' +
          '<div class="quote__top">' +
            '<span class="quote__avatar" aria-hidden="true">' + esc(initials(q.name)) + '</span>' +
            '<span class="quote__who">' +
              '<b class="quote__name">' + esc(q.name) + '</b>' +
              (q.role ? '<span class="quote__role">' + esc(q.role) + '</span>' : '') +
            '</span>' +
          '</div>' +
          '<blockquote class="quote__text">' + esc(q.quote) + '</blockquote>' +
          '<p class="quote__meta">' +
            '<time datetime="' + esc(q.date) + '">' + esc(prettyDate(q.date)) + '</time>' +
            '<a class="quote__src" href="' + esc(q.href) + '" target="_blank" rel="noopener noreferrer">' +
              'Source' + (q.source ? ' · ' + esc(q.source) : '') + ' →' +
            '</a>' +
          '</p>' +
        '</li>';
    }).join('');
    quotesWrap.hidden = false;
  }

  /* ---------------------------------------------------------------------
     3. The distribution row — only the names the index actually holds.
     --------------------------------------------------------------------- */

  var nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  var nfFine = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

  /* Whole numbers, as everywhere else on the page — except an amount that
     would round away to nothing, which keeps enough places to stay visible.
     Reporting a real figure as "0" is a worse error than showing decimals. */
  function amount(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    if (n !== 0 && Math.abs(n) < 1) return nfFine.format(n);
    return nf0.format(Math.round(n));
  }
  function usd(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    if (n !== 0 && Math.abs(n) < 1) return '$' + nfFine.format(n);
    return '$' + nf0.format(Math.round(n));
  }

  var dist = Array.isArray(window.DISTRIBUTION) ? window.DISTRIBUTION : [];
  var distWrap = document.getElementById('dist');
  var distGrid = document.getElementById('dist-grid');

  if (distWrap && distGrid && dist.length) {
    distGrid.innerHTML = dist.map(function (d) {
      return '' +
        '<li class="dist__card rise">' +
          (d.logo
            ? '<img class="dist__logo" src="' + esc(d.logo) + '" alt="" width="64" height="64" loading="lazy" decoding="async">'
            : '<span class="dist__logo dist__logo--text" aria-hidden="true">' + esc(initials(d.name)) + '</span>') +
          '<h3 class="dist__name">' + esc(d.name) + '</h3>' +
          (d.ticker ? '<p class="dist__ticker">$' + esc(d.ticker) + '</p>' : '') +
          '<p class="dist__tokens">' + esc(amount(d.tokens)) + '</p>' +
          '<p class="dist__usd">' + esc(usd(d.usd)) + '</p>' +
        '</li>';
    }).join('');
    distWrap.hidden = false;
  }

  /* ---------------------------------------------------------------------
     4. The "updated N seconds ago" stamp.

     Driven by the dashboard legend rather than by its own timer: app.js
     rewrites #legend-text on every load, so a mutation on it is the signal
     that figures just refreshed. No second polling loop.
     --------------------------------------------------------------------- */

  var pill = document.getElementById('dash-pill');
  var legend = document.getElementById('legend-text');
  if (!pill || !legend || !('MutationObserver' in window)) return;

  var stamp = document.createElement('span');
  stamp.className = 'pill__age';
  pill.appendChild(stamp);

  var last = Date.now();

  function ago() {
    var s = Math.max(0, Math.round((Date.now() - last) / 1000));
    if (s < 60) return 'updated ' + s + 's ago';
    var m = Math.round(s / 60);
    if (m < 60) return 'updated ' + m + 'm ago';
    return 'updated ' + Math.round(m / 60) + 'h ago';
  }

  function tick() { stamp.textContent = ago(); }

  new MutationObserver(function () { last = Date.now(); tick(); })
    .observe(legend, { childList: true, characterData: true, subtree: true });

  tick();
  setInterval(tick, 1000);
})();
