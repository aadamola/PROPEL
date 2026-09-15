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
#   bash ops/setup/vps-tools.sh ledger        # verify the hash chain
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

case "${1:-preflight}" in
  preflight) run_node tools/preflight-workflows.js ;;
  test)      run_node tools/test-all.js ;;
  keywords)  run_node tools/build-keywords.js && run_node tools/build-workflows.js ;;
  ledger)
    cd "$STACK"
    docker compose exec -T postgres psql -U propel -d n8n -f - < "$REPO/ops/concierge/sql/002-verify-ledger.sql"
    ;;
  schema)
    cd "$STACK"
    docker compose exec -T postgres psql -U propel -d n8n -f - < "$REPO/ops/concierge/sql/001-attribution-ledger.sql"
    docker compose exec -T postgres psql -U propel -d n8n -c '\dt'
    ;;
  *) die "Unknown command '$1'. Use: preflight | test | keywords | ledger | schema" ;;
esac
