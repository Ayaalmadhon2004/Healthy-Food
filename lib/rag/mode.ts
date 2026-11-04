// Which retriever runs. "memory" (default) needs no model and no pgvector; "pgvector" is the database-side hybrid
// search with local e5 embeddings, kept for a knowledge base too large to score in memory.
export type RetrieverMode = "memory" | "pgvector";

export function retrieverMode(env: NodeJS.ProcessEnv = process.env): RetrieverMode {
  return env.RAG_RETRIEVER?.trim().toLowerCase() === "pgvector" ? "pgvector" : "memory";
}
