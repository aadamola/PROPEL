#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# PROPEL — VPS bootstrap. Run ONCE on a fresh Ubuntu 24.04 VPS.
#
#   sudo bash vps-bootstrap.sh
#
# Installs and hardens: firewall, fail2ban, auto-updates, Docker,
# and the Propel stack (Caddy + n8n + Postgres + Redis + Qdrant +
# Flowise + Uptime Kuma) behind automatic HTTPS.
#
# Idempotent: safe to re-run. Secrets are generated once and kept
# in /opt/propel/.env — they are NEVER regenerated on re-run.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"
APPDIR=/opt/propel

log() { printf '\n\033[1;32m▲ %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m✖ %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run with sudo: sudo bash vps-bootstrap.sh"

if [ -z "$DOMAIN" ]; then
  read -rp "Root domain (e.g. getpropel.ng): " DOMAIN
fi
if [ -z "$EMAIL" ]; then
  read -rp "Email for TLS certificate notices: " EMAIL
fi
[ -n "$DOMAIN" ] || die "Domain is required — Meta webhooks need real HTTPS."
[ -n "$EMAIL" ]  || die "Email is required for Let's Encrypt."

# ── 1. Base system ───────────────────────────────────────────
log "Updating system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl ca-certificates gnupg ufw fail2ban \
  unattended-upgrades apt-listchanges jq git htop

log "Enabling unattended security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || true

# ── 2. Firewall ──────────────────────────────────────────────
log "Configuring firewall (SSH, HTTP, HTTPS only)"
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp  >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
systemctl enable --now fail2ban >/dev/null 2>&1 || true

# ── 3. SSH hardening ─────────────────────────────────────────
# Password login is only disabled when an SSH key already exists,
# so this can never lock you out of a password-only server.
if [ -s /root/.ssh/authorized_keys ]; then
  log "SSH key found — disabling password login"
  sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
  sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
  systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || true
else
  log "No SSH key present — leaving password login ON (add a key, then re-run)"
fi

# ── 4. Docker ────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
  log "Docker already installed"
fi
systemctl enable --now docker >/dev/null 2>&1 || true

# ── 5. Secrets (generated once, never rotated by re-runs) ────
mkdir -p "$APPDIR"/{caddy,backups}
cd "$APPDIR"

if [ ! -f .env ]; then
  log "Generating secrets → $APPDIR/.env"
  gen() { openssl rand -hex 24; }
  cat > .env <<EOF
DOMAIN=$DOMAIN
EMAIL=$EMAIL

POSTGRES_USER=propel
POSTGRES_PASSWORD=$(gen)
POSTGRES_DB=n8n

N8N_USER=propel
N8N_PASSWORD=$(gen)
N8N_ENCRYPTION_KEY=$(gen)

FLOWISE_USER=propel
FLOWISE_PASSWORD=$(gen)

QDRANT_API_KEY=$(gen)

# LLM keys — fill these in, then: docker compose up -d
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=

# Meta / WhatsApp — fill in after App Review
META_APP_SECRET=
META_VERIFY_TOKEN=$(gen)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
EOF
  chmod 600 .env
else
  log "Existing .env found — keeping current secrets"
fi

# shellcheck disable=SC1091
set -a; . ./.env; set +a

# ── 6. Caddy (automatic HTTPS) ───────────────────────────────
log "Writing Caddy configuration"
cat > caddy/Caddyfile <<EOF
{
    email $EMAIL
}

n8n.$DOMAIN {
    reverse_proxy n8n:5678
}

flow.$DOMAIN {
    reverse_proxy flowise:3000
}

status.$DOMAIN {
    reverse_proxy uptime-kuma:3001
}
EOF

# ── 7. The stack ─────────────────────────────────────────────
log "Writing docker-compose.yml"
cat > docker-compose.yml <<'YAML'
name: propel

x-restart: &restart
  restart: unless-stopped

services:
  caddy:
    image: caddy:2-alpine
    <<: *restart
    ports: ["80:80", "443:443"]
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on: [n8n, flowise, uptime-kuma]

  postgres:
    image: postgres:16-alpine
    <<: *restart
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    <<: *restart
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:latest
    <<: *restart
    environment:
      QDRANT__SERVICE__API_KEY: ${QDRANT_API_KEY}
    volumes:
      - qdrant_data:/qdrant/storage

  n8n:
    image: n8nio/n8n:latest
    <<: *restart
    environment:
      N8N_HOST: n8n.${DOMAIN}
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://n8n.${DOMAIN}/
      N8N_EDITOR_BASE_URL: https://n8n.${DOMAIN}/
      N8N_PROXY_HOPS: 1
      GENERIC_TIMEZONE: Africa/Lagos
      TZ: Africa/Lagos
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: ${N8N_USER}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_PASSWORD}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB}
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres: {condition: service_healthy}

  flowise:
    image: flowiseai/flowise:latest
    <<: *restart
    environment:
      FLOWISE_USERNAME: ${FLOWISE_USER}
      FLOWISE_PASSWORD: ${FLOWISE_PASSWORD}
      DATABASE_PATH: /root/.flowise
      APIKEY_PATH: /root/.flowise
      LOG_PATH: /root/.flowise/logs
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    volumes:
      - flowise_data:/root/.flowise

  uptime-kuma:
    image: louislam/uptime-kuma:1
    <<: *restart
    volumes:
      - kuma_data:/app/data

volumes:
  caddy_data: {}
  caddy_config: {}
  pg_data: {}
  redis_data: {}
  qdrant_data: {}
  n8n_data: {}
  flowise_data: {}
  kuma_data: {}
YAML

# ── 8. Nightly backup ────────────────────────────────────────
log "Installing nightly backup job (02:00 Lagos, 14-day retention)"
cat > /usr/local/bin/propel-backup <<'BAK'
#!/usr/bin/env bash
set -euo pipefail
cd /opt/propel
set -a; . ./.env; set +a
STAMP=$(date +%F-%H%M)
mkdir -p backups
docker compose exec -T postgres pg_dumpall -U "$POSTGRES_USER" | gzip > "backups/pg-$STAMP.sql.gz"
tar czf "backups/config-$STAMP.tar.gz" .env docker-compose.yml caddy/
find backups -type f -mtime +14 -delete
echo "backup complete: $STAMP"
BAK
chmod +x /usr/local/bin/propel-backup
cat > /etc/cron.d/propel-backup <<'CRON'
0 2 * * * root /usr/local/bin/propel-backup >> /var/log/propel-backup.log 2>&1
CRON

# ── 9. Launch ────────────────────────────────────────────────
log "Pulling images and starting the stack (first run takes a few minutes)"
docker compose pull -q
docker compose up -d

log "Waiting for containers to settle"
sleep 20
docker compose ps

cat <<DONE

═══════════════════════════════════════════════════════════════
 PROPEL STACK IS UP
═══════════════════════════════════════════════════════════════

 Point these DNS A records at this server's IP, then wait ~5 min
 for certificates to issue automatically:

   n8n.$DOMAIN
   flow.$DOMAIN
   status.$DOMAIN

 Your logins are in /opt/propel/.env  —  view with:

   sudo cat /opt/propel/.env

 SEND ME THE n8n USERNAME AND PASSWORD ONLY.
 Never paste the whole file into chat: it also holds the
 database password, encryption key and API keys.

 Useful commands:
   cd /opt/propel && docker compose ps        # what is running
   cd /opt/propel && docker compose logs -f   # live logs
   sudo propel-backup                         # backup right now

═══════════════════════════════════════════════════════════════
DONE
