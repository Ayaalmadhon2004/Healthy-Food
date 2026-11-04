"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Info, RotateCcw } from "lucide-react";
import AnswerBody from "./AnswerBody";
import SourceList from "./SourceList";
import type { AssistantDict, ChatMessage } from "./types";
import type { Lang } from "@/lib/types";

interface Props {
  message: ChatMessage;
  t: AssistantDict;
  lang: Lang;
  canRetry: boolean;
  onRetry: () => void;
}

const SECONDS_PER_MINUTE = 60;

function formatWait(lang: Lang, seconds: number): string {
  const unit = seconds >= SECONDS_PER_MINUTE ? "minute" : "second";
  const value = unit === "minute" ? Math.ceil(seconds / SECONDS_PER_MINUTE) : Math.max(1, Math.ceil(seconds));
  try {
    return new Intl.NumberFormat(`${lang}-u-nu-latn`, { style: "unit", unit, unitDisplay: "long" }).format(value);
  } catch {
    return `${value} ${unit === "minute" ? "min" : "s"}`;
  }
}

function ErrorNotice({ message, t, lang, onRetry }: { message: ChatMessage; t: AssistantDict; lang: Lang; onRetry: () => void }) {
  const error = message.error;
  const [left, setLeft] = useState(error?.code === "rate_limited" ? (error.retryAfter ?? 0) : 0);

  useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  if (!error) return null;
  const text =
    error.code === "rate_limited"
      ? t.errors.rate_limited.replace("{time}", formatWait(lang, left > 0 ? left : (error.retryAfter ?? 1)))
      : t.errors[error.code];
  const waiting = error.code === "rate_limited" && left > 0;

  return (
    <div role="alert" className="mt-3 rounded-md border border-brick-300 bg-brick-50 p-3 text-sm text-brick-800">
      <p>{text}</p>
      {error.code !== "invalid_request" && (
        <button type="button" onClick={onRetry} disabled={waiting} className="btn btn-quiet mt-2 text-sm">
          <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" className="rtl:-scale-x-100" />
          {t.retry}
        </button>
      )}
    </div>
  );
}

export default function MessageBubble({ message, t, lang, canRetry, onRetry }: Props) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-xl rounded-ee-sm bg-olive-800 text-white px-4 py-3 whitespace-pre-wrap break-words leading-relaxed">
          <span className="sr-only">{t.you}: </span>
          {message.content}
        </div>
      </div>
    );
  }

  const mode = message.mode ?? "answer";
  const streaming = message.status === "streaming";
  const anchor = `src-${message.id}`;
  const emergency = mode === "emergency";
  const muted = mode === "no_context" || mode === "out_of_scope";
  const tone = emergency
    ? "border-clay-500 border-s-4 bg-clay-50"
    : muted
      ? "border-line-strong bg-paper-deep"
      : "border-line bg-white";
  const Icon = emergency ? AlertTriangle : Info;

  return (
    <div className="flex">
      <article
        role={emergency ? "alert" : undefined}
        aria-busy={streaming}
        className={`max-w-full w-full sm:max-w-[92%] rounded-xl rounded-es-sm border px-4 py-3.5 text-ink ${tone}`}
      >
        <span className="sr-only">{t.assistant}: </span>
        {(emergency || muted) && (
          <p className={`flex items-center gap-2 mb-2 text-sm font-semibold ${emergency ? "text-clay-700" : "text-ink-soft"}`}>
            <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            {t.modes[mode as "emergency" | "no_context" | "out_of_scope"]}
          </p>
        )}

        {message.content ? (
          <AnswerBody
            text={message.content}
            anchor={anchor}
            citationCount={message.citations.length}
            jumpLabel={(n) => t.jump_to_source.replace("{n}", String(n))}
          />
        ) : (
          streaming && (
            <p className="flex items-center gap-2 text-ink-mute text-sm">
              <span className="flex gap-1" aria-hidden="true">
                <span className="w-1.5 h-1.5 rounded-full bg-olive-600 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-olive-600 animate-pulse [animation-delay:200ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-olive-600 animate-pulse [animation-delay:400ms]" />
              </span>
              {t.thinking}
            </p>
          )
        )}

        {message.status === "stopped" && <p className="mt-2 text-sm text-ink-mute">{t.stopped}</p>}
        {message.status === "error" && <ErrorNotice message={message} t={t} lang={lang} onRetry={canRetry ? onRetry : () => undefined} />}
        {message.status !== "error" && <SourceList citations={message.citations} anchor={anchor} t={t} />}
      </article>
    </div>
  );
}
