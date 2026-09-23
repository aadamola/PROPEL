#!/usr/bin/env bash
# Run Propel's Node tools on the VPS — without installing Node on the VPS.
#
# The host has Docker and nothing else by design: every runtime lives in a
# container so the box stays a boring, patchable Ubuntu with no language
# toolchains to maintain. So the tools run in a throwaway container too.
#
#   bash ops/setup/vps-tools.sh preflight     # check the workflow bundle
#   bash ops/setup/vps-tools.sh test          # full suite
#   bash ops/setup/vps-tools.sh keywords      # rebuild the rule table
#   bash ops/setup/vps-tools.sh schema        # create the ledger tables
#   bash ops/setup/vps-tools.sh ledger        # verify the hash chain
#   bash ops/setup/vps-tools.sh doctor        # what is actually on this box
#   bash ops/setup/vps-tools.sh web           # why is engine.getpropel.tech not answering
#   bash ops/setup/vps-tools.sh smtp          # prove a mailbox sends before n8n sees it (asks for what it needs)
#   bash ops/setup/vps-tools.sh handshake     # step 9: prove the webhook works AND refuses strangers
#
set -euo pipefail

REPO="${PROPEL_REPO:-/opt/propel-repo}"
STACK="${PROPEL_STACK:-/opt/propel}"
NODE_IMAGE="node:20-alpine"

die(){ echo "✖ $*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "Docker is not installed. Everything here runs in containers."

# Only the commands that read repo files need the repo. 'smtp' talks to a mail
# server and 'doctor'/'web' inspect the running stack -- refusing those for a
# missing clone sends you fixing the wrong thing.
need_repo(){
  [ -d "$REPO" ] || die "No repo at $REPO. Clone it first:
  cd /opt && git clone -b claude/propel-realestate-marketing-plan-wxjj3x https://github.com/aadamola/PROPEL.git propel-repo"
}
case "${1:-preflight}" in
  preflight|test|keywords|schema|ledger) need_repo ;;
esac

run_node(){ docker run --rm -v "$REPO":/app -w /app "$NODE_IMAGE" node "$@"; }

# ON_ERROR_STOP is not optional. Without it psql prints the error, carries on
# through an aborted transaction, rolls the whole thing back at COMMIT -- and
# still exits 0. You get a clean-looking run and an empty database.
psql_file(){
  cd "$STACK"
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U propel -d n8n -f - < "$1"
}

case "${1:-preflight}" in
  preflight) run_node tools/preflight-workflows.js ;;
  test)      run_node tools/test-all.js ;;
  keywords)  run_node tools/build-keywords.js && run_node tools/build-workflows.js ;;
  ledger)
    psql_file "$REPO/ops/concierge/sql/002-verify-ledger.sql"
    ;;
  schema)
    if psql_file "$REPO/ops/concierge/sql/001-attribution-ledger.sql"; then
      echo; echo "✅ schema applied — 'lead' and 'lead_event' listed above mean it worked"
    else
      echo; echo "✖ schema FAILED — the error is printed above, nothing was created." >&2
      echo "  Send me that error. Run 'vps-tools.sh doctor' for the environment." >&2
      exit 1
    fi
    ;;
  doctor)
    cd "$STACK"
    echo "── containers ─────────────────────────────"; docker compose ps
    echo; echo "── postgres ───────────────────────────────"
    docker compose exec -T postgres psql -U propel -d n8n -tAc \
      "select 'version: '||version(); select 'superuser: '||usesuper from pg_user where usename=current_user;"
    echo; echo "── ledger tables ──────────────────────────"
    docker compose exec -T postgres psql -U propel -d n8n -tAc \
      "select coalesce(string_agg(table_name,', '),'NONE — run: vps-tools.sh schema')
         from information_schema.tables
        where table_schema='public' and table_name in ('lead','lead_event');"
    echo; echo "── what n8n can see (set/missing — values are NEVER printed) ──"
    # The workflows read these at runtime. If the container was started from
    # an older compose file, they are simply absent, and the first symptom is
    # an "access to env vars denied" or a handshake that 403s every time.
    for V in N8N_BLOCK_ENV_ACCESS_IN_NODE META_VERIFY_TOKEN_SHALOM_PARK SHALOM_PARK_APP_SECRET; do
      val=$(docker compose exec -T n8n printenv "$V" 2>/dev/null || true)
      if [ "$V" = "N8N_BLOCK_ENV_ACCESS_IN_NODE" ]; then
        [ "$val" = "false" ] && echo "  ✓ $V=false" || echo "  ✗ $V is '${val:-unset}' — must be false, or Code nodes cannot read the secrets below"
      elif [ -n "$val" ]; then echo "  ✓ $V set"
      else
        if grep -q "^$V=" "$STACK/.env" 2>/dev/null; then
          echo "  ✗ $V is in .env but n8n cannot see it — add it to the n8n environment in docker-compose.yml, then: docker compose up -d n8n"
        else
          echo "  – $V not set yet"
        fi
      fi
    done

    echo; echo "── repo ───────────────────────────────────"
    echo "repo:  $REPO  ($( [ -d "$REPO/.git" ] && git -C "$REPO" rev-parse --short HEAD || echo 'NOT CLONED' ))"
    echo "stack: $STACK"
    ;;
  web)
    cd "$STACK"
    HOST="${2:-engine.getpropel.tech}"
    code(){ curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$1" 2>/dev/null || echo "---"; }

    echo "── containers ─────────────────────────────"
    docker compose ps --format 'table {{.Service}}\t{{.Status}}' 2>/dev/null || docker compose ps

    echo; echo "── n8n, from inside the box (skips DNS and Caddy) ──"
    echo "  localhost:5678/healthz  → $(code http://localhost:5678/healthz)   (200 = n8n is fine)"

    echo; echo "── Caddy, from inside the box ─────────────"
    echo "  localhost:80            → $(code http://localhost:80)"

    echo; echo "── DNS ────────────────────────────────────"
    resolved=$(getent hosts "$HOST" | awk '{print $1}' | tr '\n' ' ')
    mine=$(curl -sS --max-time 10 https://api.ipify.org 2>/dev/null || echo unknown)
    echo "  $HOST → ${resolved:-NOT RESOLVING}"
    echo "  this box is        → $mine"
    if [ -n "$resolved" ] && [ "$mine" != "unknown" ] && ! echo "$resolved" | grep -q "$mine"; then
      echo "  ⚠️  DNS does NOT point at this box — that is the problem"
    fi

    echo; echo "── public HTTPS ───────────────────────────"
    echo "  https://$HOST/                      → $(code "https://$HOST/")   (401 is EXPECTED: n8n editor is behind basic auth)"
    echo "  https://$HOST/healthz               → $(code "https://$HOST/healthz")   (200 = Caddy→n8n works end to end)"
    echo "  https://$HOST/webhook/shalom-park-ig → $(code "https://$HOST/webhook/shalom-park-ig")   (404 until workflow 05 is imported AND active)"

    echo; echo "── caddy log, last 15 (TLS problems show here) ──"
    docker compose logs --tail=15 caddy 2>/dev/null | sed 's/^/  /'
    ;;
  smtp)
    # Prove the mailbox works before n8n ever touches it. If this sends, any
    # later failure is n8n's configuration; if it does not, it is the mailbox.
    #
    # It ASKS for anything not given. An earlier version documented itself
    # with "<host-from-hostinger>" placeholders, and bash reads "<" as "take
    # input from a file" -- so a pasted command failed with "No such file or
    # directory". A command that needs editing before it runs is a trap.
    ask(){ # ask <prompt> <default> -> echoes answer
      local a; printf '%s' "$1" >&2; [ -n "$2" ] && printf ' [%s]' "$2" >&2; printf ': ' >&2
      read -r a; echo "${a:-$2}"
    }
    U="${2:-}"; H="${3:-}"; P="${4:-}"; TO="${5:-}"
    [ -n "$U" ]  || U=$(ask  "Mailbox" "alerts@getpropel.tech")
    [ -n "$H" ]  || H=$(ask  "SMTP host (copy it from the Hostinger email panel)" "")
    [ -n "$P" ]  || P=$(ask  "Port" "465")
    [ -n "$TO" ] || TO=$(ask "Send the test email to" "aadamola@gmail.com")
    [ -n "$H" ] || die "No SMTP host given — it is shown in Hostinger → Emails → your mailbox → configuration."

    printf 'Password for %s (not shown): ' "$U" >&2
    read -rs PASS; echo >&2
    [ -n "$PASS" ] || die "no password entered"

    if [ "$P" = "465" ]; then URL="smtps://$H:$P"; TLS=ON; else URL="smtp://$H:$P"; TLS=OFF; fi

    TMP=$(mktemp)
    {
      echo "From: Propel Alerts <$U>"
      echo "To: <$TO>"
      echo "Subject: Propel SMTP test"
      echo "Date: $(date -R)"
      echo
      echo "If you are reading this, $U can send mail."
      echo "Host $H, port $P. Use exactly these in the n8n SMTP credential."
    } > "$TMP"

    echo; echo "Sending as $U via $URL → $TO"
    if curl -sS --url "$URL" --ssl-reqd --mail-from "$U" --mail-rcpt "$TO" \
         --user "$U:$PASS" --upload-file "$TMP" --max-time 30; then
      rm -f "$TMP"
      echo "✅ accepted by the server — check $TO (and the spam folder)"
      echo
      echo "   Put these into the n8n credential 'Propel SMTP':"
      echo "     User     $U"
      echo "     Host     $H"
      echo "     Port     $P"
      echo "     SSL/TLS  $TLS"
    else
      rm -f "$TMP"
      echo "✖ rejected. Usual causes, most likely first:" >&2
      echo "   • wrong port/encryption pair — 465 needs SSL ON, 587 needs SSL OFF (STARTTLS)" >&2
      echo "   • the mailbox exists but MX/DNS has not propagated yet — wait and retry" >&2
      echo "   • a trailing space pasted in from a password manager" >&2
      exit 1
    fi
    ;;
  handshake)
    # Step 9 without the secret ever reaching the screen. The token is read
    # from .env inside this script and never echoed, so neither shell history
    # nor a screenshot of this terminal carries it.
    SLUG="${2:-shalom-park}"; CH="${3:-ig}"
    KEY="META_VERIFY_TOKEN_$(echo "$SLUG" | tr 'a-z-' 'A-Z_')"
    TOKEN=$(grep -E "^${KEY}=" "$STACK/.env" 2>/dev/null | head -1 | cut -d= -f2-)
    [ -n "$TOKEN" ] || die "$KEY is not in $STACK/.env yet — run step 7 first:
  bash /opt/propel-repo/ops/setup/apply-client-ledger.sh $SLUG"
    URL="${PROPEL_ENGINE:-https://engine.getpropel.tech}/webhook/${SLUG}-${CH}"
    CHAL="propel-$(date +%s)"
    pass=0; fail=0
    ok(){ pass=$((pass+1)); echo "  ✅ $1"; }
    bad(){ fail=$((fail+1)); echo "  ✖ $1"; }

    echo "Testing $URL"
    echo

    # 1. The real token must get the challenge echoed back, as plain text.
    body=$(curl -sS --max-time 15 -o - -w '\n%{http_code}' \
      "$URL?hub.mode=subscribe&hub.verify_token=${TOKEN}&hub.challenge=${CHAL}" 2>/dev/null || echo $'\n000')
    code=$(echo "$body" | tail -1); text=$(echo "$body" | sed '$d')
    if   [ "$code" = "200" ] && [ "$text" = "$CHAL" ]; then ok "right token → challenge echoed back exactly (Meta will accept this)"
    elif [ "$code" = "404" ]; then bad "404 — workflow 05 is not live. Publish it (step 8), then run this again"
    elif [ "$code" = "403" ]; then bad "403 with the RIGHT token — n8n cannot read the token. Run: vps-tools.sh doctor"
    elif [ "$code" = "200" ]; then bad "200 but the body is not the challenge — Meta rejects this. Send me the output"
    else bad "HTTP $code — run: vps-tools.sh web"; fi

    # 2. A wrong token must be refused. This is the test people skip.
    code=$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
      "$URL?hub.mode=subscribe&hub.verify_token=definitely-wrong&hub.challenge=${CHAL}" 2>/dev/null || echo 000)
    if [ "$code" = "403" ]; then ok "wrong token → refused (strangers cannot subscribe to our endpoint)"
    elif [ "$code" = "404" ]; then bad "404 — workflow 05 is not live yet"
    else bad "wrong token got HTTP $code — the endpoint is NOT refusing strangers. Do not go live. Send me this"; fi

    # 3. No token at all must also be refused.
    code=$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
      "$URL?hub.mode=subscribe&hub.challenge=${CHAL}" 2>/dev/null || echo 000)
    if [ "$code" = "403" ]; then ok "no token → refused"
    elif [ "$code" = "404" ]; then bad "404 — workflow 05 is not live yet"
    else bad "no token got HTTP $code — should be 403"; fi

    echo
    if [ "$fail" -eq 0 ]; then
      echo "✅ $pass/3 — the webhook works, and it refuses anyone without the token."
      echo "   The token was read from .env and never printed. Safe to screenshot."
    else
      echo "✖ $fail of 3 failed. Safe to screenshot — the token was never printed."
      exit 1
    fi
    ;;
  *) die "Unknown command '$1'. Use: preflight | test | keywords | schema | ledger | doctor | web | smtp | handshake" ;;
esac
