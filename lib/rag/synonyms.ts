// A small, reviewed table that maps colloquial Gaza/Levantine Arabic and informal English to the words the curated
// documents (data/knowledge) really use, so "الأكل المبرّد تعفّن، أرميه؟" can meet "تلف ... تخلّص ... بدون كهرباء".
// Rules of the table:
//  - Query side only. The stored text is never rewritten, and a match through a synonym counts less than a match on
//    the word the visitor typed (see SYNONYM_WEIGHT in memoryIndex.ts).
//  - Same meaning only: spelling, plural, gender and dialect variants of the SAME word. A symptom is never mapped to a
//    different symptom or to a condition (no مغص -> اسهال, no نحيف -> سوء التغذية), and a word with a second common
//    meaning is left out or made conditional (`whenAny`).
//  - Every rule carries a reason and a worked example; tests/rag-synonyms.test.js checks both.
//
// Deliberately NOT mapped (each would change the medical meaning or match something else):
//  - مغص, بطنه بتوجعه: cramps are not diarrhoea.
//  - نحيف, ضعيف, هزيل: thin is a sign, not the diagnosis "سوء التغذية".
//  - مسهل: in standard Arabic it means a laxative (a drug); only the colloquial مسهول is mapped.
//  - سكر alone: sugar or diabetes; see the conditional rule below.
//  - ضو: light or electricity; قطع: cut or cut-off; براد: also a tea pot (it is a TARGET here, never a source).
import { normalizeArabic, stripArabicArticle } from "@/lib/rag/normalize";

export interface SynonymRule {
  /** Colloquial words or short phrases (space separated), written naturally; they are normalised when the table loads. */
  readonly from: readonly string[];
  /** The words the documents use. Same meaning as `from`, never a different symptom. */
  readonly to: readonly string[];
  /** Why this is safe: what the colloquial word means and which document word it meets. */
  readonly reason: string;
  /** A question that must expand to every word of `to` (checked by the tests). */
  readonly example: string;
  /** Only applies when one of these words is also in the question (for words with a second meaning). */
  readonly whenAny?: readonly string[];
}

export const SYNONYM_RULES: readonly SynonymRule[] = [
  // --- Food safety ---
  {
    from: ["تعفن", "تعفنت", "متعفن", "متعفنة", "معفن", "فسد", "فسدت", "فاسد", "فاسدة", "خربان", "خربانة", "بايت", "بايتة"],
    to: ["تلف", "تالفة"],
    reason: "Spoiled food. The document says التلف / الأطعمة التالفة and tells the reader to discard it.",
    example: "الأكل المبرّد تعفّن",
  },
  {
    from: ["ثلاجة", "مبرد", "مبردة", "مبردات"],
    to: ["براد", "تبريد"],
    reason: "Refrigerator and refrigerated. The documents call the fridge البراد and the cold chain التبريد; ثلاجة never appears.",
    example: "الأكل المبرّد",
  },
  {
    from: ["أرميه", "أرميها", "ارميهم", "نرميه", "نرميها", "ترميه", "برميه", "برميها", "رميه", "رميها", "أتخلص", "نتخلص"],
    to: ["تخلص", "تتخلص"],
    reason: "Throw it away. The document says تخلّص منه (when in doubt, throw it out); these are the dialect verb forms.",
    example: "أرميه؟",
  },
  {
    from: ["لحمة", "لحمه"],
    to: ["لحم"],
    reason: "Gaza colloquial لحمة is the meat the document calls اللحم (same noun, ta-marbuta form).",
    example: "اللحمة ضلت",
  },
  {
    from: ["ضل", "ضلت", "ضلو", "ظلت", "بقي"],
    to: ["بقيت"],
    reason: "Stayed/remained: the document counts how long food has stayed (إذا بقيت 4 ساعات) without power.",
    example: "اللحمة ضلت بدون كهربا",
  },
  {
    from: ["كهربا"],
    to: ["كهرباء"],
    reason: "Gaza colloquial spelling of كهرباء, the word used by the documents.",
    example: "الكهربا قطعت",
  },
  {
    from: ["علبة"],
    to: ["علب"],
    reason: "Singular of العلب, the form the document uses for cans.",
    example: "علبة التونة",
  },
  {
    from: ["منفوخ", "منفوخة", "منفوخات", "منتفخ"],
    to: ["منتفخة"],
    reason: "Bulging/swollen can: dialect and gender variants of المنتفخة in the document's list of cans to discard.",
    example: "علبة التونة منفوخة",
  },
  // --- Water ---
  {
    from: ["ماي", "ميه"],
    to: ["ماء", "مياه"],
    reason: "Dialect spelling of water. ماي is also the month May, but a question that means the month matches nothing else.",
    example: "الماي عكرة",
  },
  {
    from: ["نضيف", "نضيفة", "نضيفين"],
    to: ["نظيف", "نظيفة"],
    reason: "Levantine ض for ظ: the same word as نظيف (clean), which the water and hand-hygiene documents use.",
    example: "ماي نضيفة",
  },
  {
    from: ["بغلي", "نغلي", "بنغلي", "بغليها", "نغليها", "بنغليها", "غليها", "غليه", "أغليها", "اغليه"],
    to: ["غلي", "اغل", "غليان"],
    reason: "Boil: prefixed or object-suffixed verb forms of الغلي / اغلِ / غليان in the water documents.",
    example: "كم بغلي الماي",
  },
  {
    from: ["عكرة", "عكر"],
    to: ["عكرا"],
    reason: "Cloudy water: the document has the accusative form عكرًا (إذا كان الماء عكرًا).",
    example: "الماي عكرة",
  },
  // --- People ---
  {
    from: ["بيبي", "بيبه", "بيبيه"],
    to: ["رضيع"],
    reason: "Baby. In the documents the baby is الرضيع, the child under the age of exclusive breastfeeding.",
    example: "البيبي ما بيرضع",
  },
  {
    from: ["ابني", "ابنتي", "بنتي", "ولدي", "ولد", "بنت", "ابنك", "ابنتك", "بنتك", "صغيري", "صغيرتي", "طفلي", "طفلتي"],
    to: ["طفل", "اطفال"],
    reason: "My son/daughter/child. The documents speak of الطفل and الأطفال; the possessive and dialect forms never meet them.",
    example: "ابني نحيف",
  },
  {
    from: ["اولادي", "عيالي", "اطفالي", "اولاد", "عيال", "ولادي", "صغاري"],
    to: ["اطفال", "طفل"],
    reason: "My children/kids: plural of the rule above.",
    example: "عيالي بيسهلوا",
  },
  {
    from: ["حامل", "حاملة", "حاملات", "حبلى"],
    to: ["حوامل"],
    reason: "Pregnant woman. The documents use the plural الحوامل only, so singular, feminine and plural forms must meet it.",
    example: "الحامل شو تاكل",
  },
  {
    from: ["مرضعة"],
    to: ["مرضعات", "مرضعين"],
    reason: "Singular nursing mother; the maternal-nutrition document says الحوامل والمرضعات.",
    example: "الحامل والمرضعة",
  },
  {
    from: ["مرضعات"],
    to: ["مرضعة"],
    reason: "Plural nursing mothers meets the singular المرضعة (wet nurse) in the formula guidance.",
    example: "المرضعات",
  },
  {
    from: ["ارضع", "بارضع", "نرضع", "بنرضع", "ترضع", "بترضع", "ارضعه", "ارضعها"],
    to: ["رضاعة", "ارضاع"],
    reason: "I/we breastfeed: verb forms of الرضاعة / الإرضاع, which carry the breastfeeding documents.",
    example: "كم شهر بنرضع",
  },
  {
    from: ["ايدي", "ايد", "ايدين", "ايديه", "ايديها", "ايديك", "ايدينا"],
    to: ["يدين"],
    reason: "Colloquial hands: the hand-hygiene document says اليدين / غسل اليدين.",
    example: "بغسل ايدي",
  },
  {
    from: ["صابونة"],
    to: ["صابون"],
    reason: "One bar of soap: the same noun as صابون in the hand-hygiene document.",
    example: "بالصابونة",
  },
  {
    from: ["ذراعه", "ذراعي", "ذراعها", "ذراعك"],
    to: ["ذراع"],
    reason: "Possessive forms of ذراع (arm); the MUAC document measures the upper arm.",
    example: "كيف بقيس ذراعه",
  },
  // --- Cooking and energy ---
  {
    from: ["جنريتر", "جنراتور", "جنريتور", "جنيراتور", "جنراتر", "مولد"],
    to: ["مولدات"],
    reason: "Generator. The carbon-monoxide document says المولدات; مولد is the singular of the same word.",
    example: "الجنريتر جوا الخيمة",
  },
  {
    from: ["حطب"],
    to: ["وقود"],
    reason: "Firewood is a solid fuel, the term the smoke document uses (الوقود الصلب); narrower to broader, same domain.",
    example: "دخان الحطب",
  },
  {
    from: ["كاز"],
    to: ["كيروسين"],
    reason: "Gaza colloquial كاز is kerosene, which the smoke document lists as a cooking fuel.",
    example: "الطبخ على الكاز",
  },
  // --- Illness (same condition only) ---
  {
    from: ["مسهول", "مسهولة", "سهال"],
    to: ["اسهال"],
    reason: "Colloquial for having diarrhoea (the same condition as الإسهال). مسهل alone is a laxative and is not mapped.",
    example: "الولد مسهول",
  },
  {
    from: ["سكر"],
    to: ["سكري"],
    whenAny: ["مريض", "مريضة", "مصاب", "مصابة", "انسولين", "دواء", "ادوية", "علاج"],
    reason: "مريض سكر is a diabetic. Alone, سكر is sugar and must keep meaning sugar, so it only expands next to an illness word.",
    example: "جدي مريض سكر",
  },
  // --- English ---
  {
    from: ["diarrhea", "the runs", "loose stool", "loose stools", "loose motions"],
    to: ["diarrhoea"],
    reason: "US spelling and the informal phrases for the same condition; the documents use the British spelling.",
    example: "my kid has the runs",
  },
  {
    from: ["kid", "kids"],
    to: ["child", "children"],
    reason: "Informal everyday word for a child; the documents say child and children.",
    example: "my kid is sick",
  },
  {
    from: ["baby", "babies"],
    to: ["infant", "infants"],
    reason: "The infant-feeding documents say infant; baby is the everyday word for the same age group.",
    example: "my baby wont feed",
  },
  {
    from: ["mum", "mom", "mommy", "mummy"],
    to: ["mother", "mothers"],
    reason: "Informal everyday word for mother; the documents say mother and mothers.",
    example: "mum has high blood pressure",
  },
  {
    from: ["boiled", "boils"],
    to: ["boil", "boiling"],
    reason: "Verb forms of boil; the documents say boil and boiling and there is no stemmer.",
    example: "should the water be boiled",
  },
  {
    from: ["generator"],
    to: ["generators"],
    reason: "Singular of generators, the only form in the carbon-monoxide document.",
    example: "a generator in the tent",
  },
  {
    from: ["chuck", "toss", "ditch", "dump", "trash"],
    to: ["discard", "throw"],
    reason: "Informal throw away; the food-safety document says discard and throw it out.",
    example: "should i chuck the chicken",
  },
  {
    from: ["spoiled", "spoilt", "rotten"],
    to: ["unsafe"],
    reason: "Spoiled food is unsafe food, the term of the when-in-doubt document.",
    example: "the rice is spoiled",
  },
  {
    from: ["refrigerator", "refrigerated"],
    to: ["fridge", "refrigerate"],
    reason: "Same appliance and action as the fridge / refrigerate of the food-temperature document.",
    example: "refrigerated food",
  },
  {
    from: ["pills", "meds", "tablets"],
    to: ["medicines", "medicine"],
    reason: "Everyday words for medicines in the hypertension and diabetes documents. No dose words are involved.",
    example: "ran out of pills",
  },
  {
    from: ["diabetic"],
    to: ["diabetes"],
    reason: "Adjective of the same condition: a diabetic person is a person with diabetes.",
    example: "my dad is diabetic",
  },
  {
    from: ["sanitiser"],
    to: ["sanitizer"],
    reason: "British spelling of the word used by the hand-hygiene document.",
    example: "hand sanitiser",
  },
];

// Letters and digits: matches the words of "boil, then drink", rejects punctuation.
// https://regex101.com/?regex=%5B%5Cp%7BL%7D%5Cp%7BN%7D%5D%2B&flags=gu
const WORD = /[\p{L}\p{N}]+/gu;

/** The form a word has in the index: normalised and without its Arabic article. */
const indexForm = (word: string): string => stripArabicArticle(normalizeArabic(word));

const wordsOf = (text: string): string[] => (normalizeArabic(text).match(WORD) ?? []).map(stripArabicArticle);

interface CompiledRule {
  readonly phrase: readonly string[];
  readonly to: readonly string[];
  readonly whenAny: ReadonlySet<string> | undefined;
}

/** Rules by their first word, longest phrase first, so "the runs" is tried before any single-word rule. */
const COMPILED: ReadonlyMap<string, readonly CompiledRule[]> = (() => {
  const byFirst = new Map<string, CompiledRule[]>();
  for (const rule of SYNONYM_RULES) {
    const to = [...new Set(rule.to.map(indexForm))];
    const whenAny = rule.whenAny ? new Set(rule.whenAny.map(indexForm)) : undefined;
    for (const from of rule.from) {
      const phrase = wordsOf(from);
      const list = byFirst.get(phrase[0]) ?? [];
      list.push({ phrase, to, whenAny });
      byFirst.set(phrase[0], list);
    }
  }
  for (const list of byFirst.values()) list.sort((a, b) => b.phrase.length - a.phrase.length);
  return byFirst;
})();

/**
 * Document words that stand for what the visitor typed, in order, without duplicates and without any word the
 * question already contains. Empty for a question that uses no colloquial word of the table.
 */
export function expandSynonyms(question: string): string[] {
  const words = wordsOf(question);
  const present = new Set(words);
  const expanded: string[] = [];
  for (let i = 0; i < words.length; i++) {
    for (const rule of COMPILED.get(words[i]) ?? []) {
      if (!rule.phrase.every((word, offset) => words[i + offset] === word)) continue;
      if (rule.whenAny && ![...rule.whenAny].some((word) => present.has(word))) continue;
      for (const word of rule.to) if (!present.has(word) && !expanded.includes(word)) expanded.push(word);
      break;
    }
  }
  return expanded;
}
