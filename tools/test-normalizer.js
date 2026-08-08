#!/usr/bin/env node
/**
 * Channel normaliser tests.
 * Covers the real payload shapes plus the traffic that must NOT be answered:
 * status callbacks, echoes, read receipts, auto-replies, bounces, own comments.
 */
const { normalize } = require('../ops/concierge/lib/normalize.js');
const C = 'shalom-park';

const cases = [
  // ---- WhatsApp ----
  { n: 'NRM-01 WhatsApp text message', run: () => normalize('whatsapp', {
      entry: [{ changes: [{ value: {
        contacts: [{ profile: { name: 'Chidi Okafor' } }],
        messages: [{ from: '2348012345678', id: 'wamid.ABC', timestamp: '1754400000', type: 'text', text: { body: 'How much is the 2 bedroom?' } }]
      }}]}]}, C),
    ok: e => e.channel==='whatsapp' && e.is_actionable && e.text==='How much is the 2 bedroom?' && e.contact_e164==='2348012345678' && e.provider_message_id==='wamid.ABC' && e.display_name==='Chidi Okafor' && e.contact_hash.length===64 },

  { n: 'NRM-02 WhatsApp status callback is NOT answered', run: () => normalize('whatsapp', {
      entry: [{ changes: [{ value: { statuses: [{ id: 'wamid.X', status: 'delivered' }] } }]}]}, C),
    ok: e => e.is_actionable===false && e.skip_reason==='status_callback' },

  { n: 'NRM-03 WhatsApp image caption is captured', run: () => normalize('whatsapp', {
      entry: [{ changes: [{ value: { messages: [{ from: '234801', id: 'wamid.IMG', type: 'image', image: { caption: 'Is this the 4 bed?' } }] } }]}]}, C),
    ok: e => e.is_actionable && e.text==='Is this the 4 bed?' && e.media_type==='image' },

  { n: 'NRM-04 WhatsApp interactive button reply', run: () => normalize('whatsapp', {
      entry: [{ changes: [{ value: { messages: [{ from: '234801', id: 'wamid.INT', type: 'interactive', interactive: { button_reply: { title: 'Book inspection' } } }] } }]}]}, C),
    ok: e => e.is_actionable && e.text==='Book inspection' },

  // ---- Instagram ----
  { n: 'NRM-05 Instagram comment becomes actionable with thread_ref', run: () => normalize('instagram', {
      entry: [{ id: 'PAGE1', changes: [{ field: 'comments', value: { id: 'comment_9', text: 'price?', from: { id: 'user_7', username: 'buyer_ng' } } }]}]}, C),
    ok: e => e.channel==='instagram_comment' && e.is_actionable && e.thread_ref==='comment_9' && e.contact_handle==='buyer_ng' },

  { n: 'NRM-06 our own comment is never replied to', run: () => normalize('instagram', {
      entry: [{ id: 'PAGE1', changes: [{ field: 'comments', value: { id: 'c1', text: 'thanks!', from: { id: 'PAGE1', username: 'shalompark' } } }]}]}, C),
    ok: e => e.is_actionable===false && e.skip_reason==='own_comment' },

  { n: 'NRM-07 Instagram DM', run: () => normalize('instagram', {
      entry: [{ messaging: [{ sender: { id: 'igsid_1' }, timestamp: 1754400000000, message: { mid: 'mid.1', text: 'Do you have plots?' } }] }]}, C),
    ok: e => e.channel==='instagram_dm' && e.is_actionable && e.text==='Do you have plots?' },

  { n: 'NRM-08 message echo is ignored (prevents talking to ourselves)', run: () => normalize('instagram', {
      entry: [{ messaging: [{ sender: { id: 'PAGE' }, message: { mid: 'mid.2', text: 'our own reply', is_echo: true } }] }]}, C),
    ok: e => e.is_actionable===false && e.skip_reason==='echo' },

  { n: 'NRM-09 read receipt is ignored', run: () => normalize('instagram', {
      entry: [{ messaging: [{ sender: { id: 'u' }, read: { watermark: 1 } }] }]}, C),
    ok: e => e.is_actionable===false && e.skip_reason==='read_or_delivery_receipt' },

  // ---- Email ----
  { n: 'NRM-10 plain email enquiry', run: () => normalize('email', {
      messageId: '<abc@mail>', subject: 'Enquiry about 2 bedroom',
      from: { value: [{ address: 'Buyer@Example.com', name: 'Ada B' }] },
      date: '2026-08-06T09:00:00Z', textPlain: 'Good morning, what is the price of the 2 bedroom?' }, C),
    ok: e => e.channel==='email' && e.is_actionable && e.contact_email==='buyer@example.com' && e.display_name==='Ada B' && e.subject.includes('2 bedroom') && e.thread_ref==='<abc@mail>' },

  { n: 'NRM-11 quoted reply history is stripped', run: () => normalize('email', {
      messageId: '<r@mail>', from: { value: [{ address: 'b@e.com' }] },
      textPlain: 'Yes please send the brochure.\n\nOn Mon, Aug 3 2026, Sales wrote:\n> Here are the details\n> Price is 95m' }, C),
    ok: e => e.text==='Yes please send the brochure.' && !e.text.includes('95m') },

  { n: 'NRM-12 out-of-office is never answered', run: () => normalize('email', {
      messageId: '<ooo@mail>', subject: 'Automatic reply: Out of office',
      from: { value: [{ address: 'someone@corp.com' }] }, textPlain: 'I am away until Monday.' }, C),
    ok: e => e.is_actionable===false && e.skip_reason==='out_of_office' },

  { n: 'NRM-13 auto-submitted header stops a robot loop', run: () => normalize('email', {
      messageId: '<a@mail>', headers: { 'auto-submitted': 'auto-replied' },
      from: { value: [{ address: 'bot@corp.com' }] }, textPlain: 'ticket received' }, C),
    ok: e => e.is_actionable===false && e.skip_reason==='auto_submitted' },

  { n: 'NRM-14 bounce from mailer-daemon is ignored', run: () => normalize('email', {
      messageId: '<b@mail>', from: { value: [{ address: 'MAILER-DAEMON@mx.google.com' }] }, textPlain: 'delivery failed' }, C),
    ok: e => e.is_actionable===false && e.skip_reason==='noreply_sender' },

  { n: 'NRM-15 newsletter with List-Unsubscribe is ignored', run: () => normalize('email', {
      messageId: '<n@mail>', headers: { 'list-unsubscribe': '<mailto:x@y>' },
      from: { value: [{ address: 'news@portal.com' }] }, textPlain: 'This week in property' }, C),
    ok: e => e.is_actionable===false && e.skip_reason==='bulk_mail' },

  { n: 'NRM-16 unknown channel degrades safely', run: () => normalize('telegram', {}, C),
    ok: e => e.is_actionable===false && e.skip_reason==='unsupported_channel' },

  { n: 'NRM-17 every channel yields the same envelope keys', run: () => {
      const a = normalize('whatsapp', { entry:[{changes:[{value:{messages:[{from:'1',id:'m',type:'text',text:{body:'hi'}}]}}]}] }, C);
      const b = normalize('email', { messageId:'<x>', from:{value:[{address:'a@b.c'}]}, textPlain:'hi' }, C);
      const c = normalize('instagram', { entry:[{messaging:[{sender:{id:'s'},message:{mid:'m',text:'hi'}}]}] }, C);
      return { a: Object.keys(a).sort().join(), b: Object.keys(b).sort().join(), c: Object.keys(c).sort().join() };
    },
    ok: r => r.a===r.b && r.b===r.c }
];

let pass=0, fail=0;
for (const t of cases) {
  let ok=false, got=null, err=null;
  try { got = t.run(); ok = !!t.ok(got); } catch(e){ err=e.message; }
  if (ok) { console.log('PASS  '+t.n); pass++; }
  else { console.log('FAIL  '+t.n+(err?' — '+err:'')); if(got) console.log('        got: '+JSON.stringify(got).slice(0,200)); fail++; }
}
console.log(`\n${pass} passed, ${fail} failed — one envelope, every channel.`);
process.exit(fail?1:0);
