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
  // The inbox listing is the heavy call. Seen 2026-10-16: code 1 "reduce the amount of data" at
  // limit=25, then -2 "Timeout" at limit=10 with participants. So list ids only, ask small, step
  // down on any transient code, try the IG-user edge too, then fetch participants one by one.
  const TRANSIENT = [1, 2, -2, 4, 17, 32, 613];
  let conv, asked;
  outer:
  for (const edge of [SP.page_id, SP.ig_id]) for (const n of [5, 2, 1]) {
    conv = await graph(ver, `${edge}/conversations?platform=instagram&limit=${n}`, ptok);
    asked = `${edge === SP.page_id ? 'Page' : 'IG'} edge, asked for ${n}`;
    if (conv.ok) break outer;
    if (!(conv.body.error && TRANSIENT.includes(conv.body.error.code))) break;
  }
  // Seen 2026-10-16: only limit=1 answered, so "1 conversation" meant one page, not one buyer.
  // Page through with the cursor until the named user turns up, up to MAX conversations.
  const MAX = 25, who = sendTo ? sendTo.replace(/^@/, '').toLowerCase() : null;
  let scanned = 0, blind = 0, igsid = null, edge = asked && asked.startsWith('IG') ? SP.ig_id : SP.page_id;
  const n = asked ? Number(asked.split(' ').pop()) : 1;
  let pageBody = conv.ok ? conv.body : null;
  while (pageBody) {
    for (const c of pageBody.data || []) {
      scanned++;
      let one = c.participants ? { ok: true, body: c } : null;
      for (let t = 0; t < 3 && !(one && one.ok); t++) one = await graph(ver, `${c.id}?fields=participants`, ptok);
      if (!one.ok) { blind++; continue; }
      for (const p of (one.body.participants && one.body.participants.data) || [])
        if (who && (p.username || '').toLowerCase() === who && p.id !== SP.ig_id) igsid = p.id;
    }
    const after = pageBody.paging && pageBody.paging.cursors && pageBody.paging.cursors.after;
    if (!who || igsid || scanned >= MAX || !after || !(pageBody.paging.next)) break;
    let next;
    for (let t = 0; t < 3; t++) {
      next = await graph(ver, `${edge}/conversations?platform=instagram&limit=${n}&after=${encodeURIComponent(after)}`, ptok);
      if (next.ok || !(next.body.error && TRANSIENT.includes(next.body.error.code))) break;
    }
    pageBody = next.ok ? next.body : null;
    if (!next.ok) log(`ℹ stopped paging after ${scanned}: ${scrub(err(next.body), r.secrets)}`);
  }
  say(conv.ok, 'can read Instagram DMs', conv.ok
    ? `${scanned} conversation${scanned === 1 ? '' : 's'} checked (${asked}${blind ? `, ${blind} unreadable` : ''})`
    : err(conv.body));

  // 5 · optional: one real message to a named user
  // DM first. Seen 2026-10-16: the inbox listing timed out past the first conversation, so if the
  // user isn't found there, fall back to a comment they left on a recent post and send a private
  // reply to it. That's the same send our comment-keyword lane uses, and it needs no inbox listing.
  const text = 'Propel Step 0 test, please ignore.';
  const send = (recipient) => graph(ver, `${SP.page_id}/messages`, ptok, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient, message: { text } })
  });
  if (who && igsid) {
    const sent = await send({ id: igsid });
    r.sent = sent.ok;
    say(sent.ok, `sent a DM to @${who}`, sent.ok ? '' : err(sent.body));
  } else if (who) {
    if (conv.ok) log(`ℹ @${who} not in the ${scanned} conversation${scanned === 1 ? '' : 's'} Meta would list. Trying comments.`);
    const media = await graph(ver, `${SP.ig_id}/media?fields=id&limit=3`, ptok);
    let comment = null, seen = 0;
    if (media.ok) for (const m of media.body.data || []) {
      const cs = await graph(ver, `${m.id}/comments?fields=id,username&limit=50`, ptok);
      if (!cs.ok) continue;
      for (const c of cs.body.data || []) { seen++; if (!comment && (c.username || '').toLowerCase() === who) comment = c.id; }
    }
    say(media.ok, 'can read comments on the 3 latest posts', media.ok ? `${seen} comments visible` : err(media.body));
    if (!comment) say(false, `found @${who} in DMs or comments`, 'ask them to comment "test" on the latest @shalomparknigeria post');
    else {
      const sent = await send({ comment_id: comment });
      r.sent = sent.ok;
      say(sent.ok, `sent a private reply to @${who}'s comment`, sent.ok ? '' : err(sent.body));
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
      [`GET ${SP.page_id}/conversations`]: (u) => u.searchParams.get('limit') === '5' ? { error: { code: -2, message: 'Timeout' } }
        : u.searchParams.get('after') === 'c1' ? { data: [{ id: 'conv2' }] }
        : { data: [{ id: 'conv1' }], paging: { cursors: { after: 'c1' }, next: 'x' } },
      'GET conv1': { participants: { data: [{ username: 'shalomparknigeria', id: SP.ig_id }, { username: 'dml.xxl', id: '111' }] } },
      'GET conv2': { participants: { data: [{ username: 'shalomparknigeria', id: SP.ig_id }, { username: 'collins', id: '999' }] } },
      [`POST ${SP.page_id}/messages`]: { recipient_id: '999' },
      [`GET ${SP.ig_id}/media`]: { data: [{ id: 'm1' }] },
      'GET m1/comments': { data: [{ id: 'cm1', username: 'osijo' }] },
      ...over
    };
    const body = typeof table[key] === 'function' ? table[key](u, opts) : table[key];
    return { ok: !(body && body.error), json: async () => body || { error: { message: 'unmocked ' + key } } };
  };
  const quiet = [];
  const log = s => quiet.push(s);

  let r = await run({ token: T, sendTo: '@Collins', fetchImpl: mock(), log });
  assert.ok(r.passed, 'happy path passes');
  assert.strictEqual(r.sent, true, 'DM sent to the participant found on page 2');
  assert.ok(!quiet.join('\n').includes(T) && !quiet.join('\n').includes(P), 'no token printed');
  assert.ok(quiet.some(l => l.includes('2 conversations checked (Page edge, asked for 2)')), 'says how many it asked for');

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
  assert.ok(quiet.some(l => l.includes('comment "test" on the latest')), 'not in DMs or comments → says why, sends nothing');
  assert.strictEqual(r.sent, undefined);

  quiet.length = 0;
  const sends = [];
  const spy = mock();
  r = await run({ token: T, sendTo: 'osijo', log, fetchImpl: async (u, o = {}) => { if (o.method === 'POST') sends.push(JSON.parse(o.body)); return spy(u, o); } });
  assert.strictEqual(r.sent, true, 'falls back to a private reply on their comment');
  assert.deepStrictEqual(sends[0].recipient, { comment_id: 'cm1' });

  console.log('✓ meta-step0: 5 scenarios, tokens never printed');
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
