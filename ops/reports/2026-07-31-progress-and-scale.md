# Progress Report & Scale Assessment — 31 July 2026

*Partner review at the end of the first production month. Repo integrity check, honest position, and where the next naira comes from.*

---

## 1. Repo integrity — clean

| Check | Result |
|---|---|
| Working tree | Clean, nothing uncommitted |
| QA harness | **14/14 passing** |
| Knowledge bases | 3 valid: Shalom Park (live client), Propel's own, Apex Gardens (sandbox) |
| Stale-tool sweep | Clean — the 2 remaining hits in docs/06 are decision records ("replaces Make/Zapier"), which belong |
| Repo shape | 15 strategy docs · 7 templates · 3 ops tools · 1 client file |
| Pipeline gate | 🔴 **2 overdue actions**, both ADEDAMOLA's |

## 2. What we actually have

**Shipped in ~4 weeks:** a complete strategy stack, brand, website draft, ops tooling, a QA standard with a runnable harness, production infrastructure on a live VPS, three knowledge bases, and a paying client.

**Revenue reality — say it plainly:** one setup fee received, **amount still unconfirmed**, and **MRR is zero** because the care fee hasn't been confirmed as started. Everything else is unbilled capability.

**Live blockers, in order of what they cost us:**

| Blocker | What it holds up | Owner |
|---|---|---|
| 🔴 CAC filing | Meta Business Verification → App Review → **automation on any client account**. Blocks a deliverable already paid for | A |
| 🔴 ₦95m condo price unconfirmed | Any Shalom Park advert | A |
| Title documents unsighted | Publishing any Shalom Park price or title claim | A |
| Care fee / commission unconfirmed | Recurring revenue that may already be owed | A |
| LLM credits (~₦25k) | The Concierge speaking at all | A |
| Meta Business Suite link | The Meta app | A |

**Everything producible is done.** Every remaining blocker needs a bank account, a signature, or a login.

---

## 3. The honest risk, before any strategy talk

**We have a pipeline of one.** `pipeline.csv` holds one real prospect — the client who already said yes — plus a worked example. Ten prospect names have been requested in every session for three weeks and haven't landed.

That single fact outranks every idea below. **100% client concentration**, no second conversation in flight, and the thing that unblocks the fix (ten names, twenty minutes) keeps losing to infrastructure work — including work I've been happy to produce because producing is easier than selling.

Infrastructure is not the constraint. **Sales motion is the constraint, and it has been for three weeks.**

---

## 4. Revenue strategy — where the next naira comes from

Ranked by naira-per-ADEDAMOLA-hour, which is the only ranking that matters at 20 hrs/week.

### Tier 1 — money already on the table

**a) Confirm and start the Shalom Park care fee.** ₦250k/mo is the compounding asset; setup fees are lumpy and one-off. If the care fee hasn't started, we are delivering unpaid work right now. *One conversation. Possibly the highest-value hour available this week.*

**b) The commission mandate is drastically underweighted.** At ₦185m–₦200m per unit, **3% is ₦5.5m–₦6m on a single sale** — roughly two years of care fees from one closing. There are 3 completed semis, 5 remaining condos, 4 off-plan units and 89 plots. The economics of this business are not in retainers; they're in attribution. And attribution requires the Concierge tagging every lead from message one, which requires App Review — which requires CAC. *That chain is the real reason CAC is urgent.*

### Tier 2 — the repeatable engine

**c) Lead with the Concierge, don't upsell it.** Shalom Park asked for DM/comment automation unprompted, before any pitch. That's market pull. The rate card leads with Presence retainers; the market is pulling on Concierge. **Recommendation: make Concierge the wedge product and retainers the upsell** — it's what they ask for, it has the best margin, and it's the hardest for a generalist agency to copy.

**d) Charge for the teardown.** Ten free audit teardowns are lead-gen with no floor. A **₦50k paid diagnostic** filters tyre-kickers, funds prospecting, and converts better — people act on what they paid for. Free stays available for Tier-A targets only.

**e) Sell the NIESV tribe.** ADEDAMOLA's professional network is the warmest, most credible channel available, and selling to it is explicitly in-bounds (the constraint is asking friends for *follows*, not selling to peers). A chartered-track surveyor selling marketing to surveyors is the single most defensible pitch we have.

### Tier 3 — deliberately parked

Shortlets and property-management firms (docs/14) stay Phase-2 until the triggers fire. Broker Hub stays in validation. **Nothing new opens while the pipeline holds one name.**

---

## 5. AI advancement — where the leverage actually is

**The highest-leverage AI application right now is not the client-facing bot. It's the prospecting engine.**

We've spent the month making the Concierge excellent. Meanwhile the binding constraint is that ADEDAMOLA has no prospect list. The Agent DMZ (docs/13) already authorises a **Prospect Research Desk** — autonomous dossier-building on public socials, cutting teardown production from ~15 minutes to ~5. Applied to prospecting rather than delivery, that turns one 20-minute list into a week of qualified outreach. **This should be built next, ahead of further Concierge polish.**

**Three genuine moats, in descending order:**

1. **Warranted-facts architecture.** Competitors running ManyChat and unofficial WhatsApp gateways cannot make the accuracy promise, because they have no facts-warranty mechanism and no escalation discipline. Our client signs a sheet; their bot cannot invent a price. That is a *contractual* moat, not a technical one — much harder to copy.
2. **The official-API stance.** Cheap vendors build on ban-prone gateways. When one of their clients' numbers gets banned mid-campaign, that becomes our best sales story — and it will happen.
3. **The QA harness as a sellable artifact.** Nobody in this market tests a bot against injection, grounding and policy suites. "Here are the 14 tests your assistant passes before it speaks to a buyer" is a closing tool no competitor can produce on demand.

**Where I'd invest next, in order:** ① Prospect Research Desk ② the brain bake-off, finally scored ③ Nigerian-English voice notes for diaspora buyers ④ deterministic financial calculators (already ruled — instalment maths never touches an LLM).

**What I'd resist:** more model shopping. The routing ruling is settled; re-opening it is procrastination with a technical alibi.

---

## 6. What breaks first as we scale

| Breaks at | What | Fix, and when |
|---|---|---|
| **Now** | Sales capacity — one human, 20 hrs/wk, no pipeline | AI prospecting + paid teardowns. **Immediate.** |
| **Now** | 100% revenue concentration in one client | Client #2 by end of August |
| Client #2 | Every client deployment waits on App Review | **Start CAC today** — the queue is 2+ weeks and doesn't run in parallel |
| Client #3–4 | Facts-sheet maintenance is linear — monthly reviews per client | Automate the review reminder + diff; the notifier clause is already in every sheet |
| **Client 5** | One n8n instance holds every client's credentials — one leak exposes all | **Tripwire already set:** split instances at 5 clients or first data-isolation question |
| Client 5–10 | 8 GB RAM binds | Upgrade in place — not a re-architecture |
| Any time | Single VPS, no redundancy | Never sell 99.9%. Sell monitoring + kill switch, which is true |
| Any time | **Key-person risk** — every send, signature and payment routes through one person | Document the runbooks (in progress); revisit at first hire |

**The scaling story is genuinely good** — infrastructure cost per additional client is near zero, blended gross margin 75–85%, and clients #2 and #3 cost no new naira in servers. But that leverage only pays out on clients we don't currently have.

---

## 7. Partner recommendation — the next three moves

1. **Ten prospect names.** Twenty minutes. It has been the bottleneck for three weeks and no amount of building substitutes for it.
2. **CAC filing.** Fifteen minutes, starts a two-week external clock that gates the commission engine — where the real money is.
3. **Confirm the care fee and commission rate with Shalom Park.** One conversation, possibly recovering revenue already owed.

Everything I can build without a login, I have built. The next constraint is not code.
