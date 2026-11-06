// Follow-up handling for retrieval. The free generator ignores chat history, so a short follow-up such as
// "وكم مرة في اليوم؟" would search for nothing. When the current question cannot stand on its own, the previous USER
// question is prepended to the SEARCH text only. Pure: no I/O, no model call. Triage, the injection check and the
// prompt keep using the real question; see chat.ts.
import { normalizeArabic, toTsQueryTerms } from "@/lib/rag/normalize";
import type { ChatRequest } from "@/lib/rag/types";

/** A question with at most this many content terms (stopwords removed) is a fragment, not a question. */
export const MAX_FRAGMENT_TERMS = 2;
/** A question with a follow-up cue still counts as a follow-up while it has at most this many content terms. */
export const MAX_CUE_FOLLOWUP_TERMS = 3;
/** From this many content terms on, a question is self-contained, cue or not, and is never merged. */
export const MIN_STANDALONE_TERMS = 3;
/** Most characters of the previous question that go into the search text (the newest ones are kept). */
export const MAX_PREVIOUS_CHARS = 240;
/** Hard bound of the merged search text. */
export const MAX_SEARCH_CHARS = 840;

// Arabic follow-up openers, matched after normalizeArabic (alef forms, ya and ta-marbuta already unified): matches
// "وكم مرة" and "وإذا كان" (as "واذا") and "ثم ماذا", rejects "وصفة" and "وين".
// https://regex101.com/?regex=%5E(%3F%3Aو%5Cs*(%3F%3Aكمان%7Cكم%7Cماذا%7Cاذا%7Cهل%7Cلو%7Cايش%7Cشو%7Cليش%7Cمتي%7Cكيف%7Cلماذا%7Cاين%7Cما%7Cبعدين)%7Cثم%7Cكمان%7Cطيب%7Cطب%7Cيعني)(%3F!%5B%5Cp%7BL%7D%5D)&flags=u
const ARABIC_CUE = /^(?:و\s*(?:كمان|كم|ماذا|اذا|هل|لو|ايش|شو|ليش|متي|كيف|لماذا|اين|ما|بعدين)|ثم|كمان|طيب|طب|يعني)(?![\p{L}])/u;

// English follow-up openers: matches "And how often?" and "what about children" and "How long should it last",
// rejects "Android phones" and "Anything else".
// https://regex101.com/?regex=%5E(%3F%3Aand%7Calso%7Cthen%7Cbut%7Cso%7Cwhat%20about%7Chow%20about%7Cwhat%20if%7Chow%20often%7Chow%20long%7Chow%20many%20times%7Chow%20much%7Cis%20it%20(%3F%3Asafe%7Cok%7Cokay)%7Ccan%20i%20(%3F%3Aalso%7Cstill))%5Cb&flags=i
const ENGLISH_CUE = /^(?:and|also|then|but|so|what about|how about|what if|how often|how long|how many times|how much|is it (?:safe|ok|okay)|can i (?:also|still))\b/i;

/** True when the question opens like a follow-up ("and how often", "وكم مرة", "ثم ماذا"). */
export function hasFollowUpCue(question: string): boolean {
  const text = normalizeArabic(question).replace(/^[^\p{L}\p{N}]+/u, "");
  return ARABIC_CUE.test(text) || ENGLISH_CUE.test(text);
}

/** The most recent user turn of the history, or undefined. Older turns are never used. */
export function previousUserQuestion(history: ChatRequest["history"]): string | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "user" && history[i].content.trim()) return history[i].content.trim();
  }
  return undefined;
}

/** Whether the question needs the previous one to be searchable: a fragment, or a short question that opens with a cue. */
export function needsContext(question: string): boolean {
  const terms = toTsQueryTerms(question).length;
  if (terms >= MIN_STANDALONE_TERMS && !hasFollowUpCue(question)) return false;
  if (terms <= MAX_FRAGMENT_TERMS) return true;
  return terms <= MAX_CUE_FOLLOWUP_TERMS && hasFollowUpCue(question);
}

/** The text to search with: "<previous user question> <question>" for a follow-up, otherwise the question unchanged. */
export function buildSearchQuestion(question: string, history: ChatRequest["history"]): string {
  if (!needsContext(question)) return question;
  const previous = previousUserQuestion(history);
  if (!previous) return question;
  // Keep the end of a long previous question: the topic is usually in the last words, the opening is often a greeting.
  const clipped = previous.length > MAX_PREVIOUS_CHARS ? previous.slice(-MAX_PREVIOUS_CHARS) : previous;
  return `${clipped} ${question}`.slice(-MAX_SEARCH_CHARS);
}
