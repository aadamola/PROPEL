# Facts Sheet Audit — Shalom Park Estate

*Signed sheet received 2026-07-27 from Nanameme Collins (Sales Executive, IFT Realty Ltd). Archived: `docs/facts-sheet-SIGNED-2026-07-27.pdf`. KB built: `kb.json`. This audit is the QA gate between what they wrote and what a buyer is allowed to hear.*

**Verdict: Gate 4 CLEARED — build proceeds.** The sheet came back rich, signed, and more complete than most agencies ever get. Nine gaps ship as escalation triggers, three items need answers before publication, and two need a business conversation.

---

## 1. What we can now say (warranted)

| Fact | Value |
|---|---|
| Developer | IFT Realty Ltd · RC 640603 |
| Location | Abijo, opposite GRA Second Gate, Ibeju-Lekki 105101 |
| Estate size | 10.37 hectares · 27 units + 89 plots · ~30% developed |
| Title | **Governor's Consent** · layout approval confirmed · **no litigation, acquisition or dispute (warranted)** |
| 4-bed semi-detached | ₦185m · completed · 3 of 3 available |
| 2-bed condominium | ₦95m · under development · **5 of 16 available** |
| 5-bed semi-detached | ₦200m · off-plan · 4 of 4 available |
| Serviced plots | ₦125,000/sqm |
| Payment | 50% down · 3, 6 or 12-month plans |
| Allocation | Instant |
| Inspection | Any day incl. weekends · reps on site · virtual by Zoom/FaceTime/WhatsApp · diaspora proxy allowed |
| Delivered | Gated security + CCTV, diesel power (solar-compatible), water treatment & drainage, roads & street lighting |
| Restriction | No building beyond 4 storeys |

**Scarcity we may state honestly:** only **5 of 16** condominiums remain. True as at 2026-07-27, re-verified monthly per Section H — and re-verified weekly by us before any campaign that leans on it.

## 2. Gaps — these ship as escalation triggers, not assumptions

The assistant answers "let me get you the exact figure from the team" and hands off:

1. **Instalment interest/markup — entirely blank.** The single most consequential gap. Every buyer on a 12-month plan asks "so what does it cost in total?" and we cannot answer.
2. Estate completion date — blank.
3. Off-plan handover dates — "a timeline will be given," no dates.
4. Title document reference number — blank.
5. **Registered in whose name — blank.** Governor's Consent is stated but we cannot say whose.
6. Survey plan number, approving authority — blank.
7. **LASRERA registration — blank.**
8. Excluded costs are named (legal, utility connection, HOA) but **no amounts or percentages**.
9. Plot sizes and plot availability — blank. Price per sqm without sizes can't produce a total.

Also unanswered: price status (current / promotional / subject to review) on every row; development type; recreation marked "N/A"; walkthrough video left as the literal words "YouTube URL".

## 3. Three things to resolve before we publish

**a) The 2-bed condominium price looks wrong.** ₦95m for a 2-bed against ₦185m for a finished 4-bed semi is a ratio that doesn't sit right — a 2-bed at roughly half the price of a four-bedroom house of the same finishing standard. It may well be correct; it may be a typo. **We ask before it goes in a single advert.** This is precisely the failure rule 2 exists to catch, and asking costs one message.

**b) Title documents still unsighted.** They've warranted Governor's Consent and offered it for inspection. Until ADEDAMOLA has physically seen the Consent and the approved layout — and knows whose name is on them — no title claim publishes. The assistant may state the title *type* conversationally, because it is warranted; all documentation detail routes to a human.

**c) LASRERA.** Lagos requires real estate practitioners to be registered. It's blank. Worth knowing their status — for their compliance, and because it's a trust signal in campaign copy if they have it.

## 4. Two business conversations (partner view)

### The cancellation policy is a conversion problem

> Purchaser forfeits **25%** of the purchase price on cancellation for any reason. Refunds only after the property is resold to a third party. Developer has **up to 180 days from the date of resale** to pay.

On a ₦95m condo that's ₦23.75m forfeited, with the remainder payable at an unknown future date the buyer does not control. That is a severe term, and diaspora buyers — who research obsessively and share notes in groups — will find it.

**Our handling is settled: state it plainly, every time, and hand to a human.** We never bury it, never soften it. A buyer who learns it upfront is an informed buyer; a buyer who learns it after paying is a dispute with our campaign's name on it.

**Recommendation to IFT Realty:** ask their lawyer whether a 25% forfeiture with a resale-contingent refund is enforceable and whether it survives consumer-protection scrutiny. Commercially, softening it — a sliding scale, or a fixed refund window — would likely convert better than the discount they've ruled out. Not our decision; worth putting in front of them once, with numbers.

### Their inbound volume is 1–2 enquiries a day

This changes the value story, and we should be honest about it rather than sell a volume solution to a non-volume problem.

At 1–2 enquiries/day the Concierge is **not** a workload reliever — it's insurance on an extremely expensive asset. At ₦95m–₦200m a unit, a single enquiry lost to a slow reply costs more than a year of our care fee. That's the true argument, and it's stronger than "handles hundreds of messages."

It also points at the real bottleneck: **they don't have a traffic problem the bot can fix — they have a traffic problem full stop.** No active paid campaigns, no discounts running. The honest upsell is the Leads/Launch offering feeding the Concierge, and the 16-condo inventory with 5 remaining is the cleanest campaign to prove it on.

## 5. What I built from this

- `kb.json` — the live knowledge base. Every field traces to the sheet; every gap is `null` with a matching entry in `escalate_always`; `must_not_say` carries their four restrictions plus our two standing ones; the refund policy carries an explicit "state plainly, then hand to a human" instruction.
- Escalation routing: Collins (Mon–Fri 8–8) → Mercy (weekends/evenings) → Tobi (supervisor), with the 15-minute unclaimed-hot-lead SMS alert they approved.
- Their two restrictions are honoured in configuration: **no auto-sending the layout map, no auto-sending title pages.**

## 6. Open questions for the client (one message, not five)

1. Confirm the 2-bed condominium price of ₦95m.
2. Interest or markup on the 3, 6 and 12-month plans — the numbers, per plan.
3. Amounts for legal fees, utility connection and HOA (₦ or %).
4. Plot sizes available, and how many plots remain.
5. Whose name is on the Governor's Consent, plus the title reference and survey plan numbers.
6. LASRERA registration status and number.
7. Estimated completion date for the estate, and the handover window quoted to off-plan buyers.
8. The actual walkthrough video link.

*Everything above is answerable in one WhatsApp message from Collins. Until it is, the assistant escalates on each — which works, but hands a human every question a bot should be closing.*
