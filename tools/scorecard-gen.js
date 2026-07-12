#!/usr/bin/env node
/**
 * Propel Ops — weekly scorecard generator (workflow W5, automated skeleton)
 * Metrics JSON in → client-ready scorecard markdown out, with honest
 * week-over-week deltas computed, never hand-massaged.
 *
 * Usage:  node tools/scorecard-gen.js path/to/metrics.json [> out.md]
 */
const fs = require('fs');

const file = process.argv[2];
if (!file) { console.error('Usage: node tools/scorecard-gen.js <metrics.json>'); process.exit(2); }
const M = JSON.parse(fs.readFileSync(file, 'utf8'));

const delta = (now, prev) => {
  if (prev === undefined || prev === null || prev === 0) return '—';
  const d = ((now - prev) / prev) * 100;
  return `${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)}%`;
};
const row = (label, now, prev, fmt = v => v) =>
  `| ${label} | ${fmt(now)} | ${fmt(prev)} | ${delta(now, prev)} |`;
const ngn = v => (v === undefined ? '—' : '₦' + Number(v).toLocaleString('en-NG'));

const t = M.this_week, p = M.last_week;
const out = `# Weekly Scorecard — ${M.client}

**Week of ${M.week_of} · Package: ${M.package} · Goal: "${M.client_goal}"**

## The numbers that matter

| Metric | This week | Last week | Trend |
|---|---|---|---|
${row('Qualified leads (named, contactable)', t.qualified_leads, p.qualified_leads)}
${row('DM/WhatsApp conversations started', t.conversations, p.conversations)}
${row('Inspections booked', t.inspections, p.inspections)}
${row('Cost per qualified lead', t.cpl_ngn, p.cpl_ngn, ngn)}
| Content published (vs. plan) | ${t.posts_published}/${t.posts_planned} | ${p.posts_published}/${p.posts_planned} | ${t.posts_published >= t.posts_planned ? '✅ on plan' : '⚠️ under plan'} |

*Context metrics (reported, never celebrated alone): reach ${t.reach ?? '—'}, followers ${t.followers ?? '—'}.*

## What happened
${M.commentary?.what_happened ?? '[AI-partner drafts from the deltas above — honest attribution, including losses]'}

## Why
${M.commentary?.why ?? '[diagnosis, not excuses]'}

## What we're doing next week
${(M.next_actions ?? ['[specific action 1]', '[specific action 2]']).map((a, i) => `${i + 1}. ${a}`).join('\n')}

## We need from you
${M.client_needed ?? 'Nothing — we\'re set.'}

---
*Questions? Reply here on WhatsApp — or your monthly strategy call is ${M.next_call ?? '[date]'}.*
`;
console.log(out);
