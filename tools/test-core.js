#!/usr/bin/env node
/**
 * Core sub-workflow logic tests.
 * Runs the real node code out of 03-concierge-core.json against simulated
 * inputs, with n8n's helpers shimmed. Catches routing, dedup, registry and
 * envelope bugs without an API key or a running n8n.
 */
const fs = require('fs');
const path = require('path');
const wf = JSON.parse(fs.readFileSync(path.join(__dirname, '../ops/concierge/workflows/03-concierge-core.json'), 'utf8'));
const nodeSrc = n => wf.nodes.find(x => x.name === n).parameters.jsCode;

const staticStore = {};
const outputs = {};   // what each node last produced -- backs $('Node') lookups
function run(nodeName, json) {
  const $input = { first: () => ({ json }) };
  const $getWorkflowStaticData = () => staticStore;
  const $ = n => ({ first: () => ({ json: outputs[n] }) });
  const r = new Function('$input', '$getWorkflowStaticData', '$', nodeSrc(nodeName))($input, $getWorkflowStaticData, $)[0].json;
  outputs[nodeName] = r;
  return r;
}

// The final node receives TWO things in the real graph: the envelope, which it
// reads from 'Build prompt' by name, and the model's answer on $input. Tests
// used to hand it one merged object -- the exact false assumption that hid a
// bug where duplicates and unknown clients were answered.
function finalise(envelope, model) {
  outputs['Build prompt'] = envelope;
  return run('Build response envelope', model || {});
}

// The whole CORE, node by node, honouring the IF exactly as n8n would.
function chain(input, modelReply) {
  let x = run('Load client + KB', input);
  x = run('Dedup gate', x);
  x = run('Build prompt', x);
  const modelCalled = !(x.fatal === true || x.duplicate === true);
  const g = modelCalled ? run('Guardrails', modelReply) : x;
  return { ...finalise(outputs['Build prompt'], g), modelCalled };
}
const answer = t => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(
  { reply: t, escalate: false, escalation_reason: '', unit_interest: '4B', grounded_in: ['units[0].price_ngn'] }) }] } }] });

const base = {
  client_id: 'shalom-park', channel: 'whatsapp', provider_message_id: 'wamid.T1',
  contact_id: '2348012345678', contact_e164: '2348012345678', contact_hash: 'h'.repeat(64),
  display_name: 'Test Buyer', text: 'How much is the 4 bedroom?', thread_ref: '', subject: ''
};

const cases = [
  { n: 'CORE-01 known client resolves config + KB',
    run: () => run('Load client + KB', { ...base }),
    ok: r => !r.fatal && r.client.name === 'Shalom Park Estate' && r.kb._meta.estate === 'Shalom Park Estate' && r.capabilities },

  { n: 'CORE-02 unknown client fails closed (no KB leak)',
    run: () => run('Load client + KB', { ...base, client_id: 'not-a-client' }),
    ok: r => r.fatal === true && /unknown client_id/.test(r.reason) && !r.kb },

  { n: 'CORE-03 second client resolves its own KB (multi-tenant works)',
    run: () => run('Load client + KB', { ...base, client_id: 'propel' }),
    ok: r => !r.fatal && r.kb._meta.name === 'Propel — own Concierge knowledge base' },

  { n: 'CORE-04 first sighting of a message passes the dedup gate',
    run: () => run('Dedup gate', { ...base, provider_message_id: 'wamid.UNIQUE' }),
    ok: r => r.duplicate === false },

  { n: 'CORE-05 redelivery of the same message is suppressed',
    run: () => { run('Dedup gate', { ...base, provider_message_id: 'wamid.DUP' });
                 return run('Dedup gate', { ...base, provider_message_id: 'wamid.DUP' }); },
    ok: r => r.duplicate === true },

  { n: 'CORE-06 fatal context short-circuits the dedup gate',
    run: () => run('Dedup gate', { ...base, fatal: true, reason: 'x' }),
    ok: r => r.fatal === true && r.duplicate === undefined },

  { n: 'CORE-07 prompt carries KB + client name + WhatsApp brevity hint',
    run: () => { const c = run('Load client + KB', { ...base }); return run('Build prompt', { ...c, duplicate: false }); },
    ok: r => r.system.includes('Shalom Park Estate') && r.system.includes('185000000') && /Keep it short/.test(r.system) && r.user_message === base.text },

  { n: 'CORE-08 email gets a different channel hint than WhatsApp',
    run: () => { const c = run('Load client + KB', { ...base, channel: 'email' }); return run('Build prompt', { ...c, duplicate: false }); },
    ok: r => /sign-off/.test(r.system) && !/two or three sentences/.test(r.system) },

  { n: 'CORE-09 instagram comment hint enforces ONE reply',
    run: () => { const c = run('Load client + KB', { ...base, channel: 'instagram_comment' }); return run('Build prompt', { ...c, duplicate: false }); },
    ok: r => /ONE short message/.test(r.system) },

  { n: 'CORE-10 duplicate never reaches the model',
    run: () => run('Build prompt', { ...base, duplicate: true }),
    ok: r => r.system === undefined },

  { n: 'CORE-11 envelope carries reply, ledger row and escalation target',
    run: () => { const c = run('Load client + KB', { ...base });
                 return finalise({ ...c, duplicate: false }, { reply: 'It is ₦185,000,000.', escalate: true, escalation_reason: 'buyer ready to pay', unit_interest: '4-bedroom semi-detached', grounded_in: ['units[0].price_ngn'], guard_triggered: '' }); },
    ok: r => r.send === true && r.escalate === true && r.escalation.to_name === 'Collins' && r.escalation.to_wa === '2348064834680'
          && r.escalation.unclaimed_alert_minutes === 15 && r.ledger.unit_interest === '4-bedroom semi-detached'
          && r.ledger.grounded_in.length === 1 },

  { n: 'CORE-12 duplicate produces send:false, not a silent success',
    run: () => finalise({ ...base, duplicate: true }, {}),
    ok: r => r.send === false && r.reason === 'duplicate_message' },

  { n: 'CORE-13 fatal produces send:false and surfaces the reason',
    run: () => finalise({ ...base, fatal: true, reason: 'unknown client_id: x' }, {}),
    ok: r => r.send === false && r.fatal === true && /unknown client_id/.test(r.reason) },

  { n: 'CORE-14 email reply subject becomes Re: without doubling',
    run: () => { const c = run('Load client + KB', { ...base, channel: 'email', subject: 'Re: Enquiry' });
                 return finalise({ ...c, duplicate: false }, { reply: 'Hello', escalate: false }); },
    ok: r => r.subject === 'Re: Enquiry' },

  { n: 'CORE-15 add-on hooks stay off until enabled in the registry',
    run: () => { const c = run('Load client + KB', { ...base, text: 'can I book an inspection and see the title documents?' });
                 return finalise({ ...c, duplicate: false }, { reply: 'x', escalate: false }); },
    ok: r => r.addons.booking === false && r.addons.doc_vault === false && r.addons.voice_note === false },

  { n: 'CORE-17 empty input (manual run) still yields a usable model_url',
    run: () => { const c = run('Load client + KB', {}); const d = run('Dedup gate', c); return run('Build prompt', d); },
    ok: r => r.fatal === true && typeof r.model_url === 'string' && r.model_url.includes('gemini-3.6-flash') },

  { n: 'CORE-18 duplicate path also carries model_url',
    run: () => run('Build prompt', { ...base, duplicate: true }),
    ok: r => typeof r.model_url === 'string' && r.model_url.length > 0 },

  { n: 'CORE-16 enabling a capability arms its hook on intent',
    run: () => { const c = run('Load client + KB', { ...base, text: 'I want to book an inspection' });
                 c.capabilities = { ...c.capabilities, booking: true };
                 return finalise({ ...c, duplicate: false }, { reply: 'x', escalate: false }); },
    ok: r => r.addons.booking === true && r.addons.doc_vault === false },

  // --- the whole chain, the way n8n actually runs it --------------------
  // Found 2026-09-23 from a screenshot of a manual run: every one of these
  // except CORE-21 used to come back send:true.
  { n: 'CORE-19 ★ a manual run with no input stays silent and never calls the model',
    run: () => chain({}, answer('x')),
    ok: r => r.send === false && r.fatal === true && r.modelCalled === false },

  { n: 'CORE-20 ★ an unknown client fails closed end to end',
    run: () => chain({ ...base, client_id: 'nobody' }, answer('x')),
    ok: r => r.send === false && /unknown client_id: nobody/.test(r.reason) && r.modelCalled === false },

  { n: 'CORE-21 a real first message is answered by the model',
    run: () => chain({ ...base, provider_message_id: 'wamid.CHAIN-1' }, answer('The 4-bedroom is 185,000,000 naira.')),
    ok: r => r.send === true && /185,000,000/.test(r.reply) && r.modelCalled === true && r.client_id === 'shalom-park' },

  { n: 'CORE-22 ★ Meta redelivering the same message gets NO second reply',
    run: () => { chain({ ...base, provider_message_id: 'wamid.CHAIN-2' }, answer('first'));
                 return chain({ ...base, provider_message_id: 'wamid.CHAIN-2' }, answer('second')); },
    ok: r => r.send === false && r.reason === 'duplicate_message' && r.modelCalled === false && !r.reply },

  { n: 'CORE-23 the reply carries the caller\'s client, not a hardcoded one',
    run: () => chain({ ...base, client_id: 'propel', provider_message_id: 'wamid.CHAIN-3' }, answer('hello')),
    ok: r => r.send === true && r.client_id === 'propel' },

  { n: 'CORE-24 the IF sits between Build prompt and the model, keyed on fatal + duplicate',
    run: () => ({ node: wf.nodes.find(n => n.name === 'Worth a model call?'), c: wf.connections }),
    ok: ({ node, c }) => node && /fatal/.test(JSON.stringify(node.parameters)) && /duplicate/.test(JSON.stringify(node.parameters))
                       && c['Build prompt'].main[0][0].node === 'Worth a model call?'
                       && c['Worth a model call?'].main[0][0].node === 'Gemini 3 Flash'
                       && c['Worth a model call?'].main[1][0].node === 'Build response envelope' }
];

let pass=0, fail=0;
for (const t of cases) {
  let ok=false, got=null, err=null;
  try { got = t.run(); ok = !!t.ok(got); } catch(e){ err = e.message; }
  if (ok) { console.log('PASS  '+t.n); pass++; }
  else { console.log('FAIL  '+t.n+(err?' — '+err:'')); if (got) console.log('        got: '+JSON.stringify(got).slice(0,240)); fail++; }
}
console.log(`\n${pass} passed, ${fail} failed — core logic, no API key required.`);
process.exit(fail?1:0);
