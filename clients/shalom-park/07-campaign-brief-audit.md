# Campaign brief vs. signed facts sheet — audit + addendum request

*2026-09-15. Seven campaign definitions supplied by ADEDAMOLA, audited line by line against the warranted facts sheet signed by Nanameme Collins on 2026-07-27 (`docs/facts-sheet-SIGNED-2026-07-27.pdf`).*

**Verdict: the campaign structure is adopted. Five of the seven carry figures that contradict or exceed the signed sheet, and those figures are not in the system.** Nine items need a signed addendum before they can be published.

---

## What went live immediately

The seven campaign words now each resolve to exactly one rule — the standard comment-to-DM play:

| Comment | Routes to | What happens |
|---|---|---|
| **CONDO** | `SP-2B` | Product + availability, price to a human |
| **LAND** | `SP-LAND` | ₦125,000/sqm, size + availability to a human |
| **SUMMER** | `SP-ESC-PROMO` 🆕 | Neither confirms nor denies a promo — human |
| **CHAIRMAN** | `SP-5B` | ₦200m off-plan, handover date to a human |
| **DUPLEX** | `SP-4B` | ₦185m, completed, 3 available |
| **INVESTMENT** | `SP-ESC-ROI` | Straight to a human, no figure |
| **DEVELOPER** | `SP-DEVPLOT` 🆕 | Names IFT Realty, parcel terms to a human |

Also added as triggers: *The Chairman's Choice*, *flagship*, *pre-construction*, *duplex*, *luxury duplex*, *apartment*, *strategic asset*, *plot size*, *648*, *townhome*, *bulk purchase*, *joint venture*, *flash sale*.

## What did not go live, and why

### 🔴 1. Deposit terms — three different numbers now exist

| Source | 4-bedroom | 2-bedroom |
|---|---|---|
| **Signed facts sheet** | **50% down**, balance over 3/6/12 months | **50% down** |
| Campaign brief | **70% initial deposit**, 12-month spread | **₦5,000,000 initial deposit**, 12-month plan |

These cannot all be true at once.

- On the ₦185m 4-bed: 50% is ₦92,500,000; 70% is ₦129,500,000. **A ₦37,000,000 difference in what a buyer is told to bring.**
- On the ₦95m condo: 50% is ₦47,500,000. The brief says ₦5,000,000. **A ₦42,500,000 difference — and a 5% deposit is a fundamentally different product from a 50% one.**

Getting this wrong in an automated DM isn't an embarrassment, it's a buyer arriving with the wrong money. The assistant currently states the **signed 50%**, because that is the only version anyone has put their name to.

### 🔴 2. "Summer Flash Sales" contradicts two signed fields — and it is September

The facts sheet records, in Collins' own submission:

- `pricing_terms.negotiable` → **false**. *"Prices are not negotiable. No discount authority stated."*
- `active_discounts_or_incentives` → **false**

A "Summer Flash Sales promotion offering discounted entry rates" is the direct opposite of both. Two further problems:

- **It is 15 September.** A summer flash sale running now is either expired or it is permanent urgency dressed as a deadline. We don't run the second kind — CLAUDE.md rule 2, and it is the single fastest way to lose the trust position we sell.
- **"Discounted entry rates" implies a reference price that was higher.** If the ₦185m/₦200m figures are already the discounted ones, our price cards are wrong. If they aren't, the discount is against a number nobody has stated.

`SP-ESC-PROMO` therefore does something deliberately narrow: it neither confirms nor denies a promotion, and hands the buyer to a person. If a real, dated, signed promotion exists, it becomes a fast-lane card in ten minutes.

### 🔴 3. "Emphasizing capital growth" — this one I won't build

`capital growth` is on the banned list in the signed sheet's own `must_not_say`, and it is hard-blocked by the guardrail every response passes through. An INVESTMENT campaign whose promise is capital growth is the exact claim the whole architecture exists to prevent — and it is the claim that attracts regulatory attention and, in a bad year, a buyer's lawyer.

**The campaign keeps its name and its traffic.** INVESTMENT routes to a human, immediately, with no figure attached. A serious investor talking to a person within minutes converts better than one reading a projection from a bot anyway.

The honest version of this campaign, which I can build the day it's approved: *location, title type, delivered infrastructure, stage of development, payment terms* — every one of them warranted, none of them a forecast.

### 🟡 4. Plot sizes — new, and they imply large numbers

Neither figure is in the signed sheet, which left plot size blank and flagged it for escalation.

| Brief | Implied at ₦125,000/sqm |
|---|---|
| 648 SQM residential plot | **₦81,000,000 per plot** |
| 6,738.38 SQM development parcel | **₦842,297,500** |

The second is 6.5% of the entire 10.37-hectare estate. Before either is published I need to know whether the per-sqm rate even applies at that scale, or whether bulk parcels are priced differently — because ₦842m stated wrongly by an automated DM is not a correctable error.

### 🟡 5. "Finished luxury" on the condo

The brief calls the 2-bedroom *"finished luxury apartments."* The signed sheet records the condo stage as **"Under development"** with finishing spec *"Finished."* Those are compatible on paper — finished *spec*, not finished *building* — but "finished luxury apartments" reads to a buyer as ready to move in. The assistant says **"under development, finished spec"**, which is what was signed.

---

## The addendum — nine items, one signature

Everything above unblocks with one document. This is an **addendum to the warranted facts sheet**, not a replacement: same signature, same warranty, dated.

| # | Field | Question |
|---|---|---|
| 1 | 4-bed deposit | 50% or 70%? |
| 2 | 2-bed deposit | 50%, or ₦5,000,000 flat? |
| 3 | 2-bed price | Confirm ₦95,000,000 — **outstanding since July** |
| 4 | Instalment markup | Does the 12-month balance carry interest or markup? Still blank. |
| 5 | Promotion | Is one running? Exact terms, exact start and end dates, and what the discount is measured against. |
| 6 | Residential plot size | Is 648 SQM standard? What sizes exist and how many are available? |
| 7 | Development parcel | Is the 6,738.38 SQM parcel real and for sale? Priced at ₦125,000/sqm or otherwise? |
| 8 | 5-bed pricing | Is there a pre-construction price distinct from ₦200,000,000? |
| 9 | Condo readiness | Expected completion for the 2-bedroom block. |

### Message to send

> Hi [name] — we're building the Instagram automation for Shalom Park and it's nearly ready. Before it talks to a single buyer I need nine things confirmed in writing, because the campaign copy and the facts sheet Collins signed in July disagree on some numbers.
>
> The big three: is the 4-bedroom deposit 50% or 70%? Is the 2-bedroom deposit 50% or ₦5m? And is the 2-bedroom ₦95m?
>
> I'm not being difficult — the assistant sends the same answer to everyone who asks, so a wrong deposit figure means buyers turning up with the wrong money. I'd rather it says "let me get the team" than say something we'd have to walk back.
>
> I'll send a one-page addendum to sign — same format as the facts sheet. Once it's back, all seven campaigns go live the same day.

**One-page addendum to sign: `ops/templates/warranted-facts-sheet.md` Sections D and E, re-issued with these nine fields.**

---

## Standing position

The campaign brief is almost certainly Shalom Park's own marketing material, and it may well be more current than a July facts sheet. That doesn't change the process: **a warranted facts sheet is superseded by a signed addendum, not by a paste.** The value we sell is that every number the assistant states has someone's name against it. That is worth a two-day delay and it is not worth ₦37m of buyer confusion.
