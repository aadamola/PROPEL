# Shalom Park — Instagram Keyword Automation

*Built 2026-09-15. 24 rules, 295 trigger phrases, 40 tests. The rule table is the client-editable surface; everything else is generated from it.*

**The sheet:** [Shalom Park — Instagram Keyword Automation](https://docs.google.com/spreadsheets/d/1iJ4KJRwfQcGlDs_n0jhVlmLZQQesDAMJ7bBDoTSny-I/edit)

---

## What it does

Someone comments **"price"** on a Shalom Park reel. Within a second:

1. They get a **private DM** with the real price card — warranted figures, what the price excludes, the payment plan, an offer to inspect.
2. The comment gets a **public reply** that contains no figures at all: *"Just sent you a DM."*
3. A row lands in the attribution ledger recording the keyword that produced the lead.

If the comment is **"what's the ROI on the 4 bedroom"**, none of the price logic runs. It escalates to a human with no number attached.

## The design decision that matters

**Keywords are a fast lane in front of the brain, not a replacement for it.**

| | Fast lane | Brain |
|---|---|---|
| Triggered by | An exact rule match | Everything else |
| Answer comes from | Pre-written, human-approved text | Gemini, reading the KB |
| Cost | ₦0 | tokens |
| Hallucination surface | **None** | Guardrailed |

A miss is a fall-through, never a dead end. This is the same doctrine as docs/13's *"arithmetic never goes to a language model"* — an answer whose exact words we already know should never be regenerated.

Both lanes exit through **the same guardrail node**. That is deliberate: the rule table is human-editable, so an edit that smuggles in a yield promise gets caught at runtime, not just at build time (test `IGE-04`).

## The safety class

Nine rules are marked `escalate_only`. They **outrank every commercial rule when both match** — that is the single most important line of code in the system:

> `const winner = escalations.length ? pickBest(escalations) : pickBest(fast);`

Without it, *"what rental yield does the 4 bedroom give"* fires the ₦185m price card and answers a returns question with a price. With it, that message reaches a human with no figure attached.

| Rule | Why it can never be automated |
|---|---|
| `SP-ESC-ROI` | Returns and appreciation — banned outright (`must_not_say`) |
| `SP-ESC-REFUND` | The 25% forfeiture, quoted verbatim, never softened |
| `SP-ESC-PAYTO` | Bank details never appear in a chat window |
| `SP-ESC-DISC` | No discount authority exists |
| `SP-ESC-LEGAL` | Litigation and title questions belong to a person |
| `SP-ESC-COMPLETE` | The KB has no completion date — so neither do we |
| `SP-ESC-FEES` | Excluded *items* are warranted; excluded *amounts* are not |
| `SP-ESC-AGENT` | Commercial terms are not the assistant's business |
| `SP-ESC-MORTGAGE` | No financing arrangement exists in the facts sheet |

## What is deliberately withheld

🔴 **The ₦95m 2-bedroom condominium price is not in this system.** `SP-2B` describes the product and its availability, then hands the price question to a human. The figure carries a Propel price query — an unusual ratio against the ₦185m 4-bed — and an automation that publishes it would publish a suspected-wrong price to *every* commenter before anyone noticed.

Restoring it is a one-line edit to the sheet **the day Collins confirms the figure**. Until then test `KW-20` fails the build if the number appears anywhere in the table.

🔴 **No public comment reply contains a number or a title claim.** A public reply is publication: permanent, screenshot-able, un-editable. Prices move and the title documents are still unsighted (Gate 2). A DM is conversation and may carry warranted facts; a public comment may not. The linter enforces this — `build-keywords.js` rejects any public reply containing a digit.

## Meta's limits, enforced in code

| Limit | Enforcement |
|---|---|
| **One private reply per comment** | `Send gate` keys on comment id; a redelivery is refused (`IGE-02`) |
| **7-day reply window** | Gate memory expires on the same clock |
| **~200 automated DMs/hour** | Capped at 180; overflow is **held for a human, never dropped** (`IGE-09`) |
| Never reply to ourselves | Normaliser drops comments whose author is the business (`IGE-07`) |
| Signed payloads only | HMAC over raw bytes; a bad signature dies before any reply logic (`IGE-08`) |

## Links and attribution

Every rule carries a `link_code`. When links are switched on, the DM ends with a wa.me link whose **prefilled text carries that code** — so the buyer's first WhatsApp message identifies the exact Instagram keyword that produced them. That is what turns "Instagram works" into a commission claim on a ₦185m unit.

Link mode lives in `clients.json` → `keywords.links.mode`:

| Mode | Behaviour |
|---|---|
| `none` ← **current default** | No link ships. The DM ends *"Reply here and the team will pick it up."* |
| `human_line` | Points at the sales WhatsApp in `escalation.primary` |
| `concierge` | Points at Shalom Park's own Cloud API number once it exists |

**It ships as `none` on purpose.** `human_line` would point an automation at Collins' personal phone at volume — that is Shalom Park's decision to make, not ours. Ask them before flipping it. Test `KW-23` guarantees no half-formed URL ever ships.

## Gates — what has to be true before this runs

| Gate | Status |
|---|---|
| Rules written, tested, grounded in the signed facts sheet | ✅ done |
| Workflow built and syntax-verified | ✅ done |
| Shalom Park Instagram is Professional/Business + connected Page | ⬜ **Business Suite session** |
| *Allow access to messages* toggled on | ⬜ **Business Suite session** |
| Meta app inside IFT Realty's portfolio + `instagram_manage_messages` | ⬜ **Business Suite session** |
| `SHALOM_PARK_IG_TOKEN` + `SHALOM_PARK_APP_SECRET` in `/opt/propel/.env` | ⬜ |
| Graph API version confirmed against the live app | ⬜ — pinned `v21.0` in `clients.json`, **unverified** |
| 2-bed price confirmed | ⬜ Collins |
| Title documents sighted | ⬜ Gate 2 |

**Nothing here changes the critical path.** The Business Suite session is still the unlock. This is the thing that was waiting on it, now built.

## The round trip

The Sheet is where edits happen. The repo is the source of truth. Keep them in step:

```
Edit the Google Sheet
  ↓  File → Download → Comma-separated values
  ↓  replace clients/shalom-park/keywords.csv
node tools/build-keywords.js      # lint + compile -> keywords.json
node tools/build-workflows.js     # embed into 05-channel-instagram.json
node tools/test-all.js            # 103 tests
  ↓  re-paste the workflow into n8n
```

`build-keywords.js` refuses to compile a table that breaks any of these:

- a public reply containing a digit, a price or a title claim
- an `escalate_only` rule carrying a link, or not escalating
- a trigger phrase claimed by two rules (ambiguity is a silent failure)
- a duplicate rule id, a bad class, status or link kind
- **any response the live guardrail blocks**

## Files

| File | What |
|---|---|
| `clients/shalom-park/keywords.csv` | The rule table — mirror of the Sheet, source of truth |
| `clients/shalom-park/keywords.json` | Compiled. Generated; do not hand-edit |
| `ops/concierge/lib/keywords.js` | The matcher — tokenised, emoji-safe, pidgin-aware |
| `ops/concierge/workflows/05-channel-instagram.json` | The adapter: verify → normalise → fast lane → guardrail → send |
| `tools/build-keywords.js` | Compiler + linter |
| `tools/test-keywords.js` | 30 rule tests |
| `tools/test-ig-workflow.js` | 10 end-to-end tests against the shipped workflow |

## Why the matcher is token-based

`"land"` is a substring of `"Ireland"`, `"landscape"` and `"Holland"`. A naive `includes()` check answers a man talking about his brother in Ireland with a plot price. Matching runs on tokens, so it cannot happen (`KW-04`).

The normaliser also folds what people actually type in Lagos: `4bed` · `4-bedroom` · `four bedroom` → one rule. `hw much` · `abeg how much` · `wetin be the price` → the price card. Emoji are stripped before matching, because roughly half of Instagram property comments are 🙏🏾 and 🏠.
