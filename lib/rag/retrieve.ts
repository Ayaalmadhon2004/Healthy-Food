// Hybrid retrieval: pgvector cosine search + Postgres full-text, merged with Reciprocal Rank Fusion and
// mapped to a 0..1 score (calibration in fusion.ts). Without an embedding it is full-text only.
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MIN_RELEVANCE, RETRIEVE_TOP_K } from "@/lib/rag/constants";
import type { KnowledgeKind } from "@/lib/rag/constants";
import { embedQuery } from "@/lib/rag/embed";
import { buildTsQuery, dedupeByStem, reciprocalRankFusion, relevanceScore, toVectorLiteral } from "@/lib/rag/fusion";
import { toTsQueryTerms } from "@/lib/rag/normalize";
import type { Lang, RetrieveOptions, RetrievedChunk } from "@/lib/rag/types";

export class KnowledgeStoreUnavailableError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("The knowledge store is unavailable", options);
    this.name = "KnowledgeStoreUnavailableError";
  }
}

const MIN_CANDIDATES = 20;
const CANDIDATE_FACTOR = 4;

interface ChunkRow {
  id: number;
  sourceKey: string;
  kind: string;
  lang: string;
  title: string;
  content: string;
  sourceName: string | null;
  sourceUrl: string | null;
  sourceDate: string | null;
}
interface VectorRow extends ChunkRow {
  cosine: number;
}
interface LexicalRow extends ChunkRow {
  rank: number;
  cosine: number | null;
}

async function vectorSearch(vector: number[], limit: number): Promise<VectorRow[]> {
  const literal = toVectorLiteral(vector);
  return prisma.$queryRaw<VectorRow[]>`
    SELECT "id", "sourceKey", "kind", "lang", "title", "content", "sourceName", "sourceUrl", "sourceDate",
           (1 - ("embedding" <=> ${literal}::vector))::float8 AS "cosine"
    FROM knowledge_chunks
    WHERE "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${literal}::vector
    LIMIT ${limit}`;
}

async function lexicalSearch(tsQuery: string, vector: number[] | null, limit: number): Promise<LexicalRow[]> {
  const cosine = vector
    ? Prisma.sql`CASE WHEN "embedding" IS NULL THEN NULL ELSE (1 - ("embedding" <=> ${toVectorLiteral(vector)}::vector))::float8 END`
    : Prisma.sql`NULL::float8`;
  return prisma.$queryRaw<LexicalRow[]>`
    SELECT "id", "sourceKey", "kind", "lang", "title", "content", "sourceName", "sourceUrl", "sourceDate",
           ts_rank_cd(to_tsvector('simple', "searchText"), q.query)::float8 AS "rank",
           ${cosine} AS "cosine"
    FROM knowledge_chunks, (SELECT to_tsquery('simple', ${tsQuery}) AS query) q
    WHERE to_tsvector('simple', "searchText") @@ q.query
    ORDER BY "rank" DESC
    LIMIT ${limit}`;
}

export async function retrieve(question: string, opts: RetrieveOptions): Promise<RetrievedChunk[]> {
  const topK = opts.topK ?? RETRIEVE_TOP_K;
  const minScore = opts.minScore ?? MIN_RELEVANCE;
  const limit = Math.max(MIN_CANDIDATES, topK * CANDIDATE_FACTOR);
  const tsQuery = buildTsQuery(toTsQueryTerms(question));

  const vector = await embedQuery(question); // null => full-text only

  let vectorRows: VectorRow[] = [];
  let lexicalRows: LexicalRow[] = [];
  try {
    [vectorRows, lexicalRows] = await Promise.all([
      vector ? vectorSearch(vector, limit) : Promise.resolve([]),
      tsQuery ? lexicalSearch(tsQuery, vector, limit) : Promise.resolve([]),
    ]);
  } catch (error) {
    throw new KnowledgeStoreUnavailableError({ cause: error });
  }

  const fused = reciprocalRankFusion([vectorRows.map((r) => r.id), lexicalRows.map((r) => r.id)]);
  const listCount = (vector ? 1 : 0) + (tsQuery ? 1 : 0);

  const byId = new Map<number, { row: ChunkRow; cosine: number | null; lexicalRank: number | null }>();
  for (const r of vectorRows) byId.set(r.id, { row: r, cosine: r.cosine, lexicalRank: null });
  for (const r of lexicalRows) {
    const existing = byId.get(r.id);
    if (existing) existing.lexicalRank = r.rank;
    else byId.set(r.id, { row: r, cosine: r.cosine, lexicalRank: r.rank });
  }

  const scored: RetrievedChunk[] = [...byId.values()].map(({ row, cosine, lexicalRank }) => ({
    id: row.id,
    sourceKey: row.sourceKey,
    kind: row.kind as KnowledgeKind,
    lang: row.lang as Lang,
    title: row.title,
    content: row.content,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    sourceDate: row.sourceDate,
    score: relevanceScore({
      cosine,
      // With a query vector, a chunk the full-text search did not return simply has no lexical evidence.
      lexicalRank: lexicalRank ?? (tsQuery ? 0 : null),
      rrf: fused.get(row.id) ?? 0,
      listCount,
      preferredLang: row.lang === opts.lang,
    }),
  }));

  scored.sort((a, b) => b.score - a.score);
  return dedupeByStem(scored, opts.lang)
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
