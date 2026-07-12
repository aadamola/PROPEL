# AI Stack Refresh — July 2026 Ecosystem Scan

*Scan of the open-source/API AI landscape (projects hosted on GitHub, researched via web) against our five delivery workflows. Gate for adoption: production-ready + maintained + runs within the ₦300k envelope/VPS + passes the docs/11 QA standard + one-person operable. Hype fails the gate by default.*

## 1. The strategic finding: WhatsApp transport is a trust decision, not a tech decision

The ecosystem's hottest WhatsApp tooling — **Evolution API** (fastest-growing integration API of the year), **WAHA**, **OpenWA** — is built on the *unofficial* WhatsApp Web protocol (Baileys-style). Free, powerful, n8n/Dify-native… and **against WhatsApp's Terms of Service, with Meta's automated detection intensified through 2025 and numbers reportedly banned within weeks of automated sending.**

**RULING — official WhatsApp Business Cloud API only, for everything client-facing. Non-negotiable.** A Concierge client whose business number gets banned mid-campaign is a client we killed. This becomes a *sales weapon*: most cheap automation vendors in Lagos build on ban-prone unofficial gateways — we publish "built exclusively on Meta's official API" in the Quality Charter and teach the market to ask competitors which API they use. Unofficial gateways are permitted in ONE place: throwaway internal protocol experiments, never client production, never our main number, never the Apex Gardens public demo.

## 2. Adopt / Watch / Reject

| Tool | Verdict | Reasoning |
|---|---|---|
| **Dify** (self-hosted LLM app platform: visual builder + RAG + API) | **ADOPT — evaluate in sandbox days 1–14** | Purpose-built for exactly our Concierge brain: KB-grounded RAG over listing facts + REST API, self-hosted free on our VPS beside n8n. Clean split: Dify = brain/RAG, n8n = logic/integrations, Cloud API = transport. If VPS RAM (likely 2–4GB) chokes running both, fall back to n8n's native AI-agent nodes + external vector store. |
| **n8n AI agent nodes** (already in stack) | **ADOPT (deepen)** | Our orchestration backbone; 2026 releases carry first-class agent/RAG nodes — may make Dify optional. Test both in sandbox, keep the simpler one that passes QA. |
| **Chatterbox** (Resemble's open-source TTS, real-time, light inference) | **ADOPT — experiment track for Voice-Note Concierge** | Modern open-source TTS light enough to matter; if quality on Nigerian-English passes ADEDAMOLA's ear test, voice-note marginal cost → ~zero. |
| **ElevenLabs API** (African-accent voices, cloning) | **ADOPT — production track for voice** | Client-facing voice quality IS the product; open-source Nigerian-accent training data is thin. Production on ElevenLabs now, Chatterbox/XTTS-v2 as the cost-down path. **Voice cloning only with written consent (docs/06 §4)** — clients' own voice as a premium Voice-Note tier is a genuine upsell. |
| **Flowise** | **ADOPT — evaluation track** *(promoted 2026-07-12 on founder direction)* | Third candidate in the Concierge brain bake-off alongside Dify and n8n-native. Cheap to test; three-way bake-off is better science. Production adoption still gated on the QA suite. |
| **Fish Speech / CosyVoice / OpenVoice / XTTS-v2** | **ADOPT — evaluation track** *(promoted 2026-07-12 on founder direction)* | Full bench joins the voice ear-test with Chatterbox + ElevenLabs. Best Nigerian-English quality wins production; cheapest passing option wins the cost-down slot. |
| **Botpress** (open core, multi-channel) | **HELD at WATCH — partner override of blanket-adopt request** | Pure redundancy with the three brains already in the bake-off; pricing gravity pulls to its cloud. **Flip condition:** dialogue complexity exceeds all three bake-off candidates. |
| **"OpenClaw"** (2026's viral agentic assistant, ~380k stars, 50+ tool connectors) | **HELD at WATCH — partner override; do not deploy** | Autonomous broad-tool agents are the architectural opposite of our sell (narrow, KB-grounded, escalating) and unvetted against NDPA obligations on client data. **Flip condition:** passes isolated-sandbox security review AND a client use-case our stack can't serve. Founder may overrule explicitly; the decision will be changelogged with this risk attached. |
| **Evolution API / WAHA / OpenWA** | **REJECT for client production** (see §1) | ToS-violating transport = ban risk we cannot sell. |

**Implementation status (2026-07-12):** the bake-off harness is BUILT and passing — see `sandbox/apex-gardens/`: fictional-estate KB, the binding QA test suites (injection/grounding/policy) as machine-readable data, and a runnable retrieval-first reference prototype (`node concierge-prototype.js --test`, 14/14). Every brain candidate is scored against this same harness; none ships below the baseline. Remaining implementation (VPS deploys of Dify/Flowise, Cloud API connection, TTS bench) requires the physical-world unlocks: VPS purchase, WhatsApp number, and API billing — all on ADEDAMOLA's launch-sprint path.

## 3. Updated reference architecture (Propel Systems v1.1)

```
Buyer (IG DM / WhatsApp)
   → Meta OFFICIAL Cloud API + IG Messaging API        [transport — official only]
   → n8n (self-hosted VPS): routing, validation,        [logic]
        pacing, CRM writes, kill-switch
   → Concierge brain: Dify RAG over client KB           [brain — sandbox eval;
        (fallback: n8n agent nodes + vector store)       fallback path defined]
        LLM: production-grade small model, retrieval-first
   → Voice notes: ElevenLabs (prod) / Chatterbox (exp)  [voice]
   → Airtable/Sheets KB + CRM · S3-class doc storage    [data + Document Vault]
        with expiring signed URLs + watermarking
```

## 4. What changes in the offerings

- **Rate card: nothing.** No price moves on tool changes; margins improve quietly.
- **Quality Charter (docs/11 §3) gains a line:** *"Built exclusively on Meta's official Business APIs — we never risk your number on unofficial gateways."* Sales scripts teach prospects to ask competitors the question.
- **Voice-Note Concierge** gains a premium option: client's own cloned voice (written consent required) — pricing decision after sandbox quality test.
- **Sandbox plan (docs/11 §5) days 1–14 now includes:** Dify vs. n8n-native bake-off on the Apex Gardens KB, scored against the QA suite; Chatterbox vs. ElevenLabs voice-note ear test.

## 5. Standing cadence addition

**Quarterly stack re-scan** (30 min, AI partner): re-run this evaluation against the then-current ecosystem; update verdicts; changelog the deltas. Tool churn in this space is fast — our gate discipline is what keeps it from becoming distraction.

---
*Sources: [Dify/Flowise/n8n self-hosted comparison](https://fast.io/resources/best-open-source-ai-chatbot-frameworks/), [open-source agent platforms 2026](https://clawtank.dev/blog/best-open-source-ai-agents-2026), [WAHA](https://waha.devlike.pro/) / [Evolution API](https://gurusup.com/blog/evolution-api-whatsapp) / [unofficial-API ban-risk analysis](https://achiya-automation.com/en/blog/whatsapp-business-api-guide/), [open-source TTS 2026](https://www.bentoml.com/blog/exploring-the-world-of-open-source-text-to-speech-models), [voice-cloning tools](https://www.resemble.ai/resources/best-open-source-ai-voice-cloning-tools), [ElevenLabs African-accent voices](https://elevenlabs.io/text-to-speech/african-accent).*
