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
const env = $input.first().json;
if (env.fatal || env.duplicate) return [{ json: env }];

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

return [{ json: { ...env, system: SYSTEM + '\\n\\n' + CHANNEL_HINT, user_message: env.text } }];
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
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent',
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
    { parameters: { workflowId: { __rl: true, value: 'REPLACE_WITH_CORE_WORKFLOW_ID', mode: 'id' },
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
