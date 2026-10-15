# [Client] — Concierge monthly report · [Month YYYY]

*Generated from the attribution ledger. Every number here can be re-checked by the client's own auditor with `ops/concierge/sql/002-verify-ledger.sql`. **No number is typed by hand.** Prompt: ops/prompt-library.md P4.*

## The month in five numbers

| | This month | Last month |
|---|---|---|
| Conversations answered | [n] | [n] |
| Median first-reply time | [seconds] | [seconds] |
| Leads handed to your team (escalations) | [n] | [n] |
| Inspections booked *(as reported by your team)* | [n] | [n] |
| Sales closed from Propel-attributed leads *(Launch Partner)* | [n] | [n] |

## What buyers asked most
1. [question / keyword] — [n]
2. …
3. …

**Questions that hit no rule** (now added as triggers): [list]

## Hand-offs
| Lead (handle) | Asked about | Handed to | Picked up within | Outcome |
|---|---|---|---|---|
| @… | … | [name] | [min] | [inspection / pending / lost] |

## Ledger integrity
`VERDICT: [INTACT — every event verifies]` (run [date])

## Facts review
- Facts confirmed unchanged by [notifier] on [date] · or changes applied: [list]
- Promotions: [rule — live, review by YYYY-MM-DD] · [lapsed → standard terms]

## Next month
- [one change we recommend, with why]

*Commission (Launch Partner only): attributed closed sales this month = [list of lead ids + sale dates], inside the 12-month window. Invoice follows separately.*
