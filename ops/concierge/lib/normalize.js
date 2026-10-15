/**
 * Channel normaliser — the single source of truth.
 *
 * Every inbound channel collapses to ONE envelope shape so the brain,
 * the ledger and the dispatcher never learn what a channel is. Adding a
 * channel means adding a case here; it means changing nothing downstream.
 *
 * This file is unit-tested (tools/test-normalizer.js) and its source is
 * embedded verbatim into the workflow JSON at build time, so what ships
 * is exactly what was tested.
 */
'use strict';

const crypto = require('crypto');

const sha256 = s => crypto.createHash('sha256').update(String(s)).digest('hex');

/** Envelope: the only shape anything downstream ever sees. */
function envelope(o) {
  return {
    client_id:           o.client_id || '',
    channel:             o.channel,            // whatsapp | instagram_dm | instagram_comment | email
    provider_message_id: o.provider_message_id || '',
    contact_id:          o.contact_id || '',   // channel-native id, used for replying
    contact_e164:        o.contact_e164 || '',
    contact_email:       o.contact_email || '',
    contact_handle:      o.contact_handle || '',
    contact_hash:        o.contact_hash || sha256(o.contact_id || o.contact_e164 || o.contact_email || ''),
    display_name:        o.display_name || '',
    text:                (o.text || '').trim(),
    media_type:          o.media_type || 'text',
    occurred_at:         o.occurred_at || new Date().toISOString(),
    thread_ref:          o.thread_ref || '',   // what a reply must quote (IG comment id, email Message-ID)
    subject:             o.subject || '',
    is_actionable:       o.is_actionable !== false,
    skip_reason:         o.skip_reason || ''
  };
}

const skip = (channel, reason) => envelope({ channel, is_actionable: false, skip_reason: reason });

/** WhatsApp Cloud API webhook body. */
function fromWhatsApp(body, client_id) {
  const value = body?.entry?.[0]?.changes?.[0]?.value;
  if (value?.statuses) return skip('whatsapp', 'status_callback');
  const m = value?.messages?.[0];
  if (!m) return skip('whatsapp', 'no_message');

  const contact = value?.contacts?.[0];
  const type = m.type || 'text';
  let text = '';
  if (type === 'text')                      text = m.text?.body || '';
  else if (type === 'button')               text = m.button?.text || '';
  else if (type === 'interactive')          text = m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || '';
  else if (['image','video','document'].includes(type)) text = m[type]?.caption || '';

  return envelope({
    client_id, channel: 'whatsapp',
    provider_message_id: m.id,
    contact_id: m.from, contact_e164: m.from,
    display_name: contact?.profile?.name || '',
    text, media_type: type,
    occurred_at: m.timestamp ? new Date(Number(m.timestamp) * 1000).toISOString() : new Date().toISOString()
  });
}

/** Instagram messaging + comment webhooks. */
function fromInstagram(body, client_id) {
  const entry = body?.entry?.[0];

  // Comment on a post/reel
  const change = entry?.changes?.[0];
  if (change?.field === 'comments') {
    const v = change.value || {};
    // Never reply to the business replying to itself.
    if (v.from?.id && entry?.id && v.from.id === entry.id) return skip('instagram_comment', 'own_comment');
    return envelope({
      client_id, channel: 'instagram_comment',
      provider_message_id: v.id,
      contact_id: v.from?.id, contact_handle: v.from?.username || '',
      display_name: v.from?.username || '',
      text: v.text || '',
      thread_ref: v.id,          // one private reply is allowed against this comment id
      occurred_at: new Date().toISOString()
    });
  }

  // Direct message
  const msg = entry?.messaging?.[0];
  if (msg) {
    if (msg.message?.is_echo) return skip('instagram_dm', 'echo');
    if (msg.read || msg.delivery) return skip('instagram_dm', 'read_or_delivery_receipt');
    return envelope({
      client_id, channel: 'instagram_dm',
      provider_message_id: msg.message?.mid,
      contact_id: msg.sender?.id,
      text: msg.message?.text || '',
      media_type: msg.message?.attachments?.[0]?.type || 'text',
      occurred_at: msg.timestamp ? new Date(Number(msg.timestamp)).toISOString() : new Date().toISOString()
    });
  }
  return skip('instagram_dm', 'unrecognised_payload');
}

/** IMAP Email Trigger output. */
function fromEmail(mail, client_id) {
  const from = mail?.from?.value?.[0] || {};
  const address = (from.address || mail?.from?.text || '').toLowerCase();

  // Never answer machines. An auto-reply loop between two robots is
  // the classic way an email bot embarrasses a client.
  const headers = mail?.headers || {};
  const h = k => String(headers[k] ?? headers[k?.toLowerCase()] ?? '');
  if (h('auto-submitted') && !/^no$/i.test(h('auto-submitted'))) return skip('email', 'auto_submitted');
  if (h('x-autoreply') || h('x-autorespond') || h('precedence').match(/bulk|junk|list/i)) return skip('email', 'auto_responder');
  if (h('list-unsubscribe')) return skip('email', 'bulk_mail');
  if (/^(mailer-daemon|postmaster|no-?reply|do-?not-?reply|bounce)/i.test(address)) return skip('email', 'noreply_sender');

  const subject = mail?.subject || '';
  if (/^(out of office|automatic reply|auto:|undeliverable)/i.test(subject)) return skip('email', 'out_of_office');

  // Strip quoted history so the model reads the new message, not the whole thread.
  const raw = mail?.textPlain || mail?.text || '';
  const text = String(raw)
    .split(/^\s*(On .+ wrote:|-{2,}\s*Original Message|_{5,}|From:\s)/m)[0]
    .split(/\n>{1,}/)[0]
    .trim();

  return envelope({
    client_id, channel: 'email',
    provider_message_id: mail?.messageId || '',
    contact_id: address, contact_email: address,
    display_name: from.name || '',
    text, subject,
    thread_ref: mail?.messageId || '',
    occurred_at: mail?.date ? new Date(mail.date).toISOString() : new Date().toISOString()
  });
}

function normalize(channel, payload, client_id) {
  switch (channel) {
    case 'whatsapp':  return fromWhatsApp(payload, client_id);
    case 'instagram': return fromInstagram(payload, client_id);
    case 'email':     return fromEmail(payload, client_id);
    default:          return skip(channel || 'unknown', 'unsupported_channel');
  }
}

module.exports = { normalize, fromWhatsApp, fromInstagram, fromEmail, envelope, sha256 };
