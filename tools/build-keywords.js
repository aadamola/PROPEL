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
                  'public_comment_reply','link_code','link_kind','escalate','grounded_in','status','notes'];
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
    notes: o.notes
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
  const g = runGuard({ reply: r.dm_response, escalate: r.escalate, escalation_reason: '', unit_interest: '', grounded_in: r.grounded_in });
  if (g.guard_triggered) {
    errors.push(`${r.rule_id} (line ${r._line}): dm_response is blocked by the guardrail — ${g.guard_triggered}`);
  }
}

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
    doctrine: 'A match answers from pre-approved text with no model call. A miss falls through to the Concierge CORE. escalate_only always outranks fast_lane.'
  },
  rules: rules.map(({ _line, ...r }) => r)
};

if (CHECK_ONLY) {
  console.log(`✅ keyword table valid — ${rules.length} rules, ${seenPhrases.size} trigger phrases, 0 errors`);
} else {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`✅ built ${path.relative(ROOT, OUT)} — ${rules.length} rules, ${seenPhrases.size} trigger phrases`);
}
