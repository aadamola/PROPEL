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
 * Usage: node tools/build-keywords.js [--check] [--client=<slug>]
 *
 * Runs for every client in ops/concierge/clients.json with keywords.enabled.
 * Paths, names and the Phase 0 pack come from the registry -- adding a client
 * never means editing this file.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.env.PROPEL_ROOT || path.join(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');
const ONLY = (process.argv.find(a => a.startsWith('--client=')) || '').slice('--client='.length);
const REGISTRY = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops/concierge/clients.json'), 'utf8'));

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

function buildClient(slug, client) {
const kw = client.keywords;
const SRC = path.join(ROOT, kw.source_csv);
const OUT = path.join(ROOT, kw.rules_file);
const MD = path.join(ROOT, kw.readable_view || path.join(path.dirname(kw.source_csv), 'keywords.md'));
const P0 = kw.phase0 || {};
const SR = P0.saved_replies_file ? path.join(ROOT, P0.saved_replies_file) : null;
const NAME = client.name || slug;
const HUMAN = (client.escalation && client.escalation.primary && client.escalation.primary.name) || 'the sales team';
const FACTS = client.facts_sheet && client.facts_sheet.signed_by
  ? `the facts sheet ${client.facts_sheet.signed_by} signed on ${client.facts_sheet.signed_on}`
  : 'the signed facts sheet';
const rows = parseCSV(fs.readFileSync(SRC, 'utf8'));
const header = rows.shift().map(h => h.trim());

const REQUIRED = ['rule_id','priority','class','intent','shortcut','trigger_phrases','dm_response',
                  'public_comment_reply','link_code','link_kind','escalate','grounded_in','status','notes',
                  'promo_from','promo_until','promo_review_by','promo_response'];
const errors = [];
for (const col of REQUIRED) if (!header.includes(col)) errors.push(`missing column: ${col}`);
if (errors.length) { console.error(`✖ ${slug}: ` + errors.join('\n')); return false; }

const rules = rows.map((r, i) => {
  const o = {};
  header.forEach((h, k) => { o[h] = (r[k] == null ? '' : r[k]).trim(); });
  return {
    _line: i + 2,
    rule_id: o.rule_id,
    priority: Number(o.priority),
    class: o.class,
    intent: o.intent,
    shortcut: o.shortcut,
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
const seenShortcuts = new Map();
const CLASSES = new Set(['fast_lane', 'escalate_only']);
const STATUSES = new Set(['live', 'paused']);
const LINK_KINDS = new Set(['none', 'whatsapp', 'website']);

for (const r of rules) {
  const at = `${r.rule_id || '(no id)'} (line ${r._line})`;
  if (!r.rule_id) errors.push(`${at}: blank rule_id`);
  if (seenIds.has(r.rule_id)) errors.push(`${at}: duplicate rule_id`);
  seenIds.add(r.rule_id);
  if (seenShortcuts.has(r.shortcut)) errors.push(`${at}: shortcut "${r.shortcut}" already used by ${seenShortcuts.get(r.shortcut)}`);
  else seenShortcuts.set(r.shortcut, r.rule_id);

  if (!CLASSES.has(r.class))      errors.push(`${at}: class must be fast_lane or escalate_only, got "${r.class}"`);
  if (!STATUSES.has(r.status))    errors.push(`${at}: status must be live or paused, got "${r.status}"`);
  if (!LINK_KINDS.has(r.link_kind)) errors.push(`${at}: link_kind must be none|whatsapp|website, got "${r.link_kind}"`);
  if (!Number.isFinite(r.priority)) errors.push(`${at}: priority must be a number`);
  if (!r.trigger_phrases.length)  errors.push(`${at}: no trigger phrases`);
  if (!/^[a-z0-9]{2,12}$/.test(r.shortcut)) errors.push(`${at}: shortcut must be 2-12 lowercase letters/digits — it is typed on a phone`);
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

  // Copy discipline, enforced. Volunteering a limitation nobody asked about
  // is negative selling: it reads as a machine apologising, and it kills the
  // conversation before a human ever sees the lead. The hand-off still
  // happens — the copy just stops announcing it.
  const DISCLAIMER = /\bI (do not|don't) deal\b|\bI will not quote\b|\bI am not going to (give|quote)\b|not something I should\b|\bI (do not|don't) have the exact\b|\bI cannot confirm\b|\bI would rather not quote\b|\bI (do not|don't) want to quote\b|would be a guess\b|\bI am not certain\b|\bI (do not|don't) have (a|the) confirmed\b/i;
  // Every card earns its next message. A response with no question is a
  // dead end, and a dead end on Instagram is a lost buyer.
  for (const [field, text] of [['dm_response', r.dm_response], ['promo_response', r.promo_response]]) {
    if (!text.trim() || r.status !== 'live') continue;
    if (DISCLAIMER.test(text)) errors.push(`${at}: ${field} volunteers a limitation nobody asked about — turn it into an offer, not a confession`);
    if (!text.includes('?'))   errors.push(`${at}: ${field} closes without a question — every card must move the lead forward`);
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
  console.error(`✖ ${slug}: keyword table rejected:\n  - ` + errors.join('\n  - '));
  return false;
}

const out = {
  _meta: {
    client: slug,
    source_csv: kw.source_csv,
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
const byClass = c => rules.filter(r => r.class === c);

const section = (title, blurb, rows) => [
  `## ${title}`, '', blurb, '',
  '| Rule | Triggers on | What the buyer is sent | Public reply | Human? |',
  '|---|---|---|---|---|',
  ...rows.map(r => `| **${r.rule_id}**<br>${esc(r.intent)} | ${esc(r.trigger_phrases.join(' · '))} | ${esc(r.dm_response)} | ${esc(r.public_comment_reply)} | ${r.escalate ? '**yes**' : 'no'} |`),
  ''
].join('\n');

const md = [
  `# ${NAME} — Instagram keyword rules`,
  '',
  `*Generated from \`keywords.csv\` by \`tools/build-keywords.js\`. **Do not edit this file** — edit the CSV and rebuild. ${rules.length} rules, ${seenPhrases.size} trigger phrases.*`,
  '',
  '> **How to read this.** A buyer comments or DMs. If their words hit a trigger, they get exactly the text in "What the buyer is sent" — no AI involved, no chance of a wrong number. Anything that hits nothing goes to the Concierge brain instead.',
  '',
  section('Safety class — always a human, never a canned fact',
    'These beat every commercial rule when both match. A buyer asking about returns on a specific unit gets a person, not a price.',
    byClass('escalate_only')),
  section('Fast lane — answered instantly from the signed facts sheet',
    `Every figure here traces to a field in ${FACTS}.`,
    byClass('fast_lane')),
  '## Notes on each rule', '',
  '| Rule | Grounded in | Note |', '|---|---|---|',
  ...rules.map(r => `| ${r.rule_id} | ${esc(r.grounded_in.join(' · ')) || '—'} | ${esc(r.notes)} |`),
  ''
].join('\n');

// --- Phase 0: the pack ADEDAMOLA types into Instagram by hand -----------
// Generated from the same table the automation runs on, so the manual phase
// and the automated phase say identical things — and a promo change updates
// both at once.
const live = r => {
  const on = r.promo_response && ((r.promo_until && r.promo_until >= today) ||
                                  (!r.promo_until && r.promo_review_by && r.promo_review_by >= today));
  return { text: on ? r.promo_response : r.dm_response, promo: !!on };
};
const TIER1 = (P0.priority_rules || []).filter(id => rules.some(r => r.rule_id === id));
const REST = rules.filter(r => !TIER1.includes(r.rule_id));
const FAQS = P0.faqs || [];
// A saved reply lives inside Instagram, not in this file. Once pasted, a
// promo keeps going out long after the automation has reverted -- so every
// promo card carries its own expiry and the standard text to swap in.
const entry = r => {
  const { text, promo } = live(r);
  const out = [`### \`${r.shortcut}\` — ${r.intent}${promo ? '  🎟️ *promo text — live*' : ''}` +
          (r.escalate ? `  ⚠️ *then tell ${HUMAN}*` : ''), '', '```', text, '```', ''];
  if (promo) {
    const until = r.promo_until || r.promo_review_by;
    const why = r.promo_until ? 'the promotion ends' : `${HUMAN} has not re-confirmed it`;
    out.push(`> ⏰ **Good until ${until}.** After that, if ${why}, open this saved reply in Instagram and replace the text with the standard terms below. Instagram won't update it for you.`,
             '', '```', r.dm_response, '```', '');
  }
  return out.join('\n');
};
const srDoc = [
  `# Phase 0 — ${NAME} Instagram Saved Replies`,
  '',
  `*Generated from \`keywords.csv\`. **Do not edit this file** — edit the CSV and rebuild. ${rules.length} replies, all under 600 characters.*`,
  '',
  '> **Where these go:** Instagram → **Settings → Business tools → Saved replies → +**. Put the shortcut in *Shortcut* and the text in *Message*. Typing the shortcut in any DM expands it.',
  '',
  ...(TIER1.length ? [`> **Do the ${TIER1.length} below first.** They cover the campaign keywords and the questions everyone asks. The other ${REST.length} are a ten-minute job for another day — you are not behind if they are not in yet.`, ''] : []),
  `> ⚠️ **means a human still needs to follow up.** Send the reply, then message ${HUMAN}. The automation does this silently later; for now it is you.`,
  '',
  '---',
  '',
  ...(TIER1.length ? [`## The ${TIER1.length} that matter`, '', ...TIER1.map(id => entry(rules.find(r => r.rule_id === id))), '---', '',
                      `## The other ${REST.length} — when you have ten spare minutes`, ''] : ['## All replies', '']),
  ...REST.map(entry),
  ...(FAQS.length ? ['---', '', `## The ${FAQS.length} FAQs`, '',
    'Instagram → **Settings → Business tools → FAQs**. These show as tappable buttons when someone opens a new chat, so they do the first move for you.',
    '', '| Question | Answer |', '|---|---|',
    ...FAQS.map(f => `| ${f.q} | ${f.a} |`)] : []),
  ''
].join('\n');

if (CHECK_ONLY) {
  console.log(`✅ ${slug}: keyword table valid — ${rules.length} rules, ${seenPhrases.size} trigger phrases, 0 errors`);
} else {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  fs.writeFileSync(MD, md);
  if (SR) fs.writeFileSync(SR, srDoc);
  console.log(`✅ ${slug}: built ${path.relative(ROOT, OUT)} + ${path.relative(ROOT, MD)}${SR ? ' + ' + path.relative(ROOT, SR) : ''} — ${rules.length} rules, ${seenPhrases.size} trigger phrases`);
  const live = rules.filter(r => r.promo_response && !lapsed.includes(r));
  if (live.length)   console.log(`   🎟️  promotions live: ${live.map(r => r.rule_id + (r.promo_until ? ' until ' + r.promo_until : ' — open-ended, re-confirm by ' + r.promo_review_by)).join(', ')}`);
  if (lapsed.length) console.log(`   ⏰ LAPSED — signed standard terms now apply: ${lapsed.map(r => r.rule_id + ' (' + (r.promo_until || 'review was due ' + r.promo_review_by) + ')').join(', ')}`);
}
return true;
}

const targets = Object.entries(REGISTRY.clients)
  .filter(([slug, c]) => c.keywords && c.keywords.enabled && (!ONLY || slug === ONLY));
if (ONLY && !targets.length) { console.error(`✖ no client "${ONLY}" with keywords.enabled in the registry`); process.exit(1); }
let failed = 0;
for (const [slug, c] of targets) if (!buildClient(slug, c)) failed++;
if (!targets.length) console.log('– no client has keywords enabled yet');
process.exit(failed ? 1 : 0);
