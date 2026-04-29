#!/usr/bin/env node
// test-classifier.js — Runs ~30 hand-written fuzzy queries against the index
// and asserts the expected qaId is in the top-3.
//
// Run after `node tools/build-qa-index.js`.

const fs = require('fs');
const path = require('path');

const INDEX = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'assets', 'data', 'qa-index.json'), 'utf8'));

// Replicate tokenize — must match build-qa-index.js and classifier.js
const STOPWORDS = new Set([
  'a','an','and','are','as','at','be','been','being','but','by','can','could',
  'did','do','does','doing','done','each','for','from','had','has','have','having',
  'he','her','here','hers','him','his','how','i','if','in','into','is','it','its',
  'just','me','my','no','not','now','of','on','one','only','or','other','our','out',
  'over','own','said','same','she','should','so','some','such','than','that','the',
  'their','them','then','there','these','they','this','those','through','to','too',
  'under','up','use','used','using','very','was','we','were','what','when','where',
  'which','while','who','why','will','with','would','you','your',
  'about','across','after','against','all','also','any','around',
  'because','before','between','both','cover','covers','covered',
  'describe','detail','details','differ','different','during','either',
  'else','even','every','explain','explained','follow','happens',
  'happen','know','long','made','make','makes','making','many',
  'may','mean','means','meant','might','more','most','much','must',
  'need','needed','new','next','often','particular','people',
  'specific','still','tell','tells','thing','things','think','time',
  'tried','try','walk','want','way','whether','whose','work',
  'works','yet',
  'valthr','bapco','report','project','drone','drones',
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

function dot(a, b) {
  let i = 0, j = 0, s = 0;
  while (i < a.length && j < b.length) {
    if (a[i][0] === b[j][0]) { s += a[i][1] * b[j][1]; i++; j++; }
    else if (a[i][0] < b[j][0]) i++;
    else j++;
  }
  return s;
}

function classify(text, topN = 3) {
  const tokens = tokenize(text);
  const tf = new Map();
  for (const t of tokens) {
    const idx = INDEX.vocab[t];
    if (idx === undefined) continue;
    tf.set(idx, (tf.get(idx) || 0) + 1);
  }
  if (!tf.size) return [];

  const vec = [];
  let normSq = 0;
  for (const [idx, count] of tf) {
    const w = (1 + Math.log(count)) * INDEX.idf[idx];
    vec.push([idx, w]);
    normSq += w * w;
  }
  vec.sort((a, b) => a[0] - b[0]);
  const norm = Math.sqrt(normSq);

  const scored = [];
  for (const d of INDEX.docs) {
    if (!d.norm || !norm) continue;
    const score = dot(vec, d.vec) / (norm * d.norm);
    if (score > 0) scored.push({ qaId: d.id, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

// ── Fuzzy test cases ────────────────────────────────────────────────────────
// Each case: query → list of acceptable qaId prefixes/exacts (top-3 must
// include at least one match). Prefix-match means any qaId starting with the
// pattern is acceptable (handles near-duplicates across categories).

const cases = [
  // Cost questions
  { q: 'how much does delivery cost',                     accept: ['capex-opex', 'd-mission-cost', 'd-economic-viability'] },
  { q: 'what is the budget',                              accept: ['capex-opex', 'd-'] },
  { q: 'cost per delivery',                               accept: ['capex-opex', 'd-mission-cost'] },
  { q: 'how are operators paid',                          accept: ['d-operator-wages', 'd-supervisor-wages', 'd-wages'] },
  { q: 'phase 1 spending',                                accept: ['d-phase-1', 'd-setup', 'capex-opex'] },

  // Risk questions
  { q: 'weather problems',                                accept: ['risks', 'i-d', 'd5'] },
  { q: 'what could go wrong with batteries',              accept: ['risks', 'i-b', 'i-d'] },
  { q: 'cyber security threats',                          accept: ['data-cyber', 'i-c5', 'g-nfr7'] },
  { q: 'GPS issues in the refinery',                      accept: ['risks', 'c-gps', 'i-b'] },
  { q: 'what if a drone crashes',                         accept: ['i-d1', 'i-d', 'risks'] },

  // Architecture / routing
  { q: 'how does the routing algorithm work',             accept: ['routing'] },
  { q: 'shortest path between stations',                  accept: ['routing', 'c-priority', 'm-floyd'] },
  { q: 'how does it land precisely',                      accept: ['c-apriltag', 'c-gps'] },
  { q: 'where do drones get charged',                     accept: ['c-wireless-charging', 'architecture'] },
  { q: 'edge or cloud server',                            accept: ['c-edge-vs-cloud', 'm-edge-vs-cloud', 'architecture'] },

  // Methodology
  { q: 'why agile',                                       accept: ['methodology-pm', 'b-scrum', 'b-pm-vs-impl'] },
  { q: 'what implementation approach',                    accept: ['methodology-impl', 'b-spiral', 'b-iterative', 'b-pm-vs-impl'] },
  { q: 'how is the team organised',                       accept: ['l-team-composition', 'l-notion-kanban', 'methodology-pm'] },

  // Stakeholders / process
  { q: 'who is in charge of safety',                      accept: ['kpis', 'l-hse', 'l-bapco', 'i-d'] },
  { q: 'who decides priorities',                          accept: ['l-stakeholder', 'requirements', 'a-mendelow', 'a-moscow'] },

  // Contract
  { q: 'what happens if supplier goes bankrupt',          accept: ['e-supplier-bankruptcy', 'data-cyber'] },
  { q: 'how is uptime guaranteed',                        accept: ['contract', 'e-incident', 'kpis'] },
  { q: 'when do we pay suppliers',                        accept: ['e-payment-holdback', 'contract'] },
  { q: 'how long is the warranty',                        accept: ['contract', 'e-warranty'] },

  // Regulatory / glossary
  { q: 'what does atex mean',                             accept: ['j-atex', 'h-atex'] },
  { q: 'who is BCAA',                                     accept: ['j-bcaa', 'h-bcaa', 'l-bcaa'] },
  { q: 'what is a WBS',                                   accept: ['j-wbs', 'b-wbs'] },
  { q: 'what is moscow',                                  accept: ['j-moscow', 'a-moscow'] },

  // Requirements specific
  { q: 'how heavy a payload',                             accept: ['f-fr-01-payload', 'a-fr1-payload'] },
  { q: 'wind speed limit',                                accept: ['f-fr-08-wind', 'i-d'] },
  { q: 'manual override speed',                           accept: ['f-fr-04-manual', 'requirements'] },

  // Operations / scenarios
  { q: 'what happens during low battery mid mission',     accept: ['k-', 'c-wireless-charging'] },
  { q: 'how does a sample delivery work',                 accept: ['k-sample', 'k-', 'architecture'] },

  // Future
  { q: 'can it work with trucks',                         accept: ['m-drone-only-vs-drone-truck', 'c-road-graph'] },
];

function isAccepted(qaId, accept) {
  return accept.some(p => qaId === p || qaId.startsWith(p));
}

let pass = 0, soft = 0, fail = 0;
const failures = [];

for (const c of cases) {
  const results = classify(c.q, 3);
  const top = results[0];
  if (!top) {
    fail++;
    failures.push({ q: c.q, got: '(none)', expected: c.accept });
    continue;
  }
  const top1Hit = isAccepted(top.qaId, c.accept);
  const top3Hit = results.some(r => isAccepted(r.qaId, c.accept));

  if (top1Hit) {
    pass++;
    console.log(`PASS  [${top.score.toFixed(2)}]  "${c.q}"\n        → ${top.qaId}`);
  } else if (top3Hit) {
    soft++;
    console.log(`SOFT  [${top.score.toFixed(2)}]  "${c.q}"\n        → ${top.qaId} (expected in top-3, found at #${results.findIndex(r => isAccepted(r.qaId, c.accept)) + 1})`);
  } else {
    fail++;
    failures.push({ q: c.q, got: results.map(r => r.qaId + '@' + r.score.toFixed(2)), expected: c.accept });
    console.log(`FAIL  [${top.score.toFixed(2)}]  "${c.q}"\n        → ${top.qaId}, expected ${c.accept.join(' | ')}`);
  }
}

const total = cases.length;
console.log(`\n──────────────────────────────────────`);
console.log(`Top-1 hits:  ${pass}/${total}  (${(pass/total*100).toFixed(0)}%)`);
console.log(`Top-3 hits:  ${pass + soft}/${total}  (${((pass+soft)/total*100).toFixed(0)}%)`);
console.log(`Failures:    ${fail}/${total}`);

// Distribution of top-1 scores so we can see if our thresholds are sane
const scores = cases.map(c => classify(c.q, 1)[0]?.score || 0).sort((a, b) => a - b);
const median = scores[Math.floor(scores.length / 2)];
const min = scores[0];
const max = scores[scores.length - 1];
console.log(`Score range: min ${min.toFixed(2)} | median ${median.toFixed(2)} | max ${max.toFixed(2)}`);

// Exit non-zero if any hard failures (top-3 doesn't contain expected)
process.exit(fail > 0 ? 1 : 0);
