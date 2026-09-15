#!/usr/bin/env bash
# Attribution ledger — real SQL, real PostgreSQL.
#
# This exists because I shipped a schema twice without ever executing it, and
# both times it failed on the client's server instead of on mine. SQL that has
# not been run is not code, it is a guess.
#
# Spins up a throwaway PostgreSQL, applies 001, exercises the exact queries the
# workflow runs, verifies the hash chain with 002, then forges a row and
# confirms 002 catches it. Skips cleanly (exit 0) if no PostgreSQL is available.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SQL="$ROOT/ops/concierge/sql"
WORK="${TMPDIR:-/tmp}/propel-ledger-test.$$"
PORT=${PGTEST_PORT:-55433}
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
no(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }

PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
if [ -z "$PGBIN" ] || ! command -v initdb >/dev/null 2>&1 && [ ! -x "$PGBIN/initdb" ]; then
  echo "  – skipped: no local PostgreSQL binaries (install postgresql, or run this on a box with Docker)"
  exit 0
fi
export PATH="$PGBIN:$PATH"

# PostgreSQL refuses to run as root, so drop to a non-root account when needed.
RUNAS=""
if [ "$(id -u)" = "0" ]; then
  RUNAS=$(id -u postgres >/dev/null 2>&1 && echo postgres || echo "")
  [ -z "$RUNAS" ] && { echo "  – skipped: running as root with no 'postgres' user to drop to"; exit 0; }
fi
run(){ if [ -n "$RUNAS" ]; then su "$RUNAS" -s /bin/bash -c "export PATH=$PGBIN:\$PATH; $1"; else bash -c "$1"; fi; }

mkdir -p "$WORK"; cp "$SQL"/*.sql "$WORK"/; chmod -R 755 "$WORK"; chmod 644 "$WORK"/*.sql
[ -n "$RUNAS" ] && chown -R "$RUNAS" "$WORK"
cleanup(){ run "pg_ctl -D $WORK/data stop -m immediate" >/dev/null 2>&1; rm -rf "$WORK"; }
trap cleanup EXIT

run "initdb -U propel -A trust -D $WORK/data" >/dev/null 2>&1 || { echo "  – skipped: initdb failed"; exit 0; }
run "pg_ctl -D $WORK/data -o '-k $WORK -p $PORT -c listen_addresses=\"\"' -l $WORK/pg.log start" >/dev/null 2>&1
sleep 2
run "psql -h $WORK -p $PORT -U propel -d postgres -tAc 'SELECT 1'" >/dev/null 2>&1 \
  || { echo "  – skipped: server did not start"; exit 0; }
run "psql -h $WORK -p $PORT -U propel -d postgres -tAc 'CREATE DATABASE n8n'" >/dev/null 2>&1
# SQL goes through a file, never through a shell string: parentheses and
# quotes in a query get mangled by the shell, and a mangled query that errors
# looks exactly like a test that passed.
qf(){ run "psql -qtA -v ON_ERROR_STOP=1 -h $WORK -p $PORT -U propel -d n8n -f $1"; }
q(){
  printf '%s\n' "$1" > "$WORK/q.sql"; chmod 644 "$WORK/q.sql"
  [ -n "$RUNAS" ] && chown "$RUNAS" "$WORK/q.sql"
  qf "$WORK/q.sql"
}

# --- the schema must apply cleanly, start to finish -----------------------
if qf "$WORK/001-attribution-ledger.sql" >"$WORK/apply.log" 2>&1; then
  ok "LSQL-01 schema applies with ON_ERROR_STOP on"
else
  no "LSQL-01 schema FAILED to apply: $(tail -1 "$WORK/apply.log")"
  echo; echo "$FAIL failed"; exit 1
fi

[ "$(q "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('lead','lead_event')")" = "2" ] \
  && ok "LSQL-02 both tables exist" || no "LSQL-02 tables missing"

[ "$(q "SELECT count(*) FROM pg_extension WHERE extname='pgcrypto'")" = "0" ] \
  && ok "LSQL-03 no pgcrypto needed — nothing privileged on the install path" || no "LSQL-03 pgcrypto got created"

# --- the exact upsert the workflow runs -----------------------------------
q "INSERT INTO lead (client_id,channel,source_ref,provider_message_id,contact_e164,contact_hash,assigned_sales_rep)
      VALUES ('shalom-park','instagram_comment','SP-2B','C_100','IGSID_9','abc123','Collins')
      ON CONFLICT (client_id,contact_hash) DO UPDATE SET assigned_sales_rep=EXCLUDED.assigned_sales_rep" >/dev/null
[ "$(q "SELECT attribution_expires_at = first_contact_at + INTERVAL '12 months' FROM lead")" = "t" ] \
  && ok "LSQL-04 ★ attribution window is exactly 12 months, set by trigger" || no "LSQL-04 window wrong"

q "INSERT INTO lead (client_id,channel,contact_hash,assigned_sales_rep)
      VALUES ('shalom-park','instagram_dm','abc123','Mercy')
      ON CONFLICT (client_id,contact_hash) DO UPDATE SET assigned_sales_rep=EXCLUDED.assigned_sales_rep" >/dev/null
[ "$(q 'SELECT count(*) FROM lead')" = "1" ] \
  && ok "LSQL-05 ★ the same buyer commenting then DMing is ONE lead, not two" || no "LSQL-05 lead duplicated"

# --- the chain ------------------------------------------------------------
q "INSERT INTO lead_event (lead_id,event_type,payload) SELECT lead_id,'qualified','{\"rule_id\":\"SP-2B\"}' FROM lead" >/dev/null
q "INSERT INTO lead_event (lead_id,event_type,payload) SELECT lead_id,'escalation','{\"hot\":true}' FROM lead" >/dev/null
[ "$(q "SELECT (SELECT prev_hash FROM lead_event ORDER BY event_id LIMIT 1)='GENESIS'
            AND (SELECT prev_hash FROM lead_event ORDER BY event_id DESC LIMIT 1)=(SELECT row_hash FROM lead_event ORDER BY event_id LIMIT 1)")" = "t" ] \
  && ok "LSQL-06 chain links GENESIS → e1 → e2" || no "LSQL-06 chain broken"

q "UPDATE lead_event SET payload='{}' WHERE event_id=1" >/dev/null 2>&1 \
  && no "LSQL-07 UPDATE was allowed on an append-only table" || ok "LSQL-07 UPDATE refused"
q "DELETE FROM lead_event WHERE event_id=1" >/dev/null 2>&1 \
  && no "LSQL-08 DELETE was allowed on an append-only table" || ok "LSQL-08 DELETE refused"

# --- the verifier, both ways ---------------------------------------------
qf "$WORK/002-verify-ledger.sql" 2>/dev/null | grep -q "INTACT" \
  && ok "LSQL-09 verifier reports INTACT on an untouched chain" || no "LSQL-09 verifier did not report INTACT"

q "ALTER TABLE lead_event DISABLE TRIGGER lead_event_immutable_trg;
      UPDATE lead_event SET payload='{\"price\":\"FORGED\"}' WHERE event_id=1;
      ALTER TABLE lead_event ENABLE TRIGGER lead_event_immutable_trg" >/dev/null
out=$(qf "$WORK/002-verify-ledger.sql" 2>/dev/null)
echo "$out" | grep -q "FAILED" && echo "$out" | grep -q "content altered" \
  && ok "LSQL-10 ★ a forged row is detected and named" || no "LSQL-10 tampering went undetected"

echo; echo "$PASS/$((PASS+FAIL)) ledger SQL tests passed"
[ "$FAIL" -eq 0 ] || exit 1
