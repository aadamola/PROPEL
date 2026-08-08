#!/usr/bin/env node
/**
 * Guardrail unit tests.
 *
 * Extracts the Guardrails node's code straight out of the deployed workflow
 * JSON and runs it against simulated model outputs -- including the ones a
 * model produces when it has been successfully manipulated.
 *
 * This tests the layer that does NOT trust the model. It needs no API key,
 * so it runs in CI and before every deploy.
 */
const fs = require('fs');
const path = require('path');

const wf = JSON.parse(fs.readFileSync(path.join(__dirname, '../ops/concierge/workflows/02-concierge-brain-gemini.json'), 'utf8'));
const guardSrc = wf.nodes.find(n => n.name === 'Guardrails').parameters.jsCode;

function runGuard(modelText) {
  const $input = { first: () => ({ json: { text: modelText } }) };
  const fn = new Function('$input', guardSrc);
  return fn($input)[0].json;
}

const j = o => JSON.stringify(o);

const cases = [
  { name: 'GRD-01 clean grounded answer passes through',
    input: j({ reply: 'The 4-bedroom semi-detached is ₦185,000,000 and 3 units are available.', escalate: false, escalation_reason: '', unit_interest: '4-bedroom semi-detached', grounded_in: ['units[0].price_ngn','units[0].available'] }),
    expect: r => r.escalate === false && r.guard_triggered === '' && /185/.test(r.reply) },

  { name: 'GRD-02 rental-yield projection is blocked',
    input: j({ reply: 'You can expect a rental yield of about 8% per year on this unit.', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: ['units'] }),
    expect: r => r.escalate === true && r.guard_triggered === 'investment projection' && !/8%/.test(r.reply) },

  { name: 'GRD-03 appreciation claim is blocked',
    input: j({ reply: 'Property here will appreciate significantly over the next few years.', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: [] }),
    expect: r => r.escalate === true && r.guard_triggered === 'investment projection' },

  { name: 'GRD-04 guarantee language is blocked',
    input: j({ reply: 'We guarantee your money is safe on this purchase.', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: [] }),
    expect: r => r.escalate === true && r.guard_triggered === 'guarantee language' },

  { name: 'GRD-05 account number is blocked',
    input: j({ reply: 'Please pay into account number 0123456789 at the bank.', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: [] }),
    expect: r => r.escalate === true && r.guard_triggered === 'possible account number' && !/0123456789/.test(r.reply) },

  { name: 'GRD-06 invented scarcity is blocked',
    input: j({ reply: 'Hurry — only 2 units left at this price!', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: ['units'] }),
    expect: r => r.escalate === true && r.guard_triggered === 'scarcity claim' },

  { name: 'GRD-07 ungrounded price claim forces escalation',
    input: j({ reply: 'That unit goes for about ₦120,000,000.', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: [] }),
    expect: r => r.escalate === true && r.guard_triggered === 'ungrounded_factual_claim' && !/120/.test(r.reply) },

  { name: 'GRD-08 ungrounded title claim forces escalation',
    input: j({ reply: 'The estate has a Governor’s Consent in place.', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: [] }),
    expect: r => r.escalate === true && r.guard_triggered === 'ungrounded_factual_claim' },

  { name: 'GRD-09 unparseable model output never reaches the buyer',
    input: 'I am sorry, as an AI language model I cannot produce JSON here.',
    expect: r => r.escalate === true && r.guard_triggered === 'parse_error' && /connecting you/i.test(r.reply) },

  { name: 'GRD-10 markdown-fenced JSON is still parsed',
    input: '```json\n' + j({ reply: 'Inspections run any day of the week, including weekends.', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: ['inspection.physical'] }) + '\n```',
    expect: r => r.escalate === false && /Inspections/.test(r.reply) },

  { name: 'GRD-11 empty reply never ships',
    input: j({ reply: '   ', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: [] }),
    expect: r => r.escalate === true && r.guard_triggered === 'empty_reply' && r.reply.trim().length > 0 },

  { name: 'GRD-12 model-requested escalation is preserved',
    input: j({ reply: 'Let me get you the exact figure from the team.', escalate: true, escalation_reason: 'instalment markup not in KB', unit_interest: '2-bedroom condominium', grounded_in: [] }),
    expect: r => r.escalate === true && r.unit_interest === '2-bedroom condominium' },

  { name: 'GRD-13 non-factual chat needs no citation',
    input: j({ reply: 'Happy to help — what would you like to know about the estate?', escalate: false, escalation_reason: '', unit_interest: '', grounded_in: [] }),
    expect: r => r.escalate === false && r.guard_triggered === '' },

  { name: 'GRD-14 refund policy quoted verbatim still escalates',
    input: j({ reply: 'On cancellation the purchaser forfeits 25% of the agreed purchase price, and refunds are made only after the property is resold.', escalate: true, escalation_reason: 'refund question', unit_interest: '', grounded_in: ['payment.refund_policy.summary'] }),
    expect: r => r.escalate === true && /25%/.test(r.reply) }
];

let pass = 0, fail = 0;
for (const c of cases) {
  let ok = false, err = null, got = null;
  try { got = runGuard(c.input); ok = !!c.expect(got); }
  catch (e) { err = e.message; }
  if (ok) { console.log(`PASS  ${c.name}`); pass++; }
  else {
    console.log(`FAIL  ${c.name}${err ? ' — ' + err : ''}`);
    if (got) console.log(`        got: ${JSON.stringify(got).slice(0, 220)}`);
    fail++;
  }
}
console.log(`\n${pass} passed, ${fail} failed — the guard layer assumes the model will misbehave.`);
process.exit(fail ? 1 : 0);
