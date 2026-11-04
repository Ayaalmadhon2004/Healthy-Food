"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, Leaf, Send, Square, ShieldCheck, RotateCcw } from "lucide-react";
import { MAX_HISTORY_TURNS, MAX_QUESTION_CHARS } from "@/lib/rag/constants";
import type { ChatEvent, ChatRequest } from "@/lib/rag/types";
import type { Lang } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import { streamChat } from "./chatStream";
import type { AssistantDict, ChatMessage } from "./types";

const DRAFT_KEY = "assistant-draft";
const MAX_HISTORY_CONTENT = 4000;
const NEAR_BOTTOM_PX = 160;

let counter = 0;
const nextId = (): string => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

function readDraft(): string {
  try {
    return window.sessionStorage.getItem(DRAFT_KEY) ?? "";
  } catch {
    return "";
  }
}
function writeDraft(value: string): void {
  try {
    if (value) window.sessionStorage.setItem(DRAFT_KEY, value);
    else window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // storage unavailable: the draft just isn't remembered
  }
}

function buildHistory(messages: ChatMessage[]): ChatRequest["history"] {
  return messages
    .filter((m) => m.status === "done" && m.content.trim())
    .slice(-MAX_HISTORY_TURNS * 2)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CONTENT) }));
}

interface Props {
  lang: Lang;
  t: AssistantDict;
}

export default function AssistantChat({ lang, t }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  // Restore an unsent draft once after mount (never during render, so server and client HTML agree).
  useEffect(() => {
    setDraft(readDraft());
  }, []);
  useEffect(() => () => abortRef.current?.abort(), []);

  // Keep the newest text in view while it streams, unless the reader scrolled up.
  useEffect(() => {
    const onScroll = (): void => {
      stickRef.current = document.documentElement.scrollHeight - window.scrollY - window.innerHeight < NEAR_BOTTOM_PX;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!stickRef.current || messages.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
  }, [messages]);

  const patch = useCallback((id: string, change: (m: ChatMessage) => ChatMessage) => {
    setMessages((all) => all.map((m) => (m.id === id ? change(m) : m)));
  }, []);

  const ask = useCallback(
    async (rawQuestion: string, base: ChatMessage[]) => {
      const question = rawQuestion.trim().slice(0, MAX_QUESTION_CHARS);
      if (!question || abortRef.current) return;

      const assistantId = nextId();
      const request: ChatRequest = { question, lang, history: buildHistory(base) };
      stickRef.current = true;
      setMessages([
        ...base,
        { id: nextId(), role: "user", content: question, citations: [], status: "done" },
        { id: assistantId, role: "assistant", content: "", citations: [], status: "streaming" },
      ]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const onEvent = (event: ChatEvent): void => {
        if (event.type === "meta") patch(assistantId, (m) => ({ ...m, mode: event.mode, citations: event.citations }));
        else if (event.type === "delta") patch(assistantId, (m) => ({ ...m, content: m.content + event.text }));
        else if (event.type === "done") patch(assistantId, (m) => ({ ...m, status: "done" }));
        else patch(assistantId, (m) => ({ ...m, status: "error", error: { code: event.code, retryAfter: event.retryAfter } }));
      };

      try {
        await streamChat(request, controller.signal, onEvent);
        patch(assistantId, (m) => (m.status === "streaming" ? { ...m, status: "done" } : m));
      } catch {
        patch(assistantId, (m) =>
          controller.signal.aborted
            ? { ...m, status: "stopped" }
            : { ...m, status: "error", error: { code: "network" } },
        );
      } finally {
        abortRef.current = null;
        setBusy(false);
        inputRef.current?.focus({ preventScroll: true });
      }
    },
    [lang, patch],
  );

  const submit = (): void => {
    if (busy || !draft.trim()) return;
    const question = draft;
    setDraft("");
    writeDraft("");
    void ask(question, messages);
  };

  const retry = (assistantId: string): void => {
    const index = messages.findIndex((m) => m.id === assistantId);
    const question = messages[index - 1];
    if (index < 1 || question?.role !== "user") return;
    void ask(question.content, messages.slice(0, index - 1));
  };

  const reset = (): void => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    setMessages([]);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const pickSuggestion = (text: string): void => {
    setDraft(text);
    inputRef.current?.focus();
  };

  const length = draft.length;
  const nearLimit = length > MAX_QUESTION_CHARS * 0.9;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-olive-300 bg-olive-50 p-4 flex gap-3 text-ink-soft">
        <ShieldCheck size={22} strokeWidth={1.75} aria-hidden="true" className="shrink-0 mt-0.5 text-olive-700" />
        <div>
          <p className="font-semibold text-ink">{t.disclaimer_title}</p>
          <p className="mt-1 text-[0.9375rem] leading-relaxed">{t.disclaimer}</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <section className="surface p-6 md:p-8" aria-labelledby="assistant-empty-title">
          <span className="flex w-11 h-11 items-center justify-center rounded-full bg-olive-100 text-olive-800">
            <Leaf size={22} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h2 id="assistant-empty-title" className="mt-4 text-xl md:text-2xl font-semibold text-ink">{t.empty_title}</h2>
          <p className="mt-1.5 text-ink-soft">{t.empty_text}</p>
          <h3 className="mt-6 mb-2 text-sm font-semibold text-ink-soft">{t.suggestions_label}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {t.suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  className="group w-full min-h-11 flex items-start justify-between gap-3 text-start rounded-md border border-line-strong px-3.5 py-3 text-ink hover:bg-paper-deep transition-colors"
                >
                  <span className="leading-snug">{s}</span>
                  <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 mt-0.5 text-olive-700 rtl:-scale-x-100" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="space-y-4">
          <div role="log" aria-live="polite" aria-relevant="additions text" className="space-y-4">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                t={t}
                lang={lang}
                canRetry={!busy && m.id === lastAssistant?.id}
                onRetry={() => retry(m.id)}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={reset} className="btn btn-quiet text-sm">
              <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" className="rtl:-scale-x-100" />
              {t.new_chat}
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={
          messages.length === 0
            ? "pb-4"
            : "sticky bottom-0 -mx-5 px-5 md:mx-0 md:px-0 pt-3 pb-3 bg-paper/95 backdrop-blur-sm border-t border-line md:border-t-0"
        }
      >
        <label htmlFor="assistant-input" className={messages.length === 0 ? "label" : "sr-only"}>{t.input_label}</label>
        <textarea
          id="assistant-input"
          ref={inputRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            writeDraft(e.target.value);
          }}
          onKeyDown={onKeyDown}
          maxLength={MAX_QUESTION_CHARS}
          rows={2}
          placeholder={t.input_placeholder}
          aria-describedby="assistant-input-hint"
          className="field resize-y max-h-48"
          dir="auto"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p id="assistant-input-hint" className="text-sm text-ink-mute">
            <span className="hidden sm:inline">{t.input_hint} · </span>
            <span className={nearLimit ? "text-clay-700 font-semibold" : ""} dir="ltr">
              {length} / {MAX_QUESTION_CHARS}
            </span>
          </p>
          {busy ? (
            <button type="button" onClick={() => abortRef.current?.abort()} className="btn btn-quiet shrink-0">
              <Square size={15} strokeWidth={1.75} aria-hidden="true" />
              {t.stop}
            </button>
          ) : (
            <button type="submit" disabled={!draft.trim()} className="btn btn-primary shrink-0">
              {t.send}
              <Send size={16} strokeWidth={1.75} aria-hidden="true" className="rtl:-scale-x-100" />
            </button>
          )}
        </div>
      </form>
      <div ref={endRef} />
    </div>
  );
}
