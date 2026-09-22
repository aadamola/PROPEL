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
#
set -euo pipefail

REPO="${PROPEL_REPO:-/opt/propel-repo}"
STACK="${PROPEL_STACK:-/opt/propel}"
NODE_IMAGE="node:20-alpine"

die(){ echo "✖ $*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "Docker is not installed. Everything here runs in containers."
[ -d "$REPO" ] || die "No repo at $REPO. Clone it first:
  cd /opt && git clone -b claude/propel-realestate-marketing-plan-wxjj3x https://github.com/aadamola/PROPEL.git propel-repo"

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
  *) die "Unknown command '$1'. Use: preflight | test | keywords | schema | ledger | doctor | web" ;;
esac
