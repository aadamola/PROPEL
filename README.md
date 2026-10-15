# PROPEL

**The enquiry-to-inspection system for Nigerian property sellers.** We bring buyers in, answer them in seconds from facts the seller has signed, and prove which sales we drove. *We move property.*

Lagos · developers and surveyor-led firms · built by a real estate professional (B.Sc. Estate Management, NIESV exam passed, on the ESV track).

## Start here

| If you want to… | Open |
|---|---|
| Know who we are and how to operate | [CLAUDE.md](CLAUDE.md) (current state + rules) · [TODO.md](TODO.md) (the one next action) |
| Know what we sell | [docs/03](docs/03-services-and-pricing.md): three doors |
| Know how we position and grow | [docs/15](docs/15-positioning-and-growth.md) · [ops/growth/](ops/growth/README.md) |
| Know the plan and the numbers | [docs/07](docs/07-bootstrap-plan.md): the operating plan from 15 Oct 2026 |
| **Onboard a new client** | [ops/onboarding/](ops/onboarding/README.md) (playbook) + `node tools/new-client.js` |
| Fix something that broke | [ops/onboarding/solutions.md](ops/onboarding/solutions.md) |
| See a live client | [clients/shalom-park/](clients/shalom-park) |

## Repository map

| Path | What |
|---|---|
| `docs/03` · `07` · `15` | Offer · operating plan · positioning and growth |
| `docs/08` | Legal structure (sole proprietorship; Ltd on triggers) |
| `docs/10` · `11` | Concierge product spec · binding QA standard |
| `docs/06` · `12` · `13` | AI stack and rulings (official APIs only, brain bake-off, two-zone doctrine) |
| `docs/14` | Rental-sector ruling (parked lane, triggers defined) |
| `ops/onboarding/` | Client playbook (Stage A → F) and solutions |
| `ops/growth/` | Response Test, group owners, AEO answers, slideshows, first comment, founding pilot |
| `ops/templates/` | Response audit · proposal · contract skeleton · warranted facts sheet · monthly report |
| `ops/concierge/` | The product: client registry, libraries, SQL ledger, n8n workflows, Propel's own KB |
| `ops/setup/` | VPS, n8n, LLM, Meta app, account copy, brand assets, server tools |
| `ops/content/` · `ops/crm/` · `ops/prompt-library.md` | Content engine · pipeline · production prompts |
| `clients/<slug>/` | One folder per client: tracker, facts, KB, keywords, runbooks |
| `tools/` | Builders, scaffold, tests (`node tools/test-all.js`) |
| `site/` · `site-legal/` | Website (not live) · legal pages + holding page (what the domain may serve now) |
| `sandbox/apex-gardens/` · `demos/shalom-park/` | QA harness + fictional estate · the demo-on-their-phone pattern |
| [CHANGELOG.md](CHANGELOG.md) | Every decision and deliverable, dated. The only place history lives |
