// Optional free generator: Google Gemini through its REST API (free tier, key from Google AI Studio).
// No SDK; plain fetch so there is nothing to pay for or install. Never throws: failures arrive as an "error" event.
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { CHAT_MAX_TOKENS } from "@/lib/rag/constants";
import type { AnswerGenerator, GenerateInput } from "@/lib/rag/generate";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
/** Override with GEMINI_MODEL; free-tier model names change, so this is only a default. */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 45_000;
const HTTP_OK = 200;

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

interface GeminiChunk {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
}

/** Plain text of a message whose content is a string or a list of blocks. */
function textOf(content: MessageParam["content"]): string {
  if (typeof content === "string") return content;
  return content.map((block) => (block.type === "text" ? block.text : "")).join("");
}

/** The `data:` JSON of one SSE line, or null for anything else (comments, blanks, bad JSON). */
export function parseGeminiLine(line: string): GeminiChunk | null {
  if (!line.startsWith("data:")) return null;
  try {
    return JSON.parse(line.slice("data:".length).trim()) as GeminiChunk;
  } catch {
    return null;
  }
}

export function createGeminiGenerator(fetchImpl: FetchLike = fetch, env: NodeJS.ProcessEnv = process.env): AnswerGenerator {
  return async function* generateWithGemini(input: GenerateInput) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      yield { type: "error", code: "unavailable" } as const;
      return;
    }
    const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const signal = input.signal ? AbortSignal.any([input.signal, timeout]) : timeout;
    try {
      const response = await fetchImpl(`${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: input.system.map((b) => b.text).join("\n") }] },
          contents: input.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: textOf(m.content) }] })),
          generationConfig: { maxOutputTokens: CHAT_MAX_TOKENS },
        }),
      });
      if (response.status !== HTTP_OK || !response.body) {
        console.error("chat: gemini request failed with status", response.status);
        yield { type: "error", code: "unavailable" } as const;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finish: string | undefined;
      for (let read = await reader.read(); !read.done; read = await reader.read()) {
        buffer += decoder.decode(read.value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const chunk = parseGeminiLine(line);
          const candidate = chunk?.candidates?.[0];
          const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
          if (text) yield { type: "delta", text } as const;
          if (candidate?.finishReason) finish = candidate.finishReason;
        }
      }
      if (finish === "SAFETY" || finish === "BLOCKLIST" || finish === "PROHIBITED_CONTENT") yield { type: "delta", text: `\n\n${input.notes.refusal}` } as const;
      else if (finish === "MAX_TOKENS") yield { type: "delta", text: `\n\n${input.notes.truncated}` } as const;
    } catch (error) {
      if (input.signal?.aborted) return;
      console.error("chat: gemini failed:", error instanceof Error ? error.name : typeof error);
      yield { type: "error", code: "unavailable" } as const;
    }
  };
}
