# Campaign brief — audit and open items

*2026-09-15. Seven campaign definitions from **Nanameme Collins** — the same person who signed the warranted facts sheet on 2026-07-27 — relayed by ADEDAMOLA, who confirms the new figures are **ongoing promotions**.*

**Verdict: adopted.** The source is the warrantor and the promo framing reconciles most of what looked like contradiction. The ₦95m condo price is released, plot sizes are in, all seven campaigns are wired. **Three items remain open — down from nine.**

---

## What changed on Collins' word

| | Before | Now |
|---|---|---|
| 2-bed price | withheld — Propel price query open since July | ✅ **₦95,000,000 live.** He restated the figure he signed; the query is answered |
| Residential plot size | blank in the signed sheet | ✅ **648 sqm live**, alongside the warranted ₦125,000/sqm |
| Development parcel | didn't exist in our records | ✅ **~6,738 sqm live** as a product — **deliberately unpriced** |
| Promotions | "no active discounts" per the signed sheet | ✅ acknowledged as running — terms still come from a human |

### Why the parcel ships without a price

6,738 sqm × ₦125,000 = **₦842,297,500**. Bulk parcels are normally priced differently from single plots, and at that size the gap between the two rates is hundreds of millions. The card names the developer and the parcel, then hands over. Same logic on land: the assistant states **648 sqm** and **₦125,000/sqm** and never does the multiplication in front of a buyer.

---

## The structural fix: promotions now expire themselves

An ongoing promotion is the most dangerous thing you can put in an automation, because *ongoing* has no end and the robot never gets the memo. The failure mode is specific and expensive: **a ₦5,000,000 entry deposit still being quoted in November for an offer that closed in September, and a buyer arriving with ₦5m for a ₦95m unit.**

So the rule table now carries a promotion lifecycle:

| Column | What it does |
|---|---|
| `promo_from` / `promo_until` | The window, as dates |
| `promo_response` | What the buyer is sent **while it runs** |
| `dm_response` | The signed standard terms — what they get **the day after it ends** |

**A promotion with no end date cannot be compiled.** `build-keywords.js` rejects the table outright. Every build prints which promotions are live and which have lapsed. Tested both directions (`KW-37`, `KW-38`, `KW-39`).

This is why the promo terms are not live yet. Not doubt about Collins — **I just need the dates.**

---

## The three open items

### 1. 🔴 Promotion dates — the only thing blocking the promo cards

Start and end date for each offer. Once they land it is a **two-cell edit** per rule and the cards go live, retiring themselves automatically on the closing date.

**Already drafted, ready to paste the moment dates arrive** (`SP-2B` → `promo_response`):

> The 2-bedroom condominium is 95,000,000 naira, under development and finished spec.
>
> There is an offer running: you can secure a unit with a 5,000,000 naira initial deposit and spread the balance over 12 months. It closes on [DATE], and the team will confirm everything in writing before you pay anything.

### 2. 🟡 The 70% deposit — this one genuinely doesn't read as a promotion

The signed standard is **50% down, balance over 3, 6 or 12 months**. The brief puts the 4-bedroom at **70% down with a 12-month spread**. That's **₦129.5m upfront instead of ₦92.5m — ₦37,000,000 more.**

A promotion that asks the buyer for ₦37m *more* is either not a promotion, or it's the payment condition attached to a discount nobody has stated. The condo moves the opposite way — ₦5m instead of ₦47.5m, which is obviously a promotion.

Both can be true. But I'm not putting the harder-than-signed number in front of buyers on an assumption. One question: **is the 70% a condition attached to a price reduction on the completed 4-beds, or has the standard deposit on completed stock always been higher than the sheet says?**

Until then `SP-4B` quotes the signed 50% and adds *"the team will confirm which plan applies to this unit today."*

### 3. 🔴 "Capital growth" — holding this one, and it isn't an addendum item

This does not move on Collins' say-so, and I want to be straight about why rather than quietly ignoring it.

`must_not_say` → *"Resale or appreciation estimates"* is on the facts sheet **Collins himself signed**. He has now told us two contradictory things, and the signed one wins — that is the entire point of having him sign it. It's also hard-blocked by the guardrail every response passes through, so a rule promising capital growth cannot physically ship without me disabling a safety control.

Beyond our own rules: a projected return on an off-plan property is the claim that draws regulatory attention in Nigeria and the claim a buyer's lawyer quotes back in a bad year. It's the one category where being the vendor who *didn't* say it is worth real money.

**The INVESTMENT campaign keeps its name and all its traffic.** It routes to a person within seconds, no figure attached — and a serious investor talking to Collins converts better than one reading a forecast from a bot.

**The honest version, ready to build on your word:** location and access, Governor's Consent, delivered infrastructure, stage of development, payment terms, instant allocation. Every one warranted. None of them a forecast. That's a strong investment card — it just promises facts instead of futures.

---

## Message to send Collins

> Collins — thanks for the campaign details, that's exactly what I needed. Three quick things before the Instagram assistant goes live with them:
>
> 1. **Dates.** What are the start and end dates for the current offers? The system needs them so an offer switches itself off when it closes — I don't want it still quoting a ₦5m deposit a month after the promo ends.
> 2. **The 4-bedroom at 70%.** Just checking I've got this right — 70% is higher than the 50% on the facts sheet, so is that tied to a reduced price on the completed units, or is the standard deposit on finished stock simply higher?
> 3. **On the investment angle** — I can't have the assistant talk about capital growth or projected returns; it's the one thing that creates a real problem later, and it's on the sheet you signed. What I can do is make the case on the facts: Governor's Consent, delivered infrastructure, the stage of the build, instant allocation. Happy to show you the wording.
>
> Everything else is live — the ₦95m condo price, the 648 sqm plots, the 6,738 sqm development parcel, and all seven campaign keywords.

---

## Provenance, recorded

The relayed terms are logged in `kb.json` under `_pending_addendum` with what was signed alongside what was relayed. The signed PDF is untouched. When the dates come back, get them in a message or an email — not because Collins' word is in doubt, but because in twelve months' time *"Collins said so in September"* is not evidence and a message is.
