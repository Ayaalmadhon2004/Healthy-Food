import test from "node:test";
import assert from "node:assert/strict";
import "./helpers/register.mjs";

const { isOverviewRequest, OVERVIEW_TOPICS, OVERVIEW_MAX_POINTS } = await import("../lib/rag/overview.ts");
const { runChat } = await import("../lib/rag/chat.ts");
const { buildOverviewAnswer } = await import("../lib/rag/extractive.ts");

test("a general request for tips is an overview request, in both languages", () => {
  for (const q of ["اعطيني نصائح غذائية لاهل غزة", "نصائح صحية", "ارشادات غذائية عامة", "give me nutrition tips for people in Gaza", "nutrition advice", "General guidance for eating well in Gaza"]) {
    assert.equal(isOverviewRequest(q), true, q);
  }
});

test("a request that names a topic, or is not a request for tips, is an ordinary question", () => {
  for (const q of ["نصائح لعلاج الإسهال", "نصائح لمريض السكري", "tips for boiling water", "advice for a diabetic child", "ابني عنده إسهال", "hello", "how do I cook mujaddara",
    "what is the best protein for muscle building", "tips tips tips tips tips tips tips tips tips tips tips tips tips"]) {
    assert.equal(isOverviewRequest(q), false, q);
  }
});

test("both languages ask about the same number of topics", () => {
  assert.equal(OVERVIEW_TOPICS.ar.length, OVERVIEW_TOPICS.en.length);
  assert.ok(OVERVIEW_TOPICS.en.length >= OVERVIEW_MAX_POINTS);
});

const messages = { overviewIntro: "INTRO", disclaimer: "DISCLAIMER", greeting: "G", thanks: "T", noContext: "NO CONTEXT", outOfScope: "OUT", emergency: "E", emergencyDoctors: "D", refusal: "R", truncated: "X" };
const chunk = (id, title, content, score = 0.8) => ({ id, sourceKey: `doc:t${id}:en`, kind: "DOCUMENT", lang: "en", title, content, sourceName: "S", sourceUrl: null, sourceDate: null, score });
async function run(question, retrieve, lang = "en") {
  const events = [];
  for await (const e of runChat({ question, lang, history: [] }, { retrieve, getMessages: async () => messages })) events.push(e);
  return events;
}

test("an overview request asks about every topic and answers with one cited point per passage", async () => {
  const asked = [];
  const retrieve = async (q, opts) => {
    asked.push({ q, topK: opts.topK });
    const i = asked.length;
    return [chunk(i, `Topic ${i}`, `Topic ${i}\nThe key point number ${i} about eating safely in an emergency. A second sentence follows here.`)];
  };
  const events = await run("give me nutrition tips for people in Gaza", retrieve);
  assert.equal(asked.length, OVERVIEW_TOPICS.en.length, "one search per topic");
  assert.ok(asked.every((a) => a.topK === 1));
  assert.equal(events[0].type, "meta");
  assert.equal(events[0].mode, "answer");
  assert.equal(events[0].citations.length, OVERVIEW_MAX_POINTS, "capped at the maximum number of points");
  const text = events.filter((e) => e.type === "delta").map((e) => e.text).join("");
  const lines = text.split("\n");
  assert.equal(lines[0], "INTRO");
  assert.equal(lines.filter((l) => l.startsWith("- ")).length, OVERVIEW_MAX_POINTS);
  assert.ok(lines[1].endsWith("[1]") && lines[OVERVIEW_MAX_POINTS].endsWith(`[${OVERVIEW_MAX_POINTS}]`));
  assert.ok(lines.at(-1).includes("DISCLAIMER"));
  assert.equal(events.at(-1).type, "done");
});

test("an overview request still declines plainly when the knowledge base has nothing", async () => {
  const events = await run("نصائح غذائية", async () => [], "ar");
  assert.equal(events[0].mode, "no_context");
});

test("a specific question is searched once with the question itself, not as an overview", async () => {
  const asked = [];
  const retrieve = async (q) => { asked.push(q); return [chunk(1, "Water", "Water\nBoil the water for one minute before drinking it.")]; };
  await run("tips for boiling water", retrieve);
  assert.deepEqual(asked, ["tips for boiling water"]);
});

test("the overview text uses each passage's opening sentence and drops passages without one", () => {
  const text = buildOverviewAnswer({ passages: [chunk(1, "A", "A\nFirst real sentence of the first passage."), chunk(2, "B", "B")], intro: "INTRO", lang: "en", disclaimer: "D" });
  assert.equal(text, "INTRO\n- First real sentence of the first passage. [1]\nCaution: D");
  assert.equal(buildOverviewAnswer({ passages: [], intro: "I", lang: "en", disclaimer: "D" }), "");
});
