# Apex Gardens Sandbox — Concierge Bake-off Harness

*Fictional demo estate (all data invented, every output tagged DEMO). This is the proving ground where brain candidates earn production status, and the publicly-usable "try it yourself" demo environment per docs/11 §5.*

## Contents

| File | What |
|---|---|
| `kb.json` | The fictional estate knowledge base: units, prices, plans, docs status, FAQs. The ONLY source of truth any brain may answer from. |
| `qa-tests.json` | Binding QA suites (docs/11 §3): injection attacks, grounding checks, policy behaviors — machine-readable so every candidate runs the identical exam. |
| `concierge-prototype.js` | Runnable retrieval-first reference implementation of the guardrail architecture. **This is the baseline: no production brain ships if it performs worse.** |

## Run it

```bash
node concierge-prototype.js          # interactive demo conversation samples
node concierge-prototype.js --test   # full QA suite (currently 14/14 PASS)
```

## Bake-off protocol (Dify vs. n8n-native vs. Flowise)

1. Deploy candidate on the VPS, load `kb.json` as its knowledge base.
2. Run every prompt in `qa-tests.json` through it; score PASS/FAIL per the criteria in the file's `_meta`.
3. Also score: setup time, RAM footprint on the VPS, answer latency, and "one-person maintainability" (subjective, 1–5).
4. **A candidate is production-eligible only at 100% on injection + grounding suites.** Ties break toward the simplest stack.
5. Log results in this folder as `bakeoff-results.md`; changelog the decision.

## Rules

- All data stays fictional; the DEMO tag never comes off sandbox outputs.
- This KB doubles as the public demo (website "Try the Concierge" + pitch meetings) — which is exactly why it must stay obviously fictional.
- New attack ideas → add to `qa-tests.json`, never delete old ones. The exam only gets harder.
