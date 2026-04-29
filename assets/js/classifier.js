// classifier.js — TF-IDF cosine-similarity classifier for free-text questions.
//
// Loads assets/data/qa-index.json on first use and matches user input against
// the 200 curated Q&A entries. Tokenisation is identical to tools/build-qa-index.js.
//
// Public API:
//   await ValthrClassifier.ready();
//   ValthrClassifier.classify(text, { topN = 3 })
//     -> [{ qaId, score, qa }, ...]   sorted desc, score in [0..1]
//   ValthrClassifier.confidence(score) -> 'high' | 'medium' | 'low'

window.ValthrClassifier = (function () {

  const INDEX_URL = 'assets/data/qa-index.json';

  // Thresholds tuned via tools/test-classifier.js.
  const T_HIGH = 0.32; // strong match — "Closest match: ..."
  const T_MED  = 0.12; // related     — "This might be related: ..."
  const T_LOW  = 0.02; // weak hit    — "Not sure I have a great match — closest is ..."
  // Below T_LOW = no token overlap at all → friendly fallback prompt

  const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but', 'by',
    'can', 'could', 'did', 'do', 'does', 'doing', 'done', 'each', 'for', 'from',
    'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'him', 'his',
    'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'me', 'my',
    'no', 'not', 'now', 'of', 'on', 'one', 'only', 'or', 'other', 'our', 'out',
    'over', 'own', 'said', 'same', 'she', 'should', 'so', 'some', 'such',
    'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'to', 'too', 'under', 'up', 'use', 'used',
    'using', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
    'while', 'who', 'why', 'will', 'with', 'would', 'you', 'your',
    'about', 'across', 'after', 'against', 'all', 'also', 'any', 'around',
    'because', 'before', 'between', 'both', 'cover', 'covers', 'covered',
    'describe', 'detail', 'details', 'differ', 'different', 'during', 'either',
    'else', 'even', 'every', 'explain', 'explained', 'follow', 'happens',
    'happen', 'know', 'long', 'made', 'make', 'makes', 'making', 'many',
    'may', 'mean', 'means', 'meant', 'might', 'more', 'most', 'much', 'must',
    'need', 'needed', 'new', 'next', 'often', 'particular', 'people',
    'specific', 'still', 'tell', 'tells', 'thing', 'things', 'think', 'time',
    'tried', 'try', 'walk', 'want', 'way', 'whether', 'whose', 'work',
    'works', 'yet',
    'report', 'project',
    // bapco/valthr/drone/drones intentionally NOT stopwords — they are
    // legitimate query subjects. Low IDF naturally limits their weight.
  ]);

  function tokenize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 2)
      .map(t => {
        t = t.replace(/^[-']+|[-']+$/g, '');
        if (t.length > 3 && t.endsWith('ies')) t = t.slice(0, -3) + 'y';
        else if (t.length > 3 && t.endsWith('es') && !t.endsWith('ses')) t = t.slice(0, -2);
        else if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) t = t.slice(0, -1);
        return t;
      })
      .filter(t => t.length >= 2 && !STOPWORDS.has(t));
  }

  let indexPromise = null;
  let index = null;

  function load() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(INDEX_URL, { cache: 'force-cache' })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load ' + INDEX_URL + ': ' + r.status);
        return r.json();
      })
      .then(j => {
        index = j;
        return j;
      })
      .catch(err => {
        console.warn('[classifier] index load failed:', err.message);
        index = null;
        indexPromise = null; // allow retry
        throw err;
      });
    return indexPromise;
  }

  function ready() {
    return load().catch(() => null);
  }

  // Sparse-vector dot product. Both vectors are sorted by term index.
  function dot(a, b) {
    let i = 0, j = 0, s = 0;
    while (i < a.length && j < b.length) {
      const ai = a[i][0], bj = b[j][0];
      if (ai === bj) { s += a[i][1] * b[j][1]; i++; j++; }
      else if (ai < bj) i++;
      else j++;
    }
    return s;
  }

  function vectoriseQuery(text) {
    if (!index) return null;
    const tokens = tokenize(text);
    if (!tokens.length) return null;

    const tf = new Map();
    for (const t of tokens) {
      const idx = index.vocab[t];
      if (idx === undefined) continue;
      tf.set(idx, (tf.get(idx) || 0) + 1);
    }
    if (!tf.size) return null;

    const vec = [];
    let normSq = 0;
    for (const [idx, count] of tf) {
      const w = (1 + Math.log(count)) * index.idf[idx];
      vec.push([idx, w]);
      normSq += w * w;
    }
    vec.sort((a, b) => a[0] - b[0]);
    return { vec, norm: Math.sqrt(normSq) };
  }

  function classify(text, { topN = 3 } = {}) {
    if (!index) return [];
    const q = vectoriseQuery(text);
    if (!q) return [];

    const qa = window.VALTHR_QA || [];
    const qaById = new Map(qa.map(e => [e.id, e]));

    const scored = [];
    for (const d of index.docs) {
      if (!d.norm || !q.norm) continue;
      const score = dot(q.vec, d.vec) / (q.norm * d.norm);
      if (score > 0) scored.push({ qaId: d.id, score, qa: qaById.get(d.id) });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN);
  }

  function confidence(score) {
    if (score >= T_HIGH) return 'high';
    if (score >= T_MED) return 'medium';
    if (score >= T_LOW) return 'weak';
    return 'none';
  }

  // Kick off the load eagerly (lazy fetch, doesn't block anything else)
  if (typeof document !== 'undefined') {
    if (document.readyState !== 'loading') load();
    else document.addEventListener('DOMContentLoaded', load);
  }

  return {
    ready,
    classify,
    confidence,
    T_HIGH,
    T_MED,
    T_LOW,
  };
})();
