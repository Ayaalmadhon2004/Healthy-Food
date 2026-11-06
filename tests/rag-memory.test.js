import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./helpers/register.mjs";

const { hashEmbed, dot } = await import("../lib/rag/ngram.ts");
const { buildMemoryIndex, searchMemoryIndex, relevanceOf } = await import("../lib/rag/memoryIndex.ts");
const { curatedChunks } = await import("../lib/rag/sources.ts");
const { retrieverMode } = await import("../lib/rag/mode.ts");
const { EMBEDDING_DIM, MIN_RELEVANCE } = await import("../lib/rag/constants.ts");

test("retriever mode is the free in-memory one unless pgvector is asked for", () => {
  assert.equal(retrieverMode({}), "memory");
  assert.equal(retrieverMode({ RAG_RETRIEVER: "nonsense" }), "memory");
  assert.equal(retrieverMode({ RAG_RETRIEVER: " PgVector " }), "pgvector");
});

test("hashEmbed is deterministic, unit length and fits the vector column", () => {
  const a = hashEmbed("Boil the water before drinking it");
  assert.equal(a.length, EMBEDDING_DIM);
  assert.deepEqual(a, hashEmbed("Boil the water before drinking it"));
  assert.ok(Math.abs(Math.sqrt(a.reduce((s, x) => s + x * x, 0)) - 1) < 1e-9);
  assert.ok(hashEmbed("").every((x) => x === 0));
});

test("hashEmbed is closer for shared spelling than for unrelated text, and forgives Arabic prefixes", () => {
  const water = hashEmbed("اغلِ الماء قبل شربه");
  assert.ok(dot(water, hashEmbed("الماء المغلي")) > dot(water, hashEmbed("بطاطا مقلية بالزيت")));
  assert.ok(dot(hashEmbed("المجدّرة"), hashEmbed("مجدرة")) > 0.5);
  assert.ok(dot(hashEmbed("boiling water"), hashEmbed("boil the water")) > dot(hashEmbed("boiling water"), hashEmbed("insulin storage")));
});

test("relevanceOf is monotone, bounded, and rewards agreement of both signals", () => {
  assert.equal(relevanceOf(0, 0), 0);
  assert.ok(relevanceOf(10, 0.4) <= 1);
  assert.ok(relevanceOf(3, 0.1) < relevanceOf(6, 0.1));
  assert.ok(relevanceOf(3, 0.1) < relevanceOf(3, 0.3));
  assert.ok(relevanceOf(5, 0.3) > relevanceOf(5, 0.1));
  assert.ok(relevanceOf(0, 0.05) < MIN_RELEVANCE, "no evidence stays below the cutoff");
});

test("an empty index returns nothing and never throws", () => {
  assert.deepEqual(searchMemoryIndex(buildMemoryIndex([]), "water", { lang: "en" }), []);
});

test("a language twin is collapsed to one passage in the question's language", () => {
  const row = (id, lang, title, content) => ({ id, sourceKey: `doc:water:${lang}`, kind: "DOCUMENT", lang, title, content, sourceName: null, sourceUrl: null, sourceDate: null });
  const index = buildMemoryIndex([
    row(1, "en", "Boil water", "Boil water for one minute before drinking. Store boiled water in a covered container."),
    row(2, "ar", "غلي الماء", "اغلِ الماء لمدة دقيقة قبل الشرب. احفظ الماء المغلي في وعاء مغطى."),
  ]);
  const found = searchMemoryIndex(index, "how do I boil water", { lang: "en" });
  assert.equal(found.length, 1);
  assert.equal(found[0].lang, "en");
});

// --- Retrieval quality over the real curated documents (the numbers in the header of memoryIndex.ts) ---
const cases = JSON.parse(readFileSync(new URL("./eval/retrieval-cases.json", import.meta.url), "utf8"));
const chunks = await curatedChunks();
const rows = chunks.map((c, i) => ({ id: i + 1, sourceKey: c.sourceKey, kind: c.kind, lang: c.lang, title: c.title, content: c.content, sourceName: c.sourceName ?? null, sourceUrl: c.sourceUrl ?? null, sourceDate: c.sourceDate ?? null }));
const index = buildMemoryIndex(rows);
const docOf = (key) => key.replace(/^doc:/, "").replace(/:(ar|en)(:\d+)?$/, "");
const langOf = (q) => (/[؀-ۿ]/.test(q) ? "ar" : "en");
// Rank without the cutoff so hit@k measures ordering; acceptance is measured separately with the real cutoff.
const rank = (q) => searchMemoryIndex(index, q, { lang: langOf(q), minScore: 0, topK: 50 }).map((c) => docOf(c.sourceKey));
const accepted = (q) => searchMemoryIndex(index, q, { lang: langOf(q) }).length > 0;

// Measured on the 59 answerable and 26 unanswerable cases with the 26 documents of the day (top-3 59, top-1 53, accepted
// 54 = 0.92, rejected 23 = 0.88), minus a margin of about two questions because the corpus keeps growing. They were 23/25,
// 20/25, 0.88 and 0.75 before the synonym table and the thin-match guard; never lower them.
const TOP3_MIN = 57;
const TOP1_MIN = 50;
const ACCEPTED_MIN = 0.88;
const REJECTED_MIN = 0.84;

test("retrieval quality: the right document is in the top 3 for nearly every answerable question", () => {
  const misses = [];
  let hit1 = 0;
  for (const { question, docs } of cases.answerable) {
    const top = [...new Set(rank(question))];
    if (docs.includes(top[0])) hit1 += 1;
    if (!top.slice(0, 3).some((d) => docs.includes(d))) misses.push(question);
  }
  const n = cases.answerable.length;
  assert.ok(n - misses.length >= TOP3_MIN, `top-3 hits ${n - misses.length}/${n}; missed: ${misses.join(" | ")}`);
  assert.ok(hit1 >= TOP1_MIN, `top-1 hits ${hit1}/${n}`);
});

test("retrieval quality: answerable questions pass the cutoff and unanswerable ones mostly do not", () => {
  const acc = cases.answerable.filter((c) => accepted(c.question)).length / cases.answerable.length;
  const rej = cases.unanswerable.filter((q) => !accepted(q)).length / cases.unanswerable.length;
  assert.ok(acc >= ACCEPTED_MIN, `accepted ${acc.toFixed(2)} of answerable`);
  assert.ok(rej >= REJECTED_MIN, `rejected ${rej.toFixed(2)} of unanswerable`);
});

test("retrieval quality: the colloquial Arabic questions that the full-text search alone declined are now answered", () => {
  for (const q of ["ابني عنده إسهال، شو أعمل؟", "كيف أرضع طفلي في الطوارئ؟"]) {
    assert.ok(accepted(q), q);
  }
});

test("retrieval quality: the spoiled-fridge-food question is answered from the when-in-doubt document", () => {
  const q = "الكهرباء قطعت والأكل المبرّد تعفّن، أرميه؟";
  assert.ok(accepted(q));
  assert.equal(rank(q)[0], "safety-food-when-in-doubt");
});

test("retrieval quality: a long question that shares one word with a passage is declined", () => {
  // "building" occurs in a breastfeeding sentence; before the thin-match guard this was accepted at 0.55.
  for (const q of ["What is the best protein for muscle building?", "ما أفضل بروتين لبناء العضلات؟", "Should I take creatine supplements?", "How to lose weight fast"]) {
    assert.ok(!accepted(q), q);
  }
  // The guard needs three content terms: a short question with one strong word is still answered.
  assert.ok(accepted("دخان الطهي"));
});
