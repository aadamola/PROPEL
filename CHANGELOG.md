# Propel — Business Changelog

*Dated record of decisions and deliverables. Newest first. Every meaningful session ends with an entry here — if it's not in the changelog, it didn't happen.*

## 2026-07-13 (later⁴) — New private repo created: GL_RADAR

- **At ADEDAMOLA's request, created a new GitHub repository: `aadamola/GL_RADAR`** (private, README-initialized) — https://github.com/aadamola/GL_RADAR.
- Purpose not yet stated; awaiting ADEDAMOLA's brief on what GL_RADAR is for before any scaffolding, docs, or code go into it. Until then it sits outside the Propel operating protocol (this repo remains the single source of truth for Propel).
- No Propel strategy, plans, or state changed in this session.

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
