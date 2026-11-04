import type { ChatAnswerMode, Citation } from "@/lib/rag/types";
import type { Lang } from "@/lib/types";

/** The "assistant" section of locales/*.json. */
export interface AssistantDict {
  title: string;
  subtitle: string;
  disclaimer_title: string;
  disclaimer: string;
  empty_title: string;
  empty_text: string;
  suggestions_label: string;
  suggestions: string[];
  input_label: string;
  input_placeholder: string;
  input_hint: string;
  send: string;
  stop: string;
  new_chat: string;
  you: string;
  assistant: string;
  loading: string;
  status_answering: string;
  status_ready: string;
  thinking: string;
  stopped: string;
  sources: string;
  open_source: string;
  jump_to_source: string;
  modes: { emergency: string; no_context: string; out_of_scope: string };
  retry: string;
  errors: { rate_limited: string; unavailable: string; network: string; invalid_request: string };
}

export type ChatErrorCode = "rate_limited" | "invalid_request" | "unavailable" | "network";

export interface ChatError {
  code: ChatErrorCode;
  retryAfter?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: ChatAnswerMode;
  citations: Citation[];
  status: "streaming" | "done" | "stopped" | "error";
  error?: ChatError;
}

export interface MessageLabels {
  t: AssistantDict;
  lang: Lang;
}
