import { getServerMessages } from "@/lib/i18n";
import { getSessionUser } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { CHAT_RATE_LIMIT } from "@/lib/rag/constants";
import { encodeSseEvent, runChat } from "@/lib/rag/chat";
import { chatRequestSchema } from "@/lib/rag/types";
import type { ChatEvent } from "@/lib/rag/types";
import { toLang } from "@/lib/types";

export const runtime = "nodejs";
// Always dynamic: the answer depends on the request and must never be cached.
export const dynamic = "force-dynamic";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_TOO_MANY_REQUESTS = 429;

function sseResponse(events: AsyncIterator<ChatEvent>, abort: AbortController, status = HTTP_OK, extra: Record<string, string> = {}): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await events.next();
        if (next.done) controller.close();
        else controller.enqueue(encoder.encode(encodeSseEvent(next.value)));
      } catch (error) {
        // Never log the question; the error name is enough.
        console.error("chat: stream failed:", error instanceof Error ? error.name : typeof error);
        controller.enqueue(encoder.encode(encodeSseEvent({ type: "error", code: "unavailable" })));
        controller.close();
      }
    },
    async cancel() {
      abort.abort();
      await events.return?.();
    },
  });
  return new Response(body, { status, headers: { ...SSE_HEADERS, ...extra } });
}

async function* single(event: ChatEvent): AsyncGenerator<ChatEvent> {
  yield event;
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const requested = typeof payload === "object" && payload !== null && "lang" in payload ? (payload as { lang?: unknown }).lang : undefined;
    const m = await getServerMessages(toLang(typeof requested === "string" ? requested : undefined));
    return Response.json({ error: m.chat.invalidRequest }, { status: HTTP_BAD_REQUEST, headers: { "Cache-Control": "no-store" } });
  }

  // Guests are allowed: the key is the signed-in user when there is one, otherwise the client address.
  const user = await getSessionUser();
  const key = user ? `chat:user:${user.id}` : `chat:ip:${getClientIp(request)}`;
  const limit = await rateLimit(key, CHAT_RATE_LIMIT);
  const abort = new AbortController();
  if (!limit.ok) {
    return sseResponse(single({ type: "error", code: "rate_limited", retryAfter: limit.retryAfter }), abort, HTTP_TOO_MANY_REQUESTS, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  // Stop the upstream model call as soon as the visitor goes away.
  request.signal.addEventListener("abort", () => abort.abort(), { once: true });
  return sseResponse(runChat(parsed.data, { signal: abort.signal }), abort);
}
