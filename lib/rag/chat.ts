// Orchestrator: triage -> retrieve -> (decline | generate). Emits the ChatEvent protocol documented in ./types.
import { getServerMessages } from "@/lib/i18n";
import type { ServerMessages } from "@/lib/i18n";
import { MIN_RELEVANCE, RETRIEVE_TIMEOUT_MS, RETRIEVE_TOP_K } from "@/lib/rag/constants";
import { generate as defaultGenerate } from "@/lib/rag/providers";
import type { AnswerGenerator } from "@/lib/rag/generate";
import { buildPrompt, uniqueChunks } from "@/lib/rag/prompt";
import { triage } from "@/lib/rag/safety";
import type { ChatEvent, ChatRequest, Citation, Lang, RetrieveOptions, RetrievedChunk } from "@/lib/rag/types";

export type Retriever = (question: string, options: RetrieveOptions) => Promise<RetrievedChunk[]>;

export interface ChatDeps {
  retrieve?: Retriever;
  generate?: AnswerGenerator;
  getMessages?: (lang: Lang) => Promise<ServerMessages["chat"]>;
  /** Aborts the upstream model call when the visitor disconnects. */
  signal?: AbortSignal;
}

const defaultRetrieve: Retriever = async (question, options) => (await import("@/lib/rag/retrieve")).retrieve(question, options);
const defaultGetMessages = async (lang: Lang): Promise<ServerMessages["chat"]> => (await getServerMessages(lang)).chat;

/** Rejects if `work` takes longer than `ms`, so a stuck database or model download cannot hang the stream. */
async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("retrieval timed out")), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export function toCitation(chunk: RetrievedChunk): Citation {
  return {
    id: chunk.id,
    kind: chunk.kind,
    title: chunk.title,
    sourceName: chunk.sourceName,
    sourceUrl: chunk.sourceUrl,
    sourceDate: chunk.sourceDate,
  };
}

/** One Server-Sent-Events frame. */
export function encodeSseEvent(event: ChatEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function* fixedReply(mode: "emergency" | "out_of_scope" | "no_context", text: string): Generator<ChatEvent> {
  yield { type: "meta", mode, citations: [] };
  yield { type: "delta", text };
  yield { type: "done" };
}

export async function* runChat(req: ChatRequest, deps: ChatDeps = {}): AsyncGenerator<ChatEvent> {
  const { question, lang, history } = req;
  const { retrieve = defaultRetrieve, generate = defaultGenerate, getMessages = defaultGetMessages, signal } = deps;
  const m = await getMessages(lang);

  // 1. Safety first: fixed replies, no retrieval and no model call.
  const verdict = triage(question, lang);
  if (verdict === "emergency") {
    yield* fixedReply("emergency", `${m.emergency}\n\n${m.emergencyDoctors}`);
    return;
  }
  if (verdict === "out_of_scope") {
    yield* fixedReply("out_of_scope", m.outOfScope);
    return;
  }

  // 2. Retrieve. Any failure of the knowledge store reads as "unavailable"; the cause is logged without the question.
  let chunks: RetrievedChunk[];
  try {
    const found = await withTimeout(retrieve(question, { lang, topK: RETRIEVE_TOP_K, minScore: MIN_RELEVANCE }), RETRIEVE_TIMEOUT_MS);
    chunks = uniqueChunks(found.filter((c) => c.score >= MIN_RELEVANCE)).slice(0, RETRIEVE_TOP_K);
  } catch (error) {
    console.error("chat: retrieval failed:", error instanceof Error ? error.name : typeof error);
    yield { type: "meta", mode: "answer", citations: [] };
    yield { type: "error", code: "unavailable" };
    return;
  }

  // 3. Nothing relevant: decline plainly instead of letting the model guess.
  if (chunks.length === 0) {
    yield* fixedReply("no_context", m.noContext);
    return;
  }

  // 4. Generate from exactly these passages; citations[i] is passage [i + 1].
  const prompt = buildPrompt({ question, lang, chunks, history });
  yield { type: "meta", mode: "answer", citations: prompt.passages.map(toCitation) };

  const events = generate({ system: prompt.system, messages: prompt.messages, notes: { refusal: m.refusal, truncated: m.truncated }, passages: prompt.passages, question, lang, disclaimer: m.disclaimer, signal });
  const iterator = events[Symbol.asyncIterator]();
  try {
    let next = await iterator.next();
    while (!next.done) {
      if (signal?.aborted) return;
      const event = next.value;
      if (event.type === "error") {
        yield { type: "error", code: event.code };
        return;
      }
      yield { type: "delta", text: event.text };
      next = await iterator.next();
    }
    yield { type: "done" };
  } finally {
    await iterator.return?.();
  }
}
