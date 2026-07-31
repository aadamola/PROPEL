# Meta Developer App — Setup & App Review Package

*Everything needed to stand up Propel's Meta app, connect WhatsApp and Instagram, and pass App Review. ADEDAMOLA clicks; the written submission content below is ready to paste.*

---

## 0. The dependency chain (why order matters)

```
CAC Business Name  →  Meta Business Verification  →  App Review (Advanced Access)
                                                          ↓
                                          automation on a CLIENT's account
```

**Each arrow is an external clock we don't control.** CAC is days-to-weeks; Business Verification is days; App Review is 5–10 business days. They run in sequence, not parallel.

**What this means practically:** we can build and test everything on **our own** accounts today in Development Mode — no verification needed, because we own the assets. The moment we need to touch Shalom Park's Instagram, all three gates must be green. **That is why CAC is the most urgent item on the board: it is the front of a two-to-four week queue standing between us and a deliverable that has already been paid for.**

Start the queue now, build in parallel.

---

## 1. Create the app

**developers.facebook.com → My Apps → Create App**

| Field | Value |
|---|---|
| Use case | **Other** → **Business** |
| App name | `Propel Concierge` |
| Contact email | ADEDAMOLA's business email |
| Business portfolio | Propel's Meta Business portfolio (create it first if it doesn't exist) |

Attaching the app to a Business portfolio at creation is important — an app created without one is painful to move later, and Business Verification attaches to the portfolio, not the app.

## 2. Add products

**WhatsApp** and **Instagram** (Messenger API for Instagram) from the product list.

WhatsApp gives you a test number immediately — that's enough to build and test the whole flow before the real number is attached.

## 3. Register the AI line

**WhatsApp → API Setup → Add phone number: `+234 911 271 4482`**

Verify by SMS or voice call.

> ⚠️ **Never register 09019120968.** That's ADEDAMOLA's human line — registering it on Cloud API kills the WhatsApp Business app on that number.

## 4. Configure webhooks

**WhatsApp → Configuration → Webhook:**

| Field | Value |
|---|---|
| Callback URL | `https://engine.getpropel.tech/webhook/whatsapp` |
| Verify token | The `META_VERIFY_TOKEN` value in `/opt/propel/.env` |

Subscribe to: `messages`, `message_template_status_update`.

**Instagram → Configuration → Webhook:**

| Field | Value |
|---|---|
| Callback URL | `https://engine.getpropel.tech/webhook/instagram` |
| Verify token | Same `META_VERIFY_TOKEN` |

Subscribe to: `messages`, `comments`, `live_comments`.

**The verification handshake must be live before you click Verify.** Meta sends a GET with `hub.challenge` and expects it echoed back within seconds. I'm supplying the n8n workflow that answers it — import that first, then verify.

## 5. Instagram prerequisites

The Instagram account must be:

- [ ] A **Professional (Business)** account — not Personal, not Creator
- [ ] Connected to a **Facebook Page**
- [ ] Linked in **Meta Business Suite**
- [ ] "Allow access to messages" enabled in Instagram → Settings → Privacy → Messages

Without all four, the Messaging API silently returns nothing and it looks like a code bug.

## 6. Permissions

| Permission | For | Access needed |
|---|---|---|
| `whatsapp_business_messaging` | Send/receive WhatsApp | Advanced (clients) |
| `whatsapp_business_management` | Manage the WABA | Advanced (clients) |
| `instagram_business_manage_messages` | DMs + comment→DM replies | Advanced (clients) |
| `instagram_business_basic` | Account/media read | Advanced (clients) |
| `pages_manage_metadata` | Page webhook subscriptions | Advanced (clients) |

**Standard Access covers our own accounts in Development Mode.** Advanced Access — which requires App Review — is what lets a *client* grant us their account.

---

## 7. App Review submission package

*This is the part that actually gets rejected, and it gets rejected for vague use-case descriptions. Paste these verbatim, adjusting only if the form's wording differs.*

### App description

> Propel Concierge is a customer-service assistant for Nigerian real estate developers and agencies. It responds to property enquiries that arrive through a business's WhatsApp line and Instagram account — answering questions about listed properties, documentation, payment plans and inspection scheduling — and hands qualified buyers to the business's human sales team. It answers only from a factual knowledge base that the property business itself provides and signs off on, and escalates anything outside that knowledge base to a human.

### `whatsapp_business_messaging` — how it's used

> Property buyers message our client's WhatsApp Business number to ask about listings. The assistant replies with information drawn from a factual knowledge base supplied and warranted in writing by the property developer — unit types, prices, payment plans, title documentation, inspection arrangements. It answers only within the customer service window, in response to a message the buyer initiated. When a buyer is ready to purchase, or asks anything not covered by the approved knowledge base, the conversation is handed to a named human sales representative. The assistant never initiates unsolicited messages and never states bank account details.

### `instagram_business_manage_messages` — how it's used

> Property buyers comment on our client's Instagram posts asking about price and availability, and send direct messages with property questions. The assistant sends one private reply to a commenter who has asked a question, and answers direct messages using the same approved knowledge base. Its purpose is to reduce response time for buyers making high-value purchase decisions across multiple time zones, since a large proportion of Nigerian property buyers live overseas and enquire outside Lagos business hours. Conversations are handed to a human sales representative for anything transactional.

### Screencast — what the reviewer must see

Record on the test number, in this order. Reviewers reject for missing the login/permission step more than for anything else.

1. Logging into the Propel dashboard and connecting a business account through the Facebook Login dialog — **show the permission screen itself**
2. A buyer sending a WhatsApp message asking about a property; the assistant answering from the knowledge base
3. A buyer commenting on an Instagram post; the assistant sending one private reply
4. A buyer asking something outside the knowledge base; the assistant **declining to answer and escalating to a human**
5. The human replying

Step 4 is the one that wins reviews — it demonstrates the assistant has a bounded scope rather than an open-ended chatbot.

### Test instructions for the reviewer

> 1. Message the WhatsApp test number provided.
> 2. Ask: "What is the price of the 2-bedroom?" — the assistant answers from the approved knowledge base.
> 3. Ask: "What rental yield will I get?" — the assistant declines to give projections and offers a human, demonstrating its bounded scope.
> 4. Comment "price?" on the linked Instagram test post — the assistant sends one private reply.
> 5. Ask "I want to pay now" — the assistant hands over to a human representative and does not provide payment details.

### Privacy policy and data deletion

Both are **required** and must be live URLs before submission:

- Privacy policy → `https://getpropel.tech/privacy`
- Data deletion instructions → `https://getpropel.tech/data-deletion`

*Not yet written — I'll draft both against NDPA requirements; they ship with the site deploy. Submission is blocked without them.*

---

## 8. Rejection risks, and how we've pre-empted them

| Risk | Our position |
|---|---|
| "Unclear how the permission is used" | Use-case text above is concrete and names the actual buyer journey |
| "Automated messaging without user intent" | Every reply is a response to a buyer-initiated message or comment. We never cold-message |
| "Bot impersonating a human" | Assistant discloses it's an AI on first contact — already encoded in every KB |
| "No demonstrated human handoff" | Screencast step 4 exists specifically to show escalation |
| Business not verified | CAC → Business Verification must complete first. **The queue** |

## 9b. ALTERNATIVE PATH — build inside the client's own Business portfolio

*Founder proposal, 2026-07-31. **Adopted as a parallel track, not a replacement.***

**The idea:** instead of waiting on Propel's CAC → Business Verification → App Review, create the app inside **IFT Realty's own Meta Business portfolio**, using **their** CAC (**RC 640603**, already on the signed facts sheet — we know they're registered). The app, the WhatsApp Business Account and the Instagram account all then sit in the same portfolio, and Propel operates as an admin on it.

**Why it likely works:** App Review's Advanced Access exists to govern apps touching assets owned by *other* businesses. When the app and the assets belong to the same portfolio, that's self-integration — the pattern any company uses to run its own Cloud API. It is the standard agency move: build inside the client's Business Manager.

> ⚠️ **Confidence: high on the pattern, not verified on the timeline.** I could not confirm from Meta's current documentation that zero review is required for this configuration in July 2026, and their rules tighten regularly. **Verify in the console before promising Shalom Park a date** — creating the app and sending one test message costs nothing and settles it in an afternoon. Do not put a delivery date in front of the client until it's proven.

### What we gain

- Skips **our** two-to-four week queue for this client entirely
- Their buyer data lives in their portfolio — cleaner under NDPA, and a genuine trust story: *"you keep ownership, we get managed access, you revoke it in two taps"* (already the wording in kickoff message #3)
- Conversation charges bill to their account, not ours — no float risk for a bootstrap

### What we give up — and this is the real cost

1. **We don't own the asset.** App, WABA and access all sit in their portfolio. In a dispute they can lock us out instantly — and we'd be on a commission mandate where a single unit is worth ₦5.5m–₦6m. **Hard engineering requirement that falls out of this: every attributed lead must write to OUR database at the moment of capture, not only to their systems.** If our commission evidence lives only inside infrastructure they control, we have no commission claim. Non-negotiable in the build.
2. **It doesn't scale.** Every future client would repeat the whole dance — their documents, their admin, their patience. Our own verified app is a one-time cost that then serves every client through a single OAuth grant. This is a tactical unblock for client #1, not a strategy for clients #2–N.
3. **The bottleneck moves, it doesn't disappear.** It shifts from *our* CAC to *their* internal authority and responsiveness. Business Verification needs company documents and portfolio-admin rights — **Collins is a Sales Executive and probably has neither.** This needs whoever holds company documents (the chairman, or Emmanuel Osijo who already owns fact-notification). If they're slow, this path is slower than our own filing, not faster.
4. **Our CAC is still required regardless** — for invoicing, a business bank account, contracts, credibility, and our own app for every client after this one. This path defers nothing on that front.

### Ruling

**Run both tracks in parallel.** Client-owned app = the fast lane to deliver the build Shalom Park has already paid for. Our own CAC → verification → app = the asset that makes client #2 onward cheap. **CAC filing stays 🔴 urgent and is not deferred by this.**

### What to ask the client (fold into the care-fee conversation)

> To get your assistant live faster, the cleanest setup is for it to run inside Shalom Park's own Meta Business account rather than ours — you keep full ownership of the WhatsApp number, the Instagram account and all the conversation data, and you can revoke our access any time in two taps.
>
> Two things needed: whoever holds the company's CAC documents to complete Meta's business verification, and admin access granted to me on the Business portfolio. Who's the right person for that?

## 9. Order of operations

- [ ] **(A)** Start CAC filing 🔴 *front of the queue*
- [ ] **(A)** Create Meta Business portfolio; convert IG to Professional; link in Business Suite
- [ ] **(A)** Create the app, add WhatsApp + Instagram products
- [ ] **(B)** Ship the webhook-verification workflow for import
- [ ] **(A)** Register 09112714482; set both webhook URLs + verify token
- [ ] **(B)** Draft privacy policy + data deletion pages
- [ ] **(A)** Submit Business Verification the moment CAC documents land
- [ ] **(A)** Record the screencast on the test number
- [ ] **(A)** Submit App Review — *5–10 business days*
- [ ] **(B)** Client onboarding flow for granting us access, ready for approval day
