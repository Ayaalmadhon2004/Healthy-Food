// A free, model-free "embedding": character n-grams of every normalised word, hashed into a fixed-size vector.
// Nothing is downloaded and nothing runs on a server other than ours, so it works offline and on any host.
// It is NOT semantic: it measures how much spelling two texts share, which still forgives Arabic prefixes, plural
// endings and small spelling differences. Used together with BM25 (see memoryIndex.ts).
import { EMBEDDING_DIM } from "@/lib/rag/constants";
import { toSearchText } from "@/lib/rag/normalize";

const NGRAM_MIN = 3;
const NGRAM_MAX = 5;
const MIN_WORD_CHARS = 2;
// FNV-1a 32-bit constants.
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const SIGN_BIT = 0x80000000;

// Letters and digits: matches the words of "boil, then drink", rejects punctuation.
// https://regex101.com/?regex=%5B%5Cp%7BL%7D%5Cp%7BN%7D%5D%2B&flags=gu
const WORD = /[\p{L}\p{N}]+/gu;

function fnv1a(text: string): number {
  let hash = FNV_OFFSET;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

/** Unit-length vector of EMBEDDING_DIM numbers. Deterministic: the same text always gives the same vector. */
export function hashEmbed(text: string): number[] {
  const counts = new Map<string, number>();
  const bump = (gram: string) => counts.set(gram, (counts.get(gram) ?? 0) + 1);
  for (const word of toSearchText("", text).match(WORD) ?? []) {
    if (word.length < MIN_WORD_CHARS) continue;
    bump(`w:${word}`);
    const padded = `<${word}>`;
    for (let n = NGRAM_MIN; n <= NGRAM_MAX; n++) {
      for (let i = 0; i + n <= padded.length; i++) bump(padded.slice(i, i + n));
    }
  }

  const vector = new Array<number>(EMBEDDING_DIM).fill(0);
  for (const [gram, count] of counts) {
    const hash = fnv1a(gram);
    // Signed feature hashing: collisions cancel out on average instead of piling up.
    vector[hash % EMBEDDING_DIM] += (hash & SIGN_BIT ? -1 : 1) * (1 + Math.log(count));
  }
  const norm = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0)) || 1;
  return vector.map((x) => x / norm);
}

/** Dot product of two unit vectors, i.e. their cosine. */
export function dot(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}
