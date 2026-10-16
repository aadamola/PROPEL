#!/usr/bin/env node
/** Step 0 tool, against a fake Graph API. No network, no real token. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { step0, classify } = require('./meta-step0');

const TOKEN = 'SYSTEM_USER_TOKEN_abc';
const PAGE_TOKEN = 'PAGE_TOKEN_SECRET_xyz';

function fakeGraph({ accounts = 'ok', send = 'ok' } = {}) {
  return async (url, opts = {}) => {
    const res = (status, body) => ({ status, json: async () => body });
    if (url.includes('/me/accounts')) {
      if (accounts === 'bad') return res(400, { error: { code: 190, message: 'Invalid OAuth access token' } });
      if (accounts === 'noig') return res(200, { data: [{ id: 'P1', name: 'Shalom Park', access_token: PAGE_TOKEN }] });
      return res(200, { data: [{ id: 'P1', name: 'Shalom Park', access_token: PAGE_TOKEN,
        instagram_business_account: { id: 'IG1', username: 'shalompark' } }] });
    }
    if (url.includes('/conversations')) {
      return res(200, { data: [{ updated_time: 'now', participants: { data: [
        { id: 'IG1', username: 'shalompark' }, { id: 'IGSID_42', username: 'adedamola_test' } ] } }] });
    }
    if (url.endsWith('/me/messages')) {
      if (opts.headers.Authorization !== `Bearer ${PAGE_TOKEN}`) return res(400, { error: { code: 190, message: 'wrong token type' } });
      if (send === 'perm') return res(400, { error: { code: 10, message: 'Application does not have permission for this action' } });
      return res(200, { recipient_id: 'IGSID_42', message_id: 'm1' });
    }
    return res(404, {});
  };
}

let pass = 0, fail = 0;
const t = async (name, fn) => { try { if (await fn()) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name); } } catch (e) { fail++; console.log('  ✗ ' + name + ' — ' + e.message); } };

(async () => {
  const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'step0-'));
  const run = async (opts) => { const lines = []; const d = dir();
    const r = await step0({ token: TOKEN, slug: 'shalom-park', secretsDir: d, log: l => lines.push(l), ...opts });
    return { r, out: lines.join('\n'), d }; };

  await t('S0-01 a rejected token stops at the token check', async () => {
    const { r, out } = await run({ fetchFn: fakeGraph({ accounts: 'bad' }) });
    return !r.ok && r.stage === 'token' && /Invalid OAuth/.test(out); });
  await t('S0-02 a Page with no Instagram explains the asset fix', async () => {
    const { r, out } = await run({ fetchFn: fakeGraph({ accounts: 'noig' }) });
    return !r.ok && r.stage === 'page' && /assign the Page AND the Instagram/.test(out); });
  await t('S0-03 ★ the Page token is saved root-only and never printed', async () => {
    const { r, out, d } = await run({ fetchFn: fakeGraph() });
    const f = path.join(d, 'shalom-park-ig-page-token');
    const mode = fs.statSync(f).mode & 0o777;
    return r.ok && fs.readFileSync(f, 'utf8').trim() === PAGE_TOKEN && mode === 0o600 &&
           !out.includes(PAGE_TOKEN) && !out.includes(TOKEN); });
  await t('S0-04 without a username it lists conversations and says what to do next', async () => {
    const { r, out } = await run({ fetchFn: fakeGraph() });
    return r.stage === 'ready' && /@adedamola_test/.test(out) && /DM @shalompark/.test(out); });
  await t('S0-05 ★ a successful send to an outside account reads 🟢', async () => {
    const { r, out } = await run({ fetchFn: fakeGraph(), username: '@Adedamola_Test' });
    return r.ok && r.light === '🟢' && /FAST LANE/.test(out) && /IGSID_42/.test(out); });
  await t('S0-06 ★ the send uses the PAGE token, not the system-user token', async () => {
    const { r } = await run({ fetchFn: fakeGraph(), username: 'adedamola_test' });
    return r.ok; });  // the fake rejects any other token on /me/messages
  await t('S0-07 a permission error reads 🔴 and shows Meta\'s message', async () => {
    const { r, out } = await run({ fetchFn: fakeGraph({ send: 'perm' }), username: 'adedamola_test' });
    return !r.ok && r.light === '🔴' && /does not have permission/.test(out); });
  await t('S0-08 an unknown recipient asks them to DM first', async () => {
    const { r, out } = await run({ fetchFn: fakeGraph(), username: 'stranger' });
    return !r.ok && r.stage === 'recipient' && /DM @shalompark/.test(out); });
  await t('S0-09 classify: no error is green, code 10 is red', async () =>
    classify(null).light === '🟢' && classify({ code: 10, message: 'x' }).light === '🔴');

  console.log(`\n${pass}/${pass + fail} Step 0 tool tests passed`);
  process.exit(fail ? 1 : 0);
})();
