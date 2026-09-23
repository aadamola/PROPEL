#!/usr/bin/env bash
# Propel — provision a client on the engine.
# Generates a per-client webhook verify token and applies the attribution ledger.
#
#   sudo bash apply-client-ledger.sh shalom-park
#
# Safe to re-run: the token is generated once and never rotated by a re-run,
# and the schema is idempotent.
set -euo pipefail

CLIENT_SLUG="${1:-}"
[ -n "$CLIENT_SLUG" ] || { echo "usage: $0 <client-slug>   e.g. shalom-park"; exit 1; }
[ "$(id -u)" -eq 0 ] || { echo "run with sudo"; exit 1; }

cd /opt/propel
set -a; . ./.env; set +a

KEY="META_VERIFY_TOKEN_$(echo "$CLIENT_SLUG" | tr 'a-z-' 'A-Z_')"

# ── 1. Per-client verify token ───────────────────────────────
# NEVER echoed. Terminal scrollback and shell history are not secret stores,
# and screenshots of this window get shared.
if grep -q "^${KEY}=" .env; then
  echo "▲ ${KEY} already exists — keeping it (re-runs must not rotate a live token)"
else
  printf '%s=%s\n' "$KEY" "$(openssl rand -hex 24)" >> .env
  echo "▲ ${KEY} generated and written to /opt/propel/.env"
fi
echo "  Read it only when the Meta console asks:  grep ${KEY} /opt/propel/.env"

# ── 2. Attribution ledger ────────────────────────────────────
# Real container/user/db names for this stack: compose project 'propel',
# service 'postgres', POSTGRES_USER=propel, POSTGRES_DB=n8n.
SQL_FILE="$(dirname "$0")/../concierge/sql/001-attribution-ledger.sql"
[ -f "$SQL_FILE" ] || { echo "✖ schema not found: $SQL_FILE"; exit 1; }

echo "▲ Applying attribution ledger to postgres…"
docker compose exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" < "$SQL_FILE"

echo "▲ Verifying…"
docker compose exec -T postgres \
  psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "\dt lead*" \
  -c "SELECT count(*) AS lead_rows FROM lead;"

SLUG_U=$(echo "$CLIENT_SLUG" | tr 'a-z-' 'A-Z_')
cat <<DONE

═══════════════════════════════════════════════════════════════
 ${CLIENT_SLUG} PROVISIONED
═══════════════════════════════════════════════════════════════
 Webhook URL for the Meta console — use the channel this client runs
 (check clients.json → channels → enabled):

   Instagram:  https://engine.getpropel.tech/webhook/${CLIENT_SLUG}-ig
   WhatsApp:   https://engine.getpropel.tech/webhook/${CLIENT_SLUG}-wa

 Giving Meta the wrong one sends every message to a workflow that is
 not listening, and the failure looks like Meta, not like us.

 Verify token (never echoed here):
   grep ${KEY} /opt/propel/.env

 Once the client's Meta app exists:
   App secret → add  ${SLUG_U}_APP_SECRET=  to /opt/propel/.env
                then:  docker compose up -d n8n
   Instagram token → goes in the n8n credential (Header Auth,
                "Bearer <token>"), NOT in .env
   WhatsApp only → ${SLUG_U}_WABA_TOKEN= and ${SLUG_U}_WABA_PHONE_ID=

 Check n8n can actually see them:
   bash /opt/propel-repo/ops/setup/vps-tools.sh doctor
═══════════════════════════════════════════════════════════════
DONE
