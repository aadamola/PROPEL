# ADEDAMOLA's TO-DO

*ADHD rules for this list: do the ⭐ item only — ignore everything below it until it's done. Every item is time-boxed and atomic. Stuck for 10 minutes? Message me, don't spiral. I keep this list updated every session; you never have to remember anything — just open this file.*

---

> 💰 **2026-07-26: PROPEL HAS A PAYING CLIENT.** Shalom Park paid the setup fee. You did that. Second SIM ✅ 09112714482 logged. We're in production mode — full build plan in [ops/production-checklist.md](ops/production-checklist.md), you don't need to read it, I'm running it.

## ⭐ DO THIS NEXT — the Shalom Park Business Suite session

**Full script: [clients/shalom-park/05-business-suite-session.md](clients/shalom-park/05-business-suite-session.md)** — 15 min prep alone, then a 25-min call you read off while sharing your screen.

**Before you book it, two things must be true:**

1. **The right person is on the call** — someone with **admin** on IFT Realty's Meta account *and* access to the CAC certificate. **Not Collins**; he's a Sales Executive and almost certainly has neither. Message 1 in [04-meta-access-pack.md](clients/shalom-park/04-meta-access-pack.md) finds them.
2. **They have a NEW, unused SIM** with the phone in the room. 🔴 **Never Collins' 08064834680 or any line their team sells on** — registering a number to Cloud API deletes WhatsApp on that handset and the history doesn't transfer.

**Your 15-minute prep** (do it alone, before the call):
```
cd /opt/propel
bash ops/setup/apply-client-ledger.sh shalom-park
```
then import `01-shalom-park-wa-ingest.json` into n8n and **Activate** it — Meta tests the webhook the second you click Verify, and an inactive workflow returns a 404 that looks like a server fault.

*Still outstanding from the last session: a successful chat with `02` (Step 2 of the n8n runbook). Worth doing first — it takes five minutes and proves the brain works before you put anything in front of a client.*

---

## THIS WEEK — one per sitting, in this order

- [ ] **(20 min)** **First 10 prospect names** → WhatsApp me names + IG handles. *Unblocks 10 audit teardowns. Longest-outstanding item on this list.*
- [ ] **(1 message)** 🔴 **Ask Shalom Park who holds the CAC documents + can grant Meta admin.** Script ready in [clients/shalom-park/04-meta-access-pack.md](clients/shalom-park/04-meta-access-pack.md). *Not Collins — he's a Sales Executive with neither. Then do the setup on a 20-min screen share, don't send a checklist.*
- [ ] **(1 afternoon)** ⚡ **Prove the fast lane** — test app + Meta's free test number, send one message ([ops/setup/meta-app-setup.md](ops/setup/meta-app-setup.md) §9b Step 0). *Settles whether App Review is needed before we promise them a date.*
- [ ] **(1 conversation)** 💰 **Confirm the Shalom Park care fee and commission rate.** *Possibly revenue already owed — MRR currently reads zero because nothing is confirmed as started. Ask what the setup fee covered, when the ₦250k/mo begins, and pin the commission %.*
- [ ] **(5 min)** 🔴 **Send Collins the follow-up** — [clients/shalom-park/03-followup-questions.md](clients/shalom-park/03-followup-questions.md). Eight open fields, one message. **Lead with the ₦95m condo price** — if that's a typo and we advertise it, we've published a false price under our own quality charter.
- [ ] **(15 min)** 🔴 **Start CAC filing** — "Propel Digital" (fallbacks: Propel Media, Propel Digital Marketing), cac.gov.ng or an accredited agent. *This is no longer admin. Meta won't let us run automation on a **client's** account until our business is verified with registered documents — so this now blocks something Shalom Park has paid for. ~2 weeks of clock. Start it, then forget it.*
- [ ] **(10 min)** Meta Business Suite: link @getpropel.ng + WhatsApp, convert IG to a Business account ([ops/setup/account-setup.md](ops/setup/account-setup.md) §7).
- [ ] **(1 ask)** Shalom Park: sight the title + approval documents. *Site visit ✅ done. This is the last open vetting gate — and with bare-land plots in the mix it matters more, not less. We don't publish a price for land we haven't seen the paper for.*
- [ ] **(15 min)** Finish the socials: TikTok + LinkedIn page (§4–5), then post manifesto.png with the Day 1 caption.
- [ ] **(5 min, before 29 Aug)** ⏰ **VPS renewal decision** — you're on a monthly term with auto-renewal on. Check the renewal quote in Hostinger; if 12 months prepaid beats it, switch. Renewal is where their 2–3× jump lands.

## NOT YET — ignore these (I'll star them when it's time)

Testing the bot · the Shalom Park pilot build · voice notes · first audit calls. Nothing here is actionable until the week's items land. Don't think about them.

## WAITING ON ME (AI partner) — nothing for you to do here

- ✅ Website wired to your number · ✅ WhatsApp QR generated (site/assets/whatsapp-qr.png)
- Live Concierge build on the new SIM → starts the moment you send it + VPS exists
- Meta app + App Review submission → starts after CAC + Business Suite link
- 10 audit teardowns → starts the moment you send names

## ✅ DONE (look how far this has come)

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
