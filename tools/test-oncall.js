#!/usr/bin/env node
/**
 * On-call routing tests.
 *
 * The server runs UTC in Manchester and the sales team lives in Lagos. Every
 * bug in this file sends a 9pm lead to someone who finished at 8.
 */
const O = require('../ops/concierge/lib/oncall.js');

const ESC = {
  primary:    { name: 'Collins', whatsapp: '2348064834680' },
  secondary:  { name: 'Mercy',   whatsapp: '2349035508012' },
  supervisor: { name: 'Tobi',    whatsapp: '2347035461661' },
  unclaimed_alert_minutes: 15
};
const at = s => Date.parse(s);
const who = (s, o) => O.onDuty(ESC, at(s), o).name;

const cases = [
  { name: 'OC-01 weekday business hours goes to the primary',
    run: () => who('2026-09-16T13:00:00Z') === 'Collins' },

  { name: 'OC-02 weekday evening goes to evening cover',
    run: () => who('2026-09-16T20:00:00Z') === 'Mercy' &&
               O.onDuty(ESC, at('2026-09-16T20:00:00Z')).why === 'evening cover' },

  { name: 'OC-03 ★ the Lagos offset is applied, not the server clock',
    run: () => {
      // 07:30 UTC is 08:30 in Lagos — inside hours.
      // 06:30 UTC is 07:30 in Lagos — before the shift starts.
      return who('2026-09-16T07:30:00Z') === 'Collins' &&
             who('2026-09-16T06:30:00Z') === 'Mercy';
    } },

  { name: 'OC-04 ★ Friday 23:30 UTC is already Saturday in Lagos',
    run: () => {
      // The bug this catches: routing a weekend lead to the weekday rep
      // because the server still thinks it is Friday.
      const r = O.onDuty(ESC, at('2026-09-18T23:30:00Z'));
      return r.name === 'Mercy' && r.why === 'weekend cover';
    } },

  { name: 'OC-05 weekends go to cover at any hour',
    run: () => who('2026-09-19T10:00:00Z') === 'Mercy' && who('2026-09-20T15:00:00Z') === 'Mercy' },

  { name: 'OC-06 an unclaimed lead escalates to the supervisor',
    run: () => who('2026-09-16T13:00:00Z', { unclaimed: true }) === 'Tobi' },

  { name: 'OC-07 a roster with no cover still names someone',
    run: () => {
      const r = O.onDuty({ primary: { name: 'Collins' } }, at('2026-09-19T10:00:00Z'));
      return r.name === 'Collins' && /no cover configured/.test(r.why);
    } },

  { name: 'OC-08 money and visits are hot; amenities are not',
    run: () => ['SP-ESC-PAYTO','SP-INSPECT','SP-VIRTUAL','SP-ESC-REFUND','SP-INVEST','SP-DEVPLOT']
                 .every(id => O.isHot({ rule_id: id })) &&
               ['SP-AMEN','SP-LOC','SP-AVAIL','SP-INFO'].every(id => !O.isHot({ rule_id: id })) },

  { name: 'OC-09 ★ an escalation the keyword table never saw is treated as hot',
    run: () => O.isHot({ escalate: true }) === true && O.isHot({ escalate: false }) === false },

  { name: 'OC-10 the alert says who, what, and how long they have',
    run: () => {
      const a = O.buildAlert({
        client_name: 'Shalom Park Estate', contact_handle: 'tunde_abj',
        channel: 'instagram_dm', text: 'I want to pay, send account number',
        rule_id: 'SP-ESC-PAYTO', intent: 'Account details / ready to pay',
        escalation_reason: 'keyword rule SP-ESC-PAYTO',
        on_duty: O.onDuty(ESC, at('2026-09-16T13:00:00Z')), alert_minutes: 15, escalate: true
      });
      return /🔴 HOT/.test(a) && /@tunde_abj/.test(a) && /Collins/.test(a) &&
             /within 15 minutes/.test(a) && /SP-ESC-PAYTO/.test(a);
    } },

  { name: 'OC-11 a long buyer message is truncated, not dumped whole',
    run: () => {
      const a = O.buildAlert({ text: 'x'.repeat(900), on_duty: {}, contact_handle: 'a' });
      return a.length < 900;
    } },

  { name: 'OC-12 routing is pure — same instant, same answer',
    run: () => {
      const t = at('2026-09-17T09:00:00Z');
      return O.onDuty(ESC, t).name === O.onDuty(ESC, t).name &&
             O.onDuty(ESC, t).lagos_time === O.onDuty(ESC, t).lagos_time;
    } }
];

let pass = 0, fail = 0;
for (const c of cases) {
  let ok = false, err = '';
  try { ok = c.run() === true; } catch (e) { err = ' — ' + e.message; }
  if (ok) { pass++; console.log('  ✓ ' + c.name); }
  else    { fail++; console.log('  ✗ ' + c.name + err); }
}
console.log(`\n${pass}/${cases.length} on-call tests passed`);
process.exit(fail ? 1 : 0);
