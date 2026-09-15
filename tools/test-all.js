#!/usr/bin/env node
/** Every suite, one command. Run before any deploy. */
const { execFileSync } = require('child_process');
const path = require('path');
const suites = [
  ['Normaliser (channels)', 'tools/test-normalizer.js'],
  ['Core (routing, dedup, envelope)', 'tools/test-core.js'],
  ['Guardrails (model output)', 'tools/test-guardrails.js'],
  ['Keyword fast lane (rules + safety class)', 'tools/test-keywords.js'],
  ['Instagram workflow (end-to-end)', 'tools/test-ig-workflow.js'],
  ['On-call routing (who gets the lead)', 'tools/test-oncall.js'],
  ['Workflow import preflight', 'tools/preflight-workflows.js'],
  ['Attribution ledger (real PostgreSQL)', 'tools/test-ledger-sql.sh'],
  ['Concierge baseline (sandbox)', 'sandbox/apex-gardens/concierge-prototype.js', '--test']
];
let failed = 0;
for (const [name, file, ...args] of suites) {
  process.stdout.write(`\n=== ${name} ===\n`);
  const runner = file.endsWith('.sh') ? 'bash' : 'node';
  try { process.stdout.write(execFileSync(runner, [path.join(__dirname, '..', file), ...args], { encoding: 'utf8' })); }
  catch (e) { process.stdout.write(e.stdout || ''); process.stdout.write(e.stderr || ''); failed++; }
}
console.log(failed ? `\n✖ ${failed} suite(s) failed` : '\n✅ all suites passed');
process.exit(failed ? 1 : 0);
