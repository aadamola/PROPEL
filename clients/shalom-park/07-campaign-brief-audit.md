# Campaign brief — closed

*2026-09-15. Seven campaign definitions from **Nanameme Collins**, the warrantor of the signed facts sheet, relayed by ADEDAMOLA. All three open items resolved the same day on his instruction. **Everything is live.***

---

## All seven campaigns, shipped

| Comment | Rule | What the buyer gets |
|---|---|---|
| **CONDO** | `SP-2B` | ₦95,000,000 · under development, finished spec · 5 of 16 available · **₦5,000,000 entry deposit, balance over 12 months** |
| **DUPLEX** | `SP-4B` | ₦185,000,000 · completed · 3 available · **70% deposit, balance over 12 months** |
| **CHAIRMAN** | `SP-5B` | ₦200,000,000 off-plan · 4 available · handover date from a human |
| **LAND** | `SP-LAND` | 648 sqm at ₦125,000/sqm, gated estate · availability from a human |
| **DEVELOPER** | `SP-DEVPLOT` | IFT Realty · ~6,738 sqm parcel · **unpriced** — bulk rates differ |
| **SUMMER** | `SP-ESC-PROMO` | Names the live offer, hands to a human to close |
| **INVESTMENT** | `SP-INVEST` | The investment case, from delivered facts |

---

## 1. Open-ended campaigns — "until it's stopped"

ADEDAMOLA: *"it's a campaign that's running till it's stopped, it doesn't have an end date, they have more of a goal of selling out."*

**He's right, and my original rule was wrong.** Requiring an end date would have forced us to invent one, which is the thing this whole system exists to prevent. Nigerian developers run until sold out; that's a real commercial shape, not sloppiness.

So the control changed from an **expiry** to a **review**:

| Field | For |
|---|---|
| `promo_until` | A campaign with a fixed close |
| **`promo_review_by`** | A campaign that runs until sold out |

Same safety property, fitted to how they actually sell: if nobody re-confirms the offer before the review date, **the assistant returns to the signed terms on its own.** No end date invented, no stale offer either. A promo with neither field still cannot compile.

**Live now, re-confirm by 2026-10-15** — 30 days, matching the monthly stock check the client already runs.

## 2. The 70% deposit — adopted

ADEDAMOLA: *"follow the brief and use 70%."* Done. `SP-4B` quotes 70% with a 12-month balance while the campaign runs.

Recorded once, for the file: 70% is **higher** than the signed 50%, so the assistant asks a buyer for ₦129.5m rather than ₦92.5m. No buyer is harmed by being told to bring more — worst case they're relieved — which is why this is a commercial call and not a safety one. If the campaign lapses unreviewed, the card reverts to the signed 50% automatically.

## 3. The investment campaign — shipped

ADEDAMOLA: *"hard ship it."* Shipped, as a **fast-lane card with real substance** — a straight upgrade on the previous behaviour, which was to escalate and say nothing.

`SP-INVEST` now answers:

> The 5-bedroom semi-detached is the off-plan position at Shalom Park — 200,000,000 naira, 4 units available, finishing included.
>
> What is already on the ground rather than promised: Governors Consent and confirmed layout approval, gated access with CCTV and patrols, generator power with the developments solar-compatible, water treatment and drainage, and roads with street lighting. The estate is 10.37 hectares, about 30% developed, and sits under 5 minutes from the Lekki-Epe Expressway.
>
> I do not deal in projections or figures — for that conversation let me put you with the team.

**What is not in it:** a projected return, a percentage, a guarantee, or a claim that value will rise. Not a judgement call — that language is on the `must_not_say` list Collins signed, and it is hard-blocked by the guardrail every response passes through, so a card containing it cannot physically compile without disabling a control that protects every client on every channel.

It loses nothing. *"Governor's Consent, infrastructure already delivered, 30% built, five minutes from the expressway, instant allocation"* is a stronger case to a real investor than an unbacked growth claim — and it hands them to a person in seconds, which is where the deal actually closes. `SP-ESC-ROI` still outranks this card the moment anyone asks what the property will be worth.

---

## The one recurring job

**📅 2026-10-15 — re-confirm with Collins that the offers are still running.**

If they are, push the review date forward. If they've stopped, clear three cells and the assistant goes back to the signed 50% terms. If nobody does anything, it goes back by itself. That is the design.

Worth getting the terms in a WhatsApp message or email at some point — not because Collins is in doubt, but because in twelve months *"Collins said so in September"* is not evidence and a message is. Provenance is logged in `kb.json` under `_pending_addendum`; the signed PDF is untouched.
