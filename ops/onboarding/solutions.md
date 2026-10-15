# Known problems and their fixes

*Every entry happened to us at least once, mostly during the Shalom Park build. Symptom first, because that's what you'll be looking at. **If something new breaks, it gets added here the same day.***

## Server and n8n

| Symptom | Cause | Fix | Now prevented by |
|---|---|---|---|
| `node: command not found` on the VPS | The VPS has Docker only, by design | Never install a runtime. Use `bash /opt/propel-repo/ops/setup/vps-tools.sh <command>`, which runs Node in a throwaway container | vps-tools.sh |
| n8n: *"access to env vars denied"* | `N8N_BLOCK_ENV_ACCESS_IN_NODE` defaults to blocked; the August compose file predates the setting | `vps-tools.sh n8n-env` (writes a validated override; never hand-edit `docker-compose.yml`) | `doctor` shows ✓/✗ |
| Handshake returns **200 to everyone**, wrong token included | Code nodes can't `require('crypto')` unless `NODE_FUNCTION_ALLOW_BUILTIN` lists it; the node throws and n8n's fallback reply is 200 | `vps-tools.sh n8n-env` | Preflight fails any `require()` outside the allow-list |
| n8n won't Publish: *"3 nodes have issues"* | The Instagram send nodes have no credential yet | Create the `<Name> IG` Header Auth credential with `Bearer PENDING-META-APP`; swap in the real token later | Playbook step 22 |
| Webhook returns **404** | Workflow not published, or Meta pointed at `-wa` instead of `-ig` | Publish the client's `05`; check the callback URL ends `-ig` | Handshake check 1 |
| A new client's secret isn't visible to n8n | The override is written from `.env` at the time you run it | Add the secret to `.env`, then **re-run** `vps-tools.sh n8n-env` | `doctor` lists every client var |
| Hostinger: *"CPU limitation activated"* | Flowise crash-looping at ~99% CPU | `cd /opt/propel && docker compose stop flowise` (it isn't used yet). Don't pay to "remove limitations"; it recovers on its own | Flowise kept stopped |
| Hostinger offers "Install Docker Manager" | — | **Decline.** It's irreversible and fights our hand-rolled compose setup | CLAUDE.md ruling |
| `engine.getpropel.tech` not loading | DNS, Caddy/TLS or n8n down | `vps-tools.sh web` shows which layer, with the Caddy log | — |
| Workflow calls a sub-workflow that "doesn't exist" | IDs in the channel nodes don't match the imported `03`/`06` | Re-import *into* the existing workflow (keeps the ID); IDs live only in `clients.json → _meta.n8n` | Builder bakes registry IDs in |

## Database (attribution ledger)

| Symptom | Cause | Fix | Prevented by |
|---|---|---|---|
| Schema "applied" but tables missing | psql without `ON_ERROR_STOP` rolls back silently and still exits 0 | Always `vps-tools.sh schema` (sets it) | Every wrapper sets it |
| *"generation expression is not immutable"* | `timestamptz + interval` isn't IMMUTABLE | Expiry is set by a trigger, not a generated column | `tools/test-ledger-sql.sh` on real PG16 |
| Privilege error rolls the whole script back | `pgcrypto` extension needed superuser | Removed. `gen_random_uuid()`/`sha256()` are built into PG13+ | Same test |

## Assistant behaviour

| Symptom | Cause | Fix | Prevented by |
|---|---|---|---|
| Assistant answered a Meta redelivery twice, or answered an unknown client | Guardrails rebuilt its output and dropped `fatal`/`duplicate` | Final node reads the envelope by name; front-door dedup in `05` | Chain tests in `test-core.js` (test chains, not nodes) |
| **A client's lead alert went to another client's inbox** | The shared ledger workflow read one client's addresses | Fixed 2026-10-15: recipients come from the lead's own client; no inbox means a red run, never misdelivery | `test-onboarding.js` ONB-18/19 |
| Card sounds like a machine apologising | Disclaimer copy | Rule: sell, don't disclaim; every card ends in a question | `build-keywords.js` lint |
| Investment card drifts into returns language | Forecast/return wording | Delivered facts only; `SP-ESC-ROI`-style escalate rule outranks it | Guardrail + must_not_say |
| Promo still quoted after the client ended it | Promos without an end | `promo_review_by` makes the automation revert by itself | Lint refuses undated promos |
| **Saved reply still quotes a lapsed promo** | Instagram keeps its own copy; nothing updates it | Swap the 5 promo replies by hand to the ⏰ standard text in the generated saved-replies file | ⏰ markers on every promo card |
| DMs never arrive | No Facebook Page connected, or "Allow access to messages" is off on the phone | Session steps 14b and 14c | Playbook |
| Same buyer counted twice (comment + DM) | Comment author id ≠ DM IGSID (suspected, unverified) | Check during the Step 0 test; reconcile on handle if they differ | Open, tracked in Step 0 |

## People and process

| Symptom | Cause | Fix |
|---|---|---|
| Meta access stalls for weeks | Asked a salesperson, who has neither the documents nor admin rights | Ask *who* can grant admin first (playbook step 13) |
| Client's phone stops working on WhatsApp | A working number was registered to the Cloud API | Never. A WhatsApp add-on always uses a new dedicated number |
| A secret appears in chat | Pasted for "help" | Rotate it immediately. Secrets go straight to `.env` or an n8n credential |
| Alerts land in spam / sender looks foreign | Sending from the client's domain or a personal address | Always `alerts@getpropel.tech`, set up before go-live |
| Prospect is the client's neighbour | Same area as an existing client | Conflict gate: check exclusivity before pitching |
| Date promised, Meta disagreed | Promised before the Step 0 test | No date before Step 0 |
