// Claude generation. Uses only the official SDK. The client is built lazily so importing this file never throws,
// and can be replaced in tests (`createGenerator(fakeClient)`); nothing here talks to the network at import time.
import Anthropic, { APIConnectionError, APIError, AuthenticationError, RateLimitError } from "@anthropic-ai/sdk";
import type { MessageParam, MessageStreamEvent, StopReason, TextBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { CHAT_MAX_TOKENS, CHAT_MODEL } from "@/lib/rag/constants";

const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 1;

export interface GenerateInput {
  system: TextBlockParam[];
  messages: MessageParam[];
  /** Localized fixed notes appended when the model refuses or is cut off. */
  notes: { refusal: string; truncated: string };
  signal?: AbortSignal;
}

export type GenerateEvent = { type: "delta"; text: string } | { type: "error"; code: "unavailable" };

/** Turns one prepared prompt into text deltas. Never throws: failures arrive as an "error" event. */
export type AnswerGenerator = (input: GenerateInput) => AsyncIterable<GenerateEvent>;

/** The slice of the SDK client that we use; the real `Anthropic` client satisfies it. */
export interface AnthropicLike {
  messages: {
    stream(
      body: {
        model: string;
        max_tokens: number;
        system: TextBlockParam[];
        messages: MessageParam[];
      },
      options?: { signal?: AbortSignal; timeout?: number; maxRetries?: number },
    ): AsyncIterable<MessageStreamEvent> & {
      finalMessage(): Promise<{ stop_reason: StopReason | null }>;
      abort?(): void;
    };
  };
}

let cachedClient: Anthropic | null = null;

/** Builds the real client on first use; null when no API key is configured. */
function getClient(): AnthropicLike | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  cachedClient ??= new Anthropic({ apiKey });
  return cachedClient;
}

/** Name and HTTP status only: never the message, which could echo request content. */
function describeError(error: unknown): string {
  const name = error instanceof Error ? error.name : typeof error;
  const status = error instanceof APIError ? error.status : undefined;
  return status ? `${name} (${status})` : name;
}

/**
 * Most specific first: rate limit and bad credentials are API errors too, and connection errors carry no status.
 * All of them reach the user as the same generic "unavailable"; the distinction is only for the server log.
 */
function classify(error: unknown): "unavailable" {
  if (error instanceof RateLimitError) console.error("chat: Anthropic rate limit", describeError(error));
  else if (error instanceof AuthenticationError) console.error("chat: Anthropic authentication failed (check ANTHROPIC_API_KEY)");
  else if (error instanceof APIConnectionError) console.error("chat: cannot reach Anthropic", describeError(error));
  else if (error instanceof APIError) console.error("chat: Anthropic API error", describeError(error));
  else console.error("chat: generation failed", describeError(error));
  return "unavailable";
}

export function createGenerator(getAnthropic: () => AnthropicLike | null = getClient): AnswerGenerator {
  return async function* generate(input) {
    const client = getAnthropic();
    if (!client) {
      console.error("chat: ANTHROPIC_API_KEY is not set");
      yield { type: "error", code: "unavailable" };
      return;
    }

    // Only the required parameters: no sampling knobs, prefill, thinking budget or forced tool use.
    const stream = client.messages.stream(
      { model: CHAT_MODEL, max_tokens: CHAT_MAX_TOKENS, system: input.system, messages: input.messages },
      { signal: input.signal, timeout: REQUEST_TIMEOUT_MS, maxRetries: MAX_RETRIES },
    );

    try {
      let emitted = false;
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta" && event.delta.text) {
          emitted = true;
          yield { type: "delta", text: event.delta.text };
        }
      }
      const { stop_reason } = await stream.finalMessage();
      if (stop_reason === "refusal") {
        yield { type: "delta", text: (emitted ? "\n\n" : "") + input.notes.refusal };
      } else if (stop_reason === "max_tokens" || stop_reason === "model_context_window_exceeded") {
        yield { type: "delta", text: (emitted ? "\n\n" : "") + input.notes.truncated };
      } else if (!emitted) {
        yield { type: "error", code: "unavailable" };
      }
    } catch (error) {
      // The visitor left: nothing to report to anyone.
      if (input.signal?.aborted) return;
      yield { type: "error", code: classify(error) };
    } finally {
      // Consumer stopped early (client disconnect): cancel the upstream request so it stops billing.
      stream.abort?.();
    }
  };
}

/** The production generator. */
export const generate: AnswerGenerator = createGenerator();
