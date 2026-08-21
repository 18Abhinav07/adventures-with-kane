import fs from 'node:fs';
import path from 'node:path';

const MEMORY_PATH = '.testmuai/bug-memory.json';
const STOPWORDS = new Set(['the', 'a', 'an', 'to', 'of', 'is', 'and', 'on', 'in', 'for', 'after', 'with', 'not', 'or', 'be']);
const MATCH_THRESHOLD = 0.5;

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

// Jaccard similarity over token sets — cheap, dependency-free, good enough
// to flag "this looks like a bug we've seen before" without an LLM call.
function similarity(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  return overlap / new Set([...ta, ...tb]).size;
}

export function loadMemory(memoryPath = MEMORY_PATH) {
  try {
    return JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
  } catch {
    return { entries: [] };
  }
}

export function saveMemory(memory, memoryPath = MEMORY_PATH) {
  fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2), 'utf8');
}

// Records a confirmed-or-suspected defect the moment the hook sees one
// (scripted-test failure or defect-sweep finding) — regardless of how it's
// eventually resolved, so later tasks can be checked against it.
export function recordBug(memory, { taskId, prdRef, title, bugTitle, rootCause, family, confidence, source }) {
  memory.entries.push({
    taskId,
    prdRef: prdRef || null,
    title: title || null,
    bugTitle: bugTitle || null,
    rootCause: rootCause || null,
    family: family || null,
    confidence: confidence ?? null,
    source, // 'scripted_test' | 'sweep'
    timestamp: new Date().toISOString(),
  });
  return memory;
}

// Given a newly-found issue, returns prior entries (excluding this task's
// own earlier attempts) whose bugTitle/rootCause text substantially overlaps
// — a candidate "this bug resurfaced" signal, not a certainty.
export function findMatches(memory, { taskId, bugTitle, rootCause }, threshold = MATCH_THRESHOLD) {
  const probeText = `${bugTitle || ''} ${rootCause || ''}`.trim();
  if (!probeText) return [];
  return memory.entries
    .filter(e => e.taskId !== taskId)
    .map(e => ({ entry: e, score: similarity(probeText, `${e.bugTitle || ''} ${e.rootCause || ''}`) }))
    .filter(m => m.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
