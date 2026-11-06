import test from "node:test";
import assert from "node:assert/strict";
import "./helpers/register.mjs";

const { SYNONYM_RULES, expandSynonyms } = await import("../lib/rag/synonyms.ts");
const { normalizeArabic, stripArabicArticle } = await import("../lib/rag/normalize.ts");
const { buildMemoryIndex, searchMemoryIndex, queryTerms, SYNONYM_WEIGHT } = await import("../lib/rag/memoryIndex.ts");

const form = (w) => stripArabicArticle(normalizeArabic(w));

test("every rule has a reason, an example and at least one source and target word", () => {
  for (const rule of SYNONYM_RULES) {
    const label = rule.from.join("/");
    assert.ok(rule.reason.length >= 25, `${label}: reason`);
    assert.ok(rule.from.length > 0 && rule.to.length > 0, `${label}: words`);
    assert.ok(rule.example.trim().length > 0, `${label}: example`);
  }
});

test("every rule's example expands to every one of its target words", () => {
  for (const rule of SYNONYM_RULES) {
    const expanded = expandSynonyms(rule.example);
    for (const target of rule.to) {
      // A target the example already contains is not repeated, which is also fine.
      const typed = normalizeArabic(rule.example);
      assert.ok(expanded.includes(form(target)) || typed.includes(form(target)), `${rule.from.join("/")} -> ${target} (example "${rule.example}" gave ${expanded.join(",")})`);
    }
  }
});

test("every source word of every rule expands, alone (or after its condition), to the targets", () => {
  for (const rule of SYNONYM_RULES) {
    for (const from of rule.from) {
      const text = rule.whenAny ? `${from} ${rule.whenAny[0]}` : from;
      const expanded = expandSynonyms(text);
      for (const target of rule.to) {
        if (form(target) === form(from) || normalizeArabic(text).includes(form(target))) continue;
        assert.ok(expanded.includes(form(target)), `${from} -> ${target}`);
      }
    }
  }
});

test("no rule maps a word to itself", () => {
  for (const rule of SYNONYM_RULES) {
    const targets = new Set(rule.to.map(form));
    for (const from of rule.from) assert.ok(!targets.has(form(from)), `${from} maps to itself`);
  }
});

test("colloquial food, water and family words reach the words of the documents", () => {
  assert.deepEqual(expandSynonyms("الأكل المبرّد تعفّن، أرميه؟").sort(), ["براد", "تبريد", "تلف", "تالفه", "تخلص", "تتخلص"].sort());
  assert.ok(expandSynonyms("الماي عكرة").includes("ماء"));
  assert.ok(expandSynonyms("ابني عنده سخونة").includes("طفل"));
  assert.ok(expandSynonyms("البيبي ما بياكل").includes("رضيع"));
  assert.ok(expandSynonyms("اللحمة ضلت بدون كهربا").includes("كهرباء"));
});

test("plural and gender variants meet the form the documents use", () => {
  for (const q of ["الحامل", "حاملة", "حاملات", "حبلى"]) assert.deepEqual(expandSynonyms(q), ["حوامل"], q);
  assert.deepEqual(expandSynonyms("الحوامل"), []);
  assert.ok(expandSynonyms("المرضعة").includes("مرضعات"));
  assert.ok(expandSynonyms("المرضعات").includes("مرضعه"));
});

test("سكر alone stays sugar; next to an illness word it also means diabetes", () => {
  assert.deepEqual(expandSynonyms("هل السكر مضر"), []);
  assert.deepEqual(expandSynonyms("كم ملعقة سكر في الشاي"), []);
  assert.deepEqual(expandSynonyms("جدي مريض سكر"), ["سكري"]);
  assert.deepEqual(expandSynonyms("دواء السكر"), ["سكري"]);
});

test("words that would change the medical meaning are deliberately not mapped", () => {
  // Cramps are not diarrhoea, thin is not malnutrition, مسهل is a laxative, ضو/قطع have other meanings.
  for (const q of ["ابنتي عندها مغص", "بطنه بتوجعه", "الولد نحيف وضعيف", "مسهل للأطفال", "ضو", "قطع اللحم", "my kid is skinny", "tummy ache", "vomiting"]) {
    const expanded = expandSynonyms(q);
    for (const forbidden of ["اسهال", "diarrhoea", "تغذيه", "malnutrition", "malnourished", "مرض"]) assert.ok(!expanded.includes(forbidden), `${q} -> ${forbidden}`);
  }
  assert.deepEqual(expandSynonyms("مغص"), []);
  assert.deepEqual(expandSynonyms("بطنه بتوجعه"), []);
  assert.deepEqual(expandSynonyms("نحيف"), []);
});

test("a bare leading ب is not stripped, so بيض (egg) is not read as a colloquial verb", () => {
  assert.deepEqual(expandSynonyms("بيض مسلوق"), []);
  assert.deepEqual(expandSynonyms("boil the water"), []);
});

test("English variants map to the documents' spelling and phrases are matched whole", () => {
  assert.deepEqual(expandSynonyms("diarrhea"), ["diarrhoea"]);
  assert.deepEqual(expandSynonyms("my kid has the runs"), ["child", "children", "diarrhoea"]);
  assert.deepEqual(expandSynonyms("she runs every day"), []);
  assert.ok(expandSynonyms("should I chuck the chicken").includes("discard"));
  assert.deepEqual(expandSynonyms("the runs and diarrhea"), ["diarrhoea"]);
});

test("a word the question already contains is not added again", () => {
  assert.deepEqual(expandSynonyms("الماء والماي"), ["مياه"]);
});

// --- scoring: synonyms count, but less than typed words, and never create a match for an unrelated word ---
const row = (id, title, content, lang = "ar") => ({ id, sourceKey: `doc:d${id}:${lang}`, kind: "DOCUMENT", lang, title, content, sourceName: null, sourceUrl: null, sourceDate: null });
const index = buildMemoryIndex([
  row(1, "متى تتخلص من الطعام", "الطعام التالف يسبب المرض. عند الشك تخلص منه إذا انقطعت الكهرباء عن البراد."),
  row(2, "غسل اليدين", "اغسل اليدين بالصابون والماء النظيف قبل الأكل."),
  row(3, "مولد الكهرباء", "لا تشغل المولدات داخل الخيمة."),
]);

test("query terms: typed words weigh 1 and synonyms SYNONYM_WEIGHT, without duplicates", () => {
  assert.ok(SYNONYM_WEIGHT > 0 && SYNONYM_WEIGHT < 1);
  const terms = queryTerms("الأكل المبرد تعفن");
  assert.deepEqual(terms.filter((t) => t.weight === 1).map((t) => t.term), ["اكل", "مبرد", "تعفن"]);
  assert.ok(terms.some((t) => t.term === "تلف" && t.weight === SYNONYM_WEIGHT));
  assert.equal(new Set(terms.map((t) => t.term)).size, terms.length);
});

test("a colloquial question finds the document through the table, with a lower score than the typed word would give", () => {
  const colloquial = searchMemoryIndex(index, "الطعام تعفن", { lang: "ar", minScore: 0, topK: 3 });
  assert.equal(colloquial[0].id, 1);
  const standard = searchMemoryIndex(index, "الطعام تلف", { lang: "ar", minScore: 0, topK: 3 });
  assert.equal(standard[0].id, 1);
  assert.ok(colloquial[0].score < standard[0].score);
});

test("a synonym never creates a match for a word that means something else", () => {
  // سكر (sugar) must not pull the diabetes word in; ماي (month) matches nothing about food.
  const diabetesIndex = buildMemoryIndex([row(1, "السكري", "المصاب بالسكري يحتاج إلى الإنسولين.")]);
  const sugar = searchMemoryIndex(diabetesIndex, "ملعقة سكر في الشاي", { lang: "ar", minScore: 0 });
  assert.ok(sugar.length === 0 || sugar[0].score < 0.2);
  assert.deepEqual(queryTerms("ملعقة سكر في الشاي").map((t) => t.term).filter((t) => t === "سكري"), []);
});
