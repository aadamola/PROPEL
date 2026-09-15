# Phase 1 — go-live runbook

*The cutover from Phase 0 (a human with Saved Replies) to Phase 1 (the automation). Written to be read on the day, in order.*

---

## The one rule of cutover

> **Phase 0 and Phase 1 must never both be answering.**

The moment the workflow goes active, every comment and DM gets an automatic reply. If anyone is still working the inbox manually at that point, buyers receive **two messages** — and a bot and a human contradicting each other in the same thread is worse than either alone.

So the switch is a moment, announced, not a drift.

**The Saved Replies do not get deleted.** They stop being the first response and become the tool for working escalated threads by hand. Same words either way — that was the point of generating them from the same table.

---

## Import sequence — do it in this order

**Order matters for one reason:** a channel workflow pointing at a sub-workflow that doesn't exist yet fails with a message that reads like a code bug.

### Before you start — wake the box up (it has been five weeks)

> *Not to be confused with the **Step 0 test** — that is the Meta dev-mode question, and it is separate.*

```bash
docker compose -f /opt/propel/docker-compose.yml ps    # is the stack still up?
apt update && apt upgrade -y                            # a restart is pending
```

Reboot at a quiet moment. Docker restarts the stack on boot.

### Step 1 — the bundle is already checked ✅

**I run `preflight-workflows.js` every session and it is green.** Nothing for you to do here — it is a check on *my* artifacts, and it belongs on my side of the line.

If you ever want to run it yourself, the VPS has **Docker and deliberately nothing else** — no Node, no language toolchains, so the box stays a boring patchable Ubuntu. So the tools run in a throwaway container:

```bash
# once — the repo is not on the VPS yet
cd /opt && git clone -b claude/propel-realestate-marketing-plan-wxjj3x \
  https://github.com/aadamola/PROPEL.git propel-repo

# then, any time
bash /opt/propel-repo/ops/setup/vps-tools.sh preflight
```

`vps-tools.sh` also takes `test`, `keywords`, `schema` and `ledger`. **Do not `apt install nodejs`** — it adds a toolchain to patch forever for something a container does in three seconds.

### Step 2 — create the ledger tables

```bash
bash /opt/propel-repo/ops/setup/vps-tools.sh schema
```
✅ **Done when:** `lead` and `lead_event` are listed.

*(That wraps `psql -f 001-attribution-ledger.sql` followed by `\dt` — the repo clone from step 1 is what puts the SQL file on the box.)*

### Step 3 — create the four credentials in n8n

**Credentials → Add credential.** Do these before importing; a workflow with a missing credential shows a red node and it is not obvious why.

| Credential | Type | Value |
|---|---|---|
| `Gemini` | Query Auth | Name `key`, value = the Gemini API key |
| `Shalom Park IG` | Header Auth | Name `Authorization`, value `Bearer <IG token>` |
| `Propel Postgres` | Postgres | host `postgres`, db `n8n`, user `propel`, password from `.env` |
| `Propel SMTP` | SMTP | your mail host, from `hello@getpropel.tech` |

### Step 4 — import `03-concierge-core.json`

Build → empty canvas → click canvas → paste the JSON → **Save**.
Attach the **Gemini** credential to the `Gemini 3 Flash` node.

> **It does not need to be Active.** A workflow called by another workflow runs whether or not it is active — Active only matters for triggers. This trips people up constantly. Only `05` needs the toggle.

📋 **Copy its id from the URL** — the part after `/workflow/`.

### Step 5 — import `06-ledger-and-escalation.json`

Same paste. Attach **Propel Postgres** to both Postgres nodes and **Propel SMTP** to `Alert the sales team`. **Save.** Again — no Active toggle.

📋 **Copy its id from the URL.**

### Step 6 — import `05-channel-instagram.json` and wire the two ids

Paste it, then:

1. Open the **`Concierge CORE`** node → confirm the id matches step 4
2. Open the **`Ledger + escalation`** node → replace `REPLACE_WITH_LEDGER_WORKFLOW_ID` with the id from step 5
3. Attach **Shalom Park IG** (Header Auth) to all three HTTP nodes: `Private reply to comment`, `Public comment reply`, `Send IG DM`
4. **Save**

✅ **Done when:** no node shows a red triangle and no `REPLACE_WITH_` text remains anywhere on the canvas.

### Step 7 — secrets on the server, never in chat 🔒

```
nano /opt/propel/.env     # SHALOM_PARK_APP_SECRET, META_VERIFY_TOKEN_SHALOM_PARK
docker compose up -d n8n
```

### Step 8 — activate `05` only 🟢

**This is the one toggle.** Meta tests the webhook the second you click Verify, and an inactive workflow returns a 404 that looks exactly like a server fault.

### Step 9 — prove the endpoint, both ways

```bash
curl "https://engine.getpropel.tech/webhook/shalom-park-ig?hub.mode=subscribe&hub.verify_token=REAL&hub.challenge=hello123"   # expect: hello123
curl "https://engine.getpropel.tech/webhook/shalom-park-ig?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=hello123" # expect: Forbidden
```

The first proves it works. **The second proves it isn't open to the entire internet** — without the token check, anyone can point their own Meta app at our endpoint and write fabricated buyers into the commission ledger. Run both. The second is the one people skip, because the first already looked like success.

### Step 10 — subscribe the webhook in the Meta app

Fields: **`comments`** and **`messages`**. Callback URL as above, verify token from `.env`.

---

## Also required before the Meta app will save

| Check | Where |
|---|---|
| `getpropel.tech/privacy.html` loads | Meta app → Basic Settings → Privacy Policy URL |
| `getpropel.tech/data-deletion.html` loads | Meta app → Basic Settings → Data Deletion URL |
| Test suite **135 passing** | I run it; it is green |

## The cutover, in order

**Pick a weekday morning.** Not a Friday, not an evening — you want Collins reachable and a full day to watch it.

1. **Tell the team.** One message: *"The Instagram assistant goes live at 10am. From then on it answers first — please don't reply to comments or DMs unless I hand one to you."*
2. **Clear the decks.** Answer anything already waiting, so nothing half-handled is in the inbox when the bot wakes up.
3. **Activate `05`** (Instagram channel) — the only workflow that needs it. 🟢
4. **Subscribe the webhook** in the Meta app: `comments` and `messages`.
5. **Send the first message yourself**, from your own Instagram, to the business account: `price`.

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
bash /opt/propel-repo/ops/setup/vps-tools.sh ledger
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
| **A commenter's id and a DM sender's id may not be the same id** | Meta uses different id spaces for comment authors and messaging (IGSID). If they differ, the same person commenting *and* DMing creates **two lead rows instead of one** — which inflates lead counts and weakens an attribution claim | **Check it during the Step 0 test**: comment from an account, then DM from the same account, and compare `contact_id` on the two ledger rows. If they differ, we reconcile on `contact_handle` — which the comment webhook gives us — and I add a merge step |
