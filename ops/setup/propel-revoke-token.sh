#!/usr/bin/env bash
# Propel — emergency credential revocation.
#
#   sudo bash propel-revoke-token.sh shalom-park
#
# HONEST SCOPE: this cuts OUR side instantly — the token is purged from .env
# and the engine restarted, so nothing on this server can call the client's
# WABA. It does NOT invalidate the token inside Meta, because a System User
# token is revoked by its owner (the client), not by the holder.
# Both halves are required. The script does ours and tells you theirs.
set -euo pipefail

CLIENT_SLUG="${1:-}"
[ -n "$CLIENT_SLUG" ] || { echo "usage: $0 <client-slug>"; exit 1; }
[ "$(id -u)" -eq 0 ] || { echo "run with sudo"; exit 1; }

PREFIX="$(echo "$CLIENT_SLUG" | tr 'a-z-' 'A-Z_')"
cd /opt/propel

cp .env ".env.pre-revoke.$(date +%Y%m%d-%H%M%S)"
chmod 600 .env.pre-revoke.*

# Blank the values, keep the keys, so nothing silently falls back to a stale token.
sed -i -E "s/^(${PREFIX}_WABA_TOKEN=).*/\1/; s/^(${PREFIX}_WABA_PHONE_ID=).*/\1/; s/^(META_VERIFY_TOKEN_${PREFIX}=).*/\1/" .env

docker compose up -d --force-recreate n8n >/dev/null
echo "▲ OUR SIDE REVOKED — ${PREFIX} credentials cleared, engine restarted."

cat <<NEXT

  ⚠️  NOT FINISHED. Meta-side revocation is the client's action:

  1. Client → business.facebook.com → Business Settings → Users → System Users
  2. Select the Propel system user → Revoke token (or Remove assets)
  3. Confirm with them in writing that it is done

  Until step 2, the token remains valid to anyone who has a copy.
  If revocation followed a suspected breach, treat every credential in
  /opt/propel/.env as exposed and rotate all of them.

NEXT
