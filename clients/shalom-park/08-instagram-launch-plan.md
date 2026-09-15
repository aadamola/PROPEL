# Shalom Park — Instagram launch plan

*2026-09-15. Instagram-only. WhatsApp and email stripped from this client's build.*

---

## The correction to build on

**Going Instagram-only does not delete Meta verification. It deletes something better — the riskiest step in the whole setup — and it makes the question that's left cheap to settle.**

Here is the honest split:

| Gate | Instagram-only |
|---|---|
| WABA creation | ✅ **gone** |
| Registering a phone number to Cloud API | ✅ **gone** — and with it the risk of wiping WhatsApp off a working handset |
| WhatsApp display-name review (*"Shalom Park Estate"* vs *"IFT Realty Ltd"*) | ✅ **gone** — this was a real rejection risk |
| Two-step PIN, 24-hour window, message templates | ✅ **gone** |
| The whole WABA onboarding SOP | ✅ **gone** |
| Business portfolio + Page + Instagram connected | ⬜ still required |
| A Meta app | ⬜ still required |
| System User + access token | ⬜ still required |
| Webhook subscription | ⬜ still required |
| **Business Verification / App Review** | ⚠️ **unchanged — still the open question** |

**No SIM. That's the win.** The two pre-conditions blocking the client session were *the right person* and *a new unused SIM*. One of them just disappeared. The session drops from ~25 minutes to ~15 and loses its most fragile step.

### What the verification question actually is

It was never *"does Instagram need verification."* It's: **does an app that lives inside the client's own portfolio, touching only that portfolio's own Instagram, count as self-integration — or does Meta still demand Advanced Access?**

`meta-app-setup.md` §9b already rules on this: **high confidence on the pattern, unverified on the timeline.** That hasn't changed. What has changed is the cost of proving it — the Step 0 test no longer needs a WABA or a test number, so it's about **an hour, not an afternoon**.

**Three possible outcomes, all readable in one sitting:**

| What you see | What it means |
|---|---|
| A DM sends to an outside account from a dev-mode app in their portfolio | 🟢 **Fast lane confirmed.** No verification, no review. Ship it. |
| Sends only to accounts with a role on the app | 🟡 **Dev mode is the ceiling.** Business Verification is the gate — days, not weeks |
| Permissions error regardless | 🔴 **App Review required.** Fall back to Propel's own filing; CAC returns to the critical path |

**Do not put a date in front of Shalom Park until you've seen which one it is.**

---

## Phase 0 — live this week, with no Meta app at all

**The 27 responses are copy. Copy doesn't need an API.**

Instagram has **Saved Replies** built into every Business account: Settings → Business tools → Saved replies. A shortcut like `condo` expands to the full message in one tap.

| Step | Time |
|---|---|
| Convert the IG account to **Professional → Business** (not Creator) | 2 min |
| Paste the 27 responses in as Saved Replies, shortcut = the rule id in lowercase | 30 min, once |
| Set the 4 **FAQs** in Instagram's DM settings: price · location · inspection · payment plan | 10 min |
| Start posting with keyword CTAs (calendar below) | ongoing |

**What this buys:** the campaigns start earning *now*, the replies are identical to what the automation will send, and by the time the API is live you already know which keywords people actually use. The automation then removes the typing, not the strategy.

**What it costs:** somebody taps a shortcut. At 1–2 enquiries a day — the client's own stated volume — that is minutes, not a job.

---

## Phase 1 — the automation

### The client session, Instagram-only (~15 min, screen share)

| | Step | Done when |
|---|---|---|
| **1** | **Business portfolio** at business.facebook.com — `IFT Realty Ltd`, their email | Business Settings shows IFT Realty Ltd |
| **2** | **Accounts → Pages** → add the Shalom Park Facebook Page. *No Page? Create one — two minutes* | Page listed |
| **3** | **Accounts → Instagram** → add the Shalom Park Instagram | IG listed |
| **4** | On the phone: **Settings → Privacy → Messages → Allow access to messages: ON** | Toggle green |
| **5** | **Start Business Verification** — CAC (RC 640603) + address document. *Start it, don't wait on it* | Status reads Pending |
| **6** | **Create the app INSIDE their portfolio** — not ours. This is the whole fast lane | App appears under their portfolio |
| **7** | **System User → Employee role** (never Admin) → generate token with `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`, `pages_show_list`, `pages_manage_metadata` | Token copied |
| **8** | Token + App Secret → `/opt/propel/.env` 🔒 **never through chat** | `docker compose up -d n8n` |
| **9** | Webhook → `https://engine.getpropel.tech/webhook/shalom-park-ig`, subscribe **`comments`** and **`messages`** | Verify returns green |

> 🔴 **Step 6 is the one that matters.** One dropdown decides whether we're doing self-integration or walking back into a two-week App Review queue.

> ⚠️ **Step 2 is the one people skip.** The classic Instagram messaging API needs a connected Facebook Page. No Page, no DMs — and the failure looks exactly like a broken integration. *(Meta's newer Instagram-Login path may remove this; check it during the Step 0 test rather than assuming either way.)*

### Before the call — 5 minutes, alone

```
cd /opt/propel
bash ops/setup/apply-client-ledger.sh shalom-park
```
Then import `05-channel-instagram.json` into n8n and **Activate it**. Meta tests the webhook the second you click Verify, and an inactive workflow returns a 404 that reads like a server fault.

### Opening line for the call

> *"We're setting this up inside Shalom Park's own Meta account, not ours. You own the Instagram, you own every conversation, and you can switch our access off in two taps. No new phone number needed — this is Instagram only. About fifteen minutes."*

---

## The engine: comment-to-DM

```
  Post with a keyword CTA
        ↓
  Buyer comments CONDO
        ↓
  Public reply: "Just sent you a DM"      ← boosts reach, contains no figures
        ↓
  Private DM: the full card + a question  ← the conversion
        ↓
  They reply → brain handles it, or escalates
        ↓
  Collins gets the lead on WhatsApp       ← a human being messaged. No API.
```

**Why comments and not link-in-bio:** a comment is an algorithmic signal, a bio link is not. Every keyword comment pushes the post to more people *and* opens a private thread. That is the whole reason this mechanic beats a landing page on Instagram.

**Note:** WhatsApp is still where Collins closes. Stripping the WhatsApp *API* changes nothing about that — the escalation messages a human on their phone.

---

## The seven campaigns, and what gets filmed

Only the **3 completed 4-bedroom semis** can be filmed as finished product. They carry the credibility for everything else, including the units that don't exist yet. Shoot them first.

| Keyword | Hook | Asset needed |
|---|---|---|
| **CONDO** | **₦5,000,000 starts you on a ₦95,000,000 home** | Block progress footage, drone |
| **DUPLEX** | **Finished. Not "finishing soon."** | Full walkthrough of a completed 4-bed |
| **LAND** | 648 sqm inside a gated estate, allocated instantly | Plot walk, survey pegs, roads |
| **CHAIRMAN** | The flagship 5-bedroom, off-plan | Renders + drawings |
| **INVESTMENT** | What's already on the ground, not promised | Infrastructure B-roll |
| **DEVELOPER** | ~6,738 sqm for multi-unit development | Aerial of the parcel |
| **SUMMER** | The campaign umbrella | Reuse |

**The strongest hook in the set is CONDO.** ₦5m against a ₦95m unit is the lowest barrier on the estate and it is a warranted, current campaign term. Lead with it.

**On camera:** ADEDAMOLA's no-face rule is about *his* face. This is Shalom Park's account — Collins and Mercy should be on camera, because a face sells property and theirs is the face buyers will meet on site.

### 14-day calendar — one shoot day, ten posts

**Day 0 — batch shoot.** One site visit produces everything below. Don't return to site for individual posts.

| Day | Format | Content | CTA |
|---|---|---|---|
| 1 | Reel | Drone over the estate — 10.37 hectares, Abijo, Governor's Consent | `INFO` |
| 2 | Carousel | **₦5,000,000 starts you** — the condo campaign | `CONDO` |
| 4 | Reel | Full walkthrough, completed 4-bed | `DUPLEX` |
| 5 | Single | Plot with survey pegs — 648 sqm, gated | `LAND` |
| 7 | Carousel | **What's already built** — 8 slides of delivered infrastructure | `INVESTMENT` |
| 8 | Reel | Condo block progress | `CONDO` |
| 10 | Carousel | 5-bedroom renders | `CHAIRMAN` |
| 11 | Reel | Inside the gate — security, roads, street lighting | `INFO` |
| 13 | Single | The development parcel, B2B framing | `DEVELOPER` |
| 14 | Reel | Collins answers the three questions every buyer asks | `INFO` |

**Stories daily:** site clips, a poll (*"Condo or duplex?"*), screenshots of real DM conversations with names blurred, reposts of buyer comments. No countdowns, no "last chance" — we don't manufacture urgency, and the ₦5m campaign is genuinely open-ended.

### Three captions, ready to post

**CONDO**
> ₦5,000,000.
>
> That's what it takes to start on a 2-bedroom condominium at Shalom Park Estate, Abijo — balance spread over 12 months.
>
> The unit is ₦95,000,000. Finished spec. 5 of the 16 available as at our last stock check.
>
> Governor's Consent. Approved layout. Roads, street lighting, water treatment and gated security with CCTV — already delivered, not promised.
>
> **Comment CONDO** and our assistant will send you the full details in your DMs.

**DUPLEX**
> Finished. Not "finishing soon."
>
> 4-bedroom semi-detached at Shalom Park Estate, Abijo. ₦185,000,000. 3 units available as at our last stock check.
>
> You can walk into this one today — opposite GRA Second Gate, under 5 minutes from the Lekki-Epe Expressway.
>
> **Comment DUPLEX** for the full details and to book an inspection. We inspect any day, weekends included.

**INVESTMENT** *(8-slide carousel)*
> 1 — What's already on the ground at Shalom Park
> 2 — Governor's Consent + approved layout
> 3 — Roads and street lighting. Delivered.
> 4 — Water treatment and drainage. Delivered.
> 5 — Gated access, CCTV, patrols. Delivered.
> 6 — Generator power. Solar-compatible.
> 7 — 10.37 hectares. About 30% developed.
> 8 — **No projections. Just what's built. Comment INVESTMENT.**

That last slide is the differentiator. Every other developer on Instagram promises returns; showing what exists and refusing to forecast is a stronger position, not a weaker one.

---

## What we measure

Logged automatically in the attribution ledger — every row already carries `keyword_rule` and `link_code`:

| Metric | Source |
|---|---|
| Keyword comments, per campaign | ledger |
| Comment → DM delivered | ledger |
| DM → reply (did they engage?) | ledger |
| Escalations handed to Collins | ledger |
| **Inspections booked** | Collins reports |
| **Sales** | the commission event |

**Week 1 sets the baseline; we don't publish a target we haven't earned.** The client's own stated volume is 1–2 enquiries a day — that's the number to beat, and the first honest scorecard is the one that proves it.

**On ads:** boosting a keyword post is the standard play here and it works. Shalom Park pays the platform directly — Propel never handles ad-spend cash (docs/07). Recommend it once there's an organic post that's already converting; boosting a post that isn't working just buys reach for a weak offer.

---

## Risks, named

| Risk | Handling |
|---|---|
| **Dev mode won't message outside accounts** | The Step 0 test. Do it before promising a date |
| **No Facebook Page connected** | Create one on the call — two minutes |
| **Account is Creator, not Business** | Switch it on the call; Creator can't do this |
| Competitors comment keywords to see the reply | They get the same public facts everyone gets. Nothing sensitive is in a DM card |
| Comment spam triggering the DM cap | 180/hr cap, overflow held for a human. Already built and tested |
| A promo lapses unnoticed | `promo_review_by` — the cards revert to signed terms on their own by **2026-10-15** unless re-confirmed |
| Instagram outage | Escalation is a human on a phone. The sales process degrades, it doesn't stop |

---

## Order of operations

1. **Convert IG to Business + load the Saved Replies** — this week, no dependencies, starts earning
2. **Run the Step 0 test** — one hour, settles the only real unknown
3. **Book the 15-minute client session** — needs the right person, no SIM
4. **Shoot day** — one visit, ten posts
5. **Publish, measure, report** — first scorecard at day 14

Steps 1 and 4 need nothing from Meta. Start there.
