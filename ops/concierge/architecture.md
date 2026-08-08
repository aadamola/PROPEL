# Concierge Architecture

*Multi-channel, multi-client. Designed so that adding a client is a config row and adding a channel is an adapter — never a fork of the brain.*

---

## The shape

```
  WhatsApp ─┐
 Instagram ─┼─► ADAPTER ─► normalise ─► ENVELOPE ─┐
     Email ─┘   (per channel)                     │
                                                  ▼
                                        ┌──────────────────────┐
                                        │  CONCIERGE CORE      │
                                        │  registry → KB       │
                                        │  dedup               │
                                        │  prompt → Gemini     │
                                        │  guardrails          │
                                        │  response envelope   │
                                        └──────────┬───────────┘
                                                   │
                          ┌────────────────────────┼──────────────────────┐
                          ▼                        ▼                      ▼
                   reply on channel        attribution ledger      escalate to human
```

**One brain, many mouths.** Channels differ in how a message arrives and how a reply is sent — nothing else. Everything between those two points is shared, which is why a bug fixed once is fixed everywhere and a guardrail added once protects every channel.

## The four pieces

| Piece | File | Job |
|---|---|---|
| **Registry** | `clients.json` | Every per-client fact: channels, escalation roster, capabilities, policy. **Client #2 is a row here.** |
| **Normaliser** | `lib/normalize.js` | Collapses every channel payload into one envelope. **Channel #4 is a case statement here.** |
| **Core** | `workflows/03-concierge-core.json` | Registry → KB → dedup → prompt → model → guardrails → envelope. Called by every adapter. |
| **Adapters** | `workflows/01` (WhatsApp), `04` (email), IG to follow | Receive, normalise, call core, send the reply |

## Decisions worth recording

**The registry, not the workflow, holds the client.** The alternative — a workflow per client — means eight copies of the guardrail logic and a fix that lands in seven of them. At five clients that's how a bot quotes a wrong price: not a bad model, a stale copy.

**IMAP, not the Gmail node, for email.** Gmail's trigger is faster but locks us to Google and has a reputation for silently not firing. IMAP works for any provider a client already uses, which matters when client #3 runs Microsoft. Trade-off accepted: polling latency of 1–5 minutes on email, which is irrelevant against an industry norm of *hours*.

**Dedup lives in the core, not the adapter.** Meta redelivers webhooks; IMAP re-serves after a reconnect. Both produce the same failure — a buyer answered twice and a duplicated commission row. Putting the gate in the shared path means every present and future channel inherits it.

**Fail closed, loudly.** An unknown client id, an inactive client or a missing KB returns `send: false` with a reason. Nothing degrades into a cheerful generic answer, because a cheerful generic answer about someone's ₦185m purchase is the worst outcome available.

**The envelope is the contract.** Adapters know channels; the core knows conversation; neither knows the other. That separation is what makes the next channel cheap.

## Channel notes

| Channel | Inbound | Reply | Constraint that shapes the design |
|---|---|---|---|
| **WhatsApp** | Signed webhook (HMAC verified) | Cloud API | 24-hour customer-service window; outside it only approved templates |
| **Instagram DM** | Webhook | Send API | Echoes and read receipts must be filtered or the bot talks to itself |
| **Instagram comment** | Webhook | **One** private reply per comment, 7-day window | Hard API limit — the prompt enforces one message and moves to DM |
| **Email** | IMAP poll | SMTP | Auto-replies, bounces and newsletters must never be answered |

**The email filters exist for a specific reason.** Two auto-responders talking to each other is a well-known way to embarrass a client, and it happens at 3am. Six guards catch it: `Auto-Submitted`, `X-Autoreply`, `Precedence: bulk`, `List-Unsubscribe`, no-reply/mailer-daemon senders, and out-of-office subjects. Quoted history is stripped so the model answers the new message rather than re-reading its own last reply.

## Add-on hooks

Provisioned, not built. Each is a flag in `clients.json` and a boolean in the response envelope; turning one on is a registry edit plus a sub-workflow, with no change to the core.

| Add-on | Fires when | Product line |
|---|---|---|
| `voice_notes` | WhatsApp + enabled | Voice-Note Concierge (docs/11) |
| `booking` | Inspection intent detected | Concierge Pro |
| `document_vault` | Documentation question | Document Vault (₦200k + ₦50k/mo) |
| `lead_scoring` | Always, when enabled | Concierge Developer |
| `followup_sequences` | Always, when enabled | **24-hour-window aware — templates outside it** |
| `multilingual` | Always, when enabled | Pidgin / Yoruba / Igbo |

## Scaling path

| Trigger | Move |
|---|---|
| Client #2 | Registry row + KB file. No new logic |
| Channel #4 | A case in the normaliser + an adapter |
| ~5 clients | Split n8n instances — one leaked credential must not expose every client |
| Volume | Dedup moves from workflow static data to a Postgres lookup; the unique index in `001-attribution-ledger.sql` is already the durable backstop |
| Queue depth | n8n queue mode with Redis; the stack already runs Redis |

## Testing

```bash
node tools/test-all.js
```

**61 tests, no API key, no running n8n** — normaliser 17, core 16, guardrails 14, sandbox baseline 14.

The workflows are **generated** by `tools/build-workflows.js`, which embeds the tested library source directly into the node JSON. Shipped code is the tested code, not a copy of it. After editing anything in `lib/`, rebuild and re-run — a passing test against a file that isn't what runs in production is worse than no test.
