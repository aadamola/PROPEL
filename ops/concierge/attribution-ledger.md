# Attribution Ledger — design

*The system that proves which buyer Propel produced. Built because commission on a single Shalom Park unit is ₦5.5m–₦6m at 3%, and because the Concierge may run inside the client's own Meta portfolio — infrastructure they can revoke.*

---

## The problem, stated plainly

Commission deals die in one of two ways.

1. **"That buyer was already ours."** The developer's sales team logs every closing as their own. Without a timestamped record of first contact, it's our word against theirs, and they hold the contract.
2. **The evidence disappears.** If the only record of a lead lives inside the client's Meta account and their CRM, then the day a dispute starts, we lose access to the proof at the same moment we need it.

Both are solved by the same thing: **an append-only ledger, on our infrastructure, written at the moment of capture, that neither party can silently edit.**

## Design principles

1. **Dual-write, ours first.** Every lead is written to Propel's Postgres *before* any handoff. If the write fails, the conversation still proceeds — but the failure is alerted, never swallowed.
2. **Append-only.** No updates, no deletes. State changes are new events. A lead's history is the sequence of its events.
3. **Hash-chained.** Each event carries the hash of the previous one. Altering any historical row breaks every hash after it — so "this was edited later" is detectable, by either side.
4. **Shared, not secret.** The client receives the same ledger monthly. This is not surveillance of them; it's a record both parties hold. Shared evidence prevents disputes far better than private evidence wins them.
5. **Minimum PII, lawful basis stated.** We store what a commission claim requires and nothing more.

## Schema

`ops/concierge/sql/001-attribution-ledger.sql`

**`lead`** — one row per buyer, created once.

| Column | Notes |
|---|---|
| `lead_id` | UUID, ours |
| `client_id` | Which client's mandate this falls under |
| `channel` | `whatsapp` / `instagram_dm` / `instagram_comment` |
| `source_ref` | Post ID, ad ID, or campaign tag — what they came from |
| `contact_e164` | Phone in international format. **Required** — it's how a lead is matched to a sale |
| `contact_hash` | SHA-256 of `contact_e164`, for matching without exposing the number in exports |
| `first_contact_at` | Timestamptz — **the field the whole claim rests on** |
| `attribution_expires_at` | `first_contact_at + 12 months` (docs/09 window) |

**`lead_event`** — append-only, hash-chained.

| Column | Notes |
|---|---|
| `event_id` | Monotonic bigint |
| `lead_id` | FK |
| `event_type` | `first_contact`, `qualified`, `unit_interest`, `handoff`, `client_response`, `escalation`, `outcome_reported` |
| `payload` | JSONB — event-specific detail |
| `occurred_at` | Timestamptz |
| `prev_hash` / `row_hash` | The chain |

`row_hash = sha256(prev_hash || event_id || lead_id || event_type || payload || occurred_at)`

**Enforcement:** `REVOKE UPDATE, DELETE` on `lead_event` from the application role. The app can only insert. A trigger recomputes `row_hash` server-side, so the application cannot forge one.

## The monthly reconciliation

On the 1st, automatically:

1. Export every lead whose attribution window is open — first-contact timestamp, channel, source, unit interest, handoff time, and the hashed contact.
2. Send it to the client with one question: **"Any of these closed last month?"**
3. File their reply against the ledger.

This is the mechanism that actually collects commission. Not the contract clause — the monthly habit of asking, with a record attached, before memories diverge. A developer who has confirmed the list eleven times cannot credibly dispute the twelfth.

## Data protection (NDPA)

| | |
|---|---|
| **What we hold** | Phone number, Instagram handle, conversation content, timestamps |
| **Why** | Performance of the marketing mandate and proof of lead attribution — stated in the MSA and in the assistant's first-contact disclosure |
| **Where** | Propel's Postgres, UK (Manchester) — a jurisdiction with adequate protection |
| **Retention** | Attribution window + 12 months, then contact fields purged; the hash chain survives without PII |
| **Exports** | Hashed contact only, unless the client is claiming a specific match |
| **Deletion requests** | Contact fields nulled, ledger row retained with hash intact — the record of *a* lead survives, the person does not |

## Failure modes we designed against

| Failure | Design answer |
|---|---|
| Client revokes our Meta access mid-mandate | The ledger is on our box. It survives the revocation |
| "That lead was ours already" | Timestamped first contact, hash-chained, and they were sent the same record monthly |
| Someone edits history to inflate a claim — **including us** | The chain breaks visibly. This protects the client from us as much as us from them, which is exactly why it's credible |
| The write fails silently during a traffic spike | Insert-then-respond ordering; failures alert to Uptime Kuma rather than passing quietly |
| Buyer asks to be forgotten | Contact fields nulled; chain and claim survive |

## Build status

- [x] Design and schema
- [ ] SQL applied to the VPS Postgres *(needs the n8n login working end-to-end)*
- [ ] n8n sub-workflow: `log_lead_event`, called from every branch of the Concierge flow
- [ ] Monthly reconciliation workflow + client-facing export template
- [ ] Chain-verification script (`tools/verify-ledger.js`) — recompute every hash, exit non-zero on a break
