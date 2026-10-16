# Client Onboarding Playbook

*The single path from first contact to a live, paid, measured Concierge. Built from everything Shalom Park taught us (July–October 2026). **Follow it in order: every gate exists because skipping it once cost us days.** Problems and their fixes: [solutions.md](solutions.md).*

**Owners:** **A** = ADEDAMOLA (relationships, money, signatures, anything on the server or in a client's Meta account) · **B** = AI partner (everything producible). **Times are ADEDAMOLA's time only.**

**One command starts it:**
```
node tools/new-client.js <slug> "<Business name>" "<Legal name as on CAC>"
```
That creates `clients/<slug>/` with a 14-step tracker, an empty KB, a keyword table and a Phase 0 log, and adds a registry row with **every channel off** and status `onboarding`. Nothing can answer a buyer until Stage D switches it on, and preflight refuses to switch on a client with holes in its row.

---

## The gates (never skipped, never bought)

| Gate | Rule | Cleared by |
|---|---|---|
| 🔒 **Vetting** | Rule 5: we don't market disputed land at any fee | CAC search · title + approval documents **sighted** · site visit |
| 🔒 **Warranted facts** | Rule 2: every fact the assistant states comes from a signed sheet | `ops/templates/warranted-facts-sheet.md`, signed |
| 🔒 **Client conflict** | Don't sell to a client's direct competitor without checking their agreement | Same area or same buyer pool as an existing client → read their exclusivity clause first |
| 🔒 **No date before Step 0** | Meta's verification timing isn't ours | The Step 0 test result (Stage C) |
| 🔒 **One answerer** | Phase 0 (by hand) and Phase 1 (automation) never both answer | The cutover sequence (Stage E) |

**Payment clears the commercial gate only.** It never clears vetting or facts.

---

## Stage A — Win the client

| # | Step | Owner · time | Output |
|---|---|---|---|
| 1 | **Response Test.** They're asked one genuine question and their reply time is logged ([ops/growth/response-test.md](../growth/response-test.md)) | A · 2 min | Row in `ops/growth/response-test.csv` |
| 2 | **Give-first follow-up** with their result, no pitch (Script 2) | A sends · B drafts | They reply → step 3 |
| 3 | **Response Audit** (30 min): their reply time, post → inspection funnel walkthrough, **demo on their phone** built from their public listing | A · 30 min · B builds the demo (≤2 h) and audit pack ([templates/response-audit.md](../templates/response-audit.md)) | Audit pack |
| 4 | **Vetting + conflict check** (gates above) before any proposal | A · 1 h + site visit | Notes in `clients/<slug>/README.md` |
| 5 | **Proposal** from [templates/proposal.md](../templates/proposal.md): one door, priced from [docs/03](../../docs/03-services-and-pricing.md), with commission terms if Launch Partner | B drafts · A sends | Accepted |
| 6 | **Agreement signed** ([templates/msa-sow-skeleton.md](../templates/msa-sow-skeleton.md)) + **setup fee received in full** before build | A | Pipeline row → `CLIENT_PAID` |

Then run `node tools/new-client.js …` (B), and log every touch in `ops/crm/pipeline.csv` the same day.

---

## Stage B — Facts, knowledge base and Phase 0

| # | Step | Owner · time | Output |
|---|---|---|---|
| 7 | **Send the facts sheet** (`ops/templates/warranted-facts-sheet.md`) to the person who can warrant it, with the kickoff message | B drafts · A sends | Signed PDF → `clients/<slug>/docs/` |
| 8 | **Facts-sheet audit**: every blank field becomes an escalation trigger, never an assumption. Every item warranted but not yet sighted goes in `_blocked_until_sighted` | B | `clients/<slug>/02-facts-sheet-audit.md` (pattern: Shalom Park's) |
| 9 | **Fill `kb.json`** only from the signed sheet. Registry: `facts_sheet.signed_by/on/file` | B | KB v1.0 |
| 10 | **Keyword table** `keywords.csv`: escalate-only safety rules first, then fast-lane cards per campaign keyword. Promos carry `promo_review_by` | B | `node tools/build-keywords.js --client=<slug>` green |
| 11 | **Registry row**: escalation (primary / secondary / supervisor with hours), `alerts.email_to` = their sales inbox, `keywords.enabled: true`, Phase 0 `priority_rules` + `faqs` | B, with A confirming names and hours | Registry complete |
| 12 | **Phase 0 live by hand**: load the generated saved replies + FAQs into their Instagram, start `phase0-log.csv`, daily 20-min loop | A · 30 min setup | First week = the baseline. **No target is published until it exists** |

---

## Stage C — Meta access (the long pole)

| # | Step | Owner · time | Done when |
|---|---|---|---|
| 13 | **Find the person who can grant Meta admin.** Usually a director or whoever owns the company's accounts, not a salesperson | A · 1 message (script: `clients/shalom-park/04-meta-access-pack.md` §Message 1) | Named person + call booked |
| 14 | **The 15-min screen-share session** with that person: | A · 15 min | |
|  | a. Business portfolio exists under their legal name | | Business Settings shows it |
|  | b. Facebook **Page** connected (no Page means no Instagram DMs on the classic API) | | Page listed |
|  | c. Instagram account added; on the phone: **Settings → Privacy → Messages → Allow access to messages: ON** | | Toggle green |
|  | d. **Business Verification started** (CAC + address document). Start it, don't wait on it | | Pending |
|  | e. **Add Propel as a Partner** with scoped access: Instagram account + Page messages. Never "full admin" | | Propel under Partners |
|  | f. **Create the app inside THEIR portfolio**, not ours. App contact email `aadamola@gmail.com` | | App listed under their portfolio |
|  | g. **System User → Employee role (never Admin)** → token with `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`, `pages_show_list`, `pages_manage_metadata` → expiry **Never** | | Token generated |
|  | h. App Secret → straight into `/opt/propel/.env` as `<SLUG>_APP_SECRET` (hidden `read -rs` one-liner, then `vps-tools.sh n8n-env`). **Never through WhatsApp, email or chat** | | Stored |
| 15 | **Step 0 test: `vps-tools.sh step0 <slug>`, then `step0 <slug> <outside_ig_username>`** (the outside account DMs the client first; use @getpropel.tech, never an account linked to an app admin's Facebook). It derives and saves the **Page token** (what n8n needs: the workflow sends as the Page) and reads the result: 🟢 sends = fast lane, ship · 🟡 only to app-role accounts = Business Verification is the gate (days) · 🔴 permission error = App Review (weeks). **Also check:** the Graph API version the app exposes (update `clients.json → _meta.meta_graph` if needed), and whether a comment author's id equals their DM id | A runs · B reads the result | **Only now** does the client get a date |

**Privacy + data-deletion URLs** must be live before Meta will save the app: `getpropel.tech/privacy.html` and `/data-deletion.html` (served from `site-legal/` on Vercel). One-time, already covers every client.

---

## Stage D — Build and deploy

*All server commands are pasted by A. B has no route to the server.*

| # | Step | Owner | Command / check |
|---|---|---|---|
| 16 | **Switch on**: registry `status: "active"`, `channels.instagram.enabled: true` | B | — |
| 17 | **Build + test.** Must be fully green, including preflight's registry checks | B | `node tools/build-keywords.js && node tools/build-workflows.js && node tools/test-all.js` |
| 18 | **Merge** to `main` (runbook import URLs point at `main`) | B opens PR · A merges | — |
| 19 | **Pull on the server** | A | `cd /opt/propel-repo && git pull` |
| 20 | **Provision the client**: verify token generated into `.env`, ledger schema applied (idempotent) | A | `bash /opt/propel-repo/ops/setup/apply-client-ledger.sh <slug>` |
| 21 | **Pass the secrets to n8n** (finds every client's token + secret in `.env` by itself) | A | `bash /opt/propel-repo/ops/setup/vps-tools.sh n8n-env` → all ✓ |
| 22 | **n8n credential** `<Name> IG` (Header Auth, `Authorization: Bearer <PAGE token>`, from `/opt/propel/.secrets/<slug>-ig-page-token`, saved by step 0; **not** the system-user token). If the token isn't ready yet, use `Bearer PENDING-META-APP`, because n8n won't publish without it | A | Credential saved |
| 23 | **Re-import the shared workflows** into the *existing* `03` and `06`. Open each → ⋯ → **Import from URL** → Save → Publish. This keeps their IDs. **Both embed the registry, so every new client needs this** | A | IDs unchanged (`clients.json → _meta.n8n`) |
| 24 | **Import** `05-channel-instagram-<slug>.json` as a new workflow. Check that `Concierge CORE` and `Ledger + escalation` show the registry IDs. Attach the IG credential to the 3 send nodes → Save → **Publish** | A | No warning triangles |
| 25 | **Handshake** | A | `bash /opt/propel-repo/ops/setup/vps-tools.sh handshake <slug> ig` → **✅ 3/3** |
| 26 | **Uptime Kuma monitor** on the client's webhook (see `clients/shalom-park/12-phase1-golive.md` §Monitoring) | A · 5 min | Green |

---

## Stage E — Cutover (a weekday morning, never a Friday or evening)

| # | Step | Owner |
|---|---|---|
| 27 | Tell the client's team: *"From 10am the assistant answers first. Don't reply unless I hand you one."* | A |
| 28 | Clear the inbox, so nothing half-handled is waiting | A + client |
| 29 | **Subscribe the webhook** in their Meta app: `comments` + `messages`, callback `https://engine.getpropel.tech/webhook/<slug>-ig`, verify token from `.env` | A |
| 30 | **Phase 0 stops**: saved replies are no longer used by hand | A |
| 31 | **First test message** from your own account (`price`). Within ~10 s: reply received · one green execution · `SELECT count(*) FROM lead WHERE client_id='<slug>'` = 1 · comment test → public "sent you a DM" + DM + alert email on an escalating rule | A |
| 32 | **Watch the first hour.** **Rollback = toggle the client's `05` off** (~5 seconds, nothing lost). Roll back first, diagnose second, if: a figure not in the facts sheet · a public reply with a price · a double reply · the client asks | A |

---

## Stage F — Run (the recurring work that keeps it paid)

| When | What | Owner |
|---|---|---|
| Daily, week 1 | Read every conversation; anything that hit no rule is a missing trigger → B adds it | A reads · B builds |
| Weekly | Ledger verification `vps-tools.sh ledger` → `INTACT` | A |
| Monthly | Monthly report ([templates/monthly-report.md](../templates/monthly-report.md)) from the ledger · facts review with the client's notifier · care invoice | B drafts · A sends |
| On every promo `promo_review_by` date | Re-confirm with the client, or the promo reverts on its own. **Phase 0 saved replies must be swapped by hand** | A asks · B updates |
| Commission (Launch Partner) | Monthly reconciliation: closed sales vs ledger-attributed leads inside the 12-month window | B prepares · A claims |

---

## Channels beyond Instagram

| Channel | Status | Before selling it |
|---|---|---|
| **Instagram** | ✅ Generated per client, tested (21-step rehearsal in `tools/test-onboarding.js`) | Nothing |
| **Email** | Adapter built (`04-channel-email.json`), single-client today | B generalises it per client, as Instagram was (~½ day) |
| **WhatsApp add-on** | Normaliser + tests exist; **no per-client channel workflow yet** | B builds `05-channel-whatsapp-<slug>` from the Instagram pattern (~1–2 days), then SOP: `ops/setup/SOP-01-client-waba-onboarding.md`. **Dedicated new number, never a salesperson's working line** |

**Rule:** don't sell a channel whose row above says it needs building until B confirms it's built and tested.
