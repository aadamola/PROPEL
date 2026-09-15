# Phase 1 — go-live runbook

*The cutover from Phase 0 (a human with Saved Replies) to Phase 1 (the automation). Written to be read on the day, in order.*

---

## The one rule of cutover

> **Phase 0 and Phase 1 must never both be answering.**

The moment the workflow goes active, every comment and DM gets an automatic reply. If anyone is still working the inbox manually at that point, buyers receive **two messages** — and a bot and a human contradicting each other in the same thread is worse than either alone.

So the switch is a moment, announced, not a drift.

**The Saved Replies do not get deleted.** They stop being the first response and become the tool for working escalated threads by hand. Same words either way — that was the point of generating them from the same table.

---

## Pre-flight — all of it green before you activate

| # | Check | How you know |
|---|---|---|
| 1 | **Step 0 test passed** — a dev-mode app in a portfolio can DM an outside account | You sent one and it arrived |
| 2 | Privacy policy live at `getpropel.tech/privacy.html` | Loads in a browser |
| 3 | Data-deletion page live at `getpropel.tech/data-deletion.html` | Loads in a browser |
| 4 | Both URLs pasted into the Meta app's Basic Settings | Saved without error |
| 5 | Ledger tables exist | `\dt` shows `lead` and `lead_event` |
| 6 | `03` CORE imported, saved, **id copied** | Id in the URL |
| 7 | `06` ledger + escalation imported, saved, **id copied** | Id in the URL |
| 8 | Both ids pasted into `05`'s sub-workflow nodes | No `REPLACE_WITH_…` left anywhere |
| 9 | n8n credentials set: **Postgres**, **SMTP**, **Header Auth** (`Authorization: Bearer <IG token>`), **Query Auth** (Gemini) | Each shows a green test |
| 10 | `SHALOM_PARK_APP_SECRET` + `META_VERIFY_TOKEN_SHALOM_PARK` in `/opt/propel/.env` | `docker compose up -d n8n` ran clean |
| 11 | `node tools/test-all.js` | **133 passing** |

```bash
cd /opt/propel
docker compose exec -T postgres psql -U propel -d n8n -f - < ops/concierge/sql/001-attribution-ledger.sql
```

**Two tests on the webhook, and do the second one — it is the one people skip:**

```bash
curl "https://engine.getpropel.tech/webhook/shalom-park-ig?hub.mode=subscribe&hub.verify_token=REAL&hub.challenge=hello123"   # expect: hello123
curl "https://engine.getpropel.tech/webhook/shalom-park-ig?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=hello123" # expect: Forbidden
```

The first proves it works. **The second proves it isn't open to the entire internet** — without the token check, anyone can point their own Meta app at our endpoint and write fabricated buyers into the commission ledger.

---

## The cutover, in order

**Pick a weekday morning.** Not a Friday, not an evening — you want Collins reachable and a full day to watch it.

1. **Tell the team.** One message: *"The Instagram assistant goes live at 10am. From then on it answers first — please don't reply to comments or DMs unless I hand one to you."*
2. **Clear the decks.** Answer anything already waiting, so nothing half-handled is in the inbox when the bot wakes up.
3. **Activate `06`** (ledger + escalation) — it must be live before anything calls it.
4. **Activate `05`** (Instagram channel). 🟢
5. **Subscribe the webhook** in the Meta app: `comments` and `messages`.
6. **Send the first message yourself**, from your own Instagram, to the business account: `price`.

### What good looks like within about 10 seconds

- You get the price card in your DMs
- n8n shows one execution, all green
- `SELECT count(*) FROM lead;` returns 1
- `SELECT event_type, payload->>'rule_id' FROM lead_event ORDER BY event_id DESC LIMIT 1;` shows `qualified` / `SP-PRICE-GEN`

Then comment `CONDO` on a real post from a second account:
- Public reply appears: *"Just sent you a DM"*
- The condo card arrives in that account's DMs
- An email lands at `sales@shalomparknigeria.com`, because `SP-2B` escalates

**If all four happen, you are live.**

---

## The first hour — watch, don't walk away

| Watch | Where | If it's wrong |
|---|---|---|
| Executions all green | n8n → Executions | Open the red one; the failing node names itself |
| No double replies | The Instagram inbox | Someone is still answering by hand. Stop them |
| Public replies contain no figures | The post | Should be impossible — the linter blocks it. Tell me immediately if it happens |
| Leads appearing | `SELECT count(*) FROM lead;` | Postgres credential, or `06` not active |
| Alert emails arriving | `sales@shalomparknigeria.com` | SMTP credential |
| Nothing sent twice to one comment | The post | The send gate keys on comment id — tell me |

---

## Rollback — one switch, about five seconds

> **n8n → `05 Instagram channel` → toggle Active off.**

That is the whole rollback. Meta stops getting a 200, the automation stops answering, and you are back to Phase 0 with the Saved Replies still sitting in the app. **No data is lost** — everything already recorded stays in the ledger.

**Roll back without hesitating if:** the assistant states a figure that isn't in the pack · a public reply contains a price · anyone gets two replies · the client asks you to.

Roll back first, diagnose second. It costs nothing and the inbox is still covered.

---

## Monitoring

**Uptime Kuma** (already in the stack at `status.getpropel.tech`):

| Monitor | Check | Every |
|---|---|---|
| Webhook alive | `GET /webhook/shalom-park-ig?hub.mode=subscribe&hub.verify_token=REAL&hub.challenge=ping` → body contains `ping` | 5 min |
| n8n up | `https://engine.getpropel.tech/healthz` | 5 min |

**Weekly, on the ledger:**

```bash
docker compose exec -T postgres psql -U propel -d n8n -f - < ops/concierge/sql/002-verify-ledger.sql
```

Expect `VERDICT | INTACT — every event verifies`. This is the thing that makes a commission claim evidence rather than an assertion — and it is written in plain SQL specifically so **the client's own auditor can run it too.** A chain only we can check is not proof.

---

## The first week

| Day | Do |
|---|---|
| 1 | Watch the first hour. Then check executions twice more |
| 2 | Read every conversation end to end. **Anything a buyer typed that hit no rule is a missing trigger — send it to me** |
| 3 | Confirm alert emails are being *acted on*, not just delivered |
| 5 | First scorecard to the client: comments, DMs, leads handed over, inspections booked |
| 7 | Run the ledger verification |

**The measurement carries over from Phase 0.** `phase0-log.csv` keeps running by hand for the first week alongside the automatic ledger — two records of the same week is how you find out whether the automation is actually catching everything a human would have.

---

## Known gaps, named rather than discovered later

| Gap | Impact | Plan |
|---|---|---|
| **Alerts are email, not a phone buzz** | A sales inbox gets checked; a phone gets answered. This is a real cost of dropping the WhatsApp API | SMS via a Nigerian gateway, ~₦4/message — about ₦2,400/month at 20 leads a day. Set `alerts.sms_provider` and it switches |
| **No 15-minute unclaimed sweep yet** | A lead nobody picks up stays unpicked; the roster escalates to Tobi only when asked | Scheduled workflow, next build |
| **Dedup lives in workflow memory** | An n8n restart clears the "already replied" set, so one comment could get a second private reply after a restart | The `provider_message_id` unique index already catches the duplicate in the ledger. Move the gate to Postgres when volume justifies it |
| **Graph API version pinned at `v21.0`, unverified** | If that version is retired, calls fail | Confirm during the Step 0 test and update `clients.json` `_meta.meta_graph` — one place, never in a node |
