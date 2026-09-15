#!/usr/bin/env node
/**
 * Keyword compiler + linter.
 *
 * CSV (the surface ADEDAMOLA and the client edit, mirrored to Google Sheets)
 *   -> JSON (what the workflow embeds).
 *
 * The lint pass is the point. The CSV is human-editable, which means a
 * well-meaning edit can publish a wrong price to every commenter on a post
 * before anyone notices. These checks are what stands between that edit and
 * a buyer:
 *
 *   - public comment replies may carry NO numbers and NO title claims
 *     (a public reply is publication; DMs are conversation)
 *   - escalate_only rules may never carry an outbound link
 *   - every trigger phrase is unique across the whole table
 *   - every response survives the live guardrail node
 *
 * Usage: node tools/build-keywords.js [--check]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'clients/shalom-park/keywords.csv');
const OUT = path.join(ROOT, 'clients/shalom-park/keywords.json');
const CHECK_ONLY = process.argv.includes('--check');

/** RFC4180 parser — quoted fields carry commas and real newlines. */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const s = text.replace(/\r\n/g, '\n');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r[0] || '').trim() !== '');
}

const rows = parseCSV(fs.readFileSync(SRC, 'utf8'));
const header = rows.shift().map(h => h.trim());

const REQUIRED = ['rule_id','priority','class','intent','trigger_phrases','dm_response',
                  'public_comment_reply','link_code','link_kind','escalate','grounded_in','status','notes',
                  'promo_from','promo_until','promo_review_by','promo_response'];
const errors = [];
for (const col of REQUIRED) if (!header.includes(col)) errors.push(`missing column: ${col}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

const rules = rows.map((r, i) => {
  const o = {};
  header.forEach((h, k) => { o[h] = (r[k] == null ? '' : r[k]).trim(); });
  return {
    _line: i + 2,
    rule_id: o.rule_id,
    priority: Number(o.priority),
    class: o.class,
    intent: o.intent,
    trigger_phrases: o.trigger_phrases.split('|').map(s => s.trim()).filter(Boolean),
    dm_response: o.dm_response,
    public_comment_reply: o.public_comment_reply,
    link_code: o.link_code,
    link_kind: o.link_kind,
    escalate: o.escalate.toUpperCase() === 'TRUE',
    grounded_in: o.grounded_in.split('|').map(s => s.trim()).filter(Boolean),
    status: o.status,
    notes: o.notes,
    promo_from: o.promo_from,
    promo_until: o.promo_until,
    promo_review_by: o.promo_review_by,
    promo_response: o.promo_response
  };
});

// --- lint ---------------------------------------------------------------
const seenIds = new Set();
const seenPhrases = new Map();
const CLASSES = new Set(['fast_lane', 'escalate_only']);
const STATUSES = new Set(['live', 'paused']);
const LINK_KINDS = new Set(['none', 'whatsapp', 'website']);

for (const r of rules) {
  const at = `${r.rule_id || '(no id)'} (line ${r._line})`;
  if (!r.rule_id) errors.push(`${at}: blank rule_id`);
  if (seenIds.has(r.rule_id)) errors.push(`${at}: duplicate rule_id`);
  seenIds.add(r.rule_id);

  if (!CLASSES.has(r.class))      errors.push(`${at}: class must be fast_lane or escalate_only, got "${r.class}"`);
  if (!STATUSES.has(r.status))    errors.push(`${at}: status must be live or paused, got "${r.status}"`);
  if (!LINK_KINDS.has(r.link_kind)) errors.push(`${at}: link_kind must be none|whatsapp|website, got "${r.link_kind}"`);
  if (!Number.isFinite(r.priority)) errors.push(`${at}: priority must be a number`);
  if (!r.trigger_phrases.length)  errors.push(`${at}: no trigger phrases`);
  if (!r.dm_response.trim())      errors.push(`${at}: empty dm_response`);

  // An escalate_only rule exists to hand a person to a person. Attaching a
  // link to it sends a buyer down a self-serve path we just decided was
  // unsafe for that question.
  if (r.class === 'escalate_only') {
    if (r.link_kind !== 'none') errors.push(`${at}: escalate_only rules must have link_kind=none`);
    if (!r.escalate)            errors.push(`${at}: escalate_only rules must have escalate=TRUE`);
  }

  // A public comment reply is PUBLICATION. Prices move, titles are not yet
  // sighted (Gate 2), and a public comment cannot be quietly corrected.
  const pub = r.public_comment_reply;
  if (/\d/.test(pub))                                   errors.push(`${at}: public_comment_reply contains a number — public replies must carry no figures`);
  if (/₦|naira|price|consent|title|c of o|sqm/i.test(pub)) errors.push(`${at}: public_comment_reply contains a price or title claim`);

  // THE promo rule: a promotion with no end date is not a promotion, it is a
  // permanent claim that nobody will remember to retract. This is what stops
  // a "Summer" offer still running in November.
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  if (r.promo_response.trim() && !r.promo_until.trim() && !r.promo_review_by.trim()) {
    errors.push(`${at}: has promo_response but neither promo_until nor promo_review_by — an open-ended campaign must still carry a review date, or nothing ever switches it off`);
  }
  for (const [field, val] of [['promo_from', r.promo_from], ['promo_until', r.promo_until], ['promo_review_by', r.promo_review_by]]) {
    if (val.trim() && !ISO.test(val.trim())) errors.push(`${at}: ${field} must be YYYY-MM-DD, got "${val}"`);
  }
  if (r.promo_from.trim() && r.promo_until.trim() && r.promo_from > r.promo_until) {
    errors.push(`${at}: promo_from is after promo_until`);
  }
  if ((r.promo_until.trim() || r.promo_review_by.trim()) && !r.promo_response.trim()) {
    errors.push(`${at}: has a promo window but no promo_response — nothing to say when it is live`);
  }

  // Ambiguity is a silent failure: two rules owning one phrase means the
  // answer depends on sort order, not on intent.
  for (const p of r.trigger_phrases) {
    const key = p.toLowerCase();
    if (seenPhrases.has(key)) errors.push(`${at}: trigger phrase "${p}" already claimed by ${seenPhrases.get(key)}`);
    else seenPhrases.set(key, r.rule_id);
  }
}

// --- guardrail pass: every canned response faces the live guard ---------
const wf = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops/concierge/workflows/02-concierge-brain-gemini.json'), 'utf8'));
const guardSrc = wf.nodes.find(n => n.name === 'Guardrails').parameters.jsCode;
const runGuard = payload => {
  const $input = { first: () => ({ json: { text: JSON.stringify(payload) } }) };
  return new Function('$input', guardSrc)($input)[0].json;
};

for (const r of rules) {
  if (r.status !== 'live') continue;
  for (const [field, text] of [['dm_response', r.dm_response], ['promo_response', r.promo_response]]) {
    if (!text.trim()) continue;
    const g = runGuard({ reply: text, escalate: r.escalate, escalation_reason: '', unit_interest: '', grounded_in: r.grounded_in });
    if (g.guard_triggered) {
      errors.push(`${r.rule_id} (line ${r._line}): ${field} is blocked by the guardrail — ${g.guard_triggered}`);
    }
  }
}

// Surface lapsed promotions at build time rather than letting them go quiet.
const today = new Date().toISOString().slice(0, 10);
const lapsed = rules.filter(r => (r.promo_until && r.promo_until < today) || (!r.promo_until && r.promo_review_by && r.promo_review_by < today));

if (errors.length) {
  console.error('✖ keyword table rejected:\n  - ' + errors.join('\n  - '));
  process.exit(1);
}

const out = {
  _meta: {
    client: 'shalom-park',
    source_csv: 'clients/shalom-park/keywords.csv',
    generated_by: 'tools/build-keywords.js',
    generated_at_note: 'Regenerate after every CSV or Sheet edit, then run node tools/test-all.js',
    rule_count: rules.length,
    doctrine: 'A match answers from pre-approved text with no model call. A miss falls through to the Concierge CORE. escalate_only always outranks fast_lane.',
    promo_rule: 'A rule with promo_response sends the promo text while it is in force and reverts to dm_response (the signed standard terms) once it lapses. A campaign with a fixed close uses promo_until; an open-ended run-until-sold-out campaign uses promo_review_by, which must be re-confirmed with the client before that date or the promo switches itself off. Neither field set means the promo never fires.'
  },
  rules: rules.map(({ _line, ...r }) => r)
};

// --- readable view: the in-house replacement for a spreadsheet ----------
// Renders in GitHub on a phone. The CSV stays the editable source of truth;
// this is the surface for reading and for showing a client.
const esc = t => String(t).replace(/\|/g, '\\|').replace(/\n+/g, '<br>');
const MD = path.join(ROOT, 'clients/shalom-park/keywords.md');
const byClass = c => rules.filter(r => r.class === c);

const section = (title, blurb, rows) => [
  `## ${title}`, '', blurb, '',
  '| Rule | Triggers on | What the buyer is sent | Public reply | Human? |',
  '|---|---|---|---|---|',
  ...rows.map(r => `| **${r.rule_id}**<br>${esc(r.intent)} | ${esc(r.trigger_phrases.join(' · '))} | ${esc(r.dm_response)} | ${esc(r.public_comment_reply)} | ${r.escalate ? '**yes**' : 'no'} |`),
  ''
].join('\n');

const md = [
  '# Shalom Park — Instagram keyword rules',
  '',
  `*Generated from \`keywords.csv\` by \`tools/build-keywords.js\`. **Do not edit this file** — edit the CSV and rebuild. ${rules.length} rules, ${seenPhrases.size} trigger phrases.*`,
  '',
  '> **How to read this.** A buyer comments or DMs. If their words hit a trigger, they get exactly the text in "What the buyer is sent" — no AI involved, no chance of a wrong number. Anything that hits nothing goes to the Concierge brain instead.',
  '',
  section('Safety class — always a human, never a canned fact',
    'These beat every commercial rule when both match. A buyer asking about returns on a specific unit gets a person, not a price.',
    byClass('escalate_only')),
  section('Fast lane — answered instantly from the signed facts sheet',
    'Every figure here traces to a field in the facts sheet Collins signed on 2026-07-27.',
    byClass('fast_lane')),
  '## Notes on each rule', '',
  '| Rule | Grounded in | Note |', '|---|---|---|',
  ...rules.map(r => `| ${r.rule_id} | ${esc(r.grounded_in.join(' · ')) || '—'} | ${esc(r.notes)} |`),
  ''
].join('\n');

if (CHECK_ONLY) {
  console.log(`✅ keyword table valid — ${rules.length} rules, ${seenPhrases.size} trigger phrases, 0 errors`);
} else {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  fs.writeFileSync(MD, md);
  console.log(`✅ built ${path.relative(ROOT, OUT)} + ${path.relative(ROOT, MD)} — ${rules.length} rules, ${seenPhrases.size} trigger phrases`);
  const live = rules.filter(r => r.promo_response && !lapsed.includes(r));
  if (live.length)   console.log(`   🎟️  promotions live: ${live.map(r => r.rule_id + (r.promo_until ? ' until ' + r.promo_until : ' — open-ended, re-confirm by ' + r.promo_review_by)).join(', ')}`);
  if (lapsed.length) console.log(`   ⏰ LAPSED — signed standard terms now apply: ${lapsed.map(r => r.rule_id + ' (' + (r.promo_until || 'review was due ' + r.promo_review_by) + ')').join(', ')}`);
}
