#!/usr/bin/env node
/**
 * Client #2 rehearsal.
 *
 * Onboards a fictional "Test Estate" end to end in a throwaway copy of the
 * repo: scaffold → refuse activation with holes → fill → build keywords →
 * build workflows → preflight. Then proves the thing that would hurt most
 * with two clients: each client's lead alerts reach ONLY its own inbox.
 *
 * Nothing in the real repo is touched.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'propel-onboard-'));
for (const d of ['ops', 'clients']) fs.cpSync(path.join(REPO, d), path.join(TMP, d), { recursive: true });

const env = { ...process.env, PROPEL_ROOT: TMP };
const run = (tool, args = []) => execFileSync('node', [path.join(REPO, 'tools', tool), ...args],
  { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const tryRun = (tool, args) => { try { return { ok: true, out: run(tool, args) }; } catch (e) { return { ok: false, out: (e.stdout || '') + (e.stderr || '') }; } };
const J = p => JSON.parse(fs.readFileSync(path.join(TMP, p), 'utf8'));
const WJ = (p, o) => fs.writeFileSync(path.join(TMP, p), JSON.stringify(o, null, 2) + '\n');

let pass = 0, fail = 0;
const t = (name, cond, detail = '') => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); } };

// 1. Scaffold
run('new-client.js', ['test-estate', 'Test Estate', 'Test Estate Development Ltd']);
let reg = J('ops/concierge/clients.json');
t('ONB-01 scaffold adds a registry row with status onboarding', reg.clients['test-estate'] && reg.clients['test-estate'].status === 'onboarding');
t('ONB-02 scaffold creates README, empty KB, keyword header, Phase 0 log',
  ['README.md', 'kb.json', 'keywords.csv', 'phase0-log.csv'].every(f => fs.existsSync(path.join(TMP, 'clients/test-estate', f))));
t('ONB-03 a duplicate slug is refused', !tryRun('new-client.js', ['test-estate', 'Again']).ok);
t('ONB-04 a bad slug is refused', !tryRun('new-client.js', ['Test Estate!', 'Bad']).ok);

// 2. An onboarding client is not built and does not break the build
run('build-workflows.js');
t('ONB-05 no Instagram workflow is built while onboarding',
  !fs.existsSync(path.join(TMP, 'ops/concierge/workflows/05-channel-instagram-test-estate.json')));
t('ONB-06 preflight stays clean with an onboarding client present', tryRun('preflight-workflows.js').ok);

// 3. Activation with holes must be refused
reg.clients['test-estate'].status = 'active';
reg.clients['test-estate'].channels.instagram.enabled = true;
WJ('ops/concierge/clients.json', reg);
run('build-workflows.js');
const holes = tryRun('preflight-workflows.js');
t('ONB-07 ★ preflight refuses an active client with no alert inbox', !holes.ok && /no alerts\.email_to/.test(holes.out), holes.out.slice(-300));
t('ONB-08 ★ preflight refuses an active client with nobody on duty', /no escalation\.primary/.test(holes.out));

// 4. Fill it the way the playbook says
reg = J('ops/concierge/clients.json');
const c = reg.clients['test-estate'];
c.escalation.primary = { name: 'Ada', whatsapp: '2348000000000', hours: 'Mon-Fri 08:00-20:00' };
c.alerts.email_to = ['sales@test-estate.example'];
c.facts_sheet = { signed_by: 'Ada', signed_on: '2026-10-15', file: 'clients/test-estate/docs/facts.pdf' };
c.keywords.enabled = true;
c.keywords.phase0.priority_rules = ['TE-PRICE'];
WJ('ops/concierge/clients.json', reg);
const kb = J('clients/test-estate/kb.json');
kb.units = [{ id: '3B', type: '3-Bedroom Terrace', price_ngn: 90000000 }];
WJ('clients/test-estate/kb.json', kb);
fs.appendFileSync(path.join(TMP, 'clients/test-estate/keywords.csv'),
  'TE-PRICE,50,fast_lane,Price,price,price|how much,"The 3-bedroom terrace is ₦90,000,000. Would you like to book an inspection?",Sent you a DM,TE-PRICE,none,FALSE,units.3B.price_ngn,live,,,,,\n');

const kw = tryRun('build-keywords.js', ['--client=test-estate']);
t('ONB-09 keyword table builds for the new client', kw.ok, kw.out.slice(-300));
t('ONB-10 Phase 0 saved replies are generated for the new client',
  fs.existsSync(path.join(TMP, 'clients/test-estate/phase0-saved-replies.md')) &&
  /then message Ada/.test(fs.readFileSync(path.join(TMP, 'clients/test-estate/phase0-saved-replies.md'), 'utf8')));

run('build-workflows.js');
const igFile = path.join(TMP, 'ops/concierge/workflows/05-channel-instagram-test-estate.json');
t('ONB-11 its own Instagram workflow is built', fs.existsSync(igFile));
const ig = fs.existsSync(igFile) ? JSON.parse(fs.readFileSync(igFile, 'utf8')) : { nodes: [] };
const node = n => ig.nodes.find(x => x.name === n) || { parameters: {} };
t('ONB-12 webhook path is the client\'s own', node('IG webhook (events)').parameters.path === 'test-estate-ig');
t('ONB-13 handshake reads the client\'s own verify token', /META_VERIFY_TOKEN_TEST_ESTATE/.test(node('Handshake').parameters.jsCode || ''));
t('ONB-14 signature check reads the client\'s own app secret', /TEST_ESTATE_APP_SECRET/.test(node('Verify signature').parameters.jsCode || ''));
t('ONB-15 nothing in it still says shalom', !/shalom/i.test(JSON.stringify(ig)));
t('ONB-16 Shalom Park\'s workflow is still built alongside it',
  fs.existsSync(path.join(TMP, 'ops/concierge/workflows/05-channel-instagram-shalom-park.json')));
const core = JSON.parse(fs.readFileSync(path.join(TMP, 'ops/concierge/workflows/03-concierge-core.json'), 'utf8'));
t('ONB-17 the CORE carries the new client\'s KB', /3-Bedroom Terrace/.test(JSON.stringify(core)));

// 5. ★ Alerts go to the right client
const led = JSON.parse(fs.readFileSync(path.join(TMP, 'ops/concierge/workflows/06-ledger-and-escalation.json'), 'utf8'));
const compose = led.nodes.find(n => n.name === 'Resolve on-duty + compose').parameters.jsCode;
const alertFor = client_id => new Function('$input', compose)({ first: () => ({ json:
  { client_id, channel: 'instagram_dm', contact_handle: 'buyer1', text: 'price', reply: 'x', escalate: true, send: true } }) })[0].json;
t('ONB-18 ★ a Test Estate lead alerts Test Estate\'s inbox', alertFor('test-estate').alert_to === 'sales@test-estate.example');
t('ONB-19 ★ a Shalom Park lead still alerts Shalom Park\'s inbox', alertFor('shalom-park').alert_to === 'sales@shalomparknigeria.com');
const email = led.nodes.find(n => n.name === 'Alert the sales team').parameters;
t('ONB-20 the email node reads recipients per lead, not a fixed address', /alert_to/.test(email.toEmail) && !/@/.test(email.toEmail));

const pf = tryRun('preflight-workflows.js');
t('ONB-21 preflight passes once the row is complete', pf.ok, pf.out.slice(-400));

if (!process.env.KEEP_TMP) fs.rmSync(TMP, { recursive: true, force: true }); else console.log('kept: ' + TMP);
console.log(`\n${pass}/${pass + fail} onboarding rehearsal tests passed`);
process.exit(fail ? 1 : 0);
