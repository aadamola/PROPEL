-- Propel — attribution ledger verification
--
-- Recomputes the hash chain in the database and reports any row that does not
-- match. Written as SQL rather than a script on purpose: it needs no npm
-- install, no driver and no network route to the box. Anyone with psql can
-- run it, including the client's own auditor -- which is the point. A chain
-- only you can verify is not evidence, it is a claim.
--
-- Run:  docker compose exec -T postgres psql -U propel -d n8n -f - < 002-verify-ledger.sql

\pset border 2

WITH chain AS (
    SELECT
        event_id,
        lead_id,
        event_type,
        occurred_at,
        prev_hash,
        row_hash,
        LAG(row_hash) OVER (ORDER BY event_id) AS actual_prev,
        encode(digest(
            prev_hash
            || COALESCE(lead_id::text, '')
            || event_type
            || COALESCE(payload::text, '{}')
            || to_char(occurred_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.USOF'),
            'sha256'), 'hex') AS recomputed
    FROM lead_event
),
checked AS (
    SELECT
        event_id,
        occurred_at,
        event_type,
        (row_hash = recomputed)                                   AS content_ok,
        (prev_hash = COALESCE(actual_prev, 'GENESIS'))            AS link_ok
    FROM chain
)
SELECT
    'events'                                        AS metric,
    count(*)::text                                  AS value
FROM checked
UNION ALL SELECT 'tampered rows (content changed)',  count(*)::text FROM checked WHERE NOT content_ok
UNION ALL SELECT 'broken links (row removed/reordered)', count(*)::text FROM checked WHERE NOT link_ok
UNION ALL SELECT 'first event',                      COALESCE(min(occurred_at)::text, '—') FROM checked
UNION ALL SELECT 'last event',                       COALESCE(max(occurred_at)::text, '—') FROM checked
UNION ALL SELECT 'VERDICT',
    CASE WHEN count(*) FILTER (WHERE NOT content_ok OR NOT link_ok) = 0
         THEN 'INTACT — every event verifies'
         ELSE 'FAILED — see the rows listed below'
    END
FROM checked;

-- Only prints when something is actually wrong.
SELECT event_id, occurred_at, event_type,
       CASE WHEN NOT content_ok THEN 'content altered'
            WHEN NOT link_ok    THEN 'chain broken before this row'
       END AS problem
FROM (
    SELECT event_id, occurred_at, event_type,
        (row_hash = encode(digest(
            prev_hash || COALESCE(lead_id::text,'') || event_type
            || COALESCE(payload::text,'{}')
            || to_char(occurred_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.USOF'),
            'sha256'),'hex')) AS content_ok,
        (prev_hash = COALESCE(LAG(row_hash) OVER (ORDER BY event_id), 'GENESIS')) AS link_ok
    FROM lead_event
) q
WHERE NOT content_ok OR NOT link_ok
ORDER BY event_id;
