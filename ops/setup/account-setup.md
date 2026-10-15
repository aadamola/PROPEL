# Propel — Accounts & Assets Setup (45-minute human sprint)

*Everything below is ready to paste. Do these in order; tick as you go. Use ONE email for all business accounts (e.g., hello@getpropel.tech once domain email exists; Gmail until then) and store every password in a password manager from minute one.*

## 0. Handle strategy

✅ **Instagram: @getpropel.tech** (originally @getpropel.ng on 2026-07-26; renamed to match the domain — noticed 2026-09-24). Use the same handle on TikTok and LinkedIn for consistency; domain is **getpropel.tech**.

## 1. Domain & email (do first — 15 min)

- [ ] ✅ **DONE** — domain **getpropel.tech** bought on Hostinger (2026-07-29). Subdomain map in [vps-setup.md](vps-setup.md) §0b
- [ ] Set up Google Workspace or Zoho Mail (Zoho free tier is fine at ₦0): **hello@** and **adedamola@**
- [ ] Once live, switch all account registrations below to the business email

## 2. WhatsApp Business (the real HQ — 10 min)

- [ ] Download WhatsApp Business, register with a DEDICATED business SIM (not your personal number — buy one, ~₦500; this number goes on everything forever)
- [ ] Business name: Propel · Category: Marketing Agency
- [ ] Description: *"AI-forward digital marketing for real estate professionals. We move property. Book a free 30-min marketing audit."*
- [ ] Set up: catalog (add the 3 retainer packages from docs/03), greeting message, away message, quick replies (audit booking, pricing, "how it works")
- [ ] Create the click-to-chat link (wa.me/234XXXXXXXXXX) — this is the CTA on every profile below

## 3. Instagram (primary channel — 10 min)

- [ ] Create account @getpropel → switch to **Business account**, category: Marketing Agency
- [ ] Name field: **Propel | Real Estate Marketing** (searchable — the name field is indexed)
- [ ] Bio (paste):
  > We get realtors, surveyors & developers seen — and sold.
  > 🏠 AI-powered marketing, built by a real estate professional
  > 🎓 Estate Management · NIESV-trained founder
  > 📍 Lagos · ⬇️ Free 30-min marketing audit
- [ ] Link: WhatsApp click-to-chat (swap to site when live)
- [ ] Upload profile image + story highlight covers (from ops/setup/assets/ once exported from Canva)
- [ ] Create empty highlights: *Audits · Results · Services · About*

## 4. TikTok Business (10 min)

- [ ] @getpropel → Business account, category: Marketing & Advertising
- [ ] Bio: *"Marketing that sells Lagos property 🏠 Free audit ⬇️"* + WhatsApp link
- [ ] Same profile image

## Instagram bio + the AUDIT reply (2026-09-24)

**Bio — 146 of 150 characters:**

```
We get realtors, surveyors & developers seen and sold.
AI marketing by a real estate professional · Lagos
Free 30-min marketing audit — DM "AUDIT"
```

**What changed and why:** the old bio offered a free audit but never said how to claim one, and it left out the credential that the positioning rests on. "Built by a real estate professional" is proof no follower count can fake, and it is the line that speaks to surveyors and valuers. "AI marketing" moves into line 2; the name field ("Propel | Real Estate Marketing") is searchable on Instagram and already carries the keyword.

**Bio link — until the site is live, point it at WhatsApp, not `getpropel.tech`:**

```
wa.me/2349019120968?text=Hi%20Propel%2C%20I%20want%20a%20free%20marketing%20audit
```

The site is not live (2026-09-24), so the bio's only link was an error page. This opens WhatsApp on the human line with the audit request pre-typed — the same link the site uses — and for a free-audit offer, a conversation converts better than a homepage anyway. Switch back to `getpropel.tech` the day the site launches.

**Saved reply — shortcut `audit`** (Settings → Business tools → Saved replies). **Load it before the bio goes live**, or the bio promises a reply that nobody sends:

```
Here's how the free audit works: we go through your Instagram, your listings and how your enquiries get answered, and show you exactly where buyers are slipping away — and what we'd change. 30 minutes, no obligation.

To set it up, send me:
1. Your name and business
2. Are you an agent, a surveyor/valuer or a developer?
3. Your Instagram handle
4. Your biggest marketing headache right now

What's the best number to reach you on?
```

The four questions are the booking route in `ops/concierge/propel-kb.json` — the same qualifying facts Propel's own assistant will collect once it is live. Every answer goes into `ops/crm/pipeline.csv` the same day.

**Highlights:** *Audits* is up. *About* and *Services* covers exist in `site/assets/`. **Hold *Results* until there are real ones** — an empty or padded Results highlight is the fake social proof rule 2 forbids.

## 5. LinkedIn (the surveyor/valuer + developer hunting ground)

- [x] Create **Company Page** — *created 2026-09-24; triangle logo in*. Exact values:

| Field | Value | Why |
|---|---|---|
| Name | `Propel` | |
| linkedin.com/company/ | ✅ **`getpropel-tech`** — live 2026-09-24 | `getpropel` was taken by someone else. Mirrors the domain and Instagram (`getpropel.tech`) as closely as LinkedIn allows. `site/index.html` updated to match. |
| Website | **leave blank** | **The site is not live (confirmed 2026-09-24).** A dead link on a new page reads as abandoned. Fill it in the day the site launches |
| Industry | `Marketing Services` | (`Advertising Services` if it does not appear) — the real-estate focus goes in the tagline and About |
| Organization size | `0-1 employees` | **True.** Inflating it is the same lie as buying followers (rule 2) |
| Organization type | `Sole proprietorship` | Matches the legal form (docs/08) until the Ltd triggers fire |
| Logo | `site/assets/mark-512.png` | The triangle alone. LinkedIn shows logos at thumbnail size, where the wordmark version's tagline turns to mush; the name prints beside it anyway |
| Tagline | `AI-forward digital marketing for real estate. Lagos. We move property.` | The decided tagline, 70 of 120 characters |
| Cover (after creation) | `site/assets/banner.png` | Already exactly 1584×396, LinkedIn's cover size |
| Location | `Lagos, Nigeria` | City only — no street address for a remote-first sole prop |

**About / Overview** — *v2, 2026-09-24. Paste as is. 1,030 of 2,000 characters.*

*Rewritten around who we serve, the credential and how we work — **not a list of services**, because the offer is being realigned (see CLAUDE.md) and principles survive that where a service list would not. No link to `getpropel.tech` (not live); contact is the WhatsApp human line. Revisit during the offerings realignment.*

> Propel is a digital marketing agency built for Nigerian real estate — developers, estate surveyors and valuers, realtors and agents.
>
> We measure ourselves by inspections booked and deals closed, not likes.
>
> Propel is built by a real estate professional: B.Sc. Estate Management, NIESV exam passed and on the ESV track, with around five years in the industry. We understand title, allocation and payment plans because that is the field we trained in — not a sector we are learning on your budget.
>
> How we work:
> • AI where it saves a buyer's time — instant, accurate answers from facts the developer has signed off, with a person one message away
> • Official Meta business platforms only, so a client's number is never put at risk by unofficial automation tools
> • Every enquiry logged and attributed, so marketing spend stops being a guess
> • No bought followers, engagement pods or fake reviews — ever
> • No marketing for land with a disputed title, at any fee
>
> Lagos first.
>
> Free 30-minute marketing audit: WhatsApp +234 901 912 0968

**Specialties:** Real Estate Marketing · Property Marketing · Instagram Marketing · WhatsApp Business · Lead Generation · Marketing Automation · AI Assistants · Developer Marketing · Content Strategy · Lagos Real Estate

- [ ] Update Adedamola's personal headline — the personal profile will outperform the page; the page just needs to exist and look sharp
- [ ] Headline suggestion: *"Founder @ Propel | B.Sc. Estate Management · NIESV exam passed, ESV track | Digital marketing for realtors, surveyors & developers"*
  - *Corrected 2026-09-24 from "NIESV-trained", which is vaguer than the standard and can read as membership. CLAUDE.md's wording is "NIESV exam passed / ESV-track" until chartered — accuracy is the brand.*
- [ ] LinkedIn is text-first: founder posts here need no face and no video — this is our strongest personal-brand channel given current constraints

## 6. YouTube (park it properly — 5 min)

- [ ] Channel: Propel — handle @getpropel, upload avatar + banner, one-line description
- [ ] No content pressure yet — it activates in month 2–3 per the engine plan

## 7. Google Business Profile + Facebook (parking level)

- [ ] Facebook Page (needed for Meta Business Suite + WhatsApp API later; cross-post IG content)
- [ ] Meta Business Suite account created, IG + FB + WhatsApp all linked under it — do this NOW, it saves pain when ads start
- [ ] Google Business Profile: "Propel — Digital Marketing for Real Estate", service-area business, Lagos

## 8. Ops accounts

- [ ] Canva Pro (assets), CapCut (mobile + desktop), Metricool or Buffer free tier (scheduling), Linktree free (until site) 
- [ ] Notion or Google Sheet mirror of ops/crm/pipeline.csv for phone access

---

## Social proof — the legitimate sprint (replaces buying followers)

**Why we don't buy followers — the 20-second version:** audit tools (HypeAuditor, Modash — free tiers) expose fake followers instantly; our prospects are *marketers' clients* being pitched accountability, and competitors WILL run that audit on us. Bought followers also crater engagement rate → Instagram/TikTok show our content to fewer real people → we pay to get buried. For an agency selling "leads not likes," it's brand suicide with no upside.

**What actually builds proof in 30 days (all free or near-free — and none of it requires asking friends for follows):**

1. **The credential badge (day 1):** "Built by a real estate professional — Estate Management, NIESV-trained, 5 years in the industry" in bio, pinned post, and About highlight. This is proof no follower count can fake, and it's our founder's genuine authority speaking to his own professional tribe.
2. **Content quality as proof (day 1+):** first 9 grid posts are portfolio-grade (the launch calendar is designed exactly for this). A 200-follower page with stunning teardowns out-converts a 10k-bot page with dead comments. Prospects judge the *work*, not the count.
3. **Borrow audiences (week 1–4):** comment-with-substance on the 20 biggest Nigerian real estate accounts daily (10 min/day, from the engine's engagement block). Written comments, no face required — insider takes ("as an estate management grad, here's what this listing missed…") get profile taps.
4. **Value-first prospect outreach (business, not friend-bugging):** free mini-teardowns DM'd to Tier-A *prospects* — they often share or repost the makeover, tagged. This is sales motion doubling as distribution.
5. **Numbers that don't need followers:** "10 marketing audits delivered in our first month" · "₦X in listings marketed" · testimonial screenshots. Legitimate proof points, pinned.
6. **Hashtag/location SEO + Reels distribution:** faceless Reels with strong hooks get pushed to non-followers by design — TikTok and IG Reels distribute on content quality, not audience size. Our follower count grows as an *output* of reach, not an input.

**Rule going forward:** engagement rate ≥3% matters; follower count is reported to nobody. Our scorecard logic applies to ourselves.
