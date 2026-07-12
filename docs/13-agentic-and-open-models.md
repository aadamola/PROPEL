# Agentic Systems & Open-Model Strategy — "Power Inside Walls"

*July 2026. Answers two founder directives: (1) find the innovative, safe uses for OpenClaw-class autonomous agents rather than blanket-holding them; (2) exploit the 2026 Chinese open-model wave (DeepSeek V4, Qwen 3.6, Kimi K2.6, GLM-5.x) for system efficiency. Doctrine: the client-trust perimeter is sovereign; inside our own walls, we run the most aggressive tooling in the market.*

---

## 1. The unlock: split the world into two zones

| Zone | What lives here | Rules |
|---|---|---|
| **Trust perimeter** (client-facing + client data) | Concierge conversations, client KBs, lead PII, Document Vault, anything a buyer or client touches | Frontier-grade model, retrieval-first, docs/11 QA, official APIs, no third-country data transfer without NDPA assessment. **Unchanged. Non-negotiable.** |
| **The engine room** (internal, public/fictional/our-own data only) | Research, drafts, QA attacks, market intel, content generation pre-QA | Cheapest capable tool wins. Autonomous agents allowed **in containment**. This is where we out-tool everyone. |

My earlier OpenClaw hold was correct *for the trust perimeter* and unimaginative *for the engine room*. ADEDAMOLA's push was right. Fixed below.

## 2. OpenClaw-class agents — three contained roles (ADOPT)

**Containment doctrine ("the Agent DMZ") — applies to all three roles:**
isolated container/VPS with no client data, no client-system credentials, no messaging-send capability (drafts only — rule 4 "drafts not sends" applies to agents too), egress limited to public web, outputs land in a review queue, human QA before anything is used, kill switch, action logs kept. Re-scan its security posture quarterly.

### Role 1 — **The Red Team Engine** (best-fit: autonomy is a *feature* in an attacker)
The agent's job is to break our Concierge. It autonomously generates and runs novel attack strategies against the Apex Gardens sandbox — multi-turn social engineering, roleplay traps, encoding tricks, persistence attacks — far beyond our hand-written 6 injection tests. Every successful or near-miss attack becomes a new permanent entry in `sandbox/apex-gardens/qa-tests.json` (the exam only gets harder — rule already in the sandbox README). **This converts the scariest property of autonomous agents — creative unpredictability — into our QA moat.** No other Lagos vendor will be able to say "our bot is adversarially tested by an autonomous red team weekly."

### Role 2 — **The Market Intelligence Analyst**
Weekly autonomous sweep of *public* data: portal listings and price movements by corridor (Island/Lekki/Mainland per docs/11 §2), competitor agency content and ad libraries, new development launches, LASRERA/news signals. Output: a Monday intel brief + a growing corridor benchmarks dataset — which is the proprietary data moat docs/06 §5 promised, now with an engine building it. Feeds Market Saturday content, audit teardowns, and the annual "State of Real Estate Marketing in Nigeria" report (docs/02 milestone 3.3).

### Role 3 — **The Prospect Research Desk**
Autonomous dossier-building on Tier-B prospects from public socials/websites: posting cadence, content quality signals, lead-capture gaps — pre-filling the audit template so my teardown production goes from 15 minutes to 5 per prospect. Human vetting (CAC/NIESV checks) stays manual per rule 5.

**Explicitly still banned:** any agent autonomy inside the trust perimeter — no autonomous client replies, no client-data access, no self-directed outreach sending. Flip condition unchanged from docs/12.

## 3. Tiered model policy (the efficiency engine)

| Tier | Workload | Model class | Why |
|---|---|---|---|
| **T1 — Client-facing language** | Concierge phrasing, anything a buyer reads in real time | Frontier-grade small model (current ruling), retrieval-first | Trust product; hallucination = kill risk; provenance sellable |
| **T2 — Internal bulk generation** | Ad-variant brainstorms, content pack first drafts, scorecard commentary drafts, summarization, lead tagging, QA test generation, research synthesis | **DeepSeek V4 Flash / Qwen 3.6 / GLM-5.x APIs** (5–30× cheaper) | Everything here passes human QA before use anyway (rule 6) — so cheap drafts are free money. Est. effect: content-engine token costs down ~80–90% |
| **T3 — Agentic engine room** | Red Team, Market Intel, Prospect Desk (§2) | Kimi K2.6-class (agentic stability, 2M context) or DeepSeek V4 as the agent brain | Long-session tool-calling stability is the selection criterion, per 2026 benchmarks |
| **T4 — Embeddings/utility** | KB vectorization, dedup, classification | Open embedding models (Qwen family) | Commodity; cheapest reliable wins |

**Data governance line (hard):** client PII, client documents, and anything confidential **never** goes to third-country APIs without an NDPA cross-border assessment — T2/T3 run on public, fictional (Apex Gardens), or our-own data only. This line is also a *sales asset*: "your buyer data never leaves our vetted stack."

**Open models as Concierge brains?** Allowed to *compete*: any open model may enter the bake-off harness. Production requires 100% on injection+grounding suites AND an acceptable data path (self-hosted or vetted regional hosting — not a third-country consumer API). The exam doesn't care about the flag on the model; the data path does.

## 4. What this changes in the money

- Content engine + internal ops token spend: ~80–90% reduction at T2 pricing (pennies per million tokens vs. dollars).
- QA depth: red-team coverage grows weekly at near-zero marginal cost → fewer production incidents → churn armor compounds.
- Benchmarks dataset (Role 2) accelerates the docs/06 §5 moat by ~2 quarters — this is the asset a future SaaS pivot (docs/02 §4.3) is built on.
- Rate card: unchanged, again. Efficiency lands in margin.

## 5. Implementation order (all engine-room items; none blocked on launch sprint)

1. **Now:** T2 adoption — route my internal bulk-generation workflows through cheap-model APIs where quality holds (I A/B my own drafts; QA stays human).
2. **Sandbox days 8–14 (docs/11 §5):** Red Team Engine v1 attacks the Apex Gardens prototype; first harvest of new attacks lands in qa-tests.json.
3. **Month 1:** Market Intel Analyst weekly sweep live → Monday briefs + benchmarks dataset v0.
4. **Month 2:** Prospect Research Desk feeding audit production.
5. **Quarterly:** DMZ security re-scan + model-tier price/quality review (folded into the existing stack re-scan cadence).

*Sources: [Chinese LLM stack compared](https://nextfuture.io.vn/blog/2026-chinese-llm-stack-qwen-deepseek-minimax-kimi-glm-compared) · [open-weight showdown 2026](https://wavect.io/blog/open-weight-llm-comparison-2026/) · [API pricing per 1M tokens](https://www.morphllm.com/llm-api) · [agentic-model comparison](https://lushbinary.com/blog/best-open-source-llms-ai-agents-may-2026-comparison/) · [open-source LLM rankings](https://benchlm.ai/blog/posts/best-chinese-llm).*
