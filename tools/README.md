# Propel Ops Tools — Quality Rules as Code

*Runnable systems that mechanically enforce service quality. Prose rules can be forgotten; these can't. All plain Node, zero dependencies — they run anywhere, including the future VPS.*

| Tool | Enforces | Run |
|---|---|---|
| `pipeline-check.js` | Standing cadence #1: no stale follow-ups. Exit 1 while anything is overdue. | `node tools/pipeline-check.js` |
| `listing-intake.js` | Rule 2 (truth in marketing): facts complete + title docs sighted + written warranty on file + no ROI/scarcity/legal-claim language — or the listing is **BLOCKED** from content packs, Concierge KBs, and campaigns. | `node tools/listing-intake.js <listing.json>` |
| `scorecard-gen.js` | W5 honest reporting: metrics JSON → client scorecard with machine-computed deltas (numbers can't be massaged by hand). | `node tools/scorecard-gen.js <metrics.json>` |

`examples/` has the file shapes: copy `listing-example.json` per property (its demo values deliberately FAIL validation — flip the booleans only when literally true), and `metrics-example.json` per client-week.

**Session ritual:** `node tools/pipeline-check.js` at the start of every working session; `node sandbox/apex-gardens/concierge-prototype.js --test` before anything Concierge-related ships.

**Pipeline to production:** these same scripts port into n8n nodes on the VPS (docs/06 v1.1) — the repo versions are the reference implementations and stay the source of truth for the logic.
