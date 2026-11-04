import { z } from "zod";
import type { Lang } from "@/lib/types";
import { MAX_HISTORY_MESSAGE_CHARS, MAX_HISTORY_TURNS, MAX_QUESTION_CHARS, MESSAGES_PER_TURN } from "@/lib/rag/constants";
import type { KnowledgeKind } from "@/lib/rag/constants";

export type { Lang, KnowledgeKind };

/** A passage as it is written to the knowledge base (before it has an embedding). */
export interface ChunkInput {
  sourceKey: string;
  kind: KnowledgeKind;
  lang: Lang;
  title: string;
  content: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceDate?: string;
}

/** A passage returned by retrieval. `score` is 0..1, higher is more relevant. */
export interface RetrievedChunk {
  id: number;
  sourceKey: string;
  kind: KnowledgeKind;
  lang: Lang;
  title: string;
  content: string;
  sourceName: string | null;
  sourceUrl: string | null;
  sourceDate: string | null;
  score: number;
}

export interface RetrieveOptions {
  /** Language of the question; passages in this language are preferred but the other language is still searched. */
  lang: Lang;
  topK?: number;
  minScore?: number;
}

/** What a citation looks like to the UI. */
export interface Citation {
  id: number;
  kind: KnowledgeKind;
  title: string;
  sourceName: string | null;
  sourceUrl: string | null;
  sourceDate: string | null;
}

/** Body of POST /api/chat. */
export const chatRequestSchema = z.object({
  question: z.string().trim().min(1).max(MAX_QUESTION_CHARS),
  lang: z.enum(["ar", "en"]),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(MAX_HISTORY_MESSAGE_CHARS) }))
    .max(MAX_HISTORY_TURNS * MESSAGES_PER_TURN)
    .default([]),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * POST /api/chat answers with a Server-Sent-Events stream. Each event is `data: <JSON>\n\n` where the JSON is a ChatEvent:
 *  - one "meta" first (what kind of answer this is and the sources used),
 *  - then zero or more "delta" with text pieces in order,
 *  - then exactly one "done", or one "error" instead.
 */
export type ChatAnswerMode = "answer" | "no_context" | "emergency" | "out_of_scope" | "greeting";

export type ChatEvent =
  | { type: "meta"; mode: ChatAnswerMode; citations: Citation[] }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; code: "rate_limited" | "invalid_request" | "unavailable"; retryAfter?: number };
