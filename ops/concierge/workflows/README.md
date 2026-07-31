# n8n Workflows — import instructions

*I author these as JSON; ADEDAMOLA imports them. n8n accepts pasted workflow JSON directly.*

## How to import

1. Open `https://engine.getpropel.tech` and log in
2. **Workflows → ⋯ (top right) → Import from File** — or **Import from URL**
3. Paste or upload the JSON
4. **Activate** the workflow with the toggle (top right). *An inactive workflow does not answer webhooks — this is the most common reason a Meta verification fails.*

## The workflows

| File | Purpose | Status |
|---|---|---|
| `00-webhook-verification.json` | Answers Meta's webhook handshake on both `/webhook/whatsapp` and `/webhook/instagram` | Ready — **import before clicking Verify in the Meta console** |

## Before importing `00-webhook-verification.json`

The workflow reads the verify token from an environment variable, so the token never lives inside a workflow file that gets version-controlled.

n8n only exposes environment variables to Code nodes when explicitly allowed. On the server:

```
cd /opt/propel
```

Add this line to the `n8n` service's `environment:` block in `docker-compose.yml`:

```
      N8N_BLOCK_ENV_ACCESS_IN_NODE: "false"
      META_VERIFY_TOKEN: ${META_VERIFY_TOKEN}
```

Then:

```
docker compose up -d n8n
```

*(`META_VERIFY_TOKEN` was already generated into `/opt/propel/.env` by the bootstrap — you don't need to invent one. Read it with `grep META_VERIFY_TOKEN /opt/propel/.env` when the Meta console asks for it.)*

## Verifying it works

After importing **and activating**, from anywhere:

```
curl "https://engine.getpropel.tech/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=hello123"
```

It should print exactly `hello123`. A wrong token returns `Forbidden` — which is the point: this endpoint is public, so the token is the only thing stopping anyone from subscribing junk to it.

If it returns n8n's 404 page, the workflow isn't active.
