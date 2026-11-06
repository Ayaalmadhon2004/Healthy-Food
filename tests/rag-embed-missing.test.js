// The local embedding model (@huggingface/transformers) is an optionalDependency. When it is not installed
// the embed functions must degrade to nulls without throwing, and warn only once.
import test from "node:test";
import assert from "node:assert/strict";
import { embedPassages, embedQuery, setEmbedderForTests, setModuleLoaderForTests } from "@/lib/rag/embed";

function captureWarnings() {
  const calls = [];
  const original = console.warn;
  console.warn = (...args) => calls.push(args.join(" "));
  return { calls, restore: () => (console.warn = original) };
}

test("module not installed: embeddings return nulls, never throw, warn once", async () => {
  let attempts = 0;
  setEmbedderForTests(null);
  setModuleLoaderForTests(async () => {
    attempts += 1;
    throw Object.assign(new Error("Cannot find package '@huggingface/transformers'"), { code: "ERR_MODULE_NOT_FOUND" });
  });
  const warn = captureWarnings();
  try {
    assert.deepEqual(await embedPassages(["a", "b"]), [null, null]);
    assert.equal(await embedQuery("x"), null);
    assert.deepEqual(await embedPassages([]), []);
    assert.equal(warn.calls.length, 1, "warned exactly once");
    assert.match(warn.calls[0], /full-text search only/);
    assert.equal(attempts, 1, "the failed import is cached, not retried per query");
  } finally {
    warn.restore();
    setModuleLoaderForTests(null);
  }
});

test("module loads but the model cannot be created: still nulls", async () => {
  setModuleLoaderForTests(async () => ({
    env: {},
    pipeline: async () => {
      throw new Error("model download failed");
    },
  }));
  const warn = captureWarnings();
  try {
    assert.equal(await embedQuery("x"), null);
  } finally {
    warn.restore();
    setModuleLoaderForTests(null);
  }
});

test("RAG_DISABLE_EMBEDDINGS=1 returns nulls without loading the module", async () => {
  let loaded = false;
  setModuleLoaderForTests(async () => {
    loaded = true;
    return {};
  });
  process.env.RAG_DISABLE_EMBEDDINGS = "1";
  const warn = captureWarnings();
  try {
    assert.equal(await embedQuery("x"), null);
    assert.equal(loaded, false);
  } finally {
    delete process.env.RAG_DISABLE_EMBEDDINGS;
    warn.restore();
    setModuleLoaderForTests(null);
  }
});

test("a working loader still produces vectors of the right size", async () => {
  const { EMBEDDING_DIM } = await import("@/lib/rag/constants");
  setModuleLoaderForTests(async () => ({
    env: {},
    pipeline: async () => async (texts) => ({ tolist: () => texts.map(() => new Array(EMBEDDING_DIM).fill(0.01)) }),
  }));
  try {
    const v = await embedQuery("x");
    assert.equal(v.length, EMBEDDING_DIM);
  } finally {
    setModuleLoaderForTests(null);
  }
});
