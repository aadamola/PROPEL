# Propel Concierge — Production Build Checklist

*Opened 2026-07-26, the day WhatsApp Business + Instagram went live. This is the execution track that turns the Concierge from a simulation into a running system. Live document: tick items as they land, owners are **A** = ADEDAMOLA (hands, money, signatures) or **B** = AI partner (everything producible).*

---

## The sequencing ruling — UPDATED 2026-07-26 (they paid)

**Shalom Park is a paying client.** Contacted, agreed, setup fee received, marketing-use rights granted. The commercial gate that governed this section is **cleared** — we build for them, and we say their name publicly.

Two gates survive the payment, because money doesn't clear them:

- **Vetting (rule 5)** — CAC search on IFT Realty, title/approval documents sighted, site visit. A client paying us is not evidence their title is clean, and we don't market land we haven't seen the paper for.
- **Warranted facts (rule 2)** — **this is the hard build blocker.** The Concierge cannot state a price, title status, payment plan or availability figure that isn't on a signed facts sheet. Form ready at `ops/templates/warranted-facts-sheet.md`; request drafted at `clients/shalom-park/01-kickoff-messages.md`.

**Build order is unchanged, and that's deliberate.** Our own assets first — not as a delay, but because the external clocks (Meta App Review, business verification) run for ~2 weeks regardless, and their facts sheet has to come back before their KB can exist. Everything that doesn't depend on either gets built now.

**One production system, three instances:**

| Instance | Runs on | Purpose | Status |
|---|---|---|---|
| **Propel's own Concierge** | our WhatsApp + @getpropel.ng | Answers our real prospects 24/7 — and is itself the proof we sell | Phase 1 |
| **Apex Gardens demo** | our sandbox number | The estate Shalom Park messages *from their own phone* in the meeting | Phase 2 |
| **Shalom Park deployment** | their assets | **The paid build — client waiting** | Phase 3 — **gated on facts sheet + vetting + App Review** |

Phase 3 is a **KB swap and a number swap** on a system already proven in production. That's why this order delivers faster, not slower.

---

## Hard constraints discovered in build research (these shape what we PROMISE)

Verified July 2026 — every one of these is a thing cheap competitors over-promise and get caught on:

| Constraint | What it means for us |
|---|---|
| **Instagram comment→DM: one automated private reply per comment, inside a 7-day window** | We say "every comment gets one instant private reply" — never "unlimited automated conversation from comments." Accurate and still impressive. |
| **~200 automated DMs/hour per account** | Fine at our clients' volumes. Matters if a Reel goes viral — the system queues and a human is alerted rather than silently dropping. Design accordingly. |
| **Advanced Access for messaging permissions requires Meta App Review: ~5–10 business days** | **This is the long pole of the entire product.** Needed to run on a *client's* account. Start the clock on our own app before we need it, not after they sign. |
| **Meta Business Verification requires registered business documents** | **CAC filing is on the critical path to production**, not a background admin task. It gates verification → gates App Review → gates client deployments. |
| **Direct-migrating a number to Cloud API kills the WhatsApp Business app on that number** | **Do NOT migrate 09019120968.** That's the line ADEDAMOLA chats on. Use a second SIM for the API rig (₦500). Coexistence via a solution partner exists as an alternative — more moving parts, revisit later if we want one number. |
| **WhatsApp 24-hour customer service window** | Free-form replies only within 24h of the buyer's last message; after that, pre-approved templates. Follow-up sequences must be designed around this — confirm exact current rules at setup. |

---

## Phase 0 — Foundations (unblocks everything)

**Spend gate: total ≈ ₦60k first month.** Client revenue has now landed, so this is funded out of receipts rather than the ₦500k capital — but it still needs ADEDAMOLA's greenlight per rule 1. (₦40k of it — domain + VPS — was already in the storefront plan.)

- [x] **(A · ₦500)** ~~Second SIM for the API rig~~ ✅ **DONE — 09112714482.** Keeps 09019120968 human.
- [ ] **(A · 15 min)** 🔴 **Start CAC Business Name filing** — "Propel Digital" (fallbacks: Propel Media, Propel Digital Marketing). *No longer admin: Meta Business Verification requires registered business documents, and that gates App Review, which gates automation on **a client's** account. **This now blocks a paid deliverable.***
- [x] **(A)** ✅ Domain **getpropel.tech** bought (Hostinger, 2026-07-29).
- [x] **(A)** ✅ **Hostinger KVM 2 LIVE** — 72.62.213.187, Manchester UK, Ubuntu 24.04, 8 GB. *Monthly term, expires 2026-08-29 — review before renewal (vps-setup.md §0).*
- [ ] **(A · 10 min · ~₦25k)** LLM credits per docs/13 §3: Claude Haiku 4.5 (~$12) + DeepSeek V4 Flash (~$5). I hand over exact top-up links.
- [ ] **(A · 10 min)** Meta Business Suite: link @getpropel.ng + WhatsApp; convert IG to Business account.
- [ ] **(B)** Meta developer app created, webhooks scaffolded, permissions mapped.
- [ ] **(B)** **Submit App Review for Advanced Access** the moment business verification allows. *Start the 5–10 day clock early.*

## Phase 1 — Propel's own Concierge (our number, our proof)

- [x] **(B)** ✅ Stack authored and syntax-verified: `ops/setup/vps-bootstrap.sh` — Caddy (auto-TLS) + n8n + Postgres + Redis + Qdrant + Flowise + Uptime Kuma, hardened (ufw, fail2ban, unattended-upgrades, conditional SSH lockdown), nightly backups with 14-day retention. **Runs on ADEDAMOLA's paste — I have no route to the server from here.**
- [x] **(A)** ✅ **STACK IS UP** (2026-07-29) — bootstrap ran clean on 72.62.213.187.
- [ ] 🔴 **(A · 2 min)** Send the n8n login + `docker compose ps` + `dig +short engine.getpropel.tech`. **The only thing between us and a running Concierge.**
- [ ] **(B)** Build **Propel's own KB**: services, pricing bands, the audit offer, who we are, what we don't do.
- [ ] **(B)** Wire the flow: IG comment → one private reply → WhatsApp → qualify → book audit → log to CRM → hand to ADEDAMOLA.
- [ ] **(B)** Guardrails live: retrieval-first, no invented facts, escalation template, kill switch, AI disclosure in first message, NDPA privacy line.
- [ ] **(B)** **Run the binding QA suite** (`sandbox/apex-gardens/qa-tests.json` — injection / grounding / policy). *Nothing talks to a human until it passes clean.*
- [ ] **(A · 20 min)** Ear test: message it like a hostile buyer. Try to break it. Tell me what felt wrong.
- [ ] **(A)** Go live on our own number. **Now every prospect conversation is also a demo.**

## Phase 2 — Apex Gardens demo instance (what Shalom Park touches)

- [ ] **(B)** Deploy second instance on the sandbox number with the fictional Apex Gardens KB (already built).
- [ ] **(B)** Full QA suite pass on this instance independently.
- [ ] **(B)** Red-team pass: OpenClaw Red Team Engine attacks it (docs/13 §2) before any prospect sees it.
- [ ] **(B)** One-page "how it works" leave-behind for the meeting.
- [ ] **(A)** Demo-ready: they message it live, from their own phone, in the room.

## Phase 3 — Shalom Park deployment 💰 PAID CLIENT

- [x] ✅ **Gate 1 — commercial:** contacted, agreed, **setup fee paid**, marketing-use rights granted (2026-07-26).
- [ ] 🟡 **Gate 2 — vetting:** ✅ site visit done (2026-07-26, four-stage inventory recorded in `clients/shalom-park/README.md`) · ⬜ CAC search on IFT Realty · ⬜ title/approval documents sighted. *Bare-land plots raise the diligence bar — sight the paper before any plot price publishes.*
- [ ] ⬜ **Gate 3 — terms in writing:** confirmation-of-terms note sent and acknowledged (`clients/shalom-park/01-kickoff-messages.md` #1). A "confirmed" reply counts — don't stall goodwill chasing a signature.
- [x] ✅ **Gate 4 — warranted facts sheet returned and SIGNED (2026-07-27)** by Nanameme Collins, Sales Executive. Archived, audited (`clients/shalom-park/02-facts-sheet-audit.md`) and converted into a live KB (`clients/shalom-park/kb.json`) with 15 gaps wired as escalation triggers. **The hard blocker is lifted.**

Then, and only then:

- [x] **(B)** ✅ Shalom Park KB built from the warranted sheet (`clients/shalom-park/kb.json`); every unsupplied field is `null` with a matching `escalate_always` entry — the bot escalates, never guesses.
- [ ] **(B)** Run the QA suite against the Shalom Park KB (not just Apex Gardens) before it speaks to anyone.
- [ ] **(A)** Answer the eight open fields with Collins (`clients/shalom-park/03-followup-questions.md`) — **the ₦95m condo price is the one that must be confirmed before any advert runs.**
- [ ] **(B)** Connect their IG + WhatsApp under our Advanced Access; attribution tagging live from message one (commission depends on it — docs/09).
- [ ] **(B)** Full QA + red-team pass on their instance.
- [ ] **(A + B)** Supervised soft launch: 48 hours with every conversation human-reviewed before the system runs unattended.
- [ ] **(B)** Week-1 scorecard from real numbers (`tools/scorecard-gen.js`).

## Phase 4 — Care (the ₦250k/mo)

- [ ] **(B)** Weekly: scorecard, KB updates from new questions, escalation review.
- [ ] **(B)** Monthly: QA re-run, red-team re-run, COGS check against the $10–25/client/mo model.
- [ ] **(B)** Quarterly: stack + model-price re-scan (docs/12 §5).

---

## Live blockers

| Blocked | On | Owner |
|---|---|---|
| Concierge rig build | **VPS + domain purchase** — spec'd and scripted, awaiting the buy (SIM ✅ done) | A |
| Everything in Phase 0–1 | ₦60k spend greenlight | A |
| ~~Shalom Park KB~~ | ✅ **UNBLOCKED — facts sheet signed, KB built 2026-07-28** | — |
| Publishing the ₦95m condo price | Client confirmation (audit §3a) | A |
| **Automation on Shalom Park's accounts** | CAC → Meta verification → App Review (~2+ weeks of external clocks) | A starts CAC, B submits |
| Publishing any Shalom Park price/title fact | Facts sheet + documents sighted | A |

*Sources for the constraints table: [Meta — migrate an existing WhatsApp number](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/migrate-existing-whatsapp-number-to-a-business-account/) · [WhatsApp coexistence: app + API on one number](https://leadnotifi.com/articles/whatsapp-coexistence-business-app-and-api) · [Instagram DM automation rules 2026](https://www.inro.social/blog/instagram-dm-automation-guide-2026) · [Instagram comment-to-DM guide](https://quickdm.app/blog/instagram-comment-to-dm-automation-complete-guide) · [Instagram DM compliance 2026](https://creatorflow.so/blog/instagram-dm-compliance-meta-rules/).*
