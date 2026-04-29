// Valthr chat-analytics Worker
// Endpoints:
//   POST /log       — write a chat event to KV (called from the website)
//   GET  /events    — return recent events as JSON (protected by ?token=...)
//   GET  /health    — basic liveness probe
//
// KV layout: keys of the form `event:<iso-timestamp>:<rand8>` so listing
// returns events in chronological order automatically.
//
// Required Worker secrets:
//   DASHBOARD_TOKEN — set via `wrangler secret put DASHBOARD_TOKEN`.
//                     Anyone with this token can read logs at /events.
//
// Required KV binding: `LOGS` (configured in wrangler.toml).

const MAX_QUESTION_LEN = 4000;
const MAX_EVENTS_PER_LIST = 200;
const ALLOWED_MODES = new Set(['gemini', 'fallback', 'chip', 'autocomplete']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === '/health') {
      return json({ ok: true, ts: new Date().toISOString() });
    }

    if (url.pathname === '/log' && request.method === 'POST') {
      return handleLog(request, env);
    }

    if (url.pathname === '/events' && request.method === 'GET') {
      return handleEvents(request, env, url);
    }

    return text('Not found', 404);
  },
};

async function handleLog(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return text('Bad JSON', 400);
  }

  const event = {
    ts: new Date().toISOString(),
    question: clipString(body.question, MAX_QUESTION_LEN),
    mode: ALLOWED_MODES.has(body.mode) ? body.mode : 'unknown',
    matchId: clipString(body.matchId, 100),
    matchChip: clipString(body.matchChip, 200),
    score: typeof body.score === 'number' && isFinite(body.score) ? +body.score.toFixed(3) : null,
    sessionId: clipString(body.sessionId, 50),
    ua: clipString(request.headers.get('User-Agent'), 200),
    country: request.cf?.country || null,
    city: request.cf?.city || null,
    referrer: clipString(request.headers.get('Referer'), 200),
  };

  // Don't log empty questions
  if (!event.question) return text('Empty question', 400);

  const rand = crypto.randomUUID().slice(0, 8);
  const key = `event:${event.ts}:${rand}`;
  await env.LOGS.put(key, JSON.stringify(event), {
    // 90-day retention; tune up or remove to keep forever
    expirationTtl: 60 * 60 * 24 * 90,
  });

  return json({ ok: true, key });
}

async function handleEvents(request, env, url) {
  const token = url.searchParams.get('token');
  if (!token || token !== env.DASHBOARD_TOKEN) {
    return text('Unauthorized', 401);
  }

  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), MAX_EVENTS_PER_LIST);
  const cursor = url.searchParams.get('cursor') || undefined;

  // KV list returns keys in lexicographic order. Our keys are
  // `event:<iso-ts>:<rand>` — newest last. We list in batches and reverse.
  const listResult = await env.LOGS.list({ prefix: 'event:', cursor, limit: 1000 });
  const recent = listResult.keys.slice(-limit).reverse();

  const events = await Promise.all(
    recent.map(async (k) => {
      const v = await env.LOGS.get(k.name);
      try { return v ? JSON.parse(v) : null; } catch { return null; }
    })
  );

  return json({
    count: events.length,
    cursor: listResult.cursor || null,
    listComplete: listResult.list_complete,
    events: events.filter(Boolean),
  });
}

// ── helpers ──────────────────────────────────────────────────────────────────

function clipString(v, maxLen) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function text(msg, status = 200) {
  return new Response(msg, { status, headers: corsHeaders() });
}
