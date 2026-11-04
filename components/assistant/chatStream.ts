import type { ChatEvent, ChatRequest } from "@/lib/rag/types";
import { flushSse, parseSseChunk } from "./sseParser";

type ErrorEvent = Extract<ChatEvent, { type: "error" }>;

/** Reads POST /api/chat and calls `onEvent` for every event as soon as it arrives. Throws on network failure/abort. */
export async function streamChat(request: ChatRequest, signal: AbortSignal, onEvent: (event: ChatEvent) => void): Promise<void> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(request),
    signal,
  });

  let sawTerminal = false;
  const emit = (event: ChatEvent): void => {
    if (event.type === "done" || event.type === "error") sawTerminal = true;
    onEvent(event);
  };

  if (!response.body) {
    emit(errorFromStatus(response.status, response.headers.get("Retry-After")));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const parsed = parseSseChunk(buffer, decoder.decode(value, { stream: true }));
      buffer = parsed.rest;
      parsed.events.forEach(emit);
    }
    flushSse(buffer + decoder.decode()).forEach(emit);
  } finally {
    reader.releaseLock();
  }

  if (!sawTerminal) {
    // Error status without a readable event, or a stream cut off before "done".
    emit(response.ok ? { type: "error", code: "unavailable" } : errorFromStatus(response.status, response.headers.get("Retry-After")));
  }
}

function errorFromStatus(status: number, retryAfterHeader: string | null): ErrorEvent {
  if (status === 429) {
    const seconds = Number(retryAfterHeader);
    return { type: "error", code: "rate_limited", ...(Number.isFinite(seconds) && seconds > 0 ? { retryAfter: seconds } : {}) };
  }
  if (status === 400) return { type: "error", code: "invalid_request" };
  return { type: "error", code: "unavailable" };
}
