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
function pipeline(body) {
  const norm  = run('Normalise', { ok: true, body });
  const lane  = run('Keyword fast lane', norm);
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
    run: () => {
      const r = pipeline(comment('C_100', 'How much?? 🙏'));
      return r.norm.channel === 'instagram_comment' &&
             r.lane.rule_id === 'SP-PRICE-GEN' &&
             r.gate.send === true &&
             /185,000,000/.test(r.gate.reply) &&
             r.gate.public_comment_reply === 'Just sent you a DM' &&
             !/\d/.test(r.gate.public_comment_reply);
    } },

  { name: 'IGE-02 ★ one private reply per comment — the redelivery is refused',
    run: () => {
      const first  = pipeline(comment('C_200', 'price please'));
      const second = pipeline(comment('C_200', 'price please'));
      return first.gate.send === true &&
             second.gate.send === false &&
             second.gate.reason === 'private_reply_already_used_for_this_comment';
    } },

  { name: 'IGE-03 ★ a returns question never reaches the price card',
    run: () => {
      const r = pipeline(comment('C_300', 'what rental yield can I expect on the 4 bedroom'));
      return r.lane.rule_id === 'SP-ESC-ROI' && r.gate.escalate === true &&
             !/185/.test(r.gate.reply) && r.gate.send === true;
    } },

  { name: 'IGE-04 ★ a sheet edit that smuggles in a banned claim is caught at runtime',
    run: () => {
      // Simulate a well-meaning edit adding an ROI promise to a live rule.
      const tampered = run('Guardrails', { text: JSON.stringify({
        reply: 'The 4-bedroom gives a rental yield of about 9% a year.',
        escalate: false, escalation_reason: '', unit_interest: '', grounded_in: ['units[0].price_ngn'] }) });
      return tampered.guard_triggered === 'investment projection' &&
             tampered.escalate === true && !/9%/.test(tampered.reply);
    } },

  { name: 'IGE-05 a DM routes to the DM sender, not the comment endpoint',
    run: () => {
      const r = pipeline(dm('MID_1', 'where is the estate located'));
      return r.norm.channel === 'instagram_dm' && r.gate.comment_id === '' &&
             r.gate.contact_id === 'IGSID_BUYER_7' && /Abijo/.test(r.gate.reply);
    } },

  { name: 'IGE-06 an unmatched question is handed to the brain, not answered',
    run: () => {
      const r = pipeline(dm('MID_2', 'is there a mosque or church inside the estate'));
      return r.lane.lane === 'brain' && r.skipped === 'would call Concierge CORE';
    } },

  { name: 'IGE-07 the business replying to itself is never answered',
    run: () => {
      const body = { entry: [{ id: 'IG_BUSINESS_1', changes: [{ field: 'comments', value: {
        id: 'C_400', text: 'price', from: { id: 'IG_BUSINESS_1', username: 'shalompark' } } }] }] };
      return run('Normalise', { ok: true, body }).is_actionable === false;
    } },

  { name: 'IGE-08 a bad signature is dropped before any reply logic runs',
    run: () => run('Normalise', { ok: false, body: comment('C_500', 'price') }).skip_reason === 'bad_signature' },

  { name: 'IGE-09 ★ the hourly cap holds the overflow for a human instead of dropping it',
    run: () => {
      const store = staticData;
      store.hourly = { windowStart: Date.now(), count: 180 };
      const r = pipeline(dm('MID_3', 'price'));
      const held = r.gate.send === false && r.gate.reason === 'hourly_cap_reached' && r.gate.escalate === true;
      store.hourly = { windowStart: 0, count: 0 };
      return held;
    } },

  { name: 'IGE-11 ★ the human is alerted BEFORE the ledger is written',
    run: () => {
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
    run: () => {
      const led = JSON.parse(fs.readFileSync(path.join(__dirname, '../ops/concierge/workflows/06-ledger-and-escalation.json'), 'utf8'));
      return led.nodes.filter(n => /postgres|emailSend/.test(n.type))
                      .every(n => n.onError !== 'continueRegularOutput');
    } },

  { name: 'IGE-13 ★ a redelivered DM is stopped at the front door — no second price card',
    run: () => {
      // The keyword lane never reaches the CORE, so the CORE's dedup cannot
      // protect it. A redelivered "price" DM used to fire the card twice.
      const env = run('Normalise', { ok: true, body: dm('MID_DUP_1', 'price') });
      const first  = runRaw('Seen this message?', env);
      const second = runRaw('Seen this message?', env);
      return first.length === 1 && second.length === 0;
    } },

  { name: 'IGE-14 a message with no id is let through — never drop a buyer to be tidy',
    run: () => {
      const env = { ...run('Normalise', { ok: true, body: dm('MID_X', 'price') }), provider_message_id: '' };
      return runRaw('Seen this message?', env).length === 1 && runRaw('Seen this message?', env).length === 1;
    } },

  { name: 'IGE-15 the front-door dedup sits before BOTH lanes',
    run: () => {
      const c = wf.connections;
      return c['Worth answering?'].main[0][0].node === 'Seen this message?' &&
             c['Seen this message?'].main[0][0].node === 'Keyword fast lane';
    } },

  { name: 'IGE-10 the ledger row carries the keyword that produced the lead',
    run: () => {
      const r = pipeline(comment('C_600', '4 bedroom price'));
      return r.gate.ledger.keyword_rule === 'SP-4B' &&
             r.gate.ledger.link_code === 'SP-4B' &&
             r.gate.ledger.contact_hash.length === 64;
    } }
];

let pass = 0, fail = 0;
for (const c of cases) {
  let ok = false, err = '';
  try { ok = c.run() === true; } catch (e) { err = ' — ' + e.message; }
  if (ok) { pass++; console.log('  ✓ ' + c.name); }
  else    { fail++; console.log('  ✗ ' + c.name + err); }
}
console.log(`\n${pass}/${cases.length} Instagram workflow tests passed`);
process.exit(fail ? 1 : 0);
