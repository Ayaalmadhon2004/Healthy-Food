import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CHUNK_OVERLAP_CHARS,
  MAX_CHUNK_CHARS,
  MAX_SUMMARY_CHARS,
  curatedToChunks,
  kitchenToChunks,
  recipeToChunks,
  splitText,
  tipToChunks,
  validateCuratedDocument,
} from "../lib/rag/chunking.ts";
import { sourceStem } from "../lib/rag/fusion.ts";
import { sentencesOf } from "../lib/rag/extractive.ts";

// Fixtures follow the shapes in prisma/seed.js.
const L = (en, ar) => ({ en, ar });
const grams = (n) => L(`${n}g`, `${n} غ`);

const FOUL = {
  id: 1,
  title: L("Foul Medames", "فول مدمس"),
  type: L("Breakfast", "فطور"),
  time: L("15 min", "15 دقيقة"),
  cal: L("320 cal", "320 سعرة"),
  nutrition: { protein: grams(17), carbs: grams(42), fat: grams(9), fiber: grams(14) },
  ingredients: {
    en: ["1 can or 1.5 cups cooked fava beans", "2 garlic cloves, crushed", "2 tbsp lemon juice", "1 tsp ground cumin"],
    ar: ["علبة أو كوب ونصف من الفول المطبوخ", "فصّان من الثوم المهروس", "ملعقتان كبيرتان من عصير الليمون", "ملعقة صغيرة من الكمّون المطحون"],
  },
  instructions: {
    en: ["Warm the fava beans in a small pot with a splash of their liquid for 5 minutes.", "Lightly mash about half of the beans with a fork, leaving the rest whole.", "Spoon into a bowl and serve with bread."],
    ar: ["سخّن الفول في قدر صغير مع قليل من مائه لمدة 5 دقائق.", "اهرس نصف الكمية تقريباً بشوكة واترك الباقي حبوباً كاملة.", "اسكب الفول في صحن وقدّمه مع الخبز."],
  },
};

const BURGHUL = {
  id: 12,
  title: L("Spicy Bulgur Pilaf", "برغل بالبندورة"),
  type: L("Lunch", "غداء"),
  time: L("35 min", "35 دقيقة"),
  cal: L("410 cal", "410 سعرة"),
  nutrition: { protein: grams(12), carbs: grams(70), fat: grams(8), fiber: grams(9) },
  ingredients: { en: ["1 cup bulgur", "1 onion"], ar: ["كوب برغل", "بصلة"] },
  instructions: {
    en: ["Sauté the onion in olive oil until golden.", "Add the hot water and salt, bring to a boil, then cover and cook on low for 15 minutes."],
    ar: ["قلّب البصل بزيت الزيتون حتى يحمرّ.", "أضف الماء الساخن والملح واتركه يغلي ثم غطِّه واطبخه على نار هادئة 15 دقيقة."],
  },
};

const TIP = {
  id: 3,
  header: L("Safe Drinking Water", "مياه الشرب الآمنة"),
  advice: L("Drink only water you know is clean.", "اشرب فقط الماء الذي تتأكد من نظافته."),
  details: L("Unsafe water is one of the main causes of diarrhea, especially in children.", "المياه غير الآمنة من أهم أسباب الإسهال، خاصة عند الأطفال."),
  moreDetails: L(
    "Use water from a trusted source and keep it in a clean, covered container. Never dip cups or hands into the container; pour from it instead.",
    "استخدم ماء من مصدر موثوق واحفظه في وعاء نظيف مغطى. لا تغمس الأكواب أو اليدين في الوعاء، بل اسكب منه.",
  ),
};

const KITCHEN = {
  id: 1,
  name: L("Al-Sadaqa Kitchen", "مطبخ الصداقة"),
  location: L("Al-Shuja'iyya, Gaza City", "الشجاعية، مدينة غزة"),
  region: L("Gaza", "غزة"),
  distributionTime: L("1:00 PM", "1:00 ظهراً"),
  capacity: L("350-500 families", "350-500 أسرة"),
  todaysMeal: L("Lentil soup + bread", "شوربة عدس + خبز"),
  accessInfo: L("Open to all families. Bring your own container.", "مفتوح لجميع العائلات. أحضروا وعاءكم الخاص."),
  contact: "+970-599-100101",
};

const DOC = {
  id: "ors-home-care",
  title: L("Oral rehydration", "الإماهة الفموية"),
  content: L("Give fluids often. Seek care if the child cannot drink.", "قدّم السوائل كثيراً. اطلب الرعاية إذا لم يستطع الطفل الشرب."),
  sourceName: "WHO",
  sourceUrl: "https://www.who.int/example",
  sourceDate: "2024-01-01",
};

const longText = (n) => Array.from({ length: n }, (_, i) => `Sentence number ${i + 1} talks about eating lentils and rice every day.`).join(" ");
const arabicLong = (n) => Array.from({ length: n }, (_, i) => `الجملة رقم ${i + 1} تتحدث عن تناول العدس والأرز كل يوم.`).join(" ");

function assertClean(chunks) {
  for (const c of chunks) {
    assert.ok(c.content.trim().length > 0, "empty content");
    assert.ok(c.title.length > 0, "empty title");
    assert.ok(!/undefined|null|NaN/.test(c.content), `bad text in ${c.sourceKey}: ${c.content}`);
    assert.ok(c.content.length <= MAX_CHUNK_CHARS, `${c.sourceKey} is ${c.content.length} chars`);
    assert.ok(c.content.startsWith(`${c.title}\n`), `${c.sourceKey} does not start with its title`);
  }
}

describe("splitText", () => {
  it("returns [] for empty or whitespace text", () => {
    assert.deepEqual(splitText(""), []);
    assert.deepEqual(splitText("  \n\t \r\n "), []);
  });

  it("keeps short text as one piece and normalises whitespace", () => {
    assert.deepEqual(splitText("  a   b\r\n\r\n\r\n\r\nc  "), ["a b\n\nc"]);
  });

  it("splits long text into pieces within the budget", () => {
    const pieces = splitText(longText(40));
    assert.ok(pieces.length > 1);
    for (const p of pieces) assert.ok(p.length <= MAX_CHUNK_CHARS, `piece of ${p.length}`);
  });

  it("splits long Arabic text within the budget", () => {
    const pieces = splitText(arabicLong(40));
    assert.ok(pieces.length > 1);
    for (const p of pieces) assert.ok(p.length <= MAX_CHUNK_CHARS);
  });

  it("overlaps consecutive pieces with the end of the previous one", () => {
    const pieces = splitText(longText(40));
    for (let i = 1; i < pieces.length; i++) {
      const prevTail = pieces[i - 1].split(/\s+/).slice(-3).join(" ");
      assert.ok(pieces[i].includes(prevTail), `piece ${i} lacks the overlap`);
    }
    assert.ok(CHUNK_OVERLAP_CHARS < MAX_CHUNK_CHARS);
  });

  it("hard-splits a single word longer than the limit", () => {
    const pieces = splitText("x".repeat(2500), 900);
    assert.ok(pieces.length >= 3);
    for (const p of pieces) assert.ok(p.length <= 900);
  });

  it("honours a custom max and is deterministic", () => {
    const a = splitText(longText(10), 200, 30);
    const b = splitText(longText(10), 200, 30);
    assert.deepEqual(a, b);
    for (const p of a) assert.ok(p.length <= 200);
  });
});

describe("recipeToChunks", () => {
  it("builds one chunk per language with the language as its own key segment", () => {
    const chunks = recipeToChunks(BURGHUL);
    assert.deepEqual(chunks.map((c) => c.sourceKey).sort(), ["recipe:12:ar", "recipe:12:en"]);
    assert.ok(chunks.every((c) => c.kind === "RECIPE"));
    assert.deepEqual(chunks.map((c) => c.lang).sort(), ["ar", "en"]);
  });

  it("ar and en twins share the same retrieval stem", () => {
    const [a, b] = recipeToChunks(BURGHUL);
    assert.equal(sourceStem(a.sourceKey), "recipe:12");
    assert.equal(sourceStem(a.sourceKey), sourceStem(b.sourceKey));
  });

  it("writes English facts one per line as natural sentences", () => {
    const en = recipeToChunks(FOUL).find((c) => c.lang === "en");
    assert.equal(
      en.content,
      [
        "Foul Medames",
        "Meal type: Breakfast, Preparation time: 15 min, Calories: 320 cal.",
        "Nutrition: protein 17g, carbs 42g, fat 9g, fiber 14g.",
        "Ingredients: 1 can or 1.5 cups cooked fava beans, 2 garlic cloves, crushed, 2 tbsp lemon juice, 1 tsp ground cumin.",
        "Step 1: Warm the fava beans in a small pot with a splash of their liquid for 5 minutes.",
        "Step 2: Lightly mash about half of the beans with a fork, leaving the rest whole.",
        "Step 3: Spoon into a bowl and serve with bread.",
      ].join("\n"),
    );
  });

  it("uses Arabic labels and the Arabic comma in the Arabic chunk", () => {
    const ar = recipeToChunks(FOUL).find((c) => c.lang === "ar");
    assert.ok(ar.content.startsWith("فول مدمس\n"));
    assert.ok(ar.content.includes("المكونات: علبة أو كوب ونصف من الفول المطبوخ، فصّان من الثوم المهروس"));
    assert.ok(ar.content.includes("الخطوة 1: سخّن الفول"));
    assert.ok(!/Ingredients|Step \d/.test(ar.content));
  });

  it("gives every step and the ingredient list its own sentence for extractive answers", () => {
    const en = recipeToChunks(FOUL).find((c) => c.lang === "en");
    const sentences = sentencesOf(en);
    assert.ok(sentences.some((s) => s.startsWith("Ingredients: ")));
    assert.equal(sentences.filter((s) => s.startsWith("Step ")).length, 3);
    assert.ok(sentences.every((s) => s.length <= 240 && !s.endsWith("…")));
    assert.ok(en.content.split("\n").every((l) => l.length < 240));
  });

  it("does not make one blob of the steps (no '1) ... 2) ...' run, no step line over the sentence cap)", () => {
    for (const c of recipeToChunks(FOUL)) {
      assert.ok(!/1\)/.test(c.content));
      assert.ok(c.content.split("\n").length >= 6);
    }
  });

  it("continues a very long ingredient list on further lines, each ending with a full stop", () => {
    const items = Array.from({ length: 30 }, (_, i) => `ingredient number ${i + 1} chopped`);
    // 30 items exceed one chunk, so the list is spread over several numbered chunks; look at all of them.
    const chunks = recipeToChunks({ ...BURGHUL, ingredients: { en: items, ar: items } }).filter((c) => c.lang === "en");
    assert.ok(chunks.length > 1);
    assertClean(chunks);
    const text = chunks.map((c) => c.content).join("\n");
    const lines = text.split("\n").filter((l) => /ingredient number/.test(l));
    assert.ok(lines.length > 1);
    for (const l of lines) {
      assert.ok(l.length <= 240, `line of ${l.length}`);
      assert.ok(l.endsWith("."));
      assert.ok(!/[,،]\.$/.test(l));
    }
    assert.ok(text.includes("ingredient number 30 chopped"));
  });

  it("skips a language whose title is missing and never prints 'undefined'", () => {
    const chunks = recipeToChunks({ id: 5, title: { en: "Only English", ar: "" }, ingredients: { en: ["rice"] } });
    assert.deepEqual(chunks.map((c) => c.sourceKey), ["recipe:5:en"]);
    assertClean(chunks);
  });

  it("handles missing optional fields without empty chunks or labels", () => {
    const chunks = recipeToChunks({ id: 6, title: L("Plain", "عادي") });
    assert.deepEqual(chunks, []); // a title alone has no body to embed
    const withType = recipeToChunks({ id: 6, title: L("Plain", "عادي"), type: L("Lunch", "غداء") });
    assert.equal(withType.length, 2);
    assertClean(withType);
    assert.ok(!withType[0].content.includes("Calories"));
  });

  it("tolerates junk JSON in nutrition and lists", () => {
    const chunks = recipeToChunks({
      id: 7,
      title: L("Junk", "خردة"),
      type: L("Lunch", "غداء"),
      nutrition: [1, 2],
      ingredients: "rice",
      instructions: { en: [1, null, "", "Boil the rice for ten minutes."], ar: [] },
    });
    assertClean(chunks);
    const en = chunks.find((c) => c.lang === "en");
    assert.ok(en.content.includes("Step 1: Boil the rice for ten minutes."));
  });

  it("splits an oversized recipe into numbered chunks that each repeat the title", () => {
    const steps = Array.from({ length: 25 }, (_, i) => `Stir the pot carefully and wait for step ${i + 1} to finish cooking.`);
    const chunks = recipeToChunks({ ...BURGHUL, instructions: { en: steps, ar: steps } });
    const en = chunks.filter((c) => c.lang === "en");
    assert.ok(en.length > 1);
    assert.deepEqual(en.map((c) => c.sourceKey), en.map((_, i) => `recipe:12:en:${i + 1}`));
    assertClean(chunks);
    assert.equal(new Set(en.map((c) => sourceStem(c.sourceKey))).size, en.length);
    assert.equal(sourceStem("recipe:12:ar:2"), "recipe:12:2");
  });

  it("is deterministic", () => {
    assert.deepEqual(recipeToChunks(FOUL), recipeToChunks(structuredClone(FOUL)));
  });
});

describe("tipToChunks", () => {
  it("builds tip:<id>:<lang> keys with a stable stem", () => {
    const chunks = tipToChunks(TIP);
    assert.deepEqual(chunks.map((c) => c.sourceKey).sort(), ["tip:3:ar", "tip:3:en"]);
    assert.equal(new Set(chunks.map((c) => sourceStem(c.sourceKey))).size, 1);
    assert.ok(chunks.every((c) => c.kind === "TIP"));
    assertClean(chunks);
  });

  it("puts the advice first and keeps both languages", () => {
    const [ar, en] = [tipToChunks(TIP).find((c) => c.lang === "ar"), tipToChunks(TIP).find((c) => c.lang === "en")];
    assert.ok(en.content.startsWith("Safe Drinking Water\nAdvice: Drink only water you know is clean."));
    assert.ok(en.content.includes("Never dip cups"));
    assert.ok(ar.content.startsWith("مياه الشرب الآمنة\nالنصيحة: اشرب فقط الماء"));
  });

  it("omits empty parts", () => {
    const chunks = tipToChunks({ id: 4, header: L("Handwashing", "غسل اليدين"), advice: L("Wash often.", ""), details: null });
    assert.deepEqual(chunks.map((c) => c.sourceKey), ["tip:4:en"]);
    assert.equal(chunks[0].content, "Handwashing\nAdvice: Wash often.");
  });

  it("returns nothing for a header-only tip and for a missing header", () => {
    assert.deepEqual(tipToChunks({ id: 8, header: L("Alone", "وحده") }), []);
    assert.deepEqual(tipToChunks({ id: 9, header: undefined, advice: L("a", "ب") }), []);
  });

  it("splits a long tip within the limit", () => {
    const chunks = tipToChunks({ ...TIP, moreDetails: L(longText(30), arabicLong(30)) });
    assert.ok(chunks.length > 2);
    assertClean(chunks);
    assert.ok(chunks.some((c) => c.sourceKey === "tip:3:ar:1") && chunks.some((c) => c.sourceKey === "tip:3:en:2"));
  });
});

describe("kitchenToChunks", () => {
  const [ar, en] = ["ar", "en"].map((l) => kitchenToChunks(KITCHEN).find((c) => c.lang === l));

  it("builds kitchen:<id>:<lang> keys with a stable stem", () => {
    assert.deepEqual(kitchenToChunks(KITCHEN).map((c) => c.sourceKey).sort(), ["kitchen:1:ar", "kitchen:1:en"]);
    assert.equal(sourceStem(ar.sourceKey), sourceStem(en.sourceKey));
    assertClean([ar, en]);
  });

  it("keeps stable facts and the contact phone", () => {
    assert.ok(en.content.includes("Al-Shuja'iyya, Gaza City"));
    assert.ok(en.content.includes("Region: Gaza"));
    assert.ok(en.content.includes("Distribution time: 1:00 PM."));
    assert.ok(en.content.includes("Open to all families."));
    assert.ok(en.content.includes("call +970-599-100101."));
    assert.ok(ar.content.includes("الشجاعية، مدينة غزة"));
    assert.ok(ar.content.includes("+970-599-100101"));
    assert.ok(ar.content.includes("مفتوح لجميع العائلات"));
  });

  it("does NOT embed today's meal or remaining capacity (they go stale)", () => {
    assert.ok(!/Lentil soup|350-500|Capacity|Today's meal/.test(en.content));
    assert.ok(!/شوربة عدس|350-500|الطاقة الاستيعابية|وجبة اليوم:/.test(ar.content));
  });

  it("sends people to the Kitchens page for today's menu and availability", () => {
    assert.ok(en.content.includes("Today's menu and remaining places are on the Kitchens page of the app"));
    assert.ok(ar.content.includes("صفحة المطابخ في التطبيق"));
    assert.ok(en.content.trim().endsWith("(Gaza Kitchen in the menu)."));
  });

  it("changing the daily fields does not change the chunk", () => {
    const changed = { ...KITCHEN, todaysMeal: L("Rice", "أرز"), capacity: L("10 families", "10 أسر") };
    assert.deepEqual(kitchenToChunks(changed), kitchenToChunks(KITCHEN));
  });

  it("works without optional fields or contact and never prints undefined/null", () => {
    const chunks = kitchenToChunks({ id: 2, name: L("Bare", "عارٍ"), contact: null });
    assert.equal(chunks.length, 2);
    assertClean(chunks);
    assert.ok(!chunks[0].content.includes("call"));
  });

  it("accepts plain-string localized fields and skips nameless rows", () => {
    const chunks = kitchenToChunks({ id: 3, name: "Same Name", location: "Rafah", contact: "  " });
    assertClean(chunks);
    assert.ok(chunks.every((c) => c.content.includes("Rafah")));
    assert.deepEqual(kitchenToChunks({ id: 4, name: null }), []);
  });

  it("falls back to the Arabic value when English is missing (pickText behaviour) without empty lines", () => {
    const chunks = kitchenToChunks({ id: 5, name: L("", "مطبخ الأمل"), location: L("", "جباليا") });
    assert.deepEqual(chunks.map((c) => c.lang), ["ar", "en"]);
    assertClean(chunks);
  });
});

describe("curatedToChunks", () => {
  it("builds doc:<id>:<lang> keys with source info on every chunk", () => {
    const chunks = curatedToChunks(DOC);
    assert.deepEqual(chunks.map((c) => c.sourceKey).sort(), ["doc:ors-home-care:ar", "doc:ors-home-care:en"]);
    for (const c of chunks) {
      assert.equal(c.kind, "DOCUMENT");
      assert.equal(c.sourceName, "WHO");
      assert.equal(c.sourceUrl, DOC.sourceUrl);
      assert.equal(c.sourceDate, "2024-01-01");
    }
    assert.equal(new Set(chunks.map((c) => sourceStem(c.sourceKey))).size, 1);
    assert.equal(sourceStem("doc:ors-home-care:ar"), "doc:ors-home-care");
    assertClean(chunks);
  });

  it("numbers split chunks doc:<id>:<lang>:<n> and repeats the title on each", () => {
    const chunks = curatedToChunks({ ...DOC, content: L(longText(40), arabicLong(40)) });
    const ar = chunks.filter((c) => c.lang === "ar");
    const en = chunks.filter((c) => c.lang === "en");
    assert.ok(ar.length > 1 && en.length > 1);
    assert.deepEqual(en.map((c) => c.sourceKey), en.map((_, i) => `doc:ors-home-care:en:${i + 1}`));
    assert.deepEqual(ar.map((c) => c.sourceKey)[0], "doc:ors-home-care:ar:1");
    assertClean(chunks);
    for (const c of ar) assert.ok(c.content.startsWith("الإماهة الفموية\n"));
    // numeric part is kept, the language is dropped from the stem
    assert.equal(sourceStem("doc:ors-home-care:ar:2"), sourceStem("doc:ors-home-care:en:2"));
    assert.equal(sourceStem("doc:ors-home-care:en:2"), "doc:ors-home-care:2");
  });

  it("leaves a very long title room for the body and still respects the limit", () => {
    const title = "T".repeat(500);
    const chunks = curatedToChunks({ ...DOC, title: L(title, title), content: L(longText(20), longText(20)) });
    assertClean(chunks);
  });

  it("is deterministic", () => {
    const big = { ...DOC, content: L(longText(40), arabicLong(40)) };
    assert.deepEqual(curatedToChunks(big), curatedToChunks(structuredClone(big)));
  });
});

describe("validateCuratedDocument", () => {
  it("accepts a valid document", () => {
    assert.deepEqual(validateCuratedDocument(DOC), []);
  });

  it("rejects non-objects", () => {
    assert.deepEqual(validateCuratedDocument(null, "x"), ["x: not an object"]);
    assert.deepEqual(validateCuratedDocument("text", "x"), ["x: not an object"]);
  });

  it("rejects bad ids", () => {
    for (const id of ["Bad Id", "UPPER", "-lead", "", undefined, 5, "a_b"]) {
      assert.ok(validateCuratedDocument({ ...DOC, id }).some((p) => p.includes("id must be a lowercase slug")), String(id));
    }
    assert.deepEqual(validateCuratedDocument({ ...DOC, id: "a1-b2" }), []);
  });

  it("requires both languages for title and content", () => {
    const problems = validateCuratedDocument({ ...DOC, title: { en: "x" }, content: { ar: "  ", en: "y" } });
    assert.ok(problems.includes("document: title.ar is missing"));
    assert.ok(problems.includes("document: content.ar is missing"));
    assert.equal(problems.length, 2);
    assert.ok(validateCuratedDocument({ ...DOC, title: undefined }).length >= 2);
  });

  it("requires source fields and an https url", () => {
    const problems = validateCuratedDocument({ id: "ok", title: DOC.title, content: DOC.content });
    assert.equal(problems.length, 3);
    assert.ok(validateCuratedDocument({ ...DOC, sourceUrl: "http://who.int" }).some((p) => p.includes("must be https")));
  });

  it("prefixes problems with the location", () => {
    assert.ok(validateCuratedDocument({}, "file.json[2]").every((p) => p.startsWith("file.json[2]: ")));
  });
});

describe("curated summary", () => {
  const SUMMARY = L("Give fluids often and seek care if the child cannot drink.", "قدّم السوائل كثيراً واطلب الرعاية إذا لم يستطع الطفل الشرب.");
  const withSummary = { ...DOC, summary: SUMMARY };

  it("is optional: a document without one chunks exactly as before", () => {
    assert.deepEqual(validateCuratedDocument(DOC), []);
    assert.equal(curatedToChunks(DOC).find((c) => c.lang === "en").content, "Oral rehydration\nGive fluids often. Seek care if the child cannot drink.");
  });

  it("goes on the line right after the title of the first chunk, so it is the first sentence", () => {
    for (const c of curatedToChunks(withSummary)) {
      const lines = c.content.split("\n");
      assert.equal(lines[0], c.title);
      assert.equal(lines[1], SUMMARY[c.lang]);
      assert.equal(sentencesOf(c)[0], SUMMARY[c.lang]);
    }
  });

  it("is only in the first chunk of a split document, and the body is not shortened", () => {
    const big = { ...withSummary, content: L(longText(40), arabicLong(40)) };
    const plain = curatedToChunks({ ...big, summary: undefined }).filter((c) => c.lang === "en");
    const chunks = curatedToChunks(big).filter((c) => c.lang === "en");
    assert.equal(chunks.length, plain.length, "the summary must not add chunks");
    assert.ok(chunks[0].content.includes(SUMMARY.en));
    for (const c of chunks.slice(1)) assert.ok(!c.content.includes(SUMMARY.en));
    assert.ok(chunks[0].content.length <= MAX_CHUNK_CHARS + MAX_SUMMARY_CHARS + 1);
    assert.equal(chunks[0].content, plain[0].content.replace(/^(.*)\n/, `$1\n${SUMMARY.en}\n`));
  });

  it("adds a full stop when the summary has none", () => {
    const c = curatedToChunks({ ...DOC, summary: L("Give fluids often to the child", "قدّم السوائل كثيراً للطفل المريض") }).find((x) => x.lang === "en");
    assert.equal(c.content.split("\n")[1], "Give fluids often to the child.");
  });

  it("is accepted when valid and rejected when missing a language, empty, too short, too long, several sentences or the wrong script", () => {
    assert.deepEqual(validateCuratedDocument(withSummary), []);
    const bad = (summary) => validateCuratedDocument({ ...DOC, summary }, "d");
    assert.ok(bad("text").some((p) => p.includes("summary must be an object")));
    assert.ok(bad(null).some((p) => p.includes("summary must be an object")));
    assert.ok(bad({ en: SUMMARY.en }).includes("d: summary.ar is missing"));
    assert.ok(bad({ ...SUMMARY, en: "   " }).includes("d: summary.en is missing"));
    assert.ok(bad({ ...SUMMARY, en: "Drink." }).some((p) => p.includes("shorter than")));
    assert.ok(bad({ ...SUMMARY, en: `${"Give fluids often. ".repeat(1)}${"x".repeat(MAX_SUMMARY_CHARS)}` }).some((p) => p.includes("longer than")));
    assert.deepEqual(bad({ ...SUMMARY, en: "A".repeat(MAX_SUMMARY_CHARS) }), []);
    assert.ok(bad({ ...SUMMARY, en: "Give fluids often. Then seek care if needed." }).some((p) => p.includes("must be one sentence")));
    assert.ok(bad({ ...SUMMARY, ar: "قدّم السوائل كثيراً.\nواطلب الرعاية إذا لزم الأمر." }).some((p) => p.includes("must be one sentence")));
    assert.ok(bad({ ...SUMMARY, ar: "Give fluids often to the child" }).some((p) => p.includes("written in Arabic")));
    assert.ok(bad({ ...SUMMARY, en: "قدّم السوائل كثيراً للطفل المريض" }).some((p) => p.includes("written in English")));
  });

  it("does not split a decimal number into two sentences", () => {
    assert.deepEqual(validateCuratedDocument({ ...DOC, summary: L("A MUAC below 12.5 cm needs a clinic visit.", "قياس أقل من 12.5 سم يستدعي زيارة العيادة.") }), []);
  });
});

describe("realistic batch", () => {
  const batch = [
    ...[FOUL, BURGHUL].flatMap(recipeToChunks),
    ...tipToChunks(TIP),
    ...kitchenToChunks(KITCHEN),
    ...kitchenToChunks({ ...KITCHEN, id: 2, name: L("Al-Rahma", "الرحمة") }),
    ...curatedToChunks(DOC),
    ...curatedToChunks({ ...DOC, id: "long-doc", content: L(longText(40), arabicLong(40)) }),
  ];

  it("has no duplicated sourceKeys", () => {
    const keys = batch.map((c) => c.sourceKey);
    assert.equal(new Set(keys).size, keys.length);
  });

  it("has well-formed keys: <prefix>:<id>:<lang>[:n]", () => {
    for (const c of batch) assert.match(c.sourceKey, /^(recipe|tip|kitchen|doc):[a-z0-9-]+:(ar|en)(:\d+)?$/);
  });

  it("covers Arabic and English for every document", () => {
    // ar and en texts differ in length, so a long document may split into a different number of parts per
    // language; compare the document (stem without the part number), not each part.
    const stems = new Map();
    for (const c of batch) {
      const stem = sourceStem(c.sourceKey.replace(/:\d+$/, "")); // drop the part number first, then the language
      stems.set(stem, (stems.get(stem) ?? new Set()).add(c.lang));
    }
    for (const [stem, langs] of stems) assert.deepEqual([...langs].sort(), ["ar", "en"], stem);
  });

  it("all chunks are clean and within the limit", () => {
    assertClean(batch);
  });
});
