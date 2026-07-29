# VPS Setup — Hostinger

*The decision, the purchase, and the full build. Companion script: `vps-bootstrap.sh` (one paste, does everything).*

---

## 0. ✅ LIVE — bought 2026-07-29

| | |
|---|---|
| Plan | **KVM 2** — 2 vCPU · 8 GB RAM · 100 GB NVMe · 8 TB bandwidth |
| IPv4 | **72.62.213.187** |
| Location | United Kingdom — Manchester |
| OS | Ubuntu 24.04 LTS |
| Hostname | srv1865391.hstgr.cloud |
| Domain | **getpropel.tech** (Hostinger) |
| Hostinger backups | Weekly (ours run nightly on top) |

### ⚠️ Two things to fix in the panel

1. **The term is monthly** — expiry 2026-08-29 with auto-renewal on. That's the most expensive way to hold this box, and **renewal is where Hostinger's 2–3× jump bites**. Before 29 August, check the renewal quote: if 12 months prepaid still beats it, switch. If the monthly rate is holding steady, staying flexible is a defensible bootstrap choice — just make it a decision rather than a default.
2. **Hostinger's panel firewall shows 0 rules.** That's fine — our `ufw` does the blocking at the OS level — but it means the panel is not a second line of defence. Don't add panel rules that contradict ufw or you'll lock yourself out of ports we need.

## 0b. The subdomain map (adopted)

| Subdomain | Runs on | Purpose |
|---|---|---|
| `getpropel.tech` | **Vercel** (free) | Main agency site |
| `engine.getpropel.tech` | **this VPS** | n8n — Meta webhooks land here |
| `flow.getpropel.tech` | this VPS | Flowise (brain bake-off) |
| `status.getpropel.tech` | this VPS | Uptime Kuma |
| `docs.getpropel.tech` | Vercel | Client knowledge bases |
| `app.getpropel.tech` | *reserved* | Year-2 SaaS dashboard |

**Why this split is right:** the static site on Vercel costs nothing, gets a global CDN, and — the part that actually matters — **keeps marketing traffic off the box that answers buyers.** A post that goes viral should never be able to slow a WhatsApp reply. `engine.` as the webhook host is also cleaner than a generic `n8n.` when we're putting the URL in front of Meta and, eventually, clients.

*One honest note on the `.tech` rationale: the "diaspora buyers read .tech as modern infrastructure" argument doesn't hold — for high-value purchases `.com` remains the trust default, and buyers don't decode TLDs. It doesn't matter here, because buyers reach us through WhatsApp and Instagram and never see the domain, and for a B2B agency the site itself carries the credibility. Good decision, wrong reason — just don't put that line in a sales deck.*

---

## 1. The plan: KVM 2

| | KVM 1 | **KVM 2 ← buy this** | KVM 4 |
|---|---|---|---|
| vCPU | 1 | **2** | 4 |
| RAM | 4 GB | **8 GB** | 16 GB |
| NVMe | 50 GB | **100 GB** | 200 GB |
| Intro price | $4.99/mo | **$6.99/mo** (~₦10.5k) | $12.99/mo |

**Why KVM 2 and not the cheaper one.** Our stack is not one app — it's n8n, Postgres, Redis, a vector store, a Concierge brain, a reverse proxy and monitoring, all at once. Idle, that sits around 1.5–2 GB. The problem with KVM 1 is the **bake-off**: docs/12 commits us to testing Dify against Flowise against n8n-native on the same KB, and Dify alone is a multi-container stack that wants 3–4 GB. On 4 GB we'd be unable to run the comparison we already decided to run, and we'd be back buying KVM 2 in three weeks having wasted the setup.

**Why not KVM 4.** 16 GB buys headroom we have no plan for. At 8 GB we can host Propel's own Concierge plus roughly 5–10 client instances before RAM is the binding constraint — well past the point where revenue pays for an upgrade. Hostinger allows plan upgrades in place, so this isn't a one-way door.

### Settings at checkout

| Setting | Choose | Why |
|---|---|---|
| **Location** | **London (UK)** — Netherlands is an equal second | Closest low-latency region to Lagos on their network, and a strong data-protection jurisdiction, which matters for the NDPA line in docs/13. Client conversation data sitting in the UK is defensible; some regions are not. |
| **OS / template** | **Ubuntu 24.04 LTS**, plain — no app template | Our bootstrap installs the whole stack. A one-click n8n template gives us n8n only, then fights our compose file. |
| **SSH key** | Add one if you have one; otherwise password is fine | The script hardens SSH automatically **only if a key exists** — it will never lock you out of a password-only box. |
| **Backups add-on** | Optional | The script already installs nightly database + config backups with 14-day retention. Hostinger's snapshots are belt-and-braces, not essential. |

### 💰 The money — read this before clicking

The **$6.99/mo headline requires a long prepaid term, and renewal runs 2–3× the intro rate.** Budget honestly:

| Term | Roughly | Verdict |
|---|---|---|
| Monthly / short | ~₦20–27k/mo | Most expensive per month; preserves cash |
| **12 months** | **~₦150k upfront** | **Recommended** — best balance now that client revenue has landed |
| 24 months | ~₦250k upfront | Only if cash is comfortable; two years is a long bet on one vendor |

**Any of these except monthly is above the ₦50k gate — your call, not mine (rule 1).** My recommendation is 12 months: the Concierge is core infrastructure for a product we've already sold, so a year's commitment is proportionate, and it keeps ₦100k of runway that the 24-month option would swallow. **Set a reminder for month 11** — the renewal jump is the trap in this pricing model.

## 2. DNS — create these now

**Meta will not send webhooks to an IP address or a self-signed certificate**, which is why the domain was a hard prerequisite rather than a nice-to-have.

In Hostinger → Domains → `getpropel.tech` → DNS records:

| Type | Name | Value | For |
|---|---|---|---|
| A | `engine` | `72.62.213.187` | **Meta webhooks** |
| A | `flow` | `72.62.213.187` | Flowise |
| A | `status` | `72.62.213.187` | Uptime Kuma |

Leave `@` and `www` alone for now — those point at Vercel when the site deploys, and Vercel hands you the exact records at that point. Pointing them here first only means changing them twice.

Certificates issue automatically about five minutes after the records propagate. Check with `dig engine.getpropel.tech +short`.

## 3. The build — one paste

Open Hostinger's **Browser terminal** (VPS → Overview), or SSH in, then:

```bash
curl -fsSL -o bootstrap.sh https://raw.githubusercontent.com/aadamola/PROPEL/claude/propel-realestate-marketing-plan-wxjj3x/ops/setup/vps-bootstrap.sh
sudo bash bootstrap.sh
```

Answer `getpropel.tech` when it asks for the domain.

> **Note on that URL:** it points at the working branch, not `main`, because this work is still in the open PR. **Once the PR merges, swap `claude/propel-realestate-marketing-plan-wxjj3x` for `main`** — a URL pointing at a branch that later gets deleted is a broken runbook.
>
> *(Fallback if curl ever fails: open `ops/setup/vps-bootstrap.sh` on GitHub, copy it, and paste into `nano bootstrap.sh` on the server.)*

It asks two questions — your domain and an email for certificate notices — then runs unattended for 5–10 minutes.

**What it does:**

1. Updates the system and turns on automatic security patches
2. Firewall locked to SSH + HTTP + HTTPS only, with fail2ban against brute-force
3. Disables SSH password login **only if you've added a key** (never otherwise)
4. Installs Docker from the official repository
5. Generates every password and encryption key, once, into `/opt/propel/.env` (mode 600)
6. Brings up the stack behind Caddy with automatic HTTPS

**What you get:**

| Service | Address | What it's for |
|---|---|---|
| n8n | `engine.getpropel.tech` | Orchestration + **the Meta webhook endpoint** |
| Flowise | `flow.getpropel.tech` | Concierge brain candidate in the bake-off |
| Qdrant | internal only | Vector store for KB retrieval |
| Postgres + Redis | internal only | State and queues |
| Uptime Kuma | `status.getpropel.tech` | **Alerts you if the Concierge dies at 2am.** For a 24/7 product this is not optional. |

Everything except the three web addresses is sealed inside Docker's private network — nothing else is reachable from the internet.

### Two networks, and why

The stack builds **`core`** and **`dmz`** as separate Docker bridge networks, with nothing routing between them.

- **`core`** — the buyer path: webhooks, brain, KB, database.
- **`dmz`** — autonomous agents and heavy background work (research agents, scrapers, video rendering).

This is the docs/13 Agent DMZ doctrine in actual configuration rather than prose. But the isolation that matters most here isn't network, it's **CPU**: on 2 vCPUs, an unbounded video render will peg both cores and buyers will wait on replies. So n8n holds a reserved 1.5 CPU / 2 GB, and **every DMZ container must declare `cpus:` and `mem_limit:`** — there's a commented template in the compose file. An agent without limits is the single most likely way this box degrades.

**On adding OpenMontage / DeerFlow and similar:** not in the stack yet, deliberately. They go through the same gate as everything else (docs/12: production-ready, maintained, fits the envelope, passes QA, one-person operable). The DMZ is built and waiting; candidates get evaluated on their merits, not adopted on their promise.

## 4. Security handoff — important

When it finishes it prints where your credentials live:

```bash
sudo cat /opt/propel/.env
```

**Send me the n8n username and password only.** Never paste that whole file into any chat — it also contains the database password, the n8n encryption key (which decrypts every stored credential), and the API keys. If you ever do paste it somewhere, tell me and we rotate everything.

## 5. What I do next, and what stays yours

Being straight about the division of labour here: **I can't reach your server from this environment.** I don't get to SSH in and configure things. So:

**Mine:** the n8n workflow JSON (comment → private reply → WhatsApp → qualify → escalate), the Shalom Park KB (already built — `clients/shalom-park/kb.json`), the system prompts and guardrails, the QA suite run, and the Uptime Kuma monitor definitions. All handed to you as files you import — n8n takes a pasted workflow JSON directly.

**Yours:** the purchase, the paste, the DNS records, and pasting API keys into `/opt/propel/.env`.

Once the box is up and I have the n8n login, the build is mostly me writing and you importing.

## 6. Verification and everyday commands

```bash
cd /opt/propel
docker compose ps          # everything should say "running"
docker compose logs -f     # live logs, Ctrl-C to exit
docker compose restart n8n # restart one service
sudo propel-backup         # back up right now
free -h                    # RAM headroom — watch this during the bake-off
```

**Backups** run nightly at 02:00 Lagos time into `/opt/propel/backups` (Postgres dump + config, 14-day retention), alongside Hostinger's weekly snapshots. Once client conversation data is flowing, we add an offsite copy — local-only backups don't survive losing the server.

## 6b. Targets, and one we must not sell

The proposed KPIs are sound and now measurable via Uptime Kuma: **RAM under 1.8 GB idle** (the stack idles near this, and the CPU limits protect it), and sub-second replies.

**99.9% uptime is a fine internal target and must never enter a client contract.** This is a single VPS with no redundancy — if Hostinger's host goes down, we go down, and no amount of Docker healthchecking changes that. Promising 99.9% to Shalom Park would be promising something we cannot control. We say "monitored 24/7 with alerting and a kill switch," which is true, and we keep formal availability guarantees out of the MSA until there's a second box to back them.

## 6c. Multi-tenancy: right, with a tripwire

Hosting client #2 and #3 as additional n8n workflow paths on this same box is correct — workflows are cheap, and infrastructure cost per client approaches zero. Two honest caveats:

- **Margin:** *infrastructure* margin is >90%. **Blended gross margin is nearer 75–85%** once LLM credits (~$10–25/client/mo) and ADEDAMOLA's care hours are counted. Use the blended number in any financial modelling — the >90% figure will flatter us into mispricing.
- **Blast radius:** one instance holding every client's credentials means one bad workflow or leaked key exposes all of them. Fine at 2–3 clients; not fine indefinitely. **Tripwire: at 5 clients, or at the first client who asks about data isolation, we split instances.** Decide it now so it isn't decided by an incident.

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| Certificate won't issue | DNS hasn't propagated. Check `dig engine.getpropel.tech +short` returns 72.62.213.187, wait, then `docker compose restart caddy` |
| A container keeps restarting | `docker compose logs <service>` — usually a missing value in `.env` |
| n8n won't accept the login | Credentials are in `/opt/propel/.env` as `N8N_USER` / `N8N_PASSWORD` |
| Out of memory during the bake-off | `docker compose stop flowise` while testing Dify, or upgrade to KVM 4 |
| Locked out of SSH | Hostinger's browser terminal always works — it bypasses SSH entirely |

---

*Pricing sources (July 2026): [Hostinger VPS pricing breakdown](https://smarthostfinder.com/hostinger-vps-pricing/) · [KVM plan benchmarks](https://bestusavps.com/reviews/hostinger-vps/) · [plan comparison](https://www.comparevps.com/hosting/hostinger) · [renewal-rate analysis](https://googiehost.com/blog/hostinger-pricing-plans/). Verify at checkout — promotional pricing moves.*
