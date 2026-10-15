# LLM Setup — buying credits and wiring the keys

*The brain is independent of the Meta app — set this up while App Review waits. Ruling behind the choices: docs/13 §3.*

## 1. Get the two keys (~₦7.5k total — one is free)

*Founder swap 2026-08-05: Gemini 3 Flash is T1 primary; Haiku 4.5 is the fallback if Gemini fails QA (docs/13 §3).*

| Provider | Where | Amount | For |
|---|---|---|---|
| **Google (Gemini 3 Flash)** | [aistudio.google.com](https://aistudio.google.com) → Get API key | **FREE** — the free tier covers the entire build and test phase; add billing only when we go live | T1 — everything a buyer reads |
| **DeepSeek (V4 Flash)** | [platform.deepseek.com](https://platform.deepseek.com) → Top up | **$5** | T2/T3 — internal drafts, research, agent brains. **Never buyer conversations** |

DeepSeek takes foreign-currency cards; if your naira card declines, a virtual dollar card (Chipper/Grey-style) is the usual fix.

**Skip Anthropic for now.** Haiku is the fallback — we only open that account if Gemini fails the 14-test QA suite or your ear test.

## 2. Create the API keys

In each console: **API Keys → Create key**. Name them `propel-engine`.

**Paste them nowhere except the server.** Not in chat, not in notes, not in email — a key in a chat transcript is a key you rotate.

## 3. Put them on the VPS (2 min)

```
nano /opt/propel/.env
```

Fill in the two you have (leave `ANTHROPIC_API_KEY=` empty — it's the fallback slot):

```
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=sk-...
```

Save, then reload n8n so it sees them:

```
cd /opt/propel && docker compose up -d n8n
```

Done. Tell me when the keys are in.

## 4. What happens next (mine, no Meta needed)

n8n workflows can be triggered from a **chat panel inside n8n itself** — no WhatsApp required. So the entire brain gets built and proven before Meta ever answers:

1. **Brain workflow**: retrieval-first over the KB → Gemini 3 Flash → guardrails → escalation template
2. **Bake-off** (docs/12): same KB, same test prompts — Gemini 3 Flash vs n8n-native vs Flowise pipelines; scored, not vibed. Haiku enters only as the fallback if Gemini fails
3. **QA suite run** (docs/11): all 14 tests against the winning brain — injection, grounding, policy
4. **Your ear test**: you open the n8n chat and try to break it like a hostile buyer

When the Meta app clears, connecting the already-passing brain to the webhook is a one-node change.

## Cost expectations (so nothing surprises you)

- Testing + bake-off: **₦0** — Gemini's free tier absorbs it; DeepSeek testing is pennies
- Production per client: **$10–25/month** (₦15–40k) against a ₦250k/mo care fee
- Balances visible anytime in each console; Uptime Kuma alerts if the key dies mid-conversation
