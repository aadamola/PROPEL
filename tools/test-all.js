#!/usr/bin/env node
/** Every suite, one command. Run before any deploy. */
const { execFileSync } = require('child_process');
const path = require('path');
const suites = [
  ['Normaliser (channels)', 'tools/test-normalizer.js'],
  ['Core (routing, dedup, envelope)', 'tools/test-core.js'],
  ['Guardrails (model output)', 'tools/test-guardrails.js'],
  ['Concierge baseline (sandbox)', 'sandbox/apex-gardens/concierge-prototype.js', '--test']
];
let failed = 0;
for (const [name, file, ...args] of suites) {
  process.stdout.write(`\n=== ${name} ===\n`);
  try { process.stdout.write(execFileSync('node', [path.join(__dirname, '..', file), ...args], { encoding: 'utf8' })); }
  catch (e) { process.stdout.write(e.stdout || ''); process.stdout.write(e.stderr || ''); failed++; }
}
console.log(failed ? `\n✖ ${failed} suite(s) failed` : '\n✅ all suites passed');
process.exit(failed ? 1 : 0);
