# Shalom Park — Meta Access Pack

*What IFT Realty needs to do so their assistant can go live. Written for a property company, not a technical team. ADEDAMOLA sends; the client acts.*

**Design note for ADEDAMOLA:** this is the step where fast-lane projects die — a confusing technical ask sits in someone's inbox for three weeks. So: one message identifying the right person, then one short call where you do it *with* them on screen share. **Do not send them a checklist and hope.**

---

## Message 1 — find the right person (send first, on its own)

> [name] — quick one, and it's the last thing standing between us and your assistant going live.
>
> The cleanest way to set this up is inside Shalom Park's own Meta Business account, rather than ours. That means Shalom Park owns the WhatsApp number, the Instagram account and every conversation the assistant has — and you can switch our access off in two taps, any time, without asking anyone.
>
> To set it up I need someone who has two things: access to the company's CAC documents, and the authority to grant admin access on Shalom Park's Meta Business account. That's usually a director or whoever manages the company's official accounts.
>
> Who should I be speaking to? Happy to do it on a 20-minute call and walk them through it screen-to-screen — it's quicker than explaining it in writing.
>
> Adedamola · Propel

**Why not Collins:** he's a Sales Executive. He almost certainly holds neither company documents nor account-admin rights, and asking him to obtain both is how this stalls. He's the right person for facts and buyers — not for this.

---

## The 20-minute call — what actually gets done

Do these live, in this order. Each has a visible "done" signal.

### 1. Meta Business account (5 min)

Most companies already have one, half-configured, created by whoever ran their ads. Check first at **business.facebook.com**.

- **Exists?** Confirm the right person is an **admin**, not just an employee.
- **Doesn't?** Create it. Legal name **IFT Realty Ltd**, business email, business address.

*Done when: they can see a Business Settings page.*

### 2. Bring the accounts in (5 min)

Inside Business Settings:

- **Accounts → Instagram accounts →** add the Shalom Park Instagram
- **Accounts → Pages →** add the Facebook Page *(Instagram messaging requires a connected Page — if there isn't one, create it during the call; it takes two minutes)*
- Instagram must be a **Professional/Business** account, and **Settings → Privacy → Messages → Allow access to messages** must be on

*Done when: both appear under Business Settings.*

### 3. Start business verification (5 min)

**Business Settings → Security Centre → Start Verification.**

They'll need:
- **CAC certificate** for IFT Realty Ltd (**RC 640603**)
- A document showing the business address — utility bill, bank statement, or the CAC document if it carries the address
- A business phone number and email that Meta can reach

*Done when: status reads "Pending". Meta takes a few days.*

### 4. Grant Propel access (5 min)

**Business Settings → Users → Partners → Add partner**, using Propel's Business ID *(I supply it — it's a number, nothing sensitive)*.

Assign **only** what's needed:
- Instagram account → **full control**
- Page → **manage messages**
- WhatsApp account → **full control** *(created in step 5)*

*Done when: Propel shows under Partners.*

**Say this out loud on the call, because it's true and it's the thing that makes them comfortable:** they own everything, we're a partner with scoped access, and removing us is two taps in this same screen.

### 5. WhatsApp number decision (make it on the call)

The assistant needs a WhatsApp number, and there's a genuine choice:

| Option | What happens |
|---|---|
| **A new dedicated number** ← recommended | A fresh SIM for the assistant. Their existing sales WhatsApp is untouched. Nothing to lose, nothing to migrate |
| Their existing sales number | **The WhatsApp Business app stops working on that number.** Their team loses the app they use daily. Chat history does not transfer |

**Recommend A without hedging.** ₦500 of SIM against disrupting a working sales team is not a close call.

---

## Pre-session email (send once the right person is identified)

*Operator runbook for the session itself: `ops/setup/SOP-01-client-waba-onboarding.md`.*

> **Subject: 15 minutes to put Shalom Park's 24/7 assistant live**
>
> Dear [name],
>
> We're ready to connect Shalom Park Estate's WhatsApp to the assistant.
>
> One thing worth saying upfront: **we set this up inside IFT Realty's own Meta Business account, not ours.** Shalom Park owns the number, the display name, the verification and every conversation. If we ever stop working together, all of it stays with you — you'd simply switch our access off.
>
> Before the call, please have ready:
>
> 1. **Facebook admin access** to IFT Realty's Meta Business account *(business.facebook.com)* — this needs to be someone with admin rights, not just an employee login
> 2. **The CAC certificate** for IFT Realty Ltd, for Meta's business verification
> 3. **A new, unused SIM** for the assistant, with the phone to hand
>
> On point 3 — this matters, so I'd rather flag it than have it bite us: a number connected to the WhatsApp API **can no longer be used in the WhatsApp app on a phone.** So we must not use Collins' line or any number your team is actively selling on; it would take that line out of service and the chat history doesn't transfer. A fresh SIM costs about ₦500 and avoids the problem entirely.
>
> Session: [date / time] · [link]
>
> Adedamola · Propel
> getpropel.tech

---

## What we do once access lands

| Step | Who | Time |
|---|---|---|
| Create the app in their portfolio, connect the number, wire webhooks | Propel | Same day |
| Load their signed facts sheet as the knowledge base | Propel | Already built — `kb.json` |
| Run the full QA suite: injection, grounding, policy | Propel | Before it speaks to anyone |
| 48-hour supervised launch, every conversation human-reviewed | Both | 2 days |
| Attribution ledger live from message one | Propel | Day one |

**The QA gate is not negotiable and is worth saying to them explicitly:** nothing talks to a real buyer until it has passed the test suite. That sentence is also a sales asset — no competitor in this market can say it.

---

## Open questions to fold into the same conversation

Don't run three separate conversations. One call, these attached:

1. **The care fee** — what the setup fee covered, and when the monthly begins. *Possibly revenue already owed.*
2. **The commission rate** — pin the percentage and the attribution window in writing.
3. **The ₦95m 2-bed price** — still unconfirmed, still blocking any advert.
4. **Title documents** — sight the Governor's Consent and approved layout. Last open vetting gate.
