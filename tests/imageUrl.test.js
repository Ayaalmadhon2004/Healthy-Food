import test from "node:test";
import assert from "node:assert/strict";
import { isValidImageUrl, parseImageUrl } from "../lib/imageUrl.ts";

test("accepts https URLs and /assets/ paths", () => {
  for (const v of ["https://example.com/a.jpg", "https://cdn.example.com/p/a%20b.png?x=1", "/assets/kitchens/pot.jpg"]) {
    assert.equal(isValidImageUrl(v), true, v);
  }
});

test("rejects unsafe or malformed values", () => {
  const bad = [
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
    "//evil.com/a.jpg",
    "http://example.com/a.jpg",
    "https://",
    "https://exa mple.com/a.jpg",
    "https://example.com/a b.jpg",
    "https://user:pw@example.com/a.jpg",
    "/other/path.jpg",
    "/assets/../secret.jpg",
    "assets/a.jpg",
    "ftp://example.com/a.jpg",
    "/assets/a\\b.jpg",
    "",
  ];
  for (const v of bad) assert.equal(isValidImageUrl(v), false, v);
});

test("enforces the 500 character limit", () => {
  const ok = "https://example.com/" + "a".repeat(480);
  assert.equal(ok.length, 500);
  assert.equal(isValidImageUrl(ok), true);
  assert.equal(isValidImageUrl(ok + "a"), false);
});

test("parseImageUrl trims, clears on empty and flags invalid input", () => {
  assert.equal(parseImageUrl("  https://example.com/a.jpg "), "https://example.com/a.jpg");
  assert.equal(parseImageUrl(""), null);
  assert.equal(parseImageUrl("   "), null);
  assert.equal(parseImageUrl(null), null);
  assert.equal(parseImageUrl("javascript:alert(1)"), undefined);
  assert.equal(parseImageUrl(new Blob([])), undefined);
});
