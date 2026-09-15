#!/usr/bin/env node
/**
 * Keyword fast-lane tests.
 *
 * The expensive failures in a keyword automation are not crashes. They are:
 *   - a substring match ("land" inside "Ireland") answering the wrong person
 *   - a commercial card firing on a question that needed a human
 *   - a withheld price reappearing after a well-meaning sheet edit
 *   - a link that resolves to nothing
 * Every one of those has a test below.
 */
const fs = require('fs');
const path = require('path');
const K = require('../ops/concierge/lib/keywords.js');

const ROOT = path.join(__dirname, '..');
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'clients/shalom-park/keywords.json'), 'utf8'));
const RULES = K.compile(table.rules);

const CFG_NO_LINK = {
  assistant_signature: '— Shalom Park Estate assistant · a human is one message away',
  links: { mode: 'none', wa_e164: null, website: 'https://shalomparknigeria.com',
           whatsapp_template: 'https://wa.me/{{WA_E164}}?text=Ref%3A%20{{CODE}}' }
};
const CFG_LIVE = {
  assistant_signature: '— Shalom Park Estate assistant · a human is one message away',
  links: { mode: 'concierge', wa_e164: '2349112714482', website: 'https://shalomparknigeria.com',
           whatsapp_template: 'https://wa.me/{{WA_E164}}?text=Ref%3A%20{{CODE}}' }
};

const m = (text, cfg) => K.match(RULES, text, cfg || CFG_NO_LINK);

// guardrail, straight out of the deployed workflow
const wf = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops/concierge/workflows/02-concierge-brain-gemini.json'), 'utf8'));
const guardSrc = wf.nodes.find(n => n.name === 'Guardrails').parameters.jsCode;
const runGuard = p => new Function('$input', guardSrc)({ first: () => ({ json: { text: JSON.stringify(p) } }) })[0].json;

const cases = [

  // --- routing ---------------------------------------------------------
  { name: 'KW-01 bare "price" hits the general price card',
    run: () => m('price').rule_id === 'SP-PRICE-GEN' },

  { name: 'KW-02 a unit-specific ask beats the generic price card',
    run: () => m('How much for the 4 bedroom?').rule_id === 'SP-4B' },

  { name: 'KW-03 ★ a returns question outranks the unit card it also matches',
    run: () => {
      const r = m('What is the ROI on the 4 bedroom?');
      return r.rule_id === 'SP-ESC-ROI' && r.escalate === true && !/185/.test(r.reply);
    } },

  { name: 'KW-04 ★ "Ireland" and "landscape" never fire the land card',
    run: () => !m('My brother in Ireland asked about this').matched &&
               !m('the landscape looks lovely').matched },

  { name: 'KW-05 emoji and punctuation do not break matching',
    run: () => m('PRICE?? 🙏🏾🏠✨').rule_id === 'SP-PRICE-GEN' },

  { name: 'KW-06 pidgin and SMS shorthand route correctly',
    run: () => m('abeg how much be this one').rule_id === 'SP-PRICE-GEN' &&
               m('hw much').rule_id === 'SP-PRICE-GEN' },

  { name: 'KW-07 "2bed" and "2-bedroom" normalise to the same rule',
    run: () => m('2bed').rule_id === 'SP-2B' && m('2-bedroom please').rule_id === 'SP-2B' },

  { name: 'KW-08 spelled numbers map to digits',
    run: () => m('four bedroom').rule_id === 'SP-4B' && m('five bedroom').rule_id === 'SP-5B' },

  { name: 'KW-09 case is irrelevant',
    run: () => m('LOCATION').rule_id === m('location').rule_id &&
               m('LoCaTiOn').rule_id === 'SP-LOC' },

  { name: 'KW-10 the catch-all only wins when nothing better matches',
    run: () => m('hello').rule_id === 'SP-INFO' && m('hello how much').rule_id === 'SP-PRICE-GEN' },

  { name: 'KW-11 unrecognised questions fall through to the brain',
    run: () => {
      const r = m('Do you allow pets and what is the wifi situation');
      return r.matched === false && r.reason === 'no_rule_matched';
    } },

  { name: 'KW-12 empty and whitespace-only input is never answered',
    run: () => m('').matched === false && m('   \n  ').matched === false },

  // --- safety class ----------------------------------------------------
  { name: 'KW-13 discount ask escalates and never invents an offer',
    run: () => { const r = m('bros give me discount on the 5 bedroom');
                 return r.rule_id === 'SP-ESC-DISC' && r.escalate === true && !/200/.test(r.reply); } },

  { name: 'KW-14 payment-details ask returns no digits at all',
    run: () => { const r = m('I want to pay, send me the account number');
                 return r.rule_id === 'SP-ESC-PAYTO' && !/\d/.test(r.reply) && /IFT Realty/.test(r.reply); } },

  { name: 'KW-15 ★ the refund policy is quoted in full, never softened',
    run: () => { const r = m('what if I want to cancel');
                 return r.rule_id === 'SP-ESC-REFUND' && /25%/.test(r.reply) &&
                        /180 days/.test(r.reply) && /resold to a third party/.test(r.reply) && r.escalate; } },

  { name: 'KW-16 "is this a scam" gets the warranted fact plus a human',
    run: () => { const r = m('is this a scam');
                 return r.rule_id === 'SP-ESC-LEGAL' && r.escalate === true; } },

  { name: 'KW-17 completion date escalates — the KB has no date',
    run: () => m('when will it be completed').rule_id === 'SP-ESC-COMPLETE' },

  { name: 'KW-18 mortgage and financing never get an improvised answer',
    run: () => { const r = m('can I get a mortgage for this');
                 return r.rule_id === 'SP-ESC-MORTGAGE' && r.escalate === true; } },

  { name: 'KW-19 every escalate_only rule actually escalates',
    run: () => table.rules.filter(r => r.class === 'escalate_only')
                          .every(r => r.escalate === true && r.link_kind === 'none') },

  // --- withheld facts --------------------------------------------------
  { name: 'KW-20 ★ the unconfirmed ₦95m condo price appears nowhere',
    run: () => {
      const leaked = table.rules.some(r => /95[,.]?000[,.]?000|\b95m\b|\bN95\b/i.test(r.dm_response));
      const r = m('2 bedroom condo price');
      return !leaked && r.rule_id === 'SP-2B' && r.escalate === true && !/95/.test(r.reply);
    } },

  { name: 'KW-21 ★ no public comment reply publishes a figure or a title claim',
    run: () => table.rules.every(r => !/\d/.test(r.public_comment_reply) &&
                                      !/₦|naira|price|consent|title|sqm/i.test(r.public_comment_reply)) },

  { name: 'KW-22 the title card states the type in DM but not in public',
    run: () => { const r = m('what title does it have');
                 return r.rule_id === 'SP-DOCS' && /Governors Consent/.test(r.reply) &&
                        !/consent/i.test(r.public_comment_reply); } },

  // --- links -----------------------------------------------------------
  { name: 'KW-23 ★ with no number configured, no broken link ships',
    run: () => { const r = m('4 bedroom', CFG_NO_LINK);
                 return r.link === '' && !/wa\.me|http/.test(r.reply) && /Reply here/.test(r.reply); } },

  { name: 'KW-24 with a number configured, the link carries the ref code',
    run: () => { const r = m('4 bedroom', CFG_LIVE);
                 return r.link === 'https://wa.me/2349112714482?text=Ref%3A%20SP-4B' && r.reply.includes(r.link); } },

  { name: 'KW-25 escalate_only rules stay link-free even when links are live',
    run: () => m('what is the rental yield', CFG_LIVE).link === '' },

  { name: 'KW-26 the assistant signature is appended once',
    run: () => { const r = m('location', CFG_LIVE);
                 return (r.reply.match(/a human is one message away/g) || []).length === 1; } },

  // --- integrity -------------------------------------------------------
  { name: 'KW-27 ★ every live canned response survives the live guardrail',
    run: () => table.rules.filter(r => r.status === 'live').every(r =>
      runGuard({ reply: r.dm_response, escalate: r.escalate, escalation_reason: '',
                 unit_interest: '', grounded_in: r.grounded_in }).guard_triggered === '') },

  { name: 'KW-28 every rule stating a fact cites the knowledge base',
    run: () => table.rules.every(r =>
      !/₦|\bnaira\b|\bbedroom\b|\bsqm\b|governors? consent/i.test(r.dm_response) || r.grounded_in.length > 0) },

  { name: 'KW-29 matching is deterministic across repeated calls',
    run: () => { const q = 'how much is the 2 bedroom condo and where is it located';
                 const a = m(q).rule_id, b = m(q).rule_id, c = m(q).rule_id;
                 return a === b && b === c; } },

  // --- campaign keywords (ADEDAMOLA's 7 comment-to-DM campaigns) --------
  { name: 'KW-31 the seven campaign keywords each resolve to exactly one rule',
    run: () => {
      const want = { condo: 'SP-2B', land: 'SP-LAND', summer: 'SP-ESC-PROMO',
                     chairman: 'SP-5B', duplex: 'SP-4B', investment: 'SP-ESC-ROI',
                     developer: 'SP-DEVPLOT' };
      return Object.entries(want).every(([word, id]) => m(word).rule_id === id);
    } },

  { name: 'KW-32 ★ SUMMER neither confirms nor denies a promotion',
    run: () => { const r = m('summer flash sales');
                 return r.rule_id === 'SP-ESC-PROMO' && r.escalate === true &&
                        !/discount|not negotiable|% off/i.test(r.reply); } },

  { name: 'KW-33 ★ INVESTMENT never emphasises capital growth — it escalates',
    run: () => { const r = m('is this a good investment');
                 return r.rule_id === 'SP-ESC-ROI' && r.escalate === true &&
                        !/capital growth|appreciat/i.test(r.reply); } },

  { name: 'KW-34 "5 bedroom duplex" beats the bare DUPLEX campaign word',
    run: () => m('5 bedroom duplex').rule_id === 'SP-5B' && m('duplex').rule_id === 'SP-4B' },

  { name: 'KW-35 ★ no unwarranted figure from the campaign briefs reached the table',
    run: () => {
      // 70% deposit, ₦5m deposit, 648 SQM, 6,738.38 SQM — none are in the
      // signed facts sheet, so none may appear in a response.
      // Anchored: 185,000,000 legitimately contains "5,000,000".
      const banned = /\b70\s?%|(?<![\d,])5,000,000\b|(?<![\d,])648\b|6,?738/;
      return table.rules.every(r => !banned.test(r.dm_response));
    } },

  { name: 'KW-36 the DEVELOPER campaign names the developer but quotes no parcel',
    run: () => { const r = m('developer');
                 return /IFT Realty Ltd/.test(r.reply) && !/sqm|SQM|\d{3}/.test(r.reply) && r.escalate === true; } },

  { name: 'KW-30 no trigger phrase is claimed by two rules',
    run: () => {
      const seen = new Map();
      for (const r of table.rules) for (const p of r.trigger_phrases) {
        if (seen.has(p.toLowerCase())) return false;
        seen.set(p.toLowerCase(), r.rule_id);
      }
      return true;
    } }
];

let pass = 0, fail = 0;
for (const c of cases) {
  let ok = false, err = '';
  try { ok = c.run() === true; } catch (e) { err = ' — ' + e.message; }
  if (ok) { pass++; console.log('  ✓ ' + c.name); }
  else    { fail++; console.log('  ✗ ' + c.name + err); }
}
console.log(`\n${pass}/${cases.length} keyword tests passed`);
process.exit(fail ? 1 : 0);
