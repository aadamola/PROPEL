# Propel — AI Stack & Operations

> **Stack updates live in [docs/12-ai-stack-refresh.md](12-ai-stack-refresh.md)** (July 2026 scan: Dify/n8n-agent bake-off, official-Cloud-API-only transport ruling, ElevenLabs/Chatterbox voice tracks). Quarterly re-scan cadence applies. Where docs/12 and this file conflict, docs/12 wins.

*"AI-forward" is not a tagline; it's the margin engine. Target: one pod of 3 delivers what a traditional 15-person agency delivers, at ≥60% gross margin.*

**Operating rule:** if a task is done twice, it gets a prompt template; if it's done weekly, it gets an automation; if it's done for every client, it gets a productized workflow with a QA checklist.

---

## 1. Stack v1.1 (upgraded per docs/12–13; two-zone doctrine + tiered models)

**Zone A — Trust perimeter (client-facing, client data · conservative by design):**

| Layer | Tool (primary / fallback) | What it does for us |
|---|---|---|
| **T1 client-facing LLM** | Frontier-grade small model (Claude Haiku-class API), retrieval-first — model only phrases; facts come from the client KB | Concierge conversations; anything a buyer reads in real time. 100% pass on the sandbox QA harness required before deploy |
| **WhatsApp/IG transport** | **Meta OFFICIAL Cloud API + IG Messaging API only** (docs/12 §1 ruling — never unofficial gateways) | Concierge channels, template compliance, chat-to-CRM logging; number warm-up protocol per docs/11 §3 |
| **Concierge brain** | Bake-off winner: Dify vs. n8n-native agents vs. Flowise (sandbox/apex-gardens harness decides) | RAG over client-warranted KB; escalation logic |
| **Voice (client-facing)** | ElevenLabs production track / TTS-bench winner as cost-down (Chatterbox, XTTS-v2, Fish Speech…) | Voice-Note Concierge; voiceovers; cloning only with written consent |
| **Data + Document Vault** | Airtable/Sheets KBs + CRM · S3-class storage, expiring signed URLs, watermarked PDFs | Client KBs, pipeline, secure doc delivery with access logs |

**Zone B — Engine room (internal · public/fictional/our-own data · cheapest capable tool wins):**

| Layer | Tool | What it does for us |
|---|---|---|
| **T2 bulk generation** | DeepSeek V4 Flash / Qwen / GLM-class APIs (5–30× cheaper) | Content-pack first drafts, ad-variant brainstorms, summaries, lead tagging, QA test generation — all human-QA'd before use |
| **T3 agentic ops (Agent DMZ)** | OpenClaw-class agent, Kimi-class brain, contained per docs/13 §2 | Red Team Engine (attacks our Concierge) · Market Intel Analyst (corridor sweeps) · Prospect Research Desk |
| **Partner ops** | Claude (API + apps) / Claude Code workflows | Strategy, analysis, weekly packs, scorecard commentary, repo upkeep |
| **Automation glue** | **Self-hosted n8n on VPS** (replaces Make/Zapier — unlimited runs, ₦10k/mo) + Google Workspace | Lead routing, report generation, approval flows |
| **Image/creative** | Canva Pro + image-gen per task tier (frontier for client brand work, open models for internal drafts) | Ad variants, brand templates, staging visuals |
| **Video** | CapCut Pro + AI assist (captioning is non-negotiable — property Reels are watched muted) | Reels at volume |
| **CRM (ours)** | Airtable + pipeline.csv mirror (HubSpot free only if a client workflow demands it) | Our pipeline + templated client pipelines (Propel OS) |
| **Ads** | Meta Business Suite, Google Ads, TikTok Ads + AI creative testing | Humans set strategy/budgets; AI generates variants |
| **Analytics/reporting** | Looker Studio + scorecard template | Live dashboard per ₦600k+ client; weekly auto-scorecards |

*Procurement rules: prefer NGN-billed or one-time-cost tools where quality is equal; annual plans only after a tool survives 90 days; every tool named in the quarterly stack re-scan (docs/12 §5) or it dies. Hard line: client PII never to third-country APIs without NDPA assessment (docs/13 §3).*

---

## 2. AI-Powered Delivery Workflows

### W1 — Client Content Engine (weekly, per client)
1. **Intake:** client sends raw material via WhatsApp (site videos, voice notes, new listings) → auto-filed to client drive.
2. **Generate:** Claude workflow produces the weekly pack from the client's style guide + content pillars: post copy, Reel scripts, hooks, hashtags, story sequences — in the client's voice, with Lagos-market language ("C of O", "off-plan", "Ibeju-Lekki corridor") baked into prompt libraries.
3. **Produce:** producer edits video/creative (AI-assisted cut, captions, brand overlay).
4. **QA (human, non-negotiable):** checklist — factual claims verified against client-supplied docs, no fair-housing/ARCON-risky claims, price/title statements client-warranted.
5. **Approve:** client gets preview link on WhatsApp; one-tap approve/comment.
6. **Publish & log:** scheduled via publishing tool; assets logged to the client library.

**Target throughput:** producer + AI = 10–12 clients' weekly packs. Traditional agency equivalent: 4–5 clients per creative.

### W2 — Listing Turbo (per property, <2 hours)
Photos/video + property facts in → full listing package out: platform-optimized copy (IG/TikTok/portal versions), 2 Reel edits, 6 ad variants, WhatsApp broadcast blurb, and a diaspora-targeted long caption. This is the demo we sell with.

### W3 — AI Lead Concierge (Propel OS product)
Ad/DM leads hit WhatsApp → AI qualifies (budget band, preferred area, cash vs. mortgage, timeline) → scores and routes hot leads to the agent with a context summary; nurtures the rest with drip content. Human handoff is explicit and fast — Lagos buyers will not tolerate a bot that overstays.

### W4 — Audit Video Machine (sales)
Prospect's handle in → AI-assisted teardown (profile, content, funnel gaps benchmarked against our vertical playbook) → partner records 60-second video over generated talking points. 15 minutes per prospect; our highest-converting sales asset.

### W5 — Reporting Autopilot (weekly, all clients)
Campaign + platform data pulled → scorecard (leads, DMs, inspections booked, cost/qualified-lead) → Claude drafts plain-English commentary ("what happened, why, what we're changing") → account lead reviews 5 minutes → auto-sends Friday. Nobody writes reports from scratch, ever.

---

## 3. Internal AI Operations

- **Sales:** proposal generation from call notes (template-locked, 15 minutes); CRM hygiene automations; objection-handling brief per prospect segment.
- **Knowledge:** every campaign's results feed a benchmarks library (cost/lead by area, format performance by segment) — within 12 months this proprietary Lagos dataset *is* the moat.
- **Hiring & training:** playbooks written as prompts + SOPs; new producers ship client-grade work in week 2 because the system, not the person, carries the standard.
- **Finance/admin:** invoice generation and payment-chase sequences automated; monthly P&L variance summary drafted by AI, reviewed by Partner A.

---

## 4. Governance & Guardrails

1. **Human QA on everything client-facing.** AI drafts; humans are accountable. The QA checklist is a contractual internal SLA.
2. **No fabricated property claims.** Facts (price, title status, dimensions, amenities) come only from client-warranted documents. AI never invents specifics; unverified = not published.
3. **Disclosure & data:** comply with NDPA on lead data (consent capture, minimal retention, client data-processing terms). No client data in consumer AI tools outside approved API/workspace channels.
4. **Voice/likeness:** written consent before any voice cloning or avatar use of a client's likeness.
5. **Platform compliance:** ad creatives pass a compliance review (ARCON sensitivity, Meta housing-ads policies) before spend.
6. **Kill-switch metric:** if AI-assisted output requires >30% rework in QA for two consecutive weeks, the workflow is pulled back to manual and re-engineered.

---

## 5. The Compounding Plan

| Horizon | AI position |
|---|---|
| Months 1–6 | Efficiency: same services, fraction of the cost base |
| Months 6–12 | Product: AI concierge + reporting as sellable, sticky add-ons (Propel OS) |
| Months 12–24 | Moat: proprietary benchmarks + creative-performance dataset by Lagos micro-market; possible white-label SaaS tier |

Competitors will adopt the same tools eventually. They won't have two years of vertical data, a prompt/creative library tuned to Nigerian real estate, or the brand. That's the plan.
