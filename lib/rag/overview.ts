// A general request such as "give me nutrition tips for people in Gaza" names no topic, so searching for it finds
// little. Instead the assistant asks the knowledge base about a fixed set of core topics and shows the best passage of
// each, so the overview is still made only of sourced text.
import { stripArabicArticle } from "@/lib/rag/normalize";
import { normalizeText } from "@/lib/rag/safety";
import type { Lang } from "@/lib/types";

/**
 * One query per core topic, in each language (the two lists are parallel: same topic at the same index). The best passage
 * for each becomes one point of the overview. chat.ts keeps the first OVERVIEW_MAX_POINTS topics that found a passage, so
 * the ORDER is the priority: the last topics only appear when an earlier one found nothing.
 */
export const OVERVIEW_TOPICS: Record<Lang, readonly string[]> = {
  en: [
    "making drinking water safe by boiling",
    "child diarrhoea oral rehydration fluids",
    "breastfeeding and feeding babies in emergencies",
    "preparing infant formula safely, fresh feeds and throwing away leftovers",
    "feeding babies from 6 months, how often and what texture",
    "keeping food safe without a fridge and storing rice and flour",
    "signs of acute malnutrition in children",
    "healthy eating during pregnancy and breastfeeding",
    "diabetes, insulin storage and high blood pressure",
    "washing hands with soap",
    "dietary variety with limited food",
  ],
  ar: [
    "جعل ماء الشرب آمنا بالغلي",
    "إسهال الأطفال والسوائل ومحلول الإماهة الفموي",
    "الرضاعة الطبيعية وتغذية الرضع في الطوارئ",
    "تحضير حليب الأطفال الصناعي بأمان ورمي ما يتبقى من الرضعة",
    "تغذية الرضيع من عمر ستة أشهر وعدد الوجبات والقوام",
    "حفظ الطعام بأمان بدون ثلاجة وتخزين الأرز والدقيق",
    "علامات سوء التغذية الحاد عند الأطفال",
    "الغذاء الصحي أثناء الحمل والرضاعة",
    "السكري وحفظ الإنسولين وارتفاع ضغط الدم",
    "غسل اليدين بالصابون",
    "تنويع الغذاء عند قلة الطعام",
  ],
};

/** How many of the topics may contribute a point (nine short single-sentence points; the topics after them are fallbacks). */
export const OVERVIEW_MAX_POINTS = 9;
const MAX_REQUEST_WORDS = 12;

// Words (as normalizeText writes them) that ask for general guidance.
const ADVICE_WORDS = new Set([
  "tips", "tip", "advice", "guidance", "recommendations", "guidelines", "overview", "basics", "summary", "essentials",
  "نصائح", "نصيحه", "نصايح", "ارشادات", "توصيات", "اساسيات", "ملخص", "معلومات",
]);
// Words that name a specific topic. A request that has one is an ordinary question ("tips for boiling water").
const SPECIFIC_WORDS = new Set([
  "water", "boil", "boiling", "diarrhoea", "diarrhea", "baby", "babies", "infant", "child", "children", "toddler", "breastfeeding", "formula",
  "diabetes", "diabetic", "pressure", "complementary", "weaning", "solids", "flour", "rice", "hypertension", "pregnant", "pregnancy", "cooking", "fuel", "smoke", "fridge", "storage", "storing",
  "hands", "handwashing", "malnutrition", "vitamin", "salt", "sugar", "insulin", "protein", "weight",
  "ماء", "مياه", "غلي", "اسهال", "طفل", "اطفال", "رضيع", "رضاعه", "حليب", "سكري", "ضغط", "حامل", "حمل", "طبخ", "وقود", "دخان", "ثلاجه", "تخزين",
  "يدين", "غسل", "سوء", "فيتامين", "ملح", "سكر", "انسولين", "بروتين", "وزن",
]);

/** True for a short request for general guidance that names no specific topic. */
export function isOverviewRequest(question: string): boolean {
  // The article is stripped so "الإسهال" matches "اسهال", as in search.
  const words = normalizeText(question).split(" ").filter(Boolean).map(stripArabicArticle);
  if (words.length === 0 || words.length > MAX_REQUEST_WORDS) return false;
  if (words.some((w) => SPECIFIC_WORDS.has(w))) return false;
  return words.some((w) => ADVICE_WORDS.has(w));
}
