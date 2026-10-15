# n8n workflows

*Built by `tools/build-workflows.js` from the registry (`../clients.json`) and the tested libraries in `../lib/`. **Never hand-edit a generated file**: change the source and rebuild, then `node tools/test-all.js` (includes the import preflight).*

| File | Built? | Purpose | Import |
|---|---|---|---|
| `02-concierge-brain-gemini.json` | hand-made | Chat-panel brain for ear tests; **source of the Guardrails node** every other workflow embeds | Optional |
| `03-concierge-core.json` | ✅ | **The CORE.** Every channel calls it: registry → KB → dedup → prompt → Gemini → guardrails → envelope. **Embeds the registry and every active client's KB** | Once; **re-import into the existing workflow whenever a client is added or a KB changes** |
| `04-channel-email.json` | ✅ | Email channel (IMAP in, SMTP out). Single-client today | When an email client is sold |
| `05-channel-instagram-<slug>.json` | ✅ one per client | Instagram comments + DMs: verify → signature → dedup → keyword fast lane → CORE → send gate → ledger | One per client with Instagram enabled |
| `06-ledger-and-escalation.json` | ✅ | For **every** answered message: alerts the client's own team first, then writes the lead + an append-only event. **Embeds the registry** | Once; re-import when a client is added |

Current workflow IDs live in **one place only**: `clients.json → _meta.n8n`. The builder bakes them into the channel workflows.

## Rules that cost us days to learn
- **Re-import into the existing workflow** (open it → ⋯ → Import from URL → Save → Publish) so its ID doesn't change. A new ID means updating `_meta.n8n` and rebuilding.
- **Newer n8n says *Publish*.** Publish `03` and `06` (they have no public trigger) and each client's `05` (its webhook goes live).
- n8n needs `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`, `NODE_FUNCTION_ALLOW_BUILTIN=crypto` and each client's secrets: all written by `vps-tools.sh n8n-env`.
- Secrets never go in a workflow file. Verify tokens and app secrets live in `/opt/propel/.env`; Instagram tokens live in n8n credentials.

Full path for a new client: [ops/onboarding/README.md](../../onboarding/README.md). Problems: [ops/onboarding/solutions.md](../../onboarding/solutions.md).
