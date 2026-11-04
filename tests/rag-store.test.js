import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import "./helpers/register.mjs";

// Runs against the real Postgres (CI has one with pgvector). Skipped when there is no DATABASE_URL or the
// knowledge_chunks table has not been created yet. Every row uses kind "TEST" and is removed afterwards.
const { hasDatabase, prisma } = await import("./helpers/db.js");
const { upsertChunks, deleteStaleChunks } = await import("../lib/rag/store.ts");
const { hashEmbed } = await import("../lib/rag/ngram.ts");

let tableReady = false;
if (hasDatabase) {
  try {
    const rows = await prisma.$queryRaw`SELECT to_regclass('knowledge_chunks')::text AS t`;
    tableReady = Boolean(rows[0]?.t);
  } catch {
    tableReady = false;
  }
}
const skip = !hasDatabase || !tableReady ? "needs DATABASE_URL and the knowledge_chunks table (prisma db push)" : false;

const run = randomUUID();
const chunk = (n, extra = {}) => ({ sourceKey: `test:${run}:${n}:en`, kind: "TEST", lang: "en", title: `Title ${n}`, content: `Content number ${n} about boiling water safely.`, ...extra });
const count = async () => Number((await prisma.$queryRaw`SELECT COUNT(*) AS n FROM knowledge_chunks WHERE kind = 'TEST' AND "sourceKey" LIKE ${`test:${run}:%`}`)[0].n);

test("upsertChunks inserts, is idempotent, updates content and keeps vectors", { skip }, async () => {
  const chunks = [chunk(1), chunk(2), chunk(3)];
  try {
    assert.equal(await upsertChunks(chunks, chunks.map((c) => hashEmbed(c.content))), 3);
    assert.equal(await count(), 3);
    await upsertChunks(chunks, chunks.map(() => null));
    assert.equal(await count(), 3, "same keys must not create duplicates");
    const withVectors = Number((await prisma.$queryRaw`SELECT COUNT(*) AS n FROM knowledge_chunks WHERE "sourceKey" LIKE ${`test:${run}:%`} AND embedding IS NOT NULL`)[0].n);
    assert.equal(withVectors, 3, "a null embedding must not wipe an unchanged vector");

    await upsertChunks([chunk(1, { content: "Changed content for the first chunk" })], [null]);
    const row = (await prisma.$queryRaw`SELECT content, "searchText", embedding IS NULL AS "noVector" FROM knowledge_chunks WHERE "sourceKey" = ${chunk(1).sourceKey}`)[0];
    assert.equal(row.content, "Changed content for the first chunk");
    assert.ok(row.searchText.includes("changed content"));
    assert.equal(row.noVector, true, "a changed text invalidates its old vector");
  } finally {
    await prisma.$executeRaw`DELETE FROM knowledge_chunks WHERE "sourceKey" LIKE ${`test:${run}:%`}`;
  }
});

test("deleteStaleChunks removes only vanished chunks of the given kinds and refuses an empty keep list", { skip }, async () => {
  const chunks = [chunk(1), chunk(2), chunk(3)];
  try {
    await upsertChunks(chunks, chunks.map(() => null));
    assert.equal(await deleteStaleChunks(["TEST"], []), 0, "empty keep list deletes nothing");
    assert.equal(await count(), 3);
    assert.equal(await deleteStaleChunks(["OTHER"], [chunks[0].sourceKey]), 0, "other kinds are left alone");
    assert.equal(await count(), 3);
    const removed = await deleteStaleChunks(["TEST"], [chunks[0].sourceKey, `test:${run}:unrelated:en`]);
    assert.ok(removed >= 2, `removed ${removed}`);
    assert.equal(await count(), 1);
  } finally {
    await prisma.$executeRaw`DELETE FROM knowledge_chunks WHERE "sourceKey" LIKE ${`test:${run}:%`}`;
  }
});
