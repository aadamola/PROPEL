# ADEDAMOLA's TO-DO

*ADHD rules for this list: do the ⭐ item only — ignore everything below it until it's done. Every item is time-boxed and atomic. Stuck for 10 minutes? Message me, don't spiral. I keep this list updated every session; you never have to remember anything — just open this file.*

---

> 💰 **2026-07-26: PROPEL HAS A PAYING CLIENT.** Shalom Park paid the setup fee. You did that. Second SIM ✅ 09112714482 logged. We're in production mode — full build plan in [ops/production-checklist.md](ops/production-checklist.md), you don't need to read it, I'm running it.

## ⭐ DO THIS NEXT — DNS records, then one paste (~15 min)

**VPS is live. Domain is bought. This turns them into a running system.**

**Step 1 — Hostinger → Domains → getpropel.tech → DNS records.** Add three A records, all pointing to `72.62.213.187`:

| Type | Name | Points to |
|---|---|---|
| A | `engine` | 72.62.213.187 |
| A | `flow` | 72.62.213.187 |
| A | `status` | 72.62.213.187 |

*Leave `@` and `www` alone — those go to Vercel when the site deploys.*

**Step 2 — Hostinger → VPS → Browser terminal.** Paste:

```
curl -fsSL -o bootstrap.sh https://raw.githubusercontent.com/aadamola/PROPEL/main/ops/setup/vps-bootstrap.sh
sudo bash bootstrap.sh
```

Answer `getpropel.tech` and your email. Then leave it for ~10 minutes.

**Step 3 —** run `sudo cat /opt/propel/.env` and send me **the N8N_USER and N8N_PASSWORD lines only.** Never the whole file — it holds the database password and the key that decrypts every stored credential.

---

## THIS WEEK — one per sitting, in this order

- [ ] **(5 min)** 🔴 **Send Collins the follow-up** — [clients/shalom-park/03-followup-questions.md](clients/shalom-park/03-followup-questions.md). Eight open fields, one message. **Lead with the ₦95m condo price** — if that's a typo and we advertise it, we've published a false price under our own quality charter.

---

## THIS WEEK — one per sitting, in this order

- [ ] **(15 min)** 🔴 **Start CAC filing** — "Propel Digital" (fallbacks: Propel Media, Propel Digital Marketing), cac.gov.ng or an accredited agent. *This is no longer admin. Meta won't let us run automation on a **client's** account until our business is verified with registered documents — so this now blocks something Shalom Park has paid for. ~2 weeks of clock. Start it, then forget it.*
- [ ] **(10 min)** LLM credits ~₦25k — I'll send you the two exact top-up links once the box is up.
- [ ] **(10 min)** Meta Business Suite: link @getpropel.ng + WhatsApp, convert IG to a Business account ([ops/setup/account-setup.md](ops/setup/account-setup.md) §7).
- [ ] **(1 ask)** Shalom Park: sight the title + approval documents. *Site visit ✅ done. This is the last open vetting gate — and with bare-land plots in the mix it matters more, not less. We don't publish a price for land we haven't seen the paper for.*
- [ ] **(20 min)** First 10 prospect names → WhatsApp me names + IG handles. *Unblocks 10 audit teardowns. You have a client now — that's the line that opens doors.*
- [ ] **(15 min)** Finish the socials: TikTok + LinkedIn page (§4–5), then post manifesto.png with the Day 1 caption.

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
