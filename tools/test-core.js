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
function run(nodeName, json) {
  const $input = { first: () => ({ json }) };
  const $getWorkflowStaticData = () => staticStore;
  return new Function('$input', '$getWorkflowStaticData', nodeSrc(nodeName))($input, $getWorkflowStaticData)[0].json;
}

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
                 return run('Build response envelope', { ...c, duplicate: false, reply: 'It is ₦185,000,000.', escalate: true, escalation_reason: 'buyer ready to pay', unit_interest: '4-bedroom semi-detached', grounded_in: ['units[0].price_ngn'], guard_triggered: '' }); },
    ok: r => r.send === true && r.escalate === true && r.escalation.to_name === 'Collins' && r.escalation.to_wa === '2348064834680'
          && r.escalation.unclaimed_alert_minutes === 15 && r.ledger.unit_interest === '4-bedroom semi-detached'
          && r.ledger.grounded_in.length === 1 },

  { n: 'CORE-12 duplicate produces send:false, not a silent success',
    run: () => run('Build response envelope', { ...base, duplicate: true }),
    ok: r => r.send === false && r.reason === 'duplicate_message' },

  { n: 'CORE-13 fatal produces send:false and surfaces the reason',
    run: () => run('Build response envelope', { ...base, fatal: true, reason: 'unknown client_id: x' }),
    ok: r => r.send === false && r.fatal === true && /unknown client_id/.test(r.reason) },

  { n: 'CORE-14 email reply subject becomes Re: without doubling',
    run: () => { const c = run('Load client + KB', { ...base, channel: 'email', subject: 'Re: Enquiry' });
                 return run('Build response envelope', { ...c, duplicate: false, reply: 'Hello', escalate: false }); },
    ok: r => r.subject === 'Re: Enquiry' },

  { n: 'CORE-15 add-on hooks stay off until enabled in the registry',
    run: () => { const c = run('Load client + KB', { ...base, text: 'can I book an inspection and see the title documents?' });
                 return run('Build response envelope', { ...c, duplicate: false, reply: 'x', escalate: false }); },
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
                 return run('Build response envelope', { ...c, duplicate: false, reply: 'x', escalate: false }); },
    ok: r => r.addons.booking === true && r.addons.doc_vault === false }
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
