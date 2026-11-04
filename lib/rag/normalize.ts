// Text normalisation for matching only (never shown to the user). Arabic spelling varies a lot
// (diacritics, alef forms, ya/alef-maqsura, ta-marbuta), so both the stored searchText and the
// query terms go through the same function.

const TASHKEEL_AND_TATWEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function mapDigit(ch: string): string {
  const a = ARABIC_INDIC_DIGITS.indexOf(ch);
  if (a >= 0) return String(a);
  const b = EXTENDED_INDIC_DIGITS.indexOf(ch);
  return b >= 0 ? String(b) : ch;
}

export function normalizeArabic(text: string): string {
  return text
    .replace(TASHKEEL_AND_TATWEEL, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[٠-٩۰-۹]/g, mapDigit)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** The text the full-text index is built on: title and content, normalised. */
export function toSearchText(title: string, content: string): string {
  return normalizeArabic(`${title}\n${content}`);
}

// Already normalised (alef/ya/ta-marbuta unified) because tokens are compared after normalizeArabic.
const STOPWORDS = new Set<string>([
  // English
  "the", "and", "for", "are", "was", "were", "with", "that", "this", "from", "have", "has", "had", "you",
  "your", "can", "how", "what", "when", "where", "why", "who", "which", "does", "did", "not", "but", "its",
  "about", "into", "than", "then", "there", "their", "they", "them", "will", "would", "should", "could",
  "any", "all", "get", "may", "much", "many", "some", "too", "very", "just", "out", "per", "use", "also",
  "is", "in", "on", "of", "to", "it", "or", "an", "as", "at", "be", "by", "do", "if", "my", "me", "we", "so",
  // Arabic
  "في", "من", "الي", "على", "عن", "مع", "هذا", "هذه", "ذلك", "تلك", "هو", "هي", "هم", "ما", "ماذا", "كيف",
  "متي", "اين", "لماذا", "هل", "ان", "او", "ثم", "لا", "لم", "لن", "قد", "كل", "بعض", "غير", "بين", "حتي",
  "عند", "كان", "كانت", "يكون", "تكون", "التي", "الذي", "الذين", "هناك", "انا", "انت", "نحن", "له", "لها",
  "به", "بها", "منه", "منها", "فيه", "فيها", "ايضا", "جدا", "لكن", "اذا", "يجب", "يمكن", "افضل",
]);

/** Search tokens of a question: normalised, stopwords removed, min length 2, unique, in order. */
export function toTsQueryTerms(question: string): string[] {
  const tokens = normalizeArabic(question).match(/[\p{L}\p{N}]+/gu) ?? [];
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const token of tokens) {
    if (token.length < 2 || STOPWORDS.has(token) || seen.has(token)) continue;
    seen.add(token);
    terms.push(token);
  }
  return terms;
}
