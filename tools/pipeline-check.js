#!/usr/bin/env node
/**
 * Propel Ops — pipeline follow-up checker (standing cadence #1, automated)
 * Reads ops/crm/pipeline.csv and reports overdue / due-today / upcoming
 * next-actions. Run at the start of any working session:  node tools/pipeline-check.js
 * Exit code 1 if anything is overdue — so it can gate other automations.
 */
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'ops', 'crm', 'pipeline.csv');
const rows = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
const header = rows[0].split(',');
const col = name => header.indexOf(name);

const today = new Date().toISOString().slice(0, 10);
let overdue = 0, dueToday = 0, upcoming = 0;

console.log(`Pipeline check — ${today}\n`);
for (const line of rows.slice(1)) {
  if (!line.trim() || line.trim() === ',,,,,,,,,,,') continue;
  // naive CSV split is fine while we keep commas out of fields; revisit if that changes
  const f = line.split(',');
  const name = f[col('name')], stage = f[col('stage')], date = f[col('next_action_date')], action = f[col('next_action')];
  if (!name || !date) continue;
  if (date < today) { overdue++; console.log(`  🔴 OVERDUE (${date})  ${name} [${stage}]\n     → ${action}`); }
  else if (date === today) { dueToday++; console.log(`  🟡 DUE TODAY  ${name} [${stage}]\n     → ${action}`); }
  else { upcoming++; console.log(`  🟢 ${date}  ${name} [${stage}]`); }
}
console.log(`\n${overdue} overdue · ${dueToday} due today · ${upcoming} upcoming`);
if (overdue > 0) { console.log('Rule: prospect touches same day — clear the reds first.'); process.exit(1); }
