#!/usr/bin/env node
/**
 * Workflow builder.
 *
 * Embeds tested library source (lib/normalize.js, the guardrail node) into
 * the workflow JSON. Shipped code is literally the tested code — no copy,
 * no drift. Re-run after any lib change, then re-run the test suites.
 */
const fs = require('fs');
const path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const W = (p, o) => fs.writeFileSync(path.join(__dirname, '..', p), JSON.stringify(o, null, 2) + '\n');

// --- tested sources ------------------------------------------------------
const normalizeSrc = R('ops/concierge/lib/normalize.js')
  .replace(/^'use strict';$/m, '')
  .replace(/^const crypto = require\('crypto'\);$/m, "const crypto = require('crypto');")
  .replace(/^module\.exports[\s\S]*$/m, '');

const guardSrc = JSON.parse(R('ops/concierge/workflows/02-concierge-brain-gemini.json'))
  .nodes.find(n => n.name === 'Guardrails').parameters.jsCode;

const registry = JSON.parse(R('ops/concierge/clients.json'));
const kbs = {
  'shalom-park': JSON.parse(R('clients/shalom-park/kb.json')),
  'propel':      JSON.parse(R('ops/concierge/propel-kb.json'))
};

const code = (id, name, pos, js) => ({
  parameters: { jsCode: js }, type: 'n8n-nodes-base.code', typeVersion: 2, position: pos, id, name
});

// =========================================================================
// 03 — CONCIERGE CORE (sub-workflow; every channel calls this)
// =========================================================================
const loadCtx = `
// Resolve client config + KB from the registry. Nothing client-specific is
// hardcoded in a node — adding client #2 is a registry row.
const REGISTRY = ${JSON.stringify(registry)};
const KBS = ${JSON.stringify(kbs)};

const env = $input.first().json;
const clientId = env.client_id;
const client = REGISTRY.clients[clientId];

if (!client) {
  return [{ json: { ...env, fatal: true, reason: 'unknown client_id: ' + clientId } }];
}
if (client.status !== 'active') {
  return [{ json: { ...env, fatal: true, reason: 'client not active: ' + clientId } }];
}
const kb = KBS[clientId];
if (!kb) {
  return [{ json: { ...env, fatal: true, reason: 'no KB loaded for ' + clientId } }];
}
return [{ json: { ...env, client, kb, capabilities: client.capabilities || {} } }];
`;

const dedup = `
// Idempotency. Meta redelivers webhooks and IMAP can re-serve a message
// after a reconnect. Answering twice looks broken to a buyer and writes a
// duplicate row into the commission ledger.
//
// Workflow static data keeps this credential-free. Swap for a Postgres
// lookup on provider_message_id once volume justifies it -- the unique
// index in 001-attribution-ledger.sql is already the durable backstop.
const env = $input.first().json;
if (env.fatal) return [{ json: env }];

const store = $getWorkflowStaticData('global');
store.seen = store.seen || {};

const key = env.provider_message_id;
const now = Date.now();
const TTL = 24 * 60 * 60 * 1000;

for (const k of Object.keys(store.seen)) {
  if (now - store.seen[k] > TTL) delete store.seen[k];
}

if (key && store.seen[key]) {
  return [{ json: { ...env, duplicate: true, reply: '', escalate: false } }];
}
if (key) store.seen[key] = now;

return [{ json: { ...env, duplicate: false } }];
`;

const buildPrompt = `
// Model id is configuration, not a hardcoded URL.
const MODEL = 'gemini-3.6-flash';
const API_VERSION = 'v1beta';
const MODEL_URL = \`https://generativelanguage.googleapis.com/\${API_VERSION}/models/\${MODEL}:generateContent\`;

const env = $input.first().json;
if (env.fatal || env.duplicate) return [{ json: { ...env, model_url: MODEL_URL } }];

const SYSTEM = ${JSON.stringify(R('ops/concierge/system-prompt.md').split('\`\`\`', 2)[1].replace(/^\n/, ''))}
  .replace(/\\{\\{CLIENT_NAME\\}\\}/g, env.client.name)
  .replace('{{KB_JSON}}', JSON.stringify(env.kb, null, 1));

// Channel shapes the reply without changing the rules.
const CHANNEL_HINT = {
  whatsapp:           'Channel: WhatsApp. Keep it short — two or three sentences.',
  instagram_dm:       'Channel: Instagram DM. Keep it short and friendly.',
  instagram_comment:  'Channel: Instagram private reply to a public comment. ONE short message; invite them to continue in DM.',
  email:              'Channel: Email. You may use a short greeting, two or three brief paragraphs, and a sign-off. Still never state a fact absent from the knowledge base.'
}[env.channel] || '';

return [{ json: { ...env, model_url: MODEL_URL, system: SYSTEM + '\\n\\n' + CHANNEL_HINT, user_message: env.text } }];
`;

const finalise = `
// Assemble what the channel adapter needs to act on.
const env = $input.first().json;

if (env.fatal)     return [{ json: { send: false, reason: env.reason, fatal: true } }];
if (env.duplicate) return [{ json: { send: false, reason: 'duplicate_message' } }];

const esc = env.client?.escalation || {};
const target = esc.primary || {};

return [{ json: {
  send: true,
  client_id:    env.client_id,
  channel:      env.channel,
  contact_id:   env.contact_id,
  thread_ref:   env.thread_ref,
  subject:      env.subject ? ('Re: ' + String(env.subject).replace(/^re:\\s*/i,'')) : '',
  reply:        env.reply,
  escalate:     env.escalate === true,
  escalation:   env.escalate === true ? {
    to_name:   target.name || '',
    to_wa:     target.whatsapp || '',
    reason:    env.escalation_reason || '',
    unclaimed_alert_minutes: esc.unclaimed_alert_minutes || 15
  } : null,
  ledger: {
    provider_message_id: env.provider_message_id,
    contact_hash:        env.contact_hash,
    contact_e164:        env.contact_e164 || env.contact_email || env.contact_id,
    channel:             env.channel,
    unit_interest:       env.unit_interest || '',
    grounded_in:         env.grounded_in || [],
    guard_triggered:     env.guard_triggered || ''
  },
  // Add-on hooks: enabled per client in clients.json. Each is a future
  // sub-workflow call; the envelope already carries what they need.
  addons: {
    voice_note:  !!(env.capabilities?.voice_notes) && env.channel === 'whatsapp',
    booking:     !!(env.capabilities?.booking) && /inspect|visit|viewing|book/i.test(env.text || ''),
    doc_vault:   !!(env.capabilities?.document_vault) && /document|title|c of o|survey|deed/i.test(env.text || ''),
    lead_score:  !!(env.capabilities?.lead_scoring),
    followup:    !!(env.capabilities?.followup_sequences)
  }
}}];
`;

const core = {
  name: 'Propel Concierge — CORE (shared by every channel)',
  nodes: [
    { parameters: { workflowInputs: { values: [
        { name: 'client_id' }, { name: 'channel' }, { name: 'provider_message_id' },
        { name: 'contact_id' }, { name: 'contact_e164' }, { name: 'contact_email' },
        { name: 'contact_hash' }, { name: 'display_name' }, { name: 'text' },
        { name: 'thread_ref' }, { name: 'subject' }
      ] } }, type: 'n8n-nodes-base.executeWorkflowTrigger', typeVersion: 1.1,
      position: [-260, 0], id: 'core-trigger', name: 'Called by a channel' },
    code('load-ctx', 'Load client + KB', [-40, 0], loadCtx),
    code('dedup', 'Dedup gate', [180, 0], dedup),
    code('build-prompt', 'Build prompt', [400, 0], buildPrompt),
    { parameters: {
        method: 'POST',
        // Key lives in an n8n credential, not $env: encrypted at rest with
        // N8N_ENCRYPTION_KEY, and it does not require relaxing n8n's
        // env-access policy just to make one HTTP call work.
        url: '={{ $json.model_url }}',
        authentication: 'genericCredentialType', genericAuthType: 'httpQueryAuth',
        sendBody: true, specifyBody: 'json',
        jsonBody: "={{ $json.fatal || $json.duplicate ? '{}' : JSON.stringify({ system_instruction: { parts: [{ text: $json.system }] }, contents: [{ role: 'user', parts: [{ text: $json.user_message }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 800, responseMimeType: 'application/json' } }) }}",
        options: { timeout: 20000, response: { response: { neverError: true } } }
      }, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [620, 0],
      id: 'gemini', name: 'Gemini 3 Flash', alwaysOutputData: true },
    code('guardrails', 'Guardrails', [840, 0], guardSrc),
    code('finalise', 'Build response envelope', [1060, 0], finalise)
  ],
  connections: {
    'Called by a channel': { main: [[{ node: 'Load client + KB', type: 'main', index: 0 }]] },
    'Load client + KB':    { main: [[{ node: 'Dedup gate', type: 'main', index: 0 }]] },
    'Dedup gate':          { main: [[{ node: 'Build prompt', type: 'main', index: 0 }]] },
    'Build prompt':        { main: [[{ node: 'Gemini 3 Flash', type: 'main', index: 0 }]] },
    'Gemini 3 Flash':      { main: [[{ node: 'Guardrails', type: 'main', index: 0 }]] },
    'Guardrails':          { main: [[{ node: 'Build response envelope', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' }, pinData: {}
};
W('ops/concierge/workflows/03-concierge-core.json', core);

// =========================================================================
// 04 — EMAIL CHANNEL
// =========================================================================
const emailNormalize = `
${normalizeSrc}
// IMAP Trigger emits one item per message.
const mail = $input.first().json;
const env = normalize('email', mail, 'shalom-park');
return [{ json: env }];
`;

const email = {
  name: 'Propel Concierge — Email channel',
  nodes: [
    { parameters: { postProcessAction: 'read', options: { allowUnauthorizedCerts: false, forceReconnect: 60 } },
      type: 'n8n-nodes-base.emailReadImap', typeVersion: 2, position: [-260, 0],
      id: 'imap', name: 'Inbox (IMAP)' },
    code('normalize-email', 'Normalise', [-40, 0], emailNormalize),
    { parameters: { conditions: { options: { caseSensitive: true, version: 2 }, conditions: [
        { id: 'actionable', operator: { type: 'boolean', operation: 'true', singleValue: true },
          leftValue: '={{ $json.is_actionable }}', rightValue: '' } ], combinator: 'and' }, options: {} },
      type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [180, 0], id: 'if-actionable', name: 'Worth answering?' },
    { parameters: { workflowId: { __rl: true, value: 'AE422d9ptfvjj0PQ', mode: 'id' },
        workflowInputs: { mappingMode: 'defineBelow', value: {
          client_id: '={{ $json.client_id }}', channel: '={{ $json.channel }}',
          provider_message_id: '={{ $json.provider_message_id }}', contact_id: '={{ $json.contact_id }}',
          contact_email: '={{ $json.contact_email }}', contact_hash: '={{ $json.contact_hash }}',
          display_name: '={{ $json.display_name }}', text: '={{ $json.text }}',
          thread_ref: '={{ $json.thread_ref }}', subject: '={{ $json.subject }}' } }, options: {} },
      type: 'n8n-nodes-base.executeWorkflow', typeVersion: 1.2, position: [400, -100],
      id: 'call-core', name: 'Concierge CORE' },
    { parameters: { sendTo: '={{ $json.contact_id }}', subject: '={{ $json.subject }}',
        emailFormat: 'text', message: '={{ $json.reply }}', options: {} },
      type: 'n8n-nodes-base.emailSend', typeVersion: 2.1, position: [620, -100],
      id: 'send-email', name: 'Reply by email' },
    code('log-skip', 'Log ignored mail', [400, 120],
      "// Auto-replies, bounces and newsletters land here. Logged, never answered.\nreturn [{ json: { ignored: true, reason: $json.skip_reason, from: $json.contact_email } }];")
  ],
  connections: {
    'Inbox (IMAP)':      { main: [[{ node: 'Normalise', type: 'main', index: 0 }]] },
    'Normalise':         { main: [[{ node: 'Worth answering?', type: 'main', index: 0 }]] },
    'Worth answering?':  { main: [
      [{ node: 'Concierge CORE', type: 'main', index: 0 }],
      [{ node: 'Log ignored mail', type: 'main', index: 0 }] ] },
    'Concierge CORE':    { main: [[{ node: 'Reply by email', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' }, pinData: {}
};
W('ops/concierge/workflows/04-channel-email.json', email);

console.log('built: 03-concierge-core.json, 04-channel-email.json');

// =========================================================================
// 05 — INSTAGRAM CHANNEL (keyword fast lane in front of the brain)
// =========================================================================
const keywordsSrc = R('ops/concierge/lib/keywords.js')
  .replace(/^'use strict';$/m, '')
  .replace(/^module\.exports[\s\S]*$/m, '');

const kwTable = JSON.parse(R('clients/shalom-park/keywords.json'));
const spKw = registry.clients['shalom-park'].keywords;
const GRAPH = registry._meta.meta_graph.version;

const igHandshake = `
// Constant-time compare: the verify token is the only thing standing
// between this public URL and anyone subscribing their own Meta app to it.
const crypto = require('crypto');
const q = $input.first().json.query || {};
const expected = String($env.META_VERIFY_TOKEN_SHALOM_PARK || '');
const got = String(q['hub.verify_token'] || '');
const ok = expected.length > 0 && got.length === expected.length &&
  crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
if (q['hub.mode'] === 'subscribe' && ok) {
  return [{ json: { status: 200, body: String(q['hub.challenge'] || '') } }];
}
return [{ json: { status: 403, body: 'Forbidden' } }];
`;

const igVerifySig = `
// Meta signs every POST with an HMAC over the RAW bytes. Without this check
// anyone who learns the URL can post fabricated buyer messages straight into
// the attribution ledger our commission claims rest on.
const crypto = require('crypto');
const item = $input.first();
const secret = String($env.SHALOM_PARK_APP_SECRET || '');
const header = String(item.json.headers?.['x-hub-signature-256'] || '');
const raw = item.binary?.data ? Buffer.from(item.binary.data.data, 'base64') : Buffer.from(JSON.stringify(item.json.body || {}));
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
const ok = secret && header.length === expected.length &&
  crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
return [{ json: { ok, body: item.json.body, status: ok ? 200 : 403 } }];
`;

const igNormalize = `
${normalizeSrc}
const payload = $input.first().json;
if (!payload.ok) return [{ json: envelope({ channel: 'instagram_dm', is_actionable: false, skip_reason: 'bad_signature' }) }];
return [{ json: normalize('instagram', payload.body, 'shalom-park') }];
`;

const igFastLane = `
${keywordsSrc}

// The keyword table, compiled from clients/shalom-park/keywords.csv.
// Rebuild with: node tools/build-keywords.js && node tools/build-workflows.js
const TABLE = ${JSON.stringify(kwTable)};
const CFG = ${JSON.stringify({ assistant_signature: spKw.assistant_signature, links: spKw.links })};
const RULES = compile(TABLE.rules);

const env = $input.first().json;
const hit = match(RULES, env.text, CFG);

if (!hit.matched) {
  // No rule owns this question. The brain gets it, with the KB and the
  // guardrails — a miss is a fall-through, never a dead end.
  return [{ json: { ...env, lane: 'brain', keyword_miss_reason: hit.reason } }];
}

// Shaped exactly like a model response so it flows through the SAME
// guardrail node the brain's output does. A human edit to the sheet gets
// policed at runtime, not only at build time.
return [{ json: { ...env, lane: 'keyword', rule_id: hit.rule_id, intent: hit.intent, matched_phrase: hit.matched_phrase,
  public_comment_reply: hit.public_comment_reply, link_code: hit.link_code,
  text: JSON.stringify({ reply: hit.reply, escalate: hit.escalate, escalation_reason: hit.escalation_reason,
                         unit_interest: hit.unit_interest, grounded_in: hit.grounded_in }) } }];
`;

const igPrepare = `
// Merge whichever lane answered back onto the original envelope.
const env = $('Normalise').first().json;
const src = $input.first().json;
const lane = $('Keyword fast lane').first().json;

const reply = String(src.reply || '');
const isComment = env.channel === 'instagram_comment';

return [{ json: {
  send: !!reply,
  lane: lane.lane,
  rule_id: lane.rule_id || '',
  intent: lane.intent || '',
  matched_phrase: lane.matched_phrase || '',
  text: env.text,
  client_id: 'shalom-park',
  channel: env.channel,
  contact_id: env.contact_id,
  contact_handle: env.contact_handle,
  thread_ref: env.thread_ref,
  comment_id: isComment ? env.thread_ref : '',
  reply,
  public_comment_reply: isComment ? String(lane.public_comment_reply || '') : '',
  escalate: src.escalate === true,
  escalation_reason: src.escalation_reason || '',
  guard_triggered: src.guard_triggered || '',
  ledger: {
    provider_message_id: env.provider_message_id,
    contact_hash: env.contact_hash,
    contact_e164: env.contact_id,
    channel: env.channel,
    unit_interest: src.unit_interest || '',
    grounded_in: src.grounded_in || [],
    keyword_rule: lane.rule_id || '',
    link_code: lane.link_code || '',
    guard_triggered: src.guard_triggered || ''
  }
}}];
`;

const igSendGate = `
// Meta's two hard limits, enforced before we spend them:
//   1. ONE private reply per comment, inside a 7-day window
//   2. ~200 automated DMs an hour
// Overflow is queued to a human, never dropped. A buyer who gets no answer
// is a lost lead; a buyer who gets a late human answer is still a lead.
const LIMITS = ${JSON.stringify(spKw.instagram)};
const item = $input.first().json;
if (!item.send) return [{ json: { ...item, send: false, reason: 'empty_reply' } }];

const store = $getWorkflowStaticData('global');
store.repliedComments = store.repliedComments || {};
store.hourly = store.hourly || { windowStart: 0, count: 0 };

const now = Date.now();
const WINDOW = LIMITS.private_reply_window_days * 24 * 60 * 60 * 1000;
for (const k of Object.keys(store.repliedComments)) {
  if (now - store.repliedComments[k] > WINDOW) delete store.repliedComments[k];
}

if (item.comment_id) {
  if (store.repliedComments[item.comment_id]) {
    return [{ json: { ...item, send: false, reason: 'private_reply_already_used_for_this_comment' } }];
  }
  store.repliedComments[item.comment_id] = now;
}

if (now - store.hourly.windowStart > 60 * 60 * 1000) store.hourly = { windowStart: now, count: 0 };
if (store.hourly.count >= LIMITS.max_automated_dms_per_hour) {
  return [{ json: { ...item, send: false, reason: 'hourly_cap_reached', escalate: true,
                    escalation_reason: 'automation hourly cap reached — needs a human' } }];
}
store.hourly.count++;

return [{ json: { ...item, send: true } }];
`;

const GRAPH_BASE = 'https://graph.facebook.com/' + GRAPH;

const instagram = {
  name: 'Propel Concierge — Instagram channel (keyword fast lane + brain)',
  nodes: [
    { parameters: { httpMethod: 'GET', path: 'shalom-park-ig', responseMode: 'responseNode', options: {} },
      type: 'n8n-nodes-base.webhook', typeVersion: 2, position: [-700, -180],
      id: 'ig-verify', name: 'IG webhook (verify)', webhookId: 'shalom-park-ig-verify' },
    code('ig-handshake', 'Handshake', [-480, -180], igHandshake),
    { parameters: { respondWith: 'text', responseBody: '={{ $json.body }}',
        options: { responseCode: '={{ $json.status }}' } },
      type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: [-260, -180],
      id: 'ig-respond-challenge', name: 'Respond challenge' },

    { parameters: { httpMethod: 'POST', path: 'shalom-park-ig', responseMode: 'responseNode',
        options: { rawBody: true } },
      type: 'n8n-nodes-base.webhook', typeVersion: 2, position: [-700, 60],
      id: 'ig-events', name: 'IG webhook (events)', webhookId: 'shalom-park-ig-events' },
    code('ig-sig', 'Verify signature', [-480, 60], igVerifySig),
    { parameters: { respondWith: 'text', responseBody: '={{ $json.ok ? "EVENT_RECEIVED" : "Forbidden" }}',
        options: { responseCode: '={{ $json.status }}' } },
      type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: [-260, 60],
      id: 'ig-ack', name: 'ACK Meta' },

    code('ig-normalize', 'Normalise', [-40, 60], igNormalize),
    { parameters: { conditions: { options: { caseSensitive: true, version: 2 }, conditions: [
        { id: 'actionable', operator: { type: 'boolean', operation: 'true', singleValue: true },
          leftValue: '={{ $json.is_actionable }}', rightValue: '' } ], combinator: 'and' }, options: {} },
      type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [180, 60],
      id: 'ig-actionable', name: 'Worth answering?' },
    code('ig-skip', 'Log ignored event', [180, 300],
      "// Echoes, read receipts and our own comments land here. Logged, never answered.\nreturn [{ json: { ignored: true, reason: $json.skip_reason, channel: $json.channel } }];"),

    code('ig-keywords', 'Keyword fast lane', [400, 60], igFastLane),
    { parameters: { conditions: { options: { caseSensitive: true, version: 2 }, conditions: [
        { id: 'is-keyword', operator: { type: 'string', operation: 'equals' },
          leftValue: '={{ $json.lane }}', rightValue: 'keyword' } ], combinator: 'and' }, options: {} },
      type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [620, 60],
      id: 'ig-matched', name: 'Keyword matched?' },

    code('ig-guard', 'Guardrails', [840, -60], guardSrc),
    { parameters: { workflowId: { __rl: true, value: registry._meta.n8n.core_workflow_id, mode: 'id' },
        workflowInputs: { mappingMode: 'defineBelow', value: {
          client_id: '=shalom-park', channel: '={{ $json.channel }}',
          provider_message_id: '={{ $json.provider_message_id }}', contact_id: '={{ $json.contact_id }}',
          contact_hash: '={{ $json.contact_hash }}', display_name: '={{ $json.display_name }}',
          text: '={{ $json.text }}', thread_ref: '={{ $json.thread_ref }}' } }, options: {} },
      type: 'n8n-nodes-base.executeWorkflow', typeVersion: 1.2, position: [840, 200],
      id: 'ig-core', name: 'Concierge CORE' },

    code('ig-prepare', 'Prepare send', [1060, 60], igPrepare),
    code('ig-gate', 'Send gate (Meta limits)', [1280, 60], igSendGate),
    { parameters: { rules: { values: [
        { conditions: { options: { caseSensitive: true, version: 2 }, conditions: [
            { operator: { type: 'string', operation: 'equals' }, leftValue: '={{ $json.channel }}', rightValue: 'instagram_comment' } ], combinator: 'and' }, outputKey: 'comment' },
        { conditions: { options: { caseSensitive: true, version: 2 }, conditions: [
            { operator: { type: 'string', operation: 'equals' }, leftValue: '={{ $json.channel }}', rightValue: 'instagram_dm' } ], combinator: 'and' }, outputKey: 'dm' }
      ] }, options: { fallbackOutput: 'extra' } },
      type: 'n8n-nodes-base.switch', typeVersion: 3.2, position: [1500, 60],
      id: 'ig-route', name: 'Comment or DM?' },

    { parameters: { method: 'POST', url: `${GRAPH_BASE}/me/messages`,
        authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
        sendBody: true, specifyBody: 'json',
        jsonBody: "={{ JSON.stringify({ recipient: { comment_id: $json.comment_id }, message: { text: $json.reply } }) }}",
        options: { timeout: 15000, response: { response: { neverError: true } } } },
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1720, -60],
      id: 'ig-private-reply', name: 'Private reply to comment' },
    { parameters: { method: 'POST', url: `=${GRAPH_BASE}/{{ $('Send gate (Meta limits)').first().json.comment_id }}/replies`,
        authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
        sendBody: true, specifyBody: 'json',
        jsonBody: "={{ JSON.stringify({ message: $('Send gate (Meta limits)').first().json.public_comment_reply }) }}",
        options: { timeout: 15000, response: { response: { neverError: true } } } },
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1940, -60],
      id: 'ig-public-reply', name: 'Public comment reply' },
    { parameters: { method: 'POST', url: `${GRAPH_BASE}/me/messages`,
        authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
        sendBody: true, specifyBody: 'json',
        jsonBody: "={{ JSON.stringify({ recipient: { id: $json.contact_id }, message: { text: $json.reply } }) }}",
        options: { timeout: 15000, response: { response: { neverError: true } } } },
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1720, 180],
      id: 'ig-dm', name: 'Send IG DM' },
    { parameters: { workflowId: { __rl: true, value: registry._meta.n8n.ledger_workflow_id || 'REPLACE_WITH_LEDGER_WORKFLOW_ID', mode: 'id' },
        workflowInputs: { mappingMode: 'defineBelow', value: {
          client_id: '={{ $json.client_id }}', channel: '={{ $json.channel }}',
          provider_message_id: '={{ $json.ledger.provider_message_id }}',
          contact_id: '={{ $json.contact_id }}', contact_handle: '={{ $json.contact_handle }}',
          contact_hash: '={{ $json.ledger.contact_hash }}',
          text: '={{ $json.text }}', reply: '={{ $json.reply }}',
          rule_id: '={{ $json.rule_id }}', intent: '={{ $json.intent }}',
          link_code: '={{ $json.ledger.link_code }}', unit_interest: '={{ $json.ledger.unit_interest }}',
          escalation_reason: '={{ $json.escalation_reason }}', guard_triggered: '={{ $json.guard_triggered }}',
          reason: '={{ $json.reason }}',
          escalate: '={{ $json.escalate }}', send: '={{ $json.send }}' } }, options: {} },
      type: 'n8n-nodes-base.executeWorkflow', typeVersion: 1.2, position: [1500, 340],
      id: 'ig-ledger', name: 'Ledger + escalation' },
    code('ig-held', 'Held for a human', [1720, 400],
      "// Nothing sent: cap reached, reply already used, or an empty reply.\n" +
      "// This is the escalation queue until the notifier workflow ships.\n" +
      "return [{ json: { held: true, reason: $json.reason, rule_id: $json.rule_id, handle: $json.contact_handle, channel: $json.channel } }];")
  ],
  connections: {
    'IG webhook (verify)':  { main: [[{ node: 'Handshake', type: 'main', index: 0 }]] },
    'Handshake':            { main: [[{ node: 'Respond challenge', type: 'main', index: 0 }]] },
    'IG webhook (events)':  { main: [[{ node: 'Verify signature', type: 'main', index: 0 }]] },
    'Verify signature':     { main: [[{ node: 'ACK Meta', type: 'main', index: 0 }]] },
    'ACK Meta':             { main: [[{ node: 'Normalise', type: 'main', index: 0 }]] },
    'Normalise':            { main: [[{ node: 'Worth answering?', type: 'main', index: 0 }]] },
    'Worth answering?':     { main: [
      [{ node: 'Keyword fast lane', type: 'main', index: 0 }],
      [{ node: 'Log ignored event', type: 'main', index: 0 }] ] },
    'Keyword fast lane':    { main: [[{ node: 'Keyword matched?', type: 'main', index: 0 }]] },
    'Keyword matched?':     { main: [
      [{ node: 'Guardrails', type: 'main', index: 0 }],
      [{ node: 'Concierge CORE', type: 'main', index: 0 }] ] },
    'Guardrails':           { main: [[{ node: 'Prepare send', type: 'main', index: 0 }]] },
    'Concierge CORE':       { main: [[{ node: 'Prepare send', type: 'main', index: 0 }]] },
    'Prepare send':         { main: [[{ node: 'Send gate (Meta limits)', type: 'main', index: 0 }]] },
    // Fan-out: the durable record and the human alert do not wait on the
    // send succeeding. A reply that fails to deliver is still a lead.
    'Send gate (Meta limits)': { main: [[
      { node: 'Comment or DM?', type: 'main', index: 0 },
      { node: 'Ledger + escalation', type: 'main', index: 0 } ]] },
    'Comment or DM?':       { main: [
      [{ node: 'Private reply to comment', type: 'main', index: 0 }],
      [{ node: 'Send IG DM', type: 'main', index: 0 }],
      [{ node: 'Held for a human', type: 'main', index: 0 }] ] },
    'Private reply to comment': { main: [[{ node: 'Public comment reply', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' }, pinData: {}
};
W('ops/concierge/workflows/05-channel-instagram.json', instagram);

console.log('built: 05-channel-instagram.json');

// =========================================================================
// 06 — LEDGER + ESCALATION (called for EVERY answered message)
// =========================================================================
// Two jobs that must not be separated: write the durable record, then tell a
// human if one is needed. The write is not best-effort -- commission on a
// single unit is ₦5.5-6m and evidence that only exists inside infrastructure
// the client can revoke is not evidence.
const oncallSrc = R('ops/concierge/lib/oncall.js')
  .replace(/^'use strict';$/m, '')
  .replace(/^module\.exports[\s\S]*$/m, '');

const spAlerts = registry.clients['shalom-park'].alerts;

const composeAlert = `
${oncallSrc}

const REGISTRY = ${JSON.stringify({ clients: Object.fromEntries(Object.entries(registry.clients).map(([k, v]) => [k, { name: v.name, escalation: v.escalation, alerts: v.alerts || null }])) })};

const inp = $input.first().json;
const client = REGISTRY.clients[inp.client_id] || {};
const esc = client.escalation || {};
const who = onDuty(esc, Date.now(), { unclaimed: false });

const notify = inp.escalate === true || inp.send === false;
const hot = isHot({ rule_id: inp.rule_id, escalate: inp.escalate });

const payload = {
  rule_id:      inp.rule_id || '',
  matched:      inp.matched_phrase || '',
  intent:       inp.intent || '',
  channel:      inp.channel,
  handle:       inp.contact_handle || '',
  text:         String(inp.text || '').slice(0, 500),
  reply_sent:   String(inp.reply || '').slice(0, 500),
  escalate:     inp.escalate === true,
  hot,
  held_reason:  inp.reason || '',
  guard:        inp.guard_triggered || '',
  grounded_in:  inp.grounded_in || [],
  link_code:    inp.link_code || '',
  assigned_to:  who.name || '',
  lagos_time:   who.lagos_time
};

const alert = buildAlert({
  client_id: inp.client_id, client_name: client.name,
  contact_handle: inp.contact_handle, contact_id: inp.contact_id,
  channel: inp.channel, text: inp.text, rule_id: inp.rule_id, intent: inp.intent,
  escalation_reason: inp.escalation_reason, reply: inp.reply,
  on_duty: who, alert_minutes: esc.unclaimed_alert_minutes || 15, escalate: inp.escalate
});

return [{ json: {
  ...inp,
  notify, hot,
  event_type: inp.escalate === true ? 'escalation' : 'qualified',
  assigned_sales_rep: who.name || '',
  on_duty: who,
  payload_json: JSON.stringify(payload),
  alert_subject: (hot ? '[HOT] ' : '') + 'Instagram lead — ' + (client.name || inp.client_id) + ' — @' + (inp.contact_handle || inp.contact_id || ''),
  alert_body: alert
}}];
`;

const pg = (id, name, pos, query, replacement) => ({
  parameters: { operation: 'executeQuery', query, options: { queryReplacement: replacement } },
  type: 'n8n-nodes-base.postgres', typeVersion: 2.5, position: pos, id, name,
  alwaysOutputData: true, onError: 'continueRegularOutput'
});

const UPSERT_LEAD = `INSERT INTO lead
  (client_id, channel, source_ref, provider_message_id, contact_e164, contact_hash, qualified_unit_type, assigned_sales_rep)
VALUES ($1, $2, NULLIF($3,''), NULLIF($4,''), NULLIF($5,''), $6, NULLIF($7,''), NULLIF($8,''))
ON CONFLICT (client_id, contact_hash) DO UPDATE
  SET qualified_unit_type = COALESCE(EXCLUDED.qualified_unit_type, lead.qualified_unit_type),
      assigned_sales_rep  = COALESCE(EXCLUDED.assigned_sales_rep,  lead.assigned_sales_rep)
RETURNING lead_id, first_contact_at, attribution_expires_at;`;

const INSERT_EVENT = `INSERT INTO lead_event (lead_id, event_type, payload)
VALUES ($1::uuid, $2, $3::jsonb)
RETURNING event_id, row_hash;`;

const ledger = {
  name: 'Propel Concierge — Ledger + escalation',
  nodes: [
    { parameters: { workflowInputs: { values: [
        { name: 'client_id' }, { name: 'channel' }, { name: 'provider_message_id' },
        { name: 'contact_id' }, { name: 'contact_handle' }, { name: 'contact_hash' },
        { name: 'text' }, { name: 'reply' }, { name: 'rule_id' }, { name: 'intent' },
        { name: 'link_code' }, { name: 'unit_interest' }, { name: 'escalation_reason' },
        { name: 'guard_triggered' }, { name: 'reason' },
        { name: 'escalate', type: 'boolean' }, { name: 'send', type: 'boolean' }
      ] } }, type: 'n8n-nodes-base.executeWorkflowTrigger', typeVersion: 1.1,
      position: [-260, 0], id: 'led-trigger', name: 'Called by a channel' },
    code('led-compose', 'Resolve on-duty + compose', [-40, 0], composeAlert),
    pg('led-lead', 'Record the lead', [180, 0], UPSERT_LEAD,
       "={{ [$json.client_id, $json.channel, $json.link_code, $json.provider_message_id, $json.contact_id, $json.contact_hash, $json.unit_interest, $json.assigned_sales_rep] }}"),
    pg('led-event', 'Append the event', [400, 0], INSERT_EVENT,
       "={{ [$json.lead_id, $('Resolve on-duty + compose').first().json.event_type, $('Resolve on-duty + compose').first().json.payload_json] }}"),
    { parameters: { conditions: { options: { caseSensitive: true, version: 2 }, conditions: [
        { id: 'notify', operator: { type: 'boolean', operation: 'true', singleValue: true },
          leftValue: "={{ $('Resolve on-duty + compose').first().json.notify }}", rightValue: '' } ], combinator: 'and' }, options: {} },
      type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [620, 0], id: 'led-notify', name: 'Tell a human?' },
    { parameters: {
        fromEmail: spAlerts.from,
        toEmail: spAlerts.email_to.join(','),
        ccEmail: spAlerts.email_cc.join(','),
        subject: "={{ $('Resolve on-duty + compose').first().json.alert_subject }}",
        emailFormat: 'text',
        message: "={{ $('Resolve on-duty + compose').first().json.alert_body }}",
        options: {} },
      type: 'n8n-nodes-base.emailSend', typeVersion: 2.1, position: [840, -80],
      id: 'led-email', name: 'Alert the sales team', onError: 'continueRegularOutput' },
    code('led-quiet', 'No human needed', [840, 120],
      "// Answered in full from the knowledge base. Recorded, nobody disturbed.\nreturn [{ json: { logged: true, lead_id: $json.lead_id || '', rule_id: $json.rule_id || '' } }];")
  ],
  connections: {
    'Called by a channel':        { main: [[{ node: 'Resolve on-duty + compose', type: 'main', index: 0 }]] },
    'Resolve on-duty + compose':  { main: [[{ node: 'Record the lead', type: 'main', index: 0 }]] },
    'Record the lead':            { main: [[{ node: 'Append the event', type: 'main', index: 0 }]] },
    'Append the event':           { main: [[{ node: 'Tell a human?', type: 'main', index: 0 }]] },
    'Tell a human?':              { main: [
      [{ node: 'Alert the sales team', type: 'main', index: 0 }],
      [{ node: 'No human needed', type: 'main', index: 0 }] ] }
  },
  settings: { executionOrder: 'v1' }, pinData: {}
};
W('ops/concierge/workflows/06-ledger-and-escalation.json', ledger);

console.log('built: 06-ledger-and-escalation.json');
