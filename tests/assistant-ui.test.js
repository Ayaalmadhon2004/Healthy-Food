import test from "node:test";
import assert from "node:assert/strict";
import { parseSseChunk, flushSse } from "@/components/assistant/sseParser";
import { parseAnswer, parseInline, safeHttpUrl } from "@/components/assistant/answerFormat";

const ev = (o) => `data: ${JSON.stringify(o)}\n\n`;
const META = { type: "meta", mode: "answer", citations: [{ id: 7, kind: "TIP", title: "ORS", sourceName: "WHO", sourceUrl: "https://who.int", sourceDate: "2024-01-01" }] };

test("sse: several events in one chunk", () => {
  const { events, rest } = parseSseChunk("", ev(META) + ev({ type: "delta", text: "a" }) + ev({ type: "done" }));
  assert.deepEqual(events.map((e) => e.type), ["meta", "delta", "done"]);
  assert.equal(rest, "");
  assert.equal(events[0].citations[0].title, "ORS");
});

test("sse: an event split mid-JSON across chunks", () => {
  const full = ev({ type: "delta", text: "hello world" });
  for (let cut = 1; cut < full.length; cut++) {
    const a = parseSseChunk("", full.slice(0, cut));
    const b = parseSseChunk(a.rest, full.slice(cut));
    assert.equal(a.events.length + b.events.length, 1, `cut at ${cut}`);
    assert.equal([...a.events, ...b.events][0].text, "hello world");
  }
});

test("sse: CRLF line endings, including a CR split from its LF", () => {
  const crlf = ev({ type: "delta", text: "x" }).replace(/\n/g, "\r\n");
  assert.equal(parseSseChunk("", crlf).events.length, 1);
  const a = parseSseChunk("", crlf.slice(0, -1));
  const b = parseSseChunk(a.rest, crlf.slice(-1));
  assert.equal(a.events.length + b.events.length, 1);
});

test("sse: unknown types, malformed JSON and wrong shapes are skipped", () => {
  const raw = ev({ type: "ping" }) + "data: {not json\n\n" + ev({ type: "delta" }) + ev({ type: "meta", mode: "weird", citations: [] }) + ev({ type: "delta", text: "ok" });
  const { events } = parseSseChunk("", raw);
  assert.deepEqual(events, [{ type: "delta", text: "ok" }]);
});

test("sse: comments, other fields and a missing final blank line", () => {
  const { events, rest } = parseSseChunk("", `: keep-alive\n\nevent: x\ndata: {"type":"done"}\n\ndata: {"type":"delta","text":"t"}`);
  assert.deepEqual(events, [{ type: "done" }]);
  assert.deepEqual(flushSse(rest), [{ type: "delta", text: "t" }]);
});

test("sse: error event keeps code and retryAfter", () => {
  const { events } = parseSseChunk("", ev({ type: "error", code: "rate_limited", retryAfter: 42 }) + ev({ type: "error", code: "nope" }));
  assert.deepEqual(events, [{ type: "error", code: "rate_limited", retryAfter: 42 }]);
});

test("answer: citation markers become cite parts", () => {
  assert.deepEqual(parseInline("Soak lentils [1] and boil [2][3]."), [
    { kind: "text", text: "Soak lentils " },
    { kind: "cite", n: 1 },
    { kind: "text", text: " and boil " },
    { kind: "cite", n: 2 },
    { kind: "cite", n: 3 },
    { kind: "text", text: "." },
  ]);
  assert.deepEqual(parseInline("[0] [100] [a]"), [{ kind: "text", text: "[0] [100] [a]" }]);
});

test("answer: bold, and an unclosed ** while streaming stays literal", () => {
  assert.deepEqual(parseInline("a **b** c"), [{ kind: "text", text: "a " }, { kind: "bold", text: "b" }, { kind: "text", text: " c" }]);
  assert.deepEqual(parseInline("a **b"), [{ kind: "text", text: "a **b" }]);
});

test("answer: line, bullets and caution blocks", () => {
  const blocks = parseAnswer("Boil the lentils. [1]\n\n- Add salt\n- Add **lemon** [2]\n\n**Caution:** do not reuse water.");
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].kind, "p");
  assert.equal(blocks[1].kind, "ul");
  assert.equal(blocks[1].items.length, 2);
  assert.deepEqual(blocks[1].items[1][1], { kind: "bold", text: "lemon" });
  assert.deepEqual(blocks[2].inlines[0], { kind: "bold", text: "Caution:" });
});

test("answer: bullet directly after a line and CRLF input", () => {
  const blocks = parseAnswer("Intro\r\n- one\r\n- two");
  assert.deepEqual(blocks.map((b) => b.kind), ["p", "ul"]);
  assert.equal(parseAnswer("**bold start** not a bullet")[0].kind, "p");
});

test("answer: markup and script strings stay inert text", () => {
  const evil = `<img src=x onerror=alert(1)> <script>alert(1)</script> [link](javascript:alert(1)) <b>x</b>`;
  const blocks = parseAnswer(evil);
  assert.equal(blocks.length, 1);
  const parts = blocks[0].inlines;
  assert.ok(parts.every((p) => p.kind === "text"));
  assert.equal(parts.map((p) => p.text).join(""), evil);
  const bold = parseInline("**<script>alert(1)</script>**");
  assert.deepEqual(bold, [{ kind: "bold", text: "<script>alert(1)</script>" }]);
});

test("safeHttpUrl: only http(s)", () => {
  assert.equal(safeHttpUrl("https://who.int/a?b=1"), "https://who.int/a?b=1");
  assert.equal(safeHttpUrl("http://example.org/"), "http://example.org/");
  for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<b>", "//evil.com", "/relative", "", null, undefined, "not a url", "ftp://x.org"]) {
    assert.equal(safeHttpUrl(bad), null, String(bad));
  }
});
