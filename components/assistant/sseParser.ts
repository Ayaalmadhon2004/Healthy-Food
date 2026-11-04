import type { ChatEvent } from "@/lib/rag/types";

// Pure parser for the POST /api/chat stream: events are `data: <json>` blocks separated by a blank line.
// A network chunk can end in the middle of an event (even in the middle of the JSON), so the caller keeps
// the returned `rest` and passes it back with the next chunk.

const EVENT_TYPES = new Set(["meta", "delta", "done", "error"]);
const MODES = new Set(["answer", "no_context", "emergency", "out_of_scope"]);
const ERROR_CODES = new Set(["rate_limited", "invalid_request", "unavailable"]);

export interface SseParseResult {
  events: ChatEvent[];
  /** Text after the last complete event; pass it back in front of the next chunk. */
  rest: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toCitations(value: unknown): Extract<ChatEvent, { type: "meta" }>["citations"] {
  if (!Array.isArray(value)) return [];
  const out: Extract<ChatEvent, { type: "meta" }>["citations"] = [];
  for (const raw of value) {
    if (!isRecord(raw) || typeof raw.title !== "string") continue;
    const str = (v: unknown): string | null => (typeof v === "string" && v ? v : null);
    out.push({
      id: typeof raw.id === "number" ? raw.id : out.length,
      kind: (typeof raw.kind === "string" ? raw.kind : "DOCUMENT") as never,
      title: raw.title,
      sourceName: str(raw.sourceName),
      sourceUrl: str(raw.sourceUrl),
      sourceDate: str(raw.sourceDate),
    });
  }
  return out;
}

/** Turns one decoded JSON value into a ChatEvent, or null when it is not one we know. */
export function toChatEvent(value: unknown): ChatEvent | null {
  if (!isRecord(value) || typeof value.type !== "string" || !EVENT_TYPES.has(value.type)) return null;
  switch (value.type) {
    case "meta":
      if (typeof value.mode !== "string" || !MODES.has(value.mode)) return null;
      return { type: "meta", mode: value.mode as never, citations: toCitations(value.citations) };
    case "delta":
      return typeof value.text === "string" ? { type: "delta", text: value.text } : null;
    case "done":
      return { type: "done" };
    default: {
      if (typeof value.code !== "string" || !ERROR_CODES.has(value.code)) return null;
      const retryAfter = typeof value.retryAfter === "number" && Number.isFinite(value.retryAfter) ? value.retryAfter : undefined;
      return { type: "error", code: value.code as never, ...(retryAfter === undefined ? {} : { retryAfter }) };
    }
  }
}

/** Parses everything complete in `buffer + chunk`. Malformed or unknown events are skipped, never thrown. */
export function parseSseChunk(buffer: string, chunk: string): SseParseResult {
  const text = (buffer + chunk).replace(/\r\n?/g, "\n");
  const blocks = text.split("\n\n");
  const rest = blocks.pop() ?? "";
  const events: ChatEvent[] = [];

  for (const block of blocks) {
    const data = block
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""))
      .join("\n");
    if (!data) continue;
    try {
      const event = toChatEvent(JSON.parse(data));
      if (event) events.push(event);
    } catch {
      // malformed JSON: skip this event only
    }
  }
  return { events, rest };
}

/** Call when the stream has ended: a final event that lacked its closing blank line is still parsed. */
export function flushSse(buffer: string): ChatEvent[] {
  return parseSseChunk(buffer, "\n\n").events;
}
