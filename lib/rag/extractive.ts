// A free, key-less "generator": it builds the answer straight from the retrieved passages, so nothing can be
// invented. Same shape as the model's answer (one line, short bullets, caution, [n] citations).
import type { Lang, RetrievedChunk } from "@/lib/rag/types";

const MAX_BULLETS = 4;
const MAX_SENTENCE_CHARS = 240;
const MIN_SENTENCE_CHARS = 25;
const HEAD_SENTENCES = 2;

// Sentence ends in Latin or Arabic punctuation, or a line break: matches the gap after "a. B" and "a؟ ب", rejects "a b".
// https://regex101.com/?regex=(%3F%3C%3D%5B.!%3F%D8%9F%5D)%5Cs%2B%7C%5Cs*%5Cn%5Cs*&flags=g
const SENTENCE_BREAK = /(?<=[.!?؟])\s+|\s*\n\s*/;

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
  lang: Lang;
  /** Localized "general information, ask a doctor" line (server.chat.disclaimer). */
  disclaimer: string;
}

/**
 * Passage [1] gives the opening line; the next sentences of the top passages become the bullets, each cited
 * with its own passage number. Pure and deterministic.
 */
export function buildExtractiveAnswer({ passages, lang, disclaimer }: ExtractiveInput): string {
  const lines: string[] = [];
  const first = passages[0];
  if (!first) return "";

  const head = sentencesOf(first).slice(0, HEAD_SENTENCES).join(" ");
  lines.push(`${head || first.title} [1]`);

  const bullets: string[] = [];
  passages.forEach((passage, index) => {
    const skip = index === 0 ? HEAD_SENTENCES : 0;
    for (const sentence of sentencesOf(passage).slice(skip, skip + 1 + (index === 0 ? 1 : 0))) {
      if (bullets.length < MAX_BULLETS) bullets.push(`- ${sentence} [${index + 1}]`);
    }
  });
  lines.push(...bullets);
  lines.push(`${CAUTION_LABEL[lang]} ${disclaimer}`);
  return lines.join("\n");
}
