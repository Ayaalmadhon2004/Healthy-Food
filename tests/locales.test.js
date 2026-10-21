import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (name) => JSON.parse(readFileSync(new URL(`../locales/${name}.json`, import.meta.url), "utf8"));
const ar = load("ar");
const en = load("en");

// Every key path in a dictionary, e.g. "auth.errors.general_error". Arrays count as leaves.
function keyPaths(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

test("ar and en locale files have exactly the same keys", () => {
  const arKeys = new Set(keyPaths(ar));
  const enKeys = new Set(keyPaths(en));
  const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));
  const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
  assert.deepEqual(missingInEn, [], `keys in ar.json missing from en.json: ${missingInEn.join(", ")}`);
  assert.deepEqual(missingInAr, [], `keys in en.json missing from ar.json: ${missingInAr.join(", ")}`);
});

test("no locale value is empty", () => {
  for (const [name, dict] of [["ar", ar], ["en", en]]) {
    const walk = (value, path) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
      } else if (typeof value === "string") {
        assert.notEqual(value.trim(), "", `${name}.json has an empty value at ${path}`);
      }
    };
    walk(dict, name);
  }
});
