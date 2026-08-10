# Shalom Park — Business Suite session script

*The live call script. Doctrine and reasoning live in `ops/setup/SOP-01-client-waba-onboarding.md`; this is the thing you read off while sharing a screen.*

**Two parts: 15 minutes alone beforehand, then ~25 minutes with them.** Doing the prep matters — half of these steps stall if you improvise them in front of a client.

---

## PART A — Before the call (alone, 15 min)

### A1. Confirm you have the right person

The call is wasted without someone who has **both**:

- **Admin** on IFT Realty's Facebook/Meta business account (not "manages the page" — admin)
- Access to the **CAC certificate** for IFT Realty Ltd (RC 640603)

**Collins almost certainly has neither.** He's a Sales Executive — right person for facts and buyers, wrong person for this. If you haven't identified the admin yet, send message 1 from `04-meta-access-pack.md` first and stop here.

### A2. The SIM — settle it before the call, not during

Shalom Park needs a **new, unused SIM** for the assistant, with the phone in the room during the call to receive a verification code.

> 🔴 **Never Collins' 08064834680, never any number their team is selling on.** Registering a number to Cloud API **deletes WhatsApp on that handset** and the chat history does not transfer. Taking a working sales line offline to save ₦500 is the single worst thing this project could do to them.

If they turn up without a new SIM: do everything except the number, and finish that part later. Do not "just use Collins' line for now."

### A3. Generate our side (2 min, on the VPS)

```
cd /opt/propel
bash ops/setup/apply-client-ledger.sh shalom-park
```

Creates their verify token and the attribution ledger. Then read the token when the Meta console asks for it:

```
grep META_VERIFY_TOKEN_SHALOM_PARK /opt/propel/.env
```

### A4. Import the WhatsApp intake workflow and **activate** it

Paste `ops/concierge/workflows/01-shalom-park-wa-ingest.json` into n8n → **Save → Activate** 🟢

**Meta tests the webhook the instant you click Verify.** An inactive workflow returns a 404 and the console says "the callback URL couldn't be validated" — which reads like a server problem and isn't.

### A5. Have these open in tabs

- `business.facebook.com`
- `developers.facebook.com`
- Your n8n
- This script

---

## PART B — The call (~25 min)

### Open with this

> "We're setting this up inside Shalom Park's own Meta account, not ours. You'll own the number, the account and every conversation — and you can switch our access off any time in two taps. I'll share my screen and walk you through it; it's about 20 minutes."

That framing does real work. It's the difference between "give an agency access" and "set up your own asset."

---

### B1. The Business portfolio (5 min)

**business.facebook.com** → they log in with the account that has admin.

**If a portfolio already exists** (common — someone made one for ads years ago): confirm the name and legal details are right, and that the person on the call shows as **Admin** under *Users → People*.

**If it doesn't:** *Create a business portfolio* →

| Field | Value |
|---|---|
| Business name | `IFT Realty Ltd` |
| Legal name | `IFT Realty Ltd` |
| Address | `No 1, Shalom Park Estate, Abijo, Ibeju-Lekki, Lagos` |
| Business email | theirs, not yours |

✅ **Done when:** Business Settings opens and shows IFT Realty Ltd.

---

### B2. Bring the accounts in (5 min)

**Business Settings → Accounts:**

1. **Pages** → Add → the Shalom Park Facebook Page. *No Page? Create one now — two minutes, and Instagram messaging requires it.*
2. **Instagram accounts** → Add → the Shalom Park Instagram

Then on the phone: **Instagram → Settings → Privacy → Messages → Allow access to messages: ON**, and the account must be **Professional/Business**, not Personal or Creator.

✅ **Done when:** both appear under Business Settings and the toggle is on.

> Miss the Instagram toggle and the API silently returns nothing later — it looks exactly like a broken integration.

---

### B3. Start verification (5 min) — start it, don't wait for it

**Business Settings → Security Centre → Start Verification**

- **CAC certificate** for IFT Realty Ltd (RC 640603)
- **Address document** — utility bill, bank statement, or the CAC document if it carries the address
- Business phone and email Meta can reach

✅ **Done when:** status reads **Pending**. Meta takes a few days.

**Say this so nobody waits on it:**

> "That runs in the background — it doesn't hold up anything else today. Unverified accounts can still handle 250 conversations a day, which is well above your current volume."

---

### B4. WhatsApp account + the new number (5 min)

**Business Settings → Accounts → WhatsApp Accounts → Add → Create a new WhatsApp Business Account**

| Field | Value |
|---|---|
| WABA name | `Shalom Park Estate WABA` |
| **Display name** | `Shalom Park Estate` |
| Category | Real Estate |

Then **Add phone number** → the **new SIM** → **choose Voice Call, not SMS.**

> Nigerian carrier delivery of international SMS is unreliable and stalls sessions. Meta rings the phone and reads the code aloud. Use voice by default, every time.

**If the display name is rejected** for not matching the legal entity: resubmit as `Shalom Park Estate by IFT Realty`, and supply `shalomparknigeria.com` as evidence of the brand.

✅ **Done when:** the number shows **Connected**.

---

### B5. The app — inside *their* portfolio (3 min)

**developers.facebook.com → My Apps → Create App**

- Type: **Business**
- Name: `Shalom Park Concierge`
- **Business portfolio: IFT Realty Ltd** ← this field is the whole point

> 🔴 **This must be their portfolio, not Propel's.** An app in our portfolio touching their WhatsApp account is cross-business access, and that reopens the Meta App Review queue we're routing around. One dropdown, weeks of difference.

Add the **WhatsApp** product to the app.

Then **App Settings → Basic → App Secret → Show.** You'll need it in B7 — don't read it aloud or screenshot it.

✅ **Done when:** the app exists under IFT Realty's portfolio.

---

### B6. System User + token (5 min)

**Business Settings → Users → System Users → Add**

- Name: `propel_concierge_sysuser`
- **Role: Employee** ← *not* Admin

> An Admin system user can act across their entire business. We need to send and receive messages on one WhatsApp account. Ask for the narrowest thing that works — "why does your marketing agency have admin over our business?" is a question with no good answer.

Then:

1. **Add Assets** → WhatsApp Accounts → `Shalom Park Estate WABA` → **Full control** → Save
2. **Generate New Token** → App: `Shalom Park Concierge` → Expiry: **Never**
3. Scopes: `whatsapp_business_messaging`, `whatsapp_business_management`
4. **Copy the token — it is shown once.**

Also grab the **Phone Number ID** from the app's *WhatsApp → API Setup* page.

✅ **Done when:** you hold the token, the phone number id and the app secret.

---

### B7. Store the secrets — on the server, not in chat 🔒

**Do this yourself, right after the call.** Never paste these into WhatsApp, email or a chat window.

```
nano /opt/propel/.env
```

Fill in:

```
SHALOM_PARK_WABA_TOKEN=<the permanent token>
SHALOM_PARK_WABA_PHONE_ID=<the phone number id>
SHALOM_PARK_APP_SECRET=<the app secret>
```

Then:

```
cd /opt/propel && docker compose up -d n8n
```

---

### B8. Connect the webhook (2 min)

In the app: **WhatsApp → Configuration → Webhook → Edit**

| Field | Value |
|---|---|
| Callback URL | `https://engine.getpropel.tech/webhook/shalom-park-wa` |
| Verify token | the value from `grep META_VERIFY_TOKEN_SHALOM_PARK /opt/propel/.env` |

**Verify and save** → then **Manage** → subscribe to **`messages`** and **`message_template_status_update`**.

✅ **Done when:** a green tick appears.

**If it fails:** the n8n workflow isn't active (A4), or the token has a stray space.

---

### Close the call with this

> "That's it — Shalom Park now owns a verified WhatsApp Business account and the number is yours permanently. Nothing talks to a real buyer until it passes our test suite; I'll run that and show you the results before we switch it on."

**Never let a client leave a setup call thinking the bot is live.** It isn't until QA passes.

---

## PART C — After the call (send me this)

1. ✅ or ❌ for each step B1–B8
2. The **new WhatsApp number** (safe to send — it's public)
3. The display name status: approved / pending / rejected
4. Verification status: pending / approved
5. **Confirmation that the three secrets are in `.env`** — the values themselves stay on the server

Then I run the QA suite against their live setup, and we schedule the 48-hour supervised launch.

---

## If something goes wrong

| Problem | Do this |
|---|---|
| No one on the call has admin | Stop. Reschedule with the right person. Don't create a second portfolio as a workaround — splitting assets across two portfolios is painful to undo |
| No new SIM | Do B1–B3 and B5, leave the number for later. **Never substitute a working line** |
| CAC certificate not to hand | Skip B3, do everything else. Verification can start any day |
| Display name rejected | `Shalom Park Estate by IFT Realty` + the website as evidence |
| Verification code never arrives | Voice call, not SMS. If already on SMS, wait 5 minutes then request voice |
| Webhook won't verify | n8n workflow not active, or a stray space in the token |
