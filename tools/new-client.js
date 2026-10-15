#!/usr/bin/env node
/**
 * Scaffold a new client in one command.
 *
 *   node tools/new-client.js <slug> "<Business name>" "<Legal name as on CAC>"
 *   e.g. node tools/new-client.js harmony-gardens "Harmony Gardens" "Harmony Garden & Estate Development Ltd"
 *
 * Creates clients/<slug>/ (README tracker, empty KB, keyword table, Phase 0
 * log) and adds a registry row with status "onboarding". Nothing answers a
 * buyer until the playbook's gates are passed and the status is flipped to
 * "active" -- preflight refuses an active client with holes in its row.
 *
 * Playbook: ops/onboarding/README.md
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.env.PROPEL_ROOT || path.join(__dirname, '..');
const [slug, name, legal] = process.argv.slice(2);
const die = m => { console.error('✖ ' + m); process.exit(1); };

if (!slug || !name) die('usage: node tools/new-client.js <slug> "<Business name>" "<Legal name as on CAC>"');
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 30) {
  die('slug must be 3-30 chars of lowercase letters, digits and single hyphens, e.g. harmony-gardens');
}
if (slug === 'propel') die('"propel" is Propel\'s own assistant, not a client');

const regPath = path.join(ROOT, 'ops/concierge/clients.json');
const registry = JSON.parse(fs.readFileSync(regPath, 'utf8'));
if (registry.clients[slug]) die(`"${slug}" is already in the registry`);
const dir = path.join(ROOT, 'clients', slug);
if (fs.existsSync(dir)) die(`clients/${slug}/ already exists`);

const ENV = slug.toUpperCase().replace(/-/g, '_');
const rel = f => `clients/${slug}/${f}`;
const today = new Date().toISOString().slice(0, 10);

// --- registry row: everything off until the playbook switches it on -------
registry.clients[slug] = {
  name,
  developer: legal || null,
  status: 'onboarding',
  _status_rule: 'onboarding → active only when the playbook gates are passed: vetting done, facts sheet signed, KB + keywords built, alerts and escalation filled. Preflight refuses an active client with holes in this row.',
  kb_file: rel('kb.json'),
  facts_sheet: { signed_by: null, signed_on: null, file: null },
  channels: {
    instagram: { enabled: false, webhook_path: `${slug}-ig`, token_env: `${ENV}_IG_TOKEN`,
                 verify_env: `META_VERIFY_TOKEN_${ENV}`, secret_env: `${ENV}_APP_SECRET`, keyword_automation: true },
    whatsapp:  { enabled: false, webhook_path: `${slug}-wa`, token_env: `${ENV}_WABA_TOKEN`, phone_id_env: `${ENV}_WABA_PHONE_ID`,
                 verify_env: `META_VERIFY_TOKEN_${ENV}`, secret_env: `${ENV}_APP_SECRET`,
                 _rule: 'Add-on only. A dedicated number, never a salesperson\'s working line.' },
    email:     { enabled: false, address: null, mailbox_env: `${ENV}_IMAP` }
  },
  escalation: {
    primary:    { name: null, whatsapp: null, hours: 'Mon-Fri 08:00-20:00' },
    secondary:  { name: null, whatsapp: null, hours: 'Weekends / evenings' },
    supervisor: { name: null, whatsapp: null, hours: 'Overrides' },
    unclaimed_alert_minutes: 15
  },
  capabilities: { voice_notes: false, booking: false, document_vault: false, lead_scoring: false,
                  followup_sequences: false, multilingual: false },
  policy: { may_autosend_layout_map: false, may_autosend_title_pages: false, attribution_window_months: 12 },
  keywords: {
    enabled: false,
    rules_file: rel('keywords.json'),
    source_csv: rel('keywords.csv'),
    readable_view: rel('keywords.md'),
    assistant_signature: `— ${name} assistant`,
    links: { mode: 'none', wa_e164: null, website: null },
    instagram: { public_reply_enabled: true, private_replies_per_comment: 1,
                 private_reply_window_days: 7, max_automated_dms_per_hour: 180 },
    phase0: { saved_replies_file: rel('phase0-saved-replies.md'), priority_rules: [], faqs: [] }
  },
  alerts: { email_to: [], email_cc: ['aadamola@gmail.com'], from: 'alerts@getpropel.tech', sms_provider: null,
            _rule: 'Alerts always send from alerts@getpropel.tech, never the client\'s domain. email_to = the client\'s sales inbox.' }
};

// --- the KB: every field empty until the signed facts sheet fills it -----
const kb = {
  _meta: {
    estate: name, developer: legal || null,
    status: 'EMPTY — filled ONLY from the signed warranted facts sheet (ops/templates/warranted-facts-sheet.md)',
    source_document: null, warranted_by: null, warranted_date: null,
    kb_version: '0.1', last_updated: today, review_due: null,
    hard_rule: 'The assistant answers ONLY from this file. Anything not present is an escalation, never an invention.'
  },
  _blocked_until_sighted: { note: 'Items the client warrants but Propel has not yet sighted the documents for.', items: [] },
  developer: { legal_name: legal || null, rc_number: null, registered_address: null, cac_verified_by_propel: false },
  location: { address: null, lga: null, state: 'Lagos', landmarks: [], schools_nearby: [], hospitals_nearby: [], access_roads: [] },
  development: { total_land_size: null, total_inventory: null, overall_stage_percent: null, estimated_completion_date: null, development_type: null },
  documentation: { title_status: null, layout_approval: null, litigation_acquisition_or_dispute: null, docs_available_for_review: [],
                   title_reference_number: null, registered_in_name_of: null, survey_plan_number: null, approving_authority: null, lasrera_registration: null },
  units: [],
  pricing_terms: { included_in_price: null, excluded_from_price: [], excluded_amounts_supplied: false, negotiable: false, negotiation_note: null },
  payment: { initial_deposit: null, plan_durations: [], interest_or_markup: null, account_name: null,
             account_number_policy: 'NEVER state account numbers in chat. Always hand to a human.', refund_policy: {} },
  delivery: { allocation: null, documents_buyer_receives: [], handover_timeline: null, handover_dates_supplied: false, building_restrictions: null },
  amenities: { delivered: {}, planned: {} },
  inspection: { physical: null, meeting_point: null, virtual: null, diaspora_representative_allowed: null, walkthrough_video_url: null },
  must_not_say: [
    { topic: 'Rental-yield or short-let income projections', instead: 'State only contractually fixed facts; hand the buyer to a human for anything about returns.' },
    { topic: 'Resale or appreciation estimates', instead: 'No projected values; route the buyer to a human.' },
    { topic: 'Comparisons with other estates', instead: "Describe this estate's own facts only." },
    { topic: 'Timelines that are not contractually fixed', instead: "Give only dates confirmed in writing; otherwise 'the team will confirm'." },
    { topic: 'Bank account numbers', instead: 'Hand every payment-ready buyer to a human.' },
    { topic: 'Artificial scarcity', instead: 'State availability only as recorded here, re-verified on the agreed schedule.' }
  ],
  escalate_always: [
    'Completion and handover dates not confirmed in writing',
    'Title document reference number, registered owner, survey plan number',
    'Approving authority and LASRERA registration',
    'Instalment interest, markup or total price on payment plans',
    'Exact amounts for legal fees, utility connection or service charges',
    'Whether a stated price is current, promotional or subject to review',
    'Refund and cancellation questions (state the policy, then hand to a human)',
    'Anything at all not written in this file'
  ],
  fact_maintenance: { notifier: null, channels: [], max_notification_delay: '1 week', unit_count_update_frequency: 'Monthly',
                      scheduled_review_frequency: 'Monthly', next_review: null }
};

const KEYWORD_HEADER = 'rule_id,priority,class,intent,shortcut,trigger_phrases,dm_response,public_comment_reply,link_code,link_kind,escalate,grounded_in,status,notes,promo_from,promo_until,promo_review_by,promo_response\n';
const LOG_HEADER = 'date,source_post,keyword,ig_handle,what_they_asked,shortcut_sent,escalated_to,escalated_at,outcome,notes\n';

const readme = `# ${name}${legal ? ` (${legal})` : ''}

*Scaffolded ${today} by \`tools/new-client.js\`. Registry status: **onboarding**, so nothing answers a buyer yet.*
*Follow the playbook step by step: [ops/onboarding/README.md](../../ops/onboarding/README.md). Tick here as each step lands.*

| # | Step | Owner | Done |
|---|---|---|---|
| 1 | Response Audit delivered | A + B | ☐ |
| 2 | Vetting: CAC search · title & approval documents sighted · site visit (rule 5) | A | ☐ |
| 3 | Client-conflict check (same area as an existing client? check exclusivity) | A | ☐ |
| 4 | Proposal sent (ops/templates/proposal.md) → accepted | A + B | ☐ |
| 5 | Agreement signed · setup fee received | A | ☐ |
| 6 | Warranted facts sheet signed (ops/templates/warranted-facts-sheet.md) → \`docs/\` | A | ☐ |
| 7 | KB filled from the facts sheet → \`kb.json\` | B | ☐ |
| 8 | Keyword table written → \`keywords.csv\` → \`node tools/build-keywords.js\` | B | ☐ |
| 9 | Escalation people + alert inbox filled in the registry | B | ☐ |
| 10 | Phase 0 (manual saved replies) live on their Instagram | A | ☐ |
| 11 | Meta access session: partner access granted, app created, Step 0 test run | A | ☐ |
| 12 | Registry → \`active\`, Instagram enabled → build → preflight → import → handshake ✅ 3/3 | A + B | ☐ |
| 13 | Cutover morning: Phase 0 off, webhook subscribed, first test message | A | ☐ |
| 14 | First monthly report | B | ☐ |

## Open questions
- (log anything unconfirmed here; never guess it into the KB)
`;

fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
fs.writeFileSync(path.join(dir, 'README.md'), readme);
fs.writeFileSync(path.join(dir, 'kb.json'), JSON.stringify(kb, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'keywords.csv'), KEYWORD_HEADER);
fs.writeFileSync(path.join(dir, 'phase0-log.csv'), LOG_HEADER);
fs.writeFileSync(path.join(dir, 'docs', '.gitkeep'), '');
fs.writeFileSync(regPath, JSON.stringify(registry, null, 2) + '\n');

console.log(`✅ ${slug} scaffolded (status: onboarding)
   clients/${slug}/README.md     ← the 14-step tracker
   clients/${slug}/kb.json       ← empty; fill ONLY from the signed facts sheet
   clients/${slug}/keywords.csv  ← header only
   clients/${slug}/phase0-log.csv
   ops/concierge/clients.json    ← registry row added, every channel off

Next: ops/onboarding/README.md, step 1.`);
