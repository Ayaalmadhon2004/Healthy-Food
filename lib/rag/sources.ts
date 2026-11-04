// Prisma is imported lazily so loading curated documents (and --dry-run) never touches the database.
// Reads the app's own rows and the curated documents and returns them as ChunkInput[].
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { curatedToChunks, kitchenToChunks, recipeToChunks, tipToChunks, validateCuratedDocument } from "@/lib/rag/chunking";
import type { CuratedDocument } from "@/lib/rag/chunking";
import type { ChunkInput } from "@/lib/rag/types";

export const KNOWLEDGE_DIR = path.join(process.cwd(), "data", "knowledge");

export async function recipeChunks(): Promise<ChunkInput[]> {
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.foodRecipe.findMany({ orderBy: { id: "asc" } });
  return rows.flatMap(recipeToChunks);
}

export async function tipChunks(): Promise<ChunkInput[]> {
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.healthTip.findMany({ orderBy: { id: "asc" } });
  return rows.flatMap(tipToChunks);
}

export async function kitchenChunks(): Promise<ChunkInput[]> {
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.kitchen.findMany({ orderBy: { id: "asc" } });
  return rows.flatMap(kitchenToChunks);
}

/** Every document in data/knowledge/*.json, validated. Returns problems instead of throwing so callers can report all of them. */
export async function loadCuratedDocuments(
  dir: string = KNOWLEDGE_DIR,
): Promise<{ documents: CuratedDocument[]; problems: string[] }> {
  const documents: CuratedDocument[] = [];
  const problems: string[] = [];
  const seen = new Set<string>();
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return { documents, problems: [`${dir}: folder not found`] };
  }
  for (const file of files) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(path.join(dir, file), "utf8"));
    } catch {
      problems.push(`${file}: invalid JSON`);
      continue;
    }
    if (!Array.isArray(parsed)) {
      problems.push(`${file}: must be an array of documents`);
      continue;
    }
    parsed.forEach((doc, i) => {
      const where = `${file}[${i}]`;
      const issues = validateCuratedDocument(doc, where);
      if (issues.length) {
        problems.push(...issues);
        return;
      }
      const d = doc as CuratedDocument;
      if (seen.has(d.id)) {
        problems.push(`${where}: duplicate id "${d.id}"`);
        return;
      }
      seen.add(d.id);
      documents.push(d);
    });
  }
  return { documents, problems };
}

export async function curatedChunks(dir?: string): Promise<ChunkInput[]> {
  const { documents, problems } = await loadCuratedDocuments(dir);
  if (problems.length) throw new Error(`Invalid curated documents:\n${problems.join("\n")}`);
  return documents.flatMap(curatedToChunks);
}
