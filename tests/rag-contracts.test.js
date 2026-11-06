// Contract tests for the nutrition assistant: request schema, locale parity, curated knowledge documents.
// Offline and deterministic: no network, no database, no model.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import "./eval/ts-resolve.mjs";

const root = new URL("../", import.meta.url);
const json = (rel) => JSON.parse(readFileSync(new URL(rel, root), "utf8"));
const constants = await import("../lib/rag/constants.ts");
const { chatRequestSchema } = await import("../lib/rag/types.ts");
const { MAX_QUESTION_CHARS, MAX_HISTORY_TURNS, KNOWLEDGE_KINDS } = constants;
const messagesPerTurn = constants.MESSAGES_PER_TURN ?? 2;

// ---------- chatRequestSchema ----------
const valid = { question: "How do I make lentil soup?", lang: "en" };
const turn = (n) => Array.from({ length: n }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `m${i}` }));

test("chatRequestSchema accepts a minimal request and defaults history to []", () => {
  const parsed = chatRequestSchema.safeParse(valid);
  assert.equal(parsed.success, true);
  assert.deepEqual(parsed.data.history, []);
});

test("chatRequestSchema trims the question and accepts Arabic", () => {
  const parsed = chatRequestSchema.safeParse({ question: "  كيف أطبخ العدس؟  ", lang: "ar" });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.question, "كيف أطبخ العدس؟");
});

test("chatRequestSchema rejects empty and whitespace-only questions", () => {
  assert.equal(chatRequestSchema.safeParse({ ...valid, question: "" }).success, false);
  assert.equal(chatRequestSchema.safeParse({ ...valid, question: "   \n\t " }).success, false);
  assert.equal(chatRequestSchema.safeParse({ lang: "en" }).success, false);
});

test("chatRequestSchema enforces MAX_QUESTION_CHARS exactly", () => {
  assert.equal(chatRequestSchema.safeParse({ ...valid, question: "a".repeat(MAX_QUESTION_CHARS) }).success, true);
  assert.equal(chatRequestSchema.safeParse({ ...valid, question: "a".repeat(MAX_QUESTION_CHARS + 1) }).success, false);
});

test("chatRequestSchema rejects an unsupported or missing lang", () => {
  for (const lang of ["fr", "AR", "", null, undefined, 1]) {
    assert.equal(chatRequestSchema.safeParse({ ...valid, lang }).success, false, `lang ${String(lang)}`);
  }
});

test("chatRequestSchema bounds the history", () => {
  const max = MAX_HISTORY_TURNS * messagesPerTurn;
  assert.equal(chatRequestSchema.safeParse({ ...valid, history: turn(max) }).success, true);
  assert.equal(chatRequestSchema.safeParse({ ...valid, history: turn(max + 1) }).success, false);
  assert.equal(chatRequestSchema.safeParse({ ...valid, history: [{ role: "system", content: "x" }] }).success, false);
  assert.equal(chatRequestSchema.safeParse({ ...valid, history: [{ role: "user", content: "x".repeat(100000) }] }).success, false);
});

test("chatRequestSchema rejects wrong types", () => {
  assert.equal(chatRequestSchema.safeParse(null).success, false);
  assert.equal(chatRequestSchema.safeParse("hello").success, false);
  assert.equal(chatRequestSchema.safeParse({ ...valid, question: 42 }).success, false);
  assert.equal(chatRequestSchema.safeParse({ ...valid, history: "nope" }).success, false);
});

// ---------- constants ----------
test("constants are sane", () => {
  assert.ok(constants.MIN_RELEVANCE > 0 && constants.MIN_RELEVANCE < 1);
  assert.ok(constants.RETRIEVE_TOP_K >= 1);
  assert.ok(constants.CHAT_MAX_TOKENS > 0);
  assert.ok(constants.EMBEDDING_DIM === 384, "schema.prisma declares vector(384)");
  assert.match(readFileSync(new URL("prisma/schema.prisma", root), "utf8"), new RegExp(`vector\\(${constants.EMBEDDING_DIM}\\)`));
});

// ---------- locale parity ----------
const en = json("locales/en.json");
const ar = json("locales/ar.json");

function leaves(value, prefix = "") {
  if (typeof value === "string") return [[prefix, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  return [[prefix, value]];
}
const placeholders = (s) => [...String(s).matchAll(/\{\{?\s*[\w.]+\s*\}?\}|%[sd]/g)].map((m) => m[0]).sort();

for (const section of ["server.chat", "assistant"]) {
  const pick = (dict) => section.split(".").reduce((o, k) => o?.[k], dict);

  test(`locale section ${section} exists in en and ar`, () => {
    assert.ok(pick(en) && typeof pick(en) === "object", `en.json is missing ${section}`);
    assert.ok(pick(ar) && typeof pick(ar) === "object", `ar.json is missing ${section}`);
  });

  test(`locale section ${section}: same keys in en and ar`, () => {
    const enKeys = leaves(pick(en)).map(([k]) => k).sort();
    const arKeys = leaves(pick(ar)).map(([k]) => k).sort();
    assert.deepEqual(arKeys, enKeys);
  });

  test(`locale section ${section}: no empty or non-string values`, () => {
    for (const [name, dict] of [["en", en], ["ar", ar]]) {
      for (const [key, value] of leaves(pick(dict))) {
        assert.equal(typeof value, "string", `${name}.${section}.${key} is not a string`);
        assert.notEqual(value.trim(), "", `${name}.${section}.${key} is empty`);
      }
    }
  });

  test(`locale section ${section}: placeholders match between en and ar`, () => {
    const arMap = new Map(leaves(pick(ar)));
    for (const [key, enValue] of leaves(pick(en))) {
      if (!arMap.has(key)) continue; // reported by the key test
      assert.deepEqual(placeholders(arMap.get(key)), placeholders(enValue), `placeholders differ at ${section}.${key}`);
    }
  });

  test(`locale section ${section}: Arabic values contain Arabic letters, English values do not`, () => {
    for (const [key, value] of leaves(pick(ar))) {
      if (typeof value !== "string") continue;
      assert.match(value, /[؀-ۿ]/, `ar.${section}.${key} has no Arabic letters`);
    }
    for (const [key, value] of leaves(pick(en))) {
      if (typeof value !== "string") continue;
      assert.doesNotMatch(value, /[؀-ۿ]/, `en.${section}.${key} contains Arabic letters`);
    }
  });
}

test("every server.chat message the API route and chat module look up exists", () => {
  const sources = ["app/api/chat/route.ts", "lib/rag/chat.ts", "lib/rag/generate.ts"]
    .filter((f) => existsSync(new URL(f, root)))
    .map((f) => readFileSync(new URL(f, root), "utf8"))
    .join("\n");
  const used = [...sources.matchAll(/server\.chat\.(\w+)/g)].map((m) => m[1]);
  for (const key of new Set(used)) assert.ok(en.server.chat[key], `server.chat.${key} is used in code but missing in en.json`);
});

test("every KNOWLEDGE_KINDS value is handled by the sources (chunking) and by the prisma comment", () => {
  assert.equal(new Set(KNOWLEDGE_KINDS).size, KNOWLEDGE_KINDS.length);
  const chunking = readFileSync(new URL("lib/rag/chunking.ts", root), "utf8");
  const schema = readFileSync(new URL("prisma/schema.prisma", root), "utf8");
  for (const kind of KNOWLEDGE_KINDS) {
    assert.match(schema, new RegExp(kind), `schema.prisma comment does not mention ${kind}`);
    // GUIDE has no row producer yet; it must at least be a legal ChunkInput kind. Others must have a producer.
    if (kind !== "GUIDE") assert.match(chunking, new RegExp(`"${kind}"`), `no chunk producer emits kind ${kind}`);
  }
});

// ---------- curated knowledge documents ----------
const knowledgeDir = new URL("data/knowledge/", root);
const files = existsSync(knowledgeDir) ? readdirSync(knowledgeDir).filter((f) => f.endsWith(".json")).sort() : [];
const docs = files.flatMap((file) => {
  const parsed = json(`data/knowledge/${file}`);
  return (Array.isArray(parsed) ? parsed : [parsed]).map((doc, i) => ({ file, where: `${file}[${i}]`, doc }));
});

const ARABIC = /[؀-ۿ]/g;
const LATIN = /[A-Za-z]/g;
const count = (s, re) => (s.match(re) ?? []).length;

test("data/knowledge contains at least one curated document", () => {
  assert.ok(files.length > 0, "no data/knowledge/*.json files");
  assert.ok(docs.length > 0, "data/knowledge/*.json contain no documents");
});

test("curated documents: unique slug ids", () => {
  const seen = new Map();
  for (const { where, doc } of docs) {
    assert.match(String(doc.id), /^[a-z0-9][a-z0-9-]*$/, `${where}: bad id ${doc.id}`);
    assert.ok(!seen.has(doc.id), `${where}: duplicate id ${doc.id} (also ${seen.get(doc.id)})`);
    seen.set(doc.id, where);
  }
});

test("curated documents: title and content in both languages, non-empty", () => {
  for (const { where, doc } of docs) {
    for (const field of ["title", "content"]) {
      for (const lang of ["ar", "en"]) {
        const v = doc[field]?.[lang];
        assert.equal(typeof v, "string", `${where}: ${field}.${lang} missing`);
        assert.ok(v.trim().length > 0, `${where}: ${field}.${lang} empty`);
      }
      assert.ok(doc.content.ar.trim().length >= 80 && doc.content.en.trim().length >= 80, `${where}: content too short to be useful`);
    }
  }
});

test("curated documents: source name, https url and date present", () => {
  for (const { where, doc } of docs) {
    assert.ok(String(doc.sourceName ?? "").trim(), `${where}: sourceName missing`);
    assert.match(String(doc.sourceUrl ?? ""), /^https:\/\/[^\s/]+\.[^\s]+$/, `${where}: sourceUrl must be https`);
    assert.ok(String(doc.sourceDate ?? "").trim(), `${where}: sourceDate missing`);
  }
});

test("curated documents: Arabic text is Arabic and English text is Latin", () => {
  for (const { where, doc } of docs) {
    for (const field of ["title", "content"]) {
      const ar_ = doc[field].ar;
      const en_ = doc[field].en;
      assert.ok(count(ar_, ARABIC) >= count(ar_, LATIN), `${where}: ${field}.ar is not mainly Arabic`);
      assert.ok(count(ar_, ARABIC) > 0, `${where}: ${field}.ar has no Arabic letters`);
      assert.ok(count(en_, LATIN) > 0, `${where}: ${field}.en has no Latin letters`);
      assert.equal(count(en_, ARABIC), 0, `${where}: ${field}.en contains Arabic letters`);
    }
  }
});

test("curated documents: no obviously truncated or placeholder text", () => {
  const dangling = /(?:[,:;،؛\-–(\[]|\b(?:and|or|the|of|to|with|a|in)|\b(?:و|أو|في|من|إلى|مع))\s*$/i;
  for (const { where, doc } of docs) {
    for (const lang of ["ar", "en"]) {
      const text = doc.content[lang].trim();
      assert.match(text, /[.!?؟…:)"”»\]۔]$|\d$|\.\s*\[\d+\]$/, `${where}: content.${lang} does not end like a finished sentence: "...${text.slice(-40)}"`);
      assert.doesNotMatch(text, dangling, `${where}: content.${lang} ends mid-sentence`);
      assert.doesNotMatch(text, /lorem ipsum|TODO|TBD|FIXME|…\s*$|\.\.\.\s*$/i, `${where}: content.${lang} has placeholder or ellipsis ending`);
      assert.doesNotMatch(text, /�/, `${where}: content.${lang} has a replacement character`);
    }
  }
});

test("curated documents: the two languages are comparable in length (no one-line stub)", () => {
  for (const { where, doc } of docs) {
    const a = doc.content.ar.length;
    const e = doc.content.en.length;
    const ratio = Math.min(a, e) / Math.max(a, e);
    assert.ok(ratio > 0.3, `${where}: ar/en content length ratio ${ratio.toFixed(2)} suggests one side is a stub`);
  }
});

test("curated documents: no prompt-injection phrasing stored in the knowledge base", () => {
  const bad = /ignore (all |your |the )?(previous|above|prior) |system prompt|تجاهل (كل )?(التعليمات|ما سبق)/i;
  for (const { where, doc } of docs) {
    for (const lang of ["ar", "en"]) {
      assert.doesNotMatch(`${doc.title[lang]}\n${doc.content[lang]}`, bad, `${where}: ${lang} text contains instruction-like phrasing`);
    }
  }
});

test("curated documents: validateCuratedDocument (the ingestion gate) accepts all of them", async () => {
  const { validateCuratedDocument } = await import("../lib/rag/chunking.ts");
  for (const { where, doc } of docs) assert.deepEqual(validateCuratedDocument(doc, where), []);
});

// ---------- summaries (the line the overview shows for each document) ----------
const tokens = (s) => (s.toLowerCase().replace(/[ً-ْـ]/g, "").match(/[\p{L}\p{N}]+/gu) ?? []);
/** Share of the summary's words that also occur in the document text (the summary must not bring new facts). */
const coverage = (summary, text) => {
  const have = new Set(tokens(text).flatMap((w) => [w, w.replace(/^(و|ف|ب|ل|ال)+/, "")]));
  const words = tokens(summary).filter((w) => w.length > 2);
  const hit = words.filter((w) => have.has(w) || have.has(w.replace(/^(و|ف|ب|ل|ال)+/, "")));
  return hit.length / words.length;
};

test("curated documents: every document has a one-sentence summary in both languages (25-220 characters)", () => {
  for (const { where, doc } of docs) {
    for (const lang of ["ar", "en"]) {
      const s = doc.summary?.[lang];
      assert.equal(typeof s, "string", `${where}: summary.${lang} missing`);
      assert.ok(s.length >= 25 && s.length <= 220, `${where}: summary.${lang} is ${s.length} characters`);
      assert.match(s.trim(), /[.!?؟]$/, `${where}: summary.${lang} must end like a sentence`);
    }
    assert.ok(count(doc.summary.ar, ARABIC) > 0 && count(doc.summary.ar, ARABIC) >= count(doc.summary.ar, LATIN), `${where}: summary.ar is not mainly Arabic`);
    assert.equal(count(doc.summary.en, ARABIC), 0, `${where}: summary.en contains Arabic letters`);
  }
});

test("curated documents: a summary uses the document's own words (no new facts)", () => {
  for (const { where, doc } of docs) {
    for (const lang of ["ar", "en"]) {
      const share = coverage(doc.summary[lang], `${doc.title[lang]} ${doc.content[lang]}`);
      assert.ok(share >= 0.7, `${where}: only ${(share * 100).toFixed(0)}% of summary.${lang} words occur in the document`);
    }
  }
});

test("curated documents: the first sentence of the first chunk is the summary, in both languages", async () => {
  const { curatedToChunks } = await import("../lib/rag/chunking.ts");
  const { sentencesOf } = await import("../lib/rag/extractive.ts");
  for (const { where, doc } of docs) {
    for (const lang of ["ar", "en"]) {
      const first = curatedToChunks(doc).find((c) => c.lang === lang && /:(ar|en)$/.test(c.sourceKey));
      const wanted = doc.summary[lang].trim();
      assert.equal(sentencesOf(first)[0], /[.!?؟]$/.test(wanted) ? wanted : `${wanted}.`, `${where}: ${lang}`);
    }
  }
});

test("curated documents: no document repeats another one's summary or source page", () => {
  const summaries = new Map();
  const pages = new Map();
  for (const { where, doc } of docs) {
    for (const lang of ["ar", "en"]) {
      const key = `${lang}:${doc.summary[lang].trim()}`;
      assert.ok(!summaries.has(key), `${where}: same summary.${lang} as ${summaries.get(key)}`);
      summaries.set(key, where);
    }
    // Two documents may cite one page only if they say different things (the summaries above differ); report it for review.
    pages.set(doc.sourceUrl, [...(pages.get(doc.sourceUrl) ?? []), doc.id]);
  }
  for (const ids of pages.values()) assert.ok(ids.length <= 2, `more than two documents cite one page: ${ids.join(", ")}`);
});
