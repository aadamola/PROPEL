# Propel — Positioning Correction & Growth Plan

*2026-10-15 · AI Managing Partner · Status: **ADOPTED** (ADEDAMOLA delegated the call). Positioning, profile copy and the growth kit are live in the repo (`ops/growth/`, `ops/setup/account-setup.md`). **The new prices (rate card v2, docs/03) still need ADEDAMOLA's explicit "approved"**: the assistant's knowledge base and the website pricing switch over on that word.*

---

## 0. The prompt, improved

**As given:** *"correct our marketing, positioning and add us insane growth hacks"*

**As run:**

> Act as Propel's managing partner. Audit our current positioning and marketing (docs/01, 03, 04, 07, 14, content-engine, account-setup, site copy, founder interview) against what the market has actually shown us since July: one paying client, a developer, who asked for the AI enquiry system before we pitched it. Give the honest diagnosis first. Then:
> 1. A corrected positioning: category, target customer, promise, proof and the words we use. One sentence a stranger repeats correctly.
> 2. An offer architecture recommendation, with the revenue-per-ADEDAMOLA-hour maths. This is his decision, so don't edit the rate card.
> 3. Growth moves ranked by revenue per ADEDAMOLA-hour, each with his time, my part, and the guardrail that keeps it inside our rules.
> 4. The moves we refuse, and why.
> 5. A 30-day sprint whose targets are **inputs we control** (messages sent, audits delivered), not outcomes we'd be guessing at.
> 6. Fix every untrue or unsourced claim in our own marketing now.
>
> Hard limits: no bought followers, pods or fake reviews; no faked scarcity, results or social proof; no face-on-camera; no asking his personal network to follow; official Meta APIs only; NDPA-safe (no scraped personal data); drafts, not sends.

*Re-run on 2026-10-15 through the **Nevo's Brain MCP** (Nevo David's growth playbooks); findings in §10.*

*"Insane" is read as **disproportionate return for the hours**, not as rule-breaking. Every move below would survive being described out loud to a client.*

---

## 1. The honest diagnosis

**Our biggest marketing problem isn't positioning. It's that we haven't gone to market.**

| | Since July |
|---|---|
| Paying clients | 1 |
| Prospects in the pipeline | 1 (the same client) |
| Audit teardowns delivered | 0 — waiting on the 10 names since July |
| Lines of infrastructure built | ~9,000+ |

The founder-interview pack already says it in ADEDAMOLA's own voice: *"building is comfortable and selling isn't — so it's easy to hide in the work."* That's us. **The growth plan below is mostly a way to make selling as structured and low-friction as building has been.** No positioning fixes a pipeline of one.

**What the positioning gets wrong:**

1. **We call ourselves an "AI-powered digital marketing agency".** That puts us in the most crowded category in Lagos, next to every freelancer selling posts for ₦80k. The thing we actually do that nobody else does is *answer the buyer*, and it's buried as product #6 with a "NEW" tag.
2. **Six product lines for one person at 20 hrs/week** (Presence, Leads, Launch, Studio, OS, Concierge, plus add-ons). The site says "five products". A menu that long tells a buyer we're generalists, which is exactly what our own copy attacks.
3. **We lead with agents; the market answered with a developer.** docs/07 sequenced agents first for fast closes. The only real signal so far: a developer paid, and asked for the Concierge unprompted. Developers have the enquiry volume that makes an answering system valuable, the budgets, and the commission structures that fit our attribution ledger.
4. **Our proof is undersold.** We say "we're new" (correct) but don't show what we *do* have, which is rarer than a testimonial:
   - a live system that only says what the client signed;
   - a test suite it must pass before it speaks to a buyer;
   - Meta's official APIs, not a grey-market WhatsApp gateway;
   - an append-only ledger that proves which sales came from us;
   - a founder who sat the NIESV exam.
5. **Some of our own claims are unsourced or slightly off.** Fixed or listed in §8.

---

## 2. Corrected positioning

**Category: no longer "marketing agency".**
> **Propel is the enquiry-to-inspection system for Nigerian property sellers.**
> We bring buyers in, answer them in seconds from facts you've signed, and book the inspection.

**Tagline:** *We move property.* (Unchanged. It's good.)

**The sentence a stranger should repeat:**
> *"Propel answers your property enquiries instantly, only says what you've approved, and proves which sales it brought you."*

**Positioning statement:**
> For Lagos developers and surveyor-led agencies who lose buyers to slow replies, Propel is the enquiry-to-inspection system built by a real estate professional. It brings buyers in with content, answers them in seconds from facts you've signed, and proves which sales it drove. Generalist agencies sell posts. Cheap chatbots guess, and run on unofficial WhatsApp gateways that get numbers banned. We only say what you've warranted, we build on Meta's official platforms, and we're paid when you sell.

**Beachhead (recommendation):**

| Order | Who | Why |
|---|---|---|
| **1 — now** | **Small/mid developers, Lekki–Epe corridor** (10–200 units, active Instagram, visible ad spend) | Enquiry volume, budgets, commission culture; our one proof point is one of them |
| **2 — now, the tribe** | **Surveyor-led agency firms** (NIESV members marketing estates or mandates) | The credential lands hardest here, and they're slower to buy but stickier. One firm opens the branch room |
| 3 — later | Independent agents | Best served by a low-touch product once the system is proven. Not with retainers sold one by one at 20 hrs/week |
| Parked | Shortlets / property managers | Per docs/14 triggers, unchanged |

**Three proof pillars. Every piece of marketing hits at least one:**

| Pillar | The promise | The evidence we can show today |
|---|---|---|
| **Speed** | No buyer waits | The assistant answers in seconds; our Response Test (§5, move 1) measures the market's real reply times |
| **Truth** | It never invents a price, title or return | The signed warranted-facts sheet; the guardrail; the test suite; official Meta APIs only |
| **Accountability** | You see which sales we drove | The attribution ledger, verifiable in SQL by the client's own auditor; commission-aligned deals |

**Words — use / retire:**

| Use | Retire | Why |
|---|---|---|
| "answer every buyer", "book the inspection", "enquiries", "warranted facts" | "AI-powered digital marketing agency" (as our headline) | Category we lose in |
| "built by a real estate professional", "NIESV exam passed, on the ESV track" | "NIESV-trained" | Vague. Say exactly what's true |
| "only says what you've signed" | "trained on your **verified** listings" | We don't verify title; the developer warrants it. Wrong word, real liability |
| "proves which sales we drove" | "leads, not likes" (keep as a line, not the headline) | Everyone says it now |
| "official Meta platforms" | anything implying we're cheaper because we cut corners | The corner we refuse to cut is the selling point |

---

## 3. The messaging hierarchy (what goes where)

1. **Headline (bio, site hero, first line of any DM):** *Your buyers get an answer in seconds — and you see which ones bought.*
2. **The problem, in naira:** a buyer who enquires at 11pm and hears back next morning is already talking to three other estates. One lost ₦95m sale at 3% commission is ₦2.85m.
3. **The mechanism:** content brings them in → the assistant answers from your signed facts → hot leads reach your team within minutes → every enquiry is logged.
4. **The trust line:** built by a real estate professional · official Meta platforms · tested before it speaks to a buyer.
5. **The ask:** a free **Response Audit** (§4), not "a marketing audit".

---

## 4. Offer architecture — adopted as rate card v2 (prices await ADEDAMOLA's "approved")

**What I'd sell: three doors instead of six products.**

| Door | What | Role |
|---|---|---|
| **1. Free Response Audit** | We test how fast their enquiries actually get answered (move 1), tear down the funnel from post to inspection, and demo their assistant on their own phone | The only top-of-funnel offer. Replaces the generic "marketing audit" |
| **2. Concierge — Instagram first** | The assistant + keyword lane + escalation + ledger, on Instagram (no WhatsApp SIM, no WABA). Setup fee + monthly care | The core product. Presence/Studio/OS become *ingredients* inside it, not menu items |
| **3. Launch Partner** | Content + campaigns + Concierge for an estate launch, fee **plus commission**, attribution in the ledger | The upside. What Shalom Park already is |

**Why — revenue per ADEDAMOLA-hour.** These are *estimates* from our own delivery model, not measurements. Treat them as directional.

| Offer (current rate card) | His hours to win + deliver, first 3 months | Revenue, first 3 months | ≈ ₦ per his hour |
|---|---|---|---|
| Presence Starter ₦250k/mo | ~8 sell + ~4/wk (approvals, footage, shoots) ≈ 56 | ₦750k | ~₦13k |
| Concierge Pro ₦800k + ₦150k/mo | ~8 sell + ~6 facts/Meta sessions + ~1/wk ≈ 26 | ₦1.25m | ~₦48k |
| Concierge Developer ₦1.2m + ₦250k/mo + commission | ~12 sell + ~8 setup + ~1.5/wk ≈ 38 | ₦1.95m + commission | ~₦51k + upside |

At 20 hrs/week the retainer path caps at about 4 clients and ~₦1m MRR (docs/07's own ceiling). The Concierge path, mostly delivered by me, roughly **triples revenue per hour** and puts recurring care fees underneath.

**The two honest caveats:**

- **Speed claims wait for the Step 0 test.** Instagram removes WABA and the SIM, but not Business Verification or App Review. Until that test runs, **we don't promise a go-live date to anyone**, prospects included.
- **The current rate card stays published truth until you rule.** This is the realignment you said you wanted to do. It touches `site/index.html`, `docs/03`, `propel-kb.json`, the LinkedIn About and the IG bio. Say "go" and I'll draft all five in one pass for your review.

**The founding offer, corrected:** retire "20% off for 6 months". Discounts anchor the price low and attract price-shoppers. Replace it with a **founding pilot**: full setup at rate card, the first month's care fee waived, and in return written case-study rights plus a named review call at day 30. Scarcity is stated only as long as it's true ("three founding pilots this quarter").

---

## 5. Growth moves — ranked by revenue per ADEDAMOLA-hour

Every move: his time, my part, the guardrail.

### 1. 🔥 The Lagos Response Test (the engine of everything below)

**What:** every week, ADEDAMOLA sends **10 developers / surveyor-led firms** a short, genuine question on Instagram: *"Hi, what's the current price and payment plan on [estate]?"* It's a real question. We want the answer for our corridor pricing data. **I log the time sent and the time of the first reply.**

**Why it's disproportionate:** it creates three assets from one 20-minute task.

1. **The opener.** Every firm gets a private message with **its own result, free, with no pitch attached** (the exact wording is in §10). The demo is offered only once they reply. *(Revised after the Nevo check: a first message that pitches gets ignored; one that gives gets answered.)*
2. **The PR asset.** After 8 weeks, ~80 firms: the **Lagos Property Response Report**: median reply time, % never answered, out-of-hours gaps, all aggregate. Nobody publishes Nigerian data on this. Journalists, NIESV, REDAN and developers will quote it.
3. **The content.** Market Saturday gets real corridor pricing ranges.

**His time:** 20 min/week to send (phone). **My part:** the list, the tracker, the timing log, every private follow-up, the report.

**Guardrails:**
- The question is real, and he never claims to be a buyer.
- Never book inspections or take up a sales team's time beyond one question.
- **Never name or shame a firm publicly.** Results are aggregate in public and private to each firm.
- Manual sends, ≤20/day, from his own account. No automation on Meta accounts we don't own.

### 2. Their assistant, already built (the close)

**What:** for every firm that replies to the opener, I build a **demo assistant on their public listings only** (labelled DEMO, never published), using the Shalom Park demo pattern. ADEDAMOLA hands them his phone: *"Ask it anything about your estate."*

**Why:** the Shalom Park sequence (demo first, offer second) is the one sales motion we've seen work.

**His time:** the 30-min call. **My part:** the demo in under 2 hours each, the one-page offer.

**Guardrails:** public facts only, clearly marked as a demo. Pitch-only, per the demos/ rules. Nothing goes live without a signed facts sheet.

### 3. The developer-launch watch

**What:** I monitor estate launch announcements (press releases, BellaNaija/ThisDay property coverage, new IG estate pages, visible ad campaigns). A firm that just launched has an enquiry surge and no system. They go to the top of the Response Test list within a week of launch.

**Why:** timing beats persuasion. You're selling an umbrella during the rain.

**His time:** 0 (it feeds move 1). **My part:** a weekly scan, delivered with the Sunday pack.

### 4. "What buyers actually ask" — content from real data

**What:** Phase 0 at Shalom Park logs every DM. With IFT's written permission, I publish aggregate findings: *"We logged [N] real property enquiries. The first question 7 in 10 buyers ask isn't price."* (Only real numbers, and only once we have them.)

**Why:** first-party Nigerian buyer data, carrying the credibility of a named developer client. It's proof without inventing a result.

**His time:** one permission message to IFT. **My part:** analysis, carousels, the LinkedIn version.

**Guardrail:** aggregate only; no buyer is identifiable (NDPA); client approves before posting.

### 5. Eat our own cooking: comment-to-DM on @getpropel.tech

**What:** every post closes with *"Comment RESPONSE and I'll send you the 5-minute checklist."* For now the reply is sent by hand through a saved reply (Phase 0-style). Once Propel's own Meta app exists, the keyword lane sends it.

**Why:** it demonstrates the product in the act of marketing it, and every comment lifts reach.

**His time:** 5 min/day while manual. **My part:** the checklist, the saved reply, the trigger words.

**Guardrail:** the auto-reply sends the checklist only, **no prices**. `propel-kb.json` stays off until the realignment.

### 6. The NIESV room (the tribe play)

**What:** a 30-minute session for NIESV Lagos branch members or a CPD-style meetup: *"Marketing a registered practice: what you can say, what you can't, and how buyers check you."* He presents in person with slides. **No recording of his face**; audio plus slides only, if anything is recorded.

**Why:** one respected firm opens ten doors (docs/07). The credential does the selling.

**His time:** one evening plus prep with me. **My part:** the deck, the handout, follow-up DMs to every attendee.

### 7. LinkedIn text posts from his personal profile

**What:** 3 text posts a week. Response Test findings, surveyor-credential marketing, launch lessons. It's text, so the faceless rule holds.

**Why:** developers and surveyors live on LinkedIn; agents don't. A founder profile out-reaches a company page several times over.

**His time:** 5 min/day to post. **My part:** every draft.

**Guardrail:** no "chartered". No results we haven't produced.

### 8. Ask the client, as business

**What:** at Shalom Park's first good month, ADEDAMOLA asks IFT for **two introductions** to developers they respect, plus a written quote for the site.

**Why:** a developer's word to another developer outsells any ad. This is selling to warm industry contacts, which our rules allow; it isn't asking friends to follow.

**His time:** one conversation. **My part:** the ask script and the intro message they can forward.

### 9. Referral commission to agents, stated openly

**What:** the existing 10% referral offer (docs/04), pointed at the people who meet developers daily: independent realtors who sell for them.

**His time:** none until a referral lands. **My part:** a one-page referral card.

**Guardrail:** disclosed openly, paid only on paid invoices.

### 10. The Enquiry Leak Calculator

**What:** a one-screen tool. Enter monthly enquiries, average reply time and unit price, and it shows the naira at risk. Shared as a link in DMs and the bio once the site is live.

**Why:** prospects calculate their own pain. Shareable.

**His time:** 0. **My part:** I build it. **Guardrail:** every figure is the prospect's own input or a stated assumption, and the Response Report replaces the assumptions with Nigerian data once it exists.

---

## 6. Moves we refuse (and why they're worse than they look)

| "Hack" | Why not |
|---|---|
| Bought followers, engagement pods, fake reviews | Rule 3. One discovery kills every true claim we make |
| Mass cold-DM bots, unofficial WhatsApp blasters, scraped phone lists | Bans the account; violates Meta terms and NDPA; contradicts our "official platforms" pitch |
| Posing as a buyer or booking fake inspections | Deception, and it wastes the time of sales teams we want as clients |
| "Only 2 slots left" when it isn't true | Rule 2. Scarcity is stated only when it's real |
| Naming slow responders publicly | Defamation risk, and it turns prospects into enemies |
| Follow-for-follow or giveaway-for-follows | Followers who'll never buy property. Vanity, not pipeline |
| Asking his friends to follow and share | Founder constraint 2 |
| Talking-head videos | Founder constraint 1. Everything above works faceless |

---

## 7. The 30-day sprint (targets are inputs we control)

| Week | ADEDAMOLA (≈ 2.5 hrs/week of selling) | Me |
|---|---|---|
| **1** | Send Response Test #1 to 10 firms (20 min). Send the IFT permission message for buyer-question data | Build the list of 40 developers + surveyor firms, the timing tracker, and the private follow-up drafts |
| **2** | Send Response Test #2 (10 firms). Send private follow-ups to week 1's firms (my drafts) | Demo assistants for every reply; first LinkedIn posts; the RESPONSE checklist |
| **3** | Test #3. 2–3 demo calls. Decide on the offer realignment (§4) | Drafts of the realigned site, docs/03, KB, bio and LinkedIn for review; NIESV session deck |
| **4** | Test #4. Calls. One NIESV/branch contact asked for a session date | First anonymised findings carousel; the 4-week Response Test snapshot (aggregate) |

**Success at day 30, all inputs:** 40 firms tested · 40 private follow-ups sent · every reply offered a demo · the offer decision made · the pipeline holding real names instead of one.
**Not a target:** clients signed. We don't have the data to forecast a close rate yet, and we won't invent one.

---

## 8. Corrections to our own marketing

**Fixed now:**
- `ops/content/content-engine.md` Day 11: *"Leads you reply to in 5 minutes close 10× more"* was unsourced. Replaced with a defensible line plus a pointer to the source we can stand behind (HBR, *The Short Life of Online Sales Leads*, 2011: firms that responded within an hour were about 7× more likely to qualify the lead. That's US B2B data and directional only, and our own Response Report replaces it).
- Day 2 hook: *"One empty month costs a Lagos agent three million naira"* stated illustrative maths as fact. It now reads *"can cost"*, with the working shown.

**Fixed in profiles and docs on 2026-10-15; the website applies them when the prices are approved:**
- `site/index.html` says "Instagram **and WhatsApp**" in the Shalom Park block. Shalom Park is Instagram-only.
- `site/index.html` says the Concierge is "trained on your **verified** listings". It should say "on facts you've signed". We don't verify title.
- `site/index.html` and the IG bio use "NIESV-trained founder". It should be "NIESV exam passed".
- `site/index.html` says "Five products", and docs/03 lists six. Superseded by the three-door architecture, if approved.
- The docs/01 founding-team table still shows two partners. It's internal, not marketing, but stale.

---

## 9. What I need from ADEDAMOLA

One word: **"approved"** on the rate card v2 prices (docs/03), or the one price to change. Everything else in this plan is built and running, apart from the 20 minutes a week of sending, which has to come from your account.

---

## 10. Pressure-tested against Nevo David's playbook (via the Nevo's Brain MCP, 2026-10-15)

*Nevo grew Postiz, a bootstrapped social-media scheduler, to $2M+ ARR. His audience is developers and SaaS buyers; ours is Lagos property sellers. So every tactic below was **translated, not copied**, and anything that breaks our rules was dropped. 12 searches; sources at the end. Only generic marketing questions were sent; no client data left us.*

### What it confirms

| Nevo's finding | What it means for Propel |
|---|---|
| **Marketing products churn; products that hold data or run in the background don't.** Customers can stop marketing any time, but they rarely leave the system their data lives in ([startup ideas, Aug 2026](https://x.com/wickedguro/status/2090778859352563921)) | **The strongest argument yet for §4.** Content retainers are marketing, and they churn. The Concierge runs 24/7 and holds the attribution ledger. Make the Concierge the core and content the ingredient |
| **Sell the outcome, not the tool.** "Get 1M TikTok views in 10 days" sells; "schedule posts to TikTok" doesn't ([Aug 2026 posts](https://x.com/wickedguro)) | Lead with "every enquiry answered in seconds, inspections booked overnight", not "AI marketing" |
| **Never compete on cheapest.** Price-shoppers aren't making money and churn fastest ([Jun 2026 posts](https://x.com/wickedguro)) | Retire "20% off" (§4). Price on value, and keep naira prices public |
| **Unknown brands borrow authority**, and the founder's account beats a 10-follower company account ([Papermark interview](https://www.youtube.com/watch?v=z6TpKJSSrbI), [one face](https://gitroom.com/blog/5-steps-build-brand-company)) | ADEDAMOLA's personal LinkedIn is the main channel; the company page reposts. *A profile photo isn't a face-on-camera video. That's his call* |
| **Hooks with real results, never invented numbers** ([hooks](https://gitroom.com/blog/hook-developers)) | Same as rule 2. The Response Report gives us real numbers to hook with |

### What it changes in this plan

**1. Move 1's follow-up must GIVE, not pitch.** Nevo: people ignore or block any message selling a service ("I can improve your conversion rate…"), but they reply to messages that bring something and ask for something small. Outreach should be *give, give, give, then take in private* ([outbound→inbound](https://www.youtube.com/watch?v=3p97bZzBHx8), [Alex is Building](https://x.com/AlexIsBuilding/status/2079192005003919602)). **The private follow-up is rewritten:**

> *"Hi [name], we're measuring how fast Lagos estates answer Instagram enquiries. Yours: we asked on [day, time], first reply [time] later. The market median so far is [X]. That's yours to keep, no pitch attached. If it's useful, I'll send you the full report when it's out."*

No offer in message one. The demo is offered **only when they reply**, and the report gets sent to everyone either way. **Outbound becomes inbound:** they open the commercial conversation.

**2. The headline must say what we do in plain words.** Nevo: vague slogans are for famous companies. An unknown brand's headline and sub-headline must explain the product without a scroll. Long headlines are fine, and "Like X, but Y" works when people ask what makes us different ([headlines](https://gitroom.com/blog/perfect-company-messaging)). *"We move property"* stays as the **tagline**, but it can't be the headline. Queued for the realignment pass:

> **Headline:** Every property enquiry answered in seconds, from facts you've approved, with every sale traced back to its source.
> **Sub:** For Lagos developers and surveyor-led firms. Built by a real estate professional, on Meta's official platforms.

**3. A new move: "group owners" (Nevo's n8n-template play, translated).** Postiz's jump from ~$6K to ~$12K MRR came from emailing the owners of n8n communities. Postiz didn't ask them to buy. It asked to be included in their templates, and offered something bigger than the ask: a free top plan, a newsletter feature, introductions. About 80% replied ([Alex is Building](https://x.com/AlexIsBuilding/status/2079192005003919602), [buyers where they gather](https://x.com/wickedguro/status/2069034977304653858)).

**Our equivalent:** the people developers already listen to.
- Owners of realtor networks that sell for developers.
- Real estate trainers and coaches who run WhatsApp, Telegram and Instagram communities.
- Property lawyers.
- Nigerian property podcasts and YouTube channels.
- **The offer:** a free assistant for their *own* enquiries, a named feature in the Lagos Response Report, and introductions.
- **The ask:** mention us, or introduce us, to the developers they work with.
- **The rule:** about ten people, each one researched by hand. That's not volume.

**4. A new move: answer-engine visibility (AEO).** ChatGPT, Perplexity and Claude now answer "who does X". The content they cite doesn't have to sit on your website: forum threads, LinkedIn articles and X articles all count. **The narrower the query, the easier it is to be the cited answer** ([distribution playbook](https://x.com/wickedguro/status/2086788813301661865)). The site isn't live, which doesn't matter for AEO.

**Our version:**
- **Nairaland's property section** (Nigeria's biggest forum, and heavily indexed).
- r/Nigeria and r/lagos.
- LinkedIn articles under ADEDAMOLA's name.

Write genuinely useful answers to the questions buyers and developers already ask: *how to check an estate before you pay, what Governor's Consent means, why your enquiries go cold*. Target narrow queries we can own outright, such as *"AI enquiry assistant for real estate developers in Nigeria"*. I draft; he posts; 15 min/week.

**5. A new faceless format: slideshows** (4–5 images with text, on TikTok and Instagram). Distribution is now interest-based, so small accounts get reach without followers. **Nevo names real estate as a category where this works** ([slideshows](https://x.com/wickedguro/status/2046261869963587636), [outcomes](https://x.com/wickedguro/status/2096974398167392500)). Slide 1 carries 95% of the weight: a specific person, a conflict, a reveal.

- **Our formula:** *[specific person] + [doubt] → showed them → changed their mind*, **only from true events.** For example: *"My client was sure nobody messages after 9pm. I showed him the timestamps."* (Post that only once it has actually happened and IFT approves.)
- **Evergreen formats:** "5 things diaspora buyers check before sending ₦50m" · "What Governor's Consent actually means, in 4 slides".
- This solves "no face on camera" for short-form, and it suits Shalom Park's own account too.

**6. Founding pilots become an application with a real close date.** "Apply for one of 3 founding pilots, applications close [date]" outperforms "book a call", and the application qualifies the prospect: estate, number of units, monthly enquiries, who answers DMs today. **Nevo's own warning:** never re-run a "closing soon" offer that didn't close. Repeated false scarcity kills trust ([waitlist](https://www.youtube.com/watch?v=F_dC4_DyXE4)). Rule 2 says the same.

**7. Be the first comment.** Turn on post notifications for the accounts our buyers read: big Nigerian property pages, and developers' founders on LinkedIn. Keep prepared, genuinely useful comments ready so we're first in the thread ([competitor conversations](https://gitroom.com/blog/tell-people-opensource-better-closed-source)). This goes into the existing 10-minute daily engagement block.

**8. Never cold-email from `getpropel.tech`.** Nevo uses a separate, warmed-up domain for outreach, because spam reports damage the main domain ([outbound](https://www.youtube.com/watch?v=3p97bZzBHx8)). For us the stakes are higher: `alerts@getpropel.tech` delivers **lead alerts to Shalom Park's sales team**. If cold email ever happens, it goes out from a separate domain. *Our outreach is Instagram/LinkedIn DMs for now, so this is a standing rule, not a task.*

### What we don't take from it

| Nevo tactic | Why not |
|---|---|
| Hiring someone to scrape community owners' emails at scale | NDPA, and it contradicts our trust positioning. Research ~10 public business contacts by hand |
| VPN or mobile-proxy location spoofing, multiple TikTok accounts | Platform manipulation. We're targeting Lagos from Lagos anyway |
| Paid quote reposts / sponsored influencer posts | Not banned, but they're spend above the gate (rule 1) and must be disclosed as paid. **Earliest: after a second client** |
| Open source, GitHub, Product Hunt, Hacker News | Not where Lagos property sellers are |
| Lifetime deals | Wrong model for a service with running costs |

### Revised priority order (this replaces the order in §5)

1. **Response Test**, with the give-first follow-up. *(Unchanged in cost: 20 min/week.)*
2. **Demo on their phone**, offered only after they reply.
3. **Group owners**, about ten hand-picked. *(New: Nevo's single biggest jump came from this.)*
4. **Slideshows**, true stories only. *(New: the faceless short-form answer.)*
5. **AEO answers**: Nairaland, Reddit, LinkedIn articles. *(New: compounds, and costs nothing.)*
6. Launch watch · buyer-question data · comment-to-DM · NIESV session · LinkedIn posts · client intros · referrals · calculator (as in §5).

### Sources searched (Nevo's Brain)

[How to Choose a Startup Idea in 2026](https://x.com/wickedguro/status/2090778859352563921) · [Outbound-to-Inbound Cold Outreach](https://www.youtube.com/watch?v=3p97bZzBHx8) · [Alex is Building interview](https://x.com/AlexIsBuilding/status/2079192005003919602) · [Reach buyers where they gather](https://x.com/wickedguro/status/2069034977304653858) · [Writing a clear website headline](https://gitroom.com/blog/perfect-company-messaging) · [Hooks: real results, no fake numbers](https://gitroom.com/blog/hook-developers) · [Distribution Playbook $2M→$3M](https://x.com/wickedguro/status/2086788813301661865) · [TikTok slideshows](https://x.com/wickedguro/status/2046261869963587636) · [Selling SaaS through outcomes](https://x.com/wickedguro/status/2096974398167392500) · [Application-only waitlist](https://www.youtube.com/watch?v=F_dC4_DyXE4) · [Joining competitor conversations](https://gitroom.com/blog/tell-people-opensource-better-closed-source) · [One founder as the face](https://gitroom.com/blog/5-steps-build-brand-company) · [Papermark / founder account](https://www.youtube.com/watch?v=z6TpKJSSrbI) · [Churn by ICP cohort](https://x.com/wickedguro/status/2110786062490431852) · Nevo's X posts, Jun & Aug 2026
