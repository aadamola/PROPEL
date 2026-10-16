#!/usr/bin/env node
/**
 * Step 0 test: can an app in the CLIENT's portfolio message an outside
 * Instagram account without App Review? Run on the server through
 *   bash /opt/propel-repo/ops/setup/vps-tools.sh step0 <slug> [instagram_username]
 *
 * Reads the System User token from stdin (never argv, never printed). It:
 *   1. finds the client's Facebook Page + linked Instagram account
 *   2. derives the PAGE access token (what the n8n credential must hold:
 *      the workflow sends as the Page) and saves it to a root-only file
 *   3. lists recent Instagram conversations
 *   4. if a username is given, DMs that person one test message
 * and reads the result as 🟢 / 🟡 / 🔴.
 *
 * The tester must DM the client's Instagram FIRST from an account with no
 * role on the app; Meta only allows replies inside an open conversation.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const GRAPH = process.env.GRAPH_VERSION || 'v21.0';
const BASE = `https://graph.facebook.com/${GRAPH}`;

async function getJSON(fetchFn, url, opts) {
  const r = await fetchFn(url, opts);
  let body = {};
  try { body = await r.json(); } catch (_) { /* empty body */ }
  return { status: r.status, body };
}

/** Classify a Graph send error into the three Step 0 outcomes. */
function classify(err) {
  if (!err) return { light: '🟢', verdict: 'FAST LANE: the app messaged an outside account. No App Review needed. Ship it.' };
  const msg = String(err.message || '').toLowerCase();
  const code = Number(err.code);
  if (code === 10 || code === 200 || /advanced access|app review|permission/.test(msg)) {
    return { light: '🔴', verdict: 'PERMISSION BLOCK: Meta wants Advanced Access (App Review) or the token lacks a permission. Send me this output.' };
  }
  if (code === 551 || code === 100 && /not available|outside|window|no matching user/.test(msg)) {
    return { light: '🟡', verdict: 'BLOCKED FOR THIS USER: often dev mode (only app-role accounts) or no open conversation. Check the tester DMed first; then send me this output.' };
  }
  return { light: '🟠', verdict: 'UNEXPECTED ERROR: not a clean answer either way. Send me this output.' };
}

async function step0({ token, username, slug, fetchFn = fetch, secretsDir = '/secrets', log = console.log }) {
  const auth = t => ({ headers: { Authorization: `Bearer ${t}` } });

  // 1. Pages this token can manage, with their Instagram accounts and Page tokens.
  const acc = await getJSON(fetchFn, `${BASE}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}`, auth(token));
  if (acc.status !== 200) {
    log(`✖ token rejected by Graph ${GRAPH}: ${acc.body.error ? acc.body.error.message : 'HTTP ' + acc.status}`);
    log('  Usual causes: token copied incompletely · wrong token (use the System User token) · Graph version retired (try GRAPH_VERSION=v22.0)');
    return { ok: false, stage: 'token' };
  }
  const pages = (acc.body.data || []).filter(p => p.instagram_business_account);
  if (!pages.length) {
    log('✖ the token sees no Facebook Page with a linked Instagram account.');
    log('  Fix: in Business Settings, assign the Page AND the Instagram account to the System User, then regenerate the token.');
    return { ok: false, stage: 'page' };
  }
  const page = pages[0];
  const ig = page.instagram_business_account;
  log(`✓ Graph ${GRAPH} accepted the token`);
  log(`✓ Page: ${page.name} (${page.id}) → Instagram @${ig.username} (${ig.id})`);
  if (pages.length > 1) log(`  note: ${pages.length} Pages found; using the first. Tell me if that's the wrong one.`);

  // 2. Save the Page token for the n8n credential. Root-only, never printed.
  fs.mkdirSync(secretsDir, { recursive: true, mode: 0o700 });
  const file = path.join(secretsDir, `${slug}-ig-page-token`);
  fs.writeFileSync(file, page.access_token + '\n', { mode: 0o600 });
  log(`✓ Page token saved to /opt/propel/.secrets/${slug}-ig-page-token (root-only). It goes in the n8n credential; never paste it in chat.`);

  // 3. Recent conversations: who can we reply to?
  const conv = await getJSON(fetchFn, `${BASE}/${page.id}/conversations?platform=instagram&fields=participants,updated_time&limit=10`, auth(page.access_token));
  if (conv.status !== 200) {
    const c = classify(conv.body.error || { message: 'HTTP ' + conv.status });
    log(`${c.light} could not read conversations: ${conv.body.error ? conv.body.error.message : 'HTTP ' + conv.status}`);
    log(`  ${c.verdict}`);
    return { ok: false, stage: 'conversations', light: c.light };
  }
  const people = [];
  for (const t of conv.body.data || []) {
    for (const p of (t.participants && t.participants.data) || []) {
      if (p.id !== ig.id && p.username !== ig.username) people.push({ id: p.id, username: p.username, updated: t.updated_time });
    }
  }
  log(`✓ ${people.length} recent conversation(s): ${people.map(p => '@' + p.username).join(', ') || '(none yet)'}`);

  if (!username) {
    log('\nNext: from your personal Instagram (no role on the app), DM @' + ig.username + ' the word "test", then run this again with your username.');
    return { ok: true, stage: 'ready', page_id: page.id, ig_id: ig.id };
  }

  // 4. The test itself: one reply to an outside account.
  const who = people.find(p => (p.username || '').toLowerCase() === username.replace(/^@/, '').toLowerCase());
  if (!who) {
    log(`✖ no open conversation with @${username.replace(/^@/, '')}. DM @${ig.username} from that account first, then rerun.`);
    return { ok: false, stage: 'recipient' };
  }
  const send = await getJSON(fetchFn, `${BASE}/me/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${page.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: who.id }, message: { text: 'Propel Step 0 test. If you can read this, the integration can reply to buyers.' } })
  });
  const err = send.status === 200 ? null : (send.body.error || { message: 'HTTP ' + send.status });
  const c = classify(err);
  log(`\n${c.light} ${c.verdict}`);
  if (err) log(`  Graph said: (#${err.code || '?'}) ${err.message}`);
  log(`  Also note for the ledger check: DM sender id for @${who.username} = ${who.id}`);
  return { ok: !err, stage: 'sent', light: c.light };
}

module.exports = { step0, classify };

if (require.main === module) {
  const [slug, username] = process.argv.slice(2);
  if (!slug) { console.error('usage: meta-step0.js <slug> [instagram_username]  (token on stdin)'); process.exit(1); }
  const token = fs.readFileSync(0, 'utf8').trim();
  if (!token) { console.error('✖ no token on stdin'); process.exit(1); }
  step0({ token, username, slug }).then(r => process.exit(r.ok ? 0 : 1))
    .catch(e => { console.error('✖ ' + e.message); process.exit(1); });
}
