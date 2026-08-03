# SOP #01 — Client WABA Onboarding

*Propel's standard procedure for connecting a client's WhatsApp Business Account to `engine.getpropel.tech`. Architecture and phase structure from ADEDAMOLA's spec (2026-08-01); corrections and security model added below. **Executed identically for every client from #1 onward.***

---

## 1. Ownership model

**The client owns everything. Propel operates it.**

```
IFT REALTY LTD — META BUSINESS MANAGER  (owner: the client)
  ├── WhatsApp Business Account (WABA)
  ├── Phone number + display name "Shalom Park Estate"
  ├── App: "Shalom Park Concierge"  ← created INSIDE their portfolio
  └── System User → permanent token issued to Propel
                              │
                              ▼
        https://engine.getpropel.tech/webhook/shalom-park-wa
                              ▼
              Propel VPS · n8n · KB · attribution ledger
```

**Why this is right:**

- **No asset lock-in for them.** Their number, their display name, their verification, their conversation history. If we part ways they keep all of it — which is the single most persuasive thing we can say in the room.
- **Uninterrupted access for us.** A System User token doesn't expire on a schedule, so the assistant doesn't silently stop working at 2am because a session lapsed.
- **The app lives in their portfolio, not ours** — that's what makes this self-integration and sidesteps the Advanced Access queue.

> ⚠️ **Correction to the source spec: this is not "zero agency liability."** Asset ownership does not transfer liability for what our system says to a buyer. If the Concierge quotes a wrong price, that is ours — which is exactly why the facts-warranty, the liability cap and the QA gate exist in the MSA. Believing otherwise makes us careless. What client ownership actually removes is *their* dependency on us, and that is the thing worth selling.

---

## 2. Pre-flight — the number decision 🔴

**This is where this SOP either protects the client or damages them.**

A number cannot be live on the WhatsApp mobile app and on Cloud API at the same time. Binding a number to the API means **deleting the WhatsApp account on that handset** — the app stops working, and chat history does not transfer.

| Option | Consequence |
|---|---|
| **A new dedicated SIM** ✅ **mandatory default** | Nothing disrupted. ₦500. The assistant gets its own line |
| Collins' number `08064834680` | **His working WhatsApp dies.** He is the primary sales rep — this is his daily tool and his live buyer conversations |

**Ruling: never take a working salesperson's number.** The source spec routed verification through Collins' line; that would have taken a functioning sales channel offline to save ₦500. If the client insists on a number already in use, the SOP stops and ADEDAMOLA escalates before anything is deleted.

*Coexistence (app + API on one number via a solution partner) exists as an alternative — more moving parts, revisit only if a client refuses a new number.*

---

## 3. Phases

### Phase A — Business Manager

1. **business.facebook.com** → confirm or create a Business Manager named **IFT Realty Ltd**
2. Legal name `IFT Realty Ltd` · address `No 1, Shalom Park Estate, Abijo, Ibeju-Lekki, Lagos` · business email · **RC 640603**
3. Confirm the person on the call is an **admin**, not an employee

### Phase B — Business Verification 🔴 *(missing from the source spec — do not skip)*

**Security Centre → Start Verification**, with the CAC certificate and an address document.

Unverified businesses run into messaging limits and stalled display-name approvals. Start it here so it runs in the background while everything else proceeds — it does not block Phase C.

### Phase C — WABA and number

1. Business Settings → **Accounts → WhatsApp Accounts → Add → Create new**
2. WABA name `Shalom Park Estate WABA` · **display name `Shalom Park Estate`** · category **Real Estate**
3. Add the **dedicated** number → **verify by voice call, not SMS**

> **Use voice call by default.** Nigerian carrier SMS delivery for international short codes is unreliable and stalls sessions. Meta reads the code aloud instead. *(Good catch in the source spec — promoted from fallback to default.)*

### Phase D — App and System User

1. **Create the app inside the client's portfolio** — `Shalom Park Concierge`. *(Must be explicit: an app in Propel's portfolio touching their WABA is cross-business access and reopens the App Review requirement. The whole fast lane depends on this one choice.)*
2. Business Settings → **Users → System Users → Add**
3. Name `propel_concierge_sysuser` — **Role: Employee, NOT Admin**

> ⚠️ **Correction: least privilege.** The source spec specified an Admin System User. An admin system user can act across that business — assets we have no business touching. An **Employee** system user with the WABA explicitly assigned at full control can send and manage messages and nothing else. If a client's security reviewer ever asks, "why does your marketing agency have admin over our business?" is a question with no good answer. Ask for the narrowest thing that works.

4. **Add Assets** → the WABA → **Full control**
5. **Generate token** → app `Shalom Park Concierge` → scopes `whatsapp_business_messaging`, `whatsapp_business_management` → **no expiry**

### Phase E — Webhook

| Field | Value |
|---|---|
| Callback URL | `https://engine.getpropel.tech/webhook/shalom-park-wa` |
| Verify token | **Generated per client** — see §4 |

Subscribe: `messages`, `message_template_status_update`.

**The n8n verification workflow must be imported and active before clicking Verify** (`ops/concierge/workflows/`). Meta expects the challenge echoed within seconds.

---

## 4. Credential handling 🔒

> ⚠️ **Correction: the source spec hardcoded `PROPEL_META_VERIFY_TOKEN_2026_SHALOM` in plaintext.** A verify token written into a document that lives in a repo and gets emailed is not a secret. Anyone holding it can subscribe their own traffic to our endpoint.

**Rules:**

1. **Generated, never chosen:** `openssl rand -hex 24`, per client. Predictable tokens with the client's name in them are guessable by design.
2. **Per client, never shared.** One leak must not compromise every client.
3. **Lives only in `/opt/propel/.env`**, mode 600, never in the repo, never in an email, never in chat.

```
SHALOM_META_VERIFY_TOKEN=<openssl rand -hex 24>
SHALOM_WABA_TOKEN=<permanent system user token>
SHALOM_WABA_PHONE_ID=<phone number id>
```

**A never-expiring token needs a policy, since nothing else will catch it:**

| | |
|---|---|
| **Rotation** | Every 6 months, and immediately on any staff change either side |
| **On compromise** | Client revokes the System User in Business Settings — instant, and *they* hold that switch |
| **On offboarding** | We ask them to revoke it. We do not wait to be asked |
| **Audit** | Token age reviewed at the monthly reconciliation |

---

## 5. Attribution wiring — not optional

Every inbound message writes to Propel's ledger **before** any handoff (`ops/concierge/attribution-ledger.md`).

The infrastructure is theirs and revocable. Our commission evidence must not be. At ₦5.5m–₦6m per unit at 3%, evidence living only where the client can switch it off is not evidence. This step is what makes client-owned infrastructure commercially safe for us.

---

## 6. Offboarding — define it before we need it

A professional exit is a sales asset; improvising one is a dispute. On termination:

1. Client revokes the System User token
2. We supply a conversation-history export and the final attribution ledger
3. Webhook subscriptions removed from their WABA
4. **They keep the number, the display name, the verification and the history.** Nothing of theirs leaves with us
5. We retain the ledger for the open attribution window — **commission earned before termination survives it**, per docs/09

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| Display name `Shalom Park Estate` rejected for not matching `IFT Realty Ltd` | Submit `shalomparknigeria.com` as evidence; ensure the site or Instagram states the estate is developed by IFT Realty Ltd. If rejected, resubmit as `Shalom Park Estate by IFT Realty` |
| SMS verification never arrives | **Voice call is the default**, not the fallback |
| Number already in use on WhatsApp | **Stop.** Get a new SIM. Never delete a working sales line |
| Business Verification stalls | It runs in parallel; messaging limits are the symptom. Chase with correct CAC documents |
| Client revokes access mid-mandate | Ledger is on our infrastructure and survives |
| Wrong person on the call | Needs admin rights + company documents. **Collins is a Sales Executive — likely neither** |

---

## 8. KPIs — measurable, and only what we control

| Metric | Target |
|---|---|
| Onboarding session length | ≤ 20 minutes once the right person is on the call |
| Webhook verification | Green on first attempt |
| Token expiry events | Zero |
| Time from token issued → assistant live | ≤ 24 hours |
| QA suite before any real buyer | 100% pass, no exceptions |

> ⚠️ **Removed from the source spec: "display name approved in under 2 hours" and "<500ms latency" as headline KPIs.** Display-name approval is Meta's queue, not our performance — publishing it as a target means owning a delay we cannot influence, and a client will quote it back. Latency is real but not the differentiator; our gap against a human sales team is measured in hours, and we never trade guardrails for milliseconds.

---

## 9. Why this is SOP #01

Every client from #2 onward runs this exact sequence: their portfolio, their number, their verification, our System User, our engine, one webhook path per client. Infrastructure cost per additional client is effectively zero, the client's asset security is identical each time, and onboarding becomes a 20-minute call rather than a project.

*The 20-minute claim holds only once the right person is on the call. Everything in this SOP is fast; finding whoever holds the CAC documents and the admin rights is the part that takes a week.*
