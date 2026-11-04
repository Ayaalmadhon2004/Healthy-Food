// Safety triage that runs BEFORE any retrieval or model call. Pure and deterministic.
// Bias: a missed emergency is worse than a false alarm, but anything unclear is "ok" (the model + prompt handle it).
import type { Lang } from "@/lib/types";

export type TriageResult = "emergency" | "out_of_scope" | "ok";

const ARABIC_INDIC_ZERO = 0x0660;

/** Lowercase, strip Arabic diacritics/tatweel, unify alef/ya/ta-marbuta/hamza forms and digits, collapse whitespace. */
export function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    // diacritics and tatweel: "مَرْحَبًا" -> "مرحبا"; keeps "مرحبا"
    // https://regex101.com/?regex=%5B%5Cu064B-%5Cu065F%5Cu0670%5Cu0640%5D
    .replace(/[ً-ٰٟـ]/g, "")
    // alef variants: "أكل" -> "اكل"; keeps "اكل"
    // https://regex101.com/?regex=%5B%D8%A3%D8%A5%D8%A2%D9%B1%5D
    .replace(/[أإآٱ]/g, "ا")
    // alef maqsura: "على" -> "علي"; keeps "علي"
    // https://regex101.com/?regex=%D9%89
    .replace(/ى/g, "ي")
    // ta marbuta: "حامة" -> "حامه"; keeps "حامه"
    // https://regex101.com/?regex=%D8%A9
    .replace(/ة/g, "ه")
    // hamza on waw: "مؤلم" -> "مولم"; keeps "مولم"
    // https://regex101.com/?regex=%D8%A4
    .replace(/ؤ/g, "و")
    // hamza on ya: "رئيس" -> "رييس"; keeps "رييس"
    // https://regex101.com/?regex=%D8%A6
    .replace(/ئ/g, "ي")
    // Arabic-Indic digits: "٣" -> "3"; keeps "3"
    // https://regex101.com/?regex=%5B%5Cu0660-%5Cu0669%5D&flags=g
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - ARABIC_INDIC_ZERO))
    // curly apostrophes: "don’t" -> "don't"; keeps "don't"
    // https://regex101.com/?regex=%5B%E2%80%99%27%60%C2%B4%5D&flags=g
    .replace(/[’'`´]/g, "'")
    // anything but letters, digits, apostrophes: "fever!!" -> "fever "; keeps "fever "
    // https://regex101.com/?regex=%5B%5E%5Cp%7BL%7D%5Cp%7BN%7D%27%20%5D%2B&flags=gu
    .replace(/[^\p{L}\p{N}' ]+/gu, " ")
    // runs of whitespace: "a   b" -> "a b"; keeps "a b"
    // https://regex101.com/?regex=%5Cs%2B&flags=g
    .replace(/\s+/g, " ")
    .trim();
}

// Any Arabic-script letter: matches "اكل", rejects "food".
// https://regex101.com/?regex=%5B%5Cu0600-%5Cu06FF%5D
const ARABIC = /[؀-ۿ]/;
// Regex metacharacters: matches the "+" in rejects "abc".
// https://regex101.com/?regex=%5B.*%2B%3F%5E%24%7B%7D()%7C%5B%5C%5D%5C%5C%5D&flags=g
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A phrase matches at a word start in the normalized text (suffixes allowed), so "سم" no longer fires inside "اسم" or "جسم". */
function compile(phrases: readonly string[]): RegExp {
  const parts = phrases.map((p) => {
    const n = normalizeText(p);
    // Latin phrases: lookbehind rejects a match inside a word ("code" in "decode"), allows suffixes ("program" in "programming").
    // Arabic phrases: same idea, but a leading و/ف and the article (ال, بال, كال, لل) may precede ("السم", "بالانتخابات"), but a bare ب is not allowed so "بسم الله" stays quiet.
    return ARABIC.test(n) ? `(?<![\\u0621-\\u064A])(?:[وف])?(?:[بلك]?ال|لل)?${escapeRegex(n)}` : `(?<![a-z0-9])${escapeRegex(n)}`;
  });
  return new RegExp(parts.join("|"));
}

/** Every group in `all` must match (a phrase from each), for symptoms that are only urgent in combination. */
interface Rule {
  all: RegExp[];
}
const single = (phrases: readonly string[]): Rule => ({ all: [compile(phrases)] });
const combo = (...groups: (readonly string[])[]): Rule => ({ all: groups.map(compile) });

const EMERGENCY_RULES: Rule[] = [
  // Not drinking / feeding, lethargy, unresponsive (infants and children)
  single([
    "not drinking", "won't drink", "wont drink", "refuses to drink", "refusing to drink", "refuses to feed",
    "not breastfeeding", "won't breastfeed", "refuses the breast", "refuses to eat or drink", "not feeding at all",
    "very lethargic", "extremely lethargic", "too weak to", "limp", "floppy", "unresponsive", "not responding", "won't wake", "cannot wake", "can't wake",
    "لا يشرب", "لا تشرب", "مش عم يشرب", "مش عم تشرب", "ما بيشرب", "ما بتشرب", "مش راضي يشرب", "ما بيرضع", "ما بترضع", "مش عم يرضع", "مش عم ترضع", "يرفض الشرب", "ترفض الشرب", "رفض الشرب", "لا يرضع", "لا ترضع", "يرفض الرضاعه", "ترفض الرضاعه", "يرفض الرضاعة",
    "خامل جدا", "خمول شديد", "خامله جدا", "لا يستجيب", "لا تستجيب", "مرتخي", "مرتخيه", "لا يستيقظ", "لا تستيقظ",
  ]),
  // Loss of consciousness, seizures
  single([
    "unconscious", "lost consciousness", "loss of consciousness", "passed out", "seizure", "convulsion", "convulsing",
    "فاقد الوعي", "فاقده الوعي", "فقد الوعي", "فقدان الوعي", "اغماء", "اغمي عليه", "اغمي عليها", "تشنج", "تشنجات", "نوبه صرع", "نوبة صرع", "صرع",
  ]),
  // Severe dehydration signs
  single([
    "severe dehydration", "severely dehydrated", "sunken eyes", "sunken fontanelle", "no urine", "hasn't urinated", "has not urinated", "not urinated", "no wet diaper", "no tears when crying",
    "جفاف شديد", "جفاف حاد", "عيون غائره", "عيون غايره", "لا يتبول", "لا تتبول", "لم يتبول", "لم تتبول", "لا دموع",
  ]),
  // Bloody diarrhea / blood in stool with fever or in a child
  combo(
    ["bloody diarrhea", "bloody diarrhoea", "blood in stool", "blood in the stool", "bloody stool", "blood in poop", "اسهال دموي", "اسهال مدمم", "دم في البراز", "دم بالبراز", "براز دموي", "دم في الخروج"],
    ["fever", "temperature", "child", "baby", "infant", "toddler", "kid", "son", "daughter", "حمى", "حراره", "سخونه", "طفل", "طفلي", "طفلتي", "رضيع", "ابني", "بنتي", "ابنتي", "ولدي", "صغير", "صغيري", "ولد", "بنت"],
  ),
  // Severe malnutrition signs
  single([
    "severe malnutrition", "severely malnourished", "severe acute malnutrition", "swollen feet and face from hunger", "kwashiorkor", "marasmus",
    "سوء تغذيه شديد", "سوء تغذية شديد", "سوء تغذيه حاد", "سوء تغذية حاد", "هزال شديد", "كواشيوركور",
  ]),
  // Bleeding in pregnancy
  combo(
    ["pregnant", "pregnancy", "حامل", "حمل", "الحمل"],
    ["bleeding", "bleed", "hemorrhage", "haemorrhage", "نزيف", "نزف", "ينزف", "تنزف", "نزول دم"],
  ),
  // Chest pain, breathing, choking, allergic reactions
  single([
    "chest pain", "pain in my chest", "pain in the chest", "heart attack", "can't breathe", "cant breathe", "cannot breathe", "difficulty breathing", "trouble breathing", "not breathing", "stopped breathing", "blue lips",
    "choking", "choked", "is choking", "anaphylaxis", "throat swelling", "throat is swelling", "swollen throat",
    "الم في الصدر", "ألم في الصدر", "الم بالصدر", "وجع في الصدر", "ضيق في التنفس", "ضيق تنفس", "لا يتنفس", "لا تتنفس", "مش عم يتنفس", "مش عم تتنفس", "ما بيتنفس", "ما بتتنفس", "مش قادر يتنفس", "مش قادره تتنفس", "مش بيتنفس", "لا استطيع التنفس", "صعوبه في التنفس", "صعوبة في التنفس",
    "اختناق", "يختنق", "تختنق", "اختنق", "علق في حلقه", "حساسيه شديده", "تورم الحلق", "انتفاخ الحلق",
  ]),
  // Poisoning / overdose / swallowed harmful substance
  single([
    "poison", "swallowed bleach", "drank bleach", "swallowed detergent", "swallowed pills", "overdose", "swallowed chemicals", "drank gasoline", "drank petrol", "drank kerosene",
    "تسمم", "شرب سم", "شرب السم", "بلع سم", "بلع السم", "ابتلع سم", "شرب كلور", "شرب منظف", "بلع حبوب", "جرعه زائده", "جرعة زائدة", "شرب بنزين", "شرب كاز", "بلع مادة",
  ]),
  // Self-harm
  single([
    "suicid", "kill myself", "end my life", "want to die", "wanna die", "better off dead", "hurt myself", "harm myself",
    "انتحار", "انتحر", "اقتل نفسي", "اريد ان اموت", "ابي اموت", "اريد الموت", "انهي حياتي", "انهاء حياتي", "ايذاء نفسي", "اؤذي نفسي",
  ]),
];

const INJECTION = compile([
  "ignore previous instructions", "ignore all previous", "ignore the previous", "ignore your instructions", "ignore the above", "ignore everything above",
  "disregard previous", "disregard the previous", "disregard your instructions", "disregard all instructions", "forget your instructions", "forget previous instructions", "forget all previous",
  "system prompt", "system message", "your instructions", "your prompt", "reveal your prompt", "developer mode", "jailbreak", "do anything now", "you are now", "pretend to be", "pretend you are", "new instructions",
  "تجاهل التعليمات", "تجاهل كل التعليمات", "تجاهل جميع التعليمات", "تجاهل ما سبق", "تجاهل كل ما سبق", "تجاهل الاوامر", "انس التعليمات", "انس كل ما سبق",
  "تعليمات النظام", "رسالة النظام", "موجه النظام", "تعليماتك", "اظهر تعليماتك", "اكشف تعليماتك", "وضع المطور", "تصرف كانك", "تظاهر بانك", "انت الان",
]);

/** Clearly unrelated topics. Only counts when no food/health word is present (see FOOD_HINT). */
const OFF_TOPIC = compile([
  "python", "javascript", "typescript", "java ", "html", "css", "sql", "programming", "source code", "write code", "write a program", "algorithm", "compile", "debug", "github", "linux", "software",
  "politic", "election", "president", "prime minister", "parliament", "government", "who will win the war", "military", "weapon",
  "bitcoin", "crypto", "stock market", "forex", "invest", "lottery", "gambling", "betting",
  "football score", "world cup", "premier league", "movie", "netflix", "song lyrics", "lyrics", "video game", "poem", "joke", "horoscope",
  "homework", "essay", "translate", "write me a story", "stock price",
  "برمجه", "برمجة", "كود", "اكتب برنامج", "خوارزميه", "خوارزمية", "بايثون", "جافا سكريبت", "لينكس",
  "سياسه", "سياسة", "انتخابات", "رئيس الوزراء", "الرئيس", "حكومه", "حكومة", "حزب", "سلاح", "اسلحه",
  "بيتكوين", "عملات رقميه", "عملات رقمية", "اسهم", "بورصه", "بورصة", "مراهنات", "يانصيب",
  "نتيجه مباراه", "نتيجة مباراة", "كاس العالم", "فيلم", "اغنيه", "اغنية", "لعبه فيديو", "قصيده", "قصيدة", "نكته", "نكتة", "حل الواجب", "واجب مدرسي", "ترجم",
]);

/** Words that tie a question to food, nutrition, water or health; any hit blocks the plain off-topic verdict. */
const FOOD_HINT = compile([
  "eat", "food", "meal", "recipe", "cook", "bake", "boil", "water", "drink", "hydrat", "nutrition", "nutrient", "vitamin", "mineral", "protein", "calorie", "carb", "fat", "fiber", "fibre", "diet",
  "breakfast", "lunch", "dinner", "snack", "hungry", "hunger", "feeding", "breastfe", "formula", "baby", "infant", "child", "pregnan", "diabet", "anemi", "anaemi", "iron", "calcium",
  "flour", "bread", "rice", "lentil", "bean", "chickpea", "wheat", "sugar", "salt", "oil", "milk", "egg", "meat", "chicken", "fish", "vegetable", "fruit", "dates", "tomato", "potato", "onion", "herb", "spice", "canned",
  "kitchen", "ingredient", "health", "sick", "ill", "diarrh", "vomit", "fever", "weight", "malnutrition", "clean water", "purify",
  "اكل", "طعام", "وجبه", "وصفه", "طبخ", "خبز", "ماء", "مياه", "شرب", "تغذيه", "فيتامين", "بروتين", "سعرات", "الياف", "حميه", "فطور", "غداء", "عشاء", "جوع", "جائع", "رضاعه", "حليب", "رضيع", "طفل", "حامل", "سكري", "فقر الدم", "حديد", "كالسيوم",
  "طحين", "رز", "ارز", "عدس", "فول", "حمص", "قمح", "سكر", "ملح", "زيت", "بيض", "لحم", "دجاج", "سمك", "خضار", "فاكهه", "تمر", "طماطم", "بطاطا", "بصل", "اعشاب", "بهارات", "معلبات",
  "مطبخ", "مكونات", "صحه", "صحي", "مريض", "اسهال", "تقيؤ", "قيء", "حراره", "وزن", "سوء تغذيه", "تعقيم", "تنقيه",
]);

/**
 * Decide how to handle a question before touching retrieval or the model.
 * `lang` is accepted for symmetry with the other helpers; both languages are always checked because users mix them.
 */
export function triage(question: string, _lang?: Lang): TriageResult {
  void _lang;
  const text = normalizeText(question);
  if (!text) return "ok";

  if (EMERGENCY_RULES.some((rule) => rule.all.every((re) => re.test(text)))) return "emergency";
  if (INJECTION.test(text)) return "out_of_scope";
  if (OFF_TOPIC.test(text) && !FOOD_HINT.test(text)) return "out_of_scope";
  return "ok";
}
