import test from "node:test";
import assert from "node:assert/strict";
import "./helpers/register.mjs";

const { buildExtractiveAnswer, sentencesOf } = await import("../lib/rag/extractive.ts");
const { chooseProvider } = await import("../lib/rag/providers.ts");
const { createGeminiGenerator, parseGeminiLine } = await import("../lib/rag/gemini.ts");

const chunk = (id, title, content) => ({ id, sourceKey: `doc:${id}:en`, kind: "DOCUMENT", lang: "en", title, content, sourceName: "S", sourceUrl: "https://example.org", sourceDate: "2026", score: 0.9 });

test("provider is free by default: extractive unless a Gemini key is set; Claude only when asked", () => {
  assert.equal(chooseProvider({}), "extractive");
  assert.equal(chooseProvider({ ANTHROPIC_API_KEY: "x" }), "extractive");
  assert.equal(chooseProvider({ GEMINI_API_KEY: "x" }), "gemini");
  assert.equal(chooseProvider({ GEMINI_API_KEY: "x", LLM_PROVIDER: "extractive" }), "extractive");
  assert.equal(chooseProvider({ ANTHROPIC_API_KEY: "x", LLM_PROVIDER: "Anthropic" }), "anthropic");
  assert.equal(chooseProvider({ LLM_PROVIDER: "nonsense" }), "extractive");
});

test("sentencesOf drops the repeated title and very short fragments", () => {
  const s = sentencesOf({ title: "Safe water", content: "Safe water\nBoil the water before drinking it. Ok.\nStore it in a clean covered container." });
  assert.deepEqual(s, ["Boil the water before drinking it.", "Store it in a clean covered container."]);
});

test("extractive answer is built only from the passages, cites them, and ends with the caution", () => {
  const passages = [
    chunk(1, "Safe water", "Safe water\nBoil the water before drinking it. Keep it in a clean covered container. Never dip cups into it."),
    chunk(2, "Hand washing", "Hand washing\nWash hands with soap before eating and after using the toilet."),
  ];
  const answer = buildExtractiveAnswer({ passages, lang: "en", disclaimer: "General information only." });
  const lines = answer.split("\n");
  assert.ok(lines[0].endsWith("[1]"));
  assert.ok(lines.some((l) => l.startsWith("- ") && l.endsWith("[2]")));
  assert.equal(lines.at(-1), "Caution: General information only.");
  for (const l of lines.slice(0, -1)) assert.ok(passages.some((p) => p.content.includes(l.replace(/^- /, "").replace(/ \[\d\]$/, "").replace(/…$/, ""))), l);
  assert.equal(buildExtractiveAnswer({ passages: [], lang: "en", disclaimer: "x" }), "");
});

test("extractive answer uses the Arabic caution label", () => {
  const a = buildExtractiveAnswer({ passages: [chunk(1, "ماء", "ماء\nاغلِ الماء قبل شربه بوقت كافٍ دائماً.")], lang: "ar", disclaimer: "معلومات عامة." });
  assert.ok(a.split("\n").at(-1).startsWith("تنبيه:"));
});

test("parseGeminiLine reads data lines and ignores everything else", () => {
  assert.equal(parseGeminiLine(": keep-alive"), null);
  assert.equal(parseGeminiLine("data: {broken"), null);
  assert.deepEqual(parseGeminiLine('data: {"candidates":[{"content":{"parts":[{"text":"hi"}]}}]}').candidates[0].content.parts[0].text, "hi");
});

const sse = (...objs) => new Response(new ReadableStream({ start(c) { for (const o of objs) c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(o)}\r\n\r\n`)); c.close(); } }), { status: 200 });
const input = { system: [{ type: "text", text: "SYS" }], messages: [{ role: "user", content: "q" }], notes: { refusal: "REFUSED", truncated: "CUT" } };
const collect = async (gen) => { const out = []; for await (const e of gen) out.push(e); return out; };

test("gemini generator streams deltas, sends the key as a header, and never puts it in the URL", async () => {
  let seen;
  const gen = createGeminiGenerator(async (url, init) => { seen = { url, init }; return sse({ candidates: [{ content: { parts: [{ text: "Hel" }] } }] }, { candidates: [{ content: { parts: [{ text: "lo" }] }, finishReason: "STOP" }] }); }, { GEMINI_API_KEY: "secret-key" });
  const events = await collect(gen(input));
  assert.deepEqual(events, [{ type: "delta", text: "Hel" }, { type: "delta", text: "lo" }]);
  assert.ok(!seen.url.includes("secret-key"));
  assert.equal(seen.init.headers["x-goog-api-key"], "secret-key");
  assert.equal(JSON.parse(seen.init.body).contents[0].role, "user");
});

test("gemini generator maps failures, blocks and truncation without throwing", async () => {
  assert.deepEqual(await collect(createGeminiGenerator(async () => { throw new Error("x"); }, { GEMINI_API_KEY: "k" })(input)), [{ type: "error", code: "unavailable" }]);
  assert.deepEqual(await collect(createGeminiGenerator(async () => new Response("no", { status: 429 }), { GEMINI_API_KEY: "k" })(input)), [{ type: "error", code: "unavailable" }]);
  assert.deepEqual(await collect(createGeminiGenerator(async () => sse({}), {})(input)), [{ type: "error", code: "unavailable" }]);
  const blocked = await collect(createGeminiGenerator(async () => sse({ candidates: [{ finishReason: "SAFETY" }] }), { GEMINI_API_KEY: "k" })(input));
  assert.ok(blocked[0].text.includes("REFUSED"));
  const cut = await collect(createGeminiGenerator(async () => sse({ candidates: [{ content: { parts: [{ text: "a" }] }, finishReason: "MAX_TOKENS" }] }), { GEMINI_API_KEY: "k" })(input));
  assert.ok(cut.at(-1).text.includes("CUT"));
});
