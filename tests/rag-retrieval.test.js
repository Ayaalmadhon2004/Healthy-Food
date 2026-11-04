import test from "node:test";
import assert from "node:assert/strict";
import { normalizeArabic, toSearchText, toTsQueryTerms } from "@/lib/rag/normalize";
import {
  buildTsQuery,
  dedupeByStem,
  reciprocalRankFusion,
  relevanceScore,
  sourceStem,
} from "@/lib/rag/fusion";
import { embedPassages, embedQuery, setEmbedderForTests } from "@/lib/rag/embed";
import { EMBEDDING_DIM, MIN_RELEVANCE } from "@/lib/rag/constants";

test("normalizeArabic unifies letters, strips diacritics and digits", () => {
  assert.equal(normalizeArabic("الْبُرُوتِينَات"), "البروتينات");
  assert.equal(normalizeArabic("أحمد إبراهيم آمن"), "احمد ابراهيم امن");
  assert.equal(normalizeArabic("مدرسة على"), "مدرسه علي");
  assert.equal(normalizeArabic("٢٠٢٤ ۵"), "2024 5");
  assert.equal(normalizeArabic("  Chicken   BREAST "), "chicken breast");
  assert.equal(toSearchText("Ti", "Co"), "ti co");
});

test("toTsQueryTerms drops stopwords and short tokens", () => {
  assert.deepEqual(toTsQueryTerms("What is the best protein for breakfast?"), ["best", "protein", "breakfast"]);
  assert.deepEqual(toTsQueryTerms("ما هي أفضل مصادر البروتين؟"), ["مصادر", "بروتين"]);
  assert.deepEqual(toTsQueryTerms("a ? !"), []);
});

test("buildTsQuery is OR-joined and rejects operator characters", () => {
  assert.equal(buildTsQuery(["protein", "eggs"]), "protein | eggs");
  assert.equal(buildTsQuery(["a&b", "x'y", "ok", "!"]), "ok");
  assert.equal(buildTsQuery([]), "");
});

test("reciprocalRankFusion rewards agreement", () => {
  const fused = reciprocalRankFusion([[1, 2, 3], [3, 1]]);
  assert.ok(fused.get(1) > fused.get(2));
  assert.ok(fused.get(1) > fused.get(3));
  assert.equal(fused.size, 3);
});

test("relevanceScore separates nonsense from relevant", () => {
  const nonsense = relevanceScore({ cosine: 0.77, lexicalRank: 0, rrf: 1 / 61, listCount: 2, preferredLang: true });
  const relevant = relevanceScore({ cosine: 0.89, lexicalRank: 0.4, rrf: 2 / 61, listCount: 2, preferredLang: true });
  const lexOnlyWeak = relevanceScore({ cosine: null, lexicalRank: 0.1, rrf: 1 / 61, listCount: 1, preferredLang: true });
  const lexOnlyGood = relevanceScore({ cosine: null, lexicalRank: 0.5, rrf: 1 / 61, listCount: 1, preferredLang: true });
  assert.ok(nonsense < MIN_RELEVANCE, `nonsense ${nonsense}`);
  assert.ok(relevant > MIN_RELEVANCE, `relevant ${relevant}`);
  assert.ok(lexOnlyWeak < MIN_RELEVANCE, `weak ${lexOnlyWeak}`);
  assert.ok(lexOnlyGood > MIN_RELEVANCE, `good ${lexOnlyGood}`);
  assert.ok(relevant <= 1);
});

test("dedupeByStem keeps the preferred language", () => {
  assert.equal(sourceStem("recipe:12:en"), "recipe:12");
  assert.equal(sourceStem("doc:who-ors:ar:0"), "doc:who-ors:0");
  const items = [
    { sourceKey: "recipe:12:en", lang: "en", score: 0.9 },
    { sourceKey: "recipe:12:ar", lang: "ar", score: 0.6 },
    { sourceKey: "tip:3:en", lang: "en", score: 0.5 },
  ];
  const out = dedupeByStem(items, "ar");
  assert.deepEqual(out.map((i) => i.sourceKey), ["recipe:12:ar", "tip:3:en"]);
  assert.equal(out[0].score, 0.9);
});

test("embedding uses an injected embedder, prefixes and never throws", async () => {
  const seen = [];
  setEmbedderForTests(async (texts) => {
    seen.push(...texts);
    return texts.map(() => new Array(EMBEDDING_DIM).fill(0.05));
  });
  const [p] = await embedPassages(["hello"]);
  const q = await embedQuery("hi");
  assert.equal(p.length, EMBEDDING_DIM);
  assert.equal(q.length, EMBEDDING_DIM);
  assert.deepEqual(seen, ["passage: hello", "query: hi"]);

  setEmbedderForTests(async () => {
    throw new Error("boom");
  });
  const warn = console.warn;
  console.warn = () => {};
  try {
    assert.deepEqual(await embedPassages(["a", "b"]), [null, null]);
    assert.equal(await embedQuery("x"), null);
  } finally {
    console.warn = warn;
    setEmbedderForTests(null);
  }
});

test("Arabic definite article is stripped on both sides so inflected forms match", () => {
  assert.deepEqual(toTsQueryTerms("المجدّرة"), toTsQueryTerms("مجدّرة"));
  assert.equal(toSearchText("", "المجدرة"), toSearchText("", "مجدرة"));
});

test("article stripping leaves short words and non-article prefixes alone", () => {
  assert.deepEqual(toTsQueryTerms("بيض"), ["بيض"]);
  assert.deepEqual(toTsQueryTerms("الماء"), ["ماء"]);
  assert.deepEqual(toTsQueryTerms("الاب"), ["الاب"]);
});
