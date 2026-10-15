# Propel Prompt Library v1

*Production prompts for core deliverables. Each takes structured inputs and produces client-ready drafts — always human-QA'd before anything ships (see docs/06-ai-stack.md §4). Facts (price, title status, size, amenities) come ONLY from client-warranted inputs; never invented.*

---

## P1 — Listing Turbo (full listing package, <2 hrs)

**Inputs:** property facts sheet (location, type, price, title status, features), 3–10 photos/video clips, client brand voice tag, target buyer (local professional / diaspora / investor).

```
You are Propel's senior real estate copywriter for the Lagos market. Using ONLY the
facts provided (never invent price, title, size, or amenity details), produce:
1. Instagram caption (hook-first, ≤150 words, 5 relevant hashtags, WhatsApp CTA)
2. TikTok/Reel script (30–45s: 3s hook, 3 visual beats, on-screen text per beat, CTA)
3. Long-form diaspora caption (trust-forward: title status, documentation, virtual
   inspection offer, payment-plan clarity)
4. Portal listing copy (PropertyPro/NPC format: headline + 120-word description)
5. 6 ad-copy variants (2 pain-led, 2 aspiration-led, 2 urgency-led; primary text +
   headline each, Meta housing-policy compliant)
6. WhatsApp broadcast blurb (≤60 words, forward-friendly)
Voice: [client voice tag]. Market language: use "C of O", "Governor's Consent",
"off-plan" etc. accurately per the facts sheet. Flag any claim you could not verify
from inputs as [VERIFY].
```

## P2 — Response Audit pack (sales weapon)

**Inputs:** the firm's Response Test row (timestamps), their public Instagram (recent posts, bio, highlights), their public listing facts, segment (developer / surveyor-led firm / agency).

```
Fill ops/templates/response-audit.md for this firm. Section 1 uses ONLY the logged
timestamps (median only if ≥10 firms measured). Section 2 walks post → comment → DM →
inspection offer → documents as a buyer would, naming each leak. Pick the 3 biggest
leaks and frame each as buyers lost, clearly stated as an assumption. Give one free
fix they can do this week. Then spec a DEMO assistant from their PUBLIC listing only,
labelled DEMO. Never name or compare competitors, never quote returns, never promise a
go-live date. For surveyor-led firms, lead with the credential trust they're not using.
```

## P3 — Monthly Content Calendar (per client)

**Inputs:** client segment + voice tag, active listings summary, 3 content pillars, market moment notes (season, rates, news).

```
Produce a 1-month content calendar (posts/week per client tier) as a table:
day | platform | format | hook | full copy/script | asset needed from client | CTA.
Pillar mix: 40% listings, 30% authority/education, 20% personality/BTS, 10% social
proof. Every listing post pulls facts from the listings summary only. Education posts
answer real Lagos buyer anxieties (omonile, fake agents, off-plan risk, diaspora
remote-buying). Mark any post requiring client footage with [SHOOT].
```

## P4 — Monthly Concierge report

**Inputs:** ledger export for the month (counts by event type, first-reply times, escalations with pick-up times), the previous month's report, client-reported inspections and sales, facts review notes, promo review dates.

```
Fill ops/templates/monthly-report.md. Every number comes from the ledger export or
is labelled "as reported by your team". Plain English, under 300 words of commentary:
what happened → why (honestly, including misses) → one change for next month. List
every buyer question that hit no rule (they become triggers). Never a vanity metric,
never a projection.
```

## P5 — Proposal Generator

**Inputs:** Response Audit pack (P2), call notes, recommended door + rate card v2 figures (docs/03), prospect's stated goal.

```
Fill ops/templates/proposal.md using the audit findings and call notes. Mirror the
prospect's own words for their goal. Tie each deliverable line to one of their 3 leaks.
Copy figures exactly from docs/03; never a custom price unless ADEDAMOLA set one.
One page. No feature lists without a "so that..." outcome clause.
```

## P6 — Objection Response Drafts

**Inputs:** objection text (usually a WhatsApp message), prospect segment, deal context.

```
Draft 2 reply options for this objection: (a) short WhatsApp-native reply (≤80 words,
warm, one question back), (b) fuller version with one proof point from our case
studies. Base: docs/15 (positioning) and the offer in docs/03. Never
discount: reframe value; if price is genuinely the blocker, offer Concierge Instagram
instead of Developer, or the founding pilot if it's open.
```

---

## P7 — Response Test follow-up (weekly, per firm)

**Inputs:** a row from `ops/growth/response-test.csv` (firm, contact name, estate, asked_at, first_reply_at), the current median and number of firms measured.

```
Draft the give-first follow-up for this firm using Script 2 in
ops/growth/response-test.md. Rules: use only the logged timestamps; include the
median ONLY if at least 10 firms have been measured; no offer, no Propel pitch,
no comparison with a named competitor; ≤60 words; warm and specific. If they never
replied, use the "never replied" variant. Output the message plus the CSV fields
to update (followup_sent_at left blank for ADEDAMOLA to fill once sent).
```
**QA:** recompute reply_hours from the two timestamps yourself before sending.

## P8 — AEO answer (forum / LinkedIn)

**Inputs:** the question as asked (Nairaland / Reddit / LinkedIn), platform.

```
Write a genuinely complete answer as Adedamola (B.Sc. Estate Management, NIESV exam
passed, ~5 years in Lagos property; NEVER "chartered"). Answer fully on its own;
numbered steps where useful; plain English; no legal advice (point to a property
lawyer); never name or criticise a specific estate or developer; no links in the
body on Nairaland/Reddit; mention Propel only in the sign-off, and only on LinkedIn.
Flag any factual claim about Lagos procedure as [VERIFY] for a human check.
```

## P9 — Faceless slideshow (TikTok / IG carousel)

**Inputs:** topic, target viewer (diaspora buyer / developer / surveyor), any true event with client approval.

```
Write a 4–6 slide faceless slideshow. Slide 1 is the hook and does 95% of the work:
a specific person or moment, a number only if real, a small story the viewer finishes
in their head. One idea per slide, ≤18 words each. The "[person] + doubt → showed them"
formula is ONLY allowed with a supplied true event and client approval; otherwise use
"N things to…" or "problem → fix per slide". Give two alternative slide-1 hooks for
an A/B test, plus a caption ending in a question. No invented numbers.
```

## P10 — Group-owner outreach

**Inputs:** person, type (realtor network / coach / lawyer / podcast / NIESV), one specific real thing they did, what we can give them.

```
Draft the group-owner message from ops/growth/group-owners.md, personalised with
the specific thing they did. Bring something big (free assistant for their own
business, a feature in the Response Report, an intro) and ask for something small
(one developer intro or a mention). ≤90 words, first person as Adedamola, no
"please promote us", no commission promises. If the specific thing isn't real and
checkable, output "DO NOT SEND — no genuine personalisation" instead.
```

---

*Add prompts here as workflows stabilize (rule: done twice → template). Each new prompt needs: inputs list, the prompt, and QA notes.*
