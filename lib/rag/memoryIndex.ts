// In-memory hybrid retrieval: BM25 (word evidence, rare words count more) plus hashed n-gram similarity (spelling
// evidence). The knowledge base is a few hundred short passages, so scoring all of them per question is cheap, and it
// needs no embedding model, no pgvector and no extra service. Pure: tests build an index from plain rows.
// Calibration (see docs/assistant-evaluation.md): on 25 answerable and 8 unanswerable questions over the curated
// documents it accepts 92% of the answerable ones and rejects 88% of the others at MIN_RELEVANCE, and finds the
// right document in the top 3 for 24 of 25. The sample is small, so treat the numbers as a sanity check.
import { LANG_BONUS, dedupeByStem } from "@/lib/rag/fusion";
import { dot, hashEmbed } from "@/lib/rag/ngram";
import { toSearchText, toTsQueryTerms } from "@/lib/rag/normalize";
import { MIN_RELEVANCE, RETRIEVE_TOP_K } from "@/lib/rag/constants";
import type { KnowledgeKind } from "@/lib/rag/constants";
import type { Lang, RetrieveOptions, RetrievedChunk } from "@/lib/rag/types";

const BM25_K1 = 1.2;
const BM25_B = 0.75;
const HALF = 0.5;
/** bm25 / LEXICAL_SCALE maps to 1 - e^-x: a score of about 3 reads as 0.3, 8 as 0.63. */
const LEXICAL_SCALE = 8;
/** Cosine range of the hashed vectors that counts as no evidence (floor) to a strong match (ceil). */
const NGRAM_FLOOR = 0.1;
const NGRAM_CEIL = 0.35;
/** Weight of the stronger signal; the weaker one gets the rest, so agreement of both is rewarded. */
const STRONG_WEIGHT = 0.6;

// Letters and digits: matches the words of "boil, then drink", rejects punctuation.
// https://regex101.com/?regex=%5B%5Cp%7BL%7D%5Cp%7BN%7D%5D%2B&flags=gu
const WORD = /[\p{L}\p{N}]+/gu;

export interface IndexRow {
  id: number;
  sourceKey: string;
  kind: string;
  lang: string;
  title: string;
  content: string;
  sourceName: string | null;
  sourceUrl: string | null;
  sourceDate: string | null;
}

interface IndexedRow {
  row: IndexRow;
  words: string[];
  counts: Map<string, number>;
  vector: number[];
}

export interface MemoryIndex {
  rows: IndexedRow[];
  df: Map<string, number>;
  averageLength: number;
}

export function buildMemoryIndex(rows: readonly IndexRow[]): MemoryIndex {
  const indexed: IndexedRow[] = rows.map((row) => {
    const words = toSearchText(row.title, row.content).match(WORD) ?? [];
    const counts = new Map<string, number>();
    for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
    return { row, words, counts, vector: hashEmbed(`${row.title}\n${row.content}`) };
  });
  const df = new Map<string, number>();
  for (const { counts } of indexed) for (const word of counts.keys()) df.set(word, (df.get(word) ?? 0) + 1);
  const total = indexed.reduce((sum, r) => sum + r.words.length, 0);
  return { rows: indexed, df, averageLength: indexed.length ? total / indexed.length : 1 };
}

function bm25(index: MemoryIndex, entry: IndexedRow, terms: readonly string[]): number {
  const n = index.rows.length;
  let score = 0;
  for (const term of terms) {
    const tf = entry.counts.get(term) ?? 0;
    if (tf === 0) continue;
    const df = index.df.get(term) ?? 0;
    const idf = Math.log(1 + (n - df + HALF) / (df + HALF));
    const lengthNorm = 1 - BM25_B + (BM25_B * entry.words.length) / index.averageLength;
    score += (idf * (tf * (BM25_K1 + 1))) / (tf + BM25_K1 * lengthNorm);
  }
  return score;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0..1 relevance from a BM25 score and an n-gram cosine. Exported so tests can pin the calibration. */
export function relevanceOf(bm25Score: number, cosine: number): number {
  const lexical = 1 - Math.exp(-bm25Score / LEXICAL_SCALE);
  const spelling = clamp01((cosine - NGRAM_FLOOR) / (NGRAM_CEIL - NGRAM_FLOOR));
  return STRONG_WEIGHT * Math.max(lexical, spelling) + (1 - STRONG_WEIGHT) * Math.min(lexical, spelling);
}

export function searchMemoryIndex(index: MemoryIndex, question: string, opts: RetrieveOptions): RetrievedChunk[] {
  const topK = opts.topK ?? RETRIEVE_TOP_K;
  const minScore = opts.minScore ?? MIN_RELEVANCE;
  if (index.rows.length === 0) return [];
  const terms = toTsQueryTerms(question);
  const queryVector = hashEmbed(question);

  const scored: RetrievedChunk[] = index.rows.map((entry) => {
    const relevance = relevanceOf(bm25(index, entry, terms), dot(queryVector, entry.vector));
    return {
      id: entry.row.id,
      sourceKey: entry.row.sourceKey,
      kind: entry.row.kind as KnowledgeKind,
      lang: entry.row.lang as Lang,
      title: entry.row.title,
      content: entry.row.content,
      sourceName: entry.row.sourceName,
      sourceUrl: entry.row.sourceUrl,
      sourceDate: entry.row.sourceDate,
      score: clamp01(relevance + (entry.row.lang === opts.lang ? LANG_BONUS : 0)),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return dedupeByStem(scored, opts.lang)
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
