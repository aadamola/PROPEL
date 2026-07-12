# Propel Concierge — Product Spec v1

*The 24/7 AI agent that answers every DM. Promoted from a Propel OS line-item to a headline product, July 2026. This is our most defensible offer: it compounds our AI edge into recurring revenue and makes clients stickier than any content retainer.*

## The pitch (client-facing)

> Every unanswered DM is a buyer who messaged your competitor next. Propel Concierge is an AI agent trained on *your* listings that answers every Instagram and WhatsApp inquiry in seconds — price, location, title status, payment plans, inspection booking — 24/7, in natural English or Pidgin. It qualifies each prospect (budget, area, timeline, cash or mortgage) and hands the hot ones to you with a full summary. You wake up to booked inspections, not 40 unread messages.

**The stat that sells it:** leads contacted within 5 minutes convert many times better than leads contacted after an hour — and most Lagos agents reply in hours or days. We eliminate the gap entirely.

## What it does

1. **Instant first response** on WhatsApp Business and Instagram DMs (Facebook Messenger included; same Meta API family).
2. **Answers from a verified knowledge base only:** the client's listing facts sheets (price, location, title status, sizes, amenities, payment plans), FAQs, company profile, inspection logistics. **If it's not in the knowledge base, the agent says "let me get you the exact answer" and escalates — it never guesses, never invents.** (Truth-in-marketing rule 2 applies to bots too.)
3. **Qualifies every lead:** budget band → preferred area → timeline → cash/mortgage/diaspora payment plan. Scores and tags in CRM.
4. **Books the next step:** proposes inspection slots (physical or virtual), drops the location pin, sets reminders.
5. **Hands off hot leads** to the human agent with a context summary ("Mrs. A, ₦80–100m budget, wants 4-bed in Ajah, cash, inspecting Saturday"). Handoff triggers: qualified-hot score, negotiation attempts, complaint, any legal/title question, or the buyer asking for a human.
6. **Weekly digest:** conversations handled, leads qualified, response-time stats, questions the KB couldn't answer (→ KB update).

## Architecture (build once, deploy per client)

| Layer | Choice |
|---|---|
| Channels | WhatsApp Business Platform (Cloud API) via BSP; Instagram + Messenger via Meta Messaging API — one inbox integration covers all three |
| Brain | Claude API with per-client system prompt (persona, tone, guardrails) + retrieval over the client's knowledge base |
| Knowledge base | Structured listing sheets + FAQs, client-warranted in writing; versioned per client in their folder; updated weekly or on new listing |
| Orchestration | Self-hosted n8n on VPS (docs/12 architecture); custom agent-SDK build when volume justifies |
| CRM | Lead + transcript logged to client's pipeline (Propel OS); tags = source, score, status |
| Compliance | Meta 24-hour messaging window rules respected (template messages beyond window); NDPA consent line in first response; opt-out honored instantly |

## Guardrails (contractual, non-negotiable)

- Never invents price, title, size, availability — KB or escalate.
- Never negotiates price; never gives legal/valuation advice (that's the licensed human's job — a selling point for our surveyor clients, not a limitation).
- Discloses it's an automated assistant on request and in the first message footer.
- Human review of transcripts weekly; any hallucination = KB/prompt fix within 48h.
- Kill-switch: client can pause the agent from WhatsApp with one message.

## Pricing (adds to docs/03 rate card)

| Tier | Setup | Monthly care | What's included |
|---|---|---|---|
| **Concierge Lite** | ₦450,000 | ₦100,000 | WhatsApp only · KB up to 20 listings · qualification + handoff + weekly digest |
| **Concierge Pro** | ₦800,000 | ₦150,000 | WhatsApp + Instagram + Messenger · unlimited listings (fair use) · inspection booking · CRM integration · monthly optimization |
| **Concierge Developer** | ₦1,200,000 | ₦250,000 | Everything in Pro, per-project · multi-agent sales team routing · diaspora timezone coverage tuning · attribution reporting (feeds commission mandates like Shalom Park) |

Care plan covers: API/BSP costs passthrough at our scale, KB updates, transcript QA, prompt tuning. Retainer clients get setup at 15% off. Margin note: API + BSP costs per client estimated ₦15k–₦40k/mo at typical volumes — 70%+ gross margin on care plans.

## Why this wins strategically

1. **Stickiness:** content retainers get cancelled in lean months; nobody unplugs the thing answering their buyers at 2am. Concierge is our churn armor.
2. **Wedge product:** cheaper entry than a full retainer for skeptics — then the weekly digest ("your agent answered 217 inquiries this month") sells the upgrade to Presence/Leads.
3. **Data moat:** every conversation teaches us what Lagos + diaspora buyers actually ask — feeding our benchmarks library and content engine.
4. **Perfect fit for commission mandates:** on deals like Shalom Park, Concierge IS the attribution mechanism — every lead it touches is logged as ours.

## QA standard (binding)

Every deployment passes the **Propel Systems QA suite (docs/11 §3)** before go-live and after any KB/prompt change: prompt-injection resistance, 0% grounding failures on price/availability/title, session durability, Meta 24-hr window compliance, number warm-up, phone validation, latency budgets, kill-switch drill. Add-ons: **Document Vault** (secure expiring doc links + credential display, docs/11 §4.2) and **Voice-Note Concierge** (AI WhatsApp voice replies, docs/11 §4.4).

## Delivery workflow (target: signed → live in 7 days)

Day 1: intake — listing sheets, FAQs, tone; facts warranty signed. Day 2–3: KB build + persona prompt + test suite (50 standard questions incl. adversarial: "is this omonile land?", "last price?"). Day 4: client tests on their own phone; edge cases fixed. Day 5–7: channels connected, soft-launch monitored, handoff drill with client's sales flow. Then weekly QA cadence.

## Honest limits (say them before clients discover them)

- IG/WhatsApp API access requires proper business accounts (we set this up — part of the value).
- The agent is only as good as the client's listing data — garbage in, garbage out; the facts-warranty process is mandatory, not optional.
- Voice notes: transcribed and answered in text initially; voice replies later.
- It will not close deals alone. It eliminates wait time and filters noise; humans close. We never claim otherwise.
