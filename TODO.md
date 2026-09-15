# ADEDAMOLA's TO-DO

*ADHD rules for this list: do the ⭐ item only — ignore everything below it until it's done. Every item is time-boxed and atomic. Stuck for 10 minutes? Message me, don't spiral. I keep this list updated every session; you never have to remember anything — just open this file.*

---

> 💰 **2026-07-26: PROPEL HAS A PAYING CLIENT.** Shalom Park paid the setup fee. You did that. Second SIM ✅ 09112714482 logged. We're in production mode — full build plan in [ops/production-checklist.md](ops/production-checklist.md), you don't need to read it, I'm running it.

## ⭐ DO THIS NEXT — step 3, the credentials (about 15 min)

**Step 2 is done** ✅ — `lead` and `lead_event` exist, the script proved it. Those `NOTICE ... skipping` lines are normal: `DROP TRIGGER IF EXISTS` on a fresh database.

**Three credentials now, one later.** n8n → **Credentials → Add credential**.

**a · `Gemini`** — Query Auth · name `key` · value = your Gemini API key

**b · `Propel Postgres`** — Postgres. Get the password first:
```
grep -E '^POSTGRES_PASSWORD=' /opt/propel/.env
```
Host **`postgres`** · Database `n8n` · User `propel` · Port `5432` · SSL off.

> 🔴 **Host is `postgres`, not `localhost`.** n8n and the database are containers on the same network, so n8n reaches it by service name. `localhost` there means the n8n container itself, and the error reads "connection refused" — which looks like the database is down when it's fine.

**Click Test on both.** Green before moving on.

**c · `Propel SMTP`** — **do this first, it needs DNS time.** Create **`alerts@getpropel.tech`** in your Hostinger panel (the domain is already there), then take host/port/SSL from the screen Hostinger shows you. Do 3a and 3b while MX propagates.

> 🔴 Not `@shalomparknigeria.com` and not `@koratori.com` — both erase Propel from the from-line. Every alert is a receipt landing in their inbox 20 times a day; that's the commission drumbeat. And set it before go-live: changing a sender once alerts are flowing means the first ones can hit spam, which is the one failure this layer exists to prevent.
>
> *Stopgap only if MX hasn't resolved by import time: Gmail app password on `justin@koratori.com`.*

**d · `Shalom Park IG`** ⏸️ — **can't be done yet.** The token doesn't exist until the Meta app is created. Skip it; you can import and wire everything else without it.

Then **steps 4–6**: import `03`, import `06`, import `05` and paste the two ids in — [12-phase1-golive.md](clients/shalom-park/12-phase1-golive.md).

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

- [x] 🗄️ **Ledger tables live on the VPS — `lead` + `lead_event` created** (2026-09-15)
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
