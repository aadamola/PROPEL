# Tools: quality rules as code

*Plain Node, zero dependencies. On the VPS they run through `ops/setup/vps-tools.sh` (Docker only, no Node on the host).*

| Tool | What it does | Run |
|---|---|---|
| `test-all.js` | **Every suite + the import preflight. Run before any deploy.** | `node tools/test-all.js` |
| `new-client.js` | Scaffolds a client: folder, empty KB, keyword table, Phase 0 log, registry row (everything off) | `node tools/new-client.js <slug> "<Name>" "<Legal name>"` |
| `build-keywords.js` | Compiles + lints each client's `keywords.csv` → rules JSON, readable view, Phase 0 saved replies | `node tools/build-keywords.js [--client=<slug>] [--check]` |
| `build-workflows.js` | Builds `03`, `04`, `05-…-<slug>` per client, `06` from the registry and libraries | `node tools/build-workflows.js` |
| `preflight-workflows.js` | Import preflight + registry checks (no active client may lack a KB, alert inbox or on-duty person) | in `test-all` |
| `test-onboarding.js` | **Client #2 rehearsal**: onboards a fictional client end to end in a throwaway copy | in `test-all` |
| `build-legal-site.js` | Builds `site-legal/` (legal pages + holding page) and checks it never drifts or sells | `node tools/build-legal-site.js [--check]` |
| `listing-intake.js` | Rule 2 gate for content: facts complete, documents sighted, written warranty, no ROI/scarcity language | `node tools/listing-intake.js <listing.json>` (`examples/listing-example.json` shows the shape) |
| `pipeline-check.js` | Standing cadence 1: flags overdue follow-ups | `node tools/pipeline-check.js` |
| `test-*.js`, `test-ledger-sql.sh` | Normaliser, CORE chains, guardrails, keywords, Instagram workflow, on-call, ledger SQL on real PostgreSQL | in `test-all` |
