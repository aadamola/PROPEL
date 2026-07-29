# VPS Setup — Hostinger

*The decision, the purchase, and the full build. Companion script: `vps-bootstrap.sh` (one paste, does everything).*

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

## 2. The domain is not optional

**Meta will not send webhooks to an IP address or a self-signed certificate.** WhatsApp and Instagram callbacks require a public HTTPS URL with a valid certificate. No domain means no Concierge — so the domain is a hard prerequisite, not a nice-to-have.

Buy `getpropel.ng` in the same sitting. If Hostinger offers `.ng` at checkout, take it — one panel, one bill, DNS already in place. If not, any Nigerian registrar is fine; you'll just create the DNS records yourself.

**DNS records to create** (all pointing at the VPS IP Hostinger gives you):

| Type | Name | Value |
|---|---|---|
| A | `n8n` | your VPS IP |
| A | `flow` | your VPS IP |
| A | `status` | your VPS IP |
| A | `@` | your VPS IP |
| A | `www` | your VPS IP |

The last two are for the website; the first three are the systems. Certificates issue automatically about five minutes after DNS propagates.

## 3. The build — one paste

Open Hostinger's **Browser terminal** (VPS → Overview), or SSH in, then:

```bash
curl -fsSL -o bootstrap.sh https://raw.githubusercontent.com/aadamola/PROPEL/main/ops/setup/vps-bootstrap.sh
sudo bash bootstrap.sh
```

*(If the repo is private, open `ops/setup/vps-bootstrap.sh`, copy the contents, and paste them into `nano bootstrap.sh` instead.)*

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
| n8n | `n8n.yourdomain` | The orchestration brain — routing, validation, CRM writes, kill switch |
| Flowise | `flow.yourdomain` | Concierge brain candidate #1 in the bake-off |
| Qdrant | internal only | Vector store for KB retrieval |
| Postgres + Redis | internal only | State and queues |
| Uptime Kuma | `status.yourdomain` | **Alerts you if the Concierge dies at 2am.** For a 24/7 product this is not optional. |

Everything except the three web addresses is sealed inside Docker's private network — nothing else is reachable from the internet.

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

**Backups** run nightly at 02:00 Lagos time into `/opt/propel/backups` (Postgres dump + config, 14-day retention). Once we have client conversation data flowing, we add an offsite copy — local-only backups don't survive losing the server.

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| Certificate won't issue | DNS hasn't propagated. Check `dig n8n.yourdomain +short` returns your IP, wait, then `docker compose restart caddy` |
| A container keeps restarting | `docker compose logs <service>` — usually a missing value in `.env` |
| n8n won't accept the login | Credentials are in `/opt/propel/.env` as `N8N_USER` / `N8N_PASSWORD` |
| Out of memory during the bake-off | `docker compose stop flowise` while testing Dify, or upgrade to KVM 4 |
| Locked out of SSH | Hostinger's browser terminal always works — it bypasses SSH entirely |

---

*Pricing sources (July 2026): [Hostinger VPS pricing breakdown](https://smarthostfinder.com/hostinger-vps-pricing/) · [KVM plan benchmarks](https://bestusavps.com/reviews/hostinger-vps/) · [plan comparison](https://www.comparevps.com/hosting/hostinger) · [renewal-rate analysis](https://googiehost.com/blog/hostinger-pricing-plans/). Verify at checkout — promotional pricing moves.*
