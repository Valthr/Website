#!/usr/bin/env node
// build-qa-index.js — Builds a TF-IDF search index over assets/data/qa.js.
//
// Outputs assets/data/qa-index.json containing:
//   { hash, vocab, idf, docs: [{ id, norm, vec }, ...] }
//
// Each doc's searchable text is `chip + chip + question + question + answer`
// so the short-form fields are weighted higher than the noisy markdown body.
//
// Run before commit (or via a pre-commit hook) whenever qa.js changes.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const QA_PATH = path.resolve(__dirname, '..', 'assets', 'data', 'qa.js');
const OUT_PATH = path.resolve(__dirname, '..', 'assets', 'data', 'qa-index.json');

// ── Tokenization (must match assets/js/classifier.js exactly) ────────────────

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
  // Question chrome — common but not discriminative
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
  // Domain-universal — present in nearly every Q&A so contributes no signal
  'valthr', 'bapco', 'report', 'project', 'drone', 'drones',
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    // Keep letters, numbers, hyphens, intra-word apostrophes; strip the rest
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2)
    .map(t => {
      // Trim stray hyphens/apostrophes at boundaries
      t = t.replace(/^[-']+|[-']+$/g, '');
      // Crude singularisation — covers most cases without a real stemmer
      if (t.length > 3 && t.endsWith('ies')) t = t.slice(0, -3) + 'y';
      else if (t.length > 3 && t.endsWith('es') && !t.endsWith('ses')) t = t.slice(0, -2);
      else if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) t = t.slice(0, -1);
      return t;
    })
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

// ── Load Q&A bank ────────────────────────────────────────────────────────────

const qaSrc = fs.readFileSync(QA_PATH, 'utf8');
global.window = {};
// eslint-disable-next-line no-eval
eval(qaSrc);
const qa = global.window.VALTHR_QA;
if (!Array.isArray(qa) || !qa.length) {
  console.error('FAIL: qa.js produced no entries');
  process.exit(1);
}

// ── Build searchable docs (chip and question heavily over-weighted vs body) ─

function docText(entry) {
  return [
    entry.chip, entry.chip, entry.chip, entry.chip,        // chip ×4 — most discriminative
    entry.question, entry.question, entry.question,         // question ×3
    entry.answer,                                            // answer ×1 — long, noisy
  ].filter(Boolean).join(' ');
}

const tokenisedDocs = qa.map(entry => ({
  id: entry.id,
  tokens: tokenize(docText(entry)),
}));

// ── Vocabulary + document frequency ──────────────────────────────────────────

const df = new Map();
const vocab = new Map();

for (const d of tokenisedDocs) {
  const seenInDoc = new Set();
  for (const tok of d.tokens) {
    if (!vocab.has(tok)) vocab.set(tok, vocab.size);
    if (!seenInDoc.has(tok)) {
      df.set(tok, (df.get(tok) || 0) + 1);
      seenInDoc.add(tok);
    }
  }
}

const N = tokenisedDocs.length;
const idfArr = new Array(vocab.size);
for (const [term, idx] of vocab) {
  // Smooth IDF: 1 + ln((N + 1) / (df + 1))
  idfArr[idx] = +(1 + Math.log((N + 1) / (df.get(term) + 1))).toFixed(4);
}

// ── Per-doc TF-IDF vectors ───────────────────────────────────────────────────

function vectorise(tokens) {
  const tf = new Map();
  for (const t of tokens) {
    if (!vocab.has(t)) continue;
    const idx = vocab.get(t);
    tf.set(idx, (tf.get(idx) || 0) + 1);
  }
  // Sub-linear TF: 1 + ln(tf), then multiply by IDF
  const vec = [];
  let normSq = 0;
  for (const [idx, count] of tf) {
    const w = +((1 + Math.log(count)) * idfArr[idx]).toFixed(4);
    vec.push([idx, w]);
    normSq += w * w;
  }
  vec.sort((a, b) => a[0] - b[0]);
  return { vec, norm: +Math.sqrt(normSq).toFixed(4) };
}

const docs = tokenisedDocs.map(d => {
  const { vec, norm } = vectorise(d.tokens);
  return { id: d.id, norm, vec };
});

// ── Hash for staleness detection ─────────────────────────────────────────────

const hash = crypto.createHash('sha256').update(qaSrc).digest('hex').slice(0, 12);

// ── Self-test: vectorise each doc's `question` field, query against the index,
//    confirm top-1 is the doc itself for ≥95% of entries. ────────────────────

function dot(a, b) {
  let i = 0, j = 0, s = 0;
  while (i < a.length && j < b.length) {
    if (a[i][0] === b[j][0]) { s += a[i][1] * b[j][1]; i++; j++; }
    else if (a[i][0] < b[j][0]) i++;
    else j++;
  }
  return s;
}

let selfHits = 0;
const misses = [];
for (let i = 0; i < qa.length; i++) {
  const q = vectorise(tokenize(qa[i].question));
  if (!q.vec.length) continue;
  let bestIdx = -1, bestScore = -1;
  for (let k = 0; k < docs.length; k++) {
    const score = dot(q.vec, docs[k].vec) / (q.norm * docs[k].norm);
    if (score > bestScore) { bestScore = score; bestIdx = k; }
  }
  if (docs[bestIdx].id === qa[i].id) selfHits++;
  else misses.push({ q: qa[i].id, got: docs[bestIdx].id, score: +bestScore.toFixed(3) });
}

const selfPct = (selfHits / qa.length * 100).toFixed(1);
console.log(`Self-test: ${selfHits}/${qa.length} (${selfPct}%) top-1 hits`);
if (misses.length && misses.length <= 10) {
  console.log('Misses:', misses);
}
if (selfHits / qa.length < 0.95) {
  console.error(`FAIL: self-test below 95% threshold (${selfPct}%)`);
  process.exit(1);
}

// ── Emit ─────────────────────────────────────────────────────────────────────

const out = {
  hash,
  builtAt: new Date().toISOString(),
  vocab: Object.fromEntries(vocab),
  idf: idfArr,
  docs,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(out));
const sizeKB = (fs.statSync(OUT_PATH).size / 1024).toFixed(1);
console.log(`Wrote ${OUT_PATH} — ${docs.length} docs, ${vocab.size} terms, ${sizeKB} KB`);
