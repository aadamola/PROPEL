# Jev bake-off (sandbox)

*Question: can TypeSafe's Jev catch the buyer messages our keyword lane misses, without ever sending a safety question to a sales card? Fictional Apex Gardens data only. Started 2026-10-15 at ADEDAMOLA's request.*

## What Jev is

Jev is TypeSafe AI's decision model. It writes nothing. It takes a message plus a typed question and returns a **Choice** (one label from a fixed list), a **Score** or a **Noul** (a yes/no probability), with confidences. Here it gets one Choice question whose labels are our rule ids plus `NONE`.

- Endpoint: `POST https://api.typesafe.ai/v1/systemone`, `Authorization: Bearer $TYPESAFE_API_KEY`. This is taken from TypeSafe's own JS SDK (`typesafe-ai/typesafe-sdk-js`), not from a third-party skill.
- **`jev-ai/jev-agent-skill` is not TypeSafe's.** It wraps a reseller at `thejevai.com` (its SKILL.md says "a REST wrapper around the Jev decision provider"), and that domain did not resolve on 2026-10-15. Don't use it. The official skill is `typesafe-ai/skills`.

## The lanes

| Lane | What it is |
|---|---|
| `keyword` | Today's fast lane (`ops/concierge/lib/keywords.js`), unchanged |
| `jev` | Jev alone |
| `hybrid` | What we would ship. Keyword first, Jev on a miss. **Jev may upgrade a message to an escalation but never downgrade one.** A keyword `escalate_only` hit is final. |

Grades: `correct` · `brain` (no card; the brain answers, which is safe but slower) · `wrong` (wrong sales card) · `over_escalated` (a human gets paged needlessly) · **`unsafe`** (a money, legal or financing question gets a sales card; this is the one hard fail).

**The bar Jev must clear** before we spend any effort vetting TypeSafe: hybrid has zero unsafe routes, gives no more wrong cards than the keyword lane, and recovers at least half the keyword lane's misses.

## Run it

```bash
node bakeoff.js                               # keyword baseline, offline
node bakeoff.js --jev                         # live (TYPESAFE_API_KEY in env)
node bakeoff.js --replay results/<file>.json  # rescore a live run, free
node bakeoff.js --replay results/<file>.json --sweep   # try thresholds
bash ops/setup/vps-tools.sh jev               # live, on the VPS (key read from /opt/propel/.env)
```

Offline tests: `node tools/test-jev-bakeoff.js` (in `test-all`).

A live run is 69 calls at roughly 600 input tokens each, about 40k tokens in total. At TypeSafe's quoted $0.042 per million tokens, that is well under one US cent.

## Keyword baseline (2026-10-15, 69 messages)

| | keyword |
|---|---|
| correct | 32 (46%) |
| brain | 30 (43%) |
| wrong | 2 |
| unsafe | **5** |

The keyword lane catches every exact phrase (12/12) and all of the off-topic messages (10/10). It catches 1 of 24 paraphrases and 0 of 8 typos. **The 5 unsafe routes are the real finding.** For example, "Where do I send the money to?" gets the location card, and "I paid the deposit... can I get it back?" gets the payment-plan card. The same messages run against Shalom Park's real table route the same way (SP-LOC, SP-PAY, SP-PRICE-GEN, SP-2B, SP-LAND). That is a keyword-table fix whatever happens with Jev.

## Rules

- Both input files carry `_meta.fictional: true`, and the harness refuses to call Jev on anything else. Buyer DMs are personal data under the NDPA. TypeSafe has not been vetted as a processor (docs/13 §3: the client-facing data path needs a vetted provider).
- The labels sent to Jev describe what the buyer is *asking*. They never include our answer text or prices.
- Add messages, never delete them. The exam only gets harder.
- Results files hold answers, latency and usage. They never hold the key.
