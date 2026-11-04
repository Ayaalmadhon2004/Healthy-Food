// Builds every knowledge chunk (recipes, tips, kitchens, curated documents), embeds them and upserts.
//   npm run ingest               full run (needs DATABASE_URL and the embedding model)
//   npm run ingest -- --dry-run  validate + print counts; no database, no model, works offline
//   --dir <path>                 read curated documents from another folder (default data/knowledge)
import { loadCuratedDocuments, KNOWLEDGE_DIR } from "@/lib/rag/sources";
import { curatedToChunks } from "@/lib/rag/chunking";
import type { ChunkInput } from "@/lib/rag/types";

const BATCH = 16;
let usedDatabase = false;

function summarize(chunks: ChunkInput[]): string[] {
  const counts = new Map<string, number>();
  for (const c of chunks) {
    const key = `${c.kind}/${c.lang}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const lines = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, n]) => `  ${k.padEnd(14)} ${n}`);
  lines.push(`  ${"total".padEnd(14)} ${chunks.length}`);
  return lines;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const dirIndex = args.indexOf("--dir");
  const dir = dirIndex >= 0 ? args[dirIndex + 1] : KNOWLEDGE_DIR;

  const { documents, problems } = await loadCuratedDocuments(dir);
  if (problems.length) {
    console.error("Curated documents are invalid:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
    return;
  }
  const curated = documents.flatMap(curatedToChunks);

  if (dryRun) {
    console.log(`Dry run: ${documents.length} curated document(s) valid in ${dir}`);
    if (documents.length === 0) console.warn("Warning: no curated documents found.");
    console.log("Curated chunks:");
    for (const line of summarize(curated)) console.log(line);
    console.log("Recipes, tips and kitchens are read from the database on a real run; nothing was written.");
    return;
  }

  usedDatabase = true;
  const { recipeChunks, tipChunks, kitchenChunks } = await import("@/lib/rag/sources");
  const { embedPassages } = await import("@/lib/rag/embed");
  const { upsertChunks } = await import("@/lib/rag/store");

  const chunks = [...(await recipeChunks()), ...(await tipChunks()), ...(await kitchenChunks()), ...curated];
  console.log(`Built ${chunks.length} chunks:`);
  for (const line of summarize(chunks)) console.log(line);

  let stored = 0;
  let withoutVector = 0;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const embeddings = await embedPassages(batch.map((c) => c.content));
    withoutVector += embeddings.filter((e) => e === null).length;
    stored += await upsertChunks(batch, embeddings);
  }
  console.log(`Upserted ${stored} chunks.`);
  if (withoutVector) console.warn(`${withoutVector} chunk(s) have no embedding (embedder unavailable): full-text search only.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    // Close the pool opened by lib/prisma so the process can exit.
    if (usedDatabase) import("@/lib/prisma").then(({ prisma }) => prisma.$disconnect()).catch(() => undefined);
  });
