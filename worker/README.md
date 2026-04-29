# Valthr chat-analytics Worker

Cloudflare Worker that captures every chat question from the Valthr website and
stores it in Cloudflare KV. A protected `GET /events` endpoint returns recent
logs as JSON for inspection.

## What gets logged

Per chat submission:

| Field | Source |
|---|---|
| `ts` | Server timestamp (ISO 8601) |
| `question` | The raw text the user typed (or the question from a clicked chip / autocomplete pick) |
| `mode` | `gemini` (live AI), `fallback` (TF-IDF classifier), `chip` (suggestion click), or `autocomplete` (autocomplete pick) |
| `matchId` | The curated Q&A id returned in fallback mode (e.g. `kpis`, `routing`) |
| `matchChip` | The chip text of the matched curated answer |
| `score` | Classifier cosine similarity (0–1), if applicable |
| `sessionId` | Random per-tab id stored in `sessionStorage` (not personally identifying) |
| `ua` | Browser User-Agent |
| `country`, `city` | Cloudflare-detected geolocation |
| `referrer` | HTTP `Referer` header |

KV keys are `event:<iso-ts>:<8-char-random>`, so listing returns events in
chronological order. Default retention: 90 days (configurable in `src/index.js`).

## One-time setup

You'll need [`wrangler`](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
installed and a Cloudflare account.

```bash
# 1. Authenticate
wrangler login

# 2. From inside the worker/ directory, create the KV namespace
cd worker
wrangler kv:namespace create LOGS

# 3. Paste the printed `id` into wrangler.toml under [[kv_namespaces]]
#    (see the placeholder PASTE_KV_NAMESPACE_ID_HERE)

# 4. Set the dashboard token (any random string — used to read /events)
wrangler secret put DASHBOARD_TOKEN
# enter the value when prompted

# 5. Deploy
wrangler deploy
# → Note the deployed URL, e.g. https://valthr-chat-logger.<subdomain>.workers.dev
```

## Wire the website to the Worker

Add the Worker URL to `assets/data/config.js` (which is gitignored):

```js
window.VALTHR_CONFIG = {
  geminiKey: '...',                                            // existing
  logEndpoint: 'https://valthr-chat-logger.<subdomain>.workers.dev/log',
};
```

If `logEndpoint` is missing, the chatbot just doesn't log. No errors, no
network requests.

## Reading the logs

### Quick: via the dashboard endpoint

Open this URL in a browser (replace `<token>` with the secret you set):

```
https://valthr-chat-logger.<subdomain>.workers.dev/events?token=<token>&limit=100
```

Returns JSON:

```json
{
  "count": 17,
  "cursor": null,
  "listComplete": true,
  "events": [
    {
      "ts": "2026-04-29T19:42:00.123Z",
      "question": "what is bapco",
      "mode": "fallback",
      "matchId": "operational-footprint",
      "matchChip": "What is the operational footprint of the project?",
      "score": 0.21,
      "sessionId": "a3f2d8...",
      "country": "BH"
    },
    ...
  ]
}
```

### Slower but full-featured: wrangler CLI

```bash
# List all event keys
wrangler kv:key list --binding=LOGS --prefix=event:

# Read a specific event
wrangler kv:key get "event:2026-04-29T19:42:00.123Z:a3f2d8b1" --binding=LOGS
```

### Best for analysis: pipe to a file

```bash
curl "https://valthr-chat-logger.<subdomain>.workers.dev/events?token=<token>&limit=200" \
  | jq '.events' > chat-logs.json
```

Then load `chat-logs.json` into your tool of choice (Excel, Pandas, Observable).

## Costs

Cloudflare Workers free tier:

- **100,000 requests/day** — far more than you'll see on an internal site
- **10 ms CPU per request** — Worker is well under that
- **KV: 100,000 reads/day, 1,000 writes/day, 1 GB storage** — also plenty

Practical cap: ~1,000 chat events/day before you'd need to upgrade.

## Updating the Worker

```bash
cd worker
# edit src/index.js
wrangler deploy
```

KV data is preserved across deploys.

## Tightening security (optional)

Currently `Access-Control-Allow-Origin: *` so any origin can POST to `/log`.
If that bothers you, restrict to your deployed origin in `corsHeaders()`:

```js
'Access-Control-Allow-Origin': 'https://valthr.github.io',
```

Note: this isn't real auth — anyone who reads the website JS can find the
endpoint. For an internal tool with low-volume traffic this is fine. If you
need real auth, add a per-session signed token issued by another endpoint.
