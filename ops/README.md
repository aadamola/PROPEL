# Propel Ops — AI Partner Operating Manual

*How to run the business with your AI managing partner. This directory is the operating system: templates, prompts, and trackers that turn any business task into a 1-line request.*

---

## 1. What I can execute autonomously (verified tool access)

| Capability | Tools | Example tasking |
|---|---|---|
| **Design & decks** | Canva (generate, edit, export PDF/PPTX/PNG/MP4) | "Build the client pitch deck from deck/pitch-deck.md" · "Make a rate-card one-pager" |
| **Email drafts** | Gmail (search inbox, create drafts, labels) | "Draft the founding-client outreach email to X" — drafts only; **you hit send** |
| **Documents** | Google Drive (create, read, search, share) | "Put the proposal in Drive for the 3pm pitch" |
| **Market research** | Web search + fetch | "What are Lekki off-plan developers charging per sqm right now?" · competitor teardowns |
| **Strategy & analysis** | Native | Financial modeling, pricing experiments, objection playbooks, QBR prep |
| **Content production** | Native + Canva | Listing copy, Reel scripts, content calendars, ad variants, audit teardowns (see prompt-library.md) |
| **System of record** | GitHub repo | Every plan, template, and decision memo versioned here; PR watching for reviews |
| **Scheduled follow-ups** | Cron (session-bound) | "Check the PR hourly" · standing reminders while a session is live |

## 2. What needs you (the human layer)

- **Sending** anything external: emails, DMs, WhatsApp, posting content — I draft, you send.
- **Money & legal:** payments, bank, CAC filings, signing contracts — I prepare documents and checklists.
- **Relationships:** calls, dinners, NIESV events — I prep briefs, scripts, and follow-up drafts.
- **Client raw material:** site footage, property docs, brand approvals.
- **Judgment calls flagged as such:** I'll recommend, you decide.

## 3. Standing cadences (ask me to run these anytime)

| Cadence | What I produce |
|---|---|
| Weekly pipeline review | CRM pipeline status + next actions per prospect (ops/crm/pipeline.csv) |
| Weekly client scorecards | From ops/templates/weekly-scorecard.md, once client data flows |
| Monthly P&L vs. model | Variance vs. docs/05-financial-model.md with commentary |
| Quarterly | Pricing review, stack audit, roadmap re-gate (docs/02) |

## 4. Directory map

```
ops/
├── README.md                      ← this manual
├── prompt-library.md              ← production prompts (Listing Turbo, audits, calendars)
├── crm/pipeline.csv               ← prospect pipeline tracker
├── setup/
│   ├── account-setup.md           ← go-public sprint + social-proof plan
│   └── brand-assets.md            ← asset tracker (in-house PNGs primary, site/assets/)
├── content/
│   └── content-engine.md          ← weekly rhythm + 14-day faceless launch calendar
└── templates/
    ├── proposal.md                ← one-page client proposal
    ├── marketing-audit.md         ← the audit that opens every sale
    ├── onboarding-checklist.md    ← signed → live in 5 days
    ├── weekly-scorecard.md        ← the report every client gets
    ├── msa-sow-skeleton.md        ← contract armor (lawyer review required)
    └── partnership-term-sheet.md  ← DORMANT (single-owner; see docs/08)
```

## 5. Tasking me well (30 seconds of context saves an hour)

Give me: **who** (client/prospect + segment), **what** (deliverable), **when** (deadline), **where it goes** (Drive/Canva/repo/email draft). Example: *"Prospect: Adewale & Co (surveyors, Tier A). Build their audit from the template, put the deck in Canva, draft the follow-up email. Call is Thursday."* Everything else, I'll pull from this repo or ask once.
