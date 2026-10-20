import test from "node:test";
import assert from "node:assert/strict";
import { formatCapacity, getCapacityLimit, parseCapacity, validateCapacityInput } from "../lib/capacity.js";

test("parseCapacity reads every stored format", () => {
  assert.equal(parseCapacity(500), 500);
  assert.equal(parseCapacity("500"), 500);
  assert.equal(parseCapacity("٣٠٠"), 300);
  assert.equal(parseCapacity({ en: "350-500 families", ar: "350-500 أسرة" }), 500);
});

test("parseCapacity rejects unusable values", () => {
  for (const v of [null, undefined, "", "abc", "0", 0, -5, {}, []]) assert.equal(parseCapacity(v), null);
});

test("getCapacityLimit falls back to the default", () => {
  assert.equal(getCapacityLimit(undefined), 500);
  assert.equal(getCapacityLimit("120"), 120);
});

test("validateCapacityInput accepts only whole numbers in range", () => {
  assert.equal(validateCapacityInput("120"), 120);
  assert.equal(validateCapacityInput(" 7 "), 7);
  for (const v of ["12.5", "-3", "", "0", "abc", "100001", null]) assert.equal(validateCapacityInput(v), null);
});

test("formatCapacity keeps legacy labels and prints numbers otherwise", () => {
  assert.equal(formatCapacity({ en: "350-500 families", ar: "x" }, "en"), "350-500 families");
  assert.equal(formatCapacity(500, "ar"), "500");
  assert.equal(formatCapacity(null, "ar"), "");
});
