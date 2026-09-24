# ADEDAMOLA's TO-DO

*ADHD rules for this list: do the ⭐ item only — ignore everything below it until it's done. Every item is time-boxed and atomic. Stuck for 10 minutes? Message me, don't spiral. I keep this list updated every session; you never have to remember anything — just open this file.*

---

> 💰 **2026-07-26: PROPEL HAS A PAYING CLIENT.** Shalom Park paid the setup fee. You did that. Second SIM ✅ 09112714482 logged. We're in production mode — full build plan in [ops/production-checklist.md](ops/production-checklist.md), you don't need to read it, I'm running it.

## ⭐ DO THIS NEXT — steps 8 + 9: switch the webhook on, then prove it (3 min)

**Step 8** — in n8n, open **Propel Concierge — Instagram channel** → click **Publish**.

**Step 9** — straight after, on the server:
```
bash /opt/propel-repo/ops/setup/vps-tools.sh handshake
```

You want **`✅ 3/3`**. The one that matters most is **"wrong token → refused"** — it proves strangers can't hook their own Meta app to our address. The output never shows the token, so it's safe to screenshot.

**Publishing does NOT start answering buyers.** Meta isn't pointed at this address until step 10, and even if something sends to it, it's rejected without the Meta app secret. **Keep running Phase 0 by hand exactly as you are.**

---

## THIS WEEK — one per sitting, in this order

- [ ] **(5 min, before 29 Sep)** ⏰ **VPS: check what Hostinger charged on renewal.** *Your monthly term ran to 29 Aug, auto-renewal was on, and you last logged in on 10 Aug — so this hasn't been looked at. Renewal is where their 2–3× jump lands.*
- [ ] **(5 min)** 🎬 **Book the shoot day with Collins** — one site visit, about 3 hours, and it produces all 14 days of content. Shot list is written: [10-phase0-content-pack.md](clients/shalom-park/10-phase0-content-pack.md). *Collins and Mercy go on camera, not you.*
- [ ] **(1 message)** 🔴 **Ask Shalom Park who can grant Meta admin.** Script in [04-meta-access-pack.md](clients/shalom-park/04-meta-access-pack.md). *Not Collins — he's a Sales Executive. The session is now 15 minutes and needs no SIM.*
- [ ] **(5 min)** **Send Collins the follow-up** — [03-followup-questions.md](clients/shalom-park/03-followup-questions.md). *Seven fields still open. The ₦95m condo price is settled; the rest aren't.*
- [ ] **(20 min)** **First 10 prospect names** → WhatsApp me names + IG handles. *Unblocks 10 audit teardowns. Longest-outstanding item on this list — and Shalom Park is still a pipeline of one.*

> 🔴 **2 min, do it now:** your Instagram bio links to `getpropel.tech`, which isn't live — change the link to `wa.me/2349019120968?text=Hi%20Propel%2C%20I%20want%20a%20free%20marketing%20audit` until it is.
>
> ⚠️ **LinkedIn:** try `getpropel.tech`, or `getpropel-tech` if it rejects the dot. Leave Website blank. Tell me the URL that stuck and I'll fix the website's LinkedIn link.

## NOT YET — I'm holding these, don't think about them

**Parked from "this week" to keep the list at five** (the protocol, not a demotion — I'll star them when their turn comes):

- 💰 Confirm the Shalom Park care fee + commission rate — *MRR reads zero because nothing is confirmed as started*
- 🔴 CAC filing for Propel — *less urgent for THIS client since we use IFT Realty's portfolio and their RC number; still needed for invoicing, banking and every client after this one*
- Sight the title + approval documents — *last open vetting gate*
- TikTok + LinkedIn pages
- ⏰ **VPS: your monthly term ran to 29 Aug and auto-renewal was on — check what Hostinger actually charged you.** *Not urgent, but renewal is where their 2–3× jump lands, and that date has passed.*

- 🌐 **Publish the privacy + data-deletion pages** — *needed before step 10:* Meta requires both links to be live before an app goes Live. They contain no offerings, so they can go up ahead of the homepage.
- 🧭 **Realign Propel's offerings** — *you asked to do this later.* It will touch the homepage, the rate card Propel's own assistant would quote, the pricing doc, and the LinkedIn About. Propel's own assistant stays offline until it's done.

Testing the bot · the automated pilot · voice notes · first audit calls. Nothing here is actionable until the week's items land.

## WAITING ON ME (AI partner) — nothing for you to do here

- ✅ Website wired to your number · ✅ WhatsApp QR generated (site/assets/whatsapp-qr.png)
- Live Concierge build on the new SIM → starts the moment you send it + VPS exists
- Meta app + App Review submission → starts after CAC + Business Suite link
- 10 audit teardowns → starts the moment you send names
- ✅ Instagram keyword automation built (24 rules, 103 tests green) → goes live the moment the Business Suite session lands

## ✅ DONE (look how far this has come)

- [x] 💼 **LinkedIn Company Page created — Propel, triangle logo** (2026-09-24)
- [x] 🔐 **Step 7 — verify token live in n8n; August's "access to env vars denied" fixed at the root** (2026-09-23)
- [x] 📲 **Step 6 — Instagram workflow imported with both IDs baked in** (2026-09-23)
- [x] 📒 **Step 5 — ledger + alerts workflow imported (`oNt2oRixkDbbUa2p`) and wired into 05** (2026-09-23)
- [x] 🧠 **Step 4 — core workflow imported (`SzWrUVB8WYv3sfE5`) and wired into 05** (2026-09-23)
- [x] 🐛 **Your manual run exposed a core bug — fixed: duplicates and invalid requests now stay silent** (2026-09-23)
- [x] 📧 **`alerts@getpropel.tech` proven — test email landed in the Inbox, not spam** (2026-09-23)
- [x] 🔑 **Credentials 3a Gemini + 3b Postgres done; engine.getpropel.tech back up** (2026-09-23)
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
