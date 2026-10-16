#!/usr/bin/env node
/**
 * End-to-end test of the SHIPPED Instagram workflow.
 *
 * Runs the actual code nodes out of 05-channel-instagram.json against real
 * Meta webhook payload shapes, with n8n's globals shimmed. This tests the
 * file that gets pasted into n8n — not a reimplementation of it.
 */
const fs = require('fs');
const path = require('path');

const wf = JSON.parse(fs.readFileSync(path.join(__dirname, '../ops/concierge/workflows/05-channel-instagram.json'), 'utf8'));
const nodeSrc = name => {
  const n = wf.nodes.find(x => x.name === name);
  if (!n || !n.parameters.jsCode) throw new Error('no code node named ' + name);
  return n.parameters.jsCode;
};

const staticData = {};
const results = {};

function run(name, input) {
  const $input = { first: () => ({ json: input }), all: () => [{ json: input }] };
  const $env = { META_VERIFY_TOKEN_SHALOM_PARK: 'test-token', SHALOM_PARK_APP_SECRET: 'test-secret' };
  const $getWorkflowStaticData = () => staticData;
  const $ = n => ({ first: () => ({ json: results[n] }) });
  const out = new Function('$input', '$env', '$getWorkflowStaticData', '$', 'require', nodeSrc(name))
    ($input, $env, $getWorkflowStaticData, $, require);
  results[name] = out[0].json;
  return out[0].json;
}

/** Run a node and return its raw item array -- [] means the branch stopped. */
function runRaw(name, input) {
  const $input = { first: () => ({ json: input }), all: () => [{ json: input }] };
  const $env = {}; const $ = n => ({ first: () => ({ json: results[n] }) });
  return new Function('$input', '$env', '$getWorkflowStaticData', '$', 'require', nodeSrc(name))
    ($input, $env, () => staticData, $, require);
}

/** One pass of the live pipeline, from a signed Meta payload to a send decision. */
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let jevEnv = {};                    // per-test: { TYPESAFE_API_KEY } turns Jev on
let jevHttp = async () => { throw new Error('no Jev call expected'); };
const jevCalls = [];

/** The Jev node is async (it awaits TypeSafe), exactly as n8n runs it. */
async function runJev(input) {
  const $input = { first: () => ({ json: input }) };
  const $ = n => ({ first: () => ({ json: results[n] }) });
  const ctx = { helpers: { httpRequest: async opts => { jevCalls.push(opts); return jevHttp(opts); } } };
  const out = await new AsyncFunction('$input', '$env', '$getWorkflowStaticData', '$', 'require', nodeSrc('Jev second opinion'))
    .call(ctx, $input, jevEnv, () => staticData, $, require);
  results['Jev second opinion'] = out[0].json;
  return out[0].json;
}

async function pipeline(body) {
  const norm  = run('Normalise', { ok: true, body });
  results['Seen this message?'] = norm;
  run('Keyword fast lane', norm);
  const lane  = await runJev(results['Keyword fast lane']);
  const inner = lane.lane === 'keyword' ? run('Guardrails', lane) : null;
  if (!inner) return { norm, lane, skipped: 'would call Concierge CORE' };
  const prep  = run('Prepare send', inner);
  const gate  = run('Send gate (Meta limits)', prep);
  return { norm, lane, inner, prep, gate };
}

const comment = (id, text) => ({
  entry: [{ id: 'IG_BUSINESS_1', changes: [{ field: 'comments', value: {
    id, text, from: { id: 'IGSID_BUYER_9', username: 'tunde_abj' } } }] }]
});
const dm = (mid, text) => ({
  entry: [{ messaging: [{ sender: { id: 'IGSID_BUYER_7' }, timestamp: 1789000000000,
    message: { mid, text } }] }]
});

const cases = [

  { name: 'IGE-01 a "price" comment produces a private reply and a fact-free public reply',
    run: async () => {
      const r = await pipeline(comment('C_100', 'How much?? 🙏'));
      return r.norm.channel === 'instagram_comment' &&
             r.lane.rule_id === 'SP-PRICE-GEN' &&
             r.gate.send === true &&
             /185,000,000/.test(r.gate.reply) &&
             r.gate.public_comment_reply === 'Just sent you a DM' &&
             !/\d/.test(r.gate.public_comment_reply);
    } },

  { name: 'IGE-02 ★ one private reply per comment — the redelivery is refused',
    run: async () => {
      const first  = await pipeline(comment('C_200', 'price please'));
      const second = await pipeline(comment('C_200', 'price please'));
      return first.gate.send === true &&
             second.gate.send === false &&
             second.gate.reason === 'private_reply_already_used_for_this_comment';
    } },

  { name: 'IGE-03 ★ a returns question never reaches the price card',
    run: async () => {
      const r = await pipeline(comment('C_300', 'what rental yield can I expect on the 4 bedroom'));
      return r.lane.rule_id === 'SP-ESC-ROI' && r.gate.escalate === true &&
             !/185/.test(r.gate.reply) && r.gate.send === true;
    } },

  { name: 'IGE-04 ★ a sheet edit that smuggles in a banned claim is caught at runtime',
    run: async () => {
      // Simulate a well-meaning edit adding an ROI promise to a live rule.
      const tampered = run('Guardrails', { text: JSON.stringify({
        reply: 'The 4-bedroom gives a rental yield of about 9% a year.',
        escalate: false, escalation_reason: '', unit_interest: '', grounded_in: ['units[0].price_ngn'] }) });
      return tampered.guard_triggered === 'investment projection' &&
             tampered.escalate === true && !/9%/.test(tampered.reply);
    } },

  { name: 'IGE-05 a DM routes to the DM sender, not the comment endpoint',
    run: async () => {
      const r = await pipeline(dm('MID_1', 'where is the estate located'));
      return r.norm.channel === 'instagram_dm' && r.gate.comment_id === '' &&
             r.gate.contact_id === 'IGSID_BUYER_7' && /Abijo/.test(r.gate.reply);
    } },

  { name: 'IGE-06 an unmatched question is handed to the brain, not answered',
    run: async () => {
      const r = await pipeline(dm('MID_2', 'is there a mosque or church inside the estate'));
      return r.lane.lane === 'brain' && r.skipped === 'would call Concierge CORE';
    } },

  { name: 'IGE-07 the business replying to itself is never answered',
    run: async () => {
      const body = { entry: [{ id: 'IG_BUSINESS_1', changes: [{ field: 'comments', value: {
        id: 'C_400', text: 'price', from: { id: 'IG_BUSINESS_1', username: 'shalompark' } } }] }] };
      return run('Normalise', { ok: true, body }).is_actionable === false;
    } },

  { name: 'IGE-08 a bad signature is dropped before any reply logic runs',
    run: async () => run('Normalise', { ok: false, body: comment('C_500', 'price') }).skip_reason === 'bad_signature' },

  { name: 'IGE-09 ★ the hourly cap holds the overflow for a human instead of dropping it',
    run: async () => {
      const store = staticData;
      store.hourly = { windowStart: Date.now(), count: 180 };
      const r = await pipeline(dm('MID_3', 'price'));
      const held = r.gate.send === false && r.gate.reason === 'hourly_cap_reached' && r.gate.escalate === true;
      store.hourly = { windowStart: 0, count: 0 };
      return held;
    } },

  { name: 'IGE-11 ★ the human is alerted BEFORE the ledger is written',
    run: async () => {
      // Deliberate ordering. The alert is time-critical; the ledger is
      // durable. If Postgres is down, the buyer has still been picked up and
      // the red execution tells us to replay the write.
      const led = JSON.parse(fs.readFileSync(path.join(__dirname, '../ops/concierge/workflows/06-ledger-and-escalation.json'), 'utf8'));
      const c = led.connections;
      const after = n => (c[n]?.main || []).flat().map(x => x.node);
      return after('Resolve on-duty + compose').includes('Tell a human?') &&
             after('Alert the sales team').includes('Record the lead') &&
             after('No human needed').includes('Record the lead') &&
             after('Record the lead').includes('Append the event');
    } },

  { name: 'IGE-12 ★ no node on the evidence path swallows its own errors',
    run: async () => {
      const led = JSON.parse(fs.readFileSync(path.join(__dirname, '../ops/concierge/workflows/06-ledger-and-escalation.json'), 'utf8'));
      return led.nodes.filter(n => /postgres|emailSend/.test(n.type))
                      .every(n => n.onError !== 'continueRegularOutput');
    } },

  { name: 'IGE-13 ★ a redelivered DM is stopped at the front door — no second price card',
    run: async () => {
      // The keyword lane never reaches the CORE, so the CORE's dedup cannot
      // protect it. A redelivered "price" DM used to fire the card twice.
      const env = run('Normalise', { ok: true, body: dm('MID_DUP_1', 'price') });
      const first  = runRaw('Seen this message?', env);
      const second = runRaw('Seen this message?', env);
      return first.length === 1 && second.length === 0;
    } },

  { name: 'IGE-14 a message with no id is let through — never drop a buyer to be tidy',
    run: async () => {
      const env = { ...run('Normalise', { ok: true, body: dm('MID_X', 'price') }), provider_message_id: '' };
      return runRaw('Seen this message?', env).length === 1 && runRaw('Seen this message?', env).length === 1;
    } },

  { name: 'IGE-15 the front-door dedup sits before BOTH lanes',
    run: async () => {
      const c = wf.connections;
      return c['Worth answering?'].main[0][0].node === 'Seen this message?' &&
             c['Seen this message?'].main[0][0].node === 'Keyword fast lane';
    } },

  { name: 'IGE-10 the ledger row carries the keyword that produced the lead',
    run: async () => {
      const r = await pipeline(comment('C_600', '4 bedroom price'));
      return r.gate.ledger.keyword_rule === 'SP-4B' &&
             r.gate.ledger.link_code === 'SP-4B' &&
             r.gate.ledger.contact_hash.length === 64;
    } },

  // ---- Jev second opinion (IFT approved TypeSafe 2026-10-16) ----
  { name: 'IGJ-01 no key on the server: Jev is skipped and the keyword lane stands',
    run: async () => {
      const r = await pipeline(dm('M_J1', 'How much??'));
      return r.lane.jev_used === false && r.lane.jev_skip === 'no_key' && r.lane.rule_id === 'SP-PRICE-GEN' && jevCalls.length === 0;
    } },

  { name: 'IGJ-02 ★ a keyword miss Jev is sure about gets the approved card, not the brain',
    run: async () => {
      jevEnv = { TYPESAFE_API_KEY: 'k' };
      jevHttp = async () => ({ answers: { route: { type: 'choice', choice: 'SP-AVAIL', confidence: 0.91 } } });
      const r = await pipeline(dm('M_J2', 'Has everything been bought already?'));
      return r.lane.lane === 'keyword' && r.lane.rule_id === 'SP-AVAIL' && r.lane.jev_source === 'jev'
          && r.gate && r.gate.send === true && r.gate.rule_id === 'SP-AVAIL';
    } },

  { name: 'IGJ-03 ★ only the buyer\'s words go to TypeSafe: no IGSID, handle or name',
    run: async () => {
      jevEnv = { TYPESAFE_API_KEY: 'k' };
      jevHttp = async () => ({ answers: { route: { choice: 'NONE', confidence: 0.9 } } });
      await pipeline(comment('C_J3', 'When do I get my keys?'));
      const sent = JSON.stringify(jevCalls[0].body);
      return jevCalls.length === 1 && jevCalls[0].body.state.instagram_message === 'When do I get my keys?'
          && !/IGSID|tunde_abj|IG_BUSINESS/.test(sent) && jevCalls[0].url === 'https://api.typesafe.ai/v1/systemone';
    } },

  { name: 'IGJ-04 ★ a keyword escalation never even asks Jev',
    run: async () => {
      jevEnv = { TYPESAFE_API_KEY: 'k' };
      const r = await pipeline(dm('M_J4', 'Where do I send the money to?'));
      return r.lane.rule_id === 'SP-ESC-PAYTO' && r.lane.jev_skip === 'keyword_escalation' && jevCalls.length === 0;
    } },

  { name: 'IGJ-05 ★ Jev can upgrade a sales card to a human, never the reverse',
    run: async () => {
      jevEnv = { TYPESAFE_API_KEY: 'k' };
      jevHttp = async () => ({ answers: { route: { choice: 'SP-ESC-DISC', confidence: 0.6 } } });
      const r = await pipeline(dm('M_J5', 'The condo, the price we discussed on the phone, can you hold it for me'));
      return r.lane.rule_id === 'SP-ESC-DISC' && r.gate.escalate === true;
    } },

  { name: 'IGJ-06 ★ TypeSafe down or slow: the keyword answer still goes out',
    run: async () => {
      jevEnv = { TYPESAFE_API_KEY: 'k' };
      jevHttp = async () => { throw new Error('timeout of 2500ms exceeded'); };
      const r = await pipeline(dm('M_J6', 'How much??'));
      return r.lane.rule_id === 'SP-PRICE-GEN' && r.lane.jev_error.includes('timeout') && r.gate.send === true;
    } },

  { name: 'IGJ-07 an invented label from Jev goes to the brain, never to a made-up card',
    run: async () => {
      jevEnv = { TYPESAFE_API_KEY: 'k' };
      jevHttp = async () => ({ answers: { route: { choice: 'SP-FREE-PLOT', confidence: 0.99 } } });
      const r = await pipeline(dm('M_J7', 'Has everything been bought already?'));
      return r.lane.lane === 'brain' && r.skipped === 'would call Concierge CORE';
    } },

  { name: 'IGJ-08 the Jev-chosen card still passes through the guardrail node',
    run: async () => {
      const c = JSON.parse(fs.readFileSync(path.join(__dirname, '../ops/concierge/workflows/05-channel-instagram.json'), 'utf8')).connections;
      return c['Keyword fast lane'].main[0][0].node === 'Jev second opinion'
          && c['Jev second opinion'].main[0][0].node === 'Keyword matched?'
          && c['Keyword matched?'].main[0][0].node === 'Guardrails';
    } },

];

let pass = 0, fail = 0;
(async () => {
for (const c of cases) {
  let ok = false, err = '';
  try { jevEnv = {}; jevCalls.length = 0; ok = (await c.run()) === true; } catch (e) { err = ' — ' + e.message; }
  if (ok) { pass++; console.log('  ✓ ' + c.name); }
  else    { fail++; console.log('  ✗ ' + c.name + err); }
}
console.log(`\n${pass}/${cases.length} Instagram workflow tests passed`);
process.exit(fail ? 1 : 0);
})();
