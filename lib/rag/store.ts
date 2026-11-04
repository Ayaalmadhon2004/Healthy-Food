import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toSearchText } from "@/lib/rag/normalize";
import { toVectorLiteral } from "@/lib/rag/fusion";
import type { ChunkInput } from "@/lib/rag/types";

const UPSERT_BATCH_SIZE = 50;

function row(chunk: ChunkInput, embedding: number[] | null): Prisma.Sql {
  const vector = embedding ? Prisma.sql`${toVectorLiteral(embedding)}::vector` : Prisma.sql`NULL::vector`;
  return Prisma.sql`(${chunk.sourceKey}, ${chunk.kind}, ${chunk.lang}, ${chunk.title}, ${chunk.content}, ${toSearchText(
    chunk.title,
    chunk.content,
  )}, ${chunk.sourceName ?? null}, ${chunk.sourceUrl ?? null}, ${chunk.sourceDate ?? null}, ${vector}, NOW(), NOW())`;
}

/**
 * Insert or update chunks keyed on sourceKey. A null embedding never wipes an existing one unless the
 * title or content changed (then the old vector would be stale, so it is cleared). Returns how many
 * chunks were written.
 */
export async function upsertChunks(chunks: ChunkInput[], embeddings: (number[] | null)[]): Promise<number> {
  if (chunks.length !== embeddings.length) {
    throw new Error(`upsertChunks: ${chunks.length} chunks but ${embeddings.length} embeddings`);
  }
  // A duplicate sourceKey inside one INSERT would make Postgres reject the statement; last one wins.
  const bySource = new Map<string, { chunk: ChunkInput; embedding: number[] | null }>();
  chunks.forEach((chunk, i) => bySource.set(chunk.sourceKey, { chunk, embedding: embeddings[i] ?? null }));
  const items = [...bySource.values()];

  for (let start = 0; start < items.length; start += UPSERT_BATCH_SIZE) {
    const rows = items.slice(start, start + UPSERT_BATCH_SIZE).map((i) => row(i.chunk, i.embedding));
    await prisma.$executeRaw`
      INSERT INTO knowledge_chunks
        ("sourceKey", "kind", "lang", "title", "content", "searchText", "sourceName", "sourceUrl", "sourceDate", "embedding", "createdAt", "updatedAt")
      VALUES ${Prisma.join(rows)}
      ON CONFLICT ("sourceKey") DO UPDATE SET
        "kind" = EXCLUDED."kind",
        "lang" = EXCLUDED."lang",
        "title" = EXCLUDED."title",
        "content" = EXCLUDED."content",
        "searchText" = EXCLUDED."searchText",
        "sourceName" = EXCLUDED."sourceName",
        "sourceUrl" = EXCLUDED."sourceUrl",
        "sourceDate" = EXCLUDED."sourceDate",
        "embedding" = CASE
          WHEN EXCLUDED."embedding" IS NOT NULL THEN EXCLUDED."embedding"
          WHEN knowledge_chunks."title" = EXCLUDED."title" AND knowledge_chunks."content" = EXCLUDED."content"
            THEN knowledge_chunks."embedding"
          ELSE NULL
        END,
        "updatedAt" = NOW()`;
  }
  return items.length;
}

export async function countChunks(): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) AS count FROM knowledge_chunks`;
  return Number(rows[0]?.count ?? 0);
}
