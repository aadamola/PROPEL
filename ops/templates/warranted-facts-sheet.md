# Warranted Facts Sheet — [PROJECT NAME]

*Propel template. This document does two jobs at once: it is the **legal warranty** that protects both parties, and it is the **direct source data** for the AI Concierge, the ads, the landing page and every post. Nothing Propel publishes or the Concierge says can come from anywhere else (CLAUDE.md rule 2).*

**How to use it:** the client fills every row, signs, returns. Any row left blank stays blank in production — the Concierge will say *"let me get you the exact figure from the team"* and escalate to a human rather than guess. **Blank is safe. Wrong is not.**

---

## Section A — Who warrants this

| Field | Answer |
|---|---|
| Legal entity name (as on CAC certificate) | |
| RC number | |
| Registered address | |
| Person warranting these facts (name + role) | |
| Direct phone / email for fact escalations | |
| Sales lead the Concierge hands qualified buyers to | |

## Section B — The development

| Field | Answer |
|---|---|
| Project name (exact, as marketed) | |
| Full address / location description | |
| LGA and state | |
| Total land size | |
| Number of units / plots in total | |
| Development stage (off-plan / under construction / completed) | |
| Estimated / actual completion date | |

## Section C — Title & approvals *(the section buyers care most about — and the one we will never improvise)*

| Field | Answer |
|---|---|
| Title type (C of O / Governor's Consent / Excision / Gazette / Deed — state exactly) | |
| Title document reference number | |
| Registered in whose name | |
| Survey plan number | |
| Building / layout approval status and authority | |
| Any pending litigation, government acquisition, or dispute affecting the land? (**yes/no — a "no" here is a warranty**) | |
| Which of the above documents can Propel sight in original or certified copy? | |

## Section D — Units, prices & availability

*Add a row per unit type. **Prices must state whether they are current, promotional, or subject to review.***

| Unit type | Size / bedrooms | Price (₦) | Price status | Units available | Notes |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |

| Field | Answer |
|---|---|
| What is included in the quoted price | |
| What is **excluded** (legal fees, agency, survey, development levy, infrastructure — state amounts or %) | |
| Are prices negotiable? By how much, and who may authorise? | |

## Section E — Payment

| Field | Answer |
|---|---|
| Initial deposit required (₦ or %) | |
| Payment plan options and durations | |
| Interest or price escalation on instalments | |
| Refund policy if a buyer withdraws | |
| Official payment account name (**the Concierge will never state account numbers in chat** — buyers are always routed to a human for payment) | |

## Section F — Delivery & buyer experience

| Field | Answer |
|---|---|
| Allocation process and timing | |
| What documents does a buyer receive, and when | |
| Handover / possession timeline | |
| Infrastructure and amenities **already delivered** (not planned) | |
| Amenities **planned** and their target dates | |
| Building restrictions / estate rules buyers must accept | |
| Inspection days, times and process | |
| Can inspections be done virtually? How | |

## Section G — Things the Concierge must NOT say

*List anything you do not want stated to buyers, and any claim we should route to a human. Examples: rental yield projections, resale value estimates, comparisons to other estates, timelines that aren't contractually fixed.*

| Do not say | Instead do this |
|---|---|
| | |

> **Propel's own standing rule, regardless of what is written above:** we will not publish or have the Concierge state investment-return projections, guaranteed appreciation, or artificial scarcity ("only 2 left!") unless the scarcity is factually true on the date stated and re-verified weekly.

## Section H — Keeping it true

Prices move, units sell, approvals land. A Concierge speaking last month's prices to this month's buyer is the single biggest risk in an automated system — so:

| Field | Answer |
|---|---|
| Who notifies Propel when any fact above changes | |
| Agreed notification method (WhatsApp group / email) | |
| Agreed maximum delay between a change and notifying us | |
| Frequency of scheduled fact reviews (Propel recommends: **monthly**, plus immediately on any price change) | |

**Until Propel is notified, the Concierge answers from this sheet.** If a fact changes and we are not told, the outdated answer is not Propel's liability — this is the clause that makes automation safe for both of us.

---

## Warranty & signature

The undersigned, on behalf of the client entity named in Section A, **warrants that every fact stated in this document is true, accurate and complete as at the date of signature**, that the entity has the right to market and sell the units described, and that no litigation, acquisition or dispute affects the land other than as disclosed in Section C.

The client authorises Propel to publish these facts in marketing materials and to use them as the knowledge base for automated buyer conversations, and undertakes to notify Propel of any change per Section H.

| | |
|---|---|
| Signature | |
| Name | |
| Role | |
| Date | |
| Company stamp | |

---

*Propel internal — do not send this block to the client:*

- Every completed sheet is filed at `clients/<client>/facts-sheet-<date>.md` and is the **only** permitted source for that client's KB, ads and landing copy.
- Any field left blank ships as an escalation trigger in the Concierge, never as an assumption.
- Re-warrant on every material change and at minimum every 6 months.
- This sheet is referenced by the MSA (ops/templates/msa-sow-skeleton.md) facts-warranty clause and by the docs/11 QA standard.
