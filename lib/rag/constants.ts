// Shared tunables of the nutrition assistant. Change them here, never inline.

/** Output size of the local multilingual embedding model (Xenova/multilingual-e5-small). */
export const EMBEDDING_DIM = 384;
export const EMBEDDING_MODEL = "Xenova/multilingual-e5-small";

/** Cheapest current Claude model; the answer comes from retrieved context so it is enough. */
export const CHAT_MODEL = "claude-haiku-5-5";
/** Hard cap on one answer. Keeps cost and latency bounded. */
export const CHAT_MAX_TOKENS = 1200;

export const KNOWLEDGE_KINDS = ["RECIPE", "TIP", "KITCHEN", "GUIDE", "DOCUMENT"] as const;
export type KnowledgeKind = (typeof KNOWLEDGE_KINDS)[number];

/** How many passages go into the prompt. */
export const RETRIEVE_TOP_K = 6;
/** Passages scoring below this (0..1, higher is better) are dropped; if none remain the assistant declines. */
export const MIN_RELEVANCE = 0.35;

/** A question is limited to this many characters; the conversation to this many turns. */
export const MAX_QUESTION_CHARS = 600;
export const MAX_HISTORY_TURNS = 6;

/** Per signed-in user or IP: this many questions per window. */
export const CHAT_RATE_LIMIT = { limit: 15, windowMs: 10 * 60 * 1000 } as const;
