/**
 * Who gets the lead, and how loudly.
 *
 * Every escalating rule in the keyword table assumes a human picks it up.
 * Until this existed, "escalate: true" meant a flag on an object and nothing
 * else -- the buyer was told someone would come back to them and nobody was
 * told to. This is the piece that makes that promise true.
 *
 * Lagos is UTC+1 year-round (no daylight saving), so the roster is computed
 * from a fixed offset rather than the server's clock, which runs UTC in
 * Manchester.
 */
'use strict';

const LAGOS_OFFSET_MINUTES = 60;

/** Day-of-week and hour in Lagos, from any UTC instant. */
function lagosTime(nowMs) {
  const d = new Date(nowMs + LAGOS_OFFSET_MINUTES * 60 * 1000);
  return { dow: d.getUTCDay(), hour: d.getUTCHours(), minute: d.getUTCMinutes(),
           iso: d.toISOString().replace('T', ' ').slice(0, 16) + ' WAT' };
}

/**
 * Rules come from the client's own signed roster, not from us:
 *   primary   Mon-Fri 08:00-20:00
 *   secondary weekends and evening cover
 *   supervisor overrides -- used when a lead has gone unclaimed
 */
function onDuty(escalation, nowMs, opts) {
  const o = opts || {};
  const esc = escalation || {};
  const t = lagosTime(nowMs == null ? Date.now() : nowMs);
  const weekend = t.dow === 0 || t.dow === 6;
  const inHours = t.hour >= 8 && t.hour < 20;

  if (o.unclaimed && esc.supervisor) {
    return { ...esc.supervisor, role: 'supervisor', why: 'lead unclaimed past the alert window', lagos_time: t.iso };
  }
  if (!weekend && inHours && esc.primary) {
    return { ...esc.primary, role: 'primary', why: 'weekday business hours', lagos_time: t.iso };
  }
  if (esc.secondary) {
    return { ...esc.secondary, role: 'secondary', why: weekend ? 'weekend cover' : 'evening cover', lagos_time: t.iso };
  }
  return { ...(esc.primary || {}), role: 'primary', why: 'no cover configured — falling back to primary', lagos_time: t.iso };
}

/**
 * Hot means the buyer has signalled money or a visit. It is the difference
 * between "someone should see this today" and "someone must see this now",
 * and it is what justifies paying for an SMS rather than sending an email.
 */
const HOT_RULES = new Set([
  'SP-ESC-PAYTO',   // ready to pay
  'SP-INSPECT',     // wants to come and see it
  'SP-VIRTUAL',     // diaspora, wants a call booked
  'SP-ESC-REFUND',  // trust moment -- a slow reply here costs the deal
  'SP-ESC-LEGAL',   // trust moment
  'SP-INVEST',      // sizing a position
  'SP-DEVPLOT'      // bulk buyer
]);

function isHot(o) {
  const x = o || {};
  if (x.rule_id && HOT_RULES.has(x.rule_id)) return true;
  // The brain escalated something the keyword table never saw. Treat an
  // unknown escalation as hot: the cost of over-alerting is an SMS, the cost
  // of under-alerting is a buyer who waited.
  return x.escalate === true && !x.rule_id;
}

/** The message a human actually reads on their phone. */
function buildAlert(o) {
  const x = o || {};
  const who = x.on_duty || {};
  const lines = [
    `${isHot(x) ? '🔴 HOT' : '🟡'} Instagram lead — ${x.client_name || x.client_id || 'client'}`,
    '',
    `From:      @${x.contact_handle || x.contact_id || 'unknown'}`,
    `Channel:   ${x.channel === 'instagram_comment' ? 'comment on a post' : 'direct message'}`,
    `They said: ${(x.text || '').slice(0, 200)}`,
    `Matched:   ${x.rule_id || 'no keyword — the assistant handled it'}${x.intent ? ' (' + x.intent + ')' : ''}`,
    `Reason:    ${x.escalation_reason || 'needs a human'}`,
    ''
  ];
  if (x.reply) lines.push('The assistant already sent them:', '"' + String(x.reply).split('\n')[0] + '"', '');
  lines.push(`Assigned:  ${who.name || 'unassigned'} (${who.role || '-'}, ${who.why || '-'})`,
             `Reply within ${x.alert_minutes || 15} minutes.`,
             '',
             `Open the Instagram inbox and search @${x.contact_handle || ''}`);
  return lines.join('\n');
}

module.exports = { lagosTime, onDuty, isHot, buildAlert, HOT_RULES, LAGOS_OFFSET_MINUTES };
