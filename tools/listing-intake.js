#!/usr/bin/env node
/**
 * Propel Ops — listing facts-sheet validator (rule 2, mechanically enforced)
 * Gate: NOTHING enters a content pack, Concierge KB, or ad campaign unless its
 * facts sheet passes this validator. Truth-in-marketing as code.
 *
 * Usage:  node tools/listing-intake.js path/to/listing.json
 * Exit 0 = cleared for production · Exit 1 = blocked with [VERIFY] flags
 */
const fs = require('fs');

const REQUIRED = [
  ['property_name', v => !!v, 'property name'],
  ['location', v => !!v, 'location'],
  ['price_ngn', v => Number.isFinite(v) && v > 0, 'numeric price in ₦'],
  ['title_status', v => !!v, 'title status (e.g., C of O, Governor\'s Consent, Deed + Consent pending)'],
  ['title_docs_sighted', v => v === true, 'title documents SIGHTED by us (true required)'],
  ['client_warranty_received', v => v === true, 'client\'s WRITTEN facts warranty on file (true required)'],
  ['availability_count', v => Number.isInteger(v) && v >= 0, 'verified availability count'],
];
const RISK_PATTERNS = [
  [/guarantee|assured return|roi/i, 'ROI/guarantee language — we never promise returns'],
  [/last (unit|chance)|only today|almost sold out/i, 'scarcity claim — verify against availability_count or cut'],
  [/free from (all )?(dispute|omonile)/i, 'absolute legal claim — we market, we don\'t certify; rephrase to documentation facts'],
];

const file = process.argv[2];
if (!file) { console.error('Usage: node tools/listing-intake.js <listing.json>'); process.exit(2); }
const L = JSON.parse(fs.readFileSync(file, 'utf8'));

const flags = [];
for (const [key, ok, desc] of REQUIRED)
  if (!ok(L[key])) flags.push(`[VERIFY] Missing/invalid: ${key} — need ${desc}`);

const marketingText = JSON.stringify(L.marketing_notes || '') + JSON.stringify(L.description || '');
for (const [re, msg] of RISK_PATTERNS)
  if (re.test(marketingText)) flags.push(`[COMPLIANCE] ${msg}`);

console.log(`Listing intake — ${L.property_name || file}`);
if (flags.length) {
  console.log(`\n❌ BLOCKED — ${flags.length} flag(s). Unverified = not published (CLAUDE.md rule 2).\n`);
  flags.forEach(f => console.log('  · ' + f));
  process.exit(1);
}
console.log('\n✅ CLEARED for production: facts complete, docs sighted, warranty on file, no risky claims.');
console.log(`   → Ready for prompt-library P1 (Listing Turbo) and Concierge KB entry.`);
