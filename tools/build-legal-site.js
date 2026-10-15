#!/usr/bin/env node
/**
 * Builds site-legal/: the ONLY pages allowed on getpropel.tech before the
 * real site launches. Meta needs a privacy policy and a data-deletion page
 * online before the Shalom Park app can be saved; the homepage waits for
 * the offerings realignment. So this folder carries the two legal pages,
 * copied unchanged from site/, plus a holding page that sells nothing.
 *
 * Vercel serves site-legal/ now. At launch, its Root Directory switches to
 * site/ -- the DNS records never change.
 *
 *   node tools/build-legal-site.js           write site-legal/
 *   node tools/build-legal-site.js --check   fail if site-legal/ has drifted from site/
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'site');
const OUT = path.join(ROOT, 'site-legal');
const PAGES = ['privacy.html', 'data-deletion.html'];

const head = fs.readFileSync(path.join(SRC, 'privacy.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const holding = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Propel</title>
<meta name="robots" content="noindex">
${head}
</head>
<body>
<div class="wrap">
<h1>Propel</h1>
<p class="meta">We move property.</p>
<p>Our full site is on its way. To reach us now, message us on <a href="https://wa.me/2349019120968">WhatsApp</a>.</p>
<p><a href="/privacy.html">Privacy policy</a> &middot; <a href="/data-deletion.html">Delete your data</a></p>
</div>
</body>
</html>
`;

// Built from the files, not hand-copied, so the legal text can only change in one place.
const want = { 'index.html': holding };
for (const p of PAGES) want[p] = fs.readFileSync(path.join(SRC, p), 'utf8');

if (process.argv.includes('--check')) {
  const drift = Object.entries(want).filter(([f, body]) => {
    const file = path.join(OUT, f);
    return !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body;
  }).map(([f]) => f);
  // Nothing else may be published from this folder -- especially no prices.
  const extra = fs.existsSync(OUT) ? fs.readdirSync(OUT).filter(f => !(f in want)) : [];
  const priced = /₦|NGN|package|pricing/i.test(holding);
  if (drift.length || extra.length || priced) {
    console.log(`✖ site-legal/ is out of date${drift.length ? ' — stale: ' + drift.join(', ') : ''}${extra.length ? ' — unexpected: ' + extra.join(', ') : ''}${priced ? ' — holding page mentions pricing' : ''}. Run: node tools/build-legal-site.js`);
    process.exit(1);
  }
  console.log(`✅ site-legal/ matches site/ (${Object.keys(want).join(', ')}) and sells nothing`);
} else {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [f, body] of Object.entries(want)) fs.writeFileSync(path.join(OUT, f), body);
  console.log(`✅ wrote site-legal/: ${Object.keys(want).join(', ')}`);
}
