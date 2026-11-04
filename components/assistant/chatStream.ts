import type { ChatEvent, ChatRequest } from "@/lib/rag/types";
import { createIdleTimer, STREAM_IDLE_TIMEOUT_MS } from "./idleTimer";
import { flushSse, parseSseChunk } from "./sseParser";

type ErrorEvent = Extract<ChatEvent, { type: "error" }>;

/**
 * Reads POST /api/chat and calls `onEvent` for every event as soon as it arrives. Throws on network failure or when
 * the caller aborts. A stream that goes quiet for STREAM_IDLE_TIMEOUT_MS is aborted and reported as "unavailable".
 */
export async function streamChat(request: ChatRequest, signal: AbortSignal, onEvent: (event: ChatEvent) => void): Promise<void> {
  const inner = new AbortController();
  const forwardAbort = (): void => inner.abort();
  if (signal.aborted) inner.abort();
  else signal.addEventListener("abort", forwardAbort, { once: true });

  let stalled = false;
  const idle = createIdleTimer(STREAM_IDLE_TIMEOUT_MS, () => {
    stalled = true;
    inner.abort();
  });

  let sawTerminal = false;
  const emit = (event: ChatEvent): void => {
    if (event.type === "done" || event.type === "error") sawTerminal = true;
    onEvent(event);
  };

  try {
    await readStream(request, inner.signal, emit, idle.reset);
  } catch (error) {
    if (!stalled || signal.aborted) throw error;
    // The user did not stop it; it just went quiet.
  } finally {
    idle.stop();
    signal.removeEventListener("abort", forwardAbort);
  }

  if (!sawTerminal && !signal.aborted) emit({ type: "error", code: "unavailable" });
}

async function readStream(request: ChatRequest, signal: AbortSignal, emit: (event: ChatEvent) => void, onActivity: () => void): Promise<void> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(request),
    signal,
  });
  onActivity();

  if (!response.body) {
    emit(errorFromStatus(response.status, response.headers.get("Retry-After")));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sawTerminal = false;
  const track = (event: ChatEvent): void => {
    if (event.type === "done" || event.type === "error") sawTerminal = true;
    emit(event);
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      onActivity();
      const parsed = parseSseChunk(buffer, decoder.decode(value, { stream: true }));
      buffer = parsed.rest;
      parsed.events.forEach(track);
    }
    flushSse(buffer + decoder.decode()).forEach(track);
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
