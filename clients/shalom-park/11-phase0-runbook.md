# Phase 0 — daily operating runbook

*20 minutes a day. This is the automation, run by a human, until the Meta app is proven. Everything here is what the bot will do on its own later — which is why doing it by hand now is worth it: you find out what buyers actually type.*

---

## The daily loop

### ☀️ Morning — 10 minutes

1. Open Instagram → **Comments on the last 3 posts**
   - Public reply: **"Just sent you a DM 📩"** — nothing else. No prices in public, ever.
   - Then DM them the matching shortcut from [09-phase0-saved-replies.md](09-phase0-saved-replies.md)
2. **DMs** → answer with the shortcut. Type it, it expands, send.
3. Anything marked ⚠️ → **tell Collins now**, using the template below.

### 🌙 Evening — 5 minutes

Log the day in [`phase0-log.csv`](phase0-log.csv). One row per conversation. That is the baseline — without it we have no scorecard and no commission evidence.

---

## Which shortcut

| They say | Send |
|---|---|
| price, how much, hw much, cost | `price` |
| 2 bedroom, condo, apartment | `condo` ⚠️ |
| 4 bedroom, duplex, semi detached | `duplex` |
| 5 bedroom, off plan, chairman, flagship | `chairman` ⚠️ |
| land, plot, sqm, 648 | `land` ⚠️ |
| investment, strategic asset, good buy | `invest` ⚠️ |
| developer, bulk, townhome, joint venture | `dev` ⚠️ |
| promo, summer, flash sale, special offer | `promo` ⚠️ |
| where, location, address, Abijo | `loc` |
| inspect, visit, viewing, book | `inspect` ⚠️ |
| abroad, diaspora, zoom, video call | `virtual` ⚠️ |
| payment plan, instalment, deposit | `pay` ⚠️ |
| title, C of O, documents, survey | `docs` ⚠️ |
| available, how many left, still available | `avail` |
| amenities, security, power, water, roads | `amen` |
| can I build, storeys, restrictions | `build` ⚠️ |
| allocation, handover, when do I get it | `deliv` ⚠️ |
| info, details, interested, hello | `info` |
| **ROI, yield, appreciation, returns** | `roi` ⚠️ |
| **refund, cancel, withdraw** | `refund` ⚠️ |
| **account number, I want to pay, transfer** | `bank` ⚠️ |
| discount, negotiate, best price | `disc` ⚠️ |
| litigation, court, omonile, is it genuine | `legal` ⚠️ |
| completion date, when finished | `done` ⚠️ |
| legal fees, other charges, total cost | `fees` ⚠️ |
| agent, commission, partnership | `agent` ⚠️ |
| mortgage, bank loan, financing | `loan` ⚠️ |

**Not on the list? Send `info` and tell Collins.** That is always the right answer — never improvise a fact.

---

## Telling Collins

**Within 15 minutes, business hours.** That number is the client's own standard, from the facts sheet.

```
Instagram lead — Shalom Park

Handle:        @
Came from:     [post / keyword]
They asked:    
I sent them:   [shortcut]
They need you for: 
Best contact:  
Time:          
```

**Escalate immediately, no judgement call needed, when:**
- They ask about returns, refunds, bank details, discounts, legal, completion dates, other charges, agency or financing
- They say they want to **buy, inspect, or pay**
- They ask anything not on the shortcut list
- They are abroad and want a call

**Escalation ladder:** Collins (Mon–Fri 8am–8pm) → Mercy (weekends, evenings) → Tobi (overrides).

---

## The seven rules

1. **Never quote a price that isn't in the pack.**
2. **Never promise a completion date.** There isn't one in writing.
3. **Never negotiate.** Prices are fixed; what moves is how they pay.
4. **Never send an account number.** Not once, not to anyone.
5. **Never talk about returns, yields or appreciation.** Send `roi` and hand to Collins.
6. **No figures in a public comment.** Public replies are `"Just sent you a DM 📩"` and nothing more.
7. **When in doubt, `info` + Collins.** Nobody was ever hurt by an extra hand-off.

---

## Weekly, on Fridays — 10 minutes

Count the log and send the client four numbers:

| | |
|---|---|
| Keyword comments | |
| DMs sent | |
| Leads handed to the team | |
| Inspections booked | |

**Week 1 is the baseline. We do not publish a target we have not earned** — and the client's own stated volume is 1–2 enquiries a day, so that is the number to beat. The first honest scorecard is the one that proves the system works.

---

## When Phase 1 lands

Everything above happens automatically: the reply, the public comment, the escalation, the log. Nothing in the copy changes, because the automation sends the same 27 texts from the same table.

**What this phase buys that the automation can't:** you will know which words buyers actually type. Anything they say that isn't on the shortcut list is a missing trigger — send it to me and it goes into the table.
