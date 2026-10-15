#!/usr/bin/env node
/**
 * Import preflight.
 *
 * Checks the workflow bundle BEFORE it is pasted into n8n. Every failure
 * here is one that otherwise shows up as a red execution with a message
 * that reads like a code bug, at the worst possible moment: while a client
 * is watching a screen share.
 *
 * Run: node tools/preflight-workflows.js
 */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '../ops/concierge/workflows');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const wf = {};
for (const f of files) wf[f] = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));

// n8n refuses require() of Node built-ins in Code nodes unless they are
// listed in NODE_FUNCTION_ALLOW_BUILTIN. Our unit tests run in plain Node,
// where require always works -- so this gap only showed up on the server,
// as a handshake that answered 200 to everyone. Read the allow-list from the
// override that vps-tools.sh actually writes, not from a copy of it.
const TOOLS = fs.readFileSync(path.join(__dirname, '../ops/setup/vps-tools.sh'), 'utf8');
const allowLine = TOOLS.match(/NODE_FUNCTION_ALLOW_BUILTIN:\s*"([^"]*)"/);
const ALLOWED = new Set(allowLine ? allowLine[1].split(',').map(x => x.trim()).filter(Boolean) : []);

const problems = [];
const notes = [];
const P = (file, msg) => problems.push(`${file}: ${msg}`);
const N = msg => notes.push(msg);

for (const [file, w] of Object.entries(wf)) {
  const names = new Set(w.nodes.map(n => n.name));

  for (const n of w.nodes) {
    const at = `${file} → "${n.name}"`;

    // 1. Code nodes must parse.
    if (n.parameters.jsCode) {
      try { new Function(n.parameters.jsCode); }
      catch (e) { P(file, `"${n.name}" has a syntax error: ${e.message}`); }

      // 1b. Built-in modules must be on the server's allow-list.
      for (const m of n.parameters.jsCode.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        if (!ALLOWED.has(m[1]) && !ALLOWED.has('*')) {
          P(file, `"${n.name}" requires '${m[1]}' but the n8n-env override does not allow it (NODE_FUNCTION_ALLOW_BUILTIN) -- n8n will throw before the node runs`);
        }
      }

      // 2. Every $('Node') reference must name a node that exists.
      for (const m of n.parameters.jsCode.matchAll(/\$\(\s*'([^']+)'\s*\)/g)) {
        if (!names.has(m[1])) P(file, `"${n.name}" references node "${m[1]}" which does not exist`);
      }
    }

    // 3. Expressions elsewhere in the node reference real nodes too.
    const blob = JSON.stringify(n.parameters);
    for (const m of blob.matchAll(/\$\(\\?'([^'\\]+)\\?'\)/g)) {
      if (!names.has(m[1])) P(file, `"${n.name}" expression references node "${m[1]}" which does not exist`);
    }

    // 4. Unresolved placeholders.
    if (/REPLACE_WITH_[A-Z_]+/.test(blob)) {
      const ph = blob.match(/REPLACE_WITH_[A-Z_]+/)[0];
      N(`${at} still carries ${ph} — paste the real workflow id after importing it`);
    }

    // 5. Postgres: the parameter count must match the replacement array.
    if (n.type.includes('postgres') && n.parameters.query) {
      const highest = Math.max(0, ...[...n.parameters.query.matchAll(/\$(\d+)/g)].map(m => Number(m[1])));
      const repl = String(n.parameters.options?.queryReplacement || '');
      // Count elements of the array literal, not node references — the
      // replacement may be written as a function that returns the array.
      const open = repl.indexOf('[');
      let supplied = 0;
      if (open >= 0) {
        let depth = 0, commas = 0, i = open;
        for (; i < repl.length; i++) {
          const ch = repl[i];
          if ('[({'.includes(ch)) depth++;
          else if ('])}'.includes(ch)) { depth--; if (depth === 0) break; }
          else if (ch === ',' && depth === 1) commas++;
        }
        supplied = commas + 1;
      }
      if (highest > 0 && supplied !== highest) {
        P(file, `"${n.name}" query uses $1..$${highest} but the replacement array has ${supplied} element(s)`);
      }
    }

    // 6. A silent failure on the evidence path is worse than a loud one.
    if (n.type.includes('emailSend') && n.onError === 'continueRegularOutput') {
      P(file, `"${n.name}" swallows its own errors — an alert that fails silently means a buyer was promised a human and nobody was told`);
    }
  }

  // 7. Every node must be reachable, or it is dead weight nobody maintains.
  const reached = new Set();
  for (const targets of Object.values(w.connections || {}))
    for (const out of targets.main || [])
      for (const t of out || []) reached.add(t.node);
  // A root is any node that starts a branch: it drives connections but is
  // never a target. That covers triggers whose type name says so (webhook,
  // executeWorkflowTrigger) and ones that do not (emailReadImap).
  const triggers = w.nodes
    .filter(n => (w.connections || {})[n.name] && !reached.has(n.name))
    .map(n => n.name);
  for (const n of w.nodes) {
    if (!reached.has(n.name) && !triggers.includes(n.name)) P(file, `"${n.name}" is not connected to anything`);
  }
}

// 8. Caller/callee contract: a field the caller sends that the callee never
//    declares is silently dropped, which is how a ledger row loses its rule id.
for (const [file, w] of Object.entries(wf)) {
  for (const n of w.nodes) {
    if (!n.type.includes('executeWorkflow') || n.type.includes('Trigger')) continue;
    const id = n.parameters.workflowId?.value;
    const REG = JSON.parse(fs.readFileSync(path.join(__dirname, '../ops/concierge/clients.json'), 'utf8'))._meta.n8n;
    const wants = id === REG.core_workflow_id ? /CORE/
                : (id === REG.ledger_workflow_id || /REPLACE_WITH_LEDGER/.test(id)) ? /Ledger/ : null;
    const target = wants && Object.entries(wf).find(([, t]) =>
      t.nodes.some(x => x.type.includes('executeWorkflowTrigger')) && wants.test(t.name));
    if (!target) { N(`${file} → "${n.name}" calls ${id} — target not in this bundle, check by hand`); continue; }
    const declared = new Set(target[1].nodes.find(x => x.type.includes('executeWorkflowTrigger'))
      .parameters.workflowInputs.values.map(v => v.name));
    const sent = Object.keys(n.parameters.workflowInputs?.value || {});
    const dropped = sent.filter(k => !declared.has(k));
    if (dropped.length) P(file, `"${n.name}" sends [${dropped.join(', ')}] but ${target[0]} does not declare them — they are silently dropped`);
  }
}

console.log(`Checked ${files.length} workflows: ${files.join(', ')}\n`);
if (notes.length) { console.log('Notes (expected, action required at import time):'); notes.forEach(n => console.log('  • ' + n)); console.log(''); }
if (problems.length) {
  console.log('✖ PROBLEMS:');
  problems.forEach(p => console.log('  ✗ ' + p));
  process.exit(1);
}
console.log('✅ preflight clean — safe to import');
