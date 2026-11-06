// In-memory hybrid retrieval: BM25 (word evidence, rare words count more) plus hashed n-gram similarity (spelling
// evidence). The knowledge base is a few hundred short passages, so scoring all of them per question is cheap, and it
// needs no embedding model, no pgvector and no extra service. Pure: tests build an index from plain rows.
// Calibration (see docs/assistant-evaluation.md and tests/eval/retrieval-cases.json): on 59 answerable questions (formal and
// colloquial Gaza Arabic, informal English) and 26 unanswerable ones over the curated documents it accepts 92% of the
// answerable ones and rejects 88% of the others at MIN_RELEVANCE, and finds the right document in the top 3 for all 59
// (top 1 for 53). Known misses are listed in the evaluation page. The sample is small, so treat the numbers as a sanity check.
// Colloquial words are bridged by synonyms.ts (query side, half weight); a long question backed by one passage word only
// is capped below the cutoff (THIN_MATCH_CAP_SHARE).
import { LANG_BONUS, dedupeByStem } from "@/lib/rag/fusion";
import { dot, hashEmbed } from "@/lib/rag/ngram";
import { toSearchText, toTsQueryTerms } from "@/lib/rag/normalize";
import { expandSynonyms } from "@/lib/rag/synonyms";
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
/** A question with at least this many content terms must be backed by more than one passage word (see coverageOf). */
const MIN_TERMS_FOR_COVERAGE = 3;
/** A passage that covers at most this many of those terms is a thin match. */
const THIN_COVERAGE = 1;
/** A thin match is capped at this share of MIN_RELEVANCE, i.e. below the cutoff, unless the spelling evidence is strong. */
const THIN_MATCH_CAP_SHARE = 0.85;
/** A word shorter than this keeps its letters when the stemmer looks for a clitic or suffix. */
const MIN_STEM_CHARS = 4;
/** A word found through the synonym table counts this much of a word the visitor typed (see synonyms.ts). */
export const SYNONYM_WEIGHT = 0.5;

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
  /** Crude stems of the words, used only to count how many question terms a passage covers. */
  stems: Set<string>;
  vector: number[];
}

export interface MemoryIndex {
  rows: IndexedRow[];
  df: Map<string, number>;
  averageLength: number;
}

// One Arabic clitic that is not part of the article (bi-, wa-, li-, ka-, fa-) or one English ending.
// https://regex101.com/?regex=%5E%5B%D8%A8%D9%88%D9%84%D9%83%D9%81%5D(%3F%3D%5B%5Cu0621-%5Cu064A%5D%7B3%2C%7D%24)%7C(%3F%3Aing%7Ced%7Ces%7Cs)%24&flags=u
const CLITIC_OR_ENDING = /^[بولكف](?=[\u0621-\u064A]{3,}$)|(?:ing|ed|es|s)$/u;

/** Spelling-tolerant form of a word: "بغزه" meets "غزه" and "supplements" meets "supplement". Never used for scoring. */
function coverageStem(word: string): string {
  if (word.length < MIN_STEM_CHARS) return word;
  const stem = word.replace(CLITIC_OR_ENDING, "");
  return stem.length >= MIN_STEM_CHARS - 1 ? stem : word;
}

export function buildMemoryIndex(rows: readonly IndexRow[]): MemoryIndex {
  const indexed: IndexedRow[] = rows.map((row) => {
    const words = toSearchText(row.title, row.content).match(WORD) ?? [];
    const counts = new Map<string, number>();
    for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
    return { row, words, counts, stems: new Set(words.map(coverageStem)), vector: hashEmbed(`${row.title}\n${row.content}`) };
  });
  const df = new Map<string, number>();
  for (const { counts } of indexed) for (const word of counts.keys()) df.set(word, (df.get(word) ?? 0) + 1);
  const total = indexed.reduce((sum, r) => sum + r.words.length, 0);
  return { rows: indexed, df, averageLength: indexed.length ? total / indexed.length : 1 };
}

interface QueryTerm {
  term: string;
  weight: number;
}

/** The typed words at full weight, then the synonyms of colloquial words at SYNONYM_WEIGHT. */
export function queryTerms(question: string): QueryTerm[] {
  const typed = toTsQueryTerms(question);
  const known = new Set(typed);
  const synonyms = expandSynonyms(question).filter((term) => !known.has(term));
  return [...typed.map((term) => ({ term, weight: 1 })), ...synonyms.map((term) => ({ term, weight: SYNONYM_WEIGHT }))];
}

function bm25(index: MemoryIndex, entry: IndexedRow, terms: readonly QueryTerm[]): number {
  const n = index.rows.length;
  let score = 0;
  for (const { term, weight } of terms) {
    const tf = entry.counts.get(term) ?? 0;
    if (tf === 0) continue;
    const df = index.df.get(term) ?? 0;
    const idf = Math.log(1 + (n - df + HALF) / (df + HALF));
    const lengthNorm = 1 - BM25_B + (BM25_B * entry.words.length) / index.averageLength;
    score += weight * (idf * (tf * (BM25_K1 + 1))) / (tf + BM25_K1 * lengthNorm);
  }
  return score;
}

/** How many distinct question terms the passage contains, allowing a clitic or an ending. */
function coverageOf(entry: IndexedRow, terms: readonly string[]): number {
  return terms.filter((term) => entry.counts.has(term) || entry.stems.has(coverageStem(term))).length;
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
  const terms = queryTerms(question);
  const typed = toTsQueryTerms(question);
  const queryVector = hashEmbed(question);

  const scored: RetrievedChunk[] = index.rows.map((entry) => {
    const cosine = dot(queryVector, entry.vector);
    let relevance = relevanceOf(bm25(index, entry, terms), cosine);
    // A long question that shares ONE word with the passage ("best protein for muscle building" and "building") is
    // not an answer unless the spelling agrees strongly too.
    if (typed.length >= MIN_TERMS_FOR_COVERAGE && coverageOf(entry, terms.map((t) => t.term)) <= THIN_COVERAGE && cosine < NGRAM_CEIL) {
      relevance = Math.min(relevance, MIN_RELEVANCE * THIN_MATCH_CAP_SHARE);
    }
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
