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
✅ **Done when:** the last lines read `lead`, `lead_event`, then **`✅ schema applied`**.

**If it fails it now says so and stops.** Earlier it could not: `psql` prints an error, carries on through an aborted transaction, rolls everything back at `COMMIT` — and still exits `0`. A clean-looking run and an empty database. `ON_ERROR_STOP=1` is now set, so the error is the last thing you see.

Anything unexpected:

```bash
bash /opt/propel-repo/ops/setup/vps-tools.sh doctor
```

Prints the containers, the Postgres version, whether your role is superuser, whether the ledger tables exist, and which commit the repo is on. **Send me that output** — it is everything I need.

### Step 3 — create the credentials in n8n

**Credentials → Add credential.** Do these before importing; a workflow with a missing credential shows a red node and the reason is not obvious.

> ⚠️ **Only three of the four can be made today.** The Instagram token does not exist until the Meta app is created, which is the *client session*, not this runbook. Do 3a–3c now; they are what unblock steps 4–6. 3d waits.

#### 3a · `Gemini` — Query Auth
| Field | Value |
|---|---|
| Name | `key` |
| Value | your Gemini API key |

#### 3b · `Propel Postgres` — Postgres
Read the password first:
```bash
grep -E '^POSTGRES_PASSWORD=' /opt/propel/.env
```

| Field | Value |
|---|---|
| Host | **`postgres`** |
| Database | `n8n` |
| User | `propel` |
| Password | from the command above |
| Port | `5432` |
| SSL | disabled |

> 🔴 **Host is `postgres`, not `localhost` and not the server's IP.** n8n runs in a container on the same Docker network as the database, so it reaches it by service name. `localhost` inside that container means the n8n container itself, and the error you get says "connection refused" — which reads like the database is down when it is running perfectly.

**Click Test.** Green before you move on.

#### 3c · `Propel SMTP` — SMTP

**The stack has no mail server** — `vps-bootstrap.sh` never installed one, and running your own on a fresh VPS is the fastest way into a spam folder. So use a real mailbox.

**Create `alerts@getpropel.tech` in Hostinger**, where the domain already lives. Then take the SMTP host, port and encryption **from the screen Hostinger shows you when the mailbox is created** — not from this document. A wrong port here presents as an authentication failure, which sends you looking for the wrong problem.

| Field | Value |
|---|---|
| User | `alerts@getpropel.tech` |
| Password | the mailbox password — **typed into n8n, never pasted into chat** |
| Host | `smtp.hostinger.com` *(confirmed from the Hostinger panel, 2026-09-23)* |
| Port | `465` |
| SSL/TLS | **ON** |

Test it before n8n sees it: `bash /opt/propel-repo/ops/setup/vps-tools.sh smtp` — it asks for the host and password and sends a real email.

> 🔴 **Not the client's domain** (`…@shalomparknigeria.com`) and **not a personal address**. Both erase Propel from the from-line, which is the whole point:
> 1. **Every alert is a Propel receipt.** Twenty a day landing in their sales inbox saying *your assistant found you a buyer* is the drumbeat the commission conversation rests on.
> 2. **Their mailbox is infrastructure they can revoke** — renting the pipe that proves our own worth. Same objection as the attribution ledger.
> 3. **SPF/DKIM rejects sending as their domain** without their credentials.

> ⏱️ **Do this before go-live, not after.** Once alerts are flowing to Collins, changing the sender means the first ones from the new address can land in spam — and a missed lead alert is the exact failure this layer exists to prevent.

**MX records take minutes, sometimes a few hours.** Create the mailbox first, then do 3a and 3b while it settles. If it still hasn't resolved when you reach the import, a Gmail app password on `aadamola@gmail.com` works as a stopgap — **contingency, not plan.**

#### 3d · `Shalom Park IG` — Header Auth ⏸️ *later*
| Field | Value |
|---|---|
| Name | `Authorization` |
| Value | `Bearer <IG token>` |

**Create it when the Meta app exists.** You can import and wire everything else first — the credential just gets attached to the three HTTP nodes in step 6 once you have the token.

### Step 4 — import `03-concierge-core.json`

**New workflow → ⋯ (top right) → Import from URL:**

```
https://raw.githubusercontent.com/aadamola/PROPEL/claude/propel-realestate-marketing-plan-wxjj3x/ops/concierge/workflows/03-concierge-core.json
```

*Fallback: open the link, Ctrl+A, Ctrl+C, click the empty canvas, Ctrl+V.* Then **Save**.
Attach the **Gemini** credential to the `Gemini 3 Flash` node.

> **Already imported one before 2026-09-23? Delete it and import again.** The earlier version answered Meta's redeliveries and unknown clients instead of staying silent — fixed and tested (`CORE-19`–`CORE-24`). Also delete the **August** CORE if it is still there, so exactly one exists.

> **Newer n8n shows *Publish* instead of an Active switch.** On `03` and `06`, **click Publish** — they have no public trigger, so it is harmless, and it removes any doubt about which version a sub-workflow call uses. `05` is still the only one whose webhook goes live.

📋 **Copy its id from the URL** — the part after `/workflow/`.

### Step 5 — import `06-ledger-and-escalation.json`

Same way, from:

```
https://raw.githubusercontent.com/aadamola/PROPEL/claude/propel-realestate-marketing-plan-wxjj3x/ops/concierge/workflows/06-ledger-and-escalation.json
```

Attach **Propel Postgres** to both Postgres nodes and **Propel SMTP** to `Alert the sales team`. **Save**, then **Publish** if your n8n shows the button.

📋 **Copy its id from the URL.**

### Step 6 — import `05-channel-instagram.json` and wire the two ids

```
https://raw.githubusercontent.com/aadamola/PROPEL/claude/propel-realestate-marketing-plan-wxjj3x/ops/concierge/workflows/05-channel-instagram.json
```

**Both sub-workflow IDs are already baked in** (sent back after steps 4 and 5, written to `clients.json`, rebuilt). Just confirm:

1. **`Concierge CORE`** shows `SzWrUVB8WYv3sfE5`
2. **`Ledger + escalation`** shows `oNt2oRixkDbbUa2p`
3. Attach **Shalom Park IG** (Header Auth) to all three HTTP nodes: `Private reply to comment`, `Public comment reply`, `Send IG DM` — *or leave these until the token exists; they only matter at send time*
4. **Save**

✅ **Done when:** the two sub-workflow ids are real and no `REPLACE_WITH_` text remains anywhere on the canvas. *(The three HTTP nodes may still show a credential warning until 3d — that is expected and does not block the import.)*

### Step 7 — secrets on the server, never in chat 🔒

**The verify token is ours — make it now.** The app secret has to wait for the Meta app.

```bash
bash /opt/propel-repo/ops/setup/apply-client-ledger.sh shalom-park
cd /opt/propel && docker compose up -d n8n
bash /opt/propel-repo/ops/setup/vps-tools.sh doctor
```

The first writes `META_VERIFY_TOKEN_SHALOM_PARK` into `.env` without ever printing it (and re-applies the ledger schema, which is harmless — it is idempotent). The last confirms **n8n can actually see it**: look for `✓ N8N_BLOCK_ENV_ACCESS_IN_NODE=false` and `✓ META_VERIFY_TOKEN_SHALOM_PARK set`.

> ⚠️ **If `doctor` shows ✗ on either line** — it did on Shalom Park's server, 2026-09-23 — the compose file there predates these settings. **Do not hand-edit `docker-compose.yml`**: one wrong space and the whole stack refuses to start. Run:
>
> ```bash
> bash /opt/propel-repo/ops/setup/vps-tools.sh n8n-env
> ```
>
> It writes a separate `docker-compose.override.yml` that Docker merges on top, **proves the merged result parses before restarting anything**, rolls itself back if it does not, refuses to overwrite an override it did not write, restarts n8n, and prints the ✓/✗ lines again. Deleting the override undoes it. This is the root cause of *"access to env vars denied"* in August.

**Use the `-ig` webhook address, not `-wa`.** Shalom Park is Instagram-only; the script prints both.

### Step 8 — activate `05` only 🟢

**This is the one toggle.** Meta tests the webhook the second you click Verify, and an inactive workflow returns a 404 that looks exactly like a server fault.

### Step 9 — prove the endpoint, both ways

```bash
bash /opt/propel-repo/ops/setup/vps-tools.sh handshake
```

Three checks, one command. **The token is read from `.env` inside the script and never printed** — not into your shell history, not onto the screen — so the output is safe to screenshot.

| Check | Pass means |
|---|---|
| right token | the challenge comes back exactly, as plain text — **Meta will accept this** |
| **wrong token** | **refused with 403 — strangers cannot subscribe to our endpoint** |
| no token | refused with 403 |

**The second check is the one that matters most and the one people skip**, because the first already looks like success. Without it, anyone can point their own Meta app at our URL and write fabricated buyers into the commission ledger. If it fails, the script says **"Do not go live."** Believe it.

Other answers and what they mean:
- **404 on all three** → `05` is not live yet. Publish it (step 8).
- **403 with the right token** → n8n cannot read the token. Run `vps-tools.sh doctor`.

*Tested 2026-09-23 against the real `Handshake` node code from `05` in four server states — correct, insecure, unpublished, missing env — and diagnosed each correctly. The token appeared in its output zero times.*

### Step 10 — subscribe the webhook in the Meta app

Fields: **`comments`** and **`messages`**. Callback URL as above, verify token from `.env`.

---

## Also required before the Meta app will save

| Check | Where |
|---|---|
| `getpropel.tech/privacy.html` loads — **⚠️ the site is not live yet (2026-09-24); publish these two pages first, they carry no offerings** | Meta app → Basic Settings → Privacy Policy URL |
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
