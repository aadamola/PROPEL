#!/usr/bin/env node
/**
 * Step 0 for Instagram: what will Meta actually let this app do?
 *
 * Run on the VPS via:  bash ops/setup/vps-tools.sh step0
 * (that wrapper asks for the system-user token without echoing it, and passes
 * it in as META_TOKEN — the token never touches a file, a log or the screen).
 *
 * Read-only by default. It sends ONE DM only when STEP0_SEND_TO names an
 * Instagram username that has messaged @shalomparknigeria in the last 24 hours.
 *
 *   node tools/meta-step0.js --selftest   # mocked Graph, no network (in test-all)
 */
const SP = {
  page_id: '101077059689474',      // Shalom Park Nigeria (Business Settings → Pages)
  ig_id: '17841459679675834',      // @shalomparknigeria (Business Settings → Instagram accounts)
  app_id: '1739429447113718',      // Shalom Park Concierge
  pinned: 'v21.0',                 // what 05 and clients.json call today
  current: 'v26.0'                 // what the app dashboard offered on 2026-10-16
};
const NEED = ['instagram_basic', 'instagram_manage_messages', 'instagram_manage_comments',
  'pages_show_list', 'pages_read_engagement', 'business_management'];
// The Instagram use case (2026-10-16) no longer offers pages_manage_metadata. Reported, never failed:
// whether webhooks still need it is part of what Step 0 finds out.
const NICE = ['pages_manage_metadata'];

// Never let a token reach the terminal, even inside a Graph error message.
const scrub = (s, secrets) => secrets.filter(Boolean).reduce((t, x) => t.split(x).join('‹token›'), String(s));

async function run({ token, sendTo, fetchImpl = fetch, log = console.log }) {
  const r = { checks: [], secrets: [token] };
  const say = (ok, what, detail = '') => { r.checks.push({ ok, what }); log(`${ok ? '✓' : '✖'} ${what}${detail ? ' — ' + scrub(detail, r.secrets) : ''}`); };
  const graph = async (ver, path, tok, opts = {}) => {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetchImpl(`https://graph.facebook.com/${ver}/${path}${sep}access_token=${encodeURIComponent(tok)}`, opts);
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok && !body.error, body };
  };
  const err = b => b.error ? `${b.error.code || ''} ${b.error.message || ''}`.trim() : 'no detail';

  // 1 · the token itself
  const dbg = await graph(SP.current, `debug_token?input_token=${encodeURIComponent(token)}`, token);
  const d = dbg.body.data || {};
  if (!dbg.ok || !d.is_valid) { say(false, 'token is valid', err(dbg.body)); return finish(r, log); }
  say(String(d.app_id) === SP.app_id, `token belongs to Shalom Park Concierge`, `app ${d.app_id}`);
  say(!d.expires_at, 'token never expires', d.expires_at ? `expires ${new Date(d.expires_at * 1000).toISOString()}` : '');
  const missing = NEED.filter(p => !(d.scopes || []).includes(p));
  say(!missing.length, 'token carries every permission the workflows use', missing.length ? 'missing: ' + missing.join(', ') : '');
  const absent = NICE.filter(p => !(d.scopes || []).includes(p));
  if (absent.length) log(`ℹ not on the token (not counted as a failure): ${absent.join(', ')}`);

  // 2 · which Graph version answers
  for (const v of [SP.pinned, SP.current]) {
    const me = await graph(v, 'me?fields=id', token);
    say(me.ok, `Graph ${v} answers`, me.ok ? '' : err(me.body));
    r[v] = me.ok;
  }
  const ver = r[SP.current] ? SP.current : SP.pinned;

  // 3 · page → IG link, and the page token the workflows actually send with
  const page = await graph(ver, `${SP.page_id}?fields=name,access_token,instagram_business_account`, token);
  if (!page.ok) { say(false, 'can read the Shalom Park Nigeria Page', err(page.body)); return finish(r, log); }
  const ptok = page.body.access_token; r.secrets.push(ptok);
  say(!!ptok, 'a Page token can be issued (the one n8n sends with)');
  const linked = page.body.instagram_business_account && page.body.instagram_business_account.id;
  say(linked === SP.ig_id, 'the Page is linked to @shalomparknigeria', linked ? `linked to ${linked}` : 'no Instagram linked');
  if (!ptok) return finish(r, log);

  // 4 · can it read DMs?
  const conv = await graph(ver, `${SP.page_id}/conversations?platform=instagram&fields=participants,updated_time&limit=25`, ptok);
  say(conv.ok, 'can read Instagram DMs', conv.ok ? `${(conv.body.data || []).length} recent conversations` : err(conv.body));

  // 5 · optional: one real DM
  if (sendTo && conv.ok) {
    const who = sendTo.replace(/^@/, '').toLowerCase();
    let igsid = null;
    for (const c of conv.body.data || []) for (const p of (c.participants && c.participants.data) || [])
      if ((p.username || '').toLowerCase() === who && p.id !== SP.ig_id) igsid = p.id;
    if (!igsid) say(false, `found a conversation with @${who}`, 'they must DM @shalomparknigeria first');
    else {
      const sent = await graph(ver, `${SP.page_id}/messages`, ptok, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: { id: igsid }, message: { text: 'Propel Step 0 test, please ignore.' } })
      });
      r.sent = sent.ok;
      say(sent.ok, `sent a DM to @${who}`, sent.ok ? '' : err(sent.body));
    }
  }
  return finish(r, log);
}

function finish(r, log) {
  const failed = r.checks.filter(c => !c.ok).length;
  log(`\n${r.checks.length - failed}/${r.checks.length} checks passed. No token was printed — safe to screenshot.`);
  r.passed = !failed;
  return r;
}

async function selftest() {
  const assert = require('assert');
  const T = 'EAAG-secret-system-token', P = 'EAAG-secret-page-token';
  const mock = (over = {}) => async (url, opts = {}) => {
    const u = new URL(url); const path = u.pathname.split('/').slice(2).join('/');
    const key = (opts.method || 'GET') + ' ' + path;
    const table = {
      'GET debug_token': { data: { is_valid: true, app_id: SP.app_id, expires_at: 0, scopes: NEED } },
      'GET me': { id: '61595191243287' },
      [`GET ${SP.page_id}`]: { name: 'Shalom Park Nigeria', access_token: P, instagram_business_account: { id: SP.ig_id } },
      [`GET ${SP.page_id}/conversations`]: { data: [{ participants: { data: [{ username: 'shalomparknigeria', id: SP.ig_id }, { username: 'collins', id: '999' }] } }] },
      [`POST ${SP.page_id}/messages`]: { recipient_id: '999' },
      ...over
    };
    const body = typeof table[key] === 'function' ? table[key](u, opts) : table[key];
    return { ok: !(body && body.error), json: async () => body || { error: { message: 'unmocked ' + key } } };
  };
  const quiet = [];
  const log = s => quiet.push(s);

  let r = await run({ token: T, sendTo: '@Collins', fetchImpl: mock(), log });
  assert.ok(r.passed, 'happy path passes');
  assert.strictEqual(r.sent, true, 'DM sent to the matched participant');
  assert.ok(!quiet.join('\n').includes(T) && !quiet.join('\n').includes(P), 'no token printed');

  quiet.length = 0;
  r = await run({ token: T, fetchImpl: mock({ [`POST ${SP.page_id}/messages`]: { error: { code: 10, message: `Application does not have permission (${P})` } } }), sendTo: 'collins', log });
  assert.strictEqual(r.sent, false, 'a refused send is reported');
  assert.ok(!quiet.join('\n').includes(P) && quiet.join('\n').includes('‹token›'), 'a token echoed in an error is scrubbed');

  quiet.length = 0;
  r = await run({ token: T, fetchImpl: mock({ 'GET debug_token': { data: { is_valid: true, app_id: '1', scopes: ['instagram_basic'] } } }), log });
  assert.ok(!r.passed, 'wrong app + missing scopes fail');
  assert.ok(quiet.some(l => l.includes('missing: instagram_manage_messages')), 'names the missing permission');

  quiet.length = 0;
  r = await run({ token: T, sendTo: 'stranger', fetchImpl: mock(), log });
  assert.ok(quiet.some(l => l.includes('must DM @shalomparknigeria first')), 'no conversation → says why, sends nothing');
  assert.strictEqual(r.sent, undefined);

  console.log('✓ meta-step0: 4 scenarios, tokens never printed');
}

if (require.main === module) {
  if (process.argv.includes('--selftest')) selftest().catch(e => { console.error(e); process.exit(1); });
  else {
    const token = process.env.META_TOKEN;
    if (!token) { console.error('✖ META_TOKEN not set. Run it through: bash ops/setup/vps-tools.sh step0'); process.exit(1); }
    run({ token, sendTo: process.env.STEP0_SEND_TO }).then(r => process.exit(r.passed ? 0 : 1))
      .catch(e => { console.error('✖ ' + scrub(e.message, [token])); process.exit(1); });
  }
}
module.exports = { run, SP, NEED, NICE };
