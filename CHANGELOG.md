# Propel — Business Changelog

*Dated record of decisions and deliverables. Newest first. Every meaningful session ends with an entry here — if it's not in the changelog, it didn't happen.*

## 2026-07-28 — 📋 SIGNED FACTS SHEET RETURNED → Shalom Park KB is BUILT

- **IFT Realty returned the facts sheet signed** (Nanameme Collins, Sales Executive, 2026-07-27) — richer than expected: prices, title status, payment terms, escalation roster, restrictions and location detail. **Gate 4 cleared; the hard build blocker is lifted.** Archived at `clients/shalom-park/docs/facts-sheet-SIGNED-2026-07-27.pdf`.
- **KB built and validated: `clients/shalom-park/kb.json`** — every field traces to the signed sheet; **15 unsupplied fields wired as `null` + `escalate_always` entries** so the assistant escalates rather than guesses; their 4 restrictions plus our 2 standing ones in `must_not_say`; escalation routing Collins → Mercy → Tobi with the approved 15-minute unclaimed-hot-lead SMS alert; their "no auto-send layout map / title pages" honoured in config.
- **Warranted and now sayable:** Governor's Consent + confirmed layout approval + **warranted "no litigation, acquisition or dispute"** · 10.37 ha, 27 units + 89 plots, ~30% developed · 4-bed semi ₦185m (3 available) · 2-bed condo ₦95m (**5 of 16 left** — honest scarcity, re-verified weekly before any campaign uses it) · 5-bed off-plan ₦200m · plots ₦125k/sqm · 50% down, 3/6/12-month plans · instant allocation · virtual inspections + diaspora proxy allowed.
- **Audit raised five items (`02-facts-sheet-audit.md`):** 🔴 **the ₦95m 2-bed condo price looks wrong against a ₦185m finished 4-bed semi — confirm before any advert runs** · title documents still unsighted (Gate 2), and no name on the Consent · LASRERA blank · instalment interest/markup entirely blank (the gap buyers hit first) · excluded costs named but unquantified.
- **Two business conversations flagged to the client, once:** their **25% cancellation forfeiture with refund only after resale (+180 days)** is severe — our handling is settled (state it plainly every time, then hand to a human; never bury it), with a recommendation that they test it with their lawyer and consider softening it, since they've ruled out discounts. And their inbound volume is **1–2 enquiries/day**, which reframes the Concierge honestly: at ₦95m–₦200m a unit it is insurance on expensive assets, not a volume reliever — and it points at the real gap, which is traffic (no active campaigns), i.e. the Leads/Launch upsell on the 16-condo inventory.
- Follow-up drafted: `03-followup-questions.md` — eight open fields in one message.

## 2026-07-26 (night) — Site visit done · facts sheet issued as a client-ready document

- **ADEDAMOLA completed the Shalom Park site visit.** Vetting gate part-cleared; CAC search + title-document sighting remain. Four-stage inventory observed first-hand: **3× 4-bed semi-detached (completed) · 16× 2-bed condominiums (under development) · 5-bed semi-detached (off-plan) · serviced plots (bare land)**. Logged as **[OBSERVED — NOT WARRANTED]**: first-hand beats their website, but it still isn't publishable until warranted.
- **Facts sheet converted to a branded Word document** — `clients/shalom-park/docs/Shalom-Park-Property-Facts-Sheet.docx`. Propel-branded cover, eight sections, fill-in fields, signature/warranty page — **and pre-filled with the observed unit mix**, so IFT Realty confirm numbers rather than compose a document. Pre-filled forms come back; blank ones don't.
- **Campaign read from the mix (clients/shalom-park/README.md):** the 3 completed semis are the content engine (only finished units can be filmed — they carry credibility for the units that don't exist yet) · the 16 condos are the volume campaign and the cleanest attribution proof · **off-plan + bare land are where the Concierge earns its fee** (longest, most question-heavy diaspora cycles) · bare land raises the title-diligence bar, since plot sales are where Lagos disputes concentrate.
- *Build note: document verified structurally (23 tables, no adjacent-table corruption, full content) but not visually — LibreOffice is broken in this container and fails even on a minimal file.*

## 2026-07-26 (evening) — 💰 FIRST REVENUE — Shalom Park is a paying client

- **IFT Realty contacted, agreed, and PAID the setup fee.** Marketing-use rights granted — we may name them publicly. Propel's first revenue, from the deal docs/09 was written for. Pipeline stage → CLIENT_PAID. Client file opened: `clients/shalom-park/`.
- **Second SIM registered: 09112714482** — the AI line. 09019120968 stays ADEDAMOLA's human line, unmigrated, per the Cloud API ruling.
- **Gate re-adjudication (partner ruling):** payment clears the *commercial* gate — build for them, name them publicly. It does **not** clear vetting (rule 5: CAC search, title docs sighted, site visit) or warranted facts (rule 2). A client paying us is not evidence their title is clean. Two gates stay shut; build order unchanged.
- **Built to unblock it — two artifacts:**
  - `ops/templates/warranted-facts-sheet.md` — reusable client form doing double duty as **legal warranty and Concierge KB source**. Sections A–H: entity, development, title & approvals, units/prices, payment, delivery, an explicit *"things the Concierge must NOT say"* section, and a **change-notification clause** that puts stale-fact liability where it belongs. Design principle: **blank is safe, wrong is not** — unfilled fields ship as escalation triggers, never assumptions.
  - `clients/shalom-park/01-kickoff-messages.md` — three sequenced drafts: confirmation-of-terms (converts a relationship deal into a written record without stalling goodwill — a "confirmed" reply counts), the facts-sheet request framed as *build input, not paperwork*, and a held-back access request.
- **Marketing-rights ruling recorded:** publishable today = the client relationship and the work-in-progress. Not publishable = any price/title/unit/availability fact (needs the sheet) or any result (we've delivered nothing yet). Site Featured Projects flipped `data-live="true"` with the relationship claim only; every figure stays off the page.
- **CAC escalated to 🔴:** Meta Business Verification requires registered business documents → gates App Review → gates automation on a *client's* account. **It now blocks a paid deliverable.**
- **Open commercial questions (non-blocking):** exact amount received, care-fee start and rate, commission rate, whether anything is in writing.

## 2026-07-26 (later) — 🏗️ PRODUCTION MODE — the Concierge stops being a demo

- **Number + handle received and wired:** WhatsApp Business **+234 901 912 0968**, Instagram **@getpropel.ng**. All 11 site CTAs now point at the live wa.me link; footer IG corrected; **WhatsApp QR generated** (site/assets/whatsapp-qr.png + .svg, brand colours).
- **Production checklist opened: ops/production-checklist.md** — phased, gated, owner-tagged (Phase 0 foundations → 1 Propel's own live Concierge → 2 Apex Gardens demo instance → 3 Shalom Park pilot 🔒 → 4 care).
- **Partner ruling on "build the real one for them":** build the real *system* now — do **not** point it at Shalom Park's assets yet. No contact, no signature, no warranted facts (rule 2), no vetting (rule 5). Phase 3 is a KB swap + number swap on a system already proven in production, which makes "we go live in days" an honest claim in the meeting instead of a promise.
- **Four production constraints discovered in build research — they change what we PROMISE:** IG comment→DM allows **one** automated private reply per comment (7-day window) · ~200 automated DMs/hour/account · **Advanced Access needs Meta App Review, 5–10 business days** · **Meta Business Verification needs registered business docs → CAC filing is on the critical path**, not background admin. Also: direct-migrating 09019120968 to Cloud API would kill the WhatsApp Business app on it → **second SIM (₦500) for the API rig**, founder's line stays human.
- **Spend flagged per rule 1:** Phase 0 total ≈ **₦60k** first month (SIM ₦500 + domain ₦20k + VPS ₦15k/mo + LLM credits ₦25k) — above the ₦50k gate, awaiting ADEDAMOLA's greenlight. ₦40k of it was already in the storefront plan.
- **⭐ moved to: buy the second SIM.** CAC promoted to loud #1 weekly item on long-clock grounds.

## 2026-07-26 — 🚀 PROPEL IS PUBLIC · Shalom Park brief drafted

- **ADEDAMOLA went live: WhatsApp Business + Instagram are set up.** The launch sprint's hard part is done — the storefront gate (docs/07 §3 / 2026-07-13 changelog) is broken open. Remaining sprint items (TikTok, LinkedIn, manifesto post, Meta Business Suite link) demoted to normal weekly items; none of them blocks anything.
- **Shalom Park brief written and send-ready** (demos/shalom-park/05-concierge-brief.md): two versions (email/LinkedIn primary, WhatsApp short), plain-language, benefit-led, **no specs and no price** — its only job is to book the live demo. Six advantages framed for a developer: instant reply, diaspora time-zone cover, comment capture, sales-team leverage, full enquiry logging, and approved-facts-only safety on official Meta platforms. Sending notes attached (don't quote fees, don't promise TikTok automation, tap-through as the fast fallback).
- **Pipeline:** IFT Realty next action → send the brief, due 2026-07-29, owner ADEDAMOLA.
- **Only blocker on the AI side:** the WhatsApp number + IG handle. They gate the site buttons, the QR code, and the brief's signature line — now the single ⭐ in TODO.md.

## 2026-07-20 — LLM credit ruling: Claude Haiku 4.5 (T1) + DeepSeek V4 Flash (T2/T3)

- **Founder asked which LLM credits we buy (OpenAI vs Claude vs Gemini vs Chinese).** Full July-2026 price sweep run; ruling written into docs/13 §3.
- **Buying:** Claude Haiku 4.5 credit ~$10–15 for the client-facing Concierge ($1/$5 per 1M; prompt caching → cached KB reads ~0.1×, decisive for our big-KB/short-turn traffic shape) + DeepSeek V4 Flash ~$5 for internal bulk & agent brains ($0.14/$0.28 — no Western model within 10×). **Total ≈ ₦22–30k**, inside the tooling gate.
- **Not buying:** OpenAI (GPT-5.6 Luna loses to Haiku on output price with no caching edge), Gemini (3 Flash $0.50/$3 held as named T1 alternate if Haiku disappoints in the bake-off), Kimi/GLM (upgrade paths only). Chinese models stay out of T1 on the NDPA/trust-perimeter line, not price.
- **Per-client production estimate: $10–25/mo (₦15–40k)** — confirms the ₦30–60k COGS / 75%+ margin on Concierge Developer. Purchase trigger = launch sprint (billing needs founder's cards).

## 2026-07-14 — 🔥 Shalom Park requested the DM/comment demo

- **First hot developer signal:** IFT Realty asked for a demo of DM + comment integration. Pipeline stage → DEMO_REQUESTED; target package Concierge Developer (₦1.2m + ₦250k/mo + commission per docs/09).
- **Our-side cost analysis:** tap-through demo ₦0 (exists); live sandbox demo ~₦35k–₦50k one-off (VPS ₦10–15k/mo + LLM credit; official Meta APIs free, comment→DM webhook free). Production COGS ≈ ₦30–60k/mo vs ₦250k/mo care price → 75%+ margin confirmed.
- **Guardrails set:** live demo on OUR Apex Gardens sandbox accounts only — anything on their IG/listings is the paid pilot. TikTok comment automation not promised (API-limited).
- **Launch sprint is now client-critical path** (IG business account + Meta Business Suite are demo prerequisites). TODO flagged.

## 2026-07-13 (later³) — Brand v1 ADOPTED · PRs #2+#3 merged · full asset pack shipped

- **Founder adopted the in-house identity as official Brand v1:** green upward arrow + PROPEL wordmark, navy/green/white. Canva candidates retired to archive.
- **Pack completed** (site/assets/): profile mark, manifesto post, LinkedIn banner, YouTube banner, 4 IG highlight covers, 512px brand mark for favicon/watermarks — every asset the account-setup sprint needs now exists. Website header carries the mark.
- **PR #2 and PR #3 merged** — main holds the complete frozen backend (a merge-snapshot gap orphaned 6 commits; recovered via cherry-pick into PR #3, verified 14/14 tests on merged state).
- **Nothing producible remains before launch.** ⭐ unchanged: the 90-minute go-public sprint.

## 2026-07-13 (later²) — Rental sector: decided, bounded, parked (docs/14)

- Founder raised the rental gap. Partner assessment: generic lettings REJECTED (per-deal agent economics can't sustain retainers; wedge dilution at launch). Two rental-adjacent sub-segments APPROVED as the Phase-2 lane using existing products: **shortlet operators** (occupancy = recurring budgeted pain; Concierge PMF arguably stronger than sales) and **property management firms** (NIESV tribe; vacancy-fill framing). Activation triggers defined; launch copy/rate card untouched. Freeze holds — this was a decision memo, not a rebuild.

## 2026-07-13 (later) — Ops tools shipped: quality rules are now code

- **Stale-reference sweep re-run:** repo is clean — the 5 remaining legacy-tool mentions are decision records (rejections/replacements), which belong. **Root cause of what ADEDAMOLA saw: `main` is stale because PR #2 (11 commits of upgrades) is unmerged. Merging PR #2 is the fix.**
- **Built and tested (tools/):** `pipeline-check.js` (overdue follow-up gate, exits red until cleared) · `listing-intake.js` (rule-2 enforcer — listings BLOCKED from production without sighted docs, written warranty, and clean claims; demo sheet correctly fails with 4 flags) · `scorecard-gen.js` (metrics JSON → honest client scorecard, machine-computed deltas). Zero dependencies; port to n8n nodes on the VPS later.
- QA harness still 14/14. Freeze holds: these are execution systems, not new strategy.

## 2026-07-13 — BACKEND HARDENING COMPLETE → FREEZE. Storefront is next.

- **Founder caught real drift:** docs/06 stack table and two other files still described the pre-upgrade stack (Midjourney/Make/Zapier/HubSpot era). Fixed: docs/06 rewritten as **Stack v1.1** — two-zone layout (trust perimeter / engine room), tiered models T1–T4, official-API-only transport, n8n replacing Make/Zapier, Airtable CRM; docs/10 orchestration + docs/04 CRM lines aligned.
- **Missing artifact created:** ops/templates/msa-sow-skeleton.md — the contract armor every doc referenced but nothing contained (facts warranty, liability cap, indemnity, NDPA processor terms, AI disclosure, kill switch, commission-mandate attribution, lawyer question list). Roadmap 0.5 now has its artifact.
- Indexes trued up: CLAUDE.md source-of-truth table (docs/09–13, demos, sandbox), README (12/13/sandbox/MSA), ops/README directory map.
- Verified: QA harness 14/14 · working tree clean · branch pushed · PR #2 carries everything.
- **BACKEND FREEZE declared:** planning docs are complete and consistent. From this commit, repo changes are execution records (pipeline touches, QA results, campaign data, client artifacts) — not new strategy. New planning docs require a named trigger (docs/02 gates, docs/08 triggers, quarterly re-scans). *Partner note: past this point, more backend polish is procrastination with a clean conscience.*
- **STOREFRONT GATE (the only path now):** ① 90-min go-public sprint (SIM → WhatsApp Business → IG/TikTok/LinkedIn → manifesto post → send me the number) ② domain + VPS purchase (~₦40k) → I deploy site + sandbox ③ CAC filing ④ 10 prospect names → teardowns ⑤ Shalom Park outreach (overdue). All human-hands items; everything producible is done.

## 2026-07-12 (late night) — Agentic + open-model strategy: "power inside walls" (docs/13)

- **Founder pushed back on the OpenClaw hold — and was right.** Two-zone doctrine adopted: trust perimeter (client-facing/client data — rules unchanged, frontier-grade, guardrailed) vs. engine room (internal, public/fictional data — most aggressive tooling in the market).
- **OpenClaw ADOPTED in containment ("Agent DMZ"):** ① Red Team Engine — autonomously attacks our own Concierge; every found exploit becomes a permanent QA test (creative unpredictability turned into our moat) · ② Market Intelligence Analyst — weekly public-data corridor sweeps building the benchmarks dataset · ③ Prospect Research Desk. No client data, no send capability, human QA, kill switch. Client-facing autonomy stays banned.
- **Tiered model policy:** T1 client-facing = frontier (unchanged) · T2 internal bulk generation = DeepSeek V4 Flash/Qwen/GLM at 5–30× cheaper (~80–90% token-cost cut; human QA already mandatory) · T3 agent brains = Kimi-class for agentic stability · T4 embeddings = open models. Hard line: client PII never to third-country APIs (NDPA); open models may compete for the Concierge brain via the bake-off but require a vetted data path.
- docs/12 OpenClaw verdict updated; rate card unchanged (efficiency → margin).

## 2026-07-12 (night) — WATCH-list re-adjudication + bake-off harness BUILT

- Founder directed: flip all WATCH → ADOPT and implement. Partner re-adjudicated item-by-item rather than blanket-flipping:
  - **Promoted to ADOPT (evaluation):** Flowise (joins Dify + n8n-native in a 3-way Concierge brain bake-off) · full TTS bench (Fish Speech, XTTS-v2, OpenVoice, CosyVoice join Chatterbox + ElevenLabs in the voice ear-test).
  - **Held at WATCH (partner override, flip conditions documented in docs/12):** Botpress (pure redundancy) · OpenClaw-class autonomous agent (unvetted broad tool access near client data contradicts guardrail model + NDPA posture). Founder may overrule explicitly; risk will be changelogged with the decision.
- **Implemented today — sandbox/apex-gardens/:** fictional-estate KB · machine-readable QA suites (6 injection attacks, 8 grounding checks, 5 policy behaviors) · runnable retrieval-first reference prototype enforcing the guardrail architecture. **Test result: 14/14 PASS.** This harness is now the exam every production brain must beat; it also powers the public "try it yourself" demo.
- Remaining implementation gated on physical unlocks (VPS, WhatsApp number, API billing) — on the launch-sprint path.

## 2026-07-12 (evening) — AI stack refresh from ecosystem scan (docs/12)

- **Strategic ruling: official WhatsApp Cloud API only for client production.** The ecosystem's hottest gateways (Evolution API, WAHA, OpenWA) ride the unofficial Web protocol — ToS-violating, active Meta ban enforcement. Rejected for production; "official APIs only" added to the Quality Charter as a sales weapon.
- **Adopted for sandbox evaluation:** Dify (self-hosted RAG brain) vs. n8n-native agent nodes bake-off on the Apex Gardens KB; ElevenLabs production track + Chatterbox open-source cost-down track for Voice-Note Concierge (client voice cloning = consent-gated premium tier).
- **Watch (not deploy):** viral autonomous-agent project (~380k stars) — broad tool access contradicts our narrow, KB-grounded guardrail model; Botpress; Flowise; Fish Speech/XTTS bench.
- **New cadence:** quarterly stack re-scan. Rate card unchanged — tool changes improve margin, not prices. docs/06 now points to docs/12.

## 2026-07-12 (later) — Repo audit: sync confirmed, drift fixed

- **Sync verified:** working tree clean · local = origin branch (ce186e7) · PR #2 open/mergeable with all 5 post-merge commits (25 files, +1,015 lines). One merge takes everything.
- **Drift fixed:** CLAUDE.md current-state rewritten (was still founding-week: logo-pick blocker, PR #1 watch) · brand-assets tracker marked superseded by in-house PNGs · docs/01 services list now includes Concierge (+Vault/Voice-Note/Broker Hub pointer) · PR #2 title/body updated to reflect full scope · Shalom Park pipeline follow-up flagged OVERDUE, re-dated 07-15.
- **Surfaced per cadence rule:** Shalom Park outreach is 4 days overdue — it's in this week's TODO with the demo pack ready.

## 2026-07-12 — Feasibility study integrated + binding QA standard (docs/11)

- **Founder-supplied feasibility study critically integrated**, not pasted: corridor market doctrine (Island/Lekki/Mainland) adopted for GTM targeting; institutional QA regime adopted in full and made binding on all Propel Systems delivery (prompt-injection tests, 0% grounding failures, Meta window compliance, number warm-up, race-condition control, latency budgets).
- **Partner corrections:** budget reconciled to ₦300k operating envelope inside docs/07's ₦500k (one source of truth) · ₦120k pre-proof Meta ads deferred to first signed pilot · "PROPEL AI"/propelai.com.ng brand fork rejected (suite named Propel Systems under one brand) · cost-led DeepSeek choice rejected for client-facing production (retrieval-first + production-grade model; hallucinated prices are the kill risk) · all market stats marked [VERIFY].
- **Offering map:** DM bot = existing Concierge (+ speed-to-lead framing) · Diaspora Trust Validator → **Document Vault** add-on (₦200k + ₦50k/mo, with watermarking + access-log intel) · Broker Portal → **Broker Hub** (VALIDATION, ₦600k + ₦150k/mo indicative) · outbound voice calls deferred; replaced at launch by **Voice-Note Concierge** (AI WhatsApp voice replies — Lagos-native, no latency/robocall problems).
- **Innovations added:** QA charter as public marketing asset · fictional "Apex Gardens (Demo)" sandbox estate = publicly usable try-it-yourself demo (complements pitch-only Shalom Park pack) · 30-day sandbox plan with reconciled budget.
- docs/03 + docs/10 + README updated.

## 2026-07-08 (later) — Shalom Park demo pack (spec work = the pitch)

- **Full demo pack built at demos/shalom-park/** — one use case per offering: Presence sample week + 3 written posts · Leads funnel + 6 ad variants + demo landing page (landing-demo.html) · 90-day Launch re-launch concept ("Built like someone plans to live here") · Studio shoot plan (one day → a month of assets) · **interactive Concierge WhatsApp simulation** (concierge-demo.html — the meeting opener) · CONCEPT-watermarked IG post PNG.
- **Rules locked in demos README:** pitch-only until signed (spec work ≠ client work — never faked as social proof); all facts placeholder/[VERIFY] until IFT warrants them; public use only if labeled CONCEPT.
- **Charging model:** demos anchor the hybrid ask — Launch Lite + Concierge Developer ≈ ₦2.4m + ≥3% attributed commission (docs/09 updated with meeting flow).
- Honest-proof sequence: mandate signed → "marketing partner" badge → real numbers → flagship case study.

## 2026-07-08 — Launch assets + Propel Concierge product

- **Decision: go public now, improve in flight.** TODO ⭐ is a single 90-minute launch sprint.
- **Brand assets produced in-house** (Canva connector down; rendered via headless Chromium): site/assets/profile.png (1080²), manifesto.png (1080×1350, Day-1 post), banner.png (LinkedIn). Canva L1–L4 candidates remain optional alternates.
- **New headline product: Propel Concierge** (docs/10) — 24/7 AI agents answering IG/WhatsApp DMs from client-warranted listing facts; qualification, inspection booking, hot-lead handoff. Tiers: Lite ₦450k+₦100k/mo · Pro ₦800k+₦150k/mo · Developer ₦1.2m+₦250k/mo. Rate card (docs/03) and website updated; old OS "AI Lead Concierge" line-item superseded. Strategic role: churn armor, wedge product, attribution engine for commission mandates.
- **Waiting on Adedamola:** the 90-min launch sprint · WhatsApp number to me afterward · prospect names · CAC · Shalom Park contact.

## 2026-07-04 — Website draft + Shalom Park partnership prospect

- **Website draft v1 shipped** (site/index.html): one-page, mobile-first, WhatsApp-first conversion site — hero, trust bar, services, naira pricing, insider-credential section, Featured Projects slot, honest proof section, FAQ. Built from researched high-converting real estate page patterns. Blockers to go live: business WhatsApp number, domain purchase, logo pick.
- **Shalom Park Estate (IFT Realty Ltd) added as Tier-A developer prospect** — desk check verified real, press-covered 2024 launch in Abijo, Ibeju-Lekki. Deal memo with recommended structure (hybrid fee + ≥3–5% commission, attribution clause, exclusivity terms, walk-away lines) and outreach draft in docs/09. Hard gate: CAC + title verification before anything publishes.
- New revenue line named: **Propel Partners** (commission mandates on developer projects).
- Pipeline + TODO updated. All work on PR #2.
- **Waiting on Adedamola:** logo/manifesto picks (⭐) · 10 prospect names · SIM + account sprint · CAC filing · Shalom Park contact person.

## 2026-07-02 (later) — Repo protocol + TODO system

- PR #1 merged: main is now the live business record. Future work ships as small PRs.
- GitHub protocol formalized in CLAUDE.md rule 7 (update → changelog → commit → push, every session).
- TODO.md created as Adedamola's ADHD-aware external brain: one ⭐ next action, time-boxed weekly items, "not yet" quarantine, done log. Maintenance protocol added to CLAUDE.md.
- Current ⭐: logo + manifesto picks (L1–L4 / M1–M4).

## 2026-07-02 — Founding day (all in PR #1)

**Decisions made:**
- Business defined: AI-forward digital marketing for Nigerian real estate (Lagos first). Tagline: "We move property."
- Operating mode: BOOTSTRAP — ₦500k capital, ~20 Adedamola-hours/week, revenue funds everything (docs/07 supersedes docs/01–05 capital assumptions).
- Legal: register CAC Business Name (sole proprietorship) now; upgrade to single-shareholder Ltd on defined triggers (docs/08). Partnership term sheet DORMANT.
- Ethics lines set: no bought followers/engagement pods/fake reviews (ever); property facts only from client-warranted docs; no fake scarcity or milestones.
- Positioning spine: founder is an insider — B.Sc. Estate Management, NIESV exam passed (ESV-track), 5 years industry experience.
- Founder constraints encoded: faceless video content; no soliciting personal network for follows.
- GTM sequence: agents first (weeks 1–6) → flagship surveyor/valuer firm → developers with case studies in hand (months 2–4).

**Deliverables shipped:**
- Full document set: business plan, 24-month roadmap, services & naira pricing, GTM plan, financial model, AI stack (docs/01–06)
- Bootstrap plan (docs/07) + legal structure memo (docs/08)
- Ops layer: operating manual, prompt library P1–P6, templates (proposal, audit, onboarding, scorecard, term sheet), CRM pipeline
- Launch kit: account-setup sprint, 14-day faceless content calendar, social-proof plan
- Brand: 4 logo candidates (L1–L4) + 4 manifesto post candidates (M1–M4) generated in Canva
- CLAUDE.md: AI managing partner standing instructions
- PR #1 opened; AI partner watching it (webhook + hourly check)

**Waiting on Adedamola:** account sprint (45 min) · logo + manifesto picks · CAC filing · first 10 Tier-A prospect names.
