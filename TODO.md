# ADEDAMOLA's TO-DO

*ADHD rules for this list: do the ⭐ item only — ignore everything below it until it's done. Every item is time-boxed and atomic. Stuck for 10 minutes? Message me, don't spiral. I keep this list updated every session; you never have to remember anything — just open this file.*

---

> 💰 **2026-07-26: PROPEL HAS A PAYING CLIENT.** Shalom Park paid the setup fee. You did that. Second SIM ✅ 09112714482 logged. We're in production mode — full build plan in [ops/production-checklist.md](ops/production-checklist.md), you don't need to read it, I'm running it.

## ⭐ DO THIS NEXT — re-run step 2, it should work now

**The tables weren't created, and my script told you it succeeded. Two defects, both mine, both fixed.**

1. **The script didn't stop on error.** `psql` prints a failure, carries on through an aborted transaction, rolls everything back at `COMMIT` — and still exits `0`. A clean-looking run and an empty database. `ON_ERROR_STOP=1` is set now, so an error is the last thing you see.
2. **The schema needed the `pgcrypto` extension**, which is a privileged operation — and one privilege failure inside that transaction silently takes the whole script down with it. **Removed entirely.** PostgreSQL 13+ has `gen_random_uuid()` and `sha256()` built in, so it was never actually needed.

**Pull the fix and re-run:**

```
cd /opt/propel-repo && git pull
bash ops/setup/vps-tools.sh schema
```

✅ **Done when** the last lines read `lead`, `lead_event`, then **`✅ schema applied`**.

**If anything looks off:**

```
bash ops/setup/vps-tools.sh doctor
```

Containers, Postgres version, whether your role is superuser, whether the tables exist, which commit the repo is on. **Send me that output and I'll have it.**

Then carry on from **step 3** — [12-phase1-golive.md](clients/shalom-park/12-phase1-golive.md).

---

## THIS WEEK — one per sitting, in this order

- [ ] **(5 min, before 29 Sep)** ⏰ **VPS: check what Hostinger charged on renewal.** *Your monthly term ran to 29 Aug, auto-renewal was on, and you last logged in on 10 Aug — so this hasn't been looked at. Renewal is where their 2–3× jump lands.*
- [ ] **(5 min)** 🎬 **Book the shoot day with Collins** — one site visit, about 3 hours, and it produces all 14 days of content. Shot list is written: [10-phase0-content-pack.md](clients/shalom-park/10-phase0-content-pack.md). *Collins and Mercy go on camera, not you.*
- [ ] **(1 message)** 🔴 **Ask Shalom Park who can grant Meta admin.** Script in [04-meta-access-pack.md](clients/shalom-park/04-meta-access-pack.md). *Not Collins — he's a Sales Executive. The session is now 15 minutes and needs no SIM.*
- [ ] **(5 min)** **Send Collins the follow-up** — [03-followup-questions.md](clients/shalom-park/03-followup-questions.md). *Seven fields still open. The ₦95m condo price is settled; the rest aren't.*
- [ ] **(20 min)** **First 10 prospect names** → WhatsApp me names + IG handles. *Unblocks 10 audit teardowns. Longest-outstanding item on this list — and Shalom Park is still a pipeline of one.*

## NOT YET — I'm holding these, don't think about them

**Parked from "this week" to keep the list at five** (the protocol, not a demotion — I'll star them when their turn comes):

- 💰 Confirm the Shalom Park care fee + commission rate — *MRR reads zero because nothing is confirmed as started*
- 🔴 CAC filing for Propel — *less urgent for THIS client since we use IFT Realty's portfolio and their RC number; still needed for invoicing, banking and every client after this one*
- Sight the title + approval documents — *last open vetting gate*
- TikTok + LinkedIn pages
- ⏰ **VPS: your monthly term ran to 29 Aug and auto-renewal was on — check what Hostinger actually charged you.** *Not urgent, but renewal is where their 2–3× jump lands, and that date has passed.*

Testing the bot · the automated pilot · voice notes · first audit calls. Nothing here is actionable until the week's items land.

## WAITING ON ME (AI partner) — nothing for you to do here

- ✅ Website wired to your number · ✅ WhatsApp QR generated (site/assets/whatsapp-qr.png)
- Live Concierge build on the new SIM → starts the moment you send it + VPS exists
- Meta app + App Review submission → starts after CAC + Business Suite link
- 10 audit teardowns → starts the moment you send names
- ✅ Instagram keyword automation built (24 rules, 103 tests green) → goes live the moment the Business Suite session lands

## ✅ DONE (look how far this has come)

- [x] 🛠️ **Import preflight tool built — checks the whole workflow bundle before it touches n8n** (2026-09-15)
- [x] 🔐 **Phase 1 built: escalation alerts, attribution ledger wired, privacy + data-deletion pages, go-live runbook** (2026-09-15)
- [x] 🚀 **Phase 0 production pack shipped** — 27 saved replies, 10 captions, shot list, daily runbook, tracking log (2026-09-15)
- [x] 📵 **WhatsApp stripped — Shalom Park is Instagram-only** (2026-09-15)
- [x] 📲 **All 7 Instagram campaigns live** — 27 rules, promos that retire themselves, every response written to convert, 121 tests (2026-09-15)
- [x] 💰 **₦95m condo price confirmed and released** — open since July (2026-09-15)
- [x] 🖥️ **VPS live (KVM 2, 8 GB) + domain getpropel.tech bought** (2026-07-29)
- [x] 📋 **Shalom Park facts sheet returned SIGNED — their AI's knowledge base is built** (2026-07-27)
- [x] **Site visit done** — four-stage inventory counted (2026-07-26)
- [x] 💰 **FIRST PAYING CLIENT — Shalom Park Estate (IFT Realty) paid the setup fee** (2026-07-26)
- [x] **WhatsApp Business + Instagram live — Propel is public** (2026-07-26)
- [x] Second SIM for the AI line — 09112714482 (2026-07-26)
- [x] Business plan, roadmap, pricing, GTM, financial model, AI stack (docs/01–06)
- [x] Bootstrap plan fitted to real life: ₦500k, 20 hrs/week (docs/07)
- [x] Legal decision made: sole prop now, Ltd on triggers (docs/08)
- [x] Ops system: templates, prompts, CRM, operating manual (ops/)
- [x] 14-day faceless launch calendar, fully written (ops/content/)
- [x] Brand v1 adopted + full asset pack shipped (site/assets/)
- [x] Shalom Park demo pack + send-ready brief written (demos/shalom-park/)
- [x] LLM credit decision made: Haiku 4.5 + DeepSeek, ~₦25k when needed (docs/13)
- [x] PR #1 merged — the whole business is on GitHub main
