// Pure parts of hybrid retrieval (no DB, no model): query building, Reciprocal Rank Fusion and the
// mapping to a 0..1 relevance score. Kept separate so they can be unit-tested.
import type { Lang } from "@/lib/rag/types";

/** Standard RRF constant (Cormack et al.). */
export const RRF_K = 60;

/**
 * Calibration of multilingual-e5-small cosine similarity. e5 embeddings are squeezed into a narrow band:
 * unrelated text typically still scores ~0.75-0.80, good matches ~0.85-0.92. So cosine is rescaled linearly
 * from [COSINE_FLOOR, COSINE_CEIL] to [0, 1] (clamped). A nonsense question lands near 0, a clear match near 1.
 */
export const COSINE_FLOOR = 0.78;
export const COSINE_CEIL = 0.9;

/**
 * ts_rank_cd (unnormalised) is small and unbounded: one weak term hit is ~0.1, several close hits >= 0.5.
 * Mapped by 1 - exp(-LEXICAL_GAIN * rank): 0.1 -> 0.26 (below MIN_RELEVANCE 0.35), 0.2 -> 0.45, 0.5 -> 0.78.
 */
export const LEXICAL_GAIN = 3;

/** Weight of the fused-rank signal and the preferred-language bonus in the final score. */
export const RRF_WEIGHT = 0.05;
export const LANG_BONUS = 0.02;

/**
 * OR-joined, injection-safe to_tsquery string. Only letters/digits survive, so no tsquery operator
 * can come from user input. Empty string means "no usable terms" (skip the full-text query).
 */
export function buildTsQuery(terms: string[]): string {
  return terms
    .filter((t) => /^[\p{L}\p{N}]+$/u.test(t))
    .join(" | ");
}

/** pgvector text literal, cast with `$n::vector`. */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

/** 1 / (k + rank) with 1-based rank. */
export function rrfScore(rank: number, k: number = RRF_K): number {
  return 1 / (k + rank);
}

/** Fuse ranked id lists: sum of 1/(k+rank) per list. Higher is better. */
export function reciprocalRankFusion(rankings: number[][], k: number = RRF_K): Map<number, number> {
  const fused = new Map<number, number>();
  for (const ranking of rankings) {
    ranking.forEach((id, index) => {
      fused.set(id, (fused.get(id) ?? 0) + rrfScore(index + 1, k));
    });
  }
  return fused;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function cosineToRelevance(cosine: number): number {
  return clamp01((cosine - COSINE_FLOOR) / (COSINE_CEIL - COSINE_FLOOR));
}

export function lexicalToRelevance(rank: number): number {
  return rank > 0 ? clamp01(1 - Math.exp(-LEXICAL_GAIN * rank)) : 0;
}

export interface ScoreInput {
  /** Cosine similarity, or null when there is no query vector or the chunk has no embedding. */
  cosine: number | null;
  /** Raw ts_rank_cd, or null/0 when the chunk did not match the full-text query. */
  lexicalRank: number | null;
  /** Sum of 1/(k+rank) over the lists the chunk appears in. */
  rrf: number;
  /** How many ranked lists took part (1 or 2); sets the best possible RRF value. */
  listCount: number;
  preferredLang: boolean;
}

/**
 * Final 0..1 relevance. Base = 0.75 * strongest signal + 0.25 * the other one, so agreement of the two
 * retrievers is rewarded but either alone can pass the cutoff. When only one signal exists (no embedding,
 * or no lexical hit) the base is just that signal. Fused rank adds up to RRF_WEIGHT and the preferred
 * language LANG_BONUS; together they cannot lift a zero-evidence chunk (max 0.07) past MIN_RELEVANCE.
 */
export function relevanceScore(input: ScoreInput): number {
  const vec = input.cosine === null ? null : cosineToRelevance(input.cosine);
  const lex = input.lexicalRank === null ? null : lexicalToRelevance(input.lexicalRank);
  let base: number;
  if (vec !== null && lex !== null) {
    base = 0.75 * Math.max(vec, lex) + 0.25 * Math.min(vec, lex);
  } else {
    base = vec ?? lex ?? 0;
  }
  const best = Math.max(1, input.listCount) * rrfScore(1);
  const rrfPart = clamp01(input.rrf / best);
  return clamp01((1 - RRF_WEIGHT) * base + RRF_WEIGHT * rrfPart + (input.preferredLang ? LANG_BONUS : 0));
}

/** "recipe:12:en" and "recipe:12:ar" share the stem "recipe:12"; "doc:x:ar:0" -> "doc:x:0". */
export function sourceStem(sourceKey: string): string {
  return sourceKey
    .split(":")
    .filter((part) => part !== "ar" && part !== "en")
    .join(":");
}

export interface DedupeItem {
  sourceKey: string;
  lang: Lang;
  score: number;
}

/**
 * Keep one passage per stem. The one in the preferred language wins (it inherits the better score of the
 * pair, since they are the same content); without a preferred-language twin the best-scoring one stays.
 * Input order is preserved for the survivors.
 */
export function dedupeByStem<T extends DedupeItem>(items: T[], preferred: Lang): T[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const stem = sourceStem(item.sourceKey);
    const group = groups.get(stem);
    if (group) group.push(item);
    else groups.set(stem, [item]);
  }
  const kept = new Map<T, number>();
  for (const group of groups.values()) {
    const bestScore = Math.max(...group.map((g) => g.score));
    const winner =
      group.find((g) => g.lang === preferred) ?? group.reduce((a, b) => (b.score > a.score ? b : a));
    kept.set(winner, bestScore);
  }
  return items.filter((i) => kept.has(i)).map((i) => ({ ...i, score: kept.get(i) ?? i.score }));
}
