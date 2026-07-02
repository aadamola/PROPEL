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

## P2 — Prospect Audit Teardown (sales weapon)

**Inputs:** prospect's IG/TikTok handle content summary, website/portal presence notes, segment (agent / surveyor-valuer / developer).

```
You are Propel's growth strategist. Produce a marketing teardown of this real estate
professional for a 60-second audit video + follow-up one-pager:
1. Scorecard (1–10): content quality, posting consistency, lead capture, trust
   signals, differentiation — one-line justification each
2. The 3 highest-leverage gaps, each framed as money left on the table (estimate
   in inspections/deals, stated as an assumption)
3. One "quick win they can do this week for free" (build goodwill)
4. The Propel fix: map each gap to a package (docs/03), one sentence each
Tone: direct, respectful, zero fluff. For surveyors/valuers, lead with unleveraged
credential trust (NIESV/ESVARBON). End with the exact 3 talking points for the video.
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

## P4 — Weekly Scorecard Commentary

**Inputs:** this week's + last week's metrics (leads, DMs, CPL, inspections), campaign changes made.

```
Write the client scorecard commentary in plain English, 120 words max, structure:
WHAT HAPPENED (numbers vs. last week) → WHY (attribute honestly, including losses) →
WHAT WE'RE DOING NEXT WEEK (1–2 specific actions). No jargon, no vanity metrics,
never hide a bad week — reframe it as diagnosis + action.
```

## P5 — Proposal Generator

**Inputs:** audit output (P2), call notes, recommended package + price, prospect's stated goal.

```
Fill ops/templates/proposal.md using the audit findings and call notes. Mirror the
prospect's own words for their goal. Tie each deliverable line to one of their 3 gaps.
One page. No feature lists without a "so that..." outcome clause.
```

## P6 — Objection Response Drafts

**Inputs:** objection text (usually a WhatsApp message), prospect segment, deal context.

```
Draft 2 reply options for this objection: (a) short WhatsApp-native reply (≤80 words,
warm, one question back), (b) fuller version with one proof point from our case
studies. Use the objection playbook in docs/04 §6 as the strategic base. Never
discount first — reframe value, then offer a smaller package if price is genuinely
the blocker.
```

---

*Add prompts here as workflows stabilize (rule: done twice → template). Each new prompt needs: inputs list, the prompt, and QA notes.*
