# Propel Ops: how the business runs

*ADEDAMOLA sends, signs, pays, posts and runs anything on the server or in a client's Meta account. The AI partner produces everything else: drafts, audits, demos, KBs, builds, tests, reports, the pipeline and the plan.*

## Map

```
ops/
├── onboarding/           ← START HERE for any new client
│   ├── README.md         ← the playbook: Stage A (win) → F (run), gates, commands
│   └── solutions.md      ← every problem we've hit, with its fix
├── growth/               ← how we get clients: Response Test, group owners, AEO, slideshows, first comment, founding pilot
├── templates/            ← response-audit · proposal · msa-sow-skeleton · warranted-facts-sheet · monthly-report · partnership-term-sheet (dormant)
├── prompt-library.md     ← P1 listing content · P2 Response Audit · P3 content calendar · P4 monthly report · P5 proposal · P6 objections · P7–P10 growth
├── content/              ← our own content engine (weekly rhythm) + founder interview pack
├── crm/pipeline.csv      ← every prospect touch, same day
├── concierge/            ← the product: registry (clients.json), libraries, SQL, workflows, Propel's own KB
└── setup/                ← VPS, n8n, LLM, Meta, account copy, brand assets, server tools (vps-tools.sh)
```

## Standing cadences

| When | What | Who |
|---|---|---|
| Every session start | Overdue follow-ups (`tools/pipeline-check.js`) | B |
| Monday | Response Test sends (20 min) · partner session · the week's content pack | A · B |
| Weekly | Ledger verification per live client | A runs, B reads |
| Monthly | Client monthly reports · facts reviews · P&L vs docs/07 | B drafts · A sends |
| On every promo review date | Re-confirm or revert (saved replies by hand) | A · B |

## Tasking the AI partner

Say **who** (client or prospect), **what** (deliverable), **when** (deadline) and **where it goes** (repo, Drive, email draft). Everything else comes from this repo.
