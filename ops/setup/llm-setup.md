# LLM Setup — buying credits and wiring the keys

*The brain is independent of the Meta app — set this up while App Review waits. Ruling behind the choices: docs/13 §3.*

## 1. Buy the two credits (~₦25k total, one sitting)

| Provider | Where | Amount | For |
|---|---|---|---|
| **Anthropic (Claude Haiku 4.5)** | [console.anthropic.com](https://console.anthropic.com) → Settings → Billing → Add credits | **$12** | T1 — everything a buyer reads |
| **DeepSeek (V4 Flash)** | [platform.deepseek.com](https://platform.deepseek.com) → Top up | **$5** | T2/T3 — internal drafts, research, agent brains. **Never buyer conversations** |

Both take foreign-currency cards; if your naira card declines on the dollar charge, a virtual dollar card (Chipper/Grey-style) is the usual fix.

**Optional, free:** a Gemini key from [aistudio.google.com](https://aistudio.google.com) — free tier is enough for Gemini 3 Flash to compete in the bake-off before we spend anything on it. Worth grabbing while you're at it.

## 2. Create the API keys

In each console: **API Keys → Create key**. Name them `propel-engine`.

**Paste them nowhere except the server.** Not in chat, not in notes, not in email — a key in a chat transcript is a key you rotate.

## 3. Put them on the VPS (2 min)

```
nano /opt/propel/.env
```

Fill in the three lines that are already there waiting:

```
ANTHROPIC_API_KEY=sk-ant-...
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

1. **Brain workflow**: retrieval-first over the KB → Haiku 4.5 → guardrails → escalation template
2. **Bake-off** (docs/12): same KB, same test prompts — Haiku 4.5 vs Gemini 3 Flash vs n8n-native vs Flowise; scored, not vibed
3. **QA suite run** (docs/11): all 14 tests against the winning brain — injection, grounding, policy
4. **Your ear test**: you open the n8n chat and try to break it like a hostile buyer

When the Meta app clears, connecting the already-passing brain to the webhook is a one-node change.

## Cost expectations (so nothing surprises you)

- Testing + bake-off: **under $2** all-in — prompt caching makes repeated KB testing nearly free
- Production per client: **$10–25/month** (₦15–40k) against a ₦250k/mo care fee
- Balances visible anytime in each console; Uptime Kuma alerts if the key dies mid-conversation
