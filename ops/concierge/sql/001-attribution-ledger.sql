-- Propel — attribution ledger
-- Append-only, hash-chained record of every lead the Concierge produces.
-- Rationale and data-protection position: ops/concierge/attribution-ledger.md
--
-- Apply:  docker compose exec -T postgres psql -U propel -d n8n -f - < 001-attribution-ledger.sql

-- No extensions required, deliberately.
--
-- This used to begin with CREATE EXTENSION pgcrypto. That is a privileged
-- operation, and inside a transaction a privilege failure aborts everything
-- after it -- so the whole script would roll back and psql would still exit 0.
-- Silent, total, and it looks exactly like nothing ran.
--
-- gen_random_uuid() is built in from PostgreSQL 13 and sha256(bytea) from 11,
-- so the extension was never actually needed. Hashes are byte-identical to the
-- old digest() form, so existing rows still verify.

DO $guard$
BEGIN
    IF current_setting('server_version_num')::int < 130000 THEN
        RAISE EXCEPTION 'PostgreSQL 13 or newer required (found %). gen_random_uuid() is built in from 13.',
            current_setting('server_version');
    END IF;
END
$guard$;

BEGIN;

CREATE TABLE IF NOT EXISTS lead (
    lead_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id              TEXT        NOT NULL,
    channel                TEXT        NOT NULL
        CHECK (channel IN ('whatsapp','instagram_dm','instagram_comment')),
    source_ref             TEXT,
    -- Idempotency: Meta redelivers webhooks. Same message must not create two leads.
    provider_message_id    TEXT        UNIQUE,
    -- PLAINTEXT. Protected by disk encryption, file permissions and DB access
    -- control -- NOT by column encryption. Labelled honestly on purpose: a column
    -- commented "encrypted at rest" that isn't is worse than plaintext, because
    -- it creates assurance nobody checks.
    contact_e164           TEXT,
    contact_hash           TEXT        NOT NULL,
    -- Mutable operational state. The immutable evidence lives in lead_event.
    qualified_unit_type    TEXT,
    qualified_budget_ngn   NUMERIC(15,2),
    assigned_sales_rep     TEXT,
    conversion_status      TEXT        NOT NULL DEFAULT 'qualified'
        CHECK (conversion_status IN ('new','qualified','handed_off','closed_won','closed_lost','expired')),
    first_contact_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Set by trigger, not GENERATED ALWAYS. PostgreSQL requires a generation
    -- expression to be IMMUTABLE, and `timestamptz + interval '12 months'` is
    -- only STABLE: adding months to a timestamptz depends on the session
    -- TimeZone, so the same inputs can give different answers. A trigger has
    -- no such requirement and the window stays guaranteed rather than merely
    -- defaulted.
    attribution_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '12 months'),
    UNIQUE (client_id, contact_hash)
);

CREATE OR REPLACE FUNCTION lead_set_expiry() RETURNS TRIGGER AS $$
BEGIN
    NEW.attribution_expires_at := NEW.first_contact_at + INTERVAL '12 months';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_expiry_trg ON lead;
CREATE TRIGGER lead_expiry_trg
    BEFORE INSERT OR UPDATE OF first_contact_at ON lead
    FOR EACH ROW EXECUTE FUNCTION lead_set_expiry();

CREATE INDEX IF NOT EXISTS lead_client_idx  ON lead (client_id, first_contact_at DESC);
CREATE INDEX IF NOT EXISTS lead_expiry_idx  ON lead (attribution_expires_at);

CREATE TABLE IF NOT EXISTS lead_event (
    event_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lead_id     UUID        NOT NULL REFERENCES lead(lead_id),
    event_type  TEXT        NOT NULL
        CHECK (event_type IN ('first_contact','qualified','unit_interest',
                              'handoff','client_response','escalation','outcome_reported')),
    payload     JSONB       NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    prev_hash   TEXT        NOT NULL DEFAULT '',
    row_hash    TEXT        NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS lead_event_lead_idx ON lead_event (lead_id, event_id);

-- The chain. Computed server-side so the application cannot forge a hash.
CREATE OR REPLACE FUNCTION lead_event_chain() RETURNS TRIGGER AS $$
DECLARE
    last_hash TEXT;
BEGIN
    SELECT row_hash INTO last_hash
      FROM lead_event
     ORDER BY event_id DESC
     LIMIT 1;

    NEW.prev_hash := COALESCE(last_hash, 'GENESIS');
    NEW.row_hash  := encode(sha256(convert_to(
        NEW.prev_hash
        || COALESCE(NEW.lead_id::text,'')
        || NEW.event_type
        || COALESCE(NEW.payload::text,'{}')
        || to_char(NEW.occurred_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.USOF'),
        'UTF8')), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_event_chain_trg ON lead_event;
CREATE TRIGGER lead_event_chain_trg
    BEFORE INSERT ON lead_event
    FOR EACH ROW EXECUTE FUNCTION lead_event_chain();

-- Append-only: block edits and deletes outright, including from the app role.
CREATE OR REPLACE FUNCTION lead_event_immutable() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'lead_event is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_event_immutable_trg ON lead_event;
CREATE TRIGGER lead_event_immutable_trg
    BEFORE UPDATE OR DELETE ON lead_event
    FOR EACH ROW EXECUTE FUNCTION lead_event_immutable();

-- What the monthly reconciliation sends the client: no raw phone numbers.
CREATE OR REPLACE VIEW lead_attribution_export AS
SELECT l.lead_id,
       l.client_id,
       l.channel,
       l.source_ref,
       l.contact_hash,
       l.first_contact_at,
       l.attribution_expires_at,
       (SELECT e.occurred_at FROM lead_event e
         WHERE e.lead_id = l.lead_id AND e.event_type = 'handoff'
         ORDER BY e.event_id LIMIT 1) AS handed_off_at,
       (SELECT e.payload->>'unit' FROM lead_event e
         WHERE e.lead_id = l.lead_id AND e.event_type = 'unit_interest'
         ORDER BY e.event_id DESC LIMIT 1) AS unit_interest
  FROM lead l
 WHERE l.attribution_expires_at > now();

COMMIT;

-- Proof it worked. If this prints two rows, the ledger exists.
\echo ''
SELECT table_name AS created FROM information_schema.tables
 WHERE table_schema='public' AND table_name IN ('lead','lead_event')
 ORDER BY table_name;
