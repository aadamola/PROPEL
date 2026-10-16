#!/usr/bin/env node
/**
 * Jev bake-off: does a typed-decision model catch the buyer messages our
 * keyword lane misses, without ever routing a safety question to a sales card?
 *
 * Three lanes, scored on the same labelled messages:
 *   keyword  today's fast lane (ops/concierge/lib/keywords.js), unchanged
 *   jev      TypeSafe Jev alone, one Choice question over the rule table
 *   hybrid   what ships (ops/concierge/lib/router.js): keyword first, Jev as a second opinion
 *
 * The hybrid rule that matters most: Jev may UPGRADE a message to an
 * escalation, never DOWNGRADE one. A keyword escalate_only hit is final.
 * "What's the ROI on the 4 bedroom" can never come back as a price card,
 * whatever any model says.
 *
 * Fictional data only. Both input files must carry _meta.fictional = true or
 * the live run refuses to start: buyer DMs are personal data under the NDPA,
 * and Jev has not been vetted as a processor (docs/13 §3).
 *
 *   node bakeoff.js                     keyword baseline, no network, no key
 *   node bakeoff.js --jev               live run (needs TYPESAFE_API_KEY)
 *   node bakeoff.js --replay <file>     rescore a saved live run, no cost
 *   node bakeoff.js --replay <file> --sweep   try confidence thresholds
 *
 * Options: --threshold 0.7  --esc-threshold 0.5  --override-threshold 0.8  --model jev-latest
 * The API key is read from the environment and never printed or saved.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const kw = require('../../../ops/concierge/lib/keywords.js');
const router = require('../../../ops/concierge/lib/router.js');

const HERE = __dirname;
const RULES_FILE = path.join(HERE, 'rules.json');
const MESSAGES_FILE = path.join(HERE, 'messages.json');
const RESULTS_DIR = path.join(HERE, 'results');

const DEFAULTS = {
  baseURL: 'https://api.typesafe.ai',   // TypeSafe's own endpoint (typesafe-sdk-js DEFAULT_BASE_URL)
  model: 'jev-latest',
  threshold: 0.7,                        // a commercial card needs this much confidence
  escThreshold: 0.5,                     // an escalation needs less: over-alerting costs a call, under-alerting costs a lead
  overrideThreshold: 0.8,                // replacing a GENERIC keyword card (priority >= genericPriority)
  genericPriority: 30,
  timeoutMs: 15000
};

const NONE = 'NONE';

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

function loadJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function assertFictional(doc, file) {
  if (!doc || !doc._meta || doc._meta.fictional !== true) {
    throw new Error(`${path.basename(file)} is not marked _meta.fictional = true. ` +
      'The bake-off only sends invented data to an unvetted provider.');
  }
}

function loadRules(file = RULES_FILE) {
  const doc = loadJson(file);
  assertFictional(doc, file);
  return doc.rules;
}

function loadMessages(file = MESSAGES_FILE) {
  const doc = loadJson(file);
  assertFictional(doc, file);
  return doc.messages;
}

function indexRules(rules) {
  const byId = new Map();
  for (const r of rules) byId.set(r.rule_id, r);
  return byId;
}

const isEscalation = (byId, id) => !!(byId.get(id) && byId.get(id).class === 'escalate_only');

// ---------------------------------------------------------------------------
// The Jev question -- shared with the n8n workflow (ops/concierge/lib/router.js)
// ---------------------------------------------------------------------------

const buildQuestion = router.buildQuestion;
const parseAnswer = router.parseAnswer;
const buildRequest = (rules, text, model = DEFAULTS.model) => router.buildRequest(rules, text, model);

// ---------------------------------------------------------------------------
// Lanes
// ---------------------------------------------------------------------------

function keywordLane(compiled, text) {
  const m = kw.match(compiled, text, { now: Date.parse('2026-10-15T12:00:00Z') });
  return m.matched ? m.rule_id : NONE;
}

/** Jev alone. Unknown labels and low confidence fall to the brain. */
function jevLane(answer, byId, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  if (!answer || !byId.has(answer.choice)) return NONE;
  const need = isEscalation(byId, answer.choice) ? o.escThreshold : o.threshold;
  return answer.confidence >= need ? answer.choice : NONE;
}

/** What ships: the exact policy in ops/concierge/lib/router.js. */
function hybridLane(kwPick, answer, byId, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  return router.decide(kwPick, answer, byId, {
    threshold: o.threshold, esc_threshold: o.escThreshold,
    override_threshold: o.overrideThreshold, generic_priority: o.genericPriority
  });
}

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------

/**
 * correct         pick is one of the acceptable answers
 * unsafe          a safety question got a sales card (the one hard fail)
 * wrong           a sales question got the wrong sales card
 * over_escalated  a human gets paged for something a card could answer
 * brain           no card; the brain answers (safe, slower, generated words)
 */
function grade(pick, msg, byId) {
  const expect = msg.expect || [];
  if (expect.includes(pick)) return 'correct';
  const wantsEscalation = expect.some(id => isEscalation(byId, id));
  if (pick === NONE) return 'brain';
  if (wantsEscalation && !isEscalation(byId, pick)) return 'unsafe';
  if (isEscalation(byId, pick)) return 'over_escalated';
  return 'wrong';
}

const OUTCOMES = ['correct', 'brain', 'wrong', 'over_escalated', 'unsafe'];

function tally(rows, lane) {
  const t = Object.fromEntries(OUTCOMES.map(k => [k, 0]));
  for (const r of rows) t[r[lane].grade]++;
  return t;
}

/** Score every message on every lane. `answers` maps message id -> parsed answer (or null). */
function evaluate(rules, messages, answers, opts = {}) {
  const byId = indexRules(rules);
  const compiled = kw.compile(rules);
  const rows = messages.map(msg => {
    const k = keywordLane(compiled, msg.text);
    const a = answers ? answers[msg.id] || null : null;
    const j = jevLane(a, byId, opts);
    const h = hybridLane(k, a, byId, opts);
    return {
      id: msg.id, kind: msg.kind, text: msg.text, expect: msg.expect,
      keyword: { pick: k, grade: grade(k, msg, byId) },
      jev: { pick: j, grade: grade(j, msg, byId), confidence: a ? a.confidence : null, raw: a ? a.choice : null },
      hybrid: { pick: h.pick, source: h.source, grade: grade(h.pick, msg, byId) }
    };
  });
  const summary = { keyword: tally(rows, 'keyword') };
  if (answers) { summary.jev = tally(rows, 'jev'); summary.hybrid = tally(rows, 'hybrid'); }
  return { rows, summary };
}

/**
 * The bar Jev has to clear before we spend any effort vetting TypeSafe:
 *   - zero unsafe routes in the hybrid lane
 *   - no more wrong cards than the keyword lane already gives
 *   - recovers at least half of the keyword lane's misses
 */
function verdict(result) {
  const { rows, summary } = result;
  if (!summary.hybrid) return null;
  const misses = rows.filter(r => r.keyword.grade === 'brain' && !r.expect.includes(NONE));
  const recovered = misses.filter(r => r.hybrid.grade === 'correct').length;
  const checks = [
    { name: 'no unsafe routes', ok: summary.hybrid.unsafe === 0, detail: `${summary.hybrid.unsafe} unsafe` },
    { name: 'no extra wrong cards', ok: summary.hybrid.wrong <= summary.keyword.wrong,
      detail: `${summary.hybrid.wrong} vs keyword ${summary.keyword.wrong}` },
    { name: 'recovers at least half the misses', ok: misses.length === 0 || recovered * 2 >= misses.length,
      detail: `${recovered} of ${misses.length}` }
  ];
  return { pass: checks.every(c => c.ok), checks, recovered, misses: misses.length };
}

// ---------------------------------------------------------------------------
// Live calls
// ---------------------------------------------------------------------------

async function callJev(request, { apiKey, baseURL = DEFAULTS.baseURL, timeoutMs = DEFAULTS.timeoutMs, fetchImpl = fetch } = {}) {
  const url = `${baseURL.replace(/\/+$/, '')}/v1/systemone`;
  let lastErr = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const started = Date.now();
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(timeoutMs)
      });
      const ms = Date.now() - started;
      const body = await res.json().catch(() => null);
      if (res.ok) return { ok: true, ms, body };
      // Status only: an error body can echo the request, never print it.
      lastErr = `HTTP ${res.status}`;
      if (res.status === 401) return { ok: false, ms, error: 'HTTP 401: the API key was refused' };
      if (res.status === 402) return { ok: false, ms, error: 'HTTP 402: the account has no credits' };
      if (res.status !== 429 && res.status < 500) return { ok: false, ms, error: lastErr };
    } catch (e) {
      lastErr = e.name === 'TimeoutError' ? `timed out after ${timeoutMs}ms` : (e.cause && e.cause.code) || e.message;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return { ok: false, ms: null, error: lastErr };
}

async function liveRun(rules, messages, opts) {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) throw new Error('TYPESAFE_API_KEY is not set.');
  const answers = {};
  const calls = [];
  for (const msg of messages) {
    const r = await callJev(buildRequest(rules, msg.text, opts.model), { apiKey, baseURL: opts.baseURL });
    if (!r.ok && /401|402/.test(r.error)) throw new Error(r.error);
    answers[msg.id] = r.ok ? parseAnswer(r.body) : null;
    calls.push({
      id: msg.id, ok: r.ok, ms: r.ms, error: r.error || '',
      model: r.body && (r.body.model || (r.body.data && r.body.data.result && r.body.data.result.model)) || '',
      usage: r.body && (r.body.usage || (r.body.data && r.body.data.result && r.body.data.result.usage)) || null
    });
    process.stderr.write(r.ok ? '.' : 'x');
  }
  process.stderr.write('\n');
  return { answers, calls };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function pct(n, d) { return d ? `${Math.round((n / d) * 100)}%` : '-'; }

function report(result, meta = {}) {
  const { rows, summary } = result;
  const lanes = Object.keys(summary);
  const n = rows.length;
  const out = [];
  out.push(`Apex Gardens (DEMO) · ${n} labelled messages${meta.model ? ` · model ${meta.model}` : ''}`);
  if (meta.threshold != null) out.push(`thresholds: sales card ≥ ${meta.threshold}, escalation ≥ ${meta.escThreshold}`);
  out.push('');
  out.push('outcome          ' + lanes.map(l => l.padStart(10)).join(''));
  for (const k of OUTCOMES) {
    out.push(k.padEnd(17) + lanes.map(l => `${summary[l][k]} ${pct(summary[l][k], n)}`.padStart(10)).join(''));
  }

  const kinds = [...new Set(rows.map(r => r.kind))];
  out.push('');
  out.push('correct by kind  ' + lanes.map(l => l.padStart(10)).join(''));
  for (const kind of kinds) {
    const sub = rows.filter(r => r.kind === kind);
    out.push(`${kind} (${sub.length})`.padEnd(17) +
      lanes.map(l => `${sub.filter(r => r[l].grade === 'correct').length}`.padStart(10)).join(''));
  }

  const last = lanes[lanes.length - 1];
  const bad = rows.filter(r => r[last].grade !== 'correct');
  if (bad.length) {
    out.push('');
    out.push(`not correct in the ${last} lane:`);
    for (const r of bad) {
      const extra = r.jev && r.jev.raw ? `  (jev said ${r.jev.raw} @ ${r.jev.confidence.toFixed(2)})` : '';
      out.push(`  ${r.id} ${r[last].grade.padEnd(14)} got ${r[last].pick.padEnd(16)} want ${r.expect.join('|')}  "${r.text}"${extra}`);
    }
  }

  const v = verdict(result);
  if (v) {
    out.push('');
    for (const c of v.checks) out.push(`${c.ok ? '✅' : '✖'} ${c.name}: ${c.detail}`);
    out.push(v.pass
      ? '✅ Jev clears the bar. Real buyer messages still need the controller\'s approval and a privacy-page line first.'
      : '✖ Jev does not clear the bar on this run. The keyword lane stays as it is.');
  }
  return out.join('\n');
}

function latencyLine(calls) {
  const ms = calls.filter(c => c.ok && c.ms != null).map(c => c.ms).sort((a, b) => a - b);
  if (!ms.length) return 'no successful calls';
  const at = q => ms[Math.min(ms.length - 1, Math.floor(q * ms.length))];
  const failed = calls.filter(c => !c.ok).length;
  const tokens = calls.reduce((s, c) => s + ((c.usage && c.usage.input_tokens) || 0), 0);
  return `latency p50 ${at(0.5)}ms · p95 ${at(0.95)}ms · ${failed} failed calls · ${tokens} input tokens`;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const o = { ...DEFAULTS, baseURL: process.env.TYPESAFE_BASE_URL || DEFAULTS.baseURL };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--jev') o.live = true;
    else if (a === '--sweep') o.sweep = true;
    else if (a === '--replay') o.replay = argv[++i];
    else if (a === '--threshold') o.threshold = Number(argv[++i]);
    else if (a === '--esc-threshold') o.escThreshold = Number(argv[++i]);
    else if (a === '--override-threshold') o.overrideThreshold = Number(argv[++i]);
    else if (a === '--model') o.model = argv[++i];
    else throw new Error(`unknown option ${a}`);
  }
  return o;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const rules = loadRules();
  const messages = loadMessages();

  if (!opts.live && !opts.replay) {
    console.log(report(evaluate(rules, messages, null, opts)));
    console.log('\nKeyword baseline only. Live run: TYPESAFE_API_KEY=… node bakeoff.js --jev');
    return;
  }

  let saved;
  if (opts.replay) {
    saved = loadJson(opts.replay);
  } else {
    const run = await liveRun(rules, messages, opts);
    saved = { _meta: { fictional: true, at: new Date().toISOString(), model: opts.model, baseURL: opts.baseURL },
              answers: run.answers, calls: run.calls };
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
    const file = path.join(RESULTS_DIR, `jev-${saved._meta.at.replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
    console.log(`saved ${path.relative(process.cwd(), file)} (answers only, no key)`);
  }

  if (opts.sweep) {
    console.log('threshold  hybrid correct  wrong  unsafe  over_esc  brain');
    for (const t of [0.5, 0.6, 0.7, 0.8, 0.9]) {
      const s = evaluate(rules, messages, saved.answers, { ...opts, threshold: t }).summary.hybrid;
      console.log(`${String(t).padEnd(11)}${String(s.correct).padStart(14)}${String(s.wrong).padStart(7)}` +
        `${String(s.unsafe).padStart(8)}${String(s.over_escalated).padStart(10)}${String(s.brain).padStart(7)}`);
    }
    return;
  }

  const result = evaluate(rules, messages, saved.answers, opts);
  console.log(report(result, { model: saved._meta && saved._meta.model, threshold: opts.threshold, escThreshold: opts.escThreshold }));
  if (saved.calls) console.log(latencyLine(saved.calls));
}

if (require.main === module) {
  main().catch(e => { console.error(`✖ ${e.message}`); process.exit(1); });
}

module.exports = {
  NONE, DEFAULTS, loadRules, loadMessages, assertFictional, indexRules,
  buildQuestion, buildRequest, parseAnswer, keywordLane, jevLane, hybridLane,
  grade, evaluate, verdict, callJev, report
};
