// A free, key-less "generator": it builds the answer straight from the retrieved passages, so nothing can be
// invented. It keeps only the sentences that share words with the question, so unrelated passages that were
// retrieved by a weak match add nothing. Same shape as the model's answer (one line, short bullets, caution, [n]).
import { toSearchText, toTsQueryTerms } from "@/lib/rag/normalize";
import type { Lang, RetrievedChunk } from "@/lib/rag/types";

const MAX_BULLETS = 4;
const MAX_PER_PASSAGE = 2;
const MAX_SENTENCE_CHARS = 240;
const MIN_SENTENCE_CHARS = 25;
const HEAD_SENTENCES = 2;
/** A passage scoring below this share of the best one is left out of the bullets (it matched on a stray word). */
const MIN_SCORE_SHARE = 0.6;

// Sentence ends in Latin or Arabic punctuation, or a line break: matches the gap after "a. B" and "a؟ ب", rejects "a b".
// https://regex101.com/?regex=(%3F%3C%3D%5B.!%3F%D8%9F%5D)%5Cs%2B%7C%5Cs*%5Cn%5Cs*&flags=g
const SENTENCE_BREAK = /(?<=[.!?؟])\s+|\s*\n\s*/;
// Letters and digits: matches the words of "boil, then drink", rejects punctuation.
// https://regex101.com/?regex=%5B%5Cp%7BL%7D%5Cp%7BN%7D%5D%2B&flags=gu
const WORD = /[\p{L}\p{N}]+/gu;

/** Sentences of a passage with the repeated title line removed, trimmed to a readable length. */
export function sentencesOf(chunk: Pick<RetrievedChunk, "title" | "content">): string[] {
  const out: string[] = [];
  for (const raw of chunk.content.split(SENTENCE_BREAK)) {
    const text = raw.replace(/\s+/g, " ").trim();
    if (text.length < MIN_SENTENCE_CHARS || text === chunk.title.trim() || text.replace(/[.:]$/, "") === chunk.title.trim()) continue;
    out.push(text.length > MAX_SENTENCE_CHARS ? `${text.slice(0, MAX_SENTENCE_CHARS).replace(/\s+\S*$/, "")}…` : text);
  }
  return out;
}

const CAUTION_LABEL: Record<Lang, string> = { en: "Caution:", ar: "تنبيه:" };

export interface ExtractiveInput {
  passages: readonly RetrievedChunk[];
  /** The visitor's question; without it the opening sentences of the top passages are used. */
  question?: string;
  lang: Lang;
  /** Localized "general information, ask a doctor" line (server.chat.disclaimer). */
  disclaimer: string;
}

interface Candidate {
  text: string;
  passage: number;
  position: number;
  overlap: number;
}

/** How many distinct question terms a sentence contains (articles and spelling variants normalised away). */
function overlapOf(sentence: string, terms: ReadonlySet<string>): number {
  const words = new Set(toSearchText("", sentence).match(WORD) ?? []);
  let count = 0;
  for (const term of terms) if (words.has(term)) count += 1;
  return count;
}

function candidatesFor(passages: readonly RetrievedChunk[], terms: ReadonlySet<string>): Candidate[] {
  const all: Candidate[] = [];
  const best = Math.max(...passages.map((p) => p.score));
  passages.forEach((passage, index) => {
    if (passage.score < best * MIN_SCORE_SHARE) return;
    sentencesOf(passage).forEach((text, position) => {
      const overlap = terms.size > 0 ? overlapOf(text, terms) : 0;
      if (terms.size === 0 || overlap > 0) all.push({ text, passage: index, position, overlap });
    });
  });
  // Best match first; ties keep passage order, then the order inside the passage.
  return all.sort((a, b) => b.overlap - a.overlap || a.passage - b.passage || a.position - b.position);
}

/**
 * The opening line is the best-matching sentence (with the sentence after it from the same passage when that
 * one matches too); the bullets are the next best, at most two per passage, each cited with its own passage
 * number. Pure and deterministic.
 */
export function buildExtractiveAnswer({ passages, question, lang, disclaimer }: ExtractiveInput): string {
  const first = passages[0];
  if (!first) return "";
  const terms = new Set(question ? toTsQueryTerms(question) : []);
  const ranked = candidatesFor(passages, terms);

  // No sentence shares a word with the question (or there was no question): fall back to the top passage's opening.
  if (ranked.length === 0) {
    const opening = sentencesOf(first).slice(0, HEAD_SENTENCES).join(" ") || first.title;
    return [`${opening} [1]`, `${CAUTION_LABEL[lang]} ${disclaimer}`].join("\n");
  }

  // The opening line comes from the highest-ranked passage that has a matching sentence: retrieval (vectors plus
  // full-text) judged that passage the best fit, which is a better signal than a sentence that merely shares more words.
  const leadPassage = Math.min(...ranked.map((c) => c.passage));
  const head = ranked.find((c) => c.passage === leadPassage) ?? ranked[0];
  const headLine = [head.text];
  const neighbour = sentencesOf(passages[head.passage])[head.position + 1];
  if (neighbour && ranked.some((c) => c.passage === head.passage && c.position === head.position + 1)) headLine.push(neighbour);

  const used = new Set<string>([`${head.passage}:${head.position}`, ...(headLine.length > 1 ? [`${head.passage}:${head.position + 1}`] : [])]);
  const perPassage = new Map<number, number>([[head.passage, headLine.length]]);
  const bullets: string[] = [];
  for (const c of ranked) {
    if (bullets.length >= MAX_BULLETS) break;
    if (used.has(`${c.passage}:${c.position}`) || (perPassage.get(c.passage) ?? 0) >= MAX_PER_PASSAGE) continue;
    used.add(`${c.passage}:${c.position}`);
    perPassage.set(c.passage, (perPassage.get(c.passage) ?? 0) + 1);
    bullets.push(`- ${c.text} [${c.passage + 1}]`);
  }
  return [`${headLine.join(" ")} [${head.passage + 1}]`, ...bullets, `${CAUTION_LABEL[lang]} ${disclaimer}`].join("\n");
}

export interface OverviewInput {
  passages: readonly RetrievedChunk[];
  /** Localized sentence that introduces the list (server.chat.overviewIntro). */
  intro: string;
  lang: Lang;
  disclaimer: string;
}

/** One cited point per passage (its opening sentence) under a fixed introduction. Used for general requests for tips. */
export function buildOverviewAnswer({ passages, intro, lang, disclaimer }: OverviewInput): string {
  const points = passages.flatMap((passage, index) => {
    const sentence = sentencesOf(passage)[0];
    return sentence ? [`- ${sentence} [${index + 1}]`] : [];
  });
  if (points.length === 0) return "";
  return [intro, ...points, `${CAUTION_LABEL[lang]} ${disclaimer}`].join("\n");
}
