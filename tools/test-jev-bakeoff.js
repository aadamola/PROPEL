#!/usr/bin/env node
/**
 * Jev bake-off harness: the routing policy and the grading, offline.
 *
 * No network and no key. Jev's answers are faked so the rules we would ship
 * are pinned down before a single live call: Jev can upgrade a message to an
 * escalation, never downgrade one, and a broken answer always means "brain".
 */
'use strict';
const path = require('path');
const B = require(path.join(__dirname, '../sandbox/apex-gardens/jev-bakeoff/bakeoff.js'));

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ✖ ${name}`); }
}

const rules = B.loadRules();
const messages = B.loadMessages();
const byId = B.indexRules(rules);
const ans = (choice, confidence) => ({ choice, confidence, probabilities: {} });

// Inputs
check('rule ids are unique', byId.size === rules.length);
check('every expected label is a real rule or NONE',
  messages.every(m => m.expect.length && m.expect.every(id => id === B.NONE || byId.has(id))));
check('message ids are unique', new Set(messages.map(m => m.id)).size === messages.length);
let refused = false;
try { B.assertFictional({ _meta: {} }, 'real.json'); } catch (e) { refused = true; }
check('a file not marked fictional is refused', refused);

// Request shape (TypeSafe /v1/systemone)
const req = B.buildRequest(rules, 'how much is the condo');
const q = req.questions.route;
check('request carries model, state and one choice question',
  req.model === 'jev-latest' && req.state.instagram_message === 'how much is the condo' && q.type === 'choice');
check('every live rule is a label, plus NONE',
  Object.keys(q.criteria).length === rules.length + 1 && q.criteria[B.NONE]);
check('labels describe the question, never carry our answer text',
  !JSON.stringify(q).includes('₦') && !JSON.stringify(q).includes('[DEMO]'));

// Parsing
check('direct TypeSafe shape parses',
  B.parseAnswer({ answers: { route: { type: 'choice', choice: 'AG-2B', confidence: 0.9, probabilities: {} } } }).choice === 'AG-2B');
check('wrapped reseller shape parses',
  B.parseAnswer({ code: 0, data: { result: { answers: { route: { choice: 'AG-PAY', confidence: 0.8 } } } } }).choice === 'AG-PAY');
check('non-zero code is not a decision', B.parseAnswer({ code: 7, data: { result: { answers: { route: { choice: 'AG-2B' } } } } }) === null);
check('garbage is not a decision', B.parseAnswer('oops') === null && B.parseAnswer({ answers: {} }) === null);

// Hybrid policy
const h = (kwPick, a) => B.hybridLane(kwPick, a, byId).pick;
check('keyword escalation is final even if Jev is sure of a sales card',
  h('AG-ESC-ROI', ans('AG-4B', 0.99)) === 'AG-ESC-ROI');
check('confident Jev escalation beats a keyword sales card',
  h('AG-PRICE-GEN', ans('AG-ESC-ROI', 0.6)) === 'AG-ESC-ROI');
check('weak Jev escalation does not override a keyword sales card',
  h('AG-PRICE-GEN', ans('AG-ESC-ROI', 0.3)) === 'AG-PRICE-GEN');
check('keyword sales card wins over a different Jev sales card',
  h('AG-2B', ans('AG-3B', 0.99)) === 'AG-2B');
check('a very confident Jev card replaces a GENERIC keyword card',
  h('AG-PRICE-GEN', ans('AG-AMEN', 0.85)) === 'AG-AMEN');
check('a less confident Jev card does not replace a generic keyword card',
  h('AG-PRICE-GEN', ans('AG-3B', 0.63)) === 'AG-PRICE-GEN');
check('Jev saying NONE never wipes out a keyword card', h('AG-PRICE-GEN', ans(B.NONE, 0.99)) === 'AG-PRICE-GEN');
check('on a keyword miss a confident Jev card is taken', h(B.NONE, ans('AG-PAY', 0.8)) === 'AG-PAY');
check('on a keyword miss a weak Jev card goes to the brain', h(B.NONE, ans('AG-PAY', 0.5)) === B.NONE);
check('Jev saying NONE goes to the brain', h(B.NONE, ans(B.NONE, 0.99)) === B.NONE);
check('an invented label goes to the brain', h(B.NONE, ans('AG-FREE-HOUSE', 0.99)) === B.NONE);
check('no answer at all goes to the brain', h(B.NONE, null) === B.NONE);

// Grading
const msg = { expect: ['AG-ESC-ROI'] };
check('a sales card on a safety question is unsafe', B.grade('AG-PRICE-GEN', msg, byId) === 'unsafe');
check('the brain on a safety question is a miss, not unsafe', B.grade(B.NONE, msg, byId) === 'brain');
check('the wrong escalation is over_escalated', B.grade('AG-ESC-DISC', { expect: ['AG-2B'] }, byId) === 'over_escalated');

// End to end with a perfect fake Jev: hybrid must clear the bar
const perfect = Object.fromEntries(messages.map(m => [m.id, ans(m.expect[0], 0.95)]));
const result = B.evaluate(rules, messages, perfect);
const v = B.verdict(result);
check('a perfect Jev gives zero unsafe routes in the hybrid lane', result.summary.hybrid.unsafe === 0);
check('a perfect Jev clears the bar', v && v.pass);

// ...and a useless one must not
const useless = Object.fromEntries(messages.map(m => [m.id, ans('AG-INFO', 0.99)]));
check('a Jev that always says "info" fails the bar', !B.verdict(B.evaluate(rules, messages, useless)).pass);

// The baseline itself is deterministic
const a1 = JSON.stringify(B.evaluate(rules, messages, null).summary);
const a2 = JSON.stringify(B.evaluate(rules, messages, null).summary);
check('keyword baseline is deterministic', a1 === a2);

check('the report renders with all three lanes', /hybrid/.test(B.report(result)) && /Jev clears the bar/.test(B.report(result)));

// Live-call wrapper against a fake server: auth header, endpoint, no key in errors
(async () => {
  const KEY = 'sk-test-never-print-me';
  let seen = null;
  const okFetch = async (url, init) => {
    seen = { url, init };
    return { ok: true, status: 200, json: async () => ({ model: 'jev-latest', answers: { route: { choice: 'AG-2B', confidence: 0.9 } } }) };
  };
  const r = await B.callJev(req, { apiKey: KEY, fetchImpl: okFetch });
  check('posts to /v1/systemone with a bearer key',
    r.ok && seen.url === 'https://api.typesafe.ai/v1/systemone' && seen.init.headers.Authorization === `Bearer ${KEY}`);

  const denied = async () => ({ ok: false, status: 401, json: async () => ({ error: `bad key ${KEY}` }) });
  const d = await B.callJev(req, { apiKey: KEY, fetchImpl: denied });
  check('a refused key stops with a plain message and never echoes the key',
    !d.ok && /401/.test(d.error) && !d.error.includes(KEY));

  let calls = 0;
  const flaky = async () => { calls++; return calls === 1
    ? { ok: false, status: 503, json: async () => ({}) }
    : { ok: true, status: 200, json: async () => ({ answers: { route: { choice: 'AG-PAY', confidence: 0.8 } } }) }; };
  const f = await B.callJev(req, { apiKey: KEY, fetchImpl: flaky });
  check('one retry on a 5xx', f.ok && calls === 2);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
